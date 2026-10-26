# MuseDeck ⚡

> **Human-in-the-Loop Mission Control & Telemetry Console for Autonomous Coding Agents**  
> Built for the **Meta Global AI Developer Hackathon** (Track 1: Indie Developer)  
> Connecting Elgato Stream Deck directly to Meta's developer ecosystem: **Muse Code CLI**, **Meta Model API (SAM 3.1 & Muse Spark)**.

---

## 🌟 Overview

Autonomous coding agents (like Meta's **Muse Code**) are capable of large repo refactors, parallel test generation across git worktrees, and multimodal reasoning. However, as an indie developer, handing over the reins to autonomous agents without tactile oversight is risky and opaque.

**MuseDeck** turns your physical **Elgato Stream Deck** into a tactile, real-time telemetry console and **Human-in-the-Loop (HITL) review gate**:
1. **Dynamic Visual Telemetry**: High-resolution, color-coded SVG badges reflect the agentic state machine in real time (`IDLE`, `PLANNING`, `WAITING_APPROVAL`, `EXECUTING`, `ERROR`).
2. **Physical HITL Gates**: When Muse Code generates a diff, the agent pauses. You must physically press the **APPROVE** (Key 3) or **REJECT** (Key 4) keys on your Stream Deck to unpause and commit changes.
3. **Multimodal SAM 3.1 Snip**: Interactive screen region capture dispatched to Meta's **SAM 3.1** to segment and isolate foreground UI components, copy transparent PNGs to your macOS clipboard, and display a live thumbnail directly on Key 5.
4. **Image-to-Code with Muse Spark**: One-touch dispatch of the SAM-extracted UI snippet to **Muse Spark** to synthesize modern, accessible React + Tailwind CSS code.
5. **Web Mission Control**: A glassmorphism dashboard running at `http://localhost:3456` mirroring the 15-key deck in real time.

---

## 🎛️ 15-Key Layout Mapping (Stream Deck MK.2)

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ [Key 0]         │ [Key 1]         │ [Key 2]         │ [Key 3]         │ [Key 4]         │
│ 🤖 AGENT STATUS │ 📋 ACTIVE TASK  │ 🔀 DIFF SUMMARY │ ⚡ APPROVE (Y)  │ ❌ REJECT (N)   │
│ (Dynamic Badge) │ (Telemetry)     │ (Review Gate)   │ (Physical HITL) │ (Physical HITL) │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ [Key 5]         │ [Key 6]         │ [Key 7]         │ [Key 8]         │ [Key 9]         │
│ ✂️ SAM 3.1 SNIP │ 💻 IMG-TO-CODE  │ 🚀 RUN MUSE     │ 🛑 HALT/CANCEL  │ 🔄 RESET AGENT  │
│ (Foreground UI) │ (Muse Spark)    │ (Start Task)    │ (Emergency Stop)│ (Clean State)   │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ [Key 10]        │ [Key 11]        │ [Key 12]        │ [Key 13]        │ [Key 14]        │
│ 📝 PROMPT TASK  │ 🧪 WRITE TESTS  │ 🛠️ FIX BUG      │ 📦 COMMIT & PR  │ 🌐 WEB CONSOLE  │
│ (Quick Action)  │ (Muse Worktree) │ (Auto-Debug)    │ (Meta Flow)     │ (Dashboard UI)  │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### Key Breakdown

| Key | Action UUID | Description |
|---|---|---|
| **0** | `com.memetcircus.musedeck.status` | Dynamic SVG status badge (`READY`, `PLANNING`, `HITL GATE`, `RUNNING`, `ERROR`). |
| **1** | `com.memetcircus.musedeck.task` | Telemetry display showing active task & step progression. |
| **2** | `com.memetcircus.musedeck.diff` | Git diff summary (`+X / -Y` lines changed). Tap to view full diff. |
| **3** | `com.memetcircus.musedeck.approve` | **Physical HITL Approve Key**: Unpauses Muse Code and applies patch. |
| **4** | `com.memetcircus.musedeck.reject` | **Physical HITL Reject Key**: Halts patch application and requests revision. |
| **5** | `com.memetcircus.musedeck.sam-snip` | Interactive macOS screen region snip → SAM 3.1 segmentation → clipboard PNG & live key thumbnail. |
| **6** | `com.memetcircus.musedeck.spark-code` | Image-to-Code: Feeds SAM-segmented UI into Muse Spark to synthesize React component. |
| **7** | `com.memetcircus.musedeck.run-muse` | Launches / executes queued task via Muse Code CLI runner. |
| **8** | `com.memetcircus.musedeck.halt` | Emergency stop: Terminate child processes (`SIGTERM`/`SIGKILL`). |
| **9** | `com.memetcircus.musedeck.reset` | Clears buffers and resets state machine back to `IDLE`. |
| **10**| `com.memetcircus.musedeck.prompt-task` | Preset task launcher. |
| **11**| `com.memetcircus.musedeck.write-tests`| Instructs Muse Code to generate test suites across parallel worktrees. |
| **12**| `com.memetcircus.musedeck.fix-bug` | Feeds recent error logs to Muse Code for automated patching. |
| **13**| `com.memetcircus.musedeck.commit-pr` | Stages changes, generates semantic commit message, and prepares PR. |
| **14**| `com.memetcircus.musedeck.web-console`| Launches local Web Mission Control console in browser. |

---

## 🏗️ Architecture

```
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│     Elgato Stream Deck          │                 │       Web Mission Control       │
│     Physical Hardware Console   │                 │     (http://localhost:3456)     │
└────────────────┬────────────────┘                 └────────────────┬────────────────┘
                 │                                                   │
                 │ WebSocket / HTTP Events                           │
                 ▼                                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            MuseDeck Local Bridge (Express + WS)                     │
│               Port 3456 (REST API) & Port 3457 (Bidirectional Telemetry)            │
└───────┬─────────────────────────────┬─────────────────────────────────┬─────────────┘
        │                             │                                 │
        ▼                             ▼                                 ▼
┌─────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────┐
│   Agent State Machine   │  │   SAM 3.1 & Spark API   │  │    Muse Code CLI Runner   │
│  - IDLE                 │  │  - Meta Model API Client │  │  - Child Process Engine   │
│  - PLANNING             │  │  - SAM 3.1 Segmentation  │  │  - Stream Parsing        │
│  - WAITING_APPROVAL     │  │  - Muse Spark Synthesis  │  │  - Physical HITL Gates    │
│  - EXECUTING            │  │  - Clipboard Integration │  │  - CLI Timeout Protection │
│  - ERROR                │  └─────────────────────────┘  └──────────────────────────┘
└─────────────────────────┘
```

- **`src/server/`**: Express HTTP endpoints and WebSocket broadcaster for real-time telemetry.
- **`src/agent/`**: State machine transitions and robust child process manager for `muse-code` CLI with timeout guards, error boundaries, and interactive stdin piping.
- **`src/api/`**: Meta Model API client with automatic retry logic (HTTP 429 rate limit backoff), SAM 3.1 screen capture & segmentation, and Muse Spark code synthesis.
- **`src/plugin/`**: Stream Deck plugin implementation utilizing `@elgato/streamdeck` SDK v2, dynamic 144x144 SVG image generation, and bidirectional bridge connection.
- **`public/`**: Web Mission Control dashboard with tactile virtual Stream Deck, live diff viewer, and terminal log stream.

---

## 🚀 Quickstart

### 1. Prerequisites
- macOS 13+ (Apple Silicon or Intel)
- Node.js 20+ (Node 24 recommended)
- Elgato Stream Deck app (v7.1+)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/memetcircus/musedeck.git
cd musedeck

# Install dependencies
npm install

# Build server and plugin bundle
npm run build
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and provide your Meta API credentials:
```bash
cp .env.example .env
```

```ini
PORT=3456
WS_PORT=3457
META_MODEL_API_KEY=your_meta_model_api_key_here
META_API_BASE_URL=https://api.meta.ai/v1
SAM_MODEL_NAME=sam-3.1
SPARK_MODEL_NAME=muse-spark
MUSE_CODE_BIN=muse-code
MUSE_CODE_SIMULATION=true
CLI_TIMEOUT_MS=180000
```

> **Note on Simulation Mode**: When `MUSE_CODE_SIMULATION=true` (or when `muse-code` is not installed on PATH), MuseDeck operates in a simulated execution mode that walks through real planning, diff generation, and halts at the `WAITING_APPROVAL` gate so you can experience the physical HITL approval workflow immediately!

### 4. Running MuseDeck
Start the backend bridge:
```bash
npm run dev
# or: npm start
```

Open the Web Mission Control console:
👉 **[http://localhost:3456](http://localhost:3456)**

### 5. Stream Deck Plugin Installation
The plugin bundle is located at:
`com.memetcircus.musedeck.sdPlugin/`

To symlink it directly into Elgato Stream Deck:
```bash
ln -sfn "$(pwd)/com.memetcircus.musedeck.sdPlugin" ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins/com.memetcircus.musedeck.sdPlugin
```
Restart the Stream Deck app, and "MuseDeck" will appear in your action catalog!

---

## 🧪 Testing

Run the automated test suites:
```bash
# Test Agent State Machine, Transitions & HITL Gates
npm run test:agent

# Test Meta Model API Client & Muse Spark Synthesis
npm run test:meta
```

---

## 🛡️ License

Apache-2.0 License. Built for the Meta Global AI Developer Hackathon.
