import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building, 
  Users, 
  DollarSign, 
  Vote, 
  Activity, 
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Target,
  Shield,
  Zap,
  Globe,
  MessageSquare,
  FileText,
  Settings,
  Plus,
  Minus,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bell,
  Star,
  Award,
  Coins,
  Lock,
  Unlock,
  Timer,
  Percent,
  Hash,
  Link2,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'

interface DAOProject {
  id: string
  name: string
  symbol: string
  description: string
  category: 'DeFi' | 'Gaming' | 'Social' | 'Infrastructure' | 'Investment' | 'Protocol'
  treasuryValue: number
  members: number
  proposals: number
  activeProposals: number
  votingPower: number
  tokenPrice: number
  marketCap: number
  volume24h: number
  change24h: number
  logo: string
  website: string
  governance: {
    votingToken: string
    quorum: number
    votingPeriod: string
    executionDelay: string
  }
  metrics: {
    participationRate: number
    avgVotingPower: number
    treasuryGrowth: number
    proposalSuccessRate: number
  }
  recentProposals: Proposal[]
}

interface Proposal {
  id: string
  title: string
  description: string
  type: 'Treasury' | 'Protocol' | 'Governance' | 'Partnership' | 'Technical'
  status: 'Active' | 'Passed' | 'Failed' | 'Executed' | 'Queued'
  votesFor: number
  votesAgainst: number
  totalVotes: number
  quorum: number
  endTime: Date
  proposer: string
  executionTime?: Date
}

interface GovernanceStats {
  totalDAOs: number
  totalTreasury: number
  totalMembers: number
  activeProposals: number
  totalProposals: number
  avgParticipation: number
}

const EnhancedDAOPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'governance' | 'treasury' | 'proposals'>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'marketCap' | 'members' | 'treasury' | 'proposals'>('marketCap')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedDAO, setSelectedDAO] = useState<DAOProject | null>(null)

  // Mock DAO data - in production this would come from APIs
  const [daoProjects] = useState<DAOProject[]>([
    {
      id: 'uniswap',
      name: 'Uniswap',
      symbol: 'UNI',
      description: 'Leading decentralized exchange protocol with community governance',
      category: 'DeFi',
      treasuryValue: 2800000000,
      members: 280000,
      proposals: 45,
      activeProposals: 3,
      votingPower: 1000000000,
      tokenPrice: 6.45,
      marketCap: 4850000000,
      volume24h: 125000000,
      change24h: 2.3,
      logo: '🦄',
      website: 'https://uniswap.org',
      governance: {
        votingToken: 'UNI',
        quorum: 40000000,
        votingPeriod: '7 days',
        executionDelay: '2 days'
      },
      metrics: {
        participationRate: 12.5,
        avgVotingPower: 25000,
        treasuryGrowth: 15.2,
        proposalSuccessRate: 78
      },
      recentProposals: [
        {
          id: 'uni-1',
          title: 'Deploy Uniswap V4 on Polygon',
          description: 'Proposal to deploy Uniswap V4 on Polygon network to reduce gas costs',
          type: 'Protocol',
          status: 'Active',
          votesFor: 35000000,
          votesAgainst: 5000000,
          totalVotes: 40000000,
          quorum: 40000000,
          endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          proposer: '0x1234...5678'
        }
      ]
    },
    {
      id: 'compound',
      name: 'Compound',
      symbol: 'COMP',
      description: 'Algorithmic money market protocol with decentralized governance',
      category: 'DeFi',
      treasuryValue: 850000000,
      members: 95000,
      proposals: 78,
      activeProposals: 2,
      votingPower: 10000000,
      tokenPrice: 45.20,
      marketCap: 452000000,
      volume24h: 25000000,
      change24h: -1.8,
      logo: '🏛️',
      website: 'https://compound.finance',
      governance: {
        votingToken: 'COMP',
        quorum: 400000,
        votingPeriod: '3 days',
        executionDelay: '2 days'
      },
      metrics: {
        participationRate: 8.7,
        avgVotingPower: 12000,
        treasuryGrowth: 8.5,
        proposalSuccessRate: 85
      },
      recentProposals: []
    },
    {
      id: 'aave',
      name: 'Aave',
      symbol: 'AAVE',
      description: 'Decentralized lending protocol with community-driven governance',
      category: 'DeFi',
      treasuryValue: 1200000000,
      members: 150000,
      proposals: 62,
      activeProposals: 4,
      votingPower: 16000000,
      tokenPrice: 85.30,
      marketCap: 1365000000,
      volume24h: 45000000,
      change24h: 4.2,
      logo: '👻',
      website: 'https://aave.com',
      governance: {
        votingToken: 'AAVE',
        quorum: 320000,
        votingPeriod: '5 days',
        executionDelay: '1 day'
      },
      metrics: {
        participationRate: 15.3,
        avgVotingPower: 18000,
        treasuryGrowth: 22.1,
        proposalSuccessRate: 82
      },
      recentProposals: []
    },
    {
      id: 'makerdao',
      name: 'MakerDAO',
      symbol: 'MKR',
      description: 'Decentralized credit platform that issues DAI stablecoin',
      category: 'DeFi',
      treasuryValue: 3200000000,
      members: 45000,
      proposals: 156,
      activeProposals: 5,
      votingPower: 977000,
      tokenPrice: 1250.00,
      marketCap: 1220000000,
      volume24h: 15000000,
      change24h: 1.5,
      logo: '🏦',
      website: 'https://makerdao.com',
      governance: {
        votingToken: 'MKR',
        quorum: 50000,
        votingPeriod: '7 days',
        executionDelay: '24 hours'
      },
      metrics: {
        participationRate: 25.8,
        avgVotingPower: 35000,
        treasuryGrowth: 18.7,
        proposalSuccessRate: 91
      },
      recentProposals: []
    },
    {
      id: 'ens',
      name: 'Ethereum Name Service',
      symbol: 'ENS',
      description: 'Decentralized naming service for Ethereum addresses and resources',
      category: 'Infrastructure',
      treasuryValue: 450000000,
      members: 125000,
      proposals: 28,
      activeProposals: 2,
      votingPower: 25000000,
      tokenPrice: 12.80,
      marketCap: 320000000,
      volume24h: 8000000,
      change24h: 3.7,
      logo: '🌐',
      website: 'https://ens.domains',
      governance: {
        votingToken: 'ENS',
        quorum: 1000000,
        votingPeriod: '7 days',
        executionDelay: '2 days'
      },
      metrics: {
        participationRate: 18.2,
        avgVotingPower: 15000,
        treasuryGrowth: 12.3,
        proposalSuccessRate: 75
      },
      recentProposals: []
    },
    {
      id: 'gitcoin',
      name: 'Gitcoin',
      symbol: 'GTC',
      description: 'Community of builders creating tools for Web3 public goods funding',
      category: 'Social',
      treasuryValue: 180000000,
      members: 85000,
      proposals: 34,
      activeProposals: 3,
      votingPower: 100000000,
      tokenPrice: 1.85,
      marketCap: 185000000,
      volume24h: 5000000,
      change24h: -2.1,
      logo: '🌱',
      website: 'https://gitcoin.co',
      governance: {
        votingToken: 'GTC',
        quorum: 2500000,
        votingPeriod: '5 days',
        executionDelay: '2 days'
      },
      metrics: {
        participationRate: 22.1,
        avgVotingPower: 8500,
        treasuryGrowth: 9.8,
        proposalSuccessRate: 88
      },
      recentProposals: []
    }
  ])

  const [governanceStats] = useState<GovernanceStats>({
    totalDAOs: daoProjects.length,
    totalTreasury: daoProjects.reduce((sum, dao) => sum + dao.treasuryValue, 0),
    totalMembers: daoProjects.reduce((sum, dao) => sum + dao.members, 0),
    activeProposals: daoProjects.reduce((sum, dao) => sum + dao.activeProposals, 0),
    totalProposals: daoProjects.reduce((sum, dao) => sum + dao.proposals, 0),
    avgParticipation: daoProjects.reduce((sum, dao) => sum + dao.metrics.participationRate, 0) / daoProjects.length
  })

  // Filter and sort DAOs
  const filteredDAOs = daoProjects
    .filter(dao => {
      const matchesCategory = selectedCategory === 'all' || dao.category === selectedCategory
      const matchesSearch = dao.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dao.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  // Format number
  const formatNumber = (value: number): string => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
    return value.toLocaleString()
  }

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Active': return 'text-blue-400 bg-blue-400/20'
      case 'Passed': return 'text-green-400 bg-green-400/20'
      case 'Failed': return 'text-red-400 bg-red-400/20'
      case 'Executed': return 'text-purple-400 bg-purple-400/20'
      case 'Queued': return 'text-yellow-400 bg-yellow-400/20'
      default: return 'text-white/60 bg-white/10'
    }
  }

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">DAO Governance Hub</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Participate in decentralized governance, vote on proposals, and shape the future of Web3 protocols
          </p>
        </motion.div>

        {/* Governance Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8"
        >
          <div className="glass-card p-6 text-center">
            <Building className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{governanceStats.totalDAOs}</div>
            <div className="text-white/60 text-sm">Active DAOs</div>
          </div>
          <div className="glass-card p-6 text-center">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{formatCurrency(governanceStats.totalTreasury)}</div>
            <div className="text-white/60 text-sm">Total Treasury</div>
          </div>
          <div className="glass-card p-6 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{formatNumber(governanceStats.totalMembers)}</div>
            <div className="text-white/60 text-sm">Total Members</div>
          </div>
          <div className="glass-card p-6 text-center">
            <Vote className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{governanceStats.activeProposals}</div>
            <div className="text-white/60 text-sm">Active Proposals</div>
          </div>
          <div className="glass-card p-6 text-center">
            <FileText className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{governanceStats.totalProposals}</div>
            <div className="text-white/60 text-sm">Total Proposals</div>
          </div>
          <div className="glass-card p-6 text-center">
            <BarChart3 className="w-8 h-8 text-pink-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{governanceStats.avgParticipation.toFixed(1)}%</div>
            <div className="text-white/60 text-sm">Avg Participation</div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search DAOs..."
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
            <option value="DeFi" className="bg-gray-800">DeFi</option>
            <option value="Gaming" className="bg-gray-800">Gaming</option>
            <option value="Social" className="bg-gray-800">Social</option>
            <option value="Infrastructure" className="bg-gray-800">Infrastructure</option>
            <option value="Investment" className="bg-gray-800">Investment</option>
            <option value="Protocol" className="bg-gray-800">Protocol</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            <option value="marketCap" className="bg-gray-800">Market Cap</option>
            <option value="members" className="bg-gray-800">Members</option>
            <option value="treasury" className="bg-gray-800">Treasury</option>
            <option value="proposals" className="bg-gray-800">Proposals</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
          >
            {sortOrder === 'desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
          </button>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'governance', label: 'Governance', icon: <Vote className="w-4 h-4" /> },
              { id: 'treasury', label: 'Treasury', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'proposals', label: 'Proposals', icon: <FileText className="w-4 h-4" /> }
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
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* DAO Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDAOs.map((dao, index) => (
                    <motion.div
                      key={dao.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="glass-card p-6 hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => setSelectedDAO(dao)}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
                          {dao.logo}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{dao.name}</h3>
                          <p className="text-white/60">{dao.category}</p>
                        </div>
                        <div className="ml-auto">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            dao.change24h >= 0 ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20'
                          }`}>
                            {dao.change24h >= 0 ? '+' : ''}{dao.change24h.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <p className="text-white/70 mb-6 line-clamp-2">{dao.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className="text-white/60 text-sm">Market Cap</p>
                          <p className="text-white font-bold">{formatCurrency(dao.marketCap)}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Treasury</p>
                          <p className="text-white font-bold">{formatCurrency(dao.treasuryValue)}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Members</p>
                          <p className="text-white font-bold">{formatNumber(dao.members)}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Proposals</p>
                          <p className="text-white font-bold">{dao.proposals}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                          View Details
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'governance' && (
              <div className="space-y-8">
                {/* Governance Overview */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Governance Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Vote className="w-8 h-8 text-blue-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Voting Power</h4>
                      <p className="text-white/60 text-sm mb-4">Your total voting power across all DAOs</p>
                      <div className="text-2xl font-bold text-blue-400">2.5M</div>
                      <div className="text-white/60 text-sm">Tokens</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Votes Cast</h4>
                      <p className="text-white/60 text-sm mb-4">Total votes you've participated in</p>
                      <div className="text-2xl font-bold text-green-400">47</div>
                      <div className="text-white/60 text-sm">Proposals</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8 text-purple-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Participation Rate</h4>
                      <p className="text-white/60 text-sm mb-4">Your governance participation rate</p>
                      <div className="text-2xl font-bold text-purple-400">78%</div>
                      <div className="text-white/60 text-sm">Active</div>
                    </div>
                  </div>
                </div>

                {/* Active Proposals */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Active Proposals</h3>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors">
                      <Plus className="w-4 h-4" />
                      Create Proposal
                    </button>
                  </div>

                  <div className="space-y-4">
                    {daoProjects
                      .filter(dao => dao.recentProposals.length > 0)
                      .map(dao =>
                        dao.recentProposals.map(proposal => (
                          <div key={proposal.id} className="p-4 bg-white/5 rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-2xl">{dao.logo}</span>
                                  <div>
                                    <h4 className="text-white font-medium">{proposal.title}</h4>
                                    <p className="text-white/60 text-sm">{dao.name} • {proposal.type}</p>
                                  </div>
                                </div>
                                <p className="text-white/70 text-sm mb-3">{proposal.description}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                                {proposal.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <span className="text-white/60 text-sm">Votes For:</span>
                                <div className="text-green-400 font-medium">{formatNumber(proposal.votesFor)}</div>
                              </div>
                              <div>
                                <span className="text-white/60 text-sm">Votes Against:</span>
                                <div className="text-red-400 font-medium">{formatNumber(proposal.votesAgainst)}</div>
                              </div>
                              <div>
                                <span className="text-white/60 text-sm">Quorum:</span>
                                <div className="text-white font-medium">{formatNumber(proposal.quorum)}</div>
                              </div>
                              <div>
                                <span className="text-white/60 text-sm">Ends:</span>
                                <div className="text-white font-medium">
                                  {Math.ceil((proposal.endTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors">
                                <ThumbsUp className="w-4 h-4" />
                                Vote For
                              </button>
                              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors">
                                <ThumbsDown className="w-4 h-4" />
                                Vote Against
                              </button>
                              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'treasury' && (
              <div className="space-y-8">
                {/* Treasury Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card p-6 text-center">
                    <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Total Treasury Value</h3>
                    <p className="text-3xl font-bold text-green-400">{formatCurrency(governanceStats.totalTreasury)}</p>
                    <p className="text-green-400 text-sm mt-2">+12.5% this month</p>
                  </div>
                  <div className="glass-card p-6 text-center">
                    <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Average Growth</h3>
                    <p className="text-3xl font-bold text-blue-400">15.2%</p>
                    <p className="text-blue-400 text-sm mt-2">Annual growth rate</p>
                  </div>
                  <div className="glass-card p-6 text-center">
                    <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Diversification</h3>
                    <p className="text-3xl font-bold text-purple-400">8.5</p>
                    <p className="text-purple-400 text-sm mt-2">Asset diversity score</p>
                  </div>
                </div>

                {/* Treasury Breakdown */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Treasury Breakdown by DAO</h3>
                  <div className="space-y-4">
                    {daoProjects
                      .sort((a, b) => b.treasuryValue - a.treasuryValue)
                      .map((dao, index) => (
                        <div key={dao.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">{dao.logo}</span>
                            <div>
                              <h4 className="text-white font-medium">{dao.name}</h4>
                              <p className="text-white/60 text-sm">{dao.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold">{formatCurrency(dao.treasuryValue)}</div>
                            <div className="text-green-400 text-sm">+{dao.metrics.treasuryGrowth.toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'proposals' && (
              <div className="space-y-8">
                {/* Proposal Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="glass-card p-6 text-center">
                    <FileText className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-white">{governanceStats.totalProposals}</div>
                    <div className="text-white/60 text-sm">Total Proposals</div>
                  </div>
                  <div className="glass-card p-6 text-center">
                    <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-white">{governanceStats.activeProposals}</div>
                    <div className="text-white/60 text-sm">Active Proposals</div>
                  </div>
                  <div className="glass-card p-6 text-center">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-white">82%</div>
                    <div className="text-white/60 text-sm">Success Rate</div>
                  </div>
                  <div className="glass-card p-6 text-center">
                    <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-white">{governanceStats.avgParticipation.toFixed(1)}%</div>
                    <div className="text-white/60 text-sm">Avg Participation</div>
                  </div>
                </div>

                {/* Recent Proposals */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Recent Proposals</h3>
                  <div className="space-y-4">
                    {/* Mock recent proposals */}
                    {[
                      {
                        dao: 'Uniswap',
                        logo: '🦄',
                        title: 'Deploy Uniswap V4 on Polygon',
                        type: 'Protocol',
                        status: 'Active',
                        endDate: '3 days',
                        participation: 65
                      },
                      {
                        dao: 'Aave',
                        logo: '👻',
                        title: 'Add MATIC as Collateral',
                        type: 'Treasury',
                        status: 'Passed',
                        endDate: 'Ended',
                        participation: 78
                      },
                      {
                        dao: 'MakerDAO',
                        logo: '🏦',
                        title: 'Increase DAI Stability Fee',
                        type: 'Governance',
                        status: 'Active',
                        endDate: '5 days',
                        participation: 45
                      }
                    ].map((proposal, index) => (
                      <div key={index} className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{proposal.logo}</span>
                            <div>
                              <h4 className="text-white font-medium">{proposal.title}</h4>
                              <p className="text-white/60 text-sm">{proposal.dao} • {proposal.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                              {proposal.status}
                            </span>
                            <span className="text-white/60 text-sm">{proposal.endDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-white/60 text-sm">
                            Participation: {proposal.participation}%
                          </div>
                          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors">
                            View Proposal
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default EnhancedDAOPage
