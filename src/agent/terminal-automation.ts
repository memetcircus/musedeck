import { exec, spawn } from "node:child_process";
import { promisify } from "node:util";
import * as path from "node:path";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface MuseSessionInfo {
  id: string | number;
  title: string;
  project: string;
  isThinking: boolean;
  isActive: boolean;
  isHistorical?: boolean;
  dateStr?: string;
  timeStr?: string;
  timeBadge?: string;
  ageCategory?: "today" | "yesterday" | "older";
  sessionId?: string;
}

/**
 * macOS Terminal.app Automation Controller
 * Connects physical Stream Deck keys directly to the developer's active Terminal running muse.
 */
export class TerminalAutomation {
  static getActiveSessionId(): number | null {
    try {
      const idStr = fs.readFileSync("/tmp/musedeck/active_terminal_window_id.txt", "utf8").trim();
      const idNum = parseInt(idStr, 10);
      return isNaN(idNum) ? null : idNum;
    } catch {
      return null;
    }
  }

  static async setActiveSession(windowId: number): Promise<boolean> {
    try {
      fs.mkdirSync("/tmp/musedeck", { recursive: true });
      fs.writeFileSync("/tmp/musedeck/active_terminal_window_id.txt", windowId.toString());
      console.log(`🎯 [Terminal] Switched active Muse session to window ID: ${windowId}`);
    } catch (e: any) {
      console.warn("Could not write active window ID:", e.message);
    }
    return await this.focusMuseTerminalWindow();
  }

  static async listMuseSessions(): Promise<MuseSessionInfo[]> {
    const savedActiveId = this.getActiveSessionId();
    const appleScript = `
tell application "Terminal"
  set sessionList to {}
  repeat with w in windows
    set winTitle to name of w
    set wId to id of w
    if winTitle contains "muse-bin" or winTitle contains "MUSE_ACTIVE_SESSION" or (winTitle contains "muse" and not (winTitle contains "codex")) then
      set tabContent to contents of selected tab of w
      set isThinking to (tabContent contains "Thinking (" or tabContent contains "Working (" or tabContent contains "esc to interrupt")
      set end of sessionList to (wId as string) & ":::" & winTitle & ":::" & isThinking
    end if
  end repeat
  return sessionList
end tell
    `.trim();

    try {
      const { stdout } = await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      const raw = stdout.trim();
      if (!raw) return [];

      const entries = raw.split(", ");
      const sessions: MuseSessionInfo[] = [];

      for (const entry of entries) {
        const parts = entry.split(":::");
        if (parts.length >= 2) {
          const id = parseInt(parts[0], 10);
          const title = parts[1];
          const isThinking = parts[2] === "true";

          let project = "MUSE";
          if (title.includes("—")) {
            const segments = title.split("—").map((s) => s.trim());
            if (segments.length >= 2 && segments[1]) {
              project = segments[1].split(/[\s▸]/)[0].toUpperCase();
            }
          } else if (title.includes("MUSE_ACTIVE_SESSION")) {
            project = "MUSEDECK";
          }

          const isActive = savedActiveId ? id === savedActiveId : sessions.length === 0;

          sessions.push({
            id,
            title,
            project,
            isThinking,
            isActive,
          });
        }
      }

      return sessions;
    } catch (e: any) {
      console.warn("Could not list muse sessions:", e.message);
      return [];
    }
  }

  /**
   * Scan Muse historical sessions on disk (~/.local/share/muse/sessions)
   * Only includes non-empty sessions where the user actually entered a prompt/command.
   */
  static getPastSessions(limit = 12): MuseSessionInfo[] {
    const base = path.join(process.env.HOME || "/Users/akif", ".local/share/muse/sessions");
    if (!fs.existsSync(base)) return [];

    const found: Array<{ sid: string; jsonl: string; mtime: number }> = [];

    try {
      const years = fs.readdirSync(base).filter((y) => y.startsWith("20"));
      for (const y of years.sort().reverse()) {
        const yPath = path.join(base, y);
        const months = fs.readdirSync(yPath).filter((m) => !m.startsWith("."));
        for (const m of months.sort().reverse()) {
          const mPath = path.join(yPath, m);
          const days = fs.readdirSync(mPath).filter((d) => !d.startsWith("."));
          for (const d of days.sort().reverse()) {
            const dPath = path.join(mPath, d);
            const sids = fs.readdirSync(dPath).filter((s) => !s.startsWith("."));
            for (const sid of sids) {
              const sPath = path.join(dPath, sid);
              const jsonl = path.join(sPath, "session.jsonl");
              if (fs.existsSync(jsonl)) {
                try {
                  const stat = fs.statSync(jsonl);
                  found.push({ sid, jsonl, mtime: stat.mtimeMs });
                } catch {}
              }
            }
          }
        }
      }
    } catch (e: any) {
      console.warn("Error reading past sessions directory:", e.message);
      return [];
    }

    // Sort newest to oldest
    found.sort((a, b) => b.mtime - a.mtime);

    const results: MuseSessionInfo[] = [];
    for (const item of found) {
      if (results.length >= limit) break;

      let workspace = "";
      let prompt = "";
      try {
        const content = fs.readFileSync(item.jsonl, "utf8");
        // Skip empty sessions where user entered nothing!
        if (!content.includes("runtime.user_intent.accepted")) {
          continue;
        }

        const lines = content.split("\n").slice(0, 80);
        for (const l of lines) {
          if (!l) continue;
          try {
            const obj = JSON.parse(l);
            if (obj.payload_type === "runtime.session.metadata") {
              workspace = obj.payload?.record?.workspace_root || "";
            } else if (obj.payload_type === "runtime.user_intent.accepted" && !prompt) {
              prompt = obj.payload?.refill_blocks?.[0]?.text?.replace(/[\r\n\\]+/g, " ").trim().substring(0, 35) || "";
            }
          } catch {}
        }
      } catch {}

      // If no prompt was found, do not restore this session
      if (!prompt) continue;

      const homeDir = process.env.HOME || "/Users/akif";
      let project = "GLOBAL";
      if (workspace) {
        const trimmedWs = workspace.trim();
        if (trimmedWs === homeDir || trimmedWs === homeDir + "/" || trimmedWs === "~") {
          project = "GLOBAL";
        } else {
          project = path.basename(trimmedWs).toUpperCase();
        }
      }

      const now = new Date();
      const sessionDate = new Date(item.mtime);

      const isToday =
        now.getFullYear() === sessionDate.getFullYear() &&
        now.getMonth() === sessionDate.getMonth() &&
        now.getDate() === sessionDate.getDate();

      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday =
        yesterday.getFullYear() === sessionDate.getFullYear() &&
        yesterday.getMonth() === sessionDate.getMonth() &&
        yesterday.getDate() === sessionDate.getDate();

      let timeBadge = "";
      let ageCategory: "today" | "yesterday" | "older" = "older";

      if (isToday) {
        timeBadge = "TODAY";
        ageCategory = "today";
      } else if (isYesterday) {
        timeBadge = "YESTRDY";
        ageCategory = "yesterday";
      } else {
        timeBadge = sessionDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
        ageCategory = "older";
      }

      const timeStr = sessionDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
      const dateStr = `${timeBadge} ${timeStr}`;

      results.push({
        id: item.sid,
        sessionId: item.sid,
        title: prompt,
        project: project || "GLOBAL",
        dateStr,
        timeStr,
        timeBadge,
        ageCategory,
        isThinking: false,
        isActive: false,
        isHistorical: true,
      });
    }

    return results;
  }

  /**
   * Resume an existing historical session in a new Terminal window
   */
  static async resumeMuseSession(sessionId: string): Promise<void> {
    const command = `muse resume ${sessionId.trim()}`;
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
      console.log(`💻 [Terminal] Resumed session ${sessionId} in dedicated Terminal window: ${command}`);
    } catch (err: any) {
      console.error("Failed to resume session via AppleScript:", err.message);
    }
  }

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

  static async bringTerminalToFront(): Promise<boolean> {
    return await this.focusMuseTerminalWindow();
  }

  private static async focusMuseTerminalWindow(): Promise<boolean> {
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

  -- 2. Fallback: match window with "MUSE_ACTIVE_SESSION", "muse-bin", or "muse" in title or tab content (exclude "codex")
  if targetWin is missing value then
    repeat with w in windows
      set winName to name of w
      if winName contains "MUSE_ACTIVE_SESSION" or winName contains "muse-bin" or (winName contains "muse" and not (winName contains "codex")) then
        set targetWin to w
        exit repeat
      end if
    end repeat
  end if

  -- 3. Bring target window to front if found, else do NOT activate random terminals
  if targetWin is not missing value then
    set index of targetWin to 1
    activate
    return "FOUND"
  else
    return "NOT_FOUND"
  end if
end tell
    `.trim();

    try {
      const { stdout } = await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      const status = stdout.trim();
      if (status === "FOUND") {
        await new Promise((r) => setTimeout(r, 200));
        return true;
      }
      console.warn("⚠️ [TerminalAutomation] No active Muse Code terminal session found in Terminal.app windows");
      return false;
    } catch (e: any) {
      console.warn("Could not focus muse window specifically:", e.message);
      return false;
    }
  }

  /**
   * Send a physical keypress into Terminal.app for HITL approvals (e.g. "1", "2", "3", "4", "y", "n")
   */
  static async sendApprovalKeystroke(key: string): Promise<void> {
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
   * Type a prompt snippet directly into active Muse Terminal prompt at the cursor.
   * If pressEnter is true (e.g. for "GO!"), immediately executes with Enter.
   * Strictly verifies that an active Muse Code terminal exists before typing.
   */
  static async typeSnippetIntoTerminal(snippetText: string, pressEnter = false): Promise<boolean> {
    const cleanText = snippetText.trim();
    const textToInsert = pressEnter ? cleanText : ` ${cleanText} `;

    // 1. Bring active Muse Terminal to front (verifies Muse session exists!)
    const hasMuseSession = await this.focusMuseTerminalWindow();
    if (!hasMuseSession) {
      console.warn(`⚠️ [Terminal] Ignored typing "${cleanText}": No active Muse Code terminal found.`);
      return false;
    }

    // 2. Type text directly via native mac-type helper
    const macTypeBin = this.getMacTypeBin();
    if (macTypeBin) {
      try {
        await execAsync(`"${macTypeBin}" text "${this.escapeForShell(textToInsert)}"`);
        if (pressEnter) {
          await new Promise((r) => setTimeout(r, 60));
          await execAsync(`"${macTypeBin}" enter`);
        }
        console.log(`📝 [Terminal] Typed prompt snippet at cursor: "${cleanText}" (pressEnter=${pressEnter})`);
        return true;
      } catch (err: any) {
        console.warn("Native mac-type typing failed, attempting fallback:", err.message);
      }
    }

    // Fallback: AppleScript System Events
    const enterScript = pressEnter ? "\n  delay 0.05\n  key code 36" : "";
    const appleScript = `
tell application "Terminal" to activate
delay 0.05
tell application "System Events"
  keystroke "${this.escapeForAppleScript(textToInsert)}"${enterScript}
end tell
    `.trim();

    try {
      await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      console.log(`📝 [Terminal] Typed snippet via AppleScript (pressEnter=${pressEnter})`);
      return true;
    } catch (err: any) {
      console.error("Failed to type snippet:", err.message);
      return false;
    }
  }

  /**
   * Type a structured prompt directly into active Muse Terminal and press Enter
   */
  static async typePromptIntoTerminal(promptText: string, pressEnter = true): Promise<boolean> {
    return this.typeSnippetIntoTerminal(promptText, pressEnter);
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

  /**
   * Opens a file in the developer's active editor (VS Code or system default)
   */
  static async openFileInEditor(filePath: string): Promise<boolean> {
    try {
      // Try opening in VS Code first
      await execAsync(`code -r "${filePath}"`);
      return true;
    } catch {
      try {
        // Fallback to macOS default opener
        await execAsync(`open "${filePath}"`);
        return true;
      } catch (err: any) {
        console.warn("Failed to open file in editor:", err.message);
        return false;
      }
    }
  }

  /**
   * Compiles and runs live interactive preview of extracted UI components
   */
  static async runLivePreview(filePath: string): Promise<boolean> {
    const ext = path.extname(filePath).toLowerCase();
    try {
      if (ext === ".swift") {
        const binPath = "/tmp/musedeck/PreviewApp";
        console.log(`🔨 [LivePreview] Compiling SwiftUI component: ${filePath}...`);
        await execAsync(`swiftc -parse-as-library -o "${binPath}" "${filePath}"`);
        console.log(`🚀 [LivePreview] Launching native macOS SwiftUI window...`);
        const child = spawn(binPath, [], { detached: true, stdio: "ignore" });
        child.unref();

        setTimeout(async () => {
          try {
            await execAsync(`swift -e '
import Cocoa
guard let app = NSRunningApplication.runningApplications(withBundleIdentifier: "").first(where: { $0.executableURL?.lastPathComponent == "PreviewApp" })
    ?? NSWorkspace.shared.runningApplications.first(where: { $0.localizedName == "PreviewApp" }) else { exit(0) }
let axApp = AXUIElementCreateApplication(app.processIdentifier)
var windowsRef: CFTypeRef?
if AXUIElementCopyAttributeValue(axApp, kAXWindowsAttribute as CFString, &windowsRef) == .success,
   let windows = windowsRef as? [AXUIElement], let window = windows.first {
    var newPoint = CGPoint(x: 770, y: 150)
    if let pointValue = AXValueCreate(.cgPoint, &newPoint) {
        AXUIElementSetAttributeValue(window, kAXPositionAttribute as CFString, pointValue)
    }
}
'`);
            await execAsync(`osascript -e 'tell application "System Events" to set frontmost of (first process whose name contains "PreviewApp") to true'`);
          } catch {}
        }, 800);
        return true;
      }

      if (ext === ".html") {
        await execAsync(`open "${filePath}"`);
        return true;
      }

      if (ext === ".tsx" || ext === ".jsx") {
        const code = await fs.promises.readFile(filePath, "utf8");
        const cleanJsx = code
          .replace(/import\s+.*?from\s+['"].*?['"];?/g, "")
          .replace(/export\s+default\s+/g, "")
          .replace(/export\s+/g, "");

        const htmlWrapper = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MuseDeck • Component Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-6">
  <div id="root"></div>
  <script type="text/babel">
    ${cleanJsx}
    const Component = typeof ExtractedComponent !== "undefined" ? ExtractedComponent : (typeof App !== "undefined" ? App : () => <div>Mounted</div>);
    ReactDOM.createRoot(document.getElementById("root")).render(<Component />);
  </script>
</body>
</html>`;
        const previewHtml = "/tmp/musedeck/preview.html";
        await fs.promises.writeFile(previewHtml, htmlWrapper, "utf8");
        await execAsync(`open "${previewHtml}"`);
        return true;
      }

      if (ext === ".py") {
        await execAsync(`python3 "${filePath}" &`);
        return true;
      }

      await execAsync(`open "${filePath}"`);
      return true;
    } catch (err: any) {
      console.warn("Live preview failed:", err.message);
      return false;
    }
  }

  /**
   * Displays a native macOS Notification Center alert
   */
  static async sendSystemNotification(message: string, title = "MuseDeck"): Promise<void> {
    try {
      const appleScript = `display notification "${this.escapeForAppleScript(message)}" with title "${this.escapeForAppleScript(title)}"`;
      await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
    } catch (err: any) {
      console.warn("Could not display macOS notification:", err.message);
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

