import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star,
  Crown,
  Zap,
  BarChart3,
  PieChart,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Award,
  Target,
  Sparkles,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  Info
} from 'lucide-react'

interface TraitData {
  traitType: string
  value: string
  count: number
  rarity: number
  floorPrice?: number
  averagePrice?: number
  totalSupply: number
}

interface NFTRarity {
  tokenId: string
  name: string
  image: string
  rarityRank: number
  rarityScore: number
  traits: TraitData[]
  estimatedValue: number
  lastSalePrice?: number
  collectionName: string
}

interface CollectionRarityData {
  name: string
  totalSupply: number
  traits: {
    [traitType: string]: {
      [value: string]: {
        count: number
        rarity: number
        floorPrice?: number
      }
    }
  }
  rarityDistribution: {
    legendary: number // 0-1%
    epic: number      // 1-5%
    rare: number      // 5-15%
    uncommon: number  // 15-35%
    common: number    // 35-100%
  }
}

interface NFTRarityToolsProps {
  selectedCollection?: string
  collections: string[]
}

const NFTRarityTools: React.FC<NFTRarityToolsProps> = ({ 
  selectedCollection,
  collections = []
}) => {
  const [activeTab, setActiveTab] = useState<'rarity' | 'traits' | 'rankings'>('rarity')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTraitType, setSelectedTraitType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'rarity' | 'price' | 'count'>('rarity')
  const [isLoading, setIsLoading] = useState(false)
  const [collectionData, setCollectionData] = useState<CollectionRarityData | null>(null)
  const [topNFTs, setTopNFTs] = useState<NFTRarity[]>([])

  // Generate mock rarity data
  useEffect(() => {
    if (selectedCollection) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        const mockCollectionData: CollectionRarityData = {
          name: selectedCollection,
          totalSupply: 10000,
          traits: {
            'Background': {
              'Laser Eyes': { count: 21, rarity: 0.21, floorPrice: 45.2 },
              'Golden': { count: 156, rarity: 1.56, floorPrice: 18.7 },
              'Blue': { count: 1250, rarity: 12.5, floorPrice: 8.3 },
              'Green': { count: 2890, rarity: 28.9, floorPrice: 4.2 },
              'None': { count: 5683, rarity: 56.83, floorPrice: 2.1 }
            },
            'Fur': {
              'Zombie': { count: 88, rarity: 0.88, floorPrice: 32.1 },
              'Golden Brown': { count: 627, rarity: 6.27, floorPrice: 12.4 },
              'Brown': { count: 3456, rarity: 34.56, floorPrice: 5.8 },
              'Gray': { count: 5829, rarity: 58.29, floorPrice: 3.2 }
            },
            'Eyes': {
              'Laser Eyes': { count: 44, rarity: 0.44, floorPrice: 89.5 },
              'Hypnotized': { count: 321, rarity: 3.21, floorPrice: 25.7 },
              'Sleepy': { count: 1876, rarity: 18.76, floorPrice: 7.9 },
              'Bored': { count: 7759, rarity: 77.59, floorPrice: 4.1 }
            }
          },
          rarityDistribution: {
            legendary: 1,    // 0-1%
            epic: 4,         // 1-5%
            rare: 10,        // 5-15%
            uncommon: 20,    // 15-35%
            common: 65       // 35-100%
          }
        }

        const mockTopNFTs: NFTRarity[] = [
          {
            tokenId: '1',
            name: `${selectedCollection} #1`,
            image: '/api/placeholder/300/300',
            rarityRank: 1,
            rarityScore: 2847.3,
            estimatedValue: 156.8,
            lastSalePrice: 142.3,
            collectionName: selectedCollection,
            traits: [
              { traitType: 'Background', value: 'Laser Eyes', count: 21, rarity: 0.21, totalSupply: 10000 },
              { traitType: 'Fur', value: 'Zombie', count: 88, rarity: 0.88, totalSupply: 10000 },
              { traitType: 'Eyes', value: 'Laser Eyes', count: 44, rarity: 0.44, totalSupply: 10000 }
            ]
          },
          {
            tokenId: '2',
            name: `${selectedCollection} #2`,
            image: '/api/placeholder/300/300',
            rarityRank: 2,
            rarityScore: 2156.7,
            estimatedValue: 98.4,
            lastSalePrice: 89.2,
            collectionName: selectedCollection,
            traits: [
              { traitType: 'Background', value: 'Golden', count: 156, rarity: 1.56, totalSupply: 10000 },
              { traitType: 'Fur', value: 'Zombie', count: 88, rarity: 0.88, totalSupply: 10000 },
              { traitType: 'Eyes', value: 'Hypnotized', count: 321, rarity: 3.21, totalSupply: 10000 }
            ]
          }
        ]

        setCollectionData(mockCollectionData)
        setTopNFTs(mockTopNFTs)
        setIsLoading(false)
      }, 1000)
    }
  }, [selectedCollection])

  // Get rarity tier
  const getRarityTier = (rarity: number): { tier: string; color: string; icon: React.ReactNode } => {
    if (rarity <= 1) return { tier: 'Legendary', color: 'text-yellow-400', icon: <Crown className="w-4 h-4" /> }
    if (rarity <= 5) return { tier: 'Epic', color: 'text-purple-400', icon: <Sparkles className="w-4 h-4" /> }
    if (rarity <= 15) return { tier: 'Rare', color: 'text-blue-400', icon: <Star className="w-4 h-4" /> }
    if (rarity <= 35) return { tier: 'Uncommon', color: 'text-green-400', icon: <Zap className="w-4 h-4" /> }
    return { tier: 'Common', color: 'text-gray-400', icon: <Target className="w-4 h-4" /> }
  }

  // Format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatETH = (value: number): string => {
    return `${value.toFixed(3)} ETH`
  }

  if (!selectedCollection) {
    return (
      <div className="text-center py-12">
        <Crown className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Select a Collection</h3>
        <p className="text-white/60">Choose a collection to analyze rarity and traits</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Rarity Tools</h2>
          <p className="text-white/60">Analyze traits, rarity scores, and collection insights</p>
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

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { id: 'rarity', label: 'Rarity Overview', icon: <Crown className="w-4 h-4" /> },
          { id: 'traits', label: 'Trait Analysis', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'rankings', label: 'Top Rankings', icon: <Award className="w-4 h-4" /> }
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
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-4"></div>
                <div className="h-8 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'rarity' && collectionData && (
              <div className="space-y-6">
                {/* Rarity Distribution */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Rarity Distribution</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(collectionData.rarityDistribution).map(([tier, percentage]) => {
                      const { color, icon } = getRarityTier(tier === 'legendary' ? 0.5 : tier === 'epic' ? 3 : tier === 'rare' ? 10 : tier === 'uncommon' ? 25 : 50)
                      return (
                        <div key={tier} className="text-center">
                          <div className={`w-12 h-12 ${color.replace('text-', 'bg-').replace('-400', '-400/20')} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                            <div className={color}>{icon}</div>
                          </div>
                          <h4 className={`font-bold capitalize ${color} mb-1`}>{tier}</h4>
                          <p className="text-2xl font-bold text-white">{percentage}%</p>
                          <p className="text-sm text-white/60">{Math.round(collectionData.totalSupply * percentage / 100)} items</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Collection Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card p-6 text-center">
                    <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-1">Total Supply</h3>
                    <p className="text-2xl font-bold text-blue-400">{formatNumber(collectionData.totalSupply)}</p>
                  </div>

                  <div className="glass-card p-6 text-center">
                    <BarChart3 className="w-8 h-8 text-green-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-1">Trait Types</h3>
                    <p className="text-2xl font-bold text-green-400">{Object.keys(collectionData.traits).length}</p>
                  </div>

                  <div className="glass-card p-6 text-center">
                    <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-1">Unique Traits</h3>
                    <p className="text-2xl font-bold text-purple-400">
                      {Object.values(collectionData.traits).reduce((sum, traitType) => sum + Object.keys(traitType).length, 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'traits' && collectionData && (
              <div className="space-y-6">
                {/* Trait Filters */}
                <div className="flex gap-4">
                  <select
                    value={selectedTraitType}
                    onChange={(e) => setSelectedTraitType(e.target.value)}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="all" className="bg-gray-800">All Trait Types</option>
                    {Object.keys(collectionData.traits).map(traitType => (
                      <option key={traitType} value={traitType} className="bg-gray-800">
                        {traitType}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="rarity" className="bg-gray-800">Sort by Rarity</option>
                    <option value="price" className="bg-gray-800">Sort by Floor Price</option>
                    <option value="count" className="bg-gray-800">Sort by Count</option>
                  </select>
                </div>

                {/* Traits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(collectionData.traits)
                    .filter(([traitType]) => selectedTraitType === 'all' || traitType === selectedTraitType)
                    .flatMap(([traitType, values]) =>
                      Object.entries(values).map(([value, data]) => ({
                        traitType,
                        value,
                        ...data
                      }))
                    )
                    .sort((a, b) => {
                      switch (sortBy) {
                        case 'rarity':
                          return a.rarity - b.rarity
                        case 'price':
                          return (b.floorPrice || 0) - (a.floorPrice || 0)
                        case 'count':
                          return b.count - a.count
                        default:
                          return a.rarity - b.rarity
                      }
                    })
                    .map((trait, index) => {
                      const { tier, color, icon } = getRarityTier(trait.rarity)
                      return (
                        <motion.div
                          key={`${trait.traitType}-${trait.value}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className="glass-card p-6 hover:scale-105 transition-transform duration-300"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className={`flex items-center gap-2 ${color}`}>
                              {icon}
                              <span className="font-medium">{tier}</span>
                            </div>
                            <span className="text-white/60 text-sm">{trait.rarity.toFixed(2)}%</span>
                          </div>

                          <h4 className="text-white font-bold mb-1">{trait.value}</h4>
                          <p className="text-white/60 text-sm mb-4">{trait.traitType}</p>

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-white/60">Count:</span>
                              <span className="text-white">{trait.count}</span>
                            </div>
                            {trait.floorPrice && (
                              <div className="flex justify-between">
                                <span className="text-white/60">Floor:</span>
                                <span className="text-white">{formatETH(trait.floorPrice)}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
              </div>
            )}

            {activeTab === 'rankings' && (
              <div className="space-y-6">
                {/* Top NFTs */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Top Ranked NFTs</h3>
                  <div className="space-y-4">
                    {topNFTs.map((nft, index) => (
                      <motion.div
                        key={nft.tokenId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center gap-6 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold">
                            #{nft.rarityRank}
                          </div>
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg overflow-hidden">
                            <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                          </div>
                        </div>

                        <div className="flex-1">
                          <h4 className="text-white font-bold mb-1">{nft.name}</h4>
                          <p className="text-white/60 text-sm mb-2">Rarity Score: {nft.rarityScore.toFixed(1)}</p>
                          <div className="flex items-center gap-4">
                            <span className="text-green-400 font-medium">{formatETH(nft.estimatedValue)}</span>
                            {nft.lastSalePrice && (
                              <span className="text-white/60 text-sm">Last: {formatETH(nft.lastSalePrice)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {nft.traits.slice(0, 3).map((trait, i) => {
                            const { color, icon } = getRarityTier(trait.rarity)
                            return (
                              <div key={i} className={`p-2 rounded ${color.replace('text-', 'bg-').replace('-400', '-400/20')}`}>
                                <div className={color}>{icon}</div>
                              </div>
                            )
                          })}
                        </div>

                        <button className="text-purple-400 hover:text-purple-300 transition-colors">
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

export default NFTRarityTools
