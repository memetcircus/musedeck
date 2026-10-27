import express, { type Request, type Response } from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AgentStateMachine } from "../agent/state-machine.js";
import type { MuseRunner } from "../agent/muse-runner.js";
import type { SamClient } from "../api/sam-client.js";
import type { MuseSparkClient } from "../api/spark-client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface HttpServerDependencies {
  stateMachine: AgentStateMachine;
  museRunner: MuseRunner;
  samClient: SamClient;
  sparkClient: MuseSparkClient;
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
  }

  private configureRoutes(): void {
    const { stateMachine, museRunner, samClient, sparkClient } = this.deps;

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
        res.json({
          ok: true,
          thumbnailBase64: result.thumbnailBase64,
          copiedToClipboard: result.copiedToClipboard,
        });
      } catch (err: any) {
        console.error("SAM Snip error:", err.message);
        res.status(500).json({ error: err.message });
      }
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
