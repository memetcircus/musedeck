import dotenv from "dotenv";
dotenv.config();

import fs from "node:fs";
import path from "node:path";
import { spawn, exec, execSync, type ChildProcess } from "node:child_process";
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

  // Vid To Code recording state
  let activeRecordingProcess: ChildProcess | null = null;
  let activeCountdownTimer: NodeJS.Timeout | null = null;
  let activeRecordingTarget = "AUTO";

  const finishRecordingAndSynthesize = async (targetFramework: string) => {
    if (activeCountdownTimer) {
      clearInterval(activeCountdownTimer);
      activeCountdownTimer = null;
    }
    if (activeRecordingProcess) {
      try {
        activeRecordingProcess.kill("SIGINT");
      } catch {}
      activeRecordingProcess = null;
    }

    // Step 2: Native macOS Notification (Strictly English, no emojis!)
    await TerminalAutomation.sendSystemNotification(
      "Flow captured. Synthesizing animated code with Meta Muse Spark...",
      "MuseDeck"
    );

    // Notify surfaces of synthesis phase
    wsServer.broadcast({ type: "vid_synthesizing", target: targetFramework } as any);

    try {
      const videoPath = "/tmp/musedeck/flow.mp4";
      const framePath = "/tmp/musedeck/flow_thumb.png";

      // Extract high quality keyframe from the recording with ffmpeg
      await new Promise<void>((resolve) => {
        exec(
          `/opt/homebrew/bin/ffmpeg -y -i "${videoPath}" -ss 00:00:01 -vframes 1 "${framePath}" || /usr/bin/ffmpeg -y -i "${videoPath}" -ss 00:00:01 -vframes 1 "${framePath}"`,
          () => resolve()
        );
      });

      let thumbBase64 = "";
      if (fs.existsSync(framePath)) {
        thumbBase64 = fs.readFileSync(framePath).toString("base64");
      } else {
        thumbBase64 = stateMachine.getTelemetry().lastThumbnail || "";
      }

      console.log(`🎬 [VidToCode] Synthesizing ${targetFramework} animated component...`);
      const res = await sparkClient.generateCodeFromImage(thumbBase64, targetFramework as any);
      stateMachine.setLastSparkCode(res.code);

      // Open in developer's active editor
      await TerminalAutomation.openFileInEditor(res.filePath);

      // Feed prompt into active Muse terminal
      const prompt = `Synthesized animated ${res.frameworkName} component (${res.filename}): ${res.filePath}. Integrate this interactive animation into our workspace.`;
      await TerminalAutomation.typeSnippetIntoTerminal(prompt, false);

      // Broadcast completion to Stream Deck
      wsServer.broadcast({
        type: "vid_spark_completed",
        filename: res.filename,
        filePath: res.filePath,
        framework: res.frameworkName,
      } as any);
    } catch (err: any) {
      console.error("VidToCode synthesis error:", err.message);
      wsServer.broadcast({
        type: "vid_spark_failed",
        error: err.message,
      } as any);
    }
  };

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

          const targetFramework = (msg.target as any) || "AUTO";

          // Immediate feedback to user: native notification + Stream Deck status
          await TerminalAutomation.sendSystemNotification("Synthesizing component with Meta Muse Spark...", "MuseDeck");
          wsServer.broadcast({ type: "spark_synthesizing", target: targetFramework } as any);

          // Synthesize code using Meta Muse Spark (takes ~15s)
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
          wsServer.broadcast({ type: "preview_launching" });
          const tempDir = "/tmp/musedeck";
          let success = false;
          if (fs.existsSync(tempDir)) {
            const files = fs.readdirSync(tempDir).filter((f) => f.startsWith("Extracted") || f.startsWith("extracted"));
            if (files.length > 0) {
              const target = path.join(tempDir, files[0]);
              success = await TerminalAutomation.runLivePreview(target);
            }
          }
          if (success) {
            wsServer.broadcast({ type: "preview_launched" });
          } else {
            wsServer.broadcast({ type: "preview_failed", error: "Preview build failed" });
          }
        } catch (err: any) {
          console.warn("Could not launch live preview:", err.message);
          wsServer.broadcast({ type: "preview_failed", error: err.message });
        }
        break;

      case "runTask":
        console.log(`🚀 [Bridge] Received RUN_TASK command: "${msg.prompt}"`);
        void museRunner.runTask(msg.prompt);
        break;

      case "toggle_submenu":
        wsServer.broadcast({ type: "toggle_submenu" });
        break;

      case "vid_record": {
        const target = (msg.target as string) || "AUTO";
        activeRecordingTarget = target;
        console.log(`🎬 [Bridge] Launching crosshair screen selection for target: ${target}`);

        // Broadcast aiming mode to Stream Deck immediately
        wsServer.broadcast({ type: "vid_aiming" } as any);

        // Prompt user to select screen area with crosshair
        await TerminalAutomation.sendSystemNotification(
          "Select screen area with crosshair to record UI flow...",
          "MuseDeck Vid to Code"
        );

        const videoPath = "/tmp/musedeck/flow.mp4";
        if (fs.existsSync(videoPath)) {
          try { fs.unlinkSync(videoPath); } catch {}
        }

        // Spawn screencapture with interactive mouse selection (-i -s)
        // -i: capture screen interactively
        // -s: only allow mouse selection mode (crosshair '+')
        // -v: capture video recording of the selected rectangle
        // -V 5: 5 seconds recording limit
        // -k: show clicks in video recording mode
        activeRecordingProcess = spawn("screencapture", ["-i", "-s", "-v", "-V", "5", "-k", videoPath]);

        let recordingStarted = false;
        let mouseWaiterProcess: any = null;

        const startRecordingCountdown = () => {
          if (recordingStarted) return;
          recordingStarted = true;
          console.log("🔴 [Bridge] Area selected. Starting 5s screen recording...");

          wsServer.broadcast({ type: "vid_recording_started", duration: 5 } as any);
          void TerminalAutomation.sendSystemNotification(
            "Recording UI screen flow (5 seconds)...",
            "MuseDeck Vid to Code"
          );

          let countdown = 5;
          if (activeCountdownTimer) clearInterval(activeCountdownTimer);
          activeCountdownTimer = setInterval(() => {
            countdown--;
            if (countdown > 0) {
              wsServer.broadcast({ type: "vid_countdown", seconds: countdown } as any);
            } else {
              clearInterval(activeCountdownTimer!);
              activeCountdownTimer = null;
            }
          }, 1000);
        };

        const mouseWaiterPath = path.resolve(process.cwd(), "bin/wait-mouse-release");
        const mouseWaiterSrc = path.resolve(process.cwd(), "scripts/wait-mouse-release.swift");
        if (!fs.existsSync(mouseWaiterPath) && fs.existsSync(mouseWaiterSrc)) {
          try {
            fs.mkdirSync(path.dirname(mouseWaiterPath), { recursive: true });
            execSync(`swiftc -O "${mouseWaiterSrc}" -o "${mouseWaiterPath}"`);
          } catch {}
        }
        if (fs.existsSync(mouseWaiterPath)) {
          mouseWaiterProcess = spawn(mouseWaiterPath);
          mouseWaiterProcess.on("exit", (code: number) => {
            mouseWaiterProcess = null;
            if (code === 0 && activeRecordingProcess) {
              startRecordingCountdown();
            }
          });
        }

        activeRecordingProcess.on("exit", (code: number) => {
          activeRecordingProcess = null;
          if (mouseWaiterProcess) {
            try { mouseWaiterProcess.kill(); } catch {}
            mouseWaiterProcess = null;
          }
          if (activeCountdownTimer) {
            clearInterval(activeCountdownTimer);
            activeCountdownTimer = null;
          }

          // If user pressed ESC or cancelled, no valid video file exists
          if (code !== 0 || !fs.existsSync(videoPath) || fs.statSync(videoPath).size === 0) {
            console.log("ℹ️ [Bridge] Video selection was cancelled or no area selected.");
            wsServer.broadcast({ type: "vid_recording_cancelled" } as any);
            return;
          }

          void finishRecordingAndSynthesize(activeRecordingTarget);
        });
        break;
      }

      case "vid_stop": {
        console.log("⏹️ [Bridge] Early stop requested for screen recording");
        if (activeRecordingProcess) {
          activeRecordingProcess.kill("SIGINT");
        } else {
          void finishRecordingAndSynthesize(activeRecordingTarget);
        }
        break;
      }

      case "toggle_img_to_code":
      case "open_img_to_code":
      case "close_img_to_code":
      case "toggle_vid_to_code":
      case "open_vid_to_code":
      case "close_vid_to_code":
      case "spark_completed":
      case "spark_synthesizing":
      case "spark_failed":
      case "vid_recording_started":
      case "vid_aiming":
      case "vid_recording_cancelled":
      case "vid_countdown":
      case "vid_synthesizing":
      case "vid_spark_completed":
      case "vid_spark_failed":
      case "preview_launching":
      case "preview_launched":
      case "preview_failed":
      case "switch_page":
        console.log(`[Bridge] Relaying ${msg.type} to connected surfaces`);
        wsServer.broadcast(msg as any);
        break;

      case "launch_session":
        console.log("🚀 [Bridge] Received launch_session command from surface");
        await TerminalAutomation.launchMuseCodeTerminal(
          msg.projectDir || process.cwd() || "/Users/akif/Projects/musedeck/musedeck"
        );
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
