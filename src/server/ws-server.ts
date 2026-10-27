import { WebSocketServer, WebSocket } from "ws";
import type { TelemetryData } from "../agent/types.js";

export type SurfaceMessage =
  | { type: "approve"; feedback?: string }
  | { type: "reject"; feedback?: string }
  | { type: "halt" }
  | { type: "reset" }
  | { type: "snip" }
  | { type: "spark"; prompt?: string }
  | { type: "runTask"; prompt: string }
  | { type: "toggle_submenu" }
  | { type: "subscribe" };

export class MuseWsServer {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private messageHandlers = new Set<(msg: SurfaceMessage, ws: WebSocket) => void>();

  constructor(private readonly port: number) {}

  onMessage(handler: (msg: SurfaceMessage, ws: WebSocket) => void): void {
    this.messageHandlers.add(handler);
  }

  async start(): Promise<void> {
    this.wss = new WebSocketServer({ port: this.port });

    this.wss.on("connection", (ws) => {
      console.log("🔌 [WebSocket] Physical Stream Deck / Surface connected");
      this.clients.add(ws);

      ws.on("message", (raw) => {
        try {
          const msg = JSON.parse(raw.toString()) as SurfaceMessage;
          for (const handler of this.messageHandlers) {
            handler(msg, ws);
          }
        } catch (err) {
          console.error("❌ [WebSocket] Invalid JSON message received:", err);
        }
      });

      ws.on("close", () => {
        console.log("🔌 [WebSocket] Physical Surface disconnected");
        this.clients.delete(ws);
      });

      ws.on("error", (err) => {
        console.error("❌ [WebSocket] Connection error:", err);
        this.clients.delete(ws);
      });
    });

    console.log(`📡 [WebSocket] MuseDeck WS server listening on port ${this.port}`);
  }

  broadcastTelemetry(telemetry: TelemetryData): void {
    this.broadcast({
      type: "telemetry",
      data: telemetry,
    });
  }

  broadcastLog(type: string, message: string): void {
    this.broadcast({
      type: "log",
      level: type,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  broadcast(payload: Record<string, any>): void {
    const data = JSON.stringify(payload);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }

  close(): void {
    this.wss?.close();
  }
}
