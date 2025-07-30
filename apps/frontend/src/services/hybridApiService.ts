/**
 * Hybrid API Service
 * Intelligent routing across multiple platforms to maximize free tier usage
 * Implements load balancing, failover, and usage optimization
 */

interface PlatformConfig {
  name: string;
  baseUrl: string;
  limits: {
    requestsPerMonth: number;
    bandwidthGB: number;
  };
  currentUsage: {
    requests: number;
    bandwidth: number;
  };
  priority: number;
  healthy: boolean;
}

interface ApiResponse<T = any> {
  data: T;
  platform: string;
  cached: boolean;
  responseTime: number;
}

class HybridApiService {
  private platforms: Map<string, PlatformConfig> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private usageTracker: Map<string, { requests: number; bandwidth: number; resetDate: Date }> = new Map();

  constructor() {
    this.initializePlatforms();
    this.startUsageTracking();
  }

  private initializePlatforms(): void {
    // Primary: Supabase Edge Functions
    this.platforms.set('supabase', {
      name: 'Supabase',
      baseUrl: 'https://aompecyfgnakkmldhidg.supabase.co/functions/v1',
      limits: {
        requestsPerMonth: 500000,
        bandwidthGB: 2
      },
      currentUsage: {
        requests: 0,
        bandwidth: 0
      },
      priority: 1,
      healthy: true
    });

    // Secondary: Netlify Functions
    this.platforms.set('netlify', {
      name: 'Netlify',
      baseUrl: '/.netlify/functions',
      limits: {
        requestsPerMonth: 125000,
        bandwidthGB: 100
      },
      currentUsage: {
        requests: 0,
        bandwidth: 0
      },
      priority: 2,
      healthy: true
    });

    // Tertiary: Vercel Functions
    this.platforms.set('vercel', {
      name: 'Vercel',
      baseUrl: 'https://connectouch-blockchain-ai.vercel.app/api',
      limits: {
        requestsPerMonth: 1000000,
        bandwidthGB: 100
      },
      currentUsage: {
        requests: 0,
        bandwidth: 0
      },
      priority: 3,
      healthy: true
    });

    // Fallback: Direct APIs
    this.platforms.set('direct', {
      name: 'Direct APIs',
      baseUrl: 'https://api.coingecko.com/api/v3',
      limits: {
        requestsPerMonth: 10000, // CoinGecko free tier
        bandwidthGB: 10
      },
      currentUsage: {
        requests: 0,
        bandwidth: 0
      },
      priority: 4,
      healthy: true
    });
  }

  private startUsageTracking(): void {
    // Initialize usage tracking for each platform
    this.platforms.forEach((config, platformId) => {
      this.usageTracker.set(platformId, {
        requests: 0,
        bandwidth: 0,
        resetDate: this.getNextMonthStart()
      });
    });

    // Reset usage counters monthly
    setInterval(() => {
      this.resetMonthlyUsage();
    }, 24 * 60 * 60 * 1000); // Check daily
  }

  private getNextMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  private resetMonthlyUsage(): void {
    const now = new Date();
    this.usageTracker.forEach((usage, platformId) => {
      if (now >= usage.resetDate) {
        usage.requests = 0;
        usage.bandwidth = 0;
        usage.resetDate = this.getNextMonthStart();
      }
    });
  }

  private selectOptimalPlatform(endpoint: string): string {
    // Get available platforms sorted by priority
    const availablePlatforms = Array.from(this.platforms.entries())
      .filter(([_, config]) => config.healthy)
      .sort((a, b) => a[1].priority - b[1].priority);

    // Check usage limits and select best platform
    for (const [platformId, config] of availablePlatforms) {
      const usage = this.usageTracker.get(platformId)!;
      
      // Check if platform has capacity
      if (usage.requests < config.limits.requestsPerMonth * 0.9) { // 90% threshold
        return platformId;
      }
    }

    // If all platforms are near limits, use the one with most remaining capacity
    const bestPlatform = availablePlatforms.reduce((best, current) => {
      const bestUsage = this.usageTracker.get(best[0])!;
      const currentUsage = this.usageTracker.get(current[0])!;
      
      const bestRemaining = best[1].limits.requestsPerMonth - bestUsage.requests;
      const currentRemaining = current[1].limits.requestsPerMonth - currentUsage.requests;
      
      return currentRemaining > bestRemaining ? current : best;
    });

    return bestPlatform[0];
  }

  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}_${JSON.stringify(params || {})}`;
  }

  private isValidCache(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;
    
    return Date.now() - cached.timestamp < cached.ttl;
  }

  private updateUsage(platformId: string, responseSize: number): void {
    const usage = this.usageTracker.get(platformId);
    if (usage) {
      usage.requests++;
      usage.bandwidth += responseSize / (1024 * 1024 * 1024); // Convert to GB
    }
  }

  public async request<T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      params?: any;
      body?: any;
      cacheTTL?: number;
      retryAttempts?: number;
    } = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      params,
      body,
      cacheTTL = 300000, // 5 minutes default
      retryAttempts = 3
    } = options;

    const cacheKey = this.getCacheKey(endpoint, { method, params, body });
    
    // Check cache first
    if (this.isValidCache(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return {
        data: cached.data,
        platform: 'cache',
        cached: true,
        responseTime: 0
      };
    }

    let lastError: Error | null = null;
    
    // Try platforms in order of preference
    for (let attempt = 0; attempt < retryAttempts; attempt++) {
      const platformId = this.selectOptimalPlatform(endpoint);
      const platform = this.platforms.get(platformId)!;
      
      try {
        const startTime = Date.now();
        const url = this.buildUrl(platform.baseUrl, endpoint, params);
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Connectouch-Blockchain-AI/2.0.0'
          },
          body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const responseTime = Date.now() - startTime;
        const responseSize = JSON.stringify(data).length;

        // Update usage tracking
        this.updateUsage(platformId, responseSize);

        // Cache successful response
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: cacheTTL
        });

        return {
          data,
          platform: platform.name,
          cached: false,
          responseTime
        };

      } catch (error) {
        lastError = error as Error;
        
        // Mark platform as unhealthy if it fails
        platform.healthy = false;
        
        // Restore health after 5 minutes
        setTimeout(() => {
          platform.healthy = true;
        }, 5 * 60 * 1000);
        
        console.warn(`Platform ${platform.name} failed:`, error);
      }
    }

    throw lastError || new Error('All platforms failed');
  }

  private buildUrl(baseUrl: string, endpoint: string, params?: any): string {
    const url = new URL(endpoint, baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  // Convenience methods for common endpoints
  public async getCryptoPrices(symbols: string[]): Promise<ApiResponse> {
    return this.request('/crypto-prices', {
      params: { symbols: symbols.join(',') },
      cacheTTL: 60000 // 1 minute cache for prices
    });
  }

  public async getHealthCheck(): Promise<ApiResponse> {
    return this.request('/health-check', {
      cacheTTL: 30000 // 30 seconds cache
    });
  }

  public async getNFTCollections(limit: number = 10): Promise<ApiResponse> {
    return this.request('/nft-collections', {
      params: { limit },
      cacheTTL: 300000 // 5 minutes cache
    });
  }

  public async getAIAnalysis(prompt: string): Promise<ApiResponse> {
    return this.request('/ai-analysis', {
      method: 'POST',
      body: { prompt },
      cacheTTL: 0 // No cache for AI responses
    });
  }

  // Usage monitoring
  public getUsageStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    this.platforms.forEach((config, platformId) => {
      const usage = this.usageTracker.get(platformId)!;
      stats[platformId] = {
        platform: config.name,
        requests: {
          used: usage.requests,
          limit: config.limits.requestsPerMonth,
          percentage: (usage.requests / config.limits.requestsPerMonth) * 100
        },
        bandwidth: {
          used: usage.bandwidth,
          limit: config.limits.bandwidthGB,
          percentage: (usage.bandwidth / config.limits.bandwidthGB) * 100
        },
        healthy: config.healthy,
        priority: config.priority
      };
    });
    
    return stats;
  }
}

// Export singleton instance
export const hybridApi = new HybridApiService();
export default hybridApi;
