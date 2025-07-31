/**
 * Free Crypto API - Using CoinGecko (no API key required)
 * Provides real-time crypto data without API key restrictions
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

  const { limit = 50 } = req.query

  try {
    console.log('🚀 Fetching crypto data from CoinGecko (free API)...')
    
    // Fetch from CoinGecko - no API key required
    const [cryptoResponse, globalResponse] = await Promise.all([
      fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=1h,24h,7d`),
      fetch('https://api.coingecko.com/api/v3/global')
    ])

    if (!cryptoResponse.ok) {
      throw new Error(`CoinGecko API error: ${cryptoResponse.status}`)
    }

    const cryptoData = await cryptoResponse.json()
    let globalData = null
    
    if (globalResponse.ok) {
      const globalJson = await globalResponse.json()
      globalData = globalJson.data
    }

    // Transform CoinGecko data to match CoinMarketCap format
    const transformedCryptos = cryptoData.map((coin, index) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      slug: coin.id,
      cmc_rank: coin.market_cap_rank || index + 1,
      circulating_supply: coin.circulating_supply,
      total_supply: coin.total_supply,
      max_supply: coin.max_supply,
      quote: {
        USD: {
          price: coin.current_price,
          volume_24h: coin.total_volume,
          percent_change_1h: coin.price_change_percentage_1h_in_currency || 0,
          percent_change_24h: coin.price_change_percentage_24h || 0,
          percent_change_7d: coin.price_change_percentage_7d_in_currency || 0,
          market_cap: coin.market_cap,
          last_updated: coin.last_updated
        }
      }
    }))

    // Transform global data
    let transformedGlobal = null
    if (globalData) {
      transformedGlobal = {
        active_cryptocurrencies: globalData.active_cryptocurrencies,
        total_cryptocurrencies: globalData.active_cryptocurrencies,
        btc_dominance: globalData.market_cap_percentage?.btc || 0,
        eth_dominance: globalData.market_cap_percentage?.eth || 0,
        quote: {
          USD: {
            total_market_cap: globalData.total_market_cap?.usd || 0,
            total_volume_24h: globalData.total_volume?.usd || 0,
            last_updated: new Date().toISOString()
          }
        }
      }
    }

    console.log(`✅ Successfully fetched ${transformedCryptos.length} cryptocurrencies from CoinGecko`)

    res.status(200).json({
      success: true,
      data: {
        cryptocurrencies: transformedCryptos,
        globalMetrics: transformedGlobal,
        timestamp: new Date().toISOString(),
        source: 'coingecko-free'
      }
    })

  } catch (error) {
    console.error('❌ CoinGecko API error:', error)
    
    // Return enhanced fallback data
    const fallbackData = {
      cryptocurrencies: [
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'BTC',
          slug: 'bitcoin',
          cmc_rank: 1,
          circulating_supply: 19750000,
          total_supply: 19750000,
          max_supply: 21000000,
          quote: {
            USD: {
              price: 43250.50 + (Math.random() - 0.5) * 1000, // Add some randomness
              volume_24h: 15000000000,
              percent_change_1h: (Math.random() - 0.5) * 2,
              percent_change_24h: (Math.random() - 0.5) * 10,
              percent_change_7d: (Math.random() - 0.5) * 20,
              market_cap: 850000000000,
              last_updated: new Date().toISOString()
            }
          }
        },
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          slug: 'ethereum',
          cmc_rank: 2,
          circulating_supply: 120000000,
          total_supply: 120000000,
          max_supply: null,
          quote: {
            USD: {
              price: 2650.75 + (Math.random() - 0.5) * 200,
              volume_24h: 8000000000,
              percent_change_1h: (Math.random() - 0.5) * 2,
              percent_change_24h: (Math.random() - 0.5) * 8,
              percent_change_7d: (Math.random() - 0.5) * 15,
              market_cap: 320000000000,
              last_updated: new Date().toISOString()
            }
          }
        },
        {
          id: 'binancecoin',
          name: 'BNB',
          symbol: 'BNB',
          slug: 'bnb',
          cmc_rank: 3,
          circulating_supply: 150000000,
          total_supply: 150000000,
          max_supply: 200000000,
          quote: {
            USD: {
              price: 315.20 + (Math.random() - 0.5) * 30,
              volume_24h: 1200000000,
              percent_change_1h: (Math.random() - 0.5) * 1.5,
              percent_change_24h: (Math.random() - 0.5) * 6,
              percent_change_7d: (Math.random() - 0.5) * 12,
              market_cap: 47000000000,
              last_updated: new Date().toISOString()
            }
          }
        },
        {
          id: 'solana',
          name: 'Solana',
          symbol: 'SOL',
          slug: 'solana',
          cmc_rank: 4,
          circulating_supply: 470000000,
          total_supply: 580000000,
          max_supply: null,
          quote: {
            USD: {
              price: 98.45 + (Math.random() - 0.5) * 10,
              volume_24h: 2100000000,
              percent_change_1h: (Math.random() - 0.5) * 2,
              percent_change_24h: (Math.random() - 0.5) * 12,
              percent_change_7d: (Math.random() - 0.5) * 25,
              market_cap: 46000000000,
              last_updated: new Date().toISOString()
            }
          }
        },
        {
          id: 'cardano',
          name: 'Cardano',
          symbol: 'ADA',
          slug: 'cardano',
          cmc_rank: 5,
          circulating_supply: 35000000000,
          total_supply: 45000000000,
          max_supply: 45000000000,
          quote: {
            USD: {
              price: 0.52 + (Math.random() - 0.5) * 0.1,
              volume_24h: 850000000,
              percent_change_1h: (Math.random() - 0.5) * 1,
              percent_change_24h: (Math.random() - 0.5) * 8,
              percent_change_7d: (Math.random() - 0.5) * 15,
              market_cap: 18200000000,
              last_updated: new Date().toISOString()
            }
          }
        }
      ],
      globalMetrics: {
        active_cryptocurrencies: 9500,
        total_cryptocurrencies: 12500,
        btc_dominance: 52.5 + (Math.random() - 0.5) * 2,
        eth_dominance: 18.5 + (Math.random() - 0.5) * 1,
        quote: {
          USD: {
            total_market_cap: 1580000000000 + (Math.random() - 0.5) * 100000000000,
            total_volume_24h: 68000000000 + (Math.random() - 0.5) * 10000000000,
            last_updated: new Date().toISOString()
          }
        }
      },
      timestamp: new Date().toISOString(),
      source: 'fallback-with-variation',
      note: 'Using enhanced fallback data with price variations'
    }

    res.status(200).json({
      success: true,
      data: fallbackData,
      fallback: true,
      error: error.message
    })
  }
}
