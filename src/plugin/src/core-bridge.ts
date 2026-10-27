import WebSocket from "ws";
import { AgentState, type TelemetryData } from "../../agent/types.js";

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
  };

  private telemetryListeners = new Set<(telemetry: TelemetryData) => void>();
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

  onTelemetry(listener: (telemetry: TelemetryData) => void): () => void {
    this.telemetryListeners.add(listener);
    listener(this.telemetry);
    return () => this.telemetryListeners.delete(listener);
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

  async spark(): Promise<void> {
    await this.dispatch({ type: "spark" }, "spark");
  }

  async runTask(prompt: string): Promise<void> {
    await this.dispatch({ type: "runTask", prompt }, "task", { prompt });
  }
}
