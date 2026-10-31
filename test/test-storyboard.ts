import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  extractVideoFrames,
  detectMotionDifference,
  buildTemporalStoryboard,
} from "../src/agent/video-storyboard.js";

async function runTests() {
  console.log("🧪 --- RUNNING TEMPORAL STORYBOARD & MOTION TESTS ---");
  const testDir = "/tmp/musedeck_test_storyboard";
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // 1. Generate 8 sequential frames with moving graphic
  console.log("⚡ Creating 8 synthetic animation frames...");
  const framePaths: string[] = [];
  const w = 320;
  const h = 200;

  for (let i = 1; i <= 8; i++) {
    const posX = 20 + (i - 1) * 35;
    const posY = 50 + Math.sin(i) * 20;

    const svgMovingDot = Buffer.from(`
      <svg width="${w}" height="${h}">
        <rect width="${w}" height="${h}" fill="#0f172a" />
        <circle cx="${posX}" cy="${posY}" r="24" fill="#38bdf8" />
        <text x="20" y="180" font-family="sans-serif" font-size="14" fill="#94a3b8">Test Frame ${i}</text>
      </svg>
    `);

    const fp = path.join(testDir, `frame_${i}.png`);
    await sharp(svgMovingDot).png().toFile(fp);
    framePaths.push(fp);
  }

  console.log("✅ Created 8 frames.");

  // 2. Test Motion Difference Detection
  console.log("⚡ Testing detectMotionDifference on dynamic frames...");
  const dynamicMotion = await detectMotionDifference(framePaths);
  console.log(`📊 Dynamic motion percent: ${dynamicMotion.motionPercent}% (isStatic: ${dynamicMotion.isStatic})`);
  if (dynamicMotion.isStatic || dynamicMotion.motionPercent < 1.5) {
    throw new Error(`Expected dynamic motion but got isStatic=${dynamicMotion.isStatic}, percent=${dynamicMotion.motionPercent}`);
  }
  console.log("✅ Dynamic motion correctly detected!");

  // Test static motion detection
  console.log("⚡ Testing detectMotionDifference on identical static frames...");
  const staticMotion = await detectMotionDifference([framePaths[0], framePaths[0]]);
  console.log(`📊 Static motion percent: ${staticMotion.motionPercent}% (isStatic: ${staticMotion.isStatic})`);
  if (!staticMotion.isStatic) {
    throw new Error("Expected static detection for identical frames");
  }
  console.log("✅ Static frames correctly flagged!");

  // 3. Test buildTemporalStoryboard (Filmstrip + Manifest)
  console.log("⚡ Testing buildTemporalStoryboard contact sheet generation...");
  const montagePath = path.join(testDir, "test_montage.png");
  const manifestPath = path.join(testDir, "test_manifest.json");

  const { manifest } = await buildTemporalStoryboard({
    framePaths,
    durationSeconds: 5.0,
    montagePath,
    manifestPath,
    cols: 4,
    rows: 2,
    frameWidth: 320,
    frameHeight: 200,
    motionPercent: dynamicMotion.motionPercent,
  });

  if (!fs.existsSync(montagePath)) {
    throw new Error("Montage file was not created on disk!");
  }
  const metaMontage = await sharp(montagePath).metadata();
  console.log(`🖼️ Montage created: ${metaMontage.width}x${metaMontage.height}px, size=${fs.statSync(montagePath).size} bytes`);
  if (metaMontage.width !== 320 * 4 || metaMontage.height !== 200 * 2) {
    throw new Error(`Unexpected montage size: ${metaMontage.width}x${metaMontage.height}`);
  }

  if (!fs.existsSync(manifestPath)) {
    throw new Error("Manifest file was not created on disk!");
  }
  const readManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  console.log(`📋 Manifest verified: ${readManifest.frameCount} frames, duration=${readManifest.durationSeconds}s, fps=${readManifest.fps}`);
  if (readManifest.frames.length !== 8) {
    throw new Error(`Expected 8 frame metadata entries, got ${readManifest.frames.length}`);
  }
  if (readManifest.frames[0].label !== "#1  0.00s") {
    throw new Error(`Unexpected first frame label: ${readManifest.frames[0].label}`);
  }
  if (readManifest.frames[7].label !== "#8  5.00s") {
    throw new Error(`Unexpected last frame label: ${readManifest.frames[7].label}`);
  }
  console.log("✅ Contact sheet filmstrip and manifest verified successfully!");

  // 4. Test FFmpeg extraction with real video fixture if available
  const sampleVideo = "/tmp/reanimate/site/public/demo.mp4";
  if (fs.existsSync(sampleVideo)) {
    console.log(`⚡ Testing extractVideoFrames with real video fixture (${sampleVideo})...`);
    const extracted = await extractVideoFrames(sampleVideo, path.join(testDir, "video_extract"), 8, 1.6);
    console.log(`🎬 Extracted ${extracted.length} keyframes from sample video.`);
    if (extracted.length !== 8) {
      throw new Error(`Expected 8 extracted frames from video, got ${extracted.length}`);
    }
    console.log("✅ FFmpeg frame extraction verified!");
  }

  // Cleanup test directory
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log("\n🎉 ALL TEMPORAL STORYBOARD & MOTION TESTS PASSED!\n");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
