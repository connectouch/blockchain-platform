import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRightLeft,
  ArrowRight,
  ArrowDown,
  Zap,
  Clock,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Info,
  ExternalLink,
  Copy,
  Search,
  Filter,
  TrendingUp,
  Activity,
  Globe
} from 'lucide-react'
import MultiChainService, { ChainConfig, BridgeConfig } from '../services/MultiChainService'

interface BridgeTransaction {
  id: string
  fromChain: string
  toChain: string
  fromToken: string
  toToken: string
  amount: number
  estimatedReceived: number
  fees: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  txHash?: string
  estimatedTime: string
  actualTime?: string
  timestamp: Date
  bridgeUsed: string
}

interface BridgeRoute {
  id: string
  fromChain: string
  toChain: string
  bridge: BridgeConfig
  estimatedTime: string
  totalFees: number
  slippage: number
  gasEstimate: number
  confidence: number
}

interface BridgeIntegrationHubProps {
  onBridgeTransaction?: (transaction: BridgeTransaction) => void
  defaultFromChain?: string
  defaultToChain?: string
}

const BridgeIntegrationHub: React.FC<BridgeIntegrationHubProps> = ({
  onBridgeTransaction,
  defaultFromChain = 'ethereum',
  defaultToChain = 'polygon'
}) => {
  const [supportedChains, setSupportedChains] = useState<ChainConfig[]>([])
  const [fromChain, setFromChain] = useState(defaultFromChain)
  const [toChain, setToChain] = useState(defaultToChain)
  const [fromToken, setFromToken] = useState('ETH')
  const [toToken, setToToken] = useState('ETH')
  const [amount, setAmount] = useState('')
  const [availableRoutes, setAvailableRoutes] = useState<BridgeRoute[]>([])
  const [selectedRoute, setSelectedRoute] = useState<BridgeRoute | null>(null)
  const [bridgeHistory, setBridgeHistory] = useState<BridgeTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [slippageTolerance, setSlippageTolerance] = useState(0.5)
  const [gasPrice, setGasPrice] = useState('standard')

  const multiChainService = MultiChainService.getInstance()

  // Initialize data
  useEffect(() => {
    const chains = multiChainService.getSupportedChains()
    setSupportedChains(chains)
    loadBridgeHistory()
  }, [])

  // Find available routes when chains or amount change
  useEffect(() => {
    if (fromChain && toChain && amount && parseFloat(amount) > 0) {
      findAvailableRoutes()
    }
  }, [fromChain, toChain, amount])

  // Load bridge transaction history
  const loadBridgeHistory = () => {
    // Mock bridge history
    const mockHistory: BridgeTransaction[] = [
      {
        id: 'bridge-1',
        fromChain: 'ethereum',
        toChain: 'polygon',
        fromToken: 'USDC',
        toToken: 'USDC',
        amount: 1000,
        estimatedReceived: 999.5,
        fees: 0.5,
        status: 'completed',
        txHash: '0x1234...5678',
        estimatedTime: '7-8 minutes',
        actualTime: '6 minutes',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        bridgeUsed: 'Polygon Bridge'
      },
      {
        id: 'bridge-2',
        fromChain: 'ethereum',
        toChain: 'bsc',
        fromToken: 'ETH',
        toToken: 'ETH',
        amount: 0.5,
        estimatedReceived: 0.499,
        fees: 0.001,
        status: 'processing',
        estimatedTime: '3-5 minutes',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        bridgeUsed: 'Binance Bridge'
      }
    ]
    setBridgeHistory(mockHistory)
  }

  // Find available bridge routes
  const findAvailableRoutes = async () => {
    setIsLoading(true)
    
    try {
      const bridges = await multiChainService.getAvailableBridges(fromChain, toChain)
      const routes: BridgeRoute[] = []

      for (const bridge of bridges) {
        const estimate = await multiChainService.estimateBridgeTransfer(
          fromChain,
          toChain,
          fromToken,
          parseFloat(amount)
        )

        routes.push({
          id: `${bridge.id}-${fromChain}-${toChain}`,
          fromChain,
          toChain,
          bridge,
          estimatedTime: estimate.estimatedTime,
          totalFees: estimate.fees,
          slippage: estimate.slippage,
          gasEstimate: Math.random() * 50 + 10, // Mock gas estimate
          confidence: Math.random() * 30 + 70 // Mock confidence score
        })
      }

      // Sort by total cost (fees + gas)
      routes.sort((a, b) => (a.totalFees + a.gasEstimate) - (b.totalFees + b.gasEstimate))
      
      setAvailableRoutes(routes)
      if (routes.length > 0) {
        setSelectedRoute(routes[0])
      }
    } catch (error) {
      console.error('Error finding bridge routes:', error)
    }
    
    setIsLoading(false)
  }

  // Execute bridge transaction
  const executeBridge = async () => {
    if (!selectedRoute || !amount) return

    const transaction: BridgeTransaction = {
      id: `bridge-${Date.now()}`,
      fromChain,
      toChain,
      fromToken,
      toToken,
      amount: parseFloat(amount),
      estimatedReceived: parseFloat(amount) - selectedRoute.totalFees,
      fees: selectedRoute.totalFees,
      status: 'pending',
      estimatedTime: selectedRoute.estimatedTime,
      timestamp: new Date(),
      bridgeUsed: selectedRoute.bridge.name
    }

    setBridgeHistory(prev => [transaction, ...prev])
    onBridgeTransaction?.(transaction)

    // Simulate transaction processing
    setTimeout(() => {
      setBridgeHistory(prev => prev.map(tx => 
        tx.id === transaction.id 
          ? { ...tx, status: 'processing', txHash: '0x' + Math.random().toString(16).substr(2, 8) + '...' }
          : tx
      ))
    }, 2000)

    setTimeout(() => {
      setBridgeHistory(prev => prev.map(tx => 
        tx.id === transaction.id 
          ? { ...tx, status: 'completed', actualTime: selectedRoute.estimatedTime }
          : tx
      ))
    }, 8000)

    // Reset form
    setAmount('')
    setSelectedRoute(null)
    setAvailableRoutes([])
  }

  // Swap from and to chains
  const swapChains = () => {
    const tempChain = fromChain
    const tempToken = fromToken
    setFromChain(toChain)
    setToChain(tempChain)
    setFromToken(toToken)
    setToToken(tempToken)
  }

  // Get chain by ID
  const getChain = (chainId: string): ChainConfig | undefined => {
    return supportedChains.find(c => c.id === chainId)
  }

  // Format currency
  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
  }

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'processing': return 'text-yellow-400'
      case 'pending': return 'text-blue-400'
      case 'failed': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'failed': return <AlertTriangle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Bridge Integration Hub</h2>
          <p className="text-white/60">Transfer assets across different blockchain networks</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showAdvanced 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <Settings className="w-4 h-4" />
            Advanced
          </button>
        </div>
      </div>

      {/* Bridge Interface */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-6">Cross-Chain Transfer</h3>
        
        <div className="space-y-6">
          {/* From Section */}
          <div className="space-y-4">
            <label className="block text-white/80 text-sm font-medium">From</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={fromChain}
                onChange={(e) => setFromChain(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
              >
                {supportedChains.map(chain => (
                  <option key={chain.id} value={chain.id} className="bg-gray-800">
                    {chain.icon} {chain.displayName}
                  </option>
                ))}
              </select>
              <select
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
              >
                <option value="ETH" className="bg-gray-800">ETH</option>
                <option value="USDC" className="bg-gray-800">USDC</option>
                <option value="USDT" className="bg-gray-800">USDT</option>
              </select>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapChains}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* To Section */}
          <div className="space-y-4">
            <label className="block text-white/80 text-sm font-medium">To</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={toChain}
                onChange={(e) => setToChain(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
              >
                {supportedChains.map(chain => (
                  <option key={chain.id} value={chain.id} className="bg-gray-800">
                    {chain.icon} {chain.displayName}
                  </option>
                ))}
              </select>
              <select
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
              >
                <option value="ETH" className="bg-gray-800">ETH</option>
                <option value="USDC" className="bg-gray-800">USDC</option>
                <option value="USDT" className="bg-gray-800">USDT</option>
              </select>
            </div>
          </div>

          {/* Advanced Settings */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4 border-t border-white/10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Slippage Tolerance: {slippageTolerance}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={slippageTolerance}
                      onChange={(e) => setSlippageTolerance(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Gas Price</label>
                    <select
                      value={gasPrice}
                      onChange={(e) => setGasPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value="slow" className="bg-gray-800">Slow</option>
                      <option value="standard" className="bg-gray-800">Standard</option>
                      <option value="fast" className="bg-gray-800">Fast</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Available Routes */}
      {availableRoutes.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Available Routes</h3>
          <div className="space-y-3">
            {availableRoutes.map((route) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedRoute?.id === route.id
                    ? 'border-purple-400 bg-purple-400/10'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => setSelectedRoute(route)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{getChain(route.fromChain)?.icon}</span>
                      <ArrowRight className="w-4 h-4 text-white/60" />
                      <span className="text-white font-medium">{getChain(route.toChain)?.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{route.bridge.name}</h4>
                      <p className="text-white/60 text-sm">{route.estimatedTime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{formatCurrency(route.totalFees)}</div>
                    <div className="text-white/60 text-sm">Total Fees</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Bridge Fee:</span>
                    <div className="text-white">{formatCurrency(route.totalFees)}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Gas Estimate:</span>
                    <div className="text-white">{formatCurrency(route.gasEstimate)}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Slippage:</span>
                    <div className="text-yellow-400">{route.slippage.toFixed(2)}%</div>
                  </div>
                  <div>
                    <span className="text-white/60">Confidence:</span>
                    <div className="text-green-400">{route.confidence.toFixed(0)}%</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {selectedRoute && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-white font-medium">Transfer Summary</h4>
                  <p className="text-white/60 text-sm">
                    {amount} {fromToken} → {(parseFloat(amount) - selectedRoute.totalFees).toFixed(6)} {toToken}
                  </p>
                </div>
                <button
                  onClick={executeBridge}
                  disabled={isLoading || !amount}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:text-gray-400 rounded-lg text-white font-medium transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Start Bridge'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bridge History */}
      {bridgeHistory.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Bridge History</h3>
          <div className="space-y-3">
            {bridgeHistory.map((transaction) => (
              <div key={transaction.id} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(transaction.status)} bg-current/20`}>
                      {getStatusIcon(transaction.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {getChain(transaction.fromChain)?.icon} → {getChain(transaction.toChain)?.icon}
                        </span>
                        <span className="text-white/60">via {transaction.bridgeUsed}</span>
                      </div>
                      <p className="text-white/60 text-sm">
                        {transaction.amount} {transaction.fromToken} → {transaction.estimatedReceived} {transaction.toToken}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status.toUpperCase()}
                    </div>
                    <div className="text-white/60 text-sm">
                      {transaction.actualTime || transaction.estimatedTime}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Amount:</span>
                    <div className="text-white">{transaction.amount} {transaction.fromToken}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Fees:</span>
                    <div className="text-white">{formatCurrency(transaction.fees)}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Time:</span>
                    <div className="text-white">{transaction.timestamp.toLocaleTimeString()}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Tx Hash:</span>
                    <div className="text-blue-400 flex items-center gap-1">
                      {transaction.txHash || 'Pending...'}
                      {transaction.txHash && (
                        <button className="p-1 hover:bg-white/10 rounded">
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bridge Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 text-center">
          <Activity className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Total Bridges</h3>
          <p className="text-3xl font-bold text-white">{bridgeHistory.length}</p>
        </div>
        <div className="glass-card p-6 text-center">
          <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Volume Bridged</h3>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(bridgeHistory.reduce((sum, tx) => sum + tx.amount, 0))}
          </p>
        </div>
        <div className="glass-card p-6 text-center">
          <Clock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Avg Time</h3>
          <p className="text-3xl font-bold text-white">6.5 min</p>
        </div>
      </div>
    </div>
  )
}

export default BridgeIntegrationHub
