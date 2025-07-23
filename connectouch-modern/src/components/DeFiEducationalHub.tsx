import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Star,
  Users,
  TrendingUp,
  Shield,
  Target,
  Zap,
  ChevronRight,
  Award,
  Filter,
  Search
} from 'lucide-react'

interface Tutorial {
  id: string
  title: string
  description: string
  category: 'basics' | 'lending' | 'dex' | 'yield-farming' | 'advanced'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number // in minutes
  steps: number
  completedSteps?: number
  rating: number
  enrollments: number
  tags: string[]
  protocol?: string
  prerequisites: string[]
  learningOutcomes: string[]
  isCompleted?: boolean
  progress?: number
}

interface DeFiEducationalHubProps {
  protocols?: any[]
  className?: string
}

const DeFiEducationalHub: React.FC<DeFiEducationalHubProps> = ({
  protocols = [],
  className = ''
}) => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Generate educational content
  useEffect(() => {
    const generateTutorials = () => {
      const baseTutorials: Tutorial[] = [
        {
          id: 'defi-basics',
          title: 'DeFi Fundamentals',
          description: 'Learn the basics of Decentralized Finance, key concepts, and how it differs from traditional finance.',
          category: 'basics',
          difficulty: 'beginner',
          duration: 15,
          steps: 5,
          completedSteps: 0,
          rating: 4.8,
          enrollments: 12500,
          tags: ['fundamentals', 'introduction', 'concepts'],
          prerequisites: [],
          learningOutcomes: [
            'Understand what DeFi is and how it works',
            'Learn key DeFi terminology',
            'Identify major DeFi use cases',
            'Understand risks and benefits'
          ],
          isCompleted: false,
          progress: 0
        },
        {
          id: 'wallet-setup',
          title: 'Setting Up Your DeFi Wallet',
          description: 'Step-by-step guide to setting up MetaMask and other wallets for DeFi interactions.',
          category: 'basics',
          difficulty: 'beginner',
          duration: 10,
          steps: 4,
          completedSteps: 4,
          rating: 4.9,
          enrollments: 15200,
          tags: ['wallet', 'metamask', 'setup', 'security'],
          prerequisites: [],
          learningOutcomes: [
            'Install and configure MetaMask',
            'Understand private key security',
            'Connect to different networks',
            'Manage multiple accounts'
          ],
          isCompleted: true,
          progress: 100
        },
        {
          id: 'uniswap-trading',
          title: 'Trading on Uniswap',
          description: 'Learn how to swap tokens, provide liquidity, and understand automated market makers.',
          category: 'dex',
          difficulty: 'intermediate',
          duration: 25,
          steps: 8,
          completedSteps: 3,
          rating: 4.7,
          enrollments: 8900,
          tags: ['uniswap', 'amm', 'trading', 'liquidity'],
          protocol: 'Uniswap',
          prerequisites: ['DeFi Fundamentals', 'Wallet Setup'],
          learningOutcomes: [
            'Execute token swaps on Uniswap',
            'Understand slippage and price impact',
            'Provide liquidity to pools',
            'Calculate impermanent loss'
          ],
          isCompleted: false,
          progress: 37.5
        },
        {
          id: 'aave-lending',
          title: 'Lending and Borrowing on Aave',
          description: 'Master lending protocols, collateralization, and earning yield on your crypto assets.',
          category: 'lending',
          difficulty: 'intermediate',
          duration: 30,
          steps: 10,
          completedSteps: 0,
          rating: 4.6,
          enrollments: 7200,
          tags: ['aave', 'lending', 'borrowing', 'collateral'],
          protocol: 'Aave',
          prerequisites: ['DeFi Fundamentals'],
          learningOutcomes: [
            'Lend assets to earn interest',
            'Understand collateralization ratios',
            'Borrow against collateral',
            'Manage liquidation risks'
          ],
          isCompleted: false,
          progress: 0
        },
        {
          id: 'yield-farming-strategies',
          title: 'Advanced Yield Farming',
          description: 'Explore complex yield farming strategies, risk management, and optimization techniques.',
          category: 'yield-farming',
          difficulty: 'advanced',
          duration: 45,
          steps: 12,
          completedSteps: 0,
          rating: 4.5,
          enrollments: 3800,
          tags: ['yield-farming', 'strategies', 'optimization', 'risk'],
          prerequisites: ['Trading on Uniswap', 'Lending and Borrowing'],
          learningOutcomes: [
            'Design yield farming strategies',
            'Understand IL and mitigation',
            'Use leverage responsibly',
            'Optimize gas costs'
          ],
          isCompleted: false,
          progress: 0
        },
        {
          id: 'defi-security',
          title: 'DeFi Security Best Practices',
          description: 'Learn how to protect yourself from scams, exploits, and common security pitfalls.',
          category: 'basics',
          difficulty: 'intermediate',
          duration: 20,
          steps: 6,
          completedSteps: 2,
          rating: 4.9,
          enrollments: 9500,
          tags: ['security', 'safety', 'scams', 'best-practices'],
          prerequisites: ['DeFi Fundamentals'],
          learningOutcomes: [
            'Identify common DeFi scams',
            'Verify smart contracts',
            'Use hardware wallets safely',
            'Implement security checklists'
          ],
          isCompleted: false,
          progress: 33.3
        }
      ]

      // Add protocol-specific tutorials
      const protocolTutorials = protocols.slice(0, 3).map((protocol, index) => ({
        id: `protocol-${protocol.name.toLowerCase()}`,
        title: `Getting Started with ${protocol.name}`,
        description: `Complete guide to using ${protocol.name} protocol for ${protocol.category.toLowerCase()}.`,
        category: protocol.category.toLowerCase().includes('lending') ? 'lending' as const : 'dex' as const,
        difficulty: 'intermediate' as const,
        duration: 20,
        steps: 7,
        completedSteps: 0,
        rating: 4.0 + Math.random() * 0.8,
        enrollments: Math.floor(Math.random() * 5000) + 1000,
        tags: [protocol.name.toLowerCase(), protocol.category.toLowerCase(), 'tutorial'],
        protocol: protocol.name,
        prerequisites: ['DeFi Fundamentals'],
        learningOutcomes: [
          `Navigate ${protocol.name} interface`,
          `Execute transactions on ${protocol.name}`,
          'Understand protocol-specific risks',
          'Optimize your strategy'
        ],
        isCompleted: false,
        progress: 0
      }))

      setTutorials([...baseTutorials, ...protocolTutorials])
      setIsLoading(false)
    }

    generateTutorials()
  }, [protocols])

  // Filter tutorials
  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || tutorial.difficulty === selectedDifficulty
    const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutorial.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesDifficulty && matchesSearch
  })

  // Get categories
  const categories = [
    { id: 'all', name: 'All Categories', icon: BookOpen },
    { id: 'basics', name: 'Basics', icon: Star },
    { id: 'lending', name: 'Lending', icon: TrendingUp },
    { id: 'dex', name: 'DEX Trading', icon: Zap },
    { id: 'yield-farming', name: 'Yield Farming', icon: Target },
    { id: 'advanced', name: 'Advanced', icon: Award }
  ]

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'text-green-400',
      intermediate: 'text-yellow-400',
      advanced: 'text-red-400'
    }
    return colors[difficulty as keyof typeof colors] || 'text-gray-400'
  }

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors = {
      basics: 'text-blue-400',
      lending: 'text-green-400',
      dex: 'text-purple-400',
      'yield-farming': 'text-orange-400',
      advanced: 'text-red-400'
    }
    return colors[category as keyof typeof colors] || 'text-gray-400'
  }

  if (isLoading) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">DeFi Learning Hub</h3>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search tutorials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
          />
        </div>
        
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
        >
          <option value="all" className="bg-gray-800">All Levels</option>
          <option value="beginner" className="bg-gray-800">Beginner</option>
          <option value="intermediate" className="bg-gray-800">Intermediate</option>
          <option value="advanced" className="bg-gray-800">Advanced</option>
        </select>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          )
        })}
      </div>

      {/* Tutorials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <AnimatePresence>
          {filteredTutorials.map((tutorial, index) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">
                      {tutorial.title}
                    </h4>
                    {tutorial.isCompleted && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <p className="text-white/60 text-xs line-clamp-2 mb-2">
                    {tutorial.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/60 flex-shrink-0" />
              </div>

              {/* Progress Bar */}
              {tutorial.progress && tutorial.progress > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/60">Progress</span>
                    <span className="text-white/60">{(typeof tutorial.progress === 'number' && !isNaN(tutorial.progress) ? tutorial.progress : 0).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div 
                      className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${tutorial.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-white/40" />
                    <span className="text-white/60">{tutorial.duration}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Play className="w-3 h-3 text-white/40" />
                    <span className="text-white/60">{tutorial.steps} steps</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-white/60">{(typeof tutorial.rating === 'number' && !isNaN(tutorial.rating) ? tutorial.rating : 0).toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-white/40" />
                  <span className="text-white/60">{(typeof tutorial.enrollments === 'number' && !isNaN(tutorial.enrollments) ? tutorial.enrollments / 1000 : 0).toFixed(1)}K</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full bg-white/10 ${getCategoryColor(tutorial.category)}`}>
                    {tutorial.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full bg-white/10 ${getDifficultyColor(tutorial.difficulty)}`}>
                    {tutorial.difficulty}
                  </span>
                </div>
                {tutorial.protocol && (
                  <span className="text-xs text-blue-400 bg-blue-400/20 px-2 py-1 rounded">
                    {tutorial.protocol}
                  </span>
                )}
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1 mt-3 flex-wrap">
                {tutorial.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs text-white/50 bg-white/5 px-1.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Learning Path Suggestion */}
      <div className="p-4 bg-gradient-to-r from-blue-400/10 to-purple-400/10 border border-blue-400/20 rounded-lg mb-4">
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-medium text-sm mb-1">Recommended Learning Path</h4>
            <p className="text-white/70 text-xs mb-2">
              Start with DeFi Fundamentals → Wallet Setup → Choose your specialization (Lending, DEX, or Yield Farming)
            </p>
            <button className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors">
              View Full Learning Path →
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <button className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          Browse All {tutorials.length} Tutorials →
        </button>
      </div>
    </div>
  )
}

export default DeFiEducationalHub
