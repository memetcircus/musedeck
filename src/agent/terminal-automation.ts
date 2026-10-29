import { exec } from "node:child_process";
import { promisify } from "node:util";
import * as path from "node:path";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * macOS Terminal.app Automation Controller
 * Connects physical Stream Deck keys directly to the developer's active Terminal running muse.
 */
export class TerminalAutomation {
  private static getMacTypeBin(): string | null {
    const candidates = [
      path.resolve(__dirname, "../../bin/mac-type"),
      path.resolve("/Users/akif/Projects/musedeck/musedeck/bin/mac-type"),
      path.resolve(process.cwd(), "bin/mac-type"),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return null;
  }

  /**
   * Launch a new muse session in a dedicated new Terminal.app window
   */
  static async launchMuseCodeTerminal(rawCwd?: string, prompt?: string): Promise<void> {
    let projectDir = rawCwd || process.cwd() || "/Users/akif/Projects/musedeck/musedeck";
    if (projectDir.includes(".sdPlugin")) {
      projectDir = projectDir.split(/[\/\\]com\.memetcircus\.musedeck\.sdPlugin/)[0] || "/Users/akif/Projects/musedeck/musedeck";
    }

    const command = prompt
      ? `cd ${this.escapeForShell(projectDir)} && muse ${this.escapeForShell(prompt)}`
      : `cd ${this.escapeForShell(projectDir)} && muse`;

    const appleScript = `
tell application "Terminal"
  activate
  set newTab to (do script "${this.escapeForAppleScript(command)}")
  try
    set custom title of selected tab of window 1 to "MUSE_ACTIVE_SESSION"
    set title displays custom title of selected tab of window 1 to true
    set winId to id of window 1
    do shell script "mkdir -p /tmp/musedeck && echo " & winId & " > /tmp/musedeck/active_terminal_window_id.txt"
  end try
end tell
    `.trim();

    try {
      await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      console.log(`💻 [Terminal] Opened new dedicated Terminal window with command: ${command}`);
    } catch (err: any) {
      console.error("Failed to launch Terminal.app via AppleScript:", err.message);
    }
  }

  static async bringTerminalToFront(): Promise<void> {
    await this.focusMuseTerminalWindow();
  }

  private static async focusMuseTerminalWindow(): Promise<void> {
    const appleScript = `
tell application "Terminal"
  set targetWin to missing value

  -- 1. Try reading saved active window ID
  try
    set savedId to (do shell script "cat /tmp/musedeck/active_terminal_window_id.txt 2>/dev/null || true")
    if savedId is not "" then
      set savedIdNum to (savedId as integer)
      repeat with w in windows
        if id of w is savedIdNum then
          set targetWin to w
          exit repeat
        end if
      end repeat
    end if
  end try

  -- 2. Fallback: match window with "MUSE_ACTIVE_SESSION", "muse-bin", or "musedeck" (explicitly exclude "codex")
  if targetWin is missing value then
    repeat with w in windows
      set winName to name of w
      if winName contains "MUSE_ACTIVE_SESSION" or winName contains "muse-bin" or (winName contains "musedeck" and not (winName contains "codex")) then
        set targetWin to w
        exit repeat
      end if
    end repeat
  end if

  -- 3. Bring target window to front and activate
  if targetWin is not missing value then
    set index of targetWin to 1
    activate
  else
    activate
  end if
end tell
    `.trim();

    try {
      await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      await new Promise((r) => setTimeout(r, 250));
    } catch (e: any) {
      console.warn("Could not focus muse window specifically:", e.message);
    }
  }

  /**
   * Send a physical 'y' or 'n' keypress into Terminal.app for HITL approvals
   */
  static async sendApprovalKeystroke(key: "y" | "n"): Promise<void> {
    // 1. Focus active Terminal window running muse
    await this.focusMuseTerminalWindow();

    // 2. Type key + Enter using native helper
    const macTypeBin = this.getMacTypeBin();
    if (macTypeBin) {
      try {
        await execAsync(`"${macTypeBin}" key "${key}"`);
        console.log(`⚡ [Terminal] Sent '${key}' + Enter to active Terminal via native helper`);
        return;
      } catch (err: any) {
        console.warn("Native mac-type keypress failed, attempting fallback:", err.message);
      }
    }

    // Fallback: AppleScript System Events
    const appleScript = `
tell application "Terminal" to activate
delay 0.1
tell application "System Events"
  keystroke "${key}"
  delay 0.05
  key code 36
end tell
    `.trim();

    try {
      await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      console.log(`⚡ [Terminal] Sent '${key}' + Enter to active Terminal via AppleScript`);
    } catch (err: any) {
      console.error(`Failed to send keystroke '${key}' to Terminal:`, err.message);
    }
  }

  /**
   * Send physical Option+V (⌥+v) into active Terminal running muse to toggle voice recording
   */
  static async sendVoiceToggleKeystroke(): Promise<void> {
    await this.focusMuseTerminalWindow();
    const macTypeBin = this.getMacTypeBin();
    if (macTypeBin) {
      try {
        await execAsync(`"${macTypeBin}" opt-v`);
        console.log(`🎙️ [Terminal] Sent Option+V (Voice toggle) to active Muse session via native helper`);
        return;
      } catch (err: any) {
        console.warn("Native mac-type opt-v failed, attempting fallback:", err.message);
      }
    }

    // Fallback: send Option+V via AppleScript System Events
    try {
      const appleScript = `
tell application "Terminal" to activate
delay 0.05
tell application "System Events"
  keystroke "v" using {option down}
end tell
      `.trim();
      await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      console.log(`🎙️ [Terminal] Sent Option+V via AppleScript`);
    } catch (e: any) {
      console.error("Failed to send Option+V via AppleScript:", e.message);
    }
  }

  /**
   * Send physical interrupt (Esc / Ctrl+C) into active Terminal running muse
   */
  static async sendInterruptEscape(): Promise<void> {
    await this.focusMuseTerminalWindow();
    const macTypeBin = this.getMacTypeBin();
    if (macTypeBin) {
      try {
        await execAsync(`"${macTypeBin}" ctrl-c`);
        console.log(`🛑 [Terminal] Sent physical interrupt (Ctrl+C) to active Muse session`);
        return;
      } catch (err: any) {
        console.warn("Native mac-type interrupt failed:", err.message);
      }
    }

    // Fallback: send Escape via System Events
    try {
      const appleScript = `
tell application "Terminal" to activate
delay 0.05
tell application "System Events"
  key code 53 -- Escape key
end tell
      `.trim();
      await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      console.log(`🛑 [Terminal] Sent Escape via AppleScript`);
    } catch (e: any) {
      console.warn("Failed to send escape via AppleScript:", e.message);
    }
  }

  /**
   * Bring Terminal to the front and insert the snipped image file path directly
   * at the user's active cursor location without erasing their prompt.
   */
  static async pasteSnippetIntoTerminal(
    filePath: string,
    promptPrefix = ""
  ): Promise<void> {
    const cleanPath = filePath.trim();
    // Insert just the path (and a trailing space) or with prefix if explicitly specified
    const textToInsert = promptPrefix ? `${promptPrefix}${cleanPath} ` : `${cleanPath} `;

    // 1. Always copy clean file path to macOS clipboard via pbcopy
    try {
      await execAsync(`printf "%s" "${cleanPath}" | pbcopy`);
      console.log(`📋 [Clipboard] Copied snippet path to macOS clipboard: ${cleanPath}`);
    } catch (e: any) {
      console.warn("Failed to set pbcopy:", e.message);
    }

    // 2. Bring Terminal.app to the front specifically targeting muse session
    await this.focusMuseTerminalWindow();

    // 3. Type text directly at current cursor position (preserves user prompt!)
    const macTypeBin = this.getMacTypeBin();
    if (macTypeBin) {
      try {
        await execAsync(`"${macTypeBin}" text "${textToInsert}"`);
        console.log(`📋 [Terminal] Inserted snippet path at active cursor: ${textToInsert}`);
        return;
      } catch (err: any) {
        console.warn("Native mac-type typing failed, attempting fallback:", err.message);
      }
    }

    // Fallback: AppleScript System Events keystroke without wiping user's text
    const appleScript = `
tell application "Terminal" to activate
delay 0.05
tell application "System Events"
  keystroke "${this.escapeForAppleScript(textToInsert)}"
end tell
    `.trim();

    try {
      await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      console.log(`📋 [Terminal] Pasted SAM snippet path into active Terminal prompt via AppleScript`);
    } catch (err: any) {
      console.warn("AppleScript keystroke failed (clipboard is ready with path):", err.message);
    }
  }

  /**
   * Type a prompt snippet directly into active Muse Terminal prompt at the cursor
   */
  static async typeSnippetIntoTerminal(snippetText: string): Promise<void> {
    const cleanText = snippetText.trim();
    const textToInsert = ` ${cleanText} `;

    // 1. Bring active Muse Terminal to front
    await this.focusMuseTerminalWindow();

    // 2. Type text directly via native mac-type helper
    const macTypeBin = this.getMacTypeBin();
    if (macTypeBin) {
      try {
        await execAsync(`"${macTypeBin}" text "${this.escapeForShell(textToInsert)}"`);
        console.log(`📝 [Terminal] Typed prompt snippet at cursor: "${cleanText}"`);
        return;
      } catch (err: any) {
        console.warn("Native mac-type typing failed, attempting fallback:", err.message);
      }
    }

    // Fallback: AppleScript System Events
    const appleScript = `
tell application "Terminal" to activate
delay 0.05
tell application "System Events"
  keystroke "${this.escapeForAppleScript(textToInsert)}"
end tell
    `.trim();

    try {
      await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      console.log(`📝 [Terminal] Typed snippet via AppleScript`);
    } catch (err: any) {
      console.error("Failed to type snippet:", err.message);
    }
  }

  /**
   * Check if the active Terminal window running Muse is currently in the "Thinking..." state
   */
  static async checkTerminalThinkingState(): Promise<"THINKING" | "IDLE" | "UNKNOWN"> {
    const appleScript = `
tell application "Terminal"
  repeat with w in windows
    set winName to name of w
    if winName contains "MUSE_ACTIVE_SESSION" or winName contains "muse-bin" or (winName contains "musedeck" and not (winName contains "codex")) then
      set tabContent to contents of selected tab of w
      set paras to paragraphs of tabContent
      set recentText to ""
      set pCount to count of paras
      set startIdx to pCount - 12
      if startIdx < 1 then set startIdx to 1
      repeat with i from startIdx to pCount
        set recentText to recentText & (item i of paras) & linefeed
      end repeat
      if recentText contains "Thinking (" or recentText contains "Working (" or recentText contains "esc to interrupt" then
        return "THINKING"
      else
        return "IDLE"
      end if
    end if
  end repeat
  return "UNKNOWN"
end tell
    `.trim();

    try {
      const { stdout } = await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      const res = stdout.trim();
      if (res === "THINKING") return "THINKING";
      if (res === "IDLE") return "IDLE";
      return "UNKNOWN";
    } catch {
      return "UNKNOWN";
    }
  }

  private static escapeForShell(str: string): string {
    return `"${str.replace(/(["\s'$`\\])/g, "\\$1")}"`;
  }

  private static escapeForAppleScript(str: string): string {
    return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  private static escapeForCli(str: string): string {
    return str.replace(/'/g, "'\\''");
  }
}

