import { AgentState, type TelemetryData } from "../../../agent/types.js";

/**
 * High-Legibility Retina SVG Key Renderer for Elgato Stream Deck MK.2
 *
 * Optimized specifically for 1-inch physical key LCDs:
 * - 44-52px prominent vector icons
 * - Bold 20px-24px high-contrast typography
 * - Zero cramped micro-text
 */

export class SvgKeyRenderer {
  /**
   * Key 0: Dynamic Agent Status Badge
   */
  static renderStatusKey(telemetry: TelemetryData): string {
    const { state } = telemetry;

    switch (state) {
      case AgentState.IDLE:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#041d14" stroke="#10b981" stroke-width="4"/>
            <circle cx="72" cy="48" r="26" fill="#065f46" stroke="#34d399" stroke-width="3"/>
            <path d="M60 48 L68 56 L85 39" fill="none" stroke="#ecfdf5" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="72" y="115" fill="#f0fdf4" font-size="24" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">READY</text>
          </svg>
        `);

      case AgentState.PLANNING:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#032238" stroke="#38bdf8" stroke-width="4"/>
            <circle cx="72" cy="48" r="24" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="12 6"/>
            <polygon points="72,32 77,44 89,48 77,52 72,64 67,52 55,48 67,44" fill="#0ea5e9"/>
            <text x="72" y="115" fill="#38bdf8" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">PLAN</text>
          </svg>
        `);

      case AgentState.WAITING_APPROVAL:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <defs>
              <filter id="warnGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
              </filter>
            </defs>
            <rect width="144" height="144" rx="26" fill="#451a03" stroke="#fbbf24" stroke-width="5" filter="url(#warnGlow)"/>
            <polygon points="72,20 104,66 40,66" fill="#b45309" stroke="#fef08a" stroke-width="3.5" stroke-linejoin="round"/>
            <text x="72" y="58" fill="#ffffff" font-size="28" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">!</text>
            <text x="72" y="115" fill="#fef08a" font-size="24" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">REVIEW</text>
          </svg>
        `);

      case AgentState.EXECUTING:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#2e1065" stroke="#c084fc" stroke-width="4"/>
            <circle cx="72" cy="48" r="24" fill="#581c87" stroke="#e9d5ff" stroke-width="4"/>
            <circle cx="72" cy="48" r="10" fill="#ffffff"/>
            <text x="72" y="115" fill="#f5f3ff" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">RUNNING</text>
          </svg>
        `);

      case AgentState.ERROR:
      default:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#450a0a" stroke="#ef4444" stroke-width="5"/>
            <circle cx="72" cy="48" r="26" fill="#991b1b" stroke="#fecaca" stroke-width="3"/>
            <line x1="56" y1="32" x2="88" y2="64" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
            <line x1="88" y1="32" x2="56" y2="64" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
            <text x="72" y="115" fill="#fee2e2" font-size="24" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">ERROR</text>
          </svg>
        `);
    }
  }

  /**
   * Key 1: Active Task Key
   */
  static renderTaskKey(stepText = "Active"): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#082f49" stroke="#0ea5e9" stroke-width="3.5"/>
        <rect x="50" y="24" width="44" height="50" rx="8" fill="#0c4a6e" stroke="#7dd3fc" stroke-width="3"/>
        <rect x="60" y="18" width="24" height="10" rx="4" fill="#38bdf8"/>
        <line x1="58" y1="42" x2="86" y2="42" stroke="#bae6fd" stroke-width="3" stroke-linecap="round"/>
        <line x1="58" y1="52" x2="86" y2="52" stroke="#bae6fd" stroke-width="3" stroke-linecap="round"/>
        <line x1="58" y1="62" x2="76" y2="62" stroke="#bae6fd" stroke-width="3" stroke-linecap="round"/>
        <text x="72" y="115" fill="#f0f9ff" font-size="24" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">TASK</text>
      </svg>
    `);
  }

  /**
   * Key 2: Diff Summary Key
   */
  static renderDiffKey(telemetry: TelemetryData): string {
    const { diffStats } = telemetry;
    const hasDiff = diffStats.filesChanged > 0;

    if (!hasDiff) {
      return this.svgToDataUri(`
        <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
          <rect width="144" height="144" rx="26" fill="#0b0f19" stroke="#475569" stroke-width="3.5"/>
          <path d="M54 34 L54 64 M90 44 L90 74 M54 64 C54 78 90 60 90 74" fill="none" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
          <circle cx="54" cy="34" r="6" fill="#38bdf8"/>
          <circle cx="90" cy="74" r="6" fill="#a855f7"/>
          <text x="72" y="115" fill="#cbd5e1" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">NO DIFF</text>
        </svg>
      `);
    }

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#0b1329" stroke="#6366f1" stroke-width="4"/>
        <path d="M52 28 L52 56 M92 38 L92 66 M52 56 C52 70 92 52 92 66" fill="none" stroke="#818cf8" stroke-width="4" stroke-linecap="round"/>
        <circle cx="52" cy="28" r="6" fill="#38bdf8"/>
        <circle cx="92" cy="66" r="6" fill="#a855f7"/>
        <text x="72" y="96" fill="#ffffff" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">${diffStats.filesChanged} FILES</text>
        <text x="72" y="122" fill="#4ade80" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">+${diffStats.insertions} / -${diffStats.deletions}</text>
      </svg>
    `);
  }

  /**
   * Key 3: Physical HITL APPROVE Key
   */
  static renderApproveKey(isAwaiting: boolean): string {
    const strokeColor = isAwaiting ? "#22c55e" : "#16a34a";
    const fillColor = isAwaiting ? "#052e16" : "#022c22";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isAwaiting ? '5' : '3.5'}"/>
        <circle cx="72" cy="46" r="26" fill="#15803d" stroke="#86efac" stroke-width="3"/>
        <path d="M58 46 L68 56 L86 38" fill="none" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="115" fill="#f0fdf4" font-size="23" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">APPROVE</text>
      </svg>
    `);
  }

  /**
   * Key 4: Physical HITL REJECT Key
   */
  static renderRejectKey(isAwaiting: boolean): string {
    const strokeColor = isAwaiting ? "#ef4444" : "#dc2626";
    const fillColor = isAwaiting ? "#450a0a" : "#2a0505";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isAwaiting ? '5' : '3.5'}"/>
        <circle cx="72" cy="46" r="26" fill="#b91c1c" stroke="#fca5a5" stroke-width="3"/>
        <line x1="57" y1="31" x2="87" y2="61" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round"/>
        <line x1="87" y1="31" x2="57" y2="61" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round"/>
        <text x="72" y="115" fill="#fef2f2" font-size="23" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">REJECT</text>
      </svg>
    `);
  }

  /**
   * Key 5: SAM 3.1 Snip Key (High-legibility vector design, never replaces icon with raw screenshot)
   */
  static renderSamSnipKey(status: "idle" | "snipping" | "copied" = "idle"): string {
    if (status === "copied") {
      return this.svgToDataUri(`
        <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
          <rect width="144" height="144" rx="26" fill="#052e16" stroke="#22c55e" stroke-width="4"/>
          <circle cx="72" cy="46" r="26" fill="#15803d" stroke="#86efac" stroke-width="3"/>
          <path d="M58 46 L68 56 L86 38" fill="none" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
          <text x="72" y="115" fill="#f0fdf4" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">COPIED!</text>
        </svg>
      `);
    }

    if (status === "snipping") {
      return this.svgToDataUri(`
        <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
          <rect width="144" height="144" rx="26" fill="#1e1b4b" stroke="#f59e0b" stroke-width="4"/>
          <rect x="42" y="24" width="60" height="46" rx="10" fill="#312e81" stroke="#fbbf24" stroke-width="3.5" stroke-dasharray="6 4"/>
          <circle cx="72" cy="47" r="11" fill="#f59e0b"/>
          <text x="72" y="115" fill="#fef08a" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">SNIP...</text>
        </svg>
      `);
    }

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#1e1b4b" stroke="#6366f1" stroke-width="4"/>
        <rect x="42" y="24" width="60" height="46" rx="10" fill="#312e81" stroke="#a5b4fc" stroke-width="3.5" stroke-dasharray="8 5"/>
        <circle cx="72" cy="47" r="11" fill="#818cf8"/>
        <text x="72" y="115" fill="#e0e7ff" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">SAM 3.1</text>
      </svg>
    `);
  }

  /**
   * Key: Record-to-Fix (Video frames + mic audio with Meta Responses & Files API)
   */
  static renderRecordToFixKey(isRecording = false): string {
    if (isRecording) {
      return this.svgToDataUri(`
        <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
          <rect width="144" height="144" rx="26" fill="#450a0a" stroke="#ef4444" stroke-width="5"/>
          <circle cx="72" cy="46" r="24" fill="#ef4444" stroke="#fecaca" stroke-width="3"/>
          <rect x="62" y="36" width="20" height="20" rx="4" fill="#ffffff"/>
          <text x="72" y="115" fill="#fee2e2" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">STOP REC</text>
        </svg>
      `);
    }

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#311042" stroke="#e11d48" stroke-width="4"/>
        <rect x="42" y="26" width="46" height="38" rx="8" fill="#881337" stroke="#fda4af" stroke-width="3"/>
        <polygon points="90,34 108,24 108,66 90,56" fill="#e11d48" stroke="#fda4af" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="56" cy="45" r="4" fill="#f43f5e"/>
        <text x="72" y="115" fill="#fff1f2" font-size="21" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">REC FIX</text>
      </svg>
    `);
  }

  /**
   * Navigation: Next Page (Page 1 -> Page 2)
   */
  static renderNextPageKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#1e1b4b" stroke="#818cf8" stroke-width="3.5"/>
        <circle cx="72" cy="46" r="24" fill="#312e81" stroke="#c7d2fe" stroke-width="3"/>
        <path d="M62 46 L82 46 M74 36 L84 46 L74 56" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="115" fill="#e0e7ff" font-size="21" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">PAGE 2 →</text>
      </svg>
    `);
  }

  /**
   * Navigation: Prev Page (Page 2 -> Page 1)
   */
  static renderPrevPageKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#0f172a" stroke="#94a3b8" stroke-width="3.5"/>
        <circle cx="72" cy="46" r="24" fill="#1e293b" stroke="#cbd5e1" stroke-width="3"/>
        <path d="M82 46 L62 46 M70 36 L60 46 L70 56" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="115" fill="#f8fafc" font-size="21" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">← PAGE 1</text>
      </svg>
    `);
  }

  /**
   * Key 6: Muse Spark Image-to-Code Key
   */
  static renderSparkKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#3b0764" stroke="#c084fc" stroke-width="4"/>
        <path d="M50 36 L36 48 L50 60 M94 36 L108 48 L94 60 M78 30 L66 66" fill="none" stroke="#f3e8ff" stroke-width="4" stroke-linecap="round"/>
        <text x="72" y="115" fill="#faf5ff" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">SPARK</text>
      </svg>
    `);
  }

  /**
   * Key 7: Run Muse Task Key
   */
  static renderRunMuseKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#042f2e" stroke="#14b8a6" stroke-width="4"/>
        <polygon points="58,26 98,48 58,70" fill="#2dd4bf" stroke="#99f6e4" stroke-width="2" stroke-linejoin="round"/>
        <text x="72" y="115" fill="#f0fdfa" font-size="24" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">RUN</text>
      </svg>
    `);
  }

  /**
   * Key 8: Emergency Halt Key (Always visible & excluded from animation)
   */
  static renderHaltKey(isPulsing = false): string {
    const strokeColor = isPulsing ? "#ef4444" : "#dc2626";
    const fillColor = isPulsing ? "#5f0a0a" : "#450a0a";
    const strokeWidth = isPulsing ? "5.5" : "4";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <polygon points="56,18 88,18 108,38 108,62 88,82 56,82 36,62 36,38" fill="#dc2626" stroke="#fecaca" stroke-width="3"/>
        <rect x="58" y="36" width="28" height="28" rx="4" fill="#ffffff"/>
        <text x="72" y="110" fill="#ffffff" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">HALT</text>
        <text x="72" y="128" fill="#fca5a5" font-size="14" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">(ESC)</text>
      </svg>
    `);
  }

  /**
   * Key 9: Reset Key
   */
  static renderResetKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#0f172a" stroke="#64748b" stroke-width="4"/>
        <path d="M50 48 A22 22 0 1 1 52 70" fill="none" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round"/>
        <polygon points="40,46 54,34 56,52" fill="#cbd5e1"/>
        <text x="72" y="115" fill="#f8fafc" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">RESET</text>
      </svg>
    `);
  }

  /**
   * Key 10: Prompt Task
   */
  static renderPromptKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#172554" stroke="#3b82f6" stroke-width="3.5"/>
        <rect x="52" y="24" width="40" height="48" rx="6" fill="#1d4ed8" stroke="#93c5fd" stroke-width="3"/>
        <line x1="60" y1="38" x2="84" y2="38" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <line x1="60" y1="48" x2="84" y2="48" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <line x1="60" y1="58" x2="74" y2="58" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <text x="72" y="115" fill="#eff6ff" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">PROMPT</text>
      </svg>
    `);
  }

  /**
   * Key 11: Write Tests Key
   */
  static renderTestsKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#064e3b" stroke="#10b981" stroke-width="3.5"/>
        <path d="M64 22 L80 22 M72 22 L72 40 L88 64 C90 68 88 74 80 74 L64 74 C56 74 54 68 56 64 L72 40" fill="#047857" stroke="#6ee7b7" stroke-width="3.5" stroke-linejoin="round"/>
        <circle cx="70" cy="62" r="3" fill="#a7f3d0"/>
        <circle cx="76" cy="56" r="2" fill="#a7f3d0"/>
        <text x="72" y="115" fill="#ecfdf5" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">TESTS</text>
      </svg>
    `);
  }

  /**
   * Key 12: Fix Bug Key
   */
  static renderFixBugKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#451a03" stroke="#f59e0b" stroke-width="3.5"/>
        <ellipse cx="72" cy="50" rx="16" ry="18" fill="#b45309" stroke="#fde68a" stroke-width="3"/>
        <circle cx="72" cy="30" r="10" fill="#d97706" stroke="#fde68a" stroke-width="2.5"/>
        <line x1="44" y1="42" x2="100" y2="42" stroke="#fde68a" stroke-width="3" stroke-linecap="round"/>
        <line x1="42" y1="56" x2="102" y2="56" stroke="#fde68a" stroke-width="3" stroke-linecap="round"/>
        <text x="72" y="115" fill="#fffbeb" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">FIX BUG</text>
      </svg>
    `);
  }

  /**
   * Key 13: Commit Key
   */
  static renderCommitKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#2e1065" stroke="#8b5cf6" stroke-width="3.5"/>
        <circle cx="72" cy="48" r="18" fill="#581c87" stroke="#c4b5fd" stroke-width="4"/>
        <line x1="32" y1="48" x2="54" y2="48" stroke="#c4b5fd" stroke-width="4" stroke-linecap="round"/>
        <line x1="90" y1="48" x2="112" y2="48" stroke="#c4b5fd" stroke-width="4" stroke-linecap="round"/>
        <circle cx="72" cy="48" r="7" fill="#ffffff"/>
        <text x="72" y="115" fill="#f5f3ff" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">COMMIT</text>
      </svg>
    `);
  }

  /**
   * Key 14: Web Console Key replaced with Next Page Key
   */
  static renderConsoleKey(): string {
    return this.renderNextPageKey();
  }

  /**
   * Page 2 Key 1: VID-TO-CODE (Meta Files API)
   */
  static renderVidToCodeKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#082f49" stroke="#0ea5e9" stroke-width="3.5"/>
        <rect x="40" y="24" width="64" height="46" rx="8" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2.5"/>
        <polygon points="56,36 56,58 74,47" fill="#38bdf8"/>
        <path d="M78 40 L88 47 L78 54" fill="none" stroke="#e0f2fe" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="104" fill="#f0f9ff" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">VID-TO-CODE</text>
        <text x="72" y="124" fill="#38bdf8" font-size="12" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">META FILES API</text>
      </svg>
    `);
  }

  /**
   * Page 2 Key 2: UPLOAD FILE (file_id)
   */
  static renderUploadFileKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#052e16" stroke="#10b981" stroke-width="3.5"/>
        <path d="M46 62 A18 18 0 0 1 76 34 A22 22 0 0 1 102 52 A16 16 0 0 1 96 68 L48 68" fill="#065f46" stroke="#34d399" stroke-width="2.5"/>
        <path d="M72 68 L72 44 M62 52 L72 42 L82 52" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="104" fill="#ecfdf5" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">UPLOAD FILE</text>
        <text x="72" y="124" fill="#6ee7b7" font-size="12" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">(file_id)</text>
      </svg>
    `);
  }

  /**
   * Page 2 Key 3: AUDIO TRANS (Speech to Spec)
   */
  static renderAudioTransKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#2e1065" stroke="#a855f7" stroke-width="3.5"/>
        <rect x="64" y="22" width="16" height="30" rx="8" fill="#7e22ce" stroke="#d8b4fe" stroke-width="2.5"/>
        <path d="M54 38 A18 18 0 0 0 90 38 M72 56 L72 68 M60 68 L84 68" fill="none" stroke="#d8b4fe" stroke-width="3" stroke-linecap="round"/>
        <text x="72" y="104" fill="#faf5ff" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">AUDIO TRANS</text>
        <text x="72" y="124" fill="#c084fc" font-size="12" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">SPEECH TO SPEC</text>
      </svg>
    `);
  }

  /**
   * Page 2 Key 4: RE-INSPECT (Diff Inspector)
   */
  static renderReInspectKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#451a03" stroke="#f59e0b" stroke-width="3.5"/>
        <circle cx="66" cy="46" r="18" fill="#78350f" stroke="#fde68a" stroke-width="3"/>
        <line x1="80" y1="58" x2="98" y2="74" stroke="#fde68a" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M60 46 L64 50 L74 40" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="104" fill="#fffbeb" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">RE-INSPECT</text>
        <text x="72" y="124" fill="#fbbf24" font-size="12" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">DIFF INSPECTOR</text>
      </svg>
    `);
  }

  /**
   * Page 2 Key 5: PHONE REC (Mobile UI)
   */
  static renderPhoneRecKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#042f2e" stroke="#14b8a6" stroke-width="3.5"/>
        <rect x="52" y="20" width="40" height="54" rx="8" fill="#115e59" stroke="#5eead4" stroke-width="2.5"/>
        <circle cx="72" cy="66" r="3" fill="#5eead4"/>
        <circle cx="72" cy="42" r="9" fill="#ef4444"/>
        <text x="72" y="104" fill="#f0fdfa" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">PHONE REC</text>
        <text x="72" y="124" fill="#2dd4bf" font-size="12" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">MOBILE UI</text>
      </svg>
    `);
  }

  /**
   * Page 2 Key 6: STYLE TRANS (Theme / CSS)
   */
  static renderStyleTransKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#3b0764" stroke="#d946ef" stroke-width="3.5"/>
        <path d="M48 68 L78 38 M72 32 L84 44" stroke="#f0abfc" stroke-width="3.5" stroke-linecap="round"/>
        <polygon points="86,24 88,30 94,32 88,34 86,40 84,34 78,32 84,30" fill="#ffffff"/>
        <polygon points="56,26 57,30 61,31 57,32 56,36 55,32 51,31 55,30" fill="#fdf4ff"/>
        <text x="72" y="104" fill="#fdf4ff" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">STYLE TRANS</text>
        <text x="72" y="124" fill="#e879f9" font-size="12" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">THEME / CSS</text>
      </svg>
    `);
  }

  /**
   * Page 2 Key 7: WORKSPACE (Tree / Worktrees)
   */
  static renderWorkspaceKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#172554" stroke="#3b82f6" stroke-width="3.5"/>
        <rect x="42" y="28" width="26" height="18" rx="4" fill="#1d4ed8" stroke="#93c5fd" stroke-width="2"/>
        <rect x="76" y="28" width="26" height="18" rx="4" fill="#1d4ed8" stroke="#93c5fd" stroke-width="2"/>
        <rect x="59" y="52" width="26" height="18" rx="4" fill="#2563eb" stroke="#bfdbfe" stroke-width="2"/>
        <path d="M55 46 L55 50 L72 50 L72 52 M89 46 L89 50" fill="none" stroke="#93c5fd" stroke-width="2"/>
        <text x="72" y="104" fill="#eff6ff" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">WORKSPACE</text>
        <text x="72" y="124" fill="#60a5fa" font-size="12" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">TREE / WORKTREES</text>
      </svg>
    `);
  }

  /**
   * Page 2 Key 8: TERMINAL LOG (Muse Stream)
   */
  static renderTerminalLogKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#1e1b4b" stroke="#6366f1" stroke-width="3.5"/>
        <rect x="40" y="24" width="64" height="46" rx="8" fill="#312e81" stroke="#a5b4fc" stroke-width="2.5"/>
        <line x1="40" y1="36" x2="104" y2="36" stroke="#818cf8" stroke-width="2"/>
        <circle cx="48" cy="30" r="2.5" fill="#f43f5e"/>
        <circle cx="56" cy="30" r="2.5" fill="#eab308"/>
        <circle cx="64" cy="30" r="2.5" fill="#22c55e"/>
        <text x="72" y="57" fill="#a5b4fc" font-size="15" font-weight="900" font-family="monospace" text-anchor="middle">&gt; MUSE_</text>
        <text x="72" y="104" fill="#eef2ff" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">TERM LOG</text>
        <text x="72" y="124" fill="#818cf8" font-size="12" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">MUSE STREAM</text>
      </svg>
    `);
  }

  /**
   * Page 2 Key 9: REWIND WORK (Git Undo)
   */
  static renderRewindWorkKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#431407" stroke="#ea580c" stroke-width="3.5"/>
        <path d="M52 48 A22 22 0 1 1 54 68" fill="none" stroke="#fdba74" stroke-width="4.5" stroke-linecap="round"/>
        <polygon points="42,46 56,36 58,54" fill="#fdba74"/>
        <text x="72" y="104" fill="#fff7ed" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">REWIND WORK</text>
        <text x="72" y="124" fill="#fb923c" font-size="12" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">GIT UNDO</text>
      </svg>
    `);
  }

  /**
   * Page 2 Key 10: CLEAR MEDIA (/tmp clean)
   */
  static renderClearMediaKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#3f1d24" stroke="#e11d48" stroke-width="3.5"/>
        <path d="M52 38 L92 38 M60 38 L62 70 A4 4 0 0 0 66 74 L78 74 A4 4 0 0 0 82 70 L84 38 M64 38 L66 30 L78 30 L80 38"
              fill="none" stroke="#fda4af" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="68" y1="46" x2="68" y2="64" stroke="#fda4af" stroke-width="2"/>
        <line x1="76" y1="46" x2="76" y2="64" stroke="#fda4af" stroke-width="2"/>
        <text x="72" y="104" fill="#fff1f2" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">CLEAR MEDIA</text>
        <text x="72" y="124" fill="#fb7185" font-size="12" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">/TMP CLEAN</text>
      </svg>
    `);
  }

  /**
   * Page 2 Key 11: API STATUS (Meta Health)
   */
  static renderApiStatusKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#064e3b" stroke="#22c55e" stroke-width="3.5"/>
        <path d="M38 48 L56 48 L64 26 L76 68 L84 38 L92 48 L106 48" fill="none" stroke="#86efac" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="106" cy="48" r="4" fill="#22c55e"/>
        <text x="72" y="104" fill="#f0fdf4" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">API STATUS</text>
        <text x="72" y="124" fill="#4ade80" font-size="12" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">META HEALTH</text>
      </svg>
    `);
  }

  /**
   * Page 2 Key 12: SPARK CHAT (Meta LLM)
   */
  static renderSparkChatKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#24124d" stroke="#8b5cf6" stroke-width="3.5"/>
        <path d="M42 30 C42 24, 102 24, 102 30 L102 56 C102 62, 70 62, 62 68 L54 74 L56 62 L42 62 Z" fill="#5b21b6" stroke="#c4b5fd" stroke-width="2.5"/>
        <polygon points="72,36 74,42 80,44 74,46 72,52 70,46 64,44 70,42" fill="#ffffff"/>
        <text x="72" y="104" fill="#f5f3ff" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">SPARK CHAT</text>
        <text x="72" y="124" fill="#a78bfa" font-size="12" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">META LLM</text>
      </svg>
    `);
  }

  /**
   * Page 2 Key 13: OPEN WORK (VS Code / Finder)
   */
  static renderOpenWorkKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#0c2a4d" stroke="#38bdf8" stroke-width="3.5"/>
        <path d="M44 32 L62 32 L68 40 L100 40 L100 68 L44 68 Z" fill="#0369a1" stroke="#7dd3fc" stroke-width="2.5"/>
        <path d="M78 48 L94 32 M82 32 L94 32 L94 44" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="104" fill="#f0f9ff" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">OPEN WORK</text>
        <text x="72" y="124" fill="#38bdf8" font-size="12" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">VS CODE / DIR</text>
      </svg>
    `);
  }

  /**
   * Dispatcher: Render Page 2 Key by slot index (0..14)
   */
  static renderPage2Key(slotIndex: number): string {
    switch (slotIndex) {
      case 0: return this.renderRecordToFixKey(false);
      case 1: return this.renderVidToCodeKey();
      case 2: return this.renderUploadFileKey();
      case 3: return this.renderAudioTransKey();
      case 4: return this.renderReInspectKey();
      case 5: return this.renderPhoneRecKey();
      case 6: return this.renderStyleTransKey();
      case 7: return this.renderWorkspaceKey();
      case 8: return this.renderTerminalLogKey();
      case 9: return this.renderRewindWorkKey();
      case 10: return this.renderClearMediaKey();
      case 11: return this.renderApiStatusKey();
      case 12: return this.renderSparkChatKey();
      case 13: return this.renderOpenWorkKey();
      case 14: return this.renderPrevPageKey();
      default: return this.renderNextPageKey();
    }
  }

  /**
   * Generic Action Key
   */
  static renderGenericActionKey(title: string, subtitle: string, icon = "⚡", borderColor = "#3b82f6"): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#0b0f19" stroke="${borderColor}" stroke-width="3.5"/>
        <text x="72" y="54" font-size="40" text-anchor="middle">${icon}</text>
        <text x="72" y="115" fill="#f8fafc" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">${title}</text>
      </svg>
    `);
  }

  /**
   * Render tile slice for the 5x3 Meta Muse Code Quantum Beam animation
   * Inspired by Meta Muse Code / Spark visual identity.
   *
   * 2-PHASE LOOP SPECIFICATION:
   * Phase 1 (frames 0..17): Luminous leftward wave surges across column 0 into the focal node at (84, 216).
   *                         On impact, concentric circular ripples spread outward across the matrix.
   * Phase 2 (frames 18..43): Conical laser streamlines and directional chevrons (<) gather from the right edge (720px)
   *                          into the left node, concentrate into the aperture, and detonate expanding shockwaves across the grid.
   * NO TEXT OVERLAYS.
   */
  static renderMuseBeamTile(col: number, row: number, frame: number): string {
    const vx = col * 144;
    const vy = row * 144;
    const nodeX = 84;
    const nodeY = 216;

    const totalFrames = 44;
    const loopFrame = frame % totalFrames;

    let elements = "";

    if (loopFrame < 18) {
      // ===== PHASE 1: Leftward Wave -> Node Impact -> Concentric Ripples =====
      const p1Frame = loopFrame; // 0..17

      // Wave sweeping in from left edge (x = -40 to 84) during frames 0..7
      if (p1Frame <= 8) {
        const waveProgress = Math.min(1, p1Frame / 7);
        const waveX = -40 + waveProgress * 124; // reaches 84 at frame 7
        const waveOpacity = (0.35 + waveProgress * 0.65).toFixed(2);

        // Curved energetic wavefront surging eastward
        elements += `
          <path d="M ${waveX - 30} 30 Q ${waveX + 30} 216 ${waveX - 30} 402"
                fill="none" stroke="#0284c7" stroke-width="9" stroke-opacity="${(parseFloat(waveOpacity) * 0.45).toFixed(2)}"/>
          <path d="M ${waveX} 40 Q ${waveX + 42} 216 ${waveX} 392"
                fill="none" stroke="#38bdf8" stroke-width="5" stroke-opacity="${waveOpacity}"/>
          <path d="M ${waveX + 8} 60 Q ${waveX + 48} 216 ${waveX + 8} 372"
                fill="none" stroke="#ffffff" stroke-width="2.5" stroke-opacity="${waveOpacity}"/>
        `;

        // Particles riding the crest
        for (let i = 0; i < 8; i++) {
          const py = 60 + i * 44;
          const px = waveX + Math.sin(py + p1Frame) * 14;
          elements += `<circle cx="${px.toFixed(1)}" cy="${py}" r="${i % 2 === 0 ? 3.5 : 2}" fill="#e0f2fe" opacity="${waveOpacity}"/>`;
        }
      }

      // Flash at impact (frames 7..9)
      if (p1Frame >= 7 && p1Frame <= 9) {
        const flashOp = (1 - (p1Frame - 7) * 0.45).toFixed(2);
        elements += `
          <circle cx="${nodeX}" cy="${nodeY}" r="32" fill="#ffffff" opacity="${flashOp}"/>
          <circle cx="${nodeX}" cy="${nodeY}" r="56" fill="#38bdf8" opacity="${(parseFloat(flashOp) * 0.6).toFixed(2)}"/>
        `;
      }

      // Expanding concentric ripple rings from node (frames 7..17)
      if (p1Frame >= 7) {
        const t = p1Frame - 7; // 0..10
        // Ring 1
        const r1 = 14 + t * 28;
        const op1 = Math.max(0, 1 - t / 11).toFixed(2);
        elements += `<circle cx="${nodeX}" cy="${nodeY}" r="${r1}" fill="none" stroke="#38bdf8" stroke-width="3.5" opacity="${op1}"/>`;

        // Ring 2
        if (t >= 3) {
          const t2 = t - 3;
          const r2 = 12 + t2 * 26;
          const op2 = Math.max(0, 1 - t2 / 8).toFixed(2);
          elements += `<circle cx="${nodeX}" cy="${nodeY}" r="${r2}" fill="none" stroke="#67e8f9" stroke-width="2.5" opacity="${op2}"/>`;
        }

        // Ring 3
        if (t >= 6) {
          const t3 = t - 6;
          const r3 = 10 + t3 * 24;
          const op3 = Math.max(0, 1 - t3 / 5).toFixed(2);
          elements += `<circle cx="${nodeX}" cy="${nodeY}" r="${r3}" fill="none" stroke="#93c5fd" stroke-width="2" opacity="${op3}"/>`;
        }
      }

    } else {
      // ===== PHASE 2: Converging Right Streamlines with Arrows -> Concentration -> Shockwave Outburst =====
      const p2Frame = loopFrame - 18; // 0..25

      // Core quantum laser tether connecting node across the canvas
      elements += `
        <line x1="${nodeX}" y1="${nodeY}" x2="720" y2="${nodeY}" stroke="#0284c7" stroke-width="4" stroke-opacity="0.4"/>
        <line x1="${nodeX}" y1="${nodeY}" x2="720" y2="${nodeY}" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.8"/>
        <line x1="${nodeX}" y1="${nodeY}" x2="720" y2="${nodeY}" stroke="#ffffff" stroke-width="1" stroke-opacity="0.9"/>
      `;

      // 14 Convergent laser curved streamlines funnelling into node
      const numLines = 14;
      for (let i = 0; i < numLines; i++) {
        const startY = 32 + i * 28.3; // 32..400
        const cp1X = 540;
        const cp1Y = nodeY + (startY - nodeY) * 0.76;
        const cp2X = 300;
        const cp2Y = nodeY + (startY - nodeY) * 0.18;
        const dashOffset = (p2Frame * 22 + i * 18);

        elements += `
          <path d="M 720 ${startY.toFixed(1)} C ${cp1X} ${cp1Y.toFixed(1)}, ${cp2X} ${cp2Y.toFixed(1)}, ${nodeX} ${nodeY}"
                fill="none" stroke="#0369a1" stroke-width="2" stroke-opacity="0.45"/>
          <path d="M 720 ${startY.toFixed(1)} C ${cp1X} ${cp1Y.toFixed(1)}, ${cp2X} ${cp2Y.toFixed(1)}, ${nodeX} ${nodeY}"
                fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"
                stroke-dasharray="26 180" stroke-dashoffset="${dashOffset}"/>
        `;

        // Inward-moving Directional Arrows / Chevrons (<) along streamlines gathering towards node
        if (p2Frame < 15) {
          const arrowProgress = ((p2Frame * 0.07 + i * 0.15) % 1.0);
          const t = arrowProgress;
          const u = 1 - t;
          const ax = u * u * u * 720 + 3 * u * u * t * cp1X + 3 * u * t * t * cp2X + t * t * t * nodeX;
          const ay = u * u * u * startY + 3 * u * u * t * cp1Y + 3 * u * t * t * cp2Y + t * t * t * nodeY;

          if (ax > nodeX + 15 && ax < 710) {
            elements += `
              <polygon points="${ax.toFixed(1)},${ay.toFixed(1)} ${(ax + 10).toFixed(1)},${(ay - 5).toFixed(1)} ${(ax + 7).toFixed(1)},${ay.toFixed(1)} ${(ax + 10).toFixed(1)},${(ay + 5).toFixed(1)}"
                       fill="#67e8f9" opacity="0.95"/>
            `;
          }
        }
      }

      // Swarm of particles flowing along the funnel
      for (let p = 0; p < 18; p++) {
        const particleProg = ((p2Frame * 0.06 + p * 0.13) % 1.0);
        const px = 720 - particleProg * (720 - nodeX);
        const spread = (1 - particleProg) * 160;
        const py = nodeY + Math.sin(p * 2.1 + p2Frame * 0.3) * spread;
        const r = p % 3 === 0 ? 3 : 1.8;
        elements += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r}" fill="#a5f3fc" opacity="0.8"/>`;
      }

      // Energy Concentration at the node (frames 30..32 -> p2Frame 12..14)
      if (p2Frame >= 12 && p2Frame <= 15) {
        const conc = (p2Frame - 12) / 3;
        const rConc = 16 + conc * 18;
        elements += `
          <circle cx="${nodeX}" cy="${nodeY}" r="${rConc}" fill="#ffffff" opacity="0.9"/>
          <circle cx="${nodeX}" cy="${nodeY}" r="${rConc * 1.8}" fill="#38bdf8" opacity="0.7"/>
        `;
      }

      // Outburst: Radial shockwaves bursting out from node (p2Frame >= 14, frames 32..43)
      if (p2Frame >= 14) {
        const bt = p2Frame - 14; // 0..11
        // Outburst Ring 1
        const br1 = 14 + bt * 40;
        const bop1 = Math.max(0, 1 - bt / 12).toFixed(2);
        elements += `<circle cx="${nodeX}" cy="${nodeY}" r="${br1}" fill="none" stroke="#38bdf8" stroke-width="4.5" opacity="${bop1}"/>`;

        // Outburst Ring 2
        if (bt >= 3) {
          const bt2 = bt - 3;
          const br2 = 12 + bt2 * 36;
          const bop2 = Math.max(0, 1 - bt2 / 9).toFixed(2);
          elements += `<circle cx="${nodeX}" cy="${nodeY}" r="${br2}" fill="none" stroke="#67e8f9" stroke-width="3" opacity="${bop2}"/>`;
        }

        // Outburst Ring 3
        if (bt >= 6) {
          const bt3 = bt - 6;
          const br3 = 10 + bt3 * 32;
          const bop3 = Math.max(0, 1 - bt3 / 6).toFixed(2);
          elements += `<circle cx="${nodeX}" cy="${nodeY}" r="${br3}" fill="none" stroke="#e0f2fe" stroke-width="2.5" opacity="${bop3}"/>`;
        }
      }
    }

    // Focal Left Aperture Node (centered on column 0, row 1)
    const baseNode = `
      <circle cx="${nodeX}" cy="${nodeY}" r="40" fill="none" stroke="#0c4a6e" stroke-width="2" stroke-opacity="0.6"/>
      <circle cx="${nodeX}" cy="${nodeY}" r="26" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="6 4"/>
      <circle cx="${nodeX}" cy="${nodeY}" r="14" fill="#0369a1" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="${nodeX}" cy="${nodeY}" r="7" fill="#38bdf8"/>
      <circle cx="${nodeX}" cy="${nodeY}" r="3" fill="#ffffff"/>
    `;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="${vx} ${vy} 144 144">
        <defs>
          <radialGradient id="meshBg" cx="12%" cy="50%" r="90%">
            <stop offset="0%" stop-color="#08182b"/>
            <stop offset="50%" stop-color="#020817"/>
            <stop offset="100%" stop-color="#000206"/>
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="720" height="432" fill="url(#meshBg)"/>

        ${elements}
        ${baseNode}

        <!-- Stream Deck Key Bezel Accent -->
        <rect x="${vx + 2}" y="${vy + 2}" width="140" height="140" rx="24" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.3"/>
      </svg>
    `;

    return this.svgToDataUri(svg);
  }

  private static svgToDataUri(svg: string): string {
    const cleaned = svg.trim().replace(/\n\s*/g, " ");
    return `data:image/svg+xml;base64,${Buffer.from(cleaned).toString("base64")}`;
  }
}
