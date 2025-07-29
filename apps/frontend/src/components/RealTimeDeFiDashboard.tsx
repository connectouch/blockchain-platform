import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity, 
  Zap, 
  Shield, 
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { useRealTimeDeFi, useRealTimeMarketData } from '../hooks/useRealTimeData'

interface DeFiProtocolDisplay {
  id: string
  name: string
  symbol: string
  category: string
  tvl: number
  change_1d: number
  change_7d: number
  apy: number
  volume24h: number
  users: number
  riskScore: string
  chain: string
  logo?: string
  isRealTime: boolean
}

const RealTimeDeFiDashboard: React.FC = () => {
  const { protocols, isLoading, error, refresh, isConnected } = useRealTimeDeFi()
  const { marketData } = useRealTimeMarketData()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'tvl' | 'apy' | 'volume' | 'change'>('tvl')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter and sort protocols
  const filteredProtocols = protocols
    .filter(protocol => selectedCategory === 'all' || protocol.category === selectedCategory)
    .sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (sortBy) {
        case 'tvl':
          aValue = a.tvl || 0
          bValue = b.tvl || 0
          break
        case 'apy':
          aValue = parseFloat(a.apy as any) || 0
          bValue = parseFloat(b.apy as any) || 0
          break
        case 'volume':
          aValue = a.volume24h || 0
          bValue = b.volume24h || 0
          break
        case 'change':
          aValue = a.change_1d || 0
          bValue = b.change_1d || 0
          break
        default:
          aValue = a.tvl || 0
          bValue = b.tvl || 0
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

  // Calculate total metrics
  const totalTVL = protocols.reduce((sum, p) => sum + (p.tvl || 0), 0)
  const totalVolume24h = protocols.reduce((sum, p) => sum + (p.volume24h || 0), 0)
  const avgAPY = protocols.reduce((sum, p) => sum + (parseFloat(p.apy as any) || 0), 0) / protocols.length
  const totalUsers = protocols.reduce((sum, p) => sum + (p.users || 0), 0)

  const categories = ['all', 'lending', 'dex', 'yield-farming', 'staking', 'derivatives']

  const getRiskColor = (riskScore: string) => {
    switch (riskScore?.toLowerCase()) {
      case 'low': return 'text-green-400 bg-green-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'high': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const formatNumber = (num: number, prefix = '') => {
    if (num >= 1e9) return `${prefix}${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${prefix}${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${prefix}${(num / 1e3).toFixed(1)}K`
    return `${prefix}${num.toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-Time Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Real-Time DeFi Dashboard</h2>
          <p className="text-white/60">Live protocol data and yield opportunities</p>
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

      {/* Real-Time Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-400" />
            {protocols.length > 0 && protocols[0]?.isRealTime && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(totalTVL, '$')}</p>
          <p className="text-white/60 text-sm">Total Value Locked</p>
          <div className="text-xs text-green-400 mt-2">
            {protocols.length} protocols tracked
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-blue-400" />
            {protocols.length > 0 && protocols[0]?.isRealTime && (
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(totalVolume24h, '$')}</p>
          <p className="text-white/60 text-sm">24h Volume</p>
          <div className="text-xs text-blue-400 mt-2">
            Across all protocols
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-yellow-400" />
            {protocols.length > 0 && protocols[0]?.isRealTime && (
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-2xl font-bold text-white">{avgAPY.toFixed(1)}%</p>
          <p className="text-white/60 text-sm">Average APY</p>
          <div className="text-xs text-yellow-400 mt-2">
            Real-time yields
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-purple-400" />
            {protocols.length > 0 && protocols[0]?.isRealTime && (
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(totalUsers)}</p>
          <p className="text-white/60 text-sm">Active Users</p>
          <div className="text-xs text-purple-400 mt-2">
            24h active users
          </div>
        </motion.div>
      </div>

      {/* Category Filter and Sort Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white/10 text-white rounded-lg px-3 py-2 text-sm border border-white/20 focus:border-blue-400 focus:outline-none"
          >
            {categories.map(category => (
              <option key={category} value={category} className="bg-gray-800">
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/10 text-white rounded-lg px-3 py-2 text-sm border border-white/20 focus:border-blue-400 focus:outline-none"
          >
            <option value="tvl" className="bg-gray-800">TVL</option>
            <option value="apy" className="bg-gray-800">APY</option>
            <option value="volume" className="bg-gray-800">Volume</option>
            <option value="change" className="bg-gray-800">24h Change</option>
          </select>
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-2 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
        >
          {sortOrder === 'desc' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
          <span>{sortOrder === 'desc' ? 'Descending' : 'Ascending'}</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-card p-4 border border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span>Error loading DeFi data: {error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && protocols.length === 0 && (
        <div className="glass-card p-8 text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading real-time DeFi protocols...</p>
        </div>
      )}

      {/* Protocols Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredProtocols.map((protocol, index) => (
            <motion.div
              key={protocol.id || protocol.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6 hover:bg-white/5 transition-colors relative group"
            >
              {/* Real-time indicator */}
              {protocol.isRealTime && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}

              {/* Protocol Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {protocol.logo ? (
                    <img src={protocol.logo} alt={protocol.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {protocol.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{protocol.name}</h3>
                    <p className="text-white/60 text-sm">{protocol.category}</p>
                  </div>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(protocol.riskScore)}`}>
                  {protocol.riskScore} Risk
                </div>
              </div>

              {/* Protocol Metrics */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">TVL</span>
                  <span className="text-white font-semibold">{formatNumber(protocol.tvl, '$')}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">APY</span>
                  <span className="text-green-400 font-semibold">
                    {(() => {
                      const apy = parseFloat(protocol.apy as any);
                      return !isNaN(apy) ? apy.toFixed(2) : '0.00';
                    })()}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">24h Volume</span>
                  <span className="text-white font-semibold">{formatNumber(protocol.volume24h, '$')}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">24h Change</span>
                  <span className={`font-semibold ${
                    protocol.change_1d >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {protocol.change_1d >= 0 ? '+' : ''}{protocol.change_1d?.toFixed(2)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Users</span>
                  <span className="text-white font-semibold">{formatNumber(protocol.users)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Chain</span>
                  <span className="text-blue-400 font-semibold">{protocol.chain}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors group-hover:bg-blue-500/40">
                  <span>View Protocol</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              {/* Last Updated */}
              <div className="text-xs text-white/40 mt-2 text-center">
                {protocol.isRealTime ? 'Live data' : 'Cached data'} • 
                Updated: {protocol.lastUpdated ? new Date(protocol.lastUpdated).toLocaleTimeString() : 'Unknown'}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!isLoading && filteredProtocols.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Shield className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60 mb-2">No DeFi protocols found</p>
          <p className="text-white/40 text-sm">
            {selectedCategory !== 'all' 
              ? `No protocols in the ${selectedCategory} category` 
              : 'Try refreshing or check your connection'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default RealTimeDeFiDashboard
