import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
];

// Create the logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Export a stream object for Morgan HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper functions for structured logging
export const loggers = {
  // Log API requests
  apiRequest: (method: string, url: string, userId?: string, duration?: number) => {
    logger.info('API Request', {
      method,
      url,
      userId,
      duration,
      type: 'api_request'
    });
  },

  // Log API responses
  apiResponse: (method: string, url: string, statusCode: number, duration: number, userId?: string) => {
    logger.info('API Response', {
      method,
      url,
      statusCode,
      duration,
      userId,
      type: 'api_response'
    });
  },

  // Log OpenAI API calls
  openaiCall: (operation: string, tokens?: number, cost?: number, duration?: number) => {
    logger.info('OpenAI API Call', {
      operation,
      tokens,
      cost,
      duration,
      type: 'openai_call'
    });
  },

  // Log blockchain transactions
  blockchainTx: (txHash: string, operation: string, gasUsed?: number, gasPrice?: number) => {
    logger.info('Blockchain Transaction', {
      txHash,
      operation,
      gasUsed,
      gasPrice,
      type: 'blockchain_tx'
    });
  },

  // Log DeFi operations
  defiOperation: (protocol: string, operation: string, amount?: number, userId?: string) => {
    logger.info('DeFi Operation', {
      protocol,
      operation,
      amount,
      userId,
      type: 'defi_operation'
    });
  },

  // Log AI analysis
  aiAnalysis: (analysisType: string, protocolsCount: number, recommendationsCount: number, userId?: string) => {
    logger.info('AI Analysis', {
      analysisType,
      protocolsCount,
      recommendationsCount,
      userId,
      type: 'ai_analysis'
    });
  },

  // Log errors with context
  error: (message: string, error: Error, context?: any) => {
    logger.error(message, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      type: 'error'
    });
  },

  // Log security events
  security: (event: string, userId?: string, ip?: string, details?: any) => {
    logger.warn('Security Event', {
      event,
      userId,
      ip,
      details,
      type: 'security'
    });
  },

  // Log performance metrics
  performance: (operation: string, duration: number, details?: any) => {
    logger.info('Performance Metric', {
      operation,
      duration,
      details,
      type: 'performance'
    });
  }
};

export default logger;
