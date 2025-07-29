const axios = require('axios');
const EventEmitter = require('events');

/**
 * Network Health Monitoring Service
 * Monitors backend connectivity, API health, and provides fallback mechanisms
 */
class NetworkHealthService extends EventEmitter {
  constructor() {
    super();
    this.isHealthy = false;
    this.lastHealthCheck = null;
    this.healthCheckInterval = null;
    this.retryAttempts = 0;
    this.maxRetryAttempts = 5;
    this.healthCheckIntervalMs = 30000; // 30 seconds
    this.services = new Map();
    
    // Initialize service monitoring
    this.initializeServices();
    this.startHealthMonitoring();
  }

  initializeServices() {
    // Define services to monitor
    this.services.set('backend', {
      name: 'Backend Server',
      url: 'http://localhost:3002/health',
      timeout: 5000,
      healthy: false,
      lastCheck: null,
      errorCount: 0
    });

    this.services.set('openai', {
      name: 'OpenAI API',
      url: 'https://api.openai.com/v1/models',
      timeout: 10000,
      healthy: false,
      lastCheck: null,
      errorCount: 0,
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    this.services.set('coinmarketcap', {
      name: 'CoinMarketCap API',
      url: 'https://pro-api.coinmarketcap.com/v1/key/info',
      timeout: 8000,
      healthy: false,
      lastCheck: null,
      errorCount: 0,
      headers: {
        'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY
      }
    });

    this.services.set('alchemy', {
      name: 'Alchemy API',
      url: 'https://eth-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY,
      timeout: 8000,
      healthy: false,
      lastCheck: null,
      errorCount: 0,
      method: 'POST',
      data: {
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      }
    });

    this.services.set('defillama', {
      name: 'DeFiLlama API',
      url: 'https://api.llama.fi/protocols',
      timeout: 8000,
      healthy: false,
      lastCheck: null,
      errorCount: 0
    });
  }

  async startHealthMonitoring() {
    console.log('🏥 Starting network health monitoring...');
    
    // Initial health check
    await this.performHealthCheck();
    
    // Set up periodic health checks
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, this.healthCheckIntervalMs);
  }

  async performHealthCheck() {
    const startTime = Date.now();
    let healthyServices = 0;
    const totalServices = this.services.size;

    console.log('🔍 Performing network health check...');

    for (const [serviceId, service] of this.services) {
      try {
        const response = await axios.get(service.url, {
          timeout: service.timeout,
          headers: service.headers || {},
          validateStatus: (status) => status < 500 // Accept 4xx as "healthy" but not 5xx
        });

        service.healthy = true;
        service.lastCheck = new Date();
        service.errorCount = 0;
        healthyServices++;

        console.log(`✅ ${service.name}: Healthy (${response.status})`);
      } catch (error) {
        service.healthy = false;
        service.lastCheck = new Date();
        service.errorCount++;

        console.log(`❌ ${service.name}: Unhealthy - ${error.message}`);
        
        // Emit service-specific error event
        this.emit('serviceError', {
          serviceId,
          serviceName: service.name,
          error: error.message,
          errorCount: service.errorCount
        });
      }
    }

    const healthPercentage = (healthyServices / totalServices) * 100;
    const previousHealth = this.isHealthy;
    this.isHealthy = healthPercentage >= 50; // Consider healthy if at least 50% of services are up
    this.lastHealthCheck = new Date();

    const healthCheckDuration = Date.now() - startTime;

    // Emit health status events
    if (this.isHealthy !== previousHealth) {
      if (this.isHealthy) {
        console.log('🟢 Network health restored');
        this.retryAttempts = 0;
        this.emit('healthRestored', {
          healthyServices,
          totalServices,
          healthPercentage,
          duration: healthCheckDuration
        });
      } else {
        console.log('🔴 Network health degraded');
        this.retryAttempts++;
        this.emit('healthDegraded', {
          healthyServices,
          totalServices,
          healthPercentage,
          retryAttempts: this.retryAttempts,
          duration: healthCheckDuration
        });
      }
    }

    // Emit general health update
    this.emit('healthUpdate', {
      isHealthy: this.isHealthy,
      healthyServices,
      totalServices,
      healthPercentage,
      services: Array.from(this.services.entries()).map(([id, service]) => ({
        id,
        name: service.name,
        healthy: service.healthy,
        lastCheck: service.lastCheck,
        errorCount: service.errorCount
      })),
      duration: healthCheckDuration
    });

    return {
      isHealthy: this.isHealthy,
      healthyServices,
      totalServices,
      healthPercentage,
      lastCheck: this.lastHealthCheck
    };
  }

  getHealthStatus() {
    return {
      isHealthy: this.isHealthy,
      lastHealthCheck: this.lastHealthCheck,
      retryAttempts: this.retryAttempts,
      services: Array.from(this.services.entries()).map(([id, service]) => ({
        id,
        name: service.name,
        healthy: service.healthy,
        lastCheck: service.lastCheck,
        errorCount: service.errorCount
      }))
    };
  }

  getServiceStatus(serviceId) {
    return this.services.get(serviceId) || null;
  }

  isServiceHealthy(serviceId) {
    const service = this.services.get(serviceId);
    return service ? service.healthy : false;
  }

  async testConnection(url, timeout = 5000) {
    try {
      const response = await axios.get(url, { timeout });
      return {
        success: true,
        status: response.status,
        responseTime: response.headers['x-response-time'] || 'unknown'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  stop() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('🛑 Network health monitoring stopped');
    }
  }

  // Adaptive behavior based on network health
  getRecommendedPollingInterval() {
    if (!this.isHealthy) {
      return 30000; // 30 seconds when unhealthy
    }
    
    const healthyServices = Array.from(this.services.values()).filter(s => s.healthy).length;
    const healthPercentage = (healthyServices / this.services.size) * 100;
    
    if (healthPercentage >= 90) {
      return 8000; // 8 seconds when very healthy
    } else if (healthPercentage >= 70) {
      return 15000; // 15 seconds when moderately healthy
    } else {
      return 25000; // 25 seconds when partially healthy
    }
  }

  shouldUseOfflineMode() {
    return !this.isHealthy && this.retryAttempts >= this.maxRetryAttempts;
  }
}

// Create singleton instance
const networkHealthService = new NetworkHealthService();

module.exports = networkHealthService;
