import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy,
  Crown,
  Star,
  Award,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Clock,
  Zap,
  Medal,
  Flame,
  Shield,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

interface Player {
  id: string
  username: string
  avatar?: string
  rank: number
  previousRank?: number
  score: number
  earnings: number
  winRate: number
  gamesPlayed: number
  level: number
  guild?: string
  achievements: Achievement[]
  streak: number
  lastActive: string
  country?: string
  verified: boolean
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt: string
}

interface LeaderboardCategory {
  id: string
  name: string
  description: string
  game: string
  metric: 'earnings' | 'winRate' | 'score' | 'level' | 'streak'
  timeframe: 'daily' | 'weekly' | 'monthly' | 'allTime'
  players: Player[]
  totalPlayers: number
  lastUpdated: string
}

interface GamingLeaderboardsProps {
  selectedGame?: string
  games: string[]
}

const GamingLeaderboards: React.FC<GamingLeaderboardsProps> = ({ 
  selectedGame,
  games = []
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('earnings')
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('weekly')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>(selectedGame || 'all')
  const [leaderboards, setLeaderboards] = useState<LeaderboardCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Generate mock leaderboard data
  useEffect(() => {
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const mockPlayers: Player[] = [
        {
          id: 'player1',
          username: 'CryptoKing',
          rank: 1,
          previousRank: 2,
          score: 98500,
          earnings: 15420,
          winRate: 87.5,
          gamesPlayed: 1250,
          level: 95,
          guild: 'Elite Warriors',
          achievements: [
            {
              id: 'top-earner',
              name: 'Top Earner',
              description: 'Earned over $10,000 in a month',
              icon: '💰',
              rarity: 'legendary',
              unlockedAt: '2024-01-10'
            }
          ],
          streak: 15,
          lastActive: '2024-01-15T12:00:00Z',
          country: 'US',
          verified: true
        },
        {
          id: 'player2',
          username: 'AxieMaster',
          rank: 2,
          previousRank: 1,
          score: 96200,
          earnings: 14850,
          winRate: 85.2,
          gamesPlayed: 1180,
          level: 92,
          guild: 'Axie Legends',
          achievements: [
            {
              id: 'win-streak',
              name: 'Win Streak Champion',
              description: 'Won 20 games in a row',
              icon: '🔥',
              rarity: 'epic',
              unlockedAt: '2024-01-08'
            }
          ],
          streak: 8,
          lastActive: '2024-01-15T11:30:00Z',
          country: 'PH',
          verified: true
        },
        {
          id: 'player3',
          username: 'MetaversePro',
          rank: 3,
          previousRank: 4,
          score: 94800,
          earnings: 13200,
          winRate: 82.8,
          gamesPlayed: 980,
          level: 88,
          guild: 'Sandbox Builders',
          achievements: [
            {
              id: 'builder',
              name: 'Master Builder',
              description: 'Created 50+ game assets',
              icon: '🏗️',
              rarity: 'rare',
              unlockedAt: '2024-01-05'
            }
          ],
          streak: 12,
          lastActive: '2024-01-15T10:15:00Z',
          country: 'CA',
          verified: false
        }
      ]

      const mockLeaderboards: LeaderboardCategory[] = [
        {
          id: 'earnings',
          name: 'Top Earners',
          description: 'Players with highest earnings',
          game: selectedGameFilter === 'all' ? 'All Games' : selectedGameFilter,
          metric: 'earnings',
          timeframe,
          players: mockPlayers.sort((a, b) => b.earnings - a.earnings),
          totalPlayers: 15420,
          lastUpdated: '2024-01-15T12:00:00Z'
        },
        {
          id: 'winRate',
          name: 'Win Rate Champions',
          description: 'Players with highest win rates',
          game: selectedGameFilter === 'all' ? 'All Games' : selectedGameFilter,
          metric: 'winRate',
          timeframe,
          players: mockPlayers.sort((a, b) => b.winRate - a.winRate),
          totalPlayers: 15420,
          lastUpdated: '2024-01-15T12:00:00Z'
        },
        {
          id: 'level',
          name: 'Level Leaders',
          description: 'Highest level players',
          game: selectedGameFilter === 'all' ? 'All Games' : selectedGameFilter,
          metric: 'level',
          timeframe,
          players: mockPlayers.sort((a, b) => b.level - a.level),
          totalPlayers: 15420,
          lastUpdated: '2024-01-15T12:00:00Z'
        },
        {
          id: 'streak',
          name: 'Streak Masters',
          description: 'Longest winning streaks',
          game: selectedGameFilter === 'all' ? 'All Games' : selectedGameFilter,
          metric: 'streak',
          timeframe,
          players: mockPlayers.sort((a, b) => b.streak - a.streak),
          totalPlayers: 15420,
          lastUpdated: '2024-01-15T12:00:00Z'
        }
      ]

      setLeaderboards(mockLeaderboards)
      setIsLoading(false)
    }, 1000)
  }, [selectedGameFilter, timeframe])

  // Get current leaderboard
  const currentLeaderboard = leaderboards.find(lb => lb.id === activeCategory)

  // Filter players
  const filteredPlayers = currentLeaderboard?.players.filter(player =>
    player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.guild && player.guild.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  // Get rank change icon
  const getRankChangeIcon = (rank: number, previousRank?: number) => {
    if (!previousRank) return null
    if (rank < previousRank) return <ChevronUp className="w-4 h-4 text-green-400" />
    if (rank > previousRank) return <ChevronDown className="w-4 h-4 text-red-400" />
    return null
  }

  // Get rank change color
  const getRankChangeColor = (rank: number, previousRank?: number) => {
    if (!previousRank) return 'text-white/60'
    if (rank < previousRank) return 'text-green-400'
    if (rank > previousRank) return 'text-red-400'
    return 'text-white/60'
  }

  // Get medal icon for top 3
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />
      case 2: return <Medal className="w-6 h-6 text-gray-300" />
      case 3: return <Award className="w-6 h-6 text-orange-400" />
      default: return <span className="w-6 h-6 flex items-center justify-center text-white/60 font-bold">#{rank}</span>
    }
  }

  // Get achievement rarity color
  const getAchievementColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400'
      case 'epic': return 'text-purple-400'
      case 'rare': return 'text-blue-400'
      case 'common': return 'text-green-400'
      default: return 'text-white/60'
    }
  }

  // Format currency
  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString()}`
  }

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Gaming Leaderboards</h2>
        <p className="text-white/60">Compete with players worldwide and track your progress</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search players or guilds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
          />
        </div>
        
        <div className="flex gap-3">
          <select
            value={selectedGameFilter}
            onChange={(e) => setSelectedGameFilter(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all" className="bg-gray-800">All Games</option>
            {games.map(game => (
              <option key={game} value={game} className="bg-gray-800">{game}</option>
            ))}
          </select>

          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            <option value="daily" className="bg-gray-800">Daily</option>
            <option value="weekly" className="bg-gray-800">Weekly</option>
            <option value="monthly" className="bg-gray-800">Monthly</option>
            <option value="allTime" className="bg-gray-800">All Time</option>
          </select>

          <button
            onClick={() => setIsLoading(true)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'earnings', label: 'Top Earners', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'winRate', label: 'Win Rate', icon: <Trophy className="w-4 h-4" /> },
          { id: 'level', label: 'Level', icon: <Star className="w-4 h-4" /> },
          { id: 'streak', label: 'Streak', icon: <Flame className="w-4 h-4" /> }
        ].map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeCategory === category.id
                ? 'bg-purple-600 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {category.icon}
            {category.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-white/10 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : currentLeaderboard ? (
        <div className="space-y-4">
          {/* Leaderboard Header */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{currentLeaderboard.name}</h3>
                <p className="text-white/60">{currentLeaderboard.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">{currentLeaderboard.totalPlayers.toLocaleString()}</div>
                <div className="text-xs text-white/60">Total Players</div>
              </div>
            </div>
          </div>

          {/* Players List */}
          <div className="space-y-2">
            {filteredPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`glass-card p-6 hover:scale-105 transition-all duration-300 ${
                  player.rank <= 3 ? 'border border-yellow-400/30' : ''
                }`}
              >
                <div className="flex items-center gap-6">
                  {/* Rank */}
                  <div className="flex items-center gap-2">
                    {getMedalIcon(player.rank)}
                    {player.previousRank && (
                      <div className={`flex items-center gap-1 ${getRankChangeColor(player.rank, player.previousRank)}`}>
                        {getRankChangeIcon(player.rank, player.previousRank)}
                        <span className="text-xs">
                          {player.previousRank > player.rank ? `+${player.previousRank - player.rank}` : 
                           player.previousRank < player.rank ? `-${player.rank - player.previousRank}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-bold text-white">{player.username}</h4>
                      {player.verified && (
                        <Shield className="w-4 h-4 text-blue-400" />
                      )}
                      {player.country && (
                        <span className="text-xs text-white/60">{player.country}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>Level {player.level}</span>
                      {player.guild && <span>Guild: {player.guild}</span>}
                      <span>{player.gamesPlayed} games</span>
                      <span>Last active: {formatTimeAgo(player.lastActive)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-white mb-1">
                      {currentLeaderboard.metric === 'earnings' && formatCurrency(player.earnings)}
                      {currentLeaderboard.metric === 'winRate' && `${player.winRate.toFixed(1)}%`}
                      {currentLeaderboard.metric === 'level' && player.level}
                      {currentLeaderboard.metric === 'streak' && `${player.streak} wins`}
                    </div>
                    <div className="text-xs text-white/60">
                      {currentLeaderboard.metric === 'earnings' && 'Total Earnings'}
                      {currentLeaderboard.metric === 'winRate' && 'Win Rate'}
                      {currentLeaderboard.metric === 'level' && 'Player Level'}
                      {currentLeaderboard.metric === 'streak' && 'Win Streak'}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="flex items-center gap-2">
                    {player.achievements.slice(0, 3).map((achievement, i) => (
                      <div
                        key={achievement.id}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          getAchievementColor(achievement.rarity).replace('text-', 'bg-').replace('-400', '-400/20')
                        }`}
                        title={achievement.name}
                      >
                        {achievement.icon}
                      </div>
                    ))}
                    {player.achievements.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60">
                        +{player.achievements.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <button className="text-purple-400 hover:text-purple-300 transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredPlayers.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Players Found</h3>
              <p className="text-white/60">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Leaderboard Data</h3>
          <p className="text-white/60">Leaderboard data is currently unavailable</p>
        </div>
      )}
    </div>
  )
}

export default GamingLeaderboards
