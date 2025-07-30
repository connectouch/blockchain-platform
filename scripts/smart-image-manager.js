const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Smart Image Manager - Analyzes platform content and automatically fetches needed images
class SmartImageManager {
  constructor() {
    this.baseDir = path.join(__dirname, '../apps/frontend/public/assets');
    this.srcDir = path.join(__dirname, '../apps/frontend/src');
    this.contentAnalysis = {
      cryptocurrencies: new Set(),
      nftCollections: new Set(),
      defiProtocols: new Set(),
      gamefiProjects: new Set(),
      chains: new Set(),
      exchanges: new Set(),
      daoProjects: new Set(),
      tools: new Set()
    };
    
    this.apis = {
      coingecko: 'https://api.coingecko.com/api/v3',
      coinmarketcap: 'https://pro-api.coinmarketcap.com/v1',
      opensea: 'https://api.opensea.io/api/v1'
    };
  }

  // 1. Analyze platform content to discover image needs
  async analyzePlatformContent() {
    console.log('🔍 Analyzing platform content for image requirements...\n');
    
    await this.scanSourceFiles();
    await this.scanConfigFiles();
    await this.scanDataFiles();
    await this.discoverDynamicContent();
    
    this.printAnalysisResults();
  }

  // Scan all source files for image references
  async scanSourceFiles() {
    console.log('📁 Scanning source files...');
    
    const extensions = ['.tsx', '.ts', '.js', '.jsx'];
    const files = this.getAllFiles(this.srcDir, extensions);
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        this.extractImageReferences(content, file);
      } catch (error) {
        console.warn(`Failed to read ${file}:`, error.message);
      }
    }
  }

  // Extract image references from file content
  extractImageReferences(content, filename) {
    // Cryptocurrency symbols
    const cryptoMatches = content.match(/['"`]([A-Z]{2,6})['"`]/g);
    if (cryptoMatches) {
      cryptoMatches.forEach(match => {
        const symbol = match.replace(/['"`]/g, '');
        if (this.isCryptoSymbol(symbol)) {
          this.contentAnalysis.cryptocurrencies.add(symbol);
        }
      });
    }

    // Contract addresses (NFT collections)
    const contractMatches = content.match(/0x[a-fA-F0-9]{40}/g);
    if (contractMatches) {
      contractMatches.forEach(address => {
        this.contentAnalysis.nftCollections.add(address);
      });
    }

    // Protocol names
    const protocolPatterns = [
      /uniswap/gi, /aave/gi, /compound/gi, /makerdao/gi, /synthetix/gi,
      /yearn/gi, /sushiswap/gi, /curve/gi, /balancer/gi, /chainlink/gi
    ];
    
    protocolPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.contentAnalysis.defiProtocols.add(match.toLowerCase());
        });
      }
    });

    // Chain names
    const chainPatterns = [
      /ethereum/gi, /polygon/gi, /binance/gi, /avalanche/gi,
      /arbitrum/gi, /optimism/gi, /fantom/gi, /solana/gi
    ];
    
    chainPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.contentAnalysis.chains.add(match.toLowerCase());
        });
      }
    });
  }

  // Scan configuration files for predefined lists
  async scanConfigFiles() {
    console.log('⚙️ Scanning configuration files...');
    
    const configFiles = [
      'constants.ts', 'config.ts', 'tokens.ts', 'chains.ts'
    ];
    
    for (const configFile of configFiles) {
      const files = this.findFiles(this.srcDir, configFile);
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          this.extractConfigData(content);
        } catch (error) {
          // File might not exist, continue
        }
      }
    }
  }

  // Extract data from configuration files
  extractConfigData(content) {
    // Look for token lists, chain configurations, etc.
    const tokenListMatch = content.match(/tokens?\s*[:=]\s*\[([\s\S]*?)\]/i);
    if (tokenListMatch) {
      const tokens = tokenListMatch[1].match(/['"`]([A-Z]{2,6})['"`]/g);
      if (tokens) {
        tokens.forEach(token => {
          const symbol = token.replace(/['"`]/g, '');
          this.contentAnalysis.cryptocurrencies.add(symbol);
        });
      }
    }

    // Look for chain configurations
    const chainMatch = content.match(/chains?\s*[:=]\s*\[([\s\S]*?)\]/i);
    if (chainMatch) {
      const chains = chainMatch[1].match(/['"`]([a-zA-Z]+)['"`]/g);
      if (chains) {
        chains.forEach(chain => {
          const name = chain.replace(/['"`]/g, '').toLowerCase();
          this.contentAnalysis.chains.add(name);
        });
      }
    }
  }

  // Scan data files for dynamic content
  async scanDataFiles() {
    console.log('📊 Scanning data files...');
    
    const dataFiles = this.getAllFiles(this.srcDir, ['.json']);
    
    for (const file of dataFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(content);
        this.extractDataReferences(data);
      } catch (error) {
        // Not a valid JSON file, continue
      }
    }
  }

  // Extract references from JSON data
  extractDataReferences(data) {
    const traverse = (obj) => {
      if (typeof obj === 'string') {
        // Check if it's a crypto symbol
        if (/^[A-Z]{2,6}$/.test(obj) && this.isCryptoSymbol(obj)) {
          this.contentAnalysis.cryptocurrencies.add(obj);
        }
        // Check if it's a contract address
        if (/^0x[a-fA-F0-9]{40}$/.test(obj)) {
          this.contentAnalysis.nftCollections.add(obj);
        }
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach(traverse);
      }
    };
    
    traverse(data);
  }

  // Discover dynamic content from APIs
  async discoverDynamicContent() {
    console.log('🌐 Discovering dynamic content...');
    
    try {
      // Get trending cryptocurrencies
      const trendingCryptos = await this.fetchJSON(`${this.apis.coingecko}/search/trending`);
      if (trendingCryptos?.coins) {
        trendingCryptos.coins.forEach(coin => {
          this.contentAnalysis.cryptocurrencies.add(coin.item.symbol.toUpperCase());
        });
      }

      // Get top DeFi protocols
      const defiProtocols = await this.fetchJSON(`${this.apis.coingecko}/coins/markets?vs_currency=usd&category=decentralized-finance-defi&order=market_cap_desc&per_page=50`);
      if (defiProtocols) {
        defiProtocols.forEach(protocol => {
          this.contentAnalysis.defiProtocols.add(protocol.id);
        });
      }

      // Get trending NFT collections
      const trendingNFTs = await this.fetchJSON(`${this.apis.opensea}/collections?offset=0&limit=50`);
      if (trendingNFTs?.collections) {
        trendingNFTs.collections.forEach(collection => {
          if (collection.primary_asset_contracts?.[0]?.address) {
            this.contentAnalysis.nftCollections.add(collection.primary_asset_contracts[0].address);
          }
        });
      }

    } catch (error) {
      console.warn('Dynamic content discovery failed:', error.message);
    }
  }

  // 2. Intelligent image fetching based on analysis
  async fetchRequiredImages() {
    console.log('\n🎯 Fetching required images based on analysis...\n');
    
    await this.fetchCryptoImages();
    await this.fetchNFTImages();
    await this.fetchProtocolImages();
    await this.fetchChainImages();
    
    console.log('\n✅ Smart image fetching completed!');
  }

  async fetchCryptoImages() {
    console.log('🪙 Fetching cryptocurrency images...');
    
    const cryptoDir = path.join(this.baseDir, 'crypto');
    if (!fs.existsSync(cryptoDir)) {
      fs.mkdirSync(cryptoDir, { recursive: true });
    }

    let fetchedCount = 0;
    for (const symbol of this.contentAnalysis.cryptocurrencies) {
      try {
        const filename = `${symbol.toLowerCase()}.png`;
        const filepath = path.join(cryptoDir, filename);

        if (fs.existsSync(filepath)) {
          continue; // Already exists
        }

        const coinData = await this.fetchJSON(`${this.apis.coingecko}/coins/${symbol.toLowerCase()}`);
        if (coinData?.image?.large) {
          await this.downloadImage(coinData.image.large, filepath);
          console.log(`✅ Fetched: ${symbol}`);
          fetchedCount++;
        }

        await this.sleep(100); // Rate limiting
      } catch (error) {
        console.warn(`❌ Failed to fetch ${symbol}:`, error.message);
      }
    }

    console.log(`📊 Fetched ${fetchedCount} cryptocurrency images\n`);
  }

  async fetchNFTImages() {
    console.log('🖼️ Fetching NFT collection images...');
    
    const nftDir = path.join(this.baseDir, 'nft');
    if (!fs.existsSync(nftDir)) {
      fs.mkdirSync(nftDir, { recursive: true });
    }

    let fetchedCount = 0;
    for (const contractAddress of this.contentAnalysis.nftCollections) {
      try {
        const filename = `${contractAddress.toLowerCase()}.png`;
        const filepath = path.join(nftDir, filename);

        if (fs.existsSync(filepath)) {
          continue; // Already exists
        }

        const collectionData = await this.fetchJSON(`${this.apis.opensea}/asset_contract/${contractAddress}`);
        if (collectionData?.image_url) {
          await this.downloadImage(collectionData.image_url, filepath);
          console.log(`✅ Fetched NFT: ${contractAddress.slice(0, 8)}...`);
          fetchedCount++;
        }

        await this.sleep(200); // Rate limiting for OpenSea
      } catch (error) {
        console.warn(`❌ Failed to fetch NFT ${contractAddress}:`, error.message);
      }
    }

    console.log(`📊 Fetched ${fetchedCount} NFT collection images\n`);
  }

  async fetchProtocolImages() {
    console.log('🏦 Fetching DeFi protocol images...');
    
    const defiDir = path.join(this.baseDir, 'defi');
    if (!fs.existsSync(defiDir)) {
      fs.mkdirSync(defiDir, { recursive: true });
    }

    let fetchedCount = 0;
    for (const protocol of this.contentAnalysis.defiProtocols) {
      try {
        const filename = `${protocol}.png`;
        const filepath = path.join(defiDir, filename);

        if (fs.existsSync(filepath)) {
          continue; // Already exists
        }

        const protocolData = await this.fetchJSON(`${this.apis.coingecko}/coins/${protocol}`);
        if (protocolData?.image?.large) {
          await this.downloadImage(protocolData.image.large, filepath);
          console.log(`✅ Fetched Protocol: ${protocol}`);
          fetchedCount++;
        }

        await this.sleep(100); // Rate limiting
      } catch (error) {
        console.warn(`❌ Failed to fetch protocol ${protocol}:`, error.message);
      }
    }

    console.log(`📊 Fetched ${fetchedCount} protocol images\n`);
  }

  async fetchChainImages() {
    console.log('⛓️ Fetching blockchain images...');
    
    const chainsDir = path.join(this.baseDir, 'chains');
    if (!fs.existsSync(chainsDir)) {
      fs.mkdirSync(chainsDir, { recursive: true });
    }

    let fetchedCount = 0;
    for (const chain of this.contentAnalysis.chains) {
      try {
        const filename = `${chain}.png`;
        const filepath = path.join(chainsDir, filename);

        if (fs.existsSync(filepath)) {
          continue; // Already exists
        }

        // Try to find chain token
        const chainData = await this.fetchJSON(`${this.apis.coingecko}/coins/${chain}`);
        if (chainData?.image?.large) {
          await this.downloadImage(chainData.image.large, filepath);
          console.log(`✅ Fetched Chain: ${chain}`);
          fetchedCount++;
        } else {
          // Generate fallback
          this.generateChainFallback(chain, filepath);
          console.log(`✅ Generated Chain: ${chain}`);
          fetchedCount++;
        }

        await this.sleep(100); // Rate limiting
      } catch (error) {
        console.warn(`❌ Failed to fetch chain ${chain}:`, error.message);
      }
    }

    console.log(`📊 Fetched ${fetchedCount} chain images\n`);
  }

  // Utility functions
  getAllFiles(dir, extensions) {
    const files = [];
    
    const traverse = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };
    
    traverse(dir);
    return files;
  }

  findFiles(dir, filename) {
    const files = [];
    
    const traverse = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            traverse(fullPath);
          } else if (stat.isFile() && item === filename) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Directory might not be accessible, continue
      }
    };
    
    traverse(dir);
    return files;
  }

  isCryptoSymbol(symbol) {
    const commonCryptos = [
      'BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'AVAX', 'MATIC', 'LINK', 'UNI',
      'AAVE', 'COMP', 'MKR', 'SNX', 'YFI', 'SUSHI', 'CRV', 'BAL', 'USDC', 'USDT',
      'DAI', 'WBTC', 'SHIB', 'DOGE', 'LTC', 'BCH', 'XRP', 'TRX', 'ETC', 'XLM'
    ];
    return commonCryptos.includes(symbol) || /^[A-Z]{2,6}$/.test(symbol);
  }

  async fetchJSON(url) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async downloadImage(url, filepath) {
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  generateChainFallback(chainName, filepath) {
    const colors = {
      'ethereum': '#627eea',
      'polygon': '#8247e5',
      'binance': '#f3ba2f',
      'avalanche': '#e84142'
    };
    const color = colors[chainName] || '#6366f1';
    const initial = chainName.charAt(0).toUpperCase();
    
    const svg = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="${color}"/>
      <text x="32" y="38" text-anchor="middle" fill="white" 
            font-family="Arial" font-size="20" font-weight="bold">
        ${initial}
      </text>
    </svg>`;
    
    fs.writeFileSync(filepath, svg);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  printAnalysisResults() {
    console.log('\n📊 Content Analysis Results:');
    console.log(`   Cryptocurrencies found: ${this.contentAnalysis.cryptocurrencies.size}`);
    console.log(`   NFT collections found: ${this.contentAnalysis.nftCollections.size}`);
    console.log(`   DeFi protocols found: ${this.contentAnalysis.defiProtocols.size}`);
    console.log(`   Blockchain chains found: ${this.contentAnalysis.chains.size}`);
    
    if (this.contentAnalysis.cryptocurrencies.size > 0) {
      console.log(`   Crypto symbols: ${Array.from(this.contentAnalysis.cryptocurrencies).slice(0, 10).join(', ')}${this.contentAnalysis.cryptocurrencies.size > 10 ? '...' : ''}`);
    }
  }

  // Main execution
  async run() {
    console.log('🧠 Starting Smart Image Manager...\n');
    
    await this.analyzePlatformContent();
    await this.fetchRequiredImages();
    
    console.log('\n🎯 Smart image management completed successfully!');
  }
}

// Run the smart image manager
if (require.main === module) {
  const manager = new SmartImageManager();
  manager.run().catch(console.error);
}

module.exports = SmartImageManager;
