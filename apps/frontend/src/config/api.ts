/**
 * API Configuration for Connectouch Platform
 * Defines endpoints for Vercel and Supabase functions with optimal distribution
 */

interface APIEndpoint {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  cache?: number // Cache duration in seconds
  timeout?: number // Request timeout in ms
}

interface APIConfig {
  vercel: {
    baseUrl: string
    endpoints: {
      market: Record<string, APIEndpoint>
      portfolio: Record<string, APIEndpoint>
      auth: Record<string, APIEndpoint>
      utils: Record<string, APIEndpoint>
    }
  }
  supabase: {
    baseUrl: string
    endpoints: {
      crypto: Record<string, APIEndpoint>
      ai: Record<string, APIEndpoint>
      portfolio: Record<string, APIEndpoint>
      defi: Record<string, APIEndpoint>
      nft: Record<string, APIEndpoint>
      alerts: Record<string, APIEndpoint>
      governance: Record<string, APIEndpoint>
    }
  }
}

const config: APIConfig = {
  // 🔵 VERCEL API ROUTES (Fast, Client-Side Optimized)
  // Best for: Static data, authentication, client-side operations
  vercel: {
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://connectouch.vercel.app/api' 
      : 'http://localhost:3000/api',
    
    endpoints: {
      // Market Data APIs
      market: {
        overview: {
          url: '/market/overview',
          method: 'GET',
          cache: 300, // 5 minutes
          timeout: 10000
        },
        trending: {
          url: '/market/trending',
          method: 'GET',
          cache: 180, // 3 minutes
          timeout: 8000
        },
        search: {
          url: '/market/search',
          method: 'GET',
          cache: 600, // 10 minutes
          timeout: 5000
        },
        gainers: {
          url: '/market/gainers',
          method: 'GET',
          cache: 300,
          timeout: 8000
        },
        losers: {
          url: '/market/losers',
          method: 'GET',
          cache: 300,
          timeout: 8000
        }
      },
      
      // Portfolio APIs
      portfolio: {
        balance: {
          url: '/portfolio/balance',
          method: 'GET',
          cache: 60, // 1 minute
          timeout: 15000
        },
        history: {
          url: '/portfolio/history',
          method: 'GET',
          cache: 300,
          timeout: 10000
        },
        analytics: {
          url: '/portfolio/analytics',
          method: 'GET',
          cache: 180,
          timeout: 12000
        },
        update: {
          url: '/portfolio/update',
          method: 'POST',
          timeout: 20000
        }
      },
      
      // Authentication APIs
      auth: {
        login: {
          url: '/auth/login',
          method: 'POST',
          timeout: 10000
        },
        register: {
          url: '/auth/register',
          method: 'POST',
          timeout: 10000
        },
        refresh: {
          url: '/auth/refresh',
          method: 'POST',
          timeout: 5000
        },
        logout: {
          url: '/auth/logout',
          method: 'POST',
          timeout: 5000
        }
      },
      
      // Utility APIs
      utils: {
        imageProxy: {
          url: '/utils/image-proxy',
          method: 'GET',
          cache: 3600, // 1 hour
          timeout: 8000
        },
        corsProxy: {
          url: '/utils/cors-proxy',
          method: 'GET',
          timeout: 15000
        },
        cacheManager: {
          url: '/utils/cache',
          method: 'GET',
          timeout: 5000
        }
      }
    }
  },

  // 🟢 SUPABASE EDGE FUNCTIONS (Database-Heavy, Real-time)
  // Best for: Real-time data, AI processing, complex operations
  supabase: {
    baseUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`,
    
    endpoints: {
      // Crypto Data Functions
      crypto: {
        prices: {
          url: '/crypto-prices',
          method: 'GET',
          cache: 30, // 30 seconds
          timeout: 10000
        },
        priceHistory: {
          url: '/crypto-price-history',
          method: 'POST',
          cache: 300,
          timeout: 15000
        },
        marketData: {
          url: '/crypto-market-data',
          method: 'POST',
          timeout: 12000
        }
      },
      
      // AI Functions
      ai: {
        analysis: {
          url: '/ai-analysis',
          method: 'POST',
          timeout: 30000 // AI processing takes longer
        },
        predictions: {
          url: '/ai-predictions',
          method: 'POST',
          timeout: 45000 // Complex AI analysis
        },
        sentiment: {
          url: '/ai-sentiment',
          method: 'POST',
          timeout: 20000
        },
        recommendations: {
          url: '/ai-recommendations',
          method: 'POST',
          timeout: 25000
        }
      },
      
      // Portfolio Functions
      portfolio: {
        sync: {
          url: '/portfolio-sync',
          method: 'POST',
          timeout: 60000 // Blockchain sync takes time
        },
        realtime: {
          url: '/portfolio-realtime',
          method: 'POST',
          timeout: 15000
        },
        performance: {
          url: '/portfolio-performance',
          method: 'POST',
          cache: 300,
          timeout: 20000
        }
      },
      
      // DeFi Functions
      defi: {
        protocols: {
          url: '/defi-protocols',
          method: 'GET',
          cache: 600, // 10 minutes
          timeout: 15000
        },
        yields: {
          url: '/defi-yields',
          method: 'GET',
          cache: 300, // 5 minutes
          timeout: 12000
        },
        pools: {
          url: '/defi-pools',
          method: 'POST',
          cache: 180,
          timeout: 15000
        },
        farming: {
          url: '/defi-farming',
          method: 'POST',
          timeout: 20000
        }
      },
      
      // NFT Functions
      nft: {
        collections: {
          url: '/nft-collections',
          method: 'GET',
          cache: 600,
          timeout: 15000
        },
        trending: {
          url: '/nft-trending',
          method: 'GET',
          cache: 300,
          timeout: 12000
        },
        analytics: {
          url: '/nft-analytics',
          method: 'POST',
          cache: 600,
          timeout: 20000
        }
      },
      
      // Alert Functions
      alerts: {
        create: {
          url: '/market-alerts',
          method: 'POST',
          timeout: 10000
        },
        list: {
          url: '/market-alerts',
          method: 'GET',
          cache: 60,
          timeout: 8000
        },
        update: {
          url: '/market-alerts',
          method: 'PUT',
          timeout: 8000
        },
        delete: {
          url: '/market-alerts',
          method: 'DELETE',
          timeout: 5000
        }
      },
      
      // Governance Functions
      governance: {
        proposals: {
          url: '/governance-proposals',
          method: 'GET',
          cache: 300,
          timeout: 15000
        },
        voting: {
          url: '/governance-voting',
          method: 'POST',
          timeout: 25000
        },
        analytics: {
          url: '/governance-analytics',
          method: 'GET',
          cache: 600,
          timeout: 20000
        }
      }
    }
  }
}

// Helper function to build full URL
export function buildApiUrl(platform: 'vercel' | 'supabase', category: string, endpoint: string, params?: Record<string, string>): string {
  const baseConfig = config[platform]
  const endpointConfig = (baseConfig.endpoints as any)[category]?.[endpoint]
  
  if (!endpointConfig) {
    throw new Error(`API endpoint not found: ${platform}.${category}.${endpoint}`)
  }
  
  let url = `${baseConfig.baseUrl}${endpointConfig.url}`
  
  // Add query parameters
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }
  
  return url
}

// Helper function to get endpoint configuration
export function getEndpointConfig(platform: 'vercel' | 'supabase', category: string, endpoint: string): APIEndpoint {
  const baseConfig = config[platform]
  const endpointConfig = (baseConfig.endpoints as any)[category]?.[endpoint]
  
  if (!endpointConfig) {
    throw new Error(`API endpoint not found: ${platform}.${category}.${endpoint}`)
  }
  
  return endpointConfig
}

// API Client with automatic platform selection
export class ConnectouchAPI {
  private static instance: ConnectouchAPI
  
  static getInstance(): ConnectouchAPI {
    if (!ConnectouchAPI.instance) {
      ConnectouchAPI.instance = new ConnectouchAPI()
    }
    return ConnectouchAPI.instance
  }
  
  // Market data (uses Vercel for speed)
  async getMarketOverview(params?: Record<string, string>) {
    return this.request('vercel', 'market', 'overview', params)
  }
  
  async getTrendingTokens(params?: Record<string, string>) {
    return this.request('vercel', 'market', 'trending', params)
  }
  
  // Portfolio data (uses Vercel for balance, Supabase for sync)
  async getPortfolioBalance(params: Record<string, string>) {
    return this.request('vercel', 'portfolio', 'balance', params)
  }
  
  async syncPortfolio(data: any) {
    return this.request('supabase', 'portfolio', 'sync', undefined, data)
  }
  
  // AI functions (uses Supabase for processing power)
  async getAIAnalysis(data: any) {
    return this.request('supabase', 'ai', 'analysis', undefined, data)
  }
  
  async getAIPredictions(data: any) {
    return this.request('supabase', 'ai', 'predictions', undefined, data)
  }
  
  // DeFi data (uses Supabase for real-time updates)
  async getDeFiProtocols(params?: Record<string, string>) {
    return this.request('supabase', 'defi', 'protocols', params)
  }
  
  async getDeFiYields(params?: Record<string, string>) {
    return this.request('supabase', 'defi', 'yields', params)
  }
  
  // Generic request method
  private async request(
    platform: 'vercel' | 'supabase',
    category: string,
    endpoint: string,
    params?: Record<string, string>,
    data?: any
  ) {
    try {
      const url = buildApiUrl(platform, category, endpoint, params)
      const endpointConfig = getEndpointConfig(platform, category, endpoint)
      
      const options: RequestInit = {
        method: endpointConfig.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(endpointConfig.timeout || 10000)
      }
      
      if (data && (endpointConfig.method === 'POST' || endpointConfig.method === 'PUT')) {
        options.body = JSON.stringify(data)
      }
      
      // Add Supabase auth headers if needed
      if (platform === 'supabase') {
        options.headers = {
          ...options.headers,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
        }
      }
      
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      
      return await response.json()
      
    } catch (error) {
      console.error(`API request failed (${platform}.${category}.${endpoint}):`, error)
      throw error
    }
  }
}

export default config
