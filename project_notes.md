# MuseDeck — Project Progress & Architecture Notes
> **Date:** October 29, 2026  
> **Status:** Page 1 Approval Workflow, Multi-Session Switcher, and Snippets Subsystem Completed  
> **Next Milestone:** Finish remaining Page 1 keys (`SPARK`, `RUN`, `PROMPT`, `TESTS`, `FIX BUG`, `COMMIT`) tomorrow.

---

## 1. System Architecture

MuseDeck is a mission-control physical bridge connecting the **Meta Muse Code CLI** terminal runtime with **Elgato Stream Deck** hardware consoles (15-key Stream Deck MK.2 and 32-key Stream Deck XL).

```
┌──────────────────────────────────────┐       WebSocket (3457)       ┌─────────────────────────────────────┐
│       Elgato Stream Deck Hardware    │ <──────────────────────────> │           MuseDeck Bridge           │
│   (NodeJS Plugin - Rollup Bundle)    │       HTTP REST (3456)       │    (Express + WS Server + State)    │
└──────────────────────────────────────┘                              └──────────────────┬──────────────────┘
                                                                                         │
                                                                       fs watcher / tail │ AppleScript / Keystroke
                                                                                         ▼
                                                                      ┌─────────────────────────────────────┐
                                                                      │         Meta Muse Code CLI          │
                                                                      │      (~/.local/share/muse/...)      │
                                                                      │      Live Terminal.app Session      │
                                                                      └─────────────────────────────────────┘
```

- **HTTP Bridge:** `http://localhost:3456` (Telemetry, state introspection, and REST triggers)
- **WebSocket Broadcast:** `ws://localhost:3457` (Real-time telemetry and state synchronization)
- **Live Session Watcher:** Actively tails the newest `session.jsonl` under `~/.local/share/muse/sessions/` at 150ms intervals for instant event detection.

---

## 2. Completed Features & Implementation Details

### A. Real-Time HITL (Human-in-the-Loop) Approval Gate
- **Live Terminal Event Detection:** Whenever Muse Code requires human confirmation for a tool execution (e.g. `bash: lsof -i :3456`), the watcher catches `approval_wait.effect.started` and transitions the state machine to `WAITING_APPROVAL`.
- **Automatic Drawer Popup (Auto-Open):** Stream Deck immediately surfaces the 4-option approval modal without requiring manual navigation:
  - `(1, 0) [#1 YES]` (Emerald Green): Approves command once (`1` + Enter).
  - `(2, 0) [#2 ALWAYS]` (Cyan): Approves for the entire session (`2` + Enter).
  - `(3, 0) [#3 NO]` (Crimson Red): Rejects tool execution (`3` + Enter).
  - `(4, 0) [#4 TELL WHY]` (Amber): Enters feedback mode (`4` + Enter).
  - `(0, 0) [↑ BACK]`: Returns to Page 1 without making a decision.
- **Hardware Flashing Alert:** Unlike broken SVG `<animate>` tags on hardware, a dedicated 400ms JavaScript timer actively alternates the physical LED between **Crimson (`ACTION REQUIRED`)** and **Amber (`REVIEW APPROVAL`)**.
- **Automated Lifecycle Recovery:** When the command finishes in terminal, the watcher catches `run.terminal (completed)` / settled events, stops the 5x3 beam animation, and restores Page 1 in the green **`READY`** state.

### B. Prompt Snippets Submenu (Page 1 - Key 2)
- Fast-injection shortcuts for high-leverage Muse Code prompt constraints:
  - `BE HONEST / CRITICAL`
  - `DON'T CODE / DISCUSS`
  - `SHOW OPTS / ALTERNATIVES`
  - `EXPLAIN WHY / REASONING`
  - `KEEP SHORT / CONCISE`
  - `NO TESTS / SKIP TESTS`
  - `GO! / PROCEED` (Auto-executes with Enter)
- **Design:** Removed corner reticle brackets; replaced with clean edge-to-edge rounded frames (`rx="24"`). Subtitles (`SKIP TESTS`, `CRITICAL`, etc.) enlarged to 16–18px ultra-bold for long-distance legibility.

### C. Multi-Session Manager (Page 1 - Key 4)
- Live session drawer tracking active/past Muse Code sessions categorized by day (`TODAY` / `YESTERDAY`), timestamp (`17:07`), and project directory/branch name.
- Tapping a session card brings its respective Terminal.app window directly to the front (`bringTerminalToFront`).
- Main key typography enlarged (`SESSIONS` 19px, `13 OPEN` 16px) with corner brackets removed.

### D. AI Credits & Telemetry HUD (Page 1 - Key 9, Replaced Legacy Reset)
- Relocated to Page 1 middle-right.
- High-visibility 28px neon balance display (`$149.97`), cyan `CREDITS` header, and `LIVE STATS ↗` action badge.
- Tapping opens the Telemetry Submenu displaying input/output tokens, cache hit rates, model version, and cost breakdowns.

### E. Struct Prompt & Voice Input
- `STRUCT PROMPT`: Converts rough user requests into structured engineering specs & execution plans; styled with clean border and high-legibility fonts.
- `VOICE INPUT`: Integrates with Muse Code CLI's native `⌥ + V` dictation shortcut with visual recording state indicator.

---

## 3. Page 1 Matrix Layout & Status

| Column / Row | Col 0 | Col 1 | Col 2 | Col 3 | Col 4 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Row 0** | **`READY / APPROVAL`** *(Done)* | **`VOICE`** *(Done)* | **`SNIPPETS`** *(Done)* | **`STRUCT PROMPT`** *(Done)* | **`SESSIONS`** *(Done)* |
| **Row 1** | **`SCREENSHOT`** *(Done)* | ⏳ **`SPARK`** *(Tomorrow)* | ⏳ **`RUN`** *(Tomorrow)* | **`HALT`** *(Done)* | **`AI CREDITS HUD`** *(Done)* |
| **Row 2** | ⏳ **`PROMPT`** *(Tomorrow)* | ⏳ **`TESTS`** *(Tomorrow)* | ⏳ **`FIX BUG`** *(Tomorrow)* | ⏳ **`COMMIT`** *(Tomorrow)* | **`PAGE NAV (1 ➔ 2)`** *(Done)* |

---

## 4. Next Step Plan (Finishing Page 1 Tomorrow)

1. **`SPARK` Key:**
   - Multi-modal image/screenshot-to-code generation.
   - Interactive screen snip via SAM 3.1 directly piped to Muse Spark model with instant prompt intake.
2. **`RUN` Key:**
   - One-touch execution trigger for pending prompt intake in terminal with kinetic wave sync.
3. **Bottom-Row Workflow Accelerators:**
   - **`PROMPT`:** Structured task input modal.
   - **`TESTS`:** One-touch test suite runner and failure analysis trigger.
   - **`FIX BUG`:** Contextual diagnostic and automated remediation prompt.
   - **`COMMIT`:** Git diff inspection and conventional commit generator.
4. **Master README Update:**
   - Consolidate all architectural blueprints, key mappings, and media captures into the root `README.md`.
