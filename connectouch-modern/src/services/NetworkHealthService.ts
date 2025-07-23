/**
 * Network Health Service
 * Monitors and manages all network connections across the platform
 */

export interface ServiceHealth {
  name: string
  url: string
  status: 'healthy' | 'unhealthy' | 'unknown'
  responseTime?: number
  lastCheck: Date
  error?: string
}

export interface NetworkStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy'
  services: ServiceHealth[]
  summary: {
    healthy: number
    unhealthy: number
    total: number
  }
}

class NetworkHealthService {
  private static instance: NetworkHealthService
  private services: Map<string, ServiceHealth> = new Map()
  private checkInterval: number = 30000 // 30 seconds
  private intervalId?: NodeJS.Timeout | undefined

  private constructor() {
    this.initializeServices()
    this.startHealthChecks()
  }

  public static getInstance(): NetworkHealthService {
    if (!NetworkHealthService.instance) {
      NetworkHealthService.instance = new NetworkHealthService()
    }
    return NetworkHealthService.instance
  }

  private initializeServices() {
    // Define all services to monitor - using proxy endpoints for local services
    const servicesToMonitor = [
      {
        name: 'Quick API Server',
        url: '/health' // Use proxy endpoint
      },
      {
        name: 'AI Backend Server',
        url: '/api/v2/ai/health' // Use proxy endpoint
      },
      {
        name: 'OpenAI API',
        url: 'https://api.openai.com/v1/models'
      },
      {
        name: 'CoinGecko API',
        url: 'https://api.coingecko.com/api/v3/ping'
      }
    ]

    servicesToMonitor.forEach(service => {
      this.services.set(service.name, {
        name: service.name,
        url: service.url,
        status: 'unknown',
        lastCheck: new Date()
      })
    })

    console.log('🏥 Network Health Service initialized with services:', Array.from(this.services.keys()))
  }

  private async checkServiceHealth(service: ServiceHealth): Promise<ServiceHealth> {
    const startTime = Date.now()
    
    try {
      console.log(`🔍 Checking health of ${service.name}...`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(service.url, {
        method: 'GET',
        signal: controller.signal,
        headers: service.name === 'OpenAI API' ? {
          'Authorization': 'Bearer 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'
        } : {}
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      if (response.ok) {
        console.log(`✅ ${service.name} is healthy (${responseTime}ms)`)
        return {
          ...service,
          status: 'healthy',
          responseTime,
          lastCheck: new Date()
        }
      } else {
        console.warn(`⚠️ ${service.name} returned ${response.status}`)
        return {
          ...service,
          status: 'unhealthy',
          responseTime,
          lastCheck: new Date(),
          error: `HTTP ${response.status}`
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      console.error(`❌ ${service.name} health check failed:`, errorMessage)
      
      return {
        ...service,
        status: 'unhealthy',
        responseTime,
        lastCheck: new Date(),
        error: errorMessage
      }
    }
  }

  public async checkAllServices(): Promise<NetworkStatus> {
    console.log('🏥 Running comprehensive health check...')
    
    const healthChecks = Array.from(this.services.values()).map(service =>
      this.checkServiceHealth(service)
    )

    const results = await Promise.all(healthChecks)
    
    // Update services map
    results.forEach(result => {
      this.services.set(result.name, result)
    })

    // Calculate overall status
    const healthy = results.filter(s => s.status === 'healthy').length
    const unhealthy = results.filter(s => s.status === 'unhealthy').length
    const total = results.length

    let overall: 'healthy' | 'degraded' | 'unhealthy'
    if (unhealthy === 0) {
      overall = 'healthy'
    } else if (healthy > unhealthy) {
      overall = 'degraded'
    } else {
      overall = 'unhealthy'
    }

    const status: NetworkStatus = {
      overall,
      services: results,
      summary: { healthy, unhealthy, total }
    }

    console.log(`🏥 Health check complete: ${overall} (${healthy}/${total} healthy)`)
    return status
  }

  public getServiceStatus(serviceName: string): ServiceHealth | undefined {
    return this.services.get(serviceName)
  }

  public getAllServices(): ServiceHealth[] {
    return Array.from(this.services.values())
  }

  private startHealthChecks() {
    // Run initial check
    this.checkAllServices()

    // Set up periodic checks
    this.intervalId = setInterval(() => {
      this.checkAllServices()
    }, this.checkInterval)

    console.log(`🏥 Started periodic health checks every ${this.checkInterval / 1000} seconds`)
  }

  public stopHealthChecks() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
      console.log('🏥 Stopped periodic health checks')
    }
  }

  // Test specific service
  public async testService(serviceName: string): Promise<ServiceHealth | null> {
    const service = this.services.get(serviceName)
    if (!service) {
      console.error(`❌ Service ${serviceName} not found`)
      return null
    }

    const result = await this.checkServiceHealth(service)
    this.services.set(serviceName, result)
    return result
  }
}

// Export singleton instance
export const networkHealthService = NetworkHealthService.getInstance()

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).networkHealth = networkHealthService
  (window as any).checkNetworkHealth = () => networkHealthService.checkAllServices()
  (window as any).testService = (name: string) => networkHealthService.testService(name)
}

export default NetworkHealthService
