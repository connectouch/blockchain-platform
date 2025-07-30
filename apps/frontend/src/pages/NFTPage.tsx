import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Palette, TrendingUp, Users, Activity } from 'lucide-react'
import ApiService from '../services/api'
import LoadingSpinner from '@components/LoadingSpinner'
import { useAIContext } from '../contexts/AIAssistantContext'
import { comprehensiveRealTimeService } from '../services/comprehensiveRealTimeService'

// Rich Content Components for NFT
import NFTCollectionAnalytics from '../components/NFTCollectionAnalytics'
import NFTPortfolioTracker from '../components/NFTPortfolioTracker'
import NFTRarityTools from '../components/NFTRarityTools'
import NFTMarketplaceIntegration from '../components/NFTMarketplaceIntegration'
import NFTEducationalHub from '../components/NFTEducationalHub'

const NFTPage: React.FC = () => {
  const { setAIContext } = useAIContext()
  const [realTimeCollections, setRealTimeCollections] = useState([])
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Set AI context for NFT page
  useEffect(() => {
    setAIContext('nft', { page: 'nft', collections: [] })
  }, [])

  // Initialize real-time NFT data
  useEffect(() => {
    const initializeRealTimeData = async () => {
      try {
        await comprehensiveRealTimeService.initialize()

        // Set up real-time NFT data listener
        comprehensiveRealTimeService.on('nftUpdated', (nftCollections) => {
          setRealTimeCollections(nftCollections)
          setLastUpdate(new Date())
        })

        // Get initial data
        const initialCollections = comprehensiveRealTimeService.getNFTCollections()
        setRealTimeCollections(initialCollections)
      } catch (error) {
        console.warn('Real-time NFT data initialization failed:', error)
      }
    }

    initializeRealTimeData()

    return () => {
      comprehensiveRealTimeService.removeAllListeners()
    }
  }, [])
  // Fetch NFT collections data
  const { data: collectionsData, isLoading, error } = useQuery({
    queryKey: ['nft', 'collections'],
    queryFn: ApiService.getNFTCollections,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const collections = collectionsData?.data || []

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Palette className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">NFT Explorer</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Discover, analyze, and track NFT collections with AI-powered insights
          </p>
        </motion.div>

        {/* Real-Time NFT Data Section */}
        {realTimeCollections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Real-Time NFT Metrics</h3>
                <span className="text-sm text-green-400">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-white/60 text-sm">Total Volume</p>
                  <p className="text-2xl font-bold text-white">
                    {(realTimeCollections.reduce((sum, c) => sum + c.volume24h, 0)).toFixed(1)} ETH
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-white/60 text-sm">Collections</p>
                  <p className="text-2xl font-bold text-white">{realTimeCollections.length}</p>
                </div>

                <div className="text-center">
                  <p className="text-white/60 text-sm">Avg Floor</p>
                  <p className="text-2xl font-bold text-white">
                    {(realTimeCollections.reduce((sum, c) => sum + c.floorPrice, 0) / realTimeCollections.length).toFixed(2)} ETH
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-white/60 text-sm">Top Collection</p>
                  <p className="text-lg font-bold text-white">
                    {realTimeCollections.sort((a, b) => b.volume24h - a.volume24h)[0]?.name.slice(0, 10)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="glass-card p-8 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-red-400 mb-4">Error Loading NFT Data</h3>
              <p className="text-white/70">Unable to fetch collection data. Please try again later.</p>
            </div>
          </div>
        )}

        {/* Enhanced NFT Content */}
        {!isLoading && !error && (
          <>
            {/* Collection Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <NFTCollectionAnalytics
                collections={collections.map((c: any) => ({
                  id: c.id || c.name,
                  name: c.name,
                  symbol: c.symbol,
                  floorPrice: c.floorPrice || 0,
                  volume24h: c.volume24h || 0,
                  change24h: c.floor_price_in_usd_24h_percentage_change || 0,
                  owners: c.owners || 0,
                  totalSupply: c.totalSupply || 10000,
                  marketCap: c.market_cap || 0,
                  averagePrice: (c.floorPrice || 0) * 1.2,
                  sales24h: Math.floor(Math.random() * 100) + 10,
                  chain: 'ethereum',
                  verified: true,
                  image: c.image,
                  description: c.description,
                  rarityEnabled: true,
                  traits: []
                }))}
                isLoading={isLoading}
              />
            </motion.div>

            {/* Portfolio Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-16"
            >
              <NFTPortfolioTracker
                walletAddress="0x1234...5678"
                isConnected={true}
              />
            </motion.div>

            {/* Rarity Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-16"
            >
              <NFTRarityTools
                selectedCollection={collections.length > 0 ? collections[0].name : undefined}
                collections={collections.map((c: any) => c.name)}
              />
            </motion.div>

            {/* Marketplace Integration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mb-16"
            >
              <NFTMarketplaceIntegration
                selectedCollection={collections.length > 0 ? collections[0].name : undefined}
                collections={collections.map((c: any) => c.name)}
              />
            </motion.div>

            {/* Educational Hub */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="mb-16"
            >
              <NFTEducationalHub userLevel="intermediate" />
            </motion.div>

            {/* NFT Analytics Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-card p-6 text-center">
                  <Activity className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Total Volume</h3>
                  <p className="text-3xl font-bold text-green-400">
                    {collections.reduce((sum: number, c: any) => sum + (typeof c.volume24h === 'number' && !isNaN(c.volume24h) ? c.volume24h : 0), 0).toFixed(1)} ETH
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Avg Floor</h3>
                  <p className="text-3xl font-bold text-pink-400">
                    {collections.length > 0 ? (collections.reduce((sum: number, c: any) => sum + (typeof c.floorPrice === 'number' && !isNaN(c.floorPrice) ? c.floorPrice : 0), 0) / collections.length).toFixed(2) : '0.00'} ETH
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Collections</h3>
                  <p className="text-3xl font-bold text-blue-400">{collections.length}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

export default NFTPage
