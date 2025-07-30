/**
 * Enhanced Real-Time Dashboard Component
 * Provides comprehensive real-time data with zero error tolerance
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  BarChart3,
  Zap,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { comprehensiveRealTimeService, RealTimePrice, MarketMover, FearGreedIndex } from '../../services/comprehensiveRealTimeService'
import { CryptoLocalImage } from '../ui/LocalImage'

interface DashboardStats {
  totalMarketCap: number
  totalVolume: number
  btcDominance: number
  fearGreedIndex: number
  activeCoins: number
}

const RealTimeDashboard: React.FC = () => {
  const [prices, setPrices] = useState<RealTimePrice[]>([])
  const [marketMovers, setMarketMovers] = useState<MarketMover[]>([])
  const [fearGreed, setFearGreed] = useState<FearGreedIndex | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalMarketCap: 0,
    totalVolume: 0,
    btcDominance: 0,
    fearGreedIndex: 0,
    activeCoins: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeRealTimeData()
    return () => {
      comprehensiveRealTimeService.removeAllListeners()
    }
  }, [])

  const initializeRealTimeData = async () => {
    try {
      setError(null)
      setIsLoading(true)

      // Initialize the service
      await comprehensiveRealTimeService.initialize()

      // Set up event listeners
      comprehensiveRealTimeService.on('pricesUpdated', handlePricesUpdate)
      comprehensiveRealTimeService.on('marketMoversUpdated', handleMarketMoversUpdate)
      comprehensiveRealTimeService.on('fearGreedUpdated', handleFearGreedUpdate)
      comprehensiveRealTimeService.on('pricesError', handleError)

      // Get initial data
      setPrices(comprehensiveRealTimeService.getPrices())
      setMarketMovers(comprehensiveRealTimeService.getMarketMovers())
      setFearGreed(comprehensiveRealTimeService.getFearGreedIndex())
      
      updateStats()
      setIsLoading(false)
      setLastUpdate(new Date())

    } catch (error) {
      console.error('Failed to initialize real-time data:', error)
      setError('Failed to load real-time data. Using cached information.')
      setIsLoading(false)
    }
  }

  const handlePricesUpdate = (newPrices: RealTimePrice[]) => {
    setPrices(newPrices)
    updateStats()
    setLastUpdate(new Date())
  }

  const handleMarketMoversUpdate = (movers: MarketMover[]) => {
    setMarketMovers(movers)
    setLastUpdate(new Date())
  }

  const handleFearGreedUpdate = (index: FearGreedIndex) => {
    setFearGreed(index)
    setLastUpdate(new Date())
  }

  const handleError = (error: any) => {
    console.warn('Real-time data error:', error)
    setError('Some data may be delayed. Retrying...')
    setTimeout(() => setError(null), 5000)
  }

  const updateStats = () => {
    const totalMarketCap = prices.reduce((sum, price) => sum + price.marketCap, 0)
    const totalVolume = prices.reduce((sum, price) => sum + price.volume24h, 0)
    const btcPrice = prices.find(p => p.symbol === 'BITCOIN')
    const btcDominance = btcPrice ? (btcPrice.marketCap / totalMarketCap) * 100 : 0

    setStats({
      totalMarketCap,
      totalVolume,
      btcDominance,
      fearGreedIndex: fearGreed?.value || 0,
      activeCoins: prices.length
    })
  }

  const formatCurrency = (value: number): string => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const formatPercent = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getFearGreedColor = (value: number): string => {
    if (value >= 75) return 'text-green-400'
    if (value >= 55) return 'text-blue-400'
    if (value >= 45) return 'text-yellow-400'
    if (value >= 25) return 'text-orange-400'
    return 'text-red-400'
  }

  const getFearGreedBg = (value: number): string => {
    if (value >= 75) return 'bg-green-500/20'
    if (value >= 55) return 'bg-blue-500/20'
    if (value >= 45) return 'bg-yellow-500/20'
    if (value >= 25) return 'bg-orange-500/20'
    return 'bg-red-500/20'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-white">Loading real-time data...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Real-Time Dashboard</h1>
          <p className="text-white/60">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-4 py-2"
          >
            <AlertCircle className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-yellow-400 text-sm">{error}</span>
          </motion.div>
        )}
      </div>

      {/* Market Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Market Cap</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.totalMarketCap)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">24h Volume</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.totalVolume)}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">BTC Dominance</p>
              <p className="text-2xl font-bold text-white">
                {stats.btcDominance.toFixed(1)}%
              </p>
            </div>
            <Activity className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`backdrop-blur-lg rounded-xl p-6 border border-white/20 ${getFearGreedBg(stats.fearGreedIndex)}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Fear & Greed</p>
              <p className={`text-2xl font-bold ${getFearGreedColor(stats.fearGreedIndex)}`}>
                {stats.fearGreedIndex}
              </p>
              <p className="text-xs text-white/50">
                {fearGreed?.classification || 'Neutral'}
              </p>
            </div>
            <Zap className={`w-8 h-8 ${getFearGreedColor(stats.fearGreedIndex)}`} />
          </div>
        </motion.div>
      </div>

      {/* Top Cryptocurrencies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Top Cryptocurrencies
          </h2>
          
          <div className="space-y-4">
            {prices.slice(0, 8).map((price, index) => (
              <motion.div
                key={price.symbol}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <CryptoLocalImage
                    identifier={price.symbol.toLowerCase()}
                    alt={price.symbol}
                    size="sm"
                    className="w-8 h-8"
                  />
                  <div>
                    <p className="text-white font-medium">{price.symbol}</p>
                    <p className="text-white/60 text-sm">{formatCurrency(price.marketCap)}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-white font-medium">{formatCurrency(price.price)}</p>
                  <p className={`text-sm ${price.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercent(price.changePercent24h)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Market Movers */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Market Movers
          </h2>
          
          <div className="space-y-4">
            {marketMovers.slice(0, 8).map((mover, index) => (
              <motion.div
                key={mover.symbol}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <CryptoLocalImage
                    identifier={mover.symbol.toLowerCase()}
                    alt={mover.symbol}
                    size="sm"
                    className="w-8 h-8"
                  />
                  <div>
                    <p className="text-white font-medium">{mover.symbol}</p>
                    <p className="text-white/60 text-xs">{mover.reason}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-white font-medium">{formatCurrency(mover.price)}</p>
                  <div className="flex items-center">
                    {mover.changePercent24h >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-400 mr-1" />
                    )}
                    <p className={`text-sm ${mover.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercent(mover.changePercent24h)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg p-4 text-center transition-colors group">
            <DollarSign className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-white text-sm">View Portfolio</p>
          </button>
          
          <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg p-4 text-center transition-colors group">
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-white text-sm">Explore DeFi</p>
          </button>
          
          <button className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg p-4 text-center transition-colors group">
            <BarChart3 className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-white text-sm">Browse NFTs</p>
          </button>
          
          <button className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg p-4 text-center transition-colors group">
            <Activity className="w-6 h-6 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-white text-sm">AI Analysis</p>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default RealTimeDashboard
