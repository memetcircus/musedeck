import { exec } from "node:child_process";
import { keyRegistry } from "./key-registry.js";
import { SvgKeyRenderer } from "./svg-renderer.js";
import { CyberIcons } from "./cyber-icons.js";
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

  render(telemetry?: TelemetryData): void {
    if (!this.active) return;
    const usage = telemetry?.apiUsage;
    const credits = usage?.creditsRemaining ?? "$149.97";
    const spent = usage?.spent ?? "$0.00";
    const model = usage?.model ?? "SPARK 1.3";
    const inTokens = usage?.inputTokens ?? "433.9k";
    const outTokens = usage?.outputTokens ?? "19.4k";
    const cacheHit = usage?.cacheHitRate ?? "57.7%";
    const reqs = usage?.totalRequests ? `${usage.totalRequests}` : "21";

    const allKeys = keyRegistry.all();
    for (const key of allKeys) {
      const col = key.column;
      const row = key.row;

      let image = "";

      if (row === 0) {
        if (col === 0) {
          // Top-left: Circular UP Arrow (No text, pure icon)
          image = CyberIcons["submenu_up"];
        } else if (col === 1) {
          image = SvgKeyRenderer.renderTelemetryCard("REMAINING", credits, "CREDITS", "#10b981", "#34d399");
        } else if (col === 2) {
          image = SvgKeyRenderer.renderTelemetryCard("SPEND", spent, "TOTAL SPENT", "#38bdf8", "#7dd3fc");
        } else if (col === 3) {
          image = SvgKeyRenderer.renderTelemetryCard("MODEL", model, "ACTIVE LLM", "#a855f7", "#c084fc");
        } else if (col === 4) {
          image = SvgKeyRenderer.renderTelemetryCard("CONSOLE", "BILLING ↗", "OPEN WEB", "#06b6d4", "#22d3ee");
        }
      } else if (row === 1) {
        if (col === 0) {
          image = SvgKeyRenderer.renderTelemetryCard("INPUT", inTokens, "INPUT TOKENS", "#38bdf8", "#ffffff");
        } else if (col === 1) {
          image = SvgKeyRenderer.renderTelemetryCard("OUTPUT", outTokens, "OUTPUT TOKENS", "#818cf8", "#ffffff");
        } else if (col === 2) {
          image = SvgKeyRenderer.renderTelemetryCard("CACHE", cacheHit, "CACHE HIT", "#34d399", "#6ee7b7");
        } else if (col === 3) {
          image = SvgKeyRenderer.renderTelemetryCard("REQUESTS", reqs, "TOTAL CALLS", "#38bdf8", "#38bdf8");
        } else if (col === 4) {
          image = SvgKeyRenderer.renderTelemetryCard("VISION", "SAM 3.1", "SEGMENTATION", "#60a5fa", "#93c5fd");
        }
      } else if (row === 2) {
        if (col === 0) {
          image = SvgKeyRenderer.renderTelemetryCard("MEDIA", "0 IMAGES", "MEDIA API", "#f43f5e", "#fda4af");
        } else if (col === 1) {
          image = SvgKeyRenderer.renderTelemetryCard("HEALTH", "100%", "API STATUS", "#10b981", "#34d399");
        } else if (col === 2) {
          image = SvgKeyRenderer.renderTelemetryCard("SPEED", "1.3s", "AVG LATENCY", "#fbbf24", "#fef08a");
        } else if (col === 3) {
          image = SvgKeyRenderer.renderTelemetryCard("UPTIME", "ONLINE", "LIVE BRIDGE", "#38bdf8", "#7dd3fc");
        } else if (col === 4) {
          // Bottom-right empty cyber frame
          image = SvgKeyRenderer.renderTelemetryCard("MUSEDECK", "MK.2", "COCKPIT", "#475569", "#94a3b8");
        }
      }

      if (image) {
        void key.action.setImage(image);
        void key.action.setTitle("");
      }
    }
  }

  handleKeyDown(col: number, row: number): boolean {
    if (!this.active) return false;

    if (col === 0 && row === 0) {
      this.close();
      return true;
    }

    if (col === 4 && row === 0) {
      exec("open https://dev.meta.ai/ || open http://localhost:3456/api/telemetry");
      return true;
    }

    return true;
  }
}

export const telemetrySubmenuManager = new TelemetrySubmenuManager();
