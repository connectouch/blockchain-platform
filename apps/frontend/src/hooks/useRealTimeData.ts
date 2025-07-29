import { useState, useEffect, useCallback, useRef } from 'react'
import { realTimeDataService, EnhancedApiService } from '../services/realTimeDataService'
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
        const data = await EnhancedApiService.getLiveMarketOverview()
        setMarketData(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()

    // Set up real-time callbacks
    const callbacks: RealTimeCallbacks = {
      onMarketUpdate: (data) => {
        setMarketData(data)
        setError(null)
      },
      onConnect: () => {
        setIsConnected(true)
        setError(null)
      },
      onDisconnect: () => {
        setIsConnected(false)
      },
      onError: (err) => {
        setError(err.message || 'WebSocket connection error')
        setIsConnected(false)
      }
    }

    realTimeDataService.setCallbacks(callbacks)
    
    // Subscribe to market updates
    if (realTimeDataService.getConnectionStatus()) {
      realTimeDataService.subscribe('market-overview')
    } else {
      // Wait for connection and then subscribe
      const checkConnection = setInterval(() => {
        if (realTimeDataService.getConnectionStatus()) {
          realTimeDataService.subscribe('market-overview')
          clearInterval(checkConnection)
        }
      }, 1000)

      return () => clearInterval(checkConnection)
    }

    return () => {
      realTimeDataService.unsubscribe('market-overview')
    }
  }, [])

  return {
    marketData,
    isLoading,
    error,
    isConnected,
    refresh: () => EnhancedApiService.getLiveMarketOverview().then(setMarketData)
  }
}

// Hook for real-time price updates
export function useRealTimePrices(symbols: string[] = []) {
  const [prices, setPrices] = useState<RealTimePriceUpdate>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch initial price data immediately
    const fetchInitialPrices = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/v2/blockchain/prices/live')
        const data = await response.json()

        if (data.success) {
          // Convert API format to expected format
          const formattedPrices: RealTimePriceUpdate = {}
          Object.entries(data.data).forEach(([symbol, priceData]: [string, any]) => {
            formattedPrices[symbol] = {
              usd: priceData.usd,
              usd_24h_change: priceData.usd_24h_change,
              usd_market_cap: priceData.usd_market_cap,
              usd_24h_vol: priceData.usd_24h_vol
            }
          })

          setPrices(formattedPrices)
          setError(null)
          console.log('✅ useRealTimePrices: Initial prices loaded', Object.keys(formattedPrices).length, 'symbols')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch prices')
        console.error('❌ useRealTimePrices: Failed to fetch initial prices:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialPrices()

    const callbacks: RealTimeCallbacks = {
      onPriceUpdate: (data) => {
        setPrices(prevPrices => ({ ...prevPrices, ...data }))
        setError(null)
        console.log('🔄 useRealTimePrices: Price update received', Object.keys(data).length, 'symbols')
      },
      onError: (err) => {
        setError(err.message || 'Price update error')
        console.error('❌ useRealTimePrices: Update error:', err)
      }
    }

    realTimeDataService.setCallbacks(callbacks)

    // Subscribe to price updates
    const subscribeToUpdates = () => {
      if (symbols.length > 0) {
        realTimeDataService.subscribe('price-update', symbols)
      } else {
        realTimeDataService.subscribe('price-update')
      }
    }

    if (realTimeDataService.getConnectionStatus()) {
      subscribeToUpdates()
    } else {
      const checkConnection = setInterval(() => {
        if (realTimeDataService.getConnectionStatus()) {
          subscribeToUpdates()
          clearInterval(checkConnection)
        }
      }, 1000)

      return () => clearInterval(checkConnection)
    }

    return () => {
      if (symbols.length > 0) {
        realTimeDataService.unsubscribe('price-update', symbols)
      } else {
        realTimeDataService.unsubscribe('price-update')
      }
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

  useEffect(() => {
    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        setIsLoading(true)
        const data = await EnhancedApiService.getLiveDeFiProtocols()
        setProtocols(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch DeFi data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()

    // Set up real-time callbacks
    const callbacks: RealTimeCallbacks = {
      onDeFiUpdate: (data) => {
        setProtocols(data)
        setError(null)
      },
      onError: (err) => {
        setError(err.message || 'DeFi update error')
      }
    }

    realTimeDataService.setCallbacks(callbacks)
    
    // Subscribe to DeFi updates
    const subscribeToUpdates = () => {
      realTimeDataService.subscribe('defi-update')
    }

    if (realTimeDataService.isConnected()) {
      subscribeToUpdates()
    } else {
      const checkConnection = setInterval(() => {
        if (realTimeDataService.isConnected()) {
          subscribeToUpdates()
          clearInterval(checkConnection)
        }
      }, 1000)

      return () => clearInterval(checkConnection)
    }

    return () => {
      realTimeDataService.unsubscribe('defi-update')
    }
  }, [])

  return {
    protocols,
    isLoading,
    error,
    refresh: () => EnhancedApiService.getLiveDeFiProtocols().then(setProtocols)
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
        const data = await EnhancedApiService.getLiveNFTCollections()
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

    realTimeDataService.setCallbacks(callbacks)
    
    // Subscribe to NFT updates
    const subscribeToUpdates = () => {
      realTimeDataService.subscribe('nft-update')
    }

    if (realTimeDataService.isConnected()) {
      subscribeToUpdates()
    } else {
      const checkConnection = setInterval(() => {
        if (realTimeDataService.isConnected()) {
          subscribeToUpdates()
          clearInterval(checkConnection)
        }
      }, 1000)

      return () => clearInterval(checkConnection)
    }

    return () => {
      realTimeDataService.unsubscribe('nft-update')
    }
  }, [])

  return {
    collections,
    isLoading,
    error,
    refresh: () => EnhancedApiService.getLiveNFTCollections().then(setCollections)
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
        const data = await EnhancedApiService.getLiveGameFiProjects()
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

    realTimeDataService.setCallbacks(callbacks)
    
    // Subscribe to GameFi updates
    const subscribeToUpdates = () => {
      realTimeDataService.subscribe('gamefi-update')
    }

    if (realTimeDataService.isConnected()) {
      subscribeToUpdates()
    } else {
      const checkConnection = setInterval(() => {
        if (realTimeDataService.isConnected()) {
          subscribeToUpdates()
          clearInterval(checkConnection)
        }
      }, 1000)

      return () => clearInterval(checkConnection)
    }

    return () => {
      realTimeDataService.unsubscribe('gamefi-update')
    }
  }, [])

  return {
    projects,
    isLoading,
    error,
    refresh: () => EnhancedApiService.getLiveGameFiProjects().then(setProjects)
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

    realTimeDataService.setCallbacks(callbacks)

    // Set up AI response listeners
    realTimeDataService.onAIResponse((data) => {
      const callback = responseCallbacks.current.get(data.requestId)
      if (callback) {
        callback(data)
        responseCallbacks.current.delete(data.requestId)
      }
    })

    realTimeDataService.onAIError((error) => {
      const callback = responseCallbacks.current.get(error.requestId)
      if (callback) {
        callback({ error: error.error })
        responseCallbacks.current.delete(error.requestId)
      }
    })

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
      const requestId: string = realTimeDataService.sendAIChat(message, sector, conversationHistory)
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
