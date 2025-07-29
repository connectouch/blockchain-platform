import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { realTimeDataService, EnhancedApiService } from '../services/realTimeDataService'
import type {
  RealTimeMarketData,
  RealTimeCallbacks
} from '../services/realTimeDataService'

// Cache interface for optimized data management
interface DataCache<T> {
  data: T | null
  timestamp: number
  isStale: boolean
}

// Progressive loading states
export type LoadingState = 'idle' | 'loading' | 'partial' | 'complete' | 'error'

// Cache duration constants (in milliseconds)
const CACHE_DURATIONS = {
  MARKET_DATA: 30000,    // 30 seconds
  PRICES: 10000,         // 10 seconds
  DEFI: 60000,          // 1 minute
  NFT: 120000,          // 2 minutes
  GAMEFI: 180000        // 3 minutes
}

// Global cache store to prevent duplicate requests
const globalCache = new Map<string, DataCache<any>>()

// Optimized hook for progressive real-time data loading
export function useOptimizedRealTimeData() {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [criticalDataLoaded, setCriticalDataLoaded] = useState(false)
  const [allDataLoaded, setAllDataLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Backup connection check - verify API connectivity independently
  useEffect(() => {
    const checkAPIConnectivity = async () => {
      try {
        const response = await fetch('/health', {
          method: 'GET'
        })
        if (response.ok && !isConnected) {
          console.log('✅ API connectivity verified - setting connected status')
          setIsConnected(true)
        }
      } catch (error) {
        console.log('❌ API connectivity check failed:', error)
        if (isConnected) {
          setIsConnected(false)
        }
      }
    }

    // Check immediately and then every 10 seconds
    checkAPIConnectivity()
    const interval = setInterval(checkAPIConnectivity, 10000)

    return () => clearInterval(interval)
  }, [isConnected])

  // Individual data states
  const [marketData, setMarketData] = useState<RealTimeMarketData | null>(null)
  const [prices, setPrices] = useState<Record<string, any>>({})
  const [defiProtocols, setDefiProtocols] = useState<any[]>([])
  const [nftCollections, setNftCollections] = useState<any[]>([])
  const [gamefiProjects, setGamefiProjects] = useState<any[]>([])

  // Loading states for individual data types
  const [marketLoading, setMarketLoading] = useState(true)
  const [pricesLoading, setPricesLoading] = useState(true)
  const [defiLoading, setDefiLoading] = useState(true)
  const [nftLoading, setNftLoading] = useState(true)
  const [gamefiLoading, setGamefiLoading] = useState(true)

  const abortControllerRef = useRef<AbortController | null>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cache helper functions
  const getCachedData = useCallback(<T>(key: string, maxAge: number): T | null => {
    const cached = globalCache.get(key)
    if (!cached) return null
    
    const isExpired = Date.now() - cached.timestamp > maxAge
    if (isExpired) {
      globalCache.delete(key)
      return null
    }
    
    return cached.data
  }, [])

  const setCachedData = useCallback(<T>(key: string, data: T): void => {
    globalCache.set(key, {
      data,
      timestamp: Date.now(),
      isStale: false
    })
  }, [])

  // Progressive data loading with prioritization
  const loadCriticalData = useCallback(async (signal: AbortSignal) => {
    try {
      setLoadingState('loading')
      setLoadingProgress(10)

      // Priority 1: Market overview (most critical)
      const cachedMarketData = getCachedData<RealTimeMarketData>('market-data', CACHE_DURATIONS.MARKET_DATA)
      if (cachedMarketData) {
        setMarketData(cachedMarketData)
        setMarketLoading(false)
      } else {
        try {
          const marketResponse = await EnhancedApiService.getLiveMarketOverview()
          if (!signal.aborted) {
            setMarketData(marketResponse)
            setCachedData('market-data', marketResponse)
            setMarketLoading(false)
          }
        } catch (err) {
          console.warn('Market data failed, using fallback')
          setMarketLoading(false)
        }
      }

      setLoadingProgress(30)

      // Priority 2: Basic price data (essential for dashboard)
      const cachedPrices = getCachedData<Record<string, any>>('prices-basic', CACHE_DURATIONS.PRICES)
      if (cachedPrices) {
        setPrices(cachedPrices)
        setPricesLoading(false)
      } else {
        try {
          const pricesResponse = await fetch('/api/v2/blockchain/prices/live', {
            signal,
            headers: { 'Cache-Control': 'max-age=10' }
          })
          
          if (!signal.aborted && pricesResponse.ok) {
            const pricesData = await pricesResponse.json()
            if (pricesData.success) {
              setPrices(pricesData.data)
              setCachedData('prices-basic', pricesData.data)
            }
          }
        } catch (err) {
          console.warn('Prices failed, continuing with cached data')
        } finally {
          setPricesLoading(false)
        }
      }

      setLoadingProgress(60)
      setCriticalDataLoaded(true)
      setLoadingState('partial')

    } catch (error) {
      if (!signal.aborted) {
        console.error('Critical data loading failed:', error)
        setError('Failed to load critical data')
        setLoadingState('error')
      }
    }
  }, [getCachedData, setCachedData])

  // Load non-critical data in background
  const loadSecondaryData = useCallback(async (signal: AbortSignal) => {
    try {
      setLoadingProgress(70)

      // Load DeFi, NFT, and GameFi data in parallel but non-blocking
      const dataPromises = [
        // DeFi protocols
        (async () => {
          const cached = getCachedData<any[]>('defi-protocols', CACHE_DURATIONS.DEFI)
          if (cached) {
            setDefiProtocols(cached)
            setDefiLoading(false)
            return
          }

          try {
            const response = await fetch('/api/v2/blockchain/defi/protocols', { signal })
            if (!signal.aborted && response.ok) {
              const data = await response.json()
              if (data.success) {
                setDefiProtocols(data.data)
                setCachedData('defi-protocols', data.data)
              }
            }
          } catch (err) {
            console.warn('DeFi data failed')
          } finally {
            setDefiLoading(false)
          }
        })(),

        // NFT collections
        (async () => {
          const cached = getCachedData<any[]>('nft-collections', CACHE_DURATIONS.NFT)
          if (cached) {
            setNftCollections(cached)
            setNftLoading(false)
            return
          }

          try {
            const response = await fetch('/api/v2/blockchain/nft/collections', { signal })
            if (!signal.aborted && response.ok) {
              const data = await response.json()
              if (data.success) {
                setNftCollections(data.data)
                setCachedData('nft-collections', data.data)
              }
            }
          } catch (err) {
            console.warn('NFT data failed')
          } finally {
            setNftLoading(false)
          }
        })(),

        // GameFi projects
        (async () => {
          const cached = getCachedData<any[]>('gamefi-projects', CACHE_DURATIONS.GAMEFI)
          if (cached) {
            setGamefiProjects(cached)
            setGamefiLoading(false)
            return
          }

          try {
            const response = await fetch('/api/v2/blockchain/gamefi/projects', { signal })
            if (!signal.aborted && response.ok) {
              const data = await response.json()
              if (data.success) {
                setGamefiProjects(data.data)
                setCachedData('gamefi-projects', data.data)
              }
            }
          } catch (err) {
            console.warn('GameFi data failed')
          } finally {
            setGamefiLoading(false)
          }
        })()
      ]

      // Wait for all secondary data with timeout
      await Promise.allSettled(dataPromises)
      
      if (!signal.aborted) {
        setLoadingProgress(100)
        setAllDataLoaded(true)
        setLoadingState('complete')
      }

    } catch (error) {
      if (!signal.aborted) {
        console.error('Secondary data loading failed:', error)
        // Don't set error state for secondary data failures
        setLoadingState('partial')
      }
    }
  }, [getCachedData, setCachedData])

  // Initialize progressive loading
  useEffect(() => {
    const controller = new AbortController()
    abortControllerRef.current = controller

    const initializeData = async () => {
      try {
        // Load critical data first
        await loadCriticalData(controller.signal)
        
        // Load secondary data in background
        if (!controller.signal.aborted) {
          loadSecondaryData(controller.signal)
        }

        // Set up real-time WebSocket connection after initial load
        if (!controller.signal.aborted) {
          const callbacks: RealTimeCallbacks = {
            onMarketUpdate: (data) => {
              setMarketData(data)
              setCachedData('market-data', data)
            },
            onPriceUpdate: (data) => {
              setPrices(prev => ({ ...prev, ...data }))
            },
            onConnect: () => {
              console.log('✅ Real-time service connected')
              setIsConnected(true)
            },
            onDisconnect: () => {
              console.log('❌ Real-time service disconnected')
              setIsConnected(false)
            },
            onError: (err) => {
              console.warn('WebSocket error:', err)
              setIsConnected(false)
            }
          }

          realTimeDataService.setCallbacks(callbacks)

          // Subscribe to real-time updates (HTTP polling)
          // Note: setCallbacks will trigger connection, so we subscribe after a brief delay
          setTimeout(() => {
            if (realTimeDataService.getConnectionStatus()) {
              realTimeDataService.subscribe('market-overview')
              realTimeDataService.subscribe('prices', ['bitcoin', 'ethereum', 'binancecoin'])
            }
          }, 100)
        }

      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Data initialization failed:', error)
          setError('Failed to initialize data')
          setLoadingState('error')
        }
      }
    }

    initializeData()

    return () => {
      // Enhanced cleanup to prevent memory leaks and hooks errors
      controller.abort()

      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }

      // Disconnect real-time service
      realTimeDataService.disconnect()

      // Clear global cache to prevent memory leaks
      globalCache.clear()
    }
  }, [loadCriticalData, loadSecondaryData, setCachedData])

  // Memoized return values to prevent unnecessary re-renders
  const memoizedReturn = useMemo(() => ({
    // Loading states
    loadingState,
    loadingProgress,
    criticalDataLoaded,
    allDataLoaded,
    isConnected,
    error,

    // Individual loading states
    marketLoading,
    pricesLoading,
    defiLoading,
    nftLoading,
    gamefiLoading,

    // Data
    marketData,
    prices,
    defiProtocols,
    nftCollections,
    gamefiProjects,

    // Computed states
    isLoading: loadingState === 'loading',
    hasError: loadingState === 'error',
    isPartiallyLoaded: loadingState === 'partial',
    isCompletelyLoaded: loadingState === 'complete',

    // Utility functions
    refresh: () => {
      globalCache.clear()
      window.location.reload()
    }
  }), [
    loadingState,
    loadingProgress,
    criticalDataLoaded,
    allDataLoaded,
    isConnected,
    error,
    marketLoading,
    pricesLoading,
    defiLoading,
    nftLoading,
    gamefiLoading,
    marketData,
    prices,
    defiProtocols,
    nftCollections,
    gamefiProjects
  ])

  return memoizedReturn
}

// Lightweight hook for components that only need specific data
export function useOptimizedMarketData() {
  const { marketData, marketLoading, isConnected, error } = useOptimizedRealTimeData()
  
  return useMemo(() => ({
    marketData,
    isLoading: marketLoading,
    isConnected,
    error
  }), [marketData, marketLoading, isConnected, error])
}

export function useOptimizedPrices(symbols?: string[]) {
  const { prices, pricesLoading, isConnected, error } = useOptimizedRealTimeData()
  
  const filteredPrices = useMemo(() => {
    if (!symbols) return prices
    
    const filtered: Record<string, any> = {}
    symbols.forEach(symbol => {
      if (prices[symbol]) {
        filtered[symbol] = prices[symbol]
      }
    })
    return filtered
  }, [prices, symbols])
  
  return useMemo(() => ({
    prices: filteredPrices,
    isLoading: pricesLoading,
    isConnected,
    error
  }), [filteredPrices, pricesLoading, isConnected, error])
}
