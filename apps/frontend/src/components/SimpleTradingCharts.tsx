import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Maximize2, 
  Minimize2,
  BarChart3,
  LineChart as LineChartIcon
} from 'lucide-react'
import SimpleChart from './SimpleChart'

interface SimpleTradingChartsProps {
  symbol?: string
  height?: number
  showControls?: boolean
  className?: string
}

const SimpleTradingCharts: React.FC<SimpleTradingChartsProps> = ({
  symbol = 'BTC',
  height = 600,
  showControls = true,
  className = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '1d' | '1w' | '1m'>('1d')
  const [selectedSymbol, setSelectedSymbol] = useState(symbol)
  const [chartType, setChartType] = useState<'area' | 'candlestick'>('area')
  
  // Popular cryptocurrencies
  const availableSymbols = [
    { id: 'BTC', name: 'Bitcoin' },
    { id: 'ETH', name: 'Ethereum' },
    { id: 'BNB', name: 'Binance Coin' },
    { id: 'ADA', name: 'Cardano' },
    { id: 'LINK', name: 'Chainlink' },
    { id: 'SOL', name: 'Solana' }
  ]
  
  // Timeframe options
  const timeframes = [
    { id: '1h', label: '1H' },
    { id: '1d', label: '1D' },
    { id: '1w', label: '1W' },
    { id: '1m', label: '1M' }
  ]
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Chart Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          {/* Symbol Selector */}
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">Symbol:</span>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableSymbols.map((sym) => (
                <option key={sym.id} value={sym.id}>
                  {sym.id} - {sym.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">Timeframe:</span>
            <div className="flex bg-white/10 rounded-lg p-1">
              {timeframes.map((tf) => (
                <button
                  key={tf.id}
                  className={`px-3 py-1 text-xs font-medium rounded-md ${
                    selectedTimeframe === tf.id
                      ? 'bg-blue-500 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setSelectedTimeframe(tf.id as any)}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chart Type Selector */}
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">Chart:</span>
            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1 ${
                  chartType === 'area'
                    ? 'bg-blue-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setChartType('area')}
              >
                <LineChartIcon className="w-3 h-3" />
                <span>Area</span>
              </button>
              <button
                className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1 ${
                  chartType === 'candlestick'
                    ? 'bg-blue-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setChartType('candlestick')}
              >
                <BarChart3 className="w-3 h-3" />
                <span>Candlestick</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Fullscreen Toggle */}
        {showControls && (
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
        )}
      </div>
      
      {/* Chart Content */}
      <div className="p-4" style={{ height: 'calc(100% - 70px)' }}>
        <SimpleChart 
          symbol={selectedSymbol} 
          timeframe={selectedTimeframe}
          height="100%"
          className="w-full"
        />
      </div>
    </motion.div>
  )
}

export default SimpleTradingCharts
