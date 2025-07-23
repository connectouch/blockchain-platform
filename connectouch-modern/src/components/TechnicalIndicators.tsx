import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  LineChart,
  Target,
  Zap,
  Settings,
  Plus,
  Minus,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react'

interface IndicatorValue {
  timestamp: number
  value: number
  signal?: 'buy' | 'sell' | 'neutral'
}

interface IndicatorConfig {
  id: string
  name: string
  type: 'momentum' | 'trend' | 'volatility' | 'volume' | 'custom'
  description: string
  parameters: { [key: string]: { value: number; min: number; max: number; step: number } }
  enabled: boolean
  color: string
  data: IndicatorValue[]
  currentValue: number
  signal: 'buy' | 'sell' | 'neutral'
  strength: number // 0-100
}

interface TechnicalIndicatorsProps {
  symbol: string
  priceData: number[]
  volumeData?: number[]
  onIndicatorChange?: (indicators: IndicatorConfig[]) => void
}

const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({
  symbol,
  priceData = [],
  volumeData = [],
  onIndicatorChange
}) => {
  const [indicators, setIndicators] = useState<IndicatorConfig[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showSettings, setShowSettings] = useState<string | null>(null)
  const [customIndicator, setCustomIndicator] = useState<string>('')

  // Initialize default indicators
  useEffect(() => {
    const defaultIndicators: IndicatorConfig[] = [
      {
        id: 'rsi',
        name: 'RSI (Relative Strength Index)',
        type: 'momentum',
        description: 'Measures the speed and change of price movements. Values above 70 indicate overbought, below 30 oversold.',
        parameters: {
          period: { value: 14, min: 2, max: 50, step: 1 }
        },
        enabled: true,
        color: '#8b5cf6',
        data: calculateRSI(priceData, 14),
        currentValue: 0,
        signal: 'neutral',
        strength: 0
      },
      {
        id: 'macd',
        name: 'MACD (Moving Average Convergence Divergence)',
        type: 'momentum',
        description: 'Shows the relationship between two moving averages. Crossovers indicate potential buy/sell signals.',
        parameters: {
          fast: { value: 12, min: 5, max: 50, step: 1 },
          slow: { value: 26, min: 10, max: 100, step: 1 },
          signal: { value: 9, min: 5, max: 30, step: 1 }
        },
        enabled: true,
        color: '#10b981',
        data: calculateMACD(priceData, 12, 26, 9),
        currentValue: 0,
        signal: 'neutral',
        strength: 0
      },
      {
        id: 'bb',
        name: 'Bollinger Bands',
        type: 'volatility',
        description: 'Volatility bands placed above and below a moving average. Price touching bands may indicate reversal.',
        parameters: {
          period: { value: 20, min: 5, max: 50, step: 1 },
          deviation: { value: 2, min: 1, max: 3, step: 0.1 }
        },
        enabled: false,
        color: '#f59e0b',
        data: calculateBollingerBands(priceData, 20, 2),
        currentValue: 0,
        signal: 'neutral',
        strength: 0
      },
      {
        id: 'sma',
        name: 'SMA (Simple Moving Average)',
        type: 'trend',
        description: 'Average price over a specified period. Price above SMA indicates uptrend, below indicates downtrend.',
        parameters: {
          period: { value: 20, min: 5, max: 200, step: 1 }
        },
        enabled: false,
        color: '#ef4444',
        data: calculateSMA(priceData, 20),
        currentValue: 0,
        signal: 'neutral',
        strength: 0
      },
      {
        id: 'ema',
        name: 'EMA (Exponential Moving Average)',
        type: 'trend',
        description: 'Weighted average giving more importance to recent prices. More responsive than SMA.',
        parameters: {
          period: { value: 20, min: 5, max: 200, step: 1 }
        },
        enabled: false,
        color: '#06b6d4',
        data: calculateEMA(priceData, 20),
        currentValue: 0,
        signal: 'neutral',
        strength: 0
      },
      {
        id: 'stoch',
        name: 'Stochastic Oscillator',
        type: 'momentum',
        description: 'Compares closing price to price range over time. Values above 80 overbought, below 20 oversold.',
        parameters: {
          k: { value: 14, min: 5, max: 50, step: 1 },
          d: { value: 3, min: 1, max: 10, step: 1 }
        },
        enabled: false,
        color: '#ec4899',
        data: calculateStochastic(priceData, 14, 3),
        currentValue: 0,
        signal: 'neutral',
        strength: 0
      }
    ]

    setIndicators(defaultIndicators)
  }, [priceData])

  // Update indicators when data changes
  useEffect(() => {
    const updatedIndicators = indicators.map(indicator => {
      let newData: IndicatorValue[] = []
      let currentValue = 0
      let signal: 'buy' | 'sell' | 'neutral' = 'neutral'
      let strength = 0

      switch (indicator.id) {
        case 'rsi':
          newData = calculateRSI(priceData, indicator.parameters.period.value)
          currentValue = newData.length > 0 ? newData[newData.length - 1].value : 0
          signal = currentValue > 70 ? 'sell' : currentValue < 30 ? 'buy' : 'neutral'
          strength = Math.abs(50 - currentValue) * 2
          break
        case 'macd':
          newData = calculateMACD(priceData, indicator.parameters.fast.value, indicator.parameters.slow.value, indicator.parameters.signal.value)
          currentValue = newData.length > 0 ? newData[newData.length - 1].value : 0
          signal = currentValue > 0 ? 'buy' : currentValue < 0 ? 'sell' : 'neutral'
          strength = Math.min(Math.abs(currentValue) * 10, 100)
          break
        case 'bb':
          newData = calculateBollingerBands(priceData, indicator.parameters.period.value, indicator.parameters.deviation.value)
          currentValue = newData.length > 0 ? newData[newData.length - 1].value : 0
          signal = 'neutral' // BB signals are more complex
          strength = 50
          break
        case 'sma':
          newData = calculateSMA(priceData, indicator.parameters.period.value)
          currentValue = newData.length > 0 ? newData[newData.length - 1].value : 0
          const currentPrice = priceData.length > 0 ? priceData[priceData.length - 1] : 0
          signal = currentPrice > currentValue ? 'buy' : currentPrice < currentValue ? 'sell' : 'neutral'
          strength = Math.abs((currentPrice - currentValue) / currentValue) * 100
          break
        case 'ema':
          newData = calculateEMA(priceData, indicator.parameters.period.value)
          currentValue = newData.length > 0 ? newData[newData.length - 1].value : 0
          const currentPriceEMA = priceData.length > 0 ? priceData[priceData.length - 1] : 0
          signal = currentPriceEMA > currentValue ? 'buy' : currentPriceEMA < currentValue ? 'sell' : 'neutral'
          strength = Math.abs((currentPriceEMA - currentValue) / currentValue) * 100
          break
        case 'stoch':
          newData = calculateStochastic(priceData, indicator.parameters.k.value, indicator.parameters.d.value)
          currentValue = newData.length > 0 ? newData[newData.length - 1].value : 0
          signal = currentValue > 80 ? 'sell' : currentValue < 20 ? 'buy' : 'neutral'
          strength = currentValue > 50 ? (currentValue - 50) * 2 : (50 - currentValue) * 2
          break
      }

      return {
        ...indicator,
        data: newData,
        currentValue,
        signal,
        strength: Math.min(strength, 100)
      }
    })

    setIndicators(updatedIndicators)
    onIndicatorChange?.(updatedIndicators)
  }, [priceData, onIndicatorChange])

  // Calculation functions (simplified implementations)
  function calculateRSI(prices: number[], period: number): IndicatorValue[] {
    if (prices.length < period + 1) return []
    
    const rsiValues: IndicatorValue[] = []
    for (let i = period; i < prices.length; i++) {
      const gains = []
      const losses = []
      
      for (let j = i - period + 1; j <= i; j++) {
        const change = prices[j] - prices[j - 1]
        if (change > 0) gains.push(change)
        else losses.push(Math.abs(change))
      }
      
      const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0
      const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
      const rsi = 100 - (100 / (1 + rs))
      
      rsiValues.push({
        timestamp: Date.now() - (prices.length - i) * 60000,
        value: rsi,
        signal: rsi > 70 ? 'sell' : rsi < 30 ? 'buy' : 'neutral'
      })
    }
    
    return rsiValues
  }

  function calculateMACD(prices: number[], fast: number, slow: number, signal: number): IndicatorValue[] {
    if (prices.length < slow) return []
    
    const emaFast = calculateEMAValues(prices, fast)
    const emaSlow = calculateEMAValues(prices, slow)
    const macdLine = emaFast.map((val, i) => val - emaSlow[i])
    const signalLine = calculateEMAValues(macdLine, signal)
    
    return macdLine.slice(signal - 1).map((val, i) => ({
      timestamp: Date.now() - (macdLine.length - i) * 60000,
      value: val - signalLine[i],
      signal: val > signalLine[i] ? 'buy' : 'sell'
    }))
  }

  function calculateBollingerBands(prices: number[], period: number, deviation: number): IndicatorValue[] {
    if (prices.length < period) return []
    
    const smaValues = calculateSMAValues(prices, period)
    const bands: IndicatorValue[] = []
    
    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1)
      const mean = smaValues[i - period + 1]
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period
      const stdDev = Math.sqrt(variance)
      
      bands.push({
        timestamp: Date.now() - (prices.length - i) * 60000,
        value: mean,
        signal: 'neutral'
      })
    }
    
    return bands
  }

  function calculateSMA(prices: number[], period: number): IndicatorValue[] {
    return calculateSMAValues(prices, period).map((val, i) => ({
      timestamp: Date.now() - (prices.length - i - period + 1) * 60000,
      value: val,
      signal: 'neutral'
    }))
  }

  function calculateEMA(prices: number[], period: number): IndicatorValue[] {
    return calculateEMAValues(prices, period).map((val, i) => ({
      timestamp: Date.now() - (prices.length - i) * 60000,
      value: val,
      signal: 'neutral'
    }))
  }

  function calculateStochastic(prices: number[], k: number, d: number): IndicatorValue[] {
    if (prices.length < k) return []
    
    const stochValues: IndicatorValue[] = []
    
    for (let i = k - 1; i < prices.length; i++) {
      const slice = prices.slice(i - k + 1, i + 1)
      const high = Math.max(...slice)
      const low = Math.min(...slice)
      const current = prices[i]
      
      const stochK = ((current - low) / (high - low)) * 100
      
      stochValues.push({
        timestamp: Date.now() - (prices.length - i) * 60000,
        value: stochK,
        signal: stochK > 80 ? 'sell' : stochK < 20 ? 'buy' : 'neutral'
      })
    }
    
    return stochValues
  }

  // Helper functions
  function calculateSMAValues(prices: number[], period: number): number[] {
    const sma: number[] = []
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      sma.push(sum / period)
    }
    return sma
  }

  function calculateEMAValues(prices: number[], period: number): number[] {
    const multiplier = 2 / (period + 1)
    const ema: number[] = [prices[0]]
    
    for (let i = 1; i < prices.length; i++) {
      ema.push((prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier)))
    }
    
    return ema
  }

  // Toggle indicator
  const toggleIndicator = (id: string) => {
    setIndicators(prev => prev.map(ind => 
      ind.id === id ? { ...ind, enabled: !ind.enabled } : ind
    ))
  }

  // Update indicator parameter
  const updateParameter = (id: string, param: string, value: number) => {
    setIndicators(prev => prev.map(ind => 
      ind.id === id 
        ? { 
            ...ind, 
            parameters: { 
              ...ind.parameters, 
              [param]: { ...ind.parameters[param], value } 
            } 
          } 
        : ind
    ))
  }

  // Get signal color
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'text-green-400'
      case 'sell': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  // Get signal icon
  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy': return <TrendingUp className="w-4 h-4" />
      case 'sell': return <TrendingDown className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  // Filter indicators by category
  const filteredIndicators = indicators.filter(indicator => 
    selectedCategory === 'all' || indicator.type === selectedCategory
  )

  const categories = [
    { value: 'all', label: 'All Indicators' },
    { value: 'momentum', label: 'Momentum' },
    { value: 'trend', label: 'Trend' },
    { value: 'volatility', label: 'Volatility' },
    { value: 'volume', label: 'Volume' },
    { value: 'custom', label: 'Custom' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Technical Indicators</h2>
          <p className="text-white/60">Advanced technical analysis tools for {symbol}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value} className="bg-gray-800">
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIndicators.map((indicator, index) => (
          <motion.div
            key={indicator.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`glass-card p-6 ${indicator.enabled ? 'border border-purple-400/30' : ''}`}
          >
            {/* Indicator Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">{indicator.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                    indicator.type === 'momentum' ? 'bg-blue-500/20 text-blue-400' :
                    indicator.type === 'trend' ? 'bg-green-500/20 text-green-400' :
                    indicator.type === 'volatility' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {indicator.type}
                  </span>
                </div>
                <p className="text-white/60 text-sm line-clamp-2">{indicator.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(showSettings === indicator.id ? null : indicator.id)}
                  className="p-1 hover:bg-white/10 rounded text-white/60 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleIndicator(indicator.id)}
                  className={`p-2 rounded transition-colors ${
                    indicator.enabled 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {indicator.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Current Value & Signal */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Current Value:</span>
                <span className="text-white font-bold">{indicator.currentValue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Signal:</span>
                <div className={`flex items-center gap-1 ${getSignalColor(indicator.signal)}`}>
                  {getSignalIcon(indicator.signal)}
                  <span className="font-medium capitalize">{indicator.signal}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Strength:</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        indicator.strength > 70 ? 'bg-red-400' :
                        indicator.strength > 30 ? 'bg-yellow-400' : 'bg-green-400'
                      }`}
                      style={{ width: `${indicator.strength}%` }}
                    />
                  </div>
                  <span className="text-white/80 text-sm">{indicator.strength.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings === indicator.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/10 pt-4 mt-4"
                >
                  <h4 className="text-white font-medium mb-3">Parameters</h4>
                  <div className="space-y-3">
                    {Object.entries(indicator.parameters).map(([key, param]) => (
                      <div key={key}>
                        <label className="block text-white/60 text-sm mb-1 capitalize">{key}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={param.min}
                            max={param.max}
                            step={param.step}
                            value={param.value}
                            onChange={(e) => updateParameter(indicator.id, key, Number(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-white/80 text-sm w-12 text-right">{param.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Market Signals Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {indicators.filter(i => i.enabled && i.signal === 'buy').length}
            </div>
            <div className="text-white/60">Buy Signals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {indicators.filter(i => i.enabled && i.signal === 'sell').length}
            </div>
            <div className="text-white/60">Sell Signals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white/60">
              {indicators.filter(i => i.enabled && i.signal === 'neutral').length}
            </div>
            <div className="text-white/60">Neutral</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechnicalIndicators
