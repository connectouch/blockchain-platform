import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import utilities first
import { logger } from './utils/logger';
import { envValidator, envConfig } from './utils/envValidator';

// Import configurations
import { PORTS } from './config/ports';

// Import middleware
import { initializeGlobalErrorHandlers } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';

// Express Request interface extensions
declare global {
  namespace Express {
    interface Request {
      id?: string;
      startTime?: number;
      user?: any;
      rateLimit?: {
        limit: number;
        current: number;
        remaining: number;
        resetTime: Date;
      };
    }
  }
}

// Import services and configurations
import { dbManager } from './config/database';
import comprehensiveBlockchainAIRoutes from './routes/comprehensive-blockchain-ai';

/**
 * Enterprise-grade Connectouch Blockchain AI Platform Server
 * Applying Augment Agent's comprehensive architecture approach
 * Production-ready with advanced security, monitoring, and scalability
 */

// Validate environment configuration on startup
try {
  const productionCheck = envValidator.validateProductionReadiness();
  if (!productionCheck.ready) {
    logger.warn('Production readiness issues:', productionCheck.issues);
  }
} catch (error) {
  logger.error('Environment validation failed:', error);
  process.exit(1);
}

class ConnectouchServer {
  private app: express.Application;
  private server: any;
  private readonly PORT = parseInt(envConfig.PORT || '3007');
  private readonly NODE_ENV = envConfig.NODE_ENV;

  constructor() {
    // Initialize global error handlers
    initializeGlobalErrorHandlers();

    // Create Express app
    this.app = express();

    // Basic middleware setup
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Basic middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }
      next();
    });

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'connectouch-backend',
        version: '2.0.0',
        port: this.PORT,
        environment: this.NODE_ENV
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/v2/blockchain', comprehensiveBlockchainAIRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Connectouch Blockchain AI Platform API',
        version: '2.0.0',
        status: 'operational',
        endpoints: {
          health: '/health',
          auth: '/api/auth',
          blockchain: '/api/v2/blockchain'
        }
      });
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      const statusCode = error.statusCode || error.status || 500;
      const message = error.message || 'Internal server error';

      logger.error('Server error:', {
        error: message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
      });

      res.status(statusCode).json({
        success: false,
        error: message,
        code: error.code || 'INTERNAL_ERROR',
        ...(envValidator.isDevelopment() && { stack: error.stack })
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Initialize database connections
      await dbManager.connect();
      logger.info('Database connections established');

      // Start server
      this.server = this.app.listen(this.PORT, '127.0.0.1', () => {
        logger.info(`🚀 Connectouch Backend Server running on http://127.0.0.1:${this.PORT}`);
        logger.info(`✅ Health check: http://127.0.0.1:${this.PORT}/health`);
        logger.info(`📊 API documentation: http://127.0.0.1:${this.PORT}/api`);
        logger.info(`🎯 Server ready for connections!`);
      });

      this.server.on('error', (err: any) => {
        logger.error('Server startup error:', err);
        process.exit(1);
      });

      // Graceful shutdown
      process.on('SIGINT', () => {
        logger.info('\n🛑 Shutting down server gracefully...');
        this.server.close(() => {
          logger.info('✅ Server closed');
          process.exit(0);
        });
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Create and start server
const server = new ConnectouchServer();

// Start the server
server.start().catch((error) => {
  logger.error('Failed to start Connectouch server:', error);
  process.exit(1);
});

export default server;
