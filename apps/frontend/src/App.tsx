import React, { Suspense, useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
// import { useElectron, usePriceAlerts } from '@hooks/useElectron' // Disabled for web deployment
import { AuthProvider } from './contexts/AuthContext'

// Enhanced real-time components - Direct imports for debugging
import RealTimeDashboard from './components/enhanced/RealTimeDashboard'
// const RealTimeDeFiPage = React.lazy(() => import('./components/enhanced/RealTimeDeFiPage'))
// const EnhancedNFTPage = React.lazy(() => import('./components/enhanced/EnhancedNFTPage'))

// Lazy load components for better performance
import Dashboard from '@pages/Dashboard'
const DeFiPage = React.lazy(() => import('@pages/DeFiPage'))
const NFTPage = React.lazy(() => import('@pages/NFTPage'))
const GameFiPage = React.lazy(() => import('@pages/GameFiPage'))
const Web3ToolsPage = React.lazy(() => import('@pages/Web3ToolsPage'))
const AnalysisPage = React.lazy(() => import('@pages/AnalysisPage'))
const PortfolioPage = React.lazy(() => import('@pages/PortfolioPage'))

const MultiChainPage = React.lazy(() => import('@pages/MultiChainPage'))
const EnhancedDAOPage = React.lazy(() => import('@pages/EnhancedDAOPage'))
const InfrastructurePage = React.lazy(() => import('@pages/InfrastructurePage'))

// const ChartTestPage = React.lazy(() => import('@pages/ChartTestPage')) // Removed for production

// Components
import Navbar from '@components/Navbar'
import Footer from '@components/Footer'
import BackgroundEffects from '@components/BackgroundEffects'
// import FloatingPriceTicker from '@components/FloatingPriceTicker' // Removed per user request
import SimplePriceTicker from '@components/SimplePriceTicker'
// import EnhancedConnectionMonitor from '@components/EnhancedConnectionMonitor' // Removed per user request
import ProductionMonitor from '@components/ProductionMonitor'
import RealAPIDemo from '@components/RealAPIDemo'
// import FloatingTickerSettings from '@components/FloatingTickerSettings' // Available if needed

// Contexts
import { AIAssistantProvider, useAIAssistant } from './contexts/AIAssistantContext'
import { FloatingAIProvider } from './contexts/FloatingAIContext'
import FloatingAIWrapper from './components/FloatingAIWrapper'

// Hooks
// import { useFloatingTicker } from '@hooks/useFloatingTicker'
// import { useMasterPrefetch } from './hooks/usePrefetch' // DISABLED for production stability

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center space-y-4"
    >
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      <p className="text-white/80 text-lg font-medium">Loading Connectouch Platform...</p>
    </motion.div>
  </div>
)

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
}

function App() {
  // Disabled Electron hooks for web deployment
  // const { isElectron, showDesktopNotification } = useElectron()
  // const { checkPriceAlerts } = usePriceAlerts()
  const isElectron = false
  const [appError, setAppError] = useState<string | null>(null)

  // Initialize master prefetch for optimal performance with real data - DISABLED for production stability
  // useMasterPrefetch()

  // Floating ticker state - moved to AppContent component
  // const [showTickerSettings, setShowTickerSettings] = useState(false)

  // Global error handler (temporarily disabled for debugging)
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)

      // Only show connection error for critical errors, not component-level errors
      const errorMessage = event.error?.message || 'An unexpected error occurred'
      if (errorMessage.includes('ChunkLoadError') || errorMessage.includes('Loading chunk')) {
        // Code splitting errors - reload the page
        window.location.reload()
        return
      }

      // TEMPORARILY DISABLED - Only show app-level errors for truly critical issues
      // Ignore network errors, API failures, and component-level errors
      // if (!errorMessage.includes('fetch') &&
      //     !errorMessage.includes('network') &&
      //     !errorMessage.includes('API') &&
      //     !errorMessage.includes('Failed to')) {
      //   setAppError(errorMessage)
      // }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)

      // TEMPORARILY DISABLED - Filter out non-critical network errors (like price ticker failures)
      // const errorMessage = event.reason?.message || 'Network connection error'

      // Only show connection error for CRITICAL API failures that affect core functionality
      // Ignore all price ticker, market data, and other non-essential API failures
      // if (errorMessage.includes('fetch') && errorMessage.includes('health')) {
      //   // Only health check failures should trigger the connection error
      //   setAppError('Unable to connect to the backend server. Please ensure the backend is running.')
      // }
      // Ignore ALL other fetch errors - let components handle their own errors gracefully
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // Desktop-specific initialization - disabled for web
  useEffect(() => {
    if (isElectron) {
      console.log('🖥️ Running in Electron desktop mode')

      // Show welcome notification - disabled for web
      // showDesktopNotification(
      //   'Connectouch Desktop Launched',
      //   'Your blockchain AI platform is ready! 🚀'
      // )

      // Set up price monitoring for alerts (with enhanced error handling)
      const priceMonitor = setInterval(async () => {
        try {
          // Use the proxy endpoint for price monitoring
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

          const response = await fetch('/api/v2/blockchain/prices/live', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            signal: controller.signal
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const data = await response.json()
          if (data.success) {
            const prices: Record<string, number> = {}
            Object.entries(data.data).forEach(([key, value]: [string, any]) => {
              prices[key] = value.usd
            })
            // await checkPriceAlerts(prices) // Disabled for web
          }
        } catch (error) {
          console.warn('Price monitoring temporarily unavailable:', error)
          // Gracefully continue without price alerts if backend is unavailable
          // Don't re-throw to prevent triggering global error handlers
        }
      }, 60000) // Check every minute

      return () => clearInterval(priceMonitor)
    }
  }, [isElectron]) // Removed disabled dependencies

  // Show error screen if there's an app error (TEMPORARILY DISABLED)
  if (false && appError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center p-8 bg-black/20 rounded-xl border border-white/10 backdrop-blur-sm max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
          <p className="text-white/70 mb-6">
            {appError?.includes('fetch') || appError?.includes('network') || appError?.includes('Failed to fetch')
              ? 'Unable to connect to the backend server. Please ensure the backend is running.'
              : appError}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setAppError(null)
                window.location.reload()
              }}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Retry Connection
            </button>
            <button
              onClick={() => setAppError(null)}
              className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Continue Offline
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Final working version with all fixes applied
  return (
    <AuthProvider>
      <AIAssistantProvider>
        <FloatingAIProvider>
          <AppContent />
          <FloatingAIWrapper />
        </FloatingAIProvider>
      </AIAssistantProvider>
    </AuthProvider>
  )
}

// Separate component to use AI context
const AppContent: React.FC = () => {
  const { /* currentFeature, contextData */ } = useAIAssistant()

  // Ticker state - moved inside AppContent
  const [showFloatingTicker, setShowFloatingTicker] = useState(false) // Card-style ticker - DISABLED
  const [showRunningTicker, setShowRunningTicker] = useState(false) // Running ticker tape - DISABLED for stability
  const [showConnectionMonitor, setShowConnectionMonitor] = useState(false) // Enhanced connection monitoring - disabled for production

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <BackgroundEffects />

      {/* Navigation */}
      <Navbar />

      {/* Simple Price Ticker - Below navigation menu, no overlap */}
      <SimplePriceTicker
        height={40}
        speed={60}
        updateInterval={60000}
        className="w-full"
      />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route
                path="/"
                element={
                  <motion.div
                    key="home"
                    variants={pageVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    transition={pageTransition}
                  >
                    <Dashboard />
                  </motion.div>
                }
              />
              <Route
                path="/defi"
                element={
                  <motion.div
                    key="defi"
                    variants={pageVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    transition={pageTransition}
                  >
                    <DeFiPage />
                  </motion.div>
                }
              />
              <Route
                path="/nft"
                element={
                  <motion.div
                    key="nft"
                    variants={pageVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    transition={pageTransition}
                  >
                    <NFTPage />
                  </motion.div>
                }
              />
              <Route
                path="/gamefi"
                element={
                  <motion.div
                    key="gamefi"
                    variants={pageVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    transition={pageTransition}
                  >
                    <GameFiPage />
                  </motion.div>
                }
              />
              <Route
                path="/web3-tools"
                element={
                  <motion.div
                    key="web3-tools"
                    variants={pageVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    transition={pageTransition}
                  >
                    <Web3ToolsPage />
                  </motion.div>
                }
              />
              <Route
                path="/analysis"
                element={
                  <motion.div
                    key="analysis"
                    variants={pageVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    transition={pageTransition}
                  >
                    <AnalysisPage />
                  </motion.div>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <motion.div
                    key="portfolio"
                    variants={pageVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    transition={pageTransition}
                  >
                    <PortfolioPage />
                  </motion.div>
                }
              />
              <Route
                path="/multi-chain"
                element={
                  <motion.div
                    key="multi-chain"
                    variants={pageVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    transition={pageTransition}
                  >
                    <MultiChainPage />
                  </motion.div>
                }
              />
              <Route
                path="/dao"
                element={
                  <motion.div
                    key="dao"
                    variants={pageVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    transition={pageTransition}
                  >
                    <EnhancedDAOPage />
                  </motion.div>
                }
              />
              <Route
                path="/infrastructure"
                element={
                  <motion.div
                    key="infrastructure"
                    variants={pageVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    transition={pageTransition}
                  >
                    <InfrastructurePage />
                  </motion.div>
                }
              />
              <Route
                path="/api-demo"
                element={
                  <motion.div
                    key="api-demo"
                    variants={pageVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    transition={pageTransition}
                  >
                    <RealAPIDemo />
                  </motion.div>
                }
              />

            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />

      {/* RESTORED: All Rich Features and System Health Indicators */}

      {/* Floating Price Ticker - REMOVED per user request */}

      {/* Simple Price Ticker - Bottom position (ENABLED) */}
      <SimplePriceTicker />

      {/* Enhanced Connection Monitor - REMOVED per user request */}

      {/* Production Monitor (ENABLED) */}
      <ProductionMonitor />

      {/* Real-time Notifications - REMOVED per user request */}
    </div>
  )
}

export default App
