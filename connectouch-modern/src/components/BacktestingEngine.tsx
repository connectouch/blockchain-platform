import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play,
  Pause,
  Square,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Clock,
  Settings,
  Download,
  Upload,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  Zap
} from 'lucide-react'

interface BacktestResult {
  totalReturn: number
  annualizedReturn: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  totalTrades: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  largestWin: number
  largestLoss: number
  consecutiveWins: number
  consecutiveLosses: number
  volatility: number
  calmarRatio: number
}

interface Trade {
  id: string
  timestamp: number
  type: 'buy' | 'sell'
  price: number
  quantity: number
  pnl: number
  reason: string
  duration?: number
}

interface Strategy {
  id: string
  name: string
  description: string
  parameters: { [key: string]: any }
  rules: {
    entry: string[]
    exit: string[]
    riskManagement: string[]
  }
  isActive: boolean
}

interface BacktestingEngineProps {
  symbol: string
  historicalData: any[]
  onStrategyChange?: (strategy: Strategy) => void
}

const BacktestingEngine: React.FC<BacktestingEngineProps> = ({
  symbol,
  historicalData = [],
  onStrategyChange
}) => {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [customStrategy, setCustomStrategy] = useState('')
  const [timeframe, setTimeframe] = useState('1d')
  const [startDate, setStartDate] = useState('2023-01-01')
  const [endDate, setEndDate] = useState('2024-01-01')
  const [initialCapital, setInitialCapital] = useState(10000)
  const [commission, setCommission] = useState(0.1)

  // Initialize default strategies
  useEffect(() => {
    const defaultStrategies: Strategy[] = [
      {
        id: 'sma-crossover',
        name: 'SMA Crossover',
        description: 'Buy when fast SMA crosses above slow SMA, sell when it crosses below',
        parameters: {
          fastPeriod: 10,
          slowPeriod: 30,
          stopLoss: 5,
          takeProfit: 10
        },
        rules: {
          entry: ['Fast SMA > Slow SMA', 'Volume > Average Volume'],
          exit: ['Fast SMA < Slow SMA', 'Stop Loss: -5%', 'Take Profit: +10%'],
          riskManagement: ['Max position size: 10%', 'Max daily loss: 2%']
        },
        isActive: true
      },
      {
        id: 'rsi-mean-reversion',
        name: 'RSI Mean Reversion',
        description: 'Buy when RSI is oversold, sell when overbought',
        parameters: {
          rsiPeriod: 14,
          oversoldLevel: 30,
          overboughtLevel: 70,
          stopLoss: 3,
          takeProfit: 6
        },
        rules: {
          entry: ['RSI < 30 (Oversold)', 'Price near support level'],
          exit: ['RSI > 70 (Overbought)', 'Stop Loss: -3%', 'Take Profit: +6%'],
          riskManagement: ['Max position size: 15%', 'Max concurrent trades: 3']
        },
        isActive: false
      },
      {
        id: 'macd-momentum',
        name: 'MACD Momentum',
        description: 'Trade based on MACD signal line crossovers and histogram',
        parameters: {
          fastEMA: 12,
          slowEMA: 26,
          signalLine: 9,
          stopLoss: 4,
          takeProfit: 8
        },
        rules: {
          entry: ['MACD > Signal Line', 'MACD Histogram increasing', 'Price above 50 EMA'],
          exit: ['MACD < Signal Line', 'Stop Loss: -4%', 'Take Profit: +8%'],
          riskManagement: ['Position sizing based on volatility', 'Max risk per trade: 1%']
        },
        isActive: false
      }
    ]
    setStrategies(defaultStrategies)
    setSelectedStrategy(defaultStrategies[0])
  }, [])

  // Run backtest
  const runBacktest = async () => {
    if (!selectedStrategy) return

    setIsRunning(true)
    setProgress(0)
    setTrades([])

    // Simulate backtest execution
    const totalSteps = 100
    for (let i = 0; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 50))
      setProgress((i / totalSteps) * 100)
    }

    // Generate mock results
    const mockResult: BacktestResult = {
      totalReturn: 15.5 + Math.random() * 20,
      annualizedReturn: 12.3 + Math.random() * 15,
      sharpeRatio: 1.2 + Math.random() * 0.8,
      maxDrawdown: -(5 + Math.random() * 10),
      winRate: 55 + Math.random() * 20,
      totalTrades: 45 + Math.floor(Math.random() * 50),
      profitFactor: 1.1 + Math.random() * 0.5,
      avgWin: 2.5 + Math.random() * 2,
      avgLoss: -(1.5 + Math.random()),
      largestWin: 8 + Math.random() * 5,
      largestLoss: -(6 + Math.random() * 4),
      consecutiveWins: 3 + Math.floor(Math.random() * 5),
      consecutiveLosses: 2 + Math.floor(Math.random() * 3),
      volatility: 15 + Math.random() * 10,
      calmarRatio: 0.8 + Math.random() * 0.4
    }

    // Generate mock trades
    const mockTrades: Trade[] = Array.from({ length: mockResult.totalTrades }, (_, i) => ({
      id: `trade-${i}`,
      timestamp: Date.now() - (mockResult.totalTrades - i) * 24 * 60 * 60 * 1000,
      type: Math.random() > 0.5 ? 'buy' : 'sell',
      price: 40000 + Math.random() * 20000,
      quantity: 0.1 + Math.random() * 0.5,
      pnl: (Math.random() - 0.4) * 1000,
      reason: selectedStrategy.name,
      duration: Math.floor(Math.random() * 72) + 1
    }))

    setBacktestResult(mockResult)
    setTrades(mockTrades)
    setIsRunning(false)
  }

  // Stop backtest
  const stopBacktest = () => {
    setIsRunning(false)
    setProgress(0)
  }

  // Format currency
  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Format percentage
  const formatPercent = (value: number): string => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  // Get performance color
  const getPerformanceColor = (value: number): string => {
    if (value > 0) return 'text-green-400'
    if (value < 0) return 'text-red-400'
    return 'text-white/60'
  }

  // Get performance icon
  const getPerformanceIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4" />
    if (value < 0) return <TrendingDown className="w-4 h-4" />
    return <Activity className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Backtesting Engine</h2>
          <p className="text-white/60">Test your trading strategies with historical data</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={isRunning ? stopBacktest : runBacktest}
            disabled={!selectedStrategy}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isRunning 
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed'
            }`}
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4" />
                Stop Backtest
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Backtest
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy Configuration */}
        <div className="space-y-6">
          {/* Strategy Selection */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Strategy Selection</h3>
            <div className="space-y-3">
              {strategies.map(strategy => (
                <div
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedStrategy?.id === strategy.id
                      ? 'bg-purple-600/20 border border-purple-400'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <h4 className="text-white font-medium mb-1">{strategy.name}</h4>
                  <p className="text-white/60 text-sm">{strategy.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Backtest Parameters */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Symbol
                </label>
                <input
                  type="text"
                  value={symbol}
                  readOnly
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Initial Capital
                </label>
                <input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Commission (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Timeframe
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="1m" className="bg-gray-800">1 Minute</option>
                  <option value="5m" className="bg-gray-800">5 Minutes</option>
                  <option value="15m" className="bg-gray-800">15 Minutes</option>
                  <option value="1h" className="bg-gray-800">1 Hour</option>
                  <option value="4h" className="bg-gray-800">4 Hours</option>
                  <option value="1d" className="bg-gray-800">1 Day</option>
                </select>
              </div>
            </div>
          </div>

          {/* Strategy Rules */}
          {selectedStrategy && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Strategy Rules</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Entry Conditions
                  </h4>
                  <ul className="space-y-1">
                    {selectedStrategy.rules.entry.map((rule, i) => (
                      <li key={i} className="text-white/60 text-sm">• {rule}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    Exit Conditions
                  </h4>
                  <ul className="space-y-1">
                    {selectedStrategy.rules.exit.map((rule, i) => (
                      <li key={i} className="text-white/60 text-sm">• {rule}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    Risk Management
                  </h4>
                  <ul className="space-y-1">
                    {selectedStrategy.rules.riskManagement.map((rule, i) => (
                      <li key={i} className="text-white/60 text-sm">• {rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Bar */}
          {isRunning && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">Running Backtest...</h3>
                <span className="text-white/60">{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          {backtestResult && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-6">Performance Metrics</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getPerformanceColor(backtestResult.totalReturn)}`}>
                    {formatPercent(backtestResult.totalReturn)}
                  </div>
                  <div className="text-white/60 text-sm">Total Return</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getPerformanceColor(backtestResult.annualizedReturn)}`}>
                    {formatPercent(backtestResult.annualizedReturn)}
                  </div>
                  <div className="text-white/60 text-sm">Annualized Return</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {backtestResult.sharpeRatio.toFixed(2)}
                  </div>
                  <div className="text-white/60 text-sm">Sharpe Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {formatPercent(backtestResult.maxDrawdown)}
                  </div>
                  <div className="text-white/60 text-sm">Max Drawdown</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {formatPercent(backtestResult.winRate)}
                  </div>
                  <div className="text-white/60 text-sm">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {backtestResult.totalTrades}
                  </div>
                  <div className="text-white/60 text-sm">Total Trades</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Profit Factor:</span>
                    <span className="text-white">{backtestResult.profitFactor.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Average Win:</span>
                    <span className="text-green-400">{formatPercent(backtestResult.avgWin)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Average Loss:</span>
                    <span className="text-red-400">{formatPercent(backtestResult.avgLoss)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Largest Win:</span>
                    <span className="text-green-400">{formatPercent(backtestResult.largestWin)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Largest Loss:</span>
                    <span className="text-red-400">{formatPercent(backtestResult.largestLoss)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Consecutive Wins:</span>
                    <span className="text-white">{backtestResult.consecutiveWins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Consecutive Losses:</span>
                    <span className="text-white">{backtestResult.consecutiveLosses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Volatility:</span>
                    <span className="text-white">{formatPercent(backtestResult.volatility)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trade History */}
          {trades.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Trade History</h3>
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {trades.slice(0, 20).map((trade, index) => (
                    <motion.div
                      key={trade.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${trade.type === 'buy' ? 'bg-green-400' : 'bg-red-400'}`} />
                        <div>
                          <div className="text-white font-medium">
                            {trade.type.toUpperCase()} {trade.quantity.toFixed(4)} {symbol}
                          </div>
                          <div className="text-white/60 text-sm">
                            {formatCurrency(trade.price)} • {new Date(trade.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getPerformanceColor(trade.pnl)}`}>
                          {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                        </div>
                        {trade.duration && (
                          <div className="text-white/60 text-sm">{trade.duration}h</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No Results */}
          {!backtestResult && !isRunning && (
            <div className="glass-card p-12 text-center">
              <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Ready to Backtest</h3>
              <p className="text-white/60">Select a strategy and click "Run Backtest" to analyze performance</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BacktestingEngine
