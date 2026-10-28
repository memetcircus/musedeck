import { telemetrySubmenuManager } from "../ui/telemetry-submenu.js";
import {
  action,
  SingletonAction,
  type KeyDownEvent,
  type WillAppearEvent,
  type WillDisappearEvent,
  type KeyAction,
} from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";
import { exec } from "node:child_process";
import { AgentState, type TelemetryData } from "../../../agent/types.js";
import { TerminalAutomation } from "../../../agent/terminal-automation.js";
import type { StreamDeckCoreBridge } from "../core-bridge.js";
import { SvgKeyRenderer } from "../ui/svg-renderer.js";
import { keyRegistry } from "../ui/key-registry.js";
import { museBeamAnimator } from "../ui/muse-beam-animator.js";

// Global Thinking Listener across Stream Deck
let isThinkingListenerAttached = false;
function checkSubmenuKeyDown(ev: any): boolean {
  if (telemetrySubmenuManager.isActive) {
    const payload = ev.payload as any;
    const col = payload?.coordinates?.column ?? 0;
    const row = payload?.coordinates?.row ?? 0;
    return telemetrySubmenuManager.handleKeyDown(col, row);
  }
  return false;
}

function attachGlobalThinkingListener(bridge: StreamDeckCoreBridge): void {
  if (isThinkingListenerAttached) return;
  isThinkingListenerAttached = true;

  bridge.onTelemetry((telemetry) => {
    if (telemetrySubmenuManager.isActive) {
      telemetrySubmenuManager.render(telemetry);
    }
    const isThinking = telemetry.state === AgentState.PLANNING || telemetry.state === AgentState.EXECUTING;
    if (isThinking && !museBeamAnimator.isRunning) {
      console.log("🌊 [StreamDeck] Meta Muse Code Thinking -> Starting 5x3 Quantum Beam Matrix Animation");
      museBeamAnimator.start();
    } else if (!isThinking && museBeamAnimator.isRunning) {
      console.log("✨ [StreamDeck] Meta Muse Code Finished -> Restoring key grid");
      museBeamAnimator.stop();
    }
  });
}

function registerDeckKey(
  ev: WillAppearEvent,
  restore: () => void,
  excludeFromAnimation = false,
  fallbackCol = 0,
  fallbackRow = 0
): void {
  if (!ev.action.isKey()) return;
  const payload = ev.payload as any;
  const col = payload?.coordinates?.column ?? fallbackCol;
  const row = payload?.coordinates?.row ?? fallbackRow;

  keyRegistry.add(ev.action.id, {
    action: ev.action,
    column: col,
    row: row,
    excludeFromAnimation,
    restore,
  });

  if (!museBeamAnimator.isRunning || excludeFromAnimation) {
    restore();
  }
}

function unregisterDeckKey(ev: WillDisappearEvent): void {
  keyRegistry.remove(ev.action.id);
  if (telemetrySubmenuManager.isActive) {
    console.log("⚠️ [Submenu] Key disappearing while submenu active -> force-closing submenu to prevent stuck state");
    telemetrySubmenuManager.forceClose();
  }
}

// --- KEY 0: AGENT STATUS BADGE ---
@action({ UUID: "com.memetcircus.musedeck.status" })
export class AgentStatusAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();

  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
    this.bridge.onTelemetry((telemetry) => {
      const img = SvgKeyRenderer.renderStatusKey(telemetry);
      for (const key of this.activeKeys) {
        void key.setImage(img);
        void key.setTitle("");
      }
    });
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderStatusKey(this.bridge.getTelemetry()));
          void ev.action.setTitle("");
        },
        true, // Exclude from thinking wave animation so status icon is always visible
        0,
        0
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
    for (const key of this.activeKeys) {
      if (key.id === ev.action.id) this.activeKeys.delete(key);
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    const current = this.bridge.getTelemetry();
    const cycle = [
      AgentState.IDLE,
      AgentState.PLANNING,
      AgentState.EXECUTING,
      AgentState.WAITING_APPROVAL,
      AgentState.ERROR,
    ];
    const currentIndex = cycle.indexOf(current.state);
    const nextState = cycle[(currentIndex + 1) % cycle.length];
    console.log(`[StatusKey] Cycling agent state: ${current.state} -> ${nextState}`);
    this.bridge.setState(nextState);
  }
}

// --- KEY 1: ACTIVE TASK / TELEMETRY ---
@action({ UUID: "com.memetcircus.musedeck.task" })
export class ActiveTaskAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();

  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
    this.bridge.onTelemetry((telemetry) => {
      const img = SvgKeyRenderer.renderTaskKey(telemetry.activeStep);
      for (const key of this.activeKeys) {
        if (!museBeamAnimator.isRunning) {
          void key.setImage(img);
        }
      }
    });
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          const tel = this.bridge.getTelemetry();
          void ev.action.setImage(SvgKeyRenderer.renderTaskKey(tel.activeStep));
        },
        false,
        1,
        0
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
    for (const key of this.activeKeys) {
      if (key.id === ev.action.id) this.activeKeys.delete(key);
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    console.log("Current Task:", this.bridge.getTelemetry().activeTask);
  }
}

// --- KEY 2: DIFF SUMMARY KEY ---
@action({ UUID: "com.memetcircus.musedeck.diff" })
export class DiffSummaryAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();

  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
    this.bridge.onTelemetry((telemetry) => {
      const img = SvgKeyRenderer.renderDiffKey(telemetry);
      for (const key of this.activeKeys) {
        if (!museBeamAnimator.isRunning) {
          void key.setImage(img);
        }
      }
    });
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderDiffKey(this.bridge.getTelemetry()));
        },
        false,
        2,
        0
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
    for (const key of this.activeKeys) {
      if (key.id === ev.action.id) this.activeKeys.delete(key);
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    exec("open http://localhost:3456/api/diff");
  }
}

// --- KEY 3: APPROVE KEY (HITL GATE) ---
@action({ UUID: "com.memetcircus.musedeck.approve" })
export class ApproveAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();

  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
    this.bridge.onTelemetry((telemetry) => {
      const isAwaiting = telemetry.state === AgentState.WAITING_APPROVAL;
      const img = SvgKeyRenderer.renderApproveKey(isAwaiting);
      for (const key of this.activeKeys) {
        if (!museBeamAnimator.isRunning) {
          void key.setImage(img);
        }
      }
    });
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          const isAwaiting = this.bridge.getTelemetry().state === AgentState.WAITING_APPROVAL;
          void ev.action.setImage(SvgKeyRenderer.renderApproveKey(isAwaiting));
        },
        false,
        3,
        0
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
    for (const key of this.activeKeys) {
      if (key.id === ev.action.id) this.activeKeys.delete(key);
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    await TerminalAutomation.sendApprovalKeystroke("y");
    await this.bridge.approve();
  }
}

// --- KEY 4: REJECT KEY (HITL GATE) ---
@action({ UUID: "com.memetcircus.musedeck.reject" })
export class RejectAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();

  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
    this.bridge.onTelemetry((telemetry) => {
      const isAwaiting = telemetry.state === AgentState.WAITING_APPROVAL;
      const img = SvgKeyRenderer.renderRejectKey(isAwaiting);
      for (const key of this.activeKeys) {
        if (!museBeamAnimator.isRunning) {
          void key.setImage(img);
        }
      }
    });
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          const isAwaiting = this.bridge.getTelemetry().state === AgentState.WAITING_APPROVAL;
          void ev.action.setImage(SvgKeyRenderer.renderRejectKey(isAwaiting));
        },
        false,
        4,
        0
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
    for (const key of this.activeKeys) {
      if (key.id === ev.action.id) this.activeKeys.delete(key);
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    await TerminalAutomation.sendApprovalKeystroke("n");
    await this.bridge.reject();
  }
}

// --- KEY 5: SAM 3.1 SNIP KEY ---
@action({ UUID: "com.memetcircus.musedeck.sam-snip" })
export class SamSnipAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();

  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
    this.bridge.onTelemetry(() => {
      const img = SvgKeyRenderer.renderSamSnipKey("idle");
      for (const key of this.activeKeys) {
        if (!museBeamAnimator.isRunning) {
          void key.setImage(img);
        }
      }
    });
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderSamSnipKey("idle"));
        },
        false,
        0,
        1
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
    for (const key of this.activeKeys) {
      if (key.id === ev.action.id) this.activeKeys.delete(key);
    }
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(ev)) return;
    try {
      if (ev.action.isKey()) {
        await ev.action.setImage(SvgKeyRenderer.renderSamSnipKey("snipping"));
      }

      const result = await this.bridge.snip();

      if (result && result.ok) {
        if (ev.action.isKey()) {
          await ev.action.setImage(SvgKeyRenderer.renderSamSnipKey("copied"));
        }
        await new Promise((r) => setTimeout(r, 2600));
      }
    } catch (err: any) {
      console.error("SAM snip error:", err);
    } finally {
      if (ev.action.isKey()) {
        await ev.action.setImage(SvgKeyRenderer.renderSamSnipKey("idle"));
      }
    }
  }
}

// --- KEY 6: MUSE SPARK IMAGE-TO-CODE KEY ---
@action({ UUID: "com.memetcircus.musedeck.spark-code" })
export class SparkCodeAction extends SingletonAction {
  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderSparkKey());
        },
        false,
        1,
        1
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(ev)) return;
    try {
      if (ev.action.isKey()) {
        await ev.action.setImage(SvgKeyRenderer.renderGenericActionKey("SPARK...", "", "✨", "#c084fc"));
      }
      await this.bridge.spark();
    } catch (err: any) {
      console.error("Spark synthesis error:", err);
    } finally {
      if (ev.action.isKey()) {
        await ev.action.setImage(SvgKeyRenderer.renderSparkKey());
      }
    }
  }
}

// --- KEY 7: RUN MUSE KEY ---
@action({ UUID: "com.memetcircus.musedeck.run-muse" })
export class RunMuseAction extends SingletonAction {
  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderRunMuseKey());
        },
        false,
        2,
        1
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    await TerminalAutomation.launchMuseCodeTerminal(process.cwd());
    await this.bridge.runTask("Optimize performance and add comprehensive test suite for agent state machine");
  }
}

// --- KEY 8: HALT / CANCEL KEY (EXCLUDED FROM ANIMATION) ---
@action({ UUID: "com.memetcircus.musedeck.halt" })
export class HaltAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();

  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
    this.bridge.onTelemetry((telemetry) => {
      const isThinking = telemetry.state === AgentState.PLANNING || telemetry.state === AgentState.EXECUTING;
      const img = SvgKeyRenderer.renderHaltKey(isThinking);
      for (const key of this.activeKeys) {
        void key.setImage(img);
      }
    });
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          const isThinking = this.bridge.getTelemetry().state === AgentState.PLANNING || this.bridge.getTelemetry().state === AgentState.EXECUTING;
          void ev.action.setImage(SvgKeyRenderer.renderHaltKey(isThinking));
        },
        true, // ALWAYS EXCLUDE from animation so developer can emergency stop anytime!
        3,
        1
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
    for (const key of this.activeKeys) {
      if (key.id === ev.action.id) this.activeKeys.delete(key);
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    await TerminalAutomation.sendInterruptEscape();
    await this.bridge.halt();
  }
}

// --- KEY 9: RESET KEY ---
@action({ UUID: "com.memetcircus.musedeck.reset" })
export class ResetAction extends SingletonAction {
  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderResetKey());
        },
        false,
        4,
        1
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    await this.bridge.reset();
  }
}

// --- KEY 10: QUICK PROMPT PRESET ---
@action({ UUID: "com.memetcircus.musedeck.prompt-task" })
export class PromptTaskAction extends SingletonAction {
  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderPromptKey());
        },
        false,
        0,
        2
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    await TerminalAutomation.launchMuseCodeTerminal(process.cwd(), "Refactor agent communication bridge to use zero-copy buffers");
  }
}

// --- KEY 11: WRITE TESTS ---
@action({ UUID: "com.memetcircus.musedeck.write-tests" })
export class WriteTestsAction extends SingletonAction {
  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderTestsKey());
        },
        false,
        1,
        2
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    await TerminalAutomation.launchMuseCodeTerminal(process.cwd(), "Generate complete unit tests for all state machine transitions");
  }
}

// --- KEY 12: FIX BUG / AUTO-DEBUG ---
@action({ UUID: "com.memetcircus.musedeck.fix-bug" })
export class FixBugAction extends SingletonAction {
  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderFixBugKey());
        },
        false,
        2,
        2
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    await TerminalAutomation.launchMuseCodeTerminal(process.cwd(), "Analyze recent runtime errors and generate automated patch");
  }
}

// --- KEY 13: COMMIT & PR ---
@action({ UUID: "com.memetcircus.musedeck.commit-pr" })
export class CommitPrAction extends SingletonAction {
  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderCommitKey());
        },
        false,
        3,
        2
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    await TerminalAutomation.launchMuseCodeTerminal(process.cwd(), "Stage all verified changes, create a git commit, and generate a pull request summary");
  }
}

// --- KEY 14 (PAGE 1): NAVIGATION TO PAGE 2 ---
@action({ UUID: "com.memetcircus.musedeck.page-next" })
export class PageNextAction extends SingletonAction {
  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      if (this.bridge) attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderNextPageKey());
          void ev.action.setTitle("");
        },
        false,
        4,
        2
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(ev)) return;
    const deviceId = ev.action.device.id;
    console.log(`[PageNext] Switching to Page 2 on device ${deviceId}...`);
    try {
      await streamDeck.profiles.switchToProfile(deviceId, "MuseDeck", 1);
    } catch (e: any) {
      console.warn("[PageNext] switchToProfile with name failed:", e?.message);
    }
  }
}

// --- KEY 14 (LEGACY COMPANION): REPLACED CONSOLE KEY WITH PAGE 2 NAVIGATION ---
@action({ UUID: "com.memetcircus.musedeck.web-console" })
export class WebConsoleAction extends SingletonAction {
  constructor() {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderNextPageKey());
          void ev.action.setTitle("");
        },
        false,
        4,
        2
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(ev)) return;
    const deviceId = ev.action.device.id;
    console.log(`[WebConsole/PageNext] Switching to Page 2 on device ${deviceId}...`);
    try {
      await streamDeck.profiles.switchToProfile(deviceId, "MuseDeck", 1);
    } catch (e: any) {
      console.warn("[WebConsole/PageNext] switchToProfile with name failed:", e?.message);
    }
    try {
      await streamDeck.profiles.switchToProfile(deviceId, undefined, 1);
    } catch (e: any) {
      console.warn("[WebConsole/PageNext] switchToProfile without name failed:", e?.message);
    }
  }
}

// =====================================================================
// ==================== PAGE 2 DEDICATED ACTIONS =======================
// =====================================================================

// --- PAGE 2 KEY 0: RECORD TO FIX ---
@action({ UUID: "com.memetcircus.musedeck.record-to-fix" })
export class RecordToFixAction extends SingletonAction {
  private isRecording = false;

  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderRecordToFixKey(this.isRecording));
          void ev.action.setTitle("");
        },
        false,
        0,
        0
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(ev)) return;
    this.isRecording = !this.isRecording;
    if (ev.action.isKey()) {
      await ev.action.setImage(SvgKeyRenderer.renderRecordToFixKey(this.isRecording));
    }

    if (!this.isRecording) {
      console.log("🎬 [Page 2] REC TO FIX triggered");
      await TerminalAutomation.launchMuseCodeTerminal(
        process.cwd(),
        "Diagnose and fix the frontend bug from recent screen+audio recording (Meta Responses + Files API)"
      );
    }
  }
}

// --- PAGE 2 KEY 1: VIDEO TO CODE ---
@action({ UUID: "com.memetcircus.musedeck.vid-to-code" })
export class VidToCodeAction extends SingletonAction {
  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderVidToCodeKey());
          void ev.action.setTitle("");
        },
        false,
        1,
        0
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    console.log("🎥 [Page 2] VID-TO-CODE triggered");
    await TerminalAutomation.launchMuseCodeTerminal(
      process.cwd(),
      "Convert latest multimodal video recording into a complete React Tailwind component using Meta Files API"
    );
  }
}

// --- PAGE 2 KEY 2: UPLOAD FILE ---
@action({ UUID: "com.memetcircus.musedeck.upload-file" })
export class UploadFileAction extends SingletonAction {
  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderUploadFileKey());
          void ev.action.setTitle("");
        },
        false,
        2,
        0
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    console.log("☁️ [Page 2] UPLOAD FILE triggered");
    await TerminalAutomation.launchMuseCodeTerminal(
      process.cwd(),
      "Upload media assets to Meta Files API, retrieve file_id, and attach to current coding context"
    );
  }
}

// --- PAGE 2 KEY 3: AUDIO TRANSCRIPTION ---
@action({ UUID: "com.memetcircus.musedeck.audio-trans" })
export class AudioTransAction extends SingletonAction {
  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderAudioTransKey());
          void ev.action.setTitle("");
        },
        false,
        3,
        0
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    console.log("🎙️ [Page 2] AUDIO TRANS triggered");
    await TerminalAutomation.launchMuseCodeTerminal(
      process.cwd(),
      "Transcribe latest audio recording and convert speech instructions into formal product specifications"
    );
  }
}

// --- PAGE 2 KEY 4: RE-INSPECT DIFF ---
@action({ UUID: "com.memetcircus.musedeck.re-inspect" })
export class ReInspectAction extends SingletonAction {
  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderReInspectKey());
          void ev.action.setTitle("");
        },
        false,
        4,
        0
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    console.log("🔍 [Page 2] RE-INSPECT triggered");
    exec("open http://localhost:3456/api/diff");
  }
}

// --- PAGE 2 KEY 5: PHONE RECORDING ---
@action({ UUID: "com.memetcircus.musedeck.phone-rec" })
export class PhoneRecAction extends SingletonAction {
  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderPhoneRecKey());
          void ev.action.setTitle("");
        },
        false,
        0,
        1
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    console.log("📱 [Page 2] PHONE REC triggered");
    await TerminalAutomation.launchMuseCodeTerminal(
      process.cwd(),
      "Inspect mobile viewport recording and fix responsive design bugs"
    );
  }
}

// --- PAGE 2 KEY 6: STYLE TRANSFER ---
@action({ UUID: "com.memetcircus.musedeck.style-trans" })
export class StyleTransAction extends SingletonAction {
  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderStyleTransKey());
          void ev.action.setTitle("");
        },
        false,
        1,
        1
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    console.log("🎨 [Page 2] STYLE TRANS triggered");
    await TerminalAutomation.launchMuseCodeTerminal(
      process.cwd(),
      "Perform UI style transfer and modernize theme aesthetic using Tailwind CSS"
    );
  }
}

// --- PAGE 2 KEY 7: WORKSPACE TREE ---
@action({ UUID: "com.memetcircus.musedeck.workspace" })
export class WorkspaceAction extends SingletonAction {
  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderWorkspaceKey());
          void ev.action.setTitle("");
        },
        false,
        2,
        1
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    console.log("🌳 [Page 2] WORKSPACE triggered");
    await TerminalAutomation.launchMuseCodeTerminal(
      process.cwd(),
      "Analyze workspace directory tree and dependency graph"
    );
  }
}

// --- PAGE 2 KEY 8: TERMINAL LOG ---
@action({ UUID: "com.memetcircus.musedeck.terminal-log" })
export class TerminalLogAction extends SingletonAction {
  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderTerminalLogKey());
          void ev.action.setTitle("");
        },
        false,
        3,
        1
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    console.log("💻 [Page 2] TERMINAL LOG triggered");
    await TerminalAutomation.bringTerminalToFront();
  }
}

// --- PAGE 2 KEY 9: REWIND WORK ---
@action({ UUID: "com.memetcircus.musedeck.rewind-work" })
export class RewindWorkAction extends SingletonAction {
  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderRewindWorkKey());
          void ev.action.setTitle("");
        },
        false,
        4,
        1
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    console.log("⏪ [Page 2] REWIND WORK triggered");
    await TerminalAutomation.launchMuseCodeTerminal(
      process.cwd(),
      "git status && git diff --stat"
    );
  }
}

// --- PAGE 2 KEY 10: CLEAR MEDIA ---
@action({ UUID: "com.memetcircus.musedeck.clear-media" })
export class ClearMediaAction extends SingletonAction {
  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderClearMediaKey());
          void ev.action.setTitle("");
        },
        false,
        0,
        2
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    console.log("🧹 [Page 2] CLEAR MEDIA triggered");
    exec("rm -rf /tmp/musedeck/*");
  }
}

// --- PAGE 2 KEY 11: API STATUS (AI Credits & Session HUD) ---
@action({ UUID: "com.memetcircus.musedeck.api-status" })
export class ApiStatusAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();

  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
    if (this.bridge) {
      this.bridge.onTelemetry((telemetry) => {
        const usage = telemetry.apiUsage;
        const img = SvgKeyRenderer.renderApiStatusKey(usage?.creditsRemaining ?? "$149.97");
        for (const key of this.activeKeys) {
          if (!museBeamAnimator.isRunning && !telemetrySubmenuManager.isActive) {
            void key.setImage(img);
            void key.setTitle("");
          }
        }
      });
    }
  }

  private renderKeyImage(key: KeyAction): void {
    const usage = this.bridge?.getTelemetry()?.apiUsage;
    const img = SvgKeyRenderer.renderApiStatusKey(usage?.creditsRemaining ?? "$149.97");
    void key.setImage(img);
    void key.setTitle("");
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      registerDeckKey(
        ev,
        () => {
          this.renderKeyImage(ev.action as KeyAction);
        },
        false,
        1,
        2
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
    for (const key of this.activeKeys) {
      if (key.id === ev.action.id) this.activeKeys.delete(key);
    }
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(ev)) return;
    if (telemetrySubmenuManager.isActive) {
      telemetrySubmenuManager.close();
      return;
    }
    telemetrySubmenuManager.open(this.bridge?.getTelemetry());
  }
}

// --- PAGE 2 KEY 12: SPARK CHAT ---
@action({ UUID: "com.memetcircus.musedeck.spark-chat" })
export class SparkChatAction extends SingletonAction {
  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderSparkChatKey());
          void ev.action.setTitle("");
        },
        false,
        2,
        2
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    console.log("✨ [Page 2] SPARK CHAT triggered");
    await TerminalAutomation.launchMuseCodeTerminal(
      process.cwd(),
      "Start interactive creative coding session with Meta Muse Spark"
    );
  }
}

// --- PAGE 2 KEY 13: OPEN WORK ---
@action({ UUID: "com.memetcircus.musedeck.open-work" })
export class OpenWorkAction extends SingletonAction {
  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderOpenWorkKey());
          void ev.action.setTitle("");
        },
        false,
        3,
        2
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    console.log("📂 [Page 2] OPEN WORK triggered");
    exec("open .");
  }
}

// --- PAGE 2 KEY 14: NAVIGATION BACK TO PAGE 1 ---
@action({ UUID: "com.memetcircus.musedeck.page-prev" })
export class PagePrevAction extends SingletonAction {
  constructor() {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderPrevPageKey());
          void ev.action.setTitle("");
        },
        false,
        4,
        2
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    unregisterDeckKey(ev);
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(ev)) return;
    const deviceId = ev.action.device.id;
    console.log(`[PagePrev] Switching back to Page 1 (page 0 index) on device ${deviceId}...`);
    try {
      await streamDeck.profiles.switchToProfile(deviceId, "MuseDeck", 0);
    } catch (e: any) {
      console.warn("[PagePrev] switchToProfile with name failed:", e?.message);
    }
  }
}
