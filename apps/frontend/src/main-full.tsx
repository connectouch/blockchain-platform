import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './index.css'

// Import the main App component with error boundary
import App from './App'

// Enhanced startup logging
console.log('🚀 Connectouch Platform Starting (Full Version)...')
console.log('📊 Environment:', {
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
})

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('🔥 Global Error:', event.error)
  console.error('📍 Location:', event.filename, event.lineno, event.colno)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('🔥 Unhandled Promise Rejection:', event.reason)
})

// Create React Query client with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        console.log(`🔄 Query retry ${failureCount}:`, error)
        return failureCount < 3
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: false,
    },
  },
})

// Enhanced Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: any }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🔥 Error Boundary Caught:', error)
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🔥 Error Boundary Details:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif',
          color: 'white',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '600px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</h1>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>
              Component Error
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.9 }}>
              A component in the Connectouch Platform encountered an error.
            </p>
            
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '30px',
              textAlign: 'left',
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}>
              <strong>Error:</strong><br />
              {this.state.error?.message || 'Unknown error'}
              <br /><br />
              <strong>Component Stack:</strong><br />
              {this.state.errorInfo?.componentStack?.slice(0, 300) || 'Not available'}
            </div>
            
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null })
                }}
                style={{
                  background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '25px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🔄 Try Again
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                style={{
                  background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '25px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🏠 Reload Platform
              </button>
              
              <button 
                onClick={() => {
                  // Switch to minimal version
                  window.location.href = '/?minimal=true'
                }}
                style={{
                  background: 'linear-gradient(45deg, #FF9800, #F57C00)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '25px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🔧 Minimal Mode
              </button>
            </div>
            
            <div style={{
              marginTop: '30px',
              opacity: 0.7,
              fontSize: '0.8rem'
            }}>
              <p>If this error persists, please contact support.</p>
              <p>Error ID: {Date.now()}</p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Bulletproof React mounting with enhanced error handling
try {
  console.log('🔧 Initializing React root...')
  
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }
  
  console.log('✅ Root element found')
  
  const root = ReactDOM.createRoot(rootElement)
  console.log('✅ React root created')
  
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
              }}
            />
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  )
  
  console.log('✅ React app rendered')
  
  // Success verification
  setTimeout(() => {
    if (rootElement.children.length > 0) {
      console.log('🎉 Connectouch Platform Successfully Loaded!')
      console.log('📊 Root has', rootElement.children.length, 'child elements')
      
      // Add success indicator to page
      const indicator = document.createElement('div')
      indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #4CAF50, #45a049);
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.5s ease-out;
      `
      indicator.innerHTML = '✅ Platform Online'
      document.body.appendChild(indicator)
      
      // Remove indicator after 3 seconds
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator)
        }
      }, 3000)
    } else {
      console.error('❌ React failed to mount - no children in root')
    }
  }, 2000)
  
} catch (error) {
  console.error('💥 Critical Error in main.tsx:', error)
  
  // Emergency fallback UI
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
        color: white;
        text-align: center;
        padding: 20px;
      ">
        <div style="
          background: rgba(0,0,0,0.3);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          max-width: 500px;
        ">
          <h1 style="font-size: 2.5rem; margin-bottom: 20px;">⚠️ Critical Error</h1>
          <p style="font-size: 1.2rem; margin-bottom: 30px;">
            Connectouch Platform failed to initialize.
          </p>
          <div style="
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: left;
            font-family: monospace;
          ">
            <strong>Error:</strong><br>
            ${error instanceof Error ? error.message : 'Unknown error'}
          </div>
          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button onclick="window.location.reload()" style="
              background: #4CAF50;
              color: white;
              border: none;
              padding: 15px 30px;
              border-radius: 10px;
              font-size: 1.1rem;
              cursor: pointer;
              transition: all 0.3s ease;
            ">
              🔄 Reload Platform
            </button>
            <button onclick="window.location.href='/?minimal=true'" style="
              background: #FF9800;
              color: white;
              border: none;
              padding: 15px 30px;
              border-radius: 10px;
              font-size: 1.1rem;
              cursor: pointer;
              transition: all 0.3s ease;
            ">
              🔧 Minimal Mode
            </button>
          </div>
        </div>
      </div>
    `
  }
}
