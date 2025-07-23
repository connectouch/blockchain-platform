/**
 * Cache Decorators
 * Easy-to-use decorators for method caching
 */

import { cacheService, CacheOptions } from '@/services/CacheService';
import { logger } from '@/utils/logger';
import { createHash } from 'crypto';

/**
 * Cache method results
 */
export function Cacheable(options: CacheOptions & { keyPrefix?: string } = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const keyPrefix = options.keyPrefix || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      try {
        // Generate cache key
        const argsHash = createHash('md5').update(JSON.stringify(args)).digest('hex');
        const cacheKey = `${keyPrefix}:${argsHash}`;

        // Try to get from cache
        const cached = await cacheService.get(cacheKey);
        if (cached !== null) {
          logger.debug('Method cache hit', { method: propertyName, key: cacheKey.substring(0, 30) });
          return cached;
        }

        // Execute method and cache result
        const result = await method.apply(this, args);
        await cacheService.set(cacheKey, result, options);
        
        logger.debug('Method result cached', { method: propertyName, key: cacheKey.substring(0, 30) });
        return result;

      } catch (error) {
        logger.error('Cache decorator error', { method: propertyName, error: error.message });
        // Fallback to original method
        return method.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * Cache invalidation decorator
 */
export function CacheEvict(options: { tags?: string[]; keys?: string[]; all?: boolean } = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        // Execute method first
        const result = await method.apply(this, args);

        // Invalidate cache
        if (options.all) {
          await cacheService.clear();
          logger.info('All cache cleared', { method: propertyName });
        } else {
          // Invalidate by tags
          if (options.tags) {
            for (const tag of options.tags) {
              const count = await cacheService.invalidateByTag(tag);
              logger.info('Cache invalidated by tag', { method: propertyName, tag, count });
            }
          }

          // Invalidate specific keys
          if (options.keys) {
            for (const key of options.keys) {
              await cacheService.delete(key);
              logger.info('Cache key deleted', { method: propertyName, key });
            }
          }
        }

        return result;

      } catch (error) {
        logger.error('Cache evict decorator error', { method: propertyName, error: error.message });
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Cache warming decorator
 */
export function CacheWarm(options: CacheOptions & { keyPrefix?: string } = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const keyPrefix = options.keyPrefix || `${target.constructor.name}.${propertyName}`;

    // Add warming method
    target[`${propertyName}Warm`] = async function (...args: any[]) {
      try {
        const argsHash = createHash('md5').update(JSON.stringify(args)).digest('hex');
        const cacheKey = `${keyPrefix}:${argsHash}`;

        // Execute method and cache result
        const result = await method.apply(this, args);
        await cacheService.set(cacheKey, result, options);
        
        logger.info('Cache warmed', { method: propertyName, key: cacheKey.substring(0, 30) });
        return result;

      } catch (error) {
        logger.error('Cache warm decorator error', { method: propertyName, error: error.message });
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Utility functions for cache key generation
 */
export class CacheKeyGenerator {
  static forUser(userId: string, operation: string, ...params: any[]): string {
    const paramsHash = createHash('md5').update(JSON.stringify(params)).digest('hex');
    return `user:${userId}:${operation}:${paramsHash}`;
  }

  static forBlockchain(network: string, operation: string, ...params: any[]): string {
    const paramsHash = createHash('md5').update(JSON.stringify(params)).digest('hex');
    return `blockchain:${network}:${operation}:${paramsHash}`;
  }

  static forAPI(endpoint: string, ...params: any[]): string {
    const paramsHash = createHash('md5').update(JSON.stringify(params)).digest('hex');
    return `api:${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}:${paramsHash}`;
  }

  static forQuery(table: string, query: any): string {
    const queryHash = createHash('md5').update(JSON.stringify(query)).digest('hex');
    return `query:${table}:${queryHash}`;
  }
}

/**
 * Cache tags for organized invalidation
 */
export const CacheTags = {
  USER: 'user',
  BLOCKCHAIN: 'blockchain',
  PRICES: 'prices',
  DEFI: 'defi',
  AI: 'ai',
  ANALYTICS: 'analytics',
  PORTFOLIO: 'portfolio',
  TRANSACTIONS: 'transactions',
  TOKENS: 'tokens',
  POOLS: 'pools'
} as const;

export type CacheTag = typeof CacheTags[keyof typeof CacheTags];
