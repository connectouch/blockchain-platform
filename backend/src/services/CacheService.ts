/**
 * Comprehensive Caching Service
 * Multi-layer caching with Redis and in-memory fallback
 */

import { redisClient } from '@/config/database';
import { logger } from '@/utils/logger';
import { envValidator } from '@/utils/envValidator';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  useMemoryFallback?: boolean;
  compress?: boolean;
  tags?: string[]; // For cache invalidation
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  memoryUsage: number;
  redisConnected: boolean;
}

export class CacheService {
  private memoryCache: Map<string, { data: any; expires: number; tags: string[] }> = new Map();
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private maxMemorySize: number = 100 * 1024 * 1024; // 100MB
  private defaultTTL: number = 300; // 5 minutes

  constructor() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      memoryUsage: 0,
      redisConnected: false
    };

    this.startCleanup();
    this.updateRedisStatus();
    
    logger.info('CacheService initialized', {
      redisAvailable: !!redisClient,
      maxMemorySize: this.maxMemorySize,
      defaultTTL: this.defaultTTL
    });
  }

  /**
   * Get value from cache (Redis first, then memory fallback)
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first
      if (redisClient && this.stats.redisConnected) {
        try {
          const value = await redisClient.get(key);
          if (value !== null) {
            this.stats.hits++;
            logger.debug('Cache hit (Redis)', { key: key.substring(0, 20) });
            return JSON.parse(value);
          }
        } catch (error) {
          logger.warn('Redis get error, falling back to memory', { 
            key: key.substring(0, 20), 
            error: error.message 
          });
          this.stats.errors++;
        }
      }

      // Fallback to memory cache
      const memoryItem = this.memoryCache.get(key);
      if (memoryItem && memoryItem.expires > Date.now()) {
        this.stats.hits++;
        logger.debug('Cache hit (Memory)', { key: key.substring(0, 20) });
        return memoryItem.data;
      }

      // Remove expired memory cache item
      if (memoryItem) {
        this.memoryCache.delete(key);
      }

      this.stats.misses++;
      return null;

    } catch (error) {
      logger.error('Cache get error', { key: key.substring(0, 20), error: error.message });
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Set value in cache (Redis and memory)
   */
  public async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const ttl = options.ttl || this.defaultTTL;
      const serializedValue = JSON.stringify(value);
      const tags = options.tags || [];

      // Set in Redis
      if (redisClient && this.stats.redisConnected) {
        try {
          await redisClient.setEx(key, ttl, serializedValue);
          
          // Store tags for invalidation
          if (tags.length > 0) {
            for (const tag of tags) {
              await redisClient.sAdd(`tag:${tag}`, key);
              await redisClient.expire(`tag:${tag}`, ttl);
            }
          }
        } catch (error) {
          logger.warn('Redis set error', { 
            key: key.substring(0, 20), 
            error: error.message 
          });
          this.stats.errors++;
        }
      }

      // Set in memory cache (if enabled or Redis unavailable)
      if (options.useMemoryFallback !== false) {
        // Check memory limit
        if (this.getMemoryUsage() > this.maxMemorySize) {
          this.evictMemoryCache();
        }

        this.memoryCache.set(key, {
          data: value,
          expires: Date.now() + (ttl * 1000),
          tags
        });
      }

      this.stats.sets++;
      logger.debug('Cache set', { 
        key: key.substring(0, 20), 
        ttl, 
        tags: tags.length 
      });

      return true;

    } catch (error) {
      logger.error('Cache set error', { key: key.substring(0, 20), error: error.message });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  public async delete(key: string): Promise<boolean> {
    try {
      let deleted = false;

      // Delete from Redis
      if (redisClient && this.stats.redisConnected) {
        try {
          const result = await redisClient.del(key);
          deleted = result > 0;
        } catch (error) {
          logger.warn('Redis delete error', { 
            key: key.substring(0, 20), 
            error: error.message 
          });
          this.stats.errors++;
        }
      }

      // Delete from memory cache
      const memoryDeleted = this.memoryCache.delete(key);
      deleted = deleted || memoryDeleted;

      if (deleted) {
        this.stats.deletes++;
        logger.debug('Cache delete', { key: key.substring(0, 20) });
      }

      return deleted;

    } catch (error) {
      logger.error('Cache delete error', { key: key.substring(0, 20), error: error.message });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Invalidate cache by tags
   */
  public async invalidateByTag(tag: string): Promise<number> {
    try {
      let invalidatedCount = 0;

      // Invalidate in Redis
      if (redisClient && this.stats.redisConnected) {
        try {
          const keys = await redisClient.sMembers(`tag:${tag}`);
          if (keys.length > 0) {
            const deleted = await redisClient.del(keys);
            invalidatedCount += deleted;
            await redisClient.del(`tag:${tag}`);
          }
        } catch (error) {
          logger.warn('Redis tag invalidation error', { tag, error: error.message });
          this.stats.errors++;
        }
      }

      // Invalidate in memory cache
      for (const [key, item] of this.memoryCache) {
        if (item.tags.includes(tag)) {
          this.memoryCache.delete(key);
          invalidatedCount++;
        }
      }

      logger.info('Cache invalidated by tag', { tag, count: invalidatedCount });
      return invalidatedCount;

    } catch (error) {
      logger.error('Cache tag invalidation error', { tag, error: error.message });
      this.stats.errors++;
      return 0;
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  public async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Generate value and cache it
    try {
      const value = await factory();
      await this.set(key, value, options);
      return value;
    } catch (error) {
      logger.error('Cache factory error', { key: key.substring(0, 20), error: error.message });
      throw error;
    }
  }

  /**
   * Batch get multiple keys
   */
  public async mget<T>(keys: string[]): Promise<Map<string, T>> {
    const results = new Map<string, T>();

    // Try Redis first for all keys
    if (redisClient && this.stats.redisConnected && keys.length > 0) {
      try {
        const values = await redisClient.mGet(keys);
        for (let i = 0; i < keys.length; i++) {
          if (values[i] !== null) {
            results.set(keys[i], JSON.parse(values[i]!));
            this.stats.hits++;
          }
        }
      } catch (error) {
        logger.warn('Redis mget error', { keyCount: keys.length, error: error.message });
        this.stats.errors++;
      }
    }

    // Check memory cache for missing keys
    for (const key of keys) {
      if (!results.has(key)) {
        const memoryItem = this.memoryCache.get(key);
        if (memoryItem && memoryItem.expires > Date.now()) {
          results.set(key, memoryItem.data);
          this.stats.hits++;
        } else {
          this.stats.misses++;
        }
      }
    }

    return results;
  }

  /**
   * Clear all cache
   */
  public async clear(): Promise<void> {
    try {
      // Clear Redis
      if (redisClient && this.stats.redisConnected) {
        try {
          await redisClient.flushDb();
        } catch (error) {
          logger.warn('Redis clear error', { error: error.message });
          this.stats.errors++;
        }
      }

      // Clear memory cache
      this.memoryCache.clear();

      logger.info('Cache cleared');

    } catch (error) {
      logger.error('Cache clear error', { error: error.message });
      this.stats.errors++;
    }
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats & { memoryKeys: number; hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      memoryKeys: this.memoryCache.size,
      memoryUsage: this.getMemoryUsage(),
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  private getMemoryUsage(): number {
    let size = 0;
    for (const [key, value] of this.memoryCache) {
      size += key.length * 2; // UTF-16
      size += JSON.stringify(value).length * 2;
    }
    return size;
  }

  private evictMemoryCache(): void {
    const entries = Array.from(this.memoryCache.entries());
    
    // Sort by expiration time (oldest first)
    entries.sort((a, b) => a[1].expires - b[1].expires);
    
    // Remove oldest 25%
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.memoryCache.delete(entries[i][0]);
    }

    logger.debug('Memory cache evicted', { 
      removed: toRemove, 
      remaining: this.memoryCache.size 
    });
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 60000); // Every minute
  }

  private performCleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, item] of this.memoryCache) {
      if (item.expires <= now) {
        this.memoryCache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.debug('Memory cache cleanup', { removed: removedCount });
    }

    this.updateRedisStatus();
  }

  private async updateRedisStatus(): Promise<void> {
    if (redisClient) {
      try {
        await redisClient.ping();
        this.stats.redisConnected = true;
      } catch (error) {
        this.stats.redisConnected = false;
      }
    } else {
      this.stats.redisConnected = false;
    }
  }

  public shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.memoryCache.clear();
    logger.info('CacheService shutdown complete');
  }
}

// Export singleton instance
export const cacheService = new CacheService();
