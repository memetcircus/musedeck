# Elgato Marketplace (Maker Console) Submission Guide — MuseDeck (v1.0.0)

## 1. Product Identity

- **Plugin Name:** `MuseDeck`
- **UUID:** `com.memetcircus.musedeck`
- **Version:** `1.0.0` (`1.0.0.0` in `manifest.json`)
- **Category:** Developer Tools / Productivity
- **Supported OS:** macOS 13 (Ventura) or later (Apple Silicon & Intel)
- **Minimum Stream Deck Software:** `7.1`
- **Tagline / Short Description (<= 120 chars):**
  `Tactile Human-in-the-Loop Mission Control, Multimodal UI Synthesizer & Telemetry Console for Meta Muse Code CLI.`
- **Alternative Short Tagline (<= 90 chars):**
  `Physical Mission Control, HITL Review Gate & Multimodal Console for AI Coding Agents.`

---

## 2. Full Store Description (Markdown — Copy & Paste into Maker Console)

```markdown
**MuseDeck** transforms your **Elgato Stream Deck** into a tactile Human-in-the-Loop (HITL) mission control console, multimodal frontend synthesizer, and live telemetry cockpit for **Meta Muse Code CLI** (`muse`) and the **Meta Model API** (**SAM 3.1** & **Muse Spark 1.3**) on macOS.

Autonomous coding agents excel at multi-file refactoring and repository automation, but context-switching between code editors, terminal windows, and documentation creates friction—and unverified multi-file diffs introduce review anxiety. MuseDeck bridges your physical Stream Deck hardware directly to your terminal and AI workflow with a pre-configured 15-key profile and an embedded local bridge server.

### Key Features

* **Physical Human-in-the-Loop (HITL) Verification Gate:** When the agent pauses for file diff or tool confirmation, Key `[0, 0]` pulses with a 650ms green/amber breathing alert. Tapping it brings your active Terminal window to the foreground and opens a dedicated hardware Review Submenu (`APPROVE ONCE`, `ALWAYS ALLOW`, `REJECT / DENY`, `TELL WHY / FEEDBACK`).
* **Image-to-Code (`SAM 3.1` + `Muse Spark 1.3`):** Capture any screen region on macOS with one tap. MuseDeck segments foreground UI elements via **Meta SAM 3.1** and synthesizes production-ready components in **React + Tailwind CSS**, **HTML5**, **SwiftUI**, **Jetpack Compose**, or **Flutter**, complete with a hardware `RUN PREVIEW` key.
* **Video-to-Code (`5s Temporal Storyboard`):** Record 5-second desktop UI interactions, automatically verify perceptual motion deltas, assemble an 8-frame timecoded contact sheet (`flow_montage.png`), and synthesize animated UI fixes via **Muse Spark 1.3**.
* **Zero-Typing Voice Transcribe (`Option + V`):** Toggle native microphone voice transcription directly into your active terminal prompt without touching your keyboard.
* **13-Key Multi-Session Switcher & History Drawer:** Monitor active terminal sessions and restore historical workspace sessions with high-contrast recency badges (`TODAY`, `YESTRDY`, date stamps) and instant window focus.
* **Rapid Prompt Steering Snippets:** Inject critical engineering constraints (`BE HONEST`, `DON'T CODE`, `SHOW OPTIONS`, `EXPLAIN WHY`, `KEEP SHORT`, `NO TESTS`, `GO!`) into your active prompt with a single key press.
* **Living Project Memory & Developer Ops Drawers:** Keep agents aligned with repository documentation (`MUSE RULES`, `SPEC.md`, `PLAN.md`, `ARCH.md`, `DECISIONS.md`, `TODO.md`, `SYNC CONTEXT`) and trigger one-tap operations (`FIX ERROR`, `REFACTOR CODE`, `OPTIMIZE PERF`, `CODE REVIEW`, `RUN TESTS`, `RUN BUILD`, `TYPE CHECK`).
* **13-Key Tactile Git Cockpit & Emergency Halt:** Execute `STATUS`, `DIFF`, semantic `COMMIT`, `PULL`, `PUSH`, `STASH`, and `CREATE PR` from physical keys (with a 2-tap safety guard on `DISCARD`), plus an emergency `HALT` switch (`SIGINT` / `SIGKILL`) to stop runaway agent processes immediately.
* **Live AI Credits HUD & Local Web Mission Control:** Monitor real-time Meta Model API credit balance, token consumption, cache hit rate, and inference latency on your Stream Deck, or press `MUSE SETTINGS` to open the local Web Mission Control dashboard at `http://localhost:3456/settings`.

### Self-Contained Architecture

MuseDeck ships with its local HTTP/WebSocket bridge server (`127.0.0.1:3456` and `127.0.0.1:3457`) and a ready-to-use 15-key `MuseDeck` Stream Deck profile embedded directly inside the Node.js 24 plugin runtime. No manual background daemon or terminal server startup is required.
```

---

## 3. Release Notes (v1.0.0 — Copy & Paste into Maker Console)

```markdown
Initial v1.0.0 release of MuseDeck for Elgato Stream Deck (macOS):

- **15-Key Primary Console & Auto-Installed Profile:** Ships with a complete 5x3 hardware profile and high-legibility Retina SVG key rendering (144x144 / 288x288).
- **Physical Human-in-the-Loop (HITL) Review Gate:** Added 650ms hardware breathing alert on Key [0, 0] and a dedicated 5-key approval modal (Approve Once, Always Allow, Reject, Tell Why).
- **Multimodal Visual Engineering:** Integrated interactive macOS screen region snipping with Meta SAM 3.1 segmentation and multi-framework UI code synthesis (React, HTML5, SwiftUI, Jetpack Compose, Flutter) via Meta Muse Spark 1.3.
- **Temporal Video-to-Code Pipeline:** Added 5-second desktop interaction capture, perceptual motion verification, 8-frame timecoded filmstrip generation, and animated component synthesis.
- **Hardware Submenu Drawers:** Added 7 full-screen hardware submenus that dynamically take over the 15-key grid (HITL Review, Multi-Session Switcher, Prompt Snippets, Muse Memory, Muse Ops, Git Commands, and AI Credits Telemetry).
- **Embedded Local Mission Control Server:** Self-contained Node.js 24 plugin runtime hosting the local configuration dashboard (`http://localhost:3456/settings`) and WebSocket telemetry broadcaster (`ws://localhost:3457`).
```

---

## 4. Testing Instructions for Elgato Reviewers (Copy & Paste into Maker Console Notes)

```markdown
### Testing Instructions for Elgato Marketplace Reviewers

MuseDeck is a self-contained macOS plugin with an embedded local web server (`http://localhost:3456`) and built-in **Simulation Mode**, allowing you to verify all 15 physical keys, all 7 hardware submenus, and the Human-in-the-Loop (HITL) review workflow **without needing a paid Meta Model API key or the external `muse` CLI installed**.

#### 1. Installation & Profile Loading
1. Double-click `com.memetcircus.musedeck.streamDeckPlugin` on macOS 13+ with Stream Deck 7.1+.
2. Accept the prompt to install the bundled **MuseDeck** 15-key profile (or add any MuseDeck actions from the **MuseDeck** category in the right-hand action list).
3. All 15 keys will immediately render high-contrast SVG telemetry icons via the embedded local bridge server (`http://localhost:3456` / WebSocket `3457`).

#### 2. Testing the Web Settings Dashboard (No API Key Required)
1. Press the **MUSE SETTINGS** key (`Col 3, Row 1` — mascot icon) on the Stream Deck.
2. Your default browser will open `http://localhost:3456/settings`, displaying the MuseDeck Mission Control dashboard and live environment health checks.
3. Also visit `http://localhost:3456` to view the real-time 5x3 virtual Stream Deck mirror in your browser.

#### 3. Testing Hardware Submenus on the Stream Deck
Tap any of the drawer keys on Page 1 to test full-grid dynamic hardware navigation (use the top-left `↑` key at `[0, 0]` to return to Page 1 at any time):
- **SNIPPETS (`[2, 0]`):** Opens the 8-key Prompt Steering Snippets drawer (`BE HONEST`, `DON'T CODE`, `SHOW OPTIONS`, `EXPLAIN WHY`, `KEEP SHORT`, `NO TESTS`, `GO!`).
- **SESSIONS (`[4, 0]`):** Opens the 13-key Multi-Session Switcher & History drawer.
- **IMG TO CODE (`[1, 1]`) / VID TO CODE (`[2, 1]`):** Opens the framework target selector (`REACT`, `HTML5`, `SWIFTUI`, `COMPOSE`, `FLUTTER`, `RUN PREVIEW`).
- **CREDITS (`[4, 1]`):** Opens the 10-key AI Credits & Telemetry HUD showing token counters, cache hit rate, and latency metrics.
- **MUSE MEMORY (`[1, 2]`):** Opens the 13-key Living Documentation drawer (`MUSE RULES`, `SPEC.md`, `PLAN.md`, `ARCH.md`, `TODO.md`, `SYNC CONTEXT`).
- **MUSE OPS (`[2, 2]`):** Opens the 10-key Developer Operations drawer (`FIX ERROR`, `REFACTOR`, `OPTIMIZE`, `EXPLAIN`, `CODE REVIEW`, `RUN TESTS`).
- **GIT COMMANDS (`[3, 2]`):** Opens the 13-key Git Control cockpit (`STATUS`, `COMMIT`, `PULL`, `PUSH`, `DIFF`, `STASH`, and `DISCARD` with a 2-tap safety confirmation guard).

#### 4. Testing the 650ms Breathing Alert & Human-in-the-Loop (HITL) Review Gate
You can trigger the `WAITING_APPROVAL` state at any time via a local HTTP call in Terminal:
```bash
curl -X POST http://localhost:3456/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"state":"WAITING_APPROVAL","activeTask":"Refactor auth middleware","diffLines":"+42/-11"}'
```
- Observe Key `[0, 0]` pulsing between Green (`TAP FOR REVIEW`) and Amber (`APPROVAL REQUIRED`).
- Tap Key `[0, 0]` on the Stream Deck to open the **HITL Review Submenu** (`APPROVE ONCE`, `ALWAYS ALLOW`, `REJECT`, `FEEDBACK`).
- Tap `OPTION 1 (APPROVE ONCE)` at `[1, 0]` to approve and automatically return the Stream Deck to the Primary Console in `IDLE` (`READY`) state.
```

---

## 5. Generated Store Assets Inventory (`marketplace-assets/`)

| File | Pixel Dimensions | Format | Maker Console Upload Field |
| :--- | :---: | :---: | :--- |
| `app-icon-288x288.png` | `288 × 288 px` | PNG | **Product Icon (Required)** |
| `app-icon-512x512.png` | `512 × 512 px` | PNG | High-DPI Product Icon (Backup / Reference) |
| `thumbnail-1920x960.png` | `1920 × 960 px` | PNG | **Main Product Thumbnail (Required)** |
| `gallery-1-master-console-1920x960.png` | `1920 × 960 px` | PNG | **Gallery Image #1** (Hardware & 15-Key Layout) |
| `gallery-2-hitl-review-gate-1920x960.png` | `1920 × 960 px` | PNG | **Gallery Image #2** (HITL Review Gate & Breathing Alert) |
| `gallery-3-multimodal-sessions-1920x960.png` | `1920 × 960 px` | PNG | **Gallery Image #3** (Session Switcher & Prompt Snippets) |
| `gallery-4-ops-git-memory-1920x960.png` | `1920 × 960 px` | PNG | **Gallery Image #4** (Muse Ops, Git Cockpit & Memory) |
| `gallery-5-web-mission-control-1920x960.png` | `1920 × 960 px` | PNG | **Gallery Image #5** (Web Settings & AI Credits HUD) |
