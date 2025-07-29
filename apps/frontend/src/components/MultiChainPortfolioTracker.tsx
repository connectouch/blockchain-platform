import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wallet,
  Plus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Eye,
  EyeOff,
  Settings,
  Download,
  Upload,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Shield,
  Clock,
  Globe,
  Link,
  ExternalLink
} from 'lucide-react'

interface ChainAsset {
  symbol: string
  name: string
  balance: number
  price: number
  value: number
  change24h: number
  contractAddress?: string
  decimals: number
  logo?: string
}

interface ChainData {
  chainId: string
  name: string
  symbol: string
  logo: string
  rpcUrl: string
  explorerUrl: string
  nativeCurrency: ChainAsset
  totalValue: number
  assetCount: number
  assets: ChainAsset[]
  isConnected: boolean
  lastUpdated: number
}

interface WalletConnection {
  address: string
  label: string
  type: 'metamask' | 'walletconnect' | 'coinbase' | 'manual'
  isConnected: boolean
  chains: string[]
}

interface MultiChainPortfolioTrackerProps {
  onWalletConnect?: (wallet: WalletConnection) => void
  onAssetSelect?: (asset: ChainAsset, chain: ChainData) => void
}

const MultiChainPortfolioTracker: React.FC<MultiChainPortfolioTrackerProps> = ({
  onWalletConnect,
  onAssetSelect
}) => {
  const [chains, setChains] = useState<ChainData[]>([])
  const [wallets, setWallets] = useState<WalletConnection[]>([])
  const [selectedChain, setSelectedChain] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSmallBalances, setShowSmallBalances] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddWallet, setShowAddWallet] = useState(false)
  const [newWalletAddress, setNewWalletAddress] = useState('')

  // Initialize chain data
  useEffect(() => {
    const mockChains: ChainData[] = [
      {
        chainId: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        logo: '🔷',
        rpcUrl: 'https://mainnet.infura.io/v3/',
        explorerUrl: 'https://etherscan.io',
        nativeCurrency: {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: 2.5,
          price: 2950,
          value: 7375,
          change24h: 3.2,
          decimals: 18
        },
        totalValue: 15420,
        assetCount: 8,
        assets: [
          {
            symbol: 'USDC',
            name: 'USD Coin',
            balance: 5000,
            price: 1.00,
            value: 5000,
            change24h: 0.1,
            contractAddress: '0xA0b86a33E6417c8f2c8B758628E6B8B8B8B8B8B8',
            decimals: 6
          },
          {
            symbol: 'UNI',
            name: 'Uniswap',
            balance: 150,
            price: 8.45,
            value: 1267.5,
            change24h: -2.1,
            contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
            decimals: 18
          },
          {
            symbol: 'LINK',
            name: 'Chainlink',
            balance: 85,
            price: 18.75,
            value: 1593.75,
            change24h: 5.8,
            contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
            decimals: 18
          }
        ],
        isConnected: true,
        lastUpdated: Date.now()
      },
      {
        chainId: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        logo: '₿',
        rpcUrl: '',
        explorerUrl: 'https://blockstream.info',
        nativeCurrency: {
          symbol: 'BTC',
          name: 'Bitcoin',
          balance: 0.25,
          price: 45200,
          value: 11300,
          change24h: 2.8,
          decimals: 8
        },
        totalValue: 11300,
        assetCount: 1,
        assets: [],
        isConnected: true,
        lastUpdated: Date.now()
      },
      {
        chainId: 'solana',
        name: 'Solana',
        symbol: 'SOL',
        logo: '◎',
        rpcUrl: 'https://api.mainnet-beta.solana.com',
        explorerUrl: 'https://solscan.io',
        nativeCurrency: {
          symbol: 'SOL',
          name: 'Solana',
          balance: 45,
          price: 105,
          value: 4725,
          change24h: 8.5,
          decimals: 9
        },
        totalValue: 6890,
        assetCount: 4,
        assets: [
          {
            symbol: 'USDC',
            name: 'USD Coin (Solana)',
            balance: 1500,
            price: 1.00,
            value: 1500,
            change24h: 0.0,
            contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            decimals: 6
          },
          {
            symbol: 'RAY',
            name: 'Raydium',
            balance: 250,
            price: 2.66,
            value: 665,
            change24h: 12.4,
            contractAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
            decimals: 6
          }
        ],
        isConnected: true,
        lastUpdated: Date.now()
      },
      {
        chainId: 'polygon',
        name: 'Polygon',
        symbol: 'MATIC',
        logo: '🔺',
        rpcUrl: 'https://polygon-rpc.com',
        explorerUrl: 'https://polygonscan.com',
        nativeCurrency: {
          symbol: 'MATIC',
          name: 'Polygon',
          balance: 1200,
          price: 0.85,
          value: 1020,
          change24h: -1.5,
          decimals: 18
        },
        totalValue: 3250,
        assetCount: 3,
        assets: [
          {
            symbol: 'USDC',
            name: 'USD Coin (Polygon)',
            balance: 2000,
            price: 1.00,
            value: 2000,
            change24h: 0.0,
            contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            decimals: 6
          },
          {
            symbol: 'QUICK',
            name: 'QuickSwap',
            balance: 500,
            price: 0.46,
            value: 230,
            change24h: 4.2,
            contractAddress: '0x831753DD7087CaC61aB5644b308642cc1c33Dc13',
            decimals: 18
          }
        ],
        isConnected: false,
        lastUpdated: Date.now() - 5 * 60 * 1000
      }
    ]

    const mockWallets: WalletConnection[] = [
      {
        address: '0x742d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C',
        label: 'Main Wallet',
        type: 'metamask',
        isConnected: true,
        chains: ['ethereum', 'polygon']
      },
      {
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        label: 'Bitcoin Wallet',
        type: 'manual',
        isConnected: true,
        chains: ['bitcoin']
      },
      {
        address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHUg',
        label: 'Solana Wallet',
        type: 'manual',
        isConnected: true,
        chains: ['solana']
      }
    ]

    setChains(mockChains)
    setWallets(mockWallets)
  }, [])

  // Calculate total portfolio value
  const totalPortfolioValue = chains.reduce((sum, chain) => sum + chain.totalValue, 0)
  const totalAssets = chains.reduce((sum, chain) => sum + chain.assetCount, 0)
  const connectedChains = chains.filter(chain => chain.isConnected).length

  // Get all assets across chains
  const allAssets = chains.flatMap(chain => [
    { ...chain.nativeCurrency, chainId: chain.chainId, chainName: chain.name },
    ...chain.assets.map(asset => ({ ...asset, chainId: chain.chainId, chainName: chain.name }))
  ])

  // Filter assets
  const filteredAssets = allAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesChain = selectedChain === 'all' || asset.chainId === selectedChain
    const matchesBalance = showSmallBalances || asset.value >= 1
    return matchesSearch && matchesChain && matchesBalance
  })

  // Refresh portfolio data
  const refreshPortfolio = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setChains(prev => prev.map(chain => ({
        ...chain,
        lastUpdated: Date.now()
      })))
      setIsLoading(false)
    }, 2000)
  }

  // Add new wallet
  const addWallet = () => {
    if (!newWalletAddress) return

    const newWallet: WalletConnection = {
      address: newWalletAddress,
      label: `Wallet ${wallets.length + 1}`,
      type: 'manual',
      isConnected: false,
      chains: []
    }

    setWallets(prev => [...prev, newWallet])
    setNewWalletAddress('')
    setShowAddWallet(false)
    onWalletConnect?.(newWallet)
  }

  // Format currency
  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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

  // Format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Multi-Chain Portfolio</h2>
          <p className="text-white/60">Track your assets across all blockchain networks</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddWallet(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Wallet
          </button>
          <button
            onClick={refreshPortfolio}
            disabled={isLoading}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            title="Refresh Portfolio"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 text-center">
          <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Total Value</h3>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(totalPortfolioValue)}
          </p>
        </div>
        <div className="glass-card p-6 text-center">
          <Activity className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Total Assets</h3>
          <p className="text-3xl font-bold text-white">{totalAssets}</p>
        </div>
        <div className="glass-card p-6 text-center">
          <Globe className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Connected Chains</h3>
          <p className="text-3xl font-bold text-white">{connectedChains}</p>
        </div>
        <div className="glass-card p-6 text-center">
          <Wallet className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Wallets</h3>
          <p className="text-3xl font-bold text-white">{wallets.length}</p>
        </div>
      </div>

      {/* Chain Overview */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Chain Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {chains.map(chain => (
            <div key={chain.chainId} className={`p-4 rounded-lg border ${
              chain.isConnected ? 'border-green-400/30 bg-green-400/5' : 'border-white/10 bg-white/5'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{chain.logo}</span>
                  <div>
                    <h4 className="text-white font-medium">{chain.name}</h4>
                    <p className="text-white/60 text-sm">{chain.assetCount} assets</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${chain.isConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60 text-sm">Value:</span>
                  <span className="text-white font-medium">{formatCurrency(chain.totalValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60 text-sm">Native:</span>
                  <span className="text-white font-medium">
                    {chain.nativeCurrency.balance.toFixed(4)} {chain.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60 text-sm">Updated:</span>
                  <span className="text-white/60 text-sm">{formatTimeAgo(chain.lastUpdated)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
          />
        </div>
        
        <select
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
        >
          <option value="all" className="bg-gray-800">All Chains</option>
          {chains.map(chain => (
            <option key={chain.chainId} value={chain.chainId} className="bg-gray-800">
              {chain.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowSmallBalances(!showSmallBalances)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
            showSmallBalances 
              ? 'bg-purple-600 text-white' 
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          {showSmallBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          Small Balances
        </button>
      </div>

      {/* Assets List */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Assets ({filteredAssets.length})</h3>
        <div className="space-y-3">
          {filteredAssets.map((asset, index) => (
            <motion.div
              key={`${asset.chainId}-${asset.symbol}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => onAssetSelect?.(asset, chains.find(c => c.chainId === asset.chainId)!)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{asset.symbol.slice(0, 2)}</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">{asset.symbol}</h4>
                  <p className="text-white/60 text-sm">{asset.name}</p>
                  <p className="text-white/40 text-xs">{(asset as any).chainName}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white font-medium">{formatCurrency(asset.value)}</div>
                <div className="text-white/60 text-sm">
                  {asset.balance.toLocaleString()} {asset.symbol}
                </div>
                <div className={`text-sm ${getPerformanceColor(asset.change24h)}`}>
                  {formatPercent(asset.change24h)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Assets Found</h3>
            <p className="text-white/60">Try adjusting your search criteria or connect more wallets</p>
          </div>
        )}
      </div>

      {/* Add Wallet Modal */}
      <AnimatePresence>
        {showAddWallet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddWallet(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Add Wallet Address</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="0x... or bc1... or 7x..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddWallet(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addWallet}
                    disabled={!newWalletAddress}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors disabled:opacity-50"
                  >
                    Add Wallet
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MultiChainPortfolioTracker
