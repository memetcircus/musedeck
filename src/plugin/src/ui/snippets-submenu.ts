import { keyRegistry } from "./key-registry.js";
import { SvgKeyRenderer } from "./svg-renderer.js";
import { CyberIcons } from "./cyber-icons.js";
import { TerminalAutomation } from "../../../agent/terminal-automation.js";

export interface SnippetDefinition {
  line1: string;
  line2: string;
  subtitle: string;
  text: string;
  borderColor: string;
  textColor: string;
}

export const SNIPPETS: Record<string, SnippetDefinition> = {
  // Row 0
  "1,0": {
    line1: "BE",
    line2: "HONEST",
    subtitle: "CRITICAL",
    text: "Be honest and critical. Point out what is wrong, suggest better approaches.",
    borderColor: "#f59e0b",
    textColor: "#fef3c7",
  },
  "2,0": {
    line1: "DON'T",
    line2: "CODE",
    subtitle: "DISCUSS",
    text: "Do not execute yet. Outline the approach first, I will review before any implementation.",
    borderColor: "#ef4444",
    textColor: "#fee2e2",
  },
  "3,0": {
    line1: "SHOW",
    line2: "OPTS",
    subtitle: "ALTERNATIVES",
    text: "Show me 2-3 alternatives with tradeoffs for each.",
    borderColor: "#38bdf8",
    textColor: "#f0f9ff",
  },
  "4,0": {
    line1: "EXPLAIN",
    line2: "WHY",
    subtitle: "REASONING",
    text: "Explain your reasoning and tradeoffs before acting.",
    borderColor: "#818cf8",
    textColor: "#e0e7ff",
  },
  // Row 1
  "0,1": {
    line1: "KEEP",
    line2: "SHORT",
    subtitle: "CONCISE",
    text: "Keep it focused. Only what is needed, nothing extra.",
    borderColor: "#10b981",
    textColor: "#ecfdf5",
  },
  "1,1": {
    line1: "NO",
    line2: "TESTS",
    subtitle: "SKIP TESTS",
    text: "Skip tests for now. Focus on implementation only.",
    borderColor: "#ec4899",
    textColor: "#fdf2f8",
  },
  "2,1": {
    line1: "GO!",
    line2: "",
    subtitle: "PROCEED",
    text: "Go!",
    borderColor: "#22c55e",
    textColor: "#f0fdf4",
  },
  "3,1": {
    line1: "STRUCT",
    line2: "PROMPT",
    subtitle: "OPTIMIZE",
    text: "Restructure my prompt for maximum clarity and best Muse Code results.",
    borderColor: "#a855f7",
    textColor: "#f5f3ff",
  },
};

class SnippetsSubmenuManager {
  private active = false;

  get isActive(): boolean {
    return this.active;
  }

  open(): void {
    console.log("📝 [Snippets] Opening Prompt Snippets Sub-Dashboard");
    this.active = true;
    this.render();
  }

  close(): void {
    if (!this.active) return;
    console.log("🔙 [Snippets] Closing Prompt Snippets Sub-Dashboard -> Restoring Page 1");
    this.active = false;
    keyRegistry.restoreAll();
  }

  forceClose(): void {
    if (!this.active) return;
    this.active = false;
  }

  render(): void {
    if (!this.active) return;
    console.log(`[SnippetsSubmenu] render() called, total keys in registry: ${keyRegistry.all().length}`);

    for (const key of keyRegistry.all()) {
      const col = key.column;
      const row = key.row;

      let image = "";

      if (row === 0 && col === 0) {
        // Sol üst köşe: Yukarı yönlü BACK tuşu
        console.log(`[SnippetsSubmenu] (0,0) rendering UpBackKey for action=${key.action.manifestId}`);
        image = SvgKeyRenderer.renderUpBackKey();
      } else {
        const keyCoord = `${col},${row}`;
        const snippet = SNIPPETS[keyCoord];
        if (snippet) {
          console.log(`[SnippetsSubmenu] (${col},${row}) rendering snippet "${snippet.line1}" for action=${key.action.manifestId}`);
          image = SvgKeyRenderer.renderSnippetCard(
            snippet.line1,
            snippet.line2,
            snippet.subtitle,
            snippet.borderColor,
            snippet.textColor
          );
        } else {
          console.log(`[SnippetsSubmenu] (${col},${row}) rendering empty tile for action=${key.action.manifestId}`);
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

    // 1. Sol üst köşe (col 0, row 0): BACK tuşu -> Menüyü kapat ve Page 1'e dön
    if (col === 0 && row === 0) {
      this.close();
      return true;
    }

    // 2. Snippet tuşları:
    const keyCoord = `${col},${row}`;
    const snippet = SNIPPETS[keyCoord];
    if (snippet) {
      console.log(`📝 [Snippets] Pasting snippet "${snippet.line1} ${snippet.line2}" into Muse terminal...`);
      await TerminalAutomation.typeSnippetIntoTerminal(snippet.text);
      return true;
    }

    return true;
  }
}

export const snippetsSubmenuManager = new SnippetsSubmenuManager();

