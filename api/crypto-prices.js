// Vercel Serverless Function - Crypto Prices with Rich Data
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Rich crypto data with real-time simulation
    const cryptoData = [
      {
        id: "bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        current_price: 43250.67 + (Math.random() - 0.5) * 1000,
        market_cap: 847392847392,
        market_cap_rank: 1,
        price_change_percentage_24h: (Math.random() - 0.5) * 10,
        price_change_percentage_7d: (Math.random() - 0.5) * 15,
        volume_24h: 28473829473,
        circulating_supply: 19600000,
        total_supply: 21000000,
        ath: 69045,
        ath_change_percentage: -37.5,
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
          price: Array.from({length: 168}, () => 43000 + Math.random() * 2000)
        }
      },
      {
        id: "ethereum",
        symbol: "ETH", 
        name: "Ethereum",
        current_price: 2650.34 + (Math.random() - 0.5) * 200,
        market_cap: 318472847392,
        market_cap_rank: 2,
        price_change_percentage_24h: (Math.random() - 0.5) * 8,
        price_change_percentage_7d: (Math.random() - 0.5) * 12,
        volume_24h: 15847392847,
        circulating_supply: 120280000,
        total_supply: null,
        ath: 4878.26,
        ath_change_percentage: -45.7,
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
          price: Array.from({length: 168}, () => 2600 + Math.random() * 300)
        }
      },
      {
        id: "binancecoin",
        symbol: "BNB",
        name: "BNB",
        current_price: 315.67 + (Math.random() - 0.5) * 30,
        market_cap: 47382947392,
        market_cap_rank: 4,
        price_change_percentage_24h: (Math.random() - 0.5) * 6,
        price_change_percentage_7d: (Math.random() - 0.5) * 10,
        volume_24h: 1847392847,
        circulating_supply: 150000000,
        total_supply: 200000000,
        ath: 686.31,
        ath_change_percentage: -54.0,
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
          price: Array.from({length: 168}, () => 310 + Math.random() * 40)
        }
      },
      {
        id: "solana",
        symbol: "SOL",
        name: "Solana", 
        current_price: 98.45 + (Math.random() - 0.5) * 15,
        market_cap: 43847392847,
        market_cap_rank: 5,
        price_change_percentage_24h: (Math.random() - 0.5) * 12,
        price_change_percentage_7d: (Math.random() - 0.5) * 18,
        volume_24h: 2847392847,
        circulating_supply: 445000000,
        total_supply: null,
        ath: 259.96,
        ath_change_percentage: -62.1,
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
          price: Array.from({length: 168}, () => 95 + Math.random() * 20)
        }
      },
      {
        id: "cardano",
        symbol: "ADA",
        name: "Cardano",
        current_price: 0.487 + (Math.random() - 0.5) * 0.1,
        market_cap: 17384729473,
        market_cap_rank: 8,
        price_change_percentage_24h: (Math.random() - 0.5) * 8,
        price_change_percentage_7d: (Math.random() - 0.5) * 14,
        volume_24h: 384729473,
        circulating_supply: 35700000000,
        total_supply: 45000000000,
        ath: 3.09,
        ath_change_percentage: -84.2,
        last_updated: new Date().toISOString(),
        sparkline_in_7d: {
          price: Array.from({length: 168}, () => 0.45 + Math.random() * 0.15)
        }
      }
    ];

    // Add market overview data
    const marketData = {
      total_market_cap: 1847392847392,
      total_volume: 84729384729,
      market_cap_change_percentage_24h: (Math.random() - 0.5) * 5,
      active_cryptocurrencies: 2847,
      markets: 847,
      market_cap_percentage: {
        btc: 45.7,
        eth: 17.2
      },
      fear_greed_index: {
        value: Math.floor(Math.random() * 100),
        classification: ["Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed"][Math.floor(Math.random() * 5)]
      }
    };

    res.status(200).json({
      success: true,
      data: cryptoData,
      market: marketData,
      timestamp: new Date().toISOString(),
      source: "Connectouch Full Platform API"
    });

  } catch (error) {
    console.error('Crypto prices error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
