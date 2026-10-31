import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export interface MuseDeckConfig {
  apiKey: string;
  baseUrl: string;
  samModel: string;
  sparkModel: string;
  activeModel: "spark" | "sam";
  workspacePath: string;
  museBin: string;
  simulationMode: boolean;
}

const DEFAULT_CONFIG: MuseDeckConfig = {
  apiKey: process.env.META_MODEL_API_KEY || "",
  baseUrl: process.env.META_API_BASE_URL || "https://api.meta.ai/v1",
  samModel: process.env.SAM_MODEL_NAME || "sam-3.1",
  sparkModel: process.env.SPARK_MODEL_NAME || "muse-spark-1.3",
  activeModel: "spark",
  workspacePath: process.env.WORKSPACE_PATH || process.cwd(),
  museBin: process.env.MUSE_CODE_BIN || "muse",
  simulationMode: process.env.MUSE_CODE_SIMULATION === "true",
};

class ConfigManager {
  private configDir: string;
  private configFile: string;
  private cachedConfig: MuseDeckConfig | null = null;

  constructor() {
    this.configDir = path.join(os.homedir(), ".musedeck");
    this.configFile = path.join(this.configDir, "config.json");
  }

  ensureDir(): void {
    if (!fs.existsSync(this.configDir)) {
      try {
        fs.mkdirSync(this.configDir, { recursive: true });
      } catch (err) {
        console.error("Failed to create .musedeck directory:", err);
      }
    }
  }

  load(): MuseDeckConfig {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    this.ensureDir();

    let fileConfig: Partial<MuseDeckConfig> = {};
    if (fs.existsSync(this.configFile)) {
      try {
        const raw = fs.readFileSync(this.configFile, "utf8");
        fileConfig = JSON.parse(raw);
      } catch (err) {
        console.error("Error reading ~/.musedeck/config.json:", err);
      }
    }

    this.cachedConfig = {
      ...DEFAULT_CONFIG,
      ...fileConfig,
      apiKey: fileConfig.apiKey || process.env.META_MODEL_API_KEY || "",
      baseUrl: fileConfig.baseUrl || process.env.META_API_BASE_URL || DEFAULT_CONFIG.baseUrl,
      samModel: fileConfig.samModel || process.env.SAM_MODEL_NAME || DEFAULT_CONFIG.samModel,
      sparkModel: fileConfig.sparkModel || process.env.SPARK_MODEL_NAME || DEFAULT_CONFIG.sparkModel,
      activeModel: (fileConfig.activeModel as any) || DEFAULT_CONFIG.activeModel,
      workspacePath: fileConfig.workspacePath || DEFAULT_CONFIG.workspacePath,
      museBin: fileConfig.museBin || DEFAULT_CONFIG.museBin,
      simulationMode: fileConfig.simulationMode ?? DEFAULT_CONFIG.simulationMode,
    };

    // Reflect active API Key to process.env if present
    if (this.cachedConfig.apiKey) {
      process.env.META_MODEL_API_KEY = this.cachedConfig.apiKey;
    }

    return this.cachedConfig;
  }

  save(updates: Partial<MuseDeckConfig>): MuseDeckConfig {
    this.ensureDir();
    const current = this.load();
    const updated: MuseDeckConfig = {
      ...current,
      ...updates,
    };

    try {
      fs.writeFileSync(this.configFile, JSON.stringify(updated, null, 2), "utf8");
      this.cachedConfig = updated;
      if (updated.apiKey) {
        process.env.META_MODEL_API_KEY = updated.apiKey;
      }
      console.log("💾 [ConfigManager] Saved ~/.musedeck/config.json successfully");
    } catch (err) {
      console.error("Error writing ~/.musedeck/config.json:", err);
    }

    return updated;
  }

  setActiveModel(model: "spark" | "sam"): MuseDeckConfig {
    return this.save({ activeModel: model });
  }

  getConfigPath(): string {
    return this.configFile;
  }
}

export const configManager = new ConfigManager();

