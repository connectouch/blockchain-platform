import { EventEmitter } from 'events'

export interface OfflineData {
  marketOverview: any
  prices: any
  defiProtocols: any[]
  nftCollections: any[]
  gamefiProjects: any[]
  lastUpdated: Date
}

export interface CacheEntry {
  data: any
  timestamp: Date
  expiresAt: Date
}

/**
 * Offline Service for Connectouch Desktop Application
 * Provides cached data and offline functionality when network is unavailable
 */
export class OfflineService extends EventEmitter {
  private cache = new Map<string, CacheEntry>()
  private isOfflineMode = false
  private offlineData: OfflineData | null = null
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  private readonly STORAGE_KEY = 'connectouch_offline_data'

  constructor() {
    super()
    this.loadOfflineData()
    this.setupNetworkListeners()
  }

  private setupNetworkListeners(): void {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('🌐 Network connection restored')
        this.setOfflineMode(false)
      })

      window.addEventListener('offline', () => {
        console.log('📴 Network connection lost')
        this.setOfflineMode(true)
      })

      // Initial state
      this.setOfflineMode(!navigator.onLine)
    }
  }

  private loadOfflineData(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          this.offlineData = {
            ...parsed,
            lastUpdated: new Date(parsed.lastUpdated)
          }
          console.log('📦 Loaded offline data from storage')
        }
      }
    } catch (error) {
      console.error('❌ Failed to load offline data:', error)
    }
  }

  private saveOfflineData(): void {
    try {
      if (typeof localStorage !== 'undefined' && this.offlineData) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.offlineData))
        console.log('💾 Saved offline data to storage')
      }
    } catch (error) {
      console.error('❌ Failed to save offline data:', error)
    }
  }

  setOfflineMode(offline: boolean): void {
    if (this.isOfflineMode !== offline) {
      this.isOfflineMode = offline
      this.emit('offlineModeChanged', offline)
      
      if (offline) {
        console.log('📴 Entering offline mode')
        this.emit('offlineModeActivated')
      } else {
        console.log('🌐 Exiting offline mode')
        this.emit('offlineModeDeactivated')
      }
    }
  }

  isOffline(): boolean {
    return this.isOfflineMode
  }

  // Cache management
  setCache(key: string, data: any, customDuration?: number): void {
    const duration = customDuration || this.CACHE_DURATION
    const entry: CacheEntry = {
      data,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + duration)
    }
    
    this.cache.set(key, entry)
    console.log(`💾 Cached data for key: ${key}`)
  }

  getCache(key: string): any | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    if (entry.expiresAt < new Date()) {
      this.cache.delete(key)
      console.log(`🗑️ Expired cache for key: ${key}`)
      return null
    }

    console.log(`📦 Retrieved cached data for key: ${key}`)
    return entry.data
  }

  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key)
      console.log(`🗑️ Cleared cache for key: ${key}`)
    } else {
      this.cache.clear()
      console.log('🗑️ Cleared all cache')
    }
  }

  // Offline data management
  updateOfflineData(data: Partial<OfflineData>): void {
    this.offlineData = {
      marketOverview: data.marketOverview || this.offlineData?.marketOverview || this.getFallbackMarketOverview(),
      prices: data.prices || this.offlineData?.prices || this.getFallbackPrices(),
      defiProtocols: data.defiProtocols || this.offlineData?.defiProtocols || [],
      nftCollections: data.nftCollections || this.offlineData?.nftCollections || [],
      gamefiProjects: data.gamefiProjects || this.offlineData?.gamefiProjects || [],
      lastUpdated: new Date()
    }

    this.saveOfflineData()
    this.emit('offlineDataUpdated', this.offlineData)
  }

  getOfflineData(): OfflineData | null {
    return this.offlineData
  }

  // Fallback data providers
  private getFallbackMarketOverview(): any {
    return {
      totalMarketCap: '$1.2T',
      totalGrowth24h: '+2.4%',
      activeSectors: 8,
      topPerformers: ['DeFi', 'Layer 2', 'Gaming', 'NFTs'],
      bitcoin: {
        price: '$43,250',
        change: '+2.1%',
        marketCap: 847000000000,
        volume: 15200000000
      },
      ethereum: {
        price: '$2,650',
        change: '+1.8%',
        marketCap: 318000000000,
        volume: 8900000000
      },
      timestamp: new Date().toISOString(),
      isRealTime: false,
      dataSource: 'Offline fallback data'
    }
  }

  private getFallbackPrices(): any {
    return {
      bitcoin: {
        usd: 43250,
        usd_24h_change: 2.1,
        usd_market_cap: 847000000000,
        usd_24h_vol: 15200000000
      },
      ethereum: {
        usd: 2650,
        usd_24h_change: 1.8,
        usd_market_cap: 318000000000,
        usd_24h_vol: 8900000000
      },
      binancecoin: {
        usd: 310,
        usd_24h_change: 1.2,
        usd_market_cap: 47000000000,
        usd_24h_vol: 1200000000
      }
    }
  }

  // Data retrieval methods for offline mode
  getMarketOverview(): any {
    if (this.isOfflineMode) {
      const cached = this.getCache('market-overview')
      if (cached) return cached

      return this.offlineData?.marketOverview || this.getFallbackMarketOverview()
    }
    return null
  }

  getPrices(): any {
    if (this.isOfflineMode) {
      const cached = this.getCache('prices')
      if (cached) return cached

      return this.offlineData?.prices || this.getFallbackPrices()
    }
    return null
  }

  getDeFiProtocols(): any[] {
    if (this.isOfflineMode) {
      const cached = this.getCache('defi-protocols')
      if (cached) return cached

      return this.offlineData?.defiProtocols || []
    }
    return []
  }

  getNFTCollections(): any[] {
    if (this.isOfflineMode) {
      const cached = this.getCache('nft-collections')
      if (cached) return cached

      return this.offlineData?.nftCollections || []
    }
    return []
  }

  getGameFiProjects(): any[] {
    if (this.isOfflineMode) {
      const cached = this.getCache('gamefi-projects')
      if (cached) return cached

      return this.offlineData?.gamefiProjects || []
    }
    return []
  }

  // Utility methods
  getDataAge(): number | null {
    if (!this.offlineData) return null
    return Date.now() - this.offlineData.lastUpdated.getTime()
  }

  isDataStale(maxAge: number = this.CACHE_DURATION): boolean {
    const age = this.getDataAge()
    return age === null || age > maxAge
  }

  getOfflineStatus(): {
    isOffline: boolean
    hasOfflineData: boolean
    dataAge: number | null
    isDataStale: boolean
    cacheSize: number
  } {
    return {
      isOffline: this.isOfflineMode,
      hasOfflineData: this.offlineData !== null,
      dataAge: this.getDataAge(),
      isDataStale: this.isDataStale(),
      cacheSize: this.cache.size
    }
  }

  // Cleanup
  cleanup(): void {
    this.cache.clear()
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY)
    }
    console.log('🧹 Offline service cleaned up')
  }
}

// Create singleton instance
export const offlineService = new OfflineService()
export default offlineService
