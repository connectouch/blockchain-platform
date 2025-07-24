/**
 * CoinMarketCap API Service
 * Real-time cryptocurrency data integration with caching and rate limiting
 * Designed for production use with comprehensive error handling
 */

const axios = require('axios');
const NodeCache = require('node-cache');

class CoinMarketCapService {
  constructor() {
    this.apiKey = process.env.COINMARKETCAP_API_KEY;
    this.baseUrl = 'https://pro-api.coinmarketcap.com';
    
    // Initialize cache with TTL
    this.cache = new NodeCache({
      stdTTL: 300, // 5 minutes default
      checkperiod: 60, // Check for expired keys every minute
      useClones: false // Better performance
    });
    
    // Rate limiting (333 calls/month = ~10 calls/day)
    this.rateLimiter = {
      calls: 0,
      resetTime: Date.now() + (24 * 60 * 60 * 1000), // Reset daily
      maxCalls: 10 // Conservative daily limit
    };
    
    // Circuit breaker for API failures
    this.circuitBreaker = {
      failures: 0,
      maxFailures: 3,
      resetTime: 0,
      isOpen: false
    };
    
    // DeFi-focused cryptocurrency symbols
    this.defaultSymbols = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'MATIC', 'UNI', 'AAVE', 'COMP'];
    
    console.log('🪙 CoinMarketCap Service initialized');
  }

  /**
   * Check if we can make API calls (rate limiting + circuit breaker)
   */
  canMakeApiCall() {
    // Reset rate limiter if needed
    if (Date.now() > this.rateLimiter.resetTime) {
      this.rateLimiter.calls = 0;
      this.rateLimiter.resetTime = Date.now() + (24 * 60 * 60 * 1000);
    }
    
    // Check rate limit
    if (this.rateLimiter.calls >= this.rateLimiter.maxCalls) {
      console.warn('⚠️ CoinMarketCap rate limit reached for today');
      return false;
    }
    
    // Check circuit breaker
    if (this.circuitBreaker.isOpen) {
      if (Date.now() > this.circuitBreaker.resetTime) {
        this.circuitBreaker.isOpen = false;
        this.circuitBreaker.failures = 0;
        console.log('🔄 CoinMarketCap circuit breaker reset');
      } else {
        console.warn('⚠️ CoinMarketCap circuit breaker is open');
        return false;
      }
    }
    
    return true;
  }

  /**
   * Handle API call success
   */
  handleApiSuccess() {
    this.rateLimiter.calls++;
    this.circuitBreaker.failures = 0;
  }

  /**
   * Handle API call failure
   */
  handleApiFailure(error) {
    this.circuitBreaker.failures++;
    
    if (this.circuitBreaker.failures >= this.circuitBreaker.maxFailures) {
      this.circuitBreaker.isOpen = true;
      this.circuitBreaker.resetTime = Date.now() + (5 * 60 * 1000); // 5 minutes
      console.error('🚨 CoinMarketCap circuit breaker opened due to failures');
    }
    
    console.error('❌ CoinMarketCap API error:', error.message);
  }

  /**
   * Get live cryptocurrency prices
   */
  async getLivePrices(symbols = this.defaultSymbols) {
    const cacheKey = `prices_${symbols.join('_')}`;
    
    // Try cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('📦 Returning cached price data');
      return cached;
    }
    
    // Check if we can make API call
    if (!this.canMakeApiCall()) {
      return this.getFallbackPrices(symbols);
    }
    
    try {
      console.log('🌐 Fetching live prices from CoinMarketCap...');
      
      const response = await axios.get(`${this.baseUrl}/v2/cryptocurrency/quotes/latest`, {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey,
          'Accept': 'application/json'
        },
        params: {
          symbol: symbols.join(','),
          convert: 'USD'
        },
        timeout: 10000
      });
      
      this.handleApiSuccess();
      
      const processedData = this.processMarketData(response.data);
      
      // Cache for 5 minutes
      this.cache.set(cacheKey, processedData, 300);
      
      console.log(`✅ Successfully fetched ${processedData.length} cryptocurrency prices`);
      return processedData;
      
    } catch (error) {
      this.handleApiFailure(error);
      return this.getFallbackPrices(symbols);
    }
  }

  /**
   * Get global market metrics
   */
  async getGlobalMetrics() {
    const cacheKey = 'global_metrics';
    
    // Try cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('📦 Returning cached global metrics');
      return cached;
    }
    
    // Check if we can make API call
    if (!this.canMakeApiCall()) {
      return this.getFallbackGlobalMetrics();
    }
    
    try {
      console.log('🌐 Fetching global metrics from CoinMarketCap...');
      
      const response = await axios.get(`${this.baseUrl}/v1/global-metrics/quotes/latest`, {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey,
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      this.handleApiSuccess();
      
      const processedData = this.processGlobalData(response.data);
      
      // Cache for 15 minutes
      this.cache.set(cacheKey, processedData, 900);
      
      console.log('✅ Successfully fetched global market metrics');
      return processedData;
      
    } catch (error) {
      this.handleApiFailure(error);
      return this.getFallbackGlobalMetrics();
    }
  }

  /**
   * Process market data from CoinMarketCap API
   */
  processMarketData(apiData) {
    const processed = [];

    if (apiData.data) {
      Object.values(apiData.data).forEach(coinArray => {
        if (Array.isArray(coinArray)) {
          coinArray.forEach(coin => {
            if (coin.quote && coin.quote.USD) {
              const usd = coin.quote.USD;
              processed.push({
                symbol: coin.symbol,
                name: coin.name,
                price: parseFloat((usd.price || 0).toFixed(2)),
                change24h: parseFloat((usd.percent_change_24h || 0).toFixed(2)),
                change1h: parseFloat((usd.percent_change_1h || 0).toFixed(2)),
                change7d: parseFloat((usd.percent_change_7d || 0).toFixed(2)),
                marketCap: usd.market_cap || 0,
                volume24h: usd.volume_24h || 0,
                lastUpdated: usd.last_updated || new Date().toISOString(),
                isRealTime: true
              });
            }
          });
        } else if (coinArray.quote && coinArray.quote.USD) {
          // Handle single coin object (not array)
          const usd = coinArray.quote.USD;
          processed.push({
            symbol: coinArray.symbol,
            name: coinArray.name,
            price: parseFloat((usd.price || 0).toFixed(2)),
            change24h: parseFloat((usd.percent_change_24h || 0).toFixed(2)),
            change1h: parseFloat((usd.percent_change_1h || 0).toFixed(2)),
            change7d: parseFloat((usd.percent_change_7d || 0).toFixed(2)),
            marketCap: usd.market_cap || 0,
            volume24h: usd.volume_24h || 0,
            lastUpdated: usd.last_updated || new Date().toISOString(),
            isRealTime: true
          });
        }
      });
    }

    return processed;
  }

  /**
   * Process global market data
   */
  processGlobalData(apiData) {
    if (apiData.data && apiData.data.quote && apiData.data.quote.USD) {
      const usd = apiData.data.quote.USD;
      return {
        totalMarketCap: usd.total_market_cap,
        totalVolume: usd.total_volume_24h,
        btcDominance: apiData.data.btc_dominance,
        ethDominance: apiData.data.eth_dominance,
        defiTvl: usd.defi_market_cap || 0,
        lastUpdated: usd.last_updated,
        isRealTime: true
      };
    }
    
    return this.getFallbackGlobalMetrics();
  }

  /**
   * Fallback price data when API is unavailable
   */
  getFallbackPrices(symbols) {
    console.log('📋 Using fallback price data');
    return symbols.map(symbol => ({
      symbol,
      name: this.getSymbolName(symbol),
      price: this.getFallbackPrice(symbol),
      change24h: (Math.random() - 0.5) * 10, // Random change
      change1h: (Math.random() - 0.5) * 2,
      change7d: (Math.random() - 0.5) * 20,
      marketCap: 0,
      volume24h: 0,
      lastUpdated: new Date().toISOString(),
      isRealTime: false
    }));
  }

  /**
   * Fallback global metrics
   */
  getFallbackGlobalMetrics() {
    console.log('📋 Using fallback global metrics');
    return {
      totalMarketCap: 2500000000000,
      totalVolume: 85000000000,
      btcDominance: 42.5,
      ethDominance: 18.2,
      defiTvl: 45000000000,
      lastUpdated: new Date().toISOString(),
      isRealTime: false
    };
  }

  /**
   * Get symbol name mapping
   */
  getSymbolName(symbol) {
    const names = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'BNB': 'BNB',
      'ADA': 'Cardano',
      'SOL': 'Solana',
      'MATIC': 'Polygon',
      'UNI': 'Uniswap',
      'AAVE': 'Aave',
      'COMP': 'Compound'
    };
    return names[symbol] || symbol;
  }

  /**
   * Get fallback price for symbol
   */
  getFallbackPrice(symbol) {
    const prices = {
      'BTC': 65000,
      'ETH': 3200,
      'BNB': 580,
      'ADA': 0.45,
      'SOL': 140,
      'MATIC': 0.85,
      'UNI': 12,
      'AAVE': 180,
      'COMP': 85
    };
    return prices[symbol] || 1;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      keys: this.cache.keys().length,
      stats: this.cache.getStats(),
      rateLimiter: this.rateLimiter,
      circuitBreaker: this.circuitBreaker
    };
  }
}

module.exports = CoinMarketCapService;
