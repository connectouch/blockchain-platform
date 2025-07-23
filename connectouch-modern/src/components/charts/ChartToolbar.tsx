import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Target,
  Minus,
  Plus,
  ChevronDown
} from 'lucide-react'
import { TimeFrame } from '../../types/chart'

interface ChartToolbarProps {
  symbol: string
  timeframe: TimeFrame
  onSymbolChange: (symbol: string) => void
  onTimeframeChange: (timeframe: TimeFrame) => void
}

const POPULAR_SYMBOLS = [
  'BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'AVAX', 'MATIC'
]

const TIMEFRAMES: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w']

const ChartToolbar: React.FC<ChartToolbarProps> = ({
  symbol,
  timeframe,
  onSymbolChange,
  onTimeframeChange
}) => {
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false)
  const [customSymbol, setCustomSymbol] = useState('')

  const handleSymbolSelect = (selectedSymbol: string) => {
    onSymbolChange(selectedSymbol)
    setShowSymbolDropdown(false)
  }

  const handleCustomSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customSymbol.trim()) {
      onSymbolChange(customSymbol.trim().toUpperCase())
      setCustomSymbol('')
      setShowSymbolDropdown(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/10">
      {/* Symbol Selector */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowSymbolDropdown(!showSymbolDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-white font-medium">{symbol}</span>
            <ChevronDown className="w-4 h-4 text-white/60" />
          </button>

          {/* Symbol Dropdown */}
          {showSymbolDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-64 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl z-50"
            >
              <div className="p-3">
                <h4 className="text-white/80 text-sm font-medium mb-3">Select Symbol</h4>
                
                {/* Popular Symbols */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {POPULAR_SYMBOLS.map(sym => (
                    <button
                      key={sym}
                      onClick={() => handleSymbolSelect(sym)}
                      className={`p-2 text-sm rounded-lg transition-colors ${
                        symbol === sym 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/5 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>

                {/* Custom Symbol Input */}
                <form onSubmit={handleCustomSymbolSubmit} className="space-y-2">
                  <input
                    type="text"
                    value={customSymbol}
                    onChange={(e) => setCustomSymbol(e.target.value)}
                    placeholder="Enter custom symbol..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Add Symbol
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                timeframe === tf
                  ? 'bg-blue-500 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Drawing Tools */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Trend Line"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
          
          <button
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Horizontal Line"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <button
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Vertical Line"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="w-px h-4 bg-current" />
            </div>
          </button>
          
          <button
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Fibonacci Retracement"
          >
            <Activity className="w-4 h-4" />
          </button>
          
          <button
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Price Alert"
          >
            <Target className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <button
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <button
            className="px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showSymbolDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSymbolDropdown(false)}
        />
      )}
    </div>
  )
}

export default ChartToolbar
