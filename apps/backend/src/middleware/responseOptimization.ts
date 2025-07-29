/**
 * API Response Optimization Middleware
 * Implements caching, compression, and response time optimization
 */

import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { logger } from '../utils/logger';
import { envValidator } from '../utils/envValidator';

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum cache size in MB
  enabled: boolean;
  excludePatterns: RegExp[];
  includePatterns: RegExp[];
}

export interface ResponseMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  slowQueries: number;
}

export class ResponseOptimizer {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private config: CacheConfig;
  private metrics: ResponseMetrics;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 300, // 5 minutes default
      maxSize: 100, // 100MB default
      enabled: !envValidator.isDevelopment(), // Disabled in development
      excludePatterns: [
        /\/auth\//,
        /\/admin\//,
        /\/user\//,
        /\?.*timestamp/,
        /\?.*random/
      ],
      includePatterns: [
        /\/api\/v2\/blockchain\/overview/,
        /\/api\/v2\/blockchain\/prices/,
        /\/api\/v2\/blockchain\/defi/,
        /\/health/
      ],
      ...config
    };

    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      slowQueries: 0
    };

    this.startCleanup();
    logger.info('ResponseOptimizer initialized', { config: this.config });
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      this.metrics.totalRequests++;

      // Skip caching if disabled or excluded
      if (!this.config.enabled || this.shouldExclude(req)) {
        return this.trackResponseTime(req, res, next, startTime);
      }

      // Generate cache key
      const cacheKey = this.generateCacheKey(req);
      
      // Check cache
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        this.metrics.cacheHits++;
        
        // Set cache headers
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey.substring(0, 16) + '...',
          'Cache-Control': `public, max-age=${cached.ttl}`,
          'ETag': this.generateETag(cached.data)
        });

        const responseTime = Date.now() - startTime;
        this.updateAverageResponseTime(responseTime);

        logger.debug('Cache hit', {
          path: req.path,
          cacheKey: cacheKey.substring(0, 16),
          responseTime
        });

        return res.json(cached.data);
      }

      this.metrics.cacheMisses++;

      // Intercept response
      const originalJson = res.json;
      res.json = (data: any) => {
        const responseTime = Date.now() - startTime;
        this.updateAverageResponseTime(responseTime);

        // Track slow queries
        if (responseTime > 1000) {
          this.metrics.slowQueries++;
          logger.warn('Slow API response', {
            path: req.path,
            method: req.method,
            responseTime,
            query: req.query
          });
        }

        // Cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.setCache(cacheKey, data, this.config.ttl);
          
          res.set({
            'X-Cache': 'MISS',
            'X-Cache-Key': cacheKey.substring(0, 16) + '...',
            'Cache-Control': `public, max-age=${this.config.ttl}`,
            'ETag': this.generateETag(data)
          });
        }

        // Add performance headers
        res.set({
          'X-Response-Time': `${responseTime}ms`,
          'X-Request-ID': (req as any).id || 'unknown'
        });

        return originalJson.call(res, data);
      };

      this.trackResponseTime(req, res, next, startTime);
    };
  }

  private shouldExclude(req: Request): boolean {
    const path = req.path;
    const method = req.method;

    // Exclude non-GET requests
    if (method !== 'GET') {
      return true;
    }

    // Check exclude patterns
    if (this.config.excludePatterns.some(pattern => pattern.test(path))) {
      return true;
    }

    // Check include patterns (if any)
    if (this.config.includePatterns.length > 0) {
      return !this.config.includePatterns.some(pattern => pattern.test(path));
    }

    return false;
  }

  private generateCacheKey(req: Request): string {
    const { path, query, headers } = req;
    
    // Include relevant headers that might affect response
    const relevantHeaders = {
      'accept': headers.accept,
      'accept-language': headers['accept-language'],
      'user-agent': headers['user-agent']?.substring(0, 50) // Truncate for consistency
    };

    const keyData = {
      path,
      query,
      headers: relevantHeaders
    };

    return createHash('sha256')
      .update(JSON.stringify(keyData))
      .digest('hex');
  }

  private generateETag(data: any): string {
    return createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  private getFromCache(key: string): { data: any; ttl: number } | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    const now = Date.now();
    const age = (now - cached.timestamp) / 1000;

    if (age > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return {
      data: cached.data,
      ttl: cached.ttl - Math.floor(age)
    };
  }

  private setCache(key: string, data: any, ttl: number): void {
    // Check cache size limit
    if (this.getCacheSizeMB() > this.config.maxSize) {
      this.evictOldEntries();
    }

    this.cache.set(key, {
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      timestamp: Date.now(),
      ttl
    });

    logger.debug('Data cached', {
      key: key.substring(0, 16),
      ttl,
      cacheSize: this.cache.size
    });
  }

  private getCacheSizeMB(): number {
    let totalSize = 0;
    
    for (const [key, value] of this.cache) {
      totalSize += key.length;
      totalSize += JSON.stringify(value).length;
    }

    return totalSize / (1024 * 1024); // Convert to MB
  }

  private evictOldEntries(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25);
    
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }

    logger.info('Cache eviction completed', {
      removedEntries: toRemove,
      remainingEntries: this.cache.size,
      cacheSizeMB: this.getCacheSizeMB()
    });
  }

  private updateAverageResponseTime(responseTime: number): void {
    const currentAvg = this.metrics.averageResponseTime;
    const totalRequests = this.metrics.totalRequests;
    
    this.metrics.averageResponseTime = 
      (currentAvg * (totalRequests - 1) + responseTime) / totalRequests;
  }

  private trackResponseTime(req: Request, res: Response, next: NextFunction, startTime: number): void {
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      this.updateAverageResponseTime(responseTime);

      if (responseTime > 1000) {
        this.metrics.slowQueries++;
      }

      res.set('X-Response-Time', `${responseTime}ms`);
    });

    next();
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 60000); // Every minute
  }

  private performCleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, value] of this.cache) {
      const age = (now - value.timestamp) / 1000;
      
      if (age > value.ttl) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.debug('Cache cleanup completed', {
        removedEntries: removedCount,
        remainingEntries: this.cache.size,
        cacheSizeMB: this.getCacheSizeMB()
      });
    }
  }

  public getMetrics(): ResponseMetrics & { cacheSize: number; cacheSizeMB: number } {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      cacheSizeMB: this.getCacheSizeMB()
    };
  }

  public clearCache(): void {
    this.cache.clear();
    logger.info('Cache cleared manually');
  }

  public shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
    logger.info('ResponseOptimizer shutdown complete');
  }
}

// Export singleton instance
export const responseOptimizer = new ResponseOptimizer();

// Export middleware function
export const optimizeResponses = () => responseOptimizer.middleware();
