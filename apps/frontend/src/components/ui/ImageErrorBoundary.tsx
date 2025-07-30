import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  retryCount: number
}

export class ImageErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Image Error Boundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1
      }))
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-sm text-red-600 dark:text-red-400 text-center mb-3">
            Image failed to load
          </p>
          {this.state.retryCount < this.maxRetries && (
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-800/30 text-red-600 dark:text-red-400 rounded text-xs hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry ({this.maxRetries - this.state.retryCount} left)
            </button>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for wrapping images with error boundary
export const withImageErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <ImageErrorBoundary fallback={fallback}>
      <Component {...props} ref={ref} />
    </ImageErrorBoundary>
  ))
}
