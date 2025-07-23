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
  Zap
} from 'lucide-react'
import { useRealTimePrices, useRealTimeMarketData, useRealTimeDeFi } from '../hooks/useRealTimeData'

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
  const { prices, isLoading: pricesLoading } = useRealTimePrices([
    'bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 'polkadot', 'chainlink', 'uniswap'
  ])
  const { marketData, isConnected } = useRealTimeMarketData()
  const { protocols } = useRealTimeDeFi()
  
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([])
  const [showValues, setShowValues] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')
  const [isLoading, setIsLoading] = useState(true)

  // Mock portfolio data (in production, this would come from user's wallet/account)
  useEffect(() => {
    const generateMockPortfolio = (): PortfolioAsset[] => {
      const mockAssets = [
        { symbol: 'bitcoin', name: 'Bitcoin', amount: 0.5, purchasePrice: 40000, type: 'crypto' as const },
        { symbol: 'ethereum', name: 'Ethereum', amount: 2.3, purchasePrice: 2200, type: 'crypto' as const },
        { symbol: 'binancecoin', name: 'BNB', amount: 5.0, purchasePrice: 280, type: 'crypto' as const },
        { symbol: 'cardano', name: 'Cardano', amount: 1000, purchasePrice: 0.45, type: 'crypto' as const },
        { symbol: 'solana', name: 'Solana', amount: 15, purchasePrice: 120, type: 'crypto' as const },
        { symbol: 'polkadot', name: 'Polkadot', amount: 50, purchasePrice: 18, type: 'crypto' as const },
        { symbol: 'chainlink', name: 'Chainlink', amount: 100, purchasePrice: 22, type: 'crypto' as const },
        { symbol: 'uniswap', name: 'Uniswap', amount: 80, purchasePrice: 8.5, type: 'crypto' as const }
      ]

      return mockAssets.map((asset, index) => {
        const currentPrice = prices[asset.symbol]?.usd || asset.purchasePrice
        const value = asset.amount * currentPrice
        const change24h = prices[asset.symbol]?.usd_24h_change || 0
        const pnl = (currentPrice - asset.purchasePrice) * asset.amount
        const pnlPercent = ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100

        return {
          id: `${asset.symbol}-${index}`,
          symbol: asset.symbol.toUpperCase(),
          name: asset.name,
          amount: asset.amount,
          currentPrice,
          purchasePrice: asset.purchasePrice,
          value,
          change24h,
          changePercent: change24h,
          allocation: 0, // Will be calculated after all assets
          type: asset.type,
          isRealTime: !!prices[asset.symbol]
        }
      })
    }

    if (Object.keys(prices).length > 0) {
      const mockPortfolio = generateMockPortfolio()
      const totalValue = mockPortfolio.reduce((sum, asset) => sum + asset.value, 0)
      
      // Calculate allocations
      const portfolioWithAllocations = mockPortfolio.map(asset => ({
        ...asset,
        allocation: (asset.value / totalValue) * 100
      }))

      setPortfolio(portfolioWithAllocations)
      setIsLoading(false)
    }
  }, [prices])

  // Calculate portfolio metrics
  const calculateMetrics = (): PortfolioMetrics => {
    if (portfolio.length === 0) {
      return {
        totalValue: 0,
        totalChange24h: 0,
        totalChangePercent: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
        bestPerformer: null,
        worstPerformer: null
      }
    }

    const totalValue = portfolio.reduce((sum, asset) => sum + asset.value, 0)
    const totalPurchaseValue = portfolio.reduce((sum, asset) => sum + (asset.amount * asset.purchasePrice), 0)
    const totalPnL = totalValue - totalPurchaseValue
    const totalPnLPercent = (totalPnL / totalPurchaseValue) * 100

    // Calculate weighted 24h change
    const totalChange24h = portfolio.reduce((sum, asset) => {
      const weight = asset.value / totalValue
      return sum + (asset.changePercent * weight)
    }, 0)

    const bestPerformer = portfolio.reduce((best, current) => 
      current.changePercent > (best?.changePercent || -Infinity) ? current : best
    )

    const worstPerformer = portfolio.reduce((worst, current) => 
      current.changePercent < (worst?.changePercent || Infinity) ? current : worst
    )

    return {
      totalValue,
      totalChange24h,
      totalChangePercent: totalChange24h,
      totalPnL,
      totalPnLPercent,
      bestPerformer,
      worstPerformer
    }
  }

  const metrics = calculateMetrics()

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
          <p className="text-white/60">Live portfolio tracking and performance analytics</p>
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
          <div className="text-center py-8">
            <PieChart className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 mb-2">No portfolio assets found</p>
            <p className="text-white/40 text-sm">Connect your wallet to track your portfolio</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RealTimePortfolioTracker
