import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface ImageRequest {
  type: 'crypto' | 'nft' | 'defi' | 'gamefi'
  identifier: string
  source?: string
  size?: number
}

interface ImageResponse {
  url?: string
  fallback?: string
  cached: boolean
  source: string
  error?: string
}

// Environment variables
const COINMARKETCAP_API_KEY = Deno.env.get('COINMARKETCAP_API_KEY') || 'd714f7e6-91a5-47ac-866e-f28f26eee302'
const ALCHEMY_API_KEY = Deno.env.get('ALCHEMY_API_KEY') || 'demo'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const type = url.searchParams.get('type') as ImageRequest['type']
    const identifier = url.searchParams.get('identifier')
    const source = url.searchParams.get('source')
    const size = parseInt(url.searchParams.get('size') || '64')

    if (!type || !identifier) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: type and identifier' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let imageUrl: string | null = null
    let sourceUsed = 'fallback'

    switch (type) {
      case 'crypto':
        const cryptoResult = await fetchCryptoImage(identifier, source)
        imageUrl = cryptoResult.url
        sourceUsed = cryptoResult.source
        break

      case 'nft':
        const nftResult = await fetchNFTImage(identifier, source)
        imageUrl = nftResult.url
        sourceUsed = nftResult.source
        break

      case 'defi':
        const defiResult = await fetchDeFiImage(identifier, source)
        imageUrl = defiResult.url
        sourceUsed = defiResult.source
        break

      case 'gamefi':
        const gamefiResult = await fetchGameFiImage(identifier, source)
        imageUrl = gamefiResult.url
        sourceUsed = gamefiResult.source
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid type. Must be: crypto, nft, defi, or gamefi' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

    const response: ImageResponse = {
      url: imageUrl || undefined,
      cached: false, // Would implement caching logic here
      source: sourceUsed,
      fallback: imageUrl ? undefined : generateFallback(type, identifier, size)
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Image proxy error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// ===== CRYPTO IMAGE FETCHING =====

async function fetchCryptoImage(symbol: string, preferredSource?: string): Promise<{url: string | null, source: string}> {
  // Try CoinMarketCap first (most reliable)
  if (!preferredSource || preferredSource === 'coinmarketcap') {
    try {
      const response = await fetch(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${symbol}`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(5000)
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data[symbol] && data.data[symbol].logo) {
          return { url: data.data[symbol].logo, source: 'coinmarketcap' }
        }
      }
    } catch (error) {
      console.warn(`CoinMarketCap fetch failed for ${symbol}:`, error)
    }
  }

  // Try CoinGecko as fallback
  if (!preferredSource || preferredSource === 'coingecko') {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}`,
        {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.image?.large) {
          return { url: data.image.large, source: 'coingecko' }
        }
      }
    } catch (error) {
      console.warn(`CoinGecko fetch failed for ${symbol}:`, error)
    }
  }

  return { url: null, source: 'none' }
}

// ===== NFT IMAGE FETCHING =====

async function fetchNFTImage(contractAddress: string, preferredSource?: string): Promise<{url: string | null, source: string}> {
  // Try Alchemy NFT API
  if (!preferredSource || preferredSource === 'alchemy') {
    try {
      const response = await fetch(
        `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}/getContractMetadata?contractAddress=${contractAddress}`,
        {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.contractMetadata?.openSea?.imageUrl) {
          return { url: data.contractMetadata.openSea.imageUrl, source: 'alchemy' }
        }
      }
    } catch (error) {
      console.warn(`Alchemy fetch failed for ${contractAddress}:`, error)
    }
  }

  // Try OpenSea API (no API key required for basic info)
  if (!preferredSource || preferredSource === 'opensea') {
    try {
      const response = await fetch(
        `https://api.opensea.io/api/v1/asset_contract/${contractAddress}`,
        {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.image_url) {
          return { url: data.image_url, source: 'opensea' }
        }
      }
    } catch (error) {
      console.warn(`OpenSea fetch failed for ${contractAddress}:`, error)
    }
  }

  return { url: null, source: 'none' }
}

// ===== DEFI IMAGE FETCHING =====

async function fetchDeFiImage(protocolName: string, preferredSource?: string): Promise<{url: string | null, source: string}> {
  // For DeFi protocols, we'll try to find their token symbol and use crypto APIs
  const protocolTokenMap: Record<string, string> = {
    'uniswap': 'UNI',
    'aave': 'AAVE',
    'compound': 'COMP',
    'makerdao': 'MKR',
    'synthetix': 'SNX',
    'yearn': 'YFI',
    'sushiswap': 'SUSHI',
    'curve': 'CRV',
    'balancer': 'BAL',
    'pancakeswap': 'CAKE',
    'chainlink': 'LINK'
  }

  const tokenSymbol = protocolTokenMap[protocolName.toLowerCase()]
  if (tokenSymbol) {
    return await fetchCryptoImage(tokenSymbol, preferredSource)
  }

  return { url: null, source: 'none' }
}

// ===== GAMEFI IMAGE FETCHING =====

async function fetchGameFiImage(projectName: string, preferredSource?: string): Promise<{url: string | null, source: string}> {
  // For GameFi projects, we'll try to find their token symbol and use crypto APIs
  const gamefiTokenMap: Record<string, string> = {
    'axie infinity': 'AXS',
    'the sandbox': 'SAND',
    'decentraland': 'MANA',
    'enjin': 'ENJ',
    'gala': 'GALA',
    'illuvium': 'ILV',
    'star atlas': 'ATLAS',
    'alien worlds': 'TLM'
  }

  const tokenSymbol = gamefiTokenMap[projectName.toLowerCase()]
  if (tokenSymbol) {
    return await fetchCryptoImage(tokenSymbol, preferredSource)
  }

  return { url: null, source: 'none' }
}

// ===== FALLBACK GENERATION =====

function generateFallback(type: string, identifier: string, size: number): string {
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
  const color = colors[identifier.length % colors.length]
  const letter = identifier.charAt(0).toUpperCase()

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
      <text x="${size/2}" y="${size/2 + size*0.1}" text-anchor="middle" fill="white" 
            font-family="Arial, sans-serif" font-size="${size*0.3}" font-weight="bold">
        ${letter}
      </text>
    </svg>
  `)}`
}
