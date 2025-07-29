import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, ExternalLink, TrendingUp } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  summary: string
  timestamp: string
  category: string
  impact: 'high' | 'medium' | 'low'
  url?: string
}

const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock news data (in real implementation, this would fetch from news APIs)
  const mockNews: NewsItem[] = [
    {
      id: '1',
      title: 'Bitcoin Reaches New All-Time High Above $116,000',
      summary: 'Bitcoin continues its bullish momentum as institutional adoption accelerates.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      category: 'Bitcoin',
      impact: 'high'
    },
    {
      id: '2',
      title: 'Ethereum Layer 2 Solutions See Record TVL Growth',
      summary: 'Arbitrum and Optimism lead the charge in scaling Ethereum ecosystem.',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
      category: 'Ethereum',
      impact: 'medium'
    },
    {
      id: '3',
      title: 'DeFi Protocol Aave Announces V4 with Enhanced Features',
      summary: 'New version promises better capital efficiency and risk management.',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      category: 'DeFi',
      impact: 'medium'
    },
    {
      id: '4',
      title: 'Major NFT Marketplace Integrates Real-Time Analytics',
      summary: 'Enhanced trading tools provide better market insights for collectors.',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
      category: 'NFT',
      impact: 'low'
    },
    {
      id: '5',
      title: 'GameFi Sector Shows Strong Recovery with 25% Growth',
      summary: 'Play-to-earn games attract new players as market sentiment improves.',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
      category: 'GameFi',
      impact: 'medium'
    }
  ]

  // Fetch real market news and generate dynamic content
  const fetchMarketNews = async () => {
    try {
      setIsLoading(true)

      // Try to fetch real market data to generate relevant news
      const [overviewResponse, pricesResponse] = await Promise.all([
        fetch('/api/v2/blockchain/overview').catch(() => null),
        fetch('/api/v2/blockchain/prices/live').catch(() => null)
      ])

      const dynamicNews: NewsItem[] = []

      // Generate news based on real market data
      if (overviewResponse?.ok) {
        const overviewData = await overviewResponse.json()
        if (overviewData.success) {
          const data = overviewData.data
          const growth = parseFloat(data.totalGrowth24h?.replace(/[+%]/g, '') || '0')

          if (Math.abs(growth) > 1) {
            dynamicNews.push({
              id: 'market-movement',
              title: `Crypto Market ${growth > 0 ? 'Surges' : 'Declines'} ${Math.abs(growth).toFixed(1)}% in 24 Hours`,
              summary: `Total market cap ${growth > 0 ? 'rises to' : 'falls to'} ${data.totalMarketCap} as ${growth > 0 ? 'bullish' : 'bearish'} sentiment dominates trading.`,
              timestamp: new Date().toISOString(),
              category: 'Market',
              impact: Math.abs(growth) > 5 ? 'high' : 'medium'
            })
          }
        }
      }

      if (pricesResponse?.ok) {
        const pricesData = await pricesResponse.json()
        if (pricesData.success) {
          const btc = pricesData.data.bitcoin
          const eth = pricesData.data.ethereum

          if (btc && Math.abs(btc.usd_24h_change) > 2) {
            dynamicNews.push({
              id: 'btc-movement',
              title: `Bitcoin ${btc.usd_24h_change > 0 ? 'Rallies' : 'Drops'} ${Math.abs(btc.usd_24h_change).toFixed(1)}% to $${btc.usd.toLocaleString()}`,
              summary: `Bitcoin shows ${btc.usd_24h_change > 0 ? 'strong momentum' : 'selling pressure'} with volume at $${(btc.usd_24h_vol / 1e9).toFixed(1)}B.`,
              timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
              category: 'Bitcoin',
              impact: Math.abs(btc.usd_24h_change) > 5 ? 'high' : 'medium'
            })
          }
        }
      }

      // Combine with static news
      const allNews = [...dynamicNews, ...mockNews.slice(0, 6 - dynamicNews.length)]
      setNews(allNews)

    } catch (error) {
      console.error('Failed to fetch market news:', error)
      setNews(mockNews)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketNews()

    // Refresh news every 5 minutes
    const interval = setInterval(fetchMarketNews, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    }
    const diffInHours = Math.floor(diffInMinutes / 60)
    return `${diffInHours}h ago`
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'low': return 'text-green-400 bg-green-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'bitcoin': return 'text-orange-400 bg-orange-400/20'
      case 'ethereum': return 'text-blue-400 bg-blue-400/20'
      case 'defi': return 'text-green-400 bg-green-400/20'
      case 'nft': return 'text-purple-400 bg-purple-400/20'
      case 'gamefi': return 'text-pink-400 bg-pink-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-white/70">Loading latest news...</span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Latest Market News
        </h3>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          Live Updates
        </div>
      </div>

      <div className="space-y-4">
        {news.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-white text-sm leading-tight flex-1 mr-3">
                {item.title}
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${getImpactColor(item.impact)}`}>
                  {item.impact}
                </span>
              </div>
            </div>
            
            <p className="text-white/70 text-sm mb-3 leading-relaxed">
              {item.summary}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Clock className="w-3 h-3" />
                {getTimeAgo(item.timestamp)}
              </div>
              {item.url && (
                <ExternalLink className="w-4 h-4 text-white/40 hover:text-white/70 transition-colors" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          View All News →
        </button>
      </div>
    </motion.div>
  )
}

export default NewsFeed
