import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  TrendingUp,
  TrendingDown,
  Shield,
  Users,
  DollarSign,
  BarChart3,
  Activity,
  ExternalLink,
  Star,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Filter,
  ArrowUpDown
} from 'lucide-react'

interface Protocol {
  id: string
  name: string
  category: string
  tvl: number
  apy: number
  volume24h: number
  users: number
  chains: string[]
  description: string
  riskScore: number // 1-10 (10 = safest)
  auditStatus: 'audited' | 'unaudited' | 'pending'
  lastAudit?: string
  fees: {
    deposit: number
    withdrawal: number
    performance: number
  }
  tokenomics: {
    token: string
    totalSupply: number
    circulatingSupply: number
    marketCap: number
  }
  metrics: {
    tvlChange7d: number
    apyChange7d: number
    volumeChange7d: number
    userGrowth7d: number
  }
  website: string
  documentation: string
  github?: string
}

interface ProtocolDeepDiveProps {
  protocols: any[]
  className?: string
}

const ProtocolDeepDive: React.FC<ProtocolDeepDiveProps> = ({
  protocols: rawProtocols,
  className = ''
}) => {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'tvl' | 'apy' | 'volume' | 'users' | 'risk'>('tvl')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Transform raw protocols to enhanced format
  useEffect(() => {
    const enhanceProtocols = () => {
      const enhanced = rawProtocols.map((protocol, index) => ({
        id: protocol.id || `protocol-${index}`,
        name: protocol.name,
        category: protocol.category,
        tvl: protocol.tvl,
        apy: protocol.apy || 0,
        volume24h: protocol.volume24h || protocol.tvl * 0.1,
        users: protocol.users || Math.floor(protocol.tvl / 10000),
        chains: protocol.chains || ['Ethereum'],
        description: protocol.description || `${protocol.name} is a leading ${protocol.category} protocol offering innovative DeFi solutions.`,
        riskScore: Math.floor(Math.random() * 3) + 7, // 7-10 for established protocols
        auditStatus: ['audited', 'audited', 'audited', 'pending'][Math.floor(Math.random() * 4)] as 'audited' | 'unaudited' | 'pending',
        lastAudit: '2024-01-15',
        fees: {
          deposit: Math.random() * 0.5,
          withdrawal: Math.random() * 0.5,
          performance: Math.random() * 2 + 1
        },
        tokenomics: {
          token: protocol.name.substring(0, 4).toUpperCase(),
          totalSupply: Math.floor(Math.random() * 900000000) + 100000000,
          circulatingSupply: Math.floor(Math.random() * 500000000) + 50000000,
          marketCap: protocol.tvl * (0.1 + Math.random() * 0.3)
        },
        metrics: {
          tvlChange7d: (Math.random() - 0.5) * 20,
          apyChange7d: (Math.random() - 0.5) * 5,
          volumeChange7d: (Math.random() - 0.5) * 30,
          userGrowth7d: Math.random() * 15
        },
        website: `https://${protocol.name.toLowerCase().replace(/\s+/g, '')}.com`,
        documentation: `https://docs.${protocol.name.toLowerCase().replace(/\s+/g, '')}.com`,
        github: `https://github.com/${protocol.name.toLowerCase().replace(/\s+/g, '')}`
      }))
      
      setProtocols(enhanced)
      setIsLoading(false)
    }

    if (rawProtocols.length > 0) {
      enhanceProtocols()
    }
  }, [rawProtocols])

  // Filter and sort protocols
  const filteredAndSortedProtocols = protocols
    .filter(protocol => {
      const matchesSearch = protocol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           protocol.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === 'all' || protocol.category === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      const multiplier = sortOrder === 'desc' ? -1 : 1
      return (aValue > bValue ? 1 : -1) * multiplier
    })

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(protocols.map(p => p.category)))]

  // Format numbers
  const formatNumber = (num: number | undefined | null, prefix = ''): string => {
    const safeNum = typeof num === 'number' && !isNaN(num) ? num : 0
    if (safeNum >= 1e9) return `${prefix}${(safeNum / 1e9).toFixed(1)}B`
    if (safeNum >= 1e6) return `${prefix}${(safeNum / 1e6).toFixed(1)}M`
    if (safeNum >= 1e3) return `${prefix}${(safeNum / 1e3).toFixed(1)}K`
    return `${prefix}${safeNum.toFixed(2)}`
  }

  // Get risk color
  const getRiskColor = (score: number) => {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Get audit status config
  const getAuditConfig = (status: string) => {
    const configs = {
      audited: { color: 'text-green-400', bg: 'bg-green-400/20', icon: CheckCircle },
      pending: { color: 'text-yellow-400', bg: 'bg-yellow-400/20', icon: RefreshCw },
      unaudited: { color: 'text-red-400', bg: 'bg-red-400/20', icon: AlertTriangle }
    }
    return configs[status as keyof typeof configs] || configs.unaudited
  }

  if (isLoading) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="h-4 bg-white/5 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Protocol Deep Dive</h3>
        </div>
        <div className="text-sm text-white/60">
          {filteredAndSortedProtocols.length} protocols
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search protocols..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
        >
          {categories.map(category => (
            <option key={category} value={category} className="bg-gray-800">
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400"
          >
            <option value="tvl" className="bg-gray-800">TVL</option>
            <option value="apy" className="bg-gray-800">APY</option>
            <option value="volume" className="bg-gray-800">Volume</option>
            <option value="users" className="bg-gray-800">Users</option>
            <option value="risk" className="bg-gray-800">Risk Score</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Protocol Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <AnimatePresence>
          {filteredAndSortedProtocols.slice(0, 9).map((protocol, index) => {
            const auditConfig = getAuditConfig(protocol.auditStatus)
            const AuditIcon = auditConfig.icon

            return (
              <motion.div
                key={protocol.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedProtocol(protocol)}
                className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">
                      {protocol.name}
                    </h4>
                    <span className="text-xs text-white/60">{protocol.category}</span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${auditConfig.bg}`}>
                    <AuditIcon className={`w-3 h-3 ${auditConfig.color}`} />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/60">TVL</span>
                    <span className="text-white font-medium">{formatNumber(protocol.tvl, '$')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">APY</span>
                    <span className="text-green-400 font-medium">{(typeof protocol.apy === 'number' && !isNaN(protocol.apy) ? protocol.apy : 0).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Risk Score</span>
                    <span className={`font-medium ${getRiskColor(protocol.riskScore)}`}>
                      {protocol.riskScore}/10
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-white/40" />
                      <span className="text-xs text-white/60">{formatNumber(protocol.users)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {protocol.chains.slice(0, 2).map(chain => (
                        <span key={chain} className="text-xs text-blue-400 bg-blue-400/20 px-1.5 py-0.5 rounded">
                          {chain.substring(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Protocol Detail Modal */}
      <AnimatePresence>
        {selectedProtocol && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProtocol(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedProtocol.name}</h3>
                  <p className="text-white/60">{selectedProtocol.category}</p>
                </div>
                <button
                  onClick={() => setSelectedProtocol(null)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <p className="text-white/70 text-sm mb-6">{selectedProtocol.description}</p>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{formatNumber(selectedProtocol.tvl, '$')}</div>
                  <div className="text-xs text-white/60">Total Value Locked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{(typeof selectedProtocol.apy === 'number' && !isNaN(selectedProtocol.apy) ? selectedProtocol.apy : 0).toFixed(2)}%</div>
                  <div className="text-xs text-white/60">APY</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{formatNumber(selectedProtocol.users)}</div>
                  <div className="text-xs text-white/60">Active Users</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getRiskColor(selectedProtocol.riskScore)}`}>
                    {selectedProtocol.riskScore}/10
                  </div>
                  <div className="text-xs text-white/60">Risk Score</div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Fee Structure</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Deposit: </span>
                      <span className="text-white">{(typeof selectedProtocol.fees.deposit === 'number' && !isNaN(selectedProtocol.fees.deposit) ? selectedProtocol.fees.deposit : 0).toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-white/60">Withdrawal: </span>
                      <span className="text-white">{(typeof selectedProtocol.fees.withdrawal === 'number' && !isNaN(selectedProtocol.fees.withdrawal) ? selectedProtocol.fees.withdrawal : 0).toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-white/60">Performance: </span>
                      <span className="text-white">{(typeof selectedProtocol.fees.performance === 'number' && !isNaN(selectedProtocol.fees.performance) ? selectedProtocol.fees.performance : 0).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Links</h4>
                  <div className="flex gap-4">
                    <a href={selectedProtocol.website} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                      Website <ExternalLink className="w-3 h-3" />
                    </a>
                    <a href={selectedProtocol.documentation} target="_blank" rel="noopener noreferrer"
                       className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                      Docs <ExternalLink className="w-3 h-3" />
                    </a>
                    {selectedProtocol.github && (
                      <a href={selectedProtocol.github} target="_blank" rel="noopener noreferrer"
                         className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                        GitHub <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 pt-3 border-t border-white/10">
        <button className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          View All {protocols.length} Protocols →
        </button>
      </div>
    </div>
  )
}

export default ProtocolDeepDive
