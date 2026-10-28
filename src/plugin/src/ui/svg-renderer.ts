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
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#070b14" stroke="#10b981" stroke-width="3"/>
            <circle cx="72" cy="72" r="44" fill="#064e3b" fill-opacity="0.3" stroke="#34d399" stroke-width="3.5" stroke-dasharray="10, 8"/>
            <circle cx="72" cy="72" r="30" fill="#065f46" stroke="#10b981" stroke-width="2"/>
            <path d="M56 72 L67 83 L89 57" fill="none" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `);

      case AgentState.PLANNING:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#070b14" stroke="#0ea5e9" stroke-width="3"/>
            <circle cx="72" cy="72" r="44" fill="#0c4a6e" fill-opacity="0.3" stroke="#38bdf8" stroke-width="3.5" stroke-dasharray="8, 6"/>
            <circle cx="72" cy="72" r="28" fill="#0369a1" fill-opacity="0.4" stroke="#7dd3fc" stroke-width="2"/>
            <path d="M72 44 L77 65 L98 72 L77 79 L72 100 L67 79 L46 72 L67 65 Z" fill="#38bdf8"/>
            <circle cx="72" cy="72" r="6" fill="#ffffff"/>
          </svg>
        `);

      case AgentState.EXECUTING:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#070b14" stroke="#a855f7" stroke-width="3"/>
            <circle cx="72" cy="72" r="44" fill="#581c87" fill-opacity="0.3" stroke="#c084fc" stroke-width="3.5" stroke-dasharray="14, 8"/>
            <circle cx="72" cy="72" r="30" fill="#6b21a8" fill-opacity="0.4" stroke="#a855f7" stroke-width="2"/>
            <path d="M76 44 L56 74 L73 74 L68 100 L90 68 L73 68 Z" fill="#ffffff" stroke="#c084fc" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        `);

      case AgentState.WAITING_APPROVAL:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#070b14" stroke="#f59e0b" stroke-width="3"/>
            <circle cx="72" cy="72" r="44" fill="#78350f" fill-opacity="0.3" stroke="#fbbf24" stroke-width="3.5" stroke-dasharray="10, 8"/>
            <polygon points="72,40 102,96 42,96" fill="#92400e" fill-opacity="0.6" stroke="#fde047" stroke-width="3.5" stroke-linejoin="round"/>
            <line x1="72" y1="58" x2="72" y2="76" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round"/>
            <circle cx="72" cy="87" r="3.5" fill="#ffffff"/>
          </svg>
        `);

      case AgentState.ERROR:
      default:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#070b14" stroke="#ef4444" stroke-width="3"/>
            <circle cx="72" cy="72" r="44" fill="#7f1d1d" fill-opacity="0.3" stroke="#f87171" stroke-width="3.5" stroke-dasharray="10, 8"/>
            <circle cx="72" cy="72" r="30" fill="#991b1b" fill-opacity="0.5" stroke="#ef4444" stroke-width="2"/>
            <line x1="56" y1="56" x2="88" y2="88" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round"/>
            <line x1="88" y1="56" x2="56" y2="88" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round"/>
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
  /**
   * Key 5: Screenshot Snip Key (Clean Cyber HUD reticle, SCREENSHOT label)
   */
  static renderSamSnipKey(status: "idle" | "snipping" | "copied" = "idle"): string {
    if (status === "copied") {
      return this.svgToDataUri(`
        <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
          <rect width="144" height="144" rx="26" fill="#041d14" stroke="#10b981" stroke-width="3"/>
          <circle cx="72" cy="48" r="28" fill="#065f46" stroke="#34d399" stroke-width="2.5"/>
          <path d="M58 48 L68 58 L87 39" fill="none" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
          <text x="72" y="116" fill="#f0fdf4" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">COPIED!</text>
        </svg>
      `);
    }

    if (status === "snipping") {
      return this.svgToDataUri(`
        <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
          <rect width="144" height="144" rx="26" fill="#1c1203" stroke="#f59e0b" stroke-width="3"/>
          <path d="M 46 36 L 46 26 L 56 26" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
          <path d="M 98 36 L 98 26 L 88 26" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
          <path d="M 46 62 L 46 72 L 56 72" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
          <path d="M 98 62 L 98 72 L 88 72" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
          <circle cx="72" cy="49" r="14" fill="#78350f" fill-opacity="0.5" stroke="#fde047" stroke-width="2" stroke-dasharray="4 3"/>
          <circle cx="72" cy="49" r="4.5" fill="#ffffff"/>
          <text x="72" y="116" fill="#fef08a" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">SNIP...</text>
        </svg>
      `);
    }

    // Default: IDLE -> SCREENSHOT with sleek Photo Camera icon
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#070b14" stroke="#0ea5e9" stroke-width="3"/>

        <!-- Camera Top Hardware Details (Shutter & Pentaprism) -->
        <rect x="43" y="27" width="9" height="5" rx="2" fill="#0284c7"/>
        <path d="M 54 32 L 60 23 L 84 23 L 90 32 Z" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" stroke-linejoin="round"/>

        <!-- Camera Body -->
        <rect x="33" y="32" width="78" height="48" rx="10" fill="#082f49" fill-opacity="0.5" stroke="#38bdf8" stroke-width="3"/>

        <!-- Top Right Sensor / Mini Flash -->
        <circle cx="96" cy="40" r="3.5" fill="#38bdf8"/>

        <!-- Big Camera Lens Assembly -->
        <circle cx="72" cy="56" r="17" fill="#0369a1" fill-opacity="0.4" stroke="#38bdf8" stroke-width="2.5"/>
        <circle cx="72" cy="56" r="11" fill="#075985" fill-opacity="0.6" stroke="#7dd3fc" stroke-width="2"/>
        <circle cx="72" cy="56" r="6" fill="#38bdf8"/>
        <circle cx="75" cy="53" r="2.2" fill="#ffffff"/>

        <!-- Clean SCREENSHOT Label -->
        <text x="72" y="116" fill="#e0f2fe" font-size="17" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.3">SCREENSHOT</text>
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
   * EXACT SEQUENCE SPECIFICATION (User Verified):
   * 1. INFLOW: Laser streamlines and directional arrows (<) stream in from the RIGHT edge (x=720)
   *    and converge/gather into the left focal aperture node at (84, 216).
   * 2. CONCENTRATION & FLASH: Energy accumulates at the focal node, pulsating and flashing.
   * 3. OUTWARD RIPPLES: Concentric circular waves burst out from the focal node,
   *    propagating outwards across the entire 5x3 grid towards the edges.
   * 4. Seamless loop.
   */
  static renderMuseBeamTile(col: number, row: number, frame: number): string {
    const vx = col * 144;
    const vy = row * 144;
    const nodeX = 84;
    const nodeY = 216;

    const totalFrames = 40;
    const loopFrame = frame % totalFrames;

    let elements = "";

    // Core laser beam along horizontal center line (always softly pulsing)
    elements += `
      <line x1="${nodeX}" y1="${nodeY}" x2="720" y2="${nodeY}" stroke="#0369a1" stroke-width="3" stroke-opacity="0.4"/>
      <line x1="${nodeX}" y1="${nodeY}" x2="720" y2="${nodeY}" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.75"/>
      <line x1="${nodeX}" y1="${nodeY}" x2="720" y2="${nodeY}" stroke="#ffffff" stroke-width="0.75" stroke-opacity="0.9"/>
    `;

    // ===== 1. INFLOW: Streamlines and Arrows flowing from RIGHT (720) to LEFT (nodeX=84) =====
    // Inflow is strongest during frames 0..24
    const inflowAlpha = loopFrame < 24 ? 1 : Math.max(0, 1 - (loopFrame - 24) / 8);

    if (inflowAlpha > 0.05) {
      const numLines = 14;
      for (let i = 0; i < numLines; i++) {
        const startY = 32 + i * 28.3; // 32..400
        const cp1X = 540;
        const cp1Y = nodeY + (startY - nodeY) * 0.76;
        const cp2X = 280;
        const cp2Y = nodeY + (startY - nodeY) * 0.18;
        const dashOffset = loopFrame * 26 + i * 22;

        // Curved guide path
        elements += `
          <path d="M 720 ${startY.toFixed(1)} C ${cp1X} ${cp1Y.toFixed(1)}, ${cp2X} ${cp2Y.toFixed(1)}, ${nodeX} ${nodeY}"
                fill="none" stroke="#0369a1" stroke-width="1.8" stroke-opacity="${(0.35 * inflowAlpha).toFixed(2)}"/>
          <path d="M 720 ${startY.toFixed(1)} C ${cp1X} ${cp1Y.toFixed(1)}, ${cp2X} ${cp2Y.toFixed(1)}, ${nodeX} ${nodeY}"
                fill="none" stroke="#38bdf8" stroke-width="2.8" stroke-linecap="round"
                stroke-dasharray="28 160" stroke-dashoffset="${dashOffset}" stroke-opacity="${inflowAlpha.toFixed(2)}"/>
        `;

        // Leftward Directional Arrows / Chevrons (<) streaming towards the left node
        const arrowProgress = ((loopFrame * 0.055 + i * 0.14) % 1.0);
        const t = arrowProgress;
        const u = 1 - t;
        const ax = u * u * u * 720 + 3 * u * u * t * cp1X + 3 * u * t * t * cp2X + t * t * t * nodeX;
        const ay = u * u * u * startY + 3 * u * u * t * cp1Y + 3 * u * t * t * cp2Y + t * t * t * nodeY;

        if (ax > nodeX + 16 && ax < 710) {
          elements += `
            <polygon points="${ax.toFixed(1)},${ay.toFixed(1)} ${(ax + 11).toFixed(1)},${(ay - 6).toFixed(1)} ${(ax + 8).toFixed(1)},${ay.toFixed(1)} ${(ax + 11).toFixed(1)},${(ay + 6).toFixed(1)}"
                     fill="#67e8f9" opacity="${(0.95 * inflowAlpha).toFixed(2)}"/>
          `;
        }
      }

      // Inflow energy particles streaming along lines towards the node
      for (let p = 0; p < 16; p++) {
        const particleProg = ((loopFrame * 0.05 + p * 0.125) % 1.0);
        const px = 720 - particleProg * (720 - nodeX);
        const spread = (1 - particleProg) * 150;
        const py = nodeY + Math.sin(p * 2.3 + loopFrame * 0.35) * spread;
        const r = p % 2 === 0 ? 3 : 1.8;
        elements += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r}" fill="#a5f3fc" opacity="${(0.85 * inflowAlpha).toFixed(2)}"/>`;
      }
    }

    // ===== 2. CONCENTRATION & FLASH at Left Focal Node (frames 18..24) =====
    if (loopFrame >= 18 && loopFrame <= 25) {
      const prog = (loopFrame - 18) / 7;
      const coreR = 14 + prog * 20;
      const glowR = 28 + prog * 40;
      const flashOp = (1 - Math.abs(prog - 0.7) * 1.5).toFixed(2);
      elements += `
        <circle cx="${nodeX}" cy="${nodeY}" r="${glowR}" fill="#38bdf8" opacity="${Math.max(0, parseFloat(flashOp) * 0.6).toFixed(2)}"/>
        <circle cx="${nodeX}" cy="${nodeY}" r="${coreR}" fill="#ffffff" opacity="${Math.max(0, parseFloat(flashOp)).toFixed(2)}"/>
      `;
    }

    // ===== 3. OUTWARD CIRCULAR WAVES (RIPPLES) spreading across the matrix (frames 22..39) =====
    if (loopFrame >= 22) {
      const waveT = loopFrame - 22; // 0..17

      // Wave 1
      const r1 = 16 + waveT * 32;
      const op1 = Math.max(0, 1 - waveT / 18).toFixed(2);
      elements += `<circle cx="${nodeX}" cy="${nodeY}" r="${r1}" fill="none" stroke="#38bdf8" stroke-width="4.5" opacity="${op1}"/>`;

      // Wave 2
      if (waveT >= 4) {
        const wt2 = waveT - 4;
        const r2 = 14 + wt2 * 30;
        const op2 = Math.max(0, 1 - wt2 / 14).toFixed(2);
        elements += `<circle cx="${nodeX}" cy="${nodeY}" r="${r2}" fill="none" stroke="#67e8f9" stroke-width="3.5" opacity="${op2}"/>`;
      }

      // Wave 3
      if (waveT >= 8) {
        const wt3 = waveT - 8;
        const r3 = 12 + wt3 * 28;
        const op3 = Math.max(0, 1 - wt3 / 10).toFixed(2);
        elements += `<circle cx="${nodeX}" cy="${nodeY}" r="${r3}" fill="none" stroke="#bae6fd" stroke-width="2.5" opacity="${op3}"/>`;
      }
    }

    // Focal Left Aperture Node (centered at nodeX=84, nodeY=216, row 1 col 0)
    const baseNode = `
      <circle cx="${nodeX}" cy="${nodeY}" r="42" fill="none" stroke="#0c4a6e" stroke-width="2.5" stroke-opacity="0.65"/>
      <circle cx="${nodeX}" cy="${nodeY}" r="28" fill="none" stroke="#0284c7" stroke-width="3" stroke-dasharray="6 4"/>
      <circle cx="${nodeX}" cy="${nodeY}" r="16" fill="#0369a1" stroke="#38bdf8" stroke-width="2.5"/>
      <circle cx="${nodeX}" cy="${nodeY}" r="8" fill="#38bdf8"/>
      <circle cx="${nodeX}" cy="${nodeY}" r="4" fill="#ffffff"/>
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
        ${baseNode}
        ${elements}

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
