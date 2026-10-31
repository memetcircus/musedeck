import { exec } from "node:child_process";
import { keyRegistry } from "./key-registry.js";
import { SvgKeyRenderer } from "./svg-renderer.js";
import { configManager } from "../../../config/config-manager.js";

export interface SettingsOption {
  line1: string;
  line2: string;
  borderColor: string;
  textColor: string;
  actionType: "open_web" | "api_status" | "set_model" | "open_workspace" | "reload_bridge";
  modelId?: "spark" | "sam" | "chat";
}

export const SETTINGS_ITEMS: Record<string, SettingsOption> = {
  // Row 0 (Top)
  "1,0": {
    line1: "OPEN",
    line2: "WEB UI",
    borderColor: "#38bdf8",
    textColor: "#bae6fd",
    actionType: "open_web",
  },
  "2,0": {
    line1: "API",
    line2: "STATUS",
    borderColor: "#a855f7",
    textColor: "#e9d5ff",
    actionType: "api_status",
  },

  // Row 1 (Middle) - Model Switches
  "0,1": {
    line1: "SPARK",
    line2: "1.3",
    borderColor: "#22c55e",
    textColor: "#86efac",
    actionType: "set_model",
    modelId: "spark",
  },
  "1,1": {
    line1: "SAM",
    line2: "3.1",
    borderColor: "#f59e0b",
    textColor: "#fde68a",
    actionType: "set_model",
    modelId: "sam",
  },
  "2,1": {
    line1: "MUSE",
    line2: "CHAT",
    borderColor: "#ec4899",
    textColor: "#fbcfe8",
    actionType: "set_model",
    modelId: "chat",
  },

  // Row 2 (Bottom)
  "0,2": {
    line1: "OPEN",
    line2: "WORKSPACE",
    borderColor: "#6366f1",
    textColor: "#c7d2fe",
    actionType: "open_workspace",
  },
  "1,2": {
    line1: "RELOAD",
    line2: "BRIDGE",
    borderColor: "#06b6d4",
    textColor: "#a5f3fc",
    actionType: "reload_bridge",
  },
};

class SettingsSubmenuManager {
  private active = false;

  get isActive(): boolean {
    return this.active;
  }

  open(): void {
    console.log("⚙️ [SettingsSubmenu] Opening Settings & Model Switch Sub-Dashboard");
    this.active = true;
    this.render();
  }

  close(): void {
    if (!this.active) return;
    console.log("🔙 [SettingsSubmenu] Closing Settings Sub-Dashboard -> Restoring Page 1");
    this.active = false;
    keyRegistry.restoreAll();
  }

  forceClose(): void {
    if (!this.active) return;
    this.active = false;
  }

  render(): void {
    if (!this.active) return;
    const currentConfig = configManager.load();
    const activeModel = currentConfig.activeModel || "spark";

    for (const key of keyRegistry.all()) {
      const col = key.column;
      const row = key.row;

      let image = "";

      if (row === 0 && col === 0) {
        // (0,0) Top-Left: UP/BACK Key
        image = SvgKeyRenderer.renderUpBackKey();
      } else {
        const coord = `${col},${row}`;
        const item = SETTINGS_ITEMS[coord];
        if (item) {
          const isSelected = item.actionType === "set_model" && item.modelId === activeModel;
          image = SvgKeyRenderer.renderSettingsCard(
            item.line1,
            item.line2,
            isSelected ? "#22c55e" : item.borderColor,
            isSelected ? "#4ade80" : item.textColor,
            isSelected
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

    // (0,0): Return to Page 1
    if (col === 0 && row === 0) {
      this.close();
      return true;
    }

    const coord = `${col},${row}`;
    const item = SETTINGS_ITEMS[coord];
    if (!item) return true;

    console.log(`⚙️ [SettingsSubmenu] Triggered: ${item.line1} ${item.line2}`);

    switch (item.actionType) {
      case "open_web": {
        console.log("🌐 [SettingsSubmenu] Opening http://localhost:3456/settings in browser...");
        exec("open http://localhost:3456/settings");
        break;
      }
      case "set_model": {
        if (item.modelId) {
          console.log(`⚡ [SettingsSubmenu] Switching active model to ${item.modelId}...`);
          configManager.setActiveModel(item.modelId);
          this.render(); // Re-render to show active badge on newly selected model
        }
        break;
      }
      case "open_workspace": {
        const wsPath = configManager.load().workspacePath || process.cwd();
        console.log(`📁 [SettingsSubmenu] Opening workspace folder: ${wsPath}`);
        exec(`open "${wsPath}"`);
        break;
      }
      case "api_status": {
        console.log("🔑 [SettingsSubmenu] Checking API status...");
        exec("open http://localhost:3456/settings");
        break;
      }
      case "reload_bridge": {
        console.log("🔄 [SettingsSubmenu] Reloading bridge settings...");
        configManager.load();
        this.render();
        break;
      }
    }

    return true;
  }
}

export const settingsSubmenuManager = new SettingsSubmenuManager();

