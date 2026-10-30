import { keyRegistry } from "./key-registry.js";
import { SvgKeyRenderer } from "./svg-renderer.js";
import type { StreamDeckCoreBridge } from "../core-bridge.js";

export interface ImgToCodeOption {
  line1: string;
  line2: string;
  subtitle: string;
  badge: string;
  target: string;
  borderColor: string;
  textColor: string;
}

export const IMG_TO_CODE_OPTIONS: Record<string, ImgToCodeOption> = {
  // Row 0: Web & Auto
  "1,0": {
    line1: "AUTO",
    line2: "DETECT",
    subtitle: "SMART STACK",
    badge: "PROJECT",
    target: "AUTO",
    borderColor: "#10b981",
    textColor: "#ecfdf5",
  },
  "2,0": {
    line1: "REACT",
    line2: "TSX",
    subtitle: "TAILWIND",
    badge: "WEB",
    target: "REACT",
    borderColor: "#06b6d4",
    textColor: "#f0f9ff",
  },
  "3,0": {
    line1: "HTML",
    line2: "+ CSS",
    subtitle: "VANILLA",
    badge: "WEB",
    target: "HTML_CSS",
    borderColor: "#f59e0b",
    textColor: "#fef3c7",
  },
  "4,0": {
    line1: "VUE 3",
    line2: "SFC",
    subtitle: "TAILWIND",
    badge: "WEB",
    target: "VUE",
    borderColor: "#22c55e",
    textColor: "#f0fdf4",
  },

  // Row 1: Mobile & Desktop
  "0,1": {
    line1: "SWIFTUI",
    line2: "NATIVE",
    subtitle: "APPLE",
    badge: "iOS / MAC",
    target: "SWIFTUI",
    borderColor: "#f97316",
    textColor: "#fff7ed",
  },
  "1,1": {
    line1: "COMPOSE",
    line2: "KOTLIN",
    subtitle: "MATERIAL 3",
    badge: "ANDROID",
    target: "COMPOSE",
    borderColor: "#818cf8",
    textColor: "#e0e7ff",
  },
  "2,1": {
    line1: "FLUTTER",
    line2: "DART",
    subtitle: "CROSS-PLAT",
    badge: "MOBILE",
    target: "FLUTTER",
    borderColor: "#38bdf8",
    textColor: "#f0f9ff",
  },
  "3,1": {
    line1: "PYTHON",
    line2: "UI",
    subtitle: "STREAMLIT",
    badge: "DESKTOP",
    target: "PYTHON",
    borderColor: "#eab308",
    textColor: "#fefce8",
  },
};

class ImgToCodeSubmenuManager {
  private active = false;
  private bridge?: StreamDeckCoreBridge;
  private hasGeneratedCode = false;
  private isProcessing = false;
  private lastTappedCoord: { col: number; row: number } | null = null;
  private bannerMode: "idle" | "spark" | "preview" | "success" | "failed" = "idle";
  private bannerStep = 0;
  private bannerTimer: NodeJS.Timeout | null = null;

  get isActive(): boolean {
    return this.active;
  }

  setBridge(bridge: StreamDeckCoreBridge): void {
    this.bridge = bridge;
  }

  private startBannerAnimation(mode: "spark" | "preview", intervalMs: number): void {
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
        void keyObj.action.setImage(
          SvgKeyRenderer.renderBottomBannerTile(c, this.bannerMode, this.bannerStep)
        );
      }
    }
  }

  open(): void {
    console.log("🎨 [ImgToCode] Opening Multi-Language UI-to-Code Submenu");
    this.active = true;
    this.hasGeneratedCode = false; // Always start with clean slate: NO preview or open buttons until synthesized!
    this.isProcessing = false;
    this.stopBannerAnimation();
    this.bannerMode = "idle";
    this.render();
  }

  close(): void {
    if (!this.active) return;
    console.log("🔙 [ImgToCode] Closing Multi-Language UI-to-Code Submenu -> Restoring Page 1");
    this.stopBannerAnimation();
    this.bannerMode = "idle";
    this.hasGeneratedCode = false;
    this.isProcessing = false;
    this.active = false;
    keyRegistry.restoreAll();
  }

  forceClose(): void {
    this.stopBannerAnimation();
    this.bannerMode = "idle";
    this.hasGeneratedCode = false;
    this.isProcessing = false;
    this.active = false;
  }

  notifySynthesizing(): void {
    if (!this.active) return;
    if (this.lastTappedCoord) {
      const { col, row } = this.lastTappedCoord;
      const keyObj = keyRegistry.all().find((k) => k.column === col && k.row === row);
      const keyCoord = `${col},${row}`;
      const option = IMG_TO_CODE_OPTIONS[keyCoord];
      if (keyObj && option) {
        void keyObj.action.setImage(
          SvgKeyRenderer.renderImgToCodeOptionKey(
            "SPARKING...",
            "GENERATING",
            "WAITING API",
            option.badge,
            "#f59e0b",
            "#fde047"
          )
        );
      }
    }
    // Start sweeping animation on the bottom 4 keys (0..3, 2): WAIT FOR MUSE SPARK
    this.startBannerAnimation("spark", 350);
  }

  notifyCodeGenerated(): void {
    this.stopBannerAnimation();
    this.bannerMode = "idle";
    this.hasGeneratedCode = true;
    this.isProcessing = false;
    if (this.active) {
      this.render();
    }
  }

  notifyCodeFailed(reason = "empty"): void {
    this.stopBannerAnimation();
    this.bannerMode = "idle";
    this.isProcessing = false;
    this.hasGeneratedCode = false;
    if (!this.active) return;

    if (reason === "empty" && this.lastTappedCoord) {
      const { col, row } = this.lastTappedCoord;
      const keyObj = keyRegistry.all().find((k) => k.column === col && k.row === row);
      if (keyObj) {
        void keyObj.action.setImage(
          SvgKeyRenderer.renderImgToCodeOptionKey(
            "NO UI",
            "FOUND",
            "SKIPPED",
            "EMPTY",
            "#ef4444",
            "#fca5a5"
          )
        );
        setTimeout(() => {
          this.render();
        }, 1500);
        return;
      }
    }
    this.render();
  }

  notifyPreviewLaunching(): void {
    if (!this.active) return;
    console.log("🔨 [ImgToCode] Preview compilation in progress -> Animating bottom banner");
    this.startBannerAnimation("preview", 200);
  }

  notifyPreviewLaunched(): void {
    if (!this.active) return;
    console.log("✅ [ImgToCode] PreviewApp launched on macOS! Displaying success banner and returning to Page 1");
    this.stopBannerAnimation();
    this.bannerMode = "success";
    this.updateBannerKeys();
    setTimeout(() => {
      if (this.active) {
        this.close();
      }
    }, 1500);
  }

  notifyPreviewFailed(error?: string): void {
    if (!this.active) return;
    console.warn("⚠️ [ImgToCode] Preview compilation failed:", error);
    this.stopBannerAnimation();
    this.bannerMode = "failed";
    this.updateBannerKeys();
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
        // (0, 0): BACK key
        image = SvgKeyRenderer.renderUpBackKey();
      } else if (row === 1 && col === 4) {
        // (4, 1): OPEN CODE key - ONLY SHOWN AFTER CODE IS SYNTHESIZED!
        if (this.hasGeneratedCode) {
          image = SvgKeyRenderer.renderOpenCodeKey(true);
        } else {
          image = SvgKeyRenderer.renderEmptyTile();
        }
      } else if (row === 2 && col === 4) {
        // (4, 2): PREVIEW key - ONLY SHOWN AFTER CODE IS SYNTHESIZED!
        if (this.hasGeneratedCode) {
          image = SvgKeyRenderer.renderLivePreviewKey(true);
        } else {
          image = SvgKeyRenderer.renderEmptyTile();
        }
      } else if (row === 2 && col >= 0 && col < 4) {
        // (0..3, 2): 4-Key Animated Marquee / Status Banner
        image = SvgKeyRenderer.renderBottomBannerTile(col, this.bannerMode, this.bannerStep);
      } else {
        const keyCoord = `${col},${row}`;
        const option = IMG_TO_CODE_OPTIONS[keyCoord];
        if (option) {
          image = SvgKeyRenderer.renderImgToCodeOptionKey(
            option.line1,
            option.line2,
            option.subtitle,
            option.badge,
            option.borderColor,
            option.textColor
          );
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

    // 1. (0, 0): BACK -> Return to Page 1
    if (col === 0 && row === 0) {
      this.close();
      return true;
    }

    // 2. (4, 1): OPEN CODE in developer editor (only active after code generated)
    if (col === 4 && row === 1) {
      if (!this.hasGeneratedCode) return true;
      console.log("👁️ [ImgToCode] Open Code tapped -> Launching editor and returning to Page 1");
      if (this.bridge) {
        await this.bridge.openCode();
      }
      this.close();
      return true;
    }

    // 3. (4, 2): LIVE PREVIEW in native macOS app (only active after code generated)
    if (col === 4 && row === 2) {
      if (!this.hasGeneratedCode) return true;
      console.log("▶️ [ImgToCode] Live Preview tapped -> Compiling & launching live app");
      this.startBannerAnimation("preview", 200);
      if (this.bridge) {
        await this.bridge.runPreview();
      }
      return true;
    }

    // 4. Banner keys (0..3, 2) ignore taps
    if (row === 2 && col >= 0 && col < 4) {
      return true;
    }

    // 5. Language Target selected:
    const keyCoord = `${col},${row}`;
    const option = IMG_TO_CODE_OPTIONS[keyCoord];
    if (option) {
      if (this.isProcessing) return true;
      this.isProcessing = true;
      this.lastTappedCoord = { col, row };
      this.hasGeneratedCode = false; // Reset so preview/open buttons are completely invisible
      this.stopBannerAnimation();
      this.bannerMode = "idle";
      this.render();

      console.log(`🎨 [ImgToCode] Selected framework: ${option.target} (${option.line1})`);

      // Feedback on tapped key
      const keyObj = keyRegistry.all().find((k) => k.column === col && k.row === row);
      if (keyObj) {
        void keyObj.action.setImage(
          SvgKeyRenderer.renderImgToCodeOptionKey(
            "SNIPPING...",
            "",
            "SELECT REGION",
            option.badge,
            "#f59e0b",
            "#fbbf24"
          )
        );
      }

      try {
        if (this.bridge) {
          await this.bridge.spark(option.target);
        }
      } catch (err: any) {
        console.error("Spark synthesis error:", err.message);
        this.isProcessing = false;
        this.stopBannerAnimation();
        this.bannerMode = "idle";
        this.render();
      }
      return true;
    }

    return true;
  }
}

export const imgToCodeSubmenuManager = new ImgToCodeSubmenuManager();

