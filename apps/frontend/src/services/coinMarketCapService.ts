/**
 * CoinMarketCap API Service for Real-time Crypto Data
 * Provides comprehensive cryptocurrency market data
 */

import axios, { AxiosInstance } from 'axios'

export interface CryptoQuote {
  id: number
  name: string
  symbol: string
  slug: string
  cmc_rank: number
  num_market_pairs: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  last_updated: string
  date_added: string
  tags: string[]
  platform: any
  quote: {
    USD: {
      price: number
      volume_24h: number
      volume_change_24h: number
      percent_change_1h: number
      percent_change_24h: number
      percent_change_7d: number
      percent_change_30d: number
      percent_change_60d: number
      percent_change_90d: number
      market_cap: number
      market_cap_dominance: number
      fully_diluted_market_cap: number
      last_updated: string
    }
  }
}

export interface GlobalMetrics {
  active_cryptocurrencies: number
  total_cryptocurrencies: number
  active_market_pairs: number
  active_exchanges: number
  total_exchanges: number
  eth_dominance: number
  btc_dominance: number
  eth_dominance_yesterday: number
  btc_dominance_yesterday: number
  eth_dominance_24h_percentage_change: number
  btc_dominance_24h_percentage_change: number
  defi_volume_24h: number
  defi_volume_24h_reported: number
  defi_24h_percentage_change: number
  defi_market_cap: number
  defi_market_cap_24h_percentage_change: number
  stablecoin_volume_24h: number
  stablecoin_volume_24h_reported: number
  stablecoin_24h_percentage_change: number
  stablecoin_market_cap: number
  stablecoin_market_cap_24h_percentage_change: number
  derivatives_volume_24h: number
  derivatives_volume_24h_reported: number
  derivatives_24h_percentage_change: number
  quote: {
    USD: {
      total_market_cap: number
      total_volume_24h: number
      total_volume_24h_reported: number
      altcoin_volume_24h: number
      altcoin_volume_24h_reported: number
      altcoin_market_cap: number
      defi_volume_24h: number
      defi_volume_24h_reported: number
      defi_24h_percentage_change: number
      defi_market_cap: number
      defi_market_cap_24h_percentage_change: number
      stablecoin_volume_24h: number
      stablecoin_volume_24h_reported: number
      stablecoin_24h_percentage_change: number
      stablecoin_market_cap: number
      stablecoin_market_cap_24h_percentage_change: number
      derivatives_volume_24h: number
      derivatives_volume_24h_reported: number
      derivatives_24h_percentage_change: number
      total_market_cap_yesterday: number
      total_volume_24h_yesterday: number
      total_market_cap_yesterday_percentage_change: number
      total_volume_24h_yesterday_percentage_change: number
      last_updated: string
    }
  }
}

class CoinMarketCapService {
  private api: AxiosInstance
  private apiKey: string
  private cache = new Map<string, { data: any; expires: number }>()
  private readonly CACHE_TTL = 60000 // 1 minute

  constructor() {
    // Use our secure Vercel API endpoint instead of direct API calls
    this.api = axios.create({
      baseURL: '/api',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 15000
    })

    console.log('🚀 CoinMarketCap Service initialized with secure API endpoint')
  }

  /**
   * Get latest cryptocurrency listings
   */
  async getLatestListings(limit: number = 100): Promise<CryptoQuote[]> {
    const cacheKey = `listings_${limit}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      // Try CoinMarketCap API FIRST (your premium API key)
      console.log('🚀 Trying CoinMarketCap API with your premium key...')
      const response = await this.api.get('/crypto-data', {
        params: { limit }
      })

      if (response.data.success) {
        const data = response.data.data.cryptocurrencies
        this.setCache(cacheKey, data)

        console.log(`✅ Fetched ${data.length} crypto listings from CoinMarketCap (PREMIUM)`)
        return data
      } else {
        throw new Error('CoinMarketCap API returned unsuccessful response')
      }
    } catch (error) {
      console.error('❌ CoinMarketCap API error, trying free alternative:', error)

      // Fallback to free CoinGecko API
      try {
        console.log('🔄 Falling back to CoinGecko free API...')
        const backupResponse = await this.api.get('/crypto-free', {
          params: { limit }
        })

        if (backupResponse.data.success) {
          const data = backupResponse.data.data.cryptocurrencies
          this.setCache(cacheKey, data)
          console.log(`✅ Fetched ${data.length} crypto listings from CoinGecko (FREE FALLBACK)`)
          return data
        }
      } catch (backupError) {
        console.error('❌ Free API also failed:', backupError)
      }

      console.log('⚠️ Using enhanced fallback data')
      return this.getFallbackData()
    }
  }

  /**
   * Get specific cryptocurrency quotes
   */
  async getCryptoQuotes(symbols: string[]): Promise<Record<string, CryptoQuote>> {
    const cacheKey = `quotes_${symbols.join(',')}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const response = await this.api.get('/cryptocurrency/quotes/latest', {
        params: {
          symbol: symbols.join(','),
          convert: 'USD'
        }
      })

      const data = response.data.data
      this.setCache(cacheKey, data)
      
      console.log(`✅ Fetched quotes for ${symbols.length} cryptocurrencies`)
      return data
    } catch (error) {
      console.error('❌ CoinMarketCap quotes error:', error)
      return this.getFallbackQuotes(symbols)
    }
  }

  /**
   * Get global cryptocurrency metrics
   */
  async getGlobalMetrics(): Promise<GlobalMetrics | null> {
    const cacheKey = 'global_metrics'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      // Try CoinMarketCap API FIRST (your premium API key)
      console.log('🚀 Trying CoinMarketCap global metrics with your premium key...')
      const response = await this.api.get('/crypto-data')

      if (response.data.success && response.data.data.globalMetrics) {
        const data = response.data.data.globalMetrics
        this.setCache(cacheKey, data)

        console.log('✅ Fetched global crypto metrics from CoinMarketCap (PREMIUM)')
        return data
      } else {
        throw new Error('CoinMarketCap global metrics not available')
      }
    } catch (error) {
      console.error('❌ CoinMarketCap global metrics error, trying free alternative:', error)

      // Fallback to free API
      try {
        console.log('🔄 Falling back to CoinGecko for global metrics...')
        const backupResponse = await this.api.get('/crypto-free')
        if (backupResponse.data.success && backupResponse.data.data.globalMetrics) {
          const data = backupResponse.data.data.globalMetrics
          this.setCache(cacheKey, data)
          console.log('✅ Fetched global metrics from CoinGecko (FREE FALLBACK)')
          return data
        }
      } catch (backupError) {
        console.error('❌ Free global metrics also failed:', backupError)
      }

      console.log('⚠️ Using fallback global metrics')
      return this.getFallbackGlobalMetrics()
    }
  }

  /**
   * Search cryptocurrencies
   */
  async searchCryptocurrencies(query: string): Promise<any[]> {
    try {
      const response = await this.api.get('/cryptocurrency/map', {
        params: {
          listing_status: 'active',
          start: 1,
          limit: 50
        }
      })

      const data = response.data.data
      const filtered = data.filter((crypto: any) => 
        crypto.name.toLowerCase().includes(query.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(query.toLowerCase())
      )

      console.log(`✅ Found ${filtered.length} cryptocurrencies matching "${query}"`)
      return filtered
    } catch (error) {
      console.error('❌ CoinMarketCap search error:', error)
      return []
    }
  }

  /**
   * Cache management
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.CACHE_TTL
    })
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key)
    if (cached && cached.expires > Date.now()) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  /**
   * Fallback data for when API fails
   */
  private getFallbackData(): CryptoQuote[] {
    return [
      {
        id: 1,
        name: 'Bitcoin',
        symbol: 'BTC',
        slug: 'bitcoin',
        cmc_rank: 1,
        num_market_pairs: 500,
        circulating_supply: 19000000,
        total_supply: 19000000,
        max_supply: 21000000,
        last_updated: new Date().toISOString(),
        date_added: '2013-04-28T00:00:00.000Z',
        tags: ['mineable'],
        platform: null,
        quote: {
          USD: {
            price: 43000,
            volume_24h: 15000000000,
            volume_change_24h: 2.5,
            percent_change_1h: 0.5,
            percent_change_24h: 2.1,
            percent_change_7d: 5.2,
            percent_change_30d: 8.7,
            percent_change_60d: 15.3,
            percent_change_90d: 22.1,
            market_cap: 817000000000,
            market_cap_dominance: 52.5,
            fully_diluted_market_cap: 903000000000,
            last_updated: new Date().toISOString()
          }
        }
      }
    ]
  }

  private getFallbackQuotes(symbols: string[]): Record<string, CryptoQuote> {
    const fallback: Record<string, CryptoQuote> = {}
    symbols.forEach((symbol, index) => {
      fallback[symbol] = this.getFallbackData()[0]
    })
    return fallback
  }

  private getFallbackGlobalMetrics(): GlobalMetrics {
    return {
      active_cryptocurrencies: 9000,
      total_cryptocurrencies: 12000,
      active_market_pairs: 50000,
      active_exchanges: 500,
      total_exchanges: 750,
      eth_dominance: 18.5,
      btc_dominance: 52.5,
      eth_dominance_yesterday: 18.2,
      btc_dominance_yesterday: 52.8,
      eth_dominance_24h_percentage_change: 1.6,
      btc_dominance_24h_percentage_change: -0.6,
      defi_volume_24h: 5000000000,
      defi_volume_24h_reported: 5200000000,
      defi_24h_percentage_change: 3.2,
      defi_market_cap: 85000000000,
      defi_market_cap_24h_percentage_change: 2.8,
      stablecoin_volume_24h: 25000000000,
      stablecoin_volume_24h_reported: 26000000000,
      stablecoin_24h_percentage_change: 1.2,
      stablecoin_market_cap: 150000000000,
      stablecoin_market_cap_24h_percentage_change: 0.5,
      derivatives_volume_24h: 75000000000,
      derivatives_volume_24h_reported: 78000000000,
      derivatives_24h_percentage_change: 4.1,
      quote: {
        USD: {
          total_market_cap: 1550000000000,
          total_volume_24h: 65000000000,
          total_volume_24h_reported: 68000000000,
          altcoin_volume_24h: 35000000000,
          altcoin_volume_24h_reported: 37000000000,
          altcoin_market_cap: 735000000000,
          defi_volume_24h: 5000000000,
          defi_volume_24h_reported: 5200000000,
          defi_24h_percentage_change: 3.2,
          defi_market_cap: 85000000000,
          defi_market_cap_24h_percentage_change: 2.8,
          stablecoin_volume_24h: 25000000000,
          stablecoin_volume_24h_reported: 26000000000,
          stablecoin_24h_percentage_change: 1.2,
          stablecoin_market_cap: 150000000000,
          stablecoin_market_cap_24h_percentage_change: 0.5,
          derivatives_volume_24h: 75000000000,
          derivatives_volume_24h_reported: 78000000000,
          derivatives_24h_percentage_change: 4.1,
          total_market_cap_yesterday: 1520000000000,
          total_volume_24h_yesterday: 62000000000,
          total_market_cap_yesterday_percentage_change: 2.0,
          total_volume_24h_yesterday_percentage_change: 4.8,
          last_updated: new Date().toISOString()
        }
      }
    }
  }
}

export const coinMarketCapService = new CoinMarketCapService()
export default coinMarketCapService
