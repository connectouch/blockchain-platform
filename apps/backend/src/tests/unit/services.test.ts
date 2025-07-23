/**
 * Unit Tests for Core Services
 * Tests individual service components in isolation
 */

import { CacheService } from '../../services/CacheService';
import { MemoryOptimizer } from '../../services/MemoryOptimizer';
import { ResponseOptimizer } from '../../middleware/responseOptimization';
import { QueryOptimizer } from '../../utils/queryOptimizer';
import { PortManager } from '../../config/ports';

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
  });

  afterEach(() => {
    cacheService.shutdown();
  });

  describe('Basic Operations', () => {
    test('should set and get values', async () => {
      const key = 'test-key';
      const value = { data: 'test-value', number: 42 };

      await cacheService.set(key, value);
      const retrieved = await cacheService.get(key);

      expect(retrieved).toEqual(value);
    });

    test('should return null for non-existent keys', async () => {
      const result = await cacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    test('should delete values', async () => {
      const key = 'delete-test';
      const value = { data: 'to-be-deleted' };

      await cacheService.set(key, value);
      const deleted = await cacheService.delete(key);
      const retrieved = await cacheService.get(key);

      expect(deleted).toBe(true);
      expect(retrieved).toBeNull();
    });
  });

  describe('TTL and Expiration', () => {
    test('should respect TTL', async () => {
      const key = 'ttl-test';
      const value = { data: 'expires' };

      await cacheService.set(key, value, { ttl: 1 });
      
      // Should exist immediately
      let retrieved = await cacheService.get(key);
      expect(retrieved).toEqual(value);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      retrieved = await cacheService.get(key);
      expect(retrieved).toBeNull();
    });
  });

  describe('Batch Operations', () => {
    test('should handle multiple get operations', async () => {
      const keys = ['key1', 'key2', 'key3'];
      const values = [
        { data: 'value1' },
        { data: 'value2' },
        { data: 'value3' }
      ];

      // Set values
      for (let i = 0; i < keys.length; i++) {
        await cacheService.set(keys[i], values[i]);
      }

      // Get multiple values
      const results = await cacheService.mget(keys);

      expect(results.size).toBe(3);
      expect(results.get('key1')).toEqual(values[0]);
      expect(results.get('key2')).toEqual(values[1]);
      expect(results.get('key3')).toEqual(values[2]);
    });
  });

  describe('Tag-based Invalidation', () => {
    test('should invalidate by tags', async () => {
      const keys = ['tagged1', 'tagged2', 'untagged'];
      const tag = 'test-tag';

      await cacheService.set(keys[0], { data: 'tagged1' }, { tags: [tag] });
      await cacheService.set(keys[1], { data: 'tagged2' }, { tags: [tag] });
      await cacheService.set(keys[2], { data: 'untagged' });

      const invalidated = await cacheService.invalidateByTag(tag);
      
      expect(invalidated).toBeGreaterThan(0);
      expect(await cacheService.get(keys[0])).toBeNull();
      expect(await cacheService.get(keys[1])).toBeNull();
      expect(await cacheService.get(keys[2])).not.toBeNull();
    });
  });

  describe('Statistics', () => {
    test('should track cache statistics', async () => {
      const initialStats = cacheService.getStats();
      
      await cacheService.set('stats-test', { data: 'test' });
      await cacheService.get('stats-test'); // Hit
      await cacheService.get('non-existent'); // Miss

      const finalStats = cacheService.getStats();

      expect(finalStats.sets).toBeGreaterThan(initialStats.sets);
      expect(finalStats.hits).toBeGreaterThan(initialStats.hits);
      expect(finalStats.misses).toBeGreaterThan(initialStats.misses);
    });
  });
});

describe('MemoryOptimizer', () => {
  let memoryOptimizer: MemoryOptimizer;

  beforeEach(() => {
    memoryOptimizer = new MemoryOptimizer({
      monitoringInterval: 1000,
      enableAutoGC: false // Disable for testing
    });
  });

  afterEach(() => {
    memoryOptimizer.shutdown();
  });

  describe('Memory Statistics', () => {
    test('should provide memory statistics', () => {
      const stats = memoryOptimizer.getStats();

      expect(stats).toHaveProperty('rss');
      expect(stats).toHaveProperty('heapTotal');
      expect(stats).toHaveProperty('heapUsed');
      expect(stats).toHaveProperty('heapUsedPercentage');
      expect(typeof stats.rss).toBe('number');
      expect(typeof stats.heapUsed).toBe('number');
    });
  });

  describe('Object Pooling', () => {
    test('should manage object pools', () => {
      const poolName = 'test-pool';
      const factory = () => ({ id: Math.random(), data: [] });

      // Get object from empty pool
      const obj1 = memoryOptimizer.getPooledObject(poolName, factory);
      expect(obj1).toHaveProperty('id');

      // Return object to pool
      memoryOptimizer.returnToPool(poolName, obj1);

      // Get object from pool (should reuse)
      const obj2 = memoryOptimizer.getPooledObject(poolName, factory);
      expect(obj2).toBe(obj1);
    });

    test('should clear object pools', () => {
      const poolName = 'clear-test-pool';
      const factory = () => ({ data: 'test' });

      memoryOptimizer.getPooledObject(poolName, factory);
      memoryOptimizer.clearPools();

      const stats = memoryOptimizer.getStats();
      expect(stats.poolCount).toBe(0);
    });
  });

  describe('Array Optimization', () => {
    test('should optimize large arrays', () => {
      const largeArray = Array.from({ length: 5000 }, (_, i) => i);
      const chunks = memoryOptimizer.optimizeArray(largeArray, 1000);

      expect(chunks.length).toBe(5);
      expect(chunks[0].length).toBe(1000);
      expect(chunks[4].length).toBe(1000);
    });

    test('should process arrays in chunks', async () => {
      const data = Array.from({ length: 100 }, (_, i) => i);
      const processor = async (chunk: number[]) => 
        chunk.map(n => n * 2);

      const results = await memoryOptimizer.processInChunks(
        data, 
        processor, 
        25
      );

      expect(results.length).toBe(100);
      expect(results[0]).toBe(0);
      expect(results[50]).toBe(100);
      expect(results[99]).toBe(198);
    });
  });
});

describe('QueryOptimizer', () => {
  let queryOptimizer: QueryOptimizer;

  beforeEach(() => {
    queryOptimizer = new QueryOptimizer({
      slowQueryThreshold: 100,
      enableQueryLogging: false
    });
  });

  describe('Pagination Optimization', () => {
    test('should optimize pagination parameters', () => {
      const result1 = queryOptimizer.optimizePagination(1, 20);
      expect(result1).toEqual({ offset: 0, limit: 20 });

      const result2 = queryOptimizer.optimizePagination(3, 50);
      expect(result2).toEqual({ offset: 100, limit: 50 });

      // Test limits
      const result3 = queryOptimizer.optimizePagination(1, 200);
      expect(result3.limit).toBe(100); // Should cap at 100

      const result4 = queryOptimizer.optimizePagination(0, -5);
      expect(result4).toEqual({ offset: 0, limit: 1 }); // Should normalize
    });
  });

  describe('Query Execution with Metrics', () => {
    test('should execute queries with metrics', async () => {
      const mockQuery = jest.fn().mockResolvedValue('result');
      
      const result = await queryOptimizer.executeWithMetrics(mockQuery, 'test-query');
      
      expect(result).toBe('result');
      expect(mockQuery).toHaveBeenCalled();
      
      const metrics = queryOptimizer.getMetrics();
      expect(metrics.totalQueries).toBeGreaterThan(0);
    });

    test('should track slow queries', async () => {
      const slowQuery = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('slow-result'), 150))
      );
      
      await queryOptimizer.executeWithMetrics(slowQuery, 'slow-query');
      
      const metrics = queryOptimizer.getMetrics();
      expect(metrics.slowQueries).toBeGreaterThan(0);
    });
  });

  describe('Utility Functions', () => {
    test('should debounce function calls', async () => {
      const mockFn = jest.fn().mockResolvedValue('debounced');
      const debouncedFn = queryOptimizer.debounce(mockFn, 50);

      // Call multiple times quickly
      const promise1 = debouncedFn('arg1');
      const promise2 = debouncedFn('arg2');
      const promise3 = debouncedFn('arg3');

      const results = await Promise.all([promise1, promise2, promise3]);

      // Should only call the function once with the last arguments
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
      expect(results).toEqual(['debounced', 'debounced', 'debounced']);
    });

    test('should memoize function results', () => {
      const expensiveFn = jest.fn((x: number) => x * x);
      const memoizedFn = queryOptimizer.memoize(expensiveFn);

      const result1 = memoizedFn(5);
      const result2 = memoizedFn(5);
      const result3 = memoizedFn(10);

      expect(result1).toBe(25);
      expect(result2).toBe(25);
      expect(result3).toBe(100);
      expect(expensiveFn).toHaveBeenCalledTimes(2); // Only called for unique inputs
    });
  });
});

describe('PortManager', () => {
  let portManager: PortManager;

  beforeEach(() => {
    portManager = PortManager.getInstance();
  });

  describe('Port Configuration', () => {
    test('should provide port configuration', () => {
      const config = portManager.getConfig();
      
      expect(config).toHaveProperty('backend');
      expect(config).toHaveProperty('frontend');
      expect(config).toHaveProperty('blockchain');
      expect(config.backend).toHaveProperty('api');
      expect(typeof config.backend.api).toBe('number');
    });

    test('should get specific ports', () => {
      const apiPort = portManager.getPort('backend', 'api');
      expect(typeof apiPort).toBe('number');
      expect(apiPort).toBeGreaterThan(0);
      expect(apiPort).toBeLessThanOrEqual(65535);
    });

    test('should check port reservation', () => {
      const testPort = 9999;
      
      expect(portManager.isPortReserved(testPort)).toBe(false);
      
      portManager.reservePort(testPort, 'test');
      expect(portManager.isPortReserved(testPort)).toBe(true);
      
      portManager.releasePort(testPort);
      expect(portManager.isPortReserved(testPort)).toBe(false);
    });

    test('should find next available port', () => {
      const startPort = 8000;
      const availablePort = portManager.getNextAvailablePort(startPort);
      
      expect(availablePort).toBeGreaterThanOrEqual(startPort);
      expect(availablePort).toBeLessThanOrEqual(65535);
    });
  });

  describe('Port Validation', () => {
    test('should generate environment template', () => {
      const template = portManager.getEnvironmentTemplate();
      
      expect(template).toContain('PORT=');
      expect(template).toContain('FRONTEND_DEV_PORT=');
      expect(template).toContain('REDIS_PORT=');
    });

    test('should generate port summary', () => {
      const summary = portManager.generatePortSummary();
      
      expect(summary).toContain('Port Configuration Summary');
      expect(summary).toContain('BACKEND');
      expect(summary).toContain('api:');
    });
  });
});
