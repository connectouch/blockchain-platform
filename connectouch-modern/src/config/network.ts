/**
 * Network Configuration for Connectouch Modern
 * Centralized network settings, API endpoints, and diagnostics
 */

export interface NetworkConfig {
  // API Configuration
  api: {
    baseUrl: string
    aiBaseUrl: string
    timeout: number
    retries: number
  }
  
  // Timeout Configuration
  timeouts: {
    api: number
    websocket: number
    health: number
    connection: number
  }
  
  // Retry Configuration
  retry: {
    attempts: number
    delay: number
    backoff: number
  }
  
  // Proxy Configuration
  proxy: {
    enabled: boolean
    target: string
    changeOrigin: boolean
    secure: boolean
  }
  
  // Health Check Configuration
  health: {
    interval: number
    timeout: number
    endpoints: string[]
  }
  
  // WebSocket Configuration
  websocket: {
    url: string
    reconnectInterval: number
    maxReconnectAttempts: number
    heartbeatInterval: number
  }
  
  // Environment Configuration
  environment: {
    isDevelopment: boolean
    isProduction: boolean
    apiVersion: string
  }
}

export interface NetworkDiagnostics {
  timestamp: string
  environment: string
  apiEndpoints: {
    main: string
    ai: string
    websocket: string
  }
  configuration: {
    timeout: number
    retries: number
    proxyEnabled: boolean
  }
  health: {
    lastCheck: string
    status: 'healthy' | 'degraded' | 'unhealthy'
    services: Array<{
      name: string
      url: string
      status: 'online' | 'offline' | 'unknown'
      responseTime?: number
    }>
  }
}

// Environment Detection
const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD
const apiVersion = 'v2'

// Base URLs - Use proxy in development, direct URLs in production
const getBaseUrl = () => {
  if (isDevelopment) {
    return '/api/v2/blockchain' // Vite proxy endpoint
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/v2/blockchain'
}

const getAIBaseUrl = () => {
  if (isDevelopment) {
    return '/api/v2/ai' // Vite proxy endpoint
  }
  return import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:3002/api/v2/ai'
}

const getWebSocketUrl = () => {
  if (isDevelopment) {
    return 'ws://localhost:3002/ws'
  }
  return import.meta.env.VITE_WS_URL || 'ws://localhost:3002/ws'
}

// Main Network Configuration
export const networkConfig: NetworkConfig = {
  api: {
    baseUrl: getBaseUrl(),
    aiBaseUrl: getAIBaseUrl(),
    timeout: 30000, // 30 seconds
    retries: 3
  },
  
  timeouts: {
    api: 30000,      // 30 seconds for API calls
    websocket: 5000,  // 5 seconds for WebSocket connection
    health: 5000,     // 5 seconds for health checks
    connection: 10000 // 10 seconds for initial connection
  },
  
  retry: {
    attempts: 3,
    delay: 1000,     // 1 second initial delay
    backoff: 2       // Exponential backoff multiplier
  },
  
  proxy: {
    enabled: isDevelopment,
    target: 'http://localhost:3002',
    changeOrigin: true,
    secure: false
  },
  
  health: {
    interval: 30000,  // Check every 30 seconds
    timeout: 5000,    // 5 second timeout for health checks
    endpoints: [
      '/health',
      '/api/v2/blockchain/health',
      '/api/v2/ai/health'
    ]
  },
  
  websocket: {
    url: getWebSocketUrl(),
    reconnectInterval: 5000,     // 5 seconds
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000     // 30 seconds
  },
  
  environment: {
    isDevelopment,
    isProduction,
    apiVersion
  }
}

// API Endpoint Builder
export const buildAPIEndpoint = (path: string, baseUrl?: string): string => {
  const base = baseUrl || networkConfig.api.baseUrl
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

// AI API Endpoint Builder
export const buildAIEndpoint = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${networkConfig.api.aiBaseUrl}${cleanPath}`
}

// Network Diagnostics
export const getNetworkDiagnostics = (): NetworkDiagnostics => {
  return {
    timestamp: new Date().toISOString(),
    environment: isDevelopment ? 'development' : 'production',
    apiEndpoints: {
      main: networkConfig.api.baseUrl,
      ai: networkConfig.api.aiBaseUrl,
      websocket: networkConfig.websocket.url
    },
    configuration: {
      timeout: networkConfig.timeouts.api,
      retries: networkConfig.retry.attempts,
      proxyEnabled: networkConfig.proxy.enabled
    },
    health: {
      lastCheck: new Date().toISOString(),
      status: 'unknown',
      services: [
        {
          name: 'Main API',
          url: networkConfig.api.baseUrl,
          status: 'unknown'
        },
        {
          name: 'AI API',
          url: networkConfig.api.aiBaseUrl,
          status: 'unknown'
        },
        {
          name: 'WebSocket',
          url: networkConfig.websocket.url,
          status: 'unknown'
        }
      ]
    }
  }
}

// Health Check Utility
export const performHealthCheck = async (endpoint: string): Promise<{
  status: 'online' | 'offline'
  responseTime: number
  error?: string
}> => {
  const startTime = Date.now()
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      timeout: networkConfig.health.timeout
    } as RequestInit)
    
    const responseTime = Date.now() - startTime
    
    if (response.ok) {
      return { status: 'online', responseTime }
    } else {
      return { 
        status: 'offline', 
        responseTime, 
        error: `HTTP ${response.status}` 
      }
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return { 
      status: 'offline', 
      responseTime, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Export default configuration
export default networkConfig
