import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import defiRoutes from './routes/defi';
import blockchainRoutes from './routes/blockchain';

// Import utilities
import { logger, morganStream } from './utils/logger';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
    },
  },
}));

// Import environment validator for secure configuration
import { envValidator, envConfig } from './utils/envValidator';

app.use(cors({
  origin: (origin: string | undefined, callback: any) => {
    const corsOrigins = envConfig.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3006';
    const allowedOrigins = corsOrigins.split(',').map(origin => origin.trim());

    // Add all development origins
    if (envValidator.isDevelopment()) {
      allowedOrigins.push(
        'http://localhost:5173',  // Vite dev server
        'http://localhost:3000',  // Alternative frontend
        'http://localhost:3001',  // Alternative frontend
        'http://localhost:3002',  // AI backend
        'http://localhost:3006',  // Quick API server
        'http://127.0.0.1:5173',  // Alternative localhost
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:3006'
      );
    }

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin && envValidator.isDevelopment()) {
      console.log('✅ CORS: Allowing request with no origin (development mode)');
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin || '')) {
      console.log(`✅ CORS: Allowing origin ${origin}`);
      callback(null, true);
    } else {
      console.error(`❌ CORS: Blocking origin ${origin}. Allowed origins:`, allowedOrigins);
      callback(new Error(`CORS policy violation: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(compression());
app.use(morgan('combined', { stream: morganStream }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true, // Added success field for audit compatibility
    data: {
      status: 'OK',
      service: 'Connectouch DeFi AI Platform',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0-alpha'
    }
  });
});

// API routes
app.use('/api/defi', defiRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/starknet', require('./routes/starknet').default);
app.use('/api/quantum-defi', require('./routes/quantum-defi').default);
app.use('/api/ai-intelligence', require('./routes/ai-intelligence').default);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Connectouch DeFi AI Platform API',
    version: '1.0.0-alpha',
    endpoints: {
      health: '/health',
      defi: '/api/defi',
      blockchain: '/api/blockchain',
      starknet: '/api/starknet',
      quantumDefi: '/api/quantum-defi',
      aiIntelligence: '/api/ai-intelligence',
      protocols: '/api/defi/protocols',
      analyze: '/api/defi/analyze',
      chat: '/api/defi/chat',
      test: '/api/defi/test',
      blockchainStatus: '/api/blockchain/status',
      starknetHealth: '/api/starknet/health',
      starknetProtocols: '/api/starknet/defi/protocols',
      quantumAnalysis: '/api/quantum-defi/portfolio/analyze',
      quantumCapabilities: '/api/quantum-defi/capabilities',
      collaborativeAnalysis: '/api/ai-intelligence/collaborative/strategy-analysis',
      scientificTesting: '/api/ai-intelligence/scientific/hypothesis-testing'
    },
    documentation: 'https://docs.connectouch.ai',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /health',
      'GET /api/defi/protocols',
      'GET /api/defi/market-conditions',
      'POST /api/defi/analyze',
      'POST /api/defi/chat',
      'GET /api/defi/test'
    ]
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Connectouch DeFi AI Platform API started`);
  logger.info(`🌐 Server running on http://localhost:${PORT}`);
  logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🤖 DeFi API: http://localhost:${PORT}/api/defi`);
  logger.info(`🧪 Test endpoint: http://localhost:${PORT}/api/defi/test`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default app;
