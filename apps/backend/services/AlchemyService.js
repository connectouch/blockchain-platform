/**
 * Alchemy Blockchain Service
 * Real-time Ethereum network data integration with JSON-RPC
 * Provides gas prices, network statistics, and blockchain information
 */

const axios = require('axios');
const NodeCache = require('node-cache');

class AlchemyService {
  constructor() {
    this.apiKey = process.env.ALCHEMY_API_KEY;
    this.baseUrl = `https://eth-mainnet.g.alchemy.com/v2/${this.apiKey}`;
    
    // Initialize cache with different TTLs for different data types
    this.cache = new NodeCache({
      stdTTL: 30, // 30 seconds default
      checkperiod: 10, // Check for expired keys every 10 seconds
      useClones: false // Better performance
    });
    
    // Request ID counter for JSON-RPC
    this.requestId = 1;
    
    // Network health tracking
    this.networkHealth = {
      lastSuccessfulCall: Date.now(),
      consecutiveFailures: 0,
      isHealthy: true
    };
    
    console.log('⛓️ Alchemy Service initialized');
  }

  /**
   * Generate unique request ID for JSON-RPC
   */
  getRequestId() {
    return this.requestId++;
  }

  /**
   * Make JSON-RPC call to Alchemy
   */
  async makeJsonRpcCall(method, params = []) {
    const requestData = {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: this.getRequestId()
    };

    try {
      const response = await axios.post(this.baseUrl, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      });

      if (response.data.error) {
        throw new Error(`JSON-RPC Error: ${response.data.error.message}`);
      }

      // Update network health
      this.networkHealth.lastSuccessfulCall = Date.now();
      this.networkHealth.consecutiveFailures = 0;
      this.networkHealth.isHealthy = true;

      return response.data.result;
    } catch (error) {
      // Update network health
      this.networkHealth.consecutiveFailures++;
      if (this.networkHealth.consecutiveFailures >= 3) {
        this.networkHealth.isHealthy = false;
      }

      console.error(`❌ Alchemy JSON-RPC error for ${method}:`, error.message);
      throw error;
    }
  }

  /**
   * Get current gas price in Gwei
   */
  async getGasPrice() {
    const cacheKey = 'gas_price';
    
    // Try cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('📦 Returning cached gas price');
      return cached;
    }

    try {
      console.log('🌐 Fetching gas price from Alchemy...');
      
      const gasPriceHex = await this.makeJsonRpcCall('eth_gasPrice');
      const gasPriceWei = parseInt(gasPriceHex, 16);
      const gasPriceGwei = gasPriceWei / 1e9;

      const gasData = {
        gasPrice: parseFloat(gasPriceGwei.toFixed(2)),
        gasPriceWei: gasPriceWei,
        recommendations: this.generateGasRecommendations(gasPriceGwei),
        lastUpdated: new Date().toISOString(),
        isRealTime: true
      };

      // Cache for 30 seconds
      this.cache.set(cacheKey, gasData, 30);

      console.log(`✅ Gas price: ${gasData.gasPrice} Gwei`);
      return gasData;

    } catch (error) {
      console.log('📋 Using fallback gas price');
      return this.getFallbackGasPrice();
    }
  }

  /**
   * Get latest block number
   */
  async getLatestBlockNumber() {
    const cacheKey = 'latest_block';
    
    // Try cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('📦 Returning cached block number');
      return cached;
    }

    try {
      console.log('🌐 Fetching latest block from Alchemy...');
      
      const blockNumberHex = await this.makeJsonRpcCall('eth_blockNumber');
      const blockNumber = parseInt(blockNumberHex, 16);

      const blockData = {
        blockNumber: blockNumber,
        blockNumberHex: blockNumberHex,
        lastUpdated: new Date().toISOString(),
        isRealTime: true
      };

      // Cache for 15 seconds
      this.cache.set(cacheKey, blockData, 15);

      console.log(`✅ Latest block: ${blockNumber}`);
      return blockData;

    } catch (error) {
      console.log('📋 Using fallback block number');
      return this.getFallbackBlockNumber();
    }
  }

  /**
   * Get network statistics
   */
  async getNetworkStats() {
    const cacheKey = 'network_stats';
    
    // Try cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('📦 Returning cached network stats');
      return cached;
    }

    try {
      console.log('🌐 Fetching network statistics from Alchemy...');
      
      const [gasPrice, blockNumber, syncStatus] = await Promise.all([
        this.getGasPrice(),
        this.getLatestBlockNumber(),
        this.getSyncStatus()
      ]);

      const networkStats = {
        network: 'ethereum',
        gasPrice: gasPrice.gasPrice,
        gasPriceGwei: gasPrice.gasPrice,
        blockNumber: blockNumber.blockNumber,
        isSyncing: syncStatus.isSyncing,
        networkHealth: this.getNetworkHealthStatus(),
        congestionLevel: this.calculateCongestionLevel(gasPrice.gasPrice),
        estimatedBlockTime: 12, // Ethereum average block time
        lastUpdated: new Date().toISOString(),
        isRealTime: true
      };

      // Cache for 30 seconds
      this.cache.set(cacheKey, networkStats, 30);

      console.log('✅ Network statistics compiled');
      return networkStats;

    } catch (error) {
      console.log('📋 Using fallback network stats');
      return this.getFallbackNetworkStats();
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus() {
    try {
      const syncResult = await this.makeJsonRpcCall('eth_syncing');
      
      return {
        isSyncing: syncResult !== false,
        syncData: syncResult,
        isRealTime: true
      };
    } catch (error) {
      return {
        isSyncing: false,
        syncData: null,
        isRealTime: false
      };
    }
  }

  /**
   * Generate gas price recommendations
   */
  generateGasRecommendations(currentGasPrice) {
    return {
      slow: {
        gasPrice: Math.max(1, currentGasPrice * 0.8),
        estimatedTime: '5-10 minutes'
      },
      standard: {
        gasPrice: currentGasPrice,
        estimatedTime: '2-5 minutes'
      },
      fast: {
        gasPrice: currentGasPrice * 1.2,
        estimatedTime: '< 2 minutes'
      },
      rapid: {
        gasPrice: currentGasPrice * 1.5,
        estimatedTime: '< 1 minute'
      }
    };
  }

  /**
   * Calculate network congestion level
   */
  calculateCongestionLevel(gasPrice) {
    if (gasPrice < 20) return 'low';
    if (gasPrice < 50) return 'medium';
    if (gasPrice < 100) return 'high';
    return 'extreme';
  }

  /**
   * Get network health status
   */
  getNetworkHealthStatus() {
    const timeSinceLastSuccess = Date.now() - this.networkHealth.lastSuccessfulCall;
    
    return {
      isHealthy: this.networkHealth.isHealthy,
      consecutiveFailures: this.networkHealth.consecutiveFailures,
      lastSuccessfulCall: this.networkHealth.lastSuccessfulCall,
      timeSinceLastSuccess: timeSinceLastSuccess,
      status: this.networkHealth.isHealthy ? 'healthy' : 'degraded'
    };
  }

  /**
   * Fallback gas price data
   */
  getFallbackGasPrice() {
    const fallbackGasPrice = 25; // 25 Gwei fallback
    
    return {
      gasPrice: fallbackGasPrice,
      gasPriceWei: fallbackGasPrice * 1e9,
      recommendations: this.generateGasRecommendations(fallbackGasPrice),
      lastUpdated: new Date().toISOString(),
      isRealTime: false
    };
  }

  /**
   * Fallback block number
   */
  getFallbackBlockNumber() {
    // Approximate current block (increases by ~7200 blocks per day)
    const genesisTime = new Date('2015-07-30').getTime();
    const currentTime = Date.now();
    const daysSinceGenesis = (currentTime - genesisTime) / (1000 * 60 * 60 * 24);
    const estimatedBlock = Math.floor(daysSinceGenesis * 7200);

    return {
      blockNumber: estimatedBlock,
      blockNumberHex: '0x' + estimatedBlock.toString(16),
      lastUpdated: new Date().toISOString(),
      isRealTime: false
    };
  }

  /**
   * Fallback network stats
   */
  getFallbackNetworkStats() {
    return {
      network: 'ethereum',
      gasPrice: 25,
      gasPriceGwei: 25,
      blockNumber: this.getFallbackBlockNumber().blockNumber,
      isSyncing: false,
      networkHealth: { status: 'unknown', isHealthy: false },
      congestionLevel: 'medium',
      estimatedBlockTime: 12,
      lastUpdated: new Date().toISOString(),
      isRealTime: false
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      keys: this.cache.keys().length,
      stats: this.cache.getStats(),
      networkHealth: this.networkHealth
    };
  }

  /**
   * Get account balance (bonus method)
   */
  async getAccountBalance(address) {
    try {
      const balanceHex = await this.makeJsonRpcCall('eth_getBalance', [address, 'latest']);
      const balanceWei = parseInt(balanceHex, 16);
      const balanceEth = balanceWei / 1e18;

      return {
        address: address,
        balanceWei: balanceWei,
        balanceEth: parseFloat(balanceEth.toFixed(6)),
        balanceHex: balanceHex,
        isRealTime: true
      };
    } catch (error) {
      return {
        address: address,
        balanceWei: 0,
        balanceEth: 0,
        balanceHex: '0x0',
        isRealTime: false
      };
    }
  }
}

module.exports = AlchemyService;
