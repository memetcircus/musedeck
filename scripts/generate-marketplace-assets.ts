import * as fs from "node:fs";
import * as path from "node:path";
import sharp from "sharp";
import { SvgKeyRenderer } from "../src/plugin/src/ui/svg-renderer.js";

const rootDir = process.cwd();
const pluginDir = path.join(rootDir, "com.memetcircus.musedeck.sdPlugin");
const imgsDir = path.join(pluginDir, "imgs");
const assetsDir = path.join(rootDir, "assets");
const outDir = path.join(rootDir, "marketplace-assets");

const parseDataUri = (uri: string): Buffer => Buffer.from(uri.split(",")[1], "base64");

function buildPluginIconSvg(): Buffer {
  return fs.readFileSync(path.join(assetsDir, "musedeck_icon.png"));
}

function buildCategoryIconSvg(): Buffer {
  return buildPluginIconSvg();
}

async function generatePluginInternalIcons() {
  const pluginIconSvg = buildPluginIconSvg();
  const categoryIconSvg = buildCategoryIconSvg();

  // Plugin icons (288x288 and 512x512 @2x)
  await sharp(pluginIconSvg).resize(288, 288).png().toFile(path.join(imgsDir, "plugin-icon.png"));
  await sharp(pluginIconSvg).resize(512, 512).png().toFile(path.join(imgsDir, "plugin-icon@2x.png"));

  // Category icons (288x288 and 576x576 @2x matching KiroCan full-color mark)
  await sharp(categoryIconSvg).resize(288, 288).png().toFile(path.join(imgsDir, "category-icon.png"));
  await sharp(categoryIconSvg).resize(576, 576).png().toFile(path.join(imgsDir, "category-icon@2x.png"));

  // Map all 15 official manifest actions + web-console to their crisp SvgKeyRenderer SVGs
  const actionSvgMap: Record<string, string> = {
    "status": SvgKeyRenderer.renderStatusKey({
      state: "IDLE" as any,
      step: "Ready",
      diffLines: "+0/-0",
      model: "muse-spark-1.3",
      memoryMb: 128,
      activeTask: "Standby"
    }),
    "task": SvgKeyRenderer.renderVoiceKey(false),
    "diff": SvgKeyRenderer.renderSnippetsKey(),
    "approve": SvgKeyRenderer.renderStructPromptKey(),
    "reject": SvgKeyRenderer.renderSessionsPageKey(3, false),
    "sam-snip": SvgKeyRenderer.renderSamSnipKey("idle"),
    "spark-code": SvgKeyRenderer.renderImgToCodeKey("idle"),
    "run-muse": SvgKeyRenderer.renderVidToCodeKey("idle"),
    "halt": SvgKeyRenderer.renderMascotSettingsKey("idle"),
    "reset": SvgKeyRenderer.renderApiStatusKey("$148.01"),
    "prompt-task": SvgKeyRenderer.renderRecordFlowKey("idle"),
    "write-tests": SvgKeyRenderer.renderMuseMemoryKey(),
    "fix-bug": SvgKeyRenderer.renderMuseOpsKey(),
    "commit-pr": SvgKeyRenderer.renderGitCommandsKey(),
    "page-next": SvgKeyRenderer.renderHaltKey(false),
    "web-console": SvgKeyRenderer.renderMascotSettingsKey("idle"),
  };

  for (const [actionName, dataUri] of Object.entries(actionSvgMap)) {
    const actionDir = path.join(imgsDir, "actions", actionName);
    fs.mkdirSync(actionDir, { recursive: true });
    const svgBuf = parseDataUri(dataUri);

    // Action list icons: 72x72 & 144x144
    await sharp(svgBuf).resize(72, 72).png().toFile(path.join(actionDir, "icon.png"));
    await sharp(svgBuf).resize(144, 144).png().toFile(path.join(actionDir, "icon@2x.png"));

    // Key state icons: 144x144 & 288x288
    await sharp(svgBuf).resize(144, 144).png().toFile(path.join(actionDir, "key.png"));
    await sharp(svgBuf).resize(288, 288).png().toFile(path.join(actionDir, "key@2x.png"));
  }

  console.log("Generated plugin, category, and 16 action icon sets inside com.memetcircus.musedeck.sdPlugin/imgs/");
}

async function roundCorners(imgBuf: Buffer, w: number, h: number, rx = 24): Promise<Buffer> {
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${rx}" fill="#fff"/></svg>`
  );
  return sharp(imgBuf)
    .resize(w, h, { fit: "cover" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function generateMarketplaceBanners() {
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Store App Icons (288x288 & 512x512)
  const pluginIconSvg = buildPluginIconSvg();
  await sharp(pluginIconSvg).resize(288, 288).png().toFile(path.join(outDir, "app-icon-288x288.png"));
  await sharp(pluginIconSvg).resize(512, 512).png().toFile(path.join(outDir, "app-icon-512x512.png"));

  // 2. Main Store Thumbnail (1920x960)
  {
    const baseSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="960" viewBox="0 0 1920 960">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#050811"/>
          <stop offset="50%" stop-color="#0b1120"/>
          <stop offset="100%" stop-color="#13112c"/>
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="50%" stop-color="#a855f7"/>
          <stop offset="100%" stop-color="#10b981"/>
        </linearGradient>
      </defs>
      <rect width="1920" height="960" fill="url(#bg)"/>
      <!-- Subtle Tech Grid -->
      <line x1="0" y1="160" x2="1920" y2="160" stroke="#1e293b" stroke-width="1" stroke-opacity="0.5"/>
      <line x1="0" y1="800" x2="1920" y2="800" stroke="#1e293b" stroke-width="1" stroke-opacity="0.5"/>
      <line x1="820" y1="0" x2="820" y2="960" stroke="#1e293b" stroke-width="1" stroke-opacity="0.5"/>

      <!-- Top Accent Bar -->
      <rect x="0" y="0" width="1920" height="8" fill="url(#accent)"/>

      <!-- Left Hero Copy -->
      <rect x="80" y="88" width="420" height="44" rx="22" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="108" cy="110" r="7" fill="#10b981"/>
      <text x="302" y="116" fill="#38bdf8" font-size="17" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1.8">ELGATO STREAM DECK PLUGIN</text>

      <text x="80" y="230" fill="#ffffff" font-size="90" font-weight="900" font-family="system-ui, -apple-system, sans-serif" letter-spacing="1">MuseDeck</text>
      <text x="80" y="292" fill="#7dd3fc" font-size="30" font-weight="800" font-family="system-ui, -apple-system, sans-serif">Tactile Mission Control for AI Coding Agents</text>
      <text x="80" y="340" fill="#94a3b8" font-size="21" font-weight="600" font-family="system-ui, -apple-system, sans-serif">Physical HITL Review Gate, Multimodal UI Synthesis &amp; Live Telemetry</text>

      <!-- Feature Pills -->
      <g transform="translate(80, 395)">
        <rect x="0" y="0" width="660" height="72" rx="16" fill="#0f172a" stroke="#10b981" stroke-width="2.5"/>
        <circle cx="38" cy="36" r="14" fill="#064e3b" stroke="#34d399" stroke-width="2.5"/>
        <text x="72" y="33" fill="#ffffff" font-size="22" font-weight="800" font-family="system-ui, -apple-system, sans-serif">Human-in-the-Loop (HITL) Review Gate</text>
        <text x="72" y="57" fill="#6ee7b7" font-size="16" font-weight="600" font-family="system-ui, -apple-system, sans-serif">650ms Breathing Alert  •  Approve, Always Allow, Reject, or Feedback</text>

        <rect x="0" y="92" width="660" height="72" rx="16" fill="#0f172a" stroke="#a855f7" stroke-width="2.5"/>
        <circle cx="38" cy="128" r="14" fill="#581c87" stroke="#c084fc" stroke-width="2.5"/>
        <text x="72" y="125" fill="#ffffff" font-size="22" font-weight="800" font-family="system-ui, -apple-system, sans-serif">SAM 3.1 Snip, Image-to-Code &amp; Video-to-Code</text>
        <text x="72" y="149" fill="#d8b4fe" font-size="16" font-weight="600" font-family="system-ui, -apple-system, sans-serif">Synthesize React, HTML5, SwiftUI, Compose &amp; Flutter with Live Previews</text>

        <rect x="0" y="184" width="660" height="72" rx="16" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5"/>
        <circle cx="38" cy="220" r="14" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2.5"/>
        <text x="72" y="217" fill="#ffffff" font-size="22" font-weight="800" font-family="system-ui, -apple-system, sans-serif">Voice Transcribe, Session Switcher &amp; Git Cockpit</text>
        <text x="72" y="241" fill="#7dd3fc" font-size="16" font-weight="600" font-family="system-ui, -apple-system, sans-serif">Zero-Typing Option+V Voice  •  13-Key Sessions  •  Ops &amp; Memory Drawers</text>

        <rect x="0" y="276" width="660" height="72" rx="16" fill="#0f172a" stroke="#f59e0b" stroke-width="2.5"/>
        <circle cx="38" cy="312" r="14" fill="#78350f" stroke="#fbbf24" stroke-width="2.5"/>
        <text x="72" y="309" fill="#ffffff" font-size="22" font-weight="800" font-family="system-ui, -apple-system, sans-serif">Embedded Bridge Server &amp; 15-Key Profile Included</text>
        <text x="72" y="333" fill="#fde68a" font-size="16" font-weight="600" font-family="system-ui, -apple-system, sans-serif">Self-Contained Node.js 24 Runtime  •  Live AI Credits &amp; Token Telemetry</text>
      </g>

      <!-- Right Frame Borders for Visuals -->
      <rect x="814" y="64" width="1028" height="636" rx="28" fill="#090d16" stroke="#38bdf8" stroke-width="3"/>
      <text x="1328" y="106" fill="#e2e8f0" font-size="22" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1.5">15-KEY PRIMARY MISSION CONTROL CONSOLE</text>

      <!-- Bottom Status Strip -->
      <rect x="814" y="728" width="1028" height="168" rx="22" fill="#0f172a" stroke="#a855f7" stroke-width="2.5"/>
    </svg>`);

    const deckPage1Buf = await sharp(path.join(assetsDir, "deck_page1.png"))
      .resize(960, 560, { fit: "contain", background: "#090d16" })
      .png()
      .toBuffer();

    const hwPhotoBuf = await roundCorners(
      fs.readFileSync(path.join(assetsDir, "hardware_deck_photo.jpg")),
      240,
      140,
      16
    );

    const footerOverlaySvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="740" height="140" viewBox="0 0 740 140">
      <text x="10" y="44" fill="#ffffff" font-size="25" font-weight="900" font-family="system-ui, -apple-system, sans-serif">Built for Physical Developer Ergonomics on macOS</text>
      <text x="10" y="80" fill="#cbd5e1" font-size="19" font-weight="600" font-family="system-ui, -apple-system, sans-serif">High-legibility Retina SVG keys • Zero micro-text • Instant terminal focus</text>
      <text x="10" y="114" fill="#34d399" font-size="18" font-weight="800" font-family="system-ui, -apple-system, sans-serif">SDKVersion 2  •  Stream Deck 7.1+  •  macOS 13+  •  Open Source (Apache-2.0)</text>
    </svg>`);

    await sharp(baseSvg)
      .composite([
        { input: deckPage1Buf, left: 848, top: 124 },
        { input: hwPhotoBuf, left: 832, top: 742 },
        { input: footerOverlaySvg, left: 1092, top: 742 }
      ])
      .png()
      .toFile(path.join(outDir, "thumbnail-1920x960.png"));
  }

  // 3. Gallery 1: Primary Console & Hardware Photo (1920x960)
  {
    const bgSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="960" viewBox="0 0 1920 960">
      <defs>
        <linearGradient id="g1bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#060913"/>
          <stop offset="100%" stop-color="#111827"/>
        </linearGradient>
      </defs>
      <rect width="1920" height="960" fill="url(#g1bg)"/>
      <rect x="0" y="0" width="1920" height="8" fill="#38bdf8"/>

      <text x="960" y="76" fill="#ffffff" font-size="44" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">15-Key Primary Console &amp; Physical Hardware Cockpit</text>
      <text x="960" y="118" fill="#94a3b8" font-size="22" font-weight="600" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">One-Click Stream Deck Profile with Real-Time SVG Telemetry, Multimodal Capture &amp; Emergency Halt</text>

      <!-- Left Card: Hardware Photo -->
      <rect x="64" y="156" width="840" height="630" rx="28" fill="#0b1120" stroke="#38bdf8" stroke-width="3"/>
      <text x="484" y="756" fill="#7dd3fc" font-size="22" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">PHYSICAL STREAM DECK MK.2 RUNNING MUSEDECK</text>

      <!-- Right Card: Crisp Vector Grid -->
      <rect x="944" y="156" width="912" height="630" rx="28" fill="#0b1120" stroke="#10b981" stroke-width="3"/>
      <text x="1400" y="756" fill="#6ee7b7" font-size="22" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">PAGE 1 MASTER KEY LAYOUT (RETINA 144×144 SVG KEYS)</text>

      <!-- Bottom Callout Bar -->
      <rect x="64" y="814" width="1792" height="104" rx="20" fill="#0f172a" stroke="#334155" stroke-width="2"/>
      <text x="960" y="858" fill="#ffffff" font-size="23" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Row 1: Status &amp; HITL Gate • Voice (⌥+V) • Snippets • Struct Prompt • Sessions   |   Row 2: SAM 3.1 Snip • Img-to-Code • Vid-to-Code • Settings • Credits</text>
      <text x="960" y="894" fill="#38bdf8" font-size="20" font-weight="700" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Row 3: 5s Video Record • Muse Memory (SPEC/ARCH/TODO) • Muse Ops (Fix/Refactor/Test) • 13-Key Git Deck • Emergency HALT</text>
    </svg>`);

    const hwPhoto = await roundCorners(
      fs.readFileSync(path.join(assetsDir, "hardware_deck_photo.jpg")),
      792,
      540,
      20
    );
    const page1Img = await sharp(path.join(assetsDir, "deck_page1.png"))
      .resize(864, 530, { fit: "contain", background: "#0b1120" })
      .png()
      .toBuffer();

    await sharp(bgSvg)
      .composite([
        { input: hwPhoto, left: 88, top: 180 },
        { input: page1Img, left: 968, top: 184 }
      ])
      .png()
      .toFile(path.join(outDir, "gallery-1-master-console-1920x960.png"));
  }

  // 4. Gallery 2: Physical Human-in-the-Loop (HITL) Review Submenu (1920x960)
  {
    const flashingGreenBuf = await sharp(parseDataUri(SvgKeyRenderer.renderFlashingApprovalKey(true))).resize(190, 190).png().toBuffer();
    const flashingAmberBuf = await sharp(parseDataUri(SvgKeyRenderer.renderFlashingApprovalKey(false))).resize(190, 190).png().toBuffer();
    const reviewGridBuf = await sharp(path.join(assetsDir, "deck_review_submenu.png"))
      .resize(1020, 626, { fit: "contain", background: "#0c0e14" })
      .png()
      .toBuffer();

    const bgSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="960" viewBox="0 0 1920 960">
      <rect width="1920" height="960" fill="#070a12"/>
      <rect x="0" y="0" width="1920" height="8" fill="#10b981"/>

      <text x="960" y="76" fill="#ffffff" font-size="44" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Physical Human-in-the-Loop (HITL) Verification Gate</text>
      <text x="960" y="118" fill="#94a3b8" font-size="22" font-weight="600" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Eliminate Autonomous Agent Anxiety with Unambiguous Tactile Diff Approval &amp; Instant Terminal Surfacing</text>

      <!-- Left Panel: 650ms Breathing Alert State Machine -->
      <rect x="64" y="156" width="720" height="740" rx="28" fill="#0f172a" stroke="#f59e0b" stroke-width="3"/>
      <text x="424" y="212" fill="#fde047" font-size="26" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">1. 650ms BREATHING ALERT PULSE</text>
      <text x="424" y="248" fill="#cbd5e1" font-size="18" font-weight="600" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">When the agent pauses for permission, Key [0,0] alternates:</text>

      <text x="275" y="495" fill="#4ade80" font-size="18" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">PHASE A (GREEN)</text>
      <text x="575" y="495" fill="#fbbf24" font-size="18" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">PHASE B (AMBER)</text>

      <!-- Workflow Steps -->
      <g transform="translate(104, 535)">
        <rect x="0" y="0" width="640" height="74" rx="14" fill="#090d16" stroke="#334155" stroke-width="2"/>
        <text x="24" y="32" fill="#38bdf8" font-size="20" font-weight="800" font-family="system-ui, -apple-system, sans-serif">Step 1: Tap Flashing Key [0, 0]</text>
        <text x="24" y="57" fill="#94a3b8" font-size="17" font-weight="600" font-family="system-ui, -apple-system, sans-serif">Automatically brings active Terminal window to the foreground</text>

        <rect x="0" y="92" width="640" height="74" rx="14" fill="#090d16" stroke="#334155" stroke-width="2"/>
        <text x="24" y="124" fill="#10b981" font-size="20" font-weight="800" font-family="system-ui, -apple-system, sans-serif">Step 2: Choose Physical Decision [1..4]</text>
        <text x="24" y="149" fill="#94a3b8" font-size="17" font-weight="600" font-family="system-ui, -apple-system, sans-serif">Approve Once (1), Always Allow (2), Reject (3), or Tell Why (4)</text>

        <rect x="0" y="184" width="640" height="74" rx="14" fill="#090d16" stroke="#334155" stroke-width="2"/>
        <text x="24" y="216" fill="#a855f7" font-size="20" font-weight="800" font-family="system-ui, -apple-system, sans-serif">Step 3: Auto-Return to Primary Console</text>
        <text x="24" y="241" fill="#94a3b8" font-size="17" font-weight="600" font-family="system-ui, -apple-system, sans-serif">Dispatches decision keystroke and restores Page 1 layout</text>
      </g>

      <!-- Right Panel: Review Submenu Hardware Modal -->
      <rect x="820" y="156" width="1036" height="740" rx="28" fill="#0c0e14" stroke="#10b981" stroke-width="3"/>
      <text x="1338" y="212" fill="#4ade80" font-size="26" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">2. DEDICATED HITL REVIEW SUBMENU MODAL</text>
    </svg>`);

    await sharp(bgSvg)
      .composite([
        { input: flashingGreenBuf, left: 180, top: 275 },
        { input: flashingAmberBuf, left: 480, top: 275 },
        { input: reviewGridBuf, left: 828, top: 240 }
      ])
      .png()
      .toFile(path.join(outDir, "gallery-2-hitl-review-gate-1920x960.png"));
  }

  // 5. Gallery 3: Multi-Session Switcher & Prompt Snippets (1920x960)
  {
    const sessionsBuf = await sharp(path.join(assetsDir, "deck_sessions_submenu.png"))
      .resize(860, 520, { fit: "contain", background: "#0c0e14" })
      .png()
      .toBuffer();
    const snippetsBuf = await sharp(path.join(assetsDir, "deck_snippets_submenu.png"))
      .resize(860, 520, { fit: "contain", background: "#0c0e14" })
      .png()
      .toBuffer();

    const bgSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="960" viewBox="0 0 1920 960">
      <rect width="1920" height="960" fill="#070a12"/>
      <rect x="0" y="0" width="1920" height="8" fill="#a855f7"/>

      <text x="960" y="76" fill="#ffffff" font-size="44" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Multi-Session Switcher &amp; Rapid Steering Snippets</text>
      <text x="960" y="118" fill="#94a3b8" font-size="22" font-weight="600" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Switch Between Concurrent Workspaces &amp; Inject Battle-Tested Steering Qualifiers with One Tap</text>

      <!-- Left Card: Sessions Submenu -->
      <rect x="56" y="156" width="884" height="744" rx="28" fill="#0c0e14" stroke="#38bdf8" stroke-width="3"/>
      <text x="498" y="210" fill="#38bdf8" font-size="27" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">13-KEY SESSION DRAWER &amp; HISTORY</text>
      <text x="498" y="244" fill="#94a3b8" font-size="18" font-weight="600" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Color-Coded Recency Badges (TODAY / YESTRDY / DATE) + Instant Window Focus</text>
      <text x="498" y="858" fill="#e2e8f0" font-size="19" font-weight="700" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Launch fresh sessions (+ NEW) or resume historical sessions across repositories</text>

      <!-- Right Card: Snippets Submenu -->
      <rect x="980" y="156" width="884" height="744" rx="28" fill="#0c0e14" stroke="#f59e0b" stroke-width="3"/>
      <text x="1422" y="210" fill="#fbbf24" font-size="27" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">PROMPT STEERING SNIPPETS DRAWER</text>
      <text x="1422" y="244" fill="#94a3b8" font-size="18" font-weight="600" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Inject Critical Constraints Directly into Active Terminal Without Typing</text>
      <text x="1422" y="858" fill="#e2e8f0" font-size="19" font-weight="700" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">BE HONEST • DON'T CODE • SHOW OPTIONS • EXPLAIN WHY • KEEP SHORT • NO TESTS • GO!</text>
    </svg>`);

    await sharp(bgSvg)
      .composite([
        { input: sessionsBuf, left: 68, top: 274 },
        { input: snippetsBuf, left: 992, top: 274 }
      ])
      .png()
      .toFile(path.join(outDir, "gallery-3-multimodal-sessions-1920x960.png"));
  }

  // 6. Gallery 4: Developer Ops, Tactile Git Cockpit & Living Memory (1920x960)
  {
    const opsBuf = await sharp(path.join(assetsDir, "deck_ops_submenu.png"))
      .resize(576, 354, { fit: "contain", background: "#0c0e14" })
      .png()
      .toBuffer();
    const gitBuf = await sharp(path.join(assetsDir, "deck_git_submenu.png"))
      .resize(576, 354, { fit: "contain", background: "#0c0e14" })
      .png()
      .toBuffer();
    const memBuf = await sharp(path.join(assetsDir, "deck_memory_submenu.png"))
      .resize(576, 354, { fit: "contain", background: "#0c0e14" })
      .png()
      .toBuffer();

    const bgSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="960" viewBox="0 0 1920 960">
      <rect width="1920" height="960" fill="#070a12"/>
      <rect x="0" y="0" width="1920" height="8" fill="#f59e0b"/>

      <text x="960" y="76" fill="#ffffff" font-size="44" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Muse Ops, 13-Key Git Cockpit &amp; Living Project Memory</text>
      <text x="960" y="118" fill="#94a3b8" font-size="22" font-weight="600" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Full-Cycle Software Engineering Submenus Accessible from a Single 15-Key Stream Deck</text>

      <!-- Card 1: Muse Ops -->
      <rect x="42" y="164" width="596" height="736" rx="26" fill="#0c0e14" stroke="#ef4444" stroke-width="3"/>
      <text x="340" y="218" fill="#f87171" font-size="26" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">MUSE OPS SUBMENU</text>
      <text x="340" y="252" fill="#94a3b8" font-size="17" font-weight="600" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Daily Debugging, Refactoring &amp; Verification</text>
      <g transform="translate(68, 666)">
        <text x="0" y="28" fill="#ffffff" font-size="19" font-weight="800" font-family="system-ui, -apple-system, sans-serif">• FIX ERROR &amp; CODE REVIEW</text>
        <text x="0" y="62" fill="#cbd5e1" font-size="17" font-weight="600" font-family="system-ui, -apple-system, sans-serif">• REFACTOR, OPTIMIZE &amp; EXPLAIN CODE</text>
        <text x="0" y="96" fill="#cbd5e1" font-size="17" font-weight="600" font-family="system-ui, -apple-system, sans-serif">• FIND SYMBOL Across Workspace</text>
        <text x="0" y="130" fill="#4ade80" font-size="17" font-weight="700" font-family="system-ui, -apple-system, sans-serif">• RUN TESTS, RUN BUILD &amp; TYPE CHECK</text>
      </g>

      <!-- Card 2: Git Commands -->
      <rect x="662" y="164" width="596" height="736" rx="26" fill="#0c0e14" stroke="#38bdf8" stroke-width="3"/>
      <text x="960" y="218" fill="#38bdf8" font-size="26" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">13-KEY GIT COMMANDS DECK</text>
      <text x="960" y="252" fill="#94a3b8" font-size="17" font-weight="600" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Tactile Version Control with 2-Tap Discard Guard</text>
      <g transform="translate(688, 666)">
        <text x="0" y="28" fill="#ffffff" font-size="19" font-weight="800" font-family="system-ui, -apple-system, sans-serif">• STATUS, VIEW DIFF &amp; SEMANTIC COMMIT</text>
        <text x="0" y="62" fill="#cbd5e1" font-size="17" font-weight="600" font-family="system-ui, -apple-system, sans-serif">• PULL, PUSH, STASH SAVE &amp; STASH POP</text>
        <text x="0" y="96" fill="#cbd5e1" font-size="17" font-weight="600" font-family="system-ui, -apple-system, sans-serif">• DISCARD (Protected by 2-Tap Safety Guard)</text>
        <text x="0" y="130" fill="#38bdf8" font-size="17" font-weight="700" font-family="system-ui, -apple-system, sans-serif">• CREATE PR, OPEN REPO &amp; GIT LOG</text>
      </g>

      <!-- Card 3: Muse Memory -->
      <rect x="1282" y="164" width="596" height="736" rx="26" fill="#0c0e14" stroke="#a855f7" stroke-width="3"/>
      <text x="1580" y="218" fill="#c084fc" font-size="26" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">LIVING PROJECT MEMORY</text>
      <text x="1580" y="252" fill="#94a3b8" font-size="17" font-weight="600" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Persistent Context &amp; Architecture Alignment</text>
      <g transform="translate(1308, 666)">
        <text x="0" y="28" fill="#ffffff" font-size="19" font-weight="800" font-family="system-ui, -apple-system, sans-serif">• MUSE RULES, SPEC.md &amp; PLAN.md</text>
        <text x="0" y="62" fill="#cbd5e1" font-size="17" font-weight="600" font-family="system-ui, -apple-system, sans-serif">• ARCH.md, DECISIONS.md &amp; API DOCS</text>
        <text x="0" y="96" fill="#cbd5e1" font-size="17" font-weight="600" font-family="system-ui, -apple-system, sans-serif">• TODO.md, PROGRESS.md &amp; TESTING.md</text>
        <text x="0" y="130" fill="#c084fc" font-size="17" font-weight="700" font-family="system-ui, -apple-system, sans-serif">• SYNC CONTEXT &amp; UPDATE CHANGELOG</text>
      </g>
    </svg>`);

    await sharp(bgSvg)
      .composite([
        { input: opsBuf, left: 52, top: 280 },
        { input: gitBuf, left: 672, top: 280 },
        { input: memBuf, left: 1292, top: 280 }
      ])
      .png()
      .toFile(path.join(outDir, "gallery-4-ops-git-memory-1920x960.png"));
  }

  // 7. Gallery 5: Web Mission Control Dashboard & Live AI Credits HUD (1920x960)
  {
    const webDashBuf = await roundCorners(
      fs.readFileSync(path.join(assetsDir, "web_settings_dashboard.png")),
      840,
      630,
      20
    );
    const telemetryBuf = await sharp(path.join(assetsDir, "deck_telemetry_submenu.png"))
      .resize(840, 516, { fit: "contain", background: "#0c0e14" })
      .png()
      .toBuffer();

    const bgSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="960" viewBox="0 0 1920 960">
      <rect width="1920" height="960" fill="#070a12"/>
      <rect x="0" y="0" width="1920" height="8" fill="#06b6d4"/>

      <text x="960" y="76" fill="#ffffff" font-size="44" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Web Mission Control Cockpit &amp; Live AI Credits Telemetry HUD</text>
      <text x="960" y="118" fill="#94a3b8" font-size="22" font-weight="600" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Local Browser Configuration (localhost:3456/settings) + Real-Time Hardware Token, Cache &amp; Latency Metrics</text>

      <!-- Left Card: Web Settings Dashboard -->
      <rect x="56" y="156" width="884" height="744" rx="28" fill="#0b1120" stroke="#06b6d4" stroke-width="3"/>
      <text x="498" y="864" fill="#22d3ee" font-size="17.5" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">WEB SETTINGS &amp; ENVIRONMENT DIAGNOSTICS (HTTP://LOCALHOST:3456/SETTINGS)</text>

      <!-- Right Card: Credits & Telemetry Submenu -->
      <rect x="980" y="156" width="884" height="744" rx="28" fill="#0c0e14" stroke="#22c55e" stroke-width="3"/>
      <text x="1422" y="212" fill="#4ade80" font-size="26" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">10-KEY AI CREDITS &amp; TELEMETRY SUBMENU</text>
      <text x="1422" y="246" fill="#94a3b8" font-size="18" font-weight="600" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Track Grant Balance, Spend, Token Volume, Cache Hit Rate &amp; Inference Latency</text>
      <text x="1422" y="840" fill="#e2e8f0" font-size="19" font-weight="700" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Includes 1-Tap Shortcut to Meta Model API Billing Console &amp; Live Ping Test</text>
    </svg>`);

    await sharp(bgSvg)
      .composite([
        { input: webDashBuf, left: 78, top: 184 },
        { input: telemetryBuf, left: 1002, top: 274 }
      ])
      .png()
      .toFile(path.join(outDir, "gallery-5-web-mission-control-1920x960.png"));
  }

  console.log("Generated all Elgato Marketplace store assets in marketplace-assets/");
}

async function main() {
  await generatePluginInternalIcons();
  await generateMarketplaceBanners();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
