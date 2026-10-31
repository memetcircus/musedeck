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
   * Key 0: Dynamic Agent Status Badge (Icon + Contextual State Label)
   */
  static renderStatusKey(telemetry: TelemetryData): string {
    const { state } = telemetry;

    switch (state) {
      case AgentState.IDLE:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#070b14" stroke="#10b981" stroke-width="2.8"/>
            <rect width="144" height="144" rx="26" fill="#10b981" fill-opacity="0.04"/>

            <!-- Glowing Checkmark Icon -->
            <circle cx="72" cy="40" r="25" fill="#064e3b" fill-opacity="0.4" stroke="#34d399" stroke-width="2.5" stroke-dasharray="8, 5"/>
            <circle cx="72" cy="40" r="16" fill="#065f46" stroke="#10b981" stroke-width="2"/>
            <path d="M64 40 L69 45 L80 33" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- Primary Action Title: NEW SESSION -->
            <text x="72" y="95" fill="#ffffff" font-size="15.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">NEW SESSION</text>

            <!-- State Subtitle: READY -->
            <text x="72" y="121" fill="#34d399" font-size="13" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">READY ↗</text>
          </svg>
        `);

      case AgentState.PLANNING:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#070b14" stroke="#0ea5e9" stroke-width="3"/>
            <circle cx="72" cy="48" r="30" fill="#0c4a6e" fill-opacity="0.35" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6, 5"/>
            <circle cx="72" cy="48" r="18" fill="#0369a1" fill-opacity="0.5" stroke="#7dd3fc" stroke-width="2"/>
            <path d="M72 28 L76 43 L91 48 L76 53 L72 68 L68 53 L53 48 L68 43 Z" fill="#38bdf8"/>
            <circle cx="72" cy="48" r="4.5" fill="#ffffff"/>
            <text x="72" y="118" fill="#7dd3fc" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">PLAN</text>
          </svg>
        `);

      case AgentState.EXECUTING:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#070b14" stroke="#a855f7" stroke-width="3"/>
            <circle cx="72" cy="48" r="30" fill="#581c87" fill-opacity="0.35" stroke="#c084fc" stroke-width="3" stroke-dasharray="10, 6"/>
            <circle cx="72" cy="48" r="19" fill="#6b21a8" fill-opacity="0.5" stroke="#a855f7" stroke-width="2"/>
            <path d="M75 28 L58 49 L72 49 L68 68 L86 46 L72 46 Z" fill="#ffffff" stroke="#c084fc" stroke-width="1.5" stroke-linejoin="round"/>
            <text x="72" y="118" fill="#e9d5ff" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">RUNNING</text>
          </svg>
        `);

      case AgentState.WAITING_APPROVAL:
        return this.renderFlashingApprovalKey(false);

      case AgentState.ERROR:
      default:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#070b14" stroke="#ef4444" stroke-width="3"/>
            <circle cx="72" cy="48" r="30" fill="#7f1d1d" fill-opacity="0.35" stroke="#f87171" stroke-width="3" stroke-dasharray="8, 6"/>
            <circle cx="72" cy="48" r="19" fill="#991b1b" fill-opacity="0.6" stroke="#ef4444" stroke-width="2"/>
            <line x1="60" y1="36" x2="84" y2="60" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
            <line x1="84" y1="36" x2="60" y2="60" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
            <text x="72" y="118" fill="#fecaca" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">ERROR</text>
          </svg>
        `);
    }
  }

  /**
   * Hardware-Driven Flashing Approval Key for Top-Left Key (0, 0)
   * Alternates every 350ms between Green Phase and Amber Phase
   */
  static renderFlashingApprovalKey(phase: boolean): string {
    const borderColor = phase ? "#22c55e" : "#f59e0b";
    const bgFill = phase ? "#052e16" : "#451a03";
    const circleFill = phase ? "#22c55e" : "#f59e0b";
    const badgeFill = phase ? "#14532d" : "#78350f";
    const badgeBorder = phase ? "#4ade80" : "#fbbf24";
    const badgeText = phase ? "#86efac" : "#fde047";
    const badgeLabel = phase ? "ACTION" : "CONFIRM";
    const line1 = phase ? "TAP FOR" : "APPROVAL";
    const line2 = phase ? "REVIEW ↗" : "REQUIRED";
    const l2Color = phase ? "#4ade80" : "#fde047";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="${bgFill}" stroke="${borderColor}" stroke-width="4"/>
        <circle cx="72" cy="72" r="52" fill="${circleFill}" fill-opacity="0.22"/>
        <rect x="18" y="14" width="108" height="24" rx="8" fill="${badgeFill}" stroke="${badgeBorder}" stroke-width="1.5"/>
        <text x="72" y="30.5" fill="${badgeText}" font-size="12.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${badgeLabel}</text>
        <text x="72" y="68" fill="#ffffff" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">${line1}</text>
        <text x="72" y="104" fill="${l2Color}" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">${line2}</text>
      </svg>
    `);
  }

  /**
   * Key 1: Voice Input Toggle Key (Option + V) for Meta Muse Code CLI
   */
  static renderVoiceKey(isRecording = false): string {
    if (isRecording) {
      return this.svgToDataUri(`
        <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
          <rect width="144" height="144" rx="26" fill="#070b14" stroke="#ef4444" stroke-width="3"/>
          <circle cx="72" cy="48" r="32" fill="#7f1d1d" fill-opacity="0.35" stroke="#ef4444" stroke-width="2" stroke-dasharray="6, 5"/>
          <!-- Active Recording Glow & Soundwaves -->
          <circle cx="94" cy="20" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
          <path d="M30 32 C23 42 23 54 30 64" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M114 32 C121 42 121 54 114 64" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M38 38 C33 44 33 52 38 58" fill="none" stroke="#f87171" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M106 38 C111 44 111 52 106 58" fill="none" stroke="#f87171" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Studio Microphone Capsule -->
          <rect x="60" y="20" width="24" height="38" rx="12" fill="#991b1b" stroke="#f87171" stroke-width="2.5"/>
          <line x1="64" y1="28" x2="80" y2="28" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
          <line x1="64" y1="34" x2="80" y2="34" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
          <line x1="64" y1="40" x2="80" y2="40" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
          <line x1="60" y1="45" x2="84" y2="45" stroke="#fca5a5" stroke-width="2"/>
          <!-- Suspension U-Cradle & Stand Base -->
          <path d="M48 38 C48 68 96 68 96 38" fill="none" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="72" y1="67" x2="72" y2="80" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
          <line x1="54" y1="80" x2="90" y2="80" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
          <text x="72" y="118" fill="#fca5a5" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">RECORDING</text>
        </svg>
      `);
    }

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#070b14" stroke="#0ea5e9" stroke-width="3"/>
        <circle cx="72" cy="48" r="32" fill="#0c4a6e" fill-opacity="0.35" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6, 5"/>
        <!-- Acoustic Radial Waves -->
        <path d="M38 38 C33 44 33 52 38 58" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M106 38 C111 44 111 52 106 58" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Studio Microphone Capsule -->
        <rect x="60" y="20" width="24" height="38" rx="12" fill="#0369a1" stroke="#38bdf8" stroke-width="2.5"/>
        <line x1="64" y1="28" x2="80" y2="28" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
        <line x1="64" y1="34" x2="80" y2="34" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
        <line x1="64" y1="40" x2="80" y2="40" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
        <line x1="60" y1="45" x2="84" y2="45" stroke="#7dd3fc" stroke-width="2"/>
        <!-- Suspension U-Cradle & Stand Base -->
        <path d="M48 38 C48 68 96 68 96 38" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="72" y1="67" x2="72" y2="80" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
        <line x1="54" y1="80" x2="90" y2="80" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
        <text x="72" y="118" fill="#7dd3fc" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">VOICE</text>
      </svg>
    `);
  }

  /**
   * Key 1: Active Task Key (Legacy)
   */
  static renderTaskKey(stepText = "Active"): string {
    return this.renderVoiceKey(false);
  }

  /**
   * Render Upward Back key for submenus (pure vector retina SVG)
   */
  static renderUpBackKey(isLocked = false): string {
    const strokeColor = isLocked ? "#1e293b" : "#a855f7";
    const circleFill = isLocked ? "#0f172a" : "#581c87";
    const circleStroke = isLocked ? "#334155" : "#c084fc";
    const arrowColor = isLocked ? "#475569" : "#ffffff";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#070b14" stroke="${strokeColor}" stroke-width="3"/>
        <circle cx="72" cy="72" r="34" fill="${circleFill}" fill-opacity="0.4" stroke="${circleStroke}" stroke-width="2.5"/>
        <!-- Prominent Upward Arrow -->
        <path d="M72 42 L52 62 M72 42 L92 62 M72 42 L72 98" fill="none" stroke="${arrowColor}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `);
  }

  /**
   * Key 2: Snippets Submenu Launcher (replaces Diff)
   */
  static renderSnippetsKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#070b14" stroke="#a855f7" stroke-width="3"/>
        <circle cx="72" cy="48" r="32" fill="#581c87" fill-opacity="0.35" stroke="#c084fc" stroke-width="2" stroke-dasharray="6, 5"/>
        <!-- Brackets & Slash Code Icon -->
        <path d="M52 34 L38 48 L52 62" fill="none" stroke="#e9d5ff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M92 34 L106 48 L92 62" fill="none" stroke="#e9d5ff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="77" y1="32" x2="67" y2="64" stroke="#a855f7" stroke-width="4" stroke-linecap="round"/>
        <text x="72" y="118" fill="#e9d5ff" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">SNIPPETS</text>
      </svg>
    `);
  }

  /**
   * Render individual prompt snippet card for Snippets Submenu
   * Edge-to-edge frame, bold high-contrast centered typography without subtitle clutter.
   */
  static renderSnippetCard(
    line1: string,
    line2: string,
    subtitle = "",
    borderColor = "#a855f7",
    textColor = "#ffffff"
  ): string {
    const isSingle = !line2 || line2.trim().length === 0;
    const l1Size = line1.length > 7 ? 21 : 25;
    const l2Size = line2 && line2.length > 7 ? 21 : 25;

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#060913" stroke="${borderColor}" stroke-width="3"/>
        <circle cx="72" cy="72" r="54" fill="${borderColor}" fill-opacity="0.08"/>
        ${
          isSingle
            ? `<text x="72" y="86" fill="${textColor}" font-size="44" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1.5">${line1}</text>`
            : `
          <text x="72" y="58" fill="#ffffff" font-size="${l1Size}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${line1}</text>
          <text x="72" y="94" fill="${textColor}" font-size="${l2Size}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${line2}</text>
        `
        }
      </svg>
    `);
  }

  /**
   * Render blank cyber tile for inactive submenu keys
   */
  static renderEmptyTile(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="24" fill="#04070e" stroke="#1e293b" stroke-width="1.5"/>
      </svg>
    `);
  }

  /**
   * Key 8: Living Mascot Settings Key (col 3, row 1)
   * Inspired by Meta Muse mascot with animated eye blinking & cyberpunk neon styling.
   */
  static renderMascotSettingsKey(expression: "idle" | "blink" | "thinking" = "idle"): string {
    const idleB64 = "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";
    const blinkB64 = "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";
    const currentB64 = expression === "blink" ? blinkB64 : idleB64;

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="mascotDeckBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#180e2a"/>
            <stop offset="100%" stop-color="#080412"/>
          </linearGradient>
        </defs>

        <rect width="144" height="144" rx="26" fill="url(#mascotDeckBg)" stroke="#c084fc" stroke-width="3"/>
        <circle cx="72" cy="46" r="38" fill="#c084fc" fill-opacity="0.16"/>

        <!-- High-res Authentic Meta Muse Graphic with smooth alpha fade -->
        <image href="data:image/png;base64,${currentB64}" xlink:href="data:image/png;base64,${currentB64}" x="30" y="16" width="84" height="60"/>

        <text x="72" y="107" fill="#ffffff" font-size="16" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">MUSE</text>
        <text x="72" y="126" fill="#c084fc" font-size="15" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">SETTINGS</text>
      </svg>
    `);
  }
  /**
   * Render Settings / Model Submenu Card
   */
  static renderSettingsCard(
    line1: string,
    line2: string,
    borderColor: string,
    textColor: string,
    isActive = false
  ): string {
    const l1Size = line1.length > 7 ? 20 : 25;
    const l2Size = line2.length > 7 ? 20 : 25;
    const activeBadge = isActive
      ? `<rect x="24" y="14" width="96" height="20" rx="10" fill="#22c55e" fill-opacity="0.2" stroke="#22c55e" stroke-width="1.5"/>
         <text x="72" y="28" fill="#4ade80" font-size="12" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">ACTIVE</text>`
      : "";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#070a16" stroke="${borderColor}" stroke-width="${isActive ? 4 : 2.5}"/>
        <circle cx="72" cy="72" r="54" fill="${borderColor}" fill-opacity="${isActive ? 0.14 : 0.06}"/>
        ${activeBadge}
        <text x="72" y="${isActive ? 68 : 58}" fill="#ffffff" font-size="${l1Size}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${line1}</text>
        <text x="72" y="${isActive ? 102 : 94}" fill="${textColor}" font-size="${l2Size}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${line2}</text>
      </svg>
    `);
  }

  /**
   * Key 2: Diff Summary Key (Legacy)
   */
  static renderDiffKey(telemetry: TelemetryData): string {
    return this.renderSnippetsKey();
  }

  /**
   * Key 3: Struct Prompt Key (Transforms user task into structured spec & execution plan)
   * Clean edge-to-edge frame without corner brackets, high legibility typography.
   */
  static renderStructPromptKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="24" fill="#070b14" stroke="#a855f7" stroke-width="2.5"/>
        <circle cx="72" cy="72" r="50" fill="#a855f7" fill-opacity="0.04"/>

        <!-- Structured Document / Spec Icon -->
        <g transform="translate(46, 16)">
          <rect x="0" y="0" width="52" height="56" rx="8" fill="#581c87" fill-opacity="0.35" stroke="#c084fc" stroke-width="2.5"/>
          <line x1="12" y1="16" x2="40" y2="16" stroke="#f5f3ff" stroke-width="3" stroke-linecap="round"/>
          <line x1="12" y1="26" x2="34" y2="26" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="12" y1="36" x2="40" y2="36" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="12" y1="46" x2="26" y2="46" stroke="#a855f7" stroke-width="2" stroke-linecap="round"/>
        </g>

        <!-- High-Legibility Titles -->
        <text x="72" y="97" fill="#f5f3ff" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">STRUCT</text>
        <text x="72" y="121" fill="#c084fc" font-size="16" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">PROMPT</text>
      </svg>
    `);
  }

  /**
   * HITL Option 1: YES (Approve Once - Sends '1')
   */
  static renderHitlOption1Key(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#070b14" stroke="#22c55e" stroke-width="3"/>
        <circle cx="72" cy="72" r="52" fill="#22c55e" fill-opacity="0.12"/>
        <rect x="18" y="14" width="108" height="24" rx="8" fill="#14532d" stroke="#4ade80" stroke-width="1.5"/>
        <text x="72" y="30.5" fill="#86efac" font-size="12.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">OPTION 1</text>
        <text x="72" y="70" fill="#ffffff" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">APPROVE</text>
        <text x="72" y="104" fill="#4ade80" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">ONCE (1)</text>
      </svg>
    `);
  }

  /**
   * HITL Option 2: ALWAYS (Allow for session - Sends '2')
   */
  static renderHitlOption2Key(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#070b14" stroke="#06b6d4" stroke-width="3"/>
        <circle cx="72" cy="72" r="52" fill="#06b6d4" fill-opacity="0.12"/>
        <rect x="18" y="14" width="108" height="24" rx="8" fill="#164e63" stroke="#22d3ee" stroke-width="1.5"/>
        <text x="72" y="30.5" fill="#67e8f9" font-size="12.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">OPTION 2</text>
        <text x="72" y="70" fill="#ffffff" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">ALWAYS</text>
        <text x="72" y="104" fill="#22d3ee" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">SESSION (2)</text>
      </svg>
    `);
  }

  /**
   * HITL Option 3: NO (Reject once - Sends '3')
   */
  static renderHitlOption3Key(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#070b14" stroke="#ef4444" stroke-width="3"/>
        <circle cx="72" cy="72" r="52" fill="#ef4444" fill-opacity="0.12"/>
        <rect x="18" y="14" width="108" height="24" rx="8" fill="#7f1d1d" stroke="#f87171" stroke-width="1.5"/>
        <text x="72" y="30.5" fill="#fca5a5" font-size="12.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">OPTION 3</text>
        <text x="72" y="70" fill="#ffffff" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">REJECT</text>
        <text x="72" y="104" fill="#f87171" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">DENY (3)</text>
      </svg>
    `);
  }

  /**
   * HITL Option 4: TELL WHY / FEEDBACK (Sends '4')
   */
  static renderHitlOption4Key(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#070b14" stroke="#f59e0b" stroke-width="3"/>
        <circle cx="72" cy="72" r="52" fill="#f59e0b" fill-opacity="0.12"/>
        <rect x="18" y="14" width="108" height="24" rx="8" fill="#78350f" stroke="#fbbf24" stroke-width="1.5"/>
        <text x="72" y="30.5" fill="#fde047" font-size="12.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">OPTION 4</text>
        <text x="72" y="70" fill="#ffffff" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">FEEDBACK</text>
        <text x="72" y="104" fill="#fbbf24" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">TELL WHY (4)</text>
      </svg>
    `);
  }

  static renderActiveApproveKey(): string {
    return this.renderHitlOption1Key();
  }

  static renderActiveRejectKey(): string {
    return this.renderHitlOption3Key();
  }

  /**
   * Sessions Key on Page 1 (Col 4, Row 0)
   * Clean edge-to-edge frame without corner brackets, high legibility typography.
   */
  static renderSessionsPageKey(count = 1, hasThinking = false): string {
    const borderColor = hasThinking ? "#a855f7" : "#38bdf8";
    const statusText = hasThinking ? "WORKING" : `${count} OPEN`;
    const statusColor = hasThinking ? "#f472b6" : "#7dd3fc";

    const pulseBorder = hasThinking
      ? `<animate attributeName="stroke" values="#a855f7;#ec4899;#a855f7" dur="1.2s" repeatCount="indefinite"/>`
      : "";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="24" fill="#070b14" stroke="${borderColor}" stroke-width="2.5">
          ${pulseBorder}
        </rect>
        <circle cx="72" cy="72" r="50" fill="${borderColor}" fill-opacity="0.04"/>

        <!-- Multi-terminal window stack icon -->
        <g transform="translate(44, 16)">
          <!-- Back terminal window -->
          <rect x="14" y="6" width="44" height="34" rx="6" fill="#1e1b4b" fill-opacity="0.6" stroke="#818cf8" stroke-width="2"/>
          <!-- Front terminal window -->
          <rect x="0" y="16" width="44" height="34" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5"/>
          <line x1="8" y1="28" x2="16" y2="28" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="20" y1="28" x2="36" y2="28" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
        </g>

        <!-- High-Legibility Titles -->
        <text x="72" y="97" fill="#f8fafc" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">SESSIONS</text>
        <text x="72" y="121" fill="${statusColor}" font-size="16" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">${statusText}</text>
      </svg>
    `);
  }

  /**
   * New Session Key in Sessions Submenu (Col 1, Row 0)
   * Plain high-contrast design matching our Stream Deck design language
   */
  static renderNewSessionKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#070a16" stroke="#06b6d4" stroke-width="2.5"/>
        <circle cx="72" cy="72" r="52" fill="#06b6d4" fill-opacity="0.12"/>
        <text x="72" y="56" fill="#ffffff" font-size="24" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">+ NEW</text>
        <text x="72" y="94" fill="#22d3ee" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">SESSION</text>
      </svg>
    `);
  }

  /**
   * Historical / Resumable Session Card in Sessions Submenu
   * Time-based color themes, large readable date & time, plain edge-to-edge layout without numerators.
   */
  static renderHistoricalSessionCard(
    _sessionIndex: number,
    project: string,
    timeBadge: string,
    timeStr: string,
    ageCategory: "today" | "yesterday" | "older" = "today"
  ): string {
    // Color palettes based on age
    let borderColor = "#00f0ff";
    let badgeFill = "#083344";
    let badgeBorder = "#22d3ee";
    let badgeText = "#67e8f9";
    let timeColor = "#22d3ee";

    if (ageCategory === "yesterday") {
      borderColor = "#f59e0b";
      badgeFill = "#78350f";
      badgeBorder = "#fbbf24";
      badgeText = "#fde047";
      timeColor = "#fbbf24";
    } else if (ageCategory === "older") {
      borderColor = "#a855f7";
      badgeFill = "#3b0764";
      badgeBorder = "#c084fc";
      badgeText = "#e9d5ff";
      timeColor = "#c084fc";
    }

    // Wide, prominent centered Date Badge (no cramped numerator pill)
    const dateBadge = `
      <rect x="18" y="13" width="108" height="25" rx="8" fill="${badgeFill}" fill-opacity="0.85" stroke="${badgeBorder}" stroke-width="1.5"/>
      <text x="72" y="30.5" fill="${badgeText}" font-size="14" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${timeBadge}</text>
    `;

    const displayProject = project.length > 9 ? project.substring(0, 8) + "…" : project;

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#070a16" stroke="${borderColor}" stroke-width="2.5"/>
        <circle cx="72" cy="72" r="52" fill="${borderColor}" fill-opacity="0.06"/>

        <!-- Header: Centered Large Date Badge -->
        ${dateBadge}

        <!-- Center: Project Name -->
        <text x="72" y="74" fill="#ffffff" font-size="21" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">${displayProject}</text>
        <line x1="20" y1="85" x2="124" y2="85" stroke="${borderColor}" stroke-width="1.5" stroke-opacity="0.4"/>

        <!-- Bottom: Large, ultra-readable Time -->
        <text x="72" y="122" fill="${timeColor}" font-size="25" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">${timeStr}</text>
      </svg>
    `);
  }

  /**
   * Session Card in Sessions Submenu with plain status badges and high-contrast typography
   */
  static renderSessionCard(
    _sessionIndex: number,
    project: string,
    isActive: boolean,
    isThinking: boolean
  ): string {
    const borderColor = isThinking ? "#a855f7" : isActive ? "#22c55e" : "#38bdf8";
    const borderWidth = isThinking || isActive ? 3 : 2.5;

    // Single centered status pill (no cramped numerator pill)
    let statusPill = "";
    if (isThinking) {
      statusPill = `
        <rect x="20" y="13" width="104" height="25" rx="8" fill="#581c87" stroke="#c084fc" stroke-width="1.5"/>
        <text x="72" y="30.5" fill="#f5d0fe" font-size="13" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">BUSY</text>
      `;
    } else if (isActive) {
      statusPill = `
        <rect x="20" y="13" width="104" height="25" rx="8" fill="#14532d" stroke="#4ade80" stroke-width="1.5"/>
        <text x="72" y="30.5" fill="#86efac" font-size="13" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">ACTIVE</text>
      `;
    } else {
      statusPill = `
        <rect x="20" y="13" width="104" height="25" rx="8" fill="#0f172a" stroke="#64748b" stroke-width="1.5"/>
        <text x="72" y="30.5" fill="#94a3b8" font-size="13" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">IDLE</text>
      `;
    }

    const displayProject = project.length > 9 ? project.substring(0, 8) + "…" : project;

    let footerSvg = "";
    if (isThinking) {
      footerSvg = `
        <text x="72" y="116" fill="#e9d5ff" font-size="16" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">THINKING...</text>
      `;
    } else if (isActive) {
      footerSvg = `
        <text x="72" y="118" fill="#4ade80" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">LIVE</text>
      `;
    } else {
      footerSvg = `
        <text x="72" y="118" fill="#64748b" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">READY</text>
      `;
    }

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#070a16" stroke="${borderColor}" stroke-width="${borderWidth}"/>
        <circle cx="72" cy="72" r="52" fill="${borderColor}" fill-opacity="0.08"/>
        ${statusPill}
        <text x="72" y="74" fill="#ffffff" font-size="21" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">${displayProject}</text>
        <line x1="20" y1="85" x2="124" y2="85" stroke="${borderColor}" stroke-width="1.5" stroke-opacity="0.4"/>
        ${footerSvg}
      </svg>
    `);
  }

  /**
   * Hardware-driven flashing Approve key for HITL confirmation (Key 3,0)
   * Alternates every 350ms between bright Green and Amber alert phases
   */
  static renderApproveFlashKey(phase: boolean): string {
    const borderColor = phase ? "#22c55e" : "#f59e0b";
    const bgFill = phase ? "#052e16" : "#451a03";
    const circleFill = phase ? "#22c55e" : "#f59e0b";
    const badgeFill = phase ? "#14532d" : "#78350f";
    const badgeBorder = phase ? "#4ade80" : "#fbbf24";
    const badgeText = phase ? "#86efac" : "#fde047";
    const badgeLabel = phase ? "APPROVE" : "CONFIRM";
    const line1 = phase ? "PRESS TO" : "APPROVAL";
    const line2 = phase ? "APPROVE (1)" : "REQUIRED";
    const l2Color = phase ? "#4ade80" : "#fde047";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="${bgFill}" stroke="${borderColor}" stroke-width="4"/>
        <circle cx="72" cy="72" r="52" fill="${circleFill}" fill-opacity="0.22"/>
        <rect x="18" y="14" width="108" height="24" rx="8" fill="${badgeFill}" stroke="${badgeBorder}" stroke-width="1.5"/>
        <text x="72" y="30.5" fill="${badgeText}" font-size="12.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${badgeLabel}</text>
        <text x="72" y="68" fill="#ffffff" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">${line1}</text>
        <text x="72" y="104" fill="${l2Color}" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">${line2}</text>
      </svg>
    `);
  }

  /**
   * HITL Reject Alert Key (Key 4,0)
   * High-contrast red/rose alert key displayed during WAITING_APPROVAL
   */
  static renderRejectAlertKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#450a0a" stroke="#ef4444" stroke-width="3.5"/>
        <circle cx="72" cy="72" r="52" fill="#ef4444" fill-opacity="0.18"/>
        <rect x="18" y="14" width="108" height="24" rx="8" fill="#7f1d1d" stroke="#f87171" stroke-width="1.5"/>
        <text x="72" y="30.5" fill="#fca5a5" font-size="12.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">REJECT</text>
        <text x="72" y="68" fill="#ffffff" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">PRESS TO</text>
        <text x="72" y="104" fill="#f87171" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">REJECT (3)</text>
      </svg>
    `);
  }

  /**
   * Key 3: Physical HITL APPROVE Key (Only visible & active when awaiting review)
   */
  static renderApproveKey(isAwaiting: boolean): string {
    if (!isAwaiting) {
      return this.svgToDataUri(`
        <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
          <rect width="144" height="144" rx="26" fill="#070b14" stroke="#1e293b" stroke-width="2"/>
          <circle cx="72" cy="72" r="4" fill="#334155"/>
        </svg>
      `);
    }

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#052e16" stroke="#22c55e" stroke-width="4.5"/>
        <circle cx="72" cy="46" r="26" fill="#15803d" stroke="#86efac" stroke-width="3"/>
        <path d="M58 46 L68 56 L86 38" fill="none" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="115" fill="#f0fdf4" font-size="23" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">APPROVE</text>
      </svg>
    `);
  }

  /**
   * Key 4: Physical HITL REJECT Key (Only visible & active when awaiting review)
   */
  static renderRejectKey(isAwaiting: boolean): string {
    if (!isAwaiting) {
      return this.svgToDataUri(`
        <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
          <rect width="144" height="144" rx="26" fill="#070b14" stroke="#1e293b" stroke-width="2"/>
          <circle cx="72" cy="72" r="4" fill="#334155"/>
        </svg>
      `);
    }

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#450a0a" stroke="#ef4444" stroke-width="4.5"/>
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
   * Key 6: IMG TO CODE (formerly SPARK)
   * Plain, high-legibility Cyber frame without reticle brackets
   */
  static renderSparkKey(status: "idle" | "snipping" | "generating" | "ready" = "idle"): string {
    return this.renderImgToCodeKey(status);
  }

  static renderImgToCodeKey(status: "idle" | "snipping" | "generating" | "ready" = "idle"): string {
    const borderColor = status === "generating" ? "#f59e0b" : status === "ready" ? "#22c55e" : "#0284c7";
    const subText = status === "generating" ? "SPARKING..." : status === "snipping" ? "SNIP AREA..." : status === "ready" ? "READY ↗" : "IMG TO CODE";
    const subColor = status === "generating" ? "#fbbf24" : status === "ready" ? "#4ade80" : "#ffffff";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="24" fill="#070b14" stroke="${borderColor}" stroke-width="2.5"/>
        <circle cx="72" cy="72" r="50" fill="${borderColor}" fill-opacity="0.04"/>

        <!-- Ambient Circle Glow -->
        <circle cx="72" cy="46" r="32" fill="#0c4a6e" fill-opacity="0.35" stroke="${borderColor}" stroke-width="2" stroke-dasharray="6, 5"/>

        <!-- Image Icon on left -->
        <g transform="translate(24, 30)">
          <rect x="0" y="0" width="34" height="28" rx="6" fill="#075985" fill-opacity="0.45" stroke="#38bdf8" stroke-width="2.2"/>
          <circle cx="10" cy="9" r="2.8" fill="#7dd3fc"/>
          <path d="M 4 23 L 13 14 L 21 21 L 26 17 L 30 23" fill="none" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>

        <!-- Transformation Arrow in center -->
        <path d="M 66 44 L 78 44 M 73 39 L 78 44 L 73 49" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

        <!-- Code Brackets on right -->
        <g transform="translate(86, 30)">
          <rect x="0" y="0" width="34" height="28" rx="6" fill="#042f2e" fill-opacity="0.5" stroke="#2dd4bf" stroke-width="2.2"/>
          <path d="M 12 9 L 6 14 L 12 19" fill="none" stroke="#5eead4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M 22 9 L 28 14 L 22 19" fill="none" stroke="#5eead4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="18" y1="8" x2="16" y2="20" stroke="#2dd4bf" stroke-width="2" stroke-linecap="round"/>
        </g>

        <!-- Single Line Crisp Label -->
        <text x="72" y="118" fill="${subColor}" font-size="16.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${subText}</text>
      </svg>
    `);
  }

  static renderImgToCodeOptionKey(
    title: string,
    subtitle: string,
    borderColor = "#0284c7",
    textColor = "#ffffff",
    isLocked = false
  ): string {
    if (isLocked) {
      const fontSize = title.length > 7 ? "21" : title.length > 5 ? "24" : "27";
      return this.svgToDataUri(`
        <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
          <!-- Muted Locked Cyber Tile -->
          <rect width="144" height="144" rx="24" fill="#070a12" stroke="#1e293b" stroke-width="2"/>
          <rect width="144" height="144" rx="24" fill="#0f172a" fill-opacity="0.35"/>

          <!-- Centered Sleek Padlock Icon -->
          <g transform="translate(62, 18)">
            <path d="M 10 0 C 4.5 0 0 4.5 0 10 L 0 14 L -2 14 C -3.1 14 -4 14.9 -4 16 L -4 28 C -4 29.1 -3.1 30 -2 30 L 22 30 C 23.1 30 24 29.1 24 28 L 24 16 C 24 14.9 23.1 14 22 14 L 20 14 L 20 10 C 20 4.5 15.5 0 10 0 Z M 10 4 C 13.3 4 16 6.7 16 10 L 16 14 L 4 14 L 4 10 C 4 6.7 6.7 4 10 4 Z" fill="#64748b" fill-opacity="0.9"/>
          </g>

          <!-- Dimmed Framework Title -->
          <text x="72" y="77" fill="#64748b" font-size="${fontSize}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">${title}</text>

          <!-- Dimmed Divider Line -->
          <line x1="20" y1="92" x2="124" y2="92" stroke="#1e293b" stroke-width="1.5" stroke-opacity="0.8"/>

          <!-- Locked Status -->
          <text x="72" y="117" fill="#475569" font-size="14.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1.5">LOCKED</text>
        </svg>
      `);
    }

    const fontSize = title.length > 7 ? "23" : title.length > 5 ? "26" : "29";
    const subFontSize = subtitle.length > 8 ? "15" : "17";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <!-- Minimal Cyber Card -->
        <rect width="144" height="144" rx="24" fill="#070b14" stroke="${borderColor}" stroke-width="2.5"/>
        <rect width="144" height="144" rx="24" fill="${borderColor}" fill-opacity="0.05"/>

        <!-- Large Crisp Framework Title -->
        <text x="72" y="65" fill="#ffffff" font-size="${fontSize}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1.2">${title}</text>

        <!-- Accent Divider Line -->
        <line x1="18" y1="82" x2="126" y2="82" stroke="${borderColor}" stroke-width="2" stroke-opacity="0.6"/>

        <!-- High-Contrast Subtitle -->
        <text x="72" y="117" fill="${textColor}" font-size="${subFontSize}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">${subtitle}</text>
      </svg>
    `);
  }

  static renderVidToCodeOptionKey(
    title: string,
    subtitle: string,
    borderColor = "#a855f7",
    textColor = "#ffffff",
    isLocked = false
  ): string {
    return this.renderImgToCodeOptionKey(title, subtitle, borderColor, textColor, isLocked);
  }

  static renderOpenCodeKey(isReady = false): string {
    const borderColor = isReady ? "#22c55e" : "#a855f7";
    const subColor = isReady ? "#4ade80" : "#c084fc";
    const subText = isReady ? "INSPECT ↗" : "NO CODE";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="24" fill="#070b14" stroke="${borderColor}" stroke-width="2.5"/>
        <circle cx="72" cy="72" r="50" fill="${borderColor}" fill-opacity="0.04"/>

        <!-- Eye Icon -->
        <g transform="translate(48, 16)">
          <path d="M 0 18 Q 24 0 48 18 Q 24 36 0 18 Z" fill="none" stroke="${borderColor}" stroke-width="2.5"/>
          <circle cx="24" cy="18" r="7" fill="${borderColor}"/>
        </g>

        <!-- Main Title -->
        <text x="72" y="76" fill="#ffffff" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">OPEN CODE</text>

        <!-- Divider Line -->
        <line x1="16" y1="88" x2="128" y2="88" stroke="${borderColor}" stroke-width="1.5" stroke-opacity="0.5"/>

        <!-- Subtitle -->
        <text x="72" y="120" fill="${subColor}" font-size="15" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">${subText}</text>
      </svg>
    `);
  }

  static renderLivePreviewKey(isReady = false): string {
    if (!isReady) {
      return this.renderEmptyTile();
    }

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="24" fill="#070b14" stroke="#06b6d4" stroke-width="2.6"/>
        <circle cx="72" cy="72" r="50" fill="#06b6d4" fill-opacity="0.04"/>

        <!-- Sleek Monitor Window & Play Icon -->
        <g transform="translate(48, 16)">
          <rect x="0" y="0" width="48" height="36" rx="8" fill="#0891b2" fill-opacity="0.25" stroke="#22d3ee" stroke-width="2"/>
          <polygon points="20,10 34,18 20,26" fill="#38bdf8"/>
        </g>

        <!-- Main Title -->
        <text x="72" y="77" fill="#ffffff" font-size="17" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">PREVIEW</text>

        <!-- Divider Line -->
        <line x1="16" y1="90" x2="128" y2="90" stroke="#06b6d4" stroke-width="1.5" stroke-opacity="0.5"/>

        <!-- Subtitle -->
        <text x="72" y="121" fill="#38bdf8" font-size="15" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">RUN LIVE ↗</text>
      </svg>
    `);
  }

  /**
   * 4-Key Animated Cyber Banner for Bottom Row in UI-to-Code Submenu:
   * Keys (0, 2), (1, 2), (2, 2), (3, 2)
   */
  static renderBottomBannerTile(
    index: number,
    mode: "idle" | "spark" | "preview" | "success" | "failed" | "recording" | "aiming" | "too_small" | "static_screen",
    activeStep = 0,
    countdownSeconds = 5
  ): string {
    if (mode === "idle") {
      return this.renderEmptyTile();
    }

    let borderColor = "#f59e0b";
    let bgOpacity = "0.06";
    let mainText = "";
    let subText = "";
    let subColor = "#fbbf24";
    const isStepActive = index === activeStep;

    if (mode === "aiming") {
      borderColor = isStepActive ? "#38bdf8" : "#0369a1";
      bgOpacity = isStepActive ? "0.28" : "0.06";
      subColor = isStepActive ? "#7dd3fc" : "#38bdf8";
      const bannerData = [
        { main: "SELECT", sub: "DRAG AREA" },
        { main: "AIM", sub: "CROSSHAIR +" },
        { main: "5 SEC", sub: "FLOW REC" },
        { main: "CANCEL", sub: "ESC KEY" },
      ];
      mainText = bannerData[index].main;
      subText = bannerData[index].sub;
    } else if (mode === "recording") {
      borderColor = isStepActive ? "#ef4444" : "#991b1b";
      bgOpacity = isStepActive ? "0.32" : "0.08";
      subColor = isStepActive ? "#fca5a5" : "#ef4444";
      const bannerData = [
        { main: "● REC", sub: "RECORDING" },
        { main: "FLOW", sub: "SCREEN" },
        { main: `0:0${Math.max(1, countdownSeconds)}`, sub: "REMAINING" },
        { main: "STOP ⏹", sub: "FINISH EARLY" },
      ];
      mainText = bannerData[index].main;
      subText = bannerData[index].sub;
    } else if (mode === "too_small") {
      borderColor = "#ef4444";
      bgOpacity = "0.25";
      subColor = "#fca5a5";
      const bannerData = [
        { main: "AREA", sub: "TOO SMALL" },
        { main: "MINIMUM", sub: "120x120 PX" },
        { main: "REJECTED", sub: "TRY AGAIN" },
        { main: "DRAG", sub: "LARGER BOX" },
      ];
      mainText = bannerData[index].main;
      subText = bannerData[index].sub;
    } else if (mode === "static_screen") {
      borderColor = "#f59e0b";
      bgOpacity = "0.25";
      subColor = "#fde047";
      const bannerData = [
        { main: "STATIC", sub: "NO MOTION" },
        { main: "IDENTICAL", sub: "FRAMES" },
        { main: "PLEASE USE", sub: "IMG TO CODE" },
        { main: "CANCELLED", sub: "NO TOKENS" },
      ];
      mainText = bannerData[index].main;
      subText = bannerData[index].sub;
    } else if (mode === "spark") {
      borderColor = isStepActive ? "#f59e0b" : "#78350f";
      bgOpacity = isStepActive ? "0.26" : "0.04";
      subColor = isStepActive ? "#fde047" : "#d97706";
      const bannerData = [
        { main: "WAIT", sub: "AI CODE" },
        { main: "FOR", sub: "GENERATION" },
        { main: "MUSE", sub: "SYNTHESIS" },
        { main: "SPARK", sub: "~40 SEC" },
      ];
      mainText = bannerData[index].main;
      subText = bannerData[index].sub;
    } else if (mode === "preview") {
      borderColor = isStepActive ? "#06b6d4" : "#0e7490";
      bgOpacity = isStepActive ? "0.28" : "0.05";
      subColor = isStepActive ? "#67e8f9" : "#0891b2";
      const bannerData = [
        { main: "CREATING", sub: "SWIFTC..." },
        { main: "PREVIEW", sub: "COMPILING" },
        { main: "LIVE", sub: "MACOS" },
        { main: "APP", sub: "STARTING" },
      ];
      mainText = bannerData[index].main;
      subText = bannerData[index].sub;
    } else if (mode === "success") {
      borderColor = "#22c55e";
      bgOpacity = "0.22";
      subColor = "#86efac";
      const bannerData = [
        { main: "PREVIEW", sub: "MACOS" },
        { main: "APP", sub: "WINDOW" },
        { main: "LIVE ON", sub: "RUNNING" },
        { main: "SCREEN", sub: "READY" },
      ];
      mainText = bannerData[index].main;
      subText = bannerData[index].sub;
    } else if (mode === "failed") {
      borderColor = "#ef4444";
      bgOpacity = "0.22";
      subColor = "#fca5a5";
      const bannerData = [
        { main: "BUILD", sub: "ERROR" },
        { main: "FAILED", sub: "LOG" },
        { main: "CHECK", sub: "INSPECT" },
        { main: "XCODE", sub: "EDITOR" },
      ];
      mainText = bannerData[index].main;
      subText = bannerData[index].sub;
    }

    const strokeWidth = isStepActive ? "3.2" : "2";
    const mainFontSize = mainText.length > 7 ? "24" : mainText.length > 5 ? "26" : "30";
    const subFontSize = subText.length > 9 ? "15" : "17";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <!-- Sleek Card Container -->
        <rect width="144" height="144" rx="24" fill="#070b14" stroke="${borderColor}" stroke-width="${strokeWidth}"/>
        <rect width="144" height="144" rx="24" fill="${borderColor}" fill-opacity="${bgOpacity}"/>

        <!-- Big Bold Main Title (No tiny badges, ultra-legible) -->
        <text x="72" y="65" fill="#ffffff" font-size="${mainFontSize}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1.5">${mainText}</text>

        <!-- Divider Line -->
        <line x1="18" y1="82" x2="126" y2="82" stroke="${borderColor}" stroke-width="2" stroke-opacity="0.6"/>

        <!-- Large Turuncu / Accent Subtitle -->
        <text x="72" y="116" fill="${subColor}" font-size="${subFontSize}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">${subText}</text>
      </svg>
    `);
  }

  /**
   * Key 7: Vid to Code Key (Replaces legacy Run Muse)
   */
  static renderRunMuseKey(): string {
    return this.renderVidToCodeKey();
  }

  static renderVidToCodeKey(status: "idle" | "recording" | "generating" | "ready" = "idle"): string {
    const borderColor = status === "recording" ? "#ef4444" : status === "generating" ? "#f59e0b" : status === "ready" ? "#22c55e" : "#a855f7";
    const subText = status === "recording" ? "RECORDING..." : status === "generating" ? "SPARKING..." : status === "ready" ? "READY ↗" : "VID TO CODE";
    const subColor = status === "recording" ? "#f87171" : status === "generating" ? "#fbbf24" : status === "ready" ? "#4ade80" : "#ffffff";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <!-- Matching ImgToCode edge-to-edge container with neon violet border -->
        <rect width="144" height="144" rx="24" fill="#070b14" stroke="${borderColor}" stroke-width="2.5"/>
        <circle cx="72" cy="72" r="50" fill="${borderColor}" fill-opacity="0.04"/>

        <!-- Ambient Circle Glow -->
        <circle cx="72" cy="46" r="32" fill="#581c87" fill-opacity="0.35" stroke="${borderColor}" stroke-width="2" stroke-dasharray="6, 5"/>

        <!-- Video Card on left (matching ImgToCode card dimensions) -->
        <g transform="translate(24, 30)">
          <rect x="0" y="0" width="34" height="28" rx="6" fill="#6b21a8" fill-opacity="0.45" stroke="#c084fc" stroke-width="2.2"/>
          <!-- Play triangle -->
          <polygon points="12,8 23,14 12,20" fill="#f5d0fe"/>
          <!-- Recording indicator dot -->
          <circle cx="27" cy="7" r="2.8" fill="#ef4444"/>
        </g>

        <!-- Transformation Arrow in center -->
        <path d="M 66 44 L 78 44 M 73 39 L 78 44 L 73 49" fill="none" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

        <!-- Code Brackets Card on right -->
        <g transform="translate(86, 30)">
          <rect x="0" y="0" width="34" height="28" rx="6" fill="#042f2e" fill-opacity="0.5" stroke="#2dd4bf" stroke-width="2.2"/>
          <path d="M 12 9 L 6 14 L 12 19" fill="none" stroke="#5eead4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M 22 9 L 28 14 L 22 19" fill="none" stroke="#5eead4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="18" y1="8" x2="16" y2="20" stroke="#2dd4bf" stroke-width="2" stroke-linecap="round"/>
        </g>

        <!-- Single Line Crisp Label (NO redundant flow/rec text) -->
        <text x="72" y="118" fill="${subColor}" font-size="16.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${subText}</text>
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
        <text x="72" y="115" fill="#ffffff" font-size="23" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">HALT</text>
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
   * Key 10: Record Screen Flow directly to Terminal Prompt
   */
  static renderRecordFlowKey(
    status: "idle" | "aiming" | "recording" | "too_small" | "pasted" = "idle",
    countdown = 5
  ): string {
    switch (status) {
      case "aiming":
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#0c2333" stroke="#38bdf8" stroke-width="4"/>
            <!-- Reticle Crosshair -->
            <circle cx="72" cy="46" r="24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="5,4"/>
            <circle cx="72" cy="46" r="6" fill="#38bdf8"/>
            <line x1="72" y1="16" x2="72" y2="34" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
            <line x1="72" y1="58" x2="72" y2="76" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
            <line x1="42" y1="46" x2="60" y2="46" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
            <line x1="84" y1="46" x2="102" y2="46" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
            <text x="72" y="102" fill="#ffffff" font-size="21" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">AIM +</text>
            <text x="72" y="122" fill="#7dd3fc" font-size="13" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">DRAG RECT</text>
          </svg>
        `);

      case "recording":
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#450a0a" stroke="#ef4444" stroke-width="5"/>
            <!-- Pulsing Record Circle -->
            <circle cx="72" cy="44" r="22" fill="#ef4444"/>
            <circle cx="72" cy="44" r="10" fill="#ffffff"/>
            <text x="72" y="100" fill="#ffffff" font-size="21" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">REC ${countdown}s</text>
            <text x="72" y="122" fill="#fecaca" font-size="13" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">TAP TO STOP</text>
          </svg>
        `);

      case "too_small":
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#3f1313" stroke="#f59e0b" stroke-width="4"/>
            <!-- Warning Triangle -->
            <polygon points="72,20 96,62 48,62" fill="#f59e0b" stroke="#fde047" stroke-width="2.5" stroke-linejoin="round"/>
            <text x="72" y="55" fill="#000000" font-size="22" font-weight="900" text-anchor="middle">!</text>
            <text x="72" y="100" fill="#fef08a" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">TOO SMALL</text>
            <text x="72" y="122" fill="#fca5a5" font-size="13" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">MIN 120x120</text>
          </svg>
        `);

      case "pasted":
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#052e16" stroke="#22c55e" stroke-width="4.5"/>
            <!-- Emerald Check Badge -->
            <circle cx="72" cy="46" r="26" fill="#15803d" stroke="#86efac" stroke-width="2.5"/>
            <path d="M58 46 L68 56 L86 38" fill="none" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="72" y="100" fill="#ffffff" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">[VIDEO]</text>
            <text x="72" y="122" fill="#86efac" font-size="14" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">PASTED ✓</text>
          </svg>
        `);

      case "idle":
      default:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <defs>
              <linearGradient id="cyberVioletBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#120a26"/>
                <stop offset="100%" stop-color="#090514"/>
              </linearGradient>
            </defs>
            <rect width="144" height="144" rx="26" fill="url(#cyberVioletBg)" stroke="#a855f7" stroke-width="3"/>
            <!-- Cinema Camera Silhouette in Cyber Violet -->
            <g fill="#c084fc">
              <!-- Left Reel -->
              <circle cx="53" cy="37" r="13"/>
              <circle cx="53" cy="37" r="4.5" fill="#120a26"/>
              <!-- Right Reel (Larger) -->
              <circle cx="75" cy="32" r="16.5"/>
              <circle cx="75" cy="32" r="5.5" fill="#120a26"/>
              <!-- Camera Body -->
              <rect x="49" y="49" width="40" height="28" rx="4"/>
              <!-- Lens Funnel -->
              <polygon points="89,58 101,51 101,75 89,68"/>
              <!-- Lens Rim -->
              <rect x="101" y="49" width="4" height="28" rx="1.5"/>
              <!-- Tripod Mount -->
              <polygon points="65,77 73,77 75,82 63,82"/>
            </g>
            <text x="72" y="104" fill="#ffffff" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">VIDEO</text>
            <text x="72" y="124" fill="#e9d5ff" font-size="13" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">RECORD</text>
          </svg>
        `);
    }
  }

  static renderPromptKey(): string {
    return this.renderRecordFlowKey("idle");
  }

  /**
   * Key 11: Write Tests Key
   */
  static renderTestsKey(): string {
    return CyberIcons["p1_write-tests"];
  }

  /**
   * Key 12: Muse Ops Key
   */
  static renderMuseOpsKey(): string {
    const crosshairB64 = "iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAALcElEQVR4nO1ce4zcVRU+d2e72+7S0pY+7AOBGApiAbVFTI2IIiIoqPFRFGhAKRj7jwZDiBhj0EikCUgkAkZEKrUNpmCQR3zUQpASRcFSSUPLSyiP8ip9Utrd/cw3852Zs7/+pu2Wbvdu25NMZube+7uP755zz7nnnBmzTAhAC4AE4P0AfgxgopcN9NwGDUFgAZgB4KP63DLQ8xpUBKADwBf1OXvuy2p3AbSmlDab2YkAzkqJEp03B2YzOdS4rRvAUDNrM7PzAZybUuoBULFMKRsAA3Wb2XQzI5CPCFhYppQjgBUzoxifZGbHU4zNLNuzMCcAk8Aab2YfNrNOM5vodZYp5QRgUYy3mtlz+t5jmVJOAELvG81svZm1mtmk3DkwRyO6AmAlgC4Ah6ssp43uRTlObLi4j8pkVsbzzG5iSe+jzWyCPr9umVNOADoNCfN60TKnHDlwlMSXdLBlTjlq4a3hM82ZrClHDmwL8xpjmVNOAELva8zsbX0+pF5Zc7ZmZw/SXNjrhJpd19IEwPbAjcMK1zy3F/lsj5ftNxyIGhe10EWVUuoqvPy8e97MXtLnKpAppW0AhgEYR9DYVr7Cyn7DgQAqAokLP8zMzjSzd5vZJgF2q5ypo4PoMi7SKgfDeWb2KADWHWpmc9mfOLLq8sqBI/uFoKsYgPEAbgKwDtvTu9TmPQA2q2wugC8AuEPf3wLwhj5fB+CcwjjZnZHviFCLqjl45wB4qQDaKgBXA5gGoE3tDgHwsup/ItFtF5AXA/hfeJ5Afx3AsQCG7FMgIjgAAPw2LHoLgAUAPg9gdNkzAO5S2xtL+poE4IcAXgx9bgRwbXg+J+viHXlWRgGYFRb6OIBPFdq2hoXTE0PtsFDt79T3il71M1t9zwbAc9DpPiqaQQ0iGmBQATwrtxTEhRODaFfB0ncHqU118/TMDSpvD/1W24bxLlJbamrScnKpt7XBRKgtjhzVCWBJ4AwGh0aoTevOjGOJI+nMkrpKeHZIOF/f1vFAWgFgwqDjRAgcAAxJQtzHxVSvZM3sNgIB4OMALgPwNwDP6PkXACwC8G0AR4b2kXsd0Gkazzl+qTaz3jZrQiO3hWbIK2EhJzThvFadYxcCeD5w61YAjAWX0T8AfC72E/uWlu5RH1UtrvIBN7h3SmgoANegpL/7eVdsG86vNwE8Ro0rc2Q4gCuDEnkvgMsB3BP6/TVTQJqAeKnOw20C8gNlc8iK0ADkY0F0eSZNL+MAgU2wfuR5MIX6S9TPlYXyaQKP9ADP2gKIbkteFcCeVzaHrAg1QLjLtwfx+1aJ6Hq7oTJvhpdo4STj2m8i3j7agnNUf1esc8NdXNutufDWc5zXW26Exu6PlzhC2nCKOw9UHwHgIkcVOSNw8nz1c1VBPCtB8/5cbS4uttH7zwIXLiyOlQ2hAdCxQXE8WKhL4ZD/cni2l3YMi79J3PPLZgpIn//DszG2cdNIYD+pfjYBOCrOaU9Ryx7s4wzFMugRmed18sIQ1NlmdoP7+JTK1sx7MlIelvv0vd5Oz3imwkwzuzG6/1VPlxm//0r9dMijU21iOREkptK4rkCOLmhmmiyrZd60N7slBC5aIM/LiN3xRAdOnq45dfsVst/EONhxzv5+IDtAscxfFYHD1zJNdg2dBCqrXsHCQi7T9/Zwv41no4v6cXQ2FMpSyYt9jXSTptDOr4D3auwFmtPQMGd/+Vzqd+6S9dY3co/nbgMYC2C9Jvq7kvrZOovqCy1psx1n7GiSYTGTtEGliwLwU81rifUDVT0hygI9wszW6Uz7oJk9oTSLFUp45AJfUOIjQ49dSj8bpvqqScLEICkKepu3mNndZvZJnVEXAHhKfXSpz+dSSo8Gl74f9IyD9Aprqpzam6L+CstSSrzuTeEa1IabxHOQd+8pSpUjjQMwM8yZoYMxmstKnatrtbb3mdlyBbi2KT69Qv09aWbHyJP+cp0lzewKJTYSPBq3qzTA03Khj1PmFM2Ibr2Gx/XpgGZ55CZOoGp67ID+a2Y3m9k1As7BqAaTKKZm9qAW3ikAV2vMN81sqpn9U6BNFggxNLC7tFljcLxlZkaNv1Rj3MmxyYGfMLPZQvtLmiDJL+/TQocH7WCwpHeC94a4eb02YYg24GHl/E3SJA5SCJOek7FlSeUSS27CX5VsRDBJvZyxZnZ6k3mx/6riCtQjcFyanBkeMrOjNF+Oy5vN1ZKmRSml28XhDGpVQ6+c8Xg9sF6TIxufIhFjB4+p80ma9BRx5Tgze0tiykXPEWv/3sy+o/66VXehuOv8lBJ9fUM0+ZFqt8UnFEBzUySCOUIiOUz9co4nmtn3ZLJcp82YYWavKrfmCokkN+5yAbZKiUvsj+NyvDEppaUKeDE+85qYgQGvjpTSGj/ufI57LIiFmsbyYM810bzR55NVN9/b78YYpRFEAF+R4+DUkroUXP8Ld2GMPtvFrQXN5RnxsSNH2cOHVtJ+uJktNrOzuGshcE7lxDaPa8c/Q3eXmdHf50Z3tX+Jr5955IzTzOzelNJG1XeFoDqJBvpWcf4GnpFh3OrY4jwqHXLyYo3ZqiOhSFWlVQJifX7WH4SGzXW8nAkri04Cfb61ECiq7MCQPk9tp5ZxRujzbLX7UzG2ovfTo2mVqzOhoveZ8uPNj6m5wQidJhfXBt5Liz66YBjT0H1YN5rpTRwRrTLWPcR5cpxL6O9gustkbOf9w0U0FsYJzykYuw4yw5GkO8Jz0ZTi+wSBjHAbKfPYXK82i0ra5A1WGaEBBDnos77rXheuSXdr4deqjd+Vve3kAOBHVObXKgfvu7rf0mg/MiqsEGPpCH0PDjBRmzAdAKdKpEcU6lq0uD8IoD+W9HFMCFFOFQBtoZ7gQW3OaCLi1TjMoCfUzqD67gcuGxtiHP8Wx3bKI32EHLLd0tj+LM+83+iZ1wCctgPxPtuf7W/u65fOUQOqmi3loJVcz3g74BlHd/u/9OgDfj+W6XGpjGUaz1+TwU+nwCW8P8un2OVj6k7PPlt061ndryZIfxN6i179YC8zJ4Lpc6hyXVBIImJmw0lNAuxu/vB3xjdn6brvC6Hhk+tQesZFsa7QpmjOTJC5w2DQVxUg6miS8RXPvnOV1fX9mAoyKAkNcJiaRncT5Jdr35nvTxr3KXmk3Q3v5e7hrppMKh8jk4bn4kPasKoDZLCDWNH7N4Io3hNEtW5k+3e9H60g0DqZKNVInANYGOOUkEtYtQllBg1I7nd/ceFQRcec7udZVdK2TSZLzHGZUdIvxfNDCr6T6yCweYW8wPuzfYHQAPEw2nwFpbBYodDOwjPkylfVbla4Z39aCuLpQu4MjenbaDL583tzjf2+Uwh+MwDflO+OHm5Sl1zzf5FfcKv8eXS9V+RGJyCHlzhFSb+Qn3FtSun1kMi+bxF6a84Jis49IW3bV6KBfYu4s9cPcQZibXt1UAQOoYamG5+BJv2EgSJIcabB3Uus5UFeonjEIyml5WVGu+0PhEKKrso6dU5O0X9nrRW3Xa/zb7twaC5Ogr2u7lONU+IPZFjGEOEmATMqpG7wqrYsGNts3+O/dLIMaMDspVQDsvj7N8jdvl4BrMnNYsS5UBaWelLCkBwOmxQSJXkULNvzLQsAY1BJYkpzhlQPdeZK2QCIhr1Ie8/vwJ75cIADd4VCFgIzG0zhyqw2ukhZTSw1bDk3c9Z6lWVKOXJgJfzZxLNeZZlSS2bcV1GOzJ9V7Nr4AAfuohKhC4vXOE9EH+rVlillw4GBOkI+YfVX7DlTjgBuCHag35QOiHAfN5U+Qp6Ft6jsgAj34SbChM25Aq3+E9dcKSsRTjVNTLE9QcnpTbP6c6GsABTRTfUDcSKz50kHRLgPRHOG17nbwh8xHlAifSBPC6Yj4X4vs0wpRxE2nYXP6PcqWdP/AbqQft8op9xeAAAAAElFTkSuQmCC";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="opsBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#180e29"/>
            <stop offset="100%" stop-color="#090514"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="26" fill="url(#opsBg)" stroke="#c084fc" stroke-width="3"/>
        <circle cx="72" cy="48" r="38" fill="#a855f7" fill-opacity="0.12"/>
        
        <!-- Exact Clean Crosshair from user reference -->
        <image href="data:image/png;base64,${crosshairB64}" xlink:href="data:image/png;base64,${crosshairB64}" x="36" y="12" width="72" height="72"/>

        <text x="72" y="107" fill="#ffffff" font-size="16" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">MUSE</text>
        <text x="72" y="126" fill="#c084fc" font-size="16" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">OPS</text>
      </svg>
    `);
  }

  /**
   * Render Ops Submenu Card
   */
  static renderOpsCard(line1: string, line2: string, borderColor: string, textColor: string): string {
    const l1Size = line1.length > 7 ? 20 : 25;
    const l2Size = line2.length > 7 ? 20 : 25;
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#060913" stroke="${borderColor}" stroke-width="3"/>
        <circle cx="72" cy="72" r="54" fill="${borderColor}" fill-opacity="0.08"/>
        <text x="72" y="58" fill="#ffffff" font-size="${l1Size}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${line1}</text>
        <text x="72" y="94" fill="${textColor}" font-size="${l2Size}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${line2}</text>
      </svg>
    `);
  }

  static renderFixBugKey(): string {
    return this.renderMuseOpsKey();
  }

  /**
   * Key 13: Git Commit Key with safe focus & repo states
   */
  static renderGitCommitKey(
    status: "idle" | "no_focus" | "no_git" | "clean" | "committing" | "committed" = "idle"
  ): string {
    switch (status) {
      case "no_focus":
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#2b1604" stroke="#f59e0b" stroke-width="4"/>
            <!-- Warning Triangle -->
            <polygon points="72,20 96,62 48,62" fill="#f59e0b" stroke="#fde047" stroke-width="2.5" stroke-linejoin="round"/>
            <text x="72" y="55" fill="#000000" font-size="22" font-weight="900" text-anchor="middle">!</text>
            <text x="72" y="102" fill="#fef08a" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">NO FOCUS</text>
            <text x="72" y="123" fill="#fca5a5" font-size="13" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">TERMINAL</text>
          </svg>
        `);

      case "no_git":
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#2b1604" stroke="#f59e0b" stroke-width="4"/>
            <polygon points="72,20 96,62 48,62" fill="#f59e0b" stroke="#fde047" stroke-width="2.5" stroke-linejoin="round"/>
            <text x="72" y="55" fill="#000000" font-size="22" font-weight="900" text-anchor="middle">?</text>
            <text x="72" y="102" fill="#fef08a" font-size="19" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">NO GIT</text>
            <text x="72" y="123" fill="#fca5a5" font-size="13" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">NOT REPO</text>
          </svg>
        `);

      case "clean":
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#041c30" stroke="#0284c7" stroke-width="4"/>
            <!-- Blue Check Badge -->
            <circle cx="72" cy="46" r="26" fill="#0369a1" stroke="#38bdf8" stroke-width="2.5"/>
            <path d="M58 46 L68 56 L86 38" fill="none" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="72" y="102" fill="#ffffff" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">CLEAN</text>
            <text x="72" y="123" fill="#7dd3fc" font-size="13" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">UP TO DATE ✓</text>
          </svg>
        `);

      case "committing":
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#041c30" stroke="#38bdf8" stroke-width="4.5"/>
            <!-- Pulsing Commit Nodes -->
            <circle cx="72" cy="46" r="24" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,4"/>
            <circle cx="72" cy="46" r="10" fill="#38bdf8"/>
            <text x="72" y="102" fill="#ffffff" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">COMMIT</text>
            <text x="72" y="123" fill="#7dd3fc" font-size="13" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">STAGING...</text>
          </svg>
        `);

      case "committed":
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#052e16" stroke="#22c55e" stroke-width="4.5"/>
            <!-- Emerald Check Badge -->
            <circle cx="72" cy="46" r="26" fill="#15803d" stroke="#86efac" stroke-width="2.5"/>
            <path d="M58 46 L68 56 L86 38" fill="none" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="72" y="102" fill="#ffffff" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">GIT</text>
            <text x="72" y="123" fill="#86efac" font-size="13" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">COMMITTED ✓</text>
          </svg>
        `);

      case "idle":
      default:
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <defs>
              <linearGradient id="gitIdleBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#041424"/>
                <stop offset="100%" stop-color="#020912"/>
              </linearGradient>
            </defs>
            <rect width="144" height="144" rx="26" fill="url(#gitIdleBg)" stroke="#0284c7" stroke-width="3"/>
            <!-- Git Branch & Node Vector Graph -->
            <g>
              <line x1="50" y1="20" x2="50" y2="76" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
              <path d="M50 32 C50 50, 92 40, 92 58" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
              <circle cx="50" cy="32" r="6.5" fill="#38bdf8"/>
              <circle cx="50" cy="32" r="2.5" fill="#041424"/>
              <circle cx="50" cy="66" r="6.5" fill="#38bdf8"/>
              <circle cx="50" cy="66" r="2.5" fill="#041424"/>
              <circle cx="92" cy="58" r="9" fill="none" stroke="#7dd3fc" stroke-width="2" stroke-dasharray="3,2"/>
              <circle cx="92" cy="58" r="6" fill="#38bdf8"/>
              <circle cx="92" cy="58" r="2" fill="#ffffff"/>
            </g>
            <text x="72" y="112" fill="#ffffff" font-size="17" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">GIT COMMIT</text>
          </svg>
        `);
    }
  }

  static renderGitCommandsKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="gitCmdBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#041424"/>
            <stop offset="100%" stop-color="#020912"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="26" fill="url(#gitCmdBg)" stroke="#0284c7" stroke-width="3"/>
        <!-- Git Branch & Node Vector Graph -->
        <g>
          <line x1="50" y1="20" x2="50" y2="76" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
          <path d="M50 32 C50 50, 92 40, 92 58" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
          <circle cx="50" cy="32" r="6.5" fill="#38bdf8"/>
          <circle cx="50" cy="32" r="2.5" fill="#041424"/>
          <circle cx="50" cy="66" r="6.5" fill="#38bdf8"/>
          <circle cx="50" cy="66" r="2.5" fill="#041424"/>
          <circle cx="92" cy="58" r="9" fill="none" stroke="#7dd3fc" stroke-width="2" stroke-dasharray="3,2"/>
          <circle cx="92" cy="58" r="6" fill="#38bdf8"/>
          <circle cx="92" cy="58" r="2" fill="#ffffff"/>
        </g>
        <text x="72" y="112" fill="#ffffff" font-size="15" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.3">GIT COMMANDS</text>
      </svg>
    `);
  }

  static renderCommitKey(): string {
    return this.renderGitCommandsKey();
  }

  static renderGitStatusSubKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#041424" stroke="#0ea5e9" stroke-width="3"/>
        <!-- Radar / Status Target Icon -->
        <circle cx="72" cy="46" r="24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,3"/>
        <circle cx="72" cy="46" r="14" fill="#0369a1" stroke="#38bdf8" stroke-width="2"/>
        <circle cx="72" cy="46" r="5" fill="#ffffff"/>
        <text x="72" y="112" fill="#ffffff" font-size="17" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.4">GIT STATUS</text>
      </svg>
    `);
  }

  static renderGitPullKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#041424" stroke="#0284c7" stroke-width="3"/>
        <!-- Pull Downward Arrow -->
        <circle cx="72" cy="46" r="24" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2"/>
        <path d="M72 32 L72 58 M60 48 L72 60 L84 48" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="112" fill="#ffffff" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">GIT PULL</text>
      </svg>
    `);
  }

  static renderGitPushKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#041424" stroke="#0284c7" stroke-width="3"/>
        <!-- Push Upward Arrow -->
        <circle cx="72" cy="46" r="24" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2"/>
        <path d="M72 60 L72 34 M60 44 L72 32 L84 44" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="112" fill="#ffffff" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">GIT PUSH</text>
      </svg>
    `);
  }

  static renderGitDiffKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#041424" stroke="#0ea5e9" stroke-width="3"/>
        <!-- Diff Split Plus/Minus -->
        <rect x="48" y="28" width="48" height="36" rx="4" fill="#0369a1" stroke="#38bdf8" stroke-width="2"/>
        <text x="60" y="52" fill="#86efac" font-size="18" font-weight="900" text-anchor="middle">+</text>
        <text x="84" y="52" fill="#fca5a5" font-size="18" font-weight="900" text-anchor="middle">−</text>
        <text x="72" y="112" fill="#ffffff" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">GIT DIFF</text>
      </svg>
    `);
  }

  static renderGitStashSaveKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#0f172a" stroke="#6366f1" stroke-width="3"/>
        <!-- Stash Box / Tray Icon -->
        <rect x="50" y="32" width="44" height="28" rx="4" fill="#312e81" stroke="#818cf8" stroke-width="2"/>
        <path d="M72 24 L72 44 M64 36 L72 44 L80 36" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="112" fill="#ffffff" font-size="17" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.4">STASH SAVE</text>
      </svg>
    `);
  }

  static renderGitStashPopKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#0f172a" stroke="#6366f1" stroke-width="3"/>
        <!-- Stash Pop Upward Arrow -->
        <rect x="50" y="34" width="44" height="28" rx="4" fill="#312e81" stroke="#818cf8" stroke-width="2"/>
        <path d="M72 46 L72 26 M64 34 L72 26 L80 34" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="112" fill="#ffffff" font-size="17" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.4">STASH POP</text>
      </svg>
    `);
  }

  static renderGitDiscardKey(isConfirming = false): string {
    const stroke = isConfirming ? "#ef4444" : "#f59e0b";
    const bg = isConfirming ? "#3b0707" : "#1f1305";
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="${bg}" stroke="${stroke}" stroke-width="${isConfirming ? 4.5 : 3}"/>
        <!-- Trash / Rollback Icon -->
        <circle cx="72" cy="46" r="22" fill="none" stroke="${stroke}" stroke-width="2.5"/>
        <path d="M60 46 A12 12 0 1 1 76 58" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
        <polygon points="56,40 60,48 68,44" fill="#ffffff"/>
        ${
          isConfirming
            ? `<text x="72" y="100" fill="#fca5a5" font-size="17" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">CONFIRM?</text>
               <text x="72" y="122" fill="#ffffff" font-size="14" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">TAP TO WIPE</text>`
            : `<text x="72" y="112" fill="#ffffff" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">DISCARD</text>`
        }
      </svg>
    `);
  }

  static renderGitMainKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#041424" stroke="#10b981" stroke-width="3"/>
        <!-- Branch Crown / Trunk Icon -->
        <circle cx="72" cy="46" r="24" fill="#064e3b" stroke="#34d399" stroke-width="2"/>
        <path d="M60 40 L72 30 L84 40 L80 56 L64 56 Z" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="112" fill="#ffffff" font-size="16" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.3">MAIN BRANCH</text>
      </svg>
    `);
  }

  static renderGitPrKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#0b0f19" stroke="#8b5cf6" stroke-width="3"/>
        <!-- PR Merge Git Icon -->
        <circle cx="58" cy="38" r="7" fill="none" stroke="#c084fc" stroke-width="2.5"/>
        <circle cx="58" cy="58" r="7" fill="none" stroke="#c084fc" stroke-width="2.5"/>
        <line x1="58" y1="45" x2="58" y2="51" stroke="#c084fc" stroke-width="2.5"/>
        <circle cx="86" cy="48" r="7" fill="#8b5cf6" stroke="#e9d5ff" stroke-width="2.5"/>
        <path d="M58 38 C74 38, 74 48, 79 48" fill="none" stroke="#c084fc" stroke-width="2.5"/>
        <text x="72" y="112" fill="#ffffff" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">CREATE PR</text>
      </svg>
    `);
  }

  static renderGitRepoKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#0b0f19" stroke="#3b82f6" stroke-width="3"/>
        <!-- GitHub Octocat / Browser Icon -->
        <circle cx="72" cy="46" r="22" fill="#1e3a8a" stroke="#60a5fa" stroke-width="2"/>
        <path d="M62 46 C62 38, 82 38, 82 46 C82 54, 62 54, 62 46" fill="none" stroke="#ffffff" stroke-width="2.5"/>
        <line x1="72" y1="26" x2="72" y2="66" stroke="#ffffff" stroke-width="2"/>
        <text x="72" y="112" fill="#ffffff" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">OPEN REPO</text>
      </svg>
    `);
  }

  static renderGitLogKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#041424" stroke="#0ea5e9" stroke-width="3"/>
        <!-- Git Log List Icon -->
        <circle cx="56" cy="36" r="5" fill="#38bdf8"/>
        <line x1="68" y1="36" x2="92" y2="36" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <circle cx="56" cy="48" r="5" fill="#38bdf8"/>
        <line x1="68" y1="48" x2="92" y2="48" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <circle cx="56" cy="60" r="5" fill="#38bdf8"/>
        <line x1="68" y1="60" x2="92" y2="60" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <text x="72" y="112" fill="#ffffff" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">GIT LOG</text>
      </svg>
    `);
  }

  // ==========================================
  // --- MUSE MEMORY & LIVING FILES SUBMENU ---
  // ==========================================

  /**
   * Page 1 Key 11: MUSE MEMORY Launcher (replaces Write Tests)
   * Exact anatomical brain silhouette from user reference with two-line typography
   */
  static renderMuseMemoryKey(): string {
    const brainB64 = "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";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="museMemBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#07111e"/>
            <stop offset="100%" stop-color="#02070e"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="26" fill="url(#museMemBg)" stroke="#0ea5e9" stroke-width="3"/>
        
        <!-- Exact Brain Vector Graphic from User Reference -->
        <image href="data:image/png;base64,${brainB64}" x="31" y="15" width="82" height="70"/>

        <!-- Two-line uniform typography -->
        <text x="72" y="107" fill="#ffffff" font-size="16" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">MUSE</text>
        <text x="72" y="126" fill="#ffffff" font-size="16" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">MEMORY</text>
      </svg>
    `);
  }

  static renderMemoryRulesKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#090d16" stroke="#38bdf8" stroke-width="3"/>
        <!-- Shield / Rules Agreement Icon -->
        <path d="M72 26 L92 34 C92 52, 84 66, 72 72 C60 66, 52 52, 52 34 Z" fill="#0369a1" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M64 48 L70 54 L80 42" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="112" fill="#ffffff" font-size="17" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.4">MUSE RULES</text>
      </svg>
    `);
  }

  static renderMemorySpecKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#05131e" stroke="#0ea5e9" stroke-width="3"/>
        <!-- Document with Target Icon -->
        <rect x="52" y="26" width="40" height="46" rx="4" fill="#0369a1" stroke="#38bdf8" stroke-width="2"/>
        <circle cx="72" cy="49" r="12" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="3,2"/>
        <circle cx="72" cy="49" r="5" fill="#38bdf8"/>
        <circle cx="72" cy="49" r="2" fill="#ffffff"/>
        <text x="72" y="112" fill="#ffffff" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">SPEC.md</text>
      </svg>
    `);
  }

  static renderMemoryPlanKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#051a14" stroke="#10b981" stroke-width="3"/>
        <!-- Roadmap Flag & Milestone Path -->
        <path d="M52 68 L52 28 L76 36 L52 46" fill="#064e3b" stroke="#34d399" stroke-width="2.5" stroke-linejoin="round"/>
        <line x1="52" y1="28" x2="52" y2="70" stroke="#34d399" stroke-width="3" stroke-linecap="round"/>
        <circle cx="68" cy="62" r="4" fill="#34d399"/>
        <circle cx="86" cy="54" r="5" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
        <path d="M52 68 C60 68, 62 62, 68 62 C74 62, 78 54, 86 54" fill="none" stroke="#6ee7b7" stroke-width="2.5" stroke-linecap="round"/>
        <text x="72" y="112" fill="#ffffff" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">PLAN.md</text>
      </svg>
    `);
  }

  static renderMemoryTodoKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#061826" stroke="#06b6d4" stroke-width="3"/>
        <!-- Checklist Checkbox Icon -->
        <rect x="48" y="28" width="16" height="16" rx="3" fill="#083344" stroke="#22d3ee" stroke-width="2"/>
        <path d="M52 36 L56 40 L62 32" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="72" y1="36" x2="96" y2="36" stroke="#67e8f9" stroke-width="3" stroke-linecap="round"/>
        <rect x="48" y="52" width="16" height="16" rx="3" fill="#083344" stroke="#22d3ee" stroke-width="2"/>
        <path d="M52 60 L56 64 L62 56" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="72" y1="60" x2="96" y2="60" stroke="#67e8f9" stroke-width="3" stroke-linecap="round"/>
        <text x="72" y="112" fill="#ffffff" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">TODO.md</text>
      </svg>
    `);
  }

  static renderMemoryArchKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#110b24" stroke="#8b5cf6" stroke-width="3"/>
        <!-- Blueprint / Architecture Blocks Icon -->
        <rect x="58" y="26" width="28" height="18" rx="3" fill="#4c1d95" stroke="#a78bfa" stroke-width="2"/>
        <rect x="44" y="52" width="24" height="18" rx="3" fill="#4c1d95" stroke="#a78bfa" stroke-width="2"/>
        <rect x="76" y="52" width="24" height="18" rx="3" fill="#4c1d95" stroke="#a78bfa" stroke-width="2"/>
        <path d="M72 44 L72 48 M56 48 L88 48 M56 48 L56 52 M88 48 L88 52" fill="none" stroke="#c084fc" stroke-width="2"/>
        <text x="72" y="112" fill="#ffffff" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">ARCH.md</text>
      </svg>
    `);
  }

  static renderMemoryProgressKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#1f1305" stroke="#f59e0b" stroke-width="3"/>
        <!-- Timeline DevLog Graph Icon -->
        <circle cx="50" cy="56" r="6" fill="#f59e0b"/>
        <circle cx="72" cy="36" r="6" fill="#fde047"/>
        <circle cx="94" cy="46" r="6" fill="#22c55e"/>
        <path d="M50 56 L72 36 L94 46" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="112" fill="#ffffff" font-size="16" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.3">PROGRESS.md</text>
      </svg>
    `);
  }

  static renderMemoryReadmeKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#081520" stroke="#38bdf8" stroke-width="3"/>
        <!-- Open Book / Handbook Icon -->
        <path d="M72 36 C64 30, 48 30, 48 34 L48 64 C48 60, 64 60, 72 66 C80 60, 96 60, 96 64 L96 34 C96 30, 80 30, 72 36 Z" fill="#0369a1" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"/>
        <line x1="72" y1="36" x2="72" y2="66" stroke="#ffffff" stroke-width="2.5"/>
        <text x="72" y="112" fill="#ffffff" font-size="17" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.4">README.md</text>
      </svg>
    `);
  }

  static renderMemoryDecisionsKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#1a0f2e" stroke="#a855f7" stroke-width="3"/>
        <!-- Decision Split Scales Icon -->
        <path d="M72 26 L72 68 M50 36 L94 36" fill="none" stroke="#c084fc" stroke-width="3" stroke-linecap="round"/>
        <path d="M44 48 L56 48 L50 36 Z" fill="#581c87" stroke="#e9d5ff" stroke-width="2"/>
        <path d="M88 44 L100 44 L94 36 Z" fill="#581c87" stroke="#e9d5ff" stroke-width="2"/>
        <text x="72" y="112" fill="#ffffff" font-size="16" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.3">DECISIONS.md</text>
      </svg>
    `);
  }

  static renderMemoryApiKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#061922" stroke="#06b6d4" stroke-width="3"/>
        <!-- Network API Endpoints Icon -->
        <circle cx="50" cy="48" r="8" fill="#083344" stroke="#22d3ee" stroke-width="2.5"/>
        <circle cx="94" cy="36" r="8" fill="#083344" stroke="#22d3ee" stroke-width="2.5"/>
        <circle cx="94" cy="60" r="8" fill="#083344" stroke="#22d3ee" stroke-width="2.5"/>
        <path d="M58 48 L86 36 M58 48 L86 60" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
        <text x="72" y="112" fill="#ffffff" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">API.md</text>
      </svg>
    `);
  }

  static renderMemoryTestingKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#1a1005" stroke="#f59e0b" stroke-width="3"/>
        <!-- Chemistry Flask Icon -->
        <path d="M68 28 L76 28 L76 42 L88 64 C90 68, 86 72, 80 72 L64 72 C58 72, 54 68, 56 64 L68 42 Z" fill="#451a03" stroke="#f59e0b" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M62 58 Q72 54 82 58" fill="none" stroke="#fde047" stroke-width="2"/>
        <circle cx="70" cy="64" r="2" fill="#ffffff"/>
        <circle cx="76" cy="62" r="1.5" fill="#ffffff"/>
        <text x="72" y="112" fill="#ffffff" font-size="17" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.4">TESTING.md</text>
      </svg>
    `);
  }

  static renderMemorySyncKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#041c2c" stroke="#00f0ff" stroke-width="3"/>
        <!-- Dual Sync Circular Arrows with Core Hub -->
        <circle cx="72" cy="46" r="22" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="8, 4"/>
        <path d="M60 38 A14 14 0 0 1 84 38" fill="none" stroke="#00f0ff" stroke-width="3.5" stroke-linecap="round"/>
        <polygon points="86,34 90,42 82,42" fill="#00f0ff"/>
        <path d="M84 54 A14 14 0 0 1 60 54" fill="none" stroke="#00f0ff" stroke-width="3.5" stroke-linecap="round"/>
        <polygon points="58,58 54,50 62,50" fill="#00f0ff"/>
        <circle cx="72" cy="46" r="4.5" fill="#ffffff"/>
        <text x="72" y="112" fill="#ffffff" font-size="15" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.4">SYNC CONTEXT</text>
      </svg>
    `);
  }

  static renderMemoryUpdateKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#081f14" stroke="#10b981" stroke-width="3"/>
        <!-- Update Log Checkpad & Pen Icon -->
        <rect x="52" y="28" width="34" height="42" rx="4" fill="#064e3b" stroke="#34d399" stroke-width="2.5"/>
        <path d="M58 42 L64 48 L76 36" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="58" y1="56" x2="78" y2="56" stroke="#6ee7b7" stroke-width="2.5" stroke-linecap="round"/>
        <polygon points="88,24 96,32 92,36 84,28" fill="#34d399"/>
        <text x="72" y="112" fill="#ffffff" font-size="16" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.4">UPDATE LOG</text>
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
  /**
   * AI Credits & Telemetry HUD Key (Col 4, Row 1 on Page 1 / Page 2)
   * Clean edge-to-edge frame without corner notches, bold readable balance.
   */
  static renderApiStatusKey(credits = "$149.97"): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <!-- Clean Edge-to-edge Frame -->
        <rect width="144" height="144" rx="24" fill="#070b14" stroke="#10b981" stroke-width="2.5"/>
        <circle cx="72" cy="72" r="50" fill="#10b981" fill-opacity="0.04"/>

        <!-- Top Header: High-Visibility Cyan Label -->
        <text x="72" y="32" fill="#38bdf8" font-size="15" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1.5">CREDITS</text>
        <line x1="18" y1="44" x2="126" y2="44" stroke="#10b981" stroke-width="1.5" stroke-opacity="0.4"/>

        <!-- Center: Big Neon Green Balance -->
        <text x="72" y="82" fill="#10b981" font-size="28" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">${credits}</text>

        <!-- Bottom: High-Visibility Telemetry Callout -->
        <text x="72" y="121" fill="#34d399" font-size="15" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">LIVE STATS ↗</text>
      </svg>
    `);
  }

  /**
   * Render action button for submenus (e.g. OPEN BILLING)
   * High-visibility clickable button appearance
   */
  static renderActionKey(
    line1: string,
    line2: string,
    borderColor = "#06b6d4",
    textColor = "#67e8f9"
  ): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#070a16" stroke="${borderColor}" stroke-width="3"/>
        <circle cx="72" cy="72" r="52" fill="${borderColor}" fill-opacity="0.16"/>
        <text x="72" y="56" fill="#ffffff" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${line1}</text>
        <text x="72" y="94" fill="${textColor}" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${line2}</text>
      </svg>
    `);
  }

  /**
   * Render individual clean plain telemetry card for the 15-key Sub-Menu
   * Matches the high-contrast 2-line plain design with large bold typography
   */
  static renderTelemetryCard(
    line1: string,
    line2: string,
    borderColor = "#38bdf8",
    textColor = "#ffffff",
    badge = ""
  ): string {
    const l1Size = line1.length > 8 ? 19 : 22;
    const l2Size = line2.length > 7 ? 22 : 26;
    const badgeHtml = badge
      ? `<rect x="24" y="14" width="96" height="20" rx="10" fill="${borderColor}" fill-opacity="0.2" stroke="${borderColor}" stroke-width="1.5"/>
         <text x="72" y="28" fill="${textColor}" font-size="12" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">${badge}</text>`
      : "";
    const y1 = badge ? 68 : 56;
    const y2 = badge ? 102 : 94;

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#070a16" stroke="${borderColor}" stroke-width="2.5"/>
        <circle cx="72" cy="72" r="52" fill="${borderColor}" fill-opacity="0.08"/>
        ${badgeHtml}
        <text x="72" y="${y1}" fill="#ffffff" font-size="${l1Size}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${line1}</text>
        <text x="72" y="${y2}" fill="${textColor}" font-size="${l2Size}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${line2}</text>
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
      case 1: return this.renderEmptyTile(); // Left blank for now per user request
      case 2: return this.renderUploadFileKey();
      case 3: return this.renderEmptyTile(); // Left blank for now per user request
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
   * ORGANIC WATER FLOW & OVERCHARGE DETONATION SEQUENCE:
   * 1. WAVE 1 (frames 0..24): First water flow bursts in from the right edge,
   *    travels across the darkness, and enters the left node.
   * 2. WAVE 2 (frames 12..36): Second heavier water flow surges in, charging the node to level 2.
   * 3. WAVE 3 (frames 24..45): High-energy water flow surges in, pushing the node into violent OVERCHARGE.
   * 4. DETONATION (frames 45..57): Overcharged node EXPLODES with blinding flash and massive concentric
   *    circular shockwaves blasting across the entire 15-key matrix.
   * 5. COOLDOWN (frames 57..59): Total darkness before seamless loop.
   */
  static renderMuseBeamTile(col: number, row: number, frame: number): string {
    const vx = col * 144;
    const vy = row * 144;
    const nodeX = 84;
    const nodeY = 216;

    const totalFrames = 60;
    const loopFrame = frame % totalFrames;

    // Dark space background
    const bg = `<rect x="0" y="0" width="720" height="432" fill="#000208"/>`;

    // Fast cubic Bézier point evaluator along stream from right (s=0) to left (s=1)
    const getPoint = (s: number, startY: number) => {
      const clamped = Math.max(0, Math.min(1, s));
      const u = 1 - clamped;
      const cp1X = 520;
      const cp1Y = nodeY + (startY - nodeY) * 0.88;
      const cp2X = 240;
      const cp2Y = nodeY + (startY - nodeY) * 0.12;

      const x = u * u * u * 720 + 3 * u * u * clamped * cp1X + 3 * u * clamped * clamped * cp2X + clamped * clamped * clamped * nodeX;
      const y = u * u * u * startY + 3 * u * u * clamped * cp1Y + 3 * u * clamped * clamped * cp2Y + clamped * clamped * clamped * nodeY;
      return { x, y };
    };

    let elements = "";

    // 12 Streamline Channels fanning out to the right edge
    const numChannels = 12;

    // Define 3 Water Waves traveling right-to-left
    const waves = [
      { startFrame: 0,  duration: 22, length: 0.38, opacity: 0.85, width: 2.4, color: "#38bdf8" },
      { startFrame: 12, duration: 22, length: 0.42, opacity: 0.95, width: 2.8, color: "#67e8f9" },
      { startFrame: 24, duration: 20, length: 0.46, opacity: 1.00, width: 3.2, color: "#a5f3fc" },
    ];

    // Render active water flows (ONLY if inside frames 0..46, before detonation)
    if (loopFrame <= 45) {
      for (const wave of waves) {
        if (loopFrame >= wave.startFrame && loopFrame <= wave.startFrame + wave.duration + 5) {
          const waveT = (loopFrame - wave.startFrame) / wave.duration; // 0.0 to ~1.2
          const headS = Math.min(1.0, waveT);
          const tailS = Math.max(0.0, headS - wave.length);

          if (headS > 0.01 && tailS < 0.99) {
            // Fade out as it enters the node
            const enterFade = headS >= 0.95 ? Math.max(0, 1 - (headS - 0.95) / 0.15) : 1.0;
            const flowAlpha = (wave.opacity * enterFade).toFixed(2);

            for (let ch = 0; ch < numChannels; ch++) {
              const startY = 36 + ch * 32.7; // 36..396

              // Stream segment points
              const p0 = getPoint(tailS, startY);
              const p1 = getPoint(tailS + (headS - tailS) * 0.35, startY);
              const p2 = getPoint(tailS + (headS - tailS) * 0.70, startY);
              const p3 = getPoint(headS, startY);

              // Water jet body
              elements += `
                <path d="M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} Q ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} T ${p3.x.toFixed(1)} ${p3.y.toFixed(1)}"
                      fill="none" stroke="${wave.color}" stroke-width="${wave.width}" stroke-linecap="round"
                      stroke-opacity="${flowAlpha}"/>
              `;

              // Arrowhead (<) at the leading tip of the water jet
              if (p3.x > nodeX + 12 && p3.x < 715) {
                const dx = p3.x - p2.x;
                const dy = p3.y - p2.y;
                const len = Math.hypot(dx, dy) || 1;
                const ux = dx / len;
                const uy = dy / len;
                // Perpendicular vector
                const nx = -uy;
                const ny = ux;

                // Triangle pointing in direction of flow (ux, uy)
                const arrowLen = 10;
                const arrowWidth = 5.5;
                const tipX = p3.x;
                const tipY = p3.y;
                const b1X = tipX - ux * arrowLen + nx * arrowWidth;
                const b1Y = tipY - uy * arrowLen + ny * arrowWidth;
                const b2X = tipX - ux * arrowLen - nx * arrowWidth;
                const b2Y = tipY - uy * arrowLen - ny * arrowWidth;
                const notchX = tipX - ux * (arrowLen * 0.7);
                const notchY = tipY - uy * (arrowLen * 0.7);

                elements += `
                  <polygon points="${tipX.toFixed(1)},${tipY.toFixed(1)} ${b1X.toFixed(1)},${b1Y.toFixed(1)} ${notchX.toFixed(1)},${notchY.toFixed(1)} ${b2X.toFixed(1)},${b2Y.toFixed(1)}"
                           fill="${wave.color}" opacity="${flowAlpha}"/>
                `;
              }

              // Stardust micro-droplets travelling with the jet
              if (ch % 2 === 0) {
                const dropS = tailS + (headS - tailS) * 0.55;
                const dp = getPoint(dropS, startY);
                elements += `<circle cx="${dp.x.toFixed(1)}" cy="${dp.y.toFixed(1)}" r="2" fill="#ffffff" opacity="${flowAlpha}"/>`;
              }
            }
          }
        }
      }
    }

    // Node Overcharge State (ONLY appears starting frame 18 as water arrives)
    if (loopFrame >= 18 && loopFrame <= 56) {
      if (loopFrame < 45) {
        // Charging phase: Glow and size grow with each incoming wave
        let chargeLevel = 1;
        let haloRadius = 24;
        let coreColor = "#0284c7";
        let glowColor = "#38bdf8";

        if (loopFrame >= 30 && loopFrame < 38) {
          chargeLevel = 2;
          haloRadius = 32;
          coreColor = "#0369a1";
          glowColor = "#67e8f9";
        } else if (loopFrame >= 38) {
          // VIOLENT OVERCHARGE (Level 3): Rapid pulsing, intense white/cyan energy
          chargeLevel = 3;
          const jitter = (loopFrame % 2 === 0 ? 3 : -3);
          haloRadius = 42 + jitter;
          coreColor = "#38bdf8";
          glowColor = "#ffffff";
        }

        const pulseScale = 1.0 + Math.sin(loopFrame * 0.8) * 0.15;
        const rHalo = (haloRadius * pulseScale).toFixed(1);

        elements += `
          <!-- Soft Energy Corona -->
          <circle cx="${nodeX}" cy="${nodeY}" r="${rHalo}" fill="${coreColor}" fill-opacity="0.35"
                  stroke="${glowColor}" stroke-width="${chargeLevel >= 3 ? 3.5 : 2}" stroke-opacity="0.8"/>
          <!-- Inner Core -->
          <circle cx="${nodeX}" cy="${nodeY}" r="${(14 * pulseScale).toFixed(1)}" fill="${coreColor}" stroke="#ffffff" stroke-width="2"/>
          <circle cx="${nodeX}" cy="${nodeY}" r="6" fill="#ffffff"/>
        `;

        if (chargeLevel === 3) {
          // Overcharge crackling arcs
          elements += `
            <circle cx="${nodeX}" cy="${nodeY}" r="28" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="6 4"/>
            <circle cx="${nodeX}" cy="${nodeY}" r="50" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 8" opacity="0.8"/>
          `;
        }
      } else {
        // EXPLOSION & DETONATION PHASE (Frames 45..56)
        const explodeT = loopFrame - 45; // 0..11

        // Blinding flash at epicenter (frames 45..49)
        if (explodeT <= 4) {
          const flashOp = (1 - explodeT / 4).toFixed(2);
          const flashR = 24 + explodeT * 26;
          elements += `
            <circle cx="${nodeX}" cy="${nodeY}" r="${flashR * 1.5}" fill="#38bdf8" opacity="${(parseFloat(flashOp) * 0.7).toFixed(2)}"/>
            <circle cx="${nodeX}" cy="${nodeY}" r="${flashR}" fill="#ffffff" opacity="${flashOp}"/>
          `;
        }

        // Massive Concentric Radial Shockwaves blasting across the entire board
        // Wave 1
        const r1 = 18 + explodeT * 38;
        const op1 = Math.max(0, 1 - explodeT / 12).toFixed(2);
        elements += `<circle cx="${nodeX}" cy="${nodeY}" r="${r1}" fill="none" stroke="#38bdf8" stroke-width="5" opacity="${op1}"/>`;

        // Wave 2
        if (explodeT >= 3) {
          const t2 = explodeT - 3;
          const r2 = 14 + t2 * 34;
          const op2 = Math.max(0, 1 - t2 / 10).toFixed(2);
          elements += `<circle cx="${nodeX}" cy="${nodeY}" r="${r2}" fill="none" stroke="#67e8f9" stroke-width="4" opacity="${op2}"/>`;
        }

        // Wave 3
        if (explodeT >= 6) {
          const t3 = explodeT - 6;
          const r3 = 12 + t3 * 30;
          const op3 = Math.max(0, 1 - t3 / 8).toFixed(2);
          elements += `<circle cx="${nodeX}" cy="${nodeY}" r="${r3}" fill="none" stroke="#ffffff" stroke-width="3" opacity="${op3}"/>`;
        }
      }
    }

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="${vx} ${vy} 144 144">
        ${bg}
        ${elements}
      </svg>
    `;

    return this.svgToDataUri(svg);
  }

  private static svgToDataUri(svg: string): string {
    const cleaned = svg.trim().replace(/\n\s*/g, " ");
    return `data:image/svg+xml;base64,${Buffer.from(cleaned).toString("base64")}`;
  }
}
