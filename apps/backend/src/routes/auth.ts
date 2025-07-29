/**
 * Authentication Routes
 * Handles user authentication, registration, and token management
 */

import express from 'express';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import { 
  authManager, 
  authenticateJWT, 
  UserRole, 
  Permission,
  AuthenticatedUser 
} from '../middleware/authMiddleware';
import { logger } from '../utils/logger';
import { envValidator } from '../utils/envValidator';

const router = express.Router();

// Rate limiting for authentication endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// In-memory user store (replace with database in production)
interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

const users: Map<string, User> = new Map();

// Initialize default admin user in development
if (envValidator.isDevelopment()) {
  const defaultAdminId = 'admin-default';
  const defaultAdmin: User = {
    id: defaultAdminId,
    email: 'admin@connectouch.local',
    passwordHash: bcrypt.hashSync('admin123', 10), // Change in production!
    role: UserRole.ADMIN,
    createdAt: new Date(),
    isActive: true
  };
  users.set(defaultAdminId, defaultAdmin);
  
  logger.info('Default admin user created for development', { 
    email: defaultAdmin.email,
    warning: 'Change password in production!' 
  });
}

// Helper function to find user by email
const findUserByEmail = (email: string): User | undefined => {
  for (const user of users.values()) {
    if (user.email === email && user.isActive) {
      return user;
    }
  }
  return undefined;
};

/**
 * POST /auth/register
 * Register a new user account
 */
router.post('/register', authRateLimit, async (req, res): Promise<any> => {
  try {
    const { email, password, role = UserRole.USER } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
        code: 'WEAK_PASSWORD'
      });
    }

    // Check if user already exists
    if (findUserByEmail(email)) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Create new user
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser: User = {
      id: userId,
      email,
      passwordHash,
      role: role as UserRole,
      createdAt: new Date(),
      isActive: true
    };

    users.set(userId, newUser);

    // Generate JWT token
    const authenticatedUser = authManager.createUser(userId, email, newUser.role);
    const token = authManager.generateToken(authenticatedUser);

    logger.info('User registered successfully', { 
      userId, 
      email, 
      role: newUser.role 
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: userId,
          email,
          role: newUser.role,
          permissions: authenticatedUser.permissions
        },
        token
      }
    });

  } catch (error) {
    logger.error('Registration failed', { error, body: req.body });
    return res.status(500).json({
      success: false,
      error: 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
});

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', authRateLimit, async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      logger.warn('Failed login attempt', { email, ip: req.ip });
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate JWT token
    const authenticatedUser = authManager.createUser(user.id, user.email, user.role);
    const token = authManager.generateToken(authenticatedUser);

    logger.info('User logged in successfully', { 
      userId: user.id, 
      email, 
      ip: req.ip 
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: authenticatedUser.permissions,
          lastLogin: user.lastLogin
        },
        token
      }
    });

  } catch (error) {
    logger.error('Login failed', { error, body: req.body });
    return res.status(500).json({
      success: false,
      error: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

/**
 * POST /auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authenticateJWT, (req, res): any => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Generate new token
    const newToken = authManager.generateToken(req.user);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          permissions: req.user.permissions
        }
      }
    });

  } catch (error) {
    logger.error('Token refresh failed', { error, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      error: 'Token refresh failed',
      code: 'REFRESH_ERROR'
    });
  }
});

/**
 * GET /auth/me
 * Get current user information
 */
router.get('/me', authenticateJWT, (req, res): any => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  const user = users.get(req.user.id);
  
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        permissions: req.user.permissions,
        lastLogin: user?.lastLogin,
        createdAt: user?.createdAt
      }
    }
  });
});

/**
 * POST /auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', authenticateJWT, (req, res): any => {
  logger.info('User logged out', { userId: req.user?.id });
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * GET /auth/status
 * Check authentication status
 */
router.get('/status', (req, res): any => {
  res.json({
    success: true,
    data: {
      authenticationEnabled: true,
      registrationEnabled: envValidator.isDevelopment(),
      supportedMethods: ['jwt', 'api-key'],
      environment: envValidator.isDevelopment() ? 'development' : 'production'
    }
  });
});

export default router;
