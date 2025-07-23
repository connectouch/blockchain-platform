import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, RefreshCw, Clock } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

interface SimpleChartProps {
  symbol?: string
  height?: number
  className?: string
  timeframe?: '1h' | '1d' | '1w' | '1m'
}

interface PriceData {
  time: number
  price: number
}

const SimpleChart: React.FC<SimpleChartProps> = ({
  symbol = 'BTC',
  height = 400,
  className = '',
  timeframe = '1d'
}) => {
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange, setPriceChange] = useState({ value: 0, percentage: 0 })
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [error, setError] = useState<string | null>(null)

  // Fetch price data from our real-time API
  const fetchPriceData = async () => {
    try {
      setIsLoading(true)
      
      // Get current price
      const priceResponse = await fetch('/api/v2/blockchain/prices/live')
      const priceData = await priceResponse.json()

      if (priceData.success) {
        const tokenData = priceData.data[symbol.toLowerCase()]
        if (tokenData) {
          setCurrentPrice(tokenData.usd)
          setPriceChange({
            value: 0,
            percentage: tokenData.usd_24h_change
          })
        }
      }

      // Get historical data for chart
      const historyResponse = await fetch(`/api/v2/blockchain/prices/history/${symbol.toLowerCase()}?timeframe=${timeframe}`)
      const historyData = await historyResponse.json()
      
      if (historyData.success && historyData.data && historyData.data.length > 0) {
        // Format data for chart
        const formattedData = historyData.data.map((item: any) => ({
          time: new Date(item.timestamp).getTime(),
          price: item.price
        }))
        
        setPriceData(formattedData)
      } else {
        // If no historical data, generate some based on current price
        generateMockData(currentPrice)
      }
      
      setLastUpdate(new Date())
      setIsLoading(false)
      setError(null)
    } catch (error) {
      console.error('Failed to fetch price data:', error)
      setError('Failed to load chart data')
      setIsLoading(false)
      
      // Generate mock data as fallback
      generateMockData(currentPrice || 50000)
    }
  }
  
  // Generate mock data if API fails
  const generateMockData = (basePrice: number) => {
    const now = new Date().getTime()
    const data: PriceData[] = []
    
    // Generate data points based on timeframe
    const points = timeframe === '1h' ? 60 : 
                  timeframe === '1d' ? 24 : 
                  timeframe === '1w' ? 7 : 30
    
    const timeStep = timeframe === '1h' ? 60 * 1000 : 
                    timeframe === '1d' ? 60 * 60 * 1000 : 
                    timeframe === '1w' ? 24 * 60 * 60 * 1000 : 
                    24 * 60 * 60 * 1000
    
    // Create smooth price curve with some randomness
    for (let i = 0; i < points; i++) {
      const time = now - (points - i) * timeStep
      const randomFactor = 1 + (Math.random() * 0.1 - 0.05) // ±5% randomness
      const price = basePrice * randomFactor * (1 + (i / points) * (priceChange.percentage / 100))
      
      data.push({
        time,
        price
      })
    }
    
    // Add current price as last point
    data.push({
      time: now,
      price: basePrice
    })
    
    setPriceData(data)
  }
  
  // Format price for display
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString()}`
    }
    return `$${price.toFixed(2)}`
  }
  
  // Format date for X-axis
  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp)
    if (timeframe === '1h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (timeframe === '1d') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{formatPrice(payload[0].value)}</p>
          <p className="text-white/60 text-xs">
            {new Date(payload[0].payload.time).toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }
  
  // Fetch data on mount and when symbol/timeframe changes
  useEffect(() => {
    fetchPriceData()
    
    // Set up polling interval (8 seconds to match our real-time data)
    const interval = setInterval(fetchPriceData, 8000)
    return () => clearInterval(interval)
  }, [symbol, timeframe])
  
  // Loading state
  if (isLoading && priceData.length === 0) {
    return (
      <div className={`bg-black/20 backdrop-blur-sm rounded-xl p-6 ${className}`} style={{ height }}>
        <div className="h-full flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-4" />
          <p className="text-white/80 text-lg font-medium">Loading chart data...</p>
        </div>
      </div>
    )
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-black/20 backdrop-blur-sm rounded-xl p-6 ${className}`}
      style={{ height }}
    >
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white text-xl font-bold">{symbol} Price Chart</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-white text-2xl font-bold">{formatPrice(currentPrice)}</span>
            <div className="flex items-center gap-1">
              {priceChange.percentage >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <span className={`text-sm font-medium ${
                priceChange.percentage >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {priceChange.percentage >= 0 ? '+' : ''}{priceChange.percentage.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-white/60 text-xs">
          <Clock className="w-3 h-3" />
          <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-[calc(100%-100px)]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={priceData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis 
              dataKey="time" 
              tickFormatter={formatXAxis} 
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              orientation="right"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#3B82F6" 
              fillOpacity={1}
              fill="url(#colorPrice)" 
              strokeWidth={2}
              activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default SimpleChart
