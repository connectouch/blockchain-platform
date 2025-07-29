/**
 * Cache Utility Functions
 * Provides caching utilities and cache manager for services
 */

import { cacheService, CacheOptions } from '../services/CacheService';
import { logger } from '../utils/logger';
import { createHash } from 'crypto';

export interface CacheManagerOptions extends CacheOptions {
  keyPrefix?: string;
  namespace?: string;
}

/**
 * Cache Manager for centralized cache operations
 */
export class CacheManagerInstance {
  private keyPrefix: string;
  private namespace: string;

  constructor(options: CacheManagerOptions = {}) {
    this.keyPrefix = options.keyPrefix || 'cache';
    this.namespace = options.namespace || 'default';
  }

  /**
   * Generate a cache key with namespace and prefix
   */
  private generateKey(key: string): string {
    return `${this.namespace}:${this.keyPrefix}:${key}`;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.generateKey(key);
    return await cacheService.get<T>(cacheKey);
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    const cacheKey = this.generateKey(key);
    return await cacheService.set(cacheKey, value, options);
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    const cacheKey = this.generateKey(key);
    return await cacheService.delete(cacheKey);
  }

  /**
   * Clear all cache entries for this namespace
   */
  async clear(): Promise<boolean> {
    const result = await cacheService.invalidateByTag(this.namespace);
    return result > 0;
  }

  /**
   * Get or set pattern - if value doesn't exist, execute function and cache result
   */
  async getOrSet<T>(
    key: string, 
    fetchFunction: () => Promise<T>, 
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFunction();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Memoize a function with caching
   */
  memoize<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options?: CacheManagerOptions
  ): T {
    const fnName = fn.name || 'anonymous';
    
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const argsHash = createHash('md5').update(JSON.stringify(args)).digest('hex');
      const cacheKey = `${fnName}:${argsHash}`;
      
      const cached = await this.get(cacheKey);
      if (cached !== null) {
        logger.debug('Memoized function cache hit', { function: fnName, key: cacheKey.substring(0, 30) });
        return cached as ReturnType<T>;
      }

      const result = await fn.apply(this, args);
      await this.set(cacheKey, result, options);
      
      logger.debug('Memoized function result cached', { function: fnName, key: cacheKey.substring(0, 30) });
      return result;
    }) as T;
  }
}

/**
 * Cache key generators for different domains
 */
export const CacheKeys = {
  user: (userId: string, operation: string) => `user:${userId}:${operation}`,
  blockchain: (network: string, address: string, operation: string) => 
    `blockchain:${network}:${address}:${operation}`,
  defi: (protocol: string, operation: string) => `defi:${protocol}:${operation}`,
  market: (symbol: string, timeframe: string) => `market:${symbol}:${timeframe}`,
  api: (endpoint: string, params?: any) => {
    const paramsHash = params ? createHash('md5').update(JSON.stringify(params)).digest('hex') : '';
    return `api:${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}:${paramsHash}`;
  }
};

/**
 * Cache decorators for easy method caching
 */
export function CacheResult(options: CacheManagerOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cacheManager = new CacheManagerInstance({
      keyPrefix: options.keyPrefix || `${target.constructor.name}.${propertyName}`,
      namespace: options.namespace || target.constructor.name,
      ...options
    });

    descriptor.value = async function (...args: any[]) {
      const argsHash = createHash('md5').update(JSON.stringify(args)).digest('hex');
      const cacheKey = `${propertyName}:${argsHash}`;

      return await cacheManager.getOrSet(cacheKey, () => method.apply(this, args), options);
    };

    return descriptor;
  };
}

/**
 * Cache invalidation decorator
 */
export function InvalidateCache(tags: string[] | ((args: any[]) => string[])) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);
      
      const tagsToInvalidate = typeof tags === 'function' ? tags(args) : tags;
      for (const tag of tagsToInvalidate) {
        await cacheService.invalidateByTag(tag);
      }

      logger.debug('Cache invalidated', { method: propertyName, tags: tagsToInvalidate });
      return result;
    };

    return descriptor;
  };
}

/**
 * Default cache manager instance
 */
export const defaultCacheManager = new CacheManagerInstance({
  keyPrefix: 'default',
  namespace: 'app'
});

/**
 * Specialized cache managers for different domains
 */
export const userCacheManager = new CacheManagerInstance({
  keyPrefix: 'user',
  namespace: 'users'
});

export const blockchainCacheManager = new CacheManagerInstance({
  keyPrefix: 'blockchain',
  namespace: 'blockchain'
});

export const defiCacheManager = new CacheManagerInstance({
  keyPrefix: 'defi',
  namespace: 'defi'
});

export const marketCacheManager = new CacheManagerInstance({
  keyPrefix: 'market',
  namespace: 'market'
});

/**
 * Static CacheManager wrapper for backward compatibility
 * This provides static methods that services expect
 */
export class StaticCacheManager {
  private static defaultInstance = defaultCacheManager;

  static async get<T>(key: string): Promise<T | null> {
    return await this.defaultInstance.get<T>(key);
  }

  static async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    return await this.defaultInstance.set(key, value, ttl ? { ttl } : {});
  }

  static async delete(key: string): Promise<boolean> {
    return await this.defaultInstance.delete(key);
  }

  static async clear(): Promise<boolean> {
    return await this.defaultInstance.clear();
  }
}

// Export as CacheManager for backward compatibility
export { StaticCacheManager as CacheManager };

/**
 * Cache warming utilities
 */
export class CacheWarmer {
  static async warmUserCache(userId: string): Promise<void> {
    logger.info('Warming user cache', { userId });
    // Implementation would depend on specific user data needs
  }

  static async warmMarketCache(): Promise<void> {
    logger.info('Warming market cache');
    // Implementation would depend on specific market data needs
  }

  static async warmBlockchainCache(network: string): Promise<void> {
    logger.info('Warming blockchain cache', { network });
    // Implementation would depend on specific blockchain data needs
  }
}

/**
 * Cache health monitoring
 */
export class CacheHealthMonitor {
  static async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    stats: any;
    issues: string[];
  }> {
    try {
      const stats = await cacheService.getStats();
      const issues: string[] = [];

      if (!stats.redisConnected) {
        issues.push('Redis connection unavailable');
      }

      if (stats.errors > 0) {
        issues.push(`${stats.errors} cache errors detected`);
      }

      const hitRate = stats.hits / (stats.hits + stats.misses) || 0;
      if (hitRate < 0.5) {
        issues.push(`Low cache hit rate: ${(hitRate * 100).toFixed(1)}%`);
      }

      const status = issues.length === 0 ? 'healthy' : 
                    issues.length <= 2 ? 'degraded' : 'unhealthy';

      return { status, stats, issues };
    } catch (error) {
      logger.error('Cache health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      return {
        status: 'unhealthy',
        stats: null,
        issues: ['Cache health check failed']
      };
    }
  }
}

export { StaticCacheManager as default };
