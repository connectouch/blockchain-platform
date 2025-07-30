/**
 * Asset Cache System - Intelligent caching for generated SVG assets
 * Implements LRU (Least Recently Used) eviction with performance tracking
 */

// ===== TYPE DEFINITIONS =====

export interface CacheEntry {
  value: string;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  totalRequests: number;
  evictionCount: number;
  memoryUsage: number; // Estimated memory usage in bytes
}

export interface CacheConfig {
  maxSize: number;
  maxAge?: number; // Optional TTL in milliseconds
  enableStats: boolean;
}

// ===== ASSET CACHE IMPLEMENTATION =====

export class AssetCache {
  private static instance: AssetCache;
  private cache = new Map<string, CacheEntry>();
  private accessOrder: string[] = []; // For LRU tracking
  private config: CacheConfig;
  
  // Statistics tracking
  private stats = {
    hitCount: 0,
    missCount: 0,
    evictionCount: 0,
    totalRequests: 0
  };

  private constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      enableStats: true,
      ...config
    };
  }

  /**
   * Get singleton instance of AssetCache
   */
  public static getInstance(config?: Partial<CacheConfig>): AssetCache {
    if (!AssetCache.instance) {
      AssetCache.instance = new AssetCache(config);
    }
    return AssetCache.instance;
  }

  /**
   * Get cached asset by key
   */
  public static get(key: string): string | null {
    return AssetCache.getInstance().getCached(key);
  }

  /**
   * Set cached asset with key
   */
  public static set(key: string, value: string): void {
    AssetCache.getInstance().setCached(key, value);
  }

  /**
   * Clear all cached assets
   */
  public static clear(): void {
    AssetCache.getInstance().clearCache();
  }

  /**
   * Get cache statistics
   */
  public static getStats(): CacheStats {
    return AssetCache.getInstance().getStatistics();
  }

  /**
   * Configure cache settings
   */
  public static configure(config: Partial<CacheConfig>): void {
    AssetCache.getInstance().updateConfig(config);
  }

  // ===== PRIVATE INSTANCE METHODS =====

  /**
   * Get cached value by key (instance method)
   */
  private getCached(key: string): string | null {
    if (this.config.enableStats) {
      this.stats.totalRequests++;
    }

    const entry = this.cache.get(key);
    
    if (!entry) {
      if (this.config.enableStats) {
        this.stats.missCount++;
      }
      return null;
    }

    // Check TTL if configured
    if (this.config.maxAge && Date.now() - entry.timestamp > this.config.maxAge) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      if (this.config.enableStats) {
        this.stats.missCount++;
      }
      return null;
    }

    // Update access tracking
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    this.updateAccessOrder(key);

    if (this.config.enableStats) {
      this.stats.hitCount++;
    }

    return entry.value;
  }

  /**
   * Set cached value with key (instance method)
   */
  private setCached(key: string, value: string): void {
    const now = Date.now();

    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    // Create or update entry
    const entry: CacheEntry = {
      value,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now
    };

    this.cache.set(key, entry);
    this.updateAccessOrder(key);
  }

  /**
   * Clear all cached entries (instance method)
   */
  private clearCache(): void {
    this.cache.clear();
    this.accessOrder = [];
    
    // Reset statistics
    this.stats = {
      hitCount: 0,
      missCount: 0,
      evictionCount: 0,
      totalRequests: 0
    };
  }

  /**
   * Get cache statistics (instance method)
   */
  private getStatistics(): CacheStats {
    const totalRequests = this.stats.hitCount + this.stats.missCount;
    const hitRate = totalRequests > 0 ? this.stats.hitCount / totalRequests : 0;
    
    // Estimate memory usage (rough calculation)
    let memoryUsage = 0;
    for (const [key, entry] of this.cache) {
      memoryUsage += key.length * 2; // UTF-16 characters
      memoryUsage += entry.value.length * 2; // SVG content
      memoryUsage += 32; // Estimated overhead for entry object
    }

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitCount: this.stats.hitCount,
      missCount: this.stats.missCount,
      hitRate: Math.round(hitRate * 100) / 100, // Round to 2 decimal places
      totalRequests: this.stats.totalRequests,
      evictionCount: this.stats.evictionCount,
      memoryUsage
    };
  }

  /**
   * Update cache configuration
   */
  private updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // If maxSize was reduced, evict entries if necessary
    while (this.cache.size > this.config.maxSize) {
      this.evictLRU();
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;

    const lruKey = this.accessOrder[0];
    this.cache.delete(lruKey);
    this.removeFromAccessOrder(lruKey);
    
    if (this.config.enableStats) {
      this.stats.evictionCount++;
    }
  }

  /**
   * Update access order for LRU tracking
   */
  private updateAccessOrder(key: string): void {
    // Remove key from current position
    this.removeFromAccessOrder(key);
    
    // Add key to end (most recently used)
    this.accessOrder.push(key);
  }

  /**
   * Remove key from access order array
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Generate cache key for asset parameters
 */
export function generateCacheKey(type: string, ...params: (string | number)[]): string {
  return `${type}:${params.join(':')}`;
}

/**
 * Check if cache is enabled and available
 */
export function isCacheAvailable(): boolean {
  try {
    AssetCache.getInstance();
    return true;
  } catch {
    return false;
  }
}

/**
 * Warm cache with common assets
 */
export function warmCache(assets: Array<{ key: string; value: string }>): void {
  assets.forEach(({ key, value }) => {
    AssetCache.set(key, value);
  });
}

/**
 * Get cache performance metrics
 */
export function getCachePerformance(): {
  efficiency: 'excellent' | 'good' | 'fair' | 'poor';
  recommendation: string;
} {
  const stats = AssetCache.getStats();
  
  if (stats.hitRate >= 0.9) {
    return {
      efficiency: 'excellent',
      recommendation: 'Cache is performing excellently. No action needed.'
    };
  } else if (stats.hitRate >= 0.7) {
    return {
      efficiency: 'good',
      recommendation: 'Cache is performing well. Consider warming cache with common assets.'
    };
  } else if (stats.hitRate >= 0.5) {
    return {
      efficiency: 'fair',
      recommendation: 'Cache hit rate could be improved. Consider increasing cache size or TTL.'
    };
  } else {
    return {
      efficiency: 'poor',
      recommendation: 'Cache hit rate is low. Review caching strategy and consider optimization.'
    };
  }
}

// ===== DEFAULT EXPORT =====

export default AssetCache;
