/**
 * Enhanced Real-Time Service - API Integration Hub
 * Orchestrates CoinMarketCap, Alchemy, and OpenAI services
 * Provides comprehensive real-time data for the Connectouch platform
 */

import { coinMarketCapService, CryptoQuote, GlobalMetrics } from './coinMarketCapService'
import { alchemyService, TokenBalance, NFT, Transaction, GasEstimate } from './alchemyService'
import { openAIService, MarketAnalysis, TradingInsight, ChatMessage } from './openAIService'

export interface EnhancedPlatformData {
  cryptoMarket: {
    topCryptos: CryptoQuote[]
    globalMetrics: GlobalMetrics | null
    lastUpdated: number
    isLive: boolean
  }
  blockchain: {
    gasPrice: GasEstimate
    latestBlock: any
    lastUpdated: number
    isLive: boolean
  }
  ai: {
    marketAnalysis: MarketAnalysis | null
    lastUpdated: number
    isActive: boolean
  }
  user?: {
    address?: string
    tokenBalances: TokenBalance[]
    nfts: NFT[]
    transactions: Transaction[]
    lastUpdated: number
  }
}

export interface RealTimeUpdate {
  type: 'crypto' | 'blockchain' | 'ai' | 'user' | 'status'
  data: any
  timestamp: number
  source: 'coinmarketcap' | 'alchemy' | 'openai' | 'system'
}

class EnhancedRealTimeService {
  private updateInterval: NodeJS.Timeout | null = null
  private subscribers = new Set<(update: RealTimeUpdate) => void>()
  private platformData: EnhancedPlatformData = {
    cryptoMarket: {
      topCryptos: [],
      globalMetrics: null,
      lastUpdated: 0,
      isLive: false
    },
    blockchain: {
      gasPrice: {
        gasLimit: '21000',
        gasPrice: '20000000000',
        maxFeePerGas: '30000000000',
        maxPriorityFeePerGas: '2000000000'
      },
      latestBlock: null,
      lastUpdated: 0,
      isLive: false
    },
    ai: {
      marketAnalysis: null,
      lastUpdated: 0,
      isActive: false
    }
  }

  private isRunning = false
  private readonly UPDATE_INTERVALS = {
    crypto: 60000,    // 1 minute - CoinMarketCap rate limits
    blockchain: 15000, // 15 seconds - Alchemy allows frequent calls
    ai: 300000,       // 5 minutes - OpenAI rate limits and cost
    user: 30000       // 30 seconds - User-specific data
  }

  constructor() {
    console.log('🚀 Enhanced Real-Time Service initialized with real APIs')
  }

  /**
   * Start enhanced real-time data updates
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Enhanced real-time service already running')
      return
    }

    this.isRunning = true
    console.log('🎯 Starting enhanced real-time data service with real APIs...')

    // Initial data load
    await this.loadInitialData()

    // Set up periodic updates
    this.updateInterval = setInterval(() => {
      this.performPeriodicUpdates()
    }, 10000) // Check every 10 seconds

    this.notifySubscribers({
      type: 'status',
      data: { status: 'started', services: ['coinmarketcap', 'alchemy', 'openai'] },
      timestamp: Date.now(),
      source: 'system'
    })

    console.log('✅ Enhanced real-time data service started with real APIs')
  }

  /**
   * Stop real-time data updates
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    this.isRunning = false
    
    this.notifySubscribers({
      type: 'status',
      data: { status: 'stopped' },
      timestamp: Date.now(),
      source: 'system'
    })

    console.log('🛑 Enhanced real-time data service stopped')
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(callback: (update: RealTimeUpdate) => void): () => void {
    this.subscribers.add(callback)
    
    // Send current data immediately
    callback({
      type: 'crypto',
      data: this.platformData.cryptoMarket,
      timestamp: Date.now(),
      source: 'coinmarketcap'
    })

    return () => {
      this.subscribers.delete(callback)
    }
  }

  /**
   * Get current platform data
   */
  getCurrentData(): EnhancedPlatformData {
    return { ...this.platformData }
  }

  /**
   * Update user-specific blockchain data
   */
  async updateUserData(address: string): Promise<void> {
    try {
      console.log(`🔄 Updating user data for ${address} via Alchemy...`)

      const [tokenBalances, nfts, transactions] = await Promise.all([
        alchemyService.getTokenBalances(address),
        alchemyService.getNFTs(address).then(result => result.ownedNfts),
        alchemyService.getTransactionHistory(address)
      ])

      this.platformData.user = {
        address,
        tokenBalances,
        nfts,
        transactions,
        lastUpdated: Date.now()
      }

      this.notifySubscribers({
        type: 'user',
        data: this.platformData.user,
        timestamp: Date.now(),
        source: 'alchemy'
      })

      console.log(`✅ User data updated: ${tokenBalances.length} tokens, ${nfts.length} NFTs, ${transactions.length} transactions`)
    } catch (error) {
      console.error('❌ User data update failed:', error)
    }
  }

  /**
   * Get AI-powered market insights
   */
  async getMarketInsights(): Promise<MarketAnalysis | null> {
    try {
      if (this.platformData.cryptoMarket.topCryptos.length === 0) {
        await this.updateCryptoData()
      }

      console.log('🤖 Generating AI market analysis via OpenAI...')

      const analysis = await openAIService.analyzeMarket({
        topCryptos: this.platformData.cryptoMarket.topCryptos.slice(0, 10),
        globalMetrics: this.platformData.cryptoMarket.globalMetrics,
        timestamp: Date.now()
      })

      this.platformData.ai.marketAnalysis = analysis
      this.platformData.ai.lastUpdated = Date.now()
      this.platformData.ai.isActive = true

      this.notifySubscribers({
        type: 'ai',
        data: analysis,
        timestamp: Date.now(),
        source: 'openai'
      })

      console.log('✅ AI market analysis generated')
      return analysis
    } catch (error) {
      console.error('❌ Market insights failed:', error)
      this.platformData.ai.isActive = false
      return null
    }
  }

  /**
   * Get trading insights for specific crypto
   */
  async getTradingInsights(symbol: string): Promise<TradingInsight | null> {
    try {
      const crypto = this.platformData.cryptoMarket.topCryptos.find(
        c => c.symbol === symbol.toUpperCase()
      )

      if (!crypto) {
        console.warn(`⚠️ Crypto ${symbol} not found in current data`)
        return null
      }

      console.log(`🎯 Generating trading insights for ${symbol} via OpenAI...`)

      const insight = await openAIService.generateTradingInsights(symbol, {
        price: crypto.quote.USD.price,
        change24h: crypto.quote.USD.percent_change_24h,
        volume: crypto.quote.USD.volume_24h,
        marketCap: crypto.quote.USD.market_cap,
        rank: crypto.cmc_rank
      })

      console.log(`✅ Trading insights generated for ${symbol}`)
      return insight
    } catch (error) {
      console.error('❌ Trading insights failed:', error)
      return null
    }
  }

  /**
   * Chat with AI assistant
   */
  async chatWithAI(messages: ChatMessage[]): Promise<string> {
    try {
      console.log('💬 Processing AI chat via OpenAI...')

      // Add context about current market data
      const contextMessage: ChatMessage = {
        role: 'system',
        content: `Current Connectouch platform context: 
        - Total market cap: $${this.platformData.cryptoMarket.globalMetrics?.quote.USD.total_market_cap.toLocaleString() || 'N/A'}
        - BTC dominance: ${this.platformData.cryptoMarket.globalMetrics?.btc_dominance || 'N/A'}%
        - Current gas price: ${parseInt(this.platformData.blockchain.gasPrice.gasPrice) / 1e9} gwei
        - Active cryptocurrencies: ${this.platformData.cryptoMarket.topCryptos.length}
        
        You are the AI assistant for Connectouch, a comprehensive blockchain AI platform. Provide helpful, accurate information about cryptocurrency, DeFi, NFTs, and blockchain technology.`
      }

      const completion = await openAIService.chatCompletion([contextMessage, ...messages])
      
      console.log('✅ AI chat response generated')
      return completion.choices[0].message.content
    } catch (error) {
      console.error('❌ AI chat failed:', error)
      return 'I apologize, but I\'m currently unable to respond. Please try again later or check your connection.'
    }
  }

  /**
   * Get current gas prices and blockchain status
   */
  async getBlockchainStatus(): Promise<any> {
    return {
      gasPrice: this.platformData.blockchain.gasPrice,
      latestBlock: this.platformData.blockchain.latestBlock,
      isLive: this.platformData.blockchain.isLive,
      lastUpdated: this.platformData.blockchain.lastUpdated
    }
  }

  /**
   * Search cryptocurrencies
   */
  async searchCryptocurrencies(query: string): Promise<any[]> {
    try {
      console.log(`🔍 Searching cryptocurrencies for "${query}" via CoinMarketCap...`)
      const results = await coinMarketCapService.searchCryptocurrencies(query)
      console.log(`✅ Found ${results.length} results for "${query}"`)
      return results
    } catch (error) {
      console.error('❌ Cryptocurrency search failed:', error)
      return []
    }
  }

  /**
   * Private methods
   */
  private async loadInitialData(): Promise<void> {
    console.log('📊 Loading initial platform data from real APIs...')

    await Promise.all([
      this.updateCryptoData(),
      this.updateBlockchainData()
    ])

    console.log('✅ Initial data loaded from real APIs')
  }

  private async performPeriodicUpdates(): Promise<void> {
    const now = Date.now()

    // Check if crypto data needs update
    if (now - this.platformData.cryptoMarket.lastUpdated > this.UPDATE_INTERVALS.crypto) {
      this.updateCryptoData()
    }

    // Check if blockchain data needs update
    if (now - this.platformData.blockchain.lastUpdated > this.UPDATE_INTERVALS.blockchain) {
      this.updateBlockchainData()
    }

    // Check if AI analysis needs update (less frequent due to cost)
    if (now - this.platformData.ai.lastUpdated > this.UPDATE_INTERVALS.ai && 
        this.platformData.cryptoMarket.topCryptos.length > 0) {
      this.getMarketInsights()
    }

    // Update user data if available
    if (this.platformData.user?.address && 
        now - this.platformData.user.lastUpdated > this.UPDATE_INTERVALS.user) {
      this.updateUserData(this.platformData.user.address)
    }
  }

  private async updateCryptoData(): Promise<void> {
    try {
      console.log('📈 Fetching crypto data from CoinMarketCap...')
      
      const [topCryptos, globalMetrics] = await Promise.all([
        coinMarketCapService.getLatestListings(50),
        coinMarketCapService.getGlobalMetrics()
      ])

      this.platformData.cryptoMarket = {
        topCryptos,
        globalMetrics,
        lastUpdated: Date.now(),
        isLive: true
      }

      this.notifySubscribers({
        type: 'crypto',
        data: this.platformData.cryptoMarket,
        timestamp: Date.now(),
        source: 'coinmarketcap'
      })

      console.log(`✅ Updated crypto data: ${topCryptos.length} cryptocurrencies from CoinMarketCap`)
    } catch (error) {
      console.error('❌ Crypto data update failed:', error)
      this.platformData.cryptoMarket.isLive = false
    }
  }

  private async updateBlockchainData(): Promise<void> {
    try {
      console.log('⛓️ Fetching blockchain data from Alchemy...')
      
      const [gasPrice, latestBlock] = await Promise.all([
        alchemyService.getGasPrice(),
        alchemyService.getLatestBlock()
      ])

      this.platformData.blockchain = {
        gasPrice,
        latestBlock,
        lastUpdated: Date.now(),
        isLive: true
      }

      this.notifySubscribers({
        type: 'blockchain',
        data: this.platformData.blockchain,
        timestamp: Date.now(),
        source: 'alchemy'
      })

      console.log('✅ Updated blockchain data from Alchemy')
    } catch (error) {
      console.error('❌ Blockchain data update failed:', error)
      this.platformData.blockchain.isLive = false
    }
  }

  private notifySubscribers(update: RealTimeUpdate): void {
    this.subscribers.forEach(callback => {
      try {
        callback(update)
      } catch (error) {
        console.error('❌ Subscriber notification failed:', error)
      }
    })
  }
}

export const enhancedRealTimeService = new EnhancedRealTimeService()
export default enhancedRealTimeService
