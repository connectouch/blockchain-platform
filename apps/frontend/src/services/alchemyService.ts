/**
 * Alchemy API Service for Blockchain Data
 * Provides comprehensive blockchain and Web3 data
 */

import axios, { AxiosInstance } from 'axios'

export interface TokenBalance {
  contractAddress: string
  tokenBalance: string
  error?: string
}

export interface TokenMetadata {
  decimals: number
  logo?: string
  name: string
  symbol: string
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  external_url?: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
}

export interface NFT {
  contract: {
    address: string
    name: string
    symbol: string
    totalSupply?: string
    tokenType: string
  }
  id: {
    tokenId: string
    tokenMetadata?: {
      tokenType: string
    }
  }
  title: string
  description: string
  tokenUri?: {
    raw: string
    gateway: string
  }
  media?: Array<{
    raw: string
    gateway: string
  }>
  metadata?: NFTMetadata
  timeLastUpdated: string
  contractMetadata?: {
    name: string
    symbol: string
    totalSupply?: string
    tokenType: string
  }
}

export interface Transaction {
  blockNum: string
  hash: string
  from: string
  to: string
  value: number
  erc721TokenId?: string
  erc1155Metadata?: any
  tokenId?: string
  asset: string
  category: string
  rawContract: {
    value: string
    address: string
    decimal: string
  }
}

export interface GasEstimate {
  gasLimit: string
  gasPrice: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
}

class AlchemyService {
  private api: AxiosInstance
  private apiKey: string
  private cache = new Map<string, { data: any; expires: number }>()
  private readonly CACHE_TTL = 30000 // 30 seconds for blockchain data

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

    console.log('🚀 Alchemy Service initialized with secure API endpoint')
  }

  /**
   * Get token balances for an address
   */
  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    const cacheKey = `token_balances_${address}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const response = await this.api.post('', {
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getTokenBalances',
        params: [address]
      })

      const balances = response.data.result.tokenBalances
      this.setCache(cacheKey, balances)
      
      console.log(`✅ Fetched ${balances.length} token balances for ${address}`)
      return balances
    } catch (error) {
      console.error('❌ Alchemy token balances error:', error)
      return this.getFallbackTokenBalances()
    }
  }

  /**
   * Get token metadata
   */
  async getTokenMetadata(contractAddress: string): Promise<TokenMetadata | null> {
    const cacheKey = `token_metadata_${contractAddress}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const response = await this.api.post('', {
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getTokenMetadata',
        params: [contractAddress]
      })

      const metadata = response.data.result
      this.setCache(cacheKey, metadata)
      
      console.log(`✅ Fetched metadata for token ${contractAddress}`)
      return metadata
    } catch (error) {
      console.error('❌ Alchemy token metadata error:', error)
      return null
    }
  }

  /**
   * Get NFTs owned by an address
   */
  async getNFTs(address: string, pageKey?: string): Promise<{ ownedNfts: NFT[]; pageKey?: string }> {
    const cacheKey = `nfts_${address}_${pageKey || 'first'}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const params: any = {
        owner: address,
        withMetadata: true,
        excludeFilters: ['SPAM']
      }
      
      if (pageKey) {
        params.pageKey = pageKey
      }

      const response = await this.api.get('/getNFTs', { params })
      
      const result = {
        ownedNfts: response.data.ownedNfts,
        pageKey: response.data.pageKey
      }
      
      this.setCache(cacheKey, result)
      
      console.log(`✅ Fetched ${result.ownedNfts.length} NFTs for ${address}`)
      return result
    } catch (error) {
      console.error('❌ Alchemy NFTs error:', error)
      return { ownedNfts: this.getFallbackNFTs() }
    }
  }

  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(address: string, category?: string[]): Promise<Transaction[]> {
    const cacheKey = `transactions_${address}_${category?.join(',') || 'all'}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const params: any = {
        fromAddress: address,
        toAddress: address,
        withMetadata: true,
        excludeZeroValue: false,
        maxCount: 50
      }

      if (category) {
        params.category = category
      }

      const response = await this.api.get('/getAssetTransfers', { params })
      
      const transfers = response.data.result.transfers
      this.setCache(cacheKey, transfers)
      
      console.log(`✅ Fetched ${transfers.length} transactions for ${address}`)
      return transfers
    } catch (error) {
      console.error('❌ Alchemy transaction history error:', error)
      return this.getFallbackTransactions()
    }
  }

  /**
   * Get current gas prices
   */
  async getGasPrice(): Promise<GasEstimate> {
    const cacheKey = 'gas_price'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const response = await this.api.get('/blockchain-data')

      if (response.data.success) {
        const gasData = response.data.data.gasPrice
        const estimate: GasEstimate = {
          gasLimit: gasData.gasLimit,
          gasPrice: gasData.gasPrice,
          maxFeePerGas: gasData.maxFeePerGas,
          maxPriorityFeePerGas: gasData.maxPriorityFeePerGas
        }

        this.setCache(cacheKey, estimate)

        console.log('✅ Fetched current gas prices from secure API')
        return estimate
      } else {
        throw new Error('API returned unsuccessful response')
      }
    } catch (error) {
      console.error('❌ Alchemy gas price error:', error)
      return this.getFallbackGasEstimate()
    }
  }

  /**
   * Get block information
   */
  async getLatestBlock(): Promise<any> {
    try {
      const response = await this.api.get('/blockchain-data')

      if (response.data.success) {
        const block = response.data.data.latestBlock
        console.log(`✅ Fetched latest block: ${block.number}`)
        return block
      } else {
        throw new Error('API returned unsuccessful response')
      }
    } catch (error) {
      console.error('❌ Alchemy latest block error:', error)
      return null
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(transaction: any): Promise<string> {
    try {
      const response = await this.api.post('', {
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_estimateGas',
        params: [transaction]
      })

      const gasEstimate = response.data.result
      console.log(`✅ Estimated gas: ${gasEstimate}`)
      return gasEstimate
    } catch (error) {
      console.error('❌ Alchemy gas estimation error:', error)
      return '21000' // Default gas limit
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
   * Fallback data methods
   */
  private getFallbackTokenBalances(): TokenBalance[] {
    return [
      {
        contractAddress: '0xA0b86a33E6441E6C8D3c8C8C8C8C8C8C8C8C8C8C',
        tokenBalance: '1000000000000000000000'
      },
      {
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        tokenBalance: '500000000'
      }
    ]
  }

  private getFallbackNFTs(): NFT[] {
    return [
      {
        contract: {
          address: '0x123...',
          name: 'Sample NFT Collection',
          symbol: 'SAMPLE',
          tokenType: 'ERC721'
        },
        id: {
          tokenId: '1'
        },
        title: 'Sample NFT #1',
        description: 'A sample NFT for demonstration',
        timeLastUpdated: new Date().toISOString()
      }
    ]
  }

  private getFallbackTransactions(): Transaction[] {
    return [
      {
        blockNum: '0x1234567',
        hash: '0xabcdef...',
        from: '0x123...',
        to: '0x456...',
        value: 0.1,
        asset: 'ETH',
        category: 'external',
        rawContract: {
          value: '0x16345785d8a0000',
          address: null,
          decimal: '0x12'
        }
      }
    ]
  }

  private getFallbackGasEstimate(): GasEstimate {
    return {
      gasLimit: '21000',
      gasPrice: '20000000000', // 20 gwei
      maxFeePerGas: '30000000000', // 30 gwei
      maxPriorityFeePerGas: '2000000000' // 2 gwei
    }
  }
}

export const alchemyService = new AlchemyService()
export default alchemyService
