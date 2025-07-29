/**
 * Memory Optimization Service
 * Monitors and optimizes memory usage, prevents memory leaks
 */

import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

export interface MemoryStats {
  rss: number; // Resident Set Size
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
  heapUsedPercentage: number;
  gcCount: number;
  gcDuration: number;
}

export interface MemoryThresholds {
  warning: number; // MB
  critical: number; // MB
  maxHeapUsed: number; // Percentage
}

export interface OptimizationConfig {
  monitoringInterval: number; // milliseconds
  gcInterval: number; // milliseconds
  enableAutoGC: boolean;
  enableMemoryLeakDetection: boolean;
  maxObjectPoolSize: number;
  thresholds: MemoryThresholds;
}

export class MemoryOptimizer extends EventEmitter {
  private config: OptimizationConfig;
  private stats: MemoryStats;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private gcInterval: NodeJS.Timeout | null = null;
  private objectPools: Map<string, any[]> = new Map();
  private memoryHistory: MemoryStats[] = [];
  private maxHistorySize = 100;
  private gcStartTime = 0;

  constructor(config: Partial<OptimizationConfig> = {}) {
    super();
    
    this.config = {
      monitoringInterval: 30000, // 30 seconds
      gcInterval: 300000, // 5 minutes
      enableAutoGC: true,
      enableMemoryLeakDetection: true,
      maxObjectPoolSize: 1000,
      thresholds: {
        warning: 512, // 512 MB
        critical: 1024, // 1 GB
        maxHeapUsed: 85 // 85%
      },
      ...config
    };

    this.stats = this.getCurrentMemoryStats();
    
    this.startMonitoring();
    this.setupGarbageCollection();
    
    logger.info('MemoryOptimizer initialized', {
      config: this.config,
      initialMemory: this.formatMemoryStats(this.stats)
    });
  }

  /**
   * Start memory monitoring
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.performMemoryCheck();
    }, this.config.monitoringInterval);
  }

  /**
   * Setup garbage collection monitoring and automation
   */
  private setupGarbageCollection(): void {
    if (global.gc) {
      // Monitor GC events if available
      process.on('beforeExit', () => {
        this.performGarbageCollection();
      });

      if (this.config.enableAutoGC) {
        this.gcInterval = setInterval(() => {
          this.performGarbageCollection();
        }, this.config.gcInterval);
      }
    } else {
      logger.warn('Garbage collection not exposed. Run with --expose-gc for better memory optimization');
    }
  }

  /**
   * Perform memory check and optimization
   */
  private performMemoryCheck(): void {
    const currentStats = this.getCurrentMemoryStats();
    this.stats = currentStats;
    
    // Add to history
    this.memoryHistory.push(currentStats);
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift();
    }

    // Check thresholds
    this.checkMemoryThresholds(currentStats);

    // Detect memory leaks
    if (this.config.enableMemoryLeakDetection) {
      this.detectMemoryLeaks();
    }

    // Emit memory stats
    this.emit('memoryStats', currentStats);

    logger.debug('Memory check completed', this.formatMemoryStats(currentStats));
  }

  /**
   * Get current memory statistics
   */
  private getCurrentMemoryStats(): MemoryStats {
    const memUsage = process.memoryUsage();
    
    return {
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers,
      heapUsedPercentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
      gcCount: this.stats?.gcCount || 0,
      gcDuration: this.stats?.gcDuration || 0
    };
  }

  /**
   * Check memory thresholds and emit warnings
   */
  private checkMemoryThresholds(stats: MemoryStats): void {
    const heapUsedMB = stats.heapUsed / (1024 * 1024);
    const rssMB = stats.rss / (1024 * 1024);

    if (rssMB > this.config.thresholds.critical) {
      logger.error('Critical memory usage detected', {
        rss: `${rssMB.toFixed(2)} MB`,
        threshold: `${this.config.thresholds.critical} MB`
      });
      this.emit('criticalMemory', stats);
      
      // Force garbage collection
      this.performGarbageCollection();
      
    } else if (rssMB > this.config.thresholds.warning) {
      logger.warn('High memory usage detected', {
        rss: `${rssMB.toFixed(2)} MB`,
        threshold: `${this.config.thresholds.warning} MB`
      });
      this.emit('highMemory', stats);
    }

    if (stats.heapUsedPercentage > this.config.thresholds.maxHeapUsed) {
      logger.warn('High heap usage detected', {
        heapUsed: `${stats.heapUsedPercentage.toFixed(2)}%`,
        threshold: `${this.config.thresholds.maxHeapUsed}%`
      });
      this.emit('highHeapUsage', stats);
    }
  }

  /**
   * Detect potential memory leaks
   */
  private detectMemoryLeaks(): void {
    if (this.memoryHistory.length < 10) return;

    const recent = this.memoryHistory.slice(-10);
    const trend = this.calculateMemoryTrend(recent);

    // Check for consistent memory growth
    if (trend.slope > 1024 * 1024) { // 1MB per check
      logger.warn('Potential memory leak detected', {
        trend: `${(trend.slope / (1024 * 1024)).toFixed(2)} MB per check`,
        correlation: trend.correlation.toFixed(3)
      });
      this.emit('memoryLeak', { trend, recent });
    }
  }

  /**
   * Calculate memory usage trend
   */
  private calculateMemoryTrend(data: MemoryStats[]): { slope: number; correlation: number } {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data.map(stat => stat.heapUsed);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return { slope, correlation };
  }

  /**
   * Perform garbage collection
   */
  private performGarbageCollection(): void {
    if (!global.gc) return;

    this.gcStartTime = Date.now();
    
    try {
      global.gc();
      
      const gcDuration = Date.now() - this.gcStartTime;
      this.stats.gcCount++;
      this.stats.gcDuration = gcDuration;

      logger.debug('Garbage collection completed', {
        duration: `${gcDuration}ms`,
        totalGCs: this.stats.gcCount
      });

      this.emit('garbageCollection', { duration: gcDuration, count: this.stats.gcCount });

    } catch (error) {
      logger.error('Garbage collection failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Object pooling for memory optimization
   */
  public getPooledObject<T>(poolName: string, factory: () => T): T {
    let pool = this.objectPools.get(poolName);
    
    if (!pool) {
      pool = [];
      this.objectPools.set(poolName, pool);
    }

    if (pool.length > 0) {
      return pool.pop() as T;
    }

    return factory();
  }

  /**
   * Return object to pool
   */
  public returnToPool<T>(poolName: string, obj: T, reset?: (obj: T) => void): void {
    let pool = this.objectPools.get(poolName);
    
    if (!pool) {
      pool = [];
      this.objectPools.set(poolName, pool);
    }

    if (pool.length < this.config.maxObjectPoolSize) {
      if (reset) {
        reset(obj);
      }
      pool.push(obj);
    }
  }

  /**
   * Clear object pools
   */
  public clearPools(): void {
    this.objectPools.clear();
    logger.info('Object pools cleared');
  }

  /**
   * Optimize large arrays by chunking
   */
  public optimizeArray<T>(array: T[], chunkSize: number = 1000): T[][] {
    const chunks: T[][] = [];
    
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }

    return chunks;
  }

  /**
   * Process large datasets in chunks to prevent memory spikes
   */
  public async processInChunks<T, R>(
    data: T[],
    processor: (chunk: T[]) => Promise<R[]>,
    chunkSize: number = 1000,
    delay: number = 0
  ): Promise<R[]> {
    const results: R[] = [];
    const chunks = this.optimizeArray(data, chunkSize);

    for (const chunk of chunks) {
      const chunkResults = await processor(chunk);
      results.push(...chunkResults);

      // Optional delay to prevent overwhelming the system
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Force garbage collection if memory is high
      if (this.stats.heapUsedPercentage > this.config.thresholds.maxHeapUsed) {
        this.performGarbageCollection();
      }
    }

    return results;
  }

  /**
   * Create weak references for large objects
   */
  public createWeakRef<T extends object>(obj: T): WeakRef<T> {
    return new WeakRef(obj);
  }

  /**
   * Format memory statistics for logging
   */
  private formatMemoryStats(stats: MemoryStats): any {
    return {
      rss: `${(stats.rss / (1024 * 1024)).toFixed(2)} MB`,
      heapTotal: `${(stats.heapTotal / (1024 * 1024)).toFixed(2)} MB`,
      heapUsed: `${(stats.heapUsed / (1024 * 1024)).toFixed(2)} MB`,
      heapUsedPercentage: `${stats.heapUsedPercentage.toFixed(2)}%`,
      external: `${(stats.external / (1024 * 1024)).toFixed(2)} MB`,
      arrayBuffers: `${(stats.arrayBuffers / (1024 * 1024)).toFixed(2)} MB`,
      gcCount: stats.gcCount,
      gcDuration: `${stats.gcDuration}ms`
    };
  }

  /**
   * Get current memory statistics
   */
  public getStats(): MemoryStats & {
    poolCount: number;
    historySize: number;
    trend?: { slope: number; correlation: number };
  } {
    const trend = this.memoryHistory.length >= 10 ?
      this.calculateMemoryTrend(this.memoryHistory.slice(-10)) : undefined;

    const result: MemoryStats & {
      poolCount: number;
      historySize: number;
      trend?: { slope: number; correlation: number };
    } = {
      ...this.stats,
      poolCount: this.objectPools.size,
      historySize: this.memoryHistory.length,
    };

    if (trend) {
      result.trend = trend;
    }

    return result;
  }

  /**
   * Force memory optimization
   */
  public async optimize(): Promise<void> {
    logger.info('Starting memory optimization...');

    // Clear object pools
    this.clearPools();

    // Force garbage collection
    this.performGarbageCollection();

    // Wait for GC to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    const newStats = this.getCurrentMemoryStats();
    const memoryFreed = this.stats.heapUsed - newStats.heapUsed;

    logger.info('Memory optimization completed', {
      memoryFreed: `${(memoryFreed / (1024 * 1024)).toFixed(2)} MB`,
      newStats: this.formatMemoryStats(newStats)
    });

    this.emit('optimizationComplete', { memoryFreed, newStats });
  }

  /**
   * Shutdown memory optimizer
   */
  public shutdown(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
    }

    this.clearPools();
    this.removeAllListeners();

    logger.info('MemoryOptimizer shutdown complete');
  }
}

// Export singleton instance
export const memoryOptimizer = new MemoryOptimizer();
