import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap,
  TrendingUp,
  DollarSign,
  Percent,
  Target,
  Shield,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  Star,
  Award,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Filter,
  Search,
  Eye,
  EyeOff,
  Settings,
  ExternalLink,
  Calculator,
  Calendar,
  Globe,
  Layers
} from 'lucide-react'

interface YieldOpportunity {
  id: string
  protocol: string
  chain: string
  asset: string
  type: 'staking' | 'lending' | 'liquidity_pool' | 'yield_farming' | 'vault'
  apy: number
  tvl: number
  riskLevel: 'low' | 'medium' | 'high'
  lockPeriod: number // days, 0 for no lock
  minDeposit: number
  maxCapacity: number
  currentCapacity: number
  fees: {
    deposit: number
    withdrawal: number
    performance: number
  }
  rewards: string[]
  description: string
  auditStatus: 'audited' | 'unaudited' | 'pending'
  isActive: boolean
  trending: boolean
}

interface StakingValidator {
  id: string
  name: string
  chain: string
  commission: number
  apy: number
  uptime: number
  totalStaked: number
  riskScore: number
  description: string
  website?: string
}

interface LendingProtocol {
  id: string
  name: string
  chain: string
  asset: string
  supplyApy: number
  borrowApy: number
  utilization: number
  totalSupply: number
  totalBorrow: number
  collateralFactor: number
  liquidationThreshold: number
  riskLevel: 'low' | 'medium' | 'high'
}

interface YieldStrategy {
  id: string
  name: string
  description: string
  expectedApy: number
  riskLevel: 'low' | 'medium' | 'high'
  complexity: 'simple' | 'intermediate' | 'advanced'
  steps: {
    protocol: string
    action: string
    allocation: number
    expectedReturn: number
  }[]
  totalInvestment: number
  projectedReturns: {
    daily: number
    weekly: number
    monthly: number
    yearly: number
  }
}

interface YieldOptimizationHubProps {
  portfolioValue: number
  availableAssets: string[]
  onInvest?: (opportunity: YieldOpportunity, amount: number) => void
}

const YieldOptimizationHub: React.FC<YieldOptimizationHubProps> = ({
  portfolioValue,
  availableAssets = [],
  onInvest
}) => {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'staking' | 'lending' | 'strategies' | 'calculator'>('opportunities')
  const [opportunities, setOpportunities] = useState<YieldOpportunity[]>([])
  const [validators, setValidators] = useState<StakingValidator[]>([])
  const [lendingProtocols, setLendingProtocols] = useState<LendingProtocol[]>([])
  const [strategies, setStrategies] = useState<YieldStrategy[]>([])
  const [selectedChain, setSelectedChain] = useState<string>('all')
  const [selectedRisk, setSelectedRisk] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'apy' | 'tvl' | 'risk'>('apy')
  const [showOnlyAudited, setShowOnlyAudited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize yield data
  useEffect(() => {
    setIsLoading(true)
    
    setTimeout(() => {
      const mockOpportunities: YieldOpportunity[] = [
        {
          id: 'aave-usdc',
          protocol: 'Aave V3',
          chain: 'Ethereum',
          asset: 'USDC',
          type: 'lending',
          apy: 4.2,
          tvl: 2500000000,
          riskLevel: 'low',
          lockPeriod: 0,
          minDeposit: 1,
          maxCapacity: 5000000000,
          currentCapacity: 2500000000,
          fees: { deposit: 0, withdrawal: 0, performance: 0 },
          rewards: ['AAVE'],
          description: 'Supply USDC to Aave V3 for stable yield with instant liquidity',
          auditStatus: 'audited',
          isActive: true,
          trending: false
        },
        {
          id: 'curve-3pool',
          protocol: 'Curve Finance',
          chain: 'Ethereum',
          asset: 'USDC/USDT/DAI',
          type: 'liquidity_pool',
          apy: 8.5,
          tvl: 1200000000,
          riskLevel: 'low',
          lockPeriod: 0,
          minDeposit: 10,
          maxCapacity: 2000000000,
          currentCapacity: 1200000000,
          fees: { deposit: 0, withdrawal: 0.04, performance: 0 },
          rewards: ['CRV', 'CVX'],
          description: 'Provide liquidity to the stable 3pool for trading fees and rewards',
          auditStatus: 'audited',
          isActive: true,
          trending: true
        },
        {
          id: 'lido-eth',
          protocol: 'Lido',
          chain: 'Ethereum',
          asset: 'ETH',
          type: 'staking',
          apy: 5.8,
          tvl: 18000000000,
          riskLevel: 'low',
          lockPeriod: 0,
          minDeposit: 0.01,
          maxCapacity: 50000000000,
          currentCapacity: 18000000000,
          fees: { deposit: 0, withdrawal: 0, performance: 10 },
          rewards: ['stETH'],
          description: 'Liquid staking for Ethereum 2.0 with instant liquidity',
          auditStatus: 'audited',
          isActive: true,
          trending: true
        },
        {
          id: 'compound-usdc',
          protocol: 'Compound V3',
          chain: 'Ethereum',
          asset: 'USDC',
          type: 'lending',
          apy: 3.8,
          tvl: 800000000,
          riskLevel: 'low',
          lockPeriod: 0,
          minDeposit: 1,
          maxCapacity: 2000000000,
          currentCapacity: 800000000,
          fees: { deposit: 0, withdrawal: 0, performance: 0 },
          rewards: ['COMP'],
          description: 'Lend USDC on Compound for stable returns and COMP rewards',
          auditStatus: 'audited',
          isActive: true,
          trending: false
        },
        {
          id: 'yearn-yvusdc',
          protocol: 'Yearn Finance',
          chain: 'Ethereum',
          asset: 'USDC',
          type: 'vault',
          apy: 12.4,
          tvl: 450000000,
          riskLevel: 'medium',
          lockPeriod: 0,
          minDeposit: 1,
          maxCapacity: 1000000000,
          currentCapacity: 450000000,
          fees: { deposit: 0, withdrawal: 0.5, performance: 20 },
          rewards: ['YFI'],
          description: 'Automated yield farming strategy with multiple protocols',
          auditStatus: 'audited',
          isActive: true,
          trending: true
        },
        {
          id: 'pancake-cake',
          protocol: 'PancakeSwap',
          chain: 'BSC',
          asset: 'CAKE',
          type: 'staking',
          apy: 18.5,
          tvl: 320000000,
          riskLevel: 'high',
          lockPeriod: 52,
          minDeposit: 0.1,
          maxCapacity: 500000000,
          currentCapacity: 320000000,
          fees: { deposit: 0, withdrawal: 2, performance: 0 },
          rewards: ['CAKE'],
          description: 'Stake CAKE tokens for high yield with 52-week lock',
          auditStatus: 'audited',
          isActive: true,
          trending: false
        }
      ]

      const mockValidators: StakingValidator[] = [
        {
          id: 'coinbase-validator',
          name: 'Coinbase Cloud',
          chain: 'Ethereum',
          commission: 8,
          apy: 5.2,
          uptime: 99.8,
          totalStaked: 2500000,
          riskScore: 95,
          description: 'Enterprise-grade validator with high uptime and security',
          website: 'https://cloud.coinbase.com'
        },
        {
          id: 'kraken-validator',
          name: 'Kraken',
          chain: 'Ethereum',
          commission: 15,
          apy: 4.8,
          uptime: 99.5,
          totalStaked: 1800000,
          riskScore: 92,
          description: 'Established exchange validator with proven track record'
        },
        {
          id: 'rocketpool-node',
          name: 'Rocket Pool',
          chain: 'Ethereum',
          commission: 14,
          apy: 4.9,
          uptime: 99.2,
          totalStaked: 950000,
          riskScore: 88,
          description: 'Decentralized staking protocol with distributed validators'
        }
      ]

      const mockLending: LendingProtocol[] = [
        {
          id: 'aave-eth-usdc',
          name: 'Aave V3',
          chain: 'Ethereum',
          asset: 'USDC',
          supplyApy: 4.2,
          borrowApy: 5.8,
          utilization: 72,
          totalSupply: 2500000000,
          totalBorrow: 1800000000,
          collateralFactor: 85,
          liquidationThreshold: 87,
          riskLevel: 'low'
        },
        {
          id: 'compound-eth-usdc',
          name: 'Compound V3',
          chain: 'Ethereum',
          asset: 'USDC',
          supplyApy: 3.8,
          borrowApy: 5.2,
          utilization: 68,
          totalSupply: 800000000,
          totalBorrow: 544000000,
          collateralFactor: 80,
          liquidationThreshold: 85,
          riskLevel: 'low'
        }
      ]

      const mockStrategies: YieldStrategy[] = [
        {
          id: 'stable-conservative',
          name: 'Conservative Stablecoin Strategy',
          description: 'Low-risk strategy focusing on audited protocols and stablecoins',
          expectedApy: 6.2,
          riskLevel: 'low',
          complexity: 'simple',
          steps: [
            { protocol: 'Aave V3', action: 'Supply USDC', allocation: 60, expectedReturn: 4.2 },
            { protocol: 'Curve 3Pool', action: 'Provide Liquidity', allocation: 40, expectedReturn: 8.5 }
          ],
          totalInvestment: 10000,
          projectedReturns: {
            daily: 1.70,
            weekly: 11.92,
            monthly: 51.67,
            yearly: 620
          }
        },
        {
          id: 'eth-staking-plus',
          name: 'ETH Staking Plus',
          description: 'Combine ETH staking with DeFi strategies for enhanced yield',
          expectedApy: 9.8,
          riskLevel: 'medium',
          complexity: 'intermediate',
          steps: [
            { protocol: 'Lido', action: 'Stake ETH', allocation: 70, expectedReturn: 5.8 },
            { protocol: 'Curve stETH', action: 'LP with stETH', allocation: 30, expectedReturn: 18.5 }
          ],
          totalInvestment: 10000,
          projectedReturns: {
            daily: 2.68,
            weekly: 18.77,
            monthly: 81.67,
            yearly: 980
          }
        }
      ]

      setOpportunities(mockOpportunities)
      setValidators(mockValidators)
      setLendingProtocols(mockLending)
      setStrategies(mockStrategies)
      setIsLoading(false)
    }, 1500)
  }, [])

  // Filter opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesChain = selectedChain === 'all' || opp.chain.toLowerCase().includes(selectedChain.toLowerCase())
    const matchesRisk = selectedRisk === 'all' || opp.riskLevel === selectedRisk
    const matchesType = selectedType === 'all' || opp.type === selectedType
    const matchesSearch = opp.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.asset.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAudit = !showOnlyAudited || opp.auditStatus === 'audited'
    return matchesChain && matchesRisk && matchesType && matchesSearch && matchesAudit && opp.isActive
  })

  // Sort opportunities
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    switch (sortBy) {
      case 'apy': return b.apy - a.apy
      case 'tvl': return b.tvl - a.tvl
      case 'risk': 
        const riskOrder = { low: 1, medium: 2, high: 3 }
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
      default: return 0
    }
  })

  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  // Get risk color
  const getRiskColor = (level: string): string => {
    switch (level) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  // Get audit status color
  const getAuditColor = (status: string): string => {
    switch (status) {
      case 'audited': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'unaudited': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-12 text-center">
          <RefreshCw className="w-16 h-16 text-white/20 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-bold text-white mb-2">Finding Yield Opportunities</h3>
          <p className="text-white/60">Scanning protocols for the best yields...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Yield Optimization</h2>
          <p className="text-white/60">Discover and optimize yield opportunities across DeFi protocols</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 text-center">
          <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Best APY</h3>
          <p className="text-3xl font-bold text-yellow-400">
            {Math.max(...opportunities.map(o => o.apy)).toFixed(1)}%
          </p>
        </div>
        <div className="glass-card p-6 text-center">
          <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Total TVL</h3>
          <p className="text-3xl font-bold text-green-400">
            {formatCurrency(opportunities.reduce((sum, o) => sum + o.tvl, 0))}
          </p>
        </div>
        <div className="glass-card p-6 text-center">
          <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Opportunities</h3>
          <p className="text-3xl font-bold text-blue-400">{opportunities.length}</p>
        </div>
        <div className="glass-card p-6 text-center">
          <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Audited</h3>
          <p className="text-3xl font-bold text-purple-400">
            {opportunities.filter(o => o.auditStatus === 'audited').length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { id: 'opportunities', label: 'Opportunities', icon: <Zap className="w-4 h-4" /> },
          { id: 'staking', label: 'Staking', icon: <Shield className="w-4 h-4" /> },
          { id: 'lending', label: 'Lending', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'strategies', label: 'Strategies', icon: <Target className="w-4 h-4" /> },
          { id: 'calculator', label: 'Calculator', icon: <Calculator className="w-4 h-4" /> }
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
          {activeTab === 'opportunities' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search protocols or assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                  />
                </div>
                
                <select
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="all" className="bg-gray-800">All Chains</option>
                  <option value="ethereum" className="bg-gray-800">Ethereum</option>
                  <option value="bsc" className="bg-gray-800">BSC</option>
                  <option value="polygon" className="bg-gray-800">Polygon</option>
                  <option value="arbitrum" className="bg-gray-800">Arbitrum</option>
                </select>

                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="all" className="bg-gray-800">All Risk Levels</option>
                  <option value="low" className="bg-gray-800">Low Risk</option>
                  <option value="medium" className="bg-gray-800">Medium Risk</option>
                  <option value="high" className="bg-gray-800">High Risk</option>
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="all" className="bg-gray-800">All Types</option>
                  <option value="staking" className="bg-gray-800">Staking</option>
                  <option value="lending" className="bg-gray-800">Lending</option>
                  <option value="liquidity_pool" className="bg-gray-800">Liquidity Pool</option>
                  <option value="yield_farming" className="bg-gray-800">Yield Farming</option>
                  <option value="vault" className="bg-gray-800">Vault</option>
                </select>

                <button
                  onClick={() => setShowOnlyAudited(!showOnlyAudited)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                    showOnlyAudited 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Audited Only
                </button>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-4">
                <span className="text-white/60">Sort by:</span>
                <div className="flex gap-2">
                  {[
                    { value: 'apy', label: 'APY' },
                    { value: 'tvl', label: 'TVL' },
                    { value: 'risk', label: 'Risk' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as any)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        sortBy === option.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opportunities List */}
              <div className="space-y-4">
                {sortedOpportunities.map((opportunity, index) => (
                  <motion.div
                    key={opportunity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="glass-card p-6 hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold text-white">{opportunity.protocol}</h4>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                            {opportunity.chain}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                            opportunity.type === 'staking' ? 'bg-green-500/20 text-green-400' :
                            opportunity.type === 'lending' ? 'bg-blue-500/20 text-blue-400' :
                            opportunity.type === 'liquidity_pool' ? 'bg-purple-500/20 text-purple-400' :
                            opportunity.type === 'yield_farming' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-pink-500/20 text-pink-400'
                          }`}>
                            {opportunity.type.replace('_', ' ')}
                          </span>
                          {opportunity.trending && (
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-medium">
                              🔥 Trending
                            </span>
                          )}
                        </div>
                        <p className="text-white/80 mb-3">{opportunity.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-white/60">Asset: <span className="text-white">{opportunity.asset}</span></span>
                          <span className="text-white/60">Min: <span className="text-white">{formatCurrency(opportunity.minDeposit)}</span></span>
                          <span className="text-white/60">Lock: <span className="text-white">{opportunity.lockPeriod === 0 ? 'None' : `${opportunity.lockPeriod} days`}</span></span>
                          <span className={`${getAuditColor(opportunity.auditStatus)}`}>
                            {opportunity.auditStatus === 'audited' ? '✓ Audited' : 
                             opportunity.auditStatus === 'pending' ? '⏳ Pending' : '⚠ Unaudited'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-400 mb-1">
                          {opportunity.apy.toFixed(1)}%
                        </div>
                        <div className="text-white/60 text-sm mb-2">APY</div>
                        <div className={`text-sm font-medium ${getRiskColor(opportunity.riskLevel)}`}>
                          {opportunity.riskLevel.toUpperCase()} RISK
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-white/60 text-sm">TVL:</span>
                        <div className="text-white font-medium">{formatCurrency(opportunity.tvl)}</div>
                      </div>
                      <div>
                        <span className="text-white/60 text-sm">Capacity:</span>
                        <div className="text-white font-medium">
                          {((opportunity.currentCapacity / opportunity.maxCapacity) * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-white/60 text-sm">Rewards:</span>
                        <div className="text-purple-400 font-medium">{opportunity.rewards.join(', ')}</div>
                      </div>
                      <div>
                        <span className="text-white/60 text-sm">Fees:</span>
                        <div className="text-white font-medium">
                          {opportunity.fees.performance > 0 ? `${opportunity.fees.performance}%` : 'None'}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => onInvest?.(opportunity, 1000)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        Invest
                      </button>
                      <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {sortedOpportunities.length === 0 && (
                <div className="glass-card p-12 text-center">
                  <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Opportunities Found</h3>
                  <p className="text-white/60">Try adjusting your filters to see more results</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'staking' && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Staking Validators</h3>
              <div className="space-y-4">
                {validators.map((validator, index) => (
                  <motion.div
                    key={validator.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-4 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-medium">{validator.name}</h4>
                        <p className="text-white/60 text-sm">{validator.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold text-lg">{validator.apy.toFixed(1)}%</div>
                        <div className="text-white/60 text-sm">APY</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Commission:</span>
                        <div className="text-white">{validator.commission}%</div>
                      </div>
                      <div>
                        <span className="text-white/60">Uptime:</span>
                        <div className="text-green-400">{validator.uptime}%</div>
                      </div>
                      <div>
                        <span className="text-white/60">Total Staked:</span>
                        <div className="text-white">{formatCurrency(validator.totalStaked)}</div>
                      </div>
                      <div>
                        <span className="text-white/60">Risk Score:</span>
                        <div className="text-blue-400">{validator.riskScore}/100</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'lending' && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Lending Protocols</h3>
              <div className="space-y-4">
                {lendingProtocols.map((protocol, index) => (
                  <motion.div
                    key={protocol.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-4 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-medium">{protocol.name}</h4>
                        <p className="text-white/60 text-sm">{protocol.asset} on {protocol.chain}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">{protocol.supplyApy.toFixed(1)}%</div>
                        <div className="text-white/60 text-sm">Supply APY</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Borrow APY:</span>
                        <div className="text-red-400">{protocol.borrowApy.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-white/60">Utilization:</span>
                        <div className="text-white">{protocol.utilization}%</div>
                      </div>
                      <div>
                        <span className="text-white/60">Total Supply:</span>
                        <div className="text-white">{formatCurrency(protocol.totalSupply)}</div>
                      </div>
                      <div>
                        <span className="text-white/60">Risk Level:</span>
                        <div className={getRiskColor(protocol.riskLevel)}>{protocol.riskLevel.toUpperCase()}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'strategies' && (
            <div className="space-y-6">
              {strategies.map((strategy, index) => (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-white">{strategy.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(strategy.riskLevel)} bg-current/20`}>
                          {strategy.riskLevel} risk
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          strategy.complexity === 'simple' ? 'bg-green-500/20 text-green-400' :
                          strategy.complexity === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {strategy.complexity}
                        </span>
                      </div>
                      <p className="text-white/80 mb-4">{strategy.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-400">{strategy.expectedApy.toFixed(1)}%</div>
                      <div className="text-white/60 text-sm">Expected APY</div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <h5 className="text-white font-medium">Strategy Steps:</h5>
                    {strategy.steps.map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <span className="text-white font-medium">{step.protocol}</span>
                          <span className="text-white/60 ml-2">- {step.action}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white">{step.allocation}%</div>
                          <div className="text-green-400 text-sm">{step.expectedReturn.toFixed(1)}% APY</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-white/60 text-sm">Daily:</span>
                      <div className="text-green-400 font-medium">{formatCurrency(strategy.projectedReturns.daily)}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Weekly:</span>
                      <div className="text-green-400 font-medium">{formatCurrency(strategy.projectedReturns.weekly)}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Monthly:</span>
                      <div className="text-green-400 font-medium">{formatCurrency(strategy.projectedReturns.monthly)}</div>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm">Yearly:</span>
                      <div className="text-green-400 font-medium">{formatCurrency(strategy.projectedReturns.yearly)}</div>
                    </div>
                  </div>

                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                    Execute Strategy
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'calculator' && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Yield Calculator</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Investment Amount</label>
                    <input
                      type="number"
                      defaultValue={10000}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">APY (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue={8.5}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Time Period (months)</label>
                    <input
                      type="number"
                      defaultValue={12}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Compounding</label>
                    <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                      <option value="daily" className="bg-gray-800">Daily</option>
                      <option value="weekly" className="bg-gray-800">Weekly</option>
                      <option value="monthly" className="bg-gray-800">Monthly</option>
                      <option value="yearly" className="bg-gray-800">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Projected Returns</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Initial Investment:</span>
                      <span className="text-white font-medium">$10,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Total Interest:</span>
                      <span className="text-green-400 font-medium">$850</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Final Amount:</span>
                      <span className="text-green-400 font-bold text-lg">$10,850</span>
                    </div>
                  </div>
                  
                  <div className="h-32 bg-gray-800/50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-white/60 text-sm">Growth Chart</p>
                    </div>
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

export default YieldOptimizationHub
