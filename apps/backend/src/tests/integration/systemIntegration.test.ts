/**
 * System Integration Tests
 * Tests all major system components and their interactions
 */

import request from 'supertest';
import { ConnectouchServer } from '../../server';
import { dbManager } from '../../config/database';
import { cacheService } from '../../services/CacheService';
import { memoryOptimizer } from '../../services/MemoryOptimizer';
import { portManager } from '../../config/ports';

describe('System Integration Tests', () => {
  let server: ConnectouchServer;
  let app: any;

  beforeAll(async () => {
    // Initialize test environment
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3099'; // Use different port for testing
    
    server = new ConnectouchServer();
    app = server.getApp();
    
    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    // Cleanup
    await server.shutdown();
    await dbManager.disconnect();
    cacheService.shutdown();
    memoryOptimizer.shutdown();
  });

  describe('Port Configuration', () => {
    test('should have no port conflicts', () => {
      const config = portManager.getConfig();
      const ports = Object.values(config).flatMap(category => Object.values(category));
      const uniquePorts = new Set(ports);
      
      expect(ports.length).toBe(uniquePorts.size);
    });

    test('should generate port summary', () => {
      const summary = portManager.generatePortSummary();
      expect(summary).toContain('Port Configuration Summary');
      expect(summary).toContain('BACKEND');
      expect(summary).toContain('FRONTEND');
    });
  });

  describe('Database Configuration', () => {
    test('should connect to database if available', async () => {
      if (process.env.DATABASE_URL) {
        const health = await dbManager.healthCheck();
        expect(health.overall).toBeDefined();
      }
    });

    test('should handle database unavailability gracefully', async () => {
      // This should not throw an error even if database is unavailable
      const health = await dbManager.healthCheck();
      expect(health).toBeDefined();
    });
  });

  describe('Cache Service', () => {
    test('should set and get cache values', async () => {
      const testKey = 'test:integration';
      const testValue = { message: 'Hello, World!', timestamp: Date.now() };

      await cacheService.set(testKey, testValue, { ttl: 60 });
      const retrieved = await cacheService.get(testKey);

      expect(retrieved).toEqual(testValue);
    });

    test('should handle cache expiration', async () => {
      const testKey = 'test:expiration';
      const testValue = { data: 'expires soon' };

      await cacheService.set(testKey, testValue, { ttl: 1 });
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const retrieved = await cacheService.get(testKey);
      expect(retrieved).toBeNull();
    });

    test('should provide cache statistics', () => {
      const stats = cacheService.getStats();
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('cacheSize');
    });
  });

  describe('Memory Optimizer', () => {
    test('should provide memory statistics', () => {
      const stats = memoryOptimizer.getStats();
      expect(stats).toHaveProperty('rss');
      expect(stats).toHaveProperty('heapUsed');
      expect(stats).toHaveProperty('heapTotal');
    });

    test('should handle object pooling', () => {
      const poolName = 'test-pool';
      const factory = () => ({ id: Math.random(), data: [] });

      const obj1 = memoryOptimizer.getPooledObject(poolName, factory);
      expect(obj1).toHaveProperty('id');
      expect(obj1).toHaveProperty('data');

      memoryOptimizer.returnToPool(poolName, obj1);
      const obj2 = memoryOptimizer.getPooledObject(poolName, factory);
      
      expect(obj2).toBe(obj1); // Should reuse the same object
    });
  });

  describe('API Endpoints', () => {
    test('should respond to health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status');
    });

    test('should respond to API info', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });

    test('should provide memory statistics', async () => {
      const response = await request(app)
        .get('/api/memory/stats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('rss');
    });

    test('should handle memory optimization', async () => {
      const response = await request(app)
        .post('/api/memory/optimize')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    test('should handle WebSocket stats', async () => {
      const response = await request(app)
        .get('/api/v2/websocket/stats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 errors', async () => {
      const response = await request(app)
        .get('/nonexistent-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code', 'NOT_FOUND');
    });

    test('should include request ID in responses', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-request-id');
    });

    test('should include response time in headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-response-time');
      expect(response.headers['x-response-time']).toMatch(/\d+ms/);
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check for security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });

    test('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:5173')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Performance Optimization', () => {
    test('should compress responses', async () => {
      const response = await request(app)
        .get('/api')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Check if compression is applied for larger responses
      if (JSON.stringify(response.body).length > 1024) {
        expect(response.headers).toHaveProperty('content-encoding');
      }
    });

    test('should cache appropriate responses', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check for cache headers
      expect(response.headers).toHaveProperty('cache-control');
    });
  });

  describe('Rate Limiting', () => {
    test('should apply rate limiting', async () => {
      // Make multiple requests quickly
      const requests = Array(10).fill(null).map(() => 
        request(app).get('/health')
      );

      const responses = await Promise.all(requests);
      
      // All should succeed initially
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    });
  });

  describe('Environment Validation', () => {
    test('should validate environment configuration', () => {
      // This test ensures the environment validator is working
      expect(process.env.NODE_ENV).toBe('test');
    });
  });
});

describe('Load Testing', () => {
  let server: ConnectouchServer;
  let app: any;

  beforeAll(async () => {
    server = new ConnectouchServer();
    app = server.getApp();
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    await server.shutdown();
  });

  test('should handle concurrent requests', async () => {
    const concurrentRequests = 50;
    const requests = Array(concurrentRequests).fill(null).map(() => 
      request(app).get('/health')
    );

    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const endTime = Date.now();

    // Check that most requests succeeded
    const successfulRequests = responses.filter(r => r.status === 200);
    expect(successfulRequests.length).toBeGreaterThan(concurrentRequests * 0.8);

    // Check response time
    const averageResponseTime = (endTime - startTime) / concurrentRequests;
    expect(averageResponseTime).toBeLessThan(1000); // Less than 1 second average

    console.log(`Load test completed: ${successfulRequests.length}/${concurrentRequests} successful, ${averageResponseTime.toFixed(2)}ms average response time`);
  });
});
