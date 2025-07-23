/**
 * Centralized Port Configuration
 * Manages all port assignments and prevents conflicts across the platform
 */

import { envConfig } from '@/utils/envValidator';
import { logger } from '@/utils/logger';

export interface PortConfig {
  backend: {
    api: number;
    websocket: number;
    health: number;
  };
  frontend: {
    dev: number;
    preview: number;
  };
  blockchain: {
    hardhat: number;
    ganache: number;
  };
  database: {
    postgres: number;
    redis: number;
  };
  monitoring: {
    metrics: number;
    logs: number;
  };
}

export class PortManager {
  private static instance: PortManager;
  private config: PortConfig;
  private reservedPorts: Set<number>;

  private constructor() {
    this.config = this.buildPortConfiguration();
    this.reservedPorts = new Set();
    this.validatePortConfiguration();
  }

  public static getInstance(): PortManager {
    if (!PortManager.instance) {
      PortManager.instance = new PortManager();
    }
    return PortManager.instance;
  }

  private buildPortConfiguration(): PortConfig {
    return {
      backend: {
        api: parseInt(envConfig.PORT) || 3002,
        websocket: parseInt(process.env.WEBSOCKET_PORT || '3003'),
        health: parseInt(process.env.HEALTH_PORT || '3004')
      },
      frontend: {
        dev: parseInt(process.env.FRONTEND_DEV_PORT || '5173'),
        preview: parseInt(process.env.FRONTEND_PREVIEW_PORT || '4173')
      },
      blockchain: {
        hardhat: parseInt(process.env.HARDHAT_PORT || '8545'),
        ganache: parseInt(process.env.GANACHE_PORT || '7545')
      },
      database: {
        postgres: parseInt(process.env.POSTGRES_PORT || '5432'),
        redis: parseInt(process.env.REDIS_PORT || '6379')
      },
      monitoring: {
        metrics: parseInt(process.env.METRICS_PORT || '9090'),
        logs: parseInt(process.env.LOGS_PORT || '9091')
      }
    };
  }

  private validatePortConfiguration(): void {
    const allPorts: number[] = [];
    const conflicts: string[] = [];

    // Collect all ports
    Object.entries(this.config).forEach(([category, ports]) => {
      Object.entries(ports).forEach(([service, port]) => {
        if (allPorts.includes(port)) {
          conflicts.push(`Port ${port} conflict between services`);
        }
        allPorts.push(port);
        this.reservedPorts.add(port);
      });
    });

    // Check for conflicts
    if (conflicts.length > 0) {
      logger.error('Port configuration conflicts detected:', conflicts);
      throw new Error(`Port conflicts detected: ${conflicts.join(', ')}`);
    }

    // Validate port ranges
    allPorts.forEach(port => {
      if (port < 1024) {
        logger.warn(`Port ${port} is in privileged range (< 1024)`);
      }
      if (port > 65535) {
        throw new Error(`Invalid port ${port}: exceeds maximum port number`);
      }
    });

    logger.info('Port configuration validated successfully', {
      totalPorts: allPorts.length,
      portRange: `${Math.min(...allPorts)} - ${Math.max(...allPorts)}`
    });
  }

  public getConfig(): PortConfig {
    return { ...this.config };
  }

  public getPort(category: keyof PortConfig, service: string): number {
    const categoryPorts = this.config[category] as Record<string, number>;
    const port = categoryPorts[service];
    
    if (!port) {
      throw new Error(`Port not found for ${category}.${service}`);
    }
    
    return port;
  }

  public isPortReserved(port: number): boolean {
    return this.reservedPorts.has(port);
  }

  public getNextAvailablePort(startPort: number = 3000): number {
    let port = startPort;
    while (this.isPortReserved(port) && port < 65535) {
      port++;
    }
    
    if (port >= 65535) {
      throw new Error('No available ports found');
    }
    
    return port;
  }

  public reservePort(port: number, description?: string): boolean {
    if (this.isPortReserved(port)) {
      logger.warn(`Port ${port} is already reserved`);
      return false;
    }
    
    this.reservedPorts.add(port);
    logger.debug(`Port ${port} reserved`, { description });
    return true;
  }

  public releasePort(port: number): boolean {
    if (!this.isPortReserved(port)) {
      logger.warn(`Port ${port} was not reserved`);
      return false;
    }
    
    this.reservedPorts.delete(port);
    logger.debug(`Port ${port} released`);
    return true;
  }

  public async checkPortAvailability(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const net = require('net');
      const server = net.createServer();
      
      server.listen(port, () => {
        server.once('close', () => resolve(true));
        server.close();
      });
      
      server.on('error', () => resolve(false));
    });
  }

  public async findAvailablePort(preferredPort: number): Promise<number> {
    if (await this.checkPortAvailability(preferredPort)) {
      return preferredPort;
    }
    
    // Try nearby ports
    for (let offset = 1; offset <= 100; offset++) {
      const testPort = preferredPort + offset;
      if (testPort <= 65535 && await this.checkPortAvailability(testPort)) {
        logger.info(`Port ${preferredPort} unavailable, using ${testPort} instead`);
        return testPort;
      }
    }
    
    throw new Error(`No available port found near ${preferredPort}`);
  }

  public generatePortSummary(): string {
    const summary = ['🔌 Port Configuration Summary:', ''];
    
    Object.entries(this.config).forEach(([category, ports]) => {
      summary.push(`📂 ${category.toUpperCase()}:`);
      Object.entries(ports).forEach(([service, port]) => {
        summary.push(`   ${service}: ${port}`);
      });
      summary.push('');
    });
    
    return summary.join('\n');
  }

  public getEnvironmentTemplate(): string {
    return `# =============================================================================
# PORT CONFIGURATION
# =============================================================================

# Backend Services
PORT=${this.config.backend.api}
WEBSOCKET_PORT=${this.config.backend.websocket}
HEALTH_PORT=${this.config.backend.health}

# Frontend Development
FRONTEND_DEV_PORT=${this.config.frontend.dev}
FRONTEND_PREVIEW_PORT=${this.config.frontend.preview}

# Blockchain Development
HARDHAT_PORT=${this.config.blockchain.hardhat}
GANACHE_PORT=${this.config.blockchain.ganache}

# Database Services
POSTGRES_PORT=${this.config.database.postgres}
REDIS_PORT=${this.config.database.redis}

# Monitoring Services
METRICS_PORT=${this.config.monitoring.metrics}
LOGS_PORT=${this.config.monitoring.logs}`;
  }

  public async validateAllPorts(): Promise<{
    available: number[];
    unavailable: number[];
    conflicts: string[];
  }> {
    const result = {
      available: [] as number[],
      unavailable: [] as number[],
      conflicts: [] as string[]
    };

    const allPorts = Object.values(this.config).flatMap(category => 
      Object.values(category)
    );

    for (const port of allPorts) {
      if (await this.checkPortAvailability(port)) {
        result.available.push(port);
      } else {
        result.unavailable.push(port);
        result.conflicts.push(`Port ${port} is currently in use`);
      }
    }

    return result;
  }
}

// Export singleton instance
export const portManager = PortManager.getInstance();

// Export commonly used ports for convenience
export const PORTS = {
  BACKEND_API: portManager.getPort('backend', 'api'),
  FRONTEND_DEV: portManager.getPort('frontend', 'dev'),
  WEBSOCKET: portManager.getPort('backend', 'websocket'),
  HARDHAT: portManager.getPort('blockchain', 'hardhat')
} as const;
