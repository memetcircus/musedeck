import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * macOS Terminal.app Automation Controller
 * Connects physical Stream Deck keys directly to the developer's active Terminal running muse-code.
 */
export class TerminalAutomation {
  /**
   * Launch a new muse-code session in a dedicated new Terminal.app window
   */
  static async launchMuseCodeTerminal(rawCwd?: string, prompt?: string): Promise<void> {
    let projectDir = rawCwd || process.cwd() || "/Users/akif/Projects/musedeck/musedeck";
    if (projectDir.includes(".sdPlugin")) {
      projectDir = projectDir.split(/[\/\\]com\.memetcircus\.musedeck\.sdPlugin/)[0] || "/Users/akif/Projects/musedeck/musedeck";
    }

    const command = prompt
      ? `cd ${this.escapeForShell(projectDir)} && muse-code run --prompt ${this.escapeForShell(prompt)}`
      : `cd ${this.escapeForShell(projectDir)} && muse-code`;

    const appleScript = `
tell application "Terminal"
  activate
  do script "${this.escapeForAppleScript(command)}"
end tell
    `.trim();

    try {
      await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      console.log(`💻 [Terminal] Opened new Terminal window with command: ${command}`);
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
