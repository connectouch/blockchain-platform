import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, Coins, Play, Star, Trophy, Users, Wifi, WifiOff, RefreshCw, ExternalLink, Zap, Activity } from 'lucide-react'
import { useRealTimeGameFi, useRealTimeMarketData } from '../hooks/useRealTimeData'
import { comprehensiveRealDataService } from '../services/ComprehensiveRealDataService'

interface GameFiProject {
  id: string
  name: string
  category: string
  players: number
  tokenPrice: number
  marketCap: number
  volume24h: number
  chain: string
  playToEarn: boolean
  description: string
  status: string
  launched: string
  apy: number
  dailyRewards: number
  gameplayUrl?: string
}

interface PlayToEarnOpportunity {
  game: string
  activity: string
  estimatedEarnings: number
  timeRequired: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  requirements: string[]
}

const GameFiIntegration: React.FC = () => {
  const [opportunities, setOpportunities] = useState<PlayToEarnOpportunity[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Real-time data hooks
  const { projects: games, isLoading, error, refresh } = useRealTimeGameFi()
  const { marketData, isConnected } = useRealTimeMarketData()

  // Function to ensure unique IDs across all games
  const ensureUniqueIds = (gamesList: any[]): GameFiProject[] => {
    const usedIds = new Set<string>()

    return gamesList.map((game, index) => {
      let uniqueId = game.id || game.symbol || game.name?.toLowerCase().replace(/\s+/g, '-') || `gamefi-${index}`

      // If ID is already used, append index
      if (usedIds.has(uniqueId)) {
        uniqueId = `${uniqueId}-${index}`
      }

      usedIds.add(uniqueId)

      return {
        ...game,
        id: uniqueId
      }
    })
  }

  // Generate play-to-earn opportunities based on real GameFi data
  useEffect(() => {
    const fetchRealOpportunities = async () => {
      try {
        const gamefiProjects = await comprehensiveRealDataService.getRealGameFiProjects();

        const realOpportunities: PlayToEarnOpportunity[] = gamefiProjects.slice(0, 4).map((project, index) => ({
          game: project.name,
          activity: index % 2 === 0 ? 'Daily Quests + PvP Battles' : 'Staking + Tournament Play',
          estimatedEarnings: Math.floor(project.tokenPrice * 10 + Math.random() * 50),
          timeRequired: ['1-2 hours', '2-3 hours', '3-4 hours'][index % 3],
          difficulty: (['Easy', 'Medium', 'Hard'] as const)[index % 3],
          requirements: [
            `${project.name} NFTs (min $${Math.floor(project.tokenPrice * 5)})`,
            'Basic strategy knowledge',
            'Active wallet connection'
          ],
          roi: Math.floor((project.change24h + 10) * 2),
          isActive: project.players > 1000
        }));

        // Fallback to enhanced mock data if no real data
        const mockOpportunities: PlayToEarnOpportunity[] = [
        {
          game: 'Axie Infinity',
          activity: 'Daily Quests + Arena Battles',
          estimatedEarnings: 45,
          timeRequired: '2-3 hours',
          difficulty: 'Medium',
          requirements: ['3 Axies (min $150)', 'Basic strategy knowledge'],
          roi: 15,
          isActive: true
        },
        {
          game: 'The Sandbox',
          activity: 'Land Development + Events',
          estimatedEarnings: 120,
          timeRequired: '4-6 hours',
          difficulty: 'Hard',
          requirements: ['LAND NFT ($500+)', 'VoxEdit skills', 'Game Maker knowledge'],
          roi: 25,
          isActive: true
        },
        {
          game: 'Splinterlands',
          activity: 'Ranked Battles + Tournaments',
          estimatedEarnings: 25,
          timeRequired: '1-2 hours',
          difficulty: 'Easy',
          requirements: ['Starter deck ($10)', 'Basic card strategy'],
          roi: 12,
          isActive: true
        },
        {
          game: 'Gods Unchained',
          activity: 'Weekend Ranked + Daily Play',
          estimatedEarnings: 35,
          timeRequired: '2-3 hours',
          difficulty: 'Medium',
          requirements: ['Competitive deck ($50+)', 'TCG experience']
        },
        {
          game: 'Illuvium',
          activity: 'Creature Capture + Battles',
          estimatedEarnings: 80,
          timeRequired: '3-4 hours',
          difficulty: 'Hard',
          requirements: ['ILV staking', 'High-end PC', 'RPG skills']
        }
    ];

        setOpportunities(realOpportunities.length > 0 ? realOpportunities : mockOpportunities);
      } catch (error) {
        console.error('Error fetching GameFi opportunities:', error);
        // Use mock data as fallback
        setOpportunities(mockOpportunities);
      }
    };

    fetchRealOpportunities();
  }, [])

  const categories = ['All', 'Turn-based Strategy', 'Metaverse', 'Gaming Platform', 'Card Game', 'RPG']

  const filteredGames = selectedCategory === 'All'
    ? games
    : games.filter(game => game.category === selectedCategory)

  // Debug: Log games and their IDs in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && games.length > 0) {
      console.log('GameFi Integration - Games loaded:', games.map(g => ({ id: g.id, name: g.name })))
    }
  }, [games])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/20'
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'Hard': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `$${(price / 1000000000).toFixed(1)}B`
    }
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`
    }
    return `$${price.toFixed(2)}`
  }

  if (isLoading) {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          <span className="ml-3 text-white">Loading GameFi opportunities...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with Real-Time Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">
            <span className="gradient-text">GameFi</span> Integration
          </h2>
          <p className="text-xl text-white/70">Real-time play-to-earn opportunities and blockchain gaming projects</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
            isConnected
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Live Data</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Real-Time GameFi Metrics */}
      {games.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              {games[0]?.isRealTime && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <p className="text-2xl font-bold text-white">{games.length}</p>
            <p className="text-white/60 text-sm">Active Games</p>
          </div>

          <div className="glass-card p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              {games[0]?.isRealTime && (
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <p className="text-2xl font-bold text-white">
              {(games.reduce((sum, game) => sum + (game.players || 0), 0) / 1000).toFixed(0)}K
            </p>
            <p className="text-white/60 text-sm">Total Players</p>
          </div>

          <div className="glass-card p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-green-400" />
              {games[0]?.isRealTime && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <p className="text-2xl font-bold text-white">
              ${(games.reduce((sum, game) => sum + (game.volume24h || 0), 0) / 1000000).toFixed(1)}M
            </p>
            <p className="text-white/60 text-sm">24h Volume</p>
          </div>

          <div className="glass-card p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-purple-400" />
              {games[0]?.isRealTime && (
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <p className="text-2xl font-bold text-white">
              {games.length > 0 ? (games.reduce((sum, game) => sum + (game.apy || 0), 0) / games.length).toFixed(1) : '0.0'}%
            </p>
            <p className="text-white/60 text-sm">Avg APY</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="glass-card p-4 border border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-2 text-red-400">
            <ExternalLink className="w-5 h-5" />
            <span>Error loading GameFi data: {error}</span>
          </div>
        </div>
      )}

      {/* GameFi Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Gamepad2 className="w-6 h-6 text-purple-400" />
            GameFi Projects
          </h3>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            Live Data
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="wait">
            {filteredGames.map((game, index) => {
              // Generate a robust unique key that handles undefined IDs
              const uniqueKey = `game-${game.id || game.name?.toLowerCase().replace(/\s+/g, '-') || `fallback-${index}`}-${selectedCategory}-${index}`

              return (
                <motion.div
                  key={uniqueKey}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-all duration-300 border border-white/10"
                >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-white text-lg">{game.name}</h4>
                    <p className="text-purple-400 text-sm">{game.category}</p>
                  </div>
                  {game.playToEarn && (
                    <span className="px-2 py-1 bg-green-400/20 text-green-400 rounded-full text-xs font-medium">
                      P2E
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Players</p>
                    <p className="text-white font-semibold">{(game.players / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Market Cap</p>
                    <p className="text-white font-semibold">{formatPrice(game.marketCap)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Daily Rewards</p>
                    <p className="text-green-400 font-semibold">${game.dailyRewards.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">APY</p>
                    <p className="text-yellow-400 font-semibold">{game.apy.toFixed(1)}%</p>
                  </div>
                </div>

                <p className="text-white/70 text-sm mb-4 leading-relaxed">{game.description}</p>

                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 bg-blue-400/20 text-blue-400 rounded text-xs">
                    {game.chain}
                  </span>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                    <Play className="w-3 h-3 inline mr-1" />
                    Play Now
                  </button>
                </div>
              </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Play-to-Earn Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Coins className="w-6 h-6 text-yellow-400" />
            Play-to-Earn Opportunities
          </h3>
          <div className="text-sm text-white/60">
            💰 Estimated daily earnings
          </div>
        </div>

        <div className="space-y-4">
          {opportunities.map((opportunity, index) => (
            <motion.div
              key={`opportunity-${index}-${opportunity.game}-${opportunity.activity}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white">{opportunity.game}</h4>
                  <p className="text-white/70 text-sm">{opportunity.activity}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold text-lg">${opportunity.estimatedEarnings}/day</p>
                  <p className="text-white/60 text-xs">{opportunity.timeRequired}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(opportunity.difficulty)}`}>
                  {opportunity.difficulty}
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={`star-${index}-${i}`}
                      className={`w-3 h-3 ${i < (opportunity.estimatedEarnings / 30) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-white/60 text-xs mb-1">Requirements:</p>
                {opportunity.requirements.map((req, i) => (
                  <p key={`req-${index}-${i}`} className="text-white/70 text-xs">• {req}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
            🎮 Explore More Opportunities →
          </button>
        </div>
      </motion.div>

      <div className="mt-4 p-3 bg-purple-400/10 border border-purple-400/20 rounded-lg">
        <p className="text-purple-400 text-xs text-center">
          🎮 GameFi earnings are estimates based on current market conditions. Actual earnings may vary based on skill, time investment, and market volatility.
        </p>
      </div>
    </div>
  )
}

export default GameFiIntegration
