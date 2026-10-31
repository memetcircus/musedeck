import fs from "fs";
import path from "path";
import { exec } from "child_process";
import sharp from "sharp";

export interface StoryboardFrameMeta {
  index: number;
  timeSeconds: number;
  label: string;
  path: string;
}

export interface StoryboardManifest {
  durationSeconds: number;
  frameCount: number;
  fps: number;
  motionPercent: number;
  isStatic: boolean;
  montagePath: string;
  manifestPath: string;
  generatedAt: string;
  frames: StoryboardFrameMeta[];
}

export interface StoryboardOptions {
  framePaths: string[];
  durationSeconds?: number;
  montagePath?: string;
  manifestPath?: string;
  cols?: number;
  rows?: number;
  frameWidth?: number;
  frameHeight?: number;
  motionPercent?: number;
}

/**
 * Extracts sequential frames from a recorded video using FFmpeg.
 */
export async function extractVideoFrames(
  videoPath: string,
  outputDir = "/tmp/musedeck",
  frameCount = 8,
  fps = 1.6
): Promise<string[]> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const framePaths: string[] = [];
  for (let i = 1; i <= frameCount; i++) {
    framePaths.push(path.join(outputDir, `flow_f${i}.png`));
  }

  // Clear previous extraction artefacts
  for (const fp of framePaths) {
    if (fs.existsSync(fp)) {
      try {
        fs.unlinkSync(fp);
      } catch {
        // Ignore unlink error
      }
    }
  }

  const ffmpegCmd = `/opt/homebrew/bin/ffmpeg -y -i "${videoPath}" -vf "fps=${fps}" -vframes ${frameCount} "${outputDir}/flow_f%01d.png" || /usr/bin/ffmpeg -y -i "${videoPath}" -vf "fps=${fps}" -vframes ${frameCount} "${outputDir}/flow_f%01d.png"`;

  await new Promise<void>((resolve) => {
    exec(ffmpegCmd, (error) => {
      if (error) {
        console.warn(`[VideoStoryboard] FFmpeg extraction notice: ${error.message}`);
      }
      resolve();
    });
  });

  return framePaths.filter((fp) => fs.existsSync(fp));
}

/**
 * Evaluates perceptual pixel delta between the first and last keyframe to detect static screens.
 */
export async function detectMotionDifference(
  framePaths: string[],
  staticThresholdPercent = 1.5
): Promise<{ motionPercent: number; isStatic: boolean }> {
  if (framePaths.length < 2) {
    return { motionPercent: 0, isStatic: true };
  }

  try {
    const firstFrame = framePaths[0];
    const lastFrame = framePaths[framePaths.length - 1];

    if (fs.existsSync(firstFrame) && fs.existsSync(lastFrame)) {
      const b1 = await sharp(firstFrame).resize(64, 64, { fit: "fill" }).grayscale().raw().toBuffer();
      const bLast = await sharp(lastFrame).resize(64, 64, { fit: "fill" }).grayscale().raw().toBuffer();

      let diffSum = 0;
      for (let i = 0; i < b1.length; i++) {
        diffSum += Math.abs(b1[i] - bLast[i]);
      }

      const motionPercent = (diffSum / (b1.length * 255)) * 100;
      return {
        motionPercent: Number(motionPercent.toFixed(2)),
        isStatic: motionPercent < staticThresholdPercent,
      };
    }
  } catch (err: any) {
    console.warn("[VideoStoryboard] Motion detection fallback:", err.message);
  }

  return { motionPercent: 0, isStatic: false };
}

/**
 * Builds a temporal storyboard contact sheet (filmstrip) with timestamp badges on each frame,
 * plus a structured JSON manifest for multimodal AI synthesis.
 */
export async function buildTemporalStoryboard(
  options: StoryboardOptions
): Promise<{ montagePath: string; manifestPath: string; manifest: StoryboardManifest }> {
  const {
    framePaths,
    durationSeconds = 5.0,
    montagePath = "/tmp/musedeck/flow_montage.png",
    manifestPath = "/tmp/musedeck/flow_manifest.json",
    cols = 4,
    rows = 2,
    frameWidth = 320,
    frameHeight = 200,
    motionPercent = 0,
  } = options;

  const count = framePaths.length;
  const frameMetaList: StoryboardFrameMeta[] = [];

  // Generate badge-overlaid frames
  const framedBuffers = await Promise.all(
    framePaths.map(async (fp, idx) => {
      const timeSec = count > 1 ? Number(((idx * durationSeconds) / (count - 1)).toFixed(2)) : 0;
      const label = `#${idx + 1}  ${timeSec.toFixed(2)}s`;

      frameMetaList.push({
        index: idx + 1,
        timeSeconds: timeSec,
        label,
        path: fp,
      });

      let baseBuffer: Buffer;
      if (fs.existsSync(fp)) {
        baseBuffer = await sharp(fp)
          .resize(frameWidth, frameHeight, { fit: "cover", position: "center" })
          .toBuffer();
      } else {
        baseBuffer = await sharp({
          create: {
            width: frameWidth,
            height: frameHeight,
            channels: 4,
            background: { r: 15, g: 23, b: 42, alpha: 1 },
          },
        })
          .png()
          .toBuffer();
      }

      // Render crisp SVG timestamp badge
      const badgeWidth = 84;
      const badgeHeight = 22;
      const badgeSvg = Buffer.from(`
        <svg width="${frameWidth}" height="${frameHeight}">
          <rect x="8" y="8" width="${badgeWidth}" height="${badgeHeight}" rx="4" fill="rgba(10, 15, 28, 0.88)" stroke="rgba(56, 189, 248, 0.6)" stroke-width="1"/>
          <text x="14" y="23" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro', sans-serif" font-size="11" font-weight="700" fill="#38bdf8">${label}</text>
        </svg>
      `);

      return sharp(baseBuffer)
        .composite([{ input: badgeSvg, left: 0, top: 0 }])
        .png()
        .toBuffer();
    })
  );

  // Layout onto montage canvas
  const compositeList: Array<{ input: Buffer; left: number; top: number }> = [];
  for (let idx = 0; idx < framedBuffers.length; idx++) {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    compositeList.push({
      input: framedBuffers[idx],
      left: col * frameWidth,
      top: row * frameHeight,
    });
  }

  // Composite full filmstrip grid
  const totalWidth = frameWidth * cols;
  const totalHeight = frameHeight * rows;

  await sharp({
    create: {
      width: totalWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 10, g: 15, b: 28, alpha: 1 },
    },
  })
    .composite(compositeList)
    .png()
    .toFile(montagePath);

  // Write structured temporal manifest
  const manifest: StoryboardManifest = {
    durationSeconds,
    frameCount: count,
    fps: count > 0 ? Number((count / durationSeconds).toFixed(2)) : 1.6,
    motionPercent,
    isStatic: motionPercent < 1.5,
    montagePath,
    manifestPath,
    generatedAt: new Date().toISOString(),
    frames: frameMetaList,
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  return { montagePath, manifestPath, manifest };
}

