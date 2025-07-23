/**
 * Consolidated Middleware Export
 * Single source of truth for all middleware configurations
 */

// Authentication & Authorization
export {
  authManager,
  authenticateJWT,
  authenticateAPIKey,
  optionalAuth,
  requirePermission,
  requireRole,
  UserRole,
  Permission,
  type AuthenticatedUser
} from './authMiddleware';

// CORS & Security
export {
  corsManager,
  secureCorsMiddleware,
  corsPreflightHandler,
  corsSecurityHeaders,
  type CorsOptions
} from './corsMiddleware';

// Error Handling
export { errorHandler } from './errorHandler';

// Request Logging
export { requestLogger } from './requestLogger';

// Validation Middleware
export { validateRequest } from './validationMiddleware';

// Rate Limiting
export { createRateLimiter } from './rateLimitMiddleware';
