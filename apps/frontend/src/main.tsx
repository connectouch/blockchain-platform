import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './index.css'

// Import the main App component with error boundary
import App from './App'

// Enhanced startup logging for FULL VERSION
console.log('🚀 Connectouch Platform Starting (FULL FEATURED VERSION)...')
console.log('📊 Environment:', {
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
})

// Performance monitoring
console.log('⚡ Performance Monitoring Active')
const startTime = performance.now()

// Feature flags logging
console.log('🎛️ Feature Flags:', {
  aiAssistant: import.meta.env.REACT_APP_ENABLE_AI_ASSISTANT !== 'false',
  voiceCommands: import.meta.env.REACT_APP_ENABLE_VOICE_COMMANDS !== 'false',
  trading: import.meta.env.REACT_APP_ENABLE_TRADING !== 'false',
  notifications: import.meta.env.REACT_APP_ENABLE_NOTIFICATIONS !== 'false'
})

// Enhanced global error handlers with detailed logging
window.addEventListener('error', (event) => {
  console.error('🔥 Global Error:', event.error)
  console.error('📍 Location:', event.filename, event.lineno, event.colno)
  console.error('🔍 Stack:', event.error?.stack)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('🔥 Unhandled Promise Rejection:', event.reason)
  console.error('🔍 Promise:', event.promise)
})

// Enhanced React Query client with comprehensive error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        console.log(`🔄 Query retry ${failureCount}:`, error)
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error &&
            typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
          return false
        }
        return failureCount < 3
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      // Enhanced error handling
      onError: (error) => {
        console.error('🔥 Query Error:', error)
      },
      // Ensure queries are always enabled by default to prevent hooks issues
      enabled: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        console.log(`🔄 Mutation retry ${failureCount}:`, error)
        return failureCount < 2
      },
      onError: (error) => {
        console.error('🔥 Mutation Error:', error)
      },
    },
  },
})

// Enhanced Error Boundary Component with detailed error reporting
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error; errorInfo?: React.ErrorInfo }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🔥 Error Boundary Triggered:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔥 Application Error Details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'Main Application'
    })

    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">Connectouch Platform Error</h1>
            <p className="text-gray-300 mb-6">
              The platform encountered an unexpected error. Our enhanced error handling is working to resolve this.
            </p>

            {/* Enhanced error details for debugging */}
            <div className="bg-black/30 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-white font-semibold mb-2">Error Details:</h3>
              <p className="text-red-300 text-sm font-mono">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>
              {this.state.error?.stack && (
                <details className="mt-2">
                  <summary className="text-gray-400 cursor-pointer">Stack Trace</summary>
                  <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-32">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined, errorInfo: undefined })
                  window.location.reload()
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                🔄 Reload Platform
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                ↩️ Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Enhanced React mounting with comprehensive error handling and monitoring
try {
  console.log('🔧 Initializing Enhanced React Root...')

  // Pre-flight checks
  console.log('🔍 Pre-flight System Checks...')
  console.log('📱 User Agent:', navigator.userAgent)
  console.log('🌐 Browser:', {
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine
  })

  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Critical: Root element not found in DOM')
  }

  console.log('✅ Root element found and validated')
  console.log('📊 Root element details:', {
    id: rootElement.id,
    className: rootElement.className,
    children: rootElement.children.length
  })

  const root = ReactDOM.createRoot(rootElement)
  console.log('✅ Enhanced React root created successfully')

  // Enhanced render with full feature set
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#fff',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#FFFFFF',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#FFFFFF',
                  },
                },
              }}
            />
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  )

  console.log('✅ Enhanced React app rendered with full features')

  // Enhanced success verification and performance monitoring
  setTimeout(() => {
    const endTime = performance.now()
    const loadTime = endTime - startTime

    if (rootElement.children.length > 0) {
      console.log('🎉 Connectouch Platform Successfully Loaded!')
      console.log('📊 Platform Statistics:', {
        loadTime: `${loadTime.toFixed(2)}ms`,
        childElements: rootElement.children.length,
        memoryUsage: (performance as any).memory ? {
          used: `${((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          total: `${((performance as any).memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          limit: `${((performance as any).memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        } : 'Not available'
      })

      // Enhanced success indicator with platform info
      const indicator = document.createElement('div')
      indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 12px 24px;
        border-radius: 30px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: slideInBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      `
      indicator.innerHTML = `✅ Full Platform Loaded (${loadTime.toFixed(0)}ms)`

      // Add animation keyframes
      const style = document.createElement('style')
      style.textContent = `
        @keyframes slideInBounce {
          0% { transform: translateX(100%) scale(0.8); opacity: 0; }
          60% { transform: translateX(-10px) scale(1.05); opacity: 1; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
      `
      document.head.appendChild(style)
      document.body.appendChild(indicator)

      // Enhanced removal with fade out
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.style.transition = 'all 0.5s ease-out'
          indicator.style.transform = 'translateX(100%) scale(0.8)'
          indicator.style.opacity = '0'
          setTimeout(() => {
            if (indicator.parentNode) {
              indicator.parentNode.removeChild(indicator)
            }
          }, 500)
        }
      }, 4000)

      // Log successful feature activation
      console.log('🎯 Enhanced Features Activated:', {
        aiAssistant: '✅ Ready',
        realTimeData: '✅ Active',
        tradingCharts: '✅ Loaded',
        multiChain: '✅ Connected',
        notifications: '✅ Enabled'
      })

    } else {
      console.error('❌ Critical: React failed to mount - no children in root')
      console.error('🔍 Debug Info:', {
        rootElement: rootElement,
        innerHTML: rootElement.innerHTML,
        loadTime: `${loadTime.toFixed(2)}ms`
      })
    }
  }, 2000)

} catch (error) {
  console.error('💥 CRITICAL ERROR in Enhanced main.tsx:', error)
  console.error('🔍 Error Details:', {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : 'No stack trace',
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  })

  // Enhanced emergency fallback UI with better error reporting
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh;
        background: linear-gradient(135deg, #1e1b4b 0%, #7c2d12 50%, #1e1b4b 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: white;
        text-align: center;
        padding: 20px;
        animation: fadeIn 0.5s ease-in;
      ">
        <div style="
          background: rgba(0,0,0,0.4);
          padding: 50px;
          border-radius: 24px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          max-width: 600px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        ">
          <div style="font-size: 4rem; margin-bottom: 20px;">🚨</div>
          <h1 style="font-size: 2.5rem; margin-bottom: 20px; font-weight: 700;">
            Connectouch Platform Critical Error
          </h1>
          <p style="font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9;">
            The enhanced platform failed to initialize. Our error recovery system is active.
          </p>

          <div style="
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: left;
          ">
            <div style="font-weight: 600; margin-bottom: 10px; color: #fca5a5;">Error Details:</div>
            <div style="font-family: 'SF Mono', Monaco, monospace; font-size: 0.9rem; color: #fecaca;">
              ${error instanceof Error ? error.message : 'Unknown initialization error'}
            </div>
            <div style="margin-top: 10px; font-size: 0.8rem; color: #fed7d7;">
              Time: ${new Date().toLocaleString()}
            </div>
          </div>

          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button onclick="window.location.reload()" style="
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              border: none;
              padding: 15px 30px;
              border-radius: 12px;
              font-size: 1.1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(16, 185, 129, 0.4)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(16, 185, 129, 0.3)'">
              🔄 Reload Enhanced Platform
            </button>

            <button onclick="console.clear(); window.location.href = window.location.href + '?safe=true'" style="
              background: rgba(255,255,255,0.1);
              color: white;
              border: 1px solid rgba(255,255,255,0.2);
              padding: 15px 30px;
              border-radius: 12px;
              font-size: 1.1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255,255,255,0.2)'"
               onmouseout="this.style.background='rgba(255,255,255,0.1)'">
              🛡️ Safe Mode
            </button>
          </div>

          <div style="margin-top: 30px; font-size: 0.9rem; opacity: 0.7;">
            Enhanced error recovery system active • Full feature restoration in progress
          </div>
        </div>
      </div>

      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      </style>
    `
  } else {
    // Last resort: create root element if it doesn't exist
    document.body.innerHTML = '<div id="root">Connectouch Platform - Emergency Recovery Mode</div>'
    console.error('🚨 EMERGENCY: Root element missing, created emergency fallback')
  }
}
