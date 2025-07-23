import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Lightbulb, 
  Target, 
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Star
} from 'lucide-react'

interface EducationalTip {
  id: string
  title: string
  content: string
  category: 'trading' | 'defi' | 'security' | 'basics' | 'advanced'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  readTime: number // in minutes
  tags: string[]
  actionable: boolean
  example?: string
  warning?: string
}

interface EducationalTipsProps {
  category?: string
  difficulty?: string
  autoRotate?: boolean
  className?: string
}

const EducationalTips: React.FC<EducationalTipsProps> = ({
  category,
  difficulty,
  autoRotate = true,
  className = ''
}) => {
  const [tips, setTips] = useState<EducationalTip[]>([])
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch educational tips
  const fetchEducationalTips = async () => {
    try {
      setError(null)
      
      // Mock educational tips data - in production, this would fetch from your content API
      const mockTips: EducationalTip[] = [
        {
          id: '1',
          title: 'Dollar-Cost Averaging (DCA) Strategy',
          content: 'DCA involves investing a fixed amount regularly regardless of price. This strategy helps reduce the impact of volatility and removes the stress of timing the market.',
          category: 'trading',
          difficulty: 'beginner',
          readTime: 2,
          tags: ['strategy', 'risk-management', 'investing'],
          actionable: true,
          example: 'Invest $100 in Bitcoin every Monday for 6 months, regardless of price.',
          warning: 'DCA works best in long-term uptrends. Consider market conditions.'
        },
        {
          id: '2',
          title: 'Understanding Impermanent Loss',
          content: 'Impermanent loss occurs when providing liquidity to AMM pools. The loss happens when token prices diverge from when you deposited them.',
          category: 'defi',
          difficulty: 'intermediate',
          readTime: 3,
          tags: ['liquidity', 'amm', 'yield-farming'],
          actionable: true,
          example: 'If you deposit ETH/USDC at 1:2000 ratio and ETH doubles, you lose potential gains.',
          warning: 'Always calculate potential impermanent loss before providing liquidity.'
        },
        {
          id: '3',
          title: 'Hardware Wallet Security',
          content: 'Hardware wallets store your private keys offline, making them immune to online attacks. They\'re essential for securing large crypto holdings.',
          category: 'security',
          difficulty: 'beginner',
          readTime: 2,
          tags: ['security', 'wallet', 'storage'],
          actionable: true,
          example: 'Ledger Nano S/X or Trezor for storing long-term holdings.',
          warning: 'Always buy hardware wallets directly from manufacturers.'
        },
        {
          id: '4',
          title: 'Reading Candlestick Patterns',
          content: 'Candlesticks show open, high, low, and close prices. Green/white candles indicate price increases, red/black indicate decreases.',
          category: 'trading',
          difficulty: 'beginner',
          readTime: 4,
          tags: ['technical-analysis', 'charts', 'patterns'],
          actionable: true,
          example: 'A long green candle with small wicks suggests strong buying pressure.',
          warning: 'Patterns work best when combined with volume and other indicators.'
        },
        {
          id: '5',
          title: 'Smart Contract Audits',
          content: 'Before using any DeFi protocol, check if it has been audited by reputable firms. Audits help identify potential vulnerabilities.',
          category: 'security',
          difficulty: 'intermediate',
          readTime: 3,
          tags: ['smart-contracts', 'audits', 'due-diligence'],
          actionable: true,
          example: 'Look for audits from CertiK, ConsenSys Diligence, or Trail of Bits.',
          warning: 'Audits don\'t guarantee safety. New vulnerabilities can still be discovered.'
        },
        {
          id: '6',
          title: 'Gas Optimization Techniques',
          content: 'Save on transaction fees by timing transactions during low network congestion, batching operations, and using Layer 2 solutions.',
          category: 'advanced',
          difficulty: 'intermediate',
          readTime: 3,
          tags: ['gas', 'optimization', 'layer2'],
          actionable: true,
          example: 'Use Arbitrum or Optimism for cheaper transactions, or trade on weekends.',
          warning: 'Layer 2 solutions may have different security assumptions.'
        },
        {
          id: '7',
          title: 'Yield Farming Risks',
          content: 'High APY often comes with high risk. Consider smart contract risk, impermanent loss, and token emission schedules before farming.',
          category: 'defi',
          difficulty: 'advanced',
          readTime: 4,
          tags: ['yield-farming', 'risk-assessment', 'apy'],
          actionable: true,
          example: 'A 1000% APY farm likely has unsustainable tokenomics or high risk.',
          warning: 'Many high-yield farms are Ponzi schemes or have exit scam potential.'
        },
        {
          id: '8',
          title: 'Portfolio Diversification',
          content: 'Don\'t put all funds in one asset or sector. Spread risk across different cryptocurrencies, market caps, and use cases.',
          category: 'basics',
          difficulty: 'beginner',
          readTime: 2,
          tags: ['portfolio', 'diversification', 'risk-management'],
          actionable: true,
          example: '60% large-cap (BTC, ETH), 30% mid-cap, 10% small-cap/experimental.',
          warning: 'Crypto markets are highly correlated. Traditional diversification may not apply.'
        }
      ]

      // Filter tips based on category and difficulty if specified
      let filteredTips = mockTips
      
      if (category) {
        filteredTips = filteredTips.filter(tip => tip.category === category)
      }
      
      if (difficulty) {
        filteredTips = filteredTips.filter(tip => tip.difficulty === difficulty)
      }

      setTips(filteredTips)
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch educational tips')
      setIsLoading(false)
    }
  }

  // Initialize
  useEffect(() => {
    fetchEducationalTips()
  }, [category, difficulty])

  // Auto-rotate tips
  useEffect(() => {
    if (autoRotate && tips.length > 1) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length)
      }, 15000) // Change tip every 15 seconds
      
      return () => clearInterval(interval)
    }
  }, [autoRotate, tips.length])

  // Navigation functions
  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length)
  }

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length)
  }

  // Get category configuration
  const getCategoryConfig = (cat: string) => {
    const configs = {
      trading: { color: 'text-green-400', bg: 'bg-green-400/20', icon: TrendingUp },
      defi: { color: 'text-blue-400', bg: 'bg-blue-400/20', icon: Target },
      security: { color: 'text-red-400', bg: 'bg-red-400/20', icon: Shield },
      basics: { color: 'text-yellow-400', bg: 'bg-yellow-400/20', icon: BookOpen },
      advanced: { color: 'text-purple-400', bg: 'bg-purple-400/20', icon: Star }
    }
    return configs[cat as keyof typeof configs] || configs.basics
  }

  // Get difficulty color
  const getDifficultyColor = (diff: string) => {
    const colors = {
      beginner: 'text-green-400',
      intermediate: 'text-yellow-400',
      advanced: 'text-red-400'
    }
    return colors[diff as keyof typeof colors] || 'text-gray-400'
  }

  if (isLoading) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Daily Learning</h3>
          </div>
          <RefreshCw className="w-4 h-4 text-white/60 animate-spin" />
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-white/10 rounded mb-3"></div>
          <div className="h-3 bg-white/5 rounded mb-2"></div>
          <div className="h-3 bg-white/5 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (error || tips.length === 0) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Daily Learning</h3>
          </div>
          <button onClick={fetchEducationalTips} className="p-1 hover:bg-white/10 rounded">
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        </div>
        <div className="text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          {error || 'No tips available for the selected criteria'}
        </div>
      </div>
    )
  }

  const currentTip = tips[currentTipIndex]
  const categoryConfig = getCategoryConfig(currentTip.category)
  const CategoryIcon = categoryConfig.icon

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Daily Learning</h3>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          {tips.length > 1 && (
            <>
              <button 
                onClick={prevTip}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-white/60" />
              </button>
              <span className="text-xs text-white/60">
                {currentTipIndex + 1}/{tips.length}
              </span>
              <button 
                onClick={nextTip}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-white/60" />
              </button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentTip.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${categoryConfig.bg} flex-shrink-0`}>
              <CategoryIcon className={`w-4 h-4 ${categoryConfig.color}`} />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium text-sm mb-1">
                {currentTip.title}
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <span className={`${getDifficultyColor(currentTip.difficulty)} capitalize`}>
                  {currentTip.difficulty}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-white/60">{currentTip.readTime} min read</span>
                <span className="text-white/40">•</span>
                <span className={`${categoryConfig.color} capitalize`}>
                  {currentTip.category}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="text-white/70 text-sm leading-relaxed">
            {currentTip.content}
          </p>

          {/* Example */}
          {currentTip.example && (
            <div className="p-3 bg-blue-400/10 border border-blue-400/20 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-blue-400 text-xs font-medium mb-1">Example:</div>
                  <div className="text-white/70 text-xs">{currentTip.example}</div>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          {currentTip.warning && (
            <div className="p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-yellow-400 text-xs font-medium mb-1">Important:</div>
                  <div className="text-white/70 text-xs">{currentTip.warning}</div>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex items-center gap-1 flex-wrap">
            {currentTip.tags.map((tag) => (
              <span 
                key={tag}
                className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 pt-3 border-t border-white/10">
        <button className="w-full text-center text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors">
          Explore Learning Hub →
        </button>
      </div>
    </div>
  )
}

export default EducationalTips
