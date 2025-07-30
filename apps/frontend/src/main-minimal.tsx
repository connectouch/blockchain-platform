import React from 'react'
import ReactDOM from 'react-dom/client'

// Minimal test component
const MinimalApp = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b, #7c3aed)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        🚀 Connectouch Platform
      </h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
        ✅ React is working!
      </p>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <h2>Platform Status</h2>
        <p>✅ JavaScript Loading</p>
        <p>✅ React Rendering</p>
        <p>✅ CSS Styling</p>
        <p>🎯 Ready for Full Platform</p>
      </div>
    </div>
  )
}

// Error boundary for debugging
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Error caught by boundary:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error details:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#ef4444',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'Arial, sans-serif',
          padding: '20px'
        }}>
          <h1>❌ Error Detected</h1>
          <p>Error: {this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: 'white',
              color: '#ef4444',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Initialize the app
console.log('🚀 Starting minimal Connectouch app...')

try {
  const rootElement = document.getElementById('root')
  
  if (!rootElement) {
    throw new Error('Root element not found!')
  }

  console.log('✅ Root element found, creating React root...')
  
  const root = ReactDOM.createRoot(rootElement)
  
  console.log('✅ React root created, rendering app...')
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <MinimalApp />
      </ErrorBoundary>
    </React.StrictMode>
  )
  
  console.log('✅ App rendered successfully!')
  
} catch (error) {
  console.error('❌ Failed to initialize app:', error)
  
  // Fallback rendering
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="min-height: 100vh; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; flex-direction: column; font-family: Arial, sans-serif; padding: 20px;">
        <h1>❌ Initialization Error</h1>
        <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: white; color: #ef4444; border: none; border-radius: 5px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `
  }
}
