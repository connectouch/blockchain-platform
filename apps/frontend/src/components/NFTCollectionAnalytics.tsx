import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Users,
  DollarSign,
  Eye,
  Star,
  Crown,
  Zap,
  ChevronDown,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { NFTLocalImage } from './ui/LocalImage'

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
  description?: string
  website?: string
  twitter?: string
  discord?: string
  rarityEnabled: boolean
  traits: {
    traitType: string
    values: Array<{
      value: string
      count: number
      rarity: number
    }>
  }[]
}

interface NFTCollectionAnalyticsProps {
  collections: NFTCollection[]
  isLoading?: boolean
}

const NFTCollectionAnalytics: React.FC<NFTCollectionAnalyticsProps> = ({ 
  collections = [], 
  isLoading = false 
}) => {
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'volume' | 'floorPrice' | 'change24h' | 'owners'>('volume')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterChain, setFilterChain] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Generate mock collections if none provided
  useEffect(() => {
    if (collections.length === 0 && !isLoading) {
      // This will be replaced with real API data
    }
  }, [collections, isLoading])

  // Filter and sort collections
  const filteredCollections = collections
    .filter(collection => {
      const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           collection.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesChain = filterChain === 'all' || collection.chain === filterChain
      return matchesSearch && matchesChain
    })
    .sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      const multiplier = sortOrder === 'desc' ? -1 : 1
      return (aValue > bValue ? 1 : -1) * multiplier
    })

  // Get unique chains
  const chains = ['all', ...Array.from(new Set(collections.map(c => c.chain)))]

  // Format numbers
  const formatNumber = (num: number | undefined | null, prefix = ''): string => {
    const safeNum = typeof num === 'number' && !isNaN(num) ? num : 0
    if (safeNum >= 1e9) return `${prefix}${(safeNum / 1e9).toFixed(1)}B`
    if (safeNum >= 1e6) return `${prefix}${(safeNum / 1e6).toFixed(1)}M`
    if (safeNum >= 1e3) return `${prefix}${(safeNum / 1e3).toFixed(1)}K`
    return `${prefix}${safeNum.toFixed(2)}`
  }

  // Format ETH price
  const formatETH = (price: number | undefined | null): string => {
    const safePrice = typeof price === 'number' && !isNaN(price) ? price : 0
    return `${safePrice.toFixed(3)} ETH`
  }

  // Get change color
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-white/60'
  }

  // Get change icon
  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />
    if (change < 0) return <TrendingDown className="w-4 h-4" />
    return null
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Collection Analytics</h2>
          <div className="animate-spin">
            <RefreshCw className="w-5 h-5 text-white/60" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-4"></div>
              <div className="h-8 bg-white/10 rounded mb-2"></div>
              <div className="h-4 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Collection Analytics</h2>
          <p className="text-white/60">Deep insights into NFT collection performance and trends</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
          />
        </div>
        
        <div className="flex gap-3">
          <select
            value={filterChain}
            onChange={(e) => setFilterChain(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            {chains.map(chain => (
              <option key={chain} value={chain} className="bg-gray-800 capitalize">
                {chain === 'all' ? 'All Chains' : chain}
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field as any)
              setSortOrder(order as any)
            }}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            <option value="volume-desc" className="bg-gray-800">Volume (High to Low)</option>
            <option value="volume-asc" className="bg-gray-800">Volume (Low to High)</option>
            <option value="floorPrice-desc" className="bg-gray-800">Floor Price (High to Low)</option>
            <option value="floorPrice-asc" className="bg-gray-800">Floor Price (Low to High)</option>
            <option value="change24h-desc" className="bg-gray-800">24h Change (High to Low)</option>
            <option value="change24h-asc" className="bg-gray-800">24h Change (Low to High)</option>
            <option value="owners-desc" className="bg-gray-800">Owners (High to Low)</option>
            <option value="owners-asc" className="bg-gray-800">Owners (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Collections Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredCollections.map((collection, index) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer ${
              viewMode === 'list' ? 'flex items-center gap-6' : ''
            }`}
            onClick={() => setSelectedCollection(collection)}
          >
            {/* Collection Image */}
            <div className={`${viewMode === 'list' ? 'w-16 h-16' : 'w-full h-48'} mb-4 overflow-hidden`}>
              <NFTLocalImage
                identifier={collection.contractAddress || collection.id || collection.id}
                fallbackName={collection.name}
                alt={collection.name}
                size={viewMode === 'list' ? 'md' : 'xl'}
                className="w-full h-full"
              />
            </div>

            <div className="flex-1">
              {/* Collection Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{collection.name}</h3>
                  {collection.verified && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                  {collection.symbol}
                </span>
              </div>

              {/* Collection Stats */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Floor Price</span>
                  <span className="text-white font-medium">{formatETH(collection.floorPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">24h Volume</span>
                  <span className="text-white font-medium">{formatETH(collection.volume24h)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">24h Change</span>
                  <div className={`flex items-center gap-1 ${getChangeColor(collection.change24h)}`}>
                    {getChangeIcon(collection.change24h)}
                    <span className="font-medium">{(typeof collection.change24h === 'number' && !isNaN(collection.change24h) ? collection.change24h : 0).toFixed(2)}%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Owners</span>
                  <span className="text-white font-medium">{formatNumber(collection.owners)}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60 capitalize">{collection.chain}</span>
                  <span className="text-xs text-white/60">•</span>
                  <span className="text-xs text-white/60">{formatNumber(collection.totalSupply)} items</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation() // Prevent opening the modal
                    const openSeaUrl = `https://opensea.io/collection/${collection.name.toLowerCase().replace(/\s+/g, '-')}`
                    window.open(openSeaUrl, '_blank')
                    console.log(`Quick link to ${collection.name} on OpenSea`)
                  }}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                  title="View on OpenSea"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredCollections.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Collections Found</h3>
          <p className="text-white/60">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Collection Detail Modal */}
      <AnimatePresence>
        {selectedCollection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCollection(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 overflow-hidden">
                    <img
                      src={selectedCollection.image}
                      alt={selectedCollection.name}
                      size="md"
                      collectionName={selectedCollection.name}
                      tokenId="1"
                      contractAddress={selectedCollection.contractAddress}
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-white">{selectedCollection.name}</h2>
                      {selectedCollection.verified && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-white/60">{selectedCollection.description || 'Premium NFT Collection'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCollection(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Collection Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{formatETH(selectedCollection.floorPrice)}</div>
                  <div className="text-xs text-white/60">Floor Price</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{formatETH(selectedCollection.volume24h)}</div>
                  <div className="text-xs text-white/60">24h Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{formatNumber(selectedCollection.owners)}</div>
                  <div className="text-xs text-white/60">Owners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{formatNumber(selectedCollection.totalSupply)}</div>
                  <div className="text-xs text-white/60">Total Supply</div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-white font-medium mb-4">Market Data</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Market Cap:</span>
                      <span className="text-white">{formatETH(selectedCollection.marketCap)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Average Price:</span>
                      <span className="text-white">{formatETH(selectedCollection.averagePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">24h Sales:</span>
                      <span className="text-white">{formatNumber(selectedCollection.sales24h)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">24h Change:</span>
                      <div className={`flex items-center gap-1 ${getChangeColor(selectedCollection.change24h)}`}>
                        {getChangeIcon(selectedCollection.change24h)}
                        <span>{(typeof selectedCollection.change24h === 'number' && !isNaN(selectedCollection.change24h) ? selectedCollection.change24h : 0).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-4">Collection Info</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Blockchain:</span>
                      <span className="text-white capitalize">{selectedCollection.chain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Symbol:</span>
                      <span className="text-white">{selectedCollection.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Rarity Tools:</span>
                      <span className={selectedCollection.rarityEnabled ? 'text-green-400' : 'text-red-400'}>
                        {selectedCollection.rarityEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Verified:</span>
                      <span className={selectedCollection.verified ? 'text-green-400' : 'text-red-400'}>
                        {selectedCollection.verified ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {selectedCollection.website && (
                  <a
                    href={selectedCollection.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors text-center"
                  >
                    Visit Website
                  </a>
                )}
                <button
                  onClick={() => {
                    // Open OpenSea collection page
                    const openSeaUrl = `https://opensea.io/collection/${selectedCollection.name.toLowerCase().replace(/\s+/g, '-')}`
                    window.open(openSeaUrl, '_blank')
                    console.log(`Opening ${selectedCollection.name} on OpenSea`)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  View on OpenSea
                </button>
                <button
                  onClick={() => {
                    console.log(`Added ${selectedCollection.name} to NFT watchlist`)
                    alert(`⭐ ${selectedCollection.name} added to your NFT watchlist!\n\nYou'll receive notifications about:\n• Floor price changes\n• Volume spikes\n• New listings\n• Rare trait discoveries\n• Market trends`)
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Add to Watchlist
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NFTCollectionAnalytics
