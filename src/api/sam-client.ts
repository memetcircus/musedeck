import { exec } from "node:child_process";
import { promisify } from "node:util";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import type { MetaModelApiClient } from "./meta-client.js";

const execAsync = promisify(exec);

export interface SamSnipResult {
  rawImagePath: string;
  segmentedImagePath: string;
  thumbnailBase64: string; // Ready for Stream Deck setImage
  dimensions: { width: number; height: number };
  copiedToClipboard: boolean;
}

export class SamClient {
  private modelName: string;

  constructor(
    private readonly apiClient: MetaModelApiClient,
    modelName?: string
  ) {
    this.modelName = modelName || process.env.SAM_MODEL_NAME || "sam-3.1";
  }

  /**
   * Captures screen region, dispatches to SAM 3.1 for foreground segmentation,
   * copies isolated PNG to macOS clipboard, and returns Stream Deck thumbnail.
   */
  async snipScreenRegion(): Promise<SamSnipResult> {
    const tempDir = path.join(os.tmpdir(), "musedeck");
    await fs.mkdir(tempDir, { recursive: true });

    const rawCapturePath = path.join(tempDir, `capture_${Date.now()}.png`);
    const segmentedPath = path.join(tempDir, `sam_segmented_${Date.now()}.png`);

    console.log("📸 [SAM 3.1] Triggering interactive screen region capture...");

    // 1. Interactive screen region capture on macOS
    try {
      // -i interactive capture, -s cursor selection, -r do not capture cursor
      await execAsync(`screencapture -i -s "${rawCapturePath}"`);
    } catch (err: any) {
      console.warn("User cancelled screencapture or screencapture exited with error:", err.message);
      throw new Error("Screen capture cancelled or unavailable");
    }

    // Verify file exists
    try {
      await fs.access(rawCapturePath);
    } catch {
      throw new Error("No image was captured (user likely pressed Escape).");
    }

    // Inspect image dimensions via macOS sips
    let width = 0;
    let height = 0;
    try {
      const { stdout } = await execAsync(`sips -g pixelWidth -g pixelHeight "${rawCapturePath}"`);
      const wMatch = stdout.match(/pixelWidth:\s*(\d+)/);
      const hMatch = stdout.match(/pixelHeight:\s*(\d+)/);
      if (wMatch) width = parseInt(wMatch[1], 10);
      if (hMatch) height = parseInt(hMatch[1], 10);
    } catch {}

    if (width > 0 && height > 0 && (width < 35 || height < 35)) {
      throw new Error("Selection is too small or empty to contain a UI component.");
    }

    const rawBuffer = await fs.readFile(rawCapturePath);
    const rawBase64 = rawBuffer.toString("base64");

    // 2. Dispatch to SAM 3.1 (or fallback processor if API key not set or mock)
    let segmentedBuffer: Buffer;
    if (this.apiClient.isConfigured()) {
      try {
        console.log(`🧠 [SAM 3.1] Dispatching image to Meta Model API (${this.modelName})...`);
        const response = await this.apiClient.request<{
          foreground_png_base64?: string;
          mask_png_base64?: string;
        }>("/models/segmentation", {
          method: "POST",
          body: JSON.stringify({
            model: this.modelName,
            image: rawBase64,
            mode: "foreground_ui",
            return_format: "png",
          }),
        });

        if (response.foreground_png_base64) {
          segmentedBuffer = Buffer.from(response.foreground_png_base64, "base64");
          await fs.writeFile(segmentedPath, segmentedBuffer);
        } else {
          // If response does not have base64 foreground, use captured buffer
          segmentedBuffer = rawBuffer;
          await fs.copyFile(rawCapturePath, segmentedPath);
        }
      } catch (err: any) {
        console.warn(`⚠️ [SAM 3.1 API] Segmentation request failed: ${err.message}. Using raw capture.`);
        segmentedBuffer = rawBuffer;
        await fs.copyFile(rawCapturePath, segmentedPath);
      }
    } else {
      console.log(`ℹ️ [SAM 3.1] Offline / mock mode: using captured region for segmentation.`);
      segmentedBuffer = rawBuffer;
      await fs.copyFile(rawCapturePath, segmentedPath);
    }

    // 3. Ensure stable path /tmp/musedeck/latest_segmented.png exists
    const stableDir = "/tmp/musedeck";
    await fs.mkdir(stableDir, { recursive: true });
    const stablePath = path.join(stableDir, "latest_segmented.png");
    await fs.copyFile(segmentedPath, stablePath);

    // 4. Copy both file path (for Terminal prompt) and PNG binary (for GUI paste) to clipboard
    let copiedToClipboard = false;
    try {
      // Put file path onto clipboard for Terminal / CLI
      await execAsync(`printf "%s " "${stablePath}" | pbcopy`);
      copiedToClipboard = true;
      console.log(`📋 [SAM 3.1] Snippet path copied to macOS clipboard: ${stablePath}`);
    } catch (err: any) {
      console.warn("Could not copy path to clipboard via pbcopy:", err.message);
    }

    try {
      // Also copy PNG binary representation for graphics apps
      const appleScript = `
        set theFile to POSIX file "${stablePath}"
        set the clipboard to (read theFile as «class PNGf»)
      `;
      await execAsync(`osascript -e '${appleScript}'`);
    } catch {
      // Optional enhancement; ignore if failed
    }

    // 5. Generate thumbnail for Stream Deck key rendering
    const thumbnailBase64 = `data:image/png;base64,${segmentedBuffer.toString("base64")}`;

    return {
      rawImagePath: rawCapturePath,
      segmentedImagePath: stablePath,
      thumbnailBase64,
      dimensions: { width: 144, height: 144 },
      copiedToClipboard,
    };
  }
}

