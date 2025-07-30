const COINMARKETCAP_API_KEY = 'd714f7e6-91a5-47ac-866e-f28f26eee302'

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  try {
    // Extract symbol from path
    const symbol = event.path.split('/').pop()
    
    if (!symbol) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Symbol parameter is required' })
      }
    }

    console.log(`Fetching logo for symbol: ${symbol}`)

    // Try CoinMarketCap API first
    try {
      const cmcResponse = await fetch(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${symbol.toUpperCase()}`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
            'Accept': 'application/json'
          }
        }
      )

      if (cmcResponse.ok) {
        const cmcData = await cmcResponse.json()
        if (cmcData.data && cmcData.data[symbol.toUpperCase()] && cmcData.data[symbol.toUpperCase()].logo) {
          console.log(`Found CoinMarketCap logo for ${symbol}`)
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              logo: cmcData.data[symbol.toUpperCase()].logo,
              source: 'coinmarketcap'
            })
          }
        }
      }
    } catch (error) {
      console.warn(`CoinMarketCap API failed for ${symbol}:`, error.message)
    }

    // Try CoinGecko API as fallback
    try {
      const geckoResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`
      )

      if (geckoResponse.ok) {
        const geckoData = await geckoResponse.json()
        if (geckoData.image && geckoData.image.large) {
          console.log(`Found CoinGecko logo for ${symbol}`)
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              logo: geckoData.image.large,
              source: 'coingecko'
            })
          }
        }
      }
    } catch (error) {
      console.warn(`CoinGecko API failed for ${symbol}:`, error.message)
    }

    // Use CryptoLogos.cc as reliable fallback
    const cryptoLogosUrls = {
      'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      'BNB': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
      'ADA': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
      'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.png',
      'DOT': 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
      'AVAX': 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
      'MATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
      'LINK': 'https://cryptologos.cc/logos/chainlink-link-logo.png',
      'UNI': 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
      'AAVE': 'https://cryptologos.cc/logos/aave-aave-logo.png',
      'COMP': 'https://cryptologos.cc/logos/compound-comp-logo.png',
      'MKR': 'https://cryptologos.cc/logos/maker-mkr-logo.png',
      'SNX': 'https://cryptologos.cc/logos/synthetix-snx-logo.png',
      'YFI': 'https://cryptologos.cc/logos/yearn-finance-yfi-logo.png',
      'SUSHI': 'https://cryptologos.cc/logos/sushiswap-sushi-logo.png',
      'CRV': 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.png',
      'BAL': 'https://cryptologos.cc/logos/balancer-bal-logo.png',
      'USDC': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      'USDT': 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      'DAI': 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png'
    }

    const cryptoLogosUrl = cryptoLogosUrls[symbol.toUpperCase()]
    if (cryptoLogosUrl) {
      console.log(`Using CryptoLogos.cc for ${symbol}`)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          logo: cryptoLogosUrl,
          source: 'cryptologos'
        })
      }
    }

    // Generate SVG fallback
    const colors = {
      'BTC': '#f7931a', 'ETH': '#627eea', 'BNB': '#f3ba2f', 'ADA': '#0033ad',
      'SOL': '#9945ff', 'DOT': '#e6007a', 'AVAX': '#e84142', 'MATIC': '#8247e5',
      'LINK': '#375bd2', 'UNI': '#ff007a', 'AAVE': '#b6509e', 'COMP': '#00d395',
      'MKR': '#1aab9b', 'SNX': '#5fcdf7', 'YFI': '#006ae3', 'SUSHI': '#fa52a0',
      'CRV': '#40649f', 'BAL': '#1e1e1e', 'USDC': '#2775ca', 'USDT': '#26a17b',
      'DAI': '#f5ac37'
    }

    const color = colors[symbol.toUpperCase()] || '#6366f1'
    const symbolText = symbol.toUpperCase().slice(0, 4)
    const size = 64

    const svgFallback = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cryptoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#cryptoGrad)"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="none" stroke="white" stroke-width="2" opacity="0.3"/>
        <text x="${size/2}" y="${size/2 + 6}" text-anchor="middle" fill="white" 
              font-family="Arial, sans-serif" font-size="18" font-weight="bold">
          ${symbolText}
        </text>
      </svg>
    `)}`

    console.log(`Generated SVG fallback for ${symbol}`)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        logo: svgFallback,
        source: 'generated'
      })
    }

  } catch (error) {
    console.error('Crypto logo function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    }
  }
}
