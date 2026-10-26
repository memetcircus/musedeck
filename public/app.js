/**
 * MuseDeck Mission Control Dashboard Logic
 */

let ws = null;
let currentTelemetry = null;

// DOM Elements
const surfaceStatus = document.getElementById("surface-status");
const uptimeDisplay = document.getElementById("uptime-display");
const hitlPill = document.getElementById("hitl-pill");
const hitlStateText = document.getElementById("hitl-state-text");
const hitlStepDesc = document.getElementById("hitl-step-desc");
const hitlCard = document.getElementById("hitl-banner");
const diffStatsPill = document.getElementById("diff-stats-pill");
const diffContent = document.getElementById("diff-content");
const webApproveBtn = document.getElementById("web-approve-btn");
const webRejectBtn = document.getElementById("web-reject-btn");
const taskPromptInput = document.getElementById("task-prompt-input");
const dispatchTaskBtn = document.getElementById("dispatch-task-btn");
const triggerSnipBtn = document.getElementById("trigger-snip-btn");
const snipPreviewContainer = document.getElementById("snip-preview-container");
const sparkCodeContent = document.getElementById("spark-code-content");
const copyCodeBtn = document.getElementById("copy-code-btn");
const terminalLogs = document.getElementById("terminal-logs");
const clearLogsBtn = document.getElementById("clear-logs-btn");

// Key elements
const keyStatus = document.getElementById("key-0");
const keyStatusTitle = document.getElementById("key-status-title");
const keyStatusSub = document.getElementById("key-status-sub");
const keyTaskSub = document.getElementById("key-task-sub");
const keyDiffTitle = document.getElementById("key-diff-title");
const keyDiffSub = document.getElementById("key-diff-sub");
const keyApprove = document.getElementById("key-3");
const keyReject = document.getElementById("key-4");
const keySamInner = document.getElementById("key-5-inner");

// Connect WebSocket
function connectWebSocket() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.hostname}:3457`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    surfaceStatus.textContent = "ONLINE";
    surfaceStatus.className = "metric-value status-online";
    appendLog("info", "[WebSocket] Connected to MuseDeck hardware bridge");
    ws.send(JSON.stringify({ type: "subscribe" }));
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === "telemetry" && msg.data) {
        updateTelemetry(msg.data);
      } else if (msg.type === "log") {
        appendLog(msg.level, msg.message);
      }
    } catch (e) {
      console.error("Error parsing message:", e);
    }
  };

  ws.onclose = () => {
    surfaceStatus.textContent = "OFFLINE";
    surfaceStatus.className = "metric-value text-red";
    setTimeout(connectWebSocket, 2000);
  };
}

// Update UI with Telemetry Snapshot
function updateTelemetry(data) {
  currentTelemetry = data;

  // Uptime
  const hrs = String(Math.floor(data.uptimeSeconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((data.uptimeSeconds % 3600) / 60)).padStart(2, "0");
  const secs = String(data.uptimeSeconds % 60).padStart(2, "0");
  uptimeDisplay.textContent = `${hrs}:${mins}:${secs}`;

  // HITL State & Banner
  hitlStateText.textContent = data.state;
  hitlStepDesc.textContent = data.activeStep;
  keyStatusTitle.textContent = data.state;
  keyTaskSub.textContent = data.activeStep.length > 18 ? `${data.activeStep.substring(0, 16)}...` : data.activeStep;

  // Diff metrics
  if (data.diffStats.filesChanged > 0) {
    keyDiffTitle.textContent = `${data.diffStats.filesChanged} FILES`;
    keyDiffSub.textContent = `+${data.diffStats.insertions} / -${data.diffStats.deletions}`;
    diffStatsPill.textContent = `${data.diffStats.filesChanged} files (+${data.diffStats.insertions} / -${data.diffStats.deletions})`;
  } else {
    keyDiffTitle.textContent = "NO DIFF";
    keyDiffSub.textContent = "+0 / -0";
    diffStatsPill.textContent = "0 files changed";
  }

  if (data.diffText) {
    diffContent.textContent = data.diffText;
  }

  // SAM 3.1 Thumbnail preview
  if (data.lastThumbnail) {
    snipPreviewContainer.innerHTML = `<img src="${data.lastThumbnail}" alt="SAM 3.1 Segmented Foreground" />`;
    keySamInner.innerHTML = `<img src="${data.lastThumbnail}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 10px;" />`;
  }

  // Muse Spark Code
  if (data.lastSparkCode) {
    sparkCodeContent.textContent = data.lastSparkCode;
  }

  // State-specific styles
  const dot = hitlPill.querySelector(".pulse-dot");
  if (data.state === "WAITING_APPROVAL") {
    hitlCard.style.borderLeftColor = "#f59e0b";
    dot.style.background = "#f59e0b";
    dot.style.boxShadow = "0 0 10px #f59e0b";
    keyApprove.classList.add("waiting-pulse");
    keyReject.classList.add("waiting-pulse");
    webApproveBtn.disabled = false;
    webRejectBtn.disabled = false;
  } else {
    keyApprove.classList.remove("waiting-pulse");
    keyReject.classList.remove("waiting-pulse");
    webApproveBtn.disabled = true;
    webRejectBtn.disabled = true;

    if (data.state === "PLANNING") {
      hitlCard.style.borderLeftColor = "#38bdf8";
      dot.style.background = "#38bdf8";
      dot.style.boxShadow = "0 0 10px #38bdf8";
    } else if (data.state === "EXECUTING") {
      hitlCard.style.borderLeftColor = "#a855f7";
      dot.style.background = "#a855f7";
      dot.style.boxShadow = "0 0 10px #a855f7";
    } else if (data.state === "ERROR") {
      hitlCard.style.borderLeftColor = "#ef4444";
      dot.style.background = "#ef4444";
      dot.style.boxShadow = "0 0 10px #ef4444";
    } else {
      hitlCard.style.borderLeftColor = "#22c55e";
      dot.style.background = "#22c55e";
      dot.style.boxShadow = "0 0 10px #22c55e";
    }
  }
}

// Append log to terminal
function appendLog(level, message) {
  const line = document.createElement("div");
  line.className = `log-line log-${level}`;
  line.textContent = message;
  terminalLogs.appendChild(line);
  terminalLogs.scrollTop = terminalLogs.scrollHeight;
}

// Dispatch actions to server
async function postAction(endpoint, body = {}) {
  try {
    const res = await fetch(`/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (e) {
    appendLog("error", `API Error (${endpoint}): ${e.message}`);
  }
}

// Event Listeners
webApproveBtn.addEventListener("click", () => postAction("approve"));
webRejectBtn.addEventListener("click", () => postAction("reject"));
triggerSnipBtn.addEventListener("click", () => postAction("snip"));

dispatchTaskBtn.addEventListener("click", () => {
  const prompt = taskPromptInput.value.trim();
  if (prompt) {
    postAction("task", { prompt });
    taskPromptInput.value = "";
  }
});

taskPromptInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") dispatchTaskBtn.click();
});

clearLogsBtn.addEventListener("click", () => {
  terminalLogs.innerHTML = "";
});

copyCodeBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(sparkCodeContent.textContent);
  copyCodeBtn.textContent = "Copied!";
  setTimeout(() => (copyCodeBtn.textContent = "Copy Code"), 1500);
});

// Virtual Stream Deck Key Interactivity
const deckKeys = document.querySelectorAll(".deck-key");
deckKeys.forEach((key) => {
  key.addEventListener("click", async () => {
    const idx = parseInt(key.getAttribute("data-index"), 10);
    switch (idx) {
      case 0:
        postAction("status");
        break;
      case 1:
        appendLog("info", `Current Task: ${currentTelemetry?.activeTask}`);
        break;
      case 2:
        window.open("/api/diff", "_blank");
        break;
      case 3:
        postAction("approve");
        break;
      case 4:
        postAction("reject");
        break;
      case 5:
        postAction("snip");
        break;
      case 6:
        postAction("spark", { prompt: "Generate modern responsive React component with Tailwind CSS" });
        break;
      case 7:
        postAction("task", { prompt: "Implement automated performance benchmarks and refactor bottleneck routines" });
        break;
      case 8:
        postAction("cancel");
        break;
      case 9:
        postAction("reset");
        break;
      case 10:
        taskPromptInput.focus();
        break;
      case 11:
        postAction("task", { prompt: "Generate full integration test coverage for agent state machine" });
        break;
      case 12:
        postAction("task", { prompt: "Auto-debug recent runtime exceptions and synthesize patch" });
        break;
      case 13:
        postAction("task", { prompt: "Stage verified changes and generate git commit with semantic message" });
        break;
      case 14:
        appendLog("info", "MuseDeck Mission Control v1.0.0 (Meta AI Hackathon Edition)");
        break;
    }
  });
});

// Physical Keyboard Shortcuts for HITL
window.addEventListener("keydown", (e) => {
  if (document.activeElement === taskPromptInput) return;

  if (e.key.toLowerCase() === "y" && !webApproveBtn.disabled) {
    postAction("approve");
  } else if (e.key.toLowerCase() === "n" && !webRejectBtn.disabled) {
    postAction("reject");
  } else if (e.key === "Escape") {
    postAction("cancel");
  }
});

// Init
connectWebSocket();
