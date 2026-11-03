import { SvgKeyRenderer } from "../src/plugin/src/ui/svg-renderer.ts";
import sharp from "sharp";
import fs from "node:fs";

fs.mkdirSync("./assets", { recursive: true });

const parse = (uri: string) => Buffer.from(uri.split(",")[1], "base64");

async function renderGrid(keys: (string | null)[], outputPath: string) {
  const cellW = 144;
  const cellH = 144;
  const gap = 18;
  const pad = 24;
  const totalW = 5 * cellW + 4 * gap + pad * 2;
  const totalH = 3 * cellH + 2 * gap + pad * 2;

  const composites: sharp.OverlayOptions[] = [];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 5; c++) {
      const idx = r * 5 + c;
      const uri = keys[idx];
      const left = pad + c * (cellW + gap);
      const top = pad + r * (cellH + gap);

      if (uri) {
        const svgBuf = parse(uri);
        const pngBuf = await sharp(svgBuf).resize(cellW, cellH).png().toBuffer();
        composites.push({ input: pngBuf, left, top });
      } else {
        const emptySvg = parse(SvgKeyRenderer.renderEmptyTile());
        const pngBuf = await sharp(emptySvg).resize(cellW, cellH).png().toBuffer();
        composites.push({ input: pngBuf, left, top });
      }
    }
  }

  await sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: "#0c0e14"
    }
  })
    .composite(composites)
    .png()
    .toFile(outputPath);

  console.log(`Rendered grid: ${outputPath} (${totalW}x${totalH})`);
}

async function main() {
  // 1. PAGE 1: Master Deck Console
  const page1Keys = [
    SvgKeyRenderer.renderStatusKey({ state: "IDLE" as any, step: "Ready", diffLines: "+0/-0", model: "muse-spark-1.3", memoryMb: 128, activeTask: "Standby" }),
    SvgKeyRenderer.renderVoiceKey(false),
    SvgKeyRenderer.renderSnippetsKey(),
    SvgKeyRenderer.renderStructPromptKey(),
    SvgKeyRenderer.renderSessionsPageKey(3, false),

    SvgKeyRenderer.renderSamSnipKey("idle"),
    SvgKeyRenderer.renderImgToCodeKey("idle"),
    SvgKeyRenderer.renderVidToCodeKey("idle"),
    SvgKeyRenderer.renderMascotSettingsKey("idle"),
    SvgKeyRenderer.renderApiStatusKey("$148.01"),

    SvgKeyRenderer.renderRecordFlowKey("idle"),
    SvgKeyRenderer.renderMuseMemoryKey(),
    SvgKeyRenderer.renderMuseOpsKey(),
    SvgKeyRenderer.renderGitCommandsKey(),
    SvgKeyRenderer.renderHaltKey(false)
  ];
  await renderGrid(page1Keys, "./assets/deck_page1.png");

  // 2. REVIEW SUBMENU (HITL Gate)
  const reviewKeys = [
    SvgKeyRenderer.renderUpBackKey(),
    SvgKeyRenderer.renderHitlOption1Key(),
    SvgKeyRenderer.renderHitlOption2Key(),
    SvgKeyRenderer.renderHitlOption3Key(),
    SvgKeyRenderer.renderHitlOption4Key(),
    null, null, null, null, null,
    null, null, null, null, null
  ];
  await renderGrid(reviewKeys, "./assets/deck_review_submenu.png");

  // 3. SESSIONS DRAWER SUBMENU
  const sessionsKeys = [
    SvgKeyRenderer.renderUpBackKey(),
    SvgKeyRenderer.renderNewSessionKey(),
    SvgKeyRenderer.renderHistoricalSessionCard(1, "MUSEDECK", "TODAY", "21:49", "today"),
    SvgKeyRenderer.renderHistoricalSessionCard(2, "MUSEDECK", "TODAY", "21:49", "today"),
    SvgKeyRenderer.renderHistoricalSessionCard(3, "MUSEDECK", "TODAY", "21:49", "today"),

    SvgKeyRenderer.renderHistoricalSessionCard(4, "MUSEDECK", "TODAY", "16:02", "today"),
    SvgKeyRenderer.renderHistoricalSessionCard(5, "MUSEDECK", "YESTRDY", "15:44", "yesterday"),
    SvgKeyRenderer.renderHistoricalSessionCard(6, "MUSEDECK", "YESTRDY", "15:44", "yesterday"),
    SvgKeyRenderer.renderHistoricalSessionCard(7, "MUSEDECK", "OCT 29", "20:05", "older"),
    SvgKeyRenderer.renderHistoricalSessionCard(8, "MUSEDECK", "OCT 29", "20:05", "older"),

    SvgKeyRenderer.renderHistoricalSessionCard(9, "MUSEDECK", "OCT 29", "20:05", "older"),
    SvgKeyRenderer.renderHistoricalSessionCard(10, "GLOBAL", "OCT 29", "19:18", "older"),
    SvgKeyRenderer.renderHistoricalSessionCard(11, "MUSEDECK", "OCT 28", "21:27", "older"),
    SvgKeyRenderer.renderHistoricalSessionCard(12, "GRID", "OCT 28", "21:03", "older"),
    SvgKeyRenderer.renderHistoricalSessionCard(13, "MUSEDECK", "OCT 28", "20:15", "older")
  ];
  await renderGrid(sessionsKeys, "./assets/deck_sessions_submenu.png");

  // 4. CREDITS & TELEMETRY SUBMENU
  const telemetryKeys = [
    SvgKeyRenderer.renderUpBackKey(),
    SvgKeyRenderer.renderTelemetryCard("$148.01", "REMAINING", "#22c55e", "#4ade80", "CREDITS"),
    SvgKeyRenderer.renderTelemetryCard("$0.00", "TOTAL", "#38bdf8", "#7dd3fc", "SPEND"),
    SvgKeyRenderer.renderTelemetryCard("21", "CALLS", "#a855f7", "#c084fc", "REQUESTS"),
    SvgKeyRenderer.renderTelemetryCard("CONSOLE", "OPEN WEB", "#06b6d4", "#22d3ee", "BILLING ↗"),

    SvgKeyRenderer.renderTelemetryCard("433.9k", "TOKENS", "#38bdf8", "#7dd3fc", "INPUT"),
    SvgKeyRenderer.renderTelemetryCard("19.4k", "TOKENS", "#a855f7", "#c084fc", "OUTPUT"),
    SvgKeyRenderer.renderTelemetryCard("57.7%", "HIT RATE", "#22c55e", "#4ade80", "CACHE"),
    SvgKeyRenderer.renderTelemetryCard("38ms", "AVERAGE", "#f59e0b", "#fbbf24", "LATENCY"),
    SvgKeyRenderer.renderTelemetryCard("SPARK 1.3", "ACTIVE", "#a855f7", "#c084fc", "MODEL"),

    null, null, null, null, null
  ];
  await renderGrid(telemetryKeys, "./assets/deck_telemetry_submenu.png");

  // 5. SNIPPETS SUBMENU
  const snippetsKeys = [
    SvgKeyRenderer.renderUpBackKey(),
    SvgKeyRenderer.renderSnippetCard("BE", "HONEST", "", "#f59e0b", "#fde68a"),
    SvgKeyRenderer.renderSnippetCard("DON'T", "CODE", "", "#ef4444", "#fca5a5"),
    null, null,

    SvgKeyRenderer.renderSnippetCard("SHOW", "OPTIONS", "", "#38bdf8", "#bae6fd"),
    SvgKeyRenderer.renderSnippetCard("EXPLAIN", "WHY", "", "#818cf8", "#c7d2fe"),
    SvgKeyRenderer.renderSnippetCard("KEEP", "SHORT", "", "#10b981", "#a7f3d0"),
    null, null,

    SvgKeyRenderer.renderSnippetCard("NO", "TESTS", "", "#ec4899", "#fbcfe8"),
    SvgKeyRenderer.renderSnippetCard("GO!", "", "", "#22c55e", "#4ade80"),
    null, null, null
  ];
  await renderGrid(snippetsKeys, "./assets/deck_snippets_submenu.png");

  // 6. MUSE MEMORY SUBMENU
  const memoryKeys = [
    SvgKeyRenderer.renderUpBackKey(),
    SvgKeyRenderer.renderMemoryRulesKey(),
    SvgKeyRenderer.renderMemorySpecKey(),
    SvgKeyRenderer.renderMemoryPlanKey(),
    SvgKeyRenderer.renderMemoryTodoKey(),

    SvgKeyRenderer.renderMemoryArchKey(),
    SvgKeyRenderer.renderMemoryProgressKey(),
    SvgKeyRenderer.renderMemoryReadmeKey(),
    SvgKeyRenderer.renderMemoryDecisionsKey(),
    SvgKeyRenderer.renderMemoryApiKey(),

    SvgKeyRenderer.renderMemoryTestingKey(),
    SvgKeyRenderer.renderMemorySyncKey(),
    SvgKeyRenderer.renderMemoryUpdateKey(),
    null, null
  ];
  await renderGrid(memoryKeys, "./assets/deck_memory_submenu.png");

  // 7. MUSE OPS SUBMENU
  const opsKeys = [
    SvgKeyRenderer.renderUpBackKey(),
    SvgKeyRenderer.renderOpsCard("FIX", "ERROR", "#ef4444", "#fca5a5"),
    SvgKeyRenderer.renderOpsCard("REFACTOR", "CODE", "#f59e0b", "#fde68a"),
    SvgKeyRenderer.renderOpsCard("OPTIMIZE", "PERF", "#06b6d4", "#67e8f9"),
    null,

    SvgKeyRenderer.renderOpsCard("EXPLAIN", "CODE", "#a855f7", "#d8b4fe"),
    SvgKeyRenderer.renderOpsCard("FIND", "SYMBOL", "#3b82f6", "#93c5fd"),
    SvgKeyRenderer.renderOpsCard("CODE", "REVIEW", "#ec4899", "#f472b6"),
    null, null,

    SvgKeyRenderer.renderOpsCard("RUN", "TESTS", "#22c55e", "#4ade80"),
    SvgKeyRenderer.renderOpsCard("RUN", "BUILD", "#84cc16", "#bef264"),
    SvgKeyRenderer.renderOpsCard("TYPE", "CHECK", "#38bdf8", "#7dd3fc"),
    null, null
  ];
  await renderGrid(opsKeys, "./assets/deck_ops_submenu.png");

  // 8. GIT COMMANDS SUBMENU
  const gitKeys = [
    SvgKeyRenderer.renderUpBackKey(),
    SvgKeyRenderer.renderGitStatusSubKey(),
    SvgKeyRenderer.renderGitCommitKey("idle"),
    SvgKeyRenderer.renderGitPullKey(),
    SvgKeyRenderer.renderGitPushKey(),

    SvgKeyRenderer.renderGitDiffKey(),
    SvgKeyRenderer.renderGitStashSaveKey(),
    SvgKeyRenderer.renderGitStashPopKey(),
    SvgKeyRenderer.renderGitDiscardKey(false),
    SvgKeyRenderer.renderGitMainKey(),

    SvgKeyRenderer.renderGitPrKey(),
    SvgKeyRenderer.renderGitRepoKey(),
    SvgKeyRenderer.renderGitLogKey(),
    null, null
  ];
  await renderGrid(gitKeys, "./assets/deck_git_submenu.png");

  // 9. IMG TO CODE SUBMENU
  const imgToCodeKeys = [
    SvgKeyRenderer.renderUpBackKey(),
    SvgKeyRenderer.renderImgToCodeOptionKey("AUTO", "DETECT", "#10b981", "#a7f3d0", false),
    SvgKeyRenderer.renderImgToCodeOptionKey("REACT", "TAILWIND", "#06b6d4", "#67e8f9", false),
    SvgKeyRenderer.renderImgToCodeOptionKey("HTML", "+ CSS", "#f59e0b", "#fde047", false),
    SvgKeyRenderer.renderImgToCodeOptionKey("VUE", "3 SFC", "#22c55e", "#86efac", false),

    SvgKeyRenderer.renderImgToCodeOptionKey("SWIFTUI", "NATIVE", "#f97316", "#fdba74", false),
    SvgKeyRenderer.renderImgToCodeOptionKey("COMPOSE", "KOTLIN", "#818cf8", "#c7d2fe", false),
    SvgKeyRenderer.renderImgToCodeOptionKey("FLUTTER", "DART", "#38bdf8", "#7dd3fc", false),
    SvgKeyRenderer.renderImgToCodeOptionKey("PYTHON", "UI", "#eab308", "#fef08a", false),
    SvgKeyRenderer.renderOpenCodeKey(true),

    SvgKeyRenderer.renderBottomBannerTile(0, "success", 0),
    SvgKeyRenderer.renderBottomBannerTile(1, "success", 0),
    SvgKeyRenderer.renderBottomBannerTile(2, "success", 0),
    SvgKeyRenderer.renderBottomBannerTile(3, "success", 0),
    SvgKeyRenderer.renderLivePreviewKey(true)
  ];
  await renderGrid(imgToCodeKeys, "./assets/deck_img_to_code_submenu.png");

  // 10. VID TO CODE SUBMENU
  const vidToCodeKeys = [
    SvgKeyRenderer.renderUpBackKey(),
    SvgKeyRenderer.renderVidToCodeOptionKey("FRAMER", "REACT MOTION", "#ec4899", "#f472b6", false),
    SvgKeyRenderer.renderVidToCodeOptionKey("TAILWIND", "KEYFRAMES", "#06b6d4", "#67e8f9", false),
    SvgKeyRenderer.renderVidToCodeOptionKey("SWIFTUI", "SPRING ANIM", "#f97316", "#fdba74", false),
    SvgKeyRenderer.renderVidToCodeOptionKey("COMPOSE", "ANDROID ANIM", "#818cf8", "#c7d2fe", false),

    SvgKeyRenderer.renderVidToCodeOptionKey("FLUTTER", "ANIMATED", "#38bdf8", "#7dd3fc", false),
    SvgKeyRenderer.renderVidToCodeOptionKey("VUE", "TRANSITION", "#22c55e", "#86efac", false),
    SvgKeyRenderer.renderVidToCodeOptionKey("GSAP", "WEB TIMELINE", "#a855f7", "#d8b4fe", false),
    SvgKeyRenderer.renderVidToCodeOptionKey("AUTO", "SMART FLOW", "#10b981", "#a7f3d0", false),
    SvgKeyRenderer.renderOpenCodeKey(true),

    SvgKeyRenderer.renderBottomBannerTile(0, "recording", 1, 5),
    SvgKeyRenderer.renderBottomBannerTile(1, "recording", 1, 5),
    SvgKeyRenderer.renderBottomBannerTile(2, "recording", 1, 5),
    SvgKeyRenderer.renderBottomBannerTile(3, "recording", 1, 5),
    SvgKeyRenderer.renderLivePreviewKey(true)
  ];
  await renderGrid(vidToCodeKeys, "./assets/deck_vid_to_code_submenu.png");

  console.log("All deck grids rendered successfully!");
}

main().catch(console.error);
