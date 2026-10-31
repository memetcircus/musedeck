# MuseDeck ⚡

> **Tactile Mission Control for Meta Muse Code CLI & Meta AI**  
> Physical Elgato Stream Deck console bridging Muse Code CLI, Meta SAM 3.1, Muse Spark 1.3 & Voice Transcribe.

<p align="center">
  <img src="assets/hardware_deck_photo.jpg" width="48.5%" alt="Physical Stream Deck MK.2 Console running MuseDeck" />
  <img src="assets/hardware_thinking_wave.gif" width="48.5%" alt="Live Quantum Beam Wave Animation" />
</p>
<p align="center">
  <sub>Left: Physical Stream Deck MK.2 running MuseDeck. Right: 5×3 Quantum Beam wave (activates in <code>WORKING</code> state during code synthesis).</sub>
</p>

---

## 🌟 Overview

Autonomous coding agents (such as Meta's **Muse Code CLI**) excel at end-to-end repository refactoring, test generation across parallel git worktrees, and terminal automation. However, developer trust and velocity break down when agent execution becomes an opaque black box:
* **Context Switching Friction**: Constant alt-tabbing between code editors, terminals, browsers, and documentation.
* **Review Anxiety**: Autonomous agents applying complex multi-file diffs without an unambiguous human verification gate.
* **Multimodal Bottlenecks**: Manually taking screenshots of Figma designs or recording buggy UI animations, saving files, and typing long prompts into terminal windows.

**MuseDeck** solves this by transforming the **Elgato Stream Deck MK.2** into a dedicated, physical mission control console:
1. **Physical Human-in-the-Loop (HITL) Review Gate**: When Muse Code pauses for confirmation, the top-left key pulses with a calm 650ms breathing alert. Tapping it surfaces the active terminal and opens a tactile Review Submenu (`APPROVE`, `ALWAYS`, `REJECT`, `FEEDBACK`).
2. **Multimodal Visual Engineering (Image-to-Code & Video-to-Code)**: One-touch screen snip powered by **Meta SAM 3.1** component segmentation and frontend synthesis via **Muse Spark 1.3**. Plus, desktop interaction recording for dynamic UI bugs uploaded via Meta Files API for automated regression patching.
3. **Voice Transcribe Streaming**: Physical `VOICE` key toggles hardware `Option+V` microphone transcription directly at the active terminal prompt with zero typing.
4. **Session Switcher & History Drawer**: Physical session drawer monitoring active terminal tabs and scanning historical sessions across workspaces with high-contrast date badges (`TODAY`, `YESTRDY`, `OCT 29`).
5. **Living Developer Memory & Ops Cockpit**: One-touch access to architecture docs, living prompt qualifiers (`BE HONEST`, `DONT CODE`, `SHORT`, `SHOW OPTS`), a 13-key Git dashboard, and an emergency `HALT` switch.

---

## 📸 Primary Console (Page 1)

![MuseDeck Page 1 Master Console](assets/deck_page1.png)

### 🎛️ Page 1 Key Layout

| Key [Col, Row] | Button | Function & Developer Capability |
|:---:|:---:|---|
| **[0,&nbsp;0]** | **READY&nbsp;/&nbsp;REVIEW** | Dynamic agent status telemetry (`READY`, `PLAN`, `RUNNING`). When awaiting human approval (`WAITING_APPROVAL`), pulses with a calm 650ms breathing alert; tap opens the **Review Submenu**. |
| **[1,&nbsp;0]** | **VOICE** | Hardware `⌥+V` trigger for Meta Muse Voice Transcribe. Streams microphone audio directly into the active terminal cursor for zero-typing steering. |
| **[2,&nbsp;0]** | **SNIPPETS** | Rapid steering qualifier drawer (`BE HONEST`, `DON'T CODE`, `SHORT`, `SHOW OPTS`, `GO!`). |
| **[3,&nbsp;0]** | **PROMPT&nbsp;(SPEC)** | Structured spec transformer (Requirements → Technical Design → Task Breakdown → Review Gate). |
| **[4,&nbsp;0]** | **SESSIONS** | Active session counter. Tap opens the tactile **13-Key Session Switcher & Drawer**. |
| **[0,&nbsp;1]** | **SCREENSHOT** | Interactive macOS screen region snip. Dispatches to Meta SAM 3.1 to segment foreground UI components and injects coordinates at cursor. |
| **[1,&nbsp;1]** | **IMG&nbsp;TO&nbsp;CODE** | Meta Muse Spark 1.3 visual frontend synthesizer. Transforms UI snips and mocks into clean React + Tailwind, Flutter, or Streamlit code. |
| **[2,&nbsp;1]** | **VID&nbsp;TO&nbsp;CODE** | Video-to-Code bug diagnostic engine. Records desktop interactions, uploads via Meta Files API, analyzes transitions, and synthesizes regression patches. |
| **[3,&nbsp;1]** | **MUSE&nbsp;SETTINGS** | Launches the local Web Mission Control configuration console in your browser (`http://localhost:3456`). |
| **[4,&nbsp;1]** | **CREDITS&nbsp;HUD** | Live Meta Model API credits tracker (`$149.97`). Tap opens the **10-Key Telemetry Dashboard**. |
| **[0,&nbsp;2]** | **VIDEO&nbsp;RECORD** | One-touch desktop video recording trigger for capturing reproducible bug flows and UI glitches. |
| **[1,&nbsp;2]** | **MUSE&nbsp;MEMORY** | Living architecture memory drawer (`MUSE RULES`, `SPEC.md`, `ARCH.md`, `DECISIONS.md`, `SYNC CONTEXT`). |
| **[2,&nbsp;2]** | **MUSE&nbsp;OPS** | Developer operations drawer (`FIX ERROR`, `REFACTOR`, `OPTIMIZE`, `EXPLAIN`, `RUN TESTS`). |
| **[3,&nbsp;2]** | **GIT&nbsp;COMMANDS** | 13-key tactile Git control deck (`STATUS`, `COMMIT`, `PULL`, `PUSH`, `DIFF`, `PR`). |
| **[4,&nbsp;2]** | **HALT** | Physical emergency stop switch. Instantly sends `SIGINT` / `SIGKILL` to abort runaway agent actions. |

---

## 📂 Submenu Consoles & Detailed Guides

### 1. Human-in-the-Loop (HITL) Review Submenu
When Muse Code generates file diffs and pauses for human verification, the top-left key pulses. Tapping it opens this dedicated confirmation modal:

![MuseDeck Review Submenu Modal](assets/deck_review_submenu.png)

* **[0, 0] ↑ BACK:** Return to the primary console without making a decision.
* **[1, 0] OPTION 1 (APPROVE ONCE):** Approves the tool/diff for this step (injects `1` + Enter into active terminal) and resumes autonomous execution.
* **[2, 0] OPTION 2 (ALWAYS ALLOW):** Grants blanket approval for this tool throughout the current session (`2`).
* **[3, 0] OPTION 3 (REJECT / DENY):** Denies the proposed changes (`3`) and instructs the agent to abort the action.
* **[4, 0] OPTION 4 (TELL WHY / FEEDBACK):** Pauses execution and prompts developer to provide explicit feedback in the terminal (`4`).

---

### 2. Sessions Drawer & Switcher Submenu
Effortlessly switch between concurrent terminal tabs and restore historical workspaces with zero terminal navigation commands:

![MuseDeck Sessions Drawer Submenu](assets/deck_sessions_submenu.png)

* **[0, 0] ↑ BACK:** Return to the primary console.
* **[1, 0] + NEW SESSION:** Launches a fresh, independent Meta Muse session in your active project workspace.
* **Cards [2..14]:** Automatically scanned from active terminals and disk history. Displays high-legibility date badges (`TODAY`, `YESTRDY`, `OCT 29`), project names (`MUSEDECK`, `GLOBAL`, `GRID`), and timestamps. Tapping any card focuses its terminal window and restores full prompt context.

---

### 3. Prompt Snippets Submenu
Inject concise, battle-tested agent steering qualifiers into your terminal cursor with a single physical tap:

![MuseDeck Snippets Submenu](assets/deck_snippets_submenu.png)

* **BE HONEST:** Injects: *"Be honest and critical. Point out what is wrong, suggest better approaches."*
* **DON'T CODE:** Injects: *"Do not execute yet. Outline the approach first, I will review before any implementation."*
* **SHOW OPTIONS:** Injects: *"Show me 2-3 alternatives with tradeoffs for each."*
* **EXPLAIN WHY:** Injects: *"Explain your reasoning and tradeoffs before acting."*
* **KEEP SHORT:** Injects: *"Keep it focused. Only what is needed, nothing extra."*
* **NO TESTS:** Injects: *"Skip tests for now. Focus on implementation only."*
* **GO!:** Submits the prompt line with an automated Enter keypress.

---

### 4. Muse Memory (Living Documentation) Submenu
Keeps autonomous agents strictly aligned with project architecture and institutional knowledge:

![MuseDeck Memory Submenu](assets/deck_memory_submenu.png)

* **MUSE RULES:** Loads `rules.txt` project constraints into the active agent session.
* **SPEC.md & PLAN.md:** Opens and syncs technical design specifications and implementation plans.
* **TODO.md & PROGRESS.md:** Inspects remaining milestones and current development velocity.
* **ARCH.md & DECISIONS.md:** Re-anchors agent reasoning to established architecture principles and design decisions.
* **SYNC CONTEXT:** Scans all repository documentation in one pass to refresh agent context window.
* **UPDATE LOG:** Appends latest development milestones to project changelog.

---

### 5. Muse Ops (Developer Operations) Submenu
Triggers common daily refactoring and verification workflows directly from physical keys:

![MuseDeck Ops Submenu](assets/deck_ops_submenu.png)

* **FIX ERROR:** Inspects clipboard stack traces or terminal error logs to diagnose root causes and synthesize fixes.
* **REFACTOR CODE:** Restructures selected code for readability, maintainability, and DRY/KISS compliance.
* **OPTIMIZE PERF:** Analyzes algorithmic bottlenecks and memory consumption to optimize execution speed.
* **EXPLAIN CODE:** Generates step-by-step walkthroughs of complex logic and subtle edge cases.
* **FIND SYMBOL:** Traces function, class, and symbol definitions across the entire workspace.
* **CODE REVIEW:** Runs comprehensive security, quality, and bug inspections across uncommitted diffs.
* **RUN TESTS / RUN BUILD / TYPE CHECK:** Triggers test suites, build bundlers, and TypeScript typecheckers with live reporting.

---

### 6. Git Commands Submenu
Complete tactile version control cockpit eliminating routine terminal git typing:

![MuseDeck Git Submenu](assets/deck_git_submenu.png)

* **GIT STATUS & VIEW DIFF:** Displays unstaged files and visual line diff summaries.
* **GIT COMMIT:** Analyzes staged modifications to generate conventional semantic commit messages.
* **GIT PULL & PUSH:** Syncs local branch with remote repositories.
* **STASH SAVE & POP:** Safely shelves and restores in-flight work.
* **DISCARD (2-Tap Guard):** Double-tap confirmation protection to prevent accidental code loss when reverting changes.
* **CREATE PR:** Automatically drafts summary and opens a GitHub Pull Request in your default browser.

---

### 7. Credits & Telemetry Submenu
Real-time hardware HUD tracking Meta Model API resource utilization and cloud inference costs:

![MuseDeck Credits and Telemetry Submenu](assets/deck_telemetry_submenu.png)

* **REMAINING CREDITS:** Live Meta Model API grant balance (`$149.97`).
* **TOTAL SPEND & REQUESTS:** Cumulative session expenditure (`$0.00`) and API call count (`21`).
* **INPUT & OUTPUT TOKENS:** Real-time token volume tracking (`433.9k in / 19.4k out`).
* **CACHE HIT RATE:** Model prompt caching efficiency (`57.7%`).
* **LATENCY:** Average round-trip API inference speed (`38 ms`).
* **BILLING CONSOLE ↗:** Quick shortcut to launch the official Meta Model API billing portal.

---

## 🎨 Multimodal Engine: Image-to-Code & Video-to-Code

### 🖼️ Image-to-Code (`IMG TO CODE` + SAM 3.1)
1. **Interactive macOS Screen Snip:** Tapping `SCREENSHOT` activates native crosshair region selection.
2. **Meta SAM 3.1 Segmentation:** Dispatched to Meta's **Segment Anything Model 3.1** via Meta Model API to isolate foreground UI elements and compute spatial bounding coordinates.
3. **Cursor Injection:** Coordinates and image references are pasted directly into the active Muse CLI prompt without wiping user text.
4. **Muse Spark 1.3 Synthesis:** Tapping `IMG TO CODE` feeds the isolated UI component to **Muse Spark 1.3** to synthesize clean React + Tailwind CSS, Flutter, or Streamlit frontend code.

### 🎥 Video-to-Code (`VID TO CODE`)
Dynamic UI defects (broken animation curves, layout jitter, state desyncs) cannot be conveyed in static images:
1. **One-Touch Workflow Recording:** Tapping `VIDEO RECORD` captures focused screen activity while reproducing the glitch.
2. **Meta Files API:** The recorded video (`.mp4`) is automatically packaged and uploaded to the Meta Files API.
3. **Temporal Multi-Frame Analysis:** Meta's multimodal pipeline analyzes frame transitions, pinpoints faulty CSS keyframes or reactive logic, and commits the regression patch directly to your repository.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Hardware["Physical Hardware Layer"]
        SD["Elgato Stream Deck MK.2"]
        MIC["Mac Microphone (Opt+V)"]
    end

    subgraph BridgeLayer["MuseDeck Bridge Layer (Port 3456 / 3457)"]
        Plugin["Stream Deck Plugin (Node.js SDK)"]
        Server["Express REST API & WS Broadcaster"]
        Automator["Terminal Automation (AppleScript / Native C Engine)"]
    end

    subgraph MetaStack["Meta AI & CLI Stack"]
        MuseCLI["Meta Muse Code CLI (`muse`)"]
        SAM["Meta SAM 3.1 (Segment Anything)"]
        Spark["Meta Muse Spark 1.3 (Vision & Code)"]
        FilesAPI["Meta Files API (Multimodal Video)"]
        VoiceAPI["Meta Muse Voice Transcribe"]
    end

    SD <-->|"Bidirectional WebSocket"| Plugin
    Plugin <-->|"WebSocket Telemetry & Action Dispatch"| Server
    Server --> Automator
    Automator -->|"Zero-latency keystrokes & window focus"| MuseCLI
    Server <-->|"REST & Polling"| MuseCLI

    MIC -->|"Native Stream"| VoiceAPI
    VoiceAPI -->|"Audio-to-text"| MuseCLI

    Server <-->|"Bounding segmentation"| SAM
    Server <-->|"Multimodal code synthesis"| Spark
    Server <-->|"Video frame diagnostic"| FilesAPI
```

---

## 🔄 Multimodal Data Pipeline

```mermaid
flowchart LR
    subgraph Ingestion["Input Capture"]
        Snip["SAM 3.1 Screen Snip"]
        Video["Desktop Video Recorder"]
        Voice["Option+V Microphone"]
    end

    subgraph MetaProcessing["Meta Multimodal Processing"]
        SAM_Proc["SAM 3.1 Boundary Segmentation"]
        Files_Proc["Meta Files API Chunked Upload"]
        Spark_Proc["Muse Spark 1.3 Code Engine"]
    end

    subgraph Synthesis["Tactile Output"]
        Deck["Stream Deck Dynamic LCD Key"]
        Term["Active Muse Terminal Buffer"]
        Patch["Git Patch & Code Commit"]
    end

    Snip --> SAM_Proc --> Spark_Proc --> Deck
    Video --> Files_Proc --> Spark_Proc --> Patch
    Voice --> Term
```

---

## ⚖️ Human-in-the-Loop (HITL) Execution Sequence

```mermaid
sequenceDiagram
    autonumber
    participant Dev as Developer
    participant SD as Stream Deck Key (0, 0)
    participant Server as MuseDeck Bridge
    participant Muse as Meta Muse Code CLI

    Muse->>Server: State Transition -> WAITING_APPROVAL (Diff generated)
    Server->>SD: Broadcast Telemetry (Breathing Alert Flashing, 650ms)
    Note over SD: Top-left key alternates Green / Amber alert pulse
    Dev->>SD: Tap Key [READY / REVIEW]
    SD->>Server: Open Review Submenu
    Server->>Dev: Bring active Muse Terminal window to front
    Note over SD: Review Submenu opens (Approve, Always, Reject, Feedback)
    Dev->>SD: Press Key [OPTION 1: APPROVE]
    SD->>Server: Dispatch "1" Keystroke + approve() signal
    Server->>Muse: Inject '1' + Enter into Terminal
    Muse->>Server: State Transition -> EXECUTING
    Server->>SD: Restore Primary Page 1 Console Layout
```

---

## ⚙️ Muse Settings & Web Mission Control (`http://localhost:3456/settings`)

Tapping Key **[3, 1]** (`MUSE SETTINGS`) on your physical Stream Deck instantly opens the local **MuseDeck Mission Control Cockpit** in your default browser.

![MuseDeck Web Settings Cockpit](assets/web_settings_dashboard.png)

### Core Capabilities of the Settings Dashboard

1. **Meta Model API Credentials & Live Connectivity**:
   - Safely input and manage your **Meta Model API Key** with toggleable password visibility.
   - **Test Ping Button**: Executes an instant test ping to Meta's inference servers, measuring real-time latency (e.g. `38ms`) and confirming connectivity with Meta's **Muse Spark 1.3** and **SAM 3.1** models.

2. **Target Project Workspace Directory**:
   - Defines the active project folder where the Meta Muse terminal automatically launches when you trigger actions from physical keys (`Voice`, `Fix Bug`, `Image-to-Code`, `Test Runner`).
   - Includes a one-click **Current Path** reset button and native macOS directory browsing.

3. **Environment & System Health Diagnostic**:
   - **Meta Muse Code CLI (`muse`)**: Verifies path resolution (`~/.local/bin/muse`) and execution readiness.
   - **Terminal Automation (AppleScript / zsh)**: Validates Accessibility and System Events permissions for zero-latency keystroke injection into Terminal.app.
   - **Stream Deck Core Bridge**: Monitors bidirectional WebSocket (Port 3457) and HTTP REST API (Port 3456) link health.
   - **Meta Model API Connection**: Displays live uptime, latency, and active model status.

4. **Persistent Multi-Session Configuration**:
   - All settings are persistently saved to `~/.musedeck/config.json`, maintaining configuration across system reboots, different terminal projects, and Stream Deck restarts without repetitive setup.

5. **Interactive 5x3 Virtual Stream Deck**:
   - Mirrors the physical Stream Deck state in real time at `http://localhost:3456`, displaying live diffs, token consumption, and terminal execution logs for dual-screen setups.

---

## 🚀 Quickstart

### 1. Prerequisites
* macOS 13+ (Apple Silicon or Intel)
* Node.js 20+ (Node 24 recommended)
* Elgato Stream Deck app (v7.1+)
* Meta Muse Code CLI (`muse`) installed on PATH

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/memetcircus/musedeck.git
cd musedeck

# Install dependencies
npm install

# Build server and Stream Deck plugin bundle
npm run pack
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
SPARK_MODEL_NAME=muse-spark-1.3
MUSE_CODE_BIN=muse
MUSE_CODE_SIMULATION=false
CLI_TIMEOUT_MS=180000
```

> **Simulation Mode**: If you do not have an active Meta Muse Code child process running, set `MUSE_CODE_SIMULATION=true` to test the state machine, 650ms breathing alert animations, and HITL review submenu gates immediately.

### 4. Running MuseDeck Bridge
Start the background mission control server:
```bash
npm run dev
# or: npm start
```
Open the Web Mission Control console at **[http://localhost:3456](http://localhost:3456)**.

### 5. Stream Deck Plugin Installation
Symlink the built plugin directly into your Elgato Stream Deck directory:
```bash
ln -sfn "$(pwd)/com.memetcircus.musedeck.sdPlugin" ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins/com.memetcircus.musedeck.sdPlugin
```
Restart the Stream Deck app, and **MuseDeck** will automatically load with the default 15-key profile!

---

## 🧪 Testing

Run the automated test suites:
```bash
# Test Agent State Machine, Transitions & HITL Gates
npm run test:agent

# Test Meta Model API Client, SAM 3.1 & Muse Spark Synthesis
npm run test:meta
```

---

## 🛡️ License

Licensed under the [Apache-2.0 License](LICENSE).
