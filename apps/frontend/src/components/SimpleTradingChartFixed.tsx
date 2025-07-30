/**
 * Simple Trading Chart Fixed - Minimal implementation with error handling
 * Clean interface with real-time data and proper error boundaries
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface SimpleTradingChartFixedProps {
  symbol?: string
  height?: number
  className?: string
}

const SimpleTradingChartFixed: React.FC<SimpleTradingChartFixedProps> = ({
  symbol = 'BTC',
  height = 600,
  className = ''
}) => {
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real-time price data with proper error handling
  const fetchPriceData = async () => {
    try {
      setError(null)
      console.log(`🔄 SimpleTradingChartFixed: Fetching data for ${symbol}...`)
      
      // Use the Netlify function directly
      const response = await fetch('/.netlify/functions/crypto-prices')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.data && Array.isArray(result.data)) {
        // Find the symbol in the data
        const symbolMap: { [key: string]: string } = {
          'BTC': 'BTC',
          'ETH': 'ETH', 
          'BNB': 'BNB',
          'ADA': 'ADA',
          'SOL': 'SOL',
          'LINK': 'LINK'
        }
        
        const targetSymbol = symbolMap[symbol] || 'BTC'
        const coin = result.data.find((c: any) => c.symbol === targetSymbol)
        
        if (coin) {
          setCurrentPrice(coin.price || 0)
          setPriceChange(coin.price_change_percentage_24h || 0)
          console.log(`✅ SimpleTradingChartFixed: Updated ${symbol}: $${coin.price}`)
        } else {
          // Fallback to first coin if symbol not found
          const firstCoin = result.data[0]
          setCurrentPrice(firstCoin.price || 0)
          setPriceChange(firstCoin.price_change_percentage_24h || 0)
          console.log(`⚠️ SimpleTradingChartFixed: Symbol ${symbol} not found, using ${firstCoin.symbol}`)
        }
      } else {
        throw new Error('Invalid response format from API')
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('❌ SimpleTradingChartFixed: Error fetching price data:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      
      // Set fallback data
      setCurrentPrice(45000)
      setPriceChange(2.5)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPriceData()
    
    // Update every 30 seconds
    const interval = setInterval(fetchPriceData, 30000)
    return () => clearInterval(interval)
  }, [symbol])

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

  // Simple chart visualization
  const renderSimpleChart = () => {
    const points = []
    const basePrice = currentPrice || 45000
    
    // Generate 20 data points for a simple line chart
    for (let i = 0; i < 20; i++) {
      const variation = (Math.random() - 0.5) * 0.05 // 5% variation
      const price = basePrice * (1 + variation)
      points.push(price)
    }
    
    const minPrice = Math.min(...points) * 0.995
    const maxPrice = Math.max(...points) * 1.005
    const priceRange = maxPrice - minPrice
    
    const width = 400
    const height = 200
    const padding = 20
    
    const pathData = points.map((price, index) => {
      const x = padding + (index / (points.length - 1)) * (width - 2 * padding)
      const y = padding + (1 - (price - minPrice) / priceRange) * (height - 2 * padding)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <line
            key={ratio}
            x1={padding}
            y1={padding + ratio * (height - 2 * padding)}
            x2={width - padding}
            y2={padding + ratio * (height - 2 * padding)}
            stroke="rgba(255,255,255,0.1)"
            strokeDasharray="2,2"
          />
        ))}
        
        {/* Price line */}
        <path
          d={pathData}
          fill="none"
          stroke={priceChange >= 0 ? '#10B981' : '#EF4444'}
          strokeWidth="2"
          className="drop-shadow-sm"
        />
        
        {/* Price points */}
        {points.map((price, index) => {
          const x = padding + (index / (points.length - 1)) * (width - 2 * padding)
          const y = padding + (1 - (price - minPrice) / priceRange) * (height - 2 * padding)
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={priceChange >= 0 ? '#10B981' : '#EF4444'}
              className="opacity-60"
            />
          )
        })}
      </svg>
    )
  }

  if (error) {
    return (
      <div 
        className={`bg-gray-900/80 backdrop-blur-sm rounded-xl border border-red-500/20 p-6 ${className}`}
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-sm">!</span>
            </div>
            <p className="text-red-400 mb-2">Chart Error</p>
            <p className="text-white/60 text-sm">{error}</p>
            <button 
              onClick={fetchPriceData}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div 
        className={`bg-gray-900/80 backdrop-blur-sm rounded-xl border border-white/10 p-6 ${className}`}
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading chart data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-900/80 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* Clean Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">{symbol}/USD</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl font-bold text-white">
                {formatPrice(currentPrice)}
              </span>
              <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <span className="text-lg font-semibold">
                  {formatChange(priceChange)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-white/60">LIVE</span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-6" style={{ height: 'calc(100% - 120px)' }}>
        <div className="w-full h-full bg-black/20 rounded-lg overflow-hidden flex items-center justify-center">
          {renderSimpleChart()}
        </div>
      </div>
    </motion.div>
  )
}

export default SimpleTradingChartFixed
