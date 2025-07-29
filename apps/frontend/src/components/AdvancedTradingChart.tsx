import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  CandlestickChart,
  Activity,
  Settings,
  Maximize2,
  Minimize2,
  RefreshCw,
  Download,
  Share,
  Plus,
  Minus,
  Target,
  Crosshair,
  PenTool,
  Square,
  Circle,
  Triangle,
  Ruler,
  Type,
  Palette,
  Eye,
  EyeOff
} from 'lucide-react'

interface CandleData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface Indicator {
  id: string
  name: string
  type: 'overlay' | 'oscillator'
  visible: boolean
  color: string
  parameters: { [key: string]: number }
  data: number[]
}

interface DrawingTool {
  id: string
  type: 'line' | 'rectangle' | 'circle' | 'fibonacci' | 'text'
  points: { x: number; y: number }[]
  color: string
  style: 'solid' | 'dashed' | 'dotted'
  thickness: number
  text?: string
}

interface AdvancedTradingChartProps {
  symbol: string
  data: CandleData[]
  isLoading?: boolean
  onTimeframeChange?: (timeframe: string) => void
  onSymbolChange?: (symbol: string) => void
}

const AdvancedTradingChart: React.FC<AdvancedTradingChartProps> = ({
  symbol,
  data = [],
  isLoading = false,
  onTimeframeChange,
  onSymbolChange
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [timeframe, setTimeframe] = useState('1h')
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick')
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [drawings, setDrawings] = useState<DrawingTool[]>([])
  const [selectedTool, setSelectedTool] = useState<string>('cursor')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  // Generate mock data if none provided
  useEffect(() => {
    if (data.length === 0) {
      // This will be replaced with real API data
    }
  }, [data])

  // Timeframe options
  const timeframes = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
    { value: '1M', label: '1M' }
  ]

  // Drawing tools
  const drawingTools = [
    { id: 'cursor', name: 'Cursor', icon: <Crosshair className="w-4 h-4" /> },
    { id: 'line', name: 'Trend Line', icon: <PenTool className="w-4 h-4" /> },
    { id: 'rectangle', name: 'Rectangle', icon: <Square className="w-4 h-4" /> },
    { id: 'circle', name: 'Circle', icon: <Circle className="w-4 h-4" /> },
    { id: 'fibonacci', name: 'Fibonacci', icon: <Activity className="w-4 h-4" /> },
    { id: 'text', name: 'Text', icon: <Type className="w-4 h-4" /> }
  ]

  // Chart type options
  const chartTypes = [
    { value: 'candlestick', label: 'Candlestick', icon: <CandlestickChart className="w-4 h-4" /> },
    { value: 'line', label: 'Line', icon: <LineChart className="w-4 h-4" /> },
    { value: 'area', label: 'Area', icon: <BarChart3 className="w-4 h-4" /> }
  ]

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe)
    onTimeframeChange?.(newTimeframe)
  }

  // Add indicator
  const addIndicator = (type: string) => {
    const newIndicator: Indicator = {
      id: `${type}-${Date.now()}`,
      name: type.toUpperCase(),
      type: type === 'rsi' || type === 'macd' ? 'oscillator' : 'overlay',
      visible: true,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      parameters: getDefaultParameters(type),
      data: calculateIndicator(type, data)
    }
    setIndicators(prev => [...prev, newIndicator])
  }

  // Get default parameters for indicators
  const getDefaultParameters = (type: string): { [key: string]: number } => {
    switch (type) {
      case 'sma': return { period: 20 }
      case 'ema': return { period: 20 }
      case 'rsi': return { period: 14 }
      case 'macd': return { fast: 12, slow: 26, signal: 9 }
      case 'bb': return { period: 20, deviation: 2 }
      default: return {}
    }
  }

  // Calculate indicator values (simplified)
  const calculateIndicator = (type: string, data: CandleData[]): number[] => {
    // This would be replaced with actual technical analysis calculations
    return data.map(() => Math.random() * 100)
  }

  // Toggle indicator visibility
  const toggleIndicator = (id: string) => {
    setIndicators(prev => prev.map(ind => 
      ind.id === id ? { ...ind, visible: !ind.visible } : ind
    ))
  }

  // Remove indicator
  const removeIndicator = (id: string) => {
    setIndicators(prev => prev.filter(ind => ind.id !== id))
  }

  // Format price
  const formatPrice = (price: number): string => {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
  }

  // Get price change
  const getPriceChange = (): { change: number; percent: number } => {
    if (data.length < 2) return { change: 0, percent: 0 }
    const current = data[data.length - 1].close
    const previous = data[data.length - 2].close
    const change = current - previous
    const percent = (change / previous) * 100
    return { change, percent }
  }

  const priceChange = getPriceChange()
  const currentPrice = data.length > 0 ? data[data.length - 1].close : 0

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900 p-4' : ''}`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">{symbol}</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{formatPrice(currentPrice)}</span>
              <div className={`flex items-center gap-1 ${priceChange.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-medium">
                  {priceChange.change >= 0 ? '+' : ''}{formatPrice(Math.abs(priceChange.change))} ({priceChange.percent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex bg-white/5 rounded-lg p-1">
            {timeframes.map(tf => (
              <button
                key={tf.value}
                onClick={() => handleTimeframeChange(tf.value)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  timeframe === tf.value
                    ? 'bg-purple-600 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex bg-white/5 rounded-lg p-1">
            {chartTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setChartType(type.value as any)}
                className={`p-2 rounded transition-colors ${
                  chartType === type.value
                    ? 'bg-purple-600 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title={type.label}
              >
                {type.icon}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Drawing Tools */}
      <div className="flex items-center gap-2">
        <span className="text-white/60 text-sm">Tools:</span>
        <div className="flex bg-white/5 rounded-lg p-1">
          {drawingTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`p-2 rounded transition-colors ${
                selectedTool === tool.id
                  ? 'bg-purple-600 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title={tool.name}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 ml-4">
          <span className="text-white/60 text-sm">Zoom:</span>
          <button
            onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
            className="p-1 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-white/60 text-sm w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
          <button
            onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
            className="p-1 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6">
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-white/60 animate-spin" />
              </div>
            ) : (
              <div 
                ref={chartRef}
                className="h-96 bg-gray-800/50 rounded-lg relative overflow-hidden"
                style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
              >
                {/* Chart Canvas Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Advanced Trading Chart</p>
                    <p className="text-white/40 text-sm">Professional charting with {data.length} data points</p>
                  </div>
                </div>

                {/* Grid Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Price Line Simulation */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d={`M 0 ${200 + Math.sin(Date.now() / 1000) * 50} ${Array.from({length: 20}, (_, i) => 
                      `L ${i * 40} ${200 + Math.sin((Date.now() / 1000) + i * 0.5) * 50}`
                    ).join(' ')}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    opacity="0.8"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Indicators Panel */}
        <div className="space-y-4">
          {/* Add Indicators */}
          <div className="glass-card p-4">
            <h4 className="text-white font-medium mb-3">Indicators</h4>
            <div className="space-y-2">
              {['SMA', 'EMA', 'RSI', 'MACD', 'Bollinger Bands'].map(indicator => (
                <button
                  key={indicator}
                  onClick={() => addIndicator(indicator.toLowerCase().replace(' ', ''))}
                  className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-white/80 text-sm transition-colors"
                >
                  + {indicator}
                </button>
              ))}
            </div>
          </div>

          {/* Active Indicators */}
          {indicators.length > 0 && (
            <div className="glass-card p-4">
              <h4 className="text-white font-medium mb-3">Active Indicators</h4>
              <div className="space-y-2">
                {indicators.map(indicator => (
                  <div key={indicator.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: indicator.color }}
                      />
                      <span className="text-white/80 text-sm">{indicator.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleIndicator(indicator.id)}
                        className="p-1 hover:bg-white/10 rounded text-white/60 transition-colors"
                      >
                        {indicator.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => removeIndicator(indicator.id)}
                        className="p-1 hover:bg-white/10 rounded text-red-400 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart Settings */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-4"
              >
                <h4 className="text-white font-medium mb-3">Chart Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Background</label>
                    <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm">
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Grid</label>
                    <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm">
                      <option value="on">On</option>
                      <option value="off">Off</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Crosshair</label>
                    <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm">
                      <option value="on">On</option>
                      <option value="off">Off</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AdvancedTradingChart
