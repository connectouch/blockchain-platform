// Vercel Serverless Function - Rich DeFi Protocols Data
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Rich DeFi protocols data with real-time simulation
    const defiProtocols = [
      {
        id: "uniswap",
        name: "Uniswap",
        symbol: "UNI",
        category: "DEX",
        chain: "Ethereum",
        tvl: 4200000000 + Math.random() * 500000000,
        volume_24h: 1200000000 + Math.random() * 200000000,
        fees_24h: 3400000 + Math.random() * 500000,
        apy: 8.5 + Math.random() * 3,
        token_price: 6.45 + Math.random() * 2,
        market_cap: 4800000000,
        users_24h: 45000 + Math.random() * 10000,
        transactions_24h: 180000 + Math.random() * 30000,
        pools: [
          { pair: "ETH/USDC", tvl: 450000000, apy: 12.3, volume_24h: 120000000 },
          { pair: "WBTC/ETH", tvl: 280000000, apy: 15.7, volume_24h: 85000000 },
          { pair: "UNI/ETH", tvl: 180000000, apy: 18.2, volume_24h: 45000000 }
        ],
        governance: {
          proposals_active: 3,
          voting_power: 125000000,
          participation_rate: 12.5
        }
      },
      {
        id: "aave",
        name: "Aave",
        symbol: "AAVE",
        category: "Lending",
        chain: "Multi-chain",
        tvl: 6800000000 + Math.random() * 800000000,
        volume_24h: 450000000 + Math.random() * 100000000,
        fees_24h: 2100000 + Math.random() * 300000,
        apy: 12.3 + Math.random() * 4,
        token_price: 95.67 + Math.random() * 15,
        market_cap: 1400000000,
        users_24h: 28000 + Math.random() * 5000,
        transactions_24h: 95000 + Math.random() * 15000,
        markets: [
          { asset: "USDC", supply_apy: 4.2, borrow_apy: 6.8, utilization: 78.5 },
          { asset: "ETH", supply_apy: 3.1, borrow_apy: 5.9, utilization: 65.2 },
          { asset: "WBTC", supply_apy: 2.8, borrow_apy: 5.1, utilization: 58.7 }
        ],
        safety_module: {
          staked_aave: 2800000,
          rewards_apy: 7.2,
          slashing_risk: "Low"
        }
      },
      {
        id: "compound",
        name: "Compound",
        symbol: "COMP",
        category: "Lending",
        chain: "Ethereum",
        tvl: 3100000000 + Math.random() * 400000000,
        volume_24h: 280000000 + Math.random() * 50000000,
        fees_24h: 1800000 + Math.random() * 200000,
        apy: 9.7 + Math.random() * 3,
        token_price: 58.34 + Math.random() * 8,
        market_cap: 580000000,
        users_24h: 18000 + Math.random() * 3000,
        transactions_24h: 65000 + Math.random() * 10000,
        markets: [
          { asset: "USDC", supply_apy: 3.8, borrow_apy: 6.2, utilization: 82.1 },
          { asset: "DAI", supply_apy: 4.1, borrow_apy: 6.5, utilization: 75.8 },
          { asset: "ETH", supply_apy: 2.9, borrow_apy: 5.4, utilization: 68.3 }
        ],
        governance: {
          proposals_active: 2,
          voting_power: 45000000,
          participation_rate: 8.7
        }
      },
      {
        id: "makerdao",
        name: "MakerDAO",
        symbol: "MKR",
        category: "CDP",
        chain: "Ethereum",
        tvl: 8400000000 + Math.random() * 1000000000,
        volume_24h: 180000000 + Math.random() * 30000000,
        fees_24h: 2800000 + Math.random() * 400000,
        apy: 6.2 + Math.random() * 2,
        token_price: 1580.45 + Math.random() * 200,
        market_cap: 1450000000,
        users_24h: 12000 + Math.random() * 2000,
        transactions_24h: 35000 + Math.random() * 5000,
        vaults: [
          { collateral: "ETH-A", stability_fee: 5.25, liquidation_ratio: 145, debt_ceiling: 15000000000 },
          { collateral: "WBTC-A", stability_fee: 5.25, liquidation_ratio: 145, debt_ceiling: 1500000000 },
          { collateral: "USDC-A", stability_fee: 1.0, liquidation_ratio: 101, debt_ceiling: 10000000000 }
        ],
        dai_stats: {
          total_supply: 5200000000,
          savings_rate: 3.19,
          peg_stability: 0.9998
        }
      },
      {
        id: "curve",
        name: "Curve Finance",
        symbol: "CRV",
        category: "DEX",
        chain: "Multi-chain",
        tvl: 2800000000 + Math.random() * 300000000,
        volume_24h: 850000000 + Math.random() * 150000000,
        fees_24h: 1200000 + Math.random() * 200000,
        apy: 15.8 + Math.random() * 5,
        token_price: 0.78 + Math.random() * 0.2,
        market_cap: 380000000,
        users_24h: 22000 + Math.random() * 4000,
        transactions_24h: 75000 + Math.random() * 12000,
        pools: [
          { name: "3pool", tvl: 680000000, apy: 8.5, assets: ["USDC", "USDT", "DAI"] },
          { name: "stETH", tvl: 420000000, apy: 12.3, assets: ["ETH", "stETH"] },
          { name: "FRAX", tvl: 280000000, apy: 18.7, assets: ["FRAX", "USDC"] }
        ],
        ve_crv: {
          locked_crv: 125000000,
          avg_lock_time: 2.8,
          voting_power: 89000000
        }
      }
    ];

    // Calculate aggregated metrics
    const totalTVL = defiProtocols.reduce((sum, protocol) => sum + protocol.tvl, 0);
    const totalVolume24h = defiProtocols.reduce((sum, protocol) => sum + protocol.volume_24h, 0);
    const totalFees24h = defiProtocols.reduce((sum, protocol) => sum + protocol.fees_24h, 0);
    const avgAPY = defiProtocols.reduce((sum, protocol) => sum + protocol.apy, 0) / defiProtocols.length;

    const response = {
      success: true,
      data: defiProtocols,
      aggregated: {
        total_tvl: totalTVL,
        total_volume_24h: totalVolume24h,
        total_fees_24h: totalFees24h,
        average_apy: avgAPY,
        protocol_count: defiProtocols.length,
        chains_supported: ["Ethereum", "Polygon", "Arbitrum", "Optimism", "Avalanche", "BSC"],
        categories: ["DEX", "Lending", "CDP", "Yield Farming", "Insurance", "Derivatives"]
      },
      market_trends: {
        tvl_change_24h: (Math.random() - 0.5) * 10,
        volume_change_24h: (Math.random() - 0.5) * 15,
        new_protocols_7d: Math.floor(Math.random() * 5) + 2,
        governance_activity: "High"
      },
      timestamp: new Date().toISOString(),
      source: "Connectouch DeFi Analytics"
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('DeFi protocols error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
