// Production Error Handling and Monitoring

interface ErrorReport {
  message: string
  stack?: string
  url: string
  timestamp: string
  userAgent: string
  userId?: string
  sessionId: string
  buildVersion: string
  environment: string
}

class ProductionErrorHandler {
  private sessionId: string
  private buildVersion: string
  private environment: string
  private errorQueue: ErrorReport[] = []
  private isOnline: boolean = navigator.onLine

  constructor() {
    this.sessionId = this.generateSessionId()
    this.buildVersion = import.meta.env.VITE_APP_VERSION || '2.0.0'
    this.environment = import.meta.env.VITE_NODE_ENV || 'development'
    
    this.setupGlobalErrorHandlers()
    this.setupNetworkMonitoring()
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private setupGlobalErrorHandlers(): void {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        line: event.lineno,
        column: event.colno
      })
    })

    // Handle Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href
      })
    })

    // Handle React errors (if using error boundary)
    if (typeof window !== 'undefined') {
      (window as any).__REACT_ERROR_HANDLER__ = (error: Error, errorInfo: any) => {
        this.handleError({
          message: error.message,
          stack: error.stack,
          url: window.location.href,
          componentStack: errorInfo.componentStack
        })
      }
    }
  }

  private setupNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.flushErrorQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  public handleError(error: any): void {
    const errorReport: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
      environment: this.environment
    }

    // Add to queue
    this.errorQueue.push(errorReport)

    // Try to send immediately if online
    if (this.isOnline) {
      this.flushErrorQueue()
    }

    // Log to console in development
    if (this.environment === 'development') {
      console.error('Error captured:', errorReport)
    }
  }

  public handleAPIError(error: any, context: string): void {
    this.handleError({
      message: `API Error in ${context}: ${error.message || error}`,
      stack: error.stack,
      url: window.location.href,
      context,
      apiError: true
    })
  }

  public handleUserAction(action: string, data?: any): void {
    // Track user actions for debugging context
    if (this.environment === 'development') {
      console.log('User action:', action, data)
    }
  }

  private async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return

    const errors = [...this.errorQueue]
    this.errorQueue = []

    try {
      // In production, send to your error tracking service
      if (this.environment === 'production') {
        await this.sendToErrorService(errors)
      }
    } catch (sendError) {
      // If sending fails, put errors back in queue
      this.errorQueue.unshift(...errors)
      console.error('Failed to send error reports:', sendError)
    }
  }

  private async sendToErrorService(errors: ErrorReport[]): Promise<void> {
    // Example: Send to your backend error tracking endpoint
    const response = await fetch('/api/v2/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ errors })
    })

    if (!response.ok) {
      throw new Error(`Failed to send errors: ${response.status}`)
    }
  }

  public getSessionInfo(): object {
    return {
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
      environment: this.environment,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }
  }
}

// Create global instance
export const productionErrorHandler = new ProductionErrorHandler()

// React Error Boundary Component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    productionErrorHandler.handleError({
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      componentStack: errorInfo.componentStack,
      reactError: true
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} />
    }

    return this.props.children
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
    <div className="text-center p-8">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="text-gray-400 mb-6">
        We're sorry, but something unexpected happened. Please try refreshing the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
      >
        Refresh Page
      </button>
      {error && (
        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-gray-400">Error Details</summary>
          <pre className="mt-2 text-xs text-gray-500 overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  </div>
)

export default productionErrorHandler
