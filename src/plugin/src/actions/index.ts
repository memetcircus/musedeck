import { telemetrySubmenuManager } from "../ui/telemetry-submenu.js";
import { snippetsSubmenuManager } from "../ui/snippets-submenu.js";
import { reviewSubmenuManager } from "../ui/review-submenu.js";
import { sessionsSubmenuManager } from "../ui/sessions-submenu.js";
import { imgToCodeSubmenuManager } from "../ui/img-to-code-submenu.js";
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

export function isAnySubmenuActive(): boolean {
  return (
    snippetsSubmenuManager.isActive ||
    reviewSubmenuManager.isActive ||
    sessionsSubmenuManager.isActive ||
    telemetrySubmenuManager.isActive ||
    imgToCodeSubmenuManager.isActive
  );
}

function checkSubmenuKeyDown(ev: any): boolean {
  const payload = ev.payload as any;
  const col = payload?.coordinates?.column ?? 0;
  const row = payload?.coordinates?.row ?? 0;

  if (snippetsSubmenuManager.isActive) {
    void snippetsSubmenuManager.handleKeyDown(col, row);
    return true;
  }

  if (imgToCodeSubmenuManager.isActive) {
    void imgToCodeSubmenuManager.handleKeyDown(col, row);
    return true;
  }

  if (reviewSubmenuManager.isActive) {
    void reviewSubmenuManager.handleKeyDown(col, row);
    return true;
  }

  if (sessionsSubmenuManager.isActive) {
    void sessionsSubmenuManager.handleKeyDown(col, row);
    return true;
  }

  if (telemetrySubmenuManager.isActive) {
    return telemetrySubmenuManager.handleKeyDown(col, row);
  }
  return false;
}

function attachGlobalThinkingListener(bridge: StreamDeckCoreBridge): void {
  if (isThinkingListenerAttached) return;
  isThinkingListenerAttached = true;

  bridge.onTelemetry((telemetry) => {
    // 1. AUTO-OPEN REVIEW SUBMENU ON APPROVAL WAIT!
    if (telemetry.state === AgentState.WAITING_APPROVAL) {
      if (museBeamAnimator.isRunning) {
        museBeamAnimator.stop();
      }
      if (!reviewSubmenuManager.isActive) {
        console.log("🚨 [Approval] WAITING_APPROVAL detected -> Automatically presenting 4-option HITL drawer!");
        reviewSubmenuManager.open();
      }
      return;
    }

    // 2. AUTO-CLOSE REVIEW SUBMENU WHEN RESOLVED
    if (reviewSubmenuManager.isActive) {
      console.log("🔙 [Approval] No longer waiting approval -> Closing review submenu");
      reviewSubmenuManager.close();
      return;
    }

    if (snippetsSubmenuManager.isActive) {
      return;
    }
    if (imgToCodeSubmenuManager.isActive) {
      return;
    }
    if (sessionsSubmenuManager.isActive) {
      void sessionsSubmenuManager.refreshSessions();
      return;
    }
    if (telemetrySubmenuManager.isActive) {
      telemetrySubmenuManager.render(telemetry);
      return;
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
  const col = ev.action.coordinates?.column ?? payload?.coordinates?.column ?? fallbackCol;
  const row = ev.action.coordinates?.row ?? payload?.coordinates?.row ?? fallbackRow;

  console.log(`[KeyRegistry] Registering action=${ev.action.manifestId} at col=${col}, row=${row}`);

  keyRegistry.add(ev.action.id, {
    action: ev.action,
    column: col,
    row: row,
    excludeFromAnimation,
    restore,
  });

  if (reviewSubmenuManager.isActive) {
    reviewSubmenuManager.render();
  } else if (snippetsSubmenuManager.isActive) {
    snippetsSubmenuManager.render();
  } else if (imgToCodeSubmenuManager.isActive) {
    imgToCodeSubmenuManager.render();
  } else if (telemetrySubmenuManager.isActive) {
    telemetrySubmenuManager.render();
  } else if (!museBeamAnimator.isRunning || excludeFromAnimation) {
    restore();
  }
}

function unregisterDeckKey(ev: WillDisappearEvent): void {
  keyRegistry.remove(ev.action.id);
  if (snippetsSubmenuManager.isActive) {
    snippetsSubmenuManager.forceClose();
  }
  if (imgToCodeSubmenuManager.isActive) {
    imgToCodeSubmenuManager.forceClose();
  }
  if (reviewSubmenuManager.isActive) {
    reviewSubmenuManager.forceClose();
  }
  if (sessionsSubmenuManager.isActive) {
    sessionsSubmenuManager.forceClose();
  }
  if (telemetrySubmenuManager.isActive) {
    console.log("⚠️ [Submenu] Key disappearing while submenu active -> force-closing submenu to prevent stuck state");
    telemetrySubmenuManager.forceClose();
  }
}

// --- KEY 0: AGENT STATUS BADGE ---
@action({ UUID: "com.memetcircus.musedeck.status" })
export class AgentStatusAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();
  private flashTimer: NodeJS.Timeout | null = null;
  private flashPhase = false;

  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
    reviewSubmenuManager.setBridge(this.bridge);
    this.bridge.onTelemetry((telemetry) => {
      if (telemetry.state === AgentState.WAITING_APPROVAL) {
        this.startFlashing();
      } else {
        this.stopFlashing();
      }

      if (isAnySubmenuActive()) return;
      const img = SvgKeyRenderer.renderStatusKey(telemetry);
      for (const key of this.activeKeys) {
        if (!museBeamAnimator.isRunning) {
          void key.setImage(img);
          void key.setTitle("");
        }
      }
    });
  }

  private startFlashing(): void {
    if (this.flashTimer) return;
    this.flashPhase = false;
    this.flashTimer = setInterval(() => {
      this.flashPhase = !this.flashPhase;
      if (isAnySubmenuActive()) return;
      const img = SvgKeyRenderer.renderFlashingApprovalKey(this.flashPhase);
      for (const key of this.activeKeys) {
        void key.setImage(img);
      }
    }, 400);
  }

  private stopFlashing(): void {
    if (this.flashTimer) {
      clearInterval(this.flashTimer);
      this.flashTimer = null;
    }
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          if (this.bridge.getTelemetry().state === AgentState.WAITING_APPROVAL) {
            void ev.action.setImage(SvgKeyRenderer.renderFlashingApprovalKey(this.flashPhase));
          } else {
            void ev.action.setImage(SvgKeyRenderer.renderStatusKey(this.bridge.getTelemetry()));
          }
          void ev.action.setTitle("");
        },
        false, // Include in thinking wave animation so whole board animates; only HALT stays visible
        0,
        0
      );
    }
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    this.stopFlashing();
    unregisterDeckKey(ev);
    for (const key of this.activeKeys) {
      if (key.id === ev.action.id) this.activeKeys.delete(key);
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    const current = this.bridge.getTelemetry();

    // If awaiting approval: specifically open Review / HITL Submenu without direct focus action
    if (current.state === AgentState.WAITING_APPROVAL) {
      console.log("[StatusKey] Awaiting approval -> Opening Review Submenu");
      reviewSubmenuManager.open();
    } else {
      // Normal states (READY, RUNNING, IDLE): Bring active Muse Terminal to front, or launch fresh session if none exists!
      console.log(`[StatusKey] Tapped (Current state: ${current.state}). Checking active Muse Terminal...`);
      const focused = await TerminalAutomation.bringTerminalToFront();
      if (!focused) {
        console.log(`[StatusKey] No active Muse terminal found -> Launching new Muse session in Terminal.app...`);
        await TerminalAutomation.launchMuseCodeTerminal(process.cwd());
      }
    }
  }
}

// --- KEY 1: VOICE INPUT (OPTION + V) ---
@action({ UUID: "com.memetcircus.musedeck.task" })
export class ActiveTaskAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();
  private isRecording = false;

  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderVoiceKey(this.isRecording));
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
    for (const key of this.activeKeys) {
      if (key.id === ev.action.id) this.activeKeys.delete(key);
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    this.isRecording = !this.isRecording;
    console.log(`🎙️ [Voice Key] Toggled voice input: ${this.isRecording ? "RECORDING (Option+V)" : "STOPPED"}`);

    const img = SvgKeyRenderer.renderVoiceKey(this.isRecording);
    for (const key of this.activeKeys) {
      void key.setImage(img);
    }

    await TerminalAutomation.sendVoiceToggleKeystroke();
  }
}

// --- KEY 2: SNIPPETS SUBMENU KEY ---
@action({ UUID: "com.memetcircus.musedeck.diff" })
export class DiffSummaryAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();

  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderSnippetsKey());
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
    for (const key of this.activeKeys) {
      if (key.id === ev.action.id) this.activeKeys.delete(key);
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    if (snippetsSubmenuManager.isActive) {
      snippetsSubmenuManager.close();
    } else {
      snippetsSubmenuManager.open();
    }
  }
}

// --- KEY 3: STRUCT PROMPT KEY (TRANSFORMS SPEC & EXECUTION PLAN) ---
@action({ UUID: "com.memetcircus.musedeck.approve" })
export class StructPromptAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();

  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      if (this.bridge) attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderStructPromptKey());
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
    for (const key of this.activeKeys) {
      if (key.id === ev.action.id) this.activeKeys.delete(key);
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    console.log("📐 [StructPrompt] Typing structured spec prompt into active Muse terminal...");
    const prompt = "Turn this into a structured spec. Create requirements first, then a technical design, then break it into tasks. Do not execute anything until I review and approve the plan.";
    await TerminalAutomation.typePromptIntoTerminal(prompt, true);
  }
}

// Backwards compatibility alias
export { StructPromptAction as ApproveAction };

// --- KEY 4: SESSIONS SUBMENU KEY (PAGE 1: COL 4, ROW 0) ---
@action({ UUID: "com.memetcircus.musedeck.reject" })
export class SessionsAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();

  constructor(private readonly bridge?: StreamDeckCoreBridge) {
    super();
    if (this.bridge) {
      this.bridge.onTelemetry(() => {
        if (isAnySubmenuActive()) return;
        const img = SvgKeyRenderer.renderSessionsPageKey(
          sessionsSubmenuManager.sessionCount || 1,
          sessionsSubmenuManager.hasThinkingSession
        );
        for (const key of this.activeKeys) {
          if (!museBeamAnimator.isRunning) {
            void key.setImage(img);
            void key.setTitle("");
          }
        }
      });
    }
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      if (this.bridge) attachGlobalThinkingListener(this.bridge);
      await sessionsSubmenuManager.refreshSessions();
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(
            SvgKeyRenderer.renderSessionsPageKey(
              sessionsSubmenuManager.sessionCount || 1,
              sessionsSubmenuManager.hasThinkingSession
            )
          );
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
    for (const key of this.activeKeys) {
      if (key.id === ev.action.id) this.activeKeys.delete(key);
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    if (checkSubmenuKeyDown(_ev)) return;
    console.log("🖥️ [SessionsKey] Tapped -> Opening Sessions Submenu");
    await sessionsSubmenuManager.open();
  }
}

// Backwards compatibility alias
export { SessionsAction as RejectAction };

// --- KEY 5: SAM 3.1 SNIP KEY ---
@action({ UUID: "com.memetcircus.musedeck.sam-snip" })
export class SamSnipAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();

  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
    this.bridge.onTelemetry(() => {
      if (isAnySubmenuActive()) return;
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
  private activeKeys = new Set<KeyAction>();

  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
    imgToCodeSubmenuManager.setBridge(this.bridge);
    this.bridge.onTelemetry(() => {
      if (isAnySubmenuActive()) return;
      const img = SvgKeyRenderer.renderImgToCodeKey("idle");
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
          void ev.action.setImage(SvgKeyRenderer.renderImgToCodeKey("idle"));
        },
        false,
        1,
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
    if (imgToCodeSubmenuManager.isActive) {
      imgToCodeSubmenuManager.close();
    } else {
      imgToCodeSubmenuManager.open();
    }
  }
}

// --- KEY 7: VID TO CODE KEY (REPLACES LEGACY RUN MUSE) ---
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
          void ev.action.setImage(SvgKeyRenderer.renderVidToCodeKey());
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
    console.log("🎥 [VidToCode] Vid to Code tapped");
    await TerminalAutomation.sendSystemNotification("Video-to-Code: Screen interaction recording & synthesis ready", "MuseDeck");
  }
}

// --- KEY 8: HALT / CANCEL KEY (EXCLUDED FROM ANIMATION) ---
@action({ UUID: "com.memetcircus.musedeck.halt" })
export class HaltAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();

  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
    this.bridge.onTelemetry((telemetry) => {
      if (isAnySubmenuActive()) return;
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

// --- KEY 9 (PAGE 1: COL 4, ROW 1): AI CREDITS HUD & TELEMETRY SUBMENU ---
@action({ UUID: "com.memetcircus.musedeck.reset" })
export class ResetAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();

  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
    this.bridge.onTelemetry((telemetry) => {
      const usage = telemetry.apiUsage;
      const img = SvgKeyRenderer.renderApiStatusKey(usage?.creditsRemaining ?? "$149.97");
      for (const key of this.activeKeys) {
        if (!museBeamAnimator.isRunning && !isAnySubmenuActive()) {
          void key.setImage(img);
          void key.setTitle("");
        }
      }
    });
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
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          this.renderKeyImage(ev.action as KeyAction);
        },
        false,
        4,
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
    if (telemetrySubmenuManager.isActive) {
      telemetrySubmenuManager.close();
      return;
    }
    telemetrySubmenuManager.open(this.bridge?.getTelemetry());
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
          if (!museBeamAnimator.isRunning && !isAnySubmenuActive()) {
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
