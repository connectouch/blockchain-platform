import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  ShoppingCart,
  Zap,
  Clock,
  Users,
  Star,
  Filter,
  Search,
  RefreshCw,
  Activity,
  BarChart3
} from 'lucide-react'

interface MarketplaceListing {
  id: string
  tokenId: string
  contractAddress: string
  collectionName: string
  name: string
  image: string
  price: number
  currency: 'ETH' | 'WETH' | 'USDC'
  marketplace: 'opensea' | 'blur' | 'looksrare' | 'x2y2'
  seller: string
  listingTime: string
  expirationTime?: string
  rarityRank?: number
  lastSalePrice?: number
  priceChange24h?: number
  views: number
  favorites: number
  isAuction: boolean
  topBid?: number
  bidCount?: number
}

interface MarketplaceStats {
  totalListings: number
  totalVolume24h: number
  averagePrice: number
  floorPrice: number
  topSale24h: number
  activeAuctions: number
  uniqueSellers: number
  priceChange24h: number
}

interface NFTMarketplaceIntegrationProps {
  selectedCollection?: string
  collections: string[]
}

const NFTMarketplaceIntegration: React.FC<NFTMarketplaceIntegrationProps> = ({ 
  selectedCollection,
  collections = []
}) => {
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [stats, setStats] = useState<MarketplaceStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 })
  const [sortBy, setSortBy] = useState<'price' | 'rarity' | 'time' | 'views'>('price')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')

  // Generate mock marketplace data
  useEffect(() => {
    if (selectedCollection) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        const mockListings: MarketplaceListing[] = [
          {
            id: '1',
            tokenId: '1234',
            contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
            collectionName: selectedCollection,
            name: `${selectedCollection} #1234`,
            image: '/api/placeholder/300/300',
            price: 12.5,
            currency: 'ETH',
            marketplace: 'opensea',
            seller: '0x1234...5678',
            listingTime: '2024-01-15T10:30:00Z',
            expirationTime: '2024-01-22T10:30:00Z',
            rarityRank: 156,
            lastSalePrice: 10.2,
            priceChange24h: 22.5,
            views: 1250,
            favorites: 89,
            isAuction: false
          },
          {
            id: '2',
            tokenId: '5678',
            contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
            collectionName: selectedCollection,
            name: `${selectedCollection} #5678`,
            image: '/api/placeholder/300/300',
            price: 8.9,
            currency: 'ETH',
            marketplace: 'blur',
            seller: '0x9876...5432',
            listingTime: '2024-01-15T14:20:00Z',
            rarityRank: 892,
            lastSalePrice: 9.5,
            priceChange24h: -6.3,
            views: 567,
            favorites: 34,
            isAuction: true,
            topBid: 7.8,
            bidCount: 5
          },
          {
            id: '3',
            tokenId: '9999',
            contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
            collectionName: selectedCollection,
            name: `${selectedCollection} #9999`,
            image: '/api/placeholder/300/300',
            price: 45.2,
            currency: 'ETH',
            marketplace: 'opensea',
            seller: '0x5555...7777',
            listingTime: '2024-01-14T09:15:00Z',
            rarityRank: 23,
            lastSalePrice: 42.1,
            priceChange24h: 7.4,
            views: 2890,
            favorites: 234,
            isAuction: false
          }
        ]

        const mockStats: MarketplaceStats = {
          totalListings: 1247,
          totalVolume24h: 892.5,
          averagePrice: 15.7,
          floorPrice: 8.2,
          topSale24h: 156.8,
          activeAuctions: 89,
          uniqueSellers: 456,
          priceChange24h: 12.3
        }

        setListings(mockListings)
        setStats(mockStats)
        setIsLoading(false)
      }, 1000)
    }
  }, [selectedCollection])

  // Filter and sort listings
  const filteredListings = listings
    .filter(listing => {
      const matchesSearch = listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           listing.tokenId.includes(searchTerm)
      const matchesMarketplace = selectedMarketplace === 'all' || listing.marketplace === selectedMarketplace
      const matchesPrice = listing.price >= priceRange.min && listing.price <= priceRange.max
      return matchesSearch && matchesMarketplace && matchesPrice
    })
    .sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (sortBy) {
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'rarity':
          aValue = a.rarityRank || 999999
          bValue = b.rarityRank || 999999
          break
        case 'time':
          aValue = new Date(a.listingTime).getTime()
          bValue = new Date(b.listingTime).getTime()
          break
        case 'views':
          aValue = a.views
          bValue = b.views
          break
        default:
          aValue = a.price
          bValue = b.price
      }
      
      const multiplier = sortOrder === 'desc' ? -1 : 1
      return (aValue > bValue ? 1 : -1) * multiplier
    })

  // Get marketplace icon
  const getMarketplaceIcon = (marketplace: string) => {
    switch (marketplace) {
      case 'opensea': return '🌊'
      case 'blur': return '💨'
      case 'looksrare': return '👀'
      case 'x2y2': return '❌'
      default: return '🏪'
    }
  }

  // Get marketplace color
  const getMarketplaceColor = (marketplace: string) => {
    switch (marketplace) {
      case 'opensea': return 'text-blue-400'
      case 'blur': return 'text-orange-400'
      case 'looksrare': return 'text-green-400'
      case 'x2y2': return 'text-purple-400'
      default: return 'text-white/60'
    }
  }

  // Format time
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  // Format numbers
  const formatETH = (value: number): string => {
    return `${value.toFixed(3)} ETH`
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-white/60'
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />
    if (change < 0) return <TrendingDown className="w-3 h-3" />
    return null
  }

  if (!selectedCollection) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Select a Collection</h3>
        <p className="text-white/60">Choose a collection to view marketplace listings</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Marketplace Integration</h2>
          <p className="text-white/60">Real-time listings from major NFT marketplaces</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCollection}
            onChange={(e) => {/* Handle collection change */}}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            {collections.map(collection => (
              <option key={collection} value={collection} className="bg-gray-800">
                {collection}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsLoading(true)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Marketplace Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="glass-card p-4 text-center">
            <Activity className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">Listings</h3>
            <p className="text-lg font-bold text-blue-400">{formatNumber(stats.totalListings)}</p>
          </div>

          <div className="glass-card p-4 text-center">
            <BarChart3 className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">24h Volume</h3>
            <p className="text-lg font-bold text-green-400">{formatETH(stats.totalVolume24h)}</p>
          </div>

          <div className="glass-card p-4 text-center">
            <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">Floor Price</h3>
            <p className="text-lg font-bold text-purple-400">{formatETH(stats.floorPrice)}</p>
          </div>

          <div className="glass-card p-4 text-center">
            <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">Avg Price</h3>
            <p className="text-lg font-bold text-yellow-400">{formatETH(stats.averagePrice)}</p>
          </div>

          <div className="glass-card p-4 text-center">
            <Zap className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">Top Sale</h3>
            <p className="text-lg font-bold text-orange-400">{formatETH(stats.topSale24h)}</p>
          </div>

          <div className="glass-card p-4 text-center">
            <Clock className="w-6 h-6 text-pink-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">Auctions</h3>
            <p className="text-lg font-bold text-pink-400">{stats.activeAuctions}</p>
          </div>

          <div className="glass-card p-4 text-center">
            <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">Sellers</h3>
            <p className="text-lg font-bold text-cyan-400">{formatNumber(stats.uniqueSellers)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by name or token ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
          />
        </div>
        
        <div className="flex gap-3">
          <select
            value={selectedMarketplace}
            onChange={(e) => setSelectedMarketplace(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all" className="bg-gray-800">All Marketplaces</option>
            <option value="opensea" className="bg-gray-800">OpenSea</option>
            <option value="blur" className="bg-gray-800">Blur</option>
            <option value="looksrare" className="bg-gray-800">LooksRare</option>
            <option value="x2y2" className="bg-gray-800">X2Y2</option>
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
            <option value="price-asc" className="bg-gray-800">Price (Low to High)</option>
            <option value="price-desc" className="bg-gray-800">Price (High to Low)</option>
            <option value="rarity-asc" className="bg-gray-800">Rarity (Rare to Common)</option>
            <option value="rarity-desc" className="bg-gray-800">Rarity (Common to Rare)</option>
            <option value="time-desc" className="bg-gray-800">Recently Listed</option>
            <option value="views-desc" className="bg-gray-800">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="w-full h-48 bg-white/10 rounded-lg mb-4"></div>
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-6 bg-white/10 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-white/10 rounded"></div>
                <div className="h-3 bg-white/10 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              {/* NFT Image */}
              <div className="w-full h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-4 overflow-hidden relative">
                <img src={listing.image} alt={listing.name} className="w-full h-full object-cover" />
                
                {/* Marketplace Badge */}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${getMarketplaceColor(listing.marketplace)} bg-black/60 backdrop-blur-sm`}>
                  {getMarketplaceIcon(listing.marketplace)} {listing.marketplace}
                </div>

                {/* Auction Badge */}
                {listing.isAuction && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded font-medium">
                    Auction
                  </div>
                )}

                {/* Rarity Badge */}
                {listing.rarityRank && listing.rarityRank <= 100 && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-yellow-500 text-black text-xs rounded font-bold">
                    #{listing.rarityRank}
                  </div>
                )}
              </div>

              {/* NFT Info */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-1">{listing.name}</h3>
                <p className="text-white/60 text-sm">Token #{listing.tokenId}</p>
              </div>

              {/* Price Info */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Price</span>
                  <span className="text-white font-bold text-lg">{formatETH(listing.price)}</span>
                </div>
                
                {listing.lastSalePrice && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Last Sale</span>
                    <div className="flex items-center gap-1">
                      <span className="text-white/80">{formatETH(listing.lastSalePrice)}</span>
                      {listing.priceChange24h && (
                        <div className={`flex items-center gap-1 ${getChangeColor(listing.priceChange24h)}`}>
                          {getChangeIcon(listing.priceChange24h)}
                          <span className="text-xs">{Math.abs(listing.priceChange24h).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {listing.isAuction && listing.topBid && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Top Bid</span>
                    <span className="text-green-400 font-medium">{formatETH(listing.topBid)}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-white/40" />
                  <span className="text-white/60">{formatNumber(listing.views)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-white/40" />
                  <span className="text-white/60">{listing.favorites}</span>
                </div>
                <span className="text-white/60">{formatTimeAgo(listing.listingTime)}</span>
              </div>

              {/* Action Button */}
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View on {listing.marketplace}
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Listings Found</h3>
          <p className="text-white/60">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}

export default NFTMarketplaceIntegration
