import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Hash, 
  Eye,
  MessageCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

interface TrendingTopic {
  id: string
  name: string
  category: string
  mentions: number
  sentiment: number // -1 to 1
  change24h: number
  volume: number
  description: string
  hashtag: string
  color: string
}

interface TrendingTopicsProps {
  maxItems?: number
  showMetrics?: boolean
  className?: string
}

const TrendingTopics: React.FC<TrendingTopicsProps> = ({
  maxItems = 6,
  showMetrics = true,
  className = ''
}) => {
  const [topics, setTopics] = useState<TrendingTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fetch trending topics
  const fetchTrendingTopics = async () => {
    try {
      setError(null)
      
      // Mock trending topics data - in production, this would fetch from social media APIs
      const mockTopics: TrendingTopic[] = [
        {
          id: '1',
          name: 'Bitcoin ETF',
          category: 'Bitcoin',
          mentions: 45200,
          sentiment: 0.7,
          change24h: 23.5,
          volume: 2100000000,
          description: 'Institutional adoption accelerating',
          hashtag: '#BitcoinETF',
          color: 'bg-orange-500'
        },
        {
          id: '2',
          name: 'Layer 2 Scaling',
          category: 'Ethereum',
          mentions: 28900,
          sentiment: 0.6,
          change24h: 18.2,
          volume: 450000000,
          description: 'Arbitrum and Optimism leading growth',
          hashtag: '#Layer2',
          color: 'bg-blue-500'
        },
        {
          id: '3',
          name: 'DeFi Exploit',
          category: 'Security',
          mentions: 34100,
          sentiment: -0.8,
          change24h: 156.7,
          volume: 12000000,
          description: 'Major protocol vulnerability discovered',
          hashtag: '#DeFiSecurity',
          color: 'bg-red-500'
        },
        {
          id: '4',
          name: 'Solana Memecoin',
          category: 'Solana',
          mentions: 67800,
          sentiment: 0.3,
          change24h: 89.4,
          volume: 890000000,
          description: 'New meme token gaining traction',
          hashtag: '#SolanaMemecoin',
          color: 'bg-purple-500'
        },
        {
          id: '5',
          name: 'NFT Royalties',
          category: 'NFTs',
          mentions: 19500,
          sentiment: -0.2,
          change24h: -12.3,
          volume: 45000000,
          description: 'Debate over creator royalty enforcement',
          hashtag: '#NFTRoyalties',
          color: 'bg-pink-500'
        },
        {
          id: '6',
          name: 'AI Trading Bots',
          category: 'Trading',
          mentions: 22100,
          sentiment: 0.5,
          change24h: 34.8,
          volume: 156000000,
          description: 'Automated trading gaining popularity',
          hashtag: '#AITrading',
          color: 'bg-green-500'
        }
      ]

      // Sort by mentions and take top items
      const sortedTopics = mockTopics
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, maxItems)

      setTopics(sortedTopics)
      setLastUpdate(new Date())
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trending topics')
      setIsLoading(false)
    }
  }

  // Initialize and auto-refresh
  useEffect(() => {
    fetchTrendingTopics()
    
    const interval = setInterval(fetchTrendingTopics, 3 * 60 * 1000) // Refresh every 3 minutes
    return () => clearInterval(interval)
  }, [maxItems])

  // Format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Get sentiment color and icon
  const getSentimentDisplay = (sentiment: number) => {
    if (sentiment > 0.3) return { color: 'text-green-400', icon: TrendingUp, bg: 'bg-green-400/20' }
    if (sentiment < -0.3) return { color: 'text-red-400', icon: TrendingDown, bg: 'bg-red-400/20' }
    return { color: 'text-gray-400', icon: TrendingUp, bg: 'bg-gray-400/20' }
  }

  // Get change color
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  if (isLoading) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Trending Topics</h3>
          </div>
          <RefreshCw className="w-4 h-4 text-white/60 animate-spin" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse p-3 bg-white/5 rounded-lg">
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-3 bg-white/5 rounded w-2/3"></div>
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
            <Flame className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Trending Topics</h3>
          </div>
          <button onClick={fetchTrendingTopics} className="p-1 hover:bg-white/10 rounded">
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
          <Flame className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Trending Topics</h3>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">
            Live
          </span>
          <button 
            onClick={fetchTrendingTopics} 
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {topics.map((topic, index) => {
            const sentimentDisplay = getSentimentDisplay(topic.sentiment)
            const SentimentIcon = sentimentDisplay.icon

            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer group border border-white/10 hover:border-white/20"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${topic.color}`}></div>
                    <h4 className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">
                      {topic.name}
                    </h4>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${sentimentDisplay.bg}`}>
                    <SentimentIcon className={`w-3 h-3 ${sentimentDisplay.color}`} />
                  </div>
                </div>

                <p className="text-white/60 text-xs mb-3 line-clamp-1">
                  {topic.description}
                </p>

                {showMetrics && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-white/40" />
                        <span className="text-xs text-white/60">
                          {formatNumber(topic.mentions)} mentions
                        </span>
                      </div>
                      <div className={`text-xs font-medium ${getChangeColor(topic.change24h)}`}>
                        {topic.change24h > 0 ? '+' : ''}{topic.change24h.toFixed(1)}%
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-blue-400">
                          {topic.hashtag}
                        </span>
                      </div>
                      <span className="text-xs text-white/50">
                        {topic.category}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <button className="w-full text-center text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors">
          Explore All Trends →
        </button>
      </div>
    </div>
  )
}

export default TrendingTopics
