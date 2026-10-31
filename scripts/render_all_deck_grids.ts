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
    SvgKeyRenderer.renderApiStatusKey("$149.97"),

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
    SvgKeyRenderer.renderTelemetryCard("$149.97", "REMAINING", "#22c55e", "#4ade80", "CREDITS"),
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

  console.log("All deck grids rendered successfully!");
}

main().catch(console.error);
