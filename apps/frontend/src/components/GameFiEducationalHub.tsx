import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen,
  Play,
  Star,
  Users,
  TrendingUp,
  Gamepad2,
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
  Filter,
  DollarSign,
  Trophy,
  Crown,
  Shield
} from 'lucide-react'

interface GameFiGuide {
  id: string
  title: string
  description: string
  category: 'basics' | 'strategy' | 'technical' | 'economics' | 'advanced'
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
  game?: string
}

interface GameFiInsight {
  id: string
  title: string
  summary: string
  category: 'trend' | 'analysis' | 'news' | 'prediction' | 'strategy'
  impact: 'high' | 'medium' | 'low'
  timeframe: string
  confidence: number
  relatedGames: string[]
  keyPoints: string[]
  publishedAt: string
  author: string
}

interface P2EStrategy {
  id: string
  name: string
  description: string
  game: string
  riskLevel: 'low' | 'medium' | 'high'
  timeCommitment: 'casual' | 'moderate' | 'intensive'
  investmentRequired: number
  expectedROI: number
  successRate: number
  requirements: string[]
  steps: string[]
  pros: string[]
  cons: string[]
  tips: string[]
}

interface GameFiEducationalHubProps {
  userLevel?: 'beginner' | 'intermediate' | 'advanced'
  selectedGame?: string
}

const GameFiEducationalHub: React.FC<GameFiEducationalHubProps> = ({ 
  userLevel = 'beginner',
  selectedGame
}) => {
  const [activeTab, setActiveTab] = useState<'guides' | 'insights' | 'strategies'>('guides')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGuide, setSelectedGuide] = useState<GameFiGuide | null>(null)
  const [guides, setGuides] = useState<GameFiGuide[]>([])
  const [insights, setInsights] = useState<GameFiInsight[]>([])
  const [strategies, setStrategies] = useState<P2EStrategy[]>([])

  // Generate educational content
  useEffect(() => {
    const mockGuides: GameFiGuide[] = [
      {
        id: 'gamefi-basics',
        title: 'GameFi Fundamentals',
        description: 'Learn the basics of GameFi, play-to-earn mechanics, and how blockchain gaming works.',
        category: 'basics',
        difficulty: 'beginner',
        duration: 30,
        rating: 4.9,
        enrollments: 25420,
        progress: 0,
        tags: ['GameFi', 'P2E', 'Blockchain Gaming'],
        learningOutcomes: [
          'Understand GameFi and play-to-earn concepts',
          'Learn about different types of blockchain games',
          'Understand tokenomics in gaming',
          'Know how to get started safely'
        ],
        author: 'Connectouch Academy',
        lastUpdated: '2024-01-15'
      },
      {
        id: 'axie-infinity-guide',
        title: 'Axie Infinity Mastery',
        description: 'Complete guide to playing and earning in Axie Infinity, from basics to advanced strategies.',
        category: 'strategy',
        difficulty: 'intermediate',
        duration: 45,
        rating: 4.7,
        enrollments: 18930,
        progress: 0,
        tags: ['Axie Infinity', 'Strategy', 'Team Building'],
        learningOutcomes: [
          'Master Axie team composition',
          'Learn advanced battle strategies',
          'Understand breeding mechanics',
          'Optimize earning potential'
        ],
        prerequisites: ['GameFi Fundamentals'],
        author: 'Axie Expert',
        lastUpdated: '2024-01-12',
        game: 'Axie Infinity'
      },
      {
        id: 'nft-gaming-economics',
        title: 'NFT Gaming Economics',
        description: 'Deep dive into the economics of NFT gaming, asset valuation, and market dynamics.',
        category: 'economics',
        difficulty: 'advanced',
        duration: 60,
        rating: 4.6,
        enrollments: 12750,
        progress: 0,
        tags: ['NFT', 'Economics', 'Valuation'],
        learningOutcomes: [
          'Understand NFT asset valuation',
          'Learn market dynamics in gaming',
          'Analyze tokenomics models',
          'Identify investment opportunities'
        ],
        prerequisites: ['GameFi Fundamentals', 'Basic Economics'],
        author: 'Economics Professor',
        lastUpdated: '2024-01-10'
      },
      {
        id: 'guild-management',
        title: 'Guild Management & Leadership',
        description: 'Learn how to create, manage, and lead successful gaming guilds for maximum earnings.',
        category: 'strategy',
        difficulty: 'intermediate',
        duration: 40,
        rating: 4.8,
        enrollments: 9650,
        progress: 0,
        tags: ['Guild', 'Leadership', 'Management'],
        learningOutcomes: [
          'Build and manage gaming guilds',
          'Develop leadership skills',
          'Optimize team performance',
          'Create sustainable earning models'
        ],
        author: 'Guild Master',
        lastUpdated: '2024-01-08'
      }
    ]

    const mockInsights: GameFiInsight[] = [
      {
        id: 'gamefi-market-surge',
        title: 'GameFi Market Shows 40% Growth in Q1 2024',
        summary: 'The GameFi sector experiences significant growth driven by new game launches and increased player adoption.',
        category: 'trend',
        impact: 'high',
        timeframe: 'Q1 2024',
        confidence: 88,
        relatedGames: ['Axie Infinity', 'The Sandbox', 'Splinterlands'],
        keyPoints: [
          'New AAA game launches driving adoption',
          'Improved tokenomics models showing sustainability',
          'Institutional investment increasing',
          'Mobile gaming integration expanding reach'
        ],
        publishedAt: '2024-01-15',
        author: 'Market Analyst'
      },
      {
        id: 'p2e-sustainability',
        title: 'The Evolution of Sustainable P2E Models',
        summary: 'Analysis of how play-to-earn games are evolving to create more sustainable economic models.',
        category: 'analysis',
        impact: 'medium',
        timeframe: '2024',
        confidence: 82,
        relatedGames: ['Axie Infinity', 'Splinterlands', 'Gods Unchained'],
        keyPoints: [
          'Shift from pure P2E to play-and-earn models',
          'Introduction of skill-based earning mechanisms',
          'Better balance between fun and earning',
          'Long-term player retention improvements'
        ],
        publishedAt: '2024-01-14',
        author: 'Game Designer'
      }
    ]

    const mockStrategies: P2EStrategy[] = [
      {
        id: 'axie-scholarship',
        name: 'Axie Scholarship Program',
        description: 'Create and manage a scholarship program to scale Axie Infinity earnings.',
        game: 'Axie Infinity',
        riskLevel: 'medium',
        timeCommitment: 'moderate',
        investmentRequired: 5000,
        expectedROI: 25,
        successRate: 75,
        requirements: [
          'Initial capital for multiple Axie teams',
          'Time for scholar management',
          'Understanding of game mechanics'
        ],
        steps: [
          'Purchase multiple competitive Axie teams',
          'Recruit and train scholars',
          'Set up profit-sharing agreements',
          'Monitor performance and optimize'
        ],
        pros: [
          'Scalable earning potential',
          'Passive income generation',
          'Community building'
        ],
        cons: [
          'High initial investment',
          'Scholar management overhead',
          'Market dependency'
        ],
        tips: [
          'Start small with 2-3 scholars',
          'Focus on scholar education',
          'Maintain competitive teams'
        ]
      },
      {
        id: 'land-development',
        name: 'Metaverse Land Development',
        description: 'Develop and monetize virtual land in metaverse games like The Sandbox.',
        game: 'The Sandbox',
        riskLevel: 'high',
        timeCommitment: 'intensive',
        investmentRequired: 10000,
        expectedROI: 50,
        successRate: 60,
        requirements: [
          'LAND NFT ownership',
          'VoxEdit and Game Maker skills',
          'Creative and technical abilities'
        ],
        steps: [
          'Acquire strategic LAND locations',
          'Design and build experiences',
          'Host events and activities',
          'Monetize through various channels'
        ],
        pros: [
          'High earning potential',
          'Creative freedom',
          'Long-term asset appreciation'
        ],
        cons: [
          'Very high investment',
          'Technical complexity',
          'Market volatility'
        ],
        tips: [
          'Focus on high-traffic areas',
          'Collaborate with other creators',
          'Stay updated on platform changes'
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
    const matchesGame = !selectedGame || !guide.game || guide.game === selectedGame
    return matchesSearch && matchesCategory && matchesGame
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
        <h2 className="text-2xl font-bold text-white mb-2">GameFi Educational Hub</h2>
        <p className="text-white/60">Master blockchain gaming with expert guides, insights, and strategies</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { id: 'guides', label: 'Learning Guides', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'insights', label: 'Market Insights', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'strategies', label: 'P2E Strategies', icon: <Target className="w-4 h-4" /> }
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
            <option value="strategy" className="bg-gray-800">Strategy</option>
            <option value="technical" className="bg-gray-800">Technical</option>
            <option value="economics" className="bg-gray-800">Economics</option>
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
                      <Gamepad2 className={`w-6 h-6 ${getDifficultyColor(guide.difficulty)}`} />
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
                      <span className="text-xs text-white/60">by {insight.author} • {new Date(insight.publishedAt).toLocaleDateString()}</span>
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
                        <p className="text-white/60 text-sm">{strategy.game} • {strategy.timeCommitment}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(strategy.riskLevel)} bg-current/20`}>
                      {strategy.riskLevel} risk
                    </span>
                  </div>

                  <p className="text-white/80 mb-4">{strategy.description}</p>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">${strategy.investmentRequired.toLocaleString()}</div>
                      <div className="text-xs text-white/60">Investment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{strategy.expectedROI}%</div>
                      <div className="text-xs text-white/60">Expected ROI</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">{strategy.successRate}%</div>
                      <div className="text-xs text-white/60">Success Rate</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-white font-medium mb-2">Requirements:</h4>
                      <ul className="space-y-1">
                        {strategy.requirements.slice(0, 3).map((req, i) => (
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

export default GameFiEducationalHub
