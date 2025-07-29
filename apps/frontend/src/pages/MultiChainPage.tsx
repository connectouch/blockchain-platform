import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe,
  Layers,
  ArrowRightLeft,
  BarChart3,
  Activity,
  Zap,
  Shield,
  TrendingUp,
  DollarSign,
  Link2,
  Target,
  // RefreshCw
} from 'lucide-react'

// Import multi-chain components
import CrossChainAnalytics from '../components/CrossChainAnalytics'
import BridgeIntegrationHub from '../components/BridgeIntegrationHub'
import ChainSelector from '../components/ChainSelector'
import MultiChainService from '../services/MultiChainService'

const MultiChainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'bridges' | 'portfolio' | 'defi'>('analytics')
  const [selectedChain, setSelectedChain] = useState('ethereum')
  const [selectedChains, setSelectedChains] = useState(['ethereum', 'polygon', 'bsc'])
  const [multiChainStats] = useState({
    totalChains: 5,
    totalTVL: 125000000000,
    totalTransactions: 2500000,
    activeBridges: 12,
    crossChainVolume: 8500000000,
    avgBridgeTime: 6.5
  })

  // Mock wallet addresses for different chains
  const [walletAddresses] = useState({
    ethereum: '0x1234...5678',
    polygon: '0x2345...6789',
    bsc: '0x3456...7890',
    avalanche: '0x4567...8901',
    solana: 'ABC123...DEF456'
  })

  // const multiChainService = MultiChainService.getInstance()

  // Handle chain selection
  const handleChainSelect = (chainId: string) => {
    setSelectedChain(chainId)
  }

  // Handle multi-chain selection
  const handleMultiChainSelect = (chainIds: string[]) => {
    setSelectedChains(chainIds)
  }

  // Handle bridge transaction
  const handleBridgeTransaction = (transaction: any) => {
    console.log('Bridge transaction:', transaction)
    // Update stats or trigger notifications
  }

  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Multi-Chain Hub</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Comprehensive multi-blockchain analytics, portfolio tracking, and cross-chain operations
          </p>
        </motion.div>

        {/* Multi-Chain Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8"
        >
          <div className="glass-card p-6 text-center">
            <Layers className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{multiChainStats.totalChains}</div>
            <div className="text-white/60 text-sm">Supported Chains</div>
          </div>
          <div className="glass-card p-6 text-center">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{formatCurrency(multiChainStats.totalTVL)}</div>
            <div className="text-white/60 text-sm">Total TVL</div>
          </div>
          <div className="glass-card p-6 text-center">
            <Activity className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{(multiChainStats.totalTransactions / 1000000).toFixed(1)}M</div>
            <div className="text-white/60 text-sm">Transactions</div>
          </div>
          <div className="glass-card p-6 text-center">
            <Link2 className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{multiChainStats.activeBridges}</div>
            <div className="text-white/60 text-sm">Active Bridges</div>
          </div>
          <div className="glass-card p-6 text-center">
            <ArrowRightLeft className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{formatCurrency(multiChainStats.crossChainVolume)}</div>
            <div className="text-white/60 text-sm">Bridge Volume</div>
          </div>
          <div className="glass-card p-6 text-center">
            <TrendingUp className="w-8 h-8 text-pink-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{multiChainStats.avgBridgeTime}min</div>
            <div className="text-white/60 text-sm">Avg Bridge Time</div>
          </div>
        </motion.div>

        {/* Chain Selector Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-4">Chain Selection</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Single Chain</label>
              <ChainSelector
                selectedChain={selectedChain}
                onChainSelect={handleChainSelect}
                showMetrics={false}
                variant="default"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Multiple Chains</label>
              <ChainSelector
                showMultiSelect={true}
                selectedChains={selectedChains}
                onMultiSelect={handleMultiChainSelect}
                placeholder="Select multiple chains"
                variant="compact"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">With Metrics</label>
              <ChainSelector
                selectedChain={selectedChain}
                onChainSelect={handleChainSelect}
                showMetrics={true}
                variant="detailed"
              />
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 bg-white/5 p-2 rounded-lg">
            {[
              { id: 'analytics', label: 'Cross-Chain Analytics', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'bridges', label: 'Bridge Hub', icon: <ArrowRightLeft className="w-4 h-4" /> },
              { id: 'portfolio', label: 'Multi-Chain Portfolio', icon: <Target className="w-4 h-4" /> },
              { id: 'defi', label: 'Cross-Chain DeFi', icon: <Zap className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {activeTab === 'analytics' && (
            <CrossChainAnalytics
              walletAddresses={walletAddresses}
              timeframe="24h"
              onChainSelect={handleChainSelect}
            />
          )}

          {activeTab === 'bridges' && (
            <BridgeIntegrationHub
              onBridgeTransaction={handleBridgeTransaction}
              defaultFromChain={selectedChain}
              defaultToChain={selectedChains.find(c => c !== selectedChain) || 'polygon'}
            />
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              {/* Multi-Chain Portfolio Overview */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Multi-Chain Portfolio Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Total Portfolio Value</h4>
                    <p className="text-white/60 text-sm">Aggregated across all connected chains</p>
                    <div className="text-2xl font-bold text-green-400 mt-2">$125,000</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Layers className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Active Chains</h4>
                    <p className="text-white/60 text-sm">Chains with active positions</p>
                    <div className="text-2xl font-bold text-blue-400 mt-2">5</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Diversification Score</h4>
                    <p className="text-white/60 text-sm">Cross-chain diversification rating</p>
                    <div className="text-2xl font-bold text-purple-400 mt-2">78/100</div>
                  </div>
                </div>
              </div>

              {/* Chain Breakdown */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Portfolio by Chain</h3>
                <div className="space-y-4">
                  {[
                    { chain: 'ethereum', value: 65000, percentage: 52, color: '#627EEA', icon: '⟠' },
                    { chain: 'polygon', value: 25000, percentage: 20, color: '#8247E5', icon: '⬟' },
                    { chain: 'bsc', value: 20000, percentage: 16, color: '#F3BA2F', icon: '🔶' },
                    { chain: 'avalanche', value: 10000, percentage: 8, color: '#E84142', icon: '🔺' },
                    { chain: 'solana', value: 5000, percentage: 4, color: '#9945FF', icon: '◎' }
                  ].map((item) => (
                    <div key={item.chain} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: item.color }}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <h4 className="text-white font-medium capitalize">{item.chain}</h4>
                            <p className="text-white/60 text-sm">{item.percentage}% of portfolio</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{formatCurrency(item.value)}</div>
                          <div className="text-green-400 text-sm">+2.5%</div>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${item.percentage}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'defi' && (
            <div className="space-y-6">
              {/* Cross-Chain DeFi Overview */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Cross-Chain DeFi Opportunities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Best Yield</h4>
                    <p className="text-white/60 text-sm">Highest APY across all chains</p>
                    <div className="text-2xl font-bold text-yellow-400 mt-2">18.5%</div>
                    <div className="text-white/60 text-xs">PancakeSwap (BSC)</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-green-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Safest Protocol</h4>
                    <p className="text-white/60 text-sm">Lowest risk, audited protocol</p>
                    <div className="text-2xl font-bold text-green-400 mt-2">4.2%</div>
                    <div className="text-white/60 text-xs">Aave V3 (Ethereum)</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Most Active</h4>
                    <p className="text-white/60 text-sm">Highest volume protocol</p>
                    <div className="text-2xl font-bold text-blue-400 mt-2">$3.5B</div>
                    <div className="text-white/60 text-xs">Uniswap V3 (Ethereum)</div>
                  </div>
                </div>
              </div>

              {/* DeFi Protocol Comparison */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Protocol Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-white/80 font-medium py-3">Protocol</th>
                        <th className="text-left text-white/80 font-medium py-3">Chain</th>
                        <th className="text-left text-white/80 font-medium py-3">TVL</th>
                        <th className="text-left text-white/80 font-medium py-3">APY</th>
                        <th className="text-left text-white/80 font-medium py-3">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { protocol: 'Aave V3', chain: 'Ethereum', tvl: '$6.2B', apy: '4.2%', risk: 'Low' },
                        { protocol: 'Uniswap V3', chain: 'Ethereum', tvl: '$3.5B', apy: '8.5%', risk: 'Low' },
                        { protocol: 'PancakeSwap', chain: 'BSC', tvl: '$2.1B', apy: '18.5%', risk: 'Medium' },
                        { protocol: 'QuickSwap', chain: 'Polygon', tvl: '$180M', apy: '12.3%', risk: 'Medium' },
                        { protocol: 'Trader Joe', chain: 'Avalanche', tvl: '$320M', apy: '15.7%', risk: 'Medium' }
                      ].map((item, index) => (
                        <tr key={index} className="border-b border-white/5">
                          <td className="py-3 text-white">{item.protocol}</td>
                          <td className="py-3 text-white/60">{item.chain}</td>
                          <td className="py-3 text-white">{item.tvl}</td>
                          <td className="py-3 text-green-400">{item.apy}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              item.risk === 'Low' ? 'bg-green-500/20 text-green-400' :
                              item.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {item.risk}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-12"
        >
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Multi-Chain Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('bridges')}
                className="flex items-center gap-3 p-4 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
              >
                <ArrowRightLeft className="w-6 h-6 text-blue-400" />
                <div className="text-left">
                  <div className="text-white font-medium">Bridge Assets</div>
                  <div className="text-white/60 text-sm">Cross-chain transfer</div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className="flex items-center gap-3 p-4 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors"
              >
                <BarChart3 className="w-6 h-6 text-green-400" />
                <div className="text-left">
                  <div className="text-white font-medium">View Analytics</div>
                  <div className="text-white/60 text-sm">Cross-chain insights</div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className="flex items-center gap-3 p-4 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors"
              >
                <Target className="w-6 h-6 text-purple-400" />
                <div className="text-left">
                  <div className="text-white font-medium">Portfolio</div>
                  <div className="text-white/60 text-sm">Multi-chain tracking</div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('defi')}
                className="flex items-center gap-3 p-4 bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg transition-colors"
              >
                <Zap className="w-6 h-6 text-yellow-400" />
                <div className="text-left">
                  <div className="text-white font-medium">DeFi Opportunities</div>
                  <div className="text-white/60 text-sm">Cross-chain yield</div>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MultiChainPage
