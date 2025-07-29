import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

class SafeInfrastructureWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SafeInfrastructureWrapper caught an error:', error, errorInfo)
    
    // Log detailed error information
    console.group('Infrastructure Page Error Details')
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Component Stack:', errorInfo.componentStack)
    console.error('Error Stack:', error.stack)
    console.groupEnd()
    
    this.setState({
      error,
      errorInfo
    })
  }

  handleRetry = () => {
    console.log('Retrying infrastructure page...')
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleHardRefresh = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
          <div className="max-w-2xl w-full mx-4">
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-4">
                Infrastructure Page Error
              </h1>
              
              <p className="text-white/70 mb-6">
                The infrastructure page encountered an unexpected error. This has been logged for debugging.
              </p>

              {/* Error Details (Development Mode) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
                  <h3 className="text-sm font-semibold text-red-400 mb-2">Error Details:</h3>
                  <pre className="text-xs text-red-300 whitespace-pre-wrap overflow-auto max-h-32 mb-2">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-400 cursor-pointer">Component Stack</summary>
                      <pre className="text-xs text-red-300 whitespace-pre-wrap overflow-auto max-h-32 mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                  <div className="mt-2 text-xs text-red-400">
                    Retry Count: {this.state.retryCount}
                  </div>
                </div>
              )}

              {/* Troubleshooting Steps */}
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-left">
                <h3 className="text-sm font-semibold text-blue-400 mb-2">Troubleshooting:</h3>
                <ul className="text-xs text-blue-300 space-y-1">
                  <li>• Try refreshing the page (Ctrl+F5 or Cmd+Shift+R)</li>
                  <li>• Clear browser cache and cookies</li>
                  <li>• Check browser console for additional errors</li>
                  <li>• Try a different browser or incognito mode</li>
                  <li>• Ensure backend server is running on port 5175</li>
                </ul>
              </div>
              
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleHardRefresh}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Hard Refresh
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>

              {/* Additional Debug Info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 text-xs text-white/50">
                  <div>User Agent: {navigator.userAgent}</div>
                  <div>Timestamp: {new Date().toISOString()}</div>
                  <div>URL: {window.location.href}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    // Add a key prop to force remount on retry
    return (
      <div key={`infrastructure-${this.state.retryCount}`}>
        {this.props.children}
      </div>
    )
  }
}

export default SafeInfrastructureWrapper
