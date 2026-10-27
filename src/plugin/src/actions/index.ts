import {
  action,
  SingletonAction,
  type KeyDownEvent,
  type WillAppearEvent,
  type KeyAction,
} from "@elgato/streamdeck";
import { exec } from "node:child_process";
import { AgentState, type TelemetryData } from "../../../agent/types.js";
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
    // Tapping status key triggers quick status refresh
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
    // Prints full task to console
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
    // Opens diff in default browser
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
    await this.bridge.reject();
  }
}

// --- KEY 5: SAM 3.1 SNIP KEY ---
@action({ UUID: "com.memetcircus.musedeck.sam-snip" })
export class SamSnipAction extends SingletonAction {
  private activeKeys = new Set<KeyAction>();

  constructor(private readonly bridge: StreamDeckCoreBridge) {
    super();
    this.bridge.onTelemetry((telemetry) => {
      const img = SvgKeyRenderer.renderSamSnipKey(telemetry.lastThumbnail);
      for (const key of this.activeKeys) {
        void key.setImage(img);
      }
    });
  }

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      this.activeKeys.add(ev.action);
      await ev.action.setImage(SvgKeyRenderer.renderSamSnipKey(this.bridge.getTelemetry().lastThumbnail));
    }
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    // Show visual feedback that capture is in progress
    if (ev.action.isKey()) {
      await ev.action.setImage(SvgKeyRenderer.renderGenericActionKey("SAM 3.1", "SNIPPING...", "📸", "#6366f1"));
    }
    await this.bridge.snip();
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
    if (ev.action.isKey()) {
      await ev.action.setImage(SvgKeyRenderer.renderGenericActionKey("SPARK", "SYNTHESIZING...", "✨", "#c084fc"));
    }
    await this.bridge.spark();
    if (ev.action.isKey()) {
      await ev.action.setImage(SvgKeyRenderer.renderSparkKey());
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
    await this.bridge.runTask("Refactor agent communication bridge to use zero-copy buffers");
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
    await this.bridge.runTask("Generate complete unit tests for all state machine transitions");
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
    await this.bridge.runTask("Analyze recent runtime errors and generate automated patch");
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
    await this.bridge.runTask("Stage all verified changes, create a git commit, and generate a pull request summary");
  }
}

// --- KEY 14: WEB CONSOLE ---
@action({ UUID: "com.memetcircus.musedeck.web-console" })
export class WebConsoleAction extends SingletonAction {
  constructor(private readonly bridge: StreamDeckCoreBridge) {
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
