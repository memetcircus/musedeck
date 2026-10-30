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
        return this.svgToDataUri(`
          <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
            <rect width="144" height="144" rx="26" fill="#070b14" stroke="#f59e0b" stroke-width="3">
              <animate attributeName="stroke" values="#f59e0b;#ef4444;#f59e0b" dur="1s" repeatCount="indefinite"/>
            </rect>
            <circle cx="72" cy="46" r="30" fill="#78350f" fill-opacity="0.35" stroke="#fbbf24" stroke-width="3" stroke-dasharray="8, 6">
              <animate attributeName="fill-opacity" values="0.25;0.75;0.25" dur="1s" repeatCount="indefinite"/>
            </circle>
            <polygon points="72,23 96,67 48,67" fill="#92400e" fill-opacity="0.85" stroke="#fde047" stroke-width="3" stroke-linejoin="round">
              <animate attributeName="stroke" values="#fde047;#ffffff;#fde047" dur="1s" repeatCount="indefinite"/>
            </polygon>
            <line x1="72" y1="36" x2="72" y2="51" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/>
            <circle cx="72" cy="60" r="2.8" fill="#ffffff"/>
            <text x="72" y="105" fill="#fde047" font-size="16" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">REVIEW</text>
            <text x="72" y="123" fill="#fca5a5" font-size="11" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">APPROVAL</text>
          </svg>
        `);

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
   * Hardware-Driven Flashing Approval Key (alternates every 400ms for high-visibility physical LED flash)
   */
  static renderFlashingApprovalKey(phase: boolean): string {
    const strokeColor = phase ? "#f59e0b" : "#ef4444";
    const bgFill = phase ? "#451a03" : "#450a0a";
    const glowFill = phase ? "#78350f" : "#7f1d1d";
    const glowStroke = phase ? "#fbbf24" : "#f87171";
    const polyStroke = phase ? "#fde047" : "#fca5a5";
    const text1 = phase ? "REVIEW" : "ACTION";
    const text2 = phase ? "APPROVAL" : "REQUIRED";
    const text1Color = phase ? "#fde047" : "#ffffff";
    const text2Color = phase ? "#fca5a5" : "#f87171";

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="${bgFill}" stroke="${strokeColor}" stroke-width="4"/>
        <circle cx="72" cy="46" r="30" fill="${glowFill}" fill-opacity="0.5" stroke="${glowStroke}" stroke-width="3" stroke-dasharray="8, 6"/>
        <polygon points="72,23 96,67 48,67" fill="#92400e" fill-opacity="0.9" stroke="${polyStroke}" stroke-width="3" stroke-linejoin="round"/>
        <line x1="72" y1="36" x2="72" y2="51" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="72" cy="60" r="2.8" fill="#ffffff"/>
        <text x="72" y="103" fill="${text1Color}" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1.2">${text1}</text>
        <text x="72" y="124" fill="${text2Color}" font-size="14" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${text2}</text>
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
  static renderUpBackKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#070b14" stroke="#a855f7" stroke-width="3"/>
        <circle cx="72" cy="72" r="34" fill="#581c87" fill-opacity="0.4" stroke="#c084fc" stroke-width="2.5"/>
        <!-- Prominent Upward Arrow -->
        <path d="M72 42 L52 62 M72 42 L92 62 M72 42 L72 98" fill="none" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
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
   * Edge-to-edge frame without corner brackets, high contrast typography.
   */
  static renderSnippetCard(
    line1: string,
    line2: string,
    subtitle: string,
    borderColor = "#a855f7",
    textColor = "#ffffff"
  ): string {
    const subFontSize = subtitle.length > 10 ? 15 : subtitle.length > 8 ? 16 : 18;

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <!-- Edge-to-edge Frame without corner brackets -->
        <rect width="144" height="144" rx="24" fill="#070b14" stroke="${borderColor}" stroke-width="2.5"/>
        <circle cx="72" cy="72" r="50" fill="${borderColor}" fill-opacity="0.04"/>

        <!-- Title Lines -->
        <text x="72" y="${line2 ? '46' : '58'}" fill="#ffffff" font-size="${line2 ? '22' : '34'}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="${line2 ? '0.8' : '1.5'}">${line1}</text>
        ${line2 ? `<text x="72" y="73" fill="#ffffff" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.8">${line2}</text>` : ''}

        <!-- Divider Line -->
        <line x1="16" y1="86" x2="128" y2="86" stroke="${borderColor}" stroke-width="1.8" stroke-opacity="0.5"/>

        <!-- Subtitle (Large, ultra-readable) -->
        <text x="72" y="118" fill="${textColor}" font-size="${subFontSize}" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">${subtitle}</text>
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
        <rect width="144" height="144" rx="24" fill="#070b14" stroke="#22c55e" stroke-width="3"/>
        <circle cx="72" cy="72" r="50" fill="#22c55e" fill-opacity="0.04"/>

        <!-- Top pill: #1 -->
        <rect x="12" y="14" width="42" height="24" rx="6" fill="#14532d" stroke="#4ade80" stroke-width="1.5"/>
        <text x="33" y="31" fill="#86efac" font-size="13" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">#1</text>

        <!-- Right badge: ONCE -->
        <rect x="64" y="14" width="68" height="24" rx="6" fill="#14532d" fill-opacity="0.6" stroke="#4ade80" stroke-width="1.5"/>
        <text x="98" y="31" fill="#86efac" font-size="11" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">ONCE</text>

        <!-- Center: YES -->
        <text x="72" y="76" fill="#ffffff" font-size="24" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">YES</text>
        <line x1="16" y1="87" x2="128" y2="87" stroke="#22c55e" stroke-width="1.5" stroke-opacity="0.5"/>

        <!-- Bottom: APPROVE (1) -->
        <text x="72" y="121" fill="#4ade80" font-size="15" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">APPROVE (1)</text>
      </svg>
    `);
  }

  /**
   * HITL Option 2: ALWAYS (Allow for session - Sends '2')
   */
  static renderHitlOption2Key(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="24" fill="#070b14" stroke="#06b6d4" stroke-width="3"/>
        <circle cx="72" cy="72" r="50" fill="#06b6d4" fill-opacity="0.04"/>

        <!-- Top pill: #2 -->
        <rect x="12" y="14" width="42" height="24" rx="6" fill="#164e63" stroke="#22d3ee" stroke-width="1.5"/>
        <text x="33" y="31" fill="#67e8f9" font-size="13" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">#2</text>

        <!-- Right badge: SESSION -->
        <rect x="62" y="14" width="70" height="24" rx="6" fill="#164e63" fill-opacity="0.6" stroke="#22d3ee" stroke-width="1.5"/>
        <text x="97" y="31" fill="#67e8f9" font-size="11" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">SESSION</text>

        <!-- Center: ALWAYS -->
        <text x="72" y="76" fill="#ffffff" font-size="22" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">ALWAYS</text>
        <line x1="16" y1="87" x2="128" y2="87" stroke="#06b6d4" stroke-width="1.5" stroke-opacity="0.5"/>

        <!-- Bottom: ALLOW ALL (2) -->
        <text x="72" y="121" fill="#22d3ee" font-size="14" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">ALLOW ALL (2)</text>
      </svg>
    `);
  }

  /**
   * HITL Option 3: NO (Reject once - Sends '3')
   */
  static renderHitlOption3Key(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="24" fill="#070b14" stroke="#ef4444" stroke-width="3"/>
        <circle cx="72" cy="72" r="50" fill="#ef4444" fill-opacity="0.04"/>

        <!-- Top pill: #3 -->
        <rect x="12" y="14" width="42" height="24" rx="6" fill="#7f1d1d" stroke="#f87171" stroke-width="1.5"/>
        <text x="33" y="31" fill="#fca5a5" font-size="13" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">#3</text>

        <!-- Right badge: DENY -->
        <rect x="64" y="14" width="68" height="24" rx="6" fill="#7f1d1d" fill-opacity="0.6" stroke="#f87171" stroke-width="1.5"/>
        <text x="98" y="31" fill="#fca5a5" font-size="11" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">DENY</text>

        <!-- Center: NO -->
        <text x="72" y="76" fill="#ffffff" font-size="24" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">NO</text>
        <line x1="16" y1="87" x2="128" y2="87" stroke="#ef4444" stroke-width="1.5" stroke-opacity="0.5"/>

        <!-- Bottom: REJECT (3) -->
        <text x="72" y="121" fill="#f87171" font-size="15" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">REJECT (3)</text>
      </svg>
    `);
  }

  /**
   * HITL Option 4: TELL WHY / FEEDBACK (Sends '4')
   */
  static renderHitlOption4Key(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="24" fill="#070b14" stroke="#f59e0b" stroke-width="3"/>
        <circle cx="72" cy="72" r="50" fill="#f59e0b" fill-opacity="0.04"/>

        <!-- Top pill: #4 -->
        <rect x="12" y="14" width="42" height="24" rx="6" fill="#78350f" stroke="#fbbf24" stroke-width="1.5"/>
        <text x="33" y="31" fill="#fde047" font-size="13" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">#4</text>

        <!-- Right badge: STOP -->
        <rect x="64" y="14" width="68" height="24" rx="6" fill="#78350f" fill-opacity="0.6" stroke="#fbbf24" stroke-width="1.5"/>
        <text x="98" y="31" fill="#fde047" font-size="11" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">STOP</text>

        <!-- Center: TELL WHY -->
        <text x="72" y="76" fill="#ffffff" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">TELL WHY</text>
        <line x1="16" y1="87" x2="128" y2="87" stroke="#f59e0b" stroke-width="1.5" stroke-opacity="0.5"/>

        <!-- Bottom: FEEDBACK (4) -->
        <text x="72" y="121" fill="#fbbf24" font-size="14" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">FEEDBACK (4)</text>
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
   */
  static renderNewSessionKey(): string {
    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="26" fill="#070b14" stroke="#06b6d4" stroke-width="3"/>
        <!-- Corner reticle brackets -->
        <path d="M 12 28 L 12 12 L 28 12" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 132 28 L 132 12 L 116 12" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 12 116 L 12 132 L 28 132" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 132 116 L 132 132 L 116 132" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round"/>

        <!-- Plus icon inside cyber circle -->
        <circle cx="72" cy="42" r="22" fill="#083344" fill-opacity="0.75" stroke="#22d3ee" stroke-width="2.5"/>
        <line x1="72" y1="31" x2="72" y2="53" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="61" y1="42" x2="83" y2="42" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/>

        <text x="72" y="96" fill="#ffffff" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">NEW</text>
        <text x="72" y="122" fill="#22d3ee" font-size="16" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">SESSION</text>
      </svg>
    `);
  }

  /**
   * Historical / Resumable Session Card in Sessions Submenu
   * Time-based color themes, large readable time, and edge-to-edge layout without corner brackets.
   */
  static renderHistoricalSessionCard(
    sessionIndex: number,
    project: string,
    timeBadge: string,
    timeStr: string,
    ageCategory: "today" | "yesterday" | "older" = "today"
  ): string {
    const numStr = sessionIndex < 10 ? `#0${sessionIndex}` : `#${sessionIndex}`;

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

    // Left pill: Session Index
    const numPill = `
      <rect x="12" y="14" width="46" height="24" rx="6" fill="#1e293b" stroke="${borderColor}" stroke-width="1.5"/>
      <text x="35" y="31" fill="#ffffff" font-size="13" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">${numStr}</text>
    `;

    // Right pill: Time Badge ([TODAY], [YESTRDY], [OCT 27])
    const statusPill = `
      <rect x="66" y="14" width="66" height="24" rx="6" fill="${badgeFill}" fill-opacity="0.8" stroke="${badgeBorder}" stroke-width="1.5"/>
      <text x="99" y="31" fill="${badgeText}" font-size="11" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">${timeBadge}</text>
    `;

    const displayProject = project.length > 9 ? project.substring(0, 8) + "…" : project;

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <!-- Clean Edge-to-edge card container without obstructive corner brackets -->
        <rect width="144" height="144" rx="24" fill="#070b14" stroke="${borderColor}" stroke-width="2.5"/>
        
        <!-- Subtle background glow -->
        <circle cx="72" cy="72" r="50" fill="${borderColor}" fill-opacity="0.04"/>

        <!-- Header: Session Number & Time Badge -->
        ${numPill}
        ${statusPill}

        <!-- Center: Project Name -->
        <text x="72" y="73" fill="#ffffff" font-size="21" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">${displayProject}</text>
        <line x1="16" y1="84" x2="128" y2="84" stroke="${borderColor}" stroke-width="1.5" stroke-opacity="0.5"/>

        <!-- Bottom: Large, ultra-readable Time (No redundant RESTORE label) -->
        <text x="72" y="121" fill="${timeColor}" font-size="24" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1.5">${timeStr}</text>
      </svg>
    `);
  }

  /**
   * Session Card in Sessions Submenu with cyber badges and high-contrast typography
   */
  static renderSessionCard(
    sessionIndex: number,
    project: string,
    isActive: boolean,
    isThinking: boolean
  ): string {
    const borderColor = isThinking ? "#a855f7" : isActive ? "#22c55e" : "#38bdf8";
    const borderWidth = isThinking || isActive ? 3.5 : 2.5;

    // Left pill: Session Index (#01, #02...)
    const numStr = sessionIndex < 10 ? `#0${sessionIndex}` : `#${sessionIndex}`;
    const numPill = `
      <rect x="12" y="14" width="46" height="24" rx="6" fill="#1e293b" stroke="${borderColor}" stroke-width="1.5"/>
      <text x="35" y="31" fill="#f8fafc" font-size="13" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">${numStr}</text>
    `;

    // Right pill: Status badge (Replaces the tiny dot!)
    let statusPill = "";
    if (isThinking) {
      statusPill = `
        <rect x="66" y="14" width="66" height="24" rx="6" fill="#581c87" stroke="#c084fc" stroke-width="1.5">
          <animate attributeName="stroke" values="#c084fc;#f472b6;#c084fc" dur="1s" repeatCount="indefinite"/>
        </rect>
        <text x="99" y="31" fill="#f5d0fe" font-size="11" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">⚡ BUSY</text>
      `;
    } else if (isActive) {
      statusPill = `
        <rect x="66" y="14" width="66" height="24" rx="6" fill="#14532d" stroke="#4ade80" stroke-width="1.5"/>
        <text x="99" y="31" fill="#86efac" font-size="11" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">ACTIVE</text>
      `;
    } else {
      statusPill = `
        <rect x="66" y="14" width="66" height="24" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="1.5"/>
        <text x="99" y="31" fill="#94a3b8" font-size="11" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">IDLE</text>
      `;
    }

    // Status footer: Bold status or flowing nodes if thinking
    let footerSvg = "";
    if (isThinking) {
      footerSvg = `
        <text x="72" y="104" fill="#e9d5ff" font-size="14" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">THINKING...</text>
        <g transform="translate(39, 122)">
          <!-- Node 1 -->
          <circle cx="14" cy="0" r="4.5" fill="#38bdf8">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="0.8s" begin="0s" repeatCount="indefinite"/>
            <animate attributeName="r" values="3;6;3" dur="0.8s" begin="0s" repeatCount="indefinite"/>
          </circle>
          <!-- Node 2 -->
          <circle cx="33" cy="0" r="4.5" fill="#a855f7">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="0.8s" begin="0.25s" repeatCount="indefinite"/>
            <animate attributeName="r" values="3;6;3" dur="0.8s" begin="0.25s" repeatCount="indefinite"/>
          </circle>
          <!-- Node 3 -->
          <circle cx="52" cy="0" r="4.5" fill="#38bdf8">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="0.8s" begin="0.5s" repeatCount="indefinite"/>
            <animate attributeName="r" values="3;6;3" dur="0.8s" begin="0.5s" repeatCount="indefinite"/>
          </circle>
        </g>
      `;
    } else if (isActive) {
      footerSvg = `
        <text x="72" y="106" fill="#86efac" font-size="16" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">CURRENT</text>
        <text x="72" y="126" fill="#4ade80" font-size="13" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">● CONNECTED</text>
      `;
    } else {
      footerSvg = `
        <text x="72" y="106" fill="#f1f5f9" font-size="16" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">STANDBY</text>
        <text x="72" y="126" fill="#94a3b8" font-size="13" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="1">READY</text>
      `;
    }

    const displayProject = project.length > 9 ? project.substring(0, 8) + "…" : project;

    return this.svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <!-- Clean Edge-to-edge container without corner brackets -->
        <rect width="144" height="144" rx="24" fill="#070b14" stroke="${borderColor}" stroke-width="${borderWidth}"/>
        
        <!-- Header: Session Number Pill and Status Badge Pill -->
        ${numPill}
        ${statusPill}

        <!-- Project name in center -->
        <text x="72" y="73" fill="#ffffff" font-size="21" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" letter-spacing="0.5">${displayProject}</text>
        <line x1="16" y1="84" x2="128" y2="84" stroke="${borderColor}" stroke-width="2" stroke-opacity="0.7"/>

        ${footerSvg}
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
    textColor = "#ffffff"
  ): string {
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
    textColor = "#ffffff"
  ): string {
    return this.renderImgToCodeOptionKey(title, subtitle, borderColor, textColor);
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
    mode: "idle" | "spark" | "preview" | "success" | "failed" | "recording" | "aiming",
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
    } else if (mode === "spark") {
      borderColor = isStepActive ? "#f59e0b" : "#78350f";
      bgOpacity = isStepActive ? "0.26" : "0.04";
      subColor = isStepActive ? "#fde047" : "#d97706";
      const bannerData = [
        { main: "WAIT", sub: "AI CODE" },
        { main: "FOR", sub: "GENERATION" },
        { main: "MUSE", sub: "SYNTHESIS" },
        { main: "SPARK", sub: "~15 SEC" },
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
