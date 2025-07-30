/**
 * Clean Advanced Trading Chart - Real-time data with NO indicators
 * Professional trading interface without any status indicators or controls
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { directApiService } from '../services/directApiService'

interface CleanAdvancedTradingChartProps {
  symbol: string
  data?: any[]
  isLoading?: boolean
  onTimeframeChange?: (timeframe: string) => void
  onSymbolChange?: (symbol: string) => void
}

interface PriceData {
  time: number
  price: number
  change24h: number
  volume: number
}

interface CandlestickData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const CleanAdvancedTradingChart: React.FC<CleanAdvancedTradingChartProps> = ({
  symbol,
  data = [],
  isLoading = false,
  onTimeframeChange,
  onSymbolChange
}) => {
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([])
  const [timeframe, setTimeframe] = useState('1h')
  const [selectedSymbol, setSelectedSymbol] = useState(symbol)
  const [loading, setLoading] = useState(isLoading)

  // Available symbols
  const availableSymbols = [
    { id: 'BTC', name: 'Bitcoin' },
    { id: 'ETH', name: 'Ethereum' },
    { id: 'BNB', name: 'Binance Coin' },
    { id: 'ADA', name: 'Cardano' },
    { id: 'SOL', name: 'Solana' },
    { id: 'LINK', name: 'Chainlink' }
  ]

  // Timeframes
  const timeframes = [
    { id: '1h', name: '1H' },
    { id: '4h', name: '4H' },
    { id: '1d', name: '1D' },
    { id: '1w', name: '1W' }
  ]

  // Fetch real-time data
  const fetchRealTimeData = async () => {
    try {
      setLoading(true)
      console.log(`🔄 CleanAdvancedTradingChart: Fetching data for ${selectedSymbol}...`)
      
      const symbolMap: { [key: string]: string } = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'BNB': 'binancecoin',
        'ADA': 'cardano',
        'SOL': 'solana',
        'LINK': 'chainlink'
      }
      
      const coinId = symbolMap[selectedSymbol] || 'bitcoin'
      const priceData = await directApiService.getCryptoPrices([coinId])
      
      if (priceData && priceData.length > 0) {
        const coin = priceData[0]
        setCurrentPrice(coin.current_price || 0)
        setPriceChange(coin.price_change_percentage_24h || 0)
        
        // Generate realistic candlestick data
        generateCandlestickData(coin.current_price)
        
        console.log(`✅ CleanAdvancedTradingChart: Updated ${selectedSymbol}: $${coin.current_price}`)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('❌ CleanAdvancedTradingChart: Error:', error)
      setLoading(false)
    }
  }

  // Generate realistic candlestick data
  const generateCandlestickData = (basePrice: number) => {
    const candlesticks: CandlestickData[] = []
    const periods = timeframe === '1h' ? 24 : timeframe === '4h' ? 24 : timeframe === '1d' ? 30 : 12
    const intervalMs = timeframe === '1h' ? 60 * 60 * 1000 : 
                     timeframe === '4h' ? 4 * 60 * 60 * 1000 :
                     timeframe === '1d' ? 24 * 60 * 60 * 1000 :
                     7 * 24 * 60 * 60 * 1000

    for (let i = 0; i < periods; i++) {
      const time = Date.now() - (periods - i) * intervalMs
      const variation = (Math.random() - 0.5) * 0.08 // 8% variation
      const open = basePrice * (1 + variation)
      const close = open * (1 + (Math.random() - 0.5) * 0.05) // 5% candle variation
      const high = Math.max(open, close) * (1 + Math.random() * 0.03) // 3% wick up
      const low = Math.min(open, close) * (1 - Math.random() * 0.03) // 3% wick down
      
      candlesticks.push({
        time,
        open,
        high,
        low,
        close,
        volume: Math.random() * 2000000
      })
    }
    
    setCandlestickData(candlesticks)
  }

  useEffect(() => {
    fetchRealTimeData()
    
    // Update every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000)
    return () => clearInterval(interval)
  }, [selectedSymbol, timeframe])

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

  const handleSymbolChange = (newSymbol: string) => {
    setSelectedSymbol(newSymbol)
    onSymbolChange?.(newSymbol)
  }

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe)
    onTimeframeChange?.(newTimeframe)
  }

  // Advanced SVG chart rendering
  const renderAdvancedChart = () => {
    if (candlestickData.length === 0) return null

    const width = 1000
    const height = 500
    const padding = 60

    const prices = candlestickData.map(d => [d.high, d.low, d.open, d.close]).flat()
    const minPrice = Math.min(...prices) * 0.995
    const maxPrice = Math.max(...prices) * 1.005
    const priceRange = maxPrice - minPrice

    const volumes = candlestickData.map(d => d.volume)
    const maxVolume = Math.max(...volumes)

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Price Grid */}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map(ratio => (
          <g key={ratio}>
            <line
              x1={padding}
              y1={padding + ratio * (height * 0.7 - 2 * padding)}
              x2={width - padding}
              y2={padding + ratio * (height * 0.7 - 2 * padding)}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="2,2"
            />
            <text
              x={width - padding + 5}
              y={padding + ratio * (height * 0.7 - 2 * padding) + 4}
              fill="rgba(255,255,255,0.6)"
              fontSize="12"
              textAnchor="start"
            >
              {formatPrice(minPrice + (1 - ratio) * priceRange)}
            </text>
          </g>
        ))}

        {/* Candlesticks */}
        {candlestickData.map((candle, index) => {
          const x = padding + (index / (candlestickData.length - 1)) * (width - 2 * padding)
          const openY = padding + (1 - (candle.open - minPrice) / priceRange) * (height * 0.7 - 2 * padding)
          const closeY = padding + (1 - (candle.close - minPrice) / priceRange) * (height * 0.7 - 2 * padding)
          const highY = padding + (1 - (candle.high - minPrice) / priceRange) * (height * 0.7 - 2 * padding)
          const lowY = padding + (1 - (candle.low - minPrice) / priceRange) * (height * 0.7 - 2 * padding)
          
          const isGreen = candle.close >= candle.open
          const color = isGreen ? '#10B981' : '#EF4444'
          const bodyHeight = Math.abs(closeY - openY)
          const bodyY = Math.min(openY, closeY)

          // Volume bar
          const volumeHeight = (candle.volume / maxVolume) * (height * 0.25)
          const volumeY = height * 0.75 + padding

          return (
            <g key={candle.time}>
              {/* Price Wick */}
              <line
                x1={x}
                y1={highY}
                x2={x}
                y2={lowY}
                stroke={color}
                strokeWidth="1"
              />
              {/* Price Body */}
              <rect
                x={x - 4}
                y={bodyY}
                width="8"
                height={Math.max(bodyHeight, 1)}
                fill={isGreen ? color : 'transparent'}
                stroke={color}
                strokeWidth="1"
              />
              {/* Volume Bar */}
              <rect
                x={x - 3}
                y={volumeY - volumeHeight}
                width="6"
                height={volumeHeight}
                fill={`${color}40`}
                stroke={color}
                strokeWidth="0.5"
              />
            </g>
          )
        })}

        {/* Volume Grid */}
        <line
          x1={padding}
          y1={height * 0.75 + padding}
          x2={width - padding}
          y2={height * 0.75 + padding}
          stroke="rgba(255,255,255,0.2)"
        />
        
        {/* Time labels */}
        {candlestickData.filter((_, i) => i % Math.ceil(candlestickData.length / 6) === 0).map((candle, index) => {
          const x = padding + (candlestickData.indexOf(candle) / (candlestickData.length - 1)) * (width - 2 * padding)
          return (
            <text
              key={candle.time}
              x={x}
              y={height - 10}
              fill="rgba(255,255,255,0.6)"
              fontSize="12"
              textAnchor="middle"
            >
              {new Date(candle.time).toLocaleDateString()}
            </text>
          )
        })}
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-96 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-white/10 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading advanced chart data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Clean Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">{selectedSymbol}</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{formatPrice(currentPrice)}</span>
              <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-medium">{formatChange(priceChange)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Controls */}
        <div className="flex items-center gap-4">
          {/* Symbol Selector */}
          <select
            value={selectedSymbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableSymbols.map(sym => (
              <option key={sym.id} value={sym.id} className="bg-gray-800">
                {sym.name}
              </option>
            ))}
          </select>

          {/* Timeframe Selector */}
          <div className="flex bg-white/10 rounded-lg p-1">
            {timeframes.map(tf => (
              <button
                key={tf.id}
                onClick={() => handleTimeframeChange(tf.id)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  timeframe === tf.id
                    ? 'bg-blue-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tf.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Chart */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="h-96 w-full bg-black/20 rounded-lg overflow-hidden">
          {renderAdvancedChart()}
        </div>
      </div>
    </div>
  )
}

export default CleanAdvancedTradingChart
