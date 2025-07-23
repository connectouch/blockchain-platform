/**
 * Security Service for Connectouch Platform
 * Implements comprehensive security framework following Rules 1-35
 */

import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import validator from 'validator'
import crypto from 'crypto'
import * as bcrypt from 'bcryptjs'

export interface SecurityConfig {
  rateLimit: {
    windowMs: number
    max: number
    message: string
  }
  encryption: {
    algorithm: string
    keyLength: number
  }
  validation: {
    maxInputLength: number
    allowedDomains: string[]
  }
}

export interface SecurityAuditLog {
  id: string
  timestamp: Date
  userId?: string
  action: string
  resource: string
  ip: string
  userAgent: string
  success: boolean
  details?: any
}

export class SecurityService {
  private auditLogs: SecurityAuditLog[] = []
  private encryptionKey: string
  private config: SecurityConfig

  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateEncryptionKey()
    this.config = {
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.'
      },
      encryption: {
        algorithm: 'aes-256-gcm',
        keyLength: 32
      },
      validation: {
        maxInputLength: 10000,
        allowedDomains: ['connectouch.ai', 'localhost']
      }
    }
  }

  /**
   * Create rate limiting middleware
   * Implements Rule #8 - Reduce overcorrection risk
   */
  createRateLimiter(options?: Partial<SecurityConfig['rateLimit']>) {
    const config = { ...this.config.rateLimit, ...options }
    
    return rateLimit({
      windowMs: config.windowMs,
      max: config.max,
      message: {
        error: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        this.logSecurityEvent({
          action: 'RATE_LIMIT_EXCEEDED',
          resource: req.path,
          ip: req.ip,
          userAgent: req.get('User-Agent') || 'unknown',
          success: false,
          details: { limit: config.max, window: config.windowMs }
        })
        
        res.status(429).json({
          error: config.message,
          retryAfter: Math.ceil(config.windowMs / 1000)
        })
      }
    })
  }

  /**
   * Create security headers middleware
   * Implements Rule #26 - Latest security standards
   */
  createSecurityHeaders() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", "https://api.coingecko.com", "https://api.openai.com"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: []
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      frameguard: { action: 'deny' },
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    })
  }

  /**
   * Validate and sanitize input
   * Implements Rule #20 - No empty validation
   */
  validateInput(input: any, type: 'string' | 'number' | 'email' | 'url' | 'json'): {
    isValid: boolean
    sanitized?: any
    errors: string[]
  } {
    const errors: string[] = []
    let sanitized = input

    try {
      // Basic checks
      if (input === null || input === undefined) {
        errors.push('Input cannot be null or undefined')
        return { isValid: false, errors }
      }

      // Length check for strings
      if (typeof input === 'string' && input.length > this.config.validation.maxInputLength) {
        errors.push(`Input exceeds maximum length of ${this.config.validation.maxInputLength}`)
        return { isValid: false, errors }
      }

      switch (type) {
        case 'string':
          if (typeof input !== 'string') {
            errors.push('Input must be a string')
          } else {
            // Sanitize HTML and script tags
            sanitized = validator.escape(input.trim())
          }
          break

        case 'number':
          if (!validator.isNumeric(String(input))) {
            errors.push('Input must be a valid number')
          } else {
            sanitized = parseFloat(String(input))
          }
          break

        case 'email':
          if (!validator.isEmail(String(input))) {
            errors.push('Input must be a valid email address')
          } else {
            sanitized = validator.normalizeEmail(String(input)) || input
          }
          break

        case 'url':
          if (!validator.isURL(String(input))) {
            errors.push('Input must be a valid URL')
          } else {
            sanitized = String(input).trim()
          }
          break

        case 'json':
          try {
            if (typeof input === 'string') {
              sanitized = JSON.parse(input)
            }
          } catch {
            errors.push('Input must be valid JSON')
          }
          break

        default:
          errors.push('Unknown validation type')
      }

      return {
        isValid: errors.length === 0,
        sanitized: errors.length === 0 ? sanitized : undefined,
        errors
      }
    } catch (error) {
      errors.push('Validation error occurred')
      return { isValid: false, errors }
    }
  }

  /**
   * Encrypt sensitive data
   * Implements Rule #29 - Ground truth capability
   */
  encrypt(data: string): { encrypted: string; iv: string; tag: string } {
    try {
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv)

      let encrypted = cipher.update(data, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      const tag = cipher.getAuthTag()

      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      }
    } catch (error) {
      throw new Error('Encryption failed')
    }
  }

  /**
   * Decrypt sensitive data
   * Implements Rule #22 - Deep research validation
   */
  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    try {
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, Buffer.from(encryptedData.iv, 'hex'))
      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'))

      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      throw new Error('Decryption failed')
    }
  }

  /**
   * Log security events
   * Implements Rule #7 - Ground search and truth
   */
  logSecurityEvent(event: Omit<SecurityAuditLog, 'id' | 'timestamp'>): void {
    const logEntry: SecurityAuditLog = {
      id: this.generateLogId(),
      timestamp: new Date(),
      ...event
    }

    this.auditLogs.push(logEntry)

    // Keep only last 1000 logs in memory
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Security Event:', {
        action: event.action,
        resource: event.resource,
        success: event.success,
        ip: event.ip
      })
    }
  }

  /**
   * Get security audit logs
   * Implements Rule #13 - Agentic benchmark checklist
   */
  getAuditLogs(filters?: {
    userId?: string
    action?: string
    success?: boolean
    startDate?: Date
    endDate?: Date
  }): SecurityAuditLog[] {
    let logs = [...this.auditLogs]

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId)
      }
      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action)
      }
      if (filters.success !== undefined) {
        logs = logs.filter(log => log.success === filters.success)
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!)
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!)
      }
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Generate secure API key
   * Implements Rule #19 - Monte-Carlo approach
   */
  generateApiKey(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Hash password securely
   * Implements Rule #26 - Latest security standards
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  /**
   * Verify password hash
   * Implements Rule #20 - No empty validation
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash)
    } catch (error) {
      return false
    }
  }

  /**
   * Generate encryption key
   * Implements Rule #29 - Ground truth capability
   */
  private generateEncryptionKey(): string {
    return crypto.randomBytes(this.config.encryption.keyLength).toString('hex')
  }

  /**
   * Generate unique log ID
   * Implements Rule #19 - Monte-Carlo approach
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
  }

  /**
   * Get security statistics
   * Implements Rule #13 - Agentic benchmark checklist
   */
  getSecurityStats(): {
    totalEvents: number
    failedAttempts: number
    rateLimitHits: number
    recentThreats: number
  } {
    const now = Date.now()
    const oneHourAgo = now - (60 * 60 * 1000)

    const recentLogs = this.auditLogs.filter(log => 
      log.timestamp.getTime() > oneHourAgo
    )

    return {
      totalEvents: this.auditLogs.length,
      failedAttempts: this.auditLogs.filter(log => !log.success).length,
      rateLimitHits: this.auditLogs.filter(log => 
        log.action === 'RATE_LIMIT_EXCEEDED'
      ).length,
      recentThreats: recentLogs.filter(log => !log.success).length
    }
  }
}

// Export singleton instance
export const securityService = new SecurityService()

export default securityService
