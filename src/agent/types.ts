/**
 * MuseDeck Agent State Machine & Telemetry Types
 */

export enum AgentState {
  IDLE = "IDLE",
  PLANNING = "PLANNING",
  WAITING_APPROVAL = "WAITING_APPROVAL",
  EXECUTING = "EXECUTING",
  ERROR = "ERROR",
}

export interface DiffStats {
  filesChanged: number;
  insertions: number;
  deletions: number;
  files: Array<{
    path: string;
    additions: number;
    deletions: number;
  }>;
}

export interface ApiUsageStats {
  creditsRemaining: string; // e.g. "$148.01"
  spent: string; // e.g. "$1.99"
  model: string; // e.g. "SPARK 1.3"
  inputTokens: string; // e.g. "433.9k"
  outputTokens: string; // e.g. "19.4k"
  cacheHitRate: string; // e.g. "57.7%"
  totalRequests: number; // e.g. 21
}

export interface TelemetryData {
  state: AgentState;
  activeTask: string;
  activeStep: string;
  iteration: number;
  maxIterations: number;
  diffStats: DiffStats;
  diffText: string;
  lastError: string | null;
  lastErrorCode?: string;
  lastThumbnail?: string; // Base64 data URL for SAM 3.1 snippet
  lastSparkCode?: string; // Muse Spark generated code
  connectedSurfaces: number;
  uptimeSeconds: number;
  timestamp: string;
  apiUsage?: ApiUsageStats;
}

export interface TaskRequest {
  prompt: string;
  requireApproval?: boolean;
  contextFiles?: string[];
  imageSnippet?: string; // Base64 PNG
}

export interface ApprovalDecision {
  approved: boolean;
  feedback?: string;
}

export interface AgentEventMap {
  stateChange: (state: AgentState, telemetry: TelemetryData) => void;
  telemetry: (telemetry: TelemetryData) => void;
  approvalRequired: (diffStats: DiffStats, diffText: string) => void;
  log: (type: "stdout" | "stderr" | "info" | "warn" | "error", message: string) => void;
  error: (error: Error, code?: string) => void;
}
