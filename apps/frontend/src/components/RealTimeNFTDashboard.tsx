import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Image, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Zap, 
  Eye,
  Wifi,
  WifiOff,
  RefreshCw,
  ExternalLink,
  Crown,
  DollarSign
} from 'lucide-react'
import { useRealTimeNFTs, useRealTimeMarketData } from '../hooks/useRealTimeData'

interface NFTCollection {
  id: string
  name: string
  symbol: string
  floorPrice: number
  volume24h: number
  change24h: number
  owners: number
  totalSupply: number
  marketCap: number
  averagePrice: number
  sales24h: number
  chain: string
  verified: boolean
  image?: string
  isRealTime: boolean
}

const RealTimeNFTDashboard: React.FC = () => {
  const { collections, isLoading, error, refresh, isConnected } = useRealTimeNFTs()
  const { marketData } = useRealTimeMarketData()
  const [selectedChain, setSelectedChain] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'volume' | 'floorPrice' | 'change' | 'owners'>('volume')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter and sort collections
  const filteredCollections = collections
    .filter(collection => selectedChain === 'all' || collection.chain?.toLowerCase() === selectedChain.toLowerCase())
    .sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (sortBy) {
        case 'volume':
          aValue = a.volume24h || 0
          bValue = b.volume24h || 0
          break
        case 'floorPrice':
          aValue = a.floorPrice || 0
          bValue = b.floorPrice || 0
          break
        case 'change':
          aValue = a.change24h || 0
          bValue = b.change24h || 0
          break
        case 'owners':
          aValue = a.owners || 0
          bValue = b.owners || 0
          break
        default:
          aValue = a.volume24h || 0
          bValue = b.volume24h || 0
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

  // Calculate total metrics
  const totalVolume24h = collections.reduce((sum, c) => sum + (c.volume24h || 0), 0)
  const totalSales24h = collections.reduce((sum, c) => sum + (c.sales24h || 0), 0)
  const totalOwners = collections.reduce((sum, c) => sum + (c.owners || 0), 0)
  const avgFloorPrice = collections.reduce((sum, c) => sum + (c.floorPrice || 0), 0) / collections.length

  const chains = ['all', 'ethereum', 'polygon', 'solana', 'bsc']

  const formatNumber = (num: number, prefix = '') => {
    if (num >= 1e9) return `${prefix}${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${prefix}${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${prefix}${(num / 1e3).toFixed(1)}K`
    return `${prefix}${num.toFixed(2)}`
  }

  const formatPrice = (price: number) => {
    if (price >= 1000) return `${price.toFixed(0)} ETH`
    if (price >= 1) return `${price.toFixed(2)} ETH`
    return `${price.toFixed(4)} ETH`
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-Time Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Real-Time NFT Dashboard</h2>
          <p className="text-white/60">Live NFT collection data and market trends</p>
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

      {/* Real-Time NFT Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-blue-400" />
            {collections.length > 0 && collections[0]?.isRealTime && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(totalVolume24h, '$')}</p>
          <p className="text-white/60 text-sm">24h Volume</p>
          <div className="text-xs text-blue-400 mt-2">
            Across {collections.length} collections
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-yellow-400" />
            {collections.length > 0 && collections[0]?.isRealTime && (
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(totalSales24h)}</p>
          <p className="text-white/60 text-sm">24h Sales</p>
          <div className="text-xs text-yellow-400 mt-2">
            Total transactions
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-purple-400" />
            {collections.length > 0 && collections[0]?.isRealTime && (
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(totalOwners)}</p>
          <p className="text-white/60 text-sm">Total Owners</p>
          <div className="text-xs text-purple-400 mt-2">
            Unique holders
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-400" />
            {collections.length > 0 && collections[0]?.isRealTime && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-2xl font-bold text-white">{formatPrice(avgFloorPrice)}</p>
          <p className="text-white/60 text-sm">Avg Floor Price</p>
          <div className="text-xs text-green-400 mt-2">
            Across all collections
          </div>
        </motion.div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Chain:</span>
          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            className="bg-white/10 text-white rounded-lg px-3 py-2 text-sm border border-white/20 focus:border-blue-400 focus:outline-none"
          >
            {chains.map(chain => (
              <option key={chain} value={chain} className="bg-gray-800">
                {chain === 'all' ? 'All Chains' : chain.charAt(0).toUpperCase() + chain.slice(1)}
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
            <option value="volume" className="bg-gray-800">Volume</option>
            <option value="floorPrice" className="bg-gray-800">Floor Price</option>
            <option value="change" className="bg-gray-800">24h Change</option>
            <option value="owners" className="bg-gray-800">Owners</option>
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
            <ExternalLink className="w-5 h-5" />
            <span>Error loading NFT data: {error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && collections.length === 0 && (
        <div className="glass-card p-8 text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading real-time NFT collections...</p>
        </div>
      )}

      {/* NFT Collections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCollections.map((collection, index) => (
            <motion.div
              key={collection.id || collection.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6 hover:bg-white/5 transition-colors relative group"
            >
              {/* Real-time indicator */}
              {collection.isRealTime && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}

              {/* Collection Header */}
              <div className="flex items-center gap-3 mb-4">
                {collection.image ? (
                  <img src={collection.image} alt={collection.name} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <Image className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">{collection.name}</h3>
                    {collection.verified && (
                      <Crown className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-white/60 text-sm">{collection.chain}</p>
                </div>
              </div>

              {/* Collection Metrics */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Floor Price</span>
                  <span className="text-white font-semibold">{formatPrice(collection.floorPrice)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">24h Volume</span>
                  <span className="text-white font-semibold">{formatNumber(collection.volume24h, '$')}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">24h Change</span>
                  <span className={`font-semibold ${
                    collection.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {collection.change24h >= 0 ? '+' : ''}{collection.change24h?.toFixed(2)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Owners</span>
                  <span className="text-white font-semibold">{formatNumber(collection.owners)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Total Supply</span>
                  <span className="text-white font-semibold">{formatNumber(collection.totalSupply)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">24h Sales</span>
                  <span className="text-white font-semibold">{formatNumber(collection.sales24h)}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors group-hover:bg-purple-500/40">
                  <Eye className="w-4 h-4" />
                  <span>View Collection</span>
                </button>
              </div>

              {/* Last Updated */}
              <div className="text-xs text-white/40 mt-2 text-center">
                {collection.isRealTime ? 'Live data' : 'Cached data'} • 
                Updated: {new Date().toLocaleTimeString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!isLoading && filteredCollections.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Image className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60 mb-2">No NFT collections found</p>
          <p className="text-white/40 text-sm">
            {selectedChain !== 'all' 
              ? `No collections on ${selectedChain}` 
              : 'Try refreshing or check your connection'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default RealTimeNFTDashboard
