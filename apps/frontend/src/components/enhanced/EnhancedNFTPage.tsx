/**
 * Enhanced NFT Page Component
 * Provides real-time NFT collection data and marketplace functionality
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Eye,
  Heart,
  ShoppingCart,
  ExternalLink,
  Filter,
  Search,
  Grid,
  List
} from 'lucide-react'
import { useComprehensiveRealTimeData } from '../../hooks/useComprehensiveRealTimeData'
import { NFTLocalImage } from '../ui/LocalImage'

const EnhancedNFTPage: React.FC = () => {
  const { nftCollections, isLoading, lastUpdate, error } = useComprehensiveRealTimeData()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Art', 'Gaming', 'Music', 'Sports', 'Utility', 'Metaverse']

  const formatCurrency = (value: number): string => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M ETH`
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K ETH`
    return `${value.toFixed(2)} ETH`
  }

  const formatPercent = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-white">Loading NFT collections...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">NFT Collections</h1>
          <p className="text-white/60">
            Real-time NFT data • Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-500/30 text-purple-400' : 'text-white/60'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-500/30 text-purple-400' : 'text-white/60'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg p-4 text-center transition-colors group">
          <ShoppingCart className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-white text-sm">Buy NFT</p>
        </button>
        
        <button className="bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg p-4 text-center transition-colors group">
          <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-white text-sm">Favorites</p>
        </button>
        
        <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg p-4 text-center transition-colors group">
          <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-white text-sm">Trending</p>
        </button>
        
        <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg p-4 text-center transition-colors group">
          <ExternalLink className="w-6 h-6 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-white text-sm">Marketplace</p>
        </button>
      </div>

      {/* NFT Collections Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {nftCollections.map((collection, index) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <NFTLocalImage
                identifier={collection.name.toLowerCase().replace(/\s+/g, '-')}
                alt={collection.name}
                size="lg"
                className="w-16 h-16 rounded-lg"
              />
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Heart className="w-4 h-4 text-white/60" />
                </button>
                <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <ExternalLink className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>

            <h3 className="text-white font-bold text-lg mb-2 group-hover:text-purple-400 transition-colors">
              {collection.name}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-white/60 text-sm">Floor Price</p>
                <p className="text-white font-medium">{collection.floorPrice.toFixed(2)} ETH</p>
                <p className={`text-sm ${collection.floorPriceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(collection.floorPriceChange24h)}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-sm">24h Volume</p>
                <p className="text-white font-medium">{formatCurrency(collection.volume24h)}</p>
                <p className={`text-sm ${collection.volumeChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(collection.volumeChange24h)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-white/60">
              <span>{collection.owners.toLocaleString()} owners</span>
              <span>{collection.totalSupply.toLocaleString()} items</span>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <button className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg py-2 text-purple-400 font-medium transition-colors">
                View Collection
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
          <p className="text-white/60 text-sm">Total Collections</p>
          <p className="text-2xl font-bold text-white">{nftCollections.length}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
          <p className="text-white/60 text-sm">Total Volume</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(nftCollections.reduce((sum, c) => sum + c.volume24h, 0))}
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
          <p className="text-white/60 text-sm">Avg Floor Price</p>
          <p className="text-2xl font-bold text-white">
            {(nftCollections.reduce((sum, c) => sum + c.floorPrice, 0) / nftCollections.length).toFixed(2)} ETH
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
          <p className="text-white/60 text-sm">Total Owners</p>
          <p className="text-2xl font-bold text-white">
            {nftCollections.reduce((sum, c) => sum + c.owners, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default EnhancedNFTPage
