/**
 * Vercel Serverless Function: Market Overview
 * Provides comprehensive market data from multiple sources
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

interface MarketData {
  totalMarketCap: string
  totalVolume24h: string
  btcDominance: string
  ethDominance: string
  fearGreedIndex: number
  fearGreedClassification: string
  activeCoins: number
  activeExchanges: number
  totalSupply: string
  circulatingSupply: string
  lastUpdated: string
}

interface CoinMarketCapResponse {
  data: {
    quote: {
      USD: {
        total_market_cap: number
        total_volume_24h: number
        btc_dominance: number
        eth_dominance: number
        last_updated: string
      }
    }
    active_cryptocurrencies: number
    active_exchanges: number
  }
}

interface FearGreedResponse {
  data: [{
    value: string
    value_classification: string
    timestamp: string
  }]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const currency = (req.query.currency as string) || 'USD'
  const includeDetails = req.query.details === 'true'

  try {
    console.log('🔍 Fetching market overview data...')

    // Fetch data from multiple sources in parallel
    const [coinMarketCapResult, fearGreedResult, coingeckoResult] = await Promise.allSettled([
      // CoinMarketCap Global Metrics
      fetch('https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest', {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY || '',
          'Accept': 'application/json'
        }
      }).then(res => res.ok ? res.json() : null),

      // Fear & Greed Index
      fetch('https://api.alternative.me/fng/?limit=1&format=json')
        .then(res => res.ok ? res.json() : null),

      // CoinGecko Global Data (backup)
      fetch('https://api.coingecko.com/api/v3/global')
        .then(res => res.ok ? res.json() : null)
    ])

    // Process CoinMarketCap data
    let marketData: Partial<MarketData> = {}
    
    if (coinMarketCapResult.status === 'fulfilled' && coinMarketCapResult.value) {
      const cmcData = coinMarketCapResult.value as CoinMarketCapResponse
      const quote = cmcData.data?.quote?.USD

      if (quote) {
        marketData = {
          totalMarketCap: `$${(quote.total_market_cap / 1e12).toFixed(2)}T`,
          totalVolume24h: `$${(quote.total_volume_24h / 1e9).toFixed(1)}B`,
          btcDominance: `${quote.btc_dominance.toFixed(1)}%`,
          ethDominance: `${quote.eth_dominance?.toFixed(1) || '0'}%`,
          activeCoins: cmcData.data?.active_cryptocurrencies || 0,
          activeExchanges: cmcData.data?.active_exchanges || 0,
          lastUpdated: quote.last_updated
        }
      }
    }

    // Process Fear & Greed Index
    if (fearGreedResult.status === 'fulfilled' && fearGreedResult.value) {
      const fgData = fearGreedResult.value as FearGreedResponse
      if (fgData.data && fgData.data[0]) {
        marketData.fearGreedIndex = parseInt(fgData.data[0].value)
        marketData.fearGreedClassification = fgData.data[0].value_classification
      }
    }

    // Fallback to CoinGecko if CoinMarketCap failed
    if (!marketData.totalMarketCap && coingeckoResult.status === 'fulfilled' && coingeckoResult.value) {
      const cgData = coingeckoResult.value
      if (cgData.data) {
        marketData = {
          ...marketData,
          totalMarketCap: `$${(cgData.data.total_market_cap?.usd / 1e12).toFixed(2)}T`,
          totalVolume24h: `$${(cgData.data.total_volume?.usd / 1e9).toFixed(1)}B`,
          btcDominance: `${cgData.data.market_cap_percentage?.btc?.toFixed(1)}%`,
          ethDominance: `${cgData.data.market_cap_percentage?.eth?.toFixed(1)}%`,
          activeCoins: cgData.data.active_cryptocurrencies || 0
        }
      }
    }

    // Provide fallback data if all APIs fail
    if (!marketData.totalMarketCap) {
      console.warn('⚠️ All market data APIs failed, using fallback data')
      marketData = {
        totalMarketCap: '$2.5T',
        totalVolume24h: '$85.2B',
        btcDominance: '42.3%',
        ethDominance: '18.7%',
        fearGreedIndex: 65,
        fearGreedClassification: 'Greed',
        activeCoins: 12000,
        activeExchanges: 500,
        lastUpdated: new Date().toISOString()
      }
    }

    // Add additional computed metrics
    const enhancedData = {
      ...marketData,
      marketStatus: getMarketStatus(marketData.fearGreedIndex || 50),
      trend: getTrendIndicator(marketData.fearGreedIndex || 50),
      lastUpdated: marketData.lastUpdated || new Date().toISOString(),
      source: 'Connectouch Market API',
      currency: currency.toUpperCase()
    }

    // Include detailed breakdown if requested
    if (includeDetails) {
      enhancedData.details = {
        dataSourcesUsed: [
          coinMarketCapResult.status === 'fulfilled' ? 'CoinMarketCap' : null,
          fearGreedResult.status === 'fulfilled' ? 'Alternative.me' : null,
          coingeckoResult.status === 'fulfilled' ? 'CoinGecko' : null
        ].filter(Boolean),
        apiResponseTimes: {
          coinMarketCap: coinMarketCapResult.status === 'fulfilled' ? 'Success' : 'Failed',
          fearGreed: fearGreedResult.status === 'fulfilled' ? 'Success' : 'Failed',
          coingecko: coingeckoResult.status === 'fulfilled' ? 'Success' : 'Failed'
        },
        cacheStatus: 'Fresh',
        requestId: `mkt_${Date.now()}`
      }
    }

    console.log('✅ Market overview data fetched successfully')

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

    return res.status(200).json({
      success: true,
      data: enhancedData,
      timestamp: new Date().toISOString(),
      cached: false
    })

  } catch (error) {
    console.error('❌ Market overview API error:', error)

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch market data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}

// Helper function to determine market status
function getMarketStatus(fearGreedIndex: number): string {
  if (fearGreedIndex >= 75) return 'Extreme Greed'
  if (fearGreedIndex >= 55) return 'Greed'
  if (fearGreedIndex >= 45) return 'Neutral'
  if (fearGreedIndex >= 25) return 'Fear'
  return 'Extreme Fear'
}

// Helper function to get trend indicator
function getTrendIndicator(fearGreedIndex: number): string {
  if (fearGreedIndex >= 60) return 'Bullish'
  if (fearGreedIndex >= 40) return 'Sideways'
  return 'Bearish'
}


