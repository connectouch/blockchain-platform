/**
 * Prefetch Service - Preloads data for optimal performance
 * Implements background data fetching and intelligent caching
 */

import { logger } from '../utils/logger';
import RealDataService from './RealDataService';
import BlockchainDataService from './BlockchainDataService';
import { CacheManager } from '../config/database';

interface PrefetchJob {
  name: string;
  interval: number; // in milliseconds
  lastRun: number;
  isRunning: boolean;
  priority: 'high' | 'medium' | 'low';
  retryCount: number;
  maxRetries: number;
}

export class PrefetchService {
  private realDataService: RealDataService;
  private blockchainService: BlockchainDataService;
  private jobs: Map<string, PrefetchJob> = new Map();
  private isActive: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.realDataService = new RealDataService();
    this.blockchainService = new BlockchainDataService();
    this.initializeJobs();
    logger.info('PrefetchService initialized with intelligent caching');
  }

  /**
   * Initialize prefetch jobs with different priorities and intervals
   */
  private initializeJobs(): void {
    // High priority: Real-time data (every 30 seconds)
    this.jobs.set('crypto_prices', {
      name: 'Cryptocurrency Prices',
      interval: 30000, // 30 seconds
      lastRun: 0,
      isRunning: false,
      priority: 'high',
      retryCount: 0,
      maxRetries: 3
    });

    // Medium priority: Market data (every 2 minutes)
    this.jobs.set('market_overview', {
      name: 'Market Overview',
      interval: 120000, // 2 minutes
      lastRun: 0,
      isRunning: false,
      priority: 'medium',
      retryCount: 0,
      maxRetries: 2
    });

    // Medium priority: DeFi protocols (every 5 minutes)
    this.jobs.set('defi_protocols', {
      name: 'DeFi Protocols',
      interval: 300000, // 5 minutes
      lastRun: 0,
      isRunning: false,
      priority: 'medium',
      retryCount: 0,
      maxRetries: 2
    });

    // Low priority: NFT collections (every 10 minutes)
    this.jobs.set('nft_collections', {
      name: 'NFT Collections',
      interval: 600000, // 10 minutes
      lastRun: 0,
      isRunning: false,
      priority: 'low',
      retryCount: 0,
      maxRetries: 1
    });

    // Low priority: Blockchain networks (every 15 minutes)
    this.jobs.set('blockchain_networks', {
      name: 'Blockchain Networks',
      interval: 900000, // 15 minutes
      lastRun: 0,
      isRunning: false,
      priority: 'low',
      retryCount: 0,
      maxRetries: 1
    });
  }

  /**
   * Start the prefetch service
   */
  public start(): void {
    if (this.isActive) {
      logger.warn('PrefetchService is already running');
      return;
    }

    this.isActive = true;
    
    // Run initial prefetch for all jobs
    this.runInitialPrefetch();
    
    // Set up periodic checking (every 10 seconds)
    this.intervalId = setInterval(() => {
      this.checkAndRunJobs();
    }, 10000);

    logger.info('PrefetchService started with background data fetching');
  }

  /**
   * Stop the prefetch service
   */
  public stop(): void {
    this.isActive = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    logger.info('PrefetchService stopped');
  }

  /**
   * Run initial prefetch for critical data
   */
  private async runInitialPrefetch(): Promise<void> {
    logger.info('Running initial data prefetch...');
    
    // Prefetch high-priority data immediately
    const highPriorityJobs = Array.from(this.jobs.entries())
      .filter(([_, job]) => job.priority === 'high')
      .map(([key, _]) => key);

    for (const jobKey of highPriorityJobs) {
      await this.executeJob(jobKey);
    }

    // Prefetch medium-priority data with slight delay
    setTimeout(async () => {
      const mediumPriorityJobs = Array.from(this.jobs.entries())
        .filter(([_, job]) => job.priority === 'medium')
        .map(([key, _]) => key);

      for (const jobKey of mediumPriorityJobs) {
        await this.executeJob(jobKey);
      }
    }, 5000);

    // Prefetch low-priority data with longer delay
    setTimeout(async () => {
      const lowPriorityJobs = Array.from(this.jobs.entries())
        .filter(([_, job]) => job.priority === 'low')
        .map(([key, _]) => key);

      for (const jobKey of lowPriorityJobs) {
        await this.executeJob(jobKey);
      }
    }, 15000);
  }

  /**
   * Check and run jobs that are due
   */
  private checkAndRunJobs(): void {
    if (!this.isActive) return;

    const now = Date.now();

    for (const [jobKey, job] of this.jobs.entries()) {
      if (job.isRunning) continue;

      const timeSinceLastRun = now - job.lastRun;
      if (timeSinceLastRun >= job.interval) {
        this.executeJob(jobKey);
      }
    }
  }

  /**
   * Execute a specific prefetch job
   */
  private async executeJob(jobKey: string): Promise<void> {
    const job = this.jobs.get(jobKey);
    if (!job || job.isRunning) return;

    job.isRunning = true;
    job.lastRun = Date.now();

    try {
      logger.info(`Executing prefetch job: ${job.name}`);

      switch (jobKey) {
        case 'crypto_prices':
          await this.prefetchCryptoPrices();
          break;
        case 'market_overview':
          await this.prefetchMarketOverview();
          break;
        case 'defi_protocols':
          await this.prefetchDeFiProtocols();
          break;
        case 'nft_collections':
          await this.prefetchNFTCollections();
          break;
        case 'blockchain_networks':
          await this.prefetchBlockchainNetworks();
          break;
        default:
          logger.warn(`Unknown prefetch job: ${jobKey}`);
      }

      job.retryCount = 0; // Reset retry count on success
      logger.info(`Prefetch job completed: ${job.name}`);

    } catch (error) {
      job.retryCount++;
      logger.error(`Prefetch job failed: ${job.name}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: job.retryCount,
        maxRetries: job.maxRetries
      });

      // Retry logic
      if (job.retryCount < job.maxRetries) {
        setTimeout(() => {
          this.executeJob(jobKey);
        }, 30000 * job.retryCount); // Exponential backoff
      }
    } finally {
      job.isRunning = false;
    }
  }

  /**
   * Prefetch cryptocurrency prices
   */
  private async prefetchCryptoPrices(): Promise<void> {
    const prices = await this.realDataService.getRealCryptoPrices();
    await CacheManager.set('prefetch:crypto_prices', prices, 60); // Cache for 1 minute
  }

  /**
   * Prefetch market overview data
   */
  private async prefetchMarketOverview(): Promise<void> {
    const marketData = await this.blockchainService.getMarketData();
    await CacheManager.set('prefetch:market_overview', marketData, 180); // Cache for 3 minutes
  }

  /**
   * Prefetch DeFi protocols data
   */
  private async prefetchDeFiProtocols(): Promise<void> {
    const protocols = await this.realDataService.getRealDeFiProtocols();
    await CacheManager.set('prefetch:defi_protocols', protocols, 300); // Cache for 5 minutes
  }

  /**
   * Prefetch NFT collections data
   */
  private async prefetchNFTCollections(): Promise<void> {
    const collections = await this.realDataService.getRealNFTCollections();
    await CacheManager.set('prefetch:nft_collections', collections, 600); // Cache for 10 minutes
  }

  /**
   * Prefetch blockchain networks data
   */
  private async prefetchBlockchainNetworks(): Promise<void> {
    const networks = await this.realDataService.getRealBlockchainData();
    await CacheManager.set('prefetch:blockchain_networks', networks, 900); // Cache for 15 minutes
  }

  /**
   * Get prefetched data (for API endpoints to use)
   */
  public async getPrefetchedData(dataType: string): Promise<any | null> {
    try {
      const cached = await CacheManager.get(`prefetch:${dataType}`);
      if (cached) {
        logger.info(`Serving prefetched data: ${dataType}`);
        return cached;
      }
      return null;
    } catch (error) {
      logger.error(`Error getting prefetched data: ${dataType}`, error);
      return null;
    }
  }

  /**
   * Get service status
   */
  public getStatus(): any {
    return {
      isActive: this.isActive,
      jobs: Array.from(this.jobs.entries()).map(([key, job]) => ({
        key,
        name: job.name,
        priority: job.priority,
        lastRun: new Date(job.lastRun).toISOString(),
        isRunning: job.isRunning,
        retryCount: job.retryCount,
        nextRun: new Date(job.lastRun + job.interval).toISOString()
      }))
    };
  }

  /**
   * Force refresh specific data type
   */
  public async forceRefresh(dataType: string): Promise<void> {
    logger.info(`Force refreshing data: ${dataType}`);
    await this.executeJob(dataType);
  }
}

export default PrefetchService;
