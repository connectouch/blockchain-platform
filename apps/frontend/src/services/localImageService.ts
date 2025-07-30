/**
 * Local Image Service
 * Provides instant access to locally stored cryptocurrency, NFT, DeFi, and GameFi images
 */

// Comprehensive cryptocurrency mapping
const CRYPTO_IMAGES: Record<string, string> = {
  'BTC': '/assets/crypto/btc.png',
  'ETH': '/assets/crypto/eth.png',
  'BNB': '/assets/crypto/bnb.png',
  'ADA': '/assets/crypto/ada.png',
  'SOL': '/assets/crypto/sol.png',
  'DOT': '/assets/crypto/dot.png',
  'AVAX': '/assets/crypto/avax.png',
  'MATIC': '/assets/crypto/matic.png',
  'LINK': '/assets/crypto/link.png',
  'UNI': '/assets/crypto/uni.png',
  'AAVE': '/assets/crypto/aave.png',
  'COMP': '/assets/crypto/comp.png',
  'MKR': '/assets/crypto/mkr.png',
  'SNX': '/assets/crypto/snx.png',
  'YFI': '/assets/crypto/yfi.png',
  'SUSHI': '/assets/crypto/sushi.png',
  'CRV': '/assets/crypto/crv.png',
  'BAL': '/assets/crypto/bal.png',
  'USDC': '/assets/crypto/usdc.png',
  'USDT': '/assets/crypto/usdt.png',
  'DAI': '/assets/crypto/dai.png',
  'WBTC': '/assets/crypto/wbtc.png',
  'SHIB': '/assets/crypto/shib.png',
  'DOGE': '/assets/crypto/doge.png',
  'LTC': '/assets/crypto/ltc.png',
  'BCH': '/assets/crypto/bch.png',
  'XRP': '/assets/crypto/xrp.png',
  'TRX': '/assets/crypto/trx.png',
  'ETC': '/assets/crypto/etc.png',
  'XLM': '/assets/crypto/xlm.png',
  'ALGO': '/assets/crypto/algo.png',
  'VET': '/assets/crypto/vet.png',
  'ICP': '/assets/crypto/icp.png',
  'FIL': '/assets/crypto/fil.png',
  'THETA': '/assets/crypto/theta.png',
  'XMR': '/assets/crypto/xmr.png',
  'EOS': '/assets/crypto/eos.png',
  'ATOM': '/assets/crypto/atom.png',
  'XTZ': '/assets/crypto/xtz.png',
  'NEO': '/assets/crypto/neo.png',
  'IOTA': '/assets/crypto/iota.png',
  'DASH': '/assets/crypto/dash.png',
  'ZEC': '/assets/crypto/zec.png',
  'WAVES': '/assets/crypto/waves.png',
  'ONT': '/assets/crypto/ont.png',
  'ZIL': '/assets/crypto/zil.png',
  'BAT': '/assets/crypto/bat.png',
  'ENJ': '/assets/crypto/enj.png',
  'MANA': '/assets/crypto/mana.png',
  'SAND': '/assets/crypto/sand.png',
  'AXS': '/assets/crypto/axs.png',
  'GALA': '/assets/crypto/gala.png'
};

// NFT collection mapping
const NFT_COLLECTIONS: Record<string, { name: string; image: string; contract: string }> = {
  'bored-ape-yacht-club': {
    name: 'Bored Ape Yacht Club',
    image: '/assets/nft/bored-ape-yacht-club.png',
    contract: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d'
  },
  'cryptopunks': {
    name: 'CryptoPunks',
    image: '/assets/nft/cryptopunks.png',
    contract: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb'
  },
  'mutant-ape-yacht-club': {
    name: 'Mutant Ape Yacht Club',
    image: '/assets/nft/mutant-ape-yacht-club.png',
    contract: '0x60e4d786628fea6478f785a6d7e704777c86a7c6'
  },
  'azuki': {
    name: 'Azuki',
    image: '/assets/nft/azuki.png',
    contract: '0xed5af388653567af2f388e6224dc7c4b3241c544'
  },
  'otherdeed-for-otherside': {
    name: 'Otherdeeds for Otherside',
    image: '/assets/nft/otherdeed-for-otherside.png',
    contract: '0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258'
  },
  'clonex': {
    name: 'CloneX',
    image: '/assets/nft/clonex.png',
    contract: '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b'
  }
};

// DeFi protocol mapping
const DEFI_PROTOCOLS: Record<string, string> = {
  'uniswap': '/assets/defi/uniswap.png',
  'aave': '/assets/defi/aave.png',
  'compound': '/assets/defi/compound.png',
  'makerdao': '/assets/defi/makerdao.png',
  'synthetix': '/assets/defi/synthetix.png',
  'yearn': '/assets/defi/yearn.png',
  'sushiswap': '/assets/defi/sushiswap.png',
  'curve': '/assets/defi/curve.png',
  'balancer': '/assets/defi/balancer.png',
  'pancakeswap': '/assets/defi/pancakeswap.png',
  'chainlink': '/assets/defi/chainlink.png'
};

// GameFi project mapping
const GAMEFI_PROJECTS: Record<string, string> = {
  'axie-infinity': '/assets/gamefi/axie-infinity.png',
  'the-sandbox': '/assets/gamefi/the-sandbox.png',
  'decentraland': '/assets/gamefi/decentraland.png',
  'enjin': '/assets/gamefi/enjin.png',
  'gala': '/assets/gamefi/gala.png',
  'illuvium': '/assets/gamefi/illuvium.png',
  'star-atlas': '/assets/gamefi/star-atlas.png',
  'alien-worlds': '/assets/gamefi/alien-worlds.png'
};

// Blockchain chains mapping
const BLOCKCHAIN_CHAINS: Record<string, string> = {
  'ethereum': '/assets/chains/ethereum.png',
  'polygon': '/assets/chains/polygon.png',
  'binance': '/assets/chains/binance.png',
  'avalanche': '/assets/chains/avalanche.png',
  'arbitrum': '/assets/chains/arbitrum.png',
  'optimism': '/assets/chains/optimism.png',
  'fantom': '/assets/chains/fantom.png',
  'solana': '/assets/chains/solana.png'
};

// Cryptocurrency exchanges mapping
const EXCHANGES: Record<string, string> = {
  'binance': '/assets/exchanges/binance.png',
  'coinbase': '/assets/exchanges/coinbase.png',
  'kraken': '/assets/exchanges/kraken.png',
  'huobi': '/assets/exchanges/huobi.png',
  'okx': '/assets/exchanges/okx.png',
  'kucoin': '/assets/exchanges/kucoin.png',
  'bybit': '/assets/exchanges/bybit.png',
  'gate': '/assets/exchanges/gate.png'
};

// DAO projects mapping
const DAO_PROJECTS: Record<string, string> = {
  'maker': '/assets/dao/maker.png',
  'compound': '/assets/dao/compound.png',
  'aave': '/assets/dao/aave.png',
  'uniswap': '/assets/dao/uniswap.png',
  'yearn': '/assets/dao/yearn.png',
  'synthetix': '/assets/dao/synthetix.png',
  'curve': '/assets/dao/curve.png',
  'balancer': '/assets/dao/balancer.png',
  'sushiswap': '/assets/dao/sushiswap.png',
  'olympus': '/assets/dao/olympus.png'
};

// Infrastructure projects mapping
const INFRASTRUCTURE_PROJECTS: Record<string, string> = {
  'chainlink': '/assets/infrastructure/chainlink.png',
  'the-graph': '/assets/infrastructure/the-graph.png',
  'filecoin': '/assets/infrastructure/filecoin.png',
  'arweave': '/assets/infrastructure/arweave.png',
  'helium': '/assets/infrastructure/helium.png',
  'internet-computer': '/assets/infrastructure/internet-computer.png',
  'polkadot': '/assets/infrastructure/polkadot.png',
  'cosmos': '/assets/infrastructure/cosmos.png',
  'near': '/assets/infrastructure/near.png',
  'algorand': '/assets/infrastructure/algorand.png'
};

// Web3 tools mapping
const WEB3_TOOLS: Record<string, string> = {
  'metamask': '/assets/tools/metamask.png',
  'walletconnect': '/assets/tools/walletconnect.png',
  'opensea': '/assets/tools/opensea.png',
  'etherscan': '/assets/tools/etherscan.png',
  'remix': '/assets/tools/remix.png',
  'hardhat': '/assets/tools/hardhat.png',
  'truffle': '/assets/tools/truffle.png',
  'infura': '/assets/tools/infura.png',
  'alchemy': '/assets/tools/alchemy.png',
  'moralis': '/assets/tools/moralis.png'
};

// News sources mapping
const NEWS_SOURCES: Record<string, string> = {
  'coindesk': '/assets/newsources/coindesk.png',
  'cointelegraph': '/assets/newsources/cointelegraph.png',
  'decrypt': '/assets/newsources/decrypt.png',
  'the-block': '/assets/newsources/the-block.png',
  'blockworks': '/assets/newsources/blockworks.png',
  'bitcoin-magazine': '/assets/newsources/bitcoin-magazine.png',
  'coinbase-blog': '/assets/newsources/coinbase-blog.png',
  'binance-blog': '/assets/newsources/binance-blog.png',
  'ethereum-foundation': '/assets/newsources/ethereum-foundation.png',
  'polygon-blog': '/assets/newsources/polygon-blog.png'
};

// News categories mapping
const NEWS_CATEGORIES: Record<string, string> = {
  'bitcoin': '/assets/news/bitcoin.svg',
  'ethereum': '/assets/news/ethereum.svg',
  'defi': '/assets/news/defi.svg',
  'nft': '/assets/news/nft.svg',
  'gamefi': '/assets/news/gamefi.svg',
  'dao': '/assets/news/dao.svg',
  'regulation': '/assets/news/regulation.svg',
  'adoption': '/assets/news/adoption.svg',
  'technology': '/assets/news/technology.svg',
  'market': '/assets/news/market.svg',
  'breaking': '/assets/news/breaking.svg',
  'analysis': '/assets/news/analysis.svg'
};

export class LocalImageService {
  /**
   * Get cryptocurrency logo instantly from local storage
   */
  static getCryptoImage(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();
    const localImage = CRYPTO_IMAGES[upperSymbol];
    
    if (localImage) {
      return localImage;
    }
    
    // Generate fallback SVG if not found
    return this.generateCryptoFallback(symbol);
  }

  /**
   * Get NFT collection image by contract address or slug
   */
  static getNFTCollectionImage(identifier: string, collectionName?: string): string {
    // Try to find by contract address
    const collectionByContract = Object.values(NFT_COLLECTIONS).find(
      collection => collection.contract.toLowerCase() === identifier.toLowerCase()
    );
    
    if (collectionByContract) {
      return collectionByContract.image;
    }
    
    // Try to find by slug
    const collectionBySlug = NFT_COLLECTIONS[identifier.toLowerCase()];
    if (collectionBySlug) {
      return collectionBySlug.image;
    }
    
    // Generate fallback SVG
    return this.generateNFTFallback(identifier, collectionName || 'Collection');
  }

  /**
   * Get DeFi protocol image
   */
  static getDeFiProtocolImage(protocolName: string): string {
    const normalizedName = protocolName.toLowerCase().replace(/\s+/g, '-');
    const localImage = DEFI_PROTOCOLS[normalizedName];
    
    if (localImage) {
      return localImage;
    }
    
    // Try to find by token symbol in crypto images
    const tokenSymbol = this.getProtocolTokenSymbol(protocolName);
    if (tokenSymbol && CRYPTO_IMAGES[tokenSymbol]) {
      return CRYPTO_IMAGES[tokenSymbol];
    }
    
    // Generate fallback SVG
    return this.generateProtocolFallback(protocolName);
  }

  /**
   * Get GameFi project image
   */
  static getGameFiProjectImage(projectName: string): string {
    const normalizedName = projectName.toLowerCase().replace(/\s+/g, '-');
    const localImage = GAMEFI_PROJECTS[normalizedName];
    
    if (localImage) {
      return localImage;
    }
    
    // Try to find by token symbol in crypto images
    const tokenSymbol = this.getGameFiTokenSymbol(projectName);
    if (tokenSymbol && CRYPTO_IMAGES[tokenSymbol]) {
      return CRYPTO_IMAGES[tokenSymbol];
    }
    
    // Generate fallback SVG
    return this.generateGameFiFallback(projectName);
  }

  /**
   * Check if crypto image exists locally
   */
  static hasCryptoImage(symbol: string): boolean {
    return CRYPTO_IMAGES.hasOwnProperty(symbol.toUpperCase());
  }

  /**
   * Get all available crypto symbols
   */
  static getAvailableCryptoSymbols(): string[] {
    return Object.keys(CRYPTO_IMAGES);
  }

  /**
   * Get all available NFT collections
   */
  static getAvailableNFTCollections(): Array<{ slug: string; name: string; contract: string; image: string }> {
    return Object.entries(NFT_COLLECTIONS).map(([slug, data]) => ({
      slug,
      ...data
    }));
  }

  /**
   * Get blockchain chain image
   */
  static getChainImage(chainName: string): string {
    const normalizedName = chainName.toLowerCase().replace(/\s+/g, '-');
    const localImage = BLOCKCHAIN_CHAINS[normalizedName];

    if (localImage) {
      return localImage;
    }

    // Generate fallback SVG
    return this.generateChainFallback(chainName);
  }

  /**
   * Get cryptocurrency exchange image
   */
  static getExchangeImage(exchangeName: string): string {
    const normalizedName = exchangeName.toLowerCase().replace(/\s+/g, '-');
    const localImage = EXCHANGES[normalizedName];

    if (localImage) {
      return localImage;
    }

    // Generate fallback SVG
    return this.generateExchangeFallback(exchangeName);
  }

  /**
   * Get DAO project image
   */
  static getDAOImage(daoName: string): string {
    const normalizedName = daoName.toLowerCase().replace(/\s+/g, '-');
    const localImage = DAO_PROJECTS[normalizedName];

    if (localImage) {
      return localImage;
    }

    // Try to find by token symbol in crypto images
    const tokenSymbol = this.getDAOTokenSymbol(daoName);
    if (tokenSymbol && CRYPTO_IMAGES[tokenSymbol]) {
      return CRYPTO_IMAGES[tokenSymbol];
    }

    // Generate fallback SVG
    return this.generateDAOFallback(daoName);
  }

  /**
   * Get infrastructure project image
   */
  static getInfrastructureImage(projectName: string): string {
    const normalizedName = projectName.toLowerCase().replace(/\s+/g, '-');
    const localImage = INFRASTRUCTURE_PROJECTS[normalizedName];

    if (localImage) {
      return localImage;
    }

    // Try to find by token symbol in crypto images
    const tokenSymbol = this.getInfraTokenSymbol(projectName);
    if (tokenSymbol && CRYPTO_IMAGES[tokenSymbol]) {
      return CRYPTO_IMAGES[tokenSymbol];
    }

    // Generate fallback SVG
    return this.generateInfraFallback(projectName);
  }

  /**
   * Get Web3 tool image
   */
  static getWeb3ToolImage(toolName: string): string {
    const normalizedName = toolName.toLowerCase().replace(/\s+/g, '-');
    const localImage = WEB3_TOOLS[normalizedName];

    if (localImage) {
      return localImage;
    }

    // Generate fallback SVG
    return this.generateToolFallback(toolName);
  }

  /**
   * Get background image
   */
  static getBackgroundImage(backgroundName: string): string {
    const normalizedName = backgroundName.toLowerCase().replace(/\s+/g, '-');
    return `/assets/backgrounds/${normalizedName}.svg`;
  }

  /**
   * Get news source image
   */
  static getNewsSourceImage(sourceName: string): string {
    const normalizedName = sourceName.toLowerCase().replace(/\s+/g, '-');
    const localImage = NEWS_SOURCES[normalizedName];

    if (localImage) {
      return localImage;
    }

    // Generate fallback SVG
    return this.generateNewsSourceFallback(sourceName);
  }

  /**
   * Get news category image
   */
  static getNewsCategoryImage(categoryName: string): string {
    const normalizedName = categoryName.toLowerCase().replace(/\s+/g, '-');
    const localImage = NEWS_CATEGORIES[normalizedName];

    if (localImage) {
      return localImage;
    }

    // Generate fallback SVG
    return this.generateNewsCategoryFallback(categoryName);
  }

  /**
   * Get news image (auto-detects if it's a source or category)
   */
  static getNewsImage(identifier: string, type?: 'source' | 'category'): string {
    if (type === 'source') {
      return this.getNewsSourceImage(identifier);
    } else if (type === 'category') {
      return this.getNewsCategoryImage(identifier);
    }

    // Auto-detect: try source first, then category
    const normalizedName = identifier.toLowerCase().replace(/\s+/g, '-');
    if (NEWS_SOURCES[normalizedName]) {
      return this.getNewsSourceImage(identifier);
    } else if (NEWS_CATEGORIES[normalizedName]) {
      return this.getNewsCategoryImage(identifier);
    }

    // Default to category fallback
    return this.generateNewsCategoryFallback(identifier);
  }

  /**
   * Universal image getter - automatically detects type
   */
  static getImage(identifier: string, type?: string): string {
    if (type) {
      switch (type) {
        case 'crypto': return this.getCryptoImage(identifier);
        case 'nft': return this.getNFTCollectionImage(identifier);
        case 'defi': return this.getDeFiProtocolImage(identifier);
        case 'gamefi': return this.getGameFiProjectImage(identifier);
        case 'chain': return this.getChainImage(identifier);
        case 'exchange': return this.getExchangeImage(identifier);
        case 'dao': return this.getDAOImage(identifier);
        case 'infrastructure': return this.getInfrastructureImage(identifier);
        case 'tool': return this.getWeb3ToolImage(identifier);
        case 'background': return this.getBackgroundImage(identifier);
        case 'news': return this.getNewsImage(identifier);
        case 'news-source': return this.getNewsSourceImage(identifier);
        case 'news-category': return this.getNewsCategoryImage(identifier);
        default: return this.getCryptoImage(identifier);
      }
    }

    // Auto-detect type based on identifier
    if (this.hasCryptoImage(identifier)) {
      return this.getCryptoImage(identifier);
    }

    if (identifier.startsWith('0x') && identifier.length === 42) {
      return this.getNFTCollectionImage(identifier);
    }

    // Default to crypto
    return this.getCryptoImage(identifier);
  }

  /**
   * Get protocol token symbol mapping
   */
  private static getProtocolTokenSymbol(protocolName: string): string | null {
    const mapping: Record<string, string> = {
      'uniswap': 'UNI',
      'aave': 'AAVE',
      'compound': 'COMP',
      'makerdao': 'MKR',
      'maker': 'MKR',
      'synthetix': 'SNX',
      'yearn': 'YFI',
      'yearn finance': 'YFI',
      'sushiswap': 'SUSHI',
      'curve': 'CRV',
      'balancer': 'BAL',
      'chainlink': 'LINK'
    };
    
    return mapping[protocolName.toLowerCase()] || null;
  }

  /**
   * Get GameFi token symbol mapping
   */
  private static getGameFiTokenSymbol(projectName: string): string | null {
    const mapping: Record<string, string> = {
      'axie infinity': 'AXS',
      'the sandbox': 'SAND',
      'decentraland': 'MANA',
      'enjin': 'ENJ',
      'gala': 'GALA'
    };

    return mapping[projectName.toLowerCase()] || null;
  }

  /**
   * Get DAO token symbol mapping
   */
  private static getDAOTokenSymbol(daoName: string): string | null {
    const mapping: Record<string, string> = {
      'maker': 'MKR',
      'compound': 'COMP',
      'aave': 'AAVE',
      'uniswap': 'UNI',
      'yearn': 'YFI',
      'synthetix': 'SNX',
      'curve': 'CRV',
      'balancer': 'BAL',
      'sushiswap': 'SUSHI',
      'olympus': 'OHM'
    };

    return mapping[daoName.toLowerCase()] || null;
  }

  /**
   * Get infrastructure token symbol mapping
   */
  private static getInfraTokenSymbol(projectName: string): string | null {
    const mapping: Record<string, string> = {
      'chainlink': 'LINK',
      'the graph': 'GRT',
      'filecoin': 'FIL',
      'arweave': 'AR',
      'helium': 'HNT',
      'internet computer': 'ICP',
      'polkadot': 'DOT',
      'cosmos': 'ATOM',
      'near': 'NEAR',
      'algorand': 'ALGO'
    };

    return mapping[projectName.toLowerCase()] || null;
  }

  /**
   * Generate crypto fallback SVG
   */
  private static generateCryptoFallback(symbol: string): string {
    const colors: Record<string, string> = {
      'BTC': '#f7931a', 'ETH': '#627eea', 'BNB': '#f3ba2f', 'ADA': '#0033ad',
      'SOL': '#9945ff', 'DOT': '#e6007a', 'AVAX': '#e84142', 'MATIC': '#8247e5',
      'LINK': '#375bd2', 'UNI': '#ff007a', 'AAVE': '#b6509e', 'COMP': '#00d395'
    };

    const color = colors[symbol.toUpperCase()] || '#6366f1';
    const symbolText = symbol.toUpperCase().slice(0, 3);
    const size = 64;

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="url(#grad)"/>
        <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white" 
              font-family="Arial, sans-serif" font-size="16" font-weight="bold">
          ${symbolText}
        </text>
      </svg>
    `)}`
  }

  /**
   * Generate NFT collection fallback SVG
   */
  private static generateNFTFallback(identifier: string, collectionName: string): string {
    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const color = colors[identifier.length % colors.length];
    const initials = collectionName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
    const size = 64;

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}dd;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#nftGrad)" rx="8"/>
        <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white" 
              font-family="Arial, sans-serif" font-size="18" font-weight="bold">
          ${initials}
        </text>
      </svg>
    `)}`
  }

  /**
   * Generate protocol fallback SVG
   */
  private static generateProtocolFallback(protocolName: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const color = colors[protocolName.length % colors.length];
    const letter = protocolName.charAt(0).toUpperCase();
    const size = 64;

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="protocolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#protocolGrad)" rx="12"/>
        <text x="${size/2}" y="${size/2 + 6}" text-anchor="middle" fill="white" 
              font-family="Arial, sans-serif" font-size="20" font-weight="bold">
          ${letter}
        </text>
      </svg>
    `)}`
  }

  /**
   * Generate GameFi fallback SVG
   */
  private static generateGameFiFallback(projectName: string): string {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    const color = colors[projectName.length % colors.length];
    const initials = projectName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
    const size = 64;

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="url(#gameGrad)"/>
        <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white"
              font-family="Arial, sans-serif" font-size="14" font-weight="bold">
          ${initials}
        </text>
      </svg>
    `)}`
  }

  /**
   * Generate chain fallback SVG
   */
  private static generateChainFallback(chainName: string): string {
    const colors: Record<string, string> = {
      'ethereum': '#627eea',
      'polygon': '#8247e5',
      'binance': '#f3ba2f',
      'avalanche': '#e84142',
      'arbitrum': '#28a0f0',
      'optimism': '#ff0420'
    };
    const color = colors[chainName.toLowerCase()] || '#6366f1';
    const initial = chainName.charAt(0).toUpperCase();
    const size = 64;

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="chainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="url(#chainGrad)"/>
        <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white"
              font-family="Arial, sans-serif" font-size="16" font-weight="bold">
          ${initial}
        </text>
      </svg>
    `)}`
  }

  /**
   * Generate exchange fallback SVG
   */
  private static generateExchangeFallback(exchangeName: string): string {
    const color = '#f59e0b'; // Orange for exchanges
    const initial = exchangeName.charAt(0).toUpperCase();
    const size = 64;

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="exchangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#exchangeGrad)" rx="12"/>
        <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white"
              font-family="Arial, sans-serif" font-size="16" font-weight="bold">
          ${initial}
        </text>
      </svg>
    `)}`
  }

  /**
   * Generate DAO fallback SVG
   */
  private static generateDAOFallback(daoName: string): string {
    const color = '#10b981'; // Green for DAOs
    const initial = daoName.charAt(0).toUpperCase();
    const size = 64;

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="daoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <polygon points="32,8 56,24 56,40 32,56 8,40 8,24" fill="url(#daoGrad)"/>
        <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white"
              font-family="Arial, sans-serif" font-size="16" font-weight="bold">
          ${initial}
        </text>
      </svg>
    `)}`
  }

  /**
   * Generate infrastructure fallback SVG
   */
  private static generateInfraFallback(projectName: string): string {
    const color = '#3b82f6'; // Blue for infrastructure
    const initial = projectName.charAt(0).toUpperCase();
    const size = 64;

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="infraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#infraGrad)" rx="8"/>
        <rect x="8" y="8" width="48" height="48" fill="none" stroke="white" stroke-width="2" rx="4"/>
        <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white"
              font-family="Arial, sans-serif" font-size="16" font-weight="bold">
          ${initial}
        </text>
      </svg>
    `)}`
  }

  /**
   * Generate tool fallback SVG
   */
  private static generateToolFallback(toolName: string): string {
    const color = '#8b5cf6'; // Purple for tools
    const initial = toolName.charAt(0).toUpperCase();
    const size = 64;

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="toolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="url(#toolGrad)"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 8}" fill="none" stroke="white" stroke-width="2"/>
        <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white"
              font-family="Arial, sans-serif" font-size="16" font-weight="bold">
          ${initial}
        </text>
      </svg>
    `)}`
  }

  /**
   * Generate news source fallback SVG
   */
  private static generateNewsSourceFallback(sourceName: string): string {
    const color = '#1f2937'; // Dark gray for news sources
    const initials = sourceName.split(/[-\s]/).map(word => word[0]).join('').slice(0, 2).toUpperCase();
    const size = 64;

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="newsSourceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#374151;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#newsSourceGrad)" rx="8"/>
        <rect x="8" y="8" width="48" height="48" fill="none" stroke="white" stroke-width="1" rx="4"/>
        <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white"
              font-family="Arial, sans-serif" font-size="12" font-weight="bold">
          ${initials}
        </text>
      </svg>
    `)}`
  }

  /**
   * Generate news category fallback SVG
   */
  private static generateNewsCategoryFallback(categoryName: string): string {
    const categoryColors: Record<string, { color: string; icon: string }> = {
      'bitcoin': { color: '#f7931a', icon: '₿' },
      'ethereum': { color: '#627eea', icon: 'Ξ' },
      'defi': { color: '#8b5cf6', icon: 'DeFi' },
      'nft': { color: '#ec4899', icon: 'NFT' },
      'gamefi': { color: '#10b981', icon: 'GameFi' },
      'dao': { color: '#f59e0b', icon: 'DAO' },
      'regulation': { color: '#ef4444', icon: 'REG' },
      'adoption': { color: '#06b6d4', icon: 'ADOPT' },
      'technology': { color: '#6366f1', icon: 'TECH' },
      'market': { color: '#84cc16', icon: 'MKT' },
      'breaking': { color: '#dc2626', icon: '🚨' },
      'analysis': { color: '#7c3aed', icon: '📊' }
    };

    const normalizedName = categoryName.toLowerCase();
    const categoryData = categoryColors[normalizedName] || { color: '#6b7280', icon: 'NEWS' };
    const size = 64;

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="newsCategoryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${categoryData.color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${categoryData.color}cc;stop-opacity:1" />
          </linearGradient>
          <filter id="newsGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#newsCategoryGrad)" filter="url(#newsGlow)"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 6}" fill="none" stroke="white" stroke-width="1" opacity="0.5"/>
        <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white"
              font-family="Arial, sans-serif" font-size="10" font-weight="bold">
          ${categoryData.icon}
        </text>
      </svg>
    `)}`
  }
}
