/**
 * Enhanced Real-Time DeFi Page Component
 * Provides comprehensive DeFi protocol data with real-time updates
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent,
  Users,
  Lock,
  Zap,
  ExternalLink,
  Wallet,
  ArrowUpDown,
  Gift,
  BarChart3
} from 'lucide-react'
import { comprehensiveRealTimeService, DeFiProtocol } from '../../services/comprehensiveRealTimeService'
import { DeFiLocalImage } from '../ui/LocalImage'

interface DeFiStats {
  totalTVL: number
  totalProtocols: number
  averageAPY: number
  topChain: string
  tvlChange24h: number
}

interface YieldOpportunity {
  protocol: string
  pool: string
  apy: number
  tvl: number
  risk: 'Low' | 'Medium' | 'High'
  category: string
}

const RealTimeDeFiPage: React.FC = () => {
  const [protocols, setProtocols] = useState<DeFiProtocol[]>([])
  const [stats, setStats] = useState<DeFiStats>({
    totalTVL: 0,
    totalProtocols: 0,
    averageAPY: 0,
    topChain: '',
    tvlChange24h: 0
  })
  const [yieldOpportunities, setYieldOpportunities] = useState<YieldOpportunity[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [walletConnected, setWalletConnected] = useState(false)

  const categories = ['All', 'Lending', 'DEX', 'Yield Farming', 'Liquid Staking', 'Derivatives', 'Insurance']

  useEffect(() => {
    initializeDeFiData()
    return () => {
      comprehensiveRealTimeService.removeAllListeners()
    }
  }, [])

  const initializeDeFiData = async () => {
    try {
      setIsLoading(true)

      // Initialize the service if not already done
      await comprehensiveRealTimeService.initialize()

      // Set up event listeners
      comprehensiveRealTimeService.on('defiUpdated', handleDeFiUpdate)
      comprehensiveRealTimeService.on('defiError', handleError)

      // Get initial data
      const initialProtocols = comprehensiveRealTimeService.getDeFiProtocols()
      setProtocols(initialProtocols)
      updateStats(initialProtocols)
      generateYieldOpportunities(initialProtocols)
      
      setIsLoading(false)
      setLastUpdate(new Date())

    } catch (error) {
      console.error('Failed to initialize DeFi data:', error)
      setIsLoading(false)
    }
  }

  const handleDeFiUpdate = (newProtocols: DeFiProtocol[]) => {
    setProtocols(newProtocols)
    updateStats(newProtocols)
    generateYieldOpportunities(newProtocols)
    setLastUpdate(new Date())
  }

  const handleError = (error: any) => {
    console.warn('DeFi data error:', error)
  }

  const updateStats = (protocolData: DeFiProtocol[]) => {
    const totalTVL = protocolData.reduce((sum, protocol) => sum + protocol.tvl, 0)
    const averageAPY = protocolData.reduce((sum, protocol) => sum + protocol.apy, 0) / protocolData.length
    const tvlChange24h = protocolData.reduce((sum, protocol) => sum + protocol.tvlChange24h, 0) / protocolData.length
    
    // Find top chain by TVL
    const chainTVL = new Map<string, number>()
    protocolData.forEach(protocol => {
      protocol.chains.forEach(chain => {
        chainTVL.set(chain, (chainTVL.get(chain) || 0) + protocol.tvl / protocol.chains.length)
      })
    })
    
    const topChain = Array.from(chainTVL.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Ethereum'

    setStats({
      totalTVL,
      totalProtocols: protocolData.length,
      averageAPY,
      topChain,
      tvlChange24h
    })
  }

  const generateYieldOpportunities = (protocolData: DeFiProtocol[]) => {
    const opportunities: YieldOpportunity[] = protocolData
      .filter(protocol => protocol.apy > 0)
      .sort((a, b) => b.apy - a.apy)
      .slice(0, 10)
      .map(protocol => ({
        protocol: protocol.name,
        pool: `${protocol.name} Pool`,
        apy: protocol.apy,
        tvl: protocol.tvl,
        risk: protocol.apy > 50 ? 'High' : protocol.apy > 20 ? 'Medium' : 'Low',
        category: protocol.category
      }))

    setYieldOpportunities(opportunities)
  }

  const filteredProtocols = selectedCategory === 'All' 
    ? protocols 
    : protocols.filter(protocol => protocol.category === selectedCategory)

  const formatCurrency = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const formatPercent = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'Low': return 'text-green-400 bg-green-500/20'
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'High': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const connectWallet = () => {
    // Mock wallet connection
    setWalletConnected(!walletConnected)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-white">Loading DeFi protocols...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">DeFi Protocols</h1>
          <p className="text-white/60">
            Real-time DeFi data • Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        
        <button
          onClick={connectWallet}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
            walletConnected 
              ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
              : 'bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30'
          }`}
        >
          <Wallet className="w-5 h-5 mr-2" />
          {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
        </button>
      </div>

      {/* DeFi Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total TVL</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.totalTVL)}
              </p>
              <p className={`text-sm ${stats.tvlChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercent(stats.tvlChange24h)} 24h
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Protocols</p>
              <p className="text-2xl font-bold text-white">{stats.totalProtocols}</p>
              <p className="text-sm text-blue-400">Active</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Avg APY</p>
              <p className="text-2xl font-bold text-white">{stats.averageAPY.toFixed(1)}%</p>
              <p className="text-sm text-purple-400">Yield</p>
            </div>
            <Percent className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Top Chain</p>
              <p className="text-2xl font-bold text-white">{stats.topChain}</p>
              <p className="text-sm text-orange-400">By TVL</p>
            </div>
            <Zap className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Users</p>
              <p className="text-2xl font-bold text-white">2.4M</p>
              <p className="text-sm text-cyan-400">Active</p>
            </div>
            <Users className="w-8 h-8 text-cyan-400" />
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg p-4 text-center transition-colors group">
          <Lock className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-white text-sm">Stake Tokens</p>
        </button>
        
        <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg p-4 text-center transition-colors group">
          <ArrowUpDown className="w-6 h-6 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-white text-sm">Provide Liquidity</p>
        </button>
        
        <button className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg p-4 text-center transition-colors group">
          <Gift className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-white text-sm">Claim Rewards</p>
        </button>
        
        <button className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg p-4 text-center transition-colors group">
          <BarChart3 className="w-6 h-6 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-white text-sm">View Analytics</p>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* DeFi Protocols List */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-bold text-white mb-4">DeFi Protocols</h2>
            
            <div className="space-y-4">
              {filteredProtocols.slice(0, 12).map((protocol, index) => (
                <motion.div
                  key={protocol.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-4">
                    <DeFiLocalImage
                      identifier={protocol.name.toLowerCase().replace(/\s+/g, '-')}
                      alt={protocol.name}
                      size="md"
                      className="w-10 h-10"
                    />
                    <div>
                      <p className="text-white font-medium group-hover:text-blue-400 transition-colors">
                        {protocol.name}
                      </p>
                      <p className="text-white/60 text-sm">{protocol.category}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {protocol.chains.slice(0, 3).map(chain => (
                          <span key={chain} className="text-xs bg-white/10 px-2 py-1 rounded">
                            {chain}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-white font-medium">{formatCurrency(protocol.tvl)}</p>
                    <p className={`text-sm ${protocol.tvlChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercent(protocol.tvlChange24h)} 24h
                    </p>
                    <p className="text-purple-400 text-sm">{protocol.apy.toFixed(1)}% APY</p>
                  </div>
                  
                  <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Yield Opportunities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Top Yield Opportunities
          </h2>
          
          <div className="space-y-4">
            {yieldOpportunities.slice(0, 8).map((opportunity, index) => (
              <motion.div
                key={`${opportunity.protocol}-${opportunity.pool}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium text-sm">{opportunity.protocol}</p>
                  <span className={`text-xs px-2 py-1 rounded ${getRiskColor(opportunity.risk)}`}>
                    {opportunity.risk}
                  </span>
                </div>
                
                <p className="text-white/60 text-xs mb-2">{opportunity.pool}</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 font-bold">{opportunity.apy.toFixed(1)}%</p>
                    <p className="text-white/60 text-xs">APY</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm">{formatCurrency(opportunity.tvl)}</p>
                    <p className="text-white/60 text-xs">TVL</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RealTimeDeFiPage
