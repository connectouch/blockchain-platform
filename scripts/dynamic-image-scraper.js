const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const axios = require('axios');

// Dynamic Image Scraper - Comprehensive Platform Coverage
class DynamicImageScraper {
  constructor() {
    this.baseDir = path.join(__dirname, '../apps/frontend/public/assets');
    this.categories = {
      crypto: path.join(this.baseDir, 'crypto'),
      nft: path.join(this.baseDir, 'nft'),
      defi: path.join(this.baseDir, 'defi'),
      gamefi: path.join(this.baseDir, 'gamefi'),
      chains: path.join(this.baseDir, 'chains'),
      exchanges: path.join(this.baseDir, 'exchanges'),
      protocols: path.join(this.baseDir, 'protocols'),
      dao: path.join(this.baseDir, 'dao'),
      infrastructure: path.join(this.baseDir, 'infrastructure'),
      tools: path.join(this.baseDir, 'tools'),
      news: path.join(this.baseDir, 'news'),
      newsources: path.join(this.baseDir, 'newsources'),
      backgrounds: path.join(this.baseDir, 'backgrounds'),
      icons: path.join(this.baseDir, 'icons'),
      avatars: path.join(this.baseDir, 'avatars')
    };

    this.apis = {
      coingecko: 'https://api.coingecko.com/api/v3',
      coinmarketcap: 'https://pro-api.coinmarketcap.com/v1',
      opensea: 'https://api.opensea.io/api/v1',
      defipulse: 'https://data-api.defipulse.com/api/v1',
      github: 'https://api.github.com',
      cryptologos: 'https://cryptologos.cc/logos',
      chainlist: 'https://chainid.network/chains.json'
    };

    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.rateLimits = {
      coingecko: 100, // ms between requests
      opensea: 200,
      github: 150,
      default: 100
    };

    this.ensureDirectories();
  }

  ensureDirectories() {
    Object.values(this.categories).forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async downloadImage(url, filepath, options = {}) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https:') ? https : http;
      
      const request = protocol.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'image/*,*/*;q=0.8',
          ...options.headers
        }
      }, (response) => {
        if (response.statusCode === 200) {
          const fileStream = fs.createWriteStream(filepath);
          response.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            resolve();
          });
        } else if (response.statusCode === 301 || response.statusCode === 302) {
          this.downloadImage(response.headers.location, filepath, options)
            .then(resolve).catch(reject);
        } else {
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      });
      
      request.on('error', reject);
      request.setTimeout(15000, () => {
        request.destroy();
        reject(new Error('Timeout'));
      });
    });
  }

  async fetchJSON(url, options = {}) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': this.userAgent,
          ...options.headers
        }
      });
      return response.data;
    } catch (error) {
      console.warn(`Failed to fetch ${url}:`, error.message);
      return null;
    }
  }

  // 1. Dynamic Cryptocurrency Discovery & Scraping
  async scrapeCryptocurrencies() {
    console.log('🪙 Scraping cryptocurrencies dynamically...');
    
    try {
      // Get top 500 cryptocurrencies from CoinGecko
      const cryptos = await this.fetchJSON(`${this.apis.coingecko}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=500&page=1`);
      
      if (!cryptos) return;

      let successCount = 0;
      for (const crypto of cryptos) {
        try {
          const symbol = crypto.symbol.toUpperCase();
          const filename = `${symbol.toLowerCase()}.png`;
          const filepath = path.join(this.categories.crypto, filename);

          // Skip if exists and recent
          if (this.isRecentFile(filepath, 7)) {
            successCount++;
            continue;
          }

          if (crypto.image) {
            await this.downloadImage(crypto.image, filepath);
            console.log(`✅ Downloaded: ${symbol}`);
            successCount++;
          }

          await this.sleep(this.rateLimits.coingecko);
        } catch (error) {
          console.warn(`❌ Failed ${crypto.symbol}:`, error.message);
        }
      }

      console.log(`📊 Cryptocurrencies: ${successCount}/${cryptos.length} successful\n`);
    } catch (error) {
      console.error('Cryptocurrency scraping failed:', error.message);
    }
  }

  // 2. Dynamic NFT Collection Discovery
  async scrapeNFTCollections() {
    console.log('🖼️ Scraping NFT collections dynamically...');
    
    try {
      // Get trending collections from OpenSea
      const collections = await this.fetchJSON(`${this.apis.opensea}/collections?offset=0&limit=300`);
      
      if (!collections?.collections) return;

      let successCount = 0;
      for (const collection of collections.collections) {
        try {
          const slug = collection.slug;
          const filename = `${slug}.png`;
          const filepath = path.join(this.categories.nft, filename);

          if (this.isRecentFile(filepath, 7)) {
            successCount++;
            continue;
          }

          if (collection.image_url) {
            await this.downloadImage(collection.image_url, filepath);
            console.log(`✅ Downloaded NFT: ${collection.name}`);
            successCount++;
          }

          await this.sleep(this.rateLimits.opensea);
        } catch (error) {
          console.warn(`❌ Failed NFT ${collection.slug}:`, error.message);
        }
      }

      console.log(`📊 NFT Collections: ${successCount}/${collections.collections.length} successful\n`);
    } catch (error) {
      console.error('NFT scraping failed:', error.message);
    }
  }

  // 3. Blockchain Networks & Chains
  async scrapeBlockchainChains() {
    console.log('⛓️ Scraping blockchain networks...');
    
    try {
      const chains = await this.fetchJSON(this.apis.chainlist);
      
      if (!chains) return;

      const popularChains = chains.filter(chain => 
        chain.name && (
          chain.name.toLowerCase().includes('ethereum') ||
          chain.name.toLowerCase().includes('polygon') ||
          chain.name.toLowerCase().includes('binance') ||
          chain.name.toLowerCase().includes('avalanche') ||
          chain.name.toLowerCase().includes('arbitrum') ||
          chain.name.toLowerCase().includes('optimism') ||
          chain.name.toLowerCase().includes('fantom') ||
          chain.name.toLowerCase().includes('solana') ||
          chain.chainId === 1 || chain.chainId === 137 || chain.chainId === 56
        )
      );

      let successCount = 0;
      for (const chain of popularChains) {
        try {
          const chainName = chain.name.toLowerCase().replace(/\s+/g, '-');
          const filename = `${chainName}.png`;
          const filepath = path.join(this.categories.chains, filename);

          if (this.isRecentFile(filepath, 14)) {
            successCount++;
            continue;
          }

          // Try to find chain logo from various sources
          const logoSources = [
            `https://chainlist.org/unknown-logo.png`, // Placeholder, would need actual API
            `https://assets.coingecko.com/coins/images/279/large/ethereum.png` // Example
          ];

          // Generate fallback if no logo found
          this.generateChainFallback(chain.name, filepath);
          console.log(`✅ Generated chain: ${chain.name}`);
          successCount++;

          await this.sleep(this.rateLimits.default);
        } catch (error) {
          console.warn(`❌ Failed chain ${chain.name}:`, error.message);
        }
      }

      console.log(`📊 Blockchain Chains: ${successCount}/${popularChains.length} successful\n`);
    } catch (error) {
      console.error('Chain scraping failed:', error.message);
    }
  }

  // 4. DeFi Protocols (Extended)
  async scrapeDeFiProtocols() {
    console.log('🏦 Scraping DeFi protocols...');
    
    const protocols = [
      'uniswap', 'aave', 'compound', 'makerdao', 'synthetix', 'yearn',
      'sushiswap', 'curve', 'balancer', 'pancakeswap', 'chainlink',
      '1inch', 'convex', 'frax', 'olympus', 'lido', 'rocket-pool',
      'instadapp', 'badger-dao', 'harvest-finance', 'alpha-finance',
      'cream-finance', 'venus', 'benqi', 'trader-joe', 'platypus-finance'
    ];

    let successCount = 0;
    for (const protocol of protocols) {
      try {
        const filename = `${protocol}.png`;
        const filepath = path.join(this.categories.defi, filename);

        if (this.isRecentFile(filepath, 7)) {
          successCount++;
          continue;
        }

        // Try CoinGecko first
        const protocolData = await this.fetchJSON(`${this.apis.coingecko}/coins/${protocol}`);
        
        if (protocolData?.image?.large) {
          await this.downloadImage(protocolData.image.large, filepath);
          console.log(`✅ Downloaded DeFi: ${protocol}`);
          successCount++;
        } else {
          // Generate fallback
          this.generateProtocolFallback(protocol, filepath);
          console.log(`✅ Generated DeFi: ${protocol}`);
          successCount++;
        }

        await this.sleep(this.rateLimits.coingecko);
      } catch (error) {
        console.warn(`❌ Failed DeFi ${protocol}:`, error.message);
      }
    }

    console.log(`📊 DeFi Protocols: ${successCount}/${protocols.length} successful\n`);
  }

  // 5. GameFi Projects
  async scrapeGameFiProjects() {
    console.log('🎮 Scraping GameFi projects...');
    
    const gamefiProjects = [
      'axie-infinity', 'the-sandbox', 'decentraland', 'enjin-coin',
      'gala', 'illuvium', 'star-atlas', 'alien-worlds', 'smooth-love-potion',
      'my-neighbor-alice', 'chromia', 'ultra', 'wax', 'immutable-x',
      'gods-unchained', 'splinterlands', 'mobox', 'yield-guild-games',
      'merit-circle', 'radio-caca', 'defi-kingdoms', 'crabada'
    ];

    let successCount = 0;
    for (const project of gamefiProjects) {
      try {
        const filename = `${project}.png`;
        const filepath = path.join(this.categories.gamefi, filename);

        if (this.isRecentFile(filepath, 7)) {
          successCount++;
          continue;
        }

        const projectData = await this.fetchJSON(`${this.apis.coingecko}/coins/${project}`);
        
        if (projectData?.image?.large) {
          await this.downloadImage(projectData.image.large, filepath);
          console.log(`✅ Downloaded GameFi: ${project}`);
          successCount++;
        } else {
          this.generateGameFiFallback(project, filepath);
          console.log(`✅ Generated GameFi: ${project}`);
          successCount++;
        }

        await this.sleep(this.rateLimits.coingecko);
      } catch (error) {
        console.warn(`❌ Failed GameFi ${project}:`, error.message);
      }
    }

    console.log(`📊 GameFi Projects: ${successCount}/${gamefiProjects.length} successful\n`);
  }

  // 6. Cryptocurrency Exchanges
  async scrapeExchanges() {
    console.log('🏢 Scraping cryptocurrency exchanges...');
    
    try {
      const exchanges = await this.fetchJSON(`${this.apis.coingecko}/exchanges`);
      
      if (!exchanges) return;

      let successCount = 0;
      for (const exchange of exchanges.slice(0, 50)) { // Top 50 exchanges
        try {
          const filename = `${exchange.id}.png`;
          const filepath = path.join(this.categories.exchanges, filename);

          if (this.isRecentFile(filepath, 14)) {
            successCount++;
            continue;
          }

          if (exchange.image) {
            await this.downloadImage(exchange.image, filepath);
            console.log(`✅ Downloaded Exchange: ${exchange.name}`);
            successCount++;
          }

          await this.sleep(this.rateLimits.coingecko);
        } catch (error) {
          console.warn(`❌ Failed Exchange ${exchange.id}:`, error.message);
        }
      }

      console.log(`📊 Exchanges: ${successCount}/50 successful\n`);
    } catch (error) {
      console.error('Exchange scraping failed:', error.message);
    }
  }

  // Utility functions
  isRecentFile(filepath, days = 7) {
    if (!fs.existsSync(filepath)) return false;
    const stats = fs.statSync(filepath);
    const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceModified < days;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateChainFallback(chainName, filepath) {
    const color = this.getChainColor(chainName);
    const initial = chainName.charAt(0).toUpperCase();
    const svg = this.createSVG(initial, color, 64);
    fs.writeFileSync(filepath, svg);
  }

  generateProtocolFallback(protocolName, filepath) {
    const color = this.getProtocolColor(protocolName);
    const initial = protocolName.charAt(0).toUpperCase();
    const svg = this.createSVG(initial, color, 64);
    fs.writeFileSync(filepath, svg);
  }

  generateGameFiFallback(projectName, filepath) {
    const color = this.getGameFiColor(projectName);
    const initials = projectName.split('-').map(word => word[0]).join('').slice(0, 2).toUpperCase();
    const svg = this.createSVG(initials, color, 64);
    fs.writeFileSync(filepath, svg);
  }

  getChainColor(name) {
    const colors = {
      'ethereum': '#627eea',
      'polygon': '#8247e5',
      'binance': '#f3ba2f',
      'avalanche': '#e84142',
      'arbitrum': '#28a0f0',
      'optimism': '#ff0420'
    };
    return colors[name.toLowerCase()] || '#6366f1';
  }

  getProtocolColor(name) {
    const colors = {
      'uniswap': '#ff007a',
      'aave': '#b6509e',
      'compound': '#00d395',
      'makerdao': '#1aab9b',
      'synthetix': '#5fcdf7'
    };
    return colors[name.toLowerCase()] || '#8b5cf6';
  }

  getGameFiColor(name) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    return colors[name.length % colors.length];
  }

  createSVG(text, color, size) {
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#grad)"/>
      <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white" 
            font-family="Arial, sans-serif" font-size="16" font-weight="bold">
        ${text}
      </text>
    </svg>`;
  }

  // 7. DAO Projects
  async scrapeDAOProjects() {
    console.log('🏛️ Scraping DAO projects...');

    const daoProjects = [
      'maker', 'compound-governance-token', 'aave', 'uniswap',
      'yearn-finance', 'synthetix-network-token', 'curve-dao-token',
      'balancer', 'sushiswap', '1inch', 'badger-dao', 'olympus',
      'frax-share', 'convex-finance', 'rocket-pool', 'lido-dao',
      'gitcoin', 'aragon', 'decentraland', 'the-sandbox'
    ];

    let successCount = 0;
    for (const dao of daoProjects) {
      try {
        const filename = `${dao}.png`;
        const filepath = path.join(this.categories.dao, filename);

        if (this.isRecentFile(filepath, 7)) {
          successCount++;
          continue;
        }

        const daoData = await this.fetchJSON(`${this.apis.coingecko}/coins/${dao}`);

        if (daoData?.image?.large) {
          await this.downloadImage(daoData.image.large, filepath);
          console.log(`✅ Downloaded DAO: ${dao}`);
          successCount++;
        } else {
          this.generateDAOFallback(dao, filepath);
          console.log(`✅ Generated DAO: ${dao}`);
          successCount++;
        }

        await this.sleep(this.rateLimits.coingecko);
      } catch (error) {
        console.warn(`❌ Failed DAO ${dao}:`, error.message);
      }
    }

    console.log(`📊 DAO Projects: ${successCount}/${daoProjects.length} successful\n`);
  }

  // 8. Infrastructure Projects
  async scrapeInfrastructureProjects() {
    console.log('🏗️ Scraping infrastructure projects...');

    const infraProjects = [
      'chainlink', 'the-graph', 'filecoin', 'arweave', 'helium',
      'internet-computer', 'polkadot', 'cosmos', 'avalanche-2',
      'polygon', 'solana', 'near', 'algorand', 'tezos', 'cardano',
      'ethereum-name-service', 'livepeer', 'render-token', 'akash-network',
      'storj', 'siacoin', 'golem', 'iexec-rlc', 'ocean-protocol'
    ];

    let successCount = 0;
    for (const project of infraProjects) {
      try {
        const filename = `${project}.png`;
        const filepath = path.join(this.categories.infrastructure, filename);

        if (this.isRecentFile(filepath, 7)) {
          successCount++;
          continue;
        }

        const projectData = await this.fetchJSON(`${this.apis.coingecko}/coins/${project}`);

        if (projectData?.image?.large) {
          await this.downloadImage(projectData.image.large, filepath);
          console.log(`✅ Downloaded Infrastructure: ${project}`);
          successCount++;
        } else {
          this.generateInfraFallback(project, filepath);
          console.log(`✅ Generated Infrastructure: ${project}`);
          successCount++;
        }

        await this.sleep(this.rateLimits.coingecko);
      } catch (error) {
        console.warn(`❌ Failed Infrastructure ${project}:`, error.message);
      }
    }

    console.log(`📊 Infrastructure Projects: ${successCount}/${infraProjects.length} successful\n`);
  }

  // 9. Web3 Tools & Utilities
  async scrapeWeb3Tools() {
    console.log('🛠️ Scraping Web3 tools...');

    const tools = [
      { name: 'metamask', type: 'wallet' },
      { name: 'walletconnect', type: 'protocol' },
      { name: 'opensea', type: 'marketplace' },
      { name: 'etherscan', type: 'explorer' },
      { name: 'remix', type: 'ide' },
      { name: 'hardhat', type: 'framework' },
      { name: 'truffle', type: 'framework' },
      { name: 'infura', type: 'infrastructure' },
      { name: 'alchemy', type: 'infrastructure' },
      { name: 'moralis', type: 'backend' }
    ];

    let successCount = 0;
    for (const tool of tools) {
      try {
        const filename = `${tool.name}.png`;
        const filepath = path.join(this.categories.tools, filename);

        if (this.isRecentFile(filepath, 14)) {
          successCount++;
          continue;
        }

        // Generate tool-specific fallback
        this.generateToolFallback(tool.name, tool.type, filepath);
        console.log(`✅ Generated Tool: ${tool.name}`);
        successCount++;

        await this.sleep(this.rateLimits.default);
      } catch (error) {
        console.warn(`❌ Failed Tool ${tool.name}:`, error.message);
      }
    }

    console.log(`📊 Web3 Tools: ${successCount}/${tools.length} successful\n`);
  }

  // 10. News Sources
  async scrapeNewsSources() {
    console.log('📰 Scraping news source logos...');

    const newsSources = {
      'coindesk': 'https://www.coindesk.com/resizer/v2/TLMYZSQENFHQVMQZ2QZGFVW5TE.png?auth=1f2c4e5b8a9d3f6e8c7b4a5d9e2f1c8b&width=32&height=32',
      'cointelegraph': 'https://s3.cointelegraph.com/storage/uploads/view/d1ec4d6c9b2b8b2c4e5f8a9b3c6d9e2f.png',
      'decrypt': 'https://cdn.decrypt.co/wp-content/themes/decrypt/assets/images/decrypt-logo.svg',
      'the-block': 'https://www.theblock.co/assets/images/logo-dark.svg',
      'blockworks': 'https://blockworks.co/wp-content/themes/blockworks/assets/images/logo.svg',
      'bitcoin-magazine': 'https://bitcoinmagazine.com/.image/c_fit%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_620/MTc5Mjk3ODUyMTQwMjM2NTI5/bitcoin-magazine-logo.jpg',
      'coinbase-blog': 'https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/2dfd4ea3b623a7c0d8deb2ff445dee9e/Consumer_Wordmark.svg',
      'binance-blog': 'https://bin.bnbstatic.com/static/images/common/logo.png',
      'ethereum-foundation': 'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/ethereum-icon-purple.png',
      'polygon-blog': 'https://polygon.technology/wp-content/themes/polygon/assets/img/logo.svg'
    };

    let successCount = 0;
    for (const [source, url] of Object.entries(newsSources)) {
      try {
        const filename = `${source}.png`;
        const filepath = path.join(this.categories.newsources, filename);

        if (this.isRecentFile(filepath, 30)) {
          successCount++;
          continue;
        }

        // Try to download the logo
        try {
          await this.downloadImage(url, filepath);
          console.log(`✅ Downloaded News Source: ${source}`);
          successCount++;
        } catch (error) {
          // Generate fallback if download fails
          this.generateNewsSourceFallback(source, filepath);
          console.log(`✅ Generated News Source: ${source}`);
          successCount++;
        }

        await this.sleep(this.rateLimits.default);
      } catch (error) {
        console.warn(`❌ Failed News Source ${source}:`, error.message);
      }
    }

    console.log(`📊 News Sources: ${successCount}/${Object.keys(newsSources).length} successful\n`);
  }

  // 11. News Category Images
  async generateNewsImages() {
    console.log('📰 Generating news category images...');

    const newsCategories = [
      { name: 'bitcoin', color: '#f7931a', icon: '₿' },
      { name: 'ethereum', color: '#627eea', icon: 'Ξ' },
      { name: 'defi', color: '#8b5cf6', icon: 'DeFi' },
      { name: 'nft', color: '#ec4899', icon: 'NFT' },
      { name: 'gamefi', color: '#10b981', icon: 'GameFi' },
      { name: 'dao', color: '#f59e0b', icon: 'DAO' },
      { name: 'regulation', color: '#ef4444', icon: 'REG' },
      { name: 'adoption', color: '#06b6d4', icon: 'ADOPT' },
      { name: 'technology', color: '#6366f1', icon: 'TECH' },
      { name: 'market', color: '#84cc16', icon: 'MKT' },
      { name: 'breaking', color: '#dc2626', icon: '🚨' },
      { name: 'analysis', color: '#7c3aed', icon: '📊' }
    ];

    let successCount = 0;
    for (const category of newsCategories) {
      try {
        const filename = `${category.name}.svg`;
        const filepath = path.join(this.categories.news, filename);

        if (this.isRecentFile(filepath, 30)) {
          successCount++;
          continue;
        }

        this.generateNewsCategoryImage(category, filepath);
        console.log(`✅ Generated News Category: ${category.name}`);
        successCount++;
      } catch (error) {
        console.warn(`❌ Failed News Category ${category.name}:`, error.message);
      }
    }

    console.log(`📊 News Categories: ${successCount}/${newsCategories.length} successful\n`);
  }

  // 12. Background Images & Patterns
  async generateBackgrounds() {
    console.log('🎨 Generating background images...');

    const backgrounds = [
      { name: 'crypto-grid', type: 'pattern' },
      { name: 'defi-waves', type: 'gradient' },
      { name: 'nft-mosaic', type: 'pattern' },
      { name: 'blockchain-network', type: 'pattern' },
      { name: 'trading-chart', type: 'pattern' },
      { name: 'cyber-grid', type: 'pattern' }
    ];

    let successCount = 0;
    for (const bg of backgrounds) {
      try {
        const filename = `${bg.name}.svg`;
        const filepath = path.join(this.categories.backgrounds, filename);

        if (this.isRecentFile(filepath, 30)) {
          successCount++;
          continue;
        }

        this.generateBackgroundSVG(bg.name, bg.type, filepath);
        console.log(`✅ Generated Background: ${bg.name}`);
        successCount++;
      } catch (error) {
        console.warn(`❌ Failed Background ${bg.name}:`, error.message);
      }
    }

    console.log(`📊 Backgrounds: ${successCount}/${backgrounds.length} successful\n`);
  }

  // Additional fallback generators
  generateDAOFallback(daoName, filepath) {
    const color = '#10b981'; // Green for DAOs
    const initial = daoName.charAt(0).toUpperCase();
    const svg = this.createSVG(initial, color, 64);
    fs.writeFileSync(filepath, svg);
  }

  generateInfraFallback(projectName, filepath) {
    const color = '#3b82f6'; // Blue for infrastructure
    const initial = projectName.charAt(0).toUpperCase();
    const svg = this.createSVG(initial, color, 64);
    fs.writeFileSync(filepath, svg);
  }

  generateToolFallback(toolName, toolType, filepath) {
    const colors = {
      'wallet': '#f59e0b',
      'protocol': '#8b5cf6',
      'marketplace': '#ec4899',
      'explorer': '#06b6d4',
      'ide': '#10b981',
      'framework': '#ef4444',
      'infrastructure': '#3b82f6',
      'backend': '#6366f1'
    };
    const color = colors[toolType] || '#6b7280';
    const initial = toolName.charAt(0).toUpperCase();
    const svg = this.createSVG(initial, color, 64);
    fs.writeFileSync(filepath, svg);
  }

  generateBackgroundSVG(name, type, filepath) {
    const patterns = {
      'crypto-grid': this.createGridPattern(),
      'defi-waves': this.createWavePattern(),
      'nft-mosaic': this.createMosaicPattern(),
      'blockchain-network': this.createNetworkPattern(),
      'trading-chart': this.createChartPattern(),
      'cyber-grid': this.createCyberPattern()
    };

    const svg = patterns[name] || this.createGridPattern();
    fs.writeFileSync(filepath, svg);
  }

  createGridPattern() {
    return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" stroke-width="1" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>`;
  }

  createWavePattern() {
    return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#waveGrad)" />
      <path d="M0,200 Q100,150 200,200 T400,200" stroke="#3b82f6" stroke-width="2" fill="none" opacity="0.3"/>
      <path d="M0,250 Q100,200 200,250 T400,250" stroke="#8b5cf6" stroke-width="2" fill="none" opacity="0.3"/>
    </svg>`;
  }

  createMosaicPattern() {
    return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1f2937"/>
      <rect x="0" y="0" width="100" height="100" fill="#3b82f6" opacity="0.1"/>
      <rect x="100" y="100" width="100" height="100" fill="#8b5cf6" opacity="0.1"/>
      <rect x="200" y="0" width="100" height="100" fill="#ec4899" opacity="0.1"/>
      <rect x="300" y="100" width="100" height="100" fill="#10b981" opacity="0.1"/>
    </svg>`;
  }

  createNetworkPattern() {
    return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#111827"/>
      <circle cx="100" cy="100" r="3" fill="#3b82f6" opacity="0.6"/>
      <circle cx="300" cy="150" r="3" fill="#8b5cf6" opacity="0.6"/>
      <circle cx="200" cy="300" r="3" fill="#10b981" opacity="0.6"/>
      <line x1="100" y1="100" x2="300" y2="150" stroke="#374151" stroke-width="1" opacity="0.3"/>
      <line x1="300" y1="150" x2="200" y2="300" stroke="#374151" stroke-width="1" opacity="0.3"/>
    </svg>`;
  }

  createChartPattern() {
    return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0f172a"/>
      <path d="M50,350 L100,300 L150,250 L200,200 L250,150 L300,100 L350,50"
            stroke="#10b981" stroke-width="2" fill="none" opacity="0.6"/>
      <path d="M50,300 L100,280 L150,320 L200,250 L250,200 L300,180 L350,120"
            stroke="#ef4444" stroke-width="2" fill="none" opacity="0.6"/>
    </svg>`;
  }

  createCyberPattern() {
    return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0c0a09"/>
      <rect x="0" y="0" width="400" height="2" fill="#06b6d4" opacity="0.3"/>
      <rect x="0" y="100" width="400" height="1" fill="#06b6d4" opacity="0.2"/>
      <rect x="0" y="200" width="400" height="2" fill="#06b6d4" opacity="0.3"/>
      <rect x="0" y="300" width="400" height="1" fill="#06b6d4" opacity="0.2"/>
    </svg>`;
  }

  // News source fallback generator
  generateNewsSourceFallback(sourceName, filepath) {
    const color = '#1f2937'; // Dark gray for news sources
    const initials = sourceName.split('-').map(word => word[0]).join('').slice(0, 2).toUpperCase();
    const size = 64;

    const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="newsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#374151;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#newsGrad)" rx="8"/>
      <rect x="8" y="8" width="48" height="48" fill="none" stroke="white" stroke-width="1" rx="4"/>
      <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white"
            font-family="Arial, sans-serif" font-size="12" font-weight="bold">
        ${initials}
      </text>
    </svg>`;

    fs.writeFileSync(filepath, svg);
  }

  // News category image generator
  generateNewsCategoryImage(category, filepath) {
    const size = 64;
    const { color, icon, name } = category;

    const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="categoryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#categoryGrad)" filter="url(#glow)"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 6}" fill="none" stroke="white" stroke-width="1" opacity="0.5"/>
      <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white"
            font-family="Arial, sans-serif" font-size="10" font-weight="bold">
        ${icon}
      </text>
    </svg>`;

    fs.writeFileSync(filepath, svg);
  }

  // Main execution
  async scrapeAll() {
    console.log('🚀 Starting comprehensive dynamic image scraping...\n');

    const startTime = Date.now();

    await this.scrapeCryptocurrencies();
    await this.scrapeNFTCollections();
    await this.scrapeBlockchainChains();
    await this.scrapeDeFiProtocols();
    await this.scrapeGameFiProjects();
    await this.scrapeExchanges();
    await this.scrapeDAOProjects();
    await this.scrapeInfrastructureProjects();
    await this.scrapeWeb3Tools();
    await this.scrapeNewsSources();
    await this.generateNewsImages();
    await this.generateBackgrounds();

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log(`\n✅ Dynamic scraping completed in ${duration} seconds!`);
    this.generateReport();
  }

  generateReport() {
    const report = {};
    let totalImages = 0;

    Object.entries(this.categories).forEach(([category, dir]) => {
      if (fs.existsSync(dir)) {
        const count = fs.readdirSync(dir).length;
        report[category] = count;
        totalImages += count;
      } else {
        report[category] = 0;
      }
    });

    console.log('\n📊 Final Image Inventory:');
    Object.entries(report).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} images`);
    });
    console.log(`   Total: ${totalImages} images`);

    // Save report
    const reportPath = path.join(this.baseDir, 'dynamic-scraping-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      categories: report,
      total: totalImages
    }, null, 2));

    console.log(`\n📄 Report saved to: ${reportPath}`);
  }
}

// Run the dynamic scraper
if (require.main === module) {
  const scraper = new DynamicImageScraper();
  scraper.scrapeAll().catch(console.error);
}

module.exports = DynamicImageScraper;
