import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Settings,
  Maximize2,
  Minimize2,
  Activity,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react'
import { useChartStore } from '../stores/useChartStore'
import { websocketService } from '../services/websocketService'
import CandlestickChart from './charts/CandlestickChart'
import VolumeChart from './charts/VolumeChart'
import IndicatorChart from './charts/IndicatorChart'
import ChartControls from './charts/ChartControls'
import ChartToolbar from './charts/ChartToolbar'
import PriceAlerts from './charts/PriceAlerts'
import { TimeFrame, TIMEFRAME_LABELS } from '../types/chart'

interface TradingChartsProps {
  symbol?: string
  height?: number
  showControls?: boolean
  className?: string
}

const TradingCharts: React.FC<TradingChartsProps> = ({
  symbol = 'BTC',
  height = 600,
  showControls = true,
  className = ''
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected')
  const [showSettings, setShowSettings] = useState(false)

  // Helper function to safely get price data
  const getCurrentPrice = () => {
    return data?.candlesticks && data.candlesticks.length > 0
      ? data.candlesticks[data.candlesticks.length - 1]?.close || 0
      : 0
  }

  const getPreviousPrice = () => {
    return data?.candlesticks && data.candlesticks.length > 1
      ? data.candlesticks[data.candlesticks.length - 2]?.close || 0
      : 0
  }

  const getPriceChange = () => {
    const current = getCurrentPrice()
    const previous = getPreviousPrice()
    if (current > 0 && previous > 0) {
      return {
        absolute: current - previous,
        percentage: ((current - previous) / previous) * 100
      }
    }
    return { absolute: 0, percentage: 0 }
  }

  // Safe store access with error handling
  const storeState = useChartStore()
  const {
    config = { symbol: 'BTC', timeframe: '1h' as const, showVolume: true, showGrid: true, theme: 'dark' as const, indicators: [], drawingTools: [] },
    data = { candlesticks: [], volume: [], indicators: {} },
    isLoading = false,
    error = null,
    lastUpdate = new Date(),
    setSymbol,
    setTimeframe,
    loadChartData,
    updateCandlestick
  } = storeState || {}

  // Initialize chart data and WebSocket connection
  useEffect(() => {
    try {
      // Set initial symbol
      if (setSymbol && symbol !== config?.symbol) {
        setSymbol(symbol)
      }

      // Load initial chart data
      if (loadChartData) {
        loadChartData()
      }

      // Setup WebSocket callbacks
      websocketService.setCallbacks({
      onConnect: () => {
        setConnectionStatus('connected')
        console.log('📊 Chart WebSocket connected')
        // Subscribe to current symbol when connected
        websocketService.subscribeToCandlesticks(config.symbol, config.timeframe)
      },
      onDisconnect: () => {
        setConnectionStatus('disconnected')
        console.log('📊 Chart WebSocket disconnected')
      },
      onError: (error) => {
        setConnectionStatus('disconnected')
        console.error('📊 Chart WebSocket error:', error)
      },
      onCandlestickUpdate: (updateSymbol, candlestick) => {
        console.log('📈 Received candlestick update for', updateSymbol, candlestick)
        if (updateSymbol === config.symbol) {
          updateCandlestick(candlestick)
        }
      },
      onTickerUpdate: (ticker) => {
        console.log('📊 Received ticker update:', ticker)
        if (ticker.symbol === config.symbol) {
          // Update the latest price in real-time
          const latestCandlestick = {
            time: ticker.timestamp,
            open: ticker.price,
            high: ticker.price,
            low: ticker.price,
            close: ticker.price,
            volume: ticker.volume24h || 0
          }
          updateCandlestick(latestCandlestick)
        }
      }
    })

      // Subscribe to real-time data
      if (websocketService.isConnected()) {
        websocketService.subscribeToCandlesticks(config.symbol, config.timeframe)
      }
    } catch (error) {
      console.error('Error initializing TradingCharts:', error)
      setConnectionStatus('disconnected')
    }

    return () => {
      try {
        // Cleanup subscriptions
        websocketService.unsubscribeFromCandlesticks(config.symbol, config.timeframe)
      } catch (error) {
        console.error('Error cleaning up TradingCharts:', error)
      }
    }
  }, [symbol, config?.symbol, config?.timeframe, setSymbol, loadChartData])

  // Handle connection status changes
  useEffect(() => {
    setConnectionStatus(websocketService.getConnectionStatus())
    
    const checkConnection = setInterval(() => {
      setConnectionStatus(websocketService.getConnectionStatus())
    }, 5000)

    return () => clearInterval(checkConnection)
  }, [])

  // Handle timeframe changes
  const handleTimeframeChange = (timeframe: TimeFrame) => {
    // Unsubscribe from current timeframe
    websocketService.unsubscribeFromCandlesticks(config.symbol, config.timeframe)
    
    // Update timeframe
    setTimeframe(timeframe)
    
    // Subscribe to new timeframe
    if (websocketService.isConnected()) {
      websocketService.subscribeToCandlesticks(config.symbol, timeframe)
    }
  }

  // Handle symbol changes
  const handleSymbolChange = (newSymbol: string) => {
    // Unsubscribe from current symbol
    websocketService.unsubscribeFromCandlesticks(config.symbol, config.timeframe)
    
    // Update symbol
    setSymbol(newSymbol)
    
    // Subscribe to new symbol
    if (websocketService.isConnected()) {
      websocketService.subscribeToCandlesticks(newSymbol, config.timeframe)
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Connection status indicator
  const ConnectionIndicator = () => (
    <div className="flex items-center gap-2 text-sm">
      {connectionStatus === 'connected' && (
        <>
          <Wifi className="w-4 h-4 text-green-400" />
          <span className="text-green-400">Live</span>
        </>
      )}
      {connectionStatus === 'connecting' && (
        <>
          <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span className="text-yellow-400">Connecting...</span>
        </>
      )}
      {connectionStatus === 'disconnected' && (
        <>
          <WifiOff className="w-4 h-4 text-red-400" />
          <span className="text-red-400">Offline</span>
        </>
      )}
    </div>
  )

  // Calculate chart dimensions
  const chartHeight = isFullscreen ? window.innerHeight - 100 : height
  const candlestickHeight = Math.floor(chartHeight * 0.7)
  const volumeHeight = Math.floor(chartHeight * 0.15)
  const indicatorHeight = Math.floor(chartHeight * 0.15)

  if (error) {
    return (
      <div className={`bg-red-500/10 border border-red-500/20 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Chart Error</h3>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      ref={chartContainerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden ${
        isFullscreen ? 'fixed inset-4 z-50' : ''
      } ${className}`}
      style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : height }}
    >
      {/* Chart Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">{config.symbol}</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">{config.symbol}/USD</h3>
              <p className="text-white/60 text-sm">{TIMEFRAME_LABELS[config.timeframe]}</p>
            </div>
          </div>

          {/* Enhanced Live Price Display */}
          {data.candlesticks.length > 0 && (
            <div className="flex items-center gap-4">
              {/* Animated Price Badge */}
              <motion.div
                key={data.candlesticks[data.candlesticks.length - 1]?.close}
                initial={{ scale: 1.1, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`px-4 py-2 rounded-lg border-2 ${
                  getCurrentPrice() > 0 && getPreviousPrice() > 0 && getCurrentPrice() >= getPreviousPrice()
                    ? 'border-green-400 bg-green-400/10'
                    : 'border-red-400 bg-red-400/10'
                }`}
              >
                <span className="text-3xl font-bold text-white">
                  ${getCurrentPrice().toLocaleString()}
                </span>
              </motion.div>

              {/* Live Price Change Indicator */}
              {getCurrentPrice() > 0 && getPreviousPrice() > 0 && (
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{
                      rotate: getCurrentPrice() >= getPreviousPrice() ? 0 : 180
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <TrendingUp className={`w-6 h-6 ${
                      getCurrentPrice() >= getPreviousPrice()
                        ? 'text-green-400' : 'text-red-400'
                    }`} />
                  </motion.div>
                  <div className="flex flex-col">
                    <span className={`text-lg font-semibold ${
                      getCurrentPrice() >= getPreviousPrice()
                        ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {getPriceChange().percentage.toFixed(2)}%
                    </span>
                    <span className="text-xs text-white/60">
                      ${Math.abs(getPriceChange().absolute).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Live Update Pulse */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-3 h-3 bg-green-400 rounded-full"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ConnectionIndicator />
          
          {showControls && (
            <>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Chart Toolbar */}
      {showControls && (
        <ChartToolbar
          symbol={config.symbol}
          timeframe={config.timeframe}
          onSymbolChange={handleSymbolChange}
          onTimeframeChange={handleTimeframeChange}
        />
      )}

      {/* Chart Content */}
      <div className="relative flex-1 overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-3 text-white/60">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading chart data...</span>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Main Candlestick Chart */}
            <div style={{ height: candlestickHeight }}>
              {data?.candlesticks && data.candlesticks.length > 0 ? (
                <CandlestickChart
                  data={data.candlesticks}
                  indicators={data.indicators || {}}
                  config={config}
                  height={candlestickHeight}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/60">
                  <div className="text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No chart data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Volume Chart */}
            {config?.showVolume && data?.volume && data.volume.length > 0 && (
              <div style={{ height: volumeHeight }} className="border-t border-white/10">
                <VolumeChart
                  data={data.volume}
                  height={volumeHeight}
                />
              </div>
            )}

            {/* Indicator Charts */}
            {config?.indicators && config.indicators.some(ind => ind.enabled && ['RSI', 'MACD'].includes(ind.type)) && (
              <div style={{ height: indicatorHeight }} className="border-t border-white/10">
                <IndicatorChart
                  indicators={data?.indicators || {}}
                  config={config}
                  height={indicatorHeight}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart Controls Panel */}
      <AnimatePresence>
        {showSettings && showControls && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 right-0 h-full w-80 bg-black/90 backdrop-blur-sm border-l border-white/10 overflow-y-auto"
          >
            <ChartControls onClose={() => setShowSettings(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price Alerts */}
      <PriceAlerts />

      {/* Last Update Indicator */}
      <div className="absolute bottom-2 right-2 text-xs text-white/40">
        Last update: {lastUpdate.toLocaleTimeString()}
      </div>
    </motion.div>
  )
}

export default TradingCharts
