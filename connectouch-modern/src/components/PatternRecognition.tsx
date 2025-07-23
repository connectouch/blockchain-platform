import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  Filter,
  Star,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  LineChart,
  Triangle,
  Square,
  Circle,
  Zap
} from 'lucide-react'

interface ChartPattern {
  id: string
  name: string
  type: 'bullish' | 'bearish' | 'neutral'
  category: 'reversal' | 'continuation' | 'bilateral'
  confidence: number // 0-100
  reliability: number // 0-100
  timeframe: string
  detectedAt: number
  priceLevel: number
  targetPrice?: number
  stopLoss?: number
  riskReward?: number
  description: string
  characteristics: string[]
  tradingStrategy: string
  historicalAccuracy: number
  isActive: boolean
  volume: 'high' | 'medium' | 'low'
  strength: 'strong' | 'moderate' | 'weak'
}

interface PatternAlert {
  id: string
  patternId: string
  symbol: string
  message: string
  type: 'formation' | 'breakout' | 'failure'
  timestamp: number
  isRead: boolean
}

interface PatternRecognitionProps {
  symbol: string
  priceData: number[]
  volumeData?: number[]
  onPatternDetected?: (pattern: ChartPattern) => void
}

const PatternRecognition: React.FC<PatternRecognitionProps> = ({
  symbol,
  priceData = [],
  volumeData = [],
  onPatternDetected
}) => {
  const [patterns, setPatterns] = useState<ChartPattern[]>([])
  const [alerts, setAlerts] = useState<PatternAlert[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isScanning, setIsScanning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [sensitivity, setSensitivity] = useState(75)
  const [minConfidence, setMinConfidence] = useState(60)

  // Initialize patterns
  useEffect(() => {
    const mockPatterns: ChartPattern[] = [
      {
        id: 'head-shoulders-1',
        name: 'Head and Shoulders',
        type: 'bearish',
        category: 'reversal',
        confidence: 87,
        reliability: 82,
        timeframe: '4h',
        detectedAt: Date.now() - 2 * 60 * 60 * 1000,
        priceLevel: 45200,
        targetPrice: 41800,
        stopLoss: 46500,
        riskReward: 2.6,
        description: 'Classic bearish reversal pattern with three peaks, middle peak being the highest',
        characteristics: [
          'Left shoulder at $44,800',
          'Head at $45,200',
          'Right shoulder at $44,900',
          'Neckline at $43,500'
        ],
        tradingStrategy: 'Sell on neckline break with target at $41,800',
        historicalAccuracy: 78,
        isActive: true,
        volume: 'high',
        strength: 'strong'
      },
      {
        id: 'double-bottom-1',
        name: 'Double Bottom',
        type: 'bullish',
        category: 'reversal',
        confidence: 92,
        reliability: 85,
        timeframe: '1d',
        detectedAt: Date.now() - 6 * 60 * 60 * 1000,
        priceLevel: 42800,
        targetPrice: 48200,
        stopLoss: 42000,
        riskReward: 6.8,
        description: 'Strong bullish reversal pattern with two equal lows and resistance break',
        characteristics: [
          'First bottom at $42,800',
          'Second bottom at $42,750',
          'Resistance at $45,500',
          'Volume confirmation on breakout'
        ],
        tradingStrategy: 'Buy on resistance break with target at $48,200',
        historicalAccuracy: 83,
        isActive: true,
        volume: 'high',
        strength: 'strong'
      },
      {
        id: 'ascending-triangle-1',
        name: 'Ascending Triangle',
        type: 'bullish',
        category: 'continuation',
        confidence: 76,
        reliability: 71,
        timeframe: '2h',
        detectedAt: Date.now() - 1 * 60 * 60 * 1000,
        priceLevel: 44500,
        targetPrice: 46800,
        stopLoss: 43200,
        riskReward: 1.8,
        description: 'Bullish continuation pattern with horizontal resistance and rising support',
        characteristics: [
          'Horizontal resistance at $44,500',
          'Rising support line',
          'Decreasing volume during formation',
          'Breakout volume surge expected'
        ],
        tradingStrategy: 'Buy on resistance breakout with volume confirmation',
        historicalAccuracy: 69,
        isActive: true,
        volume: 'medium',
        strength: 'moderate'
      },
      {
        id: 'flag-pattern-1',
        name: 'Bull Flag',
        type: 'bullish',
        category: 'continuation',
        confidence: 84,
        reliability: 79,
        timeframe: '1h',
        detectedAt: Date.now() - 30 * 60 * 1000,
        priceLevel: 44200,
        targetPrice: 45600,
        stopLoss: 43800,
        riskReward: 3.5,
        description: 'Short-term bullish continuation pattern after strong upward move',
        characteristics: [
          'Strong upward move (flagpole)',
          'Slight downward consolidation',
          'Parallel trend lines',
          'Low volume during consolidation'
        ],
        tradingStrategy: 'Buy on upper trend line break',
        historicalAccuracy: 74,
        isActive: true,
        volume: 'low',
        strength: 'moderate'
      },
      {
        id: 'wedge-pattern-1',
        name: 'Rising Wedge',
        type: 'bearish',
        category: 'reversal',
        confidence: 71,
        reliability: 68,
        timeframe: '6h',
        detectedAt: Date.now() - 4 * 60 * 60 * 1000,
        priceLevel: 44800,
        targetPrice: 42200,
        stopLoss: 45200,
        riskReward: 6.5,
        description: 'Bearish reversal pattern with converging trend lines sloping upward',
        characteristics: [
          'Both trend lines slope upward',
          'Lines converge to form wedge',
          'Decreasing volume',
          'Bearish divergence on RSI'
        ],
        tradingStrategy: 'Sell on lower trend line break',
        historicalAccuracy: 65,
        isActive: true,
        volume: 'low',
        strength: 'weak'
      }
    ]

    const mockAlerts: PatternAlert[] = [
      {
        id: 'alert-1',
        patternId: 'double-bottom-1',
        symbol,
        message: 'Double Bottom pattern breakout confirmed with high volume',
        type: 'breakout',
        timestamp: Date.now() - 15 * 60 * 1000,
        isRead: false
      },
      {
        id: 'alert-2',
        patternId: 'head-shoulders-1',
        symbol,
        message: 'Head and Shoulders pattern formation detected',
        type: 'formation',
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
        isRead: true
      }
    ]

    setPatterns(mockPatterns)
    setAlerts(mockAlerts)
  }, [symbol])

  // Scan for new patterns
  const scanPatterns = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      // Simulate new pattern detection
    }, 3000)
  }

  // Filter patterns
  const filteredPatterns = patterns.filter(pattern => {
    const matchesCategory = selectedCategory === 'all' || pattern.category === selectedCategory
    const matchesType = selectedType === 'all' || pattern.type === selectedType
    const meetsConfidence = pattern.confidence >= minConfidence
    return matchesCategory && matchesType && meetsConfidence && pattern.isActive
  })

  // Get pattern color
  const getPatternColor = (type: string) => {
    switch (type) {
      case 'bullish': return 'text-green-400'
      case 'bearish': return 'text-red-400'
      case 'neutral': return 'text-yellow-400'
      default: return 'text-white/60'
    }
  }

  // Get pattern icon
  const getPatternIcon = (name: string) => {
    if (name.includes('Triangle')) return <Triangle className="w-5 h-5" />
    if (name.includes('Rectangle') || name.includes('Flag')) return <Square className="w-5 h-5" />
    if (name.includes('Head') || name.includes('Double')) return <BarChart3 className="w-5 h-5" />
    return <LineChart className="w-5 h-5" />
  }

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Get strength color
  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-green-400'
      case 'moderate': return 'text-yellow-400'
      case 'weak': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  // Format currency
  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString()}`
  }

  // Format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) return `${hours}h ${minutes}m ago`
    return `${minutes}m ago`
  }

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'reversal', label: 'Reversal' },
    { value: 'continuation', label: 'Continuation' },
    { value: 'bilateral', label: 'Bilateral' }
  ]

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'bullish', label: 'Bullish' },
    { value: 'bearish', label: 'Bearish' },
    { value: 'neutral', label: 'Neutral' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Pattern Recognition</h2>
          <p className="text-white/60">Automated chart pattern detection for {symbol}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={scanPatterns}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Scan Patterns'}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Detection Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Sensitivity: {sensitivity}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-white/60 text-xs mt-1">Higher values detect more patterns but may include false positives</p>
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Minimum Confidence: {minConfidence}%
                </label>
                <input
                  type="range"
                  min="30"
                  max="90"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-white/60 text-xs mt-1">Only show patterns above this confidence threshold</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
        >
          {categories.map(category => (
            <option key={category.value} value={category.value} className="bg-gray-800">
              {category.label}
            </option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
        >
          {types.map(type => (
            <option key={type.value} value={type.value} className="bg-gray-800">
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Pattern Alerts */}
      {alerts.filter(alert => !alert.isRead).length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {alerts.filter(alert => !alert.isRead).map(alert => (
              <div key={alert.id} className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white">{alert.message}</p>
                  <p className="text-white/60 text-sm">{formatTimeAgo(alert.timestamp)}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                  alert.type === 'breakout' ? 'bg-green-500/20 text-green-400' :
                  alert.type === 'formation' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {alert.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detected Patterns */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Detected Patterns ({filteredPatterns.length})</h3>
        
        {filteredPatterns.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPatterns.map((pattern, index) => (
              <motion.div
                key={pattern.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 hover:scale-105 transition-all duration-300"
              >
                {/* Pattern Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getPatternColor(pattern.type).replace('text-', 'bg-').replace('-400', '-400/20')}`}>
                      {getPatternIcon(pattern.name)}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{pattern.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium capitalize ${getPatternColor(pattern.type)}`}>
                          {pattern.type}
                        </span>
                        <span className="text-white/60">•</span>
                        <span className="text-white/60 capitalize">{pattern.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getConfidenceColor(pattern.confidence)}`}>
                      {pattern.confidence}%
                    </div>
                    <div className="text-white/60 text-sm">Confidence</div>
                  </div>
                </div>

                {/* Pattern Details */}
                <div className="space-y-3 mb-4">
                  <p className="text-white/80 text-sm">{pattern.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-white/60 text-sm">Timeframe:</span>
                      <div className="text-white font-medium">{pattern.timeframe}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Detected:</span>
                      <div className="text-white font-medium">{formatTimeAgo(pattern.detectedAt)}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Reliability:</span>
                      <div className="text-white font-medium">{pattern.reliability}%</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Strength:</span>
                      <div className={`font-medium capitalize ${getStrengthColor(pattern.strength)}`}>
                        {pattern.strength}
                      </div>
                    </div>
                  </div>

                  {pattern.targetPrice && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-white/60 text-sm">Target Price:</span>
                        <div className="text-green-400 font-medium">{formatCurrency(pattern.targetPrice)}</div>
                      </div>
                      <div>
                        <span className="text-white/60 text-sm">Stop Loss:</span>
                        <div className="text-red-400 font-medium">{formatCurrency(pattern.stopLoss!)}</div>
                      </div>
                    </div>
                  )}

                  {pattern.riskReward && (
                    <div>
                      <span className="text-white/60 text-sm">Risk/Reward Ratio:</span>
                      <div className="text-blue-400 font-medium">{pattern.riskReward.toFixed(1)}:1</div>
                    </div>
                  )}
                </div>

                {/* Characteristics */}
                <div className="space-y-3 mb-4">
                  <h5 className="text-white font-medium">Key Characteristics:</h5>
                  <ul className="space-y-1">
                    {pattern.characteristics.map((char, i) => (
                      <li key={i} className="flex items-start gap-2 text-white/80 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Trading Strategy */}
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <h5 className="text-purple-400 font-medium mb-1">Trading Strategy:</h5>
                  <p className="text-white/80 text-sm">{pattern.tradingStrategy}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white/60 text-sm">{pattern.historicalAccuracy}% accuracy</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span className="text-white/60 text-sm capitalize">{pattern.volume} volume</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onPatternDetected?.(pattern)}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Target className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Patterns Detected</h3>
            <p className="text-white/60">
              {isScanning 
                ? 'Scanning for chart patterns...' 
                : 'Try adjusting the sensitivity or confidence threshold to detect more patterns'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatternRecognition
