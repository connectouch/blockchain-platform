import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Star,
  Zap,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  DollarSign,
  Percent,
  Award,
  Shield,
  RefreshCw,
  Settings,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  Calendar,
  Globe
} from 'lucide-react'

interface AIInsight {
  id: string
  type: 'recommendation' | 'prediction' | 'alert' | 'opportunity' | 'risk_warning'
  title: string
  description: string
  confidence: number // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'allocation' | 'rebalancing' | 'yield' | 'risk' | 'market' | 'tax'
  actionable: boolean
  estimatedImpact: {
    type: 'return' | 'risk_reduction' | 'cost_savings'
    value: number
    timeframe: string
  }
  reasoning: string[]
  relatedAssets: string[]
  createdAt: number
  expiresAt?: number
  isRead: boolean
  userFeedback?: 'helpful' | 'not_helpful'
}

interface MarketPrediction {
  asset: string
  timeframe: '1D' | '1W' | '1M' | '3M'
  direction: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  priceTarget: {
    low: number
    high: number
    expected: number
  }
  probability: number
  factors: string[]
  riskFactors: string[]
}

interface PersonalizedRecommendation {
  id: string
  title: string
  description: string
  type: 'buy' | 'sell' | 'hold' | 'rebalance' | 'diversify'
  urgency: 'low' | 'medium' | 'high'
  expectedBenefit: number
  riskLevel: 'low' | 'medium' | 'high'
  reasoning: string
  steps: string[]
  estimatedCost: number
  timeToImplement: string
}

interface AIPortfolioInsightsProps {
  portfolioValue: number
  holdings: any[]
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
  onActionTaken?: (insight: AIInsight, action: string) => void
}

const AIPortfolioInsights: React.FC<AIPortfolioInsightsProps> = ({
  portfolioValue,
  holdings = [],
  riskProfile = 'moderate',
  onActionTaken
}) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'predictions' | 'recommendations' | 'chat'>('insights')
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [predictions, setPredictions] = useState<MarketPrediction[]>([])
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<any[]>([])

  // Initialize AI insights
  useEffect(() => {
    setIsGenerating(true)
    
    setTimeout(() => {
      const mockInsights: AIInsight[] = [
        {
          id: 'insight-1',
          type: 'recommendation',
          title: 'Optimize Portfolio Allocation',
          description: 'Your portfolio is overweight in Bitcoin (65%). Consider rebalancing to reduce concentration risk.',
          confidence: 87,
          priority: 'high',
          category: 'allocation',
          actionable: true,
          estimatedImpact: {
            type: 'risk_reduction',
            value: 15.2,
            timeframe: '1 month'
          },
          reasoning: [
            'Bitcoin allocation exceeds recommended 40% for moderate risk profile',
            'High correlation with other crypto holdings increases portfolio volatility',
            'Diversification could improve risk-adjusted returns'
          ],
          relatedAssets: ['BTC', 'ETH'],
          createdAt: Date.now() - 2 * 60 * 60 * 1000,
          isRead: false
        },
        {
          id: 'insight-2',
          type: 'opportunity',
          title: 'DeFi Yield Opportunity',
          description: 'Curve 3Pool offers 8.5% APY with low risk - consider moving idle USDC.',
          confidence: 92,
          priority: 'medium',
          category: 'yield',
          actionable: true,
          estimatedImpact: {
            type: 'return',
            value: 425,
            timeframe: '1 year'
          },
          reasoning: [
            'Current USDC earning 0% in wallet',
            'Curve 3Pool has strong audit history and low impermanent loss risk',
            'APY significantly higher than traditional savings'
          ],
          relatedAssets: ['USDC'],
          createdAt: Date.now() - 4 * 60 * 60 * 1000,
          isRead: false
        },
        {
          id: 'insight-3',
          type: 'alert',
          title: 'Tax Loss Harvesting Opportunity',
          description: 'SOL position down 12% - consider harvesting losses before year-end.',
          confidence: 78,
          priority: 'medium',
          category: 'tax',
          actionable: true,
          estimatedImpact: {
            type: 'cost_savings',
            value: 1200,
            timeframe: 'tax year'
          },
          reasoning: [
            'SOL position showing unrealized loss of $1,200',
            'Tax loss harvesting could offset other gains',
            'Can repurchase after 30-day wash sale period'
          ],
          relatedAssets: ['SOL'],
          createdAt: Date.now() - 6 * 60 * 60 * 1000,
          isRead: true
        },
        {
          id: 'insight-4',
          type: 'risk_warning',
          title: 'High Correlation Risk',
          description: 'Your top 3 holdings have 85% correlation - consider diversification.',
          confidence: 94,
          priority: 'high',
          category: 'risk',
          actionable: true,
          estimatedImpact: {
            type: 'risk_reduction',
            value: 22.5,
            timeframe: '3 months'
          },
          reasoning: [
            'BTC, ETH, and SOL move together during market stress',
            'Lack of uncorrelated assets increases portfolio volatility',
            'Adding traditional assets or stablecoins could help'
          ],
          relatedAssets: ['BTC', 'ETH', 'SOL'],
          createdAt: Date.now() - 8 * 60 * 60 * 1000,
          isRead: false
        },
        {
          id: 'insight-5',
          type: 'prediction',
          title: 'Market Volatility Expected',
          description: 'AI models predict increased volatility in next 2 weeks due to Fed meeting.',
          confidence: 73,
          priority: 'medium',
          category: 'market',
          actionable: false,
          estimatedImpact: {
            type: 'risk_reduction',
            value: 8.5,
            timeframe: '2 weeks'
          },
          reasoning: [
            'Historical patterns show volatility spikes around Fed announcements',
            'Options market pricing in 25% increase in volatility',
            'Recommend reducing leverage and increasing cash position'
          ],
          relatedAssets: ['BTC', 'ETH'],
          createdAt: Date.now() - 12 * 60 * 60 * 1000,
          isRead: true
        }
      ]

      const mockPredictions: MarketPrediction[] = [
        {
          asset: 'BTC',
          timeframe: '1M',
          direction: 'bullish',
          confidence: 78,
          priceTarget: { low: 42000, high: 52000, expected: 47000 },
          probability: 68,
          factors: [
            'Institutional adoption increasing',
            'ETF approval momentum',
            'Halving event approaching',
            'Macro environment improving'
          ],
          riskFactors: [
            'Regulatory uncertainty',
            'Market correlation with tech stocks',
            'Profit-taking at resistance levels'
          ]
        },
        {
          asset: 'ETH',
          timeframe: '3M',
          direction: 'bullish',
          confidence: 82,
          priceTarget: { low: 2800, high: 3800, expected: 3300 },
          probability: 72,
          factors: [
            'Shanghai upgrade success',
            'DeFi ecosystem growth',
            'Layer 2 adoption',
            'Staking yield attractive'
          ],
          riskFactors: [
            'Competition from other L1s',
            'Gas fee concerns',
            'Regulatory scrutiny on staking'
          ]
        },
        {
          asset: 'SOL',
          timeframe: '1W',
          direction: 'neutral',
          confidence: 65,
          priceTarget: { low: 95, high: 115, expected: 105 },
          probability: 58,
          factors: [
            'Network stability improving',
            'Developer activity high',
            'Mobile integration progress'
          ],
          riskFactors: [
            'Past network outages',
            'Centralization concerns',
            'Competition from other chains'
          ]
        }
      ]

      const mockRecommendations: PersonalizedRecommendation[] = [
        {
          id: 'rec-1',
          title: 'Rebalance to Target Allocation',
          description: 'Reduce BTC to 40%, increase ETH to 35%, add 15% stablecoins, 10% DeFi tokens',
          type: 'rebalance',
          urgency: 'high',
          expectedBenefit: 2400,
          riskLevel: 'low',
          reasoning: 'Current allocation deviates significantly from optimal risk-adjusted portfolio',
          steps: [
            'Sell $12,000 worth of BTC',
            'Buy $4,000 worth of ETH',
            'Buy $6,000 worth of USDC',
            'Buy $2,000 worth of UNI/AAVE'
          ],
          estimatedCost: 85,
          timeToImplement: '1 hour'
        },
        {
          id: 'rec-2',
          title: 'Stake ETH for Additional Yield',
          description: 'Stake your ETH holdings through Lido for 5.8% APY while maintaining liquidity',
          type: 'buy',
          urgency: 'medium',
          expectedBenefit: 1450,
          riskLevel: 'low',
          reasoning: 'ETH staking provides additional yield with minimal additional risk',
          steps: [
            'Connect wallet to Lido protocol',
            'Stake ETH to receive stETH',
            'Monitor staking rewards',
            'Consider using stETH in DeFi for additional yield'
          ],
          estimatedCost: 25,
          timeToImplement: '30 minutes'
        },
        {
          id: 'rec-3',
          title: 'Add Uncorrelated Assets',
          description: 'Consider adding gold-backed tokens or real estate tokens to reduce correlation',
          type: 'diversify',
          urgency: 'low',
          expectedBenefit: 800,
          riskLevel: 'medium',
          reasoning: 'Portfolio lacks assets that move independently of crypto markets',
          steps: [
            'Research tokenized gold options (PAXG, XAUT)',
            'Evaluate real estate tokens (RealT, Lofty)',
            'Allocate 5-10% to uncorrelated assets',
            'Monitor correlation metrics'
          ],
          estimatedCost: 150,
          timeToImplement: '2 hours'
        }
      ]

      setInsights(mockInsights)
      setPredictions(mockPredictions)
      setRecommendations(mockRecommendations)
      setIsGenerating(false)
    }, 2000)
  }, [portfolioValue, riskProfile])

  // Filter insights
  const filteredInsights = insights.filter(insight => {
    const matchesCategory = selectedCategory === 'all' || insight.category === selectedCategory
    const matchesPriority = selectedPriority === 'all' || insight.priority === selectedPriority
    return matchesCategory && matchesPriority
  })

  // Provide feedback on insight
  const provideFeedback = (insightId: string, feedback: 'helpful' | 'not_helpful') => {
    setInsights(prev => prev.map(insight => 
      insight.id === insightId ? { ...insight, userFeedback: feedback } : insight
    ))
  }

  // Mark insight as read
  const markAsRead = (insightId: string) => {
    setInsights(prev => prev.map(insight => 
      insight.id === insightId ? { ...insight, isRead: true } : insight
    ))
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
      case 'recommendation': return <Lightbulb className="w-5 h-5" />
      case 'prediction': return <TrendingUp className="w-5 h-5" />
      case 'alert': return <AlertTriangle className="w-5 h-5" />
      case 'opportunity': return <Target className="w-5 h-5" />
      case 'risk_warning': return <Shield className="w-5 h-5" />
      default: return <Brain className="w-5 h-5" />
    }
  }

  // Get direction color
  const getDirectionColor = (direction: string): string => {
    switch (direction) {
      case 'bullish': return 'text-green-400'
      case 'bearish': return 'text-red-400'
      case 'neutral': return 'text-yellow-400'
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
    
    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  if (isGenerating) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-12 text-center">
          <Brain className="w-16 h-16 text-white/20 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">AI Analyzing Portfolio</h3>
          <p className="text-white/60">Generating personalized insights and recommendations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">AI Portfolio Insights</h2>
          <p className="text-white/60">Personalized recommendations powered by machine learning</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGenerating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Insights
          </button>
        </div>
      </div>

      {/* AI Summary */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-purple-400" />
          <h3 className="text-xl font-bold text-white">AI Portfolio Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">8.5/10</div>
            <div className="text-white/60 text-sm">Portfolio Health Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{filteredInsights.filter(i => !i.isRead).length}</div>
            <div className="text-white/60 text-sm">Unread Insights</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{filteredInsights.filter(i => i.actionable).length}</div>
            <div className="text-white/60 text-sm">Actionable Items</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { id: 'insights', label: 'Insights', icon: <Brain className="w-4 h-4" /> },
          { id: 'predictions', label: 'Predictions', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'recommendations', label: 'Recommendations', icon: <Target className="w-4 h-4" /> },
          { id: 'chat', label: 'AI Chat', icon: <MessageSquare className="w-4 h-4" /> }
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
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="all" className="bg-gray-800">All Categories</option>
                  <option value="allocation" className="bg-gray-800">Allocation</option>
                  <option value="rebalancing" className="bg-gray-800">Rebalancing</option>
                  <option value="yield" className="bg-gray-800">Yield</option>
                  <option value="risk" className="bg-gray-800">Risk</option>
                  <option value="market" className="bg-gray-800">Market</option>
                  <option value="tax" className="bg-gray-800">Tax</option>
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
              </div>

              {/* Insights List */}
              <div className="space-y-4">
                {filteredInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`glass-card p-6 ${!insight.isRead ? 'border border-purple-400/30' : ''}`}
                    onClick={() => markAsRead(insight.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          insight.type === 'recommendation' ? 'bg-blue-500/20 text-blue-400' :
                          insight.type === 'prediction' ? 'bg-green-500/20 text-green-400' :
                          insight.type === 'alert' ? 'bg-yellow-500/20 text-yellow-400' :
                          insight.type === 'opportunity' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {getTypeIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium">{insight.title}</h4>
                            {!insight.isRead && (
                              <span className="w-2 h-2 bg-purple-400 rounded-full" />
                            )}
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(insight.priority)} bg-current/20`}>
                              {insight.priority}
                            </span>
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium capitalize">
                              {insight.category}
                            </span>
                          </div>
                          <p className="text-white/80 mb-3">{insight.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm mb-3">
                            <span className="text-white/60">
                              Confidence: <span className="text-white">{insight.confidence}%</span>
                            </span>
                            <span className="text-white/60">
                              Impact: <span className="text-green-400">
                                {insight.estimatedImpact.type === 'return' ? '+' : ''}
                                {insight.estimatedImpact.value}
                                {insight.estimatedImpact.type === 'return' ? '$' : '%'}
                              </span>
                            </span>
                            <span className="text-white/60">
                              {formatTimeAgo(insight.createdAt)}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <h5 className="text-white/80 font-medium text-sm">Reasoning:</h5>
                            <ul className="space-y-1">
                              {insight.reasoning.map((reason, i) => (
                                <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                                  <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {insight.relatedAssets.length > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-white/60 text-sm">Related assets:</span>
                              {insight.relatedAssets.map(asset => (
                                <span key={asset} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                  {asset}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            provideFeedback(insight.id, 'helpful')
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            insight.userFeedback === 'helpful'
                              ? 'bg-green-600 text-white'
                              : 'bg-white/10 hover:bg-white/20 text-white/60'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            provideFeedback(insight.id, 'not_helpful')
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            insight.userFeedback === 'not_helpful'
                              ? 'bg-red-600 text-white'
                              : 'bg-white/10 hover:bg-white/20 text-white/60'
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {insight.actionable && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => onActionTaken?.(insight, 'implement')}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          Take Action
                        </button>
                        <button
                          onClick={() => onActionTaken?.(insight, 'dismiss')}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="space-y-6">
              {predictions.map((prediction, index) => (
                <motion.div
                  key={`${prediction.asset}-${prediction.timeframe}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-white">{prediction.asset}</h4>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm font-medium">
                          {prediction.timeframe}
                        </span>
                        <span className={`px-2 py-1 rounded text-sm font-medium capitalize ${getDirectionColor(prediction.direction)} bg-current/20`}>
                          {prediction.direction}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-white/60 text-sm">Expected Price:</span>
                          <div className="text-white font-bold">{formatCurrency(prediction.priceTarget.expected)}</div>
                        </div>
                        <div>
                          <span className="text-white/60 text-sm">Range:</span>
                          <div className="text-white font-medium">
                            {formatCurrency(prediction.priceTarget.low)} - {formatCurrency(prediction.priceTarget.high)}
                          </div>
                        </div>
                        <div>
                          <span className="text-white/60 text-sm">Probability:</span>
                          <div className="text-green-400 font-bold">{prediction.probability}%</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">{prediction.confidence}%</div>
                      <div className="text-white/60 text-sm">Confidence</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-white font-medium mb-2">Bullish Factors:</h5>
                      <ul className="space-y-1">
                        {prediction.factors.map((factor, i) => (
                          <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                            <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-white font-medium mb-2">Risk Factors:</h5>
                      <ul className="space-y-1">
                        {prediction.riskFactors.map((risk, i) => (
                          <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                            <AlertTriangle className="w-3 h-3 text-red-400 mt-1 flex-shrink-0" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-white">{rec.title}</h4>
                        <span className={`px-2 py-1 rounded text-sm font-medium capitalize ${
                          rec.type === 'buy' ? 'bg-green-500/20 text-green-400' :
                          rec.type === 'sell' ? 'bg-red-500/20 text-red-400' :
                          rec.type === 'hold' ? 'bg-yellow-500/20 text-yellow-400' :
                          rec.type === 'rebalance' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {rec.type}
                        </span>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          rec.urgency === 'high' ? 'bg-red-500/20 text-red-400' :
                          rec.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {rec.urgency} urgency
                        </span>
                      </div>
                      <p className="text-white/80 mb-4">{rec.description}</p>
                      <p className="text-white/70 text-sm mb-4">{rec.reasoning}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">+{formatCurrency(rec.expectedBenefit)}</div>
                      <div className="text-white/60 text-sm">Expected Benefit</div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <h5 className="text-white font-medium">Implementation Steps:</h5>
                    {rec.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <span className="text-white/80">{step}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-white/60 text-sm">Estimated Cost:</span>
                      <div className="text-white font-medium">{formatCurrency(rec.estimatedCost)}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Time to Implement:</span>
                      <div className="text-white font-medium">{rec.timeToImplement}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Risk Level:</span>
                      <div className={`font-medium capitalize ${
                        rec.riskLevel === 'low' ? 'text-green-400' :
                        rec.riskLevel === 'medium' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {rec.riskLevel}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                      Implement Recommendation
                    </button>
                    <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                      Learn More
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">AI Portfolio Assistant</h3>
              
              <div className="h-64 bg-gray-800/50 rounded-lg p-4 mb-4 overflow-y-auto">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Brain className="w-6 h-6 text-purple-400 mt-1" />
                    <div className="bg-purple-600/20 rounded-lg p-3 flex-1">
                      <p className="text-white">Hello! I'm your AI portfolio assistant. I can help you with investment strategies, risk analysis, and portfolio optimization. What would you like to know?</p>
                    </div>
                  </div>
                  {chatHistory.map((message, i) => (
                    <div key={i} className={`flex items-start gap-3 ${message.isUser ? 'flex-row-reverse' : ''}`}>
                      {message.isUser ? (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          U
                        </div>
                      ) : (
                        <Brain className="w-6 h-6 text-purple-400 mt-1" />
                      )}
                      <div className={`rounded-lg p-3 flex-1 ${
                        message.isUser ? 'bg-blue-600/20' : 'bg-purple-600/20'
                      }`}>
                        <p className="text-white">{message.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask me about your portfolio..."
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && chatMessage.trim()) {
                      setChatHistory(prev => [...prev, { text: chatMessage, isUser: true }])
                      setChatMessage('')
                      // Simulate AI response
                      setTimeout(() => {
                        setChatHistory(prev => [...prev, { 
                          text: "I understand you're asking about portfolio optimization. Based on your current holdings, I recommend focusing on diversification and risk management. Would you like me to provide specific recommendations?", 
                          isUser: false 
                        }])
                      }, 1000)
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (chatMessage.trim()) {
                      setChatHistory(prev => [...prev, { text: chatMessage, isUser: true }])
                      setChatMessage('')
                    }
                  }}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default AIPortfolioInsights
