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
        // Sol üst köşe: Yukarı yönlü BACK tuşu
        image = SvgKeyRenderer.renderUpBackKey();
      } else if (row === 0 && col === 1) {
        // (1, 0): APPROVE (Y) - Yeşil buton
        image = SvgKeyRenderer.renderActiveApproveKey();
      } else if (row === 0 && col === 2) {
        // (2, 0): REJECT (N) - Kırmızı buton
        image = SvgKeyRenderer.renderActiveRejectKey();
      } else {
        // Diğer tüm tuşlar: Karanlık bekleme karosu
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

    // 1. Sol üst köşe (0, 0): BACK -> kapat ve Page 1'e dön
    if (col === 0 && row === 0) {
      this.close();
      return true;
    }

    // 2. (1, 0): APPROVE (Y)
    if (col === 1 && row === 0) {
      console.log("✅ [ReviewSubmenu] User pressed APPROVE -> Sending 'y' to active Muse Terminal");
      await TerminalAutomation.sendApprovalKeystroke("y");
      if (this.bridge) {
        await this.bridge.approve();
      }
      this.close();
      return true;
    }

    // 3. (2, 0): REJECT (N)
    if (col === 2 && row === 0) {
      console.log("❌ [ReviewSubmenu] User pressed REJECT -> Sending 'n' to active Muse Terminal");
      await TerminalAutomation.sendApprovalKeystroke("n");
      if (this.bridge) {
        await this.bridge.reject();
      }
      this.close();
      return true;
    }

    // Alt menüdeyken diğer boş tuşlara basılırsa işlem yapma
    return true;
  }
}

export const reviewSubmenuManager = new ReviewSubmenuManager();

