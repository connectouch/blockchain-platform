import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
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
import { ApiService } from '@services/api'
import LoadingSpinner from '@components/LoadingSpinner'

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

const DAOPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'governance' | 'treasury' | 'proposals'>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'marketCap' | 'members' | 'treasury' | 'proposals'>('marketCap')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedDAO, setSelectedDAO] = useState<DAOProject | null>(null)
  const [showProposalModal, setShowProposalModal] = useState(false)

  // Mock DAO data - in production this would come from APIs
  const [daoProjects, setDaoProjects] = useState<DAOProject[]>([
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

  const [governanceStats, setGovernanceStats] = useState<GovernanceStats>({
    totalDAOs: daoProjects.length,
    totalTreasury: daoProjects.reduce((sum, dao) => sum + dao.treasuryValue, 0),
    totalMembers: daoProjects.reduce((sum, dao) => sum + dao.members, 0),
    activeProposals: daoProjects.reduce((sum, dao) => sum + dao.activeProposals, 0),
    totalProposals: daoProjects.reduce((sum, dao) => sum + dao.proposals, 0),
    avgParticipation: daoProjects.reduce((sum, dao) => sum + dao.metrics.participationRate, 0) / daoProjects.length
  })

  // Fetch DAO projects data (keeping original for API integration)
  const { data: daoData, isLoading, error } = useQuery({
    queryKey: ['dao', 'projects'],
    queryFn: ApiService.getDAOProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
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

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">DAO Governance</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Participate in decentralized governance and community decisions
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="glass-card p-8 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-red-400 mb-4">Error Loading DAO Data</h3>
              <p className="text-white/70">Unable to fetch DAO data. Please try again later.</p>
            </div>
          </div>
        )}

        {/* DAO Projects Grid */}
        {!isLoading && !error && daos.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {daos.map((dao: any, index: number) => (
                <motion.div
                  key={dao.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-card p-6 hover:scale-105 transition-transform duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{dao.name}</h3>
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm">
                      {dao.category}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Treasury Value</span>
                      <span className="text-green-400 font-semibold">
                        ${(dao.treasuryValue / 1e9).toFixed(1)}B
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">Members</span>
                      <span className="text-white font-semibold">
                        {dao.members ? (dao.members / 1000).toFixed(0) : '0'}K
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">Proposals</span>
                      <span className="text-blue-400 font-semibold">
                        {dao.proposals || 0}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">Token Price</span>
                      <span className="text-purple-400 font-semibold">
                        ${dao.tokenPrice?.toLocaleString() || '0'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">Market Cap</span>
                      <span className="text-yellow-400 font-semibold">
                        ${dao.marketCap ? (dao.marketCap / 1e9).toFixed(1) : '0'}B
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm">Governance</span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                        {dao.governance}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">{dao.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* DAO Analytics Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="glass-card p-6 text-center">
                  <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Total Treasury</h3>
                  <p className="text-3xl font-bold text-green-400">
                    ${(daos.reduce((sum: number, d: any) => sum + (d.treasuryValue || 0), 0) / 1e9).toFixed(1)}B
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Total Members</h3>
                  <p className="text-3xl font-bold text-blue-400">
                    {(daos.reduce((sum: number, d: any) => sum + (d.members || 0), 0) / 1000).toFixed(0)}K
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <Vote className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Total Proposals</h3>
                  <p className="text-3xl font-bold text-purple-400">
                    {daos.reduce((sum: number, d: any) => sum + (d.proposals || 0), 0)}
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <Activity className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Active DAOs</h3>
                  <p className="text-3xl font-bold text-yellow-400">{daos.length}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

export default DAOPage
