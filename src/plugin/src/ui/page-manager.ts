import { exec } from "node:child_process";
import { keyRegistry } from "./key-registry.js";
import { SvgKeyRenderer } from "./svg-renderer.js";
import { TerminalAutomation } from "../../../agent/terminal-automation.js";

/**
 * PageManager
 * Coordinates Page 1 (Primary Mission Control) and Page 2 (Multimodal Deep Workflows)
 * seamlessly across the 15 physical keys of the Elgato Stream Deck MK.2.
 */
export class PageManager {
  private activePage: 1 | 2 = 1;

  getActivePage(): 1 | 2 {
    return this.activePage;
  }

  togglePage(): void {
    if (this.activePage === 1) {
      this.switchToPage(2);
    } else {
      this.switchToPage(1);
    }
  }

  switchToPage(page: 1 | 2): void {
    this.activePage = page;
    console.log(`📑 [PageManager] Switched active profile page to: Page ${page}`);

    if (page === 2) {
      this.renderPage2();
    } else {
      this.renderPage1();
    }
  }

  renderPage1(): void {
    keyRegistry.restoreAll();
  }

  renderPage2(): void {
    for (const key of keyRegistry.all()) {
      const slot = key.row * 5 + key.column;
      const svg = SvgKeyRenderer.renderPage2Key(slot);
      void key.action.setImage(svg);
      void key.action.setTitle("");
    }
  }

  /**
   * Handle KeyDown event from any key.
   * If on Page 2, executes the Page 2 slot action.
   * If on Page 1, executes the provided default Page 1 handler.
   */
  async handleKeyDown(column: number, row: number, defaultPage1Handler: () => Promise<void>): Promise<void> {
    // Key 14 (col 4, row 2) is always the Page toggle button
    if (column === 4 && row === 2) {
      this.togglePage();
      return;
    }

    if (this.activePage === 1) {
      await defaultPage1Handler();
      return;
    }

    // Page 2 action dispatcher
    const slot = row * 5 + column;
    await this.handlePage2Slot(slot);
  }

  private async handlePage2Slot(slot: number): Promise<void> {
    switch (slot) {
      case 0: // [0] REC TO FIX (Screen + Mic)
        console.log("🎬 [Page 2] REC TO FIX triggered");
        await TerminalAutomation.launchMuseCodeTerminal(
          process.cwd(),
          "Diagnose and fix the frontend bug from recent screen+audio recording (Meta Responses + Files API)"
        );
        break;

      case 1: // [1] Blank for now
        break;

      case 2: // [2] UPLOAD FILE (file_id)
        console.log("☁️ [Page 2] UPLOAD FILE triggered");
        await TerminalAutomation.launchMuseCodeTerminal(
          process.cwd(),
          "Upload media assets to Meta Files API, retrieve file_id, and attach to current coding context"
        );
        break;

      case 3: // [3] Blank for now
        break;

      case 4: // [4] RE-INSPECT (Diff Inspector)
        console.log("🔍 [Page 2] RE-INSPECT triggered");
        exec("open http://localhost:3456/api/diff");
        break;

      case 5: // [5] PHONE REC
        console.log("📱 [Page 2] PHONE REC triggered");
        await TerminalAutomation.launchMuseCodeTerminal(
          process.cwd(),
          "Inspect mobile viewport recording and fix responsive design bugs"
        );
        break;

      case 6: // [6] STYLE TRANS
        console.log("🎨 [Page 2] STYLE TRANS triggered");
        await TerminalAutomation.launchMuseCodeTerminal(
          process.cwd(),
          "Perform UI style transfer and modernize theme aesthetic using Tailwind CSS"
        );
        break;

      case 7: // [7] WORKSPACE
        console.log("🌳 [Page 2] WORKSPACE triggered");
        await TerminalAutomation.launchMuseCodeTerminal(
          process.cwd(),
          "Analyze workspace directory tree and dependency graph"
        );
        break;

      case 8: // [8] TERMINAL LOG
        console.log("💻 [Page 2] TERMINAL LOG triggered");
        await TerminalAutomation.bringTerminalToFront();
        break;

      case 9: // [9] REWIND WORK
        console.log("⏪ [Page 2] REWIND WORK triggered");
        await TerminalAutomation.launchMuseCodeTerminal(
          process.cwd(),
          "git status && git diff --stat"
        );
        break;

      case 10: // [10] CLEAR MEDIA
        console.log("🧹 [Page 2] CLEAR MEDIA triggered");
        exec("rm -rf /tmp/musedeck/*");
        console.log("Cleared /tmp/musedeck media cache");
        break;

      case 11: // [11] API STATUS
        console.log("🩺 [Page 2] API STATUS triggered");
        exec("open http://localhost:3456/api/telemetry");
        break;

      case 12: // [12] SPARK CHAT
        console.log("✨ [Page 2] SPARK CHAT triggered");
        await TerminalAutomation.launchMuseCodeTerminal(
          process.cwd(),
          "Start interactive creative coding session with Meta Muse Spark"
        );
        break;

      case 13: // [13] OPEN WORK
        console.log("📂 [Page 2] OPEN WORK triggered");
        exec("open .");
        break;

      case 14: // [14] ← PAGE 1
        this.switchToPage(1);
        break;

      default:
        console.log(`Unhandled Page 2 slot: ${slot}`);
        break;
    }
  }
}

export const pageManager = new PageManager();
