import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Star,
  Crown,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Calendar,
  Award,
  Zap
} from 'lucide-react'
import { NFTLocalImage } from './ui/LocalImage'

interface NFTHolding {
  id: string
  tokenId: string
  contractAddress: string
  collectionName: string
  name: string
  image: string
  currentFloorPrice: number
  purchasePrice: number
  purchaseDate: string
  lastSalePrice?: number
  estimatedValue: number
  rarityRank?: number
  rarityScore?: number
  traits: Array<{
    traitType: string
    value: string
    rarity: number
  }>
  chain: string
  marketplace: string
  isListed: boolean
  listingPrice?: number
}

interface PortfolioMetrics {
  totalValue: number
  totalCost: number
  totalPnL: number
  totalPnLPercent: number
  bestPerformer: NFTHolding | null
  worstPerformer: NFTHolding | null
  totalHoldings: number
  uniqueCollections: number
  averageHoldingPeriod: number
  totalFloorValue: number
}

interface NFTPortfolioTrackerProps {
  walletAddress?: string
  isConnected?: boolean
}

const NFTPortfolioTracker: React.FC<NFTPortfolioTrackerProps> = ({ 
  walletAddress,
  isConnected = false 
}) => {
  const [holdings, setHoldings] = useState<NFTHolding[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCollection, setFilterCollection] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'value' | 'pnl' | 'rarity' | 'date'>('value')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedNFT, setSelectedNFT] = useState<NFTHolding | null>(null)

  // Generate mock portfolio data
  useEffect(() => {
    if (isConnected && walletAddress) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        const mockHoldings: NFTHolding[] = [
          {
            id: '1',
            tokenId: '1234',
            contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
            collectionName: 'Bored Ape Yacht Club',
            name: 'Bored Ape #1234',
            image: '/api/placeholder/300/300',
            currentFloorPrice: 12.5,
            purchasePrice: 8.2,
            purchaseDate: '2023-06-15',
            estimatedValue: 14.8,
            rarityRank: 156,
            rarityScore: 8.7,
            traits: [
              { traitType: 'Background', value: 'Blue', rarity: 12.5 },
              { traitType: 'Fur', value: 'Golden Brown', rarity: 8.3 },
              { traitType: 'Eyes', value: 'Laser Eyes', rarity: 2.1 }
            ],
            chain: 'ethereum',
            marketplace: 'opensea',
            isListed: false
          },
          {
            id: '2',
            tokenId: '5678',
            contractAddress: '0xed5af388653567af2f388e6224dc7c4b3241c544',
            collectionName: 'Azuki',
            name: 'Azuki #5678',
            image: '/api/placeholder/300/300',
            currentFloorPrice: 4.8,
            purchasePrice: 6.1,
            purchaseDate: '2023-08-22',
            estimatedValue: 5.2,
            rarityRank: 892,
            rarityScore: 6.4,
            traits: [
              { traitType: 'Type', value: 'Human', rarity: 45.2 },
              { traitType: 'Hair', value: 'Pink Hairband', rarity: 15.7 },
              { traitType: 'Clothing', value: 'Red Hoodie', rarity: 8.9 }
            ],
            chain: 'ethereum',
            marketplace: 'opensea',
            isListed: true,
            listingPrice: 5.5
          },
          {
            id: '3',
            tokenId: '9999',
            contractAddress: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb',
            collectionName: 'CryptoPunks',
            name: 'CryptoPunk #9999',
            image: '/api/placeholder/300/300',
            currentFloorPrice: 45.2,
            purchasePrice: 32.8,
            purchaseDate: '2023-03-10',
            estimatedValue: 48.5,
            rarityRank: 45,
            rarityScore: 9.2,
            traits: [
              { traitType: 'Type', value: 'Alien', rarity: 0.09 },
              { traitType: 'Accessory', value: 'Headband', rarity: 5.1 }
            ],
            chain: 'ethereum',
            marketplace: 'opensea',
            isListed: false
          }
        ]
        setHoldings(mockHoldings)
        setIsLoading(false)
      }, 1500)
    }
  }, [isConnected, walletAddress])

  // Calculate portfolio metrics
  const calculateMetrics = (): PortfolioMetrics => {
    if (holdings.length === 0) {
      return {
        totalValue: 0,
        totalCost: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
        bestPerformer: null,
        worstPerformer: null,
        totalHoldings: 0,
        uniqueCollections: 0,
        averageHoldingPeriod: 0,
        totalFloorValue: 0
      }
    }

    const totalValue = holdings.reduce((sum, nft) => sum + nft.estimatedValue, 0)
    const totalCost = holdings.reduce((sum, nft) => sum + nft.purchasePrice, 0)
    const totalPnL = totalValue - totalCost
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0
    const totalFloorValue = holdings.reduce((sum, nft) => sum + nft.currentFloorPrice, 0)

    const bestPerformer = holdings.reduce((best, current) => {
      const currentPnL = ((current.estimatedValue - current.purchasePrice) / current.purchasePrice) * 100
      const bestPnL = best ? ((best.estimatedValue - best.purchasePrice) / best.purchasePrice) * 100 : -Infinity
      return currentPnL > bestPnL ? current : best
    }, null as NFTHolding | null)

    const worstPerformer = holdings.reduce((worst, current) => {
      const currentPnL = ((current.estimatedValue - current.purchasePrice) / current.purchasePrice) * 100
      const worstPnL = worst ? ((worst.estimatedValue - worst.purchasePrice) / worst.purchasePrice) * 100 : Infinity
      return currentPnL < worstPnL ? current : worst
    }, null as NFTHolding | null)

    const uniqueCollections = new Set(holdings.map(nft => nft.collectionName)).size

    const now = new Date()
    const averageHoldingPeriod = holdings.reduce((sum, nft) => {
      const purchaseDate = new Date(nft.purchaseDate)
      const daysDiff = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))
      return sum + daysDiff
    }, 0) / holdings.length

    return {
      totalValue,
      totalCost,
      totalPnL,
      totalPnLPercent,
      bestPerformer,
      worstPerformer,
      totalHoldings: holdings.length,
      uniqueCollections,
      averageHoldingPeriod,
      totalFloorValue
    }
  }

  const metrics = calculateMetrics()

  // Filter and sort holdings
  const filteredHoldings = holdings
    .filter(nft => {
      const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           nft.collectionName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCollection = filterCollection === 'all' || nft.collectionName === filterCollection
      return matchesSearch && matchesCollection
    })
    .sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (sortBy) {
        case 'value':
          aValue = a.estimatedValue
          bValue = b.estimatedValue
          break
        case 'pnl':
          aValue = ((a.estimatedValue - a.purchasePrice) / a.purchasePrice) * 100
          bValue = ((b.estimatedValue - b.purchasePrice) / b.purchasePrice) * 100
          break
        case 'rarity':
          aValue = a.rarityRank || 999999
          bValue = b.rarityRank || 999999
          break
        case 'date':
          aValue = new Date(a.purchaseDate).getTime()
          bValue = new Date(b.purchaseDate).getTime()
          break
        default:
          aValue = a.estimatedValue
          bValue = b.estimatedValue
      }
      
      const multiplier = sortOrder === 'desc' ? -1 : 1
      return (aValue > bValue ? 1 : -1) * multiplier
    })

  // Get unique collections for filter
  const collections = ['all', ...Array.from(new Set(holdings.map(nft => nft.collectionName)))]

  // Format numbers
  const formatETH = (value: number): string => {
    return `${value.toFixed(3)} ETH`
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatPercent = (percent: number): string => {
    const sign = percent >= 0 ? '+' : ''
    return `${sign}${percent.toFixed(2)}%`
  }

  const getPerformanceColor = (percent: number): string => {
    if (percent > 0) return 'text-green-400'
    if (percent < 0) return 'text-red-400'
    return 'text-white/60'
  }

  const getPerformanceIcon = (percent: number) => {
    if (percent > 0) return <TrendingUp className="w-4 h-4" />
    if (percent < 0) return <TrendingDown className="w-4 h-4" />
    return null
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Wallet className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-white/60 mb-6">Connect your wallet to view your NFT portfolio</p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">NFT Portfolio</h2>
          <p className="text-white/60">Track your NFT holdings and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLoading(true)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
        </div>
      </div>

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 text-center">
          <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Total Value</h3>
          <p className="text-2xl font-bold text-green-400">{formatETH(metrics.totalValue)}</p>
          <p className="text-sm text-white/60 mt-1">Floor: {formatETH(metrics.totalFloorValue)}</p>
        </div>

        <div className="glass-card p-6 text-center">
          <Activity className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Total P&L</h3>
          <p className={`text-2xl font-bold ${getPerformanceColor(metrics.totalPnLPercent)}`}>
            {formatETH(metrics.totalPnL)}
          </p>
          <p className={`text-sm mt-1 ${getPerformanceColor(metrics.totalPnLPercent)}`}>
            {formatPercent(metrics.totalPnLPercent)}
          </p>
        </div>

        <div className="glass-card p-6 text-center">
          <Crown className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Holdings</h3>
          <p className="text-2xl font-bold text-purple-400">{metrics.totalHoldings}</p>
          <p className="text-sm text-white/60 mt-1">{metrics.uniqueCollections} collections</p>
        </div>

        <div className="glass-card p-6 text-center">
          <Calendar className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Avg Hold</h3>
          <p className="text-2xl font-bold text-yellow-400">{Math.round(metrics.averageHoldingPeriod)}</p>
          <p className="text-sm text-white/60 mt-1">days</p>
        </div>
      </div>

      {/* Performance Highlights */}
      {(metrics.bestPerformer || metrics.worstPerformer) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.bestPerformer && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-bold text-white">Best Performer</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{metrics.bestPerformer.name}</h4>
                  <p className="text-white/60 text-sm">{metrics.bestPerformer.collectionName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-green-400 font-medium">
                      {formatPercent(((metrics.bestPerformer.estimatedValue - metrics.bestPerformer.purchasePrice) / metrics.bestPerformer.purchasePrice) * 100)}
                    </span>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {metrics.worstPerformer && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingDown className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-bold text-white">Worst Performer</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{metrics.worstPerformer.name}</h4>
                  <p className="text-white/60 text-sm">{metrics.worstPerformer.collectionName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-red-400 font-medium">
                      {formatPercent(((metrics.worstPerformer.estimatedValue - metrics.worstPerformer.purchasePrice) / metrics.worstPerformer.purchasePrice) * 100)}
                    </span>
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search your NFTs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={filterCollection}
            onChange={(e) => setFilterCollection(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            {collections.map(collection => (
              <option key={collection} value={collection} className="bg-gray-800">
                {collection === 'all' ? 'All Collections' : collection}
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
            <option value="value-desc" className="bg-gray-800">Value (High to Low)</option>
            <option value="value-asc" className="bg-gray-800">Value (Low to High)</option>
            <option value="pnl-desc" className="bg-gray-800">P&L (High to Low)</option>
            <option value="pnl-asc" className="bg-gray-800">P&L (Low to High)</option>
            <option value="rarity-asc" className="bg-gray-800">Rarity (Rare to Common)</option>
            <option value="rarity-desc" className="bg-gray-800">Rarity (Common to Rare)</option>
            <option value="date-desc" className="bg-gray-800">Date (Newest First)</option>
            <option value="date-asc" className="bg-gray-800">Date (Oldest First)</option>
          </select>
        </div>
      </div>

      {/* Holdings Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="w-full h-48 bg-white/10 rounded-lg mb-4"></div>
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-6 bg-white/10 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-white/10 rounded"></div>
                <div className="h-3 bg-white/10 rounded"></div>
                <div className="h-3 bg-white/10 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredHoldings.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredHoldings.map((nft, index) => {
            const pnl = nft.estimatedValue - nft.purchasePrice
            const pnlPercent = (pnl / nft.purchasePrice) * 100

            return (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer ${
                  viewMode === 'list' ? 'flex items-center gap-6' : ''
                }`}
                onClick={() => setSelectedNFT(nft)}
              >
                {/* NFT Image */}
                <div className={`${viewMode === 'list' ? 'w-20 h-20' : 'w-full h-48'} mb-4 overflow-hidden relative`}>
                  <NFTLocalImage
                    identifier={nft.contractAddress}
                    fallbackName={nft.collectionName}
                    alt={nft.name}
                    size={viewMode === 'list' ? 'md' : 'xl'}
                    className="w-full h-full"
                  />
                  {nft.isListed && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Listed
                    </div>
                  )}
                  {nft.rarityRank && nft.rarityRank <= 100 && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded font-bold">
                      #{nft.rarityRank}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  {/* NFT Header */}
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-white mb-1">{nft.name}</h3>
                    <p className="text-white/60 text-sm">{nft.collectionName}</p>
                  </div>

                  {/* NFT Stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/60">Current Value</span>
                      <span className="text-white font-medium">{formatETH(nft.estimatedValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Purchase Price</span>
                      <span className="text-white font-medium">{formatETH(nft.purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">P&L</span>
                      <div className={`flex items-center gap-1 ${getPerformanceColor(pnlPercent)}`}>
                        {getPerformanceIcon(pnlPercent)}
                        <span className="font-medium">{formatPercent(pnlPercent)}</span>
                      </div>
                    </div>
                    {nft.rarityRank && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Rarity Rank</span>
                        <span className="text-yellow-400 font-medium">#{nft.rarityRank}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/60 capitalize">{nft.chain}</span>
                      <span className="text-xs text-white/60">•</span>
                      <span className="text-xs text-white/60">{new Date(nft.purchaseDate).toLocaleDateString()}</span>
                    </div>
                    <button className="text-purple-400 hover:text-purple-300 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No NFTs Found</h3>
          <p className="text-white/60">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}

export default NFTPortfolioTracker
