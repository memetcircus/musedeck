import { exec, execSync, spawn } from "node:child_process";
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

  /**
   * Focus an existing Terminal session with a dedicated session title, or launch a new one.
   * If any candidate document file exists on disk, launches in update/refine mode.
   * If it does not exist, launches in initial creation / SDD interview mode.
   */
  static async focusOrLaunchDocSession(
    docKey: string,
    fileCandidates: string[],
    initialPrompt: string,
    updatePrompt: string,
    rawCwd?: string
  ): Promise<void> {
    let projectDir = rawCwd || process.cwd() || "/Users/akif/Projects/musedeck/musedeck";
    if (projectDir.includes(".sdPlugin")) {
      projectDir = projectDir.split(/[\/\\]com\.memetcircus\.musedeck\.sdPlugin/)[0] || "/Users/akif/Projects/musedeck/musedeck";
    }

    const sessionTitle = `MUSE_${docKey.toUpperCase()}_SESSION`;

    // 1. Try to find an existing Terminal window or tab with this sessionTitle
    const focusAppleScript = `
tell application "Terminal"
  set targetWin to missing value
  repeat with w in windows
    repeat with t in tabs of w
      try
        if custom title of t is "${sessionTitle}" then
          set targetWin to w
          set selected tab of w to t
          exit repeat
        end if
      end try
    end repeat
    if targetWin is not missing value then exit repeat
  end repeat

  if targetWin is not missing value then
    set index of targetWin to 1
    activate
    return "FOCUSED"
  else
    return "NOT_FOUND"
  end if
end tell
    `.trim();

    try {
      const { stdout } = await execAsync(`osascript -e '${this.escapeForCli(focusAppleScript)}'`);
      if (stdout.trim().includes("FOCUSED")) {
        console.log(`🎯 [Terminal] Brought existing session for ${sessionTitle} to front!`);
        return;
      }
    } catch (e: any) {
      console.warn(`[Terminal] Check existing session error:`, e.message);
    }

    // 2. Not found: Check if any candidate file exists on disk
    let fileExists = false;
    let foundPath = "";
    for (const cand of fileCandidates) {
      const fullPath = path.join(projectDir, cand);
      if (fs.existsSync(fullPath)) {
        fileExists = true;
        foundPath = cand;
        break;
      }
    }

    // If file exists, open it in VS Code/editor in background
    if (fileExists && foundPath) {
      exec(`code "${path.join(projectDir, foundPath)}" 2>/dev/null || open "${path.join(projectDir, foundPath)}" 2>/dev/null || true`);
    }

    const chosenPrompt = fileExists ? updatePrompt : initialPrompt;
    const command = `cd ${this.escapeForShell(projectDir)} && muse ${this.escapeForShell(chosenPrompt)}`;

    const launchScript = `
tell application "Terminal"
  activate
  set newTab to (do script "${this.escapeForAppleScript(command)}")
  try
    set custom title of selected tab of window 1 to "${sessionTitle}"
    set title displays custom title of selected tab of window 1 to true
  end try
end tell
    `.trim();

    try {
      await execAsync(`osascript -e '${this.escapeForCli(launchScript)}'`);
      console.log(`🚀 [Terminal] Launched new session [${sessionTitle}] (fileExists=${fileExists})`);
    } catch (err: any) {
      console.error(`Failed to launch session for ${sessionTitle}:`, err.message);
    }
  }

  /**
   * Run an automated context command in the active Muse terminal or a fresh session.
   */
  static async runContextAction(prompt: string, rawCwd?: string): Promise<void> {
    let projectDir = rawCwd || process.cwd() || "/Users/akif/Projects/musedeck/musedeck";
    if (projectDir.includes(".sdPlugin")) {
      projectDir = projectDir.split(/[\/\\]com\.memetcircus\.musedeck\.sdPlugin/)[0] || "/Users/akif/Projects/musedeck/musedeck";
    }

    const hasFocused = await this.focusMuseTerminalWindow();
    if (hasFocused) {
      await this.typeSnippetIntoTerminal(prompt, true);
    } else {
      await this.launchMuseCodeTerminal(projectDir, prompt);
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
   * Safely attach a recorded video flow directly into the active Muse Code terminal prompt.
   * - Focuses existing Muse terminal specifically (never touches random windows like TextEdit or plain shells).
   * - If no Muse Code terminal exists, automatically launches a fresh one, waits for prompt readiness, and inserts the path.
   * - Types the video link directly at the prompt cursor and copies it to clipboard.
   */
  static async pasteVideoAttachmentIntoMuseTerminal(videoPath: string): Promise<boolean> {
    const cleanPath = path.resolve(videoPath.trim());
    if (!fs.existsSync(cleanPath)) {
      console.warn(`⚠️ [Terminal] Video file not found: ${cleanPath}`);
      return false;
    }

    // 1. Copy clean path to macOS clipboard
    try {
      await execAsync(`printf "%s " "${cleanPath}" | pbcopy`);
      console.log(`📋 [Clipboard] Copied video path to macOS clipboard: ${cleanPath}`);
    } catch (e: any) {
      console.warn("Failed to set pbcopy:", e.message);
    }

    // 2. Check if active Muse session exists, or spawn a new one
    let hasMuseSession = await this.focusMuseTerminalWindow();
    if (!hasMuseSession) {
      console.log("💻 [Terminal] No active Muse Code terminal window found. Spawning new dedicated session...");
      await this.sendSystemNotification("Launching new Muse Code terminal session...", "MuseDeck");
      await this.launchMuseCodeTerminal(process.cwd());

      // Wait up to 5 seconds for the Terminal window to register and focus
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 400));
        hasMuseSession = await this.focusMuseTerminalWindow();
        if (hasMuseSession) break;
      }
      // Give the muse CLI process time to finish banner/init and present the interactive prompt
      await new Promise((r) => setTimeout(r, 2200));
    }

    // Re-verify window focus
    await this.focusMuseTerminalWindow();

    // 3. Type video path directly into the terminal prompt cursor via native mac-type
    const textToInsert = `${cleanPath} `;
    const macTypeBin = this.getMacTypeBin();
    if (macTypeBin) {
      try {
        await execAsync(`"${macTypeBin}" text "${textToInsert}"`);
        console.log(`🎬 [Terminal] Typed video link at cursor: ${textToInsert}`);
        await this.sendSystemNotification("Screen flow recorded and attached to Muse Code prompt.", "MuseDeck");
        return true;
      } catch (err: any) {
        console.warn("Native mac-type typing failed, attempting AppleScript fallback:", err.message);
      }
    }

    // 4. Fallback: AppleScript System Events keystroke
    const appleScript = `
tell application "Terminal" to activate
delay 0.08
tell application "System Events"
  keystroke "${this.escapeForAppleScript(textToInsert)}"
end tell
    `.trim();

    try {
      await execAsync(`osascript -e '${this.escapeForCli(appleScript)}'`);
      console.log(`🎬 [Terminal] Typed video link via AppleScript into Muse Code prompt: ${cleanPath}`);
      await this.sendSystemNotification("Screen flow recorded and attached to Muse Code prompt.", "MuseDeck");
      return true;
    } catch (err: any) {
      console.warn("Failed to insert video link into terminal:", err.message);
      return false;
    }
  }

  /**
   * Safe Git Commit action with strict focus & repo guards:
   * 1. Checks if Terminal.app is frontmost and focused on an active Muse terminal window.
   *    If not focused (defocus): returns "NO_FOCUS" and notifies user.
   * 2. Checks if current directory is a git repository.
   *    If not: returns "NO_GIT" and notifies user.
   * 3. Checks if working tree has any changes (`git status --porcelain`).
   *    If clean: returns "CLEAN" and notifies user.
   * 4. If changes exist: types prompt into active Muse terminal:
   *    "Stage all verified changes, create a git commit with a clear semantic message, and push to origin."
   *    and returns "COMMITTING".
   */
  static async executeSafeGitCommit(rawCwd?: string): Promise<"COMMITTING" | "CLEAN" | "NO_GIT" | "NO_FOCUS" | "ERROR"> {
    const cwd = rawCwd || process.cwd() || "/Users/akif/Projects/musedeck/musedeck";

    // 1. Defocus / Focus Check: Verify Terminal.app is frontmost and active window is Muse Code
    const focusCheckScript = `
tell application "System Events"
  set frontApp to name of first application process whose frontmost is true
end tell
if frontApp is not "Terminal" then
  return "DEFOCUS"
else
  tell application "Terminal"
    if (count of windows) is 0 then return "DEFOCUS"
    set winName to name of window 1
    if winName contains "MUSE_ACTIVE_SESSION" or winName contains "muse-bin" or (winName contains "muse" and not (winName contains "codex")) then
      return "FOCUSED_MUSE"
    else
      return "DEFOCUS"
    end if
  end tell
end if
    `.trim();

    try {
      const { stdout: focusStatus } = await execAsync(`osascript -e '${this.escapeForCli(focusCheckScript)}'`);
      if (focusStatus.trim() !== "FOCUSED_MUSE") {
        console.warn("⚠️ [GitCommit] Defocused: Terminal.app is not frontmost or not running Muse Code");
        await this.sendSystemNotification("Muse Code terminal is not focused. Focus your active terminal to commit changes.", "MuseDeck");
        return "NO_FOCUS";
      }
    } catch {
      return "NO_FOCUS";
    }

    // 2. Check if git repository exists
    try {
      execSync("git rev-parse --is-inside-work-tree", { cwd, stdio: "ignore" });
    } catch {
      console.warn(`⚠️ [GitCommit] Directory is not a git repository: ${cwd}`);
      await this.sendSystemNotification("Directory is not a git repository.", "MuseDeck");
      return "NO_GIT";
    }

    // 3. Check if working tree has any uncommitted changes
    try {
      const porcelain = execSync("git status --porcelain", { cwd }).toString().trim();
      if (!porcelain) {
        console.log("ℹ️ [GitCommit] Working tree is clean. Nothing to commit.");
        await this.sendSystemNotification("Working tree is clean. Nothing to commit.", "MuseDeck");
        return "CLEAN";
      }
    } catch (err: any) {
      console.warn("Failed to check git status:", err.message);
      return "ERROR";
    }

    // 4. Working tree has changes & Muse terminal is focused -> dispatch commit prompt into terminal
    const commitPrompt = "Stage all verified changes, create a git commit with a clear semantic message, and push to origin.";
    console.log(`🚀 [GitCommit] Dispatching commit prompt to focused Muse terminal: "${commitPrompt}"`);
    await this.typeSnippetIntoTerminal(commitPrompt, true);
    await this.sendSystemNotification("Committing and pushing changes in Muse Code terminal...", "MuseDeck");
    return "COMMITTING";
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
   * Opens a file in the developer's active editor (VS Code, Cursor, Antigravity, or TextEdit fallback)
   */
  static async openFileInEditor(filePath: string): Promise<boolean> {
    const candidateEditors = [
      "Visual Studio Code",
      "Cursor",
      "Antigravity IDE",
      "Antigravity",
      "Sublime Text",
      "Zed",
      "Xcode",
    ];

    for (const editor of candidateEditors) {
      if (fs.existsSync(`/Applications/${editor}.app`)) {
        try {
          await execAsync(`open -a "${editor}" "${filePath}"`);
          return true;
        } catch {}
      }
    }

    // Try system default application association
    try {
      await execAsync(`open "${filePath}"`);
      return true;
    } catch {
      // Universal macOS fallback: TextEdit
      try {
        await execAsync(`open -e "${filePath}"`);
        await TerminalAutomation.sendSystemNotification(
          "No dedicated code editor detected. Opened file in TextEdit.",
          "MuseDeck Editor"
        );
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
        console.log(`🛑 [LivePreview] Terminating any existing PreviewApp instances...`);
        try {
          await execAsync("killall PreviewApp || true");
          if (fs.existsSync(binPath)) {
            fs.unlinkSync(binPath);
          }
        } catch {}

        console.log(`🔨 [LivePreview] Compiling SwiftUI component: ${filePath}...`);
        try {
          let swiftCode = await fs.promises.readFile(filePath, "utf8");
          swiftCode = swiftCode.replace(/weight:\s*\.?100\b/g, "weight: .ultraLight");
          swiftCode = swiftCode.replace(/weight:\s*\.?200\b/g, "weight: .thin");
          swiftCode = swiftCode.replace(/weight:\s*\.?300\b/g, "weight: .light");
          swiftCode = swiftCode.replace(/weight:\s*\.?400\b/g, "weight: .regular");
          swiftCode = swiftCode.replace(/weight:\s*\.?500\b/g, "weight: .medium");
          swiftCode = swiftCode.replace(/weight:\s*\.?600\b/g, "weight: .semibold");
          swiftCode = swiftCode.replace(/weight:\s*\.?700\b/g, "weight: .bold");
          swiftCode = swiftCode.replace(/weight:\s*\.?800\b/g, "weight: .heavy");
          swiftCode = swiftCode.replace(/weight:\s*\.?900\b/g, "weight: .black");
          swiftCode = swiftCode.replace(/dampingFactor:/g, "dampingFraction:");
          swiftCode = swiftCode.replace(/\.padding\(\.horizontal,\s*(\d+),\s*vertical:\s*(\d+)\)/g, ".padding(.horizontal, $1).padding(.vertical, $2)");
          swiftCode = swiftCode.replace(/\.padding\(\.vertical,\s*(\d+),\s*horizontal:\s*(\d+)\)/g, ".padding(.vertical, $1).padding(.horizontal, $2)");
          swiftCode = swiftCode.replace(
            /\.stroke\(([\s\S]*?),\s*lineWidth:\s*([^,)]+),\s*lineCap:\s*([^,)]+)\)/g,
            (match, content, lw, lc) => {
              if (content.includes("StrokeStyle")) return match;
              return `.stroke(${content}, style: StrokeStyle(lineWidth: ${lw}, lineCap: ${lc}))`;
            }
          );
          swiftCode = swiftCode.replace(
            /\.stroke\(([\s\S]*?),\s*lineCap:\s*([^,)]+),\s*lineWidth:\s*([^,)]+)\)/g,
            (match, content, lc, lw) => {
              if (content.includes("StrokeStyle")) return match;
              return `.stroke(${content}, style: StrokeStyle(lineWidth: ${lw}, lineCap: ${lc}))`;
            }
          );
          // Auto-heal iOS-only SwiftUI modifiers that break macOS swiftc compilation:
          swiftCode = swiftCode.replace(/\.navigationBarTitleDisplayMode\([^)]*\)/g, "");
          swiftCode = swiftCode.replace(/\.navigationBarHidden\([^)]*\)/g, "");
          swiftCode = swiftCode.replace(/\.navigationBarItems\([^)]*\)/g, "");
          swiftCode = swiftCode.replace(/\.statusBarHidden\([^)]*\)/g, "");
          swiftCode = swiftCode.replace(/\.statusBarStyle\([^)]*\)/g, "");
          swiftCode = swiftCode.replace(/\.presentationDragIndicator\([^)]*\)/g, "");
          swiftCode = swiftCode.replace(/\.keyboardType\([^)]*\)/g, "");
          swiftCode = swiftCode.replace(/\.textInputAutocapitalization\([^)]*\)/g, "");

          // Dynamic aspect-ratio-aware window sizing (iPad/Landscape vs iPhone/Portrait)
          const segmentedPath = "/tmp/musedeck/latest_segmented.png";
          const montagePath = "/tmp/musedeck/flow_montage.png";
          const capturePath = fs.existsSync(segmentedPath) ? segmentedPath : (fs.existsSync(montagePath) ? montagePath : null);

          let isLandscape = false;
          if (capturePath) {
            try {
              const sharpModule: any = await import("sharp");
              const sharp = sharpModule.default || sharpModule;
              const meta = await sharp(capturePath).metadata();
              if (meta.width && meta.height) {
                const ratio = meta.width / meta.height;
                isLandscape = ratio >= 1.2;
                let idealW = 390;
                let idealH = 780;
                let minW = 320;
                let minH = 500;

                if (isLandscape) {
                  // Tablet / desktop / wide dashboard layout
                  idealW = Math.min(1200, Math.max(900, Math.round(meta.width)));
                  idealH = Math.round(idealW / ratio);
                  minW = 750;
                  minH = 500;
                } else if (ratio <= 0.8) {
                  // Mobile phone layout
                  idealW = 390;
                  idealH = 780;
                  minW = 320;
                  minH = 500;
                } else {
                  // Square / card layout
                  idealW = Math.min(800, Math.max(520, Math.round(meta.width)));
                  idealH = Math.round(idealW / ratio);
                  minW = 400;
                  minH = 400;
                }

                // ONLY modify the @main PreviewApp window frame, NEVER touch component inner views/icons!
                const previewAppMatch = swiftCode.match(/@main[\s\S]*?struct\s+PreviewApp[\s\S]*$/);
                if (previewAppMatch && previewAppMatch.index !== undefined) {
                  let previewAppCode = previewAppMatch[0];
                  previewAppCode = previewAppCode.replace(
                    /\.frame\(width:\s*\d+,\s*height:\s*\d+\)(?:\s*\.windowResizability\(\.contentSize\))?/,
                    `.frame(minWidth: ${minW}, idealWidth: ${idealW}, maxWidth: .infinity, minHeight: ${minH}, idealHeight: ${idealH}, maxHeight: .infinity)`
                  );
                  previewAppCode = previewAppCode.replace(/\.windowResizability\(\.contentSize\)/, "");
                  swiftCode = swiftCode.slice(0, previewAppMatch.index) + previewAppCode;
                }
              }
            } catch {}
          }

          await fs.promises.writeFile(filePath, swiftCode, "utf8");

          await execAsync(`swiftc -parse-as-library -o "${binPath}" "${filePath}"`);
        } catch (compileErr: any) {
          console.warn(`⚠️ [LivePreview] swiftc compilation error: ${compileErr.message}`);
          await TerminalAutomation.sendSystemNotification("Opening component in Xcode Canvas...", "MuseDeck Preview");
          await execAsync(`open -a Xcode "${filePath}"`);
          return false;
        }

        console.log(`🚀 [LivePreview] Launching native macOS SwiftUI window...`);
        const child = spawn(binPath, [], { detached: true, stdio: "ignore" });
        child.unref();

        setTimeout(async () => {
          try {
            await execAsync(`swift -e '
import Cocoa
guard let app = NSRunningApplication.runningApplications(withBundleIdentifier: "").first(where: { $0.executableURL?.lastPathComponent == "PreviewApp" })
    ?? NSWorkspace.shared.runningApplications.first(where: { $0.localizedName == "PreviewApp" }) else { exit(0) }
app.activate(options: [.activateIgnoringOtherApps, .activateAllWindows])
let axApp = AXUIElementCreateApplication(app.processIdentifier)
var windowsRef: CFTypeRef?
if AXUIElementCopyAttributeValue(axApp, kAXWindowsAttribute as CFString, &windowsRef) == .success,
   let windows = windowsRef as? [AXUIElement], let window = windows.first {
    var newPoint = CGPoint(x: 200, y: 120)
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
        const tsModule: any = await import("typescript");
        const ts = tsModule.default || tsModule;
        const code = await fs.promises.readFile(filePath, "utf8");
        const defaultExportMatch = code.match(/export\s+default\s+(?:function\s+)?([A-Za-z0-9_]+)/);
        const functionMatches = [...code.matchAll(/function\s+([A-Z][A-Za-z0-9_]*)/g)].map(m => m[1]);
        const rootComponentName = defaultExportMatch ? defaultExportMatch[1] : (functionMatches[functionMatches.length - 1] || "ExtractedComponent");

        const cleanCode = code
          .replace(/import\s+.*?from\s+[\x27"][^\x27"]*[\x27"];?/g, "")
          .replace(/export\s+default\s+/g, "")
          .replace(/export\s+/g, "");

        const transpiled = ts.transpileModule(cleanCode, {
          compilerOptions: {
            jsx: ts.JsxEmit.React,
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.None,
          },
        });

        const htmlWrapper = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MuseDeck • Component Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-6">
  <div id="root" class="w-full max-w-5xl"></div>
  <script>
    Object.assign(window, React);
    const { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext, useReducer, useId, useLayoutEffect, useTransition, useDeferredValue } = React;
    const { motion, AnimatePresence, useReducedMotion, useAnimation, useMotionValue, useTransform, useSpring } = window.Motion || {};

    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      static getDerivedStateFromError(error) {
        return { hasError: true, error: error };
      }
      componentDidCatch(error, errorInfo) {
        console.error("Preview render error:", error, errorInfo);
      }
      render() {
        if (this.state.hasError) {
          return React.createElement("div", {
            style: { color: "#f87171", background: "#1e1b4b", padding: "24px", borderRadius: "12px", border: "1px solid #ef4444", fontFamily: "sans-serif" }
          }, [
            React.createElement("h3", { key: "h3", style: { margin: "0 0 8px 0", fontSize: "16px", fontWeight: "bold" } }, "Component Render Error"),
            React.createElement("pre", { key: "pre", style: { margin: 0, whiteSpace: "pre-wrap", fontSize: "13px" } }, this.state.error ? (this.state.error.message || String(this.state.error)) : "Unknown error")
          ]);
        }
        return this.props.children;
      }
    }

    ${transpiled.outputText}

    try {
      const RootTarget = typeof ${rootComponentName} !== "undefined"
        ? ${rootComponentName}
        : (typeof ExtractedComponent !== "undefined" ? ExtractedComponent : (typeof App !== "undefined" ? App : () => React.createElement("div", { className: "text-amber-400 p-4" }, "Component rendered successfully")));
      ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(ErrorBoundary, null, React.createElement(RootTarget)));
    } catch (renderErr) {
      document.getElementById("root").innerHTML = "<div style=\\"color:red;padding:20px;font-family:sans-serif;\\">Render Error: " + renderErr.message + "</div>";
    }
  </script>
</body>
</html>`;
        const previewHtml = "/tmp/musedeck/preview.html";
        await fs.promises.writeFile(previewHtml, htmlWrapper, "utf8");
        await execAsync(`open "${previewHtml}"`);
        return true;
      }

      if (ext === ".vue") {
        const vueCode = await fs.promises.readFile(filePath, "utf8");
        const tsModule: any = await import("typescript");
        const ts = tsModule.default || tsModule;

        let cleanVue = vueCode;
        const scriptMatch = vueCode.match(/<script\s+setup(?:\s+lang="ts")?>([\s\S]*?)<\/script>/);
        if (scriptMatch) {
          const transpiled = ts.transpileModule(scriptMatch[1], {
            compilerOptions: {
              target: ts.ScriptTarget.ES2020,
              module: ts.ModuleKind.ESNext,
            },
          });
          cleanVue = vueCode.replace(
            /<script\s+setup(?:\s+lang="ts")?>[\s\S]*?<\/script>/,
            `<script setup>\n${transpiled.outputText}\n</script>`
          );
        }

        const safeVueJson = JSON.stringify(cleanVue).replace(/<\/script>/gi, "<\\/script>");

        const htmlWrapper = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MuseDeck • Vue Component Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <script src="https://unpkg.com/vue3-sfc-loader"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-6">
  <div id="app" class="w-full max-w-6xl"></div>
  <script>
    const vueSource = ${safeVueJson};
    const { loadModule } = window["vue3-sfc-loader"];
    const options = {
      moduleCache: { vue: Vue },
      async getFile(url) {
        return vueSource;
      },
      addStyle(textContent) {
        const style = document.createElement("style");
        style.textContent = textContent;
        document.head.appendChild(style);
      },
    };
    try {
      const app = Vue.createApp(Vue.defineAsyncComponent(() => loadModule("component.vue", options)));
      app.mount("#app");
    } catch (err) {
      document.getElementById("app").innerHTML = '<div style="color:red;padding:20px;font-family:monospace;">Render Error: ' + err.message + '</div>';
    }
  </script>
</body>
</html>`;
        const previewHtml = "/tmp/musedeck/preview.html";
        await fs.promises.writeFile(previewHtml, htmlWrapper, "utf8");
        await execAsync(`open "${previewHtml}"`);
        return true;
      }

      if (ext === ".kt") {
        const hasAndroidStudio = fs.existsSync("/Applications/Android Studio.app");
        if (hasAndroidStudio) {
          try {
            const projectTarget = await TerminalAutomation.prepareComposeProject(filePath);
            await execAsync(`open -a "Android Studio" "/tmp/musedeck/ComposePreview"`);
            await execAsync(`open -a "Android Studio" "${projectTarget}"`);
            await execAsync(`osascript -e 'tell application "Android Studio" to activate'`);
            await TerminalAutomation.sendSystemNotification(
              "Compose project loaded in Android Studio with LayoutLib @Preview canvas.",
              "Android Studio Compose"
            );
            return true;
          } catch (err: any) {
            console.warn("Failed to open in Android Studio project mode:", err.message);
          }
        }

        await this.openFileInEditor(filePath);
        await TerminalAutomation.sendSystemNotification(
          "Android Studio is not installed. Jetpack Compose preview requires Android Studio. File opened in VS Code instead.",
          "MuseDeck - Compose Preview"
        );
        return true;
      }

      if (ext === ".dart") {
        let hasFlutter = false;
        const flutterBin = fs.existsSync("/opt/homebrew/bin/flutter")
          ? "/opt/homebrew/bin/flutter"
          : (fs.existsSync("/opt/homebrew/share/flutter/bin/flutter") ? "/opt/homebrew/share/flutter/bin/flutter" : null);

        if (flutterBin) {
          hasFlutter = true;
          try {
            await TerminalAutomation.sendSystemNotification("Building Flutter Web Live Preview...", "Flutter Preview");
            const projectDir = "/tmp/musedeck/FlutterPreview";
            if (!fs.existsSync(path.join(projectDir, "pubspec.yaml"))) {
              await execAsync(`${flutterBin} create --project-name=flutter_preview --platforms=web "${projectDir}"`);
            }
            let dartCode = await fs.promises.readFile(filePath, "utf8");
            dartCode = TerminalAutomation.healDartCode(dartCode);
            await fs.promises.writeFile(path.join(projectDir, "lib/main.dart"), dartCode, "utf8");
            await execAsync(`cd "${projectDir}" && ${flutterBin} build web --base-href=/flutter/ --no-pub`);
            try {
              await execAsync(`open -a "Google Chrome" "http://localhost:3456/flutter/"`);
            } catch {
              await execAsync(`open "http://localhost:3456/flutter/"`);
            }
            await TerminalAutomation.sendSystemNotification("Flutter Web Live Preview launched in Chrome!", "Flutter Preview");
            return true;
          } catch (err: any) {
            console.warn("Flutter web build failed, falling back to VS Code:", err.message);
          }
        }

        await this.openFileInEditor(filePath);

        if (hasFlutter) {
          await TerminalAutomation.sendSystemNotification(
            "Flutter widget opened in VS Code. Use Flutter device runner for live preview.",
            "Flutter Preview"
          );
        } else {
          await TerminalAutomation.sendSystemNotification(
            "Flutter SDK is not installed. Please install Flutter SDK ('brew install --cask flutter') for live preview. File opened in VS Code.",
            "Flutter Preview"
          );
        }
        return true;
      }

      if (ext === ".py") {
        let content = await fs.promises.readFile(filePath, "utf8");
        const healed = TerminalAutomation.healPythonCode(content);
        if (healed !== content) {
          await fs.promises.writeFile(filePath, healed, "utf8");
          content = healed;
        }
        const isStreamlit = content.includes("streamlit");

        if (isStreamlit) {
          const streamlitBin = fs.existsSync("/opt/homebrew/bin/streamlit")
            ? "/opt/homebrew/bin/streamlit"
            : "streamlit";

          try {
            // Kill any old streamlit instance
            try {
              await execAsync('pkill -f "streamlit run"');
            } catch {}

            await execAsync(
              `${streamlitBin} run "${filePath}" --server.headless true --browser.gatherUsageStats false > /tmp/musedeck/streamlit.log 2>&1 &`
            );
            await new Promise((r) => setTimeout(r, 1500));
            try {
              await execAsync(`open -a "Google Chrome" "http://localhost:8501"`);
            } catch {
              await execAsync(`open "http://localhost:8501"`);
            }
            await TerminalAutomation.sendSystemNotification(
              "Streamlit UI live preview launched in Chrome at http://localhost:8501",
              "Python Streamlit Preview"
            );
            return true;
          } catch (err: any) {
            console.warn("Streamlit preview failed:", err.message);
          }
        }

        await execAsync(`python3 "${filePath}" &`);
        return true;
      }

      await this.openFileInEditor(filePath);
      return true;
    } catch (err: any) {
      console.warn("Live preview failed:", err.message);
      return false;
    }
  }

  /**
   * Auto-heals common Flutter Dart LLM synthesis bugs (e.g. List<num> vs double type mismatch)
   */
  static healDartCode(code: string): string {
    // 1. Convert any mixed/integer number lists like final men = [62.0, 52, ...] to <double>[...]
    code = code.replace(/(\bfinal\s+([a-zA-Z0-9_]+)\s*=\s*)\[([\d\s.,]+)\]/g, (match, prefix, _varName, numbers) => {
      const converted = numbers
        .split(",")
        .map((n: string) => {
          const trimmed = n.trim();
          if (!trimmed) return trimmed;
          if (/^\d+$/.test(trimmed)) return trimmed + ".0";
          return trimmed;
        })
        .join(", ");
      return `${prefix}<double>[${converted}]`;
    });

    // 2. Also ensure if main() is missing, wrap with runApp
    if (!code.includes("void main()")) {
      const classMatch = code.match(/class\s+([A-Za-z0-9_]+)\s+extends\s+StatelessWidget/);
      if (classMatch) {
        const rootWidget = classMatch[1];
        code = `void main() => runApp(const MaterialApp(home: ${rootWidget}(), debugShowCheckedModeBanner: false));\n\n` + code;
      }
    }

    return code;
  }

  /**
   * Auto-heals common Python/Streamlit synthesis bugs
   */
  static healPythonCode(code: string): string {
    // 1. Strip markdown code fences if present
    code = code.replace(/^```[a-zA-Z0-9_-]*\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    // 2. Fix variable unpacking errors in activities loops:
    // for av,name,status,oid,color,prod,extra in activities ...
    code = code.replace(
      /for\s+([a-zA-Z0-9_,\s]+)\s+in\s+activities(\s+if\s+[^\n:]+)?:\s*\n/g,
      (_match) => {
        return `for item in activities:\n                av, name, status, oid, color = item[0], item[1], item[2], item[3], item[4]\n                prod = item[5] if len(item) > 5 else ""\n                extra = item[6] if len(item) > 6 else ""\n`;
      }
    );

    return code;
  }

  /**
   * Scaffolds an instant Android Compose Gradle project for Android Studio @Preview LayoutLib canvas
   */
  private static async prepareComposeProject(filePath: string): Promise<string> {
    const projectDir = "/tmp/musedeck/ComposePreview";
    const appDir = path.join(projectDir, "app");
    const srcDir = path.join(appDir, "src/main/java/com/meta/musedeck");
    const wrapperDir = path.join(projectDir, "gradle/wrapper");

    await fs.promises.mkdir(srcDir, { recursive: true });
    await fs.promises.mkdir(wrapperDir, { recursive: true });

    // 1. settings.gradle.kts
    const settingsKts = `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "ComposePreview"
include(":app")
`;
    await fs.promises.writeFile(path.join(projectDir, "settings.gradle.kts"), settingsKts, "utf8");

    // 2. root build.gradle.kts
    const rootBuildKts = `plugins {
    id("com.android.application") version "8.7.0" apply false
    id("org.jetbrains.kotlin.android") version "2.0.0" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.0" apply false
}
`;
    await fs.promises.writeFile(path.join(projectDir, "build.gradle.kts"), rootBuildKts, "utf8");

    // 3. app/build.gradle.kts
    const appBuildKts = `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.meta.musedeck"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.meta.musedeck"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.10.00"))
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    debugImplementation("androidx.compose.ui:ui-tooling")
}
`;
    await fs.promises.writeFile(path.join(appDir, "build.gradle.kts"), appBuildKts, "utf8");

    // 4. AndroidManifest.xml
    const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:label="ComposePreview"
        android:theme="@android:style/Theme.Material.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`;
    const manifestDir = path.join(appDir, "src/main");
    await fs.promises.mkdir(manifestDir, { recursive: true });
    await fs.promises.writeFile(path.join(manifestDir, "AndroidManifest.xml"), manifestXml, "utf8");

    // 4.1 MainActivity.kt for direct running
    const mainActivityKt = `package com.meta.musedeck

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                PreviewOverview()
            }
        }
    }
}
`;
    await fs.promises.writeFile(path.join(srcDir, "MainActivity.kt"), mainActivityKt, "utf8");

    // 5. local.properties
    const userHome = process.env.HOME || "/Users/akif";
    const sdkPath = path.join(userHome, "Library/Android/sdk");
    if (fs.existsSync(sdkPath)) {
      await fs.promises.writeFile(path.join(projectDir, "local.properties"), `sdk.dir=${sdkPath}\n`, "utf8");
    }

    // 5.1 gradle.properties (Enable AndroidX and limit JVM memory)
    const gradleProps = `android.useAndroidX=true
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
`;
    await fs.promises.writeFile(path.join(projectDir, "gradle.properties"), gradleProps, "utf8");

    // 6. gradle-wrapper.properties
    const wrapperProp = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.12-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;
    await fs.promises.writeFile(path.join(wrapperDir, "gradle-wrapper.properties"), wrapperProp, "utf8");

    // 7. Inject file into app src with package com.meta.musedeck
    let ktCode = await fs.promises.readFile(filePath, "utf8");
    ktCode = ktCode.replace(/,\s*cap\s*=\s*StrokeCap\.\w+/g, "");
    ktCode = ktCode.replace(/^package\s+[\w.]+/m, "package com.meta.musedeck");
    if (!ktCode.includes("package com.meta.musedeck")) {
      ktCode = "package com.meta.musedeck\n\n" + ktCode;
    }
    const targetFile = path.join(srcDir, path.basename(filePath));
    await fs.promises.writeFile(targetFile, ktCode, "utf8");

    // 8. Auto-trust directory in Android Studio if trusted-paths.xml exists
    try {
      const globDir = path.join(userHome, "Library/Application Support/Google");
      if (fs.existsSync(globDir)) {
        const studioDirs = fs.readdirSync(globDir).filter(d => d.startsWith("AndroidStudio"));
        for (const sd of studioDirs) {
          const tpPath = path.join(globDir, sd, "options/trusted-paths.xml");
          if (fs.existsSync(tpPath)) {
            let tpContent = await fs.promises.readFile(tpPath, "utf8");
            if (!tpContent.includes("/tmp/musedeck")) {
              tpContent = tpContent.replace(
                "<map>",
                '<map>\n        <entry key="/tmp/musedeck" value="true" />\n        <entry key="/private/tmp/musedeck" value="true" />'
              );
              await fs.promises.writeFile(tpPath, tpContent, "utf8");
            }
          }
        }
      }
    } catch {}

    return targetFile;
  }

  /**
   * Displays a native macOS Notification Center alert
   */
  static async sendSystemNotification(message: string, title = "MuseDeck"): Promise<void> {
    try {
      // Strictly strip any emojis or symbols to guarantee clean zero-emoji native macOS notifications
      const cleanMsg = message.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{2388}\u{200D}\u{FE0F}]/gu, "").trim();
      const cleanTitle = title.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{2388}\u{200D}\u{FE0F}]/gu, "").trim();
      const appleScript = `display notification "${this.escapeForAppleScript(cleanMsg)}" with title "${this.escapeForAppleScript(cleanTitle)}"`;
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

