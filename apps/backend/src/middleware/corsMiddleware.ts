/**
 * Secure CORS Middleware
 * Implements strict CORS policy with environment-based configuration
 */

import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { envValidator, envConfig } from '../utils/envValidator';
import { logger } from '../utils/logger';

export interface CorsOptions {
  allowedOrigins?: string[];
  allowCredentials?: boolean;
  allowedMethods?: string[];
  allowedHeaders?: string[];
  maxAge?: number;
}

export class CorsSecurityManager {
  private static instance: CorsSecurityManager;
  private allowedOrigins: string[];

  private constructor() {
    this.allowedOrigins = this.buildAllowedOrigins();
  }

  public static getInstance(): CorsSecurityManager {
    if (!CorsSecurityManager.instance) {
      CorsSecurityManager.instance = new CorsSecurityManager();
    }
    return CorsSecurityManager.instance;
  }

  private buildAllowedOrigins(): string[] {
    // Get base origins from environment
    const corsOrigins = envConfig.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000';
    const origins = corsOrigins.split(',').map(origin => origin.trim());

    // Add development-specific origins
    if (envValidator.isDevelopment()) {
      origins.push(
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:5174',
        'http://localhost:4173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:4173',
        'file://' // For Electron applications
      );
    }

    // Add production origins if specified
    if (envValidator.isProduction()) {
      const prodOrigins = process.env.PRODUCTION_CORS_ORIGINS;
      if (prodOrigins) {
        origins.push(...prodOrigins.split(',').map(origin => origin.trim()));
      }
    }

    // Remove duplicates and empty strings
    return [...new Set(origins.filter(origin => origin.length > 0))];
  }

  public isOriginAllowed(origin: string | undefined): boolean {
    if (!origin) {
      // Allow requests with no origin only in development
      return envValidator.isDevelopment();
    }

    // Check exact matches
    if (this.allowedOrigins.includes(origin)) {
      return true;
    }

    // Check file:// protocol for Electron apps
    if (origin.startsWith('file://') && this.allowedOrigins.includes('file://')) {
      return true;
    }

    return false;
  }

  public createCorsMiddleware(options: CorsOptions = {}): any {
    const defaultOptions = {
      allowCredentials: true,
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-API-Key',
        'Accept',
        'Origin'
      ],
      maxAge: 86400 // 24 hours
    };

    const corsOptions = { ...defaultOptions, ...options };

    return cors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (this.isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          logger.warn('CORS policy violation', {
            origin,
            allowedOrigins: this.allowedOrigins,
            userAgent: 'N/A', // Will be filled by request context
            timestamp: new Date().toISOString()
          });

          // In production, strictly reject unauthorized origins
          if (envValidator.isProduction()) {
            callback(new Error(`CORS policy violation: Origin ${origin} not allowed`), false);
          } else {
            // In development, log warning but allow (for debugging)
            logger.warn('CORS violation allowed in development mode');
            callback(null, true);
          }
        }
      },
      credentials: corsOptions.allowCredentials,
      methods: corsOptions.allowedMethods,
      allowedHeaders: corsOptions.allowedHeaders,
      maxAge: corsOptions.maxAge,
      optionsSuccessStatus: 200 // For legacy browser support
    });
  }

  public addOrigin(origin: string): void {
    if (!this.allowedOrigins.includes(origin)) {
      this.allowedOrigins.push(origin);
      logger.info('Added new allowed origin', { origin });
    }
  }

  public removeOrigin(origin: string): void {
    const index = this.allowedOrigins.indexOf(origin);
    if (index > -1) {
      this.allowedOrigins.splice(index, 1);
      logger.info('Removed allowed origin', { origin });
    }
  }

  public getAllowedOrigins(): string[] {
    return [...this.allowedOrigins];
  }

  public validateCorsConfiguration(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (this.allowedOrigins.length === 0) {
      issues.push('No CORS origins configured');
    }

    // Check for wildcard origins in production
    if (envValidator.isProduction()) {
      const hasWildcard = this.allowedOrigins.some(origin => 
        origin.includes('*') || origin === 'file://'
      );
      if (hasWildcard) {
        issues.push('Wildcard or file:// origins not recommended for production');
      }
    }

    // Check for localhost origins in production
    if (envValidator.isProduction()) {
      const hasLocalhost = this.allowedOrigins.some(origin => 
        origin.includes('localhost') || origin.includes('127.0.0.1')
      );
      if (hasLocalhost) {
        issues.push('Localhost origins detected in production configuration');
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// Export singleton instance and middleware
export const corsManager = CorsSecurityManager.getInstance();
export const secureCorsMiddleware = corsManager.createCorsMiddleware();

// Additional middleware for CORS preflight optimization
export const corsPreflightHandler = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    // Handle preflight requests efficiently
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    res.status(200).end();
    return;
  }
  next();
};

// CORS security headers middleware
export const corsSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Add additional security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Only add HSTS in production with HTTPS
  if (envValidator.isProduction() && req.secure) {
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};
