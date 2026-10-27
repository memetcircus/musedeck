import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * macOS Terminal.app Automation Controller
 * Connects physical Stream Deck keys directly to the developer's active Terminal running muse-code.
 */
export class TerminalAutomation {
  /**
   * Launch a new muse-code session in Terminal.app, or bring it to the front
   */
  static async launchMuseCodeTerminal(cwd: string, prompt?: string): Promise<void> {
    const command = prompt
      ? `cd ${this.escapeForShell(cwd)} && muse-code run --prompt ${this.escapeForShell(prompt)}`
      : `cd ${this.escapeForShell(cwd)} && muse-code`;

    const appleScript = `
tell application "Terminal"
  activate
  set isIdle to false
  try
    -- If there's an existing window with no busy process, reuse it
    if (count of windows) > 0 then
      set w to front window
      if not (busy of selected tab of w) then
        do script "${this.escapeForAppleScript(command)}" in w
        return
      end if
    end if
  end try
  -- Otherwise open a clean new terminal window
  do script "${this.escapeForAppleScript(command)}"
end tell
    `.trim();

    try {
      await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      console.log(`💻 [Terminal] Launched muse-code in Terminal.app`);
    } catch (err: any) {
      console.error("Failed to launch Terminal.app via AppleScript:", err.message);
    }
  }

  /**
   * Send a physical 'y' or 'n' keypress into Terminal.app for HITL approvals
   */
  static async sendApprovalKeystroke(key: "y" | "n"): Promise<void> {
    const appleScript = `
tell application "Terminal" to activate
delay 0.15
tell application "System Events"
  keystroke "${key}"
  delay 0.1
  key code 36 -- Return / Enter key
end tell
    `.trim();

    try {
      await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      console.log(`⚡ [Terminal] Sent '${key}' + Enter to active terminal`);
    } catch (err: any) {
      console.error(`Failed to send keystroke '${key}' to Terminal:`, err.message);
    }
  }

  /**
   * Bring Terminal to the front and paste the snipped image file path into muse-code
   */
  static async pasteSnippetIntoTerminal(filePath: string): Promise<void> {
    const appleScript = `
tell application "Terminal" to activate
delay 0.2
tell application "System Events"
  keystroke " ${this.escapeForAppleScript(filePath)} "
end tell
    `.trim();

    try {
      await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      console.log(`📋 [Terminal] Pasted SAM snippet path into active terminal prompt`);
    } catch (err: any) {
      console.error("Failed to paste snippet path into Terminal:", err.message);
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
