import fs from "node:fs";
import path from "node:path";
import EventEmitter from "node:events";
import { AgentState, type DiffStats } from "./types.js";
import type { AgentStateMachine } from "./state-machine.js";

/**
 * TerminalSessionWatcher
 * Live monitors the active Muse Code CLI terminal session by tailing its session.jsonl log.
 * Automatically catches:
 *   - "approval_wait.effect.started" -> Triggers WAITING_APPROVAL state on Stream Deck!
 *   - "approval_wait.effect.terminal" -> Resolves approval state!
 *   - "runtime.user_intent.accepted" -> Transitions to PLANNING / EXECUTING!
 *   - "runtime.command_intake.settled" -> Returns to READY state!
 */
export class TerminalSessionWatcher extends EventEmitter {
  private baseDir: string;
  private currentSessionId: string | null = null;
  private currentJsonlPath: string | null = null;
  private currentOffset = 0;
  private isWatching = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private checkSessionInterval: NodeJS.Timeout | null = null;
  private lastPendingToolName: string | null = null;

  constructor(private readonly stateMachine: AgentStateMachine) {
    super();
    this.baseDir = path.join(process.env.HOME || "/Users/akif", ".local/share/muse/sessions");
  }

  /**
   * Start watching live Muse terminal sessions
   */
  start(): void {
    if (this.isWatching) return;
    this.isWatching = true;
    console.log("👀 [SessionWatcher] Started real-time active Muse terminal session monitor");

    // 1. Initial find of most recent session
    this.updateActiveSession();

    // 2. Poll the active session file for new lines every 150ms for instant reactivity
    this.pollInterval = setInterval(() => {
      this.readNewLines();
    }, 150);

    // 3. Check every 1.5s if user switched or opened a newer session
    this.checkSessionInterval = setInterval(() => {
      this.updateActiveSession();
    }, 1500);
  }

  /**
   * Stop watching
   */
  stop(): void {
    this.isWatching = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.checkSessionInterval) clearInterval(this.checkSessionInterval);
    this.pollInterval = null;
    this.checkSessionInterval = null;
    console.log("🛑 [SessionWatcher] Stopped session monitor");
  }

  /**
   * Explicitly set the active session ID (e.g. from Stream Deck switcher)
   */
  setActiveSessionId(sessionId: string): void {
    const filePath = this.findJsonlForSessionId(sessionId);
    if (filePath && filePath !== this.currentJsonlPath) {
      console.log(`🎯 [SessionWatcher] Explicitly locked onto session: ${sessionId}`);
      this.currentSessionId = sessionId;
      this.currentJsonlPath = filePath;
      try {
        const stat = fs.statSync(filePath);
        // Start reading from current end so we only catch future events
        this.currentOffset = stat.size;
      } catch {
        this.currentOffset = 0;
      }
    }
  }

  /**
   * Find the newest / active session file on disk
   */
  private updateActiveSession(): void {
    try {
      if (!fs.existsSync(this.baseDir)) return;

      const years = fs.readdirSync(this.baseDir).filter((y) => y.startsWith("20")).sort().reverse();
      let newestJsonl: string | null = null;
      let newestSid: string | null = null;
      let newestMtime = 0;

      for (const y of years.slice(0, 1)) {
        const yPath = path.join(this.baseDir, y);
        const months = fs.readdirSync(yPath).filter((m) => !m.startsWith(".")).sort().reverse();
        for (const m of months.slice(0, 2)) {
          const mPath = path.join(yPath, m);
          const days = fs.readdirSync(mPath).filter((d) => !d.startsWith(".")).sort().reverse();
          for (const d of days.slice(0, 2)) {
            const dPath = path.join(mPath, d);
            const sids = fs.readdirSync(dPath).filter((s) => !s.startsWith(".") && s !== "subagent");
            for (const sid of sids) {
              const jsonl = path.join(dPath, sid, "session.jsonl");
              if (fs.existsSync(jsonl)) {
                try {
                  const stat = fs.statSync(jsonl);
                  if (stat.mtimeMs > newestMtime) {
                    newestMtime = stat.mtimeMs;
                    newestJsonl = jsonl;
                    newestSid = sid;
                  }
                } catch {}
              }
            }
          }
        }
      }

      if (newestJsonl && newestJsonl !== this.currentJsonlPath) {
        console.log(`📡 [SessionWatcher] Active session detected: ${newestSid} (${path.basename(path.dirname(newestJsonl))})`);
        this.currentSessionId = newestSid;
        this.currentJsonlPath = newestJsonl;

        try {
          const stat = fs.statSync(newestJsonl);
          // Start slightly before current end (8KB) to immediately catch any active ongoing approval wait
          this.currentOffset = Math.max(0, stat.size - 8192);
        } catch {
          this.currentOffset = 0;
        }
      }
    } catch (e: any) {
      console.warn("Error discovering newest session:", e.message);
    }
  }

  /**
   * Find jsonl path given a session ID
   */
  private findJsonlForSessionId(sid: string): string | null {
    try {
      const years = fs.readdirSync(this.baseDir).filter((y) => y.startsWith("20")).sort().reverse();
      for (const y of years) {
        const yPath = path.join(this.baseDir, y);
        const months = fs.readdirSync(yPath).filter((m) => !m.startsWith("."));
        for (const m of months) {
          const mPath = path.join(yPath, m);
          const days = fs.readdirSync(mPath).filter((d) => !d.startsWith("."));
          for (const d of days) {
            const target = path.join(mPath, d, sid, "session.jsonl");
            if (fs.existsSync(target)) return target;
          }
        }
      }
    } catch {}
    return null;
  }

  /**
   * Read new bytes appended to current session file and dispatch events
   */
  private readNewLines(): void {
    if (!this.currentJsonlPath || !fs.existsSync(this.currentJsonlPath)) return;

    try {
      const stat = fs.statSync(this.currentJsonlPath);
      if (stat.size <= this.currentOffset) return;

      const bufferSize = stat.size - this.currentOffset;
      const buffer = Buffer.alloc(bufferSize);
      const fd = fs.openSync(this.currentJsonlPath, "r");
      fs.readSync(fd, buffer, 0, bufferSize, this.currentOffset);
      fs.closeSync(fd);

      this.currentOffset = stat.size;

      const chunk = buffer.toString("utf8");
      const lines = chunk.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          this.processJsonEvent(JSON.parse(trimmed));
        } catch {}
      }
    } catch (e: any) {
      // Ignore read errors during concurrent write
    }
  }

  /**
   * Process a single event object from Muse session.jsonl
   */
  private processJsonEvent(event: any): void {
    const payloadType = event.payload_type || event.type;
    if (!payloadType) return;

    // 1. APPROVAL WAIT STARTED
    if (payloadType === "approval_wait.effect.started") {
      const record = event.payload?.record || {};
      const toolName = record.tool_name || "action";
      this.lastPendingToolName = toolName;

      console.log(`🚨 [SessionWatcher] HITL APPROVAL REQUIRED! Tool: ${toolName}`);
      this.emit("approval_wait", {
        toolName,
        pendingActionId: record.pending_action_id,
        taskId: record.task_id,
      });

      const stats: DiffStats = {
        filesChanged: 1,
        insertions: 1,
        deletions: 0,
        files: [{ path: `Tool: ${toolName}`, additions: 1, deletions: 0 }],
      };

      this.stateMachine.setWaitingApproval(
        stats,
        `Tool '${toolName}' requires human confirmation. Choose 1: YES, 2: ALWAYS, 3: NO, 4: TELL WHY`,
        `Tool: ${toolName}`
      );
      return;
    }

    // 2. APPROVAL RESOLVED / TERMINAL
    if (payloadType === "approval_wait.effect.terminal") {
      const record = event.payload?.record || {};
      const outcome = record.outcome?.kind || "resolved";
      console.log(`✅ [SessionWatcher] Approval resolved with outcome: ${outcome}`);
      this.emit("approval_settled", { outcome });

      if (outcome === "approved") {
        this.stateMachine.transition(AgentState.EXECUTING, "Tool execution confirmed");
      } else {
        this.stateMachine.transition(AgentState.IDLE, "Tool execution rejected");
      }
      return;
    }

    // 3. USER INTENT ACCEPTED (User sent a prompt in terminal)
    if (payloadType === "runtime.user_intent.accepted") {
      console.log("💭 [SessionWatcher] User intent accepted in terminal -> Agent Planning/Thinking");
      if (this.stateMachine.getState() === AgentState.IDLE) {
        this.stateMachine.transition(AgentState.PLANNING, "Processing user prompt in terminal");
      }
      return;
    }

    // 4. TASK STARTED (Tool execution running)
    if (payloadType === "runtime.session.task" || payloadType === "tool_batch.effect.started") {
      const evKind = event.payload?.event?.kind || event.payload?.record?.kind;
      if (evKind === "started") {
        if (this.stateMachine.getState() !== AgentState.WAITING_APPROVAL) {
          this.stateMachine.transition(AgentState.EXECUTING, "Running task in terminal");
        }
      }
      return;
    }

    // 5. RUN COMPLETED / COMMAND SETTLED (Finished running, waiting for input)
    const isRunTerminal = 
      (payloadType === "runtime.session" && event.payload?.event?.kind === "terminal") ||
      payloadType === "runtime.command_intake.settled" || 
      payloadType === "session.end";

    if (isRunTerminal) {
      if (this.stateMachine.getState() !== AgentState.WAITING_APPROVAL) {
        console.log("🏁 [SessionWatcher] Command completed / settled -> Agent READY");
        this.stateMachine.transition(AgentState.IDLE, "Terminal ready for input");

        // Clean up temporary residue media files so disk space is never wasted
        try {
          const residuePath = "/tmp/musedeck/recorded_flow.mp4";
          if (fs.existsSync(residuePath)) {
            fs.unlinkSync(residuePath);
            console.log("🧹 [SessionWatcher] Cleaned up residue screen recording: /tmp/musedeck/recorded_flow.mp4");
          }
        } catch {}
      }
      return;
    }
  }
}
