/**
 * Error Handling Service for Connectouch Modern
 * Centralized error handling, retry logic, and error reporting
 */

import toast from 'react-hot-toast'

export interface ErrorContext {
  service: string
  endpoint: string
  method: string
  timestamp: Date
  userAgent?: string
  userId?: string
}

export interface RetryConfig {
  attempts: number
  delay: number
  backoff: number
  shouldRetry?: (error: any) => boolean
}

export interface ErrorReport {
  id: string
  timestamp: string
  context: ErrorContext
  error: {
    name: string
    message: string
    stack?: string
    code?: string | number
  }
  retryAttempts: number
  resolved: boolean
}

export class ErrorHandlingService {
  private errorReports: Map<string, ErrorReport> = new Map()
  private retryConfig: RetryConfig = {
    attempts: 3,
    delay: 1000,
    backoff: 2,
    shouldRetry: this.defaultShouldRetry
  }

  // Default retry logic
  private defaultShouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
      return true
    }
    
    if (error.response?.status >= 500) {
      return true
    }
    
    // Don't retry on 4xx client errors (except 429 rate limit)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return error.response?.status === 429
    }
    
    return false
  }

  // Generate unique error ID
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  // Log error with context
  public logError(error: any, context: ErrorContext): string {
    const errorId = this.generateErrorId()
    
    const errorReport: ErrorReport = {
      id: errorId,
      timestamp: new Date().toISOString(),
      context,
      error: {
        name: error.name || 'UnknownError',
        message: error.message || 'An unknown error occurred',
        stack: error.stack,
        code: error.code || error.response?.status
      },
      retryAttempts: 0,
      resolved: false
    }
    
    this.errorReports.set(errorId, errorReport)
    
    // Log to console in development
    if (import.meta.env?.DEV) {
      console.error('🚨 Error logged:', {
        id: errorId,
        service: context.service,
        endpoint: context.endpoint,
        error: error.message
      })
    }
    
    return errorId
  }

  // Retry request with exponential backoff
  public async retryRequest<T>(
    requestFn: () => Promise<T>,
    context: ErrorContext,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.retryConfig, ...customConfig }
    let lastError: any
    
    for (let attempt = 1; attempt <= config.attempts; attempt++) {
      try {
        const result = await requestFn()
        
        // Mark any existing error as resolved
        const existingErrors = Array.from(this.errorReports.values())
          .filter(report => 
            report.context.service === context.service &&
            report.context.endpoint === context.endpoint &&
            !report.resolved
          )
        
        existingErrors.forEach(report => {
          report.resolved = true
        })
        
        return result
      } catch (error) {
        lastError = error
        
        // Log the error
        const errorId = this.logError(error, context)
        const errorReport = this.errorReports.get(errorId)!
        errorReport.retryAttempts = attempt
        
        // Check if we should retry
        const shouldRetry = config.shouldRetry ? config.shouldRetry(error) : this.defaultShouldRetry(error)
        
        if (attempt === config.attempts || !shouldRetry) {
          // Final attempt failed or shouldn't retry
          this.handleFinalError(error, context, attempt)
          throw error
        }
        
        // Wait before retrying with exponential backoff
        const delay = config.delay * Math.pow(config.backoff, attempt - 1)
        await this.sleep(delay)
        
        console.warn(`🔄 Retrying request (${attempt}/${config.attempts}) for ${context.service}/${context.endpoint} after ${delay}ms`)
      }
    }
    
    throw lastError
  }

  // Handle final error (show user notification, etc.)
  private handleFinalError(error: any, context: ErrorContext, attempts: number): void {
    const isNetworkError = error.code === 'NETWORK_ERROR' || !navigator.onLine
    const isServerError = error.response?.status >= 500
    const isClientError = error.response?.status >= 400 && error.response?.status < 500
    
    let userMessage = 'An unexpected error occurred'
    
    if (isNetworkError) {
      userMessage = 'Network connection failed. Please check your internet connection.'
    } else if (isServerError) {
      userMessage = 'Server is temporarily unavailable. Please try again later.'
    } else if (isClientError) {
      userMessage = error.response?.data?.message || 'Request failed. Please check your input.'
    }
    
    // Show user-friendly error message
    toast.error(userMessage, {
      duration: 5000,
      position: 'top-right'
    })
    
    // Log detailed error for debugging
    console.error(`❌ Final error after ${attempts} attempts:`, {
      service: context.service,
      endpoint: context.endpoint,
      error: error.message,
      status: error.response?.status,
      code: error.code
    })
  }

  // Sleep utility for retry delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Get error statistics
  public getErrorStats(): {
    total: number
    resolved: number
    unresolved: number
    byService: Record<string, number>
    recentErrors: ErrorReport[]
  } {
    const reports = Array.from(this.errorReports.values())
    const now = Date.now()
    const oneHourAgo = now - (60 * 60 * 1000)
    
    const recentErrors = reports
      .filter(report => new Date(report.timestamp).getTime() > oneHourAgo)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
    
    const byService = reports.reduce((acc, report) => {
      const service = report.context.service
      acc[service] = (acc[service] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      total: reports.length,
      resolved: reports.filter(r => r.resolved).length,
      unresolved: reports.filter(r => !r.resolved).length,
      byService,
      recentErrors
    }
  }

  // Clear old error reports (keep last 100)
  public cleanupErrorReports(): void {
    const reports = Array.from(this.errorReports.entries())
      .sort(([, a], [, b]) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    if (reports.length > 100) {
      const toKeep = reports.slice(0, 100)
      this.errorReports.clear()
      toKeep.forEach(([id, report]) => {
        this.errorReports.set(id, report)
      })
    }
  }

  // Update retry configuration
  public updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config }
  }

  // Check if service is experiencing issues
  public isServiceHealthy(serviceName: string): boolean {
    const now = Date.now()
    const fiveMinutesAgo = now - (5 * 60 * 1000)
    
    const recentErrors = Array.from(this.errorReports.values())
      .filter(report => 
        report.context.service === serviceName &&
        new Date(report.timestamp).getTime() > fiveMinutesAgo &&
        !report.resolved
      )
    
    // Consider service unhealthy if more than 3 unresolved errors in 5 minutes
    return recentErrors.length <= 3
  }

  // Get service health status
  public getServiceHealth(): Record<string, { healthy: boolean; errorCount: number; lastError?: string }> {
    const services = new Set(
      Array.from(this.errorReports.values()).map(report => report.context.service)
    )
    
    const health: Record<string, { healthy: boolean; errorCount: number; lastError?: string }> = {}
    
    services.forEach(service => {
      const isHealthy = this.isServiceHealthy(service)
      const serviceErrors = Array.from(this.errorReports.values())
        .filter(report => report.context.service === service && !report.resolved)
      
      const lastError = serviceErrors
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      
      health[service] = {
        healthy: isHealthy,
        errorCount: serviceErrors.length,
        ...(lastError?.error.message && { lastError: lastError.error.message })
      }
    })
    
    return health
  }
}

// Export singleton instance
export const errorHandlingService = new ErrorHandlingService()

// Auto-cleanup every 10 minutes
setInterval(() => {
  errorHandlingService.cleanupErrorReports()
}, 10 * 60 * 1000)

export default errorHandlingService
