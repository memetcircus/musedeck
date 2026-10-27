import { CyberIcons } from "./cyber-icons.js";
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
        return CyberIcons["p1_status"];
        /* return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#041d14" stroke="#10b981" stroke-width="4"/>
            <circle cx="72" cy="48" r="26" fill="#065f46" stroke="#34d399" stroke-width="3"/>
            <path d="M60 48 L68 56 L85 39" fill="none" stroke="#ecfdf5" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="72" y="115" fill="#f0fdf4" font-size="24" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">READY</text>
          </svg>
        `); */

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
    return CyberIcons["p1_task"];
    /* return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#082f49" stroke="#0ea5e9" stroke-width="3.5"/>
        <rect x="50" y="24" width="44" height="50" rx="8" fill="#0c4a6e" stroke="#7dd3fc" stroke-width="3"/>
        <rect x="60" y="18" width="24" height="10" rx="4" fill="#38bdf8"/>
        <line x1="58" y1="42" x2="86" y2="42" stroke="#bae6fd" stroke-width="3" stroke-linecap="round"/>
        <line x1="58" y1="52" x2="86" y2="52" stroke="#bae6fd" stroke-width="3" stroke-linecap="round"/>
        <line x1="58" y1="62" x2="76" y2="62" stroke="#bae6fd" stroke-width="3" stroke-linecap="round"/>
        <text x="72" y="115" fill="#f0f9ff" font-size="24" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">TASK</text>
      </svg>
    `); */
  }

  /**
   * Key 2: Diff Summary Key
   */
  static renderDiffKey(telemetry: TelemetryData): string {
    const { diffStats } = telemetry;
    const hasDiff = diffStats.filesChanged > 0;

    if (!hasDiff) {
      return CyberIcons["p1_diff"];
      /* return this.svgToDataUri(`
        <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
          <rect width="144" height="144" rx="26" fill="#0b0f19" stroke="#475569" stroke-width="3.5"/>
          <path d="M54 34 L54 64 M90 44 L90 74 M54 64 C54 78 90 60 90 74" fill="none" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
          <circle cx="54" cy="34" r="6" fill="#38bdf8"/>
          <circle cx="90" cy="74" r="6" fill="#a855f7"/>
          <text x="72" y="115" fill="#cbd5e1" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">NO DIFF</text>
        </svg>
      `); */
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
    if (!isAwaiting) return CyberIcons["p1_approve"];
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
    if (!isAwaiting) return CyberIcons["p1_reject"];
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
    if (status === "idle") return CyberIcons["p1_sam-snip"];
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
    if (!isRecording) return CyberIcons["p2_record-to-fix"];
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
    return CyberIcons["p1_page-next"];
  }

  /**
   * Navigation: Prev Page (Page 2 -> Page 1)
   */
  static renderPrevPageKey(): string {
    return CyberIcons["p2_page-prev"];
  }

  /**
   * Key 6: Muse Spark Image-to-Code Key
   */
  static renderSparkKey(): string {
    return CyberIcons["p1_spark-code"];
  }

  /**
   * Key 7: Run Muse Task Key
   */
  static renderRunMuseKey(): string {
    return CyberIcons["p1_run-muse"];
  }

  /**
   * Key 8: Emergency Halt Key (Always visible & excluded from animation)
   */
  static renderHaltKey(isPulsing = false): string {
    if (!isPulsing) return CyberIcons["p1_halt"];
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
    return CyberIcons["p1_reset"];
  }

  /**
   * Key 10: Prompt Task
   */
  static renderPromptKey(): string {
    return CyberIcons["p1_prompt-task"];
  }

  /**
   * Key 11: Write Tests Key
   */
  static renderTestsKey(): string {
    return CyberIcons["p1_write-tests"];
  }

  /**
   * Key 12: Fix Bug Key
   */
  static renderFixBugKey(): string {
    return CyberIcons["p1_fix-bug"];
  }

  /**
   * Key 13: Commit Key
   */
  static renderCommitKey(): string {
    return CyberIcons["p1_commit-pr"];
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
    return CyberIcons["p2_vid-to-code"];
  }

  /**
   * Page 2 Key 2: UPLOAD FILE (file_id)
   */
  static renderUploadFileKey(): string {
    return CyberIcons["p2_upload-file"];
  }

  /**
   * Page 2 Key 3: AUDIO TRANS (Speech to Spec)
   */
  static renderAudioTransKey(): string {
    return CyberIcons["p2_audio-trans"];
  }

  /**
   * Page 2 Key 4: RE-INSPECT (Diff Inspector)
   */
  static renderReInspectKey(): string {
    return CyberIcons["p2_re-inspect"];
  }

  /**
   * Page 2 Key 5: PHONE REC (Mobile UI)
   */
  static renderPhoneRecKey(): string {
    return CyberIcons["p2_phone-rec"];
  }

  /**
   * Page 2 Key 6: STYLE TRANS (Theme / CSS)
   */
  static renderStyleTransKey(): string {
    return CyberIcons["p2_style-trans"];
  }

  /**
   * Page 2 Key 7: WORKSPACE (Tree / Worktrees)
   */
  static renderWorkspaceKey(): string {
    return CyberIcons["p2_workspace"];
  }

  /**
   * Page 2 Key 8: TERMINAL LOG (Muse Stream)
   */
  static renderTerminalLogKey(): string {
    return CyberIcons["p2_terminal-log"];
  }

  /**
   * Page 2 Key 9: REWIND WORK (Git Undo)
   */
  static renderRewindWorkKey(): string {
    return CyberIcons["p2_rewind-work"];
  }

  /**
   * Page 2 Key 10: CLEAR MEDIA (/tmp clean)
   */
  static renderClearMediaKey(): string {
    return CyberIcons["p2_clear-media"];
  }

  /**
   * Page 2 Key 11: API STATUS (Meta Health)
   */
    /**
   * Page 2 Key 11: Main Clean High-Legibility AI Credits HUD Key
   * Shows only big, crisp, readable numbers - no tiny micro-text!
   */
  static renderApiStatusKey(credits = "$149.97"): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="cyberBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#041a14"/>
            <stop offset="100%" stop-color="#020e0a"/>
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Cyber Bezel & Tech Frame -->
        <rect x="5" y="5" width="134" height="134" rx="22" fill="url(#cyberBg)" stroke="#059669" stroke-width="2.5"/>
        <rect x="10" y="10" width="124" height="124" rx="18" fill="none" stroke="#10b981" stroke-width="1.2" stroke-opacity="0.5"/>

        <!-- Tech Corner Notches -->
        <path d="M16 28 L16 16 L28 16" fill="none" stroke="#34d399" stroke-width="2"/>
        <path d="M128 28 L128 16 L116 16" fill="none" stroke="#34d399" stroke-width="2"/>
        <path d="M16 116 L16 128 L28 128" fill="none" stroke="#34d399" stroke-width="2"/>
        <path d="M128 116 L128 128 L116 128" fill="none" stroke="#34d399" stroke-width="2"/>

        <!-- Top Header: High-Visibility Cyan Label -->
        <text x="72" y="34" fill="#38bdf8" font-size="14" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1.5">CREDITS</text>

        <!-- Center: Big Neon Green Balance -->
        <text x="72" y="78" fill="#10b981" font-size="26" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" filter="url(#neonGlow)">${credits}</text>

        <!-- Bottom: High-Visibility Details Callout -->
        <text x="72" y="122" fill="#34d399" font-size="13" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">STATS ↗</text>
      </svg>
    `);
  }

  /**
   * Render individual large telemetry card for the 15-key Sub-Menu
   */
  static renderTelemetryCard(
    label: string,
    value: string,
    subtitle: string,
    borderColor = "#38bdf8",
    valColor = "#ffffff"
  ): string {
    const valSize = value.length > 7 ? 24 : 29;
    const cleanId = label.replace(/[^a-zA-Z0-9]/g, '');
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="cyberBgCard_${cleanId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#071326"/>
            <stop offset="100%" stop-color="#020813"/>
          </linearGradient>
          <filter id="neonGlowCard_${cleanId}" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Cyber Outer Frame -->
        <rect x="5" y="5" width="134" height="134" rx="22" fill="url(#cyberBgCard_${cleanId})" stroke="${borderColor}" stroke-width="2.8"/>
        <rect x="9" y="9" width="126" height="126" rx="18" fill="none" stroke="${borderColor}" stroke-width="1.2" stroke-opacity="0.5"/>

        <!-- Tech Corner Brackets -->
        <path d="M14 26 L14 14 L26 14" fill="none" stroke="${borderColor}" stroke-width="2.5"/>
        <path d="M130 26 L130 14 L118 14" fill="none" stroke="${borderColor}" stroke-width="2.5"/>
        <path d="M14 118 L14 130 L26 130" fill="none" stroke="${borderColor}" stroke-width="2.5"/>
        <path d="M130 118 L130 130 L118 130" fill="none" stroke="${borderColor}" stroke-width="2.5"/>

        <!-- Top Label: Bigger, Bolder, High-Contrast -->
        <text x="72" y="34" fill="${borderColor}" font-size="15.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${label}</text>

        <!-- Center Big High-Contrast Value -->
        <text x="72" y="79" fill="${valColor}" font-size="${valSize}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" filter="url(#neonGlowCard_${cleanId})">${value}</text>

        <!-- Bottom Subtitle: Crisp Bright Silver-White & Large -->
        <text x="72" y="123" fill="#f8fafc" font-size="14.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">${subtitle}</text>
      </svg>
    `);
  }

  /**
   * Page 2 Key 12: SPARK CHAT (Meta LLM)
   */
  static renderSparkChatKey(): string {
    return CyberIcons["p2_spark-chat"];
  }

  /**
   * Page 2 Key 13: OPEN WORK (VS Code / Finder)
   */
  static renderOpenWorkKey(): string {
    return CyberIcons["p2_open-work"];
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
