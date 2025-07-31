/**
 * Vercel API Route - CoinMarketCap Integration
 * Secure server-side API calls to CoinMarketCap
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Use the CoinMarketCap API key you provided
  const API_KEY = 'd714f7e6-91a5-47ac-866e-f28f26eee302'

  console.log('📊 CoinMarketCap API Key configured:', API_KEY.substring(0, 8) + '...')
  const { limit = 50, convert = 'USD' } = req.query

  try {
    console.log('🚀 Fetching crypto data from CoinMarketCap...')
    
    // Fetch latest cryptocurrency listings
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=${limit}&convert=${convert}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': API_KEY,
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Also fetch global metrics
    const globalResponse = await fetch(
      'https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest?convert=USD',
      {
        headers: {
          'X-CMC_PRO_API_KEY': API_KEY,
          'Accept': 'application/json'
        }
      }
    )

    let globalMetrics = null
    if (globalResponse.ok) {
      const globalData = await globalResponse.json()
      globalMetrics = globalData.data
    }

    console.log(`✅ Successfully fetched ${data.data.length} cryptocurrencies`)

    res.status(200).json({
      success: true,
      data: {
        cryptocurrencies: data.data,
        globalMetrics: globalMetrics,
        timestamp: new Date().toISOString(),
        source: 'coinmarketcap'
      }
    })

  } catch (error) {
    console.error('❌ CoinMarketCap API error:', error)
    
    // Return fallback data
    const fallbackData = {
      cryptocurrencies: [
        {
          id: 1,
          name: 'Bitcoin',
          symbol: 'BTC',
          slug: 'bitcoin',
          cmc_rank: 1,
          circulating_supply: 19000000,
          total_supply: 19000000,
          max_supply: 21000000,
          quote: {
            USD: {
              price: 43250.50,
              volume_24h: 15000000000,
              percent_change_1h: 0.5,
              percent_change_24h: 2.1,
              percent_change_7d: 5.2,
              market_cap: 817000000000,
              last_updated: new Date().toISOString()
            }
          }
        },
        {
          id: 1027,
          name: 'Ethereum',
          symbol: 'ETH',
          slug: 'ethereum',
          cmc_rank: 2,
          circulating_supply: 120000000,
          total_supply: 120000000,
          max_supply: null,
          quote: {
            USD: {
              price: 2650.75,
              volume_24h: 8000000000,
              percent_change_1h: 0.8,
              percent_change_24h: 3.2,
              percent_change_7d: 4.1,
              market_cap: 318000000000,
              last_updated: new Date().toISOString()
            }
          }
        },
        {
          id: 1839,
          name: 'BNB',
          symbol: 'BNB',
          slug: 'bnb',
          cmc_rank: 3,
          circulating_supply: 150000000,
          total_supply: 150000000,
          max_supply: 200000000,
          quote: {
            USD: {
              price: 315.20,
              volume_24h: 1200000000,
              percent_change_1h: 0.3,
              percent_change_24h: 1.8,
              percent_change_7d: 2.5,
              market_cap: 47280000000,
              last_updated: new Date().toISOString()
            }
          }
        }
      ],
      globalMetrics: {
        active_cryptocurrencies: 9000,
        total_cryptocurrencies: 12000,
        btc_dominance: 52.5,
        eth_dominance: 18.5,
        quote: {
          USD: {
            total_market_cap: 1550000000000,
            total_volume_24h: 65000000000,
            last_updated: new Date().toISOString()
          }
        }
      },
      timestamp: new Date().toISOString(),
      source: 'fallback',
      note: 'Using fallback data due to API error'
    }

    res.status(200).json({
      success: true,
      data: fallbackData,
      fallback: true,
      error: error.message
    })
  }
}
