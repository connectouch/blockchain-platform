/**
 * Direct API Service - Independent API calls without backend dependencies
 * Implements direct connections to external APIs for production independence
 */

import { toast } from 'react-hot-toast'

interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  last_updated: string
}

interface DeFiProtocol {
  id: string
  name: string
  symbol: string
  tvl: number
  change_1d: number
  change_7d: number
  category: string
  chains: string[]
}

interface NFTCollection {
  id: string
  name: string
  description: string
  floor_price: number
  volume_24h: number
  owners: number
  total_supply: number
}

class DirectApiService {
  private static instance: DirectApiService
  private coinGeckoBaseUrl = 'https://api.coingecko.com/api/v3'
  private defillamaBaseUrl = 'https://api.llama.fi'
  private openSeaBaseUrl = 'https://api.opensea.io/api/v1'

  private constructor() {
    console.log('🚀 DirectApiService initialized for independent operation')
  }

  static getInstance(): DirectApiService {
    if (!DirectApiService.instance) {
      DirectApiService.instance = new DirectApiService()
    }
    return DirectApiService.instance
  }

  // Crypto Prices from CoinGecko (Free API)
  async getCryptoPrices(symbols: string[] = ['bitcoin', 'ethereum', 'binancecoin']): Promise<CryptoPrice[]> {
    try {
      const symbolsParam = symbols.join(',')
      const response = await fetch(
        `${this.coinGeckoBaseUrl}/coins/markets?vs_currency=usd&ids=${symbolsParam}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`
      )

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Crypto prices fetched successfully from CoinGecko')
      return data
    } catch (error) {
      console.error('❌ Error fetching crypto prices:', error)
      toast.error('Failed to fetch crypto prices')
      return this.getMockCryptoPrices()
    }
  }

  // DeFi Protocols via Netlify Function (to avoid CORS issues)
  async getDeFiProtocols(): Promise<DeFiProtocol[]> {
    try {
      console.log('🔍 Fetching DeFi protocols via Netlify function...')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch('/.netlify/functions/defi-protocols', {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Netlify function error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        console.log('✅ DeFi protocols fetched successfully:', result.data.length, 'protocols')
        return result.data
      } else {
        throw new Error('Invalid response format from Netlify function')
      }
    } catch (error) {
      console.error('❌ Error fetching DeFi protocols:', error)
      console.log('🔄 Falling back to mock data for DeFi protocols')
      return this.getMockDeFiProtocols()
    }
  }

  // NFT Collections (Mock data for now - OpenSea API requires API key)
  async getNFTCollections(): Promise<NFTCollection[]> {
    try {
      // For now, return mock data since OpenSea API requires authentication
      console.log('📦 Returning mock NFT collections (OpenSea API requires key)')
      return this.getMockNFTCollections()
    } catch (error) {
      console.error('❌ Error fetching NFT collections:', error)
      return this.getMockNFTCollections()
    }
  }

  // Infrastructure Projects (Mock data)
  async getInfrastructureProjects(): Promise<any[]> {
    return [
      {
        id: 'ethereum',
        name: 'Ethereum',
        description: 'Decentralized platform for smart contracts',
        category: 'Layer 1',
        tvl: 50000000000,
        developers: 2500,
        github_stars: 45000
      },
      {
        id: 'polygon',
        name: 'Polygon',
        description: 'Ethereum scaling solution',
        category: 'Layer 2',
        tvl: 8000000000,
        developers: 800,
        github_stars: 12000
      },
      {
        id: 'arbitrum',
        name: 'Arbitrum',
        description: 'Optimistic rollup for Ethereum',
        category: 'Layer 2',
        tvl: 12000000000,
        developers: 600,
        github_stars: 8000
      }
    ]
  }

  // GameFi Projects (Mock data with comprehensive gaming data)
  async getGameFiProjects(): Promise<any[]> {
    try {
      console.log('🎮 Fetching GameFi projects...')

      // For now, return comprehensive mock data since there's no free GameFi API
      const projects = [
        {
          id: 'axie-infinity',
          name: 'Axie Infinity',
          symbol: 'AXS',
          category: 'Pet Battler',
          marketCap: 2800000000,
          price: 45.67,
          change24h: 3.2,
          volume24h: 125000000,
          totalUsers: 2800000,
          dailyActiveUsers: 850000,
          averageEarnings: 12.5,
          blockchain: 'ethereum',
          status: 'active',
          website: 'https://axieinfinity.com',
          token: 'AXS'
        },
        {
          id: 'the-sandbox',
          name: 'The Sandbox',
          symbol: 'SAND',
          category: 'Metaverse',
          marketCap: 1900000000,
          price: 2.34,
          change24h: -1.8,
          volume24h: 89000000,
          totalUsers: 1200000,
          dailyActiveUsers: 320000,
          averageEarnings: 8.7,
          blockchain: 'ethereum',
          status: 'active',
          website: 'https://sandbox.game',
          token: 'SAND'
        },
        {
          id: 'decentraland',
          name: 'Decentraland',
          symbol: 'MANA',
          category: 'Metaverse',
          marketCap: 1600000000,
          price: 0.89,
          change24h: 2.1,
          volume24h: 67000000,
          totalUsers: 800000,
          dailyActiveUsers: 180000,
          averageEarnings: 6.3,
          blockchain: 'ethereum',
          status: 'active',
          website: 'https://decentraland.org',
          token: 'MANA'
        },
        {
          id: 'splinterlands',
          name: 'Splinterlands',
          symbol: 'SPS',
          category: 'Card Game',
          marketCap: 450000000,
          price: 0.12,
          change24h: 5.7,
          volume24h: 23000000,
          totalUsers: 650000,
          dailyActiveUsers: 420000,
          averageEarnings: 4.2,
          blockchain: 'hive',
          status: 'active',
          website: 'https://splinterlands.com',
          token: 'SPS'
        },
        {
          id: 'gods-unchained',
          name: 'Gods Unchained',
          symbol: 'GODS',
          category: 'Card Game',
          marketCap: 320000000,
          price: 0.45,
          change24h: -2.3,
          volume24h: 18000000,
          totalUsers: 450000,
          dailyActiveUsers: 125000,
          averageEarnings: 3.8,
          blockchain: 'ethereum',
          status: 'active',
          website: 'https://godsunchained.com',
          token: 'GODS'
        },
        {
          id: 'alien-worlds',
          name: 'Alien Worlds',
          symbol: 'TLM',
          category: 'Mining',
          marketCap: 280000000,
          price: 0.08,
          change24h: 1.9,
          volume24h: 15000000,
          totalUsers: 1100000,
          dailyActiveUsers: 680000,
          averageEarnings: 2.1,
          blockchain: 'wax',
          status: 'active',
          website: 'https://alienworlds.io',
          token: 'TLM'
        }
      ]

      console.log('✅ GameFi projects loaded successfully:', projects.length, 'projects')
      return projects
    } catch (error) {
      console.error('❌ Error fetching GameFi projects:', error)
      return []
    }
  }

  // Web3 Tools (Mock data)
  async getWeb3Tools(): Promise<any[]> {
    return [
      {
        id: 'metamask',
        name: 'MetaMask',
        description: 'Crypto wallet & gateway to blockchain apps',
        category: 'Wallet',
        users: 30000000,
        rating: 4.5
      },
      {
        id: 'uniswap',
        name: 'Uniswap',
        description: 'Decentralized trading protocol',
        category: 'DEX',
        users: 4000000,
        rating: 4.7
      },
      {
        id: 'opensea',
        name: 'OpenSea',
        description: 'NFT marketplace',
        category: 'NFT',
        users: 2000000,
        rating: 4.2
      }
    ]
  }

  // Mock data fallbacks
  private getMockCryptoPrices(): CryptoPrice[] {
    return [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 45000,
        price_change_percentage_24h: 2.5,
        market_cap: 850000000000,
        total_volume: 25000000000,
        last_updated: new Date().toISOString()
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        current_price: 3200,
        price_change_percentage_24h: 1.8,
        market_cap: 380000000000,
        total_volume: 15000000000,
        last_updated: new Date().toISOString()
      }
    ]
  }

  private getMockDeFiProtocols(): DeFiProtocol[] {
    return [
      {
        id: 'uniswap',
        name: 'Uniswap',
        symbol: 'UNI',
        tvl: 8500000000,
        change_1d: 2.3,
        change_7d: -1.2,
        category: 'Dexes',
        chains: ['ethereum', 'polygon', 'arbitrum']
      },
      {
        id: 'aave',
        name: 'Aave',
        symbol: 'AAVE',
        tvl: 12000000000,
        change_1d: 1.8,
        change_7d: 3.5,
        category: 'Lending',
        chains: ['ethereum', 'polygon', 'avalanche']
      },
      {
        id: 'compound',
        name: 'Compound',
        symbol: 'COMP',
        tvl: 3200000000,
        change_1d: -0.5,
        change_7d: 2.1,
        category: 'Lending',
        chains: ['ethereum']
      },
      {
        id: 'makerdao',
        name: 'MakerDAO',
        symbol: 'MKR',
        tvl: 9800000000,
        change_1d: 0.8,
        change_7d: -2.3,
        category: 'CDP',
        chains: ['ethereum']
      },
      {
        id: 'curve',
        name: 'Curve',
        symbol: 'CRV',
        tvl: 4500000000,
        change_1d: 1.2,
        change_7d: 4.7,
        category: 'Dexes',
        chains: ['ethereum', 'polygon', 'arbitrum']
      },
      {
        id: 'pancakeswap',
        name: 'PancakeSwap',
        symbol: 'CAKE',
        tvl: 2800000000,
        change_1d: 3.1,
        change_7d: -1.8,
        category: 'Dexes',
        chains: ['bsc']
      },
      {
        id: 'convex',
        name: 'Convex Finance',
        symbol: 'CVX',
        tvl: 3600000000,
        change_1d: -1.2,
        change_7d: 5.4,
        category: 'Yield',
        chains: ['ethereum']
      },
      {
        id: 'lido',
        name: 'Lido',
        symbol: 'LDO',
        tvl: 15200000000,
        change_1d: 2.7,
        change_7d: 8.9,
        category: 'Liquid Staking',
        chains: ['ethereum']
      }
    ]
  }

  private getMockNFTCollections(): NFTCollection[] {
    return [
      {
        id: 'cryptopunks',
        name: 'CryptoPunks',
        description: 'Original NFT collection on Ethereum',
        floor_price: 65,
        volume_24h: 1200,
        owners: 3500,
        total_supply: 10000
      },
      {
        id: 'bored-ape-yacht-club',
        name: 'Bored Ape Yacht Club',
        description: 'Popular NFT collection',
        floor_price: 25,
        volume_24h: 800,
        owners: 6400,
        total_supply: 10000
      }
    ]
  }

  // Health check for all services
  async performHealthCheck(): Promise<{
    coinGecko: boolean
    defillama: boolean
    overall: boolean
  }> {
    const results = {
      coinGecko: false,
      defillama: false,
      overall: false
    }

    try {
      // Test CoinGecko
      const coinGeckoResponse = await fetch(`${this.coinGeckoBaseUrl}/ping`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      results.coinGecko = coinGeckoResponse.ok
    } catch (error) {
      console.warn('CoinGecko health check failed:', error)
    }

    try {
      // Test DeFiLlama
      const defillamaResponse = await fetch(`${this.defillamaBaseUrl}/protocols?limit=1`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      results.defillama = defillamaResponse.ok
    } catch (error) {
      console.warn('DeFiLlama health check failed:', error)
    }

    results.overall = results.coinGecko || results.defillama
    return results
  }
}

export const directApiService = DirectApiService.getInstance()
export default directApiService
