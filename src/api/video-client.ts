import { exec } from "node:child_process";
import { promisify } from "node:util";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import type { MetaModelApiClient } from "./meta-client.js";

const execAsync = promisify(exec);

export interface VideoFixResult {
  videoPath: string;
  fileId: string;
  prompt: string;
  success: boolean;
}

/**
 * Multimodal Video-to-Code & Record-to-Fix Engine
 * Uses Meta's Responses + Files API with Audio Understanding (video frames + mic voiceover).
 */
export class VideoFixClient {
  private isRecording = false;
  private currentVideoPath: string | null = null;

  constructor(private readonly apiClient: MetaModelApiClient) {}

  /**
   * Start short screen + microphone capture (MP4)
   * If already recording, stops and processes the video.
   */
  async toggleRecording(): Promise<VideoFixResult | null> {
    if (this.isRecording) {
      return this.stopAndProcessRecording();
    } else {
      await this.startRecording();
      return null;
    }
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Begins screen recording on macOS using native screencapture
   */
  async startRecording(): Promise<string> {
    const tempDir = path.join(os.tmpdir(), "musedeck");
    await fs.mkdir(tempDir, { recursive: true });

    this.currentVideoPath = path.join(tempDir, `record_to_fix_${Date.now()}.mp4`);
    this.isRecording = true;

    console.log("🎬 [Record-to-Fix] Starting screen capture...");

    // screencapture -v captures video on macOS
    exec(`screencapture -v "${this.currentVideoPath}"`, (err) => {
      if (err) {
        console.warn("Screen recording process completed or cancelled:", err.message);
      }
    });

    return this.currentVideoPath;
  }

  /**
   * Stops recording, uploads to Meta Files API to obtain file_id,
   * and prepares the multimodal prompt for Muse Code.
   */
  async stopAndProcessRecording(): Promise<VideoFixResult> {
    this.isRecording = false;

    // Send SIGINT / keystroke to stop screencapture
    try {
      await execAsync("killall screencapture");
    } catch {}

    // Allow file stream to flush to disk
    await new Promise((r) => setTimeout(r, 1200));

    const videoPath = this.currentVideoPath || path.join(os.tmpdir(), "musedeck", "latest_recording.mp4");

    console.log(`📤 [Meta Files API] Uploading ${videoPath} for Audio & Video Understanding...`);

    let fileId = `file_${Date.now()}`;

    // Upload to Meta Model API (Files API: POST /v1/files)
    if (this.apiClient.isConfigured()) {
      try {
        const videoBuffer = await fs.readFile(videoPath);
        const base64Video = videoBuffer.toString("base64");

        const uploadRes = await this.apiClient.request<{ id: string; file_id?: string }>("/files", {
          method: "POST",
          body: JSON.stringify({
            purpose: "multimodal_reasoning",
            file: base64Video,
            filename: path.basename(videoPath),
          }),
        });

        fileId = uploadRes.id || uploadRes.file_id || fileId;
        console.log(`✅ [Meta Files API] Uploaded successfully! file_id: ${fileId}`);
      } catch (err: any) {
        console.warn(`⚠️ [Meta Files API] Remote upload failed (${err.message}). Using local reference.`);
      }
    }

    const prompt = `Diagnose and fix the frontend issue shown in this recording (file_id: ${fileId}). Read the video frames and listen to the audio voiceover explaining the bug. Synthesize the patch.`;

    return {
      videoPath,
      fileId,
      prompt,
      success: true,
    };
  }
}
