import dotenv from "dotenv";
dotenv.config();

import fs from "node:fs";
import path from "node:path";
import { AgentStateMachine } from "../agent/state-machine.js";
import { AgentState } from "../agent/types.js";
import { MuseRunner } from "../agent/muse-runner.js";
import { TerminalAutomation } from "../agent/terminal-automation.js";
import { MetaModelApiClient } from "../api/meta-client.js";
import { SamClient } from "../api/sam-client.js";
import { MuseSparkClient } from "../api/spark-client.js";
import { MuseHttpServer } from "./http-server.js";
import { MuseWsServer, type SurfaceMessage } from "./ws-server.js";
import { TerminalSessionWatcher } from "../agent/terminal-session-watcher.js";

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                   MUSEDECK - MISSION CONTROL BRIDGE                       ║
║       Elgato Stream Deck Physical Console for Meta Muse Code CLI         ║
╚═══════════════════════════════════════════════════════════════════════════╝
  `);

  const HTTP_PORT = Number(process.env.PORT) || 3456;
  const WS_PORT = Number(process.env.WS_PORT) || 3457;

  // 1. Initialize State Machine
  const stateMachine = new AgentStateMachine();

  // 2. Initialize Meta API Clients
  const metaClient = new MetaModelApiClient();
  const samClient = new SamClient(metaClient);
  const sparkClient = new MuseSparkClient(metaClient);

  // 3. Initialize Muse Code CLI Child Process Runner
  const museRunner = new MuseRunner(stateMachine);

  // 4. Initialize WebSocket Server for Real-Time Telemetry
  const wsServer = new MuseWsServer(WS_PORT);
  await wsServer.start();

  // 5. Initialize Express HTTP Server & Web Console
  const httpServer = new MuseHttpServer(HTTP_PORT, {
    stateMachine,
    museRunner,
    samClient,
    sparkClient,
    wsServer,
  });
  await httpServer.start();

  // 6. Initialize Live Terminal Session Watcher (Tails external Terminal.app Muse sessions)
  const sessionWatcher = new TerminalSessionWatcher(stateMachine);
  sessionWatcher.start();

  // Wire Telemetry Events to WebSocket Broadcast
  stateMachine.on("telemetry", (telemetry) => {
    wsServer.broadcastTelemetry(telemetry);
  });

  museRunner.on("log", (type, msg) => {
    wsServer.broadcastLog(type, msg);
  });

  // Handle incoming commands from physical Stream Deck or Web Surface
  wsServer.onMessage(async (msg: SurfaceMessage) => {
    switch (msg.type) {
      case "approve":
        console.log("⚡ [Bridge] Received APPROVE command from surface");
        if (museRunner.getIsRunning()) {
          await museRunner.approve(msg.feedback);
        } else {
          stateMachine.transition(AgentState.EXECUTING, "Tool execution approved");
        }
        break;

      case "reject":
        console.log("❌ [Bridge] Received REJECT command from surface");
        if (museRunner.getIsRunning()) {
          await museRunner.reject(msg.feedback);
        } else {
          stateMachine.transition(AgentState.IDLE, "Tool execution rejected");
        }
        break;

      case "halt":
        console.log("🛑 [Bridge] Received HALT command from surface");
        await museRunner.halt();
        break;

      case "reset":
        console.log("🔄 [Bridge] Received RESET command from surface");
        stateMachine.reset();
        break;

      case "snip":
        console.log("📸 [Bridge] Received SNIP command from surface");
        try {
          const res = await samClient.snipScreenRegion();
          stateMachine.setLastThumbnail(res.thumbnailBase64);
          await TerminalAutomation.pasteSnippetIntoTerminal(res.segmentedImagePath);
        } catch (err: any) {
          console.error("Snip failed:", err.message);
        }
        break;

      case "spark":
        console.log(`✨ [Bridge] Received SPARK (IMG TO CODE) command with target=${msg.target || "AUTO"}`);
        try {
          // Always prompt interactive screen capture for fresh target
          const snipRes = await samClient.snipScreenRegion();
          const thumb = snipRes.thumbnailBase64;
          stateMachine.setLastThumbnail(thumb);

          // Synthesize code using Meta Muse Spark
          const targetFramework = (msg.target as any) || "AUTO";
          const res = await sparkClient.generateCodeFromImage(thumb, targetFramework);
          stateMachine.setLastSparkCode(res.code);

          // 1. Open generated component in developer's active editor (VS Code / default)
          await TerminalAutomation.openFileInEditor(res.filePath);

          // 2. Feed prompt into active Muse terminal
          const prompt = `Synthesized ${res.frameworkName} component (${res.filename}): ${res.filePath}. Integrate this into our workspace.`;
          await TerminalAutomation.typeSnippetIntoTerminal(prompt, false);

          // 3. Notify physical Stream Deck
          wsServer.broadcast({
            type: "spark_completed",
            filename: res.filename,
            filePath: res.filePath,
            framework: res.frameworkName,
          });
        } catch (err: any) {
          const errMsg = err.message || "Failed to process image";
          console.warn(`⚠️ [Spark] Image synthesis skipped: ${errMsg}`);

          // Trigger native macOS alert if user didn't intentionally press Escape
          if (!errMsg.includes("cancelled") && !errMsg.includes("Escape")) {
            await TerminalAutomation.sendSystemNotification("No recognizable UI component detected in selection.");
          }

          wsServer.broadcast({
            type: "spark_failed",
            reason: errMsg.includes("cancelled") || errMsg.includes("Escape") ? "cancelled" : "empty",
            error: errMsg,
          });
        }
        break;

      case "open_code":
        console.log("👁️ [Bridge] Received OPEN_CODE command from surface");
        try {
          const tempDir = "/tmp/musedeck";
          if (fs.existsSync(tempDir)) {
            const files = fs.readdirSync(tempDir).filter((f) => f.startsWith("Extracted") || f.startsWith("extracted"));
            if (files.length > 0) {
              const target = path.join(tempDir, files[0]);
              await TerminalAutomation.openFileInEditor(target);
            }
          }
        } catch (err: any) {
          console.warn("Could not open code:", err.message);
        }
        break;

      case "run_preview":
        console.log("▶️ [Bridge] Received RUN_PREVIEW command from surface");
        try {
          const tempDir = "/tmp/musedeck";
          if (fs.existsSync(tempDir)) {
            const files = fs.readdirSync(tempDir).filter((f) => f.startsWith("Extracted") || f.startsWith("extracted"));
            if (files.length > 0) {
              const target = path.join(tempDir, files[0]);
              await TerminalAutomation.runLivePreview(target);
            }
          }
        } catch (err: any) {
          console.warn("Could not launch live preview:", err.message);
        }
        break;

      case "runTask":
        console.log(`🚀 [Bridge] Received RUN_TASK command: "${msg.prompt}"`);
        void museRunner.runTask(msg.prompt);
        break;

      case "toggle_submenu":
        wsServer.broadcast({ type: "toggle_submenu" });
        break;

      case "toggle_img_to_code":
      case "open_img_to_code":
      case "close_img_to_code":
      case "spark_completed":
        wsServer.broadcast(msg as any);
        break;

      case "subscribe":
        wsServer.broadcastTelemetry(stateMachine.getTelemetry());
        break;
    }
  });

  // Track connected clients
  setInterval(() => {
    stateMachine.setConnectedSurfaces(wsServer.getClientCount());
  }, 2000);

  // Live Terminal TUI Observer for Muse "Thinking..." state
  let lastObservedState = "IDLE";
  setInterval(async () => {
    try {
      const curState = stateMachine.getState();
      // NEVER clobber human approval gate with background terminal thinking observer!
      if (curState === AgentState.WAITING_APPROVAL) {
        return;
      }

      const thinkingState = await TerminalAutomation.checkTerminalThinkingState();

      if (thinkingState === "THINKING") {
        if (curState !== AgentState.EXECUTING) {
          lastObservedState = "THINKING";
          stateMachine.transition(AgentState.EXECUTING, "Muse Thinking...");
        }
      } else if (thinkingState === "IDLE") {
        if (curState === AgentState.EXECUTING || curState === AgentState.PLANNING) {
          lastObservedState = "IDLE";
          stateMachine.transition(AgentState.IDLE, "Ready for instructions");
        }
      }
    } catch {}
  }, 750);

  // Graceful shutdown handling
  const shutdown = () => {
    console.log("\n🛑 Gracefully shutting down MuseDeck bridge...");
    httpServer.close();
    wsServer.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Fatal error starting MuseDeck bridge:", err);
  process.exit(1);
});
