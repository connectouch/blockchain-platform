import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  Zap,
  RefreshCw,
  Activity,
  DollarSign,
  BarChart3
} from 'lucide-react'

interface AIInsightsPanelProps {
  marketData?: any
  protocols?: any[]
}

interface AIInsight {
  type: 'sentiment' | 'risk' | 'opportunity' | 'prediction'
  title: string
  value: string
  description: string
  confidence: number
  trend: 'up' | 'down' | 'neutral'
  color: string
  icon: React.ComponentType<any>
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ marketData, protocols }) => {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [aiAnalysis, setAiAnalysis] = useState<string>('')

  // Generate AI insights based on real market data
  const generateInsights = async () => {
    try {
      setIsLoading(true)
      
      // Analyze market data to generate insights
      const newInsights: AIInsight[] = []
      
      if (marketData) {
        // Market Sentiment Analysis
        const growth = parseFloat(marketData.totalGrowth24h?.replace(/[+%]/g, '') || '0')
        const sentiment = growth > 2 ? 'Bullish' : growth > 0 ? 'Neutral' : 'Bearish'
        const sentimentColor = growth > 2 ? 'text-green-400' : growth > 0 ? 'text-yellow-400' : 'text-red-400'
        
        newInsights.push({
          type: 'sentiment',
          title: 'Market Sentiment',
          value: sentiment,
          description: `Market showing ${growth > 0 ? 'positive' : 'negative'} momentum with ${Math.abs(growth).toFixed(1)}% 24h change. ${
            growth > 3 ? 'Strong bullish signals detected.' : 
            growth > 1 ? 'Moderate optimism in the market.' :
            growth > -1 ? 'Market consolidation phase.' :
            'Bearish pressure observed.'
          }`,
          confidence: Math.min(95, 60 + Math.abs(growth) * 5),
          trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'neutral',
          color: sentimentColor,
          icon: growth > 0 ? TrendingUp : growth < 0 ? TrendingDown : Activity
        })

        // Risk Assessment
        const volatility = Math.abs(growth)
        const riskLevel = volatility > 5 ? 'High' : volatility > 2 ? 'Moderate' : 'Low'
        const riskColor = volatility > 5 ? 'text-red-400' : volatility > 2 ? 'text-yellow-400' : 'text-green-400'
        
        newInsights.push({
          type: 'risk',
          title: 'Risk Assessment',
          value: riskLevel,
          description: `Current volatility at ${volatility.toFixed(1)}%. ${
            volatility > 5 ? 'High volatility suggests increased risk. Consider position sizing.' :
            volatility > 2 ? 'Moderate volatility within normal ranges. Standard risk management applies.' :
            'Low volatility indicates stable market conditions.'
          }`,
          confidence: 85,
          trend: volatility > 3 ? 'up' : 'neutral',
          color: riskColor,
          icon: AlertTriangle
        })
      }

      // DeFi Opportunity Analysis
      if (protocols && protocols.length > 0) {
        const avgTvl = protocols.reduce((sum, p) => sum + (p.tvl || 0), 0) / protocols.length
        const highTvlProtocols = protocols.filter(p => p.tvl > avgTvl * 1.5).length
        
        newInsights.push({
          type: 'opportunity',
          title: 'DeFi Opportunities',
          value: `${highTvlProtocols} High-TVL`,
          description: `${highTvlProtocols} protocols showing above-average TVL growth. Average TVL: $${(avgTvl / 1e9).toFixed(1)}B. Consider protocols with strong fundamentals and growing liquidity.`,
          confidence: 78,
          trend: 'up',
          color: 'text-blue-400',
          icon: Zap
        })
      }

      // Price Prediction
      if (marketData?.bitcoin) {
        const btcPrice = parseFloat(marketData?.bitcoin?.price?.replace(/[$,]/g, '') || '67250')
        const btcChange = parseFloat(marketData?.bitcoin?.change?.replace(/[+%]/g, '') || '3.1')
        
        const prediction = btcChange > 2 ? 'Upward' : btcChange > 0 ? 'Sideways' : 'Downward'
        const predictionColor = btcChange > 2 ? 'text-green-400' : btcChange > 0 ? 'text-yellow-400' : 'text-red-400'
        
        newInsights.push({
          type: 'prediction',
          title: 'BTC Prediction',
          value: prediction,
          description: `Based on current momentum (${btcChange > 0 ? '+' : ''}${btcChange.toFixed(1)}%), Bitcoin may continue ${prediction.toLowerCase()} trend. Current: $${btcPrice.toLocaleString()}. Key levels to watch.`,
          confidence: 72,
          trend: btcChange > 0 ? 'up' : btcChange < 0 ? 'down' : 'neutral',
          color: predictionColor,
          icon: BarChart3
        })
      }

      setInsights(newInsights)
      setLastUpdate(new Date())
      
      // Generate AI analysis summary
      const analysisText = `Market Analysis Summary: ${
        newInsights.find(i => i.type === 'sentiment')?.description || 'Market data being analyzed.'
      } ${
        newInsights.find(i => i.type === 'risk')?.description || ''
      } Key opportunities identified in DeFi sector with ${protocols?.length || 0} protocols monitored.`
      
      setAiAnalysis(analysisText)
      
    } catch (error) {
      console.error('AI insights generation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    generateInsights()
    
    // Update insights every 30 seconds
    const interval = setInterval(generateInsights, 30000)
    return () => clearInterval(interval)
  }, [marketData, protocols])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">AI Market Insights</h2>
              <p className="text-white/60">Real-time analysis powered by market data</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={generateInsights}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
            
            <div className="text-xs text-white/60">
              Updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* AI Analysis Summary */}
        {aiAnalysis && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">AI Analysis</h3>
            <p className="text-white/80 text-sm leading-relaxed">{aiAnalysis}</p>
          </div>
        )}

        {/* Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            // Loading state
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-6 bg-white/10 rounded mb-2"></div>
                <div className="h-12 bg-white/10 rounded"></div>
              </div>
            ))
          ) : (
            insights.map((insight, index) => {
              const Icon = insight.icon
              return (
                <motion.div
                  key={insight.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                    <Icon className={`w-5 h-5 ${insight.color}`} />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`${insight.color} font-medium text-lg`}>
                      {insight.value}
                    </span>
                    <div className="text-xs text-white/60">
                      {insight.confidence}% confidence
                    </div>
                  </div>
                  
                  <p className="text-white/70 text-sm leading-relaxed">
                    {insight.description}
                  </p>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default AIInsightsPanel
