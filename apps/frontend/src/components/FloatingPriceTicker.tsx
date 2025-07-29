import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity, X, Minimize2, Maximize2 } from 'lucide-react'

interface CryptoPrice {
  symbol: string
  name: string
  price: number
  change24h: number
  change1h?: number
  change7d?: number
  marketCap?: number
  volume24h?: number
  lastUpdated: string
  isRealTime: boolean
}

interface FloatingPriceTickerProps {
  position?: 'top' | 'bottom'
  autoHide?: boolean
  refreshInterval?: number
  symbols?: string[]
  className?: string
}

const FloatingPriceTicker: React.FC<FloatingPriceTickerProps> = ({
  position = 'bottom',
  autoHide = false,
  refreshInterval = 30000, // 30 seconds
  symbols = ['BTC', 'ETH', 'BNB'],
  className = ''
}) => {
  const [prices, setPrices] = useState<CryptoPrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [isRealTime, setIsRealTime] = useState(false)

  // Fetch live cryptocurrency prices
  const fetchPrices = async () => {
    try {
      console.log('🎯 FloatingPriceTicker: Fetching live prices...')
      const response = await fetch('/api/v2/blockchain/prices/live')
      const data = await response.json()

      if (data.success) {
        let processedPrices: CryptoPrice[] = []

        if (Array.isArray(data.data)) {
          // New array format
          processedPrices = data.data.filter((coin: CryptoPrice) =>
            symbols.includes(coin.symbol)
          )
        } else if (data.data && typeof data.data === 'object') {
          // Legacy object format - convert to array
          const symbolMap: { [key: string]: string } = {
            'bitcoin': 'BTC',
            'ethereum': 'ETH',
            'binancecoin': 'BNB',
            'cardano': 'ADA',
            'solana': 'SOL',
            'polkadot': 'DOT',
            'chainlink': 'LINK',
            'uniswap': 'UNI',
            'avalanche-2': 'AVAX'
          }

          processedPrices = Object.entries(data.data)
            .map(([key, value]: [string, any]) => ({
              symbol: symbolMap[key] || key.toUpperCase(),
              name: symbolMap[key] || key,
              price: value.usd || 0,
              change24h: value.usd_24h_change || 0,
              change1h: 0,
              change7d: 0,
              marketCap: value.usd_market_cap || 0,
              volume24h: value.usd_24h_vol || 0,
              lastUpdated: data.metadata?.lastUpdated || new Date().toISOString(),
              isRealTime: data.metadata?.isRealTime || false
            }))
            .filter((coin: CryptoPrice) => symbols.includes(coin.symbol))
        } else {
          throw new Error('Invalid response format')
        }

        setPrices(processedPrices)
        setIsRealTime(processedPrices.some(coin => coin.isRealTime) || data.metadata?.isRealTime || false)
        setError(null)
        setLastUpdate(new Date())
        console.log('✅ FloatingPriceTicker: Prices updated', processedPrices)
      } else {
        throw new Error('API returned unsuccessful response')
      }
    } catch (err) {
      console.error('❌ FloatingPriceTicker: Error fetching prices:', err)
      setError('Failed to fetch prices')
      setIsRealTime(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh prices
  useEffect(() => {
    fetchPrices()
    
    const interval = setInterval(fetchPrices, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval, symbols])

  // Auto-hide functionality
  useEffect(() => {
    if (!autoHide) return

    let hideTimer: NodeJS.Timeout
    const resetTimer = () => {
      clearTimeout(hideTimer)
      setIsVisible(true)
      hideTimer = setTimeout(() => setIsVisible(false), 5000)
    }

    const handleMouseMove = () => resetTimer()
    const handleScroll = () => resetTimer()

    resetTimer()
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)

    return () => {
      clearTimeout(hideTimer)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [autoHide])

  // Format price with appropriate decimals
  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    } else if (price >= 1) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    } else {
      return `$${price.toFixed(4)}`
    }
  }

  // Format percentage change
  const formatChange = (change: number): string => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
  }

  // Get change color
  const getChangeColor = (change: number): string => {
    return change >= 0 ? 'text-green-400' : 'text-red-400'
  }

  // Get trend icon
  const getTrendIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp className="w-3 h-3" /> : 
      <TrendingDown className="w-3 h-3" />
  }

  if (!isVisible && autoHide) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: position === 'bottom' ? 100 : -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === 'bottom' ? 100 : -100 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`
          fixed ${position === 'bottom' ? 'bottom-4' : 'top-4'} left-1/2 transform -translate-x-1/2
          z-50 max-w-6xl w-full mx-4
          ${className}
        `}
      >
        <div className="glass-card backdrop-blur-xl bg-black/20 border border-white/10 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRealTime ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">
                Live Prices
              </span>
              {error && (
                <span className="text-xs text-red-400 ml-2">
                  {error}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">
                {lastUpdate.toLocaleTimeString()}
              </span>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMinimized ? 
                  <Maximize2 className="w-4 h-4 text-white/70" /> : 
                  <Minimize2 className="w-4 h-4 text-white/70" />
                }
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          {/* Price Display */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center p-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                    <span className="ml-3 text-white/70">Loading prices...</span>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {prices.map((coin, index) => (
                        <motion.div
                          key={coin.symbol}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {coin.symbol.substring(0, 2)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {coin.symbol}
                              </div>
                              <div className="text-xs text-white/60">
                                {coin.name}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">
                              {formatPrice(coin.price)}
                            </div>
                            <div className={`text-sm flex items-center gap-1 ${getChangeColor(coin.change24h)}`}>
                              {getTrendIcon(coin.change24h)}
                              {formatChange(coin.change24h)}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Additional Info */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                      <div className="flex items-center gap-4">
                        <span>
                          Data: {isRealTime ? 'Real-time' : 'Cached'}
                        </span>
                        <span>
                          Auto-refresh: {refreshInterval / 1000}s
                        </span>
                      </div>
                      <button
                        onClick={fetchPrices}
                        className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors text-blue-400"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default FloatingPriceTicker
