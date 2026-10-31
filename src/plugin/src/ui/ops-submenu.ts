import { keyRegistry } from "./key-registry.js";
import { SvgKeyRenderer } from "./svg-renderer.js";
import { TerminalAutomation } from "../../../agent/terminal-automation.js";

export interface OpsActionDefinition {
  line1: string;
  line2: string;
  borderColor: string;
  textColor: string;
  execute: () => Promise<void>;
}

export const OPS_ACTIONS: Record<string, OpsActionDefinition> = {
  // Row 0: Code Modification / Patching
  "1,0": {
    line1: "FIX",
    line2: "ERROR",
    borderColor: "#ef4444",
    textColor: "#fca5a5",
    execute: async () => {
      await TerminalAutomation.runOpsAction(
        "FIX_ERROR",
        (clip) => `Analyze this error / stack trace and implement a fix:\n\n${clip}`,
        "Analyze the latest runtime/terminal error, diagnose the root cause, and implement a fix."
      );
    },
  },
  "2,0": {
    line1: "REFACTOR",
    line2: "CODE",
    borderColor: "#f59e0b",
    textColor: "#fde68a",
    execute: async () => {
      await TerminalAutomation.runOpsAction(
        "REFACTOR",
        (clip) => `Refactor this code to improve clarity, maintainability, and adhere to DRY/KISS principles:\n\n${clip}`,
        "I want to refactor code in this workspace. Which file or module should we refactor, or what are our refactoring goals?"
      );
    },
  },
  "3,0": {
    line1: "OPTIMIZE",
    line2: "PERF",
    borderColor: "#06b6d4",
    textColor: "#67e8f9",
    execute: async () => {
      await TerminalAutomation.runOpsAction(
        "OPTIMIZE",
        (clip) => `Analyze this code for performance bottlenecks, algorithmic complexity, and memory efficiency, then optimize it:\n\n${clip}`,
        "Analyze this codebase for performance bottlenecks, slow operations, and memory efficiency. What should we optimize?"
      );
    },
  },

  // Row 1: Code Understanding & Inspection
  "0,1": {
    line1: "EXPLAIN",
    line2: "CODE",
    borderColor: "#a855f7",
    textColor: "#d8b4fe",
    execute: async () => {
      await TerminalAutomation.runOpsAction(
        "EXPLAIN",
        (clip) => `Explain what this code does step-by-step, how it fits into the system, and any non-obvious edge cases:\n\n${clip}`,
        "I'd like an explanation of this project. Ask me what file, function, or architectural concept to explain, or provide a high-level overview if I prefer."
      );
    },
  },
  "1,1": {
    line1: "FIND",
    line2: "SYMBOL",
    borderColor: "#3b82f6",
    textColor: "#93c5fd",
    execute: async () => {
      await TerminalAutomation.runOpsAction(
        "FIND_SYMBOL",
        (clip) => `Where is this symbol/function defined and where is it used across this workspace? Trace its usages:\n\n${clip}`,
        "Which symbol, function, or class are you looking for? Tell me what to search across this workspace."
      );
    },
  },
  "2,1": {
    line1: "CODE",
    line2: "REVIEW",
    borderColor: "#ec4899",
    textColor: "#f472b6",
    execute: async () => {
      await TerminalAutomation.runOpsAction(
        "CODE_REVIEW",
        (clip) => `Perform a code review of this specific snippet for bugs, security vulnerabilities, and code quality:\n\n${clip}`,
        "Perform a thorough code review of recent changes (git diff). Check for bugs, security vulnerabilities, edge cases, and code quality."
      );
    },
  },

  // Row 2: Verification, Checks & Builds
  "0,2": {
    line1: "RUN",
    line2: "TESTS",
    borderColor: "#22c55e",
    textColor: "#4ade80",
    execute: async () => {
      await TerminalAutomation.runContextAction(
        "Run the project test suite, report any failures, and diagnose why they failed."
      );
    },
  },
  "1,2": {
    line1: "RUN",
    line2: "BUILD",
    borderColor: "#84cc16",
    textColor: "#bef264",
    execute: async () => {
      await TerminalAutomation.runContextAction(
        "Run the project build script, check for compile or bundling errors, and report the status."
      );
    },
  },
  "2,2": {
    line1: "TYPE",
    line2: "CHECK",
    borderColor: "#38bdf8",
    textColor: "#7dd3fc",
    execute: async () => {
      await TerminalAutomation.runContextAction(
        "Run TypeScript / linter checks (tsc --noEmit / lint) and report any type errors or lint warnings."
      );
    },
  },
};

class OpsSubmenuManager {
  private active = false;

  get isActive(): boolean {
    return this.active;
  }

  open(): void {
    console.log("🎯 [OpsSubmenu] Opening Muse Ops Sub-Dashboard");
    this.active = true;
    this.render();
  }

  close(): void {
    if (!this.active) return;
    console.log("🔙 [OpsSubmenu] Closing Muse Ops Sub-Dashboard -> Restoring Page 1");
    this.active = false;
    keyRegistry.restoreAll();
  }

  forceClose(): void {
    if (!this.active) return;
    this.active = false;
  }

  render(): void {
    if (!this.active) return;
    console.log(`[OpsSubmenu] render() called, total keys in registry: ${keyRegistry.all().length}`);

    for (const key of keyRegistry.all()) {
      const col = key.column;
      const row = key.row;

      let image = "";

      if (row === 0 && col === 0) {
        // Top-left corner: Upward BACK key
        image = SvgKeyRenderer.renderUpBackKey();
      } else {
        const keyCoord = `${col},${row}`;
        const opsAction = OPS_ACTIONS[keyCoord];
        if (opsAction) {
          image = SvgKeyRenderer.renderOpsCard(
            opsAction.line1,
            opsAction.line2,
            opsAction.borderColor,
            opsAction.textColor
          );
        } else {
          image = SvgKeyRenderer.renderEmptyTile();
        }
      }

      if (image) {
        void key.action.setImage(image);
        void key.action.setTitle("");
      }
    }
  }

  async handleKeyDown(col: number, row: number): Promise<boolean> {
    if (!this.active) return false;

    // 1. Top-left corner (col 0, row 0): BACK key -> Close submenu and return to main console
    if (col === 0 && row === 0) {
      this.close();
      return true;
    }

    // 2. Ops action keys:
    const keyCoord = `${col},${row}`;
    const opsAction = OPS_ACTIONS[keyCoord];
    if (opsAction) {
      console.log(`🎯 [OpsSubmenu] Executing ${opsAction.line1} ${opsAction.line2}...`);
      await opsAction.execute();
      return true;
    }

    return true;
  }
}

export const opsSubmenuManager = new OpsSubmenuManager();

