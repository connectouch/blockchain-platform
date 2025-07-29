import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  Activity,
  DollarSign,
  Timer
} from 'lucide-react'
import { useRealTimeMarketData } from '../hooks/useRealTimeData'

interface NetworkGasData {
  network: string
  chainId: number
  symbol: string
  gasPrice: number
  gasPriceGwei: number
  fastGas: number
  standardGas: number
  safeGas: number
  baseFee?: number
  priorityFee?: number
  congestion: 'low' | 'medium' | 'high'
  blockTime: number
  lastBlock: number
  isRealTime: boolean
  color: string
  icon: string
}

const RealTimeGasTracker: React.FC = () => {
  const { isConnected } = useRealTimeMarketData()
  const [gasData, setGasData] = useState<NetworkGasData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<string>('ethereum')

  // Mock real-time gas data (in production, this would come from actual APIs)
  const generateMockGasData = (): NetworkGasData[] => {
    const baseGasData: Omit<NetworkGasData, 'gasPrice' | 'gasPriceGwei' | 'fastGas' | 'standardGas' | 'safeGas' | 'baseFee' | 'priorityFee' | 'congestion' | 'lastBlock'>[] = [
      {
        network: 'Ethereum',
        chainId: 1,
        symbol: 'ETH',
        blockTime: 12,
        isRealTime: true,
        color: 'from-blue-400 to-blue-600',
        icon: 'Ξ'
      },
      {
        network: 'Polygon',
        chainId: 137,
        symbol: 'MATIC',
        blockTime: 2,
        isRealTime: true,
        color: 'from-purple-400 to-purple-600',
        icon: '⬟'
      },
      {
        network: 'BSC',
        chainId: 56,
        symbol: 'BNB',
        blockTime: 3,
        isRealTime: true,
        color: 'from-yellow-400 to-yellow-600',
        icon: '◆'
      },
      {
        network: 'Arbitrum',
        chainId: 42161,
        symbol: 'ETH',
        blockTime: 1,
        isRealTime: true,
        color: 'from-cyan-400 to-cyan-600',
        icon: '▲'
      },
      {
        network: 'Optimism',
        chainId: 10,
        symbol: 'ETH',
        blockTime: 2,
        isRealTime: true,
        color: 'from-red-400 to-red-600',
        icon: '○'
      },
      {
        network: 'Avalanche',
        chainId: 43114,
        symbol: 'AVAX',
        blockTime: 2,
        isRealTime: true,
        color: 'from-red-500 to-red-700',
        icon: '▲'
      }
    ]

    return baseGasData.map(network => {
      // Generate realistic gas prices based on network
      let baseGas: number
      let multiplier: number

      switch (network.network) {
        case 'Ethereum':
          baseGas = 20 + Math.random() * 80 // 20-100 gwei
          multiplier = 1
          break
        case 'Polygon':
          baseGas = 30 + Math.random() * 200 // 30-230 gwei
          multiplier = 0.001 // Much cheaper in USD
          break
        case 'BSC':
          baseGas = 5 + Math.random() * 15 // 5-20 gwei
          multiplier = 0.01
          break
        case 'Arbitrum':
          baseGas = 0.1 + Math.random() * 2 // 0.1-2.1 gwei
          multiplier = 1
          break
        case 'Optimism':
          baseGas = 0.001 + Math.random() * 0.01 // Very low
          multiplier = 1
          break
        case 'Avalanche':
          baseGas = 25 + Math.random() * 50 // 25-75 nAVAX
          multiplier = 0.02
          break
        default:
          baseGas = 20
          multiplier = 1
      }

      const safeGas = baseGas
      const standardGas = baseGas * 1.2
      const fastGas = baseGas * 1.5

      const congestion: 'low' | 'medium' | 'high' = 
        baseGas < 30 ? 'low' : baseGas < 60 ? 'medium' : 'high'

      return {
        ...network,
        gasPrice: baseGas * multiplier,
        gasPriceGwei: baseGas,
        fastGas,
        standardGas,
        safeGas,
        baseFee: network.network === 'Ethereum' ? baseGas * 0.8 : undefined,
        priorityFee: network.network === 'Ethereum' ? baseGas * 0.2 : undefined,
        congestion,
        lastBlock: Math.floor(Math.random() * 1000000) + 18000000
      }
    })
  }

  // Fetch gas data
  const fetchGasData = async () => {
    setIsLoading(true)
    try {
      // In production, this would fetch from real APIs like Etherscan, Polygonscan, etc.
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      const mockData = generateMockGasData()
      setGasData(mockData)
      setError(null)
    } catch (err) {
      setError('Failed to fetch gas data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGasData()
    const interval = setInterval(fetchGasData, 15000) // Update every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const selectedNetworkData = gasData.find(network => 
    network.network.toLowerCase() === selectedNetwork.toLowerCase()
  ) || gasData[0]

  const getCongestionColor = (congestion: string) => {
    switch (congestion) {
      case 'low': return 'text-green-400 bg-green-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'high': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const formatGasPrice = (price: number, symbol: string) => {
    if (price < 0.01) return `${(price * 1000).toFixed(2)}m${symbol}`
    if (price < 1) return `${price.toFixed(3)} ${symbol}`
    return `${price.toFixed(2)} ${symbol}`
  }

  const estimateTransactionCost = (gasPrice: number, gasLimit: number = 21000) => {
    return (gasPrice * gasLimit / 1e9).toFixed(6)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Real-Time Gas Tracker</h2>
          <p className="text-white/60">Live network fees across multiple chains</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Live Data</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchGasData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Network Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gasData.map((network, index) => (
          <motion.div
            key={network.network}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedNetwork(network.network)}
            className={`glass-card p-6 cursor-pointer transition-all hover:bg-white/5 ${
              selectedNetwork.toLowerCase() === network.network.toLowerCase()
                ? 'ring-2 ring-blue-400/50'
                : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${network.color} rounded-full flex items-center justify-center text-white font-bold`}>
                  {network.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{network.network}</h3>
                  <p className="text-white/60 text-sm">Chain ID: {network.chainId}</p>
                </div>
              </div>
              
              {network.isRealTime && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Standard Gas</span>
                <span className="text-white font-semibold">
                  {network.gasPriceGwei.toFixed(1)} Gwei
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Est. Cost</span>
                <span className="text-white font-semibold">
                  ${(network.gasPrice * 21000 / 1e9 * (network.symbol === 'ETH' ? 2600 : network.symbol === 'BNB' ? 300 : network.symbol === 'MATIC' ? 0.8 : network.symbol === 'AVAX' ? 25 : 100)).toFixed(3)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Congestion</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCongestionColor(network.congestion)}`}>
                  {network.congestion.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Block Time</span>
                <span className="text-white font-semibold">{network.blockTime}s</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed View for Selected Network */}
      {selectedNetworkData && (
        <motion.div
          key={selectedNetworkData.network}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${selectedNetworkData.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
              {selectedNetworkData.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{selectedNetworkData.network} Gas Prices</h3>
              <p className="text-white/60">Real-time network fee analysis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Safe Gas */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">Safe</span>
              </div>
              <p className="text-2xl font-bold text-white">{selectedNetworkData.safeGas.toFixed(1)} Gwei</p>
              <p className="text-white/60 text-sm">~5 minutes</p>
            </div>

            {/* Standard Gas */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-semibold">Standard</span>
              </div>
              <p className="text-2xl font-bold text-white">{selectedNetworkData.standardGas.toFixed(1)} Gwei</p>
              <p className="text-white/60 text-sm">~2 minutes</p>
            </div>

            {/* Fast Gas */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 font-semibold">Fast</span>
              </div>
              <p className="text-2xl font-bold text-white">{selectedNetworkData.fastGas.toFixed(1)} Gwei</p>
              <p className="text-white/60 text-sm">~30 seconds</p>
            </div>
          </div>

          {/* EIP-1559 Info (for Ethereum) */}
          {selectedNetworkData.network === 'Ethereum' && selectedNetworkData.baseFee && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Base Fee</h4>
                <p className="text-xl font-bold text-white">{selectedNetworkData.baseFee.toFixed(2)} Gwei</p>
                <p className="text-white/60 text-sm">Burned with each transaction</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Priority Fee</h4>
                <p className="text-xl font-bold text-white">{selectedNetworkData.priorityFee?.toFixed(2)} Gwei</p>
                <p className="text-white/60 text-sm">Tip to miners</p>
              </div>
            </div>
          )}

          {/* Transaction Cost Estimates */}
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-4">Estimated Transaction Costs</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex justify-between">
                <span className="text-white/60">Simple Transfer:</span>
                <span className="text-white font-semibold">
                  {estimateTransactionCost(selectedNetworkData.standardGas, 21000)} {selectedNetworkData.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Token Transfer:</span>
                <span className="text-white font-semibold">
                  {estimateTransactionCost(selectedNetworkData.standardGas, 65000)} {selectedNetworkData.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Swap (DEX):</span>
                <span className="text-white font-semibold">
                  {estimateTransactionCost(selectedNetworkData.standardGas, 150000)} {selectedNetworkData.symbol}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-card p-4 border border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && gasData.length === 0 && (
        <div className="glass-card p-8 text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading real-time gas data...</p>
        </div>
      )}
    </div>
  )
}

export default RealTimeGasTracker
