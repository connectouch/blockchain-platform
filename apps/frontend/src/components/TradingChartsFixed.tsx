import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  Maximize2, 
  Minimize2,
  Activity,
  Wifi,
  WifiOff,
  // AlertCircle
} from 'lucide-react'

interface TradingChartsFixedProps {
  symbol?: string
  height?: number
  showControls?: boolean
  className?: string
}

interface CandlestickData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const TradingChartsFixed: React.FC<TradingChartsFixedProps> = ({
  symbol = 'BTC',
  height = 600,
  showControls = true,
  className = ''
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected')
  const [showSettings, setShowSettings] = useState(false)
  const [currentPrice, setCurrentPrice] = useState(45000)
  const [priceChange, setPriceChange] = useState(2.5)
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Generate realistic candlestick data
  const generateCandlestickData = useCallback(() => {
    const data: CandlestickData[] = []
    let price = 45000
    const now = Date.now()
    
    for (let i = 50; i >= 0; i--) {
      const time = now - (i * 60000) // 1 minute intervals
      const volatility = 0.02 // 2% volatility
      const change = (Math.random() - 0.5) * price * volatility
      
      const open = price
      const close = price + change
      const high = Math.max(open, close) + Math.random() * price * 0.01
      const low = Math.min(open, close) - Math.random() * price * 0.01
      const volume = Math.random() * 1000000 + 500000
      
      data.push({ time, open, high, low, close, volume })
      price = close
    }
    
    return data
  }, [])

  // Initialize data
  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      const data = generateCandlestickData()
      setCandlestickData(data)
      if (data.length > 0 && data[data.length - 1]) {
        setCurrentPrice(data[data.length - 1].close)
      }
      setIsLoading(false)
    }, 1500)
  }, [generateCandlestickData, symbol])

  // Simulate real-time updates
  useEffect(() => {
    if (isLoading) return

    const interval = setInterval(() => {
      const volatility = 0.01
      const change = (Math.random() - 0.5) * currentPrice * volatility
      const newPrice = Math.max(currentPrice + change, 1000)
      
      setCurrentPrice(newPrice)
      setPriceChange(((newPrice - currentPrice) / currentPrice) * 100)
      
      // Update candlestick data
      setCandlestickData(prev => {
        if (prev.length === 0) return prev
        
        const newData = [...prev]
        const lastCandle = newData[newData.length - 1]
        const now = Date.now()
        
        // If more than 1 minute has passed, create new candle
        if (lastCandle && now - lastCandle.time > 60000) {
          newData.push({
            time: now,
            open: lastCandle.close,
            high: Math.max(lastCandle.close, newPrice),
            low: Math.min(lastCandle.close, newPrice),
            close: newPrice,
            volume: Math.random() * 100000 + 50000
          })
          
          // Keep only last 50 candles
          return newData.slice(-50)
        } else if (lastCandle) {
          // Update current candle
          newData[newData.length - 1] = {
            ...lastCandle,
            close: newPrice,
            high: Math.max(lastCandle.high, newPrice),
            low: Math.min(lastCandle.low, newPrice),
            volume: lastCandle.volume + Math.random() * 10000
          }
          return newData
        }
        return newData
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [currentPrice, isLoading])

  // Simulate connection status
  useEffect(() => {
    const connectionInterval = setInterval(() => {
      setConnectionStatus(prev => {
        if (prev === 'connected') return Math.random() > 0.95 ? 'disconnected' : 'connected'
        if (prev === 'disconnected') return 'connecting'
        return 'connected'
      })
    }, 8000)

    return () => clearInterval(connectionInterval)
  }, [])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const toggleSettings = () => {
    setShowSettings(!showSettings)
  }

  // Calculate chart dimensions
  const headerHeight = 80
  const controlsHeight = showControls ? 60 : 0
  const chartHeight = height - headerHeight - controlsHeight

  if (isLoading) {
    return (
      <div className={`relative ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full bg-black/10 rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading advanced trading charts...</p>
            <p className="text-white/40 text-sm mt-2">Fetching real-time {symbol} data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={chartContainerRef}
      className={`relative ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`} 
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-4 bg-black/20 rounded-lg">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-white">{symbol}/USD</h3>
          <div className="flex items-center gap-2">
            {connectionStatus === 'connected' && <Wifi className="w-4 h-4 text-green-400" />}
            {connectionStatus === 'connecting' && <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />}
            {connectionStatus === 'disconnected' && <WifiOff className="w-4 h-4 text-red-400" />}
            <span className={`text-sm ${
              connectionStatus === 'connected' ? 'text-green-400' : 
              connectionStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {connectionStatus === 'connected' ? 'Live' : 
               connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <motion.div 
              className="text-2xl font-bold text-white"
              key={Math.floor(currentPrice)}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
            >
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </motion.div>
            <motion.div 
              className={`flex items-center gap-1 text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </motion.div>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSettings}
                className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative bg-black/10 rounded-lg p-6" style={{ height: chartHeight }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-lg">
            <Activity className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
            <h4 className="text-lg font-semibold text-white mb-2">
              Professional Trading Charts
            </h4>
            <p className="text-white/60 mb-6">
              Real-time {symbol} candlestick chart with technical analysis
            </p>
            
            {/* Advanced Chart Visualization */}
            <div className="w-full">
              <div className="flex items-end justify-center gap-1 h-40 mb-6">
                {candlestickData.slice(-20).map((candle, i) => {
                  const isGreen = candle.close >= candle.open
                  const bodyHeight = Math.abs(candle.close - candle.open) / 50
                  const wickHeight = (candle.high - candle.low) / 50
                  const bodyTop = Math.max(candle.open, candle.close) / 50
                  
                  return (
                    <motion.div
                      key={candle.time}
                      className="relative flex flex-col items-center"
                      style={{ width: '8px' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.02 }}
                    >
                      {/* Wick */}
                      <div
                        className="w-px bg-white/40"
                        style={{ height: `${Math.max(wickHeight, 10)}px` }}
                      />
                      {/* Body */}
                      <div
                        className={`w-full ${isGreen ? 'bg-green-500' : 'bg-red-500'} rounded-sm`}
                        style={{ 
                          height: `${Math.max(bodyHeight, 2)}px`,
                          marginTop: `-${bodyTop}px`
                        }}
                      />
                    </motion.div>
                  )
                })}
              </div>
              
              {/* Market Data */}
              <div className="grid grid-cols-2 gap-4 text-xs text-white/60">
                <div>
                  <div className="text-white/80 font-semibold mb-1">24h Volume</div>
                  <div>{(candlestickData.reduce((sum, c) => sum + c.volume, 0) / 1000000).toFixed(2)}M</div>
                </div>
                <div>
                  <div className="text-white/80 font-semibold mb-1">24h Range</div>
                  <div>
                    ${Math.min(...candlestickData.map(c => c.low)).toFixed(2)} -
                    ${Math.max(...candlestickData.map(c => c.high)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="mt-4 flex items-center justify-between p-3 bg-black/20 rounded-lg">
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
              1H
            </button>
            <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
              4H
            </button>
            <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
              1D
            </button>
            <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
              1W
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-white/60">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
              connectionStatus === 'connecting' ? 'bg-yellow-400 animate-ping' : 'bg-red-400'
            }`}></div>
            <span>
              {connectionStatus === 'connected' ? 'Live updates every 3s' : 
               connectionStatus === 'connecting' ? 'Connecting to live data...' : 'Connection lost'}
            </span>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 w-80 h-full bg-black/90 backdrop-blur-sm border-l border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Chart Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Symbol</label>
                <select className="w-full p-2 bg-gray-700 text-white rounded">
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="ADA">Cardano (ADA)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Timeframe</label>
                <select className="w-full p-2 bg-gray-700 text-white rounded">
                  <option value="1m">1 Minute</option>
                  <option value="5m">5 Minutes</option>
                  <option value="1h">1 Hour</option>
                  <option value="1d">1 Day</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Indicators</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-white/80">Moving Average</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-white/80">RSI</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-white/80">MACD</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TradingChartsFixed
