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
   * Key 8: Emergency Halt Key
   */
  static renderHaltKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#450a0a" stroke="#dc2626" stroke-width="4"/>
        <polygon points="56,22 88,22 106,40 106,62 88,80 56,80 38,62 38,40" fill="#dc2626" stroke="#fecaca" stroke-width="3"/>
        <rect x="58" y="38" width="28" height="26" rx="4" fill="#ffffff"/>
        <text x="72" y="118" fill="#fef2f2" font-size="24" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">HALT</text>
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
   * Key 14: Web Console Key
   */
  static renderConsoleKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#083344" stroke="#06b6d4" stroke-width="3.5"/>
        <rect x="42" y="24" width="60" height="46" rx="8" fill="#0e7490" stroke="#a5f3fc" stroke-width="3"/>
        <line x1="42" y1="36" x2="102" y2="36" stroke="#a5f3fc" stroke-width="2"/>
        <circle cx="50" cy="30" r="2.5" fill="#ffffff"/>
        <circle cx="58" cy="30" r="2.5" fill="#ffffff"/>
        <text x="72" y="58" fill="#a5f3fc" font-size="16" font-weight="900" font-family="monospace" text-anchor="middle">&gt;_</text>
        <text x="72" y="115" fill="#ecfeff" font-size="21" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">CONSOLE</text>
      </svg>
    `);
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

  private static svgToDataUri(svg: string): string {
    const cleaned = svg.trim().replace(/\n\s*/g, " ");
    return `data:image/svg+xml;base64,${Buffer.from(cleaned).toString("base64")}`;
  }
}
