import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Activity,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Target,
  Zap,
  LogIn
} from 'lucide-react'
import { useRealTimePrices, useRealTimeMarketData, useRealTimeDeFi } from '../hooks/useRealTimeData'
import { useAuth } from '../contexts/AuthContext'
import { usePortfolio } from '../hooks/usePortfolio'
import { AddHoldingModal } from './portfolio/AddHoldingModal'

interface PortfolioAsset {
  id: string
  symbol: string
  name: string
  amount: number
  currentPrice: number
  purchasePrice: number
  value: number
  change24h: number
  changePercent: number
  allocation: number
  type: 'crypto' | 'defi' | 'nft' | 'gamefi'
  isRealTime: boolean
}

interface PortfolioMetrics {
  totalValue: number
  totalChange24h: number
  totalChangePercent: number
  totalPnL: number
  totalPnLPercent: number
  bestPerformer: PortfolioAsset | null
  worstPerformer: PortfolioAsset | null
}

const RealTimePortfolioTracker: React.FC = () => {
  const { user } = useAuth()
  const { prices, isLoading: pricesLoading } = useRealTimePrices([
    'bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 'polkadot', 'chainlink', 'uniswap'
  ])
  const { marketData, isConnected } = useRealTimeMarketData()
  const { protocols } = useRealTimeDeFi()
  const { portfolio, summary, loading: portfolioLoading, error: portfolioError } = usePortfolio()

  const [showValues, setShowValues] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')
  const [showAddHoldingModal, setShowAddHoldingModal] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  const isLoading = pricesLoading || portfolioLoading

  // Handle add holding button click
  const handleAddHolding = () => {
    if (!user) {
      // Show auth prompt for non-authenticated users
      setShowAuthPrompt(true)
      return
    }
    setShowAddHoldingModal(true)
  }

  // Use real portfolio summary or create empty metrics
  const metrics: PortfolioMetrics = summary ? {
    totalValue: summary.totalValue,
    totalChange24h: 0, // Will be calculated from individual assets
    totalChangePercent: 0, // Will be calculated from individual assets
    totalPnL: summary.totalPnl,
    totalPnLPercent: summary.totalPnlPercent,
    bestPerformer: summary.bestPerformer,
    worstPerformer: summary.worstPerformer
  } : {
    totalValue: 0,
    totalChange24h: 0,
    totalChangePercent: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    bestPerformer: null,
    worstPerformer: null
  }

  const formatNumber = (num: number, prefix = '') => {
    if (num >= 1e6) return `${prefix}${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${prefix}${(num / 1e3).toFixed(1)}K`
    return `${prefix}${num.toFixed(2)}`
  }

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toFixed(0)}`
    if (price >= 1) return `$${price.toFixed(2)}`
    return `$${price.toFixed(6)}`
  }

  const getAssetIcon = (symbol: string) => {
    const iconMap: { [key: string]: string } = {
      'BITCOIN': '₿',
      'ETHEREUM': 'Ξ',
      'BNB': '◆',
      'CARDANO': '₳',
      'SOLANA': '◎',
      'POLKADOT': '●',
      'CHAINLINK': '⬢',
      'UNISWAP': '🦄'
    }
    return iconMap[symbol] || symbol.charAt(0)
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-Time Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Real-Time Portfolio</h2>
          <p className="text-white/60">
            {user ? 'Your personal portfolio with real-time tracking' : 'Live portfolio tracking with real-time prices'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-blue-400 text-sm font-medium">
              {user ? `${portfolio.length} Holdings • Live Prices` : 'Sign in to track your portfolio'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Live Prices</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Add Holding Button */}
          <button
            onClick={handleAddHolding}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Holding</span>
          </button>

          {/* Privacy Toggle */}
          <button
            onClick={() => setShowValues(!showValues)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
          >
            {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{showValues ? 'Hide' : 'Show'} Values</span>
          </button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-400" />
            {portfolio.length > 0 && portfolio[0]?.isRealTime && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-2xl font-bold text-white">
            {showValues ? formatNumber(metrics.totalValue, '$') : '••••••'}
          </p>
          <p className="text-white/60 text-sm">Total Portfolio Value</p>
          <div className={`text-xs mt-2 ${
            metrics.totalChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {metrics.totalChangePercent >= 0 ? '+' : ''}{metrics.totalChangePercent.toFixed(2)}% (24h)
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-blue-400" />
            {portfolio.length > 0 && portfolio[0]?.isRealTime && (
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className={`text-2xl font-bold ${
            metrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {showValues ? (
              <>
                {metrics.totalPnL >= 0 ? '+' : ''}
                {formatNumber(metrics.totalPnL, '$')}
              </>
            ) : '••••••'}
          </p>
          <p className="text-white/60 text-sm">Total P&L</p>
          <div className={`text-xs mt-2 ${
            metrics.totalPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {metrics.totalPnLPercent >= 0 ? '+' : ''}{metrics.totalPnLPercent.toFixed(2)}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
            {metrics.bestPerformer?.isRealTime && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-lg font-bold text-white">
            {metrics.bestPerformer?.symbol || 'N/A'}
          </p>
          <p className="text-white/60 text-sm">Best Performer</p>
          <div className="text-xs text-green-400 mt-2">
            +{metrics.bestPerformer?.changePercent.toFixed(2)}% (24h)
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="w-8 h-8 text-red-400" />
            {metrics.worstPerformer?.isRealTime && (
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-lg font-bold text-white">
            {metrics.worstPerformer?.symbol || 'N/A'}
          </p>
          <p className="text-white/60 text-sm">Worst Performer</p>
          <div className="text-xs text-red-400 mt-2">
            {metrics.worstPerformer?.changePercent.toFixed(2)}% (24h)
          </div>
        </motion.div>
      </div>

      {/* Portfolio Assets */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <PieChart className="w-6 h-6 text-blue-400" />
            Portfolio Assets
          </h3>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            Real-time Prices
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading portfolio data...</p>
          </div>
        )}

        {/* Assets List */}
        <div className="space-y-4">
          <AnimatePresence>
            {portfolio.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {getAssetIcon(asset.symbol)}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{asset.name}</h4>
                    <p className="text-white/60 text-sm">
                      {asset.amount} {asset.symbol}
                    </p>
                  </div>
                  {asset.isRealTime && (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-white font-semibold">
                    {showValues ? formatNumber(asset.value, '$') : '••••••'}
                  </p>
                  <p className="text-white/60 text-sm">
                    {formatPrice(asset.currentPrice)} • {asset.allocation.toFixed(1)}%
                  </p>
                  <p className={`text-sm font-medium ${
                    asset.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {!isLoading && portfolio.length === 0 && (
          <div className="text-center py-12">
            <PieChart className="w-16 h-16 text-white/40 mx-auto mb-4" />
            {user ? (
              <>
                <p className="text-white/60 mb-2 text-lg">Your portfolio is empty</p>
                <p className="text-white/40 text-sm mb-6">Add your first cryptocurrency holding to get started</p>
                <button
                  onClick={() => setShowAddHoldingModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Holding
                </button>
              </>
            ) : (
              <>
                <p className="text-white/60 mb-2 text-lg">Track Your Portfolio</p>
                <p className="text-white/40 text-sm mb-6">Sign in to add and track your cryptocurrency holdings</p>
                <button
                  onClick={() => setShowAuthPrompt(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In to Get Started
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add Holding Modal */}
      <AddHoldingModal
        isOpen={showAddHoldingModal}
        onClose={() => setShowAddHoldingModal(false)}
        onSuccess={() => {
          setShowAddHoldingModal(false)
          // Portfolio will automatically refresh via real-time subscription
        }}
      />

      {/* Authentication Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <div className="text-center">
              <LogIn className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Sign In Required</h3>
              <p className="text-gray-400 mb-6">
                Create an account or sign in to track your personal cryptocurrency portfolio with real-time updates.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAuthPrompt(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAuthPrompt(false)
                    // Navigate to auth page - you can implement this based on your routing
                    window.location.href = '/auth'
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RealTimePortfolioTracker
