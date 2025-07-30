/**
 * Real-Time Image Collection Service
 * Fetches authentic images from multiple APIs and provides intelligent caching
 */

interface ImageSource {
  url: string
  source: string
  quality: 'high' | 'medium' | 'low'
  lastUpdated: number
  verified: boolean
}

interface CachedImage {
  sources: ImageSource[]
  fallbackSvg: string
  lastFetched: number
  ttl: number
}

interface ImageFetchOptions {
  preferredSize?: number
  maxRetries?: number
  timeout?: number
  useCache?: boolean
  forceFresh?: boolean
}

export class RealTimeImageService {
  private static cache = new Map<string, CachedImage>()
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours
  private static readonly API_TIMEOUT = 5000 // 5 seconds

  // ===== CRYPTOCURRENCY IMAGES =====

  /**
   * Get real cryptocurrency logo from multiple sources
   */
  static async getCryptoImage(
    symbol: string, 
    options: ImageFetchOptions = {}
  ): Promise<string> {
    const cacheKey = `crypto_${symbol.toLowerCase()}`
    
    // Check cache first
    if (options.useCache !== false && !options.forceFresh) {
      const cached = this.getCachedImage(cacheKey)
      if (cached) return this.getBestImageUrl(cached.sources) || cached.fallbackSvg
    }

    const sources: ImageSource[] = []

    // Try CoinMarketCap API first (most reliable with our API key)
    try {
      const cmcUrl = await this.fetchFromCoinMarketCap(symbol)
      if (cmcUrl && !cmcUrl.startsWith('data:image/svg+xml')) {
        sources.push({
          url: cmcUrl,
          source: 'coinmarketcap',
          quality: 'high',
          lastUpdated: Date.now(),
          verified: true
        })
      }
    } catch (error) {
      console.warn(`CoinMarketCap fetch failed for ${symbol}:`, error)
    }

    // Try CoinGecko API as backup
    try {
      const coingeckoUrl = await this.fetchFromCoinGecko(symbol)
      if (coingeckoUrl && !coingeckoUrl.startsWith('data:image/svg+xml')) {
        sources.push({
          url: coingeckoUrl,
          source: 'coingecko',
          quality: 'high',
          lastUpdated: Date.now(),
          verified: true
        })
      }
    } catch (error) {
      console.warn(`CoinGecko fetch failed for ${symbol}:`, error)
    }

    // Try CryptoLogos.cc (reliable CDN)
    const cryptoLogosUrl = this.getCryptoLogosUrl(symbol)
    if (cryptoLogosUrl) {
      sources.push({
        url: cryptoLogosUrl,
        source: 'cryptologos',
        quality: 'medium',
        lastUpdated: Date.now(),
        verified: true
      })
    }

    // Generate fallback SVG
    const fallbackSvg = this.generateCryptoFallback(symbol)

    // Cache the result
    this.setCachedImage(cacheKey, {
      sources,
      fallbackSvg,
      lastFetched: Date.now(),
      ttl: this.CACHE_TTL
    })

    // Always return a valid URL - prefer real images, but guarantee fallback
    const bestUrl = this.getBestImageUrl(sources)
    return bestUrl || fallbackSvg
  }

  // ===== NFT COLLECTION IMAGES =====

  /**
   * Get real NFT collection images from multiple sources
   */
  static async getNFTCollectionImage(
    contractAddress: string,
    collectionName: string,
    options: ImageFetchOptions = {}
  ): Promise<string> {
    const cacheKey = `nft_collection_${contractAddress.toLowerCase()}`
    
    // Check cache first
    if (options.useCache !== false && !options.forceFresh) {
      const cached = this.getCachedImage(cacheKey)
      if (cached) return this.getBestImageUrl(cached.sources) || cached.fallbackSvg
    }

    const sources: ImageSource[] = []

    // Try OpenSea API
    try {
      const openSeaUrl = await this.fetchFromOpenSea(contractAddress)
      if (openSeaUrl) {
        sources.push({
          url: openSeaUrl,
          source: 'opensea',
          quality: 'high',
          lastUpdated: Date.now(),
          verified: true
        })
      }
    } catch (error) {
      console.warn(`OpenSea fetch failed for ${contractAddress}:`, error)
    }

    // Try Alchemy NFT API
    try {
      const alchemyUrl = await this.fetchFromAlchemy(contractAddress)
      if (alchemyUrl) {
        sources.push({
          url: alchemyUrl,
          source: 'alchemy',
          quality: 'high',
          lastUpdated: Date.now(),
          verified: true
        })
      }
    } catch (error) {
      console.warn(`Alchemy fetch failed for ${contractAddress}:`, error)
    }

    // Generate fallback SVG
    const fallbackSvg = this.generateNFTCollectionFallback(collectionName, contractAddress)

    // Cache the result
    this.setCachedImage(cacheKey, {
      sources,
      fallbackSvg,
      lastFetched: Date.now(),
      ttl: this.CACHE_TTL
    })

    return this.getBestImageUrl(sources) || fallbackSvg
  }

  // ===== DEFI PROTOCOL IMAGES =====

  /**
   * Get real DeFi protocol logos
   */
  static async getDeFiProtocolImage(
    protocolName: string,
    tokenSymbol?: string,
    options: ImageFetchOptions = {}
  ): Promise<string> {
    const cacheKey = `defi_${protocolName.toLowerCase()}`
    
    // Check cache first
    if (options.useCache !== false && !options.forceFresh) {
      const cached = this.getCachedImage(cacheKey)
      if (cached) return this.getBestImageUrl(cached.sources) || cached.fallbackSvg
    }

    const sources: ImageSource[] = []

    // Try DeFiPulse API
    try {
      const defiPulseUrl = await this.fetchFromDeFiPulse(protocolName)
      if (defiPulseUrl) {
        sources.push({
          url: defiPulseUrl,
          source: 'defipulse',
          quality: 'high',
          lastUpdated: Date.now(),
          verified: true
        })
      }
    } catch (error) {
      console.warn(`DeFiPulse fetch failed for ${protocolName}:`, error)
    }

    // If protocol has a token, try crypto APIs
    if (tokenSymbol) {
      try {
        const cryptoUrl = await this.getCryptoImage(tokenSymbol, { useCache: true })
        if (cryptoUrl && !cryptoUrl.startsWith('data:image/svg+xml')) {
          sources.push({
            url: cryptoUrl,
            source: 'crypto_token',
            quality: 'medium',
            lastUpdated: Date.now(),
            verified: true
          })
        }
      } catch (error) {
        console.warn(`Crypto token fetch failed for ${tokenSymbol}:`, error)
      }
    }

    // Generate fallback SVG
    const fallbackSvg = this.generateDeFiProtocolFallback(protocolName)

    // Cache the result
    this.setCachedImage(cacheKey, {
      sources,
      fallbackSvg,
      lastFetched: Date.now(),
      ttl: this.CACHE_TTL
    })

    return this.getBestImageUrl(sources) || fallbackSvg
  }

  // ===== GAMEFI PROJECT IMAGES =====

  /**
   * Get real GameFi project images
   */
  static async getGameFiProjectImage(
    projectName: string,
    tokenSymbol?: string,
    options: ImageFetchOptions = {}
  ): Promise<string> {
    const cacheKey = `gamefi_${projectName.toLowerCase()}`
    
    // Check cache first
    if (options.useCache !== false && !options.forceFresh) {
      const cached = this.getCachedImage(cacheKey)
      if (cached) return this.getBestImageUrl(cached.sources) || cached.fallbackSvg
    }

    const sources: ImageSource[] = []

    // Try CoinGecko for gaming tokens
    if (tokenSymbol) {
      try {
        const cryptoUrl = await this.getCryptoImage(tokenSymbol, { useCache: true })
        if (cryptoUrl && !cryptoUrl.startsWith('data:image/svg+xml')) {
          sources.push({
            url: cryptoUrl,
            source: 'gaming_token',
            quality: 'high',
            lastUpdated: Date.now(),
            verified: true
          })
        }
      } catch (error) {
        console.warn(`Gaming token fetch failed for ${tokenSymbol}:`, error)
      }
    }

    // Generate fallback SVG
    const fallbackSvg = this.generateGameFiFallback(projectName)

    // Cache the result
    this.setCachedImage(cacheKey, {
      sources,
      fallbackSvg,
      lastFetched: Date.now(),
      ttl: this.CACHE_TTL
    })

    return this.getBestImageUrl(sources) || fallbackSvg
  }

  // ===== PRIVATE HELPER METHODS =====

  private static getCachedImage(key: string): CachedImage | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    // Check if cache is expired
    if (Date.now() - cached.lastFetched > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached
  }

  private static setCachedImage(key: string, image: CachedImage): void {
    this.cache.set(key, image)
  }

  private static getBestImageUrl(sources: ImageSource[]): string | null {
    if (sources.length === 0) return null

    // Filter out invalid URLs and SVG fallbacks for real image selection
    const validSources = sources.filter(source =>
      source.url &&
      !source.url.startsWith('data:image/svg+xml') &&
      source.url.startsWith('http')
    )

    if (!validSources.length) {
      // If no valid real images, return the first available (might be SVG)
      return sources[0]?.url || null
    }

    // Sort by quality and verification status
    const sorted = validSources.sort((a, b) => {
      if (a.verified !== b.verified) return a.verified ? -1 : 1
      if (a.quality !== b.quality) {
        const qualityOrder = { high: 3, medium: 2, low: 1 }
        return qualityOrder[b.quality] - qualityOrder[a.quality]
      }
      return b.lastUpdated - a.lastUpdated
    })

    return sorted[0].url
  }

  // ===== API FETCH METHODS =====

  private static async fetchFromCoinGecko(symbol: string): Promise<string | null> {
    try {
      // CoinGecko public API for coin info - use direct API call
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`,
        {
          signal: AbortSignal.timeout(this.API_TIMEOUT),
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Connectouch-Platform/1.0'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        return data.image?.large || data.image?.small || null
      }
    } catch (error) {
      console.warn(`CoinGecko API error for ${symbol}:`, error)
    }
    return null
  }

  private static async fetchFromCoinMarketCap(symbol: string): Promise<string | null> {
    try {
      // Use Netlify function for CoinMarketCap API
      const response = await fetch(`/.netlify/functions/crypto-logo/${symbol}`, {
        signal: AbortSignal.timeout(this.API_TIMEOUT),
        headers: { 'Accept': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        return data.logo || data.image || null
      }
    } catch (error) {
      console.warn(`CoinMarketCap API error for ${symbol}:`, error)
    }
    return null
  }

  private static getCryptoLogosUrl(symbol: string): string | null {
    const logoUrls: Record<string, string> = {
      'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      'BNB': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
      'ADA': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
      'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.png',
      'DOT': 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
      'AVAX': 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
      'MATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
      'LINK': 'https://cryptologos.cc/logos/chainlink-link-logo.png',
      'UNI': 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
      'AAVE': 'https://cryptologos.cc/logos/aave-aave-logo.png',
      'COMP': 'https://cryptologos.cc/logos/compound-comp-logo.png',
      'MKR': 'https://cryptologos.cc/logos/maker-mkr-logo.png',
      'SNX': 'https://cryptologos.cc/logos/synthetix-snx-logo.png',
      'YFI': 'https://cryptologos.cc/logos/yearn-finance-yfi-logo.png',
      'SUSHI': 'https://cryptologos.cc/logos/sushiswap-sushi-logo.png',
      'CRV': 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.png',
      'BAL': 'https://cryptologos.cc/logos/balancer-bal-logo.png',
      'USDC': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      'USDT': 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      'DAI': 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png'
    }

    return logoUrls[symbol.toUpperCase()] || null
  }

  private static async fetchFromOpenSea(contractAddress: string): Promise<string | null> {
    try {
      // OpenSea API v2 for collection info - try multiple endpoints
      const endpoints = [
        `https://api.opensea.io/api/v2/collections/${contractAddress}`,
        `https://api.opensea.io/api/v1/asset_contract/${contractAddress}`,
        `https://api.opensea.io/api/v1/collection/${contractAddress}`
      ]

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            signal: AbortSignal.timeout(this.API_TIMEOUT),
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Connectouch-Platform/1.0'
            }
          })

          if (response.ok) {
            const data = await response.json()
            // Try different response structures
            const imageUrl = data.image_url ||
                           data.collection?.image_url ||
                           data.collection?.featured_image_url ||
                           data.featured_image_url ||
                           data.image

            if (imageUrl) return imageUrl
          }
        } catch (endpointError) {
          console.warn(`OpenSea endpoint ${endpoint} failed:`, endpointError)
          continue
        }
      }
    } catch (error) {
      console.warn(`OpenSea API error for ${contractAddress}:`, error)
    }
    return null
  }

  private static async fetchFromAlchemy(contractAddress: string): Promise<string | null> {
    try {
      // Use Netlify function for Alchemy API to avoid CORS
      const response = await fetch(`/.netlify/functions/nft-collection/${contractAddress}`, {
        signal: AbortSignal.timeout(this.API_TIMEOUT),
        headers: { 'Accept': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        return data.image || data.imageUrl || null
      }
    } catch (error) {
      console.warn(`Alchemy API error for ${contractAddress}:`, error)
    }
    return null
  }

  private static async fetchFromDeFiPulse(protocolName: string): Promise<string | null> {
    try {
      // DeFiPulse API for protocol info
      const response = await fetch(
        `https://data-api.defipulse.com/api/v1/egs/api/ethgasAPI.json?api-key=free`,
        { signal: AbortSignal.timeout(this.API_TIMEOUT) }
      )

      // This is a placeholder - actual implementation would need proper DeFiPulse integration
      return null
    } catch (error) {
      console.warn(`DeFiPulse API error for ${protocolName}:`, error)
    }
    return null
  }

  // ===== FALLBACK GENERATORS =====

  private static generateCryptoFallback(symbol: string): string {
    const colors: Record<string, string> = {
      'BTC': '#f7931a', 'ETH': '#627eea', 'BNB': '#f3ba2f', 'ADA': '#0033ad',
      'SOL': '#9945ff', 'DOT': '#e6007a', 'AVAX': '#e84142', 'MATIC': '#8247e5',
      'LINK': '#375bd2', 'UNI': '#ff007a', 'AAVE': '#b6509e', 'COMP': '#00d395',
      'MKR': '#1aab9b', 'SNX': '#5fcdf7', 'YFI': '#006ae3', 'SUSHI': '#fa52a0',
      'CRV': '#40649f', 'BAL': '#1e1e1e', 'USDC': '#2775ca', 'USDT': '#26a17b',
      'DAI': '#f5ac37'
    }

    const color = colors[symbol.toUpperCase()] || '#6366f1'
    const symbolText = symbol.toUpperCase().slice(0, 4)
    const size = 64

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cryptoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#cryptoGrad)"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="none" stroke="white" stroke-width="2" opacity="0.3"/>
        <text x="${size/2}" y="${size/2 + 6}" text-anchor="middle" fill="white"
              font-family="Arial, sans-serif" font-size="18" font-weight="bold">
          ${symbolText}
        </text>
      </svg>
    `)}`
  }

  private static generateNFTCollectionFallback(collectionName: string, contractAddress: string): string {
    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
    const color = colors[contractAddress.length % colors.length]
    const initials = collectionName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()
    const size = 300

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}dd;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#nftGrad)" rx="24"/>
        <rect x="20" y="20" width="${size-40}" height="${size-40}" fill="none" stroke="white" stroke-width="4" rx="16" opacity="0.8"/>
        <g transform="translate(${size/2 - 20}, ${size/2 - 50})" fill="white" opacity="0.9">
          <path d="M8 2L12 8L16 2L20 8L24 2L22 18H10L8 2Z" stroke="white" stroke-width="2"/>
        </g>
        <text x="${size/2}" y="${size/2 + 10}" text-anchor="middle" fill="white"
              font-family="Arial, sans-serif" font-size="32" font-weight="bold">
          ${initials}
        </text>
        <text x="${size/2}" y="${size/2 + 40}" text-anchor="middle" fill="white"
              font-family="Arial, sans-serif" font-size="16" opacity="0.8">
          Collection
        </text>
      </svg>
    `)}`
  }

  private static generateDeFiProtocolFallback(protocolName: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
    const color = colors[protocolName.length % colors.length]
    const letter = protocolName.charAt(0).toUpperCase()
    const size = 64

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="defiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#defiGrad)" rx="12"/>
        <rect x="4" y="4" width="${size-8}" height="${size-8}" fill="none" stroke="white" stroke-width="2" rx="8" opacity="0.3"/>
        <text x="${size/2}" y="${size/2 + 8}" text-anchor="middle" fill="white"
              font-family="Arial, sans-serif" font-size="24" font-weight="bold">
          ${letter}
        </text>
      </svg>
    `)}`
  }

  private static generateGameFiFallback(projectName: string): string {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']
    const color = colors[projectName.length % colors.length]
    const initials = projectName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()
    const size = 64

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#gameGrad)"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 6}" fill="none" stroke="white" stroke-width="2" opacity="0.4"/>
        <text x="${size/2}" y="${size/2 + 6}" text-anchor="middle" fill="white"
              font-family="Arial, sans-serif" font-size="16" font-weight="bold">
          ${initials}
        </text>
      </svg>
    `)}`
  }

  // ===== UTILITY METHODS =====

  /**
   * Clear expired cache entries
   */
  static clearExpiredCache(): void {
    const now = Date.now()
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.lastFetched > cached.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // Would need to track hits/misses for accurate calculation
    }
  }

  /**
   * Preload images for better performance
   */
  static async preloadImages(symbols: string[]): Promise<void> {
    const promises = symbols.map(symbol =>
      this.getCryptoImage(symbol, { useCache: true })
    )
    await Promise.allSettled(promises)
  }
}
