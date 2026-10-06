/* ------------------------------------------------------------------ *
 *  FAIMESS Reactive API Client Engine
 *  Ultra-fast network client with in-memory caching, offline resilience,
 *  telemetry instrumentation, and event-driven pub/sub architecture.
 * ------------------------------------------------------------------ */

import type { ApiResponse } from "./types";

export type EventCallback<T = any> = (payload: T) => void;

class ApiEventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit<T = any>(event: string, payload: T): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[API-Event Error in '${event}']`, err);
        }
      }
    }
  }
}

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
  etag?: string;
};

export class ApiClient {
  public readonly events = new ApiEventEmitter();
  private cache = new Map<string, CacheEntry<any>>();
  private baseUrl: string = "";
  private authToken: string | null = null;
  private readonly defaultTtlMs = 60_000; // 1 minute default cache

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const storedToken = window.localStorage.getItem("faimess.auth_token");
        if (storedToken) this.authToken = storedToken;
      } catch {}
    }
  }

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, "");
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
    if (typeof window !== "undefined") {
      try {
        if (token) window.localStorage.setItem("faimess.auth_token", token);
        else window.localStorage.removeItem("faimess.auth_token");
      } catch {}
    }
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * High performance in-memory cache lookup
   */
  getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  setCached<T>(key: string, data: T, ttlMs: number = this.defaultTtlMs): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidateCache(prefix?: string): void {
    if (!prefix) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Wrap data in standardized ApiResponse format
   */
  wrapResponse<T>(data: T, cached = false, durationMs = 0): ApiResponse<T> {
    return {
      success: true,
      status: 200,
      data,
      meta: {
        cached,
        durationMs,
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Generic request executor with fallback to local resolver
   */
  async execute<T>(
    endpoint: string,
    localFallback: () => T | Promise<T>,
    options?: {
      cacheKey?: string;
      ttlMs?: number;
      method?: "GET" | "POST" | "PUT" | "DELETE";
      body?: unknown;
    },
  ): Promise<ApiResponse<T>> {
    const start = performance.now();
    const cacheKey = options?.cacheKey;

    // Check in-memory cache for GET requests
    if (options?.method !== "POST" && options?.method !== "PUT" && options?.method !== "DELETE" && cacheKey) {
      const cached = this.getCached<T>(cacheKey);
      if (cached !== null) {
        return this.wrapResponse(cached, true, Math.round(performance.now() - start));
      }
    }

    // If a remote API endpoint is defined, attempt network call
    if (this.baseUrl && typeof window !== "undefined" && typeof window.fetch === "function") {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        if (this.authToken) {
          headers["Authorization"] = `Bearer ${this.authToken}`;
        }

        const res = await fetch(`${this.baseUrl}${endpoint}`, {
          method: options?.method || "GET",
          headers,
          body: options?.body ? JSON.stringify(options.body) : undefined,
        });

        if (res.ok) {
          const json = await res.json();
          const duration = Math.round(performance.now() - start);
          if (cacheKey) this.setCached(cacheKey, json, options?.ttlMs);
          return this.wrapResponse(json, false, duration);
        }
      } catch (networkError) {
        // Silently fallback to ultra-fast local store on network failure
      }
    }

    // Execute high-speed in-memory fallback
    const result = await Promise.resolve(localFallback());
    const duration = Math.round(performance.now() - start);

    if (cacheKey && (!options?.method || options.method === "GET")) {
      this.setCached(cacheKey, result, options?.ttlMs);
    }

    return this.wrapResponse(result, false, duration);
  }
}

export const apiClient = new ApiClient();
