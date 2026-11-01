/**
 * Meta Model API Client
 * Drop-in compatible with Meta's developer API endpoint
 */

import { configManager } from "../config/config-manager.js";

export interface MetaClientConfig {
  apiKey?: string;
  baseUrl?: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

export class MetaModelApiClient {
  private apiKey: string;
  private baseUrl: string;
  private maxRetries: number;
  private retryDelayMs: number;

  constructor(config: MetaClientConfig = {}) {
    this.apiKey = config.apiKey || process.env.META_MODEL_API_KEY || "";
    this.baseUrl = config.baseUrl || process.env.META_API_BASE_URL || "https://api.meta.ai/v1";
    this.maxRetries = config.maxRetries ?? 2;
    this.retryDelayMs = config.retryDelayMs ?? 1000;
  }

  private getResolvedApiKey(): string {
    if (this.apiKey && this.apiKey !== "your_meta_model_api_key_here") {
      return this.apiKey;
    }
    try {
      const cfg = configManager.load();
      if (cfg.apiKey && cfg.apiKey !== "your_meta_model_api_key_here") {
        return cfg.apiKey;
      }
    } catch {}
    return "";
  }

  private getResolvedBaseUrl(): string {
    try {
      const cfg = configManager.load();
      if (cfg.baseUrl) return cfg.baseUrl;
    } catch {}
    return this.baseUrl || "https://api.meta.ai/v1";
  }

  isConfigured(): boolean {
    return Boolean(this.getResolvedApiKey());
  }

  /**
   * Dispatches a request to the Meta Model API with automatic retries and rate limit handling
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const base = this.getResolvedBaseUrl();
    const key = this.getResolvedApiKey();
    const url = `${base}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };

    let attempt = 0;
    while (attempt <= this.maxRetries) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : this.retryDelayMs * (attempt + 1);
          console.warn(`⏳ [Meta API] Rate-limited (429). Retrying after ${waitTime}ms (attempt ${attempt + 1}/${this.maxRetries})...`);
          
          if (attempt >= this.maxRetries) {
            throw new Error(`Meta Model API rate limit exceeded (HTTP 429). Please check your quota.`);
          }
          await new Promise((r) => setTimeout(r, waitTime));
          attempt++;
          continue;
        }

        if (!response.ok) {
          const errorBody = await response.text();
          const isClientError = response.status >= 400 && response.status < 500 && response.status !== 429;
          const error = new Error(`Meta API error (${response.status} ${response.statusText}): ${errorBody}`);
          if (isClientError) {
            // Do not retry 4xx errors (e.g. 404, 405) - throw immediately
            throw error;
          }
          throw error;
        }

        return (await response.json()) as T;
      } catch (err: any) {
        const isClientError = err.message?.includes("Meta API error (4");
        if (attempt >= this.maxRetries || err.message?.includes("rate limit") || isClientError) {
          throw err;
        }
        attempt++;
        const backoff = this.retryDelayMs * Math.pow(2, attempt);
        console.warn(`⚠️ [Meta API] Network/API error: ${err.message}. Retrying in ${backoff}ms...`);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }

    throw new Error("Meta Model API request failed after maximum retries.");
  }
}
