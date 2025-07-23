/**
 * Shared Server Configuration
 * Consolidates common server setup patterns to eliminate code duplication
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer, Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { logger } from '@/utils/logger';
import { envValidator, envConfig } from '@/utils/envValidator';
import { secureCorsMiddleware, corsSecurityHeaders } from '@/middleware/corsMiddleware';
import { PORTS } from '@/config/ports';

export interface ServerOptions {
  enableWebSocket?: boolean;
  enableRateLimit?: boolean;
  enableCompression?: boolean;
  enableHelmet?: boolean;
  enableLogging?: boolean;
  customMiddleware?: Array<(app: Application) => void>;
  customRoutes?: Array<(app: Application) => void>;
}

export interface ServerInfo {
  name: string;
  version: string;
  description: string;
  port: number;
  environment: string;
  endpoints?: Record<string, string>;
}

export class ServerConfigManager {
  private static instance: ServerConfigManager;
  
  private constructor() {}

  public static getInstance(): ServerConfigManager {
    if (!ServerConfigManager.instance) {
      ServerConfigManager.instance = new ServerConfigManager();
    }
    return ServerConfigManager.instance;
  }

  public createExpressApp(options: ServerOptions = {}): Application {
    const app = express();
    
    // Apply default middleware in correct order
    this.applySecurityMiddleware(app, options);
    this.applyCompressionMiddleware(app, options);
    this.applyParsingMiddleware(app);
    this.applyLoggingMiddleware(app, options);
    this.applyRateLimitingMiddleware(app, options);
    this.applyRequestMiddleware(app);

    // Apply custom middleware
    if (options.customMiddleware) {
      options.customMiddleware.forEach(middleware => middleware(app));
    }

    return app;
  }

  public createHttpServer(app: Application, options: ServerOptions = {}): Server {
    const server = createServer(app);
    
    if (options.enableWebSocket) {
      this.setupWebSocket(server);
    }
    
    return server;
  }

  private applySecurityMiddleware(app: Application, options: ServerOptions): void {
    if (options.enableHelmet !== false) {
      app.use(helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https:", "wss:", "ws:"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
        crossOriginEmbedderPolicy: false,
      }));
    }

    // Apply CORS middleware
    app.use(secureCorsMiddleware);
    app.use(corsSecurityHeaders);
  }

  private applyCompressionMiddleware(app: Application, options: ServerOptions): void {
    if (options.enableCompression !== false) {
      app.use(compression({
        filter: (req, res) => {
          if (req.headers['x-no-compression']) {
            return false;
          }
          return compression.filter(req, res);
        },
        threshold: 1024,
        level: 6
      }));
    }
  }

  private applyParsingMiddleware(app: Application): void {
    app.use(express.json({ 
      limit: '10mb',
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      }
    }));
    app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb' 
    }));
  }

  private applyLoggingMiddleware(app: Application, options: ServerOptions): void {
    if (options.enableLogging !== false) {
      if (envValidator.isDevelopment()) {
        app.use(morgan('dev'));
      } else {
        app.use(morgan('combined', {
          stream: {
            write: (message: string) => {
              logger.info(message.trim());
            }
          }
        }));
      }
    }
  }

  private applyRateLimitingMiddleware(app: Application, options: ServerOptions): void {
    if (options.enableRateLimit !== false) {
      const limiter = rateLimit({
        windowMs: parseInt(envConfig.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
        max: parseInt(envConfig.RATE_LIMIT_MAX_REQUESTS || '100'),
        message: {
          success: false,
          error: 'Too many requests from this IP, please try again later',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          logger.warn('Rate limit exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path
          });
          res.status(429).json({
            success: false,
            error: 'Too many requests from this IP, please try again later',
            code: 'RATE_LIMIT_EXCEEDED'
          });
        }
      });

      app.use(limiter);
    }
  }

  private applyRequestMiddleware(app: Application): void {
    // Request ID and timing
    app.use((req: any, res, next) => {
      req.id = Math.random().toString(36).substr(2, 9);
      req.startTime = Date.now();
      res.setHeader('X-Request-ID', req.id);
      next();
    });

    // Request logging
    app.use((req: any, res, next) => {
      logger.debug(`${req.method} ${req.path}`, {
        requestId: req.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  private setupWebSocket(server: Server): SocketIOServer {
    const io = new SocketIOServer(server, {
      cors: {
        origin: envConfig.CORS_ORIGIN?.split(',') || ["http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    io.on('connection', (socket) => {
      logger.info('WebSocket client connected', { 
        socketId: socket.id,
        ip: socket.handshake.address 
      });

      socket.on('disconnect', (reason) => {
        logger.info('WebSocket client disconnected', { 
          socketId: socket.id,
          reason 
        });
      });
    });

    return io;
  }

  public addHealthEndpoint(app: Application, serverInfo: ServerInfo): void {
    app.get('/health', async (req, res) => {
      try {
        const health = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          server: {
            name: serverInfo.name,
            version: serverInfo.version,
            environment: serverInfo.environment,
            port: serverInfo.port
          },
          system: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch
          }
        };

        res.json({
          success: true,
          data: health
        });
      } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
          success: false,
          error: 'Health check failed'
        });
      }
    });
  }

  public addInfoEndpoint(app: Application, serverInfo: ServerInfo): void {
    app.get('/api', (req, res) => {
      res.json({
        name: serverInfo.name,
        version: serverInfo.version,
        description: serverInfo.description,
        environment: serverInfo.environment,
        endpoints: serverInfo.endpoints || {},
        documentation: {
          health: '/health',
          info: '/api'
        },
        timestamp: new Date().toISOString()
      });
    });
  }

  public addErrorHandling(app: Application): void {
    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        code: 'NOT_FOUND',
        path: req.originalUrl,
        method: req.method
      });
    });

    // Global error handler
    app.use((error: any, req: Request, res: Response, next: NextFunction) => {
      const statusCode = error.statusCode || error.status || 500;
      const message = error.message || 'Internal server error';

      logger.error('Server error:', {
        error: message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(statusCode).json({
        success: false,
        error: message,
        code: error.code || 'INTERNAL_ERROR',
        ...(envValidator.isDevelopment() && { stack: error.stack })
      });
    });
  }

  public startServer(
    server: Server, 
    port: number, 
    serverInfo: ServerInfo,
    onStart?: () => void
  ): void {
    server.listen(port, () => {
      logger.info(`🚀 ${serverInfo.name} started`);
      logger.info(`🌐 Server running on http://localhost:${port}`);
      logger.info(`🔧 Environment: ${serverInfo.environment}`);
      logger.info(`📊 Health check: http://localhost:${port}/health`);
      logger.info(`📋 API info: http://localhost:${port}/api`);
      
      if (serverInfo.endpoints) {
        Object.entries(serverInfo.endpoints).forEach(([name, endpoint]) => {
          logger.info(`🔗 ${name}: http://localhost:${port}${endpoint}`);
        });
      }

      if (onStart) {
        onStart();
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }
}

// Export singleton instance
export const serverConfig = ServerConfigManager.getInstance();
