import dotenv from "dotenv";
dotenv.config();

import fs from "node:fs";
import path from "node:path";
import { spawn, exec, execSync, type ChildProcess } from "node:child_process";
import sharp from "sharp";
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
import { extractVideoFrames, detectMotionDifference, buildTemporalStoryboard } from "../agent/video-storyboard.js";
import { configManager } from "../config/config-manager.js";

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                   MUSEDECK - MISSION CONTROL BRIDGE                       ║
║       Elgato Stream Deck Physical Console for Meta Muse Code CLI         ║
╚═══════════════════════════════════════════════════════════════════════════╝
  `);

  const HTTP_PORT = Number(process.env.PORT) || 3456;
  const WS_PORT = Number(process.env.WS_PORT) || 3457;

  // Ensure runtime temp directory exists
  fs.mkdirSync("/tmp/musedeck", { recursive: true });

  // 1. Initialize State Machine
  const stateMachine = new AgentStateMachine();

  // Load configured credits & telemetry from persistent config
  const initialCfg = configManager.load();
  if (initialCfg.creditsRemaining) {
    stateMachine.setApiUsage({
      creditsRemaining: initialCfg.creditsRemaining,
      spent: initialCfg.spent || "$1.99",
    });
  }

  // 2. Initialize Meta API Clients
  const metaClient = new MetaModelApiClient();
  const samClient = new SamClient(metaClient);
  const sparkClient = new MuseSparkClient(metaClient);

  // 3. Initialize Muse Code CLI Child Process Runner
  const museRunner = new MuseRunner(stateMachine);

  // 4. Initialize WebSocket Server for Real-Time Telemetry
  const wsServer = new MuseWsServer(WS_PORT);
  await wsServer.start();

  // Track the most recently synthesized component file path (img-to-code or vid-to-code)
  let lastGeneratedFilePath: string | null = null;
  let isOperationInProgress = false;
  let isPreviewInProgress = false;

  const getActiveComponentFile = (): string | null => {
    if (lastGeneratedFilePath && fs.existsSync(lastGeneratedFilePath)) {
      return lastGeneratedFilePath;
    }
    const tempDir = "/tmp/musedeck";
    if (!fs.existsSync(tempDir)) return null;

    const validExts = [".swift", ".tsx", ".jsx", ".html", ".vue", ".kt", ".dart", ".py"];
    const candidateFiles = fs.readdirSync(tempDir)
      .filter((f) => {
        const ext = path.extname(f).toLowerCase();
        return (
          validExts.includes(ext) &&
          (f.startsWith("Animated") ||
            f.startsWith("animated") ||
            f.startsWith("Extracted") ||
            f.startsWith("extracted"))
        );
      })
      .map((f) => {
        const fullPath = path.join(tempDir, f);
        return { path: fullPath, mtime: fs.statSync(fullPath).mtimeMs };
      })
      .sort((a, b) => b.mtime - a.mtime);

    return candidateFiles.length > 0 ? candidateFiles[0].path : null;
  };

  const handleRunPreview = async (): Promise<boolean> => {
    console.log("▶️ [Bridge] Launching RUN_PREVIEW");
    if (isPreviewInProgress || isOperationInProgress) {
      console.warn("⚠️ [Bridge] Preview or synthesis operation already in progress. Ignoring duplicate RUN_PREVIEW.");
      return false;
    }
    isPreviewInProgress = true;
    try {
      wsServer.broadcast({ type: "preview_launching" });
      const target = getActiveComponentFile();
      let success = false;
      if (target) {
        console.log(`▶️ [Bridge] Launching live preview for latest component: ${target}`);
        success = await TerminalAutomation.runLivePreview(target);
      } else {
        console.warn("No generated component found for live preview.");
      }
      if (success) {
        wsServer.broadcast({ type: "preview_launched" });
      } else {
        wsServer.broadcast({ type: "preview_failed", error: "Preview build failed" });
      }
      return success;
    } catch (err: any) {
      console.warn("Could not launch live preview:", err.message);
      wsServer.broadcast({ type: "preview_failed", error: err.message });
      return false;
    } finally {
      isPreviewInProgress = false;
    }
  };

  const handleOpenCode = async (): Promise<boolean> => {
    console.log("👁️ [Bridge] Launching OPEN_CODE");
    try {
      const target = getActiveComponentFile();
      if (target) {
        console.log(`👁️ [Bridge] Opening latest generated component: ${target}`);
        await TerminalAutomation.openFileInEditor(target);
        return true;
      } else {
        console.warn("No generated component found to open.");
        return false;
      }
    } catch (err: any) {
      console.warn("Could not open code:", err.message);
      return false;
    }
  };

  // 5. Initialize Express HTTP Server & Web Console
  const httpServer = new MuseHttpServer(HTTP_PORT, {
    stateMachine,
    museRunner,
    samClient,
    sparkClient,
    wsServer,
    onRunPreview: handleRunPreview,
    onOpenCode: handleOpenCode,
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

  // Prompt Flow recording state
  let activeFlowRecordingProcess: ChildProcess | null = null;
  let activeFlowCountdownTimer: NodeJS.Timeout | null = null;

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

    try {
      const videoPath = "/tmp/musedeck/flow.mp4";
      if (!fs.existsSync(videoPath) || fs.statSync(videoPath).size === 0) {
        console.log("ℹ️ [VidToCode] No recording file found.");
        wsServer.broadcast({ type: "vid_recording_cancelled" } as any);
        return;
      }

      // Check minimum video dimensions (must be at least 120x120 px)
      let vidWidth = 0;
      let vidHeight = 0;
      try {
        const dimOut = execSync(
          `/opt/homebrew/bin/ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${videoPath}" || ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${videoPath}"`
        ).toString().trim();
        const parts = dimOut.split("x");
        if (parts.length >= 2) {
          vidWidth = parseInt(parts[0], 10) || 0;
          vidHeight = parseInt(parts[1], 10) || 0;
        }
      } catch {}

      if (vidWidth > 0 && vidHeight > 0 && (vidWidth < 120 || vidHeight < 120)) {
        console.warn(`⚠️ [VidToCode] Selected area too small: ${vidWidth}x${vidHeight}px (minimum is 120x120px)`);
        await TerminalAutomation.sendSystemNotification(
          `Selected area too small (${vidWidth}x${vidHeight}px). Minimum is 120x120px.`,
          "MuseDeck Vid to Code"
        );
        wsServer.broadcast({ type: "area_too_small", width: vidWidth, height: vidHeight } as any);
        return;
      }

      // Extract 8 sequential keyframes from the 5-second recording
      const framePaths = await extractVideoFrames(videoPath, "/tmp/musedeck", 8, 1.6);

      // Smart Motion Detection: check if frames are static/identical
      const { motionPercent, isStatic } = await detectMotionDifference(framePaths);
      console.log(`📊 [VidToCode] Motion difference detected: ${motionPercent.toFixed(2)}%`);

      if (isStatic) {
        console.warn(`⚠️ [VidToCode] Static screen detected (${motionPercent.toFixed(2)}% change). Prompting user to use IMG TO CODE.`);
        isOperationInProgress = false;
        await TerminalAutomation.sendSystemNotification(
          "Static screen detected. No motion found — please use IMG TO CODE instead.",
          "MuseDeck Vid to Code"
        );
        wsServer.broadcast({ type: "vid_static_detected", diffPercent: motionPercent } as any);
        return;
      }

      // Step 2: Native macOS Notification (Strictly English, no emojis!)
      await TerminalAutomation.sendSystemNotification(
        "Flow captured. Synthesizing animated code with Meta Muse Spark...",
        "MuseDeck"
      );

      // Notify surfaces of synthesis phase
      wsServer.broadcast({ type: "vid_synthesizing", target: targetFramework } as any);

      // Assemble 8-frame 4x2 temporal storyboard contact sheet with timecode badges + manifest
      const montagePath = "/tmp/musedeck/flow_montage.png";
      const manifestPath = "/tmp/musedeck/flow_manifest.json";
      let storyboardManifest: any = null;
      try {
        const { manifest } = await buildTemporalStoryboard({
          framePaths,
          durationSeconds: 5.0,
          montagePath,
          manifestPath,
          cols: 4,
          rows: 2,
          frameWidth: 320,
          frameHeight: 200,
          motionPercent,
        });
        storyboardManifest = manifest;
        console.log(`🎬 [VidToCode] Built temporal contact sheet (${manifest.frameCount} frames, ${manifest.durationSeconds}s) -> ${montagePath}`);
      } catch (montageErr: any) {
        console.warn("Could not create multi-frame montage:", montageErr.message);
      }

      const chosenPath = fs.existsSync(montagePath) ? montagePath : framePaths[0];
      let thumbBase64 = "";
      if (fs.existsSync(chosenPath)) {
        thumbBase64 = fs.readFileSync(chosenPath).toString("base64");
      } else {
        thumbBase64 = stateMachine.getTelemetry().lastThumbnail || "";
      }

      console.log(`🎬 [VidToCode] Synthesizing ${targetFramework} interactive UI flow component...`);
      const res = await sparkClient.generateCodeFromImage(thumbBase64, targetFramework as any);
      lastGeneratedFilePath = res.filePath;
      stateMachine.setLastSparkCode(res.code);

      // Open in developer's active editor
      await TerminalAutomation.openFileInEditor(res.filePath);

      // Feed prompt into active Muse terminal with temporal metadata
      const prompt = `Synthesized interactive ${res.frameworkName} UI flow component (${res.filename}) from 8-frame temporal storyboard (5.0s sequence, ${motionPercent.toFixed(1)}% motion change): ${res.filePath}. Integrate this animated transition into our workspace.`;
      await TerminalAutomation.typeSnippetIntoTerminal(prompt, false);

      // Broadcast completion to Stream Deck
      wsServer.broadcast({
        type: "vid_spark_completed",
        filename: res.filename,
        filePath: res.filePath,
        framework: res.frameworkName,
        manifest: storyboardManifest,
      } as any);
    } catch (err: any) {
      console.error("VidToCode synthesis error:", err.message);
      wsServer.broadcast({
        type: "vid_spark_failed",
        error: err.message,
      } as any);
    } finally {
      isOperationInProgress = false;
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
        if (isOperationInProgress) {
          console.warn("⚠️ [Bridge] Synthesis/Recording operation already in progress. Ignoring duplicate SPARK request.");
          wsServer.broadcast({
            type: "spark_failed",
            reason: "busy",
            error: "Operation already in progress",
          } as any);
          break;
        }
        isOperationInProgress = true;
        try {
          // Always prompt interactive screen capture for fresh target
          const snipRes = await samClient.snipScreenRegion();
          const thumb = snipRes.thumbnailBase64;
          stateMachine.setLastThumbnail(thumb);

          const targetFramework = (msg.target as any) || "AUTO";

          // Immediate feedback to user: native notification + Stream Deck status
          await TerminalAutomation.sendSystemNotification("Synthesizing component with Meta Muse Spark...", "MuseDeck");
          wsServer.broadcast({ type: "spark_synthesizing", target: targetFramework } as any);

          // Synthesize code using Meta Muse Spark (takes ~40s)
          const res = await sparkClient.generateCodeFromImage(thumb, targetFramework);
          lastGeneratedFilePath = res.filePath;
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

          if (err.code === "AREA_TOO_SMALL") {
            await TerminalAutomation.sendSystemNotification(
              `Selected area too small (${err.width}x${err.height}px). Minimum is 120x120px.`,
              "MuseDeck Img to Code"
            );
            wsServer.broadcast({
              type: "area_too_small",
              width: err.width,
              height: err.height,
            } as any);
          } else if (!errMsg.includes("cancelled") && !errMsg.includes("Escape")) {
            await TerminalAutomation.sendSystemNotification("No recognizable UI component detected in selection.", "MuseDeck Img to Code");
          }

          wsServer.broadcast({
            type: "spark_failed",
            reason: errMsg.includes("cancelled") || errMsg.includes("Escape") ? "cancelled" : "empty",
            error: errMsg,
          });
        } finally {
          isOperationInProgress = false;
        }
        break;

      case "open_code":
        console.log("👁️ [Bridge] Received OPEN_CODE command from surface");
        await handleOpenCode();
        break;

      case "run_preview":
        console.log("▶️ [Bridge] Received RUN_PREVIEW command from surface");
        await handleRunPreview();
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
        if (isOperationInProgress) {
          console.warn("⚠️ [Bridge] Operation already in progress. Ignoring duplicate VID_RECORD trigger.");
          wsServer.broadcast({
            type: "vid_recording_cancelled",
            error: "Operation already in progress",
          } as any);
          break;
        }
        isOperationInProgress = true;
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
        fs.mkdirSync(path.dirname(videoPath), { recursive: true });
        if (fs.existsSync(videoPath)) {
          try { fs.unlinkSync(videoPath); } catch {}
        }

        // Clean up any lingering screencapture processes to ensure macOS interactive capture is never blocked
        try {
          execSync("killall screencapture 2>/dev/null || true");
          execSync("killall wait-mouse-release 2>/dev/null || true");
        } catch {}

        // Spawn screencapture with interactive mouse selection (-i -s)
        // -i: capture screen interactively
        // -s: only allow mouse selection mode (crosshair '+')
        // -v: capture video recording of the selected rectangle
        // -V 5: 5 seconds recording limit
        // -k: show clicks in video recording mode
        activeRecordingProcess = spawn("screencapture", ["-i", "-s", "-v", "-V", "5", "-k", videoPath]);

        activeRecordingProcess.stderr?.on("data", (d) => {
          console.warn("[screencapture stderr]", d.toString().trim());
        });

        let recordingStarted = false;
        let mouseWaiterProcess: any = null;

        const startRecordingCountdown = () => {
          if (recordingStarted) return;
          recordingStarted = true;
          console.log("🔴 [Bridge] Area selected. Starting 5s screen recording...");

          wsServer.broadcast({ type: "vid_recording_started", duration: 5 } as any);
          void TerminalAutomation.sendSystemNotification(
            "Recording UI screen flow (5s remaining)...",
            "MuseDeck Vid to Code"
          );

          let countdown = 5;
          if (activeCountdownTimer) clearInterval(activeCountdownTimer);
          activeCountdownTimer = setInterval(() => {
            countdown--;
            if (countdown > 0) {
              wsServer.broadcast({ type: "vid_countdown", seconds: countdown } as any);
              void TerminalAutomation.sendSystemNotification(
                `Recording UI screen flow (${countdown}s remaining)...`,
                "MuseDeck Vid to Code"
              );
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
            isOperationInProgress = false;
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

      case "record_prompt_flow": {
        if (isOperationInProgress) {
          console.warn("⚠️ [Bridge] Operation already in progress. Ignoring duplicate REC FLOW trigger.");
          break;
        }
        isOperationInProgress = true;
        console.log("🎬 [Bridge] Launching crosshair screen selection for prompt flow recording...");

        // Broadcast aiming mode to Stream Deck immediately
        wsServer.broadcast({ type: "flow_rec_aiming" } as any);

        const flowVideoPath = "/tmp/musedeck/recorded_flow.mp4";
        fs.mkdirSync(path.dirname(flowVideoPath), { recursive: true });
        if (fs.existsSync(flowVideoPath)) {
          try { fs.unlinkSync(flowVideoPath); } catch {}
        }

        try {
          execSync("killall screencapture 2>/dev/null || true");
          execSync("killall wait-mouse-release 2>/dev/null || true");
        } catch {}

        activeFlowRecordingProcess = spawn("screencapture", ["-i", "-s", "-v", "-V", "5", "-k", flowVideoPath]);

        activeFlowRecordingProcess.stderr?.on("data", (d) => {
          console.warn("[flow screencapture stderr]", d.toString().trim());
        });

        let flowRecordingStarted = false;
        let flowMouseWaiterProcess: any = null;

        const startFlowRecordingCountdown = () => {
          if (flowRecordingStarted) return;
          flowRecordingStarted = true;
          console.log("🔴 [Bridge] Area selected. Starting 5s prompt flow recording...");
          wsServer.broadcast({ type: "flow_rec_started", duration: 5 } as any);
          void TerminalAutomation.sendSystemNotification(
            "Starting screen recording (5s limit)...",
            "MuseDeck"
          );

          let countdown = 5;
          if (activeFlowCountdownTimer) clearInterval(activeFlowCountdownTimer);
          activeFlowCountdownTimer = setInterval(() => {
            countdown--;
            if (countdown > 0) {
              wsServer.broadcast({ type: "flow_rec_countdown", seconds: countdown } as any);
            } else {
              clearInterval(activeFlowCountdownTimer!);
              activeFlowCountdownTimer = null;
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
          flowMouseWaiterProcess = spawn(mouseWaiterPath);
          flowMouseWaiterProcess.on("exit", (code: number) => {
            flowMouseWaiterProcess = null;
            if (code === 0 && activeFlowRecordingProcess) {
              startFlowRecordingCountdown();
            }
          });
        }

        activeFlowRecordingProcess.on("exit", async (code: number) => {
          activeFlowRecordingProcess = null;
          if (flowMouseWaiterProcess) {
            try { flowMouseWaiterProcess.kill(); } catch {}
            flowMouseWaiterProcess = null;
          }
          if (activeFlowCountdownTimer) {
            clearInterval(activeFlowCountdownTimer);
            activeFlowCountdownTimer = null;
          }

          if (code !== 0 || !fs.existsSync(flowVideoPath) || fs.statSync(flowVideoPath).size === 0) {
            console.log("ℹ️ [Bridge] Flow recording selection was cancelled or no area selected.");
            isOperationInProgress = false;
            wsServer.broadcast({ type: "flow_rec_cancelled" } as any);
            return;
          }

          let vidWidth = 0;
          let vidHeight = 0;
          try {
            const dimOut = execSync(
              `/opt/homebrew/bin/ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${flowVideoPath}" || ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${flowVideoPath}"`
            ).toString().trim();
            const parts = dimOut.split("x");
            if (parts.length >= 2) {
              vidWidth = parseInt(parts[0], 10) || 0;
              vidHeight = parseInt(parts[1], 10) || 0;
            }
          } catch {}

          if (vidWidth > 0 && vidHeight > 0 && (vidWidth < 120 || vidHeight < 120)) {
            console.warn(`⚠️ [FlowRec] Selected area too small: ${vidWidth}x${vidHeight}px (minimum is 120x120px)`);
            try { fs.unlinkSync(flowVideoPath); } catch {}
            await TerminalAutomation.sendSystemNotification(
              `Selected area too small (${vidWidth}x${vidHeight}px). Minimum is 120x120px.`,
              "MuseDeck"
            );
            wsServer.broadcast({ type: "flow_rec_too_small", width: vidWidth, height: vidHeight } as any);
            isOperationInProgress = false;
            return;
          }

          try {
            console.log("🎬 [FlowRec] Attaching video flow to Muse terminal prompt...");
            const attached = await TerminalAutomation.pasteVideoAttachmentIntoMuseTerminal(flowVideoPath);
            if (attached) {
              wsServer.broadcast({ type: "flow_rec_pasted" } as any);
            } else {
              wsServer.broadcast({ type: "flow_rec_cancelled" } as any);
            }
          } catch (err: any) {
            console.error("Failed to attach video to terminal:", err);
            wsServer.broadcast({ type: "flow_rec_cancelled" } as any);
          } finally {
            isOperationInProgress = false;
          }
        });
        break;
      }

      case "stop_prompt_flow": {
        console.log("⏹️ [Bridge] Early stop requested for prompt flow recording");
        if (activeFlowRecordingProcess) {
          activeFlowRecordingProcess.kill("SIGINT");
        }
        break;
      }

      case "git_commit": {
        console.log("🌿 [Bridge] Received git_commit command from surface");
        const result = await TerminalAutomation.executeSafeGitCommit(
          msg.projectDir || process.cwd() || "/Users/akif/Projects/musedeck/musedeck"
        );
        wsServer.broadcast({ type: "git_commit_result", result } as any);
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
      case "area_too_small":
      case "vid_static_detected":
      case "vid_countdown":
      case "vid_synthesizing":
      case "vid_spark_completed":
      case "vid_spark_failed":
      case "flow_rec_aiming":
      case "flow_rec_started":
      case "flow_rec_countdown":
      case "flow_rec_too_small":
      case "flow_rec_pasted":
      case "flow_rec_cancelled":
      case "git_commit_result":
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
