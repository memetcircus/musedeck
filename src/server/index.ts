import dotenv from "dotenv";
dotenv.config();

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
        await museRunner.approve(msg.feedback);
        break;

      case "reject":
        console.log("❌ [Bridge] Received REJECT command from surface");
        await museRunner.reject(msg.feedback);
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
        console.log("✨ [Bridge] Received SPARK command from surface");
        try {
          let thumb = stateMachine.getTelemetry().lastThumbnail;
          if (!thumb) {
            console.log("📸 [Spark] No existing snip. Prompting interactive SAM 3.1 snip...");
            const res = await samClient.snipScreenRegion();
            thumb = res.thumbnailBase64;
            stateMachine.setLastThumbnail(thumb);
            await TerminalAutomation.pasteSnippetIntoTerminal(res.segmentedImagePath);
          }
          if (thumb) {
            const res = await sparkClient.generateCodeFromImage(thumb, msg.prompt);
            stateMachine.setLastSparkCode(res.code);
          }
        } catch (err: any) {
          console.error("Spark failed:", err.message);
        }
        break;

      case "runTask":
        console.log(`🚀 [Bridge] Received RUN_TASK command: "${msg.prompt}"`);
        void museRunner.runTask(msg.prompt);
        break;

      case "toggle_submenu":
        wsServer.broadcast({ type: "toggle_submenu" });
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
      const thinkingState = await TerminalAutomation.checkTerminalThinkingState();
      const curState = stateMachine.getState();

      if (thinkingState === "THINKING") {
        if (curState !== AgentState.EXECUTING) {
          lastObservedState = "THINKING";
          stateMachine.transition(AgentState.EXECUTING, "Muse Thinking...");
        }
      } else if (thinkingState === "IDLE") {
        if (curState === AgentState.EXECUTING && lastObservedState === "THINKING") {
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
