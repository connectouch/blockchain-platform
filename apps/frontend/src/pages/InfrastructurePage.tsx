import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Zap, Activity, DollarSign, BarChart3, Shield, AlertTriangle, RefreshCw } from 'lucide-react'
import { directApiService } from '../services/directApiService'
import LoadingSpinner from '@components/LoadingSpinner'
import SafeInfrastructureWrapper from '@components/SafeInfrastructureWrapper'

const InfrastructurePageContent: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [forceRefresh, setForceRefresh] = useState(0)

  // Enhanced error logging
  const addDebugInfo = (info: string) => {
    console.log(`[InfrastructurePage] ${info}`)
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toISOString()}: ${info}`])
  }

  useEffect(() => {
    addDebugInfo('Component mounted')
    return () => addDebugInfo('Component unmounted')
  }, [])

  // Fetch Infrastructure projects data with enhanced error handling
  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ['infrastructure', 'projects', forceRefresh],
    queryFn: async () => {
      addDebugInfo('Starting API call')
      try {
        const result = await directApiService.getInfrastructureProjects()
        addDebugInfo(`API call successful: ${result?.length || 0} projects`)
        return result
      } catch (err) {
        addDebugInfo(`API call failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        throw err
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  })

  // projects is now directly from the query

  // Force refresh handler
  const handleForceRefresh = () => {
    addDebugInfo('Force refresh triggered')
    setForceRefresh(prev => prev + 1)
    refetch()
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
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Infrastructure</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Explore Layer 1/2 blockchains and scaling solutions
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {/* Enhanced Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400 mr-3" />
                <h3 className="text-xl font-bold text-red-400">Error Loading Infrastructure Data</h3>
              </div>
              <p className="text-white/70 mb-4">Unable to fetch project data. Please try again later.</p>

              {/* Debug Information */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
                  <h4 className="text-sm font-semibold text-red-400 mb-2">Debug Information:</h4>
                  <pre className="text-xs text-red-300 whitespace-pre-wrap overflow-auto max-h-32">
                    {error instanceof Error ? error.message : 'Unknown error'}
                  </pre>
                  {debugInfo.length > 0 && (
                    <div className="mt-2">
                      <h5 className="text-xs font-semibold text-red-400 mb-1">Recent Activity:</h5>
                      {debugInfo.map((info, index) => (
                        <div key={index} className="text-xs text-red-300">{info}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleForceRefresh}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Infrastructure Projects Grid */}
        {!isLoading && !error && projects.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
              {projects.map((project: any, index: number) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-card p-6 hover:scale-105 transition-transform duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{project.name}</h3>
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                      {project.category}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Market Cap</span>
                      <span className="text-green-400 font-semibold">
                        ${((project.marketCap || 0) / 1e9).toFixed(1)}B
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">TPS</span>
                      <span className="text-blue-400 font-semibold">
                        {(project.tps && project.tps > 0) ? `${project.tps.toLocaleString()}` : 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">TVL</span>
                      <span className="text-purple-400 font-semibold">
                        ${((project.tvl || 0) / 1e9).toFixed(1)}B
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">Gas Price</span>
                      <span className="text-yellow-400 font-semibold">
                        {(project.gasPrice && project.gasPrice > 0) ? `${project.gasPrice} Gwei` : 'Low'}
                      </span>
                    </div>

                    {(project.validators && project.validators > 0) && (
                      <div className="flex justify-between">
                        <span className="text-white/70">Validators</span>
                        <span className="text-white font-semibold">
                          {project.validators.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm">Consensus</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                        {project.consensus}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">{project.description}</p>
                    <div className="mt-2">
                      <span className="text-white/50 text-xs">Launched: {project.launched}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Infrastructure Analytics Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="glass-card p-6 text-center">
                  <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Total Market Cap</h3>
                  <p className="text-3xl font-bold text-green-400">
                    ${(projects.reduce((sum: number, p: any) => sum + (p.marketCap || 0), 0) / 1e9).toFixed(0)}B
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Total TVL</h3>
                  <p className="text-3xl font-bold text-purple-400">
                    ${(projects.reduce((sum: number, p: any) => sum + (p.tvl || 0), 0) / 1e9).toFixed(0)}B
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <Activity className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Max TPS</h3>
                  <p className="text-3xl font-bold text-blue-400">
                    {projects.filter((p: any) => p.tps && p.tps > 0).length > 0
                      ? Math.max(...projects.filter((p: any) => p.tps && p.tps > 0).map((p: any) => p.tps)).toLocaleString()
                      : 'N/A'
                    }
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Networks</h3>
                  <p className="text-3xl font-bold text-cyan-400">{projects.length}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Development Debug Panel */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 max-w-sm">
            <div className="glass-card p-4 text-xs">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">Debug Panel</h4>
                <button
                  onClick={handleForceRefresh}
                  className="p-1 bg-blue-600 hover:bg-blue-700 rounded"
                >
                  <RefreshCw className="w-3 h-3 text-white" />
                </button>
              </div>
              <div className="space-y-1 text-white/70">
                <div>Projects: {projects.length}</div>
                <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                <div>Error: {error ? 'Yes' : 'No'}</div>
                <div>Refresh Count: {forceRefresh}</div>
              </div>
              {debugInfo.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="text-white/50 text-xs">Recent:</div>
                  {debugInfo.slice(-2).map((info, index) => (
                    <div key={index} className="text-white/60 text-xs truncate">
                      {info.split(': ')[1]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const InfrastructurePage: React.FC = () => {
  return (
    <SafeInfrastructureWrapper>
      <InfrastructurePageContent />
    </SafeInfrastructureWrapper>
  )
}

export default InfrastructurePage
