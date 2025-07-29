import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Target,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Star,
  Award,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Percent,
  ArrowRight,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import {
  calculateAdvancedMetrics,
  AdvancedMetrics,
  PortfolioHolding,
  MarketData
} from '../utils/advancedPortfolioMetrics'

interface PortfolioAdvice {
  id: string
  type: 'optimization' | 'rebalancing' | 'risk_management' | 'opportunity' | 'warning'
  title: string
  description: string
  reasoning: string[]
  impact: {
    expectedReturn: number
    riskReduction: number
    timeframe: string
    confidence: number
  }
  actionItems: ActionItem[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  aiConfidence: number
  userRelevance: number
  implementationDifficulty: 'easy' | 'medium' | 'hard'
  estimatedCost: number
  timestamp: Date
  userFeedback?: 'helpful' | 'not_helpful'
}

interface ActionItem {
  id: string
  description: string
  type: 'buy' | 'sell' | 'rebalance' | 'research' | 'monitor'
  parameters?: any
  estimatedTime: string
  priority: number
}

interface PortfolioAnalysis {
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
  diversificationScore: number
  performanceScore: number
  riskScore: number
  opportunityScore: number
  advancedMetrics?: AdvancedMetrics | undefined
}

interface MarketInsight {
  id: string
  title: string
  description: string
  impact: 'positive' | 'negative' | 'neutral'
  relevance: number
  timeframe: string
  source: string
}

interface AdvancedPortfolioAdvisorProps {
  portfolioData: any
  marketData?: any
  userPreferences?: any
  onAdviceAction?: (advice: PortfolioAdvice, action: ActionItem) => void
  onFeedback?: (adviceId: string, feedback: 'helpful' | 'not_helpful') => void
}

const AdvancedPortfolioAdvisor: React.FC<AdvancedPortfolioAdvisorProps> = ({
  portfolioData,
  marketData,
  userPreferences,
  onAdviceAction,
  onFeedback
}) => {
  const [advice, setAdvice] = useState<PortfolioAdvice[]>([])
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<PortfolioAnalysis | null>(null)
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [showImplemented, setShowImplemented] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [advancedMetrics, setAdvancedMetrics] = useState<AdvancedMetrics | null>(null)
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false)

  // Initialize portfolio analysis
  useEffect(() => {
    generatePortfolioAnalysis()
    generateAdvice()
    generateMarketInsights()
    calculateAdvancedPortfolioMetrics()
  }, [portfolioData, marketData])

  // Auto-refresh analysis
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        generateAdvice()
        generateMarketInsights()
      }, 300000) // 5 minutes

      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Calculate advanced portfolio metrics
  const calculateAdvancedPortfolioMetrics = () => {
    if (!portfolioData || !portfolioData.holdings) return

    try {
      // Transform portfolio data to match our interface
      const holdings: PortfolioHolding[] = portfolioData.holdings.map((holding: any) => ({
        symbol: holding.symbol || holding.name,
        amount: holding.amount || 0,
        value: holding.value || 0,
        weight: holding.allocation || holding.weight || 0,
        returns: holding.returns || generateMockReturns(),
        prices: holding.prices || generateMockPrices(),
        purchasePrice: holding.purchasePrice || holding.avgPrice || 0,
        currentPrice: holding.currentPrice || holding.price || 0
      }))

      // Mock market data (in production, this would come from real market APIs)
      const marketData: MarketData = {
        riskFreeRate: 0.02, // 2% annual risk-free rate
        marketReturns: generateMockReturns(252), // Daily market returns for 1 year
        benchmarkReturns: generateMockReturns(252) // Daily benchmark returns
      }

      const metrics = calculateAdvancedMetrics(holdings, marketData)
      setAdvancedMetrics(metrics)
    } catch (error) {
      console.error('Error calculating advanced metrics:', error)
    }
  }

  // Generate mock returns for demonstration (replace with real data in production)
  const generateMockReturns = (length: number = 30): number[] => {
    return Array.from({ length }, () => (Math.random() - 0.5) * 0.1) // Random returns between -5% and 5%
  }

  // Generate mock prices for demonstration (replace with real data in production)
  const generateMockPrices = (length: number = 30): number[] => {
    let price = 100
    return Array.from({ length }, () => {
      price *= (1 + (Math.random() - 0.5) * 0.05)
      return price
    })
  }

  // Generate comprehensive portfolio analysis
  const generatePortfolioAnalysis = () => {
    setIsAnalyzing(true)

    setTimeout(() => {
      const analysis: PortfolioAnalysis = {
        overallScore: 78,
        strengths: [
          'Well-diversified across major cryptocurrencies',
          'Strong performance in the last quarter',
          'Good risk-adjusted returns',
          'Appropriate allocation for risk profile'
        ],
        weaknesses: [
          'Overweight in Bitcoin (65% vs recommended 40%)',
          'Limited exposure to DeFi protocols',
          'No stablecoin allocation for volatility buffer',
          'Missing yield-generating opportunities'
        ],
        riskProfile: 'moderate',
        diversificationScore: 72,
        performanceScore: 85,
        riskScore: 68,
        opportunityScore: 82,
        advancedMetrics: advancedMetrics || undefined
      }

      setPortfolioAnalysis(analysis)
      setIsAnalyzing(false)
    }, 2000)
  }

  // Generate AI-powered advice
  const generateAdvice = () => {
    const mockAdvice: PortfolioAdvice[] = [
      {
        id: 'advice-1',
        type: 'optimization',
        title: 'Rebalance Bitcoin Allocation',
        description: 'Your Bitcoin allocation is 25% above the recommended level for your risk profile. Consider reducing to improve diversification.',
        reasoning: [
          'Current BTC allocation: 65% vs recommended 40%',
          'High concentration increases portfolio volatility',
          'Rebalancing could improve risk-adjusted returns',
          'Market conditions favor diversification'
        ],
        impact: {
          expectedReturn: 3.2,
          riskReduction: 15.8,
          timeframe: '3-6 months',
          confidence: 87
        },
        actionItems: [
          {
            id: 'action-1',
            description: 'Sell $12,000 worth of Bitcoin',
            type: 'sell',
            parameters: { asset: 'BTC', amount: 12000 },
            estimatedTime: '5 minutes',
            priority: 1
          },
          {
            id: 'action-2',
            description: 'Invest proceeds in ETH and stablecoins',
            type: 'buy',
            parameters: { assets: ['ETH', 'USDC'], allocation: [70, 30] },
            estimatedTime: '10 minutes',
            priority: 2
          }
        ],
        priority: 'high',
        category: 'allocation',
        aiConfidence: 87,
        userRelevance: 92,
        implementationDifficulty: 'easy',
        estimatedCost: 45,
        timestamp: new Date()
      },
      {
        id: 'advice-2',
        type: 'opportunity',
        title: 'DeFi Yield Opportunity',
        description: 'Stake your ETH holdings to earn 5.8% APY while maintaining liquidity through liquid staking protocols.',
        reasoning: [
          'Current ETH is sitting idle earning 0%',
          'Liquid staking maintains portfolio flexibility',
          'Low risk with established protocols like Lido',
          'Additional yield improves portfolio performance'
        ],
        impact: {
          expectedReturn: 5.8,
          riskReduction: 0,
          timeframe: '12 months',
          confidence: 78
        },
        actionItems: [
          {
            id: 'action-3',
            description: 'Research liquid staking protocols',
            type: 'research',
            parameters: { protocols: ['Lido', 'Rocket Pool', 'Coinbase'] },
            estimatedTime: '30 minutes',
            priority: 1
          },
          {
            id: 'action-4',
            description: 'Stake ETH through Lido',
            type: 'buy',
            parameters: { protocol: 'Lido', asset: 'ETH', action: 'stake' },
            estimatedTime: '15 minutes',
            priority: 2
          }
        ],
        priority: 'medium',
        category: 'yield',
        aiConfidence: 78,
        userRelevance: 85,
        implementationDifficulty: 'medium',
        estimatedCost: 25,
        timestamp: new Date()
      },
      {
        id: 'advice-3',
        type: 'risk_management',
        title: 'Add Stablecoin Buffer',
        description: 'Allocate 10-15% to stablecoins to reduce portfolio volatility and provide dry powder for opportunities.',
        reasoning: [
          'Portfolio lacks volatility buffer',
          'Stablecoins provide stability during market stress',
          'Enables quick deployment for opportunities',
          'Improves overall risk-adjusted returns'
        ],
        impact: {
          expectedReturn: -1.2,
          riskReduction: 22.5,
          timeframe: 'immediate',
          confidence: 94
        },
        actionItems: [
          {
            id: 'action-5',
            description: 'Convert 10% of holdings to USDC',
            type: 'rebalance',
            parameters: { targetAllocation: { USDC: 10 } },
            estimatedTime: '10 minutes',
            priority: 1
          }
        ],
        priority: 'medium',
        category: 'risk',
        aiConfidence: 94,
        userRelevance: 88,
        implementationDifficulty: 'easy',
        estimatedCost: 15,
        timestamp: new Date()
      },
      {
        id: 'advice-4',
        type: 'warning',
        title: 'High Correlation Risk',
        description: 'Your top 3 holdings have 85% correlation. Consider adding uncorrelated assets to improve diversification.',
        reasoning: [
          'BTC, ETH, and SOL move together during market stress',
          'High correlation increases portfolio volatility',
          'Uncorrelated assets provide better risk distribution',
          'Consider traditional assets or different crypto sectors'
        ],
        impact: {
          expectedReturn: 2.1,
          riskReduction: 18.3,
          timeframe: '6-12 months',
          confidence: 82
        },
        actionItems: [
          {
            id: 'action-6',
            description: 'Research uncorrelated assets',
            type: 'research',
            parameters: { categories: ['commodities', 'real_estate_tokens', 'utility_tokens'] },
            estimatedTime: '45 minutes',
            priority: 1
          }
        ],
        priority: 'medium',
        category: 'diversification',
        aiConfidence: 82,
        userRelevance: 79,
        implementationDifficulty: 'hard',
        estimatedCost: 0,
        timestamp: new Date()
      }
    ]
    
    setAdvice(mockAdvice)
  }

  // Generate market insights
  const generateMarketInsights = () => {
    const insights: MarketInsight[] = [
      {
        id: 'insight-1',
        title: 'Bitcoin ETF Approval Momentum',
        description: 'Increasing institutional adoption and ETF approvals are driving positive sentiment for Bitcoin.',
        impact: 'positive',
        relevance: 95,
        timeframe: '3-6 months',
        source: 'Market Analysis'
      },
      {
        id: 'insight-2',
        title: 'Ethereum Shanghai Upgrade Success',
        description: 'Successful implementation of staking withdrawals has reduced selling pressure and improved staking yields.',
        impact: 'positive',
        relevance: 88,
        timeframe: '6-12 months',
        source: 'Technical Analysis'
      },
      {
        id: 'insight-3',
        title: 'Regulatory Clarity Improving',
        description: 'Recent regulatory developments provide more clarity for cryptocurrency operations and institutional adoption.',
        impact: 'positive',
        relevance: 82,
        timeframe: '12+ months',
        source: 'Regulatory Analysis'
      }
    ]
    
    setMarketInsights(insights)
  }

  // Filter advice
  const filteredAdvice = advice.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority
    return matchesCategory && matchesPriority
  })

  // Handle advice action
  const handleAdviceAction = (advice: PortfolioAdvice, action: ActionItem) => {
    onAdviceAction?.(advice, action)
  }

  // Provide feedback
  const provideFeedback = (adviceId: string, feedback: 'helpful' | 'not_helpful') => {
    setAdvice(prev => prev.map(item => 
      item.id === adviceId ? { ...item, userFeedback: feedback } : item
    ))
    onFeedback?.(adviceId, feedback)
  }

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'text-red-400'
      case 'high': return 'text-orange-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-white/60'
    }
  }

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <Target className="w-5 h-5" />
      case 'rebalancing': return <PieChart className="w-5 h-5" />
      case 'risk_management': return <Shield className="w-5 h-5" />
      case 'opportunity': return <Zap className="w-5 h-5" />
      case 'warning': return <AlertTriangle className="w-5 h-5" />
      default: return <Brain className="w-5 h-5" />
    }
  }

  // Get impact color
  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case 'positive': return 'text-green-400'
      case 'negative': return 'text-red-400'
      case 'neutral': return 'text-yellow-400'
      default: return 'text-white/60'
    }
  }

  // Format percentage
  const formatPercent = (value: number): string => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Analysis Overview */}
      {portfolioAnalysis && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">AI Portfolio Analysis</h3>
                <p className="text-white/60 text-sm">Comprehensive portfolio health assessment</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{portfolioAnalysis.overallScore}/100</div>
                <div className="text-white/60 text-sm">Overall Score</div>
              </div>
              <button
                onClick={generatePortfolioAnalysis}
                disabled={isAnalyzing}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{portfolioAnalysis.diversificationScore}</div>
              <div className="text-white/60 text-sm">Diversification</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{portfolioAnalysis.performanceScore}</div>
              <div className="text-white/60 text-sm">Performance</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-400">{portfolioAnalysis.riskScore}</div>
              <div className="text-white/60 text-sm">Risk Management</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">{portfolioAnalysis.opportunityScore}</div>
              <div className="text-white/60 text-sm">Opportunities</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Strengths
              </h4>
              <ul className="space-y-1">
                {portfolioAnalysis.strengths.map((strength, index) => (
                  <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                    <Star className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-yellow-400 font-medium mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Areas for Improvement
              </h4>
              <ul className="space-y-1">
                {portfolioAnalysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 text-yellow-400 mt-1 flex-shrink-0" />
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Metrics Section */}
      {advancedMetrics && (
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Advanced Portfolio Metrics
            </h3>
            <button
              onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
              className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {showAdvancedMetrics ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showAdvancedMetrics ? 'Hide' : 'Show'} Details
            </button>
          </div>

          {showAdvancedMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Risk-Adjusted Returns */}
              <div className="space-y-4">
                <h4 className="text-blue-400 font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Risk-Adjusted Returns
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Sharpe Ratio</span>
                    <span className="text-white font-medium">{advancedMetrics.sharpeRatio.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Sortino Ratio</span>
                    <span className="text-white font-medium">{advancedMetrics.sortinoRatio.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Calmar Ratio</span>
                    <span className="text-white font-medium">{advancedMetrics.calmarRatio.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Information Ratio</span>
                    <span className="text-white font-medium">{advancedMetrics.informationRatio.toFixed(3)}</span>
                  </div>
                </div>
              </div>

              {/* Risk Metrics */}
              <div className="space-y-4">
                <h4 className="text-red-400 font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Risk Metrics
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Max Drawdown</span>
                    <span className="text-white font-medium">{(advancedMetrics.maxDrawdown * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">VaR (95%)</span>
                    <span className="text-white font-medium">{(advancedMetrics.var95 * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">CVaR (95%)</span>
                    <span className="text-white font-medium">{(advancedMetrics.conditionalVaR * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Volatility</span>
                    <span className="text-white font-medium">{(advancedMetrics.volatility * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {/* Market Metrics */}
              <div className="space-y-4">
                <h4 className="text-green-400 font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Market Metrics
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Beta</span>
                    <span className="text-white font-medium">{advancedMetrics.beta.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Alpha</span>
                    <span className="text-white font-medium">{(advancedMetrics.alpha * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Tracking Error</span>
                    <span className="text-white font-medium">{(advancedMetrics.trackingError * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Diversification Ratio</span>
                    <span className="text-white font-medium">{advancedMetrics.diversificationRatio.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
        >
          <option value="all" className="bg-gray-800">All Categories</option>
          <option value="allocation" className="bg-gray-800">Allocation</option>
          <option value="yield" className="bg-gray-800">Yield</option>
          <option value="risk" className="bg-gray-800">Risk</option>
          <option value="diversification" className="bg-gray-800">Diversification</option>
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
        >
          <option value="all" className="bg-gray-800">All Priorities</option>
          <option value="critical" className="bg-gray-800">Critical</option>
          <option value="high" className="bg-gray-800">High</option>
          <option value="medium" className="bg-gray-800">Medium</option>
          <option value="low" className="bg-gray-800">Low</option>
        </select>

        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            autoRefresh 
              ? 'bg-green-600 text-white' 
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Auto-refresh
        </button>
      </div>

      {/* AI Advice */}
      <div className="space-y-4">
        {filteredAdvice.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-lg ${
                  item.type === 'optimization' ? 'bg-blue-500/20 text-blue-400' :
                  item.type === 'opportunity' ? 'bg-green-500/20 text-green-400' :
                  item.type === 'risk_management' ? 'bg-yellow-500/20 text-yellow-400' :
                  item.type === 'warning' ? 'bg-red-500/20 text-red-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-medium">{item.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)} bg-current/20`}>
                      {item.priority}
                    </span>
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium capitalize">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-white/80 mb-3">{item.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-white/60 text-sm">Expected Return:</span>
                      <div className="text-green-400 font-medium">{formatPercent(item.impact.expectedReturn)}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Risk Reduction:</span>
                      <div className="text-blue-400 font-medium">{formatPercent(item.impact.riskReduction)}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Timeframe:</span>
                      <div className="text-white font-medium">{item.impact.timeframe}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">AI Confidence:</span>
                      <div className="text-purple-400 font-medium">{item.impact.confidence}%</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <h5 className="text-white/80 font-medium text-sm">AI Reasoning:</h5>
                    <ul className="space-y-1">
                      {item.reasoning.map((reason, i) => (
                        <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 mb-4">
                    <h5 className="text-white/80 font-medium text-sm">Action Items:</h5>
                    {item.actionItems.map((action, i) => (
                      <div key={action.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <span className="text-white text-sm">{action.description}</span>
                          <div className="text-white/60 text-xs">
                            {action.type} • {action.estimatedTime}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAdviceAction(item, action)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-xs transition-colors"
                        >
                          Execute
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => provideFeedback(item.id, 'helpful')}
                  className={`p-2 rounded-lg transition-colors ${
                    item.userFeedback === 'helpful'
                      ? 'bg-green-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white/60'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => provideFeedback(item.id, 'not_helpful')}
                  className={`p-2 rounded-lg transition-colors ${
                    item.userFeedback === 'not_helpful'
                      ? 'bg-red-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white/60'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Market Insights */}
      {marketInsights.length > 0 && (
        <div className="glass-card p-6">
          <h4 className="text-white font-bold mb-4">Market Insights</h4>
          <div className="space-y-3">
            {marketInsights.map((insight) => (
              <div key={insight.id} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="text-white font-medium">{insight.title}</h5>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(insight.impact)} bg-current/20`}>
                      {insight.impact}
                    </span>
                    <span className="text-white/60 text-xs">{insight.relevance}% relevant</span>
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-2">{insight.description}</p>
                <div className="flex items-center gap-4 text-xs text-white/60">
                  <span>Timeframe: {insight.timeframe}</span>
                  <span>Source: {insight.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedPortfolioAdvisor
