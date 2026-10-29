import { keyRegistry } from "./key-registry.js";
import { SvgKeyRenderer } from "./svg-renderer.js";
import { TerminalAutomation } from "../../../agent/terminal-automation.js";
import type { StreamDeckCoreBridge } from "../core-bridge.js";

/**
 * ReviewSubmenuManager
 * Displays an interactive HITL (Human-in-the-Loop) review modal across the Stream Deck grid
 * when the developer clicks the flashing REVIEW badge at (0, 0).
 *
 * Layout:
 *   (0, 0): [↑ BACK] - return to Page 1 without making a decision
 *   (1, 0): [APPROVE (Y)] - sends 'y' + Enter to active Muse session and approves
 *   (2, 0): [REJECT (N)] - sends 'n' + Enter to active Muse session and rejects
 *   Others: Clean dormant empty dark tiles
 */
class ReviewSubmenuManager {
  private active = false;
  private bridge?: StreamDeckCoreBridge;

  get isActive(): boolean {
    return this.active;
  }

  setBridge(bridge: StreamDeckCoreBridge): void {
    this.bridge = bridge;
  }

  open(): void {
    console.log("⚖️ [ReviewSubmenu] Opening Review / HITL Approval Submenu");
    this.active = true;
    void TerminalAutomation.bringTerminalToFront();
    this.render();
  }

  close(): void {
    if (!this.active) return;
    console.log("🔙 [ReviewSubmenu] Closing Review Submenu -> Restoring Page 1");
    this.active = false;
    keyRegistry.restoreAll();
  }

  forceClose(): void {
    this.active = false;
  }

  render(): void {
    if (!this.active) return;
    console.log(`[ReviewSubmenu] render() called, total keys in registry: ${keyRegistry.all().length}`);

    for (const key of keyRegistry.all()) {
      const col = key.column;
      const row = key.row;

      let image = "";

      if (row === 0 && col === 0) {
        // (0, 0): BACK key
        image = SvgKeyRenderer.renderUpBackKey();
      } else if (row === 0 && col === 1) {
        // (1, 0): Option 1 - YES (Approve once)
        image = SvgKeyRenderer.renderHitlOption1Key();
      } else if (row === 0 && col === 2) {
        // (2, 0): Option 2 - ALWAYS (Yes, don't ask again)
        image = SvgKeyRenderer.renderHitlOption2Key();
      } else if (row === 0 && col === 3) {
        // (3, 0): Option 3 - NO (Reject)
        image = SvgKeyRenderer.renderHitlOption3Key();
      } else if (row === 0 && col === 4) {
        // (4, 0): Option 4 - TELL WHY (Feedback / Stop)
        image = SvgKeyRenderer.renderHitlOption4Key();
      } else {
        // Other rows: Dark blank tiles
        image = SvgKeyRenderer.renderEmptyTile();
      }

      if (image) {
        void key.action.setImage(image);
        void key.action.setTitle("");
      }
    }
  }

  async handleKeyDown(col: number, row: number): Promise<boolean> {
    if (!this.active) return false;

    // 1. (0, 0): BACK -> close and restore Page 1
    if (col === 0 && row === 0) {
      this.close();
      return true;
    }

    // 2. (1, 0): Option 1: YES
    if (col === 1 && row === 0) {
      console.log("✅ [ReviewSubmenu] Option 1 (YES) selected -> Sending '1' to active Muse Terminal");
      await TerminalAutomation.sendApprovalKeystroke("1");
      if (this.bridge) {
        await this.bridge.approve();
      }
      this.close();
      return true;
    }

    // 3. (2, 0): Option 2: ALWAYS (Allow for session)
    if (col === 2 && row === 0) {
      console.log("🚀 [ReviewSubmenu] Option 2 (ALWAYS) selected -> Sending '2' to active Muse Terminal");
      await TerminalAutomation.sendApprovalKeystroke("2");
      if (this.bridge) {
        await this.bridge.approve();
      }
      this.close();
      return true;
    }

    // 4. (3, 0): Option 3: NO (Reject)
    if (col === 3 && row === 0) {
      console.log("❌ [ReviewSubmenu] Option 3 (NO) selected -> Sending '3' to active Muse Terminal");
      await TerminalAutomation.sendApprovalKeystroke("3");
      if (this.bridge) {
        await this.bridge.reject();
      }
      this.close();
      return true;
    }

    // 5. (4, 0): Option 4: TELL WHY (Feedback)
    if (col === 4 && row === 0) {
      console.log("💬 [ReviewSubmenu] Option 4 (FEEDBACK) selected -> Sending '4' to active Muse Terminal");
      await TerminalAutomation.sendApprovalKeystroke("4");
      if (this.bridge) {
        await this.bridge.reject();
      }
      this.close();
      return true;
    }

    // Other keys
    return true;
  }
}

export const reviewSubmenuManager = new ReviewSubmenuManager();

