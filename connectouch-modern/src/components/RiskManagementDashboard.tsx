import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Clock,
  DollarSign,
  Percent,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Globe,
  Link2,
  Layers,
  TrendingUp
} from 'lucide-react'

interface RiskMetrics {
  portfolioRisk: 'low' | 'medium' | 'high'
  riskScore: number // 0-100
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  var95: number // Value at Risk 95%
  var99: number // Value at Risk 99%
  expectedShortfall: number
  beta: number
  correlationRisk: number
  concentrationRisk: number
  liquidityRisk: number
  counterpartyRisk: number
}

interface ConcentrationAnalysis {
  type: 'asset' | 'sector' | 'chain' | 'protocol'
  name: string
  allocation: number
  riskLevel: 'low' | 'medium' | 'high'
  recommendation: string
}

interface CorrelationMatrix {
  asset1: string
  asset2: string
  correlation: number
  riskLevel: 'low' | 'medium' | 'high'
}

interface StressTestScenario {
  id: string
  name: string
  description: string
  type: 'market_crash' | 'crypto_winter' | 'defi_hack' | 'regulatory' | 'custom'
  parameters: {
    btcChange: number
    ethChange: number
    altcoinChange: number
    stablecoinChange: number
    duration: number // days
  }
  results: {
    portfolioChange: number
    maxDrawdown: number
    recoveryTime: number // days
    worstAsset: string
    worstAssetChange: number
  }
}

interface LiquidityAnalysis {
  asset: string
  dailyVolume: number
  marketCap: number
  liquidityScore: number // 0-100
  timeToLiquidate: number // hours
  slippageEstimate: number // %
  riskLevel: 'low' | 'medium' | 'high'
}

interface RiskManagementDashboardProps {
  portfolioValue: number
  holdings: any[]
  timeframe: string
  onRiskAlert?: (alert: any) => void
}

const RiskManagementDashboard: React.FC<RiskManagementDashboardProps> = ({
  portfolioValue,
  holdings = [],
  timeframe = '1M',
  onRiskAlert
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'concentration' | 'correlation' | 'stress' | 'liquidity'>('overview')
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null)
  const [concentrationAnalysis, setConcentrationAnalysis] = useState<ConcentrationAnalysis[]>([])
  const [correlationMatrix, setCorrelationMatrix] = useState<CorrelationMatrix[]>([])
  const [stressTests, setStressTests] = useState<StressTestScenario[]>([])
  const [liquidityAnalysis, setLiquidityAnalysis] = useState<LiquidityAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedStressTest, setSelectedStressTest] = useState<string>('')

  // Initialize risk data
  useEffect(() => {
    setIsLoading(true)
    
    setTimeout(() => {
      const mockRiskMetrics: RiskMetrics = {
        portfolioRisk: 'medium',
        riskScore: 68,
        volatility: 45.2,
        sharpeRatio: 1.42,
        maxDrawdown: -23.8,
        var95: portfolioValue * 0.15,
        var99: portfolioValue * 0.25,
        expectedShortfall: portfolioValue * 0.32,
        beta: 0.85,
        correlationRisk: 72,
        concentrationRisk: 58,
        liquidityRisk: 34,
        counterpartyRisk: 28
      }

      const mockConcentration: ConcentrationAnalysis[] = [
        {
          type: 'asset',
          name: 'Bitcoin (BTC)',
          allocation: 45.2,
          riskLevel: 'medium',
          recommendation: 'Consider reducing BTC allocation below 40% to improve diversification'
        },
        {
          type: 'sector',
          name: 'Layer 1 Protocols',
          allocation: 68.5,
          riskLevel: 'high',
          recommendation: 'High concentration in L1s - consider adding DeFi or utility tokens'
        },
        {
          type: 'chain',
          name: 'Ethereum Ecosystem',
          allocation: 52.3,
          riskLevel: 'medium',
          recommendation: 'Moderate Ethereum exposure - consider multi-chain diversification'
        },
        {
          type: 'protocol',
          name: 'Centralized Exchanges',
          allocation: 15.8,
          riskLevel: 'low',
          recommendation: 'Acceptable CEX exposure - monitor counterparty risk'
        }
      ]

      const mockCorrelation: CorrelationMatrix[] = [
        { asset1: 'BTC', asset2: 'ETH', correlation: 0.78, riskLevel: 'high' },
        { asset1: 'BTC', asset2: 'SOL', correlation: 0.65, riskLevel: 'medium' },
        { asset1: 'ETH', asset2: 'UNI', correlation: 0.82, riskLevel: 'high' },
        { asset1: 'ETH', asset2: 'LINK', correlation: 0.71, riskLevel: 'medium' },
        { asset1: 'BTC', asset2: 'USDC', correlation: -0.12, riskLevel: 'low' },
        { asset1: 'SOL', asset2: 'AVAX', correlation: 0.69, riskLevel: 'medium' }
      ]

      const mockStressTests: StressTestScenario[] = [
        {
          id: 'crypto-winter',
          name: 'Crypto Winter 2022',
          description: 'Prolonged bear market with 80% decline from peaks',
          type: 'crypto_winter',
          parameters: {
            btcChange: -75,
            ethChange: -80,
            altcoinChange: -85,
            stablecoinChange: -2,
            duration: 365
          },
          results: {
            portfolioChange: -68.5,
            maxDrawdown: -72.3,
            recoveryTime: 890,
            worstAsset: 'SOL',
            worstAssetChange: -89.2
          }
        },
        {
          id: 'market-crash',
          name: 'Flash Crash',
          description: 'Sudden 50% market decline over 24 hours',
          type: 'market_crash',
          parameters: {
            btcChange: -45,
            ethChange: -50,
            altcoinChange: -60,
            stablecoinChange: 0,
            duration: 1
          },
          results: {
            portfolioChange: -42.8,
            maxDrawdown: -45.2,
            recoveryTime: 120,
            worstAsset: 'UNI',
            worstAssetChange: -65.4
          }
        },
        {
          id: 'defi-hack',
          name: 'Major DeFi Exploit',
          description: 'Large-scale DeFi protocol hack affecting ecosystem confidence',
          type: 'defi_hack',
          parameters: {
            btcChange: -15,
            ethChange: -25,
            altcoinChange: -40,
            stablecoinChange: -5,
            duration: 30
          },
          results: {
            portfolioChange: -28.4,
            maxDrawdown: -32.1,
            recoveryTime: 180,
            worstAsset: 'AAVE',
            worstAssetChange: -55.8
          }
        }
      ]

      const mockLiquidity: LiquidityAnalysis[] = [
        {
          asset: 'BTC',
          dailyVolume: 15000000000,
          marketCap: 850000000000,
          liquidityScore: 95,
          timeToLiquidate: 0.5,
          slippageEstimate: 0.1,
          riskLevel: 'low'
        },
        {
          asset: 'ETH',
          dailyVolume: 8000000000,
          marketCap: 280000000000,
          liquidityScore: 90,
          timeToLiquidate: 1,
          slippageEstimate: 0.2,
          riskLevel: 'low'
        },
        {
          asset: 'SOL',
          dailyVolume: 800000000,
          marketCap: 45000000000,
          liquidityScore: 75,
          timeToLiquidate: 4,
          slippageEstimate: 0.8,
          riskLevel: 'medium'
        },
        {
          asset: 'UNI',
          dailyVolume: 200000000,
          marketCap: 8000000000,
          liquidityScore: 65,
          timeToLiquidate: 8,
          slippageEstimate: 1.5,
          riskLevel: 'medium'
        }
      ]

      setRiskMetrics(mockRiskMetrics)
      setConcentrationAnalysis(mockConcentration)
      setCorrelationMatrix(mockCorrelation)
      setStressTests(mockStressTests)
      setLiquidityAnalysis(mockLiquidity)
      setSelectedStressTest(mockStressTests[0].id)
      setIsLoading(false)
    }, 1500)
  }, [portfolioValue, timeframe])

  // Format currency
  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  // Format percentage
  const formatPercent = (value: number): string => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  // Get risk color
  const getRiskColor = (level: string): string => {
    switch (level) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  // Get correlation color
  const getCorrelationColor = (correlation: number): string => {
    const abs = Math.abs(correlation)
    if (abs >= 0.8) return 'text-red-400'
    if (abs >= 0.6) return 'text-yellow-400'
    return 'text-green-400'
  }

  // Get risk score color
  const getRiskScoreColor = (score: number): string => {
    if (score <= 30) return 'text-green-400'
    if (score <= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-12 text-center">
          <RefreshCw className="w-16 h-16 text-white/20 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-bold text-white mb-2">Analyzing Portfolio Risk</h3>
          <p className="text-white/60">Calculating risk metrics and stress test scenarios...</p>
        </div>
      </div>
    )
  }

  if (!riskMetrics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Risk Management</h2>
          <p className="text-white/60">Comprehensive portfolio risk analysis and stress testing</p>
        </div>
        <div className="flex items-center gap-3">
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
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 text-center">
          <Shield className={`w-12 h-12 mx-auto mb-4 ${getRiskColor(riskMetrics.portfolioRisk)}`} />
          <h3 className="text-lg font-bold text-white mb-2">Portfolio Risk</h3>
          <p className={`text-2xl font-bold capitalize ${getRiskColor(riskMetrics.portfolioRisk)}`}>
            {riskMetrics.portfolioRisk}
          </p>
          <p className="text-sm text-white/60 mt-1">Overall Assessment</p>
        </div>
        <div className="glass-card p-6 text-center">
          <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Risk Score</h3>
          <p className={`text-2xl font-bold ${getRiskScoreColor(riskMetrics.riskScore)}`}>
            {riskMetrics.riskScore}/100
          </p>
          <p className="text-sm text-white/60 mt-1">Composite Score</p>
        </div>
        <div className="glass-card p-6 text-center">
          <TrendingDown className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Max Drawdown</h3>
          <p className="text-2xl font-bold text-red-400">
            {formatPercent(riskMetrics.maxDrawdown)}
          </p>
          <p className="text-sm text-white/60 mt-1">Worst Decline</p>
        </div>
        <div className="glass-card p-6 text-center">
          <Activity className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">VaR (95%)</h3>
          <p className="text-2xl font-bold text-yellow-400">
            {formatCurrency(riskMetrics.var95)}
          </p>
          <p className="text-sm text-white/60 mt-1">1-Day Risk</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'concentration', label: 'Concentration', icon: <PieChart className="w-4 h-4" /> },
          { id: 'correlation', label: 'Correlation', icon: <Link2 className="w-4 h-4" /> },
          { id: 'stress', label: 'Stress Tests', icon: <AlertTriangle className="w-4 h-4" /> },
          { id: 'liquidity', label: 'Liquidity', icon: <Zap className="w-4 h-4" /> }
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
              {/* Risk Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Risk Factors</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">Concentration Risk</span>
                        <span className={getRiskScoreColor(riskMetrics.concentrationRisk)}>
                          {riskMetrics.concentrationRisk}/100
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            riskMetrics.concentrationRisk <= 30 ? 'bg-green-400' :
                            riskMetrics.concentrationRisk <= 70 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${riskMetrics.concentrationRisk}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">Correlation Risk</span>
                        <span className={getRiskScoreColor(riskMetrics.correlationRisk)}>
                          {riskMetrics.correlationRisk}/100
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            riskMetrics.correlationRisk <= 30 ? 'bg-green-400' :
                            riskMetrics.correlationRisk <= 70 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${riskMetrics.correlationRisk}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">Liquidity Risk</span>
                        <span className={getRiskScoreColor(riskMetrics.liquidityRisk)}>
                          {riskMetrics.liquidityRisk}/100
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            riskMetrics.liquidityRisk <= 30 ? 'bg-green-400' :
                            riskMetrics.liquidityRisk <= 70 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${riskMetrics.liquidityRisk}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">Counterparty Risk</span>
                        <span className={getRiskScoreColor(riskMetrics.counterpartyRisk)}>
                          {riskMetrics.counterpartyRisk}/100
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            riskMetrics.counterpartyRisk <= 30 ? 'bg-green-400' :
                            riskMetrics.counterpartyRisk <= 70 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${riskMetrics.counterpartyRisk}%` }}
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
                    <div className="flex justify-between">
                      <span className="text-white/60">Portfolio Beta:</span>
                      <span className="text-white">{riskMetrics.beta.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Volatility (Annual):</span>
                      <span className="text-white">{formatPercent(riskMetrics.volatility)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Chart Placeholder */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Risk Over Time</h3>
                <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Portfolio risk metrics over time</p>
                    <p className="text-white/40 text-sm">VaR, volatility, and drawdown tracking</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'concentration' && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Concentration Analysis</h3>
              <div className="space-y-4">
                {concentrationAnalysis.map((analysis, index) => (
                  <motion.div
                    key={`${analysis.type}-${analysis.name}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-4 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium">{analysis.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                            analysis.type === 'asset' ? 'bg-blue-500/20 text-blue-400' :
                            analysis.type === 'sector' ? 'bg-green-500/20 text-green-400' :
                            analysis.type === 'chain' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {analysis.type}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getRiskColor(analysis.riskLevel)} bg-current/20`}>
                            {analysis.riskLevel} risk
                          </span>
                        </div>
                        <p className="text-white/60 text-sm">{analysis.recommendation}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">{analysis.allocation.toFixed(1)}%</div>
                        <div className="text-white/60 text-sm">Allocation</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          analysis.riskLevel === 'low' ? 'bg-green-400' :
                          analysis.riskLevel === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${Math.min(analysis.allocation, 100)}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'correlation' && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Asset Correlation Matrix</h3>
              <div className="space-y-3">
                {correlationMatrix.map((corr, index) => (
                  <motion.div
                    key={`${corr.asset1}-${corr.asset2}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{corr.asset1}</span>
                        <span className="text-white/40">↔</span>
                        <span className="text-white font-medium">{corr.asset2}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(corr.riskLevel)} bg-current/20`}>
                        {corr.riskLevel}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getCorrelationColor(corr.correlation)}`}>
                        {corr.correlation.toFixed(2)}
                      </div>
                      <div className="text-white/60 text-xs">Correlation</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stress' && (
            <div className="space-y-6">
              {/* Stress Test Selector */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Stress Test Scenarios</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stressTests.map(test => (
                    <button
                      key={test.id}
                      onClick={() => setSelectedStressTest(test.id)}
                      className={`p-4 rounded-lg text-left transition-colors ${
                        selectedStressTest === test.id
                          ? 'bg-purple-600/20 border border-purple-400'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <h4 className="text-white font-medium mb-1">{test.name}</h4>
                      <p className="text-white/60 text-sm">{test.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Stress Test Results */}
              {selectedStressTest && (
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    {stressTests.find(t => t.id === selectedStressTest)?.name} Results
                  </h3>
                  {(() => {
                    const test = stressTests.find(t => t.id === selectedStressTest)
                    if (!test) return null
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-medium text-white mb-3">Scenario Parameters</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-white/60">BTC Change:</span>
                              <span className="text-red-400">{formatPercent(test.parameters.btcChange)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">ETH Change:</span>
                              <span className="text-red-400">{formatPercent(test.parameters.ethChange)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Altcoin Change:</span>
                              <span className="text-red-400">{formatPercent(test.parameters.altcoinChange)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Duration:</span>
                              <span className="text-white">{test.parameters.duration} days</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-medium text-white mb-3">Impact Results</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-white/60">Portfolio Change:</span>
                              <span className="text-red-400">{formatPercent(test.results.portfolioChange)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Max Drawdown:</span>
                              <span className="text-red-400">{formatPercent(test.results.maxDrawdown)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Recovery Time:</span>
                              <span className="text-white">{test.results.recoveryTime} days</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Worst Asset:</span>
                              <span className="text-red-400">
                                {test.results.worstAsset} ({formatPercent(test.results.worstAssetChange)})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )}

          {activeTab === 'liquidity' && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Liquidity Analysis</h3>
              <div className="space-y-4">
                {liquidityAnalysis.map((liquidity, index) => (
                  <motion.div
                    key={liquidity.asset}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-4 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="text-white font-medium">{liquidity.asset}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(liquidity.riskLevel)} bg-current/20`}>
                          {liquidity.riskLevel} liquidity
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{liquidity.liquidityScore}/100</div>
                        <div className="text-white/60 text-sm">Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Daily Volume:</span>
                        <div className="text-white">{formatCurrency(liquidity.dailyVolume)}</div>
                      </div>
                      <div>
                        <span className="text-white/60">Time to Liquidate:</span>
                        <div className="text-white">{liquidity.timeToLiquidate}h</div>
                      </div>
                      <div>
                        <span className="text-white/60">Slippage Est.:</span>
                        <div className="text-yellow-400">{liquidity.slippageEstimate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-white/60">Market Cap:</span>
                        <div className="text-white">{formatCurrency(liquidity.marketCap)}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default RiskManagementDashboard
