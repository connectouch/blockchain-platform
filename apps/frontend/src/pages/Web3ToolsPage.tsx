import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Wrench, Users, Star, Globe, Code, Wallet, Search, ShoppingCart, ExternalLink } from 'lucide-react'
import { directApiService } from '../services/directApiService'
import LoadingSpinner from '@components/LoadingSpinner'
import { comprehensiveRealTimeService } from '../services/comprehensiveRealTimeService'

const Web3ToolsPage: React.FC = () => {
  const [realTimeWeb3Data, setRealTimeWeb3Data] = useState([])
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Initialize real-time Web3 data
  useEffect(() => {
    const initializeRealTimeData = async () => {
      try {
        await comprehensiveRealTimeService.initialize()

        // Set up real-time Web3 data listener
        comprehensiveRealTimeService.on('web3Updated', (web3Data) => {
          setRealTimeWeb3Data(web3Data)
          setLastUpdate(new Date())
        })

        // Get initial data
        const initialData = comprehensiveRealTimeService.getWeb3ToolsData()
        setRealTimeWeb3Data(initialData)
      } catch (error) {
        console.warn('Real-time Web3 data initialization failed:', error)
      }
    }

    initializeRealTimeData()

    return () => {
      comprehensiveRealTimeService.removeAllListeners()
    }
  }, [])

  // Fetch Web3 tools data using direct API service
  const { data: tools = [], isLoading, error } = useQuery({
    queryKey: ['web3tools', 'tools'],
    queryFn: directApiService.getWeb3Tools,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  })

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'wallet': return <Wallet className="w-6 h-6" />
      case 'explorer': return <Search className="w-6 h-6" />
      case 'nft': return <ShoppingCart className="w-6 h-6" />
      case 'dex': return <Code className="w-6 h-6" />
      case 'development': return <Code className="w-6 h-6" />
      default: return <Wrench className="w-6 h-6" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'wallet': return 'bg-blue-500/20 text-blue-400'
      case 'explorer': return 'bg-green-500/20 text-green-400'
      case 'nft': return 'bg-purple-500/20 text-purple-400'
      case 'dex': return 'bg-orange-500/20 text-orange-400'
      case 'development': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Web3 Tools</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Development tools and dApp infrastructure for Web3 builders
          </p>
        </motion.div>

        {/* Real-Time Web3 Data Section */}
        {realTimeWeb3Data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Real-Time Web3 Metrics</h3>
                <span className="text-sm text-green-400">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-white/60 text-sm">Avg Gas Price</p>
                  <p className="text-2xl font-bold text-white">
                    {(realTimeWeb3Data.reduce((sum, n) => sum + n.gasPrice, 0) / realTimeWeb3Data.length).toFixed(0)} gwei
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-white/60 text-sm">Active Tools</p>
                  <p className="text-2xl font-bold text-white">{realTimeWeb3Data.length}</p>
                </div>

                <div className="text-center">
                  <p className="text-white/60 text-sm">ENS Domains</p>
                  <p className="text-2xl font-bold text-white">
                    {(realTimeWeb3Data.reduce((sum, n) => sum + n.ensCount, 0) / 1e6).toFixed(1)}M
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-white/60 text-sm">Network Status</p>
                  <p className="text-2xl font-bold text-white">
                    {(realTimeWeb3Data.reduce((sum, n) => sum + n.networkHealth, 0) / realTimeWeb3Data.length).toFixed(1)}%
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
              <h3 className="text-xl font-bold text-red-400 mb-4">Error Loading Web3 Tools</h3>
              <p className="text-white/70">Unable to fetch tools data. Please try again later.</p>
            </div>
          </div>
        )}

        {/* Web3 Tools Grid */}
        {!isLoading && !error && tools.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {tools.map((tool: any, index: number) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-card p-6 hover:scale-105 transition-transform duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(tool.category)}`}>
                        {getCategoryIcon(tool.category)}
                      </div>
                      <h3 className="text-xl font-bold text-white">{tool.name}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(tool.category)}`}>
                      {tool.category}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Users</span>
                      <span className="text-white font-semibold">
                        {tool.users ? (tool.users / 1000000).toFixed(1) : '0'}M
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-yellow-400 font-semibold">
                          {tool.rating || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">Category</span>
                      <span className="text-blue-400 font-semibold">
                        {tool.category || 'Unknown'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">Status</span>
                      <span className="text-green-400 font-semibold">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/60 text-sm mb-3">{tool.description || 'No description available'}</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-white/50" />
                        <span className="text-white/50 text-xs">
                          Multi-chain support
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                          Web3
                        </span>
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                          DeFi
                        </span>
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                          Popular
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                      <button
                        onClick={() => {
                          // Launch tool functionality
                          console.log(`Launching ${tool.name}...`)
                          alert(`🚀 Launching ${tool.name}!\n\nThis would open the tool interface with:\n• ${tool.description}\n• Multi-chain support\n• Real-time data\n\nTool interface coming soon!`)
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                      >
                        Launch Tool
                      </button>
                      <button
                        onClick={() => {
                          // Add to favorites
                          console.log(`Added ${tool.name} to favorites`)
                          alert(`⭐ ${tool.name} added to favorites!`)
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                        title="Add to Favorites"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          // Share tool
                          if (navigator.share) {
                            navigator.share({
                              title: tool.name,
                              text: tool.description,
                              url: window.location.href
                            })
                          } else {
                            navigator.clipboard.writeText(window.location.href)
                            alert(`📋 Link to ${tool.name} copied to clipboard!`)
                          }
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                        title="Share Tool"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Web3 Tools Analytics Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="glass-card p-6 text-center">
                  <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-blue-400">
                    {(tools.reduce((sum: number, t: any) => sum + t.users, 0) / 1000000).toFixed(0)}M
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Avg Rating</h3>
                  <p className="text-3xl font-bold text-yellow-400">
                    {(tools.reduce((sum: number, t: any) => sum + t.rating, 0) / tools.length).toFixed(1)}
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <Wrench className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Total Tools</h3>
                  <p className="text-3xl font-bold text-emerald-400">{tools.length}</p>
                </div>

                <div className="glass-card p-6 text-center">
                  <Globe className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Categories</h3>
                  <p className="text-3xl font-bold text-purple-400">
                    {new Set(tools.map((t: any) => t.category)).size}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

export default Web3ToolsPage
