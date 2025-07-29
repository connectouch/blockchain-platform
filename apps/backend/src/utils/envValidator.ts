/**
 * Environment Variable Validation Utility
 * Ensures all required environment variables are properly configured
 * and provides secure defaults where appropriate
 */

import { logger } from './logger';

export interface EnvConfig {
  // Required variables
  OPENAI_API_KEY: string;
  NODE_ENV: string;
  PORT: string;

  // Optional but recommended
  DATABASE_URL?: string;
  REDIS_URL?: string;
  JWT_SECRET?: string;
  SESSION_SECRET?: string;

  // Approved external API keys (only 3 services)
  ALCHEMY_API_KEY?: string;
  COINMARKETCAP_API_KEY?: string;

  // Security configuration
  CORS_ORIGIN?: string;
  RATE_LIMIT_WINDOW_MS?: string;
  RATE_LIMIT_MAX_REQUESTS?: string;

  // Port configuration
  WEBSOCKET_PORT?: string;
  HEALTH_PORT?: string;
  FRONTEND_DEV_PORT?: string;
  FRONTEND_PREVIEW_PORT?: string;
  HARDHAT_PORT?: string;
  GANACHE_PORT?: string;
  POSTGRES_PORT?: string;
  REDIS_PORT?: string;
  METRICS_PORT?: string;
  LOGS_PORT?: string;
}

export class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private config: EnvConfig;

  private constructor() {
    this.config = this.validateAndLoadConfig();
  }

  public static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator();
    }
    return EnvironmentValidator.instance;
  }

  private validateAndLoadConfig(): EnvConfig {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required environment variables
    const requiredVars = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT || '3002'
    };

    // Validate required variables
    Object.entries(requiredVars).forEach(([key, value]) => {
      if (!value) {
        errors.push(`Missing required environment variable: ${key}`);
      } else if (key === 'OPENAI_API_KEY' && !this.isValidOpenAIKey(value)) {
        errors.push(`Invalid OpenAI API key format. Must start with 'sk-'`);
      }
    });

    // Validate optional but important variables
    if (!process.env.JWT_SECRET) {
      warnings.push('JWT_SECRET not set - using default (not secure for production)');
    } else if (process.env.JWT_SECRET.length < 32) {
      warnings.push('JWT_SECRET should be at least 32 characters long');
    }

    if (!process.env.SESSION_SECRET) {
      warnings.push('SESSION_SECRET not set - using default (not secure for production)');
    }

    if (!process.env.DATABASE_URL) {
      warnings.push('DATABASE_URL not set - database features will be disabled');
    }

    if (!process.env.REDIS_URL) {
      warnings.push('REDIS_URL not set - caching features will be disabled');
    }

    // Validate approved API keys format
    if (process.env.ALCHEMY_API_KEY && !this.isValidAlchemyKey(process.env.ALCHEMY_API_KEY)) {
      warnings.push('ALCHEMY_API_KEY format appears invalid. Should start with "alcht_"');
    }

    if (process.env.COINMARKETCAP_API_KEY && !this.isValidCoinMarketCapKey(process.env.COINMARKETCAP_API_KEY)) {
      warnings.push('COINMARKETCAP_API_KEY format appears invalid. Should be a valid UUID');
    }

    // Validate port configurations
    const portValidation = this.validatePorts();
    if (portValidation.errors.length > 0) {
      errors.push(...portValidation.errors);
    }
    if (portValidation.warnings.length > 0) {
      warnings.push(...portValidation.warnings);
    }

    // Log validation results
    if (errors.length > 0) {
      logger.error('Environment validation failed:', { errors });
      throw new Error(`Environment validation failed: ${errors.join(', ')}`);
    }

    if (warnings.length > 0) {
      logger.warn('Environment validation warnings:', { warnings });
    }

    logger.info('Environment validation completed successfully');

    return {
      ...requiredVars,
      DATABASE_URL: process.env.DATABASE_URL,
      REDIS_URL: process.env.REDIS_URL,
      JWT_SECRET: process.env.JWT_SECRET || this.generateSecureDefault('jwt'),
      SESSION_SECRET: process.env.SESSION_SECRET || this.generateSecureDefault('session'),

      // Only approved external API keys (3 services)
      ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
      COINMARKETCAP_API_KEY: process.env.COINMARKETCAP_API_KEY,

      CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000',
      RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || '900000',
      RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || '100',

      // Port configuration
      WEBSOCKET_PORT: process.env.WEBSOCKET_PORT || '3003',
      HEALTH_PORT: process.env.HEALTH_PORT || '3004',
      FRONTEND_DEV_PORT: process.env.FRONTEND_DEV_PORT || '5173',
      FRONTEND_PREVIEW_PORT: process.env.FRONTEND_PREVIEW_PORT || '4173',
      HARDHAT_PORT: process.env.HARDHAT_PORT || '8545',
      GANACHE_PORT: process.env.GANACHE_PORT || '7545',
      POSTGRES_PORT: process.env.POSTGRES_PORT || '5432',
      REDIS_PORT: process.env.REDIS_PORT || '6379',
      METRICS_PORT: process.env.METRICS_PORT || '9090',
      LOGS_PORT: process.env.LOGS_PORT || '9091'
    } as EnvConfig;
  }

  private isValidOpenAIKey(key: string): boolean {
    return key.startsWith('sk-') && key.length > 20;
  }

  private isValidAlchemyKey(key: string): boolean {
    return key.startsWith('alcht_') && key.length > 20;
  }

  private isValidCoinMarketCapKey(key: string): boolean {
    // CoinMarketCap API keys are typically UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(key);
  }

  private validatePorts(): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const usedPorts = new Set<number>();

    const portConfigs = [
      { name: 'PORT', value: process.env.PORT || '3002' },
      { name: 'WEBSOCKET_PORT', value: process.env.WEBSOCKET_PORT || '3003' },
      { name: 'HEALTH_PORT', value: process.env.HEALTH_PORT || '3004' },
      { name: 'FRONTEND_DEV_PORT', value: process.env.FRONTEND_DEV_PORT || '5173' },
      { name: 'FRONTEND_PREVIEW_PORT', value: process.env.FRONTEND_PREVIEW_PORT || '4173' },
      { name: 'HARDHAT_PORT', value: process.env.HARDHAT_PORT || '8545' },
      { name: 'GANACHE_PORT', value: process.env.GANACHE_PORT || '7545' },
      { name: 'POSTGRES_PORT', value: process.env.POSTGRES_PORT || '5432' },
      { name: 'REDIS_PORT', value: process.env.REDIS_PORT || '6379' },
      { name: 'METRICS_PORT', value: process.env.METRICS_PORT || '9090' },
      { name: 'LOGS_PORT', value: process.env.LOGS_PORT || '9091' }
    ];

    portConfigs.forEach(({ name, value }) => {
      const port = parseInt(value);

      // Validate port number
      if (isNaN(port) || port < 1 || port > 65535) {
        errors.push(`Invalid port for ${name}: ${value}. Must be between 1 and 65535`);
        return;
      }

      // Check for privileged ports
      if (port < 1024) {
        warnings.push(`${name} uses privileged port ${port} (< 1024)`);
      }

      // Check for port conflicts
      if (usedPorts.has(port)) {
        errors.push(`Port conflict: ${port} is used by multiple services`);
      } else {
        usedPorts.add(port);
      }
    });

    return { errors, warnings };
  }

  private generateSecureDefault(type: string): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const warning = `INSECURE_DEFAULT_${type.toUpperCase()}_${timestamp}_${random}`;

    logger.warn(`Generated insecure default for ${type} - please set proper value in production`);
    return warning;
  }

  public getConfig(): EnvConfig {
    return { ...this.config };
  }

  public get(key: keyof EnvConfig): string | undefined {
    return this.config[key];
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public hasDatabase(): boolean {
    return !!this.config.DATABASE_URL;
  }

  public hasRedis(): boolean {
    return !!this.config.REDIS_URL;
  }

  public hasAlchemy(): boolean {
    return !!this.config.ALCHEMY_API_KEY;
  }

  public validateProductionReadiness(): { ready: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!this.isProduction()) {
      return { ready: true, issues: [] }; // Only validate for production
    }

    if (!this.config.DATABASE_URL) {
      issues.push('DATABASE_URL is required for production');
    }

    if (!this.config.REDIS_URL) {
      issues.push('REDIS_URL is required for production');
    }

    if (this.config.JWT_SECRET?.includes('INSECURE_DEFAULT')) {
      issues.push('JWT_SECRET must be set to a secure value for production');
    }

    if (this.config.SESSION_SECRET?.includes('INSECURE_DEFAULT')) {
      issues.push('SESSION_SECRET must be set to a secure value for production');
    }

    if (!this.config.ALCHEMY_API_KEY) {
      issues.push('ALCHEMY_API_KEY is recommended for production');
    }

    return {
      ready: issues.length === 0,
      issues
    };
  }
}

// Export singleton instance
export const envValidator = EnvironmentValidator.getInstance();
export const envConfig = envValidator.getConfig();
