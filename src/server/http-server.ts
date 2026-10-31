import express, { type Request, type Response } from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AgentStateMachine } from "../agent/state-machine.js";
import type { MuseRunner } from "../agent/muse-runner.js";
import { TerminalAutomation } from "../agent/terminal-automation.js";
import type { SamClient } from "../api/sam-client.js";
import type { MuseSparkClient } from "../api/spark-client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface HttpServerDependencies {
  stateMachine: AgentStateMachine;
  museRunner: MuseRunner;
  samClient: SamClient;
  sparkClient: MuseSparkClient;
  wsServer?: any;
  onRunPreview?: () => Promise<boolean>;
  onOpenCode?: () => Promise<boolean>;
}

export class MuseHttpServer {
  private app = express();
  private server: any = null;

  constructor(
    private readonly port: number,
    private readonly deps: HttpServerDependencies
  ) {
    this.configureMiddleware();
    this.configureRoutes();
  }

  private configureMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "50mb" }));

    // Serve web dashboard console from public directory
    const publicPath = path.resolve(__dirname, "../../public");
    this.app.use(express.static(publicPath));
    this.app.use("/flutter", express.static("/tmp/musedeck/FlutterPreview/build/web"));
  }

  private configureRoutes(): void {
    const { stateMachine, museRunner, samClient, sparkClient, wsServer } = this.deps;

    // Health check
    this.app.get("/health", (_req: Request, res: Response) => {
      res.json({
        status: "ok",
        agentState: stateMachine.getState(),
        timestamp: new Date().toISOString(),
      });
    });

    // Telemetry & state snapshot
    this.app.get("/api/status", (_req: Request, res: Response) => {
      res.json(stateMachine.getTelemetry());
    });

    // Trigger task execution
    this.app.post("/api/task", async (req: Request, res: Response) => {
      const { prompt, contextFiles } = req.body;
      if (!prompt) {
        res.status(400).json({ error: "Missing required 'prompt' field" });
        return;
      }

      try {
        if (museRunner.getIsRunning()) {
          res.status(409).json({ ok: false, error: "An agent task is already running." });
          return;
        }

        museRunner.runTask(prompt, contextFiles || []).catch((err) => {
          console.error("❌ [HttpServer] Background task error:", err);
        });

        res.json({ ok: true, message: "Task initiated", prompt });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // HITL Approve (unpause waiting gate)
    this.app.post("/api/approve", async (req: Request, res: Response) => {
      const { feedback } = req.body;
      const success = await museRunner.approve(feedback);
      res.json({ ok: success, state: stateMachine.getState() });
    });

    // HITL Reject
    this.app.post("/api/reject", async (req: Request, res: Response) => {
      const { feedback } = req.body;
      const success = await museRunner.reject(feedback);
      res.json({ ok: success, state: stateMachine.getState() });
    });

    // Emergency halt
    this.app.post("/api/cancel", async (_req: Request, res: Response) => {
      await museRunner.halt();
      res.json({ ok: true, message: "Agent halted" });
    });

    // Reset agent
    this.app.post("/api/reset", (_req: Request, res: Response) => {
      stateMachine.reset();
      res.json({ ok: true, state: stateMachine.getState() });
    });

    // SAM 3.1 Snip Screen Region
    this.app.post("/api/snip", async (_req: Request, res: Response) => {
      try {
        console.log("📸 [/api/snip] Triggering SAM 3.1 Snip...");
        const result = await samClient.snipScreenRegion();
        stateMachine.setLastThumbnail(result.thumbnailBase64);

        // Directly bring Terminal to front and type image path into muse prompt
        await TerminalAutomation.pasteSnippetIntoTerminal(result.segmentedImagePath);

        res.json({
          ok: true,
          segmentedImagePath: result.segmentedImagePath,
          thumbnailBase64: result.thumbnailBase64,
          copiedToClipboard: result.copiedToClipboard,
        });
      } catch (err: any) {
        console.error("SAM Snip error:", err.message);
        res.status(500).json({ ok: false, error: err.message });
      }
    });

    // Snippets Submenu Endpoints
    this.app.post("/api/snippets/toggle", (_req: Request, res: Response) => {
      wsServer?.broadcast({ type: "toggle_snippets" as any });
      res.json({ ok: true });
    });

    this.app.post("/api/snippets/open", (_req: Request, res: Response) => {
      wsServer?.broadcast({ type: "open_snippets" as any });
      res.json({ ok: true });
    });

    this.app.post("/api/snippets/close", (_req: Request, res: Response) => {
      wsServer?.broadcast({ type: "close_snippets" as any });
      res.json({ ok: true });
    });

    // Review Submenu Endpoints
    this.app.post("/api/review/toggle", (_req: Request, res: Response) => {
      wsServer?.broadcast({ type: "toggle_review" as any });
      res.json({ ok: true });
    });

    this.app.post("/api/review/open", (_req: Request, res: Response) => {
      wsServer?.broadcast({ type: "open_review" as any });
      res.json({ ok: true });
    });

    this.app.post("/api/review/close", (_req: Request, res: Response) => {
      wsServer?.broadcast({ type: "close_review" as any });
      res.json({ ok: true });
    });

    // Test endpoint to trigger WAITING_APPROVAL state for live demo
    this.app.post("/api/test/trigger-approval", (_req: Request, res: Response) => {
      stateMachine.setWaitingApproval(
        { filesChanged: 1, insertions: 15, deletions: 3, files: [{ path: "Terminal: bash command", additions: 15, deletions: 3 }] },
        "Tool 'bash' requires human confirmation. Choose 1: YES, 2: ALWAYS, 3: NO, 4: TELL WHY",
        "bash command approval"
      );
      res.json({ ok: true, state: stateMachine.getState() });
    });

    // Sessions Submenu Endpoints
    this.app.post("/api/sessions/toggle", (_req: Request, res: Response) => {
      wsServer?.broadcast({ type: "toggle_sessions" as any });
      res.json({ ok: true });
    });

    this.app.post("/api/sessions/open", (_req: Request, res: Response) => {
      wsServer?.broadcast({ type: "open_sessions" as any });
      res.json({ ok: true });
    });

    this.app.post("/api/sessions/close", (_req: Request, res: Response) => {
      wsServer?.broadcast({ type: "close_sessions" as any });
      res.json({ ok: true });
    });

    this.app.post("/api/sessions/launch", async (req: Request, res: Response) => {
      try {
        const cwd = req.body?.cwd || process.cwd() || "/Users/akif/Projects/musedeck/musedeck";
        await TerminalAutomation.launchMuseCodeTerminal(cwd);
        res.json({ ok: true });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // Vid To Code Submenu & Execution Endpoints
    this.app.post("/api/vid/toggle", (_req: Request, res: Response) => {
      wsServer?.broadcast({ type: "toggle_vid_to_code" as any });
      res.json({ ok: true });
    });

    this.app.post("/api/vid/open", (_req: Request, res: Response) => {
      wsServer?.broadcast({ type: "open_vid_to_code" as any });
      res.json({ ok: true });
    });

    this.app.post("/api/vid/close", (_req: Request, res: Response) => {
      wsServer?.broadcast({ type: "close_vid_to_code" as any });
      res.json({ ok: true });
    });

    this.app.post("/api/vid/record", (req: Request, res: Response) => {
      const target = req.body?.target || "AUTO";
      wsServer?.broadcast({ type: "vid_record", target } as any);
      res.json({ ok: true, target });
    });

    this.app.post("/api/vid/stop", (_req: Request, res: Response) => {
      wsServer?.broadcast({ type: "vid_stop" as any });
      res.json({ ok: true });
    });

    // Prompt Flow Recording Endpoints
    this.app.post("/api/flow/record", (_req: Request, res: Response) => {
      wsServer?.broadcast({ type: "record_prompt_flow" as any });
      res.json({ ok: true });
    });

    this.app.post("/api/flow/stop", (_req: Request, res: Response) => {
      wsServer?.broadcast({ type: "stop_prompt_flow" as any });
      res.json({ ok: true });
    });

    this.app.post("/api/review/trigger-review", (_req: Request, res: Response) => {
      stateMachine.setWaitingApproval(
        {
          filesChanged: 2,
          insertions: 15,
          deletions: 3,
          files: [
            { path: "src/index.ts", additions: 10, deletions: 2 },
            { path: "src/auth.ts", additions: 5, deletions: 1 },
          ],
        },
        "Review diff & approve changes",
        "Waiting for developer review"
      );
      res.json({ ok: true, state: stateMachine.getState() });
    });

    // Start / Stop Thinking Animation Demo
    this.app.post("/api/animation/start", (_req: Request, res: Response) => {
      stateMachine.startPlanning("Meta Muse Code is actively synthesizing code...");
      res.json({ ok: true, state: stateMachine.getState() });
    });

    this.app.post("/api/animation/stop", (_req: Request, res: Response) => {
      stateMachine.reset();
      res.json({ ok: true, state: stateMachine.getState() });
    });

    // Muse Spark Image-to-Code
    this.app.post("/api/spark", async (req: Request, res: Response) => {
      const { prompt } = req.body;
      const telemetry = stateMachine.getTelemetry();
      const imageSnippet = req.body.image || telemetry.lastThumbnail;

      if (!imageSnippet) {
        res.status(400).json({ error: "No image available. Please trigger SAM Snip first." });
        return;
      }

      try {
        const result = await sparkClient.generateCodeFromImage(imageSnippet, prompt);
        stateMachine.setLastSparkCode(result.code);
        res.json({ ok: true, ...result });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    this.app.post("/api/run-preview", async (_req: Request, res: Response) => {
      if (this.deps.onRunPreview) {
        const ok = await this.deps.onRunPreview();
        res.json({ ok });
      } else {
        res.status(501).json({ error: "Preview not implemented" });
      }
    });

    this.app.post("/api/open-code", async (_req: Request, res: Response) => {
      if (this.deps.onOpenCode) {
        const ok = await this.deps.onOpenCode();
        res.json({ ok });
      } else {
        res.status(501).json({ error: "Open code not implemented" });
      }
    });

    // Get current diff
    this.app.get("/api/diff", (_req: Request, res: Response) => {
      const telemetry = stateMachine.getTelemetry();
      res.json({
        stats: telemetry.diffStats,
        diff: telemetry.diffText,
      });
    });
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`🌐 [HTTP] MuseDeck bridge running at http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  close(): void {
    this.server?.close();
  }
}
