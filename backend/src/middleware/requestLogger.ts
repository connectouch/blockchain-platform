/**
 * Request Logging Middleware
 * Standardized request/response logging across all endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { envValidator } from '@/utils/envValidator';

interface LoggedRequest extends Request {
  id?: string;
  startTime?: number;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export const requestLogger = (req: LoggedRequest, res: Response, next: NextFunction) => {
  // Generate request ID if not already present
  if (!req.id) {
    req.id = Math.random().toString(36).substr(2, 9);
  }

  // Record start time
  req.startTime = Date.now();

  // Set request ID header
  res.setHeader('X-Request-ID', req.id);

  // Log incoming request
  const requestData = {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    userId: req.user?.id,
    userRole: req.user?.role
  };

  // Include body in development (be careful with sensitive data)
  if (envValidator.isDevelopment() && req.body && Object.keys(req.body).length > 0) {
    // Filter out sensitive fields
    const filteredBody = { ...req.body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey'];
    
    sensitiveFields.forEach(field => {
      if (filteredBody[field]) {
        filteredBody[field] = '[REDACTED]';
      }
    });

    requestData.body = filteredBody;
  }

  logger.info('Incoming request', requestData);

  // Capture response details
  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function(body) {
    logResponse(req, res, body);
    return originalSend.call(this, body);
  };

  res.json = function(body) {
    logResponse(req, res, body);
    return originalJson.call(this, body);
  };

  next();
};

function logResponse(req: LoggedRequest, res: Response, body: any) {
  const duration = req.startTime ? Date.now() - req.startTime : 0;
  
  const responseData = {
    requestId: req.id,
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    contentLength: res.get('Content-Length'),
    userId: req.user?.id
  };

  // Include response body in development for errors
  if (envValidator.isDevelopment() && res.statusCode >= 400 && body) {
    try {
      responseData.responseBody = typeof body === 'string' ? JSON.parse(body) : body;
    } catch (e) {
      responseData.responseBody = body;
    }
  }

  // Log with appropriate level based on status code
  if (res.statusCode >= 500) {
    logger.error('Response sent', responseData);
  } else if (res.statusCode >= 400) {
    logger.warn('Response sent', responseData);
  } else {
    logger.info('Response sent', responseData);
  }
}
