import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  DollarSign,
  Volume2,
  RefreshCw,
  AlertCircle,
  Crown,
  Target
} from 'lucide-react'

interface MarketMover {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent: number
  volume24h: number
  marketCap: number
  reason: string
  category: 'gainer' | 'loser' | 'volume'
  rank: number
  image?: string
}

interface MarketMoversProps {
  showGainers?: boolean
  showLosers?: boolean
  showVolume?: boolean
  maxItems?: number
  className?: string
}

const MarketMovers: React.FC<MarketMoversProps> = ({
  showGainers = true,
  showLosers = true,
  showVolume = true,
  maxItems = 3,
  className = ''
}) => {
  const [movers, setMovers] = useState<{
    gainers: MarketMover[]
    losers: MarketMover[]
    volume: MarketMover[]
  }>({
    gainers: [],
    losers: [],
    volume: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers' | 'volume'>('gainers')

  // Fetch market movers data
  const fetchMarketMovers = async () => {
    try {
      setError(null)
      
      // Mock market movers data - in production, this would fetch from real API
      const mockGainers: MarketMover[] = [
        {
          id: '1',
          symbol: 'RNDR',
          name: 'Render Token',
          price: 12.45,
          change24h: 3.42,
          changePercent: 37.8,
          volume24h: 245000000,
          marketCap: 4800000000,
          reason: 'AI partnership announcement',
          category: 'gainer',
          rank: 1,
          image: 'https://via.placeholder.com/32x32/10B981/FFFFFF?text=R'
        },
        {
          id: '2',
          symbol: 'ARB',
          name: 'Arbitrum',
          price: 2.18,
          change24h: 0.52,
          changePercent: 31.4,
          volume24h: 890000000,
          marketCap: 2700000000,
          reason: 'Major DeFi protocol migration',
          category: 'gainer',
          rank: 2,
          image: 'https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=A'
        },
        {
          id: '3',
          symbol: 'PEPE',
          name: 'Pepe',
          price: 0.00000234,
          change24h: 0.00000067,
          changePercent: 28.7,
          volume24h: 1200000000,
          marketCap: 980000000,
          reason: 'Viral social media campaign',
          category: 'gainer',
          rank: 3,
          image: 'https://via.placeholder.com/32x32/10B981/FFFFFF?text=🐸'
        }
      ]

      const mockLosers: MarketMover[] = [
        {
          id: '4',
          symbol: 'LUNA',
          name: 'Terra Luna Classic',
          price: 0.000089,
          change24h: -0.000034,
          changePercent: -27.6,
          volume24h: 45000000,
          marketCap: 520000000,
          reason: 'Regulatory concerns resurface',
          category: 'loser',
          rank: 1,
          image: 'https://via.placeholder.com/32x32/EF4444/FFFFFF?text=L'
        },
        {
          id: '5',
          symbol: 'FTT',
          name: 'FTX Token',
          price: 1.23,
          change24h: -0.41,
          changePercent: -25.0,
          volume24h: 12000000,
          marketCap: 180000000,
          reason: 'Exchange bankruptcy proceedings',
          category: 'loser',
          rank: 2,
          image: 'https://via.placeholder.com/32x32/EF4444/FFFFFF?text=F'
        },
        {
          id: '6',
          symbol: 'ICP',
          name: 'Internet Computer',
          price: 8.92,
          change24h: -1.87,
          changePercent: -17.3,
          volume24h: 67000000,
          marketCap: 4100000000,
          reason: 'Technical issues reported',
          category: 'loser',
          rank: 3,
          image: 'https://via.placeholder.com/32x32/EF4444/FFFFFF?text=I'
        }
      ]

      const mockVolume: MarketMover[] = [
        {
          id: '7',
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 67250,
          change24h: 1420,
          changePercent: 2.1,
          volume24h: 28500000000,
          marketCap: 1320000000000,
          reason: 'ETF inflow surge',
          category: 'volume',
          rank: 1,
          image: 'https://via.placeholder.com/32x32/F59E0B/FFFFFF?text=₿'
        },
        {
          id: '8',
          symbol: 'ETH',
          name: 'Ethereum',
          price: 3850,
          change24h: 69,
          changePercent: 1.8,
          volume24h: 16200000000,
          marketCap: 462000000000,
          reason: 'Layer 2 activity spike',
          category: 'volume',
          rank: 2,
          image: 'https://via.placeholder.com/32x32/8B5CF6/FFFFFF?text=Ξ'
        },
        {
          id: '9',
          symbol: 'SOL',
          name: 'Solana',
          price: 185,
          change24h: 8.1,
          changePercent: 4.5,
          volume24h: 3200000000,
          marketCap: 82000000000,
          reason: 'Memecoin trading frenzy',
          category: 'volume',
          rank: 3,
          image: 'https://via.placeholder.com/32x32/10B981/FFFFFF?text=◎'
        }
      ]

      setMovers({
        gainers: mockGainers.slice(0, maxItems),
        losers: mockLosers.slice(0, maxItems),
        volume: mockVolume.slice(0, maxItems)
      })
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market movers')
      setIsLoading(false)
    }
  }

  // Initialize and auto-refresh
  useEffect(() => {
    fetchMarketMovers()
    
    const interval = setInterval(fetchMarketMovers, 2 * 60 * 1000) // Refresh every 2 minutes
    return () => clearInterval(interval)
  }, [maxItems])

  // Format price
  const formatPrice = (price: number): string => {
    if (price < 0.001) return `$${price.toFixed(8)}`
    if (price < 1) return `$${price.toFixed(6)}`
    if (price < 100) return `$${price.toFixed(2)}`
    return `$${price.toLocaleString()}`
  }

  // Format number
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
    return `$${num.toFixed(2)}`
  }

  // Get tab configuration
  const tabs = [
    { id: 'gainers' as const, name: 'Top Gainers', icon: TrendingUp, color: 'text-green-400', show: showGainers },
    { id: 'losers' as const, name: 'Top Losers', icon: TrendingDown, color: 'text-red-400', show: showLosers },
    { id: 'volume' as const, name: 'High Volume', icon: Volume2, color: 'text-blue-400', show: showVolume }
  ].filter(tab => tab.show)

  // Get current data
  const currentData = movers[activeTab] || []

  if (isLoading) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Market Movers</h3>
          </div>
          <RefreshCw className="w-4 h-4 text-white/60 animate-spin" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-white/10 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded mb-1"></div>
                <div className="h-3 bg-white/5 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Market Movers</h3>
          </div>
          <button onClick={fetchMarketMovers} className="p-1 hover:bg-white/10 rounded">
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        </div>
        <div className="text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Market Movers</h3>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>
        <button 
          onClick={fetchMarketMovers} 
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-4 p-1 bg-white/5 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
              <span className="hidden sm:block">{tab.name}</span>
            </button>
          )
        })}
      </div>

      {/* Market Movers List */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {currentData.map((mover, index) => (
            <motion.div
              key={`${activeTab}-${mover.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  {mover.image && (
                    <img 
                      src={mover.image} 
                      alt={mover.symbol}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  {mover.rank === 1 && (
                    <Crown className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
                  )}
                </div>
                <div className="text-xs text-white/60">#{mover.rank}</div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">{mover.symbol}</span>
                      <span className="text-white/60 text-xs">{mover.name}</span>
                    </div>
                    <div className="text-white/50 text-xs mt-0.5 line-clamp-1">
                      {mover.reason}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-medium text-sm">
                      {formatPrice(mover.price)}
                    </div>
                    <div className={`text-xs font-medium ${
                      mover.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {mover.changePercent >= 0 ? '+' : ''}{mover.changePercent.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-white/50">
                  <span>Vol: {formatNumber(mover.volume24h)}</span>
                  <span>MCap: {formatNumber(mover.marketCap)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <button className="w-full text-center text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors">
          View Full Rankings →
        </button>
      </div>
    </div>
  )
}

export default MarketMovers
