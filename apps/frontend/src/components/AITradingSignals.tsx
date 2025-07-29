import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Activity,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Eye,
  Settings,
  RefreshCw,
  Bell,
  BellOff,
  Filter,
  Calendar,
  DollarSign,
  Percent,
  Award
} from 'lucide-react'

interface AISignal {
  id: string
  symbol: string
  type: 'buy' | 'sell' | 'hold'
  confidence: number // 0-100
  strength: 'weak' | 'moderate' | 'strong'
  timeframe: '1h' | '4h' | '1d' | '1w'
  targetPrice: number
  stopLoss: number
  riskReward: number
  reasoning: string[]
  technicalFactors: string[]
  fundamentalFactors: string[]
  sentimentScore: number
  timestamp: number
  expiresAt: number
  accuracy: number
  isActive: boolean
}

interface MarketPrediction {
  symbol: string
  direction: 'bullish' | 'bearish' | 'neutral'
  probability: number
  timeframe: string
  priceTarget: number
  confidence: number
  factors: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

interface AIModel {
  id: string
  name: string
  type: 'neural_network' | 'random_forest' | 'lstm' | 'transformer'
  accuracy: number
  description: string
  isActive: boolean
  lastTrained: string
  signals: number
  successRate: number
}

interface AITradingSignalsProps {
  symbols: string[]
  onSignalAction?: (signal: AISignal, action: 'follow' | 'ignore') => void
}

const AITradingSignals: React.FC<AITradingSignalsProps> = ({
  symbols = [],
  onSignalAction
}) => {
  const [signals, setSignals] = useState<AISignal[]>([])
  const [predictions, setPredictions] = useState<MarketPrediction[]>([])
  const [models, setModels] = useState<AIModel[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all')
  const [selectedStrength, setSelectedStrength] = useState<string>('all')
  const [selectedSymbol, setSelectedSymbol] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState(true)

  // Initialize AI models and signals
  useEffect(() => {
    const mockModels: AIModel[] = [
      {
        id: 'neural-net-v1',
        name: 'Neural Network V1',
        type: 'neural_network',
        accuracy: 78.5,
        description: 'Deep learning model trained on price patterns and volume data',
        isActive: true,
        lastTrained: '2024-01-15',
        signals: 156,
        successRate: 76.2
      },
      {
        id: 'lstm-sentiment',
        name: 'LSTM Sentiment Model',
        type: 'lstm',
        accuracy: 82.1,
        description: 'Long Short-Term Memory model incorporating sentiment analysis',
        isActive: true,
        lastTrained: '2024-01-14',
        signals: 89,
        successRate: 81.5
      },
      {
        id: 'transformer-multi',
        name: 'Transformer Multi-Asset',
        type: 'transformer',
        accuracy: 85.3,
        description: 'Transformer model analyzing cross-asset correlations',
        isActive: false,
        lastTrained: '2024-01-12',
        signals: 234,
        successRate: 84.7
      }
    ]

    const mockSignals: AISignal[] = [
      {
        id: 'signal-1',
        symbol: 'BTC',
        type: 'buy',
        confidence: 87,
        strength: 'strong',
        timeframe: '4h',
        targetPrice: 48500,
        stopLoss: 42000,
        riskReward: 2.8,
        reasoning: [
          'Strong bullish divergence detected on RSI',
          'Volume surge indicates institutional accumulation',
          'Breaking above key resistance at $45,000'
        ],
        technicalFactors: ['RSI Divergence', 'Volume Breakout', 'Support/Resistance'],
        fundamentalFactors: ['ETF Inflows', 'Institutional Adoption'],
        sentimentScore: 75,
        timestamp: Date.now() - 30 * 60 * 1000,
        expiresAt: Date.now() + 4 * 60 * 60 * 1000,
        accuracy: 78.5,
        isActive: true
      },
      {
        id: 'signal-2',
        symbol: 'ETH',
        type: 'sell',
        confidence: 72,
        strength: 'moderate',
        timeframe: '1d',
        targetPrice: 2200,
        stopLoss: 2650,
        riskReward: 1.9,
        reasoning: [
          'Bearish head and shoulders pattern forming',
          'Declining network activity',
          'Overbought conditions on multiple timeframes'
        ],
        technicalFactors: ['Chart Pattern', 'Momentum Indicators', 'Overbought'],
        fundamentalFactors: ['Network Activity', 'Gas Fees'],
        sentimentScore: 35,
        timestamp: Date.now() - 45 * 60 * 1000,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        accuracy: 82.1,
        isActive: true
      },
      {
        id: 'signal-3',
        symbol: 'SOL',
        type: 'buy',
        confidence: 91,
        strength: 'strong',
        timeframe: '1h',
        targetPrice: 125,
        stopLoss: 95,
        riskReward: 3.2,
        reasoning: [
          'Golden cross formation on moving averages',
          'Ecosystem growth accelerating',
          'Strong relative strength vs Bitcoin'
        ],
        technicalFactors: ['Moving Average Cross', 'Relative Strength', 'Volume'],
        fundamentalFactors: ['Ecosystem Growth', 'Developer Activity'],
        sentimentScore: 82,
        timestamp: Date.now() - 15 * 60 * 1000,
        expiresAt: Date.now() + 1 * 60 * 60 * 1000,
        accuracy: 85.3,
        isActive: true
      }
    ]

    const mockPredictions: MarketPrediction[] = [
      {
        symbol: 'BTC',
        direction: 'bullish',
        probability: 78,
        timeframe: '7 days',
        priceTarget: 52000,
        confidence: 82,
        factors: ['Technical breakout', 'Institutional demand', 'Macro environment'],
        riskLevel: 'medium'
      },
      {
        symbol: 'ETH',
        direction: 'bearish',
        probability: 65,
        timeframe: '3 days',
        priceTarget: 2100,
        confidence: 71,
        factors: ['Overbought conditions', 'Profit taking', 'Gas fee concerns'],
        riskLevel: 'high'
      }
    ]

    setModels(mockModels)
    setSignals(mockSignals)
    setPredictions(mockPredictions)
  }, [])

  // Filter signals
  const filteredSignals = signals.filter(signal => {
    const matchesTimeframe = selectedTimeframe === 'all' || signal.timeframe === selectedTimeframe
    const matchesStrength = selectedStrength === 'all' || signal.strength === selectedStrength
    const matchesSymbol = selectedSymbol === 'all' || signal.symbol === selectedSymbol
    return matchesTimeframe && matchesStrength && matchesSymbol && signal.isActive
  })

  // Refresh signals
  const refreshSignals = () => {
    setIsLoading(true)
    setTimeout(() => {
      // Simulate new signals
      setIsLoading(false)
    }, 2000)
  }

  // Get signal color
  const getSignalColor = (type: string) => {
    switch (type) {
      case 'buy': return 'text-green-400'
      case 'sell': return 'text-red-400'
      case 'hold': return 'text-yellow-400'
      default: return 'text-white/60'
    }
  }

  // Get signal icon
  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'buy': return <TrendingUp className="w-5 h-5" />
      case 'sell': return <TrendingDown className="w-5 h-5" />
      case 'hold': return <Activity className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
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

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Format time remaining
  const formatTimeRemaining = (expiresAt: number): string => {
    const remaining = expiresAt - Date.now()
    if (remaining <= 0) return 'Expired'
    
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Format currency
  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">AI Trading Signals</h2>
          <p className="text-white/60">Machine learning-powered trading recommendations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNotifications(!notifications)}
            className={`p-2 rounded-lg transition-colors ${
              notifications ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
            title={notifications ? 'Disable Notifications' : 'Enable Notifications'}
          >
            {notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          <button
            onClick={refreshSignals}
            disabled={isLoading}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            title="Refresh Signals"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* AI Models Status */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">AI Models Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.map(model => (
            <div key={model.id} className={`p-4 rounded-lg border ${model.isActive ? 'border-green-400/30 bg-green-400/5' : 'border-white/10 bg-white/5'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{model.name}</h4>
                <div className={`w-2 h-2 rounded-full ${model.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
              </div>
              <p className="text-white/60 text-sm mb-3">{model.description}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Accuracy:</span>
                  <span className="text-white">{model.accuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Success Rate:</span>
                  <span className="text-green-400">{model.successRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Signals:</span>
                  <span className="text-white">{model.signals}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
        >
          <option value="all" className="bg-gray-800">All Symbols</option>
          {symbols.map(symbol => (
            <option key={symbol} value={symbol} className="bg-gray-800">{symbol}</option>
          ))}
        </select>

        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
        >
          <option value="all" className="bg-gray-800">All Timeframes</option>
          <option value="1h" className="bg-gray-800">1 Hour</option>
          <option value="4h" className="bg-gray-800">4 Hours</option>
          <option value="1d" className="bg-gray-800">1 Day</option>
          <option value="1w" className="bg-gray-800">1 Week</option>
        </select>

        <select
          value={selectedStrength}
          onChange={(e) => setSelectedStrength(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
        >
          <option value="all" className="bg-gray-800">All Strengths</option>
          <option value="strong" className="bg-gray-800">Strong</option>
          <option value="moderate" className="bg-gray-800">Moderate</option>
          <option value="weak" className="bg-gray-800">Weak</option>
        </select>
      </div>

      {/* Active Signals */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Active Signals</h3>
        {filteredSignals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSignals.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 hover:scale-105 transition-all duration-300"
              >
                {/* Signal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getSignalColor(signal.type).replace('text-', 'bg-').replace('-400', '-400/20')}`}>
                      {getSignalIcon(signal.type)}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{signal.symbol}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium capitalize ${getSignalColor(signal.type)}`}>
                          {signal.type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStrengthColor(signal.strength)} bg-current/20`}>
                          {signal.strength}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getConfidenceColor(signal.confidence)}`}>
                      {signal.confidence}%
                    </div>
                    <div className="text-white/60 text-sm">Confidence</div>
                  </div>
                </div>

                {/* Signal Details */}
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-white/60 text-sm">Target Price:</span>
                      <div className="text-white font-medium">{formatCurrency(signal.targetPrice)}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Stop Loss:</span>
                      <div className="text-white font-medium">{formatCurrency(signal.stopLoss)}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Risk/Reward:</span>
                      <div className="text-green-400 font-medium">{signal.riskReward.toFixed(1)}:1</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Timeframe:</span>
                      <div className="text-white font-medium">{signal.timeframe}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-white/60 text-sm">Expires in:</span>
                    <div className="text-yellow-400 font-medium">{formatTimeRemaining(signal.expiresAt)}</div>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="space-y-3 mb-4">
                  <h5 className="text-white font-medium">AI Reasoning:</h5>
                  <ul className="space-y-1">
                    {signal.reasoning.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-white/80 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Factors */}
                <div className="space-y-2 mb-4">
                  <div className="flex flex-wrap gap-1">
                    {signal.technicalFactors.map(factor => (
                      <span key={factor} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {factor}
                      </span>
                    ))}
                    {signal.fundamentalFactors.map(factor => (
                      <span key={factor} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => onSignalAction?.(signal, 'follow')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Follow Signal
                  </button>
                  <button
                    onClick={() => onSignalAction?.(signal, 'ignore')}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Ignore
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Brain className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Active Signals</h3>
            <p className="text-white/60">AI models are analyzing the market. New signals will appear here.</p>
          </div>
        )}
      </div>

      {/* Market Predictions */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Market Predictions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {predictions.map((prediction, index) => (
            <motion.div
              key={`${prediction.symbol}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-4 bg-white/5 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold text-white">{prediction.symbol}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                  prediction.direction === 'bullish' ? 'bg-green-500/20 text-green-400' :
                  prediction.direction === 'bearish' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {prediction.direction}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Probability:</span>
                  <span className="text-white">{prediction.probability}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Target:</span>
                  <span className="text-white">{formatCurrency(prediction.priceTarget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Timeframe:</span>
                  <span className="text-white">{prediction.timeframe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Risk Level:</span>
                  <span className={`capitalize ${
                    prediction.riskLevel === 'low' ? 'text-green-400' :
                    prediction.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {prediction.riskLevel}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-white/60 text-sm mb-1">Key Factors:</div>
                <div className="flex flex-wrap gap-1">
                  {prediction.factors.map(factor => (
                    <span key={factor} className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AITradingSignals
