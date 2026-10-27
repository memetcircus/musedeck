import {
  action,
  SingletonAction,
  type KeyDownEvent,
  type WillAppearEvent,
  type KeyAction,
} from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";
import { exec } from "node:child_process";
import { AgentState, type TelemetryData } from "../../../agent/types.js";
import { TerminalAutomation } from "../../../agent/terminal-automation.js";
import type { StreamDeckCoreBridge } from "../core-bridge.js";
import { SvgKeyRenderer } from "../ui/svg-renderer.js";

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
      await ev.action.setImage(SvgKeyRenderer.renderStatusKey(this.bridge.getTelemetry()));
      await ev.action.setTitle("");
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    const telemetry = this.bridge.getTelemetry();
    console.log(`[StatusKey] Current state: ${telemetry.state}`);
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
        void key.setImage(img);
      }
    });
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      const tel = this.bridge.getTelemetry();
      await ev.action.setImage(SvgKeyRenderer.renderTaskKey(tel.activeStep));
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
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
        void key.setImage(img);
      }
    });
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      await ev.action.setImage(SvgKeyRenderer.renderDiffKey(this.bridge.getTelemetry()));
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
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
        void key.setImage(img);
      }
    });
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      const isAwaiting = this.bridge.getTelemetry().state === AgentState.WAITING_APPROVAL;
      await ev.action.setImage(SvgKeyRenderer.renderApproveKey(isAwaiting));
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    // Send physical 'y' + Enter straight to active Terminal window
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
        void key.setImage(img);
      }
    });
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      const isAwaiting = this.bridge.getTelemetry().state === AgentState.WAITING_APPROVAL;
      await ev.action.setImage(SvgKeyRenderer.renderRejectKey(isAwaiting));
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    // Send physical 'n' + Enter straight to active Terminal window
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
        void key.setImage(img);
      }
    });
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      await ev.action.setImage(SvgKeyRenderer.renderSamSnipKey("idle"));
    }
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    try {
      if (ev.action.isKey()) {
        await ev.action.setImage(SvgKeyRenderer.renderSamSnipKey("snipping"));
      }

      const result = await this.bridge.snip();

      if (result && result.ok) {
        if (ev.action.isKey()) {
          await ev.action.setImage(SvgKeyRenderer.renderSamSnipKey("copied"));
        }
        await new Promise((r) => setTimeout(r, 1600));
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
      await ev.action.setImage(SvgKeyRenderer.renderSparkKey());
    }
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
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
      await ev.action.setImage(SvgKeyRenderer.renderRunMuseKey());
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    // 1. Launch / Focus Terminal.app with muse-code in workspace
    await TerminalAutomation.launchMuseCodeTerminal(process.cwd());
    // 2. Start bridge runner
    await this.bridge.runTask("Optimize performance and add comprehensive test suite for agent state machine");
  }
}

// --- KEY 8: HALT / CANCEL KEY ---
@action({ UUID: "com.memetcircus.musedeck.halt" })
export class HaltAction extends SingletonAction {
  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      await ev.action.setImage(SvgKeyRenderer.renderHaltKey());
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
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
      await ev.action.setImage(SvgKeyRenderer.renderResetKey());
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
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
      await ev.action.setImage(SvgKeyRenderer.renderPromptKey());
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
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
      await ev.action.setImage(SvgKeyRenderer.renderTestsKey());
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
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
      await ev.action.setImage(SvgKeyRenderer.renderFixBugKey());
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
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
      await ev.action.setImage(SvgKeyRenderer.renderCommitKey());
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    await TerminalAutomation.launchMuseCodeTerminal(process.cwd(), "Stage all verified changes, create a git commit, and generate a pull request summary");
  }
}

// --- KEY 14 (PAGE 1): NAVIGATION TO PAGE 2 ---
@action({ UUID: "com.memetcircus.musedeck.page-next" })
export class PageNextAction extends SingletonAction {
  constructor() {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      await ev.action.setImage(SvgKeyRenderer.renderNextPageKey());
    }
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    console.log("Switching to Page 2 profile...");
    try {
      await streamDeck.profiles.switchToProfile(ev.action.device.id, "MuseDeckPage2");
    } catch {
      // Fallback: visual indication
      if (ev.action.isKey()) {
        await ev.action.setImage(SvgKeyRenderer.renderPrevPageKey());
      }
    }
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
      await ev.action.setImage(SvgKeyRenderer.renderRecordToFixKey(this.isRecording));
    }
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    this.isRecording = !this.isRecording;
    if (ev.action.isKey()) {
      await ev.action.setImage(SvgKeyRenderer.renderRecordToFixKey(this.isRecording));
    }

    if (!this.isRecording) {
      // Recording stopped: trigger Meta Files API upload & paste prompt to Terminal
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
      await ev.action.setImage(SvgKeyRenderer.renderPrevPageKey());
    }
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    try {
      await streamDeck.profiles.switchToProfile(ev.action.device.id, "MuseDeck");
    } catch {}
  }
}

// --- WEB CONSOLE ACTION (OPTIONAL COMPANION) ---
@action({ UUID: "com.memetcircus.musedeck.web-console" })
export class WebConsoleAction extends SingletonAction {
  constructor() {
    super();
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      await ev.action.setImage(SvgKeyRenderer.renderConsoleKey());
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    exec("open http://localhost:3456");
  }
}
