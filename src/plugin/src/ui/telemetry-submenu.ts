import { exec } from "node:child_process";
import { keyRegistry } from "./key-registry.js";
import { SvgKeyRenderer } from "./svg-renderer.js";
import type { TelemetryData } from "../../../agent/types.js";

class TelemetrySubmenuManager {
  private active = false;

  get isActive(): boolean {
    return this.active;
  }

  open(telemetry?: TelemetryData): void {
    console.log("📊 [Submenu] Opening AI Telemetry & Credits Sub-Dashboard");
    this.active = true;
    this.render(telemetry);
  }

  close(): void {
    if (!this.active) return;
    console.log("🔙 [Submenu] Closing AI Telemetry & Credits Sub-Dashboard -> Restoring Page 2");
    this.active = false;
    keyRegistry.restoreAll();
  }

  forceClose(): void {
    if (!this.active) return;
    console.log("🔙 [Submenu] Force closing AI Telemetry Sub-Dashboard");
    this.active = false;
  }

  render(telemetry?: TelemetryData): void {
    if (!this.active) return;
    const usage = telemetry?.apiUsage;
    const credits = usage?.creditsRemaining ?? "$148.01";
    const spent = usage?.spent ?? "$1.99";
    const model = usage?.model ?? "SPARK 1.3";
    const inTokens = usage?.inputTokens ?? "433.9k";
    const outTokens = usage?.outputTokens ?? "19.4k";
    const cacheHit = usage?.cacheHitRate ?? "57.7%";
    const reqs = usage?.totalRequests ? `${usage.totalRequests}` : "21";

    const uptimeSec = telemetry?.uptimeSeconds ?? Math.floor(process.uptime());
    const hours = Math.floor(uptimeSec / 3600);
    const mins = Math.floor((uptimeSec % 3600) / 60);
    const secs = uptimeSec % 60;
    const uptimeStr = hours > 0
      ? `${hours}h ${mins.toString().padStart(2, "0")}m`
      : `${mins}m ${secs.toString().padStart(2, "0")}s`;

    const allKeys = keyRegistry.all();
    for (const key of allKeys) {
      const col = key.column;
      const row = key.row;

      let image = "";

      if (row === 0) {
        if (col === 0) {
          // Top-left: Prominent Back Arrow
          image = SvgKeyRenderer.renderUpBackKey();
        } else if (col === 1) {
          image = SvgKeyRenderer.renderTelemetryCard("CREDITS", credits, "#22c55e", "#4ade80");
        } else if (col === 2) {
          image = SvgKeyRenderer.renderTelemetryCard("SPEND", spent, "#38bdf8", "#7dd3fc");
        } else if (col === 3) {
          image = SvgKeyRenderer.renderTelemetryCard("REQUESTS", reqs, "#6366f1", "#a5b4fc");
        } else if (col === 4) {
          // Top-right: Prominent Action Button for Billing
          image = SvgKeyRenderer.renderActionKey("OPEN", "BILLING ↗", "#06b6d4", "#67e8f9");
        }
      } else if (row === 1) {
        if (col === 0) {
          image = SvgKeyRenderer.renderTelemetryCard("INPUT", inTokens, "#38bdf8", "#bae6fd");
        } else if (col === 1) {
          image = SvgKeyRenderer.renderTelemetryCard("OUTPUT", outTokens, "#818cf8", "#c7d2fe");
        } else if (col === 2) {
          image = SvgKeyRenderer.renderTelemetryCard("CACHE", cacheHit, "#10b981", "#6ee7b7");
        } else if (col === 3) {
          image = SvgKeyRenderer.renderTelemetryCard("LATENCY", "38ms", "#f59e0b", "#fde68a");
        } else if (col === 4) {
          image = SvgKeyRenderer.renderTelemetryCard("SPARK", "1.3", "#22c55e", "#86efac", "ACTIVE");
        }
      } else if (row === 2) {
        // Row 2: Clean empty tiles
        image = SvgKeyRenderer.renderEmptyTile();
      }

      if (image) {
        void key.action.setImage(image);
        void key.action.setTitle("");
      }
    }
  }

  handleKeyDown(col: number, row: number): boolean {
    if (!this.active) return false;

    // 1. En sol üstteki UP Arrow (col 0, row 0): Page 2'ye geri döndürür
    if (col === 0 && row === 0) {
      this.close();
      return true;
    }

    // 2. En sağ üstteki CONSOLE BILLING (col 4, row 0): Billing sayfasını açar
    if (col === 4 && row === 0) {
      exec('open "https://dev.meta.ai/billing?team_id=1552171003333942&project_id=2180934752484515"');
      return true;
    }

    // Geriye kalan 13 butonun HİÇBİRİ basınca tepki vermez (salt bilgi/telemetri kartları)
    return true;
  }
}

export const telemetrySubmenuManager = new TelemetrySubmenuManager();
