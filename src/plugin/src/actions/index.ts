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
import { pageManager } from "../ui/page-manager.js";

// Global Thinking Listener across Stream Deck
let isThinkingListenerAttached = false;
function attachGlobalThinkingListener(bridge: StreamDeckCoreBridge): void {
  if (isThinkingListenerAttached) return;
  isThinkingListenerAttached = true;

  bridge.onTelemetry((telemetry) => {
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

  const keyObj = {
    action: ev.action,
    column: col,
    row: row,
    excludeFromAnimation,
    restore: () => {
      if (pageManager.getActivePage() === 2) {
        const slot = row * 5 + col;
        void ev.action.setImage(SvgKeyRenderer.renderPage2Key(slot));
        void ev.action.setTitle("");
      } else {
        restore();
      }
    },
  };

  keyRegistry.add(ev.action.id, keyObj);

  if (!museBeamAnimator.isRunning || excludeFromAnimation) {
    keyObj.restore();
  }
}

function unregisterDeckKey(ev: WillDisappearEvent): void {
  keyRegistry.remove(ev.action.id);
}

async function handleActionKeyDown(
  ev: KeyDownEvent,
  fallbackCol: number,
  fallbackRow: number,
  page1Handler: () => Promise<void>
): Promise<void> {
  const payload = ev.payload as any;
  const col = payload?.coordinates?.column ?? fallbackCol;
  const row = payload?.coordinates?.row ?? fallbackRow;
  await pageManager.handleKeyDown(col, row, page1Handler);
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
        if (!museBeamAnimator.isRunning) {
          void key.setImage(img);
          void key.setTitle("");
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
          void ev.action.setImage(SvgKeyRenderer.renderStatusKey(this.bridge.getTelemetry()));
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
    for (const key of this.activeKeys) {
      if (key.id === ev.action.id) this.activeKeys.delete(key);
    }
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    await handleActionKeyDown(ev, 0, 0, async () => {
      const telemetry = this.bridge.getTelemetry();
      console.log(`[StatusKey] Current state: ${telemetry.state}`);
    });
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

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    await handleActionKeyDown(ev, 1, 0, async () => {
      console.log("Current Task:", this.bridge.getTelemetry().activeTask);
    });
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

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    await handleActionKeyDown(ev, 2, 0, async () => {
      exec("open http://localhost:3456/api/diff");
    });
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

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    await handleActionKeyDown(ev, 3, 0, async () => {
      await TerminalAutomation.sendApprovalKeystroke("y");
      await this.bridge.approve();
    });
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

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    await handleActionKeyDown(ev, 4, 0, async () => {
      await TerminalAutomation.sendApprovalKeystroke("n");
      await this.bridge.reject();
    });
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
    await handleActionKeyDown(ev, 0, 1, async () => {
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
    });
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
    await handleActionKeyDown(ev, 1, 1, async () => {
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
    });
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

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    await handleActionKeyDown(ev, 2, 1, async () => {
      await TerminalAutomation.launchMuseCodeTerminal(process.cwd());
      await this.bridge.runTask("Optimize performance and add comprehensive test suite for agent state machine");
    });
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

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    await handleActionKeyDown(ev, 3, 1, async () => {
      await TerminalAutomation.sendInterruptEscape();
      await this.bridge.halt();
    });
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

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    await handleActionKeyDown(ev, 4, 1, async () => {
      await this.bridge.reset();
    });
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

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    await handleActionKeyDown(ev, 0, 2, async () => {
      await TerminalAutomation.launchMuseCodeTerminal(process.cwd(), "Refactor agent communication bridge to use zero-copy buffers");
    });
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

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    await handleActionKeyDown(ev, 1, 2, async () => {
      await TerminalAutomation.launchMuseCodeTerminal(process.cwd(), "Generate complete unit tests for all state machine transitions");
    });
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

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    await handleActionKeyDown(ev, 2, 2, async () => {
      await TerminalAutomation.launchMuseCodeTerminal(process.cwd(), "Analyze recent runtime errors and generate automated patch");
    });
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

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    await handleActionKeyDown(ev, 3, 2, async () => {
      await TerminalAutomation.launchMuseCodeTerminal(process.cwd(), "Stage all verified changes, create a git commit, and generate a pull request summary");
    });
  }
}

// --- KEY 14 (PAGE 1): NAVIGATION TO PAGE 2 ---
@action({ UUID: "com.memetcircus.musedeck.page-next" })
export class PageNextAction extends SingletonAction {
  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      attachGlobalThinkingListener(this.bridge);
      registerDeckKey(
        ev,
        () => {
          const img = pageManager.getActivePage() === 2
            ? SvgKeyRenderer.renderPrevPageKey()
            : SvgKeyRenderer.renderNextPageKey();
          void ev.action.setImage(img);
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

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    pageManager.togglePage();
  }
}

// --- PAGE 2 KEY 0: RECORD TO FIX (SCREEN + AUDIO MULTIMODAL) ---
@action({ UUID: "com.memetcircus.musedeck.record-to-fix" })
export class RecordToFixAction extends SingletonAction {
  private isRecording = false;

  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      registerDeckKey(
        ev,
        () => {
          void ev.action.setImage(SvgKeyRenderer.renderRecordToFixKey(this.isRecording));
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
    this.isRecording = !this.isRecording;
    if (ev.action.isKey()) {
      await ev.action.setImage(SvgKeyRenderer.renderRecordToFixKey(this.isRecording));
    }

    if (!this.isRecording) {
      console.log("Recording completed, uploading to Meta Files API...");
      await TerminalAutomation.launchMuseCodeTerminal(process.cwd(), "Diagnose and fix the frontend bug from recent screen+audio recording (Meta Responses + Files API)");
    }
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

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    pageManager.switchToPage(1);
  }
}

// --- KEY 14 (REPLACED CONSOLE KEY): NAVIGATION COMPANION ---
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
          const img = pageManager.getActivePage() === 2
            ? SvgKeyRenderer.renderPrevPageKey()
            : SvgKeyRenderer.renderNextPageKey();
          void ev.action.setImage(img);
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

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    pageManager.togglePage();
  }
}
