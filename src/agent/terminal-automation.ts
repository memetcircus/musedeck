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
   * Bring Terminal to the front and paste the snipped image file path into muse prompt
   */
  static async pasteSnippetIntoTerminal(filePath: string): Promise<void> {
    const cleanPath = filePath.trim();

    // 1. Always copy clean file path to macOS clipboard via pbcopy
    try {
      await execAsync(`printf "%s " "${cleanPath}" | pbcopy`);
      console.log(`📋 [Clipboard] Copied snippet path to macOS clipboard: ${cleanPath}`);
    } catch (e: any) {
      console.warn("Failed to set pbcopy:", e.message);
    }

    // 2. Bring Terminal.app to the front specifically targeting muse session
    await this.focusMuseTerminalWindow();

    // 3. Type the snippet path directly into the active prompt using native helper
    const macTypeBin = this.getMacTypeBin();
    if (macTypeBin) {
      try {
        await execAsync(`"${macTypeBin}" text "${cleanPath} "`);
        console.log(`📋 [Terminal] Directly typed snippet path into active Terminal prompt!`);
        return;
      } catch (err: any) {
        console.warn("Native mac-type typing failed, attempting fallback:", err.message);
      }
    }

    // Fallback: AppleScript System Events keystroke
    const appleScript = `
tell application "Terminal" to activate
delay 0.1
tell application "System Events"
  keystroke " ${this.escapeForAppleScript(cleanPath)} "
end tell
    `.trim();

    try {
      await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      console.log(`📋 [Terminal] Pasted SAM snippet path into active Terminal prompt via AppleScript`);
    } catch (err: any) {
      console.warn("AppleScript keystroke failed (clipboard is ready with path):", err.message);
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

