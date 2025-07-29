import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity, Wifi, WifiOff } from 'lucide-react'

interface TradingChartsSimpleProps {
  symbol?: string
  height?: number
  showControls?: boolean
  className?: string
}

interface MockPriceData {
  time: string
  price: number
  change: number
  volume: number
}

const TradingChartsSimple: React.FC<TradingChartsSimpleProps> = ({
  symbol = 'BTC',
  height = 600,
  showControls = true,
  className = ''
}) => {
  const [isConnected, setIsConnected] = useState(true)
  const [currentPrice, setCurrentPrice] = useState(45000)
  const [priceChange, setPriceChange] = useState(2.5)
  const [mockData, setMockData] = useState<MockPriceData[]>([])

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 100
      setCurrentPrice(prev => Math.max(prev + change, 1000))
      setPriceChange((Math.random() - 0.5) * 5)
      
      // Add new data point
      setMockData(prev => {
        const newPoint: MockPriceData = {
          time: new Date().toLocaleTimeString(),
          price: currentPrice,
          change: priceChange,
          volume: Math.random() * 1000000
        }
        return [...prev.slice(-20), newPoint] // Keep last 20 points
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [currentPrice, priceChange])

  // Simulate connection status
  useEffect(() => {
    const connectionInterval = setInterval(() => {
      setIsConnected(Math.random() > 0.1) // 90% uptime
    }, 10000)

    return () => clearInterval(connectionInterval)
  }, [])

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-black/20 rounded-lg">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-white">{symbol}/USD</h3>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              ${currentPrice.toLocaleString()}
            </div>
            <div className={`flex items-center gap-1 text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative bg-black/10 rounded-lg p-6" style={{ height: height - 100 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
            <h4 className="text-lg font-semibold text-white mb-2">
              Advanced Trading Charts
            </h4>
            <p className="text-white/60 mb-4">
              Real-time {symbol} price data and technical analysis
            </p>
            
            {/* Mock Chart Visualization */}
            <div className="w-full max-w-md mx-auto">
              <div className="flex items-end justify-center gap-1 h-32 mb-4">
                {Array.from({ length: 20 }, (_, i) => (
                  <motion.div
                    key={i}
                    className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm"
                    style={{
                      width: '8px',
                      height: `${Math.random() * 100 + 20}%`
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.random() * 100 + 20}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  />
                ))}
              </div>
              
              {/* Recent Data Points */}
              <div className="text-xs text-white/50 space-y-1">
                {mockData.slice(-3).map((point, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{point.time}</span>
                    <span>${point.price.toFixed(2)}</span>
                    <span className={point.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {point.change >= 0 ? '+' : ''}{point.change.toFixed(2)}%
                    </span>
                  </div>
                ))}
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
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live updates every 3s</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TradingChartsSimple
