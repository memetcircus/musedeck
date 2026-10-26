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

  // --- Stream Deck Action Commands ---

  async approve(): Promise<void> {
    this.send({ type: "approve" });
    try {
      await fetch(`${this.httpUrl}/api/approve`, { method: "POST" });
    } catch {}
  }

  async reject(): Promise<void> {
    this.send({ type: "reject" });
    try {
      await fetch(`${this.httpUrl}/api/reject`, { method: "POST" });
    } catch {}
  }

  async halt(): Promise<void> {
    this.send({ type: "halt" });
    try {
      await fetch(`${this.httpUrl}/api/cancel`, { method: "POST" });
    } catch {}
  }

  async reset(): Promise<void> {
    this.send({ type: "reset" });
    try {
      await fetch(`${this.httpUrl}/api/reset`, { method: "POST" });
    } catch {}
  }

  async snip(): Promise<void> {
    this.send({ type: "snip" });
    try {
      await fetch(`${this.httpUrl}/api/snip`, { method: "POST" });
    } catch {}
  }

  async spark(): Promise<void> {
    this.send({ type: "spark" });
    try {
      await fetch(`${this.httpUrl}/api/spark`, { method: "POST" });
    } catch {}
  }

  async runTask(prompt: string): Promise<void> {
    this.send({ type: "runTask", prompt });
    try {
      await fetch(`${this.httpUrl}/api/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
    } catch {}
  }
}
