import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  AlertCircle,
  Sparkles,
  BarChart3
} from 'lucide-react'

interface AIInsight {
  id: string
  type: 'bullish' | 'bearish' | 'neutral' | 'warning' | 'opportunity'
  title: string
  summary: string
  confidence: number // 0-100
  timeframe: string
  impact: 'high' | 'medium' | 'low'
  category: string
  reasoning: string[]
  actionable: boolean
}

interface DailyAIInsightsProps {
  maxInsights?: number
  showConfidence?: boolean
  className?: string
}

const DailyAIInsights: React.FC<DailyAIInsightsProps> = ({
  maxInsights = 4,
  showConfidence = true,
  className = ''
}) => {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fetch AI insights
  const fetchAIInsights = async () => {
    try {
      setError(null)
      
      // Mock AI insights data - in production, this would call your AI service
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'bullish',
          title: 'Bitcoin ETF Momentum Building',
          summary: 'Institutional inflows suggest continued upward pressure on BTC price.',
          confidence: 87,
          timeframe: '1-2 weeks',
          impact: 'high',
          category: 'Bitcoin',
          reasoning: [
            'Record ETF inflows of $2.1B this week',
            'Institutional adoption accelerating',
            'Technical indicators showing strength'
          ],
          actionable: true
        },
        {
          id: '2',
          type: 'opportunity',
          title: 'Layer 2 Scaling Solutions Undervalued',
          summary: 'L2 tokens showing strong fundamentals but lagging price action.',
          confidence: 73,
          timeframe: '2-4 weeks',
          impact: 'medium',
          category: 'Ethereum',
          reasoning: [
            'TVL growth outpacing token prices',
            'Major DeFi migrations incoming',
            'Reduced gas fees driving adoption'
          ],
          actionable: true
        },
        {
          id: '3',
          type: 'warning',
          title: 'DeFi Protocol Risk Elevated',
          summary: 'Recent exploits highlight security vulnerabilities across protocols.',
          confidence: 91,
          timeframe: 'Immediate',
          impact: 'high',
          category: 'DeFi',
          reasoning: [
            'Multiple high-value exploits this month',
            'Similar vulnerabilities identified',
            'Audit quality concerns rising'
          ],
          actionable: true
        },
        {
          id: '4',
          type: 'neutral',
          title: 'Altcoin Season Indicators Mixed',
          summary: 'Market showing conflicting signals for broad altcoin rally.',
          confidence: 65,
          timeframe: '3-6 weeks',
          impact: 'medium',
          category: 'Market',
          reasoning: [
            'Bitcoin dominance stabilizing',
            'Some altcoins showing strength',
            'Overall market sentiment cautious'
          ],
          actionable: false
        },
        {
          id: '5',
          type: 'bearish',
          title: 'Regulatory Headwinds Increasing',
          summary: 'Policy uncertainty may create short-term market pressure.',
          confidence: 78,
          timeframe: '1-3 months',
          impact: 'medium',
          category: 'Regulation',
          reasoning: [
            'Increased regulatory scrutiny',
            'Policy announcements pending',
            'Market historically sensitive to regulation'
          ],
          actionable: true
        }
      ]

      setInsights(mockInsights.slice(0, maxInsights))
      setLastUpdate(new Date())
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI insights')
      setIsLoading(false)
    }
  }

  // Initialize and auto-refresh
  useEffect(() => {
    fetchAIInsights()
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchAIInsights, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [maxInsights])

  // Get insight display configuration
  const getInsightConfig = (type: string) => {
    const configs = {
      bullish: {
        color: 'text-green-400',
        bg: 'bg-green-400/20',
        border: 'border-green-400/30',
        icon: TrendingUp
      },
      bearish: {
        color: 'text-red-400',
        bg: 'bg-red-400/20',
        border: 'border-red-400/30',
        icon: TrendingDown
      },
      warning: {
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/20',
        border: 'border-yellow-400/30',
        icon: AlertTriangle
      },
      opportunity: {
        color: 'text-blue-400',
        bg: 'bg-blue-400/20',
        border: 'border-blue-400/30',
        icon: Target
      },
      neutral: {
        color: 'text-gray-400',
        bg: 'bg-gray-400/20',
        border: 'border-gray-400/30',
        icon: BarChart3
      }
    }
    return configs[type as keyof typeof configs] || configs.neutral
  }

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Get impact color
  const getImpactColor = (impact: string) => {
    const colors = {
      high: 'text-red-400',
      medium: 'text-yellow-400',
      low: 'text-green-400'
    }
    return colors[impact as keyof typeof colors] || 'text-gray-400'
  }

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    return `${Math.floor(diffInMinutes / 60)}h ago`
  }

  if (isLoading) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Daily AI Insights</h3>
          </div>
          <RefreshCw className="w-4 h-4 text-white/60 animate-spin" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse p-4 bg-white/5 rounded-lg">
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-3 bg-white/5 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-white/5 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Daily AI Insights</h3>
          </div>
          <button onClick={fetchAIInsights} className="p-1 hover:bg-white/10 rounded">
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        </div>
        <div className="text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Daily AI Insights</h3>
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">
            Updated {formatTimeAgo(lastUpdate)}
          </span>
          <button 
            onClick={fetchAIInsights} 
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {insights.map((insight, index) => {
            const config = getInsightConfig(insight.type)
            const Icon = config.icon

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 bg-white/5 rounded-lg border ${config.border} hover:bg-white/10 transition-all duration-300 cursor-pointer group`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-white font-medium text-sm leading-tight group-hover:text-blue-400 transition-colors">
                        {insight.title}
                      </h4>
                      {insight.actionable && (
                        <Lightbulb className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    
                    <p className="text-white/70 text-xs mb-3 leading-relaxed">
                      {insight.summary}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-white/50">{insight.category}</span>
                        <span className="text-white/30">•</span>
                        <span className="text-white/50">{insight.timeframe}</span>
                        <span className="text-white/30">•</span>
                        <span className={`font-medium ${getImpactColor(insight.impact)}`}>
                          {insight.impact} impact
                        </span>
                      </div>
                      
                      {showConfidence && (
                        <div className={`font-medium ${getConfidenceColor(insight.confidence)}`}>
                          {insight.confidence}% confidence
                        </div>
                      )}
                    </div>

                    {/* Reasoning (expandable) */}
                    <details className="mt-3 group/details">
                      <summary className="text-xs text-blue-400 cursor-pointer hover:text-blue-300 transition-colors">
                        View reasoning →
                      </summary>
                      <div className="mt-2 pl-3 border-l-2 border-white/10">
                        <ul className="space-y-1">
                          {insight.reasoning.map((reason, idx) => (
                            <li key={idx} className="text-xs text-white/60 flex items-start gap-2">
                              <span className="text-white/40 mt-1">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <button className="w-full text-center text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
          View Full AI Analysis →
        </button>
      </div>
    </div>
  )
}

export default DailyAIInsights
