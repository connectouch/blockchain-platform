/**
 * Comprehensive Monitoring & Observability Service
 * Provides metrics collection, alerting, and system health monitoring
 */

import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { memoryOptimizer } from './MemoryOptimizer';
import { cacheService } from './CacheService';
import { dbManager } from '../config/database';

export interface SystemMetrics {
  timestamp: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    heapUsedPercentage: number;
    external: number;
  };
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  database: {
    connected: boolean;
    queryCount: number;
    slowQueries: number;
    averageResponseTime: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
  };
  api: {
    totalRequests: number;
    errorRate: number;
    averageResponseTime: number;
    activeConnections: number;
  };
  websocket: {
    connections: number;
    messagesPerSecond: number;
    errors: number;
  };
}

export interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  resolved: boolean;
  metadata?: any;
}

export interface MonitoringConfig {
  metricsInterval: number;
  alertingEnabled: boolean;
  retentionPeriod: number; // hours
  thresholds: {
    memory: {
      warning: number; // percentage
      critical: number; // percentage
    };
    cpu: {
      warning: number; // percentage
      critical: number; // percentage
    };
    errorRate: {
      warning: number; // percentage
      critical: number; // percentage
    };
    responseTime: {
      warning: number; // milliseconds
      critical: number; // milliseconds
    };
  };
}

export class MonitoringService extends EventEmitter {
  private config: MonitoringConfig;
  private metrics: SystemMetrics[] = [];
  private alerts: Alert[] = [];
  private metricsInterval: NodeJS.Timeout | null = null;
  private apiMetrics = {
    totalRequests: 0,
    totalErrors: 0,
    totalResponseTime: 0,
    activeConnections: 0
  };
  private wsMetrics = {
    connections: 0,
    messagesPerSecond: 0,
    errors: 0,
    lastMessageCount: 0
  };

  constructor(config: Partial<MonitoringConfig> = {}) {
    super();
    
    this.config = {
      metricsInterval: 30000, // 30 seconds
      alertingEnabled: true,
      retentionPeriod: 24, // 24 hours
      thresholds: {
        memory: {
          warning: 70,
          critical: 85
        },
        cpu: {
          warning: 70,
          critical: 85
        },
        errorRate: {
          warning: 5,
          critical: 10
        },
        responseTime: {
          warning: 1000,
          critical: 2000
        }
      },
      ...config
    };

    this.startMetricsCollection();
    this.setupEventListeners();
    
    logger.info('MonitoringService initialized', {
      config: this.config
    });
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.metricsInterval);
  }

  /**
   * Setup event listeners for various system components
   */
  private setupEventListeners(): void {
    // Memory optimizer events
    memoryOptimizer.on('highMemory', (stats) => {
      this.createAlert('warning', 'High Memory Usage', 
        `Memory usage is high: ${stats.heapUsedPercentage.toFixed(2)}%`, 
        'memory', stats);
    });

    memoryOptimizer.on('criticalMemory', (stats) => {
      this.createAlert('critical', 'Critical Memory Usage', 
        `Memory usage is critical: ${stats.heapUsedPercentage.toFixed(2)}%`, 
        'memory', stats);
    });

    memoryOptimizer.on('memoryLeak', (data) => {
      this.createAlert('error', 'Memory Leak Detected', 
        'Potential memory leak detected in the application', 
        'memory', data);
    });
  }

  /**
   * Collect system metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const memoryStats = memoryOptimizer.getStats();
      const cacheStats = cacheService.getStats();
      const dbHealth = await dbManager.healthCheck();

      const metrics: SystemMetrics = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          rss: memoryStats.rss,
          heapTotal: memoryStats.heapTotal,
          heapUsed: memoryStats.heapUsed,
          heapUsedPercentage: memoryStats.heapUsedPercentage,
          external: memoryStats.external
        },
        cpu: {
          usage: this.getCPUUsage(),
          loadAverage: (process as any).loadavg ? (process as any).loadavg() : [0, 0, 0]
        },
        database: {
          connected: dbHealth.overall === 'healthy',
          queryCount: 0, // Would be tracked by query optimizer
          slowQueries: 0,
          averageResponseTime: 0
        },
        cache: {
          hits: cacheStats.hits,
          misses: cacheStats.misses,
          hitRate: cacheStats.hitRate,
          size: (cacheStats as any).cacheSize || 0
        },
        api: {
          totalRequests: this.apiMetrics.totalRequests,
          errorRate: this.calculateErrorRate(),
          averageResponseTime: this.calculateAverageResponseTime(),
          activeConnections: this.apiMetrics.activeConnections
        },
        websocket: {
          connections: this.wsMetrics.connections,
          messagesPerSecond: this.wsMetrics.messagesPerSecond,
          errors: this.wsMetrics.errors
        }
      };

      this.metrics.push(metrics);
      this.cleanupOldMetrics();
      this.checkThresholds(metrics);
      
      this.emit('metrics', metrics);

      logger.debug('Metrics collected', {
        memoryUsage: `${metrics.memory.heapUsedPercentage.toFixed(2)}%`,
        cacheHitRate: `${metrics.cache.hitRate.toFixed(2)}%`,
        apiRequests: metrics.api.totalRequests
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to collect metrics', { error: errorMessage });
      this.createAlert('error', 'Metrics Collection Failed',
        'Failed to collect system metrics', 'monitoring', { error: errorMessage });
    }
  }

  /**
   * Get CPU usage percentage
   */
  private getCPUUsage(): number {
    const cpus = require('os').cpus();
    if (!cpus || cpus.length === 0) return 0;

    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu: any) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    
    return 100 - ~~(100 * idle / total);
  }

  /**
   * Calculate error rate percentage
   */
  private calculateErrorRate(): number {
    if (this.apiMetrics.totalRequests === 0) return 0;
    return (this.apiMetrics.totalErrors / this.apiMetrics.totalRequests) * 100;
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(): number {
    if (this.apiMetrics.totalRequests === 0) return 0;
    return this.apiMetrics.totalResponseTime / this.apiMetrics.totalRequests;
  }

  /**
   * Check metrics against thresholds and create alerts
   */
  private checkThresholds(metrics: SystemMetrics): void {
    if (!this.config.alertingEnabled) return;

    // Memory thresholds
    if (metrics.memory.heapUsedPercentage > this.config.thresholds.memory.critical) {
      this.createAlert('critical', 'Critical Memory Usage', 
        `Memory usage: ${metrics.memory.heapUsedPercentage.toFixed(2)}%`, 
        'memory', metrics.memory);
    } else if (metrics.memory.heapUsedPercentage > this.config.thresholds.memory.warning) {
      this.createAlert('warning', 'High Memory Usage', 
        `Memory usage: ${metrics.memory.heapUsedPercentage.toFixed(2)}%`, 
        'memory', metrics.memory);
    }

    // CPU thresholds
    if (metrics.cpu.usage > this.config.thresholds.cpu.critical) {
      this.createAlert('critical', 'Critical CPU Usage', 
        `CPU usage: ${metrics.cpu.usage.toFixed(2)}%`, 
        'cpu', metrics.cpu);
    } else if (metrics.cpu.usage > this.config.thresholds.cpu.warning) {
      this.createAlert('warning', 'High CPU Usage', 
        `CPU usage: ${metrics.cpu.usage.toFixed(2)}%`, 
        'cpu', metrics.cpu);
    }

    // Error rate thresholds
    if (metrics.api.errorRate > this.config.thresholds.errorRate.critical) {
      this.createAlert('critical', 'Critical Error Rate', 
        `Error rate: ${metrics.api.errorRate.toFixed(2)}%`, 
        'api', metrics.api);
    } else if (metrics.api.errorRate > this.config.thresholds.errorRate.warning) {
      this.createAlert('warning', 'High Error Rate', 
        `Error rate: ${metrics.api.errorRate.toFixed(2)}%`, 
        'api', metrics.api);
    }

    // Response time thresholds
    if (metrics.api.averageResponseTime > this.config.thresholds.responseTime.critical) {
      this.createAlert('critical', 'Critical Response Time', 
        `Average response time: ${metrics.api.averageResponseTime.toFixed(2)}ms`, 
        'api', metrics.api);
    } else if (metrics.api.averageResponseTime > this.config.thresholds.responseTime.warning) {
      this.createAlert('warning', 'High Response Time', 
        `Average response time: ${metrics.api.averageResponseTime.toFixed(2)}ms`, 
        'api', metrics.api);
    }
  }

  /**
   * Create an alert
   */
  private createAlert(level: Alert['level'], title: string, message: string, source: string, metadata?: any): void {
    const alert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      level,
      title,
      message,
      timestamp: new Date().toISOString(),
      source,
      resolved: false,
      metadata
    };

    this.alerts.push(alert);
    this.emit('alert', alert);

    logger[level === 'info' ? 'info' : level === 'warning' ? 'warn' : 'error']('Alert created', {
      id: alert.id,
      level: alert.level,
      title: alert.title,
      source: alert.source
    });
  }

  /**
   * Clean up old metrics
   */
  private cleanupOldMetrics(): void {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - this.config.retentionPeriod);

    this.metrics = this.metrics.filter(metric => 
      new Date(metric.timestamp) > cutoffTime
    );
  }

  /**
   * Track API request
   */
  public trackAPIRequest(responseTime: number, isError: boolean = false): void {
    this.apiMetrics.totalRequests++;
    this.apiMetrics.totalResponseTime += responseTime;
    
    if (isError) {
      this.apiMetrics.totalErrors++;
    }
  }

  /**
   * Track WebSocket metrics
   */
  public trackWebSocketConnection(connected: boolean): void {
    if (connected) {
      this.wsMetrics.connections++;
    } else {
      this.wsMetrics.connections = Math.max(0, this.wsMetrics.connections - 1);
    }
  }

  public trackWebSocketMessage(): void {
    this.wsMetrics.lastMessageCount++;
  }

  public trackWebSocketError(): void {
    this.wsMetrics.errors++;
  }

  /**
   * Get current metrics
   */
  public getCurrentMetrics(): SystemMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Get metrics history
   */
  public getMetricsHistory(hours: number = 1): SystemMetrics[] {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    return this.metrics.filter(metric => 
      new Date(metric.timestamp) > cutoffTime
    );
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Get all alerts
   */
  public getAllAlerts(limit: number = 100): Alert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Resolve an alert
   */
  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.emit('alertResolved', alert);
      logger.info('Alert resolved', { alertId, title: alert.title });
      return true;
    }
    return false;
  }

  /**
   * Get system health summary
   */
  public getHealthSummary(): any {
    const currentMetrics = this.getCurrentMetrics();
    const activeAlerts = this.getActiveAlerts();
    
    if (!currentMetrics) {
      return { status: 'unknown', message: 'No metrics available' };
    }

    const criticalAlerts = activeAlerts.filter(a => a.level === 'critical');
    const warningAlerts = activeAlerts.filter(a => a.level === 'warning');

    let status = 'healthy';
    let message = 'All systems operational';

    if (criticalAlerts.length > 0) {
      status = 'critical';
      message = `${criticalAlerts.length} critical alert(s) active`;
    } else if (warningAlerts.length > 0) {
      status = 'warning';
      message = `${warningAlerts.length} warning(s) active`;
    }

    return {
      status,
      message,
      metrics: currentMetrics,
      alerts: {
        total: activeAlerts.length,
        critical: criticalAlerts.length,
        warning: warningAlerts.length,
        error: activeAlerts.filter(a => a.level === 'error').length,
        info: activeAlerts.filter(a => a.level === 'info').length
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Shutdown monitoring service
   */
  public shutdown(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    this.removeAllListeners();
    logger.info('MonitoringService shutdown complete');
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();
