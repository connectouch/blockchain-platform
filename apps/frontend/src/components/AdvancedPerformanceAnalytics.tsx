import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Target,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Percent
} from 'lucide-react'

interface PerformanceMetrics {
  totalReturn: number
  annualizedReturn: number
  volatility: number
  sharpeRatio: number
  sortinoRatio: number
  calmarRatio: number
  maxDrawdown: number
  alpha: number
  beta: number
  informationRatio: number
  trackingError: number
  winRate: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  bestDay: number
  worstDay: number
  consecutiveWins: number
  consecutiveLosses: number
}

interface BenchmarkComparison {
  name: string
  symbol: string
  return: number
  volatility: number
  correlation: number
  outperformance: number
}

interface AttributionAnalysis {
  category: string
  allocation: number
  return: number
  contribution: number
  selection: number
  interaction: number
}

interface TimeSeriesData {
  timestamp: number
  portfolioValue: number
  benchmarkValue: number
  drawdown: number
  returns: number
}

interface AdvancedPerformanceAnalyticsProps {
  portfolioValue: number
  timeframe: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'
  onTimeframeChange?: (timeframe: string) => void
}

const AdvancedPerformanceAnalytics: React.FC<AdvancedPerformanceAnalyticsProps> = ({
  portfolioValue,
  timeframe = '1M',
  onTimeframeChange
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'benchmarks' | 'attribution' | 'risk'>('overview')
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [benchmarks, setBenchmarks] = useState<BenchmarkComparison[]>([])
  const [attribution, setAttribution] = useState<AttributionAnalysis[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Initialize performance data
  useEffect(() => {
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const mockMetrics: PerformanceMetrics = {
        totalReturn: 24.5,
        annualizedReturn: 18.7,
        volatility: 32.4,
        sharpeRatio: 1.42,
        sortinoRatio: 2.18,
        calmarRatio: 0.89,
        maxDrawdown: -15.8,
        alpha: 3.2,
        beta: 0.85,
        informationRatio: 0.67,
        trackingError: 8.4,
        winRate: 62.5,
        profitFactor: 1.85,
        avgWin: 4.2,
        avgLoss: -2.8,
        bestDay: 12.4,
        worstDay: -8.9,
        consecutiveWins: 7,
        consecutiveLosses: 3
      }

      const mockBenchmarks: BenchmarkComparison[] = [
        {
          name: 'Bitcoin',
          symbol: 'BTC',
          return: 18.2,
          volatility: 45.6,
          correlation: 0.72,
          outperformance: 6.3
        },
        {
          name: 'Ethereum',
          symbol: 'ETH',
          return: 22.1,
          volatility: 52.3,
          correlation: 0.68,
          outperformance: 2.4
        },
        {
          name: 'DeFi Pulse Index',
          symbol: 'DPI',
          return: 15.8,
          volatility: 48.9,
          correlation: 0.84,
          outperformance: 8.7
        },
        {
          name: 'S&P 500',
          symbol: 'SPX',
          return: 12.4,
          volatility: 18.2,
          correlation: 0.23,
          outperformance: 12.1
        }
      ]

      const mockAttribution: AttributionAnalysis[] = [
        {
          category: 'Large Cap',
          allocation: 45.2,
          return: 28.4,
          contribution: 12.8,
          selection: 2.4,
          interaction: 0.8
        },
        {
          category: 'DeFi',
          allocation: 25.8,
          return: 35.6,
          contribution: 9.2,
          selection: 4.1,
          interaction: 1.2
        },
        {
          category: 'Layer 1',
          allocation: 18.5,
          return: 15.2,
          contribution: 2.8,
          selection: -1.8,
          interaction: -0.4
        },
        {
          category: 'Stablecoins',
          allocation: 10.5,
          return: 2.1,
          contribution: 0.2,
          selection: 0.1,
          interaction: 0.0
        }
      ]

      // Generate time series data
      const mockTimeSeries: TimeSeriesData[] = Array.from({ length: 90 }, (_, i) => {
        const baseValue = 100000
        const trend = i * 50
        const volatility = Math.sin(i * 0.1) * 2000 + Math.random() * 1000
        const portfolioValue = baseValue + trend + volatility
        const benchmarkValue = baseValue + trend * 0.8 + volatility * 0.6
        
        return {
          timestamp: Date.now() - (90 - i) * 24 * 60 * 60 * 1000,
          portfolioValue,
          benchmarkValue,
          drawdown: Math.min(0, (portfolioValue - Math.max(...Array.from({ length: i + 1 }, (_, j) => baseValue + j * 50 + Math.sin(j * 0.1) * 2000))) / portfolioValue * 100),
          returns: i > 0 ? ((portfolioValue - (baseValue + (i - 1) * 50 + Math.sin((i - 1) * 0.1) * 2000)) / (baseValue + (i - 1) * 50 + Math.sin((i - 1) * 0.1) * 2000)) * 100 : 0
        }
      })

      setMetrics(mockMetrics)
      setBenchmarks(mockBenchmarks)
      setAttribution(mockAttribution)
      setTimeSeriesData(mockTimeSeries)
      setIsLoading(false)
    }, 1500)
  }, [timeframe])

  // Format percentage
  const formatPercent = (value: number): string => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  // Format currency
  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Get performance color
  const getPerformanceColor = (value: number): string => {
    if (value > 0) return 'text-green-400'
    if (value < 0) return 'text-red-400'
    return 'text-white/60'
  }

  // Get risk color
  const getRiskColor = (value: number, threshold: { low: number; medium: number }): string => {
    if (value <= threshold.low) return 'text-green-400'
    if (value <= threshold.medium) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Get ratio color
  const getRatioColor = (value: number, isHigherBetter: boolean = true): string => {
    if (isHigherBetter) {
      if (value >= 1.5) return 'text-green-400'
      if (value >= 1.0) return 'text-yellow-400'
      return 'text-red-400'
    } else {
      if (value <= 0.5) return 'text-green-400'
      if (value <= 1.0) return 'text-yellow-400'
      return 'text-red-400'
    }
  }

  const timeframes = [
    { value: '1D', label: '1D' },
    { value: '1W', label: '1W' },
    { value: '1M', label: '1M' },
    { value: '3M', label: '3M' },
    { value: '6M', label: '6M' },
    { value: '1Y', label: '1Y' },
    { value: 'ALL', label: 'ALL' }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-12 text-center">
          <RefreshCw className="w-16 h-16 text-white/20 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-bold text-white mb-2">Calculating Performance Metrics</h3>
          <p className="text-white/60">Analyzing portfolio performance and risk metrics...</p>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Performance Analytics</h2>
          <p className="text-white/60">Advanced portfolio performance and risk analysis</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex bg-white/5 rounded-lg p-1">
            {timeframes.map(tf => (
              <button
                key={tf.value}
                onClick={() => onTimeframeChange?.(tf.value)}
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
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showAdvanced 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {showAdvanced ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Advanced
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'benchmarks', label: 'Benchmarks', icon: <Target className="w-4 h-4" /> },
          { id: 'attribution', label: 'Attribution', icon: <PieChart className="w-4 h-4" /> },
          { id: 'risk', label: 'Risk Analysis', icon: <Shield className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Total Return</h3>
                  <p className={`text-3xl font-bold ${getPerformanceColor(metrics.totalReturn)}`}>
                    {formatPercent(metrics.totalReturn)}
                  </p>
                  <p className="text-sm text-white/60 mt-1">{timeframe} Period</p>
                </div>
                <div className="glass-card p-6 text-center">
                  <Activity className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Sharpe Ratio</h3>
                  <p className={`text-3xl font-bold ${getRatioColor(metrics.sharpeRatio)}`}>
                    {metrics.sharpeRatio.toFixed(2)}
                  </p>
                  <p className="text-sm text-white/60 mt-1">Risk-Adjusted Return</p>
                </div>
                <div className="glass-card p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Max Drawdown</h3>
                  <p className="text-3xl font-bold text-red-400">
                    {formatPercent(metrics.maxDrawdown)}
                  </p>
                  <p className="text-sm text-white/60 mt-1">Worst Decline</p>
                </div>
                <div className="glass-card p-6 text-center">
                  <Percent className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Volatility</h3>
                  <p className={`text-3xl font-bold ${getRiskColor(metrics.volatility, { low: 20, medium: 40 })}`}>
                    {formatPercent(metrics.volatility)}
                  </p>
                  <p className="text-sm text-white/60 mt-1">Annualized</p>
                </div>
              </div>

              {/* Performance Chart Placeholder */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Performance Chart</h3>
                <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Portfolio vs Benchmark Performance</p>
                    <p className="text-white/40 text-sm">{timeSeriesData.length} data points</p>
                  </div>
                </div>
              </div>

              {/* Advanced Metrics */}
              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Risk Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/60">Sortino Ratio:</span>
                        <span className={getRatioColor(metrics.sortinoRatio)}>{metrics.sortinoRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Calmar Ratio:</span>
                        <span className={getRatioColor(metrics.calmarRatio)}>{metrics.calmarRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Beta:</span>
                        <span className="text-white">{metrics.beta.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Alpha:</span>
                        <span className={getPerformanceColor(metrics.alpha)}>{formatPercent(metrics.alpha)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Information Ratio:</span>
                        <span className={getRatioColor(metrics.informationRatio)}>{metrics.informationRatio.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Trading Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/60">Win Rate:</span>
                        <span className="text-green-400">{formatPercent(metrics.winRate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Profit Factor:</span>
                        <span className={getRatioColor(metrics.profitFactor)}>{metrics.profitFactor.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Avg Win:</span>
                        <span className="text-green-400">{formatPercent(metrics.avgWin)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Avg Loss:</span>
                        <span className="text-red-400">{formatPercent(metrics.avgLoss)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Best Day:</span>
                        <span className="text-green-400">{formatPercent(metrics.bestDay)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Worst Day:</span>
                        <span className="text-red-400">{formatPercent(metrics.worstDay)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'benchmarks' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Benchmark Comparison</h3>
                <div className="space-y-4">
                  {benchmarks.map((benchmark, index) => (
                    <motion.div
                      key={benchmark.symbol}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-4 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-white font-medium">{benchmark.name}</h4>
                          <p className="text-white/60 text-sm">{benchmark.symbol}</p>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getPerformanceColor(benchmark.outperformance)}`}>
                            {benchmark.outperformance >= 0 ? '+' : ''}{benchmark.outperformance.toFixed(1)}%
                          </div>
                          <div className="text-white/60 text-sm">Outperformance</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-white/60">Return:</span>
                          <div className={`font-medium ${getPerformanceColor(benchmark.return)}`}>
                            {formatPercent(benchmark.return)}
                          </div>
                        </div>
                        <div>
                          <span className="text-white/60">Volatility:</span>
                          <div className="text-white">{formatPercent(benchmark.volatility)}</div>
                        </div>
                        <div>
                          <span className="text-white/60">Correlation:</span>
                          <div className="text-white">{benchmark.correlation.toFixed(2)}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attribution' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Performance Attribution</h3>
                <div className="space-y-4">
                  {attribution.map((attr, index) => (
                    <motion.div
                      key={attr.category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-4 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">{attr.category}</h4>
                        <span className="text-white/60 text-sm">{attr.allocation.toFixed(1)}% allocation</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-white/60">Return:</span>
                          <div className={`font-medium ${getPerformanceColor(attr.return)}`}>
                            {formatPercent(attr.return)}
                          </div>
                        </div>
                        <div>
                          <span className="text-white/60">Contribution:</span>
                          <div className={`font-medium ${getPerformanceColor(attr.contribution)}`}>
                            {formatPercent(attr.contribution)}
                          </div>
                        </div>
                        <div>
                          <span className="text-white/60">Selection:</span>
                          <div className={`font-medium ${getPerformanceColor(attr.selection)}`}>
                            {formatPercent(attr.selection)}
                          </div>
                        </div>
                        <div>
                          <span className="text-white/60">Interaction:</span>
                          <div className={`font-medium ${getPerformanceColor(attr.interaction)}`}>
                            {formatPercent(attr.interaction)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Risk Summary</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Portfolio Risk Level:</span>
                      <span className={getRiskColor(metrics.volatility, { low: 20, medium: 40 })}>
                        {metrics.volatility <= 20 ? 'Low' : metrics.volatility <= 40 ? 'Medium' : 'High'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Max Drawdown:</span>
                      <span className="text-red-400">{formatPercent(metrics.maxDrawdown)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Tracking Error:</span>
                      <span className="text-white">{formatPercent(metrics.trackingError)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Consecutive Losses:</span>
                      <span className="text-white">{metrics.consecutiveLosses}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Drawdown Analysis</h3>
                  <div className="h-32 bg-gray-800/50 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <TrendingDown className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-white/60 text-sm">Drawdown Chart</p>
                    </div>
                  </div>
                  <div className="text-sm text-white/60">
                    Current drawdown from peak: <span className="text-red-400">-3.2%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default AdvancedPerformanceAnalytics
