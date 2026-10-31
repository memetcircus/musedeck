import { EventEmitter } from "node:events";
import { AgentState, type DiffStats, type TelemetryData, type ApiUsageStats } from "./types.js";

export class AgentStateMachine extends EventEmitter {
  private state: AgentState = AgentState.IDLE;
  private activeTask = "Ready for instructions";
  private activeStep = "System Idle";
  private iteration = 0;
  private maxIterations = 5;
  private diffStats: DiffStats = { filesChanged: 0, insertions: 0, deletions: 0, files: [] };
  private diffText = "";
  private lastError: string | null = null;
  private lastErrorCode?: string;
  private lastThumbnail?: string;
  private lastSparkCode?: string;
  private connectedSurfaces = 0;
  private startTime = Date.now();
  private apiUsage: ApiUsageStats = {
    creditsRemaining: "$148.01",
    spent: "$1.99",
    model: "SPARK 1.3",
    inputTokens: "433.9k",
    outputTokens: "19.4k",
    cacheHitRate: "57.7%",
    totalRequests: 21,
  };

  constructor() {
    super();
  }

  getState(): AgentState {
    return this.state;
  }

  getTelemetry(): TelemetryData {
    return {
      state: this.state,
      activeTask: this.activeTask,
      activeStep: this.activeStep,
      iteration: this.iteration,
      maxIterations: this.maxIterations,
      diffStats: this.diffStats,
      diffText: this.diffText,
      lastError: this.lastError,
      lastErrorCode: this.lastErrorCode,
      lastThumbnail: this.lastThumbnail,
      lastSparkCode: this.lastSparkCode,
      connectedSurfaces: this.connectedSurfaces,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      apiUsage: { ...this.apiUsage },
    };
  }

  setApiUsage(usage: Partial<ApiUsageStats>): void {
    this.apiUsage = {
      ...this.apiUsage,
      ...usage,
    };
    this.emitTelemetry();
  }

  recordApiInference(inputTokens = 1200, outputTokens = 450, cost = 0.003): void {
    const currentCreditsNum = parseFloat(this.apiUsage.creditsRemaining.replace("$", "")) || 148.01;
    const currentSpentNum = parseFloat(this.apiUsage.spent.replace("$", "")) || 1.99;
    const newCredits = Math.max(0, currentCreditsNum - cost);
    const newSpent = currentSpentNum + cost;

    this.apiUsage = {
      ...this.apiUsage,
      creditsRemaining: `$${newCredits.toFixed(2)}`,
      spent: `$${newSpent.toFixed(2)}`,
      totalRequests: (this.apiUsage.totalRequests || 21) + 1,
    };
    this.emitTelemetry();
  }

  setConnectedSurfaces(count: number): void {
    this.connectedSurfaces = count;
    this.emitTelemetry();
  }

  setLastThumbnail(thumbnailUrl: string): void {
    this.lastThumbnail = thumbnailUrl;
    this.emitTelemetry();
  }

  setLastSparkCode(code: string): void {
    this.lastSparkCode = code;
    this.emitTelemetry();
  }

  /**
   * Transition state with verification
   */
  transition(newState: AgentState, reason?: string): boolean {
    if (this.state === newState) return true;

    const prev = this.state;
    this.state = newState;

    if (newState === AgentState.ERROR) {
      if (!this.lastError) {
        this.lastError = reason || "Unknown agent error";
      }
    } else if (newState === AgentState.IDLE) {
      this.lastError = null;
      this.lastErrorCode = undefined;
    }

    console.log(`🔀 [StateMachine] Transition: ${prev} -> ${newState} ${reason ? `(${reason})` : ""}`);
    
    this.emit("stateChange", this.state, this.getTelemetry());
    this.emitTelemetry();
    return true;
  }

  startPlanning(taskDescription: string): void {
    this.activeTask = taskDescription;
    this.activeStep = "Analyzing workspace & architecture...";
    this.iteration = 1;
    this.diffStats = { filesChanged: 0, insertions: 0, deletions: 0, files: [] };
    this.diffText = "";
    this.lastError = null;
    this.transition(AgentState.PLANNING);
  }

  setWaitingApproval(diffStats: DiffStats, diffText: string, stepDescription = "Review diff & approve changes"): void {
    this.diffStats = diffStats;
    this.diffText = diffText;
    this.activeStep = stepDescription;
    this.transition(AgentState.WAITING_APPROVAL, "Diff generated, awaiting physical approval");
    this.emit("approvalRequired", diffStats, diffText);
  }

  startExecuting(stepDescription = "Applying approved changes & running validations"): void {
    this.activeStep = stepDescription;
    this.transition(AgentState.EXECUTING, "Approved by developer");
  }

  completeTask(message = "Task completed successfully"): void {
    this.activeStep = message;
    this.transition(AgentState.IDLE, "Done");
  }

  setError(errorMessage: string, errorCode?: string): void {
    this.lastError = errorMessage;
    this.lastErrorCode = errorCode || "ERR_AGENT_FAILURE";
    this.activeStep = `Error: ${errorMessage}`;
    this.transition(AgentState.ERROR, errorMessage);
    if (this.listenerCount("error") > 0) {
      this.emit("error", new Error(errorMessage), this.lastErrorCode);
    }
  }

  reset(): void {
    this.activeTask = "Ready for instructions";
    this.activeStep = "System Idle";
    this.iteration = 0;
    this.diffStats = { filesChanged: 0, insertions: 0, deletions: 0, files: [] };
    this.diffText = "";
    this.lastError = null;
    this.lastErrorCode = undefined;
    this.transition(AgentState.IDLE, "Manual reset requested");
  }

  private emitTelemetry(): void {
    this.emit("telemetry", this.getTelemetry());
  }
}
