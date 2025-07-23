import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Wrench, Users, Star, Globe, Code, Wallet, Search, ShoppingCart } from 'lucide-react'
import ApiService from '../services/api'
import LoadingSpinner from '@components/LoadingSpinner'

const Web3ToolsPage: React.FC = () => {
  // Fetch Web3 tools data
  const { data: toolsData, isLoading, error } = useQuery({
    queryKey: ['web3tools', 'tools'],
    queryFn: ApiService.getWeb3Tools,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const tools = toolsData?.data || []

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'wallet': return <Wallet className="w-6 h-6" />
      case 'explorer': return <Search className="w-6 h-6" />
      case 'nft marketplace': return <ShoppingCart className="w-6 h-6" />
      case 'development': return <Code className="w-6 h-6" />
      default: return <Wrench className="w-6 h-6" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'wallet': return 'bg-blue-500/20 text-blue-400'
      case 'explorer': return 'bg-green-500/20 text-green-400'
      case 'nft marketplace': return 'bg-purple-500/20 text-purple-400'
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
                      <span className="text-white/70">Type</span>
                      <span className="text-blue-400 font-semibold">
                        {tool.type || 'Unknown'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">Cost</span>
                      <span className={`font-semibold ${tool.free ? 'text-green-400' : 'text-orange-400'}`}>
                        {tool.free ? 'Free' : 'Paid'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/60 text-sm mb-3">{tool.description || 'No description available'}</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-white/50" />
                        <span className="text-white/50 text-xs">
                          Chains: {tool.chains?.slice(0, 2)?.join(', ') || 'N/A'}
                          {tool.chains?.length > 2 && ` +${tool.chains.length - 2}`}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {tool.features?.slice(0, 3)?.map((feature: string) => (
                          <span key={feature} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                            {feature}
                          </span>
                        )) || []}
                      </div>
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
                  <h3 className="text-xl font-bold text-white mb-2">Free Tools</h3>
                  <p className="text-3xl font-bold text-purple-400">
                    {tools.filter((t: any) => t.free).length}
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
