/**
 * Supabase Edge Function: Portfolio Sync
 * Real-time portfolio synchronization with multiple blockchain networks
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface SyncRequest {
  userId: string
  walletAddress: string
  chainIds?: number[]
  forceRefresh?: boolean
}

interface TokenBalance {
  contractAddress: string
  symbol: string
  name: string
  decimals: number
  balance: string
  balanceFormatted: number
  price?: number
  value?: number
  logo?: string
  chainId: number
}

interface NFTAsset {
  contractAddress: string
  tokenId: string
  name: string
  description?: string
  image?: string
  collection: string
  chainId: number
  estimatedValue?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, walletAddress, chainIds = [1, 56, 137], forceRefresh = false }: SyncRequest = await req.json()

    if (!userId || !walletAddress) {
      return new Response(JSON.stringify({
        error: 'User ID and wallet address are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`🔄 Syncing portfolio for user ${userId}, wallet ${walletAddress}`)

    // Check if we need to sync (avoid rate limiting)
    if (!forceRefresh) {
      const { data: lastSync } = await supabase
        .from('portfolios')
        .select('last_updated')
        .eq('user_id', userId)
        .eq('wallet_address', walletAddress)
        .single()

      if (lastSync?.last_updated) {
        const lastSyncTime = new Date(lastSync.last_updated).getTime()
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000

        if (now - lastSyncTime < fiveMinutes) {
          return new Response(JSON.stringify({
            success: true,
            message: 'Portfolio recently synced, using cached data',
            lastSync: lastSync.last_updated
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }
    }

    // Sync data from multiple chains in parallel
    const syncPromises = chainIds.map(chainId => syncChainData(walletAddress, chainId))
    const chainResults = await Promise.allSettled(syncPromises)

    // Aggregate results
    let allTokens: TokenBalance[] = []
    let allNFTs: NFTAsset[] = []
    let totalValue = 0

    chainResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        allTokens = [...allTokens, ...result.value.tokens]
        allNFTs = [...allNFTs, ...result.value.nfts]
        totalValue += result.value.totalValue
      } else {
        console.error(`Chain ${chainIds[index]} sync failed:`, result.status === 'rejected' ? result.reason : 'Unknown error')
      }
    })

    // Get or create portfolio
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .upsert({
        user_id: userId,
        wallet_address: walletAddress,
        total_value: totalValue,
        last_updated: new Date().toISOString(),
        auto_sync: true,
        sync_frequency: '5m'
      })
      .select()
      .single()

    if (portfolioError) {
      throw new Error(`Portfolio upsert failed: ${portfolioError.message}`)
    }

    // Clear existing assets
    await supabase
      .from('portfolio_assets')
      .delete()
      .eq('portfolio_id', portfolio.id)

    // Insert new token assets
    if (allTokens.length > 0) {
      const tokenAssets = allTokens.map(token => ({
        portfolio_id: portfolio.id,
        symbol: token.symbol,
        name: token.name,
        amount: token.balanceFormatted,
        current_price: token.price || 0,
        purchase_price: token.price || 0, // Will be updated with actual purchase data
        asset_type: 'crypto',
        chain_id: token.chainId,
        contract_address: token.contractAddress,
        metadata: {
          decimals: token.decimals,
          logo: token.logo
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { error: assetsError } = await supabase
        .from('portfolio_assets')
        .insert(tokenAssets)

      if (assetsError) {
        console.error('Failed to insert token assets:', assetsError)
      }
    }

    // Insert NFT assets
    if (allNFTs.length > 0) {
      const nftAssets = allNFTs.map(nft => ({
        portfolio_id: portfolio.id,
        symbol: nft.collection,
        name: nft.name,
        amount: 1,
        current_price: nft.estimatedValue || 0,
        purchase_price: 0,
        asset_type: 'nft',
        chain_id: nft.chainId,
        contract_address: nft.contractAddress,
        metadata: {
          tokenId: nft.tokenId,
          description: nft.description,
          image: nft.image
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { error: nftError } = await supabase
        .from('portfolio_assets')
        .insert(nftAssets)

      if (nftError) {
        console.error('Failed to insert NFT assets:', nftError)
      }
    }

    // Log sync activity
    await supabase
      .from('sync_logs')
      .insert({
        user_id: userId,
        wallet_address: walletAddress,
        sync_type: 'portfolio',
        chains_synced: chainIds,
        tokens_found: allTokens.length,
        nfts_found: allNFTs.length,
        total_value: totalValue,
        sync_duration_ms: Date.now() - parseInt(portfolio.created_at),
        created_at: new Date().toISOString()
      })

    console.log(`✅ Portfolio sync completed: ${allTokens.length} tokens, ${allNFTs.length} NFTs, $${totalValue.toFixed(2)} total value`)

    return new Response(JSON.stringify({
      success: true,
      data: {
        portfolioId: portfolio.id,
        totalValue,
        tokensCount: allTokens.length,
        nftsCount: allNFTs.length,
        chainsSynced: chainIds,
        lastUpdated: portfolio.last_updated,
        assets: {
          tokens: allTokens.slice(0, 10), // Return top 10 for preview
          nfts: allNFTs.slice(0, 5) // Return top 5 NFTs for preview
        }
      },
      message: 'Portfolio synchronized successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Portfolio sync error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Portfolio sync failed',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Helper function to sync data from a specific chain
async function syncChainData(walletAddress: string, chainId: number) {
  try {
    console.log(`🔗 Syncing chain ${chainId} for wallet ${walletAddress}`)

    const [tokens, nfts] = await Promise.all([
      fetchTokenBalances(walletAddress, chainId),
      fetchNFTAssets(walletAddress, chainId)
    ])

    // Calculate total value
    const totalValue = tokens.reduce((sum, token) => sum + (token.value || 0), 0)

    return {
      chainId,
      tokens,
      nfts,
      totalValue
    }

  } catch (error) {
    console.error(`Chain ${chainId} sync failed:`, error)
    return null
  }
}

// Helper function to fetch token balances
async function fetchTokenBalances(walletAddress: string, chainId: number): Promise<TokenBalance[]> {
  try {
    const alchemyApiKey = Deno.env.get('ALCHEMY_API_KEY')
    if (!alchemyApiKey) {
      throw new Error('Alchemy API key not configured')
    }

    // Get network URL based on chain ID
    const networkUrls: Record<number, string> = {
      1: `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      56: `https://bnb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      137: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
    }

    const networkUrl = networkUrls[chainId]
    if (!networkUrl) {
      console.warn(`Unsupported chain ID: ${chainId}`)
      return []
    }

    // Fetch token balances using Alchemy
    const response = await fetch(`${networkUrl}/getTokenBalances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getTokenBalances',
        params: [walletAddress],
        id: 1
      })
    })

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status}`)
    }

    const data = await response.json()
    const tokenBalances = data.result?.tokenBalances || []

    // Filter out zero balances and get token metadata
    const nonZeroBalances = tokenBalances.filter((token: any) => 
      token.tokenBalance && token.tokenBalance !== '0x0'
    )

    // Get token metadata for each token
    const tokensWithMetadata = await Promise.all(
      nonZeroBalances.slice(0, 20).map(async (token: any) => { // Limit to top 20 tokens
        try {
          const metadata = await fetchTokenMetadata(token.contractAddress, chainId)
          const balanceFormatted = parseInt(token.tokenBalance, 16) / Math.pow(10, metadata.decimals || 18)
          
          // Get token price (simplified - would use price API)
          const price = await fetchTokenPrice(metadata.symbol)
          
          return {
            contractAddress: token.contractAddress,
            symbol: metadata.symbol || 'UNKNOWN',
            name: metadata.name || 'Unknown Token',
            decimals: metadata.decimals || 18,
            balance: token.tokenBalance,
            balanceFormatted,
            price,
            value: balanceFormatted * (price || 0),
            logo: metadata.logo,
            chainId
          }
        } catch (error) {
          console.error(`Failed to get metadata for token ${token.contractAddress}:`, error)
          return null
        }
      })
    )

    return tokensWithMetadata.filter(token => token !== null) as TokenBalance[]

  } catch (error) {
    console.error(`Failed to fetch token balances for chain ${chainId}:`, error)
    return []
  }
}

// Helper function to fetch NFT assets
async function fetchNFTAssets(walletAddress: string, chainId: number): Promise<NFTAsset[]> {
  try {
    const alchemyApiKey = Deno.env.get('ALCHEMY_API_KEY')
    if (!alchemyApiKey) return []

    const networkUrls: Record<number, string> = {
      1: `https://eth-mainnet.g.alchemy.com/nft/v2/${alchemyApiKey}`,
      137: `https://polygon-mainnet.g.alchemy.com/nft/v2/${alchemyApiKey}`
    }

    const networkUrl = networkUrls[chainId]
    if (!networkUrl) return []

    const response = await fetch(`${networkUrl}/getNFTs?owner=${walletAddress}&withMetadata=true`)
    
    if (!response.ok) return []

    const data = await response.json()
    const nfts = data.ownedNfts || []

    return nfts.slice(0, 10).map((nft: any) => ({ // Limit to 10 NFTs
      contractAddress: nft.contract.address,
      tokenId: nft.id.tokenId,
      name: nft.title || nft.metadata?.name || 'Unnamed NFT',
      description: nft.description || nft.metadata?.description,
      image: nft.metadata?.image,
      collection: nft.contractMetadata?.name || 'Unknown Collection',
      chainId,
      estimatedValue: 0 // Would integrate with NFT pricing APIs
    }))

  } catch (error) {
    console.error(`Failed to fetch NFTs for chain ${chainId}:`, error)
    return []
  }
}

// Helper function to fetch token metadata
async function fetchTokenMetadata(contractAddress: string, chainId: number) {
  try {
    const alchemyApiKey = Deno.env.get('ALCHEMY_API_KEY')
    const networkUrls: Record<number, string> = {
      1: `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      56: `https://bnb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      137: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
    }

    const networkUrl = networkUrls[chainId]
    if (!networkUrl) throw new Error('Unsupported network')

    const response = await fetch(`${networkUrl}/getTokenMetadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getTokenMetadata',
        params: [contractAddress],
        id: 1
      })
    })

    const data = await response.json()
    return data.result || {}

  } catch (error) {
    console.error(`Failed to fetch token metadata for ${contractAddress}:`, error)
    return {}
  }
}

// Helper function to fetch token price
async function fetchTokenPrice(symbol: string): Promise<number> {
  try {
    // Simplified price fetching - would integrate with CoinMarketCap/CoinGecko
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': Deno.env.get('COINMARKETCAP_API_KEY') ?? ''
        }
      }
    )

    if (!response.ok) return 0

    const data = await response.json()
    return data.data?.[symbol]?.quote?.USD?.price || 0

  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error)
    return 0
  }
}
