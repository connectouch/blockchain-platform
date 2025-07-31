/**
 * Real API Demo Component
 * Showcases live data from CoinMarketCap, Alchemy, and OpenAI APIs
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Brain, 
  Wallet, 
  Search,
  MessageCircle,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Activity
} from 'lucide-react'
import { useEnhancedRealTimeData } from '../hooks/useEnhancedRealTimeData'

const RealAPIDemo: React.FC = () => {
  const {
    topCryptos,
    globalMetrics,
    marketAnalysis,
    gasPrice,
    isConnected,
    serviceStatus,
    lastUpdate,
    getMarketInsights,
    getTradingInsights,
    chatWithAI,
    searchCryptocurrencies
  } = useEnhancedRealTimeData()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [chatMessage, setChatMessage] = useState('')
  const [chatResponse, setChatResponse] = useState('')
  const [selectedCrypto, setSelectedCrypto] = useState('')
  const [tradingInsight, setTradingInsight] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    try {
      const results = await searchCryptocurrencies(searchQuery)
      setSearchResults(results.slice(0, 5))
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle AI chat
  const handleChat = async () => {
    if (!chatMessage.trim()) return
    
    setIsLoading(true)
    try {
      const response = await chatWithAI([
        { role: 'user', content: chatMessage }
      ])
      setChatResponse(response)
    } catch (error) {
      console.error('Chat failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get trading insights
  const handleTradingInsights = async () => {
    if (!selectedCrypto) return
    
    setIsLoading(true)
    try {
      const insights = await getTradingInsights(selectedCrypto)
      setTradingInsight(insights)
    } catch (error) {
      console.error('Trading insights failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get market analysis
  const handleMarketAnalysis = async () => {
    setIsLoading(true)
    try {
      await getMarketInsights()
    } catch (error) {
      console.error('Market analysis failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    } else if (price >= 1) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    } else {
      return `$${price.toFixed(6)}`
    }
  }

  const formatChange = (change: number) => {
    const isPositive = change >= 0
    return (
      <span className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {Math.abs(change).toFixed(2)}%
      </span>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🚀 Real API Integration Demo
        </h1>
        <p className="text-white/70 text-lg">
          Live data from CoinMarketCap, Alchemy, and OpenAI APIs
        </p>
        
        {/* Connection Status */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isConnected ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-white/60">
            <div className={`flex items-center gap-1 ${serviceStatus.crypto ? 'text-green-400' : 'text-red-400'}`}>
              <Activity className="w-3 h-3" />
              CoinMarketCap
            </div>
            <div className={`flex items-center gap-1 ${serviceStatus.blockchain ? 'text-green-400' : 'text-red-400'}`}>
              <Activity className="w-3 h-3" />
              Alchemy
            </div>
            <div className={`flex items-center gap-1 ${serviceStatus.ai ? 'text-green-400' : 'text-red-400'}`}>
              <Activity className="w-3 h-3" />
              OpenAI
            </div>
          </div>
        </div>
      </div>

      {/* Global Market Stats */}
      {globalMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Global Market (CoinMarketCap)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-white/60 text-sm">Total Market Cap</p>
              <p className="text-2xl font-bold text-white">
                ${globalMetrics.quote.USD.total_market_cap.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm">24h Volume</p>
              <p className="text-2xl font-bold text-white">
                ${globalMetrics.quote.USD.total_volume_24h.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm">BTC Dominance</p>
              <p className="text-2xl font-bold text-white">
                {globalMetrics.btc_dominance.toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Cryptocurrencies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-400" />
          Top Cryptocurrencies (Live from CoinMarketCap)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topCryptos.slice(0, 6).map((crypto) => (
            <div key={crypto.id} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-white">{crypto.symbol}</h3>
                  <p className="text-white/60 text-sm">{crypto.name}</p>
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  #{crypto.cmc_rank}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-white">
                  {formatPrice(crypto.quote.USD.price)}
                </p>
                {formatChange(crypto.quote.USD.percent_change_24h)}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Blockchain Data */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Ethereum Network (Live from Alchemy)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="font-bold text-white mb-2">Gas Prices</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {(parseInt(gasPrice.gasPrice) / 1e9).toFixed(1)} gwei
            </p>
            <p className="text-white/60 text-sm">Standard gas price</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="font-bold text-white mb-2">Max Fee</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {(parseInt(gasPrice.maxFeePerGas) / 1e9).toFixed(1)} gwei
            </p>
            <p className="text-white/60 text-sm">EIP-1559 max fee</p>
          </div>
        </div>
      </motion.div>

      {/* AI Market Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            AI Market Analysis (OpenAI GPT-4)
          </h2>
          <button
            onClick={handleMarketAnalysis}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Generate Analysis
          </button>
        </div>
        
        {marketAnalysis ? (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-bold text-white mb-2">Market Sentiment</h3>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  marketAnalysis.sentiment === 'bullish' ? 'bg-green-500/20 text-green-400' :
                  marketAnalysis.sentiment === 'bearish' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {marketAnalysis.sentiment.toUpperCase()}
                </span>
                <span className="text-white/60">
                  Confidence: {marketAnalysis.confidence}%
                </span>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-bold text-white mb-2">Summary</h3>
              <p className="text-white/80">{marketAnalysis.summary}</p>
            </div>
          </div>
        ) : (
          <p className="text-white/60">Click "Generate Analysis" to get AI-powered market insights</p>
        )}
      </motion.div>

      {/* Interactive Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crypto Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-400" />
            Search Cryptocurrencies
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for cryptocurrencies..."
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((result) => (
                <div key={result.id} className="bg-white/5 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{result.symbol}</span>
                      <span className="text-white/60 ml-2">{result.name}</span>
                    </div>
                    <span className="text-xs text-blue-400">#{result.rank || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* AI Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-400" />
            AI Assistant Chat
          </h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask about crypto, DeFi, or blockchain..."
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
              />
              <button
                onClick={handleChat}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
            {chatResponse && (
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-bold text-white mb-2">AI Response:</h3>
                <p className="text-white/80 text-sm">{chatResponse}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Last Update */}
      <div className="text-center text-white/60 text-sm">
        Last updated: {new Date(lastUpdate).toLocaleTimeString()}
      </div>
    </div>
  )
}

export default RealAPIDemo
