import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Activity,
  DollarSign,
  Users,
  BarChart3,
  Shield,
  Server,
  Database,
  Cloud,
  Network,
  Layers,
  Globe,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react'

interface InfrastructureProject {
  id: string
  name: string
  symbol: string
  description: string
  category: 'Layer1' | 'Layer2' | 'Sidechain' | 'Interoperability' | 'Storage' | 'Oracle' | 'Privacy' | 'Scaling'
  type: 'Blockchain' | 'Protocol' | 'Network' | 'Platform' | 'Service'
  marketCap: number
  price: number
  change24h: number
  volume24h: number
  tvl: number
  tps: number
  blockTime: number
  validators: number
  nodes: number
  transactions24h: number
  activeAddresses: number
  developerActivity: number
  githubStars: number
  logo: string
  website: string
  consensus: string
  programmingLanguage: string[]
  features: string[]
  partnerships: string[]
  ecosystem: {
    dapps: number
    defi: number
    nft: number
    gaming: number
  }
  metrics: {
    uptime: number
    security: number
    decentralization: number
    scalability: number
    sustainability: number
  }
  roadmap: RoadmapItem[]
}

interface RoadmapItem {
  id: string
  title: string
  description: string
  status: 'Completed' | 'In Progress' | 'Planned' | 'Research'
  quarter: string
  year: number
  priority: 'High' | 'Medium' | 'Low'
}

interface InfrastructureStats {
  totalProjects: number
  totalMarketCap: number
  totalTVL: number
  totalTransactions: number
  avgTPS: number
  totalValidators: number
  totalNodes: number
  avgUptime: number
}

const EnhancedInfrastructurePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'layer1' | 'layer2' | 'scaling' | 'interop'>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'marketCap' | 'tvl' | 'tps' | 'validators'>('marketCap')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedProject, setSelectedProject] = useState<InfrastructureProject | null>(null)

  // Mock infrastructure data - in production this would come from APIs
  const [infrastructureProjects] = useState<InfrastructureProject[]>([
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      description: 'Decentralized platform for smart contracts and DApps',
      category: 'Layer1',
      type: 'Blockchain',
      marketCap: 240000000000,
      price: 2000.00,
      change24h: 2.5,
      volume24h: 8500000000,
      tvl: 28000000000,
      tps: 15,
      blockTime: 12,
      validators: 900000,
      nodes: 8500,
      transactions24h: 1200000,
      activeAddresses: 650000,
      developerActivity: 95,
      githubStars: 45000,
      logo: '⟠',
      website: 'https://ethereum.org',
      consensus: 'Proof of Stake',
      programmingLanguage: ['Solidity', 'Vyper', 'JavaScript'],
      features: ['Smart Contracts', 'DeFi', 'NFTs', 'DAOs', 'DApps'],
      partnerships: ['Microsoft', 'JPMorgan', 'ConsenSys', 'Chainlink'],
      ecosystem: {
        dapps: 3000,
        defi: 400,
        nft: 150,
        gaming: 200
      },
      metrics: {
        uptime: 99.95,
        security: 98,
        decentralization: 95,
        scalability: 65,
        sustainability: 85
      },
      roadmap: [
        {
          id: 'eth-1',
          title: 'The Merge Completion',
          description: 'Transition to Proof of Stake consensus',
          status: 'Completed',
          quarter: 'Q3',
          year: 2022,
          priority: 'High'
        },
        {
          id: 'eth-2',
          title: 'Shanghai Upgrade',
          description: 'Enable staking withdrawals',
          status: 'Completed',
          quarter: 'Q2',
          year: 2023,
          priority: 'High'
        },
        {
          id: 'eth-3',
          title: 'Proto-Danksharding',
          description: 'Implement EIP-4844 for blob transactions',
          status: 'In Progress',
          quarter: 'Q1',
          year: 2024,
          priority: 'High'
        }
      ]
    },
    {
      id: 'polygon',
      name: 'Polygon',
      symbol: 'MATIC',
      description: 'Ethereum scaling solution with PoS sidechain',
      category: 'Layer2',
      type: 'Platform',
      marketCap: 8500000000,
      price: 0.85,
      change24h: 4.2,
      volume24h: 450000000,
      tvl: 1200000000,
      tps: 7000,
      blockTime: 2,
      validators: 100,
      nodes: 150,
      transactions24h: 3500000,
      activeAddresses: 450000,
      developerActivity: 88,
      githubStars: 12000,
      logo: '⬟',
      website: 'https://polygon.technology',
      consensus: 'Proof of Stake',
      programmingLanguage: ['Solidity', 'JavaScript', 'Go'],
      features: ['Low Fees', 'Fast Transactions', 'Ethereum Compatible', 'DeFi'],
      partnerships: ['Meta', 'Disney', 'Adobe', 'Stripe'],
      ecosystem: {
        dapps: 37000,
        defi: 180,
        nft: 80,
        gaming: 120
      },
      metrics: {
        uptime: 99.9,
        security: 92,
        decentralization: 78,
        scalability: 95,
        sustainability: 88
      },
      roadmap: [
        {
          id: 'poly-1',
          title: 'Polygon 2.0',
          description: 'Transition to zkEVM and unified liquidity',
          status: 'In Progress',
          quarter: 'Q2',
          year: 2024,
          priority: 'High'
        }
      ]
    },
    {
      id: 'solana',
      name: 'Solana',
      symbol: 'SOL',
      description: 'High-performance blockchain for DApps and crypto',
      category: 'Layer1',
      type: 'Blockchain',
      marketCap: 45000000000,
      price: 105.00,
      change24h: -1.8,
      volume24h: 2200000000,
      tvl: 1800000000,
      tps: 65000,
      blockTime: 0.4,
      validators: 1900,
      nodes: 2100,
      transactions24h: 25000000,
      activeAddresses: 280000,
      developerActivity: 82,
      githubStars: 11500,
      logo: '◎',
      website: 'https://solana.com',
      consensus: 'Proof of History + Proof of Stake',
      programmingLanguage: ['Rust', 'C', 'C++'],
      features: ['High TPS', 'Low Fees', 'Fast Finality', 'Web3'],
      partnerships: ['Google', 'Chainlink', 'Serum', 'FTX'],
      ecosystem: {
        dapps: 350,
        defi: 40,
        nft: 25,
        gaming: 35
      },
      metrics: {
        uptime: 98.5,
        security: 88,
        decentralization: 82,
        scalability: 98,
        sustainability: 75
      },
      roadmap: [
        {
          id: 'sol-1',
          title: 'Firedancer Client',
          description: 'New validator client for improved performance',
          status: 'In Progress',
          quarter: 'Q3',
          year: 2024,
          priority: 'High'
        }
      ]
    },
    {
      id: 'avalanche',
      name: 'Avalanche',
      symbol: 'AVAX',
      description: 'Platform for decentralized applications and custom blockchains',
      category: 'Layer1',
      type: 'Platform',
      marketCap: 12000000000,
      price: 32.50,
      change24h: 3.1,
      volume24h: 380000000,
      tvl: 850000000,
      tps: 4500,
      blockTime: 1,
      validators: 1300,
      nodes: 1500,
      transactions24h: 800000,
      activeAddresses: 85000,
      developerActivity: 78,
      githubStars: 8500,
      logo: '🔺',
      website: 'https://avax.network',
      consensus: 'Avalanche Consensus',
      programmingLanguage: ['Solidity', 'Go', 'JavaScript'],
      features: ['Subnets', 'Fast Finality', 'EVM Compatible', 'Interoperability'],
      partnerships: ['Deloitte', 'Mastercard', 'Amazon', 'Chainlink'],
      ecosystem: {
        dapps: 200,
        defi: 35,
        nft: 15,
        gaming: 25
      },
      metrics: {
        uptime: 99.8,
        security: 90,
        decentralization: 85,
        scalability: 92,
        sustainability: 82
      },
      roadmap: [
        {
          id: 'avax-1',
          title: 'Avalanche9000',
          description: 'Major upgrade for subnet deployment and customization',
          status: 'In Progress',
          quarter: 'Q4',
          year: 2024,
          priority: 'High'
        }
      ]
    },
    {
      id: 'arbitrum',
      name: 'Arbitrum',
      symbol: 'ARB',
      description: 'Optimistic rollup scaling solution for Ethereum',
      category: 'Layer2',
      type: 'Protocol',
      marketCap: 2800000000,
      price: 1.85,
      change24h: 5.7,
      volume24h: 180000000,
      tvl: 2400000000,
      tps: 40000,
      blockTime: 0.25,
      validators: 6,
      nodes: 50,
      transactions24h: 1800000,
      activeAddresses: 320000,
      developerActivity: 85,
      githubStars: 6500,
      logo: '🔷',
      website: 'https://arbitrum.io',
      consensus: 'Optimistic Rollup',
      programmingLanguage: ['Solidity', 'JavaScript', 'Go'],
      features: ['Ethereum Compatible', 'Low Fees', 'Fast Transactions', 'DeFi'],
      partnerships: ['Uniswap', 'Aave', 'Curve', 'Chainlink'],
      ecosystem: {
        dapps: 400,
        defi: 120,
        nft: 30,
        gaming: 45
      },
      metrics: {
        uptime: 99.7,
        security: 94,
        decentralization: 72,
        scalability: 96,
        sustainability: 90
      },
      roadmap: [
        {
          id: 'arb-1',
          title: 'Arbitrum Stylus',
          description: 'Support for WASM smart contracts',
          status: 'In Progress',
          quarter: 'Q2',
          year: 2024,
          priority: 'High'
        }
      ]
    },
    {
      id: 'optimism',
      name: 'Optimism',
      symbol: 'OP',
      description: 'Optimistic rollup for scaling Ethereum applications',
      category: 'Layer2',
      type: 'Protocol',
      marketCap: 3200000000,
      price: 2.15,
      change24h: 2.8,
      volume24h: 220000000,
      tvl: 1800000000,
      tps: 2000,
      blockTime: 2,
      validators: 1,
      nodes: 25,
      transactions24h: 950000,
      activeAddresses: 180000,
      developerActivity: 80,
      githubStars: 5200,
      logo: '🔴',
      website: 'https://optimism.io',
      consensus: 'Optimistic Rollup',
      programmingLanguage: ['Solidity', 'JavaScript', 'Go'],
      features: ['EVM Equivalent', 'Retroactive Funding', 'Public Goods', 'DeFi'],
      partnerships: ['Synthetix', 'Uniswap', 'Chainlink', 'Worldcoin'],
      ecosystem: {
        dapps: 150,
        defi: 60,
        nft: 20,
        gaming: 25
      },
      metrics: {
        uptime: 99.6,
        security: 93,
        decentralization: 68,
        scalability: 88,
        sustainability: 92
      },
      roadmap: [
        {
          id: 'op-1',
          title: 'Bedrock Upgrade',
          description: 'Improved performance and reduced fees',
          status: 'Completed',
          quarter: 'Q2',
          year: 2023,
          priority: 'High'
        }
      ]
    }
  ])

  const [infrastructureStats] = useState<InfrastructureStats>({
    totalProjects: infrastructureProjects.length,
    totalMarketCap: infrastructureProjects.reduce((sum, project) => sum + project.marketCap, 0),
    totalTVL: infrastructureProjects.reduce((sum, project) => sum + project.tvl, 0),
    totalTransactions: infrastructureProjects.reduce((sum, project) => sum + project.transactions24h, 0),
    avgTPS: infrastructureProjects.reduce((sum, project) => sum + project.tps, 0) / infrastructureProjects.length,
    totalValidators: infrastructureProjects.reduce((sum, project) => sum + project.validators, 0),
    totalNodes: infrastructureProjects.reduce((sum, project) => sum + project.nodes, 0),
    avgUptime: infrastructureProjects.reduce((sum, project) => sum + project.metrics.uptime, 0) / infrastructureProjects.length
  })

  // Filter and sort projects
  const filteredProjects = infrastructureProjects
    .filter(project => {
      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.symbol.toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'Completed': return 'text-green-400 bg-green-400/20'
      case 'In Progress': return 'text-blue-400 bg-blue-400/20'
      case 'Planned': return 'text-yellow-400 bg-yellow-400/20'
      case 'Research': return 'text-purple-400 bg-purple-400/20'
      default: return 'text-white/60 bg-white/10'
    }
  }

  // Get performance color
  const getPerformanceColor = (value: number): string => {
    if (value > 0) return 'text-green-400'
    if (value < 0) return 'text-red-400'
    return 'text-white/60'
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
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Infrastructure Hub</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Explore Layer 1/2 blockchains, scaling solutions, and the infrastructure powering Web3
          </p>
        </motion.div>

        {/* Infrastructure Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-8 gap-6 mb-8"
        >
          <div className="glass-card p-6 text-center">
            <Server className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{infrastructureStats.totalProjects}</div>
            <div className="text-white/60 text-sm">Projects</div>
          </div>
          <div className="glass-card p-6 text-center">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{formatCurrency(infrastructureStats.totalMarketCap)}</div>
            <div className="text-white/60 text-sm">Market Cap</div>
          </div>
          <div className="glass-card p-6 text-center">
            <Lock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{formatCurrency(infrastructureStats.totalTVL)}</div>
            <div className="text-white/60 text-sm">Total TVL</div>
          </div>
          <div className="glass-card p-6 text-center">
            <Activity className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{formatNumber(infrastructureStats.totalTransactions)}</div>
            <div className="text-white/60 text-sm">Transactions</div>
          </div>
          <div className="glass-card p-6 text-center">
            <Zap className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{formatNumber(infrastructureStats.avgTPS)}</div>
            <div className="text-white/60 text-sm">Avg TPS</div>
          </div>
          <div className="glass-card p-6 text-center">
            <Shield className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{formatNumber(infrastructureStats.totalValidators)}</div>
            <div className="text-white/60 text-sm">Validators</div>
          </div>
          <div className="glass-card p-6 text-center">
            <Network className="w-8 h-8 text-pink-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{formatNumber(infrastructureStats.totalNodes)}</div>
            <div className="text-white/60 text-sm">Nodes</div>
          </div>
          <div className="glass-card p-6 text-center">
            <CheckCircle className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{infrastructureStats.avgUptime.toFixed(1)}%</div>
            <div className="text-white/60 text-sm">Avg Uptime</div>
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
              placeholder="Search infrastructure projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="all" className="bg-gray-800">All Categories</option>
            <option value="Layer1" className="bg-gray-800">Layer 1</option>
            <option value="Layer2" className="bg-gray-800">Layer 2</option>
            <option value="Sidechain" className="bg-gray-800">Sidechain</option>
            <option value="Interoperability" className="bg-gray-800">Interoperability</option>
            <option value="Storage" className="bg-gray-800">Storage</option>
            <option value="Oracle" className="bg-gray-800">Oracle</option>
            <option value="Privacy" className="bg-gray-800">Privacy</option>
            <option value="Scaling" className="bg-gray-800">Scaling</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="marketCap" className="bg-gray-800">Market Cap</option>
            <option value="tvl" className="bg-gray-800">TVL</option>
            <option value="tps" className="bg-gray-800">TPS</option>
            <option value="validators" className="bg-gray-800">Validators</option>
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
              { id: 'layer1', label: 'Layer 1', icon: <Server className="w-4 h-4" /> },
              { id: 'layer2', label: 'Layer 2', icon: <Layers className="w-4 h-4" /> },
              { id: 'scaling', label: 'Scaling', icon: <Zap className="w-4 h-4" /> },
              { id: 'interop', label: 'Interoperability', icon: <Link2 className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white'
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
                {/* Infrastructure Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="glass-card p-6 hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
                          {project.logo}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{project.name}</h3>
                          <p className="text-white/60">{project.category} • {project.type}</p>
                        </div>
                        <div className="ml-auto">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            project.change24h >= 0 ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20'
                          }`}>
                            {project.change24h >= 0 ? '+' : ''}{project.change24h.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <p className="text-white/70 mb-6 line-clamp-2">{project.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className="text-white/60 text-sm">Market Cap</p>
                          <p className="text-white font-bold">{formatCurrency(project.marketCap)}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">TVL</p>
                          <p className="text-white font-bold">{formatCurrency(project.tvl)}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">TPS</p>
                          <p className="text-white font-bold">{formatNumber(project.tps)}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Validators</p>
                          <p className="text-white font-bold">{formatNumber(project.validators)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                          View Details
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Performance Metrics */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Performance Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-white/80 font-medium py-3">Project</th>
                          <th className="text-left text-white/80 font-medium py-3">TPS</th>
                          <th className="text-left text-white/80 font-medium py-3">Block Time</th>
                          <th className="text-left text-white/80 font-medium py-3">Finality</th>
                          <th className="text-left text-white/80 font-medium py-3">Uptime</th>
                          <th className="text-left text-white/80 font-medium py-3">Security</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.slice(0, 6).map((project, _index) => (
                          <tr key={project.id} className="border-b border-white/5">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{project.logo}</span>
                                <span className="text-white">{project.name}</span>
                              </div>
                            </td>
                            <td className="py-3 text-white">{formatNumber(project.tps)}</td>
                            <td className="py-3 text-white">{project.blockTime}s</td>
                            <td className="py-3 text-white">{project.blockTime * 2}s</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                project.metrics.uptime >= 99.5 ? 'bg-green-500/20 text-green-400' :
                                project.metrics.uptime >= 99 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {project.metrics.uptime.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                project.metrics.security >= 95 ? 'bg-green-500/20 text-green-400' :
                                project.metrics.security >= 85 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {project.metrics.security}/100
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'layer1' && (
              <div className="space-y-8">
                {/* Layer 1 Overview */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Layer 1 Blockchains</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Server className="w-8 h-8 text-blue-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Base Layer Security</h4>
                      <p className="text-white/60 text-sm mb-4">Foundational blockchain networks with native consensus</p>
                      <div className="text-2xl font-bold text-blue-400">6</div>
                      <div className="text-white/60 text-sm">Active Networks</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-green-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Consensus Diversity</h4>
                      <p className="text-white/60 text-sm mb-4">Multiple consensus mechanisms for different use cases</p>
                      <div className="text-2xl font-bold text-green-400">4</div>
                      <div className="text-white/60 text-sm">Consensus Types</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-8 h-8 text-purple-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Global Adoption</h4>
                      <p className="text-white/60 text-sm mb-4">Worldwide network of validators and nodes</p>
                      <div className="text-2xl font-bold text-purple-400">900K+</div>
                      <div className="text-white/60 text-sm">Total Validators</div>
                    </div>
                  </div>
                </div>

                {/* Layer 1 Projects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProjects.filter(p => p.category === 'Layer1').map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="glass-card p-6"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-3xl">{project.logo}</span>
                        <div>
                          <h4 className="text-white font-bold text-lg">{project.name}</h4>
                          <p className="text-white/60">{project.consensus}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-white/60 text-sm">Market Cap:</span>
                          <div className="text-white font-medium">{formatCurrency(project.marketCap)}</div>
                        </div>
                        <div>
                          <span className="text-white/60 text-sm">TVL:</span>
                          <div className="text-white font-medium">{formatCurrency(project.tvl)}</div>
                        </div>
                        <div>
                          <span className="text-white/60 text-sm">Validators:</span>
                          <div className="text-white font-medium">{formatNumber(project.validators)}</div>
                        </div>
                        <div>
                          <span className="text-white/60 text-sm">TPS:</span>
                          <div className="text-white font-medium">{formatNumber(project.tps)}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Security:</span>
                          <span className="text-white">{project.metrics.security}/100</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                            style={{ width: `${project.metrics.security}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'layer2' && (
              <div className="space-y-8">
                {/* Layer 2 Overview */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Layer 2 Scaling Solutions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-cyan-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">High Throughput</h4>
                      <p className="text-white/60 text-sm mb-4">Significantly increased transaction capacity</p>
                      <div className="text-2xl font-bold text-cyan-400">40K+</div>
                      <div className="text-white/60 text-sm">Max TPS</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="w-8 h-8 text-green-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Low Fees</h4>
                      <p className="text-white/60 text-sm mb-4">Reduced transaction costs for users</p>
                      <div className="text-2xl font-bold text-green-400">$0.01</div>
                      <div className="text-white/60 text-sm">Avg Fee</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-purple-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Ethereum Security</h4>
                      <p className="text-white/60 text-sm mb-4">Inherits security from Ethereum mainnet</p>
                      <div className="text-2xl font-bold text-purple-400">100%</div>
                      <div className="text-white/60 text-sm">Security Inheritance</div>
                    </div>
                  </div>
                </div>

                {/* Layer 2 Comparison */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Layer 2 Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-white/80 font-medium py-3">Solution</th>
                          <th className="text-left text-white/80 font-medium py-3">Type</th>
                          <th className="text-left text-white/80 font-medium py-3">TPS</th>
                          <th className="text-left text-white/80 font-medium py-3">TVL</th>
                          <th className="text-left text-white/80 font-medium py-3">Ecosystem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.filter(p => p.category === 'Layer2').map((project, _index) => (
                          <tr key={project.id} className="border-b border-white/5">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{project.logo}</span>
                                <span className="text-white">{project.name}</span>
                              </div>
                            </td>
                            <td className="py-3 text-white/60">{project.consensus}</td>
                            <td className="py-3 text-white">{formatNumber(project.tps)}</td>
                            <td className="py-3 text-white">{formatCurrency(project.tvl)}</td>
                            <td className="py-3 text-white">{project.ecosystem.dapps} DApps</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'scaling' && (
              <div className="space-y-8">
                {/* Scaling Solutions Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="glass-card p-6 text-center">
                    <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Optimistic Rollups</h3>
                    <p className="text-3xl font-bold text-yellow-400">2</p>
                    <p className="text-yellow-400 text-sm mt-2">Active Solutions</p>
                  </div>
                  <div className="glass-card p-6 text-center">
                    <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">ZK Rollups</h3>
                    <p className="text-3xl font-bold text-blue-400">3</p>
                    <p className="text-blue-400 text-sm mt-2">Coming Soon</p>
                  </div>
                  <div className="glass-card p-6 text-center">
                    <Network className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Sidechains</h3>
                    <p className="text-3xl font-bold text-green-400">1</p>
                    <p className="text-green-400 text-sm mt-2">Active Networks</p>
                  </div>
                  <div className="glass-card p-6 text-center">
                    <Globe className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">State Channels</h3>
                    <p className="text-3xl font-bold text-purple-400">2</p>
                    <p className="text-purple-400 text-sm mt-2">Implementations</p>
                  </div>
                </div>

                {/* Scaling Metrics */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Scaling Performance Metrics</h3>
                  <div className="space-y-6">
                    {filteredProjects.map((project, _index) => (
                      <div key={project.id} className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{project.logo}</span>
                            <div>
                              <h4 className="text-white font-medium">{project.name}</h4>
                              <p className="text-white/60 text-sm">{project.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold">{formatNumber(project.tps)} TPS</div>
                            <div className="text-white/60 text-sm">{project.blockTime}s block time</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <span className="text-white/60 text-sm">Scalability:</span>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-white/10 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-blue-400"
                                  style={{ width: `${project.metrics.scalability}%` }}
                                />
                              </div>
                              <span className="text-white text-sm">{project.metrics.scalability}/100</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-white/60 text-sm">Security:</span>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-white/10 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-green-400"
                                  style={{ width: `${project.metrics.security}%` }}
                                />
                              </div>
                              <span className="text-white text-sm">{project.metrics.security}/100</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-white/60 text-sm">Decentralization:</span>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-white/10 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-purple-400"
                                  style={{ width: `${project.metrics.decentralization}%` }}
                                />
                              </div>
                              <span className="text-white text-sm">{project.metrics.decentralization}/100</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-white/60 text-sm">Sustainability:</span>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-white/10 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-yellow-400"
                                  style={{ width: `${project.metrics.sustainability}%` }}
                                />
                              </div>
                              <span className="text-white text-sm">{project.metrics.sustainability}/100</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'interop' && (
              <div className="space-y-8">
                {/* Interoperability Overview */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Cross-Chain Interoperability</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Link2 className="w-8 h-8 text-orange-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Bridge Protocols</h4>
                      <p className="text-white/60 text-sm mb-4">Secure asset transfers between chains</p>
                      <div className="text-2xl font-bold text-orange-400">12</div>
                      <div className="text-white/60 text-sm">Active Bridges</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Network className="w-8 h-8 text-pink-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Cross-Chain Volume</h4>
                      <p className="text-white/60 text-sm mb-4">Daily cross-chain transaction volume</p>
                      <div className="text-2xl font-bold text-pink-400">$2.5B</div>
                      <div className="text-white/60 text-sm">24h Volume</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-8 h-8 text-cyan-400" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Connected Chains</h4>
                      <p className="text-white/60 text-sm mb-4">Blockchains with interoperability support</p>
                      <div className="text-2xl font-bold text-cyan-400">25+</div>
                      <div className="text-white/60 text-sm">Networks</div>
                    </div>
                  </div>
                </div>

                {/* Roadmap */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Development Roadmap</h3>
                  <div className="space-y-6">
                    {infrastructureProjects
                      .filter(p => p.roadmap.length > 0)
                      .map(project =>
                        project.roadmap.map(item => (
                          <div key={item.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                            <div className="flex-shrink-0">
                              <span className="text-2xl">{project.logo}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-white font-medium">{item.title}</h4>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                                  {item.status}
                                </span>
                                <span className="text-white/60 text-sm">{item.quarter} {item.year}</span>
                              </div>
                              <p className="text-white/70 text-sm mb-2">{item.description}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-white/60 text-xs">Priority:</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  item.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                                  item.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {item.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
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

export default EnhancedInfrastructurePage
