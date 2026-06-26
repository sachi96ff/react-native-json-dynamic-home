// src/services/JsonLoaderService.ts

import {
  DynamicScreenConfig,
  parseDynamicScreenConfig,
  dynamicScreenConfigToJson,
} from '../models/DynamicScreenConfig';

/**
 * Service for loading, caching, and serving dynamic UI JSON.
 *
 * Loading priority:
 * 1. In-memory cache (if not expired)
 * 2. API endpoint (remote JSON)
 * 3. Local persistent cache (AsyncStorage)
 *
 * Features:
 * - In-memory TTL cache (default: 5 minutes)
 * - Persistent cache for offline fallback
 * - Version-based cache invalidation
 */

// Type for AsyncStorage — we accept it dynamically to avoid hard dependency
interface AsyncStorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<readonly string[]>;
}

interface CacheEntry {
  config: DynamicScreenConfig;
  timestamp: number;
}

/** Default cache TTL: 5 minutes */
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Prefix for AsyncStorage keys */
const CACHE_PREFIX = 'dynamic_ui_cache_';
const CACHE_VERSION_PREFIX = 'dynamic_ui_version_';

export class JsonLoaderService {
  private static instance: JsonLoaderService;

  /** Optional global base URL for non-fully-qualified JSON requests */
  static defaultBaseUrl?: string;

  /** Optional global headers (e.g. for Auth tokens) */
  static defaultHeaders?: Record<string, string>;

  /** AsyncStorage reference — set this before using persistent cache */
  static asyncStorage?: AsyncStorageInterface;

  /** In-memory cache: key → CacheEntry */
  private memoryCache: Map<string, CacheEntry> = new Map();

  private constructor() {}

  static getInstance(): JsonLoaderService {
    if (!JsonLoaderService.instance) {
      JsonLoaderService.instance = new JsonLoaderService();
    }
    return JsonLoaderService.instance;
  }

  /**
   * Load a dynamic screen config by JSON file name.
   *
   * @param jsonFile - A filename like "home_dynamic.json" or a full URL
   * @param forceRefresh - Bypasses all caches
   */
  async loadConfig(
    jsonFile: string,
    forceRefresh: boolean = false
  ): Promise<DynamicScreenConfig | null> {
    try {
      // ─── 1. Memory cache ─────────────────────────────────
      if (!forceRefresh && !__DEV__) {
        const cached = this.memoryCache.get(jsonFile);
        if (cached && !this.isExpired(cached)) {
          console.log(`📦 DynamicUI: Memory cache hit for "${jsonFile}"`);
          return cached.config;
        }
      }

      // ─── 2. Try API first ─────────────────────────────────
      let config: DynamicScreenConfig | null = null;
      try {
        config = await this.loadFromApi(jsonFile);
        if (config) {
          console.log(`🌐 DynamicUI: Loaded "${jsonFile}" from API`);
          this.memoryCache.set(jsonFile, {
            config,
            timestamp: Date.now(),
          });
          await this.saveToPersistentCache(jsonFile, config);
          return config;
        }
      } catch (e) {
        console.warn(`⚠️ DynamicUI: API load failed for "${jsonFile}": ${e}`);
      }

      // ─── 3. Persistent cache (offline fallback) ──────────
      if (!forceRefresh && !__DEV__) {
        config = await this.loadFromPersistentCache(jsonFile);
        if (config) {
          console.log(
            `💾 DynamicUI: Persistent cache hit for "${jsonFile}"`
          );
          this.memoryCache.set(jsonFile, {
            config,
            timestamp: Date.now(),
          });
          return config;
        }
      }

      console.error(
        `❌ DynamicUI: Failed to load "${jsonFile}" from any source`
      );
      return null;
    } catch (e) {
      console.error(`❌ DynamicUI: Error loading "${jsonFile}": ${e}`);
      return null;
    }
  }

  /** Load from API endpoint. */
  private async loadFromApi(
    jsonFile: string
  ): Promise<DynamicScreenConfig | null> {
    let url: string;
    if (
      jsonFile.startsWith('http://') ||
      jsonFile.startsWith('https://')
    ) {
      url = jsonFile;
    } else if (JsonLoaderService.defaultBaseUrl) {
      url = `${JsonLoaderService.defaultBaseUrl}/${jsonFile}`;
    } else {
      throw new Error(
        'jsonFile must be a full URL, or JsonLoaderService.defaultBaseUrl must be set'
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(JsonLoaderService.defaultHeaders ?? {}),
    };

    const response = await fetch(url, { headers });

    if (response.ok) {
      const data = await response.json();
      if (data.success === true && data.data != null) {
        return parseDynamicScreenConfig(data.data);
      }
      return parseDynamicScreenConfig(data);
    }

    return null;
  }

  /** Save to persistent cache (AsyncStorage). */
  private async saveToPersistentCache(
    jsonFile: string,
    config: DynamicScreenConfig
  ): Promise<void> {
    const storage = JsonLoaderService.asyncStorage;
    if (!storage) return;

    try {
      const jsonString = JSON.stringify(dynamicScreenConfigToJson(config));
      await storage.setItem(`${CACHE_PREFIX}${jsonFile}`, jsonString);
      await storage.setItem(
        `${CACHE_VERSION_PREFIX}${jsonFile}`,
        config.version
      );
    } catch (e) {
      console.warn(
        `⚠️ DynamicUI: Failed to save cache for "${jsonFile}": ${e}`
      );
    }
  }

  /** Load from persistent cache. */
  private async loadFromPersistentCache(
    jsonFile: string
  ): Promise<DynamicScreenConfig | null> {
    const storage = JsonLoaderService.asyncStorage;
    if (!storage) return null;

    try {
      const jsonString = await storage.getItem(`${CACHE_PREFIX}${jsonFile}`);
      if (!jsonString) return null;

      const jsonMap = JSON.parse(jsonString);
      return parseDynamicScreenConfig(jsonMap);
    } catch (e) {
      console.warn(
        `⚠️ DynamicUI: Failed to read cache for "${jsonFile}": ${e}`
      );
      return null;
    }
  }

  /** Check if a cache entry is expired. */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > CACHE_TTL_MS;
  }

  /** Clear all dynamic UI caches. */
  async clearAllCaches(): Promise<void> {
    this.memoryCache.clear();

    const storage = JsonLoaderService.asyncStorage;
    if (!storage) return;

    try {
      const keys = await storage.getAllKeys();
      for (const key of keys) {
        if (
          key.startsWith(CACHE_PREFIX) ||
          key.startsWith(CACHE_VERSION_PREFIX)
        ) {
          await storage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn(`⚠️ DynamicUI: Failed to clear caches: ${e}`);
    }
  }

  /** Clear cache for a specific JSON file. */
  clearCache(jsonFile: string): void {
    this.memoryCache.delete(jsonFile);
  }
}
