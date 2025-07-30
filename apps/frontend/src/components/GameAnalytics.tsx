import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Gamepad2,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Trophy,
  Zap,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Play,
  Star,
  Crown,
  Award
} from 'lucide-react'

interface GameProject {
  id: string
  name: string
  symbol: string
  category: 'mmorpg' | 'strategy' | 'card' | 'metaverse' | 'racing' | 'sports' | 'casual'
  marketCap: number
  price: number
  change24h: number
  volume24h: number
  players: {
    total: number
    daily: number
    monthly: number
    peak24h: number
  }
  revenue: {
    daily: number
    monthly: number
    total: number
    playerAverage: number
  }
  tokenomics: {
    totalSupply: number
    circulatingSupply: number
    stakingAPY: number
    burnRate: number
  }
  gameplay: {
    averageSessionTime: number
    retentionRate: number
    newPlayerGrowth: number
    churnRate: number
  }
  platform: string[]
  status: 'active' | 'beta' | 'upcoming' | 'maintenance'
  launchDate: string
  description: string
  website?: string
  social?: {
    twitter?: string
    discord?: string
    telegram?: string
  }
}

interface GameAnalyticsProps {
  games: GameProject[]
  isLoading?: boolean
}

const GameAnalytics: React.FC<GameAnalyticsProps> = ({ 
  games = [], 
  isLoading = false 
}) => {
  const [selectedGame, setSelectedGame] = useState<GameProject | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'marketCap' | 'players' | 'revenue' | 'growth'>('marketCap')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Generate mock game data if none provided
  useEffect(() => {
    if (games.length === 0 && !isLoading) {
      // This will be replaced with real API data
    }
  }, [games, isLoading])

  // Filter and sort games
  const filteredGames = games
    .filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (sortBy) {
        case 'marketCap':
          aValue = a.marketCap
          bValue = b.marketCap
          break
        case 'players':
          aValue = a.players.daily
          bValue = b.players.daily
          break
        case 'revenue':
          aValue = a.revenue.daily
          bValue = b.revenue.daily
          break
        case 'growth':
          aValue = a.gameplay.newPlayerGrowth
          bValue = b.gameplay.newPlayerGrowth
          break
        default:
          aValue = a.marketCap
          bValue = b.marketCap
      }
      
      const multiplier = sortOrder === 'desc' ? -1 : 1
      return (aValue > bValue ? 1 : -1) * multiplier
    })

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(games.map(g => g.category)))]

  // Format numbers
  const formatNumber = (num: number | undefined | null, prefix = ''): string => {
    const safeNum = typeof num === 'number' && !isNaN(num) ? num : 0
    if (safeNum >= 1e9) return `${prefix}${(safeNum / 1e9).toFixed(1)}B`
    if (safeNum >= 1e6) return `${prefix}${(safeNum / 1e6).toFixed(1)}M`
    if (safeNum >= 1e3) return `${prefix}${(safeNum / 1e3).toFixed(1)}K`
    return `${prefix}${safeNum.toFixed(2)}`
  }

  // Format currency
  const formatCurrency = (value: number | undefined | null): string => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0
    return `$${formatNumber(safeValue)}`
  }

  // Get change color
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-white/60'
  }

  // Get change icon
  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />
    if (change < 0) return <TrendingDown className="w-4 h-4" />
    return null
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mmorpg': return <Crown className="w-5 h-5" />
      case 'strategy': return <Target className="w-5 h-5" />
      case 'card': return <Star className="w-5 h-5" />
      case 'metaverse': return <Zap className="w-5 h-5" />
      case 'racing': return <Activity className="w-5 h-5" />
      case 'sports': return <Trophy className="w-5 h-5" />
      case 'casual': return <Play className="w-5 h-5" />
      default: return <Gamepad2 className="w-5 h-5" />
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'beta': return 'text-yellow-400'
      case 'upcoming': return 'text-blue-400'
      case 'maintenance': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Game Analytics</h2>
          <div className="animate-spin">
            <RefreshCw className="w-5 h-5 text-white/60" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-4"></div>
              <div className="h-8 bg-white/10 rounded mb-2"></div>
              <div className="h-4 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Game Analytics</h2>
          <p className="text-white/60">Comprehensive insights into blockchain gaming performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 text-center">
          <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Total Market Cap</h3>
          <p className="text-2xl font-bold text-green-400">
            {formatCurrency(games.reduce((sum, game) => sum + (game.marketCap || 0), 0))}
          </p>
        </div>

        <div className="glass-card p-6 text-center">
          <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Daily Players</h3>
          <p className="text-2xl font-bold text-blue-400">
            {formatNumber(games.reduce((sum, game) => sum + (game.players?.daily || 0), 0))}
          </p>
        </div>

        <div className="glass-card p-6 text-center">
          <Activity className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Daily Revenue</h3>
          <p className="text-2xl font-bold text-purple-400">
            {formatCurrency(games.reduce((sum, game) => sum + (game.revenue?.daily || 0), 0))}
          </p>
        </div>

        <div className="glass-card p-6 text-center">
          <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Active Games</h3>
          <p className="text-2xl font-bold text-yellow-400">{games.length}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
          />
        </div>
        
        <div className="flex gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            {categories.map(category => (
              <option key={category} value={category} className="bg-gray-800 capitalize">
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field as any)
              setSortOrder(order as any)
            }}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            <option value="marketCap-desc" className="bg-gray-800">Market Cap (High to Low)</option>
            <option value="marketCap-asc" className="bg-gray-800">Market Cap (Low to High)</option>
            <option value="players-desc" className="bg-gray-800">Players (High to Low)</option>
            <option value="players-asc" className="bg-gray-800">Players (Low to High)</option>
            <option value="revenue-desc" className="bg-gray-800">Revenue (High to Low)</option>
            <option value="revenue-asc" className="bg-gray-800">Revenue (Low to High)</option>
            <option value="growth-desc" className="bg-gray-800">Growth (High to Low)</option>
            <option value="growth-asc" className="bg-gray-800">Growth (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Games Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredGames.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer ${
              viewMode === 'list' ? 'flex items-center gap-6' : ''
            }`}
            onClick={() => setSelectedGame(game)}
          >
            {/* Game Icon */}
            <div className={`${viewMode === 'list' ? 'w-16 h-16' : 'w-full h-48'} bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative`}>
              {getCategoryIcon(game.category)}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(game.status)} bg-black/60 backdrop-blur-sm`}>
                {game.status}
              </div>
            </div>

            <div className="flex-1">
              {/* Game Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{game.name}</h3>
                </div>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                  {game.symbol}
                </span>
              </div>

              {/* Game Stats */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Market Cap</span>
                  <span className="text-white font-medium">{formatCurrency(game.marketCap)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Daily Players</span>
                  <span className="text-white font-medium">{formatNumber(game.players?.daily)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">24h Change</span>
                  <div className={`flex items-center gap-1 ${getChangeColor(game.change24h)}`}>
                    {getChangeIcon(game.change24h)}
                    <span className="font-medium">{(typeof game.change24h === 'number' && !isNaN(game.change24h) ? game.change24h : 0).toFixed(2)}%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Daily Revenue</span>
                  <span className="text-white font-medium">{formatCurrency(game.revenue?.daily)}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60 capitalize">{game.category}</span>
                  <span className="text-xs text-white/60">•</span>
                  <span className="text-xs text-white/60">{game.platform.join(', ')}</span>
                </div>
                <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredGames.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Games Found</h3>
          <p className="text-white/60">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Game Detail Modal */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedGame(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                    {getCategoryIcon(selectedGame.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-white">{selectedGame.name}</h2>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedGame.status)} bg-current/20`}>
                        {selectedGame.status}
                      </span>
                    </div>
                    <p className="text-white/60">{selectedGame.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGame(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Game Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{formatCurrency(selectedGame.marketCap)}</div>
                  <div className="text-xs text-white/60">Market Cap</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{formatNumber(selectedGame.players.daily)}</div>
                  <div className="text-xs text-white/60">Daily Players</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{formatCurrency(selectedGame.revenue.daily)}</div>
                  <div className="text-xs text-white/60">Daily Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{(typeof selectedGame.tokenomics.stakingAPY === 'number' && !isNaN(selectedGame.tokenomics.stakingAPY) ? selectedGame.tokenomics.stakingAPY : 0).toFixed(1)}%</div>
                  <div className="text-xs text-white/60">Staking APY</div>
                </div>
              </div>

              {/* Detailed Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-white font-medium mb-4">Player Analytics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Total Players:</span>
                      <span className="text-white">{formatNumber(selectedGame.players.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Monthly Active:</span>
                      <span className="text-white">{formatNumber(selectedGame.players.monthly)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">24h Peak:</span>
                      <span className="text-white">{formatNumber(selectedGame.players.peak24h)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Retention Rate:</span>
                      <span className="text-green-400">{(typeof selectedGame.gameplay.retentionRate === 'number' && !isNaN(selectedGame.gameplay.retentionRate) ? selectedGame.gameplay.retentionRate : 0).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-4">Revenue Analytics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Monthly Revenue:</span>
                      <span className="text-white">{formatCurrency(selectedGame.revenue.monthly)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Total Revenue:</span>
                      <span className="text-white">{formatCurrency(selectedGame.revenue.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Avg per Player:</span>
                      <span className="text-white">{formatCurrency(selectedGame.revenue.playerAverage)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Growth Rate:</span>
                      <span className="text-green-400">{(typeof selectedGame.gameplay.newPlayerGrowth === 'number' && !isNaN(selectedGame.gameplay.newPlayerGrowth) ? selectedGame.gameplay.newPlayerGrowth : 0).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tokenomics */}
              <div className="mb-8">
                <h3 className="text-white font-medium mb-4">Tokenomics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-4 text-center">
                    <div className="text-lg font-bold text-white">{formatNumber(selectedGame.tokenomics.totalSupply)}</div>
                    <div className="text-xs text-white/60">Total Supply</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <div className="text-lg font-bold text-white">{formatNumber(selectedGame.tokenomics.circulatingSupply)}</div>
                    <div className="text-xs text-white/60">Circulating</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <div className="text-lg font-bold text-yellow-400">{(typeof selectedGame.tokenomics.stakingAPY === 'number' && !isNaN(selectedGame.tokenomics.stakingAPY) ? selectedGame.tokenomics.stakingAPY : 0).toFixed(1)}%</div>
                    <div className="text-xs text-white/60">Staking APY</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <div className="text-lg font-bold text-red-400">{(typeof selectedGame.tokenomics.burnRate === 'number' && !isNaN(selectedGame.tokenomics.burnRate) ? selectedGame.tokenomics.burnRate : 0).toFixed(2)}%</div>
                    <div className="text-xs text-white/60">Burn Rate</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {selectedGame.website && (
                  <a
                    href={selectedGame.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg font-medium transition-colors text-center"
                  >
                    Visit Website
                  </a>
                )}
                <button
                  onClick={() => {
                    console.log(`Launching ${selectedGame.name} game...`)
                    alert(`🎮 Launching ${selectedGame.name}!\n\n• Platform: ${selectedGame.platform.join(', ')}\n• Players: ${selectedGame.players.daily.toLocaleString()} daily\n• Avg Earnings: $${selectedGame.revenue.playerAverage}/day\n\nGame launcher coming soon!`)
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Play Game
                </button>
                <button
                  onClick={() => {
                    console.log(`Added ${selectedGame.name} to watchlist`)
                    alert(`⭐ ${selectedGame.name} added to your GameFi watchlist!\n\nYou'll receive notifications about:\n• Price changes\n• New features\n• Earning opportunities\n• Tournament announcements`)
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Add to Watchlist
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GameAnalytics
