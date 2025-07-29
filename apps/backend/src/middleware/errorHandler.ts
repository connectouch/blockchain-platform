/**
 * Centralized Error Handling Middleware
 * Standardizes error responses across all endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { envValidator } from '../utils/envValidator';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR', true);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR', true);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND', true);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR', true);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', true);
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `External service ${service} is unavailable`,
      503,
      'EXTERNAL_SERVICE_ERROR',
      true,
      { service }
    );
    this.name = 'ExternalServiceError';
  }
}

// Error response formatter
function formatErrorResponse(error: ApiError, req: Request) {
  const response: any = {
    success: false,
    error: error.message,
    code: error.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Add details in development or for operational errors
  if (error.details && (envValidator.isDevelopment() || error.isOperational)) {
    response.details = error.details;
  }

  // Add stack trace in development
  if (envValidator.isDevelopment() && error.stack) {
    response.stack = error.stack;
  }

  // Add request ID if available
  if ((req as any).id) {
    response.requestId = (req as any).id;
  }

  return response;
}

// Main error handler middleware
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If response already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(error);
  }

  // Set default values for unknown errors
  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational !== false;

  // Log error with appropriate level
  const logData = {
    error: error.message,
    code: error.code,
    statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: (req as any).id,
    userId: (req as any).user?.id,
    stack: error.stack
  };

  if (statusCode >= 500) {
    logger.error('Server error:', logData);
  } else if (statusCode >= 400) {
    logger.warn('Client error:', logData);
  } else {
    logger.info('Request error:', logData);
  }

  // Send error response
  const response = formatErrorResponse(error, req);
  res.status(statusCode).json(response);
};

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Endpoint ${req.method} ${req.path}`);
  next(error);
};

// Unhandled promise rejection handler
export const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Promise Rejection:', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString()
    });

    // In production, gracefully shutdown
    if (!envValidator.isDevelopment()) {
      process.exit(1);
    }
  });
};

// Uncaught exception handler
export const handleUncaughtException = () => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', {
      error: error.message,
      stack: error.stack
    });

    // Always exit on uncaught exceptions
    process.exit(1);
  });
};

// Initialize global error handlers
export const initializeGlobalErrorHandlers = () => {
  handleUnhandledRejection();
  handleUncaughtException();
};
