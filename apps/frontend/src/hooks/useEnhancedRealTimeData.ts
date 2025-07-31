/**
 * Enhanced Real-Time Data Hook
 * React hook for accessing real-time data from CoinMarketCap, Alchemy, and OpenAI
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { enhancedRealTimeService, EnhancedPlatformData, RealTimeUpdate } from '../services/enhancedRealTimeService'
import { MarketAnalysis, TradingInsight, ChatMessage } from '../services/openAIService'
import { TokenBalance, NFT, Transaction } from '../services/alchemyService'

export interface UseEnhancedRealTimeDataReturn {
  // Data
  platformData: EnhancedPlatformData
  isLoading: boolean
  isConnected: boolean
  lastUpdate: number
  
  // Crypto Market Data
  topCryptos: any[]
  globalMetrics: any
  marketAnalysis: MarketAnalysis | null
  
  // Blockchain Data
  gasPrice: any
  latestBlock: any
  
  // User Data
  userAddress: string | null
  tokenBalances: TokenBalance[]
  userNFTs: NFT[]
  userTransactions: Transaction[]
  
  // Actions
  startService: () => Promise<void>
  stopService: () => void
  updateUserData: (address: string) => Promise<void>
  getMarketInsights: () => Promise<MarketAnalysis | null>
  getTradingInsights: (symbol: string) => Promise<TradingInsight | null>
  chatWithAI: (messages: ChatMessage[]) => Promise<string>
  searchCryptocurrencies: (query: string) => Promise<any[]>
  
  // Status
  serviceStatus: {
    crypto: boolean
    blockchain: boolean
    ai: boolean
  }
}

export const useEnhancedRealTimeData = (): UseEnhancedRealTimeDataReturn => {
  const [platformData, setPlatformData] = useState<EnhancedPlatformData>(
    enhancedRealTimeService.getCurrentData()
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Subscribe to real-time updates
  useEffect(() => {
    console.log('🔌 Subscribing to enhanced real-time data updates...')
    
    const unsubscribe = enhancedRealTimeService.subscribe((update: RealTimeUpdate) => {
      console.log(`📡 Received ${update.type} update from ${update.source}:`, update.data)
      
      setLastUpdate(update.timestamp)
      
      // Update platform data based on update type
      setPlatformData(prevData => {
        const newData = { ...prevData }
        
        switch (update.type) {
          case 'crypto':
            newData.cryptoMarket = update.data
            break
          case 'blockchain':
            newData.blockchain = update.data
            break
          case 'ai':
            newData.ai = { ...newData.ai, marketAnalysis: update.data, lastUpdated: update.timestamp }
            break
          case 'user':
            newData.user = update.data
            break
          case 'status':
            if (update.data.status === 'started') {
              setIsConnected(true)
              setIsLoading(false)
            } else if (update.data.status === 'stopped') {
              setIsConnected(false)
            }
            break
        }
        
        return newData
      })
    })
    
    unsubscribeRef.current = unsubscribe
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [])

  // Start the enhanced real-time service
  const startService = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log('🚀 Starting enhanced real-time service...')
      await enhancedRealTimeService.start()
      setIsConnected(true)
      console.log('✅ Enhanced real-time service started')
    } catch (error) {
      console.error('❌ Failed to start enhanced real-time service:', error)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Stop the service
  const stopService = useCallback(() => {
    console.log('🛑 Stopping enhanced real-time service...')
    enhancedRealTimeService.stop()
    setIsConnected(false)
  }, [])

  // Update user-specific data
  const updateUserData = useCallback(async (address: string) => {
    try {
      console.log(`🔄 Updating user data for ${address}...`)
      await enhancedRealTimeService.updateUserData(address)
    } catch (error) {
      console.error('❌ Failed to update user data:', error)
    }
  }, [])

  // Get AI market insights
  const getMarketInsights = useCallback(async () => {
    try {
      console.log('🤖 Requesting AI market insights...')
      const analysis = await enhancedRealTimeService.getMarketInsights()
      return analysis
    } catch (error) {
      console.error('❌ Failed to get market insights:', error)
      return null
    }
  }, [])

  // Get trading insights for specific crypto
  const getTradingInsights = useCallback(async (symbol: string) => {
    try {
      console.log(`🎯 Requesting trading insights for ${symbol}...`)
      const insights = await enhancedRealTimeService.getTradingInsights(symbol)
      return insights
    } catch (error) {
      console.error('❌ Failed to get trading insights:', error)
      return null
    }
  }, [])

  // Chat with AI assistant
  const chatWithAI = useCallback(async (messages: ChatMessage[]) => {
    try {
      console.log('💬 Sending message to AI assistant...')
      const response = await enhancedRealTimeService.chatWithAI(messages)
      return response
    } catch (error) {
      console.error('❌ Failed to chat with AI:', error)
      return 'I apologize, but I\'m currently unable to respond. Please try again later.'
    }
  }, [])

  // Search cryptocurrencies
  const searchCryptocurrencies = useCallback(async (query: string) => {
    try {
      console.log(`🔍 Searching for cryptocurrencies: ${query}`)
      const results = await enhancedRealTimeService.searchCryptocurrencies(query)
      return results
    } catch (error) {
      console.error('❌ Failed to search cryptocurrencies:', error)
      return []
    }
  }, [])

  // Auto-start service on mount
  useEffect(() => {
    startService()
    
    return () => {
      stopService()
    }
  }, [startService, stopService])

  // Derived data for easy access
  const topCryptos = platformData.cryptoMarket.topCryptos || []
  const globalMetrics = platformData.cryptoMarket.globalMetrics
  const marketAnalysis = platformData.ai.marketAnalysis
  const gasPrice = platformData.blockchain.gasPrice
  const latestBlock = platformData.blockchain.latestBlock
  const userAddress = platformData.user?.address || null
  const tokenBalances = platformData.user?.tokenBalances || []
  const userNFTs = platformData.user?.nfts || []
  const userTransactions = platformData.user?.transactions || []

  // Service status
  const serviceStatus = {
    crypto: platformData.cryptoMarket.isLive,
    blockchain: platformData.blockchain.isLive,
    ai: platformData.ai.isActive
  }

  return {
    // Data
    platformData,
    isLoading,
    isConnected,
    lastUpdate,
    
    // Crypto Market Data
    topCryptos,
    globalMetrics,
    marketAnalysis,
    
    // Blockchain Data
    gasPrice,
    latestBlock,
    
    // User Data
    userAddress,
    tokenBalances,
    userNFTs,
    userTransactions,
    
    // Actions
    startService,
    stopService,
    updateUserData,
    getMarketInsights,
    getTradingInsights,
    chatWithAI,
    searchCryptocurrencies,
    
    // Status
    serviceStatus
  }
}

export default useEnhancedRealTimeData
