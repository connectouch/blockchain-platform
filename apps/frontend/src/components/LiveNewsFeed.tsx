import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Zap
} from 'lucide-react'
import { NewsSourceLocalImage, NewsCategoryLocalImage } from './ui/LocalImage'

interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  publishedAt: string
  source: string
  sentiment: 'positive' | 'negative' | 'neutral'
  impact: 'high' | 'medium' | 'low'
  category: string
  imageUrl?: string
}

interface LiveNewsFeedProps {
  maxItems?: number
  showSentiment?: boolean
  autoRefresh?: boolean
  className?: string
}

const LiveNewsFeed: React.FC<LiveNewsFeedProps> = ({
  maxItems = 5,
  showSentiment = true,
  autoRefresh = true,
  className = ''
}) => {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fetch news data
  const fetchNews = async () => {
    try {
      setError(null)
      
      // Mock news data for now - in production, this would fetch from a real news API
      const mockNews: NewsItem[] = [
        {
          id: '1',
          title: 'Bitcoin ETF Sees Record $2.1B Inflows This Week',
          summary: 'Institutional investors continue to pour money into Bitcoin ETFs as adoption accelerates.',
          url: '#',
          publishedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
          source: 'CoinDesk',
          sentiment: 'positive',
          impact: 'high',
          category: 'Bitcoin',
          imageUrl: null // Will use category-based image
        },
        {
          id: '2',
          title: 'Ethereum Layer 2 TVL Surpasses $45 Billion',
          summary: 'Arbitrum and Optimism lead the charge as L2 adoption reaches new heights.',
          url: '#',
          publishedAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(), // 32 minutes ago
          source: 'The Block',
          sentiment: 'positive',
          impact: 'medium',
          category: 'Ethereum',
          imageUrl: null // Will use category-based image
        },
        {
          id: '3',
          title: 'Major DeFi Protocol Suffers $12M Exploit',
          summary: 'Security researchers warn of similar vulnerabilities across multiple protocols.',
          url: '#',
          publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
          source: 'The Block',
          sentiment: 'negative',
          impact: 'high',
          category: 'DeFi',
          imageUrl: null // Will use category-based image
        },
        {
          id: '4',
          title: 'Solana Network Processes 65M Transactions in 24h',
          summary: 'New record highlights growing adoption of the high-performance blockchain.',
          url: '#',
          publishedAt: new Date(Date.now() - 1000 * 60 * 67).toISOString(), // 67 minutes ago
          source: 'CoinDesk',
          sentiment: 'positive',
          impact: 'medium',
          category: 'Technology',
          imageUrl: null // Will use category-based image
        },
        {
          id: '5',
          title: 'NFT Market Shows Signs of Recovery',
          summary: 'Trading volume up 45% this week as blue-chip collections gain momentum.',
          url: '#',
          publishedAt: new Date(Date.now() - 1000 * 60 * 89).toISOString(), // 89 minutes ago
          source: 'Decrypt',
          sentiment: 'positive',
          impact: 'low',
          category: 'NFT',
          imageUrl: null // Will use category-based image
        }
      ]

      setNews(mockNews.slice(0, maxItems))
      setLastUpdate(new Date())
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news')
      setIsLoading(false)
    }
  }

  // Initialize and auto-refresh
  useEffect(() => {
    fetchNews()
    
    if (autoRefresh) {
      const interval = setInterval(fetchNews, 5 * 60 * 1000) // Refresh every 5 minutes
      return () => clearInterval(interval)
    }
  }, [maxItems, autoRefresh])

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const published = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - published.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  // Get sentiment color and icon
  const getSentimentDisplay = (sentiment: string, impact: string) => {
    const sentimentConfig = {
      positive: { color: 'text-green-400', bg: 'bg-green-400/20', icon: TrendingUp },
      negative: { color: 'text-red-400', bg: 'bg-red-400/20', icon: TrendingDown },
      neutral: { color: 'text-gray-400', bg: 'bg-gray-400/20', icon: AlertCircle }
    }
    
    const impactConfig = {
      high: 'border-l-4 border-l-yellow-400',
      medium: 'border-l-4 border-l-blue-400',
      low: 'border-l-4 border-l-gray-400'
    }
    
    return {
      ...sentimentConfig[sentiment as keyof typeof sentimentConfig],
      impactClass: impactConfig[impact as keyof typeof impactConfig]
    }
  }

  if (isLoading) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Live News Feed</h3>
          </div>
          <RefreshCw className="w-4 h-4 text-white/60 animate-spin" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-3 bg-white/5 rounded w-3/4"></div>
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
            <Newspaper className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Live News Feed</h3>
          </div>
          <button onClick={fetchNews} className="p-1 hover:bg-white/10 rounded">
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
          <Newspaper className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Live News Feed</h3>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">
            Updated {formatTimeAgo(lastUpdate.toISOString())}
          </span>
          <button 
            onClick={fetchNews} 
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {news.map((item, index) => {
            const sentimentDisplay = getSentimentDisplay(item.sentiment, item.impact)
            const SentimentIcon = sentimentDisplay.icon

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group ${sentimentDisplay.impactClass}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <NewsCategoryLocalImage
                      identifier={item.category.toLowerCase()}
                      alt={`${item.category} news`}
                      size="md"
                      className="w-10 h-10 rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-white font-medium text-sm leading-tight group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h4>
                      <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-white/60 flex-shrink-0 mt-0.5" />
                    </div>
                    
                    <p className="text-white/60 text-xs mt-1 line-clamp-2">
                      {item.summary}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <NewsSourceLocalImage
                            identifier={item.source.toLowerCase().replace(/\s+/g, '-')}
                            alt={`${item.source} logo`}
                            size="xs"
                            className="w-3 h-3 rounded"
                          />
                          <span className="text-xs text-white/50">{item.source}</span>
                        </div>
                        <span className="text-xs text-white/30">•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-white/40" />
                          <span className="text-xs text-white/40">
                            {formatTimeAgo(item.publishedAt)}
                          </span>
                        </div>
                      </div>
                      
                      {showSentiment && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${sentimentDisplay.bg}`}>
                          <SentimentIcon className={`w-3 h-3 ${sentimentDisplay.color}`} />
                          <span className={`text-xs ${sentimentDisplay.color} capitalize`}>
                            {item.sentiment}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <button className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          View All News →
        </button>
      </div>
    </div>
  )
}

export default LiveNewsFeed
