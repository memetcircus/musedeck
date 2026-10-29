import { keyRegistry } from "./key-registry.js";
import { SvgKeyRenderer } from "./svg-renderer.js";
import { TerminalAutomation, type MuseSessionInfo } from "../../../agent/terminal-automation.js";

const SESSION_SLOTS: Array<{ col: number; row: number }> = [
  { col: 2, row: 0 },
  { col: 3, row: 0 },
  { col: 4, row: 0 },
  { col: 0, row: 1 },
  { col: 1, row: 1 },
  { col: 2, row: 1 },
  { col: 3, row: 1 },
  { col: 4, row: 1 },
  { col: 0, row: 2 },
  { col: 1, row: 2 },
  { col: 2, row: 2 },
  { col: 3, row: 2 },
  { col: 4, row: 2 },
];

/**
 * SessionsSubmenuManager
 * Displays an interactive drawer of all active and background Muse Code terminal sessions.
 *
 * Layout:
 *   (0, 0): [↑ BACK] - return to Page 1
 *   (1, 0): [+ NEW SESSION] - opens a new Terminal running muse
 *   (2, 0)+: Active sessions with Project Name, Status, and adapted Cyber Flowing Nodes if thinking!
 */
class SessionsSubmenuManager {
  private active = false;
  private cachedSessions: MuseSessionInfo[] = [];

  get isActive(): boolean {
    return this.active;
  }

  get sessionCount(): number {
    return this.cachedSessions.length;
  }

  get hasThinkingSession(): boolean {
    return this.cachedSessions.some((s) => s.isThinking);
  }

  async open(): Promise<void> {
    console.log("🖥️ [SessionsSubmenu] Opening Muse Sessions Sub-Dashboard");
    this.active = true;
    this.cachedSessions = await TerminalAutomation.listMuseSessions();
    this.render();
  }

  close(): void {
    if (!this.active) return;
    console.log("🔙 [SessionsSubmenu] Closing Sessions Submenu -> Restoring Page 1");
    this.active = false;
    keyRegistry.restoreAll();
  }

  forceClose(): void {
    this.active = false;
  }

  async refreshSessions(): Promise<void> {
    if (!this.active) {
      this.cachedSessions = await TerminalAutomation.listMuseSessions();
      return;
    }
    this.cachedSessions = await TerminalAutomation.listMuseSessions();
    this.render();
  }

  render(): void {
    if (!this.active) return;
    console.log(`[SessionsSubmenu] Rendering ${this.cachedSessions.length} sessions across grid`);

    const slotMap = new Map<string, MuseSessionInfo>();
    for (let i = 0; i < this.cachedSessions.length && i < SESSION_SLOTS.length; i++) {
      const slot = SESSION_SLOTS[i];
      slotMap.set(`${slot.col},${slot.row}`, this.cachedSessions[i]);
    }

    for (const key of keyRegistry.all()) {
      const col = key.column;
      const row = key.row;

      let image = "";

      if (row === 0 && col === 0) {
        // (0, 0): UP BACK KEY
        image = SvgKeyRenderer.renderUpBackKey();
      } else if (row === 0 && col === 1) {
        // (1, 0): + NEW SESSION
        image = SvgKeyRenderer.renderNewSessionKey();
      } else {
        const keyCoord = `${col},${row}`;
        const session = slotMap.get(keyCoord);

        if (session) {
          const sessionIdx = this.cachedSessions.indexOf(session) + 1;
          image = SvgKeyRenderer.renderSessionCard(
            sessionIdx,
            session.project,
            session.isActive,
            session.isThinking
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

    // 1. (0, 0): BACK -> Return to Page 1
    if (col === 0 && row === 0) {
      this.close();
      return true;
    }

    // 2. (1, 0): + NEW SESSION -> Launch new Terminal window running muse
    if (col === 1 && row === 0) {
      console.log("🚀 [SessionsSubmenu] Launching new Muse Code Terminal session...");
      await TerminalAutomation.launchMuseCodeTerminal();
      this.close();
      return true;
    }

    // 3. Session Selection:
    const keyCoord = `${col},${row}`;
    for (let i = 0; i < SESSION_SLOTS.length; i++) {
      const slot = SESSION_SLOTS[i];
      if (slot.col === col && slot.row === row) {
        if (i < this.cachedSessions.length) {
          const selected = this.cachedSessions[i];
          console.log(`🎯 [SessionsSubmenu] Selected Session #${i + 1} (${selected.project}, WinID: ${selected.id})`);
          await TerminalAutomation.setActiveSession(selected.id);
          this.close();
          return true;
        }
      }
    }

    return true;
  }
}

export const sessionsSubmenuManager = new SessionsSubmenuManager();
