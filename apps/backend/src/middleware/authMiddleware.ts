/**
 * Authentication and Authorization Middleware
 * Implements JWT-based authentication with role-based access control
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { envConfig } from '../utils/envValidator';
import { logger } from '../utils/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      apiKey?: string;
    }
  }
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  iat?: number;
  exp?: number;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  API_CLIENT = 'api_client',
  READONLY = 'readonly'
}

export enum Permission {
  // API Access
  API_READ = 'api:read',
  API_WRITE = 'api:write',
  
  // AI Features
  AI_CHAT = 'ai:chat',
  AI_ANALYSIS = 'ai:analysis',
  
  // Blockchain Data
  BLOCKCHAIN_READ = 'blockchain:read',
  BLOCKCHAIN_WRITE = 'blockchain:write',
  
  // DeFi Operations
  DEFI_READ = 'defi:read',
  DEFI_TRADE = 'defi:trade',
  
  // Portfolio Management
  PORTFOLIO_READ = 'portfolio:read',
  PORTFOLIO_WRITE = 'portfolio:write',
  
  // Admin Operations
  ADMIN_USERS = 'admin:users',
  ADMIN_SYSTEM = 'admin:system'
}

export class AuthenticationManager {
  private static instance: AuthenticationManager;
  private jwtSecret: string;
  private jwtExpiry: string;

  private constructor() {
    this.jwtSecret = (envConfig.JWT_SECRET || 'fallback-secret-key') as string;
    this.jwtExpiry = (process.env.JWT_EXPIRY || '24h') as string;
  }

  public static getInstance(): AuthenticationManager {
    if (!AuthenticationManager.instance) {
      AuthenticationManager.instance = new AuthenticationManager();
    }
    return AuthenticationManager.instance;
  }

  public generateToken(user: Omit<AuthenticatedUser, 'iat' | 'exp'>): string {
    try {
      const options: SignOptions = {
        expiresIn: this.jwtExpiry as any,
        issuer: 'connectouch-platform',
        audience: 'connectouch-api'
      };

      return jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        },
        this.jwtSecret as string,
        options
      );
    } catch (error) {
      logger.error('Token generation failed', { error, userId: user.id });
      throw new Error('Failed to generate authentication token');
    }
  }

  public verifyToken(token: string): AuthenticatedUser {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'connectouch-platform',
        audience: 'connectouch-api'
      }) as AuthenticatedUser;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        logger.error('Token verification failed', { error });
        throw new Error('Token verification failed');
      }
    }
  }

  public getRolePermissions(role: UserRole): Permission[] {
    switch (role) {
      case UserRole.ADMIN:
        return Object.values(Permission); // All permissions

      case UserRole.USER:
        return [
          Permission.API_READ,
          Permission.API_WRITE,
          Permission.AI_CHAT,
          Permission.AI_ANALYSIS,
          Permission.BLOCKCHAIN_READ,
          Permission.DEFI_READ,
          Permission.PORTFOLIO_READ,
          Permission.PORTFOLIO_WRITE
        ];

      case UserRole.API_CLIENT:
        return [
          Permission.API_READ,
          Permission.BLOCKCHAIN_READ,
          Permission.DEFI_READ,
          Permission.AI_ANALYSIS
        ];

      case UserRole.READONLY:
        return [
          Permission.API_READ,
          Permission.BLOCKCHAIN_READ,
          Permission.DEFI_READ
        ];

      default:
        return [Permission.API_READ];
    }
  }

  public createUser(id: string, email: string, role: UserRole = UserRole.USER): AuthenticatedUser {
    return {
      id,
      email,
      role,
      permissions: this.getRolePermissions(role)
    };
  }
}

// Singleton instance
export const authManager = AuthenticationManager.getInstance();

// JWT Authentication Middleware
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token required',
      code: 'NO_TOKEN'
    });
    return;
  }

  try {
    const user = authManager.verifyToken(token);
    req.user = user;
    
    logger.debug('User authenticated', { 
      userId: user.id, 
      role: user.role,
      endpoint: req.path 
    });
    
    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      token: token ? token.substring(0, 10) + '...' : 'undefined',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(403).json({
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
      code: 'AUTH_FAILED'
    });
    return;
  }
};

// API Key Authentication Middleware (for external integrations)
export const authenticateAPIKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: 'API key required',
      code: 'NO_API_KEY'
    });
    return;
  }

  // In a real implementation, validate against database
  // For now, create a basic API client user
  req.user = authManager.createUser(`api-client-${Date.now()}`, `api-client-${Date.now()}@connectouch.ai`, UserRole.API_CLIENT);
  req.apiKey = apiKey;

  logger.debug('API key authenticated', {
    apiKey: apiKey.substring(0, 8) + '...',
    endpoint: req.path
  });

  next();
};

// Optional Authentication (allows both authenticated and anonymous access)
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const apiKey = req.headers['x-api-key'] as string;

  if (token) {
    try {
      req.user = authManager.verifyToken(token);
    } catch (error) {
      // Log but don't fail - allow anonymous access
      logger.debug('Optional auth failed, proceeding anonymously', { error });
    }
  } else if (apiKey) {
    req.user = authManager.createUser(`api-client-${Date.now()}`, `api-client-${Date.now()}@connectouch.ai`, UserRole.API_CLIENT);
    req.apiKey = apiKey;
  }

  next();
};

// Permission-based Authorization Middleware
export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    if (!req.user.permissions.includes(permission)) {
      logger.warn('Permission denied', {
        userId: req.user.id,
        role: req.user.role,
        requiredPermission: permission,
        userPermissions: req.user.permissions,
        endpoint: req.path
      });

      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'PERMISSION_DENIED',
        required: permission
      });
      return;
    }

    next();
  };
};

// Role-based Authorization Middleware
export const requireRole = (role: UserRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    if (req.user.role !== role && req.user.role !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Insufficient role privileges',
        code: 'ROLE_DENIED',
        required: role,
        current: req.user.role
      });
      return;
    }

    next();
  };
};
