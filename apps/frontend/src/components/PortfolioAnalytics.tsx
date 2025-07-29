import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Shield,
  AlertTriangle,
  Calendar,
  Clock,
  Zap,
  Award,
  RefreshCw,
  Download,
  Settings,
  Eye,
  EyeOff,
  Filter
} from 'lucide-react'

interface PortfolioHolding {
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  currentPrice: number
  value: number
  allocation: number
  pnl: number
  pnlPercent: number
  dayChange: number
  dayChangePercent: number
}

interface PerformanceMetrics {
  totalValue: number
  totalPnL: number
  totalPnLPercent: number
  dayChange: number
  dayChangePercent: number
  weekChange: number
  weekChangePercent: number
  monthChange: number
  monthChangePercent: number
  yearChange: number
  yearChangePercent: number
  sharpeRatio: number
  maxDrawdown: number
  volatility: number
  beta: number
  alpha: number
  winRate: number
  avgWin: number
  avgLoss: number
  profitFactor: number
}

interface RiskMetrics {
  portfolioRisk: 'low' | 'medium' | 'high'
  concentrationRisk: number
  correlationRisk: number
  liquidityRisk: number
  volatilityRisk: number
  var95: number // Value at Risk 95%
  var99: number // Value at Risk 99%
  expectedShortfall: number
  riskScore: number
}

interface PortfolioAnalyticsProps {
  walletAddress?: string
  holdings: PortfolioHolding[]
  isLoading?: boolean
  onRebalance?: () => void
}

const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({
  walletAddress,
  holdings = [],
  isLoading = false,
  onRebalance
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'risk' | 'allocation'>('overview')
  const [timeframe, setTimeframe] = useState('1M')
  const [showDetails, setShowDetails] = useState(true)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null)

  // Calculate portfolio metrics
  useEffect(() => {
    if (holdings.length === 0) return

    const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0)
    const totalPnL = holdings.reduce((sum, holding) => sum + holding.pnl, 0)
    const totalPnLPercent = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0
    const dayChange = holdings.reduce((sum, holding) => sum + holding.dayChange, 0)
    const dayChangePercent = totalValue > 0 ? (dayChange / totalValue) * 100 : 0

    // Mock performance metrics
    const mockPerformance: PerformanceMetrics = {
      totalValue,
      totalPnL,
      totalPnLPercent,
      dayChange,
      dayChangePercent,
      weekChange: dayChange * 1.5,
      weekChangePercent: dayChangePercent * 1.5,
      monthChange: dayChange * 4.2,
      monthChangePercent: dayChangePercent * 4.2,
      yearChange: dayChange * 52,
      yearChangePercent: dayChangePercent * 52,
      sharpeRatio: 1.2 + Math.random() * 0.8,
      maxDrawdown: -(5 + Math.random() * 15),
      volatility: 15 + Math.random() * 20,
      beta: 0.8 + Math.random() * 0.6,
      alpha: -2 + Math.random() * 8,
      winRate: 55 + Math.random() * 25,
      avgWin: 3 + Math.random() * 4,
      avgLoss: -(2 + Math.random() * 2),
      profitFactor: 1.1 + Math.random() * 0.8
    }

    // Calculate risk metrics
    const concentrationRisk = Math.max(...holdings.map(h => h.allocation))
    const mockRisk: RiskMetrics = {
      portfolioRisk: concentrationRisk > 40 ? 'high' : concentrationRisk > 20 ? 'medium' : 'low',
      concentrationRisk,
      correlationRisk: 30 + Math.random() * 40,
      liquidityRisk: 20 + Math.random() * 30,
      volatilityRisk: mockPerformance.volatility,
      var95: totalValue * 0.05,
      var99: totalValue * 0.01,
      expectedShortfall: totalValue * 0.08,
      riskScore: 40 + Math.random() * 40
    }

    setPerformanceMetrics(mockPerformance)
    setRiskMetrics(mockRisk)
  }, [holdings])

  // Format currency
  const formatCurrency = (value: number): string => {
    return `$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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

  // Get risk color
  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  // Get allocation color
  const getAllocationColor = (index: number): string => {
    const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#f97316']
    return colors[index % colors.length]
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-12 text-center">
          <RefreshCw className="w-16 h-16 text-white/20 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-bold text-white mb-2">Loading Portfolio Analytics</h3>
          <p className="text-white/60">Analyzing your portfolio performance and risk metrics...</p>
        </div>
      </div>
    )
  }

  if (holdings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-12 text-center">
          <PieChart className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Portfolio Data</h3>
          <p className="text-white/60">Connect your wallet or add holdings to view analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Portfolio Analytics</h2>
          <p className="text-white/60">
            {walletAddress 
              ? `Analyzing wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : 'Advanced portfolio performance and risk analysis'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            <option value="1D" className="bg-gray-800">1 Day</option>
            <option value="1W" className="bg-gray-800">1 Week</option>
            <option value="1M" className="bg-gray-800">1 Month</option>
            <option value="3M" className="bg-gray-800">3 Months</option>
            <option value="1Y" className="bg-gray-800">1 Year</option>
          </select>
          <button
            onClick={onRebalance}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
          >
            Rebalance
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'performance', label: 'Performance', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'risk', label: 'Risk Analysis', icon: <Shield className="w-4 h-4" /> },
          { id: 'allocation', label: 'Allocation', icon: <PieChart className="w-4 h-4" /> }
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
          {activeTab === 'overview' && performanceMetrics && (
            <div className="space-y-6">
              {/* Portfolio Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 text-center">
                  <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Total Value</h3>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(performanceMetrics.totalValue)}
                  </p>
                </div>
                <div className="glass-card p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Total P&L</h3>
                  <p className={`text-3xl font-bold ${getPerformanceColor(performanceMetrics.totalPnL)}`}>
                    {performanceMetrics.totalPnL >= 0 ? '+' : ''}{formatCurrency(performanceMetrics.totalPnL)}
                  </p>
                  <p className={`text-sm ${getPerformanceColor(performanceMetrics.totalPnLPercent)}`}>
                    {formatPercent(performanceMetrics.totalPnLPercent)}
                  </p>
                </div>
                <div className="glass-card p-6 text-center">
                  <Activity className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">24h Change</h3>
                  <p className={`text-3xl font-bold ${getPerformanceColor(performanceMetrics.dayChange)}`}>
                    {performanceMetrics.dayChange >= 0 ? '+' : ''}{formatCurrency(performanceMetrics.dayChange)}
                  </p>
                  <p className={`text-sm ${getPerformanceColor(performanceMetrics.dayChangePercent)}`}>
                    {formatPercent(performanceMetrics.dayChangePercent)}
                  </p>
                </div>
                <div className="glass-card p-6 text-center">
                  <Target className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Holdings</h3>
                  <p className="text-3xl font-bold text-white">{holdings.length}</p>
                  <p className="text-sm text-white/60">Assets</p>
                </div>
              </div>

              {/* Top Holdings */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Top Holdings</h3>
                <div className="space-y-3">
                  {holdings.slice(0, 5).map((holding, index) => (
                    <div key={holding.symbol} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getAllocationColor(index) }}
                        />
                        <div>
                          <h4 className="text-white font-medium">{holding.symbol}</h4>
                          <p className="text-white/60 text-sm">{holding.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{formatCurrency(holding.value)}</div>
                        <div className="text-white/60 text-sm">{holding.allocation.toFixed(1)}%</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getPerformanceColor(holding.pnl)}`}>
                          {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}
                        </div>
                        <div className={`text-sm ${getPerformanceColor(holding.pnlPercent)}`}>
                          {formatPercent(holding.pnlPercent)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && performanceMetrics && (
            <div className="space-y-6">
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Returns</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">1 Day:</span>
                      <span className={getPerformanceColor(performanceMetrics.dayChangePercent)}>
                        {formatPercent(performanceMetrics.dayChangePercent)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">1 Week:</span>
                      <span className={getPerformanceColor(performanceMetrics.weekChangePercent)}>
                        {formatPercent(performanceMetrics.weekChangePercent)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">1 Month:</span>
                      <span className={getPerformanceColor(performanceMetrics.monthChangePercent)}>
                        {formatPercent(performanceMetrics.monthChangePercent)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">1 Year:</span>
                      <span className={getPerformanceColor(performanceMetrics.yearChangePercent)}>
                        {formatPercent(performanceMetrics.yearChangePercent)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Risk Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Sharpe Ratio:</span>
                      <span className="text-white">{performanceMetrics.sharpeRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Max Drawdown:</span>
                      <span className="text-red-400">{formatPercent(performanceMetrics.maxDrawdown)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Volatility:</span>
                      <span className="text-white">{formatPercent(performanceMetrics.volatility)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Beta:</span>
                      <span className="text-white">{performanceMetrics.beta.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Trading Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Win Rate:</span>
                      <span className="text-green-400">{formatPercent(performanceMetrics.winRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Avg Win:</span>
                      <span className="text-green-400">{formatPercent(performanceMetrics.avgWin)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Avg Loss:</span>
                      <span className="text-red-400">{formatPercent(performanceMetrics.avgLoss)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Profit Factor:</span>
                      <span className="text-white">{performanceMetrics.profitFactor.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Chart Placeholder */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Performance Chart</h3>
                <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Portfolio performance chart</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'risk' && riskMetrics && (
            <div className="space-y-6">
              {/* Risk Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 text-center">
                  <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Portfolio Risk</h3>
                  <p className={`text-2xl font-bold capitalize ${getRiskColor(riskMetrics.portfolioRisk)}`}>
                    {riskMetrics.portfolioRisk}
                  </p>
                </div>
                <div className="glass-card p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Risk Score</h3>
                  <p className="text-2xl font-bold text-white">{riskMetrics.riskScore.toFixed(0)}</p>
                  <p className="text-sm text-white/60">out of 100</p>
                </div>
                <div className="glass-card p-6 text-center">
                  <Target className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">VaR (95%)</h3>
                  <p className="text-2xl font-bold text-red-400">
                    {formatCurrency(riskMetrics.var95)}
                  </p>
                </div>
                <div className="glass-card p-6 text-center">
                  <Activity className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Max Concentration</h3>
                  <p className="text-2xl font-bold text-white">
                    {riskMetrics.concentrationRisk.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Risk Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Risk Factors</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">Concentration Risk</span>
                        <span className="text-white">{riskMetrics.concentrationRisk.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-red-400 h-2 rounded-full"
                          style={{ width: `${Math.min(riskMetrics.concentrationRisk, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">Correlation Risk</span>
                        <span className="text-white">{riskMetrics.correlationRisk.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${riskMetrics.correlationRisk}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">Liquidity Risk</span>
                        <span className="text-white">{riskMetrics.liquidityRisk.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full"
                          style={{ width: `${riskMetrics.liquidityRisk}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Value at Risk</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-white/60">VaR 95% (1 day):</span>
                      <span className="text-red-400">{formatCurrency(riskMetrics.var95)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">VaR 99% (1 day):</span>
                      <span className="text-red-400">{formatCurrency(riskMetrics.var99)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Expected Shortfall:</span>
                      <span className="text-red-400">{formatCurrency(riskMetrics.expectedShortfall)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'allocation' && (
            <div className="space-y-6">
              {/* Allocation Chart */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Asset Allocation</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60">Allocation pie chart</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {holdings.map((holding, index) => (
                      <div key={holding.symbol} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: getAllocationColor(index) }}
                          />
                          <span className="text-white">{holding.symbol}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{holding.allocation.toFixed(1)}%</div>
                          <div className="text-white/60 text-sm">{formatCurrency(holding.value)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rebalancing Suggestions */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Rebalancing Suggestions</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="text-yellow-400 font-medium">High Concentration Risk</h4>
                        <p className="text-white/80 text-sm">
                          Consider reducing {holdings[0]?.symbol} allocation from {holdings[0]?.allocation.toFixed(1)}% to below 25%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-blue-400 font-medium">Diversification Opportunity</h4>
                        <p className="text-white/80 text-sm">
                          Consider adding exposure to DeFi tokens or stablecoins for better risk-adjusted returns
                        </p>
                      </div>
                    </div>
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

export default PortfolioAnalytics
