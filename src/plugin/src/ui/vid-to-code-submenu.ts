import fs from "node:fs";
import path from "node:path";
import { keyRegistry } from "./key-registry.js";
import { SvgKeyRenderer } from "./svg-renderer.js";
import type { StreamDeckCoreBridge } from "../core-bridge.js";

function hasExistingComponent(): boolean {
  try {
    const tempDir = "/tmp/musedeck";
    if (!fs.existsSync(tempDir)) return false;
    const validExts = [".swift", ".tsx", ".jsx", ".html", ".vue", ".kt", ".dart", ".py"];
    const files = fs.readdirSync(tempDir);
    return files.some((f) => {
      const ext = path.extname(f).toLowerCase();
      return (
        validExts.includes(ext) &&
        (f.startsWith("Animated") ||
          f.startsWith("animated") ||
          f.startsWith("Extracted") ||
          f.startsWith("extracted"))
      );
    });
  } catch {
    return false;
  }
}

export interface VidToCodeOption {
  title: string;
  subtitle: string;
  target: string;
  borderColor: string;
  textColor: string;
}

export const VID_TO_CODE_OPTIONS: Record<string, VidToCodeOption> = {
  // Row 0: Top Animation Engines
  "1,0": {
    title: "FRAMER",
    subtitle: "REACT MOTION",
    target: "FRAMER",
    borderColor: "#ec4899",
    textColor: "#f472b6",
  },
  "2,0": {
    title: "TAILWIND",
    subtitle: "KEYFRAMES",
    target: "TAILWIND_ANIM",
    borderColor: "#06b6d4",
    textColor: "#67e8f9",
  },
  "3,0": {
    title: "SWIFTUI",
    subtitle: "SPRING ANIM",
    target: "SWIFTUI_SPRING",
    borderColor: "#f97316",
    textColor: "#fdba74",
  },
  "4,0": {
    title: "COMPOSE",
    subtitle: "ANDROID ANIM",
    target: "COMPOSE_ANIM",
    borderColor: "#818cf8",
    textColor: "#c7d2fe",
  },

  // Row 1: Cross-Platform & Mobile
  "0,1": {
    title: "FLUTTER",
    subtitle: "ANIMATED",
    target: "FLUTTER_ANIM",
    borderColor: "#38bdf8",
    textColor: "#7dd3fc",
  },
  "1,1": {
    title: "VUE",
    subtitle: "TRANSITION",
    target: "VUE_ANIM",
    borderColor: "#22c55e",
    textColor: "#86efac",
  },
  "2,1": {
    title: "GSAP",
    subtitle: "WEB TIMELINE",
    target: "GSAP",
    borderColor: "#a855f7",
    textColor: "#d8b4fe",
  },
  "3,1": {
    title: "AUTO",
    subtitle: "SMART FLOW",
    target: "AUTO",
    borderColor: "#10b981",
    textColor: "#a7f3d0",
  },
};

class VidToCodeSubmenuManager {
  private active = false;
  private bridge?: StreamDeckCoreBridge;
  private hasGeneratedCode = false;
  private isProcessing = false;
  private isRecording = false;
  private countdownSeconds = 5;
  private lastTappedCoord: { col: number; row: number } | null = null;
  private bannerMode: "idle" | "aiming" | "recording" | "spark" | "preview" | "success" | "failed" | "too_small" | "static_screen" = "idle";
  private bannerStep = 0;
  private bannerTimer: NodeJS.Timeout | null = null;

  get isActive(): boolean {
    return this.active;
  }

  setBridge(bridge: StreamDeckCoreBridge): void {
    this.bridge = bridge;
  }

  private startBannerAnimation(mode: "aiming" | "recording" | "spark" | "preview", intervalMs: number): void {
    this.stopBannerAnimation();
    this.bannerMode = mode;
    this.bannerStep = 0;
    this.updateBannerKeys();
    this.bannerTimer = setInterval(() => {
      this.bannerStep = (this.bannerStep + 1) % 4;
      this.updateBannerKeys();
    }, intervalMs);
  }

  private stopBannerAnimation(): void {
    if (this.bannerTimer) {
      clearInterval(this.bannerTimer);
      this.bannerTimer = null;
    }
  }

  private updateBannerKeys(): void {
    if (!this.active) return;
    for (let c = 0; c < 4; c++) {
      const keyObj = keyRegistry.all().find((k) => k.column === c && k.row === 2);
      if (keyObj) {
        const svg = SvgKeyRenderer.renderBottomBannerTile(
          c,
          this.bannerMode,
          this.bannerStep,
          this.countdownSeconds
        );
        void keyObj.action.setImage(svg);
        void keyObj.action.setTitle("");
      }
    }
  }

  open(): void {
    this.active = true;
    this.isProcessing = false;
    this.isRecording = false;
    this.lastTappedCoord = null;
    this.countdownSeconds = 5;
    this.hasGeneratedCode = hasExistingComponent();
    this.bannerMode = "idle";
    this.stopBannerAnimation();
    this.render();
    console.log("🎬 [VidToCode] Submenu drawer opened on physical Stream Deck");
  }

  close(): void {
    this.active = false;
    this.isProcessing = false;
    this.isRecording = false;
    this.lastTappedCoord = null;
    this.stopBannerAnimation();
    keyRegistry.restoreAll();
    console.log("🎬 [VidToCode] Submenu drawer closed -> Page 1 restored");
  }

  forceClose(): void {
    this.active = false;
    this.isProcessing = false;
    this.isRecording = false;
    this.lastTappedCoord = null;
    this.stopBannerAnimation();
  }

  notifyAiming(): void {
    if (!this.active) return;
    this.isProcessing = true;
    this.isRecording = false;
    this.startBannerAnimation("aiming", 350);
    this.render();
  }

  notifyRecordingStarted(duration = 5): void {
    if (!this.active) return;
    this.isProcessing = true;
    this.isRecording = true;
    this.countdownSeconds = duration;
    console.log(`🔴 [VidToCode] Screen recording started (${duration}s)`);
    this.startBannerAnimation("recording", 300);
    this.render();
  }

  notifyCountdown(seconds: number): void {
    if (!this.active) return;
    this.countdownSeconds = seconds;
    this.updateBannerKeys();
    this.render();
  }

  notifySynthesizing(): void {
    if (!this.active) return;
    this.isProcessing = true;
    this.isRecording = false;
    console.log("⚡ [VidToCode] Flow recorded! Synthesizing animated component with Meta Muse Spark...");
    this.startBannerAnimation("spark", 350);
    this.render();
  }

  notifyCodeGenerated(): void {
    this.stopBannerAnimation();
    this.bannerMode = "idle";
    this.hasGeneratedCode = true;
    this.isProcessing = false;
    this.isRecording = false;
    this.lastTappedCoord = null;
    if (this.active) {
      this.render();
    }
  }

  notifyCancelled(): void {
    if (!this.active) return;
    console.log("ℹ️ [VidToCode] Recording cancelled");
    this.stopBannerAnimation();
    this.bannerMode = "idle";
    this.isProcessing = false;
    this.isRecording = false;
    this.lastTappedCoord = null;
    this.render();
  }

  notifyPreviewLaunching(): void {
    if (!this.active) return;
    console.log("🔨 [VidToCode] Preview compilation in progress -> Animating banner");
    this.isProcessing = true;
    this.startBannerAnimation("preview", 200);
    this.render();
  }

  notifyPreviewLaunched(): void {
    if (!this.active) return;
    console.log("✅ [VidToCode] PreviewApp launched on macOS!");
    this.stopBannerAnimation();
    this.bannerMode = "success";
    this.isProcessing = false;
    this.updateBannerKeys();
    this.render();
    setTimeout(() => {
      if (this.active) {
        this.bannerMode = "idle";
        this.updateBannerKeys();
      }
    }, 3000);
  }

  notifyAreaTooSmall(width?: number, height?: number): void {
    if (!this.active) return;
    console.warn(`⚠️ [VidToCode] Area too small (${width}x${height}px)`);
    this.stopBannerAnimation();
    this.bannerMode = "too_small";
    this.isProcessing = false;
    this.isRecording = false;
    this.lastTappedCoord = null;
    this.updateBannerKeys();
    setTimeout(() => {
      if (this.active) {
        this.bannerMode = "idle";
        this.render();
      }
    }, 3500);
  }

  notifyStaticScreen(): void {
    if (!this.active) return;
    console.warn("⚠️ [VidToCode] Static screen detected — no motion");
    this.stopBannerAnimation();
    this.bannerMode = "static_screen";
    this.isProcessing = false;
    this.isRecording = false;
    this.lastTappedCoord = null;
    this.updateBannerKeys();
    setTimeout(() => {
      if (this.active) {
        this.bannerMode = "idle";
        this.render();
      }
    }, 4000);
  }

  notifyPreviewFailed(error?: string): void {
    if (!this.active) return;
    console.warn("⚠️ [VidToCode] Preview compilation failed:", error);
    this.stopBannerAnimation();
    this.bannerMode = "failed";
    this.isProcessing = false;
    this.updateBannerKeys();
    this.render();
    setTimeout(() => {
      if (this.active) {
        this.bannerMode = "idle";
        this.updateBannerKeys();
      }
    }, 4000);
  }

  render(): void {
    if (!this.active) return;

    for (const key of keyRegistry.all()) {
      const col = key.column;
      const row = key.row;

      let image = "";

      if (row === 0 && col === 0) {
        // (0, 0): BACK key (dimmed when locked)
        image = SvgKeyRenderer.renderUpBackKey(this.isProcessing);
      } else if (row === 1 && col === 4) {
        // (4, 1): OPEN CODE key - ONLY SHOWN AFTER CODE IS SYNTHESIZED!
        if (this.hasGeneratedCode && !this.isProcessing) {
          image = SvgKeyRenderer.renderOpenCodeKey(true);
        } else {
          image = SvgKeyRenderer.renderEmptyTile();
        }
      } else if (row === 2 && col === 4) {
        // (4, 2): PREVIEW key - ONLY SHOWN AFTER CODE IS SYNTHESIZED!
        if (this.hasGeneratedCode && !this.isProcessing) {
          image = SvgKeyRenderer.renderLivePreviewKey(true);
        } else {
          image = SvgKeyRenderer.renderEmptyTile();
        }
      } else if (row === 2 && col >= 0 && col < 4) {
        // (0..3, 2): 4-Key Recording HUD / Status Banner
        image = SvgKeyRenderer.renderBottomBannerTile(
          col,
          this.bannerMode,
          this.bannerStep,
          this.countdownSeconds
        );
      } else {
        const keyCoord = `${col},${row}`;
        const option = VID_TO_CODE_OPTIONS[keyCoord];
        if (option) {
          const isTriggeredKey =
            this.lastTappedCoord !== null &&
            this.lastTappedCoord.col === col &&
            this.lastTappedCoord.row === row;

          if (this.isProcessing) {
            if (isTriggeredKey) {
              const sub = this.isRecording ? `REC ${this.countdownSeconds}s` : "AIMING...";
              image = SvgKeyRenderer.renderVidToCodeOptionKey(
                option.title,
                sub,
                "#38bdf8",
                "#7dd3fc",
                false
              );
            } else {
              // Multiple Trigger Lock: lock all other framework options
              image = SvgKeyRenderer.renderVidToCodeOptionKey(
                option.title,
                option.subtitle,
                option.borderColor,
                option.textColor,
                true // isLocked = true
              );
            }
          } else {
            image = SvgKeyRenderer.renderVidToCodeOptionKey(
              option.title,
              option.subtitle,
              option.borderColor,
              option.textColor,
              false
            );
          }
        } else {
          image = SvgKeyRenderer.renderEmptyTile();
        }
      }

      if (image) {
        void key.action.setImage(image);
        void key.action.setTitle("");
      }
    }
  }

  async handleKeyDown(col: number, row: number): Promise<boolean> {
    if (!this.active) return false;

    // Special exception: (3, 2) STOP BUTTON during recording is allowed so user can terminate capture early
    if (row === 2 && col === 3 && this.isRecording) {
      console.log("⏹️ [VidToCode] STOP button pressed during recording -> Stopping early");
      if (this.bridge) {
        await this.bridge.stopVidRecording();
      }
      return true;
    }

    // Multiple Trigger Lock: When processing, strictly lock and ignore all other keypresses
    if (this.isProcessing) {
      console.warn(`🔒 [VidToCode] Multiple trigger locked! Ignoring key tap at (${col}, ${row}) while operation is in progress.`);
      return true;
    }

    // 1. (0, 0): BACK -> Return to Page 1
    if (col === 0 && row === 0) {
      this.close();
      return true;
    }

    // 2. (4, 1): OPEN CODE
    if (col === 4 && row === 1) {
      if (!this.hasGeneratedCode) return true;
      console.log("👁️ [VidToCode] Open Code tapped -> Launching editor");
      if (this.bridge) {
        await this.bridge.openCode();
      }
      return true;
    }

    // 3. (4, 2): LIVE PREVIEW
    if (col === 4 && row === 2) {
      if (!this.hasGeneratedCode) return true;
      console.log("▶️ [VidToCode] Live Preview tapped -> Compiling & launching live preview");
      this.isProcessing = true;
      this.startBannerAnimation("preview", 200);
      this.render();
      if (this.bridge) {
        await this.bridge.runPreview();
      }
      return true;
    }

    // 4. Banner keys (0..2, 2) ignore taps
    if (row === 2 && col >= 0 && col < 4) {
      return true;
    }

    // 5. Animation Target selected:
    const keyCoord = `${col},${row}`;
    const option = VID_TO_CODE_OPTIONS[keyCoord];
    if (option) {
      this.isProcessing = true;
      this.lastTappedCoord = { col, row };
      this.hasGeneratedCode = false;

      console.log(`🎬 [VidToCode] Selected target: ${option.target} (${option.title})`);

      // Feedback on tapped key
      const keyObj = keyRegistry.all().find((k) => k.column === col && k.row === row);
      if (keyObj) {
        void keyObj.action.setImage(
          SvgKeyRenderer.renderVidToCodeOptionKey(
            "AIM +",
            "DRAG RECT",
            "#38bdf8",
            "#7dd3fc",
            false
          )
        );
      }

      this.notifyAiming();

      try {
        if (this.bridge) {
          await this.bridge.recordVid(option.target);
        }
      } catch (err: any) {
        console.error("VidToCode dispatch failed:", err.message);
        this.isProcessing = false;
        this.lastTappedCoord = null;
        this.notifyCancelled();
      }
      return true;
    }

    return true;
  }
}

export const vidToCodeSubmenuManager = new VidToCodeSubmenuManager();

