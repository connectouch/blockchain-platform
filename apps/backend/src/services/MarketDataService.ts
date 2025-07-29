import axios from 'axios';
import { logger } from '../utils/logger';

/**
 * Real-Time Market Data Service
 * Integrates with CoinMarketCap API for live cryptocurrency data
 * Applying Augment Agent's comprehensive real-time data approach
 */

export interface CryptoCurrency {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  num_market_pairs: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  last_updated: string;
  date_added: string;
  tags: string[];
  platform: any;
  quote: {
    USD: {
      price: number;
      volume_24h: number;
      volume_change_24h: number;
      percent_change_1h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      percent_change_30d: number;
      percent_change_60d: number;
      percent_change_90d: number;
      market_cap: number;
      market_cap_dominance: number;
      fully_diluted_market_cap: number;
      last_updated: string;
    };
  };
}

export interface MarketOverview {
  active_cryptocurrencies: number;
  total_cryptocurrencies: number;
  active_market_pairs: number;
  active_exchanges: number;
  total_exchanges: number;
  eth_dominance: number;
  btc_dominance: number;
  eth_dominance_yesterday: number;
  btc_dominance_yesterday: number;
  eth_dominance_24h_percentage_change: number;
  btc_dominance_24h_percentage_change: number;
  defi_volume_24h: number;
  defi_volume_24h_reported: number;
  defi_market_cap: number;
  defi_24h_percentage_change: number;
  stablecoin_volume_24h: number;
  stablecoin_volume_24h_reported: number;
  stablecoin_market_cap: number;
  stablecoin_24h_percentage_change: number;
  derivatives_volume_24h: number;
  derivatives_volume_24h_reported: number;
  derivatives_24h_percentage_change: number;
  quote: {
    USD: {
      total_market_cap: number;
      total_volume_24h: number;
      total_volume_24h_reported: number;
      altcoin_volume_24h: number;
      altcoin_volume_24h_reported: number;
      altcoin_market_cap: number;
      total_market_cap_yesterday: number;
      total_volume_24h_yesterday: number;
      total_market_cap_yesterday_percentage_change: number;
      total_volume_24h_yesterday_percentage_change: number;
      last_updated: string;
    };
  };
}

export class MarketDataService {
  private readonly CMC_API_KEY: string;
  private readonly CMC_BASE_URL = 'https://pro-api.coinmarketcap.com/v1';
  private readonly CACHE_TTL = 60000; // 1 minute cache
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor() {
    this.CMC_API_KEY = process.env.COINMARKETCAP_API_KEY || '';
    if (!this.CMC_API_KEY) {
      logger.warn('CoinMarketCap API key not found. Market data will be limited.');
    }
  }

  /**
   * Get cached data or fetch new data
   */
  private async getCachedOrFetch<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const data = await fetchFunction();
      this.cache.set(cacheKey, { data, timestamp: now });
      return data;
    } catch (error) {
      logger.error(`Error fetching data for ${cacheKey}:`, error);
      // Return cached data if available, even if expired
      if (cached) {
        logger.info(`Returning expired cache for ${cacheKey}`);
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Get real-time cryptocurrency listings
   */
  public async getCryptocurrencyListings(
    limit: number = 100,
    start: number = 1
  ): Promise<CryptoCurrency[]> {
    return this.getCachedOrFetch(
      `listings_${limit}_${start}`,
      async () => {
        const response = await axios.get(`${this.CMC_BASE_URL}/cryptocurrency/listings/latest`, {
          headers: {
            'X-CMC_PRO_API_KEY': this.CMC_API_KEY,
            'Accept': 'application/json',
          },
          params: {
            start,
            limit,
            convert: 'USD',
            sort: 'market_cap',
            sort_dir: 'desc',
            cryptocurrency_type: 'all',
            tag: 'all',
          },
          timeout: 10000,
        });

        return response.data.data;
      }
    );
  }

  /**
   * Get global market metrics
   */
  public async getGlobalMetrics(): Promise<MarketOverview> {
    return this.getCachedOrFetch(
      'global_metrics',
      async () => {
        const response = await axios.get(`${this.CMC_BASE_URL}/global-metrics/quotes/latest`, {
          headers: {
            'X-CMC_PRO_API_KEY': this.CMC_API_KEY,
            'Accept': 'application/json',
          },
          params: {
            convert: 'USD',
          },
          timeout: 10000,
        });

        return response.data.data;
      }
    );
  }

  /**
   * Get specific cryptocurrency quotes
   */
  public async getCryptocurrencyQuotes(
    symbols: string[]
  ): Promise<{ [key: string]: CryptoCurrency }> {
    const symbolsStr = symbols.join(',');
    return this.getCachedOrFetch(
      `quotes_${symbolsStr}`,
      async () => {
        const response = await axios.get(`${this.CMC_BASE_URL}/cryptocurrency/quotes/latest`, {
          headers: {
            'X-CMC_PRO_API_KEY': this.CMC_API_KEY,
            'Accept': 'application/json',
          },
          params: {
            symbol: symbolsStr,
            convert: 'USD',
          },
          timeout: 10000,
        });

        return response.data.data;
      }
    );
  }

  /**
   * Get trending cryptocurrencies
   */
  public async getTrendingCryptocurrencies(): Promise<any> {
    return this.getCachedOrFetch(
      'trending',
      async () => {
        // CoinMarketCap doesn't have a direct trending endpoint
        // We'll use top gainers/losers as trending
        const listings = await this.getCryptocurrencyListings(50);
        
        // Sort by 24h percentage change
        const gainers = [...listings]
          .filter(crypto => crypto.quote.USD.percent_change_24h > 0)
          .sort((a, b) => b.quote.USD.percent_change_24h - a.quote.USD.percent_change_24h)
          .slice(0, 10);

        const losers = [...listings]
          .filter(crypto => crypto.quote.USD.percent_change_24h < 0)
          .sort((a, b) => a.quote.USD.percent_change_24h - b.quote.USD.percent_change_24h)
          .slice(0, 10);

        return {
          gainers,
          losers,
          most_active: listings.slice(0, 10)
        };
      }
    );
  }

  /**
   * Get market overview data for dashboard
   */
  public async getMarketOverview(): Promise<any> {
    try {
      const [globalMetrics, topCryptos, trending] = await Promise.all([
        this.getGlobalMetrics(),
        this.getCryptocurrencyListings(10),
        this.getTrendingCryptocurrencies()
      ]);

      const totalMarketCap = globalMetrics.quote.USD.total_market_cap;
      const totalVolume24h = globalMetrics.quote.USD.total_volume_24h;
      const marketCapChange24h = globalMetrics.quote.USD.total_market_cap_yesterday_percentage_change;

      return {
        totalMarketCap,
        totalVolume24h,
        marketCapChange24h,
        btcDominance: globalMetrics.btc_dominance,
        ethDominance: globalMetrics.eth_dominance,
        activeCryptocurrencies: globalMetrics.active_cryptocurrencies,
        topCryptocurrencies: topCryptos,
        trending,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error fetching market overview:', error);
      throw new Error('Failed to fetch market overview data');
    }
  }

  /**
   * Get historical data for a specific cryptocurrency
   */
  public async getHistoricalData(
    symbol: string,
    timeStart?: string,
    timeEnd?: string
  ): Promise<any> {
    return this.getCachedOrFetch(
      `historical_${symbol}_${timeStart}_${timeEnd}`,
      async () => {
        const response = await axios.get(`${this.CMC_BASE_URL}/cryptocurrency/quotes/historical`, {
          headers: {
            'X-CMC_PRO_API_KEY': this.CMC_API_KEY,
            'Accept': 'application/json',
          },
          params: {
            symbol,
            time_start: timeStart,
            time_end: timeEnd,
            count: 100,
            interval: '1h',
            convert: 'USD',
          },
          timeout: 15000,
        });

        return response.data.data;
      }
    );
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
    logger.info('Market data cache cleared');
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const marketDataService = new MarketDataService();
