import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { DollarSign, TrendingUp, Shield, Zap, Activity, Users, BarChart3 } from 'lucide-react'
import { directApiService } from '../services/directApiService'
import LoadingSpinner from '@components/LoadingSpinner'
import { useAIContext } from '../contexts/AIAssistantContext'
import { comprehensiveRealTimeService } from '../services/comprehensiveRealTimeService'

// Rich Content Components for DeFi
import ProtocolDeepDive from '../components/ProtocolDeepDive'
import YieldFarmingCalculator from '../components/YieldFarmingCalculator'
import RiskAssessmentWidget from '../components/RiskAssessmentWidget'
import DeFiEducationalHub from '../components/DeFiEducationalHub'

const DeFiPage: React.FC = () => {
  const { setAIContext } = useAIContext()
  const [realTimeProtocols, setRealTimeProtocols] = useState([])
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Set AI context for DeFi page
  useEffect(() => {
    setAIContext('defi', { page: 'defi', protocols: [] })
  }, [])

  // Initialize real-time DeFi data
  useEffect(() => {
    const initializeRealTimeData = async () => {
      try {
        await comprehensiveRealTimeService.initialize()

        // Set up real-time DeFi data listener
        comprehensiveRealTimeService.on('defiUpdated', (defiProtocols) => {
          setRealTimeProtocols(defiProtocols)
          setLastUpdate(new Date())
        })

        // Get initial data
        const initialProtocols = comprehensiveRealTimeService.getDeFiProtocols()
        setRealTimeProtocols(initialProtocols)
      } catch (error) {
        console.warn('Real-time DeFi data initialization failed:', error)
      }
    }

    initializeRealTimeData()

    return () => {
      comprehensiveRealTimeService.removeAllListeners()
    }
  }, [])
  // Fetch DeFi protocols data using direct API service
  const { data: protocols = [], isLoading, error } = useQuery({
    queryKey: ['defi', 'protocols'],
    queryFn: directApiService.getDeFiProtocols,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  })

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <DollarSign className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">DeFi Hub</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Comprehensive DeFi analysis, yield farming optimization, and protocol insights powered by AI
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
              <h3 className="text-xl font-bold text-red-400 mb-4">Error Loading DeFi Data</h3>
              <p className="text-white/70">Unable to fetch protocol data. Please try again later.</p>
            </div>
          </div>
        )}

        {/* Real-Time DeFi Data Section */}
        {realTimeProtocols.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Real-Time DeFi Metrics</h3>
                <span className="text-sm text-green-400">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-white/60 text-sm">Total TVL</p>
                  <p className="text-2xl font-bold text-white">
                    ${(realTimeProtocols.reduce((sum, p) => sum + p.tvl, 0) / 1e9).toFixed(2)}B
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-white/60 text-sm">Protocols</p>
                  <p className="text-2xl font-bold text-white">{realTimeProtocols.length}</p>
                </div>

                <div className="text-center">
                  <p className="text-white/60 text-sm">Avg APY</p>
                  <p className="text-2xl font-bold text-white">
                    {(realTimeProtocols.reduce((sum, p) => sum + p.apy, 0) / realTimeProtocols.length).toFixed(1)}%
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-white/60 text-sm">Top Protocol</p>
                  <p className="text-lg font-bold text-white">
                    {realTimeProtocols.sort((a, b) => b.tvl - a.tvl)[0]?.name.slice(0, 10)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* DeFi Protocols Grid */}
        {!isLoading && !error && protocols.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {protocols.map((protocol, index) => (
                <motion.div
                  key={protocol.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-card p-6 hover:scale-105 transition-transform duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{protocol.name}</h3>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      {protocol.category}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">TVL</span>
                      <span className="text-white font-semibold">
                        ${(protocol.tvl / 1e9).toFixed(2)}B
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">24h Change</span>
                      <span className={`font-semibold ${protocol.change_1d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {protocol.change_1d >= 0 ? '+' : ''}{protocol.change_1d.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">7d Change</span>
                      <span className={`font-semibold ${protocol.change_7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {protocol.change_7d >= 0 ? '+' : ''}{protocol.change_7d.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">Symbol</span>
                      <span className="text-white font-semibold">
                        {protocol.symbol}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex flex-wrap gap-2">
                      {protocol.chains?.slice(0, 3).map((chain: string) => (
                        <span key={chain} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          {chain}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* DeFi Analytics Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-card p-6 text-center">
                  <Activity className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Total TVL</h3>
                  <p className="text-3xl font-bold text-green-400">
                    ${(protocols.reduce((sum, p) => sum + p.tvl, 0) / 1e9).toFixed(1)}B
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Avg 24h Change</h3>
                  <p className="text-3xl font-bold text-blue-400">
                    {(protocols.reduce((sum, p) => sum + p.change_1d, 0) / protocols.length).toFixed(1)}%
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Protocols</h3>
                  <p className="text-3xl font-bold text-purple-400">{protocols.length}</p>
                </div>
              </div>
            </motion.div>

            {/* Rich Content Section - Phase 1 Enhancements */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-16 space-y-8"
            >
              {/* Protocol Deep Dive - Full Width */}
              <ProtocolDeepDive
                protocols={protocols}
                className="w-full"
              />

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Yield Farming Calculator */}
                <YieldFarmingCalculator
                  protocols={protocols}
                />

                {/* Risk Assessment Widget */}
                <RiskAssessmentWidget
                  protocols={protocols}
                />
              </div>

              {/* Educational Hub - Full Width */}
              <DeFiEducationalHub
                protocols={protocols}
                className="w-full"
              />
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

export default DeFiPage
