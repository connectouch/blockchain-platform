/**
 * Fresh Network Service - Clean Implementation
 * Handles all API calls with proper error handling
 */

import axios, { AxiosInstance } from 'axios'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
}

export interface NetworkConfig {
  apiBaseUrl: string
  aiBaseUrl: string
  timeout: number
  retries: number
}

class FreshNetworkService {
  private static instance: FreshNetworkService
  private apiClient: AxiosInstance
  private aiClient: AxiosInstance
  private config: NetworkConfig

  private constructor() {
    this.config = {
      apiBaseUrl: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3006',
      aiBaseUrl: (import.meta as any).env?.VITE_AI_BASE_URL || 'http://localhost:3006',
      timeout: 10000,
      retries: 3
    }

    // Create API client
    this.apiClient = axios.create({
      baseURL: this.config.apiBaseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Create AI client
    this.aiClient = axios.create({
      baseURL: this.config.aiBaseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  public static getInstance(): FreshNetworkService {
    if (!FreshNetworkService.instance) {
      FreshNetworkService.instance = new FreshNetworkService()
    }
    return FreshNetworkService.instance
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('❌ API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.apiClient.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`)
        return response
      },
      (error) => {
        console.error(`❌ API Response Error: ${error.response?.status} ${error.config?.url}`)
        return Promise.reject(error)
      }
    )

    // AI client interceptors
    this.aiClient.interceptors.request.use(
      (config) => {
        console.log(`🤖 AI Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      }
    )

    this.aiClient.interceptors.response.use(
      (response) => {
        console.log(`✅ AI Response: ${response.status} ${response.config.url}`)
        return response
      },
      (error) => {
        console.error(`❌ AI Response Error: ${error.response?.status} ${error.config?.url}`)
        return Promise.reject(error)
      }
    )
  }

  // Health check
  public async checkHealth(): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get('/health')
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: 'Health check failed',
        message: error.message
      }
    }
  }

  // Blockchain Overview
  public async getBlockchainOverview(): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get('/api/v2/blockchain/overview')
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to fetch blockchain overview',
        message: error.message
      }
    }
  }

  // Live Prices
  public async getLivePrices(): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get('/api/v2/blockchain/prices/live')
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to fetch live prices',
        message: error.message
      }
    }
  }

  // DeFi Protocols
  public async getDefiProtocols(): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get('/api/v2/blockchain/defi/protocols')
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to fetch DeFi protocols',
        message: error.message
      }
    }
  }

  // NFT Collections
  public async getNftCollections(): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get('/api/v2/blockchain/nft/collections')
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to fetch NFT collections',
        message: error.message
      }
    }
  }

  // AI Chat
  public async sendAiMessage(message: string, context?: string): Promise<ApiResponse> {
    try {
      const response = await this.aiClient.post('/api/v2/ai/chat', {
        message,
        context
      })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to send AI message',
        message: error.message
      }
    }
  }

  // AI Analysis
  public async analyzeData(data: any, type: string): Promise<ApiResponse> {
    try {
      const response = await this.aiClient.post('/api/v2/ai/analyze', {
        data,
        type
      })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to analyze data',
        message: error.message
      }
    }
  }

  // AI Health Check
  public async checkAiHealth(): Promise<ApiResponse> {
    try {
      const response = await this.aiClient.get('/health')
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: 'AI health check failed',
        message: error.message
      }
    }
  }

  // Get network status
  public async getNetworkStatus(): Promise<{
    api: boolean
    ai: boolean
    overall: boolean
  }> {
    const [apiHealth, aiHealth] = await Promise.allSettled([
      this.checkHealth(),
      this.checkAiHealth()
    ])

    const apiStatus = apiHealth.status === 'fulfilled' && apiHealth.value.success
    const aiStatus = aiHealth.status === 'fulfilled' && aiHealth.value.success

    return {
      api: apiStatus,
      ai: aiStatus,
      overall: apiStatus && aiStatus
    }
  }

  // Update configuration
  public updateConfig(newConfig: Partial<NetworkConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Get current configuration
  public getConfig(): NetworkConfig {
    return { ...this.config }
  }
}

// Export singleton instance
export const freshNetworkService = FreshNetworkService.getInstance()

// Export for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).freshNetwork = freshNetworkService
}

export default FreshNetworkService
