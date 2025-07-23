import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, RefreshCw, WifiOff, Activity } from 'lucide-react'

interface CryptoPrice {
  id: number
  symbol: string
  name: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
  rank: number
  lastUpdated: string
}

interface TickerState {
  prices: CryptoPrice[]
  isLoading: boolean
  isConnected: boolean
  lastUpdated: Date | null
  error: string | null
  updateCount: number
  dataSource: string
}

const PriceTicker: React.FC = () => {
  const [state, setState] = useState<TickerState>({
    prices: [],
    isLoading: true,
    isConnected: false,
    lastUpdated: null,
    error: null,
    updateCount: 0,
    dataSource: 'CoinMarketCap'
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch real-time prices from backend (which uses CoinMarketCap API)
  const fetchRealTimePrices = useCallback(async (showLogs = true) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      if (showLogs) {
        console.log('🚀 PriceTicker: Fetching REAL-TIME prices from CoinMarketCap via backend...')
      }

      setState(prev => ({ ...prev, isLoading: true }))

      // Call backend API which proxies CoinMarketCap
      const timestamp = Date.now()
      const response = await fetch(`/api/v2/blockchain/prices/live?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`Backend API Error: ${response.status} ${response.statusText}`)
      }

      const apiData = await response.json()

      if (showLogs) {
        console.log('✅ PriceTicker: Backend API Response:', apiData)
      }

      // Check if backend returned CoinMarketCap format or old format
      let transformedPrices: CryptoPrice[] = []

      if (apiData.success && Array.isArray(apiData.data)) {
        // New CoinMarketCap format from backend
        transformedPrices = apiData.data
          .slice(0, 10)
          .map((crypto: any, index: number) => ({
            id: crypto.id || index + 1,
            symbol: crypto.symbol,
            name: crypto.name,
            price: crypto.price,
            change24h: crypto.change24h,
            marketCap: crypto.marketCap,
            volume24h: crypto.volume24h,
            rank: crypto.rank || index + 1,
            lastUpdated: new Date().toISOString()
          }))
      } else if (apiData.success && apiData.data && typeof apiData.data === 'object') {
        // Old format - transform to new format
        transformedPrices = Object.entries(apiData.data)
          .map(([key, value]: [string, any], index) => ({
            id: index + 1,
            symbol: key.toUpperCase(),
            name: key,
            price: value.usd || 0,
            change24h: value.usd_24h_change || 0,
            marketCap: value.usd_market_cap || 0,
            volume24h: value.usd_24h_vol || 0,
            rank: index + 1,
            lastUpdated: new Date().toISOString()
          }))
          .filter((price: CryptoPrice) => price.price > 0)
          .slice(0, 10)
      } else {
        throw new Error('Invalid API response structure')
      }

      if (showLogs) {
        console.log('🎯 PriceTicker: Transformed prices:', transformedPrices)
        console.log('💰 Current BTC Price:', transformedPrices.find(p => p.symbol === 'BTC')?.price)
        console.log('💰 Current ETH Price:', transformedPrices.find(p => p.symbol === 'ETH')?.price)
      }

      setState(prev => ({
        ...prev,
        prices: transformedPrices,
        isLoading: false,
        isConnected: true,
        lastUpdated: new Date(),
        error: null,
        updateCount: prev.updateCount + 1,
        dataSource: apiData.dataSource || 'CoinMarketCap Pro API'
      }))

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🎯 PriceTicker: Request aborted')
        return
      }

      console.error('❌ PriceTicker: Error fetching prices:', error)

      // Gracefully handle errors without triggering global error handler
      setState(prev => ({
        ...prev,
        isLoading: false,
        isConnected: false,
        error: error.message,
        updateCount: prev.updateCount + 1
      }))

      // Don't re-throw the error to prevent it from bubbling up to global handlers
      // This prevents the connection error screen from appearing
    }
  }, [])



  // Manual refresh function
  const handleManualRefresh = useCallback(() => {
    console.log('🔄 PriceTicker: Manual refresh triggered')
    setState(prev => ({ ...prev, isLoading: true }))
    fetchRealTimePrices(true)
  }, [fetchRealTimePrices])

  // Setup automatic updates
  useEffect(() => {
    console.log('🚀 PriceTicker: Component mounted - starting CoinMarketCap real-time updates')

    // Initial fetch from CoinMarketCap
    fetchRealTimePrices(true)

    // Setup interval for automatic updates every 5 seconds
    intervalRef.current = setInterval(() => {
      fetchRealTimePrices(false) // Silent updates
    }, 5000)

    // Cleanup on unmount
    return () => {
      console.log('🛑 PriceTicker: Component unmounting - cleaning up')
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchRealTimePrices])

  // Format price display
  const formatPrice = useCallback((price: number | undefined | null): string => {
    if (!price || isNaN(price)) return '$0.00'
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(2)}M`
    }
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    }
    if (price >= 1) {
      return `$${price.toFixed(2)}`
    }
    return `$${price.toFixed(4)}`
  }, [])

  // Format percentage change
  const formatChange = useCallback((change: number | undefined | null): string => {
    if (!change || isNaN(change)) return '0.00%'
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }, [])

  // Loading state
  if (state.isLoading && state.prices.length === 0) {
    return (
      <div className="bg-gradient-to-r from-black/30 via-black/20 to-black/30 backdrop-blur-sm border-b border-white/10 py-4">
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
          <span className="text-white/70 text-sm font-medium">Loading real-time crypto prices...</span>
        </div>
      </div>
    )
  }

  // Error state (with retry)
  if (state.error && state.prices.length === 0) {
    return (
      <div className="bg-gradient-to-r from-red-900/20 via-red-800/20 to-red-900/20 backdrop-blur-sm border-b border-red-500/20 py-4">
        <div className="flex items-center justify-center gap-3">
          <WifiOff className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm">Failed to load prices</span>
          <button
            onClick={handleManualRefresh}
            className="text-red-400 hover:text-red-300 transition-colors"
            title="Retry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-black/30 via-black/20 to-black/30 backdrop-blur-sm border-b border-white/10 py-4 overflow-hidden relative">
      {/* Status bar */}
      <div className="absolute top-1 right-2 z-10 flex items-center gap-2">
        <button
          onClick={handleManualRefresh}
          disabled={state.isLoading}
          className={`transition-colors ${
            state.isLoading
              ? 'text-white/30 cursor-not-allowed'
              : 'text-white/60 hover:text-white/80'
          }`}
          title="Refresh prices"
        >
          <RefreshCw className={`w-4 h-4 ${state.isLoading ? 'animate-spin' : ''}`} />
        </button>

        <div className="flex items-center gap-1">
          {state.isConnected ? (
            <Activity className="w-3 h-3 text-green-400 animate-pulse" />
          ) : (
            <WifiOff className="w-3 h-3 text-red-400" />
          )}
          <span className={`text-xs px-2 py-1 rounded-full border ${
            state.isConnected
              ? 'bg-green-500/20 text-green-400 border-green-500/30'
              : 'bg-red-500/20 text-red-400 border-red-500/30'
          }`}>
            {state.isConnected ? 'LIVE' : 'OFFLINE'} • {state.dataSource}
            {state.lastUpdated && (
              <span className="ml-1 opacity-70">
                {state.lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Scrolling ticker */}
      <motion.div
        key={state.updateCount} // Force re-render on updates
        className="flex items-center gap-8"
        animate={{ x: [-100, -2000] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Duplicate prices for seamless scrolling */}
        {[...state.prices, ...state.prices, ...state.prices].map((crypto, index) => (
          <motion.div
            key={`${crypto.id}-${index}-${state.updateCount}`}
            className="flex items-center gap-3 whitespace-nowrap bg-white/5 rounded-lg px-4 py-2 border border-white/10 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderColor: "rgba(255,255,255,0.2)"
            }}
          >
            <span className="text-white font-bold text-sm tracking-wide">
              {crypto.symbol}
            </span>
            <span className="text-white font-semibold text-lg">
              {formatPrice(crypto.price)}
            </span>
            <div className="flex items-center gap-1">
              {(crypto.change24h || 0) >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${
                (crypto.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatChange(crypto.change24h)}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default PriceTicker
