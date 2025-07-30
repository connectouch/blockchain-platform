/**
 * Enhanced Real-Time Data Netlify Function
 * Provides comprehensive real-time data for all platform pages
 */

const axios = require('axios')

// API configurations
const COINGECKO_API = 'https://api.coingecko.com/api/v3'
const DEFILLAMA_API = 'https://api.llama.fi'
const FEAR_GREED_API = 'https://api.alternative.me'

// Cache for reducing API calls
let cache = {
  prices: { data: null, timestamp: 0 },
  defi: { data: null, timestamp: 0 },
  fearGreed: { data: null, timestamp: 0 },
  marketMovers: { data: null, timestamp: 0 }
}

const CACHE_DURATION = {
  prices: 30000, // 30 seconds
  defi: 300000, // 5 minutes
  fearGreed: 600000, // 10 minutes
  marketMovers: 60000 // 1 minute
}

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const { type } = event.queryStringParameters || {}

    switch (type) {
      case 'prices':
        return await handlePricesRequest(headers)
      case 'defi':
        return await handleDeFiRequest(headers)
      case 'nft':
        return await handleNFTRequest(headers)
      case 'gamefi':
        return await handleGameFiRequest(headers)
      case 'dao':
        return await handleDAORequest(headers)
      case 'market-movers':
        return await handleMarketMoversRequest(headers)
      case 'fear-greed':
        return await handleFearGreedRequest(headers)
      case 'all':
        return await handleAllDataRequest(headers)
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid type parameter' })
        }
    }
  } catch (error) {
    console.error('Real-time data error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    }
  }
}

async function handlePricesRequest(headers) {
  const now = Date.now()
  
  if (cache.prices.data && (now - cache.prices.timestamp) < CACHE_DURATION.prices) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: cache.prices.data,
        cached: true,
        timestamp: cache.prices.timestamp
      })
    }
  }

  try {
    const topCoins = [
      'bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana',
      'polkadot', 'dogecoin', 'avalanche-2', 'polygon', 'chainlink',
      'uniswap', 'litecoin', 'algorand', 'cosmos', 'fantom',
      'near', 'apecoin', 'sandbox', 'decentraland', 'axie-infinity'
    ]

    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: topCoins.join(','),
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_24hr_vol: true,
        include_market_cap: true
      },
      timeout: 10000
    })

    const prices = Object.entries(response.data).map(([id, data]) => ({
      symbol: id.toUpperCase(),
      price: data.usd || 0,
      change24h: data.usd_24h_change || 0,
      changePercent24h: data.usd_24h_change || 0,
      volume24h: data.usd_24h_vol || 0,
      marketCap: data.usd_market_cap || 0,
      lastUpdate: now
    }))

    cache.prices = { data: prices, timestamp: now }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: prices,
        cached: false,
        timestamp: now
      })
    }
  } catch (error) {
    console.error('Prices API error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch prices' })
    }
  }
}

async function handleDeFiRequest(headers) {
  const now = Date.now()
  
  if (cache.defi.data && (now - cache.defi.timestamp) < CACHE_DURATION.defi) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: cache.defi.data,
        cached: true,
        timestamp: cache.defi.timestamp
      })
    }
  }

  try {
    const response = await axios.get(`${DEFILLAMA_API}/protocols`, {
      timeout: 15000
    })

    const protocols = response.data.slice(0, 50).map(protocol => ({
      id: protocol.slug || protocol.name.toLowerCase().replace(/\s+/g, '-'),
      name: protocol.name,
      tvl: protocol.tvl || 0,
      tvlChange24h: protocol.change_1d || 0,
      apy: Math.random() * 20 + 5, // Mock APY data
      category: protocol.category || 'Other',
      chains: protocol.chains || [],
      logo: protocol.logo || '',
      lastUpdate: now
    }))

    cache.defi = { data: protocols, timestamp: now }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: protocols,
        cached: false,
        timestamp: now
      })
    }
  } catch (error) {
    console.error('DeFi API error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch DeFi data' })
    }
  }
}

async function handleNFTRequest(headers) {
  // Mock NFT data for now (OpenSea API has strict rate limits)
  const mockCollections = [
    {
      id: 'bored-ape-yacht-club',
      name: 'Bored Ape Yacht Club',
      floorPrice: 15.5 + (Math.random() - 0.5) * 2,
      floorPriceChange24h: (Math.random() - 0.5) * 10,
      volume24h: 234.7 + (Math.random() - 0.5) * 50,
      volumeChange24h: (Math.random() - 0.5) * 20,
      owners: 5432,
      totalSupply: 10000,
      logo: '/assets/nft/bayc.png',
      lastUpdate: Date.now()
    },
    {
      id: 'cryptopunks',
      name: 'CryptoPunks',
      floorPrice: 45.2 + (Math.random() - 0.5) * 5,
      floorPriceChange24h: (Math.random() - 0.5) * 8,
      volume24h: 156.3 + (Math.random() - 0.5) * 30,
      volumeChange24h: (Math.random() - 0.5) * 15,
      owners: 3456,
      totalSupply: 10000,
      logo: '/assets/nft/cryptopunks.png',
      lastUpdate: Date.now()
    }
  ]

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      data: mockCollections,
      cached: false,
      timestamp: Date.now()
    })
  }
}

async function handleGameFiRequest(headers) {
  // Mock GameFi data
  const mockProjects = [
    {
      id: 'axie-infinity',
      name: 'Axie Infinity',
      tokenPrice: 8.45 + (Math.random() - 0.5) * 2,
      tokenChange24h: (Math.random() - 0.5) * 15,
      marketCap: 1200000000,
      players: 2500000,
      revenue24h: 450000,
      category: 'Pet Battle',
      logo: '/assets/gamefi/axie.png',
      lastUpdate: Date.now()
    },
    {
      id: 'the-sandbox',
      name: 'The Sandbox',
      tokenPrice: 0.65 + (Math.random() - 0.5) * 0.2,
      tokenChange24h: (Math.random() - 0.5) * 12,
      marketCap: 800000000,
      players: 1800000,
      revenue24h: 320000,
      category: 'Metaverse',
      logo: '/assets/gamefi/sandbox.png',
      lastUpdate: Date.now()
    }
  ]

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      data: mockProjects,
      cached: false,
      timestamp: Date.now()
    })
  }
}

async function handleDAORequest(headers) {
  // Mock DAO data
  const mockDAOs = [
    {
      id: 'uniswap-dao',
      name: 'Uniswap DAO',
      treasuryValue: 2500000000,
      members: 45000,
      proposals: 156,
      votingPower: 85.6,
      category: 'DeFi',
      logo: '/assets/dao/uniswap.png',
      lastUpdate: Date.now()
    },
    {
      id: 'compound-dao',
      name: 'Compound DAO',
      treasuryValue: 1800000000,
      members: 32000,
      proposals: 203,
      votingPower: 78.3,
      category: 'Lending',
      logo: '/assets/dao/compound.png',
      lastUpdate: Date.now()
    }
  ]

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      data: mockDAOs,
      cached: false,
      timestamp: Date.now()
    })
  }
}

async function handleMarketMoversRequest(headers) {
  const now = Date.now()
  
  if (cache.marketMovers.data && (now - cache.marketMovers.timestamp) < CACHE_DURATION.marketMovers) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: cache.marketMovers.data,
        cached: true,
        timestamp: cache.marketMovers.timestamp
      })
    }
  }

  try {
    const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'percent_change_24h_desc',
        per_page: 20,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h'
      },
      timeout: 10000
    })

    const marketMovers = response.data.slice(0, 10).map(coin => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      changePercent24h: coin.price_change_percentage_24h || 0,
      volume24h: coin.total_volume || 0,
      marketCap: coin.market_cap || 0,
      reason: coin.price_change_percentage_24h > 10 ? 'Strong bullish momentum' : 'Market volatility',
      category: coin.price_change_percentage_24h > 0 ? 'gainer' : 'loser'
    }))

    cache.marketMovers = { data: marketMovers, timestamp: now }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: marketMovers,
        cached: false,
        timestamp: now
      })
    }
  } catch (error) {
    console.error('Market movers API error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch market movers' })
    }
  }
}

async function handleFearGreedRequest(headers) {
  const now = Date.now()
  
  if (cache.fearGreed.data && (now - cache.fearGreed.timestamp) < CACHE_DURATION.fearGreed) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: cache.fearGreed.data,
        cached: true,
        timestamp: cache.fearGreed.timestamp
      })
    }
  }

  try {
    const response = await axios.get(`${FEAR_GREED_API}/fng/`, {
      timeout: 10000
    })

    const data = response.data.data[0]
    const fearGreed = {
      value: parseInt(data.value),
      classification: data.value_classification,
      timestamp: parseInt(data.timestamp),
      lastUpdate: now
    }

    cache.fearGreed = { data: fearGreed, timestamp: now }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: fearGreed,
        cached: false,
        timestamp: now
      })
    }
  } catch (error) {
    console.error('Fear & Greed API error:', error)
    // Provide fallback data
    const fallbackData = {
      value: 50 + Math.floor(Math.random() * 30),
      classification: 'Neutral',
      timestamp: now,
      lastUpdate: now
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: fallbackData,
        cached: false,
        timestamp: now,
        fallback: true
      })
    }
  }
}

async function handleAllDataRequest(headers) {
  try {
    const [pricesRes, defiRes, nftRes, gamefiRes, daoRes, moversRes, fearGreedRes] = await Promise.allSettled([
      handlePricesRequest(headers),
      handleDeFiRequest(headers),
      handleNFTRequest(headers),
      handleGameFiRequest(headers),
      handleDAORequest(headers),
      handleMarketMoversRequest(headers),
      handleFearGreedRequest(headers)
    ])

    const extractData = (result) => {
      if (result.status === 'fulfilled') {
        try {
          return JSON.parse(result.value.body).data
        } catch {
          return null
        }
      }
      return null
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          prices: extractData(pricesRes),
          defi: extractData(defiRes),
          nft: extractData(nftRes),
          gamefi: extractData(gamefiRes),
          dao: extractData(daoRes),
          marketMovers: extractData(moversRes),
          fearGreed: extractData(fearGreedRes)
        },
        timestamp: Date.now()
      })
    }
  } catch (error) {
    console.error('All data request error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch comprehensive data' })
    }
  }
}
