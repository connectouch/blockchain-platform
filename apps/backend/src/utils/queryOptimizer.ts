/**
 * Query Optimization Utilities
 * Optimizes database queries and API calls for better performance
 */

import { logger } from '../utils/logger';

export interface QueryMetrics {
  totalQueries: number;
  slowQueries: number;
  averageExecutionTime: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface OptimizationConfig {
  slowQueryThreshold: number; // milliseconds
  enableQueryLogging: boolean;
  enableMetrics: boolean;
  batchSize: number;
  maxConcurrentQueries: number;
}

export class QueryOptimizer {
  private metrics: QueryMetrics;
  private config: OptimizationConfig;
  private activeQueries: Map<string, { startTime: number; query: string }> = new Map();
  private queryQueue: Array<() => Promise<any>> = [];
  private concurrentQueries = 0;

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      slowQueryThreshold: 1000, // 1 second
      enableQueryLogging: true,
      enableMetrics: true,
      batchSize: 100,
      maxConcurrentQueries: 10,
      ...config
    };

    this.metrics = {
      totalQueries: 0,
      slowQueries: 0,
      averageExecutionTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };

    logger.info('QueryOptimizer initialized', { config: this.config });
  }

  /**
   * Optimize pagination queries
   */
  public optimizePagination(page: number = 1, limit: number = 20): { offset: number; limit: number } {
    // Ensure reasonable limits
    const optimizedLimit = Math.min(Math.max(limit, 1), 100);
    const optimizedPage = Math.max(page, 1);
    const offset = (optimizedPage - 1) * optimizedLimit;

    return { offset, limit: optimizedLimit };
  }

  /**
   * Batch multiple queries for better performance
   */
  public async batchQueries<T>(queries: Array<() => Promise<T>>): Promise<T[]> {
    const batches: Array<Array<() => Promise<T>>> = [];
    
    // Split queries into batches
    for (let i = 0; i < queries.length; i += this.config.batchSize) {
      batches.push(queries.slice(i, i + this.config.batchSize));
    }

    const results: T[] = [];

    // Execute batches sequentially to avoid overwhelming the database
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(query => this.executeWithMetrics(query))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Execute query with concurrency control
   */
  public async executeWithConcurrencyControl<T>(queryFn: () => Promise<T>): Promise<T> {
    if (this.concurrentQueries >= this.config.maxConcurrentQueries) {
      // Queue the query
      return new Promise((resolve, reject) => {
        this.queryQueue.push(async () => {
          try {
            const result = await this.executeWithMetrics(queryFn);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
    }

    return this.executeWithMetrics(queryFn);
  }

  /**
   * Execute query with performance metrics
   */
  public async executeWithMetrics<T>(queryFn: () => Promise<T>, queryName?: string): Promise<T> {
    const queryId = Math.random().toString(36).substr(2, 9);
    const startTime = Date.now();
    
    this.concurrentQueries++;
    this.metrics.totalQueries++;

    if (queryName && this.config.enableQueryLogging) {
      this.activeQueries.set(queryId, { startTime, query: queryName });
      logger.debug('Query started', { queryId, queryName });
    }

    try {
      const result = await queryFn();
      const executionTime = Date.now() - startTime;

      this.updateMetrics(executionTime);

      if (executionTime > this.config.slowQueryThreshold) {
        this.metrics.slowQueries++;
        logger.warn('Slow query detected', {
          queryId,
          queryName,
          executionTime,
          threshold: this.config.slowQueryThreshold
        });
      }

      if (this.config.enableQueryLogging) {
        logger.debug('Query completed', {
          queryId,
          queryName,
          executionTime,
          status: 'success'
        });
      }

      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      logger.error('Query failed', {
        queryId,
        queryName,
        executionTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;

    } finally {
      this.concurrentQueries--;
      this.activeQueries.delete(queryId);

      // Process queued queries
      if (this.queryQueue.length > 0 && this.concurrentQueries < this.config.maxConcurrentQueries) {
        const nextQuery = this.queryQueue.shift();
        if (nextQuery) {
          setImmediate(() => nextQuery());
        }
      }
    }
  }

  /**
   * Optimize array operations for large datasets
   */
  public optimizeArrayOperations<T>(
    array: T[],
    operation: (item: T) => any,
    chunkSize: number = 1000
  ): any[] {
    const results: any[] = [];
    
    // Process in chunks to avoid blocking the event loop
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      const chunkResults = chunk.map(operation);
      results.push(...chunkResults);
      
      // Yield control back to event loop
      if (i + chunkSize < array.length) {
        setImmediate(() => {});
      }
    }

    return results;
  }

  /**
   * Debounce function for reducing API calls
   */
  public debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    let timeoutId: NodeJS.Timeout;
    let resolvePromise: (value: ReturnType<T>) => void;
    let rejectPromise: (reason: any) => void;

    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new Promise((resolve, reject) => {
        clearTimeout(timeoutId);
        
        resolvePromise = resolve;
        rejectPromise = reject;

        timeoutId = setTimeout(async () => {
          try {
            const result = await func(...args);
            resolvePromise(result);
          } catch (error) {
            rejectPromise(error);
          }
        }, delay);
      });
    };
  }

  /**
   * Throttle function for rate limiting
   */
  public throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => ReturnType<T> | undefined {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>): ReturnType<T> | undefined => {
      if (!inThrottle) {
        const result = func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
        return result;
      }
      return undefined;
    };
  }

  /**
   * Memoization for expensive computations
   */
  public memoize<T extends (...args: any[]) => any>(
    func: T,
    maxCacheSize: number = 100
  ): T {
    const cache = new Map<string, { result: ReturnType<T>; timestamp: number }>();
    
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = JSON.stringify(args);
      const cached = cache.get(key);
      
      if (cached) {
        this.metrics.cacheHits++;
        return cached.result;
      }

      this.metrics.cacheMisses++;
      const result = func(...args);
      
      // Manage cache size
      if (cache.size >= maxCacheSize) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey !== undefined) {
          cache.delete(oldestKey);
        }
      }
      
      cache.set(key, { result, timestamp: Date.now() });
      return result;
    }) as T;
  }

  /**
   * Optimize object property access
   */
  public optimizePropertyAccess<T>(
    objects: T[],
    propertyPath: string
  ): any[] {
    const properties = propertyPath.split('.');
    
    return objects.map(obj => {
      let value: any = obj;
      for (const prop of properties) {
        value = value?.[prop as keyof typeof value];
        if (value === undefined) break;
      }
      return value;
    });
  }

  private updateMetrics(executionTime: number): void {
    const currentAvg = this.metrics.averageExecutionTime;
    const totalQueries = this.metrics.totalQueries;
    
    this.metrics.averageExecutionTime = 
      (currentAvg * (totalQueries - 1) + executionTime) / totalQueries;
  }

  public getMetrics(): QueryMetrics & { 
    activeQueries: number; 
    queuedQueries: number;
    concurrentQueries: number;
  } {
    return {
      ...this.metrics,
      activeQueries: this.activeQueries.size,
      queuedQueries: this.queryQueue.length,
      concurrentQueries: this.concurrentQueries
    };
  }

  public getSlowQueries(): Array<{ queryId: string; query: string; duration: number }> {
    const now = Date.now();
    const slowQueries: Array<{ queryId: string; query: string; duration: number }> = [];

    for (const [queryId, { startTime, query }] of this.activeQueries) {
      const duration = now - startTime;
      if (duration > this.config.slowQueryThreshold) {
        slowQueries.push({ queryId, query, duration });
      }
    }

    return slowQueries;
  }

  public clearCache(): void {
    // This would clear any internal caches if implemented
    logger.info('Query optimizer cache cleared');
  }
}

// Export singleton instance
export const queryOptimizer = new QueryOptimizer();
