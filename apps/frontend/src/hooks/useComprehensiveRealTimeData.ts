/**
 * Comprehensive Real-Time Data Hook
 * Provides centralized real-time data management for all components
 */

import { useState, useEffect, useCallback } from 'react'
import { comprehensiveRealTimeService, RealTimePrice, DeFiProtocol, NFTCollection, MarketMover, FearGreedIndex, GameFiProject, DAOProject } from '../services/comprehensiveRealTimeService'

export interface UseComprehensiveRealTimeDataReturn {
  // Data
  prices: RealTimePrice[]
  defiProtocols: DeFiProtocol[]
  nftCollections: NFTCollection[]
  gamefiProjects: GameFiProject[]
  daoProjects: DAOProject[]
  marketMovers: MarketMover[]
  fearGreedIndex: FearGreedIndex | null
  
  // State
  isLoading: boolean
  isConnected: boolean
  lastUpdate: Date
  error: string | null
  
  // Actions
  refresh: () => Promise<void>
  getPrice: (symbol: string) => RealTimePrice | null
  getProtocol: (id: string) => DeFiProtocol | null
  getCollection: (id: string) => NFTCollection | null
  
  // Market Overview
  marketOverview: {
    totalMarketCap: number
    totalVolume: number
    topGainers: MarketMover[]
    topLosers: MarketMover[]
    fearGreed: FearGreedIndex | null
  }
}

export const useComprehensiveRealTimeData = (): UseComprehensiveRealTimeDataReturn => {
  const [prices, setPrices] = useState<RealTimePrice[]>([])
  const [defiProtocols, setDefiProtocols] = useState<DeFiProtocol[]>([])
  const [nftCollections, setNftCollections] = useState<NFTCollection[]>([])
  const [gamefiProjects, setGamefiProjects] = useState<GameFiProject[]>([])
  const [daoProjects, setDaoProjects] = useState<DAOProject[]>([])
  const [marketMovers, setMarketMovers] = useState<MarketMover[]>([])
  const [fearGreedIndex, setFearGreedIndex] = useState<FearGreedIndex | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeService()
    return () => {
      comprehensiveRealTimeService.removeAllListeners()
    }
  }, [])

  const initializeService = async () => {
    try {
      setError(null)
      setIsLoading(true)

      // Initialize the service
      await comprehensiveRealTimeService.initialize()

      // Set up event listeners
      setupEventListeners()

      // Get initial data
      loadInitialData()

      setIsConnected(true)
      setIsLoading(false)
      setLastUpdate(new Date())

    } catch (error) {
      console.error('Failed to initialize real-time service:', error)
      setError('Failed to connect to real-time data service')
      setIsLoading(false)
      setIsConnected(false)
    }
  }

  const setupEventListeners = () => {
    // Price updates
    comprehensiveRealTimeService.on('pricesUpdated', (newPrices: RealTimePrice[]) => {
      setPrices(newPrices)
      setLastUpdate(new Date())
    })

    // DeFi updates
    comprehensiveRealTimeService.on('defiUpdated', (newProtocols: DeFiProtocol[]) => {
      setDefiProtocols(newProtocols)
      setLastUpdate(new Date())
    })

    // NFT updates
    comprehensiveRealTimeService.on('nftUpdated', (newCollections: NFTCollection[]) => {
      setNftCollections(newCollections)
      setLastUpdate(new Date())
    })

    // GameFi updates
    comprehensiveRealTimeService.on('gamefiUpdated', (newProjects: GameFiProject[]) => {
      setGamefiProjects(newProjects)
      setLastUpdate(new Date())
    })

    // DAO updates
    comprehensiveRealTimeService.on('daoUpdated', (newProjects: DAOProject[]) => {
      setDaoProjects(newProjects)
      setLastUpdate(new Date())
    })

    // Market movers updates
    comprehensiveRealTimeService.on('marketMoversUpdated', (newMovers: MarketMover[]) => {
      setMarketMovers(newMovers)
      setLastUpdate(new Date())
    })

    // Fear & Greed updates
    comprehensiveRealTimeService.on('fearGreedUpdated', (newIndex: FearGreedIndex) => {
      setFearGreedIndex(newIndex)
      setLastUpdate(new Date())
    })

    // Error handling
    comprehensiveRealTimeService.on('pricesError', handleError)
    comprehensiveRealTimeService.on('defiError', handleError)
    comprehensiveRealTimeService.on('nftError', handleError)
    comprehensiveRealTimeService.on('gamefiError', handleError)
    comprehensiveRealTimeService.on('daoError', handleError)
    comprehensiveRealTimeService.on('marketMoversError', handleError)
    comprehensiveRealTimeService.on('fearGreedError', handleError)
  }

  const loadInitialData = () => {
    setPrices(comprehensiveRealTimeService.getPrices())
    setDefiProtocols(comprehensiveRealTimeService.getDeFiProtocols())
    setNftCollections(comprehensiveRealTimeService.getNFTCollections())
    setGamefiProjects(comprehensiveRealTimeService.getGameFiProjects())
    setDaoProjects(comprehensiveRealTimeService.getDAOProjects())
    setMarketMovers(comprehensiveRealTimeService.getMarketMovers())
    setFearGreedIndex(comprehensiveRealTimeService.getFearGreedIndex())
  }

  const handleError = (error: any) => {
    console.warn('Real-time data error:', error)
    setError('Some data may be delayed. Retrying...')
    setTimeout(() => setError(null), 5000)
  }

  const refresh = useCallback(async () => {
    try {
      setError(null)
      await initializeService()
    } catch (error) {
      console.error('Failed to refresh data:', error)
      setError('Failed to refresh data')
    }
  }, [])

  const getPrice = useCallback((symbol: string): RealTimePrice | null => {
    return comprehensiveRealTimeService.getPrice(symbol)
  }, [])

  const getProtocol = useCallback((id: string): DeFiProtocol | null => {
    return defiProtocols.find(protocol => protocol.id === id) || null
  }, [defiProtocols])

  const getCollection = useCallback((id: string): NFTCollection | null => {
    return nftCollections.find(collection => collection.id === id) || null
  }, [nftCollections])

  // Calculate market overview
  const marketOverview = {
    totalMarketCap: prices.reduce((sum, price) => sum + price.marketCap, 0),
    totalVolume: prices.reduce((sum, price) => sum + price.volume24h, 0),
    topGainers: marketMovers.filter(m => m.category === 'gainer').slice(0, 5),
    topLosers: marketMovers.filter(m => m.category === 'loser').slice(0, 5),
    fearGreed: fearGreedIndex
  }

  return {
    // Data
    prices,
    defiProtocols,
    nftCollections,
    gamefiProjects,
    daoProjects,
    marketMovers,
    fearGreedIndex,
    
    // State
    isLoading,
    isConnected,
    lastUpdate,
    error,
    
    // Actions
    refresh,
    getPrice,
    getProtocol,
    getCollection,
    
    // Market Overview
    marketOverview
  }
}

export default useComprehensiveRealTimeData
