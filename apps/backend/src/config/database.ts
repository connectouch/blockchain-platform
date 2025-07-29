import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { logger } from '../utils/logger';
import { envValidator, envConfig } from '../utils/envValidator';
import { queryOptimizer } from '../utils/queryOptimizer';

/**
 * Enterprise-grade Database Configuration
 * Applying Augment Agent's advanced architecture principles
 */

// Prisma Client with advanced configuration and performance optimization
export const prisma = envValidator.hasDatabase() ? new PrismaClient({
  log: envValidator.isDevelopment() ? [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ] : [
    {
      emit: 'event',
      level: 'error',
    }
  ],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: envConfig.DATABASE_URL || 'postgresql://localhost:5432/connectouch'
    }
  },
  // Performance optimizations
  transactionOptions: {
    maxWait: 5000, // 5 seconds
    timeout: 10000, // 10 seconds
  },
}) : null;

// Enhanced logging for database operations with performance monitoring
if (prisma) {
  (prisma as any).$on('query', (e: any) => {
    const duration = parseInt(e.duration);

    // Log slow queries
    if (duration > 1000) {
      logger.warn('Slow Database Query', {
        query: e.query.substring(0, 200) + '...',
        params: e.params,
        duration: `${duration}ms`,
        target: e.target
      });
    } else if (envValidator.isDevelopment()) {
      logger.debug('Database Query', {
        query: e.query.substring(0, 100) + '...',
        duration: `${duration}ms`,
        target: e.target
      });
    }
  });

  (prisma as any).$on('error', (e: any) => {
    logger.error('Database Error', {
      message: e.message,
      target: e.target,
      timestamp: new Date().toISOString()
    });
  });

  (prisma as any).$on('info', (e: any) => {
    logger.info('Database Info', {
      message: e.message,
      target: e.target
    });
  });

  (prisma as any).$on('warn', (e: any) => {
    logger.warn('Database Warning', {
      message: e.message,
      target: e.target
    });
  });
}

// Redis Client with advanced configuration and performance optimization
export const redisClient = envValidator.hasRedis() ? createClient({
  url: envConfig.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    connectTimeout: 60000,
  }
}) : null;

// Redis event handlers
if (redisClient) {
  redisClient.on('connect', () => {
    logger.info('Redis client connected');
  });

  redisClient.on('ready', () => {
    logger.info('Redis client ready');
  });

  redisClient.on('error', (err) => {
    logger.error('Redis client error:', err);
  });

  redisClient.on('end', () => {
    logger.info('Redis client disconnected');
  });
}

// Database connection management
export class DatabaseManager {
  private static instance: DatabaseManager;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async connect(): Promise<void> {
    try {
      let postgresConnected = false;
      let redisConnected = false;

      // Connect to PostgreSQL via Prisma (if enabled)
      if (prisma && envValidator.hasDatabase()) {
        try {
          await prisma.$connect();
          // Test connection
          await prisma.$queryRaw`SELECT 1`;
          postgresConnected = true;
          logger.info('PostgreSQL connected successfully');
        } catch (error) {
          logger.error('PostgreSQL connection failed:', error);
          if (envValidator.isProduction()) {
            throw error;
          } else {
            logger.warn('Continuing without PostgreSQL in development mode');
          }
        }
      } else {
        logger.info('PostgreSQL disabled - persistent storage features unavailable');
      }

      // Connect to Redis (if enabled)
      if (redisClient && envValidator.hasRedis()) {
        try {
          await redisClient.connect();
          await redisClient.ping();
          redisConnected = true;
          logger.info('Redis connected successfully');
        } catch (error) {
          logger.error('Redis connection failed:', error);
          if (envValidator.isProduction()) {
            throw error;
          } else {
            logger.warn('Continuing without Redis in development mode');
          }
        }
      } else {
        logger.info('Redis disabled - caching and session features unavailable');
      }

      this.isConnected = postgresConnected || redisConnected || envValidator.isDevelopment();

      if (this.isConnected) {
        logger.info('Database initialization completed', {
          postgresql: postgresConnected,
          redis: redisConnected
        });
      } else {
        throw new Error('No database connections could be established');
      }
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (prisma) {
        await prisma.$disconnect();
        logger.info('PostgreSQL disconnected');
      }

      if (redisClient) {
        await redisClient.quit();
        logger.info('Redis disconnected');
      }

      this.isConnected = false;
      logger.info('Database connections closed');
    } catch (error) {
      logger.error('Error closing database connections:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<{
    postgres: { status: string; enabled: boolean; latency?: number };
    redis: { status: string; enabled: boolean; latency?: number };
    overall: string;
  }> {
    const health = {
      postgres: { status: 'disabled', enabled: false } as { status: string; enabled: boolean; latency?: number },
      redis: { status: 'disabled', enabled: false } as { status: string; enabled: boolean; latency?: number },
      overall: 'healthy'
    };

    // Check PostgreSQL
    if (prisma && envValidator.hasDatabase()) {
      health.postgres.enabled = true;
      try {
        const start = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        health.postgres.status = 'healthy';
        health.postgres.latency = Date.now() - start;
      } catch (error) {
        health.postgres.status = 'unhealthy';
        health.overall = 'degraded';
        logger.error('PostgreSQL health check failed:', error);
      }
    }

    // Check Redis
    if (redisClient && envValidator.hasRedis()) {
      health.redis.enabled = true;
      try {
        const start = Date.now();
        await redisClient.ping();
        health.redis.status = 'healthy';
        health.redis.latency = Date.now() - start;
      } catch (error) {
        health.redis.status = 'unhealthy';
        health.overall = 'degraded';
        logger.error('Redis health check failed:', error);
      }
    }

    // Determine overall health
    if (health.postgres.enabled && health.postgres.status === 'unhealthy') {
      health.overall = 'unhealthy';
    } else if (health.redis.enabled && health.redis.status === 'unhealthy') {
      health.overall = 'degraded';
    }

    return health;
  }

  public isHealthy(): boolean {
    return this.isConnected;
  }
}

// Cache management utilities
export class CacheManager {
  private static readonly DEFAULT_TTL = 3600; // 1 hour

  public static async get<T>(key: string): Promise<T | null> {
    if (!redisClient) {
      logger.debug('Cache get skipped - Redis not available');
      return null;
    }

    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  public static async set<T>(
    key: string,
    value: T,
    ttl: number = CacheManager.DEFAULT_TTL
  ): Promise<boolean> {
    if (!redisClient) {
      logger.debug('Cache set skipped - Redis not available');
      return false;
    }

    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  public static async del(key: string): Promise<boolean> {
    if (!redisClient) {
      logger.debug('Cache delete skipped - Redis not available');
      return false;
    }

    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  public static async exists(key: string): Promise<boolean> {
    if (!redisClient) {
      logger.debug('Cache exists skipped - Redis not available');
      return false;
    }

    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  public static async flush(): Promise<boolean> {
    if (!redisClient) {
      logger.debug('Cache flush skipped - Redis not available');
      return false;
    }

    try {
      await redisClient.flushAll();
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }
}

// Database transaction utilities
export class TransactionManager {
  public static async executeTransaction<T>(
    operation: (tx: any) => Promise<T>
  ): Promise<T> {
    if (!prisma) {
      throw new Error('PostgreSQL not available - cannot execute transaction');
    }

    return await prisma.$transaction(operation, {
      maxWait: 5000, // 5 seconds
      timeout: 10000, // 10 seconds
      isolationLevel: 'ReadCommitted',
    });
  }
}

// Export singleton instance
export const dbManager = DatabaseManager.getInstance();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, closing database connections...');
  await dbManager.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, closing database connections...');
  await dbManager.disconnect();
  process.exit(0);
});

export default {
  prisma,
  redisClient,
  dbManager,
  CacheManager,
  TransactionManager,
};
