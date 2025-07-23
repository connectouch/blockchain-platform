import axios, { AxiosInstance } from 'axios'
import toast from 'react-hot-toast'
// import { enhancedWebSocketService } from './enhancedWebSocketService'
import { offlineService } from './offlineService'
import type {
  APIResponse,
  // BlockchainSector,
  // AIAnalysisRequest,
  // AIAnalysisResponse,
  // AIChatMessage,
  DeFiProtocol,
  MarketData
} from '../types'

// API Configuration with real-time backend - use proxy in development
const API_BASE_URL = '/api/v2/blockchain'
const API_TIMEOUT = 30000 // 30 seconds
// const RETRY_ATTEMPTS = 3
// const RETRY_DELAY = 1000 // 1 second

// Enhanced retry function with exponential backoff
/*
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  attempts: number = RETRY_ATTEMPTS,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await requestFn()
  } catch (error) {
    if (attempts <= 1) {
      throw error
    }

    console.log(`🔄 Retrying request in ${delay}ms... (${RETRY_ATTEMPTS - attempts + 1}/${RETRY_ATTEMPTS})`)
    await new Promise(resolve => setTimeout(resolve, delay))
    return retryRequest(requestFn, attempts - 1, delay * 2)
  }
}
*/

// Network health checker
/*
async function checkNetworkHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api/v2/blockchain', '')}/health`, {
      timeout: 5000
    })
    return response.status === 200
  } catch {
    return false
  }
}
*/

// Create axios instance with enhanced configuration
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add timestamp to prevent caching
      config.params = {
        ...config.params,
        _t: Date.now(),
      }
      
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
      }
      return config
    },
    (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ API Request Error:', error)
      }
      return Promise.reject(error)
    }
  )

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`)
      }
      return response
    },
    async (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ API Response Error:', error.response?.status, error.config?.url)
      }

      // Handle specific error cases
      if (error.response?.status === 429) {
        // Rate limited - show user-friendly message
        toast.error('Rate limited. Please wait a moment before trying again.')
      } else if (error.response?.status >= 500) {
        // Server error - check if we should use offline mode
        console.log('🔌 Server error detected, checking offline capabilities...')
        
        if (offlineService.isOffline()) {
          toast.error('Server temporarily unavailable. Using cached data.')
        } else {
          toast.error('Server error. Please try again later.')
        }
      } else if (error.request) {
        // Network error - check if we should use offline mode
        console.log('🔌 Network error detected, checking offline capabilities...')

        if (offlineService.isOffline()) {
          toast.error('Using offline data. Some information may be outdated.')
        } else {
          toast.error('Network error. Please check your connection.')
          // Activate offline mode if network is consistently failing
          offlineService.setOfflineMode(true)
        }
      } else {
        // Other error
        toast.error('An unexpected error occurred')
      }
      
      return Promise.reject(error)
    }
  )

  return instance
}

// Create API instance
const api = createApiInstance()

// API Service Class
export class ApiService {
  // Health Check
  static async healthCheck(): Promise<APIResponse> {
    try {
      // Use the proxy endpoint for health check
      const response = await axios.get('/health', { timeout: 5000 })
      return response.data
    } catch (error) {
      console.error('❌ Health check failed:', error)
      throw error
    }
  }

  // Blockchain Overview
  static async getBlockchainOverview(): Promise<APIResponse<MarketData>> {
    try {
      const response = await api.get('/overview')
      return response.data
    } catch (error) {
      // Fallback to legacy endpoint
      console.log('📡 Falling back to legacy API...')
      const fallbackResponse = await api.get('/defi/test')
      return fallbackResponse.data
    }
  }

  // Market Overview
  static async getMarketOverview(): Promise<APIResponse<MarketData>> {
    const response = await api.get('/market/overview')
    return response.data
  }

  // Live Crypto Prices
  static async getLivePrices(): Promise<APIResponse<any>> {
    const response = await api.get('/prices/live')
    return response.data
  }

  // DeFi Services
  static async getDeFiProtocols(): Promise<APIResponse<DeFiProtocol[]>> {
    const response = await api.get('/defi/protocols')
    return response.data
  }

  // NFT Services
  static async getNFTCollections(): Promise<APIResponse<any[]>> {
    const response = await api.get('/nft/collections')
    return response.data
  }

  // GameFi Services
  static async getGameFiProjects(): Promise<APIResponse<any[]>> {
    const response = await api.get('/gamefi/projects')
    return response.data
  }

  // DAO Services - FIXED ENDPOINT
  static async getDAOProjects(): Promise<APIResponse<any[]>> {
    const response = await api.get('/dao/projects')
    return response.data
  }

  // Infrastructure Services - FIXED ENDPOINT
  static async getInfrastructureProjects(): Promise<APIResponse<any[]>> {
    const response = await api.get('/infrastructure/projects')
    return response.data
  }

  // Web3 Tools Services - FIXED ENDPOINT
  static async getWeb3Tools(): Promise<APIResponse<any[]>> {
    const response = await api.get('/tools/list')
    return response.data
  }

  // AI Chat Service
  static async sendAIChat(message: string, context?: any): Promise<APIResponse<any>> {
    const response = await api.post('/ai/chat', { message, context })
    return response.data
  }

  // Historical Price Data
  static async getHistoricalPrices(symbol: string, timeframe: string = '1d'): Promise<APIResponse<any>> {
    const response = await api.get(`/prices/history/${symbol}?timeframe=${timeframe}`)
    return response.data
  }
}

// Query helpers for React Query
export const queryHelpers = {
  // Market data queries
  marketOverview: () => ({
    queryKey: ['market', 'overview'],
    queryFn: ApiService.getMarketOverview,
    staleTime: 1000 * 60 * 2, // 2 minutes
  }),

  blockchainOverview: () => ({
    queryKey: ['blockchain', 'overview'],
    queryFn: ApiService.getBlockchainOverview,
    staleTime: 1000 * 60 * 2, // 2 minutes
  }),

  livePrices: () => ({
    queryKey: ['prices', 'live'],
    queryFn: ApiService.getLivePrices,
    staleTime: 1000 * 30, // 30 seconds
  }),

  // DeFi queries
  defiProtocols: () => ({
    queryKey: ['defi', 'protocols'],
    queryFn: ApiService.getDeFiProtocols,
    staleTime: 1000 * 60 * 5, // 5 minutes
  }),

  // NFT queries
  nftCollections: () => ({
    queryKey: ['nft', 'collections'],
    queryFn: ApiService.getNFTCollections,
    staleTime: 1000 * 60 * 5, // 5 minutes
  }),

  // GameFi queries
  gamefiProjects: () => ({
    queryKey: ['gamefi', 'projects'],
    queryFn: ApiService.getGameFiProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
  }),

  // DAO projects query
  daoProjects: () => ({
    queryKey: ['dao', 'projects'],
    queryFn: ApiService.getDAOProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
  }),

  // Infrastructure projects query
  infrastructureProjects: () => ({
    queryKey: ['infrastructure', 'projects'],
    queryFn: ApiService.getInfrastructureProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
  }),

  // Web3 tools query
  web3Tools: () => ({
    queryKey: ['web3tools', 'tools'],
    queryFn: ApiService.getWeb3Tools,
    staleTime: 1000 * 60 * 5, // 5 minutes
  }),
}

export default ApiService
