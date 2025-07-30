import { enhancedApiService } from '../services/enhancedApiService';
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, getCryptoPrices, getDeFiProtocols, subscribeToCryptoPrices, subscribeToDeFiProtocols } from '../lib/supabase'
import { ConnectouchAPI } from '../config/api'
import type {
  RealTimeMarketData,
  RealTimePriceUpdate,
  RealTimeCallbacks
} from '../services/realTimeDataService'
import type { DeFiProtocol, BlockchainSector } from '../types'

// Hook for real-time market overview data
export function useRealTimeMarketData() {
  const [marketData, setMarketData] = useState<RealTimeMarketData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        setIsLoading(true)

        // Try to fetch from crypto-prices function first
        const response = await fetch('/.netlify/functions/crypto-prices')
        const data = await response.json()

        if (data.success) {
          // Create market data from crypto prices
          const mockMarketData: RealTimeMarketData = {
            totalMarketCap: data.data.reduce((sum: number, coin: any) => sum + (coin.market_cap || 0), 0),
            totalVolume: data.data.reduce((sum: number, coin: any) => sum + (coin.volume_24h || 0), 0),
            btcDominance: 45.2, // Mock value
            fearGreedIndex: 72,  // Mock value
            activeCoins: data.data.length,
            lastUpdate: new Date().toISOString()
          }

          setMarketData(mockMarketData)
          setIsConnected(true) // Set connected since we got data
          setError(null)
        } else {
          throw new Error('Failed to fetch market data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market data')
        setIsConnected(false)

        // Fallback to mock data
        const fallbackData: RealTimeMarketData = {
          totalMarketCap: 1750000000000,
          totalVolume: 45000000000,
          btcDominance: 45.2,
          fearGreedIndex: 72,
          activeCoins: 10,
          lastUpdate: new Date().toISOString()
        }
        setMarketData(fallbackData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()

    // Set up periodic updates every 30 seconds
    const interval = setInterval(fetchInitialData, 30000)

    return () => clearInterval(interval)
  }, [])

  const refresh = async () => {
    try {
      const response = await fetch('/.netlify/functions/crypto-prices')
      const data = await response.json()

      if (data.success) {
        const mockMarketData: RealTimeMarketData = {
          totalMarketCap: data.data.reduce((sum: number, coin: any) => sum + (coin.market_cap || 0), 0),
          totalVolume: data.data.reduce((sum: number, coin: any) => sum + (coin.volume_24h || 0), 0),
          btcDominance: 45.2,
          fearGreedIndex: 72,
          activeCoins: data.data.length,
          lastUpdate: new Date().toISOString()
        }
        setMarketData(mockMarketData)
        setIsConnected(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh market data')
    }
  }

  return {
    marketData,
    isLoading,
    error,
    isConnected,
    refresh
  }
}

// Hook for real-time price updates
export function useRealTimePrices(symbols: string[] = []) {
  const [prices, setPrices] = useState<RealTimePriceUpdate>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch initial price data from Supabase
    const fetchInitialPrices = async () => {
      try {
        setIsLoading(true)

        // Get prices from Supabase database
        const cryptoPrices = await getCryptoPrices(50)

        // Transform to expected format
        const formattedPrices: RealTimePriceUpdate = {}
        cryptoPrices.forEach((coin: any) => {
          formattedPrices[coin.symbol] = {
            usd: coin.price,
            usd_24h_change: coin.price_change_percentage_24h,
            usd_market_cap: coin.market_cap,
            usd_24h_vol: coin.volume_24h
          }
        })

        setPrices(formattedPrices)
        setError(null)
        console.log('✅ useRealTimePrices: Initial prices loaded from Supabase', Object.keys(formattedPrices).length, 'symbols')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch prices')
        console.error('❌ useRealTimePrices: Failed to fetch initial prices:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialPrices()

    // Set up real-time subscription
    const subscription = subscribeToCryptoPrices((newPrice: any) => {
      setPrices(prevPrices => ({
        ...prevPrices,
        [newPrice.symbol]: {
          usd: newPrice.price,
          usd_24h_change: newPrice.price_change_percentage_24h,
          usd_market_cap: newPrice.market_cap,
          usd_24h_vol: newPrice.volume_24h
        }
      }))
      console.log('🔄 useRealTimePrices: Real-time price update received for', newPrice.symbol)
    })

    // Fallback: periodic updates every 60 seconds
    const interval = setInterval(fetchInitialPrices, 60000)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [symbols])

  return {
    prices,
    isLoading,
    error,
    getPrice: (symbol: string) => prices[symbol]
  }
}

// Hook for real-time DeFi protocol data
export function useRealTimeDeFi() {
  const [protocols, setProtocols] = useState<DeFiProtocol[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initial data fetch from Supabase
    const fetchInitialData = async () => {
      try {
        setIsLoading(true)

        // Get DeFi protocols from Supabase database
        const defiProtocols = await getDeFiProtocols(20)

        // Transform data to match expected format
        const formattedProtocols: DeFiProtocol[] = defiProtocols.map((protocol: any) => ({
          id: protocol.name.toLowerCase().replace(/\s+/g, '-'),
          name: protocol.name,
          symbol: protocol.symbol,
          tvl: protocol.tvl,
          change_1d: protocol.tvl_change_24h || 0,
          change_7d: (protocol.tvl_change_24h || 0) * 1.2, // Estimate 7d change
          category: protocol.category,
          chains: [protocol.chain],
          logo: protocol.logo_url,
          url: protocol.website_url,
          description: protocol.description,
          apy: protocol.apy || Math.random() * 15 + 2,
          volume24h: protocol.tvl * 0.1, // Estimate volume as 10% of TVL
          users: Math.floor(Math.random() * 50000) + 10000, // Mock user count
          riskScore: protocol.tvl > 5000000000 ? 'low' : protocol.tvl > 1000000000 ? 'medium' : 'high'
        }))

        setProtocols(formattedProtocols)
        setIsConnected(true)
        setError(null)
        console.log('✅ useRealTimeDeFi: DeFi protocols loaded from Supabase', formattedProtocols.length, 'protocols')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch DeFi data')
        setIsConnected(false)
        console.error('❌ useRealTimeDeFi: Failed to fetch DeFi protocols:', err)

        // Fallback to mock data
        const fallbackProtocols: DeFiProtocol[] = [
          {
            id: 'uniswap',
            name: 'Uniswap',
            symbol: 'UNI',
            tvl: 8500000000,
            change_1d: 2.3,
            change_7d: -1.2,
            category: 'Dexes',
            chains: ['ethereum'],
            apy: 12.5,
            volume24h: 850000000,
            users: 45000,
            riskScore: 'low'
          }
        ]
        setProtocols(fallbackProtocols)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()

    // Set up real-time subscription for DeFi protocols
    const subscription = subscribeToDeFiProtocols((newProtocol: any) => {
      setProtocols(prevProtocols => {
        const existingIndex = prevProtocols.findIndex(p => p.name === newProtocol.name)
        if (existingIndex >= 0) {
          // Update existing protocol
          const updated = [...prevProtocols]
          updated[existingIndex] = {
            ...updated[existingIndex],
            tvl: newProtocol.tvl,
            change_1d: newProtocol.tvl_change_24h || 0,
            change_7d: (newProtocol.tvl_change_24h || 0) * 1.2
          }
          return updated
        } else {
          // Add new protocol
          return [...prevProtocols, {
            id: newProtocol.name.toLowerCase().replace(/\s+/g, '-'),
            name: newProtocol.name,
            symbol: newProtocol.symbol,
            tvl: newProtocol.tvl,
            change_1d: newProtocol.tvl_change_24h || 0,
            change_7d: (newProtocol.tvl_change_24h || 0) * 1.2,
            category: newProtocol.category,
            chains: [newProtocol.chain],
            logo: newProtocol.logo_url,
            url: newProtocol.website_url,
            description: newProtocol.description,
            apy: newProtocol.apy || Math.random() * 15 + 2,
            volume24h: newProtocol.tvl * 0.1,
            users: Math.floor(Math.random() * 50000) + 10000,
            riskScore: newProtocol.tvl > 5000000000 ? 'low' : newProtocol.tvl > 1000000000 ? 'medium' : 'high'
          }]
        }
      })
      console.log('🔄 useRealTimeDeFi: Real-time protocol update received for', newProtocol.name)
    })

    // Fallback: periodic updates every 5 minutes
    const interval = setInterval(fetchInitialData, 5 * 60 * 1000)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const refresh = async () => {
    try {
      const defiProtocols = await getDeFiProtocols(20)

      const formattedProtocols: DeFiProtocol[] = defiProtocols.map((protocol: any) => ({
        id: protocol.name.toLowerCase().replace(/\s+/g, '-'),
        name: protocol.name,
        symbol: protocol.symbol,
        tvl: protocol.tvl,
        change_1d: protocol.tvl_change_24h || 0,
        change_7d: (protocol.tvl_change_24h || 0) * 1.2,
        category: protocol.category,
        chains: [protocol.chain],
        logo: protocol.logo_url,
        url: protocol.website_url,
        description: protocol.description,
        apy: protocol.apy || Math.random() * 15 + 2,
        volume24h: protocol.tvl * 0.1,
        users: Math.floor(Math.random() * 50000) + 10000,
        riskScore: protocol.tvl > 5000000000 ? 'low' : protocol.tvl > 1000000000 ? 'medium' : 'high'
      }))

      setProtocols(formattedProtocols)
      setIsConnected(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh DeFi data')
    }
  }

  return {
    protocols,
    isLoading,
    error,
    isConnected,
    refresh
  }
}

// Hook for real-time NFT collection data
export function useRealTimeNFTs() {
  const [collections, setCollections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        setIsLoading(true)
        const data = await enhancedApiService.getLiveNFTCollections()
        setCollections(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch NFT data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()

    // Set up real-time callbacks
    const callbacks: RealTimeCallbacks = {
      onNFTUpdate: (data) => {
        setCollections(data)
        setError(null)
      },
      onError: (err) => {
        setError(err.message || 'NFT update error')
      }
    }

    // realTimeDataService.setCallbacks(callbacks)
    
    // Subscribe to NFT updates
    const subscribeToUpdates = () => {
      // realTimeDataService.subscribe('nft-update')
    }

    // if (realTimeDataService.isConnected()) {
    //   subscribeToUpdates()
    // } else {
    //   const checkConnection = setInterval(() => {
    //     if (realTimeDataService.isConnected()) {
    //       subscribeToUpdates()
    //       clearInterval(checkConnection)
    //     }
    //   }, 1000)

    //   return () => clearInterval(checkConnection)
    // }

    return () => {
      // realTimeDataService.unsubscribe('nft-update')
    }
  }, [])

  return {
    collections,
    isLoading,
    error,
    refresh: () => enhancedApiService.getLiveNFTCollections().then(setCollections)
  }
}

// Hook for real-time GameFi project data
export function useRealTimeGameFi() {
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        setIsLoading(true)
        const data = await enhancedApiService.getLiveGameFiProjects()
        setProjects(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch GameFi data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()

    // Set up real-time callbacks
    const callbacks: RealTimeCallbacks = {
      onGameFiUpdate: (data) => {
        setProjects(data)
        setError(null)
      },
      onError: (err) => {
        setError(err.message || 'GameFi update error')
      }
    }

    // realTimeDataService.setCallbacks(callbacks)
    
    // Subscribe to GameFi updates
    const subscribeToUpdates = () => {
      // realTimeDataService.subscribe('gamefi-update')
    }

    // if (realTimeDataService.isConnected()) {
    //   subscribeToUpdates()
    // } else {
    //   const checkConnection = setInterval(() => {
    //     if (realTimeDataService.isConnected()) {
    //       subscribeToUpdates()
    //       clearInterval(checkConnection)
    //     }
    //   }, 1000)
    //   return () => clearInterval(checkConnection)
    // }

    return () => {
      // realTimeDataService.unsubscribe('gamefi-update')
    }
  }, [])

  return {
    projects,
    isLoading,
    error,
    refresh: () => enhancedApiService.getLiveGameFiProjects().then(setProjects)
  }
}

// Hook for real-time AI chat
export function useRealTimeAIChat() {
  const [isConnected, setIsConnected] = useState(false)
  const responseCallbacks = useRef<Map<string, (response: any) => void>>(new Map())

  useEffect(() => {
    const callbacks: RealTimeCallbacks = {
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
      onError: () => setIsConnected(false)
    }

    // realTimeDataService.setCallbacks(callbacks)

    // Set up AI response listeners
    // realTimeDataService.onAIResponse((data) => {
    //   const callback = responseCallbacks.current.get(data.requestId)
    //   if (callback) {
    //     callback(data)
    //     responseCallbacks.current.delete(data.requestId)
    //   }
    // })

    // realTimeDataService.onAIError((error) => {
    //   const callback = responseCallbacks.current.get(error.requestId)
    //   if (callback) {
    //     callback({ error: error.error })
    //     responseCallbacks.current.delete(error.requestId)
    //   }
    // })

    return () => {
      responseCallbacks.current.clear()
    }
  }, [])

  const sendMessage = useCallback((
    message: string, 
    sector?: string, 
    conversationHistory: any[] = []
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!isConnected) {
        reject(new Error('WebSocket not connected'))
        return
      }

      // Get a request ID from the service
      const requestId: string = 'mock-request-id'; // realTimeDataService.sendAIChat(message, sector, conversationHistory)
      if (!requestId) {
        reject(new Error('Failed to send message'))
        return
      }

      // Set up response callback
      responseCallbacks.current.set(requestId, (response) => {
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response)
        }
      })

      // Timeout after 30 seconds
      setTimeout(() => {
        if (responseCallbacks.current.has(requestId)) {
          responseCallbacks.current.delete(requestId)
          reject(new Error('Request timeout'))
        }
      }, 30000)
    })
  }, [isConnected])

  return {
    sendMessage,
    isConnected
  }
}
