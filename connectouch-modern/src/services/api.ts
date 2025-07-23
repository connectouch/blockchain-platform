import axios, { AxiosInstance, AxiosResponse } from 'axios'
import toast from 'react-hot-toast'
import { enhancedWebSocketService } from './enhancedWebSocketService'
import { offlineService } from './offlineService'
import { networkConfig, buildAPIEndpoint, getNetworkDiagnostics } from '../config/network'
import { networkHealthService } from './NetworkHealthService'
import { errorHandlingService } from './errorHandlingService'
import type {
  APIResponse,
  BlockchainSector,
  AIAnalysisRequest,
  AIAnalysisResponse,
  AIChatMessage,
  DeFiProtocol,
  MarketData
} from '../types'

// API Configuration using centralized network config
const API_BASE_URL = '/api/v2/blockchain'
const AI_API_BASE_URL = '/api/v2/ai'
const API_TIMEOUT = networkConfig.timeouts.api
const RETRY_ATTEMPTS = networkConfig.retry.attempts
const RETRY_DELAY = networkConfig.retry.delay

console.log('🌐 API Service Configuration:', {
  mainAPI: API_BASE_URL,
  aiAPI: AI_API_BASE_URL,
  timeout: API_TIMEOUT,
  retries: RETRY_ATTEMPTS,
  networkDiagnostics: getNetworkDiagnostics()
})

// Enhanced retry function using centralized error handling
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  context: { service: string; endpoint: string; method: string }
): Promise<T> {
  return errorHandlingService.retryRequest(requestFn, {
    ...context,
    timestamp: new Date()
  })
}

// Network health checker
async function checkNetworkHealth(): Promise<boolean> {
  try {
    const response = await axios.get('/health', {
      timeout: 5000
    })
    return response.status === 200
  } catch {
    return false
  }
}

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
      // Use centralized error handling
      const context = {
        service: 'api',
        endpoint: error.config?.url || 'unknown',
        method: error.config?.method?.toUpperCase() || 'unknown',
        timestamp: new Date()
      }

      await errorHandlingService.handleError(error, context)
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
