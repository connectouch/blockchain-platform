/**
 * Enhanced Page Router Component
 * Routes to enhanced real-time components with comprehensive functionality
 */

import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

// Enhanced Components
import RealTimeDashboard from './RealTimeDashboard'
import RealTimeDeFiPage from './RealTimeDeFiPage'

// Lazy load other enhanced components
const EnhancedNFTPage = React.lazy(() => import('./EnhancedNFTPage'))
const EnhancedGameFiPage = React.lazy(() => import('./EnhancedGameFiPage'))
const EnhancedPortfolioPage = React.lazy(() => import('./EnhancedPortfolioPage'))
const EnhancedMultiChainPage = React.lazy(() => import('./EnhancedMultiChainPage'))
const EnhancedDAOPage = React.lazy(() => import('./EnhancedDAOPage'))
const EnhancedInfrastructurePage = React.lazy(() => import('./EnhancedInfrastructurePage'))
const EnhancedWeb3ToolsPage = React.lazy(() => import('./EnhancedWeb3ToolsPage'))
const EnhancedAnalysisPage = React.lazy(() => import('./EnhancedAnalysisPage'))

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-3"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-8 h-8 text-blue-500" />
      </motion.div>
      <span className="text-white text-lg">Loading enhanced page...</span>
    </motion.div>
  </div>
)

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
}

interface EnhancedPageRouterProps {
  className?: string
}

const EnhancedPageRouter: React.FC<EnhancedPageRouterProps> = ({ className }) => {
  return (
    <div className={className}>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Dashboard - Enhanced Real-Time */}
          <Route
            path="/"
            element={
              <motion.div
                key="dashboard"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <RealTimeDashboard />
              </motion.div>
            }
          />

          {/* DeFi - Enhanced Real-Time */}
          <Route
            path="/defi"
            element={
              <motion.div
                key="defi"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <RealTimeDeFiPage />
              </motion.div>
            }
          />

          {/* NFT - Enhanced Real-Time */}
          <Route
            path="/nft"
            element={
              <motion.div
                key="nft"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <EnhancedNFTPage />
              </motion.div>
            }
          />

          {/* GameFi - Enhanced Real-Time */}
          <Route
            path="/gamefi"
            element={
              <motion.div
                key="gamefi"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <EnhancedGameFiPage />
              </motion.div>
            }
          />

          {/* Portfolio - Enhanced Real-Time */}
          <Route
            path="/portfolio"
            element={
              <motion.div
                key="portfolio"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <EnhancedPortfolioPage />
              </motion.div>
            }
          />

          {/* Multi-Chain - Enhanced Real-Time */}
          <Route
            path="/multi-chain"
            element={
              <motion.div
                key="multi-chain"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <EnhancedMultiChainPage />
              </motion.div>
            }
          />

          {/* DAO - Enhanced Real-Time */}
          <Route
            path="/dao"
            element={
              <motion.div
                key="dao"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <EnhancedDAOPage />
              </motion.div>
            }
          />

          {/* Infrastructure - Enhanced Real-Time */}
          <Route
            path="/infrastructure"
            element={
              <motion.div
                key="infrastructure"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <EnhancedInfrastructurePage />
              </motion.div>
            }
          />

          {/* Web3 Tools - Enhanced Real-Time */}
          <Route
            path="/web3-tools"
            element={
              <motion.div
                key="web3-tools"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <EnhancedWeb3ToolsPage />
              </motion.div>
            }
          />

          {/* Analysis - Enhanced Real-Time */}
          <Route
            path="/analysis"
            element={
              <motion.div
                key="analysis"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <EnhancedAnalysisPage />
              </motion.div>
            }
          />

          {/* Fallback Route */}
          <Route
            path="*"
            element={
              <motion.div
                key="fallback"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <RealTimeDashboard />
              </motion.div>
            }
          />
        </Routes>
      </Suspense>
    </div>
  )
}

export default EnhancedPageRouter
