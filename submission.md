# Meta Global AI Developer Hackathon — Submission Guide & Draft

> **Event**: Meta Global AI Developer Hackathon (Oct 26 – Nov 4, 2026)  
> **Submission Deadline**: Wednesday, November 4 at 9:00 PM EST  
> **Submission Portal**: [Cerebral Valley Submission Page](https://cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit)  
> **Status**: In Progress (Draft — Continuously Updated)

---

## 1. General Project & Track Information

* **Project Name**: MuseDeck
* **Team Name**: MuseDeck
* **Team Members**: Mehmet Akif Acar (`Akifin`) — Solo Entry
* **Track**: **Indie Developer Track**
* **Problem Statement**: **Build for Your World**
  * *Why*: Solves the real-world friction of autonomous agentic coding (context switching, review anxiety, multimodal screenshot workflows) by embedding Meta's AI models into a tactile desktop physical console (Elgato Stream Deck MK.2).
* **Public GitHub Repository**: `https://github.com/memetcircus/musedeck`
* **3-Minute Demo Video**: *(To be recorded & inserted: YouTube link)*
* **X / Social Post (Most Viral Track)**: *(Optional link to launch post / video)*

---

## 2. Official Form Fields & Answers (Ready to Copy-Paste)

### Field 1: Project Description
> **Prompt**: *Describe your project and what problem it solves...*

```text
MuseDeck transforms the Meta Muse Code ecosystem into a dedicated, physical mission control console using the Elgato Stream Deck MK.2. 

When building with autonomous coding agents, developers face significant cognitive overhead: constantly alt-tabbing between code editors, terminals, and browsers; risking unexpected code changes without clear visibility; and awkwardly capturing visual bugs. 

MuseDeck replaces this friction with physical, tactile controls:
- Real-time 5x3 dynamic visual telemetry: A live 15-key matrix displaying agent state (Idle, Planning, Waiting Approval, Executing) with animated Quantum Beam matrix pulses during active synthesis.
- Physical Human-in-the-Loop (HITL) Review Gate: When review is needed, the status key flashes amber/red. Tapping it automatically surfaces the exact Muse Code terminal to the foreground and opens a tactile Review Submenu ([↑ BACK], [APPROVE (Y)], [REJECT (N)]).
- One-touch Multimodal Input: Native Option+V Voice Transcribe streaming, interactive SAM 3.1 UI screenshot segmentation that pastes coordinates directly at the terminal cursor, and automated React/Tailwind code synthesis via Muse Spark.
- Prompt Engineering Cockpit: Instant prompt restructuring (Struct Prompt -> Requirements, Technical Design, Task Breakdown, Review Gate) and prompt qualifier snippets (Be Honest, Don't Code, Keep Short, Show Opts, Go!).
```

---

### Field 2: Describe your use of Meta products to build the submitted project
> **Prompt**: *Describe your use of Meta products to build the submitted project*

```text
We deeply integrated the full spectrum of Meta's AI developer technologies:

1. Meta Muse Code CLI (v1.4.14+):
   Acts as the central agentic engine. MuseDeck monitors its terminal process lifecycle, reads real-time thinking states, orchestrates keystroke injection via a native macOS helper, and visualizes multi-step reasoning across physical LCD keys.

2. Meta Muse Voice Transcribe:
   Integrated with Stream Deck's dedicated VOICE key to stream hardware-toggled Option+V microphone audio directly into the Muse CLI session for zero-typing developer steering.

3. SAM 3.1 (Segment Anything Model 3.1 via Meta Model API):
   Powers the physical SCREENSHOT key. Automatically takes desktop captures, performs UI component segmentation, and inputs clean visual coordinates into the Muse Code prompt line without erasing the user's cursor position.

4. Meta Muse Spark Series (Multimodal Image-to-Code):
   Drives the SPARK key. Transforms captured UI regions and mocks directly into clean React and Tailwind CSS frontend implementations.

5. Meta Files API & Multimodal Video Analysis:
   Enables Page 2's visual bug diagnostics, recording desktop workflows to automatically detect UI defects and synthesize regression patches.
```

---

### Field 3: Why are Meta's models important to your solution?
> **Prompt**: *Why are Meta's models important to your solution?*

```text
Meta's open-weights and multimodal ecosystem (Muse Spark, SAM 3.1, Muse Code) is the only stack that unites visual spatial understanding, audio transcription, and autonomous code generation with fast, accessible inference. 

By pairing Meta's multimodal reasoning with a low-latency physical hardware surface, developers gain immediate tactile confidence over autonomous AI coding. It eliminates the "black box" nature of AI agents, making agentic development transparent, verifiable, and lightning fast.
```

---

### Field 4: Provide feedback from your experience using Meta products
> **Prompt**: *Provide feedback from your experience using Meta products*

```text
Working with the Muse Code CLI and Meta Model APIs has been exceptional:
- Muse Code's terminal UX and built-in voice trigger (Option+V) are industry-leading for speed.
- SAM 3.1's boundary segmentation accuracy made visual UI-to-code dramatically cleaner than raw full-screen screenshots.
- Suggestion: Expanding the Meta Model API with webhooks for streaming agent thought milestones (planning -> reasoning -> tool call) would allow even deeper hardware and IDE integrations.
```

---

### Field 5: Provide feedback from your experience using partner technologies (Baseten, Modal, Fireworks)
> **Prompt**: *Provide feedback from your experience using partner technologies.*

```text
We leveraged Baseten and Modal endpoints for running Muse Spark Open with ultra-low latency inference:
- Baseten provided seamless chat completions and vision inference with robust rate limits.
- Modal's serverless GPU sandboxes allowed rapid batch testing of model reasoning loops without cold-start penalties.
```

---

## 3. Physical Stream Deck Architecture (MK.2 Layout)

### Page 1: Core Mission Control & Rapid Prompting
* `(0, 0)`: **STATUS BADGE / REVIEW GATE** — Shows `READY`, `RUNNING`, `ERROR`. Flashes `REVIEW / APPROVAL` on review gates. Tapping it brings the Muse Code terminal to the front and opens the Review Submenu.
* `(1, 0)`: **VOICE INPUT** — Sends physical `Option + V` to toggle native Muse Voice Transcribe.
* `(2, 0)`: **SNIPPETS SUBMENU** — Opens prompt modifier drawer (`Be Honest`, `Don't Code`, `Show Opts`, `Explain Why`, `Keep Short`, `No Tests`, `Go!`).
* `(3, 0)`: **STRUCT PROMPT** — Generates formal spec & execution plan (Spec -> Architecture -> Tasks -> Review) into Muse Code.
* `(4, 0)`: Reserved / Clean Slate Tile.
* `(0, 1)`: **SCREENSHOT (SAM 3.1)** — Interactive snip tool, segments UI element and pastes clean path into terminal.
* `(1, 1)`: **SPARK (IMG-TO-CODE)** — Multimodal UI synthesis with latest screenshot.
* `(2, 1)`: **RUN MUSE** — Sends run command / Enter to active Muse terminal.
* `(3, 1)`: **HALT (ESC / Ctrl+C)** — Emergency physical interrupt, always visible.
* `(4, 1)`: **RESET AGENT** — Cleans media cache and resets agent state to Idle.
* `(0, 2)`: **PROMPT TASK** — Fast task entry.
* `(1, 2)`: **WRITE TESTS** — Automated test suite generation.
* `(2, 2)`: **FIX BUG** — Targeted bug fixing prompt.
* `(3, 2)`: **COMMIT & PR** — Automated commit and pull request creation.
* `(4, 2)`: **PAGE 2 NAVIGATION** — Flips to Advanced Tools & Telemetry.

### Submenus:
1. **Review Submenu**:
   * `(0, 0)`: `[↑ BACK]`
   * `(1, 0)`: `[APPROVE (Y)]` — Sends `y` + Enter to active Muse session.
   * `(2, 0)`: `[REJECT (N)]` — Sends `n` + Enter to active Muse session.
2. **Snippets Submenu**:
   * `(0, 0)`: `[↑ BACK]`
   * `Row 0-1`: Prompt qualifiers (modifiers) that paste at cursor without Enter, plus `GO!` which types `"Go!"` and presses Enter.

---

## 4. 3-Minute Demo Video Script Outline (Winning Structure)

* **0:00 - 0:35: The Problem & The Vision**
  * Show developer working with AI agents in terminal: multiple windows, context switching, waiting for reviews, typing long repetitive prompts.
  * Introduce **MuseDeck**: Physical Mission Control for Meta Muse Code.
* **0:35 - 1:15: Core Flow & Telemetry**
  * Tapping `STRUCT PROMPT` -> Muse Code instantly receives a structured specification request.
  * Stream Deck switches into the 5x3 Meta Quantum Beam matrix animation while Muse Code thinks.
* **1:15 - 1:55: Physical HITL Review Gate**
  * Muse Code asks for approval on generated code diff.
  * Status key at (0,0) pulses amber/red with `REVIEW / APPROVAL`.
  * Developer taps the key -> Muse Code terminal immediately jumps to front, and Stream Deck shows `[APPROVE]` / `[REJECT]`.
  * Developer presses physical `[APPROVE]` button -> Agent resumes.
* **1:55 - 2:35: Multimodal & Voice Mastery**
  * Tap `VOICE` -> Option+V triggers real-time voice streaming into Muse.
  * Tap `SCREENSHOT` -> Snip UI button on screen, SAM 3.1 crops and inputs path into terminal prompt.
  * Tap `SPARK` -> Muse Spark generates React code from screenshot.
* **2:35 - 3:00: Impact & Conclusion**
  * Summary: zero distraction, verified physical human-in-the-loop, full Meta stack integration.
  * Closing callout: Built for the Meta Global AI Developer Hackathon.
