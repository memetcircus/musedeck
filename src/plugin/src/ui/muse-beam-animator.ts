import { keyRegistry } from "./key-registry.js";
import { SvgKeyRenderer } from "./svg-renderer.js";

const COLS = 5;
const ROWS = 3;

/**
 * MuseBeamAnimator
 * Coordinates the full 5x3 multi-key kinetic quantum wave across the physical Stream Deck.
 * When Meta Muse Code is Thinking, the entire 15-key grid displays an integrated
 * neural beam converging to the focal aperture on column 4, while keeping the HALT key active.
 */
export class MuseBeamAnimator {
  private static readonly FRAME_INTERVAL_MS = 80; // Smooth 12.5 fps
  private timer: NodeJS.Timeout | null = null;
  private frame = 0;

  get isRunning(): boolean {
    return this.timer !== null;
  }

  start(): void {
    if (this.timer) return;
    this.frame = 0;

    // Clear titles on animated keys so the wave reads cleanly
    for (const key of keyRegistry.all()) {
      if (key.excludeFromAnimation) continue;
      void key.action.setTitle("");
    }

    this.timer = setInterval(() => this.tick(), MuseBeamAnimator.FRAME_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    // Restore resting state
    keyRegistry.restoreAll();
    setTimeout(() => keyRegistry.restoreAll(), 150);
  }

  private tick(): void {
    for (const key of keyRegistry.all()) {
      if (key.excludeFromAnimation) continue;
      if (key.column >= 0 && key.column < COLS && key.row >= 0 && key.row < ROWS) {
        const svg = SvgKeyRenderer.renderMuseBeamTile(key.column, key.row, this.frame);
        void key.action.setImage(svg);
      }
    }
    this.frame++;
  }
}

export const museBeamAnimator = new MuseBeamAnimator();
