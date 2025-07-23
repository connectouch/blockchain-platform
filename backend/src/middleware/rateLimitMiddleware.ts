/**
 * Rate Limiting Middleware
 * Configurable rate limiting for different endpoint types
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '@/utils/logger';
import { envConfig } from '@/utils/envValidator';

export interface RateLimitConfig {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

export const createRateLimiter = (config: RateLimitConfig = {}) => {
  const defaultConfig = {
    windowMs: parseInt(envConfig.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(envConfig.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later',
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req: Request) => req.ip
  };

  const finalConfig = { ...defaultConfig, ...config };

  return rateLimit({
    windowMs: finalConfig.windowMs,
    max: finalConfig.max,
    skipSuccessfulRequests: finalConfig.skipSuccessfulRequests,
    skipFailedRequests: finalConfig.skipFailedRequests,
    keyGenerator: finalConfig.keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        userId: (req as any).user?.id
      });

      res.status(429).json({
        success: false,
        error: finalConfig.message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.round(finalConfig.windowMs / 1000)
      });
    }
  });
};

// Predefined rate limiters for common use cases
export const rateLimiters = {
  // General API rate limiting
  general: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per window
  }),

  // Strict rate limiting for authentication endpoints
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many authentication attempts, please try again later'
  }),

  // More lenient for read-only operations
  readOnly: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per window
    skipFailedRequests: true
  }),

  // Strict for write operations
  writeOperations: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window
    skipSuccessfulRequests: false
  }),

  // Very strict for sensitive operations
  sensitive: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour
    message: 'Too many sensitive operations, please try again later'
  }),

  // AI/ML endpoints (resource intensive)
  ai: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: 'AI service rate limit exceeded, please try again later'
  }),

  // Blockchain operations
  blockchain: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
    message: 'Blockchain service rate limit exceeded, please try again later'
  })
};
