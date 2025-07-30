/**
 * Real-Time Trading Chart - Live cryptocurrency data with bulletproof error handling
 * Fetches real data from crypto APIs and updates every 30 seconds
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Maximize2, 
  Minimize2,
  BarChart3,
  LineChart as LineChartIcon,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react'

interface RealTimeTradingChartProps {
  symbol?: string
  height?: number
  showControls?: boolean
  className?: string
}

interface PriceData {
  time: string
  price: number
  change24h: number
  volume: number
  marketCap: number
}

interface ChartPoint {
  x: number
  y: number
  price: number
  time: string
}

const RealTimeTradingChart: React.FC<RealTimeTradingChartProps> = ({
  symbol = 'BTC',
  height = 600,
  showControls = true,
  className = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '1d' | '1w' | '1m'>('1d')
  const [selectedSymbol, setSelectedSymbol] = useState(symbol)
  const [chartType, setChartType] = useState<'area' | 'candlestick'>('area')
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [currentData, setCurrentData] = useState<PriceData | null>(null)
  const [chartPoints, setChartPoints] = useState<ChartPoint[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Popular cryptocurrencies with their API IDs
  const availableSymbols = [
    { id: 'BTC', name: 'Bitcoin', apiId: 'bitcoin' },
    { id: 'ETH', name: 'Ethereum', apiId: 'ethereum' },
    { id: 'BNB', name: 'Binance Coin', apiId: 'binancecoin' },
    { id: 'ADA', name: 'Cardano', apiId: 'cardano' },
    { id: 'LINK', name: 'Chainlink', apiId: 'chainlink' },
    { id: 'SOL', name: 'Solana', apiId: 'solana' }
  ]

  // Fetch real-time cryptocurrency data
  const fetchRealTimeData = useCallback(async () => {
    try {
      setError(null)
      console.log(`🔄 Fetching real-time data for ${selectedSymbol}...`)
      
      const symbolData = availableSymbols.find(s => s.id === selectedSymbol)
      if (!symbolData) {
        throw new Error(`Symbol ${selectedSymbol} not found`)
      }

      // Fetch from our crypto prices API
      const response = await fetch('/.netlify/functions/crypto-prices', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success || !Array.isArray(result.data)) {
        throw new Error('Invalid API response format')
      }

      // Find the specific coin data
      const coinData = result.data.find((coin: any) => 
        coin.id === symbolData.apiId || coin.symbol?.toLowerCase() === selectedSymbol.toLowerCase()
      )

      if (!coinData) {
        throw new Error(`No data found for ${selectedSymbol}`)
      }

      // Create price data object
      const priceData: PriceData = {
        time: new Date().toISOString(),
        price: coinData.current_price || coinData.price || 0,
        change24h: coinData.price_change_percentage_24h || 0,
        volume: coinData.total_volume || 0,
        marketCap: coinData.market_cap || 0
      }

      setCurrentData(priceData)
      setIsConnected(true)

      // Add new point to chart
      const newPoint: ChartPoint = {
        x: Date.now(),
        y: priceData.price,
        price: priceData.price,
        time: new Date().toLocaleTimeString()
      }

      setChartPoints(prev => {
        const updated = [...prev, newPoint]
        // Keep last 50 points for performance
        return updated.slice(-50)
      })

      console.log(`✅ Real-time data updated for ${selectedSymbol}: $${priceData.price}`)
      
    } catch (error) {
      console.error('❌ Failed to fetch real-time data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch data')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }, [selectedSymbol, availableSymbols])

  // Initial data fetch and setup real-time updates
  useEffect(() => {
    let mounted = true
    let intervalId: NodeJS.Timeout | null = null

    const startRealTimeUpdates = async () => {
      if (!mounted) return
      
      // Initial fetch
      await fetchRealTimeData()
      
      if (!mounted) return

      // Set up real-time updates every 30 seconds
      intervalId = setInterval(() => {
        if (mounted) {
          fetchRealTimeData()
        }
      }, 30000)
    }

    startRealTimeUpdates()

    return () => {
      mounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [fetchRealTimeData])

  // Reset chart when symbol changes
  useEffect(() => {
    setChartPoints([])
    setCurrentData(null)
    setIsLoading(true)
    setError(null)
  }, [selectedSymbol])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`
    } else {
      return `$${price.toFixed(6)}`
    }
  }

  const formatChange = (change: number): string => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
  }

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(1)}B`
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(1)}M`
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(1)}K`
    }
    return `$${volume.toFixed(0)}`
  }

  // Generate SVG path for price chart
  const generateChartPath = (): string => {
    if (chartPoints.length < 2) return ''
    
    const width = 400
    const height = 200
    const padding = 20
    
    const prices = chartPoints.map(p => p.price)
    const minPrice = Math.min(...prices) * 0.995
    const maxPrice = Math.max(...prices) * 1.005
    const priceRange = maxPrice - minPrice || 1
    
    const points = chartPoints.map((point, index) => {
      const x = padding + (index / (chartPoints.length - 1)) * (width - 2 * padding)
      const y = padding + (1 - (point.price - minPrice) / priceRange) * (height - 2 * padding)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    
    return points.join(' ')
  }

  const chartPath = generateChartPath()
  const isPositive = currentData ? currentData.change24h >= 0 : true

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-900/80 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden ${className}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          {/* Symbol and Price */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{selectedSymbol}/USD</h3>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
              </div>
            </div>
            
            {currentData && (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold text-white">
                  {formatPrice(currentData.price)}
                </span>
                <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="font-semibold">
                    {formatChange(currentData.change24h)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Volume and Market Cap */}
          {currentData && (
            <div className="hidden md:flex flex-col gap-1 text-sm">
              <div className="text-white/60">
                Volume: <span className="text-white">{formatVolume(currentData.volume)}</span>
              </div>
              <div className="text-white/60">
                Market Cap: <span className="text-white">{formatVolume(currentData.marketCap)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex items-center gap-2">
            {/* Symbol Selector */}
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableSymbols.map(sym => (
                <option key={sym.id} value={sym.id} className="bg-gray-800">
                  {sym.name} ({sym.id})
                </option>
              ))}
            </select>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Chart Content */}
      <div className="p-6" style={{ height: 'calc(100% - 100px)' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Activity className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-white/60">Loading real-time data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-sm">!</span>
              </div>
              <p className="text-red-400 mb-2">Connection Error</p>
              <p className="text-white/60 text-sm">{error}</p>
              <button 
                onClick={fetchRealTimeData}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-black/20 rounded-lg overflow-hidden flex items-center justify-center">
            {chartPoints.length > 1 ? (
              <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                  <line
                    key={ratio}
                    x1={20}
                    y1={20 + ratio * 160}
                    x2={380}
                    y2={20 + ratio * 160}
                    stroke="rgba(255,255,255,0.1)"
                    strokeDasharray="2,2"
                  />
                ))}
                
                {/* Price line */}
                <path
                  d={chartPath}
                  fill="none"
                  stroke={isPositive ? '#10B981' : '#EF4444'}
                  strokeWidth="2"
                  className="drop-shadow-sm"
                />
                
                {/* Price points */}
                {chartPoints.map((point, index) => {
                  const prices = chartPoints.map(p => p.price)
                  const minPrice = Math.min(...prices) * 0.995
                  const maxPrice = Math.max(...prices) * 1.005
                  const priceRange = maxPrice - minPrice || 1
                  
                  const x = 20 + (index / (chartPoints.length - 1)) * 360
                  const y = 20 + (1 - (point.price - minPrice) / priceRange) * 160
                  
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="2"
                      fill={isPositive ? '#10B981' : '#EF4444'}
                      className="opacity-60"
                    />
                  )
                })}
              </svg>
            ) : (
              <div className="text-center">
                <Clock className="w-8 h-8 text-white/40 mx-auto mb-2" />
                <p className="text-white/60">Collecting real-time data...</p>
                <p className="text-white/40 text-sm">Updates every 30 seconds</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default RealTimeTradingChart
