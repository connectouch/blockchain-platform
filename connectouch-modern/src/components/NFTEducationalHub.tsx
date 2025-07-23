import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen,
  Play,
  Star,
  Users,
  TrendingUp,
  Shield,
  Target,
  Zap,
  ChevronRight,
  Clock,
  Award,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react'

interface NFTGuide {
  id: string
  title: string
  description: string
  category: 'basics' | 'trading' | 'technical' | 'security' | 'advanced'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number // minutes
  rating: number
  enrollments: number
  progress?: number
  completed?: boolean
  tags: string[]
  learningOutcomes: string[]
  prerequisites?: string[]
  author: string
  lastUpdated: string
}

interface MarketInsight {
  id: string
  title: string
  summary: string
  category: 'trend' | 'analysis' | 'news' | 'prediction'
  impact: 'high' | 'medium' | 'low'
  timeframe: string
  confidence: number
  relatedCollections: string[]
  keyPoints: string[]
  publishedAt: string
}

interface TradingStrategy {
  id: string
  name: string
  description: string
  riskLevel: 'low' | 'medium' | 'high'
  timeHorizon: 'short' | 'medium' | 'long'
  successRate: number
  averageReturn: number
  requirements: string[]
  steps: string[]
  pros: string[]
  cons: string[]
}

interface NFTEducationalHubProps {
  userLevel?: 'beginner' | 'intermediate' | 'advanced'
}

const NFTEducationalHub: React.FC<NFTEducationalHubProps> = ({ 
  userLevel = 'beginner' 
}) => {
  const [activeTab, setActiveTab] = useState<'guides' | 'insights' | 'strategies'>('guides')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGuide, setSelectedGuide] = useState<NFTGuide | null>(null)
  const [guides, setGuides] = useState<NFTGuide[]>([])
  const [insights, setInsights] = useState<MarketInsight[]>([])
  const [strategies, setStrategies] = useState<TradingStrategy[]>([])

  // Generate educational content
  useEffect(() => {
    const mockGuides: NFTGuide[] = [
      {
        id: 'nft-basics',
        title: 'NFT Fundamentals',
        description: 'Learn the basics of Non-Fungible Tokens, how they work, and why they matter in the digital economy.',
        category: 'basics',
        difficulty: 'beginner',
        duration: 25,
        rating: 4.8,
        enrollments: 15420,
        progress: 0,
        tags: ['NFT', 'Blockchain', 'Digital Assets'],
        learningOutcomes: [
          'Understand what NFTs are and how they work',
          'Learn about different types of NFTs',
          'Understand blockchain technology basics',
          'Know the difference between NFTs and cryptocurrencies'
        ],
        author: 'Connectouch Academy',
        lastUpdated: '2024-01-15'
      },
      {
        id: 'opensea-trading',
        title: 'Trading on OpenSea',
        description: 'Master the world\'s largest NFT marketplace with step-by-step trading guides and best practices.',
        category: 'trading',
        difficulty: 'intermediate',
        duration: 35,
        rating: 4.6,
        enrollments: 8930,
        progress: 0,
        tags: ['OpenSea', 'Trading', 'Marketplace'],
        learningOutcomes: [
          'Navigate OpenSea marketplace effectively',
          'Understand bidding and listing strategies',
          'Learn about gas fees and optimization',
          'Master collection filtering and analysis'
        ],
        prerequisites: ['NFT Fundamentals'],
        author: 'Trading Expert',
        lastUpdated: '2024-01-10'
      },
      {
        id: 'rarity-analysis',
        title: 'NFT Rarity and Valuation',
        description: 'Learn how to analyze NFT rarity, understand trait distribution, and evaluate fair market value.',
        category: 'technical',
        difficulty: 'intermediate',
        duration: 40,
        rating: 4.7,
        enrollments: 6750,
        progress: 0,
        tags: ['Rarity', 'Valuation', 'Analysis'],
        learningOutcomes: [
          'Understand rarity scoring systems',
          'Analyze trait distribution and scarcity',
          'Evaluate NFT market value',
          'Use rarity tools effectively'
        ],
        prerequisites: ['NFT Fundamentals', 'Trading on OpenSea'],
        author: 'Analytics Pro',
        lastUpdated: '2024-01-08'
      },
      {
        id: 'nft-security',
        title: 'NFT Security Best Practices',
        description: 'Protect your NFT investments from scams, exploits, and common security pitfalls.',
        category: 'security',
        difficulty: 'beginner',
        duration: 30,
        rating: 4.9,
        enrollments: 12340,
        progress: 0,
        tags: ['Security', 'Wallet Safety', 'Scam Prevention'],
        learningOutcomes: [
          'Secure your wallet and private keys',
          'Identify and avoid common scams',
          'Understand smart contract risks',
          'Implement multi-layer security'
        ],
        author: 'Security Specialist',
        lastUpdated: '2024-01-12'
      }
    ]

    const mockInsights: MarketInsight[] = [
      {
        id: 'blue-chip-trend',
        title: 'Blue-Chip NFTs Show Resilience in Market Downturn',
        summary: 'Despite overall market volatility, established collections maintain strong floor prices and trading volume.',
        category: 'trend',
        impact: 'high',
        timeframe: '7 days',
        confidence: 85,
        relatedCollections: ['Bored Ape Yacht Club', 'CryptoPunks', 'Azuki'],
        keyPoints: [
          'Blue-chip collections outperforming market by 15%',
          'Institutional interest remains strong',
          'Utility-driven projects gaining traction'
        ],
        publishedAt: '2024-01-15'
      },
      {
        id: 'gaming-nft-surge',
        title: 'Gaming NFTs Experience 40% Volume Increase',
        summary: 'Play-to-earn and gaming-related NFTs see significant growth as new titles launch.',
        category: 'analysis',
        impact: 'medium',
        timeframe: '30 days',
        confidence: 78,
        relatedCollections: ['Axie Infinity', 'The Sandbox', 'Decentraland'],
        keyPoints: [
          'New game launches driving demand',
          'Utility tokens showing strong performance',
          'Cross-platform integration increasing'
        ],
        publishedAt: '2024-01-14'
      }
    ]

    const mockStrategies: TradingStrategy[] = [
      {
        id: 'floor-sweeping',
        title: 'Floor Sweeping Strategy',
        description: 'Buy multiple NFTs at or near floor price from promising collections during market dips.',
        riskLevel: 'medium',
        timeHorizon: 'medium',
        successRate: 65,
        averageReturn: 25,
        requirements: [
          'Minimum 5 ETH capital',
          'Strong market analysis skills',
          'Patience for 3-6 month holds'
        ],
        steps: [
          'Identify undervalued collections with strong fundamentals',
          'Monitor floor price movements and volume',
          'Execute purchases during market weakness',
          'Hold for medium-term appreciation'
        ],
        pros: [
          'Lower entry prices during dips',
          'Diversification across multiple assets',
          'Potential for significant returns'
        ],
        cons: [
          'Requires substantial capital',
          'Market timing dependency',
          'Liquidity risk during downturns'
        ]
      },
      {
        id: 'rarity-sniping',
        title: 'Rarity Sniping',
        description: 'Target underpriced rare NFTs by analyzing trait rarity and market inefficiencies.',
        riskLevel: 'high',
        timeHorizon: 'short',
        successRate: 45,
        averageReturn: 80,
        requirements: [
          'Advanced rarity analysis tools',
          'Quick execution capabilities',
          'Deep collection knowledge'
        ],
        steps: [
          'Analyze collection trait distribution',
          'Identify mispriced rare items',
          'Execute rapid purchases',
          'Flip for quick profits'
        ],
        pros: [
          'High profit potential',
          'Quick turnaround time',
          'Skill-based advantage'
        ],
        cons: [
          'High risk of losses',
          'Requires constant monitoring',
          'Competition from bots'
        ]
      }
    ]

    setGuides(mockGuides)
    setInsights(mockInsights)
    setStrategies(mockStrategies)
  }, [])

  // Filter content based on search and category
  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400'
      case 'intermediate': return 'text-yellow-400'
      case 'advanced': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-white/60'
    }
  }

  // Get risk color
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">NFT Educational Hub</h2>
        <p className="text-white/60">Learn, analyze, and master NFT trading with expert guidance</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { id: 'guides', label: 'Learning Guides', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'insights', label: 'Market Insights', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'strategies', label: 'Trading Strategies', icon: <Target className="w-4 h-4" /> }
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

      {/* Search and Filters */}
      {activeTab === 'guides' && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all" className="bg-gray-800">All Categories</option>
            <option value="basics" className="bg-gray-800">Basics</option>
            <option value="trading" className="bg-gray-800">Trading</option>
            <option value="technical" className="bg-gray-800">Technical</option>
            <option value="security" className="bg-gray-800">Security</option>
            <option value="advanced" className="bg-gray-800">Advanced</option>
          </select>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'guides' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide, index) => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedGuide(guide)}
                >
                  {/* Guide Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${getDifficultyColor(guide.difficulty).replace('text-', 'bg-').replace('-400', '-400/20')}`}>
                      <BookOpen className={`w-6 h-6 ${getDifficultyColor(guide.difficulty)}`} />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(guide.difficulty)} bg-current/20`}>
                      {guide.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{guide.title}</h3>
                  <p className="text-white/60 text-sm mb-4 line-clamp-3">{guide.description}</p>

                  {/* Progress Bar */}
                  {guide.progress && guide.progress > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-white/60">Progress</span>
                        <span className="text-white/60">{(typeof guide.progress === 'number' && !isNaN(guide.progress) ? guide.progress : 0).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div 
                          className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${guide.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Guide Stats */}
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-white/40" />
                      <span className="text-white/60">{guide.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span className="text-white/60">{(typeof guide.rating === 'number' && !isNaN(guide.rating) ? guide.rating : 0).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-white/40" />
                      <span className="text-white/60">{(typeof guide.enrollments === 'number' && !isNaN(guide.enrollments) ? guide.enrollments / 1000 : 0).toFixed(1)}K</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {guide.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/60">by {guide.author}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getImpactColor(insight.impact).replace('text-', 'bg-').replace('-400', '-400/20')}`}>
                        <TrendingUp className={`w-5 h-5 ${getImpactColor(insight.impact)}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{insight.title}</h3>
                        <p className="text-white/60 text-sm">{insight.timeframe} • {insight.confidence}% confidence</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)} bg-current/20`}>
                      {insight.impact} impact
                    </span>
                  </div>

                  <p className="text-white/80 mb-4">{insight.summary}</p>

                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Key Points:</h4>
                    <ul className="space-y-1">
                      {insight.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/60">Published {new Date(insight.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <button className="text-purple-400 hover:text-purple-300 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'strategies' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {strategies.map((strategy, index) => (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getRiskColor(strategy.riskLevel).replace('text-', 'bg-').replace('-400', '-400/20')}`}>
                        <Target className={`w-5 h-5 ${getRiskColor(strategy.riskLevel)}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{strategy.name}</h3>
                        <p className="text-white/60 text-sm">{strategy.timeHorizon}-term • {strategy.successRate}% success rate</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(strategy.riskLevel)} bg-current/20`}>
                      {strategy.riskLevel} risk
                    </span>
                  </div>

                  <p className="text-white/80 mb-4">{strategy.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">+{strategy.averageReturn}%</div>
                      <div className="text-xs text-white/60">Avg Return</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-400">{strategy.successRate}%</div>
                      <div className="text-xs text-white/60">Success Rate</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-white font-medium mb-2">Requirements:</h4>
                      <ul className="space-y-1">
                        {strategy.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                            <Shield className="w-3 h-3 text-blue-400 mt-1 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-white/60">{strategy.pros.length} pros</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-white/60">{strategy.cons.length} cons</span>
                      </div>
                    </div>
                    <button className="text-purple-400 hover:text-purple-300 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default NFTEducationalHub
