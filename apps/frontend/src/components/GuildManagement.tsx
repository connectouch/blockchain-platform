import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users,
  Crown,
  Shield,
  Star,
  Trophy,
  Plus,
  Search,
  Filter,
  Settings,
  MessageCircle,
  Calendar,
  Target,
  Award,
  Activity,
  TrendingUp,
  DollarSign,
  Clock,
  UserPlus,
  UserMinus,
  Edit,
  ExternalLink,
  ChevronRight
} from 'lucide-react'

interface GuildMember {
  id: string
  username: string
  avatar?: string
  role: 'leader' | 'officer' | 'member' | 'recruit'
  level: number
  contribution: number
  earnings: number
  joinDate: string
  lastActive: string
  games: string[]
  achievements: string[]
  status: 'online' | 'offline' | 'away'
}

interface Guild {
  id: string
  name: string
  description: string
  logo?: string
  game: string
  category: 'competitive' | 'casual' | 'educational' | 'trading'
  members: GuildMember[]
  maxMembers: number
  requirements: {
    minLevel: number
    minEarnings: number
    experience: string[]
  }
  stats: {
    totalEarnings: number
    avgEarnings: number
    winRate: number
    activeMembers: number
  }
  activities: {
    raids: number
    tournaments: number
    training: number
  }
  treasury: {
    balance: number
    monthlyTarget: number
    distribution: 'equal' | 'contribution' | 'performance'
  }
  isPublic: boolean
  createdAt: string
  leader: string
}

interface GuildManagementProps {
  userGuilds?: Guild[]
  isGuildLeader?: boolean
}

const GuildManagement: React.FC<GuildManagementProps> = ({ 
  userGuilds = [],
  isGuildLeader = false 
}) => {
  const [activeTab, setActiveTab] = useState<'my-guilds' | 'discover' | 'create'>('my-guilds')
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Generate mock guild data
  useEffect(() => {
    const mockGuilds: Guild[] = [
      {
        id: 'elite-axie-warriors',
        name: 'Elite Axie Warriors',
        description: 'Top-tier Axie Infinity guild focused on competitive play and maximum earnings',
        game: 'Axie Infinity',
        category: 'competitive',
        members: [
          {
            id: 'leader1',
            username: 'AxieMaster',
            role: 'leader',
            level: 85,
            contribution: 95,
            earnings: 2500,
            joinDate: '2023-01-15',
            lastActive: '2024-01-15T10:30:00Z',
            games: ['Axie Infinity'],
            achievements: ['Top 100 Player', 'Guild Founder'],
            status: 'online'
          },
          {
            id: 'officer1',
            username: 'StrategyPro',
            role: 'officer',
            level: 78,
            contribution: 88,
            earnings: 1800,
            joinDate: '2023-02-01',
            lastActive: '2024-01-15T09:15:00Z',
            games: ['Axie Infinity'],
            achievements: ['Strategy Expert'],
            status: 'online'
          }
        ],
        maxMembers: 50,
        requirements: {
          minLevel: 50,
          minEarnings: 500,
          experience: ['Arena experience', 'Team strategy']
        },
        stats: {
          totalEarnings: 45000,
          avgEarnings: 1500,
          winRate: 78,
          activeMembers: 28
        },
        activities: {
          raids: 15,
          tournaments: 8,
          training: 25
        },
        treasury: {
          balance: 12500,
          monthlyTarget: 15000,
          distribution: 'performance'
        },
        isPublic: true,
        createdAt: '2023-01-15',
        leader: 'AxieMaster'
      },
      {
        id: 'sandbox-builders',
        name: 'Sandbox Builders',
        description: 'Creative guild for The Sandbox focused on land development and events',
        game: 'The Sandbox',
        category: 'educational',
        members: [
          {
            id: 'leader2',
            username: 'VoxelArtist',
            role: 'leader',
            level: 72,
            contribution: 92,
            earnings: 3200,
            joinDate: '2023-03-10',
            lastActive: '2024-01-15T11:45:00Z',
            games: ['The Sandbox'],
            achievements: ['Master Builder', 'Event Organizer'],
            status: 'online'
          }
        ],
        maxMembers: 30,
        requirements: {
          minLevel: 25,
          minEarnings: 200,
          experience: ['VoxEdit', 'Game Maker']
        },
        stats: {
          totalEarnings: 28000,
          avgEarnings: 1200,
          winRate: 65,
          activeMembers: 18
        },
        activities: {
          raids: 5,
          tournaments: 3,
          training: 40
        },
        treasury: {
          balance: 8500,
          monthlyTarget: 10000,
          distribution: 'contribution'
        },
        isPublic: true,
        createdAt: '2023-03-10',
        leader: 'VoxelArtist'
      }
    ]
    setGuilds(mockGuilds)
  }, [])

  // Filter guilds
  const filteredGuilds = guilds.filter(guild => {
    const matchesSearch = guild.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guild.game.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || guild.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'leader': return 'text-yellow-400'
      case 'officer': return 'text-purple-400'
      case 'member': return 'text-blue-400'
      case 'recruit': return 'text-green-400'
      default: return 'text-white/60'
    }
  }

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return <Crown className="w-4 h-4" />
      case 'officer': return <Shield className="w-4 h-4" />
      case 'member': return <Users className="w-4 h-4" />
      case 'recruit': return <Star className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400'
      case 'away': return 'bg-yellow-400'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
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
        <h2 className="text-2xl font-bold text-white mb-2">Guild Management</h2>
        <p className="text-white/60">Join or create gaming communities for collaborative play-to-earn</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { id: 'my-guilds', label: 'My Guilds', icon: <Users className="w-4 h-4" /> },
          { id: 'discover', label: 'Discover Guilds', icon: <Search className="w-4 h-4" /> },
          { id: 'create', label: 'Create Guild', icon: <Plus className="w-4 h-4" /> }
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
          {activeTab === 'my-guilds' && (
            <div className="space-y-6">
              {userGuilds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userGuilds.map((guild, index) => (
                    <motion.div
                      key={guild.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedGuild(guild)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">{guild.name}</h3>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                          {guild.category}
                        </span>
                      </div>

                      <p className="text-white/60 text-sm mb-4 line-clamp-2">{guild.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">{formatCurrency(guild.stats.totalEarnings)}</div>
                          <div className="text-xs text-white/60">Total Earnings</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-400">{guild.members.length}/{guild.maxMembers}</div>
                          <div className="text-xs text-white/60">Members</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/60">{guild.game}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-purple-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Guilds Yet</h3>
                  <p className="text-white/60 mb-6">Join or create a guild to start collaborating with other players</p>
                  <button
                    onClick={() => setActiveTab('discover')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Discover Guilds
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'discover' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search guilds..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                  />
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="all" className="bg-gray-800">All Categories</option>
                  <option value="competitive" className="bg-gray-800">Competitive</option>
                  <option value="casual" className="bg-gray-800">Casual</option>
                  <option value="educational" className="bg-gray-800">Educational</option>
                  <option value="trading" className="bg-gray-800">Trading</option>
                </select>
              </div>

              {/* Guilds Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGuilds.map((guild, index) => (
                  <motion.div
                    key={guild.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="glass-card p-6 hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">{guild.name}</h3>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                        {guild.category}
                      </span>
                    </div>

                    <p className="text-white/60 text-sm mb-4 line-clamp-2">{guild.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-white/60">Game:</span>
                        <span className="text-white">{guild.game}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Members:</span>
                        <span className="text-white">{guild.members.length}/{guild.maxMembers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Avg Earnings:</span>
                        <span className="text-green-400">{formatCurrency(guild.stats.avgEarnings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Win Rate:</span>
                        <span className="text-blue-400">{guild.stats.winRate}%</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <h4 className="text-white font-medium text-sm">Requirements:</h4>
                      <div className="text-xs text-white/60">
                        <div>Min Level: {guild.requirements.minLevel}</div>
                        <div>Min Earnings: {formatCurrency(guild.requirements.minEarnings)}</div>
                      </div>
                    </div>

                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                      Request to Join
                    </button>
                  </motion.div>
                ))}
              </div>

              {filteredGuilds.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Guilds Found</h3>
                  <p className="text-white/60">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto">
              <div className="glass-card p-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Create New Guild</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Guild Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter guild name..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe your guild's purpose and goals..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Primary Game
                      </label>
                      <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400">
                        <option value="" className="bg-gray-800">Select game...</option>
                        <option value="axie-infinity" className="bg-gray-800">Axie Infinity</option>
                        <option value="the-sandbox" className="bg-gray-800">The Sandbox</option>
                        <option value="splinterlands" className="bg-gray-800">Splinterlands</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Category
                      </label>
                      <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400">
                        <option value="competitive" className="bg-gray-800">Competitive</option>
                        <option value="casual" className="bg-gray-800">Casual</option>
                        <option value="educational" className="bg-gray-800">Educational</option>
                        <option value="trading" className="bg-gray-800">Trading</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Max Members
                      </label>
                      <input
                        type="number"
                        placeholder="50"
                        min="5"
                        max="100"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Min Level
                      </label>
                      <input
                        type="number"
                        placeholder="1"
                        min="1"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Min Earnings ($)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="public-guild"
                      className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="public-guild" className="text-white/80 text-sm">
                      Make guild public (visible in discovery)
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                      Create Guild
                    </button>
                    <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default GuildManagement
