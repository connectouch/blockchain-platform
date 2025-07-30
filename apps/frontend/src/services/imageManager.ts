/**
 * Centralized Image Manager
 * Coordinates between real-time image service and fallback generators
 */

import { RealTimeImageService } from './realTimeImageService'
import { ImageService } from './imageService'

interface ImageManagerOptions {
  preferRealImages?: boolean
  cacheEnabled?: boolean
  fallbackQuality?: 'high' | 'medium' | 'low'
  timeout?: number
}

interface ImageResult {
  url: string
  isReal: boolean
  source: string
  cached: boolean
}

export class ImageManager {
  private static defaultOptions: ImageManagerOptions = {
    preferRealImages: true,
    cacheEnabled: true,
    fallbackQuality: 'high',
    timeout: 5000
  }

  // ===== CRYPTOCURRENCY IMAGES =====

  /**
   * Get the best available cryptocurrency image
   */
  static async getCryptoImage(
    symbol: string,
    options: ImageManagerOptions = {}
  ): Promise<ImageResult> {
    const opts = { ...this.defaultOptions, ...options }

    // Always try to get a real image first
    try {
      const realImageUrl = await RealTimeImageService.getCryptoImage(symbol, {
        useCache: opts.cacheEnabled,
        timeout: opts.timeout
      })

      // If we got any valid URL (real image or SVG fallback)
      if (realImageUrl) {
        const isReal = !realImageUrl.startsWith('data:image/svg+xml')
        return {
          url: realImageUrl,
          isReal,
          source: isReal ? 'api' : 'generated',
          cached: false
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch real crypto image for ${symbol}:`, error)
    }

    // Ultimate fallback - generate a simple but professional image
    const fallbackUrl = this.generateCryptoFallback(symbol)
    return {
      url: fallbackUrl,
      isReal: false,
      source: 'generated',
      cached: false
    }
  }

  /**
   * Generate a simple crypto fallback image
   */
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
    const symbolText = symbol.toUpperCase().slice(0, 3)
    const size = 32

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
              font-family="Arial, sans-serif" font-size="10" font-weight="bold">
          ${symbolText}
        </text>
      </svg>
    `)}`
  }

  // ===== NFT COLLECTION IMAGES =====

  /**
   * Get the best available NFT collection image
   */
  static async getNFTCollectionImage(
    contractAddress: string,
    collectionName: string,
    options: ImageManagerOptions = {}
  ): Promise<ImageResult> {
    const opts = { ...this.defaultOptions, ...options }

    // Always try to get a real image first
    try {
      const realImageUrl = await RealTimeImageService.getNFTCollectionImage(
        contractAddress,
        collectionName,
        {
          useCache: opts.cacheEnabled,
          timeout: opts.timeout
        }
      )

      // If we got any valid URL (real image or SVG fallback)
      if (realImageUrl) {
        const isReal = !realImageUrl.startsWith('data:image/svg+xml')
        return {
          url: realImageUrl,
          isReal,
          source: isReal ? 'api' : 'generated',
          cached: false
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch real NFT image for ${contractAddress}:`, error)
    }

    // Ultimate fallback - generate a simple but professional NFT image
    const fallbackUrl = this.generateNFTFallback(contractAddress, collectionName)
    return {
      url: fallbackUrl,
      isReal: false,
      source: 'generated',
      cached: false
    }
  }

  /**
   * Generate a simple NFT collection fallback image
   */
  private static generateNFTFallback(contractAddress: string, collectionName: string): string {
    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
    const color = colors[contractAddress.length % colors.length]
    const initials = collectionName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase() ||
                    contractAddress.slice(2, 4).toUpperCase()
    const size = 64

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
              font-family="Arial, sans-serif" font-size="16" font-weight="bold">
          ${initials}
        </text>
      </svg>
    `)}`
  }

  // ===== DEFI PROTOCOL IMAGES =====

  /**
   * Get the best available DeFi protocol image
   */
  static async getDeFiProtocolImage(
    protocolName: string,
    tokenSymbol?: string,
    options: ImageManagerOptions = {}
  ): Promise<ImageResult> {
    const opts = { ...this.defaultOptions, ...options }

    if (opts.preferRealImages) {
      try {
        const realImageUrl = await RealTimeImageService.getDeFiProtocolImage(
          protocolName,
          tokenSymbol,
          {
            useCache: opts.cacheEnabled,
            timeout: opts.timeout
          }
        )

        // Check if it's a real image (not SVG fallback)
        if (realImageUrl && !realImageUrl.startsWith('data:image/svg+xml')) {
          return {
            url: realImageUrl,
            isReal: true,
            source: 'api',
            cached: false
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch real DeFi image for ${protocolName}:`, error)
      }
    }

    // Fall back to generated image
    const fallbackUrl = ImageService.getProtocolLogo(protocolName, 'dex')
    return {
      url: fallbackUrl,
      isReal: false,
      source: 'generated',
      cached: false
    }
  }

  // ===== GAMEFI PROJECT IMAGES =====

  /**
   * Get the best available GameFi project image
   */
  static async getGameFiProjectImage(
    projectName: string,
    tokenSymbol?: string,
    options: ImageManagerOptions = {}
  ): Promise<ImageResult> {
    const opts = { ...this.defaultOptions, ...options }

    if (opts.preferRealImages) {
      try {
        const realImageUrl = await RealTimeImageService.getGameFiProjectImage(
          projectName,
          tokenSymbol,
          {
            useCache: opts.cacheEnabled,
            timeout: opts.timeout
          }
        )

        // Check if it's a real image (not SVG fallback)
        if (realImageUrl && !realImageUrl.startsWith('data:image/svg+xml')) {
          return {
            url: realImageUrl,
            isReal: true,
            source: 'api',
            cached: false
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch real GameFi image for ${projectName}:`, error)
      }
    }

    // Fall back to generated image (using DeFi generator for now)
    const fallbackUrl = ImageService.getProtocolLogo(projectName, 'dex')
    return {
      url: fallbackUrl,
      isReal: false,
      source: 'generated',
      cached: false
    }
  }

  // ===== BATCH OPERATIONS =====

  /**
   * Preload multiple crypto images for better performance
   */
  static async preloadCryptoImages(symbols: string[]): Promise<void> {
    const promises = symbols.map(symbol => 
      this.getCryptoImage(symbol, { cacheEnabled: true })
    )
    await Promise.allSettled(promises)
  }

  /**
   * Preload multiple NFT collection images
   */
  static async preloadNFTImages(
    collections: Array<{ contractAddress: string; name: string }>
  ): Promise<void> {
    const promises = collections.map(collection => 
      this.getNFTCollectionImage(collection.contractAddress, collection.name, { cacheEnabled: true })
    )
    await Promise.allSettled(promises)
  }

  /**
   * Preload multiple DeFi protocol images
   */
  static async preloadDeFiImages(
    protocols: Array<{ name: string; tokenSymbol?: string }>
  ): Promise<void> {
    const promises = protocols.map(protocol => 
      this.getDeFiProtocolImage(protocol.name, protocol.tokenSymbol, { cacheEnabled: true })
    )
    await Promise.allSettled(promises)
  }

  // ===== UTILITY METHODS =====

  /**
   * Clear all cached images
   */
  static clearCache(): void {
    RealTimeImageService.clearExpiredCache()
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; hitRate: number } {
    return RealTimeImageService.getCacheStats()
  }

  /**
   * Configure default options
   */
  static setDefaultOptions(options: Partial<ImageManagerOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options }
  }

  /**
   * Check if an image URL is a real image or generated fallback
   */
  static isRealImage(url: string): boolean {
    return !url.startsWith('data:image/svg+xml')
  }

  /**
   * Get image quality score based on source and type
   */
  static getImageQuality(result: ImageResult): number {
    if (!result.isReal) return 0.3

    const sourceScores: Record<string, number> = {
      'coinmarketcap': 0.9,
      'coingecko': 0.8,
      'opensea': 0.9,
      'alchemy': 0.8,
      'cryptologos': 0.7,
      'defipulse': 0.8,
      'api': 0.8
    }

    return sourceScores[result.source] || 0.5
  }
}
