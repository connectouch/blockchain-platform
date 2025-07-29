import { EventEmitter } from 'events';

interface ServiceHealth {
  name: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'checking' | 'reconnecting';
  lastCheck: Date | null;
  lastSuccess: Date | null;
  errorCount: number;
  responseTime: number;
  retryCount: number;
  maxRetries: number;
}

interface ConnectionConfig {
  checkInterval: number; // milliseconds
  timeout: number; // milliseconds
  maxRetries: number;
  retryDelay: number; // milliseconds
  exponentialBackoff: boolean;
}

class ConnectionHealthService extends EventEmitter {
  private services: Map<string, ServiceHealth> = new Map();
  private config: ConnectionConfig;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  constructor(config: Partial<ConnectionConfig> = {}) {
    super();
    this.config = {
      checkInterval: 60000, // 60 seconds (reduced frequency to avoid rate limits)
      timeout: 10000, // 10 seconds
      maxRetries: 3,
      retryDelay: 5000, // 5 seconds (increased delay)
      exponentialBackoff: true,
      ...config
    };

    this.initializeServices();
  }

  private initializeServices() {
    // Netlify Functions - Primary endpoints (working)
    this.addService('system-health', '/api/health-check');
    this.addService('price-data-api', '/api/crypto-prices');
    this.addService('ai-services', '/api/nft-collections');
  }

  private addService(name: string, url: string) {
    this.services.set(name, {
      name,
      url,
      status: 'checking',
      lastCheck: null,
      lastSuccess: null,
      errorCount: 0,
      responseTime: 0,
      retryCount: 0,
      maxRetries: this.config.maxRetries
    });
  }

  public startMonitoring() {
    if (this.isMonitoring) return;

    console.log('🔍 Starting connection health monitoring...');
    this.isMonitoring = true;

    // Initial health check
    this.performHealthChecks();

    // Set up periodic health checks
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.config.checkInterval);

    this.emit('monitoring-started');
  }

  public stopMonitoring() {
    if (!this.isMonitoring) return;

    console.log('⏹️ Stopping connection health monitoring...');
    this.isMonitoring = false;

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.emit('monitoring-stopped');
  }

  private async performHealthChecks() {
    console.log('🔍 Performing health checks for all services...');

    const promises = Array.from(this.services.entries()).map(([name, service]) =>
      this.checkServiceHealth(name, service)
    );

    await Promise.allSettled(promises);
    this.emitHealthReport();
  }

  private async checkServiceHealth(name: string, service: ServiceHealth): Promise<void> {
    const startTime = Date.now();
    service.status = 'checking';
    service.lastCheck = new Date();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(service.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      service.responseTime = responseTime;

      if (response.ok) {
        // Service is healthy
        service.status = 'healthy';
        service.lastSuccess = new Date();
        service.errorCount = 0;
        service.retryCount = 0;

        console.log(`✅ ${name}: Healthy (${responseTime}ms)`);
        this.emit('service-healthy', { name, service });
      } else {
        // For Supabase functions, treat 404 as degraded (functions not deployed yet)
        if (response.status === 404 && service.url.includes('supabase.co')) {
          service.status = 'degraded';
          console.log(`⚠️ ${name}: Degraded - Function not deployed yet`);
          this.emit('service-degraded', { name, service });
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      // For Supabase functions, treat connection errors as degraded (functions not deployed yet)
      if (service.url.includes('supabase.co')) {
        service.status = 'degraded';
        service.errorCount++;
        console.log(`⚠️ ${name}: Degraded - Function not deployed yet`);
        this.emit('service-degraded', { name, service });
      } else {
        // Service is unhealthy
        service.status = 'unhealthy';
        service.errorCount++;

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`❌ ${name}: Unhealthy - ${errorMessage}`);
      }

      this.emit('service-unhealthy', { name, service, error: errorMessage });

      // Attempt reconnection if within retry limits
      if (service.retryCount < service.maxRetries) {
        await this.attemptReconnection(name, service);
      }
    }
  }

  private async attemptReconnection(name: string, service: ServiceHealth): Promise<void> {
    service.status = 'reconnecting';
    service.retryCount++;

    const delay = this.config.exponentialBackoff 
      ? this.config.retryDelay * Math.pow(2, service.retryCount - 1)
      : this.config.retryDelay;

    console.log(`🔄 ${name}: Attempting reconnection (${service.retryCount}/${service.maxRetries}) in ${delay}ms...`);
    
    this.emit('service-reconnecting', { name, service, delay });

    await new Promise(resolve => setTimeout(resolve, delay));

    // Retry the health check
    await this.checkServiceHealth(name, service);
  }

  private emitHealthReport() {
    const healthReport = {
      timestamp: new Date(),
      services: Array.from(this.services.entries()).map(([name, service]) => ({
        name,
        status: service.status,
        responseTime: service.responseTime,
        errorCount: service.errorCount,
        lastSuccess: service.lastSuccess
      })),
      overallHealth: this.getOverallHealth()
    };

    this.emit('health-report', healthReport);
  }

  public getOverallHealth(): 'healthy' | 'degraded' | 'unhealthy' {
    const services = Array.from(this.services.values());
    const healthyCount = services.filter(s => s.status === 'healthy').length;
    const totalCount = services.length;

    if (healthyCount === totalCount) return 'healthy';
    if (healthyCount >= totalCount * 0.7) return 'degraded';
    return 'unhealthy';
  }

  public getServiceStatus(name: string): ServiceHealth | null {
    return this.services.get(name) || null;
  }

  public getAllServices(): ServiceHealth[] {
    return Array.from(this.services.values());
  }

  public forceReconnectAll(): void {
    console.log('🔄 Force reconnecting all services...');
    
    this.services.forEach(service => {
      service.retryCount = 0;
      service.errorCount = 0;
    });

    this.performHealthChecks();
  }

  public forceReconnectService(name: string): void {
    const service = this.services.get(name);
    if (!service) return;

    console.log(`🔄 Force reconnecting ${name}...`);
    service.retryCount = 0;
    service.errorCount = 0;
    
    this.checkServiceHealth(name, service);
  }
}

// Singleton instance
export const connectionHealthService = new ConnectionHealthService({
  checkInterval: 60000, // Check every 60 seconds (reduced to avoid rate limits)
  timeout: 10000, // 10 second timeout
  maxRetries: 3, // Try 3 times before giving up (reduced)
  retryDelay: 5000, // Start with 5 second delay (increased)
  exponentialBackoff: true // Increase delay exponentially
});

export default ConnectionHealthService;
