const axios = require('axios');

// API Keys
const COINMARKETCAP_API_KEY = 'd714f7e6-91a5-47ac-866e-f28f26eee302';

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Get symbols from query params or use defaults
    const symbols = event.queryStringParameters?.symbols || 'BTC,ETH,BNB,ADA,SOL,DOT,LINK,UNI,AVAX,MATIC';
    
    const response = await axios.get(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
      {
        params: {
          symbol: symbols,
          convert: 'USD'
        },
        headers: {
          'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );
    
    const data = response.data.data;
    const prices = Object.values(data).map(coin => ({
      symbol: coin.symbol,
      name: coin.name,
      price: coin.quote.USD.price,
      price_change_24h: coin.quote.USD.change_24h,
      price_change_percentage_24h: coin.quote.USD.percent_change_24h,
      market_cap: coin.quote.USD.market_cap,
      market_cap_rank: coin.cmc_rank,
      volume_24h: coin.quote.USD.volume_24h,
      circulating_supply: coin.circulating_supply,
      total_supply: coin.total_supply,
      max_supply: coin.max_supply,
      last_updated: coin.last_updated
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: prices,
        cached: false,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Crypto prices error:', error);
    
    // Return fallback data if API fails
    const fallbackPrices = [
      {
        symbol: "BTC",
        name: "Bitcoin",
        price: 43250.50,
        price_change_24h: 1250.30,
        price_change_percentage_24h: 2.98,
        market_cap: 847500000000,
        market_cap_rank: 1,
        volume_24h: 28500000000,
        circulating_supply: 19600000,
        total_supply: 21000000,
        max_supply: 21000000,
        last_updated: new Date().toISOString()
      },
      {
        symbol: "ETH",
        name: "Ethereum",
        price: 2650.75,
        price_change_24h: 85.20,
        price_change_percentage_24h: 3.32,
        market_cap: 318750000000,
        market_cap_rank: 2,
        volume_24h: 15200000000,
        circulating_supply: 120280000,
        total_supply: 120280000,
        max_supply: null,
        last_updated: new Date().toISOString()
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: fallbackPrices,
        cached: true,
        timestamp: new Date().toISOString(),
        note: 'Using fallback data due to API error'
      })
    };
  }
};
