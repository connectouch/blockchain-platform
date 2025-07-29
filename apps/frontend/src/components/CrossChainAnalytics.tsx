import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  Layers,
  Zap,
  DollarSign,
  Percent,
  Clock,
  Shield,
  Target,
  RefreshCw,
  Filter,
  Download,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Link2
} from 'lucide-react'
import MultiChainService, { ChainConfig, ChainMetrics, CrossChainPortfolio } from '../services/MultiChainService'

// Initialize service
const multiChainService = new MultiChainService()

interface CrossChainAnalyticsProps {
  walletAddresses?: { [chainId: string]: string }
  timeframe?: string
  onChainSelect?: (chainId: string) => void
}

const CrossChainAnalytics: React.FC<CrossChainAnalyticsProps> = ({
  walletAddresses = {},
  timeframe = '24h',
  onChainSelect
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'chains' | 'defi' | 'bridges'>('overview')
  const [supportedChains, setSupportedChains] = useState<ChainConfig[]>([])
  const [chainMetrics, setChainMetrics] = useState<{ [chainId: string]: ChainMetrics }>({})
  const [crossChainPortfolio, setCrossChainPortfolio] = useState<CrossChainPortfolio | null>(null)
  const [defiProtocols, setDefiProtocols] = useState<{ [chainId: string]: any[] }>({})
  const [gasPrices, setGasPrices] = useState<{ [chainId: string]: any }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedChains, setSelectedChains] = useState<string[]>([])
  const [showAllChains, setShowAllChains] = useState(true)

  // const multiChainService = MultiChainService.getInstance()

  // Initialize data
  useEffect(() => {
    loadCrossChainData()
  }, [timeframe])

  // Load all cross-chain data
  const loadCrossChainData = async () => {
    setIsLoading(true)
    
    try {
      // Get supported chains
      const chains = multiChainService.getSupportedChains()
      setSupportedChains(chains)
      setSelectedChains(chains.map(c => c.id))

      // Load chain metrics
      const metrics: { [chainId: string]: ChainMetrics } = {}
      for (const chain of chains) {
        metrics[chain.id] = await multiChainService.getChainMetrics(chain.id)
      }
      setChainMetrics(metrics)

      // Load cross-chain portfolio
      const portfolio = await multiChainService.getCrossChainPortfolio(walletAddresses)
      setCrossChainPortfolio(portfolio)

      // Load DeFi protocols
      const protocols = await multiChainService.getCrossChainDeFiProtocols()
      setDefiProtocols(protocols)

      // Load gas prices
      const prices = await multiChainService.getGasPrices()
      setGasPrices(prices)

    } catch (error) {
      console.error('Error loading cross-chain data:', error)
    }
    
    setIsLoading(false)
  }

  // Toggle chain selection
  const toggleChainSelection = (chainId: string) => {
    setSelectedChains(prev => 
      prev.includes(chainId) 
        ? prev.filter(id => id !== chainId)
        : [...prev, chainId]
    )
  }

  // Get filtered chains
  const filteredChains = supportedChains.filter(chain => 
    showAllChains || selectedChains.includes(chain.id)
  )

  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  // Format number
  const formatNumber = (value: number): string => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
    return value.toFixed(0)
  }

  // Format percentage
  const formatPercent = (value: number): string => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  // Get performance color
  const getPerformanceColor = (value: number): string => {
    if (value > 0) return 'text-green-400'
    if (value < 0) return 'text-red-400'
    return 'text-white/60'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Cross-Chain Analytics</h2>
          <p className="text-white/60">Multi-blockchain portfolio and DeFi analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAllChains(!showAllChains)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showAllChains 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {showAllChains ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            All Chains
          </button>
          <button
            onClick={loadCrossChainData}
            disabled={isLoading}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Cross-Chain Overview */}
      {crossChainPortfolio && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 text-center">
            <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Total Portfolio</h3>
            <p className="text-3xl font-bold text-white">{formatCurrency(crossChainPortfolio.totalValue)}</p>
            <p className={`text-sm ${getPerformanceColor(crossChainPortfolio.totalValueChange24h)}`}>
              {formatPercent(crossChainPortfolio.totalValueChange24h)} 24h
            </p>
          </div>
          <div className="glass-card p-6 text-center">
            <Layers className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Active Chains</h3>
            <p className="text-3xl font-bold text-white">{Object.keys(crossChainPortfolio.chainBreakdown).length}</p>
            <p className="text-sm text-white/60">Networks</p>
          </div>
          <div className="glass-card p-6 text-center">
            <Target className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Diversification</h3>
            <p className="text-3xl font-bold text-white">{crossChainPortfolio.diversificationScore}/100</p>
            <p className="text-sm text-white/60">Score</p>
          </div>
          <div className="glass-card p-6 text-center">
            <Activity className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Top Assets</h3>
            <p className="text-3xl font-bold text-white">{crossChainPortfolio.topTokens.length}</p>
            <p className="text-sm text-white/60">Tokens</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'chains', label: 'Chain Metrics', icon: <Globe className="w-4 h-4" /> },
          { id: 'defi', label: 'DeFi Protocols', icon: <Zap className="w-4 h-4" /> },
          { id: 'bridges', label: 'Bridges', icon: <Link2 className="w-4 h-4" /> }
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
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && crossChainPortfolio && (
            <div className="space-y-6">
              {/* Chain Breakdown */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Portfolio by Chain</h3>
                <div className="space-y-4">
                  {Object.entries(crossChainPortfolio.chainBreakdown).map(([chainId, data]) => {
                    const chain = supportedChains.find(c => c.id === chainId)
                    if (!chain) return null

                    return (
                      <motion.div
                        key={chainId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => onChainSelect?.(chainId)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: chain.color }}
                            >
                              {chain.icon}
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{chain.displayName}</h4>
                              <p className="text-white/60 text-sm">{data.tokens.length} tokens</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold">{formatCurrency(data.value)}</div>
                            <div className="text-white/60 text-sm">{data.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        
                        <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${data.percentage}%`,
                              backgroundColor: chain.color
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {data.tokens.slice(0, 4).map((token: any, index: number) => (
                            <div key={index} className="text-center">
                              <div className="text-white text-sm font-medium">{token.symbol}</div>
                              <div className="text-white/60 text-xs">{formatCurrency(token.value)}</div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Top Cross-Chain Assets */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Top Cross-Chain Assets</h3>
                <div className="space-y-3">
                  {crossChainPortfolio.topTokens.map((token: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{token.symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{token.symbol}</h4>
                          <p className="text-white/60 text-sm">{token.chains.length} chains</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{formatCurrency(token.value)}</div>
                        <div className="text-white/60 text-sm">
                          {((token.value / crossChainPortfolio.totalValue) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chains' && (
            <div className="space-y-6">
              {/* Chain Selection */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Select Chains to Compare</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {supportedChains.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => toggleChainSelection(chain.id)}
                      className={`p-3 rounded-lg border transition-colors ${
                        selectedChains.includes(chain.id)
                          ? 'border-purple-400 bg-purple-400/10'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2"
                        style={{ backgroundColor: chain.color }}
                      >
                        {chain.icon}
                      </div>
                      <div className="text-white text-sm font-medium">{chain.displayName}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chain Metrics Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChains.map((chain) => {
                  const metrics = chainMetrics[chain.id]
                  if (!metrics) return null

                  return (
                    <motion.div
                      key={chain.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: chain.color }}
                        >
                          {chain.icon}
                        </div>
                        <div>
                          <h4 className="text-white font-bold">{chain.displayName}</h4>
                          <p className="text-white/60 text-sm">{chain.nativeToken.symbol}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-white/60">Price:</span>
                          <div className="text-right">
                            <span className="text-white">{formatCurrency(metrics.price)}</span>
                            <span className={`ml-2 text-sm ${getPerformanceColor(metrics.priceChange24h)}`}>
                              {formatPercent(metrics.priceChange24h)}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">TVL:</span>
                          <span className="text-white">{formatCurrency(metrics.tvl)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">TPS:</span>
                          <span className="text-white">{formatNumber(metrics.tps)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Gas Price:</span>
                          <span className="text-white">{metrics.gasPrice.toFixed(2)} gwei</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">24h Txns:</span>
                          <span className="text-white">{formatNumber(metrics.transactions24h)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Active Addresses:</span>
                          <span className="text-white">{formatNumber(metrics.activeAddresses)}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Shield className="w-4 h-4" />
                          <span>Block #{formatNumber(metrics.blockHeight)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'defi' && (
            <div className="space-y-6">
              {Object.entries(defiProtocols).map(([chainId, protocols]) => {
                const chain = supportedChains.find(c => c.id === chainId)
                if (!chain || protocols.length === 0) return null

                return (
                  <div key={chainId} className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: chain.color }}
                      >
                        {chain.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white">{chain.displayName} DeFi</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {protocols.map((protocol) => (
                        <div key={protocol.id} className="p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                              <Zap className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{protocol.name}</h4>
                              <p className="text-white/60 text-sm capitalize">{protocol.category}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-white/60">TVL:</span>
                              <span className="text-white">{formatCurrency(protocol.tvl)}</span>
                            </div>
                            {protocol.apy && (
                              <div className="flex justify-between">
                                <span className="text-white/60">APY:</span>
                                <span className="text-green-400">{protocol.apy.toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-white/70 text-xs mt-3">{protocol.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'bridges' && (
            <div className="space-y-6">
              {/* Gas Price Tracker */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Gas Price Tracker</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {Object.entries(gasPrices).map(([chainId, prices]) => {
                    const chain = supportedChains.find(c => c.id === chainId)
                    if (!chain) return null

                    return (
                      <div key={chainId} className="p-4 bg-white/5 rounded-lg text-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2"
                          style={{ backgroundColor: chain.color }}
                        >
                          {chain.icon}
                        </div>
                        <h4 className="text-white font-medium mb-2">{chain.displayName}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-400">Slow:</span>
                            <span className="text-white">{prices.slow?.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-yellow-400">Standard:</span>
                            <span className="text-white">{prices.standard?.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-400">Fast:</span>
                            <span className="text-white">{prices.fast?.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Available Bridges */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Cross-Chain Bridges</h3>
                <div className="space-y-4">
                  {supportedChains.map((chain) => 
                    chain.bridges.map((bridge) => (
                      <div key={bridge.id} className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Link2 className="w-6 h-6 text-blue-400" />
                            <div>
                              <h4 className="text-white font-medium">{bridge.name}</h4>
                              <p className="text-white/60 text-sm">
                                {bridge.supportedChains.join(' ↔ ')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">{bridge.timeEstimate}</div>
                            <div className="text-white/60 text-sm">Est. Time</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-white/60">Min Amount:</span>
                            <div className="text-white">{formatCurrency(bridge.minAmount)}</div>
                          </div>
                          <div>
                            <span className="text-white/60">Max Amount:</span>
                            <div className="text-white">{formatCurrency(bridge.maxAmount)}</div>
                          </div>
                          <div>
                            <span className="text-white/60">Fixed Fee:</span>
                            <div className="text-white">{formatCurrency(bridge.fees.fixed)}</div>
                          </div>
                          <div>
                            <span className="text-white/60">Fee %:</span>
                            <div className="text-white">{bridge.fees.percentage}%</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default CrossChainAnalytics
