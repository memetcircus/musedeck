import WebSocket from "ws";
import streamDeck from "@elgato/streamdeck";
import { AgentState, type TelemetryData } from "../../agent/types.js";
import { telemetrySubmenuManager } from "./ui/telemetry-submenu.js";
import { snippetsSubmenuManager } from "./ui/snippets-submenu.js";
import { reviewSubmenuManager } from "./ui/review-submenu.js";
import { sessionsSubmenuManager } from "./ui/sessions-submenu.js";
import { imgToCodeSubmenuManager } from "./ui/img-to-code-submenu.js";
import { vidToCodeSubmenuManager } from "./ui/vid-to-code-submenu.js";
import { settingsSubmenuManager } from "./ui/settings-submenu.js";

export interface FlowRecEvent {
  type: "aiming" | "started" | "countdown" | "too_small" | "pasted" | "cancelled";
  duration?: number;
  seconds?: number;
  width?: number;
  height?: number;
}
export type FlowRecListener = (event: FlowRecEvent) => void;

export class StreamDeckCoreBridge {
  private ws: WebSocket | null = null;
  private telemetry: TelemetryData = {
    state: AgentState.IDLE,
    activeTask: "Ready for instructions",
    activeStep: "System Idle",
    iteration: 0,
    maxIterations: 5,
    diffStats: { filesChanged: 0, insertions: 0, deletions: 0, files: [] },
    diffText: "",
    lastError: null,
    connectedSurfaces: 1,
    uptimeSeconds: 0,
    timestamp: new Date().toISOString(),
    apiUsage: {
      creditsRemaining: "$149.97",
      spent: "$0.00",
      model: "SPARK 1.3",
      inputTokens: "433.9k",
      outputTokens: "19.4k",
      cacheHitRate: "57.7%",
      totalRequests: 21,
    },
  };

  private telemetryListeners = new Set<(telemetry: TelemetryData) => void>();
  private flowRecListeners: FlowRecListener[] = [];
  private gitCommitListeners: ((result: string) => void)[] = [];
  private httpUrl: string;
  private wsUrl: string;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(
    httpPort = 3456,
    wsPort = 3457
  ) {
    this.httpUrl = `http://127.0.0.1:${httpPort}`;
    this.wsUrl = `ws://127.0.0.1:${wsPort}`;
  }

  getTelemetry(): TelemetryData {
    return this.telemetry;
  }

  setState(state: AgentState): void {
    this.telemetry.state = state;
    for (const listener of this.telemetryListeners) {
      listener(this.telemetry);
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "set_state", state }));
    }
  }

  onTelemetry(listener: (telemetry: TelemetryData) => void): () => void {
    this.telemetryListeners.add(listener);
    listener(this.telemetry);
    return () => this.telemetryListeners.delete(listener);
  }

  onFlowRec(listener: FlowRecListener): () => void {
    this.flowRecListeners.push(listener);
    return () => {
      this.flowRecListeners = this.flowRecListeners.filter((l) => l !== listener);
    };
  }

  notifyFlowRec(event: FlowRecEvent): void {
    for (const listener of this.flowRecListeners) {
      try {
        listener(event);
      } catch (err: any) {
        console.error("Error in flowRecListener:", err);
      }
    }
  }

  onGitCommitResult(listener: (result: string) => void): () => void {
    this.gitCommitListeners.push(listener);
    return () => {
      this.gitCommitListeners = this.gitCommitListeners.filter((l) => l !== listener);
    };
  }

  notifyGitCommitResult(result: string): void {
    for (const listener of this.gitCommitListeners) {
      try {
        listener(result);
      } catch (err: any) {
        console.error("Error in gitCommitListener:", err);
      }
    }
  }

  async start(): Promise<void> {
    this.connectWs();
  }

  private connectWs(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.on("open", () => {
        console.log("🔌 [StreamDeck Bridge] Connected to MuseDeck WS server");
        this.send({ type: "subscribe" });
      });

      this.ws.on("message", (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.type === "telemetry" && msg.data) {
            this.telemetry = msg.data;
            for (const listener of this.telemetryListeners) {
              listener(this.telemetry);
            }
          } else if (msg.type === "toggle_submenu") {
            if (telemetrySubmenuManager.isActive) {
              telemetrySubmenuManager.close();
            } else {
              telemetrySubmenuManager.open(this.telemetry);
            }
          } else if (msg.type === "open_submenu") {
            telemetrySubmenuManager.open(this.telemetry);
          } else if (msg.type === "close_submenu") {
            telemetrySubmenuManager.close();
          } else if (msg.type === "toggle_snippets") {
            if (snippetsSubmenuManager.isActive) {
              snippetsSubmenuManager.close();
            } else {
              snippetsSubmenuManager.open();
            }
          } else if (msg.type === "open_snippets") {
            snippetsSubmenuManager.open();
          } else if (msg.type === "close_snippets") {
            snippetsSubmenuManager.close();
          } else if (msg.type === "toggle_review") {
            if (reviewSubmenuManager.isActive) {
              reviewSubmenuManager.close();
            } else {
              reviewSubmenuManager.open();
            }
          } else if (msg.type === "open_review") {
            reviewSubmenuManager.open();
          } else if (msg.type === "close_review") {
            reviewSubmenuManager.close();
          } else if (msg.type === "toggle_sessions") {
            if (sessionsSubmenuManager.isActive) {
              sessionsSubmenuManager.close();
            } else {
              void sessionsSubmenuManager.open();
            }
          } else if (msg.type === "open_sessions") {
            void sessionsSubmenuManager.open();
          } else if (msg.type === "close_sessions") {
            sessionsSubmenuManager.close();
          } else if (msg.type === "toggle_img_to_code") {
            if (imgToCodeSubmenuManager.isActive) {
              imgToCodeSubmenuManager.close();
            } else {
              imgToCodeSubmenuManager.open();
            }
          } else if (msg.type === "open_img_to_code") {
            imgToCodeSubmenuManager.open();
          } else if (msg.type === "close_img_to_code") {
            imgToCodeSubmenuManager.close();
          } else if (msg.type === "spark_completed") {
            imgToCodeSubmenuManager.notifyCodeGenerated();
          } else if (msg.type === "spark_synthesizing") {
            imgToCodeSubmenuManager.notifySynthesizing();
          } else if (msg.type === "spark_failed") {
            imgToCodeSubmenuManager.notifyCodeFailed(msg.reason);
          } else if (msg.type === "toggle_vid_to_code") {
            if (vidToCodeSubmenuManager.isActive) {
              vidToCodeSubmenuManager.close();
            } else {
              vidToCodeSubmenuManager.open();
            }
          } else if (msg.type === "open_vid_to_code") {
            vidToCodeSubmenuManager.open();
          } else if (msg.type === "close_vid_to_code") {
            vidToCodeSubmenuManager.close();
          } else if (msg.type === "vid_aiming") {
            vidToCodeSubmenuManager.notifyAiming();
          } else if (msg.type === "vid_recording_started") {
            vidToCodeSubmenuManager.notifyRecordingStarted(msg.duration);
          } else if (msg.type === "vid_recording_cancelled") {
            vidToCodeSubmenuManager.notifyCancelled();
          } else if (msg.type === "area_too_small") {
            imgToCodeSubmenuManager.notifyAreaTooSmall((msg as any).width, (msg as any).height);
            vidToCodeSubmenuManager.notifyAreaTooSmall((msg as any).width, (msg as any).height);
          } else if (msg.type === "vid_static_detected") {
            vidToCodeSubmenuManager.notifyStaticScreen();
          } else if (msg.type === "vid_countdown") {
            vidToCodeSubmenuManager.notifyCountdown(msg.seconds);
          } else if (msg.type === "vid_synthesizing") {
            vidToCodeSubmenuManager.notifySynthesizing();
          } else if (msg.type === "vid_spark_completed") {
            vidToCodeSubmenuManager.notifyCodeGenerated();
          } else if (msg.type === "preview_launching") {
            imgToCodeSubmenuManager.notifyPreviewLaunching();
            vidToCodeSubmenuManager.notifyPreviewLaunching();
          } else if (msg.type === "preview_launched") {
            imgToCodeSubmenuManager.notifyPreviewLaunched();
            vidToCodeSubmenuManager.notifyPreviewLaunched();
          } else if (msg.type === "preview_failed") {
            imgToCodeSubmenuManager.notifyPreviewFailed(msg.error);
            vidToCodeSubmenuManager.notifyPreviewFailed(msg.error);
          } else if (msg.type === "flow_rec_aiming") {
            this.notifyFlowRec({ type: "aiming" });
          } else if (msg.type === "flow_rec_started") {
            this.notifyFlowRec({ type: "started", duration: msg.duration });
          } else if (msg.type === "flow_rec_countdown") {
            this.notifyFlowRec({ type: "countdown", seconds: msg.seconds });
          } else if (msg.type === "flow_rec_too_small") {
            this.notifyFlowRec({ type: "too_small", width: msg.width, height: msg.height });
          } else if (msg.type === "flow_rec_pasted") {
            this.notifyFlowRec({ type: "pasted" });
          } else if (msg.type === "flow_rec_cancelled") {
            this.notifyFlowRec({ type: "cancelled" });
          } else if (msg.type === "git_commit_result") {
            this.notifyGitCommitResult(msg.result);
          } else if (msg.type === "config_updated") {
            if (settingsSubmenuManager.isActive) {
              settingsSubmenuManager.render();
            }
          } else if (msg.type === "switch_page") {
            const page = typeof msg.page === "number" ? msg.page : 1;
            console.log(`[Bridge] Received switch_page command to page ${page}`);
            for (const device of streamDeck.devices) {
              console.log(`[Bridge] Switching device ${device.id} to profile MuseDeck page ${page}`);
              void streamDeck.profiles.switchToProfile(device.id, "MuseDeck", page);
            }
          }
        } catch (e) {
          console.error("Error parsing telemetry from core:", e);
        }
      });

      this.ws.on("close", () => {
        this.ws = null;
        this.scheduleReconnect();
      });

      this.ws.on("error", () => {
        this.ws = null;
        this.scheduleReconnect();
      });
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectWs();
    }, 2000);
  }

  private send(payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  // --- Stream Deck Action Commands (Single Transport) ---

  private async dispatch(payload: any, httpEndpoint: string, httpBody?: any): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send(payload);
    } else {
      try {
        await fetch(`${this.httpUrl}/api/${httpEndpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: httpBody ? JSON.stringify(httpBody) : undefined,
        });
      } catch (err: any) {
        console.error(`HTTP fallback failed for ${httpEndpoint}:`, err.message);
      }
    }
  }

  async launchSession(projectDir?: string): Promise<void> {
    await this.dispatch(
      { type: "launch_session", projectDir },
      "sessions/launch",
      { cwd: projectDir }
    );
  }

  async approve(): Promise<void> {
    await this.dispatch({ type: "approve" }, "approve");
  }

  async reject(): Promise<void> {
    await this.dispatch({ type: "reject" }, "reject");
  }

  async halt(): Promise<void> {
    await this.dispatch({ type: "halt" }, "cancel");
  }

  async reset(): Promise<void> {
    await this.dispatch({ type: "reset" }, "reset");
  }

  async snip(): Promise<{ ok: boolean; segmentedImagePath?: string }> {
    try {
      const res = await fetch(`${this.httpUrl}/api/snip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      return (await res.json()) as any;
    } catch (err: any) {
      console.error("HTTP snip request failed:", err.message);
      return { ok: false };
    }
  }

  async spark(target = "AUTO"): Promise<void> {
    await this.dispatch({ type: "spark", target }, "spark", { target });
  }

  async openCode(): Promise<void> {
    await this.dispatch({ type: "open_code" }, "open-code");
  }

  async runPreview(): Promise<void> {
    await this.dispatch({ type: "run_preview" }, "run-preview");
  }

  async recordVid(target = "AUTO"): Promise<void> {
    await this.dispatch({ type: "vid_record", target }, "vid/record", { target });
  }

  async stopVidRecording(): Promise<void> {
    await this.dispatch({ type: "vid_stop" }, "vid/stop");
  }

  async recordPromptFlow(): Promise<void> {
    await this.dispatch({ type: "record_prompt_flow" }, "flow/record");
  }

  async stopPromptFlow(): Promise<void> {
    await this.dispatch({ type: "stop_prompt_flow" }, "flow/stop");
  }

  async gitCommit(projectDir?: string): Promise<void> {
    await this.dispatch({ type: "git_commit", projectDir }, "git/commit", { projectDir });
  }

  async runTask(prompt: string): Promise<void> {
    await this.dispatch({ type: "runTask", prompt }, "task", { prompt });
  }
}
