/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  // Restore console methods
  Object.assign(console, originalConsole);
});

// Global test utilities
global.testUtils = {
  // Wait for a specified time
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Generate random test data
  randomString: (length: number = 10) => 
    Math.random().toString(36).substring(2, 2 + length),
  
  randomNumber: (min: number = 0, max: number = 1000) => 
    Math.floor(Math.random() * (max - min + 1)) + min,
  
  randomEmail: () => 
    `test-${Math.random().toString(36).substring(2)}@example.com`,
  
  // Mock data generators
  mockUser: () => ({
    id: global.testUtils.randomString(8),
    email: global.testUtils.randomEmail(),
    username: `user_${global.testUtils.randomString(6)}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  
  mockBlockchainData: () => ({
    address: `0x${global.testUtils.randomString(40)}`,
    balance: global.testUtils.randomNumber(0, 1000000).toString(),
    transactions: global.testUtils.randomNumber(0, 100),
    lastActivity: new Date()
  }),
  
  // Test database helpers
  cleanupDatabase: async () => {
    // Implement database cleanup logic here
    // This would typically clear test data between tests
  },
  
  // HTTP test helpers
  expectSuccessResponse: (response: any) => {
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
  },
  
  expectErrorResponse: (response: any, errorCode?: string) => {
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    if (errorCode) {
      expect(response.body).toHaveProperty('code', errorCode);
    }
  },
  
  // Performance testing helpers
  measureExecutionTime: async (fn: () => Promise<any>) => {
    const start = Date.now();
    const result = await fn();
    const end = Date.now();
    return { result, executionTime: end - start };
  },
  
  // Memory testing helpers
  getMemoryUsage: () => {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024) // MB
    };
  }
};

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
      toHaveExecutionTimeBelow(maxTime: number): R;
    }
  }
  
  var testUtils: {
    wait: (ms: number) => Promise<void>;
    randomString: (length?: number) => string;
    randomNumber: (min?: number, max?: number) => number;
    randomEmail: () => string;
    mockUser: () => any;
    mockBlockchainData: () => any;
    cleanupDatabase: () => Promise<void>;
    expectSuccessResponse: (response: any) => void;
    expectErrorResponse: (response: any, errorCode?: string) => void;
    measureExecutionTime: (fn: () => Promise<any>) => Promise<{ result: any; executionTime: number }>;
    getMemoryUsage: () => { rss: number; heapTotal: number; heapUsed: number; external: number };
  };
}

// Custom Jest matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  
  toHaveExecutionTimeBelow(received: { executionTime: number }, maxTime: number) {
    const pass = received.executionTime < maxTime;
    if (pass) {
      return {
        message: () => `expected execution time ${received.executionTime}ms not to be below ${maxTime}ms`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected execution time ${received.executionTime}ms to be below ${maxTime}ms`,
        pass: false,
      };
    }
  }
});

// Error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Cleanup after each test
afterEach(async () => {
  // Clear any timers
  jest.clearAllTimers();
  
  // Clear any mocks
  jest.clearAllMocks();
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});

export {};
