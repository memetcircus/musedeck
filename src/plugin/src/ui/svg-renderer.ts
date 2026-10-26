import { AgentState, type TelemetryData } from "../../../agent/types.js";

/**
 * High-resolution 144x144 SVG Renderer for Elgato Stream Deck Key Images
 * Outputs standard base64 data URIs: data:image/svg+xml;base64,...
 */

export class SvgKeyRenderer {
  /**
   * Generates dynamic Agent Status Badge based on state machine
   */
  static renderStatusKey(telemetry: TelemetryData): string {
    const { state, iteration, maxIterations } = telemetry;

    switch (state) {
      case AgentState.IDLE:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#090d16"/>
                <stop offset="100%" stop-color="#020408"/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="144" height="144" rx="28" fill="url(#bg)" stroke="#10b981" stroke-width="3" stroke-opacity="0.4"/>
            <circle cx="72" cy="52" r="24" fill="#064e3b" stroke="#10b981" stroke-width="2.5" filter="url(#glow)"/>
            <path d="M62 52 L69 59 L83 45" fill="none" stroke="#34d399" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="72" y="96" fill="#f8fafc" font-size="15" font-weight="700" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle" letter-spacing="1">READY</text>
            <text x="72" y="116" fill="#34d399" font-size="11" font-weight="600" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">MUSE AGENT</text>
          </svg>
        `);

      case AgentState.PLANNING:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#082f49"/>
                <stop offset="100%" stop-color="#030712"/>
              </linearGradient>
            </defs>
            <rect width="144" height="144" rx="28" fill="url(#bg)" stroke="#38bdf8" stroke-width="3.5"/>
            <circle cx="72" cy="52" r="22" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="8 6"/>
            <polygon points="72,40 76,49 85,52 76,55 72,64 68,55 59,52 68,49" fill="#0284c7"/>
            <text x="72" y="96" fill="#38bdf8" font-size="15" font-weight="800" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle" letter-spacing="0.5">PLANNING</text>
            <text x="72" y="116" fill="#94a3b8" font-size="11" font-weight="600" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">AST ANALYSIS</text>
          </svg>
        `);

      case AgentState.WAITING_APPROVAL:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#451a03"/>
                <stop offset="100%" stop-color="#1c1917"/>
              </linearGradient>
              <filter id="warnGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="144" height="144" rx="28" fill="url(#bg)" stroke="#fbbf24" stroke-width="4" filter="url(#warnGlow)"/>
            <path d="M72 30 L96 72 L48 72 Z" fill="#b45309" stroke="#f59e0b" stroke-width="2.5" stroke-linejoin="round"/>
            <text x="72" y="65" fill="#fef3c7" font-size="22" font-weight="900" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">!</text>
            <text x="72" y="96" fill="#fbbf24" font-size="13" font-weight="800" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle" letter-spacing="0.5">HITL GATE</text>
            <text x="72" y="116" fill="#fef08a" font-size="11" font-weight="700" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">APPROVE [Y/N]</text>
          </svg>
        `);

      case AgentState.EXECUTING:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#2e1065"/>
                <stop offset="100%" stop-color="#090514"/>
              </linearGradient>
            </defs>
            <rect width="144" height="144" rx="28" fill="url(#bg)" stroke="#a855f7" stroke-width="3.5"/>
            <circle cx="72" cy="52" r="22" fill="#3b0764" stroke="#c084fc" stroke-width="3"/>
            <circle cx="72" cy="52" r="9" fill="#e9d5ff"/>
            <text x="72" y="96" fill="#e9d5ff" font-size="14" font-weight="800" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle" letter-spacing="0.5">RUNNING</text>
            <text x="72" y="116" fill="#c084fc" font-size="11" font-weight="600" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">ITERATION ${iteration || 1}</text>
          </svg>
        `);

      case AgentState.ERROR:
      default:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#450a0a"/>
                <stop offset="100%" stop-color="#0f0202"/>
              </linearGradient>
            </defs>
            <rect width="144" height="144" rx="28" fill="url(#bg)" stroke="#ef4444" stroke-width="4"/>
            <circle cx="72" cy="52" r="22" fill="#7f1d1d" stroke="#f87171" stroke-width="2.5"/>
            <line x1="58" y1="38" x2="86" y2="66" stroke="#fecaca" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="86" y1="38" x2="58" y2="66" stroke="#fecaca" stroke-width="3.5" stroke-linecap="round"/>
            <text x="72" y="96" fill="#f87171" font-size="15" font-weight="800" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle" letter-spacing="0.5">ERROR</text>
            <text x="72" y="116" fill="#fca5a5" font-size="11" font-weight="600" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">PRESS RESET</text>
          </svg>
        `);
    }
  }

  /**
   * Key 3: Physical HITL APPROVE Key
   */
  static renderApproveKey(isAwaiting: boolean): string {
    const strokeColor = isAwaiting ? "#22c55e" : "#15803d";
    const fillColor = isAwaiting ? "#14532d" : "#052e16";
    const textGlow = isAwaiting ? "#4ade80" : "#86efac";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="28" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isAwaiting ? '4' : '2'}"/>
        <circle cx="72" cy="50" r="24" fill="#166534" stroke="${strokeColor}" stroke-width="2"/>
        <path d="M60 50 L69 59 L84 41" fill="none" stroke="#bbf7d0" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="96" fill="#f0fdf4" font-size="16" font-weight="900" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">APPROVE</text>
        <text x="72" y="116" fill="${textGlow}" font-size="11" font-weight="700" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">[PRESS Y]</text>
      </svg>
    `);
  }

  /**
   * Key 4: Physical HITL REJECT Key
   */
  static renderRejectKey(isAwaiting: boolean): string {
    const strokeColor = isAwaiting ? "#ef4444" : "#991b1b";
    const fillColor = isAwaiting ? "#450a0a" : "#1f0404";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="28" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isAwaiting ? '4' : '2'}"/>
        <circle cx="72" cy="50" r="24" fill="#7f1d1d" stroke="${strokeColor}" stroke-width="2"/>
        <line x1="59" y1="37" x2="85" y2="63" stroke="#fecaca" stroke-width="4" stroke-linecap="round"/>
        <line x1="85" y1="37" x2="59" y2="63" stroke="#fecaca" stroke-width="4" stroke-linecap="round"/>
        <text x="72" y="96" fill="#fef2f2" font-size="16" font-weight="900" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">REJECT</text>
        <text x="72" y="116" fill="#fca5a5" font-size="11" font-weight="700" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">[PRESS N]</text>
      </svg>
    `);
  }

  /**
   * Key 2: Diff Summary Key
   */
  static renderDiffKey(telemetry: TelemetryData): string {
    const { diffStats } = telemetry;
    const hasDiff = diffStats.filesChanged > 0;

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="28" fill="#0b0f19" stroke="#334155" stroke-width="2.5"/>
        <path d="M52 40 L52 70 M92 50 L92 80 M52 70 C52 82 92 68 92 80" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
        <circle cx="52" cy="40" r="5" fill="#38bdf8"/>
        <circle cx="92" cy="80" r="5" fill="#a855f7"/>
        <text x="72" y="100" fill="#f8fafc" font-size="14" font-weight="800" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">${hasDiff ? `${diffStats.filesChanged} FILES` : 'NO DIFF'}</text>
        <text x="72" y="120" fill="${hasDiff ? '#4ade80' : '#64748b'}" font-size="12" font-weight="700" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">+${diffStats.insertions} / -${diffStats.deletions}</text>
      </svg>
    `);
  }

  /**
   * Key 5: SAM 3.1 Snip Key (with live thumbnail preview if available)
   */
  static renderSamSnipKey(thumbnailBase64?: string): string {
    if (thumbnailBase64 && thumbnailBase64.startsWith("data:image/")) {
      return thumbnailBase64;
    }

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="samGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e1b4b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="28" fill="url(#samGrad)" stroke="#6366f1" stroke-width="3"/>
        <rect x="42" y="32" width="60" height="42" rx="10" fill="#312e81" stroke="#818cf8" stroke-width="2" stroke-dasharray="6 4"/>
        <circle cx="72" cy="53" r="10" fill="#4338ca"/>
        <text x="72" y="96" fill="#e0e7ff" font-size="14" font-weight="800" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">SAM 3.1</text>
        <text x="72" y="116" fill="#818cf8" font-size="11" font-weight="700" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">UI SNIP</text>
      </svg>
    `);
  }

  /**
   * Key 6: Muse Spark Image-to-Code Key
   */
  static renderSparkKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="spkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3b0764"/>
            <stop offset="100%" stop-color="#111827"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="28" fill="url(#spkGrad)" stroke="#c084fc" stroke-width="3"/>
        <path d="M50 44 L38 56 L50 68 M94 44 L106 56 L94 68 M78 38 L66 74" fill="none" stroke="#e9d5ff" stroke-width="3" stroke-linecap="round"/>
        <text x="72" y="96" fill="#faf5ff" font-size="13" font-weight="800" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">IMG-TO-CODE</text>
        <text x="72" y="116" fill="#c084fc" font-size="11" font-weight="700" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">MUSE SPARK</text>
      </svg>
    `);
  }

  /**
   * Key 7: Run Muse Task Key
   */
  static renderRunMuseKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="28" fill="#042f2e" stroke="#14b8a6" stroke-width="3"/>
        <polygon points="62,38 92,54 62,70" fill="#2dd4bf"/>
        <text x="72" y="96" fill="#f0fdfa" font-size="15" font-weight="800" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">RUN MUSE</text>
        <text x="72" y="116" fill="#5eead4" font-size="11" font-weight="700" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">START TASK</text>
      </svg>
    `);
  }

  /**
   * Key 8: Emergency Halt Key
   */
  static renderHaltKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="28" fill="#450a0a" stroke="#dc2626" stroke-width="3"/>
        <polygon points="54,34 90,34 104,48 104,84 90,98 54,98 40,84 40,48" fill="#991b1b" stroke="#f87171" stroke-width="2"/>
        <rect x="62" y="56" width="20" height="20" rx="4" fill="#fef2f2"/>
        <text x="72" y="118" fill="#fca5a5" font-size="12" font-weight="900" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">HALT</text>
      </svg>
    `);
  }

  /**
   * Key 9: Reset Key
   */
  static renderResetKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="28" fill="#0f172a" stroke="#475569" stroke-width="2.5"/>
        <path d="M54 54 A20 20 0 1 1 54 74" fill="none" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round"/>
        <polygon points="46,54 56,44 58,58" fill="#94a3b8"/>
        <text x="72" y="98" fill="#f1f5f9" font-size="14" font-weight="800" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">RESET</text>
        <text x="72" y="118" fill="#94a3b8" font-size="11" font-weight="600" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">CLEAR STATE</text>
      </svg>
    `);
  }

  /**
   * Generic Action Key
   */
  static renderGenericActionKey(title: string, subtitle: string, icon = "⚡", borderColor = "#3b82f6"): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="28" fill="#0b0f19" stroke="${borderColor}" stroke-width="2.5"/>
        <text x="72" y="58" font-size="28" text-anchor="middle">${icon}</text>
        <text x="72" y="96" fill="#f8fafc" font-size="13" font-weight="800" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">${title}</text>
        <text x="72" y="116" fill="#94a3b8" font-size="10.5" font-weight="600" font-family="-apple-system, system-ui, sans-serif" text-anchor="middle">${subtitle}</text>
      </svg>
    `);
  }

  private static svgToDataUri(svg: string): string {
    const cleaned = svg.trim().replace(/\n\s*/g, " ");
    return `data:image/svg+xml;base64,${Buffer.from(cleaned).toString("base64")}`;
  }
}
