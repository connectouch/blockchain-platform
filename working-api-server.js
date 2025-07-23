/**
 * WORKING API Server - Guaranteed to work
 * Using only built-in modules and simple Express setup
 */

const express = require('express');
const app = express();
const PORT = 3006;

// Simple middleware
app.use(express.json());

// Simple CORS - no external dependency
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'working-api-server',
    version: '1.0.0',
    port: PORT
  });
});

// Blockchain Overview - Mock data (no external APIs for now)
app.get('/api/v2/blockchain/overview', (req, res) => {
  console.log('📊 Blockchain overview requested');
  res.json({
    success: true,
    data: {
      blockchain: {
        network: 'ethereum',
        latestBlock: '0x12a4b5c',
        timestamp: new Date().toISOString()
      },
      topCryptos: [
        { name: 'Bitcoin', symbol: 'BTC', price: 67234.56, change24h: 2.34 },
        { name: 'Ethereum', symbol: 'ETH', price: 3456.78, change24h: -1.23 },
        { name: 'Cardano', symbol: 'ADA', price: 0.45, change24h: 5.67 },
        { name: 'Solana', symbol: 'SOL', price: 156.78, change24h: 3.45 },
        { name: 'Polkadot', symbol: 'DOT', price: 7.89, change24h: -0.56 }
      ]
    },
    timestamp: new Date().toISOString()
  });
});

// Live Prices
app.get('/api/v2/blockchain/prices/live', (req, res) => {
  console.log('💰 Live prices requested');
  
  const prices = [
    { id: 1, name: 'Bitcoin', symbol: 'BTC', price: 67234.56, change24h: 2.34, marketCap: 1320000000000, volume24h: 28000000000 },
    { id: 2, name: 'Ethereum', symbol: 'ETH', price: 3456.78, change24h: -1.23, marketCap: 415000000000, volume24h: 15000000000 },
    { id: 3, name: 'Cardano', symbol: 'ADA', price: 0.45, change24h: 5.67, marketCap: 15000000000, volume24h: 450000000 },
    { id: 4, name: 'Solana', symbol: 'SOL', price: 156.78, change24h: 3.45, marketCap: 68000000000, volume24h: 2100000000 },
    { id: 5, name: 'Polkadot', symbol: 'DOT', price: 7.89, change24h: -0.56, marketCap: 9800000000, volume24h: 180000000 }
  ];

  res.json({
    success: true,
    data: {
      prices,
      timestamp: new Date().toISOString(),
      source: 'mock-data'
    }
  });
});

// DeFi Protocols
app.get('/api/v2/blockchain/defi/protocols', (req, res) => {
  console.log('🏦 DeFi protocols requested');
  
  const defiProtocols = [
    { id: 1, name: 'Uniswap', symbol: 'UNI', price: 8.45, marketCap: 5100000000, change24h: 2.1, category: 'DEX' },
    { id: 2, name: 'Aave', symbol: 'AAVE', price: 89.34, marketCap: 1340000000, change24h: -0.8, category: 'Lending' },
    { id: 3, name: 'Compound', symbol: 'COMP', price: 56.78, marketCap: 890000000, change24h: 1.5, category: 'Lending' },
    { id: 4, name: 'MakerDAO', symbol: 'MKR', price: 1234.56, marketCap: 1120000000, change24h: 0.3, category: 'Stablecoin' },
    { id: 5, name: 'Curve', symbol: 'CRV', price: 0.78, marketCap: 450000000, change24h: 3.2, category: 'DEX' }
  ];

  res.json({
    success: true,
    data: {
      protocols: defiProtocols,
      totalProtocols: defiProtocols.length,
      timestamp: new Date().toISOString()
    }
  });
});

// NFT Collections
app.get('/api/v2/blockchain/nft/collections', (req, res) => {
  console.log('🎨 NFT collections requested');
  
  const nftCollections = [
    { id: 1, name: 'Bored Ape Yacht Club', symbol: 'BAYC', floorPrice: 15.5, volume24h: 234.7, change24h: 5.2 },
    { id: 2, name: 'CryptoPunks', symbol: 'PUNKS', floorPrice: 45.8, volume24h: 156.3, change24h: -2.1 },
    { id: 3, name: 'Azuki', symbol: 'AZUKI', floorPrice: 8.2, volume24h: 89.4, change24h: 12.7 },
    { id: 4, name: 'Mutant Ape Yacht Club', symbol: 'MAYC', floorPrice: 6.1, volume24h: 67.8, change24h: -1.4 },
    { id: 5, name: 'Doodles', symbol: 'DOODLES', floorPrice: 3.4, volume24h: 45.2, change24h: 8.9 }
  ];

  res.json({
    success: true,
    data: {
      collections: nftCollections,
      totalCollections: nftCollections.length,
      timestamp: new Date().toISOString(),
      source: 'mock-data'
    }
  });
});

// GameFi Projects endpoint
app.get('/api/v2/blockchain/gamefi/projects', (req, res) => {
  console.log('🎮 GameFi projects requested');

  const gameFiProjects = [
    {
      id: 'axie-infinity',
      name: 'Axie Infinity',
      symbol: 'AXS',
      category: 'Turn-based Strategy',
      players: 2500000,
      tokenPrice: 8.45,
      marketCap: 1200000000,
      volume24h: 45000000,
      change24h: 5.2,
      chain: 'Ronin',
      playToEarn: true,
      description: 'Leading play-to-earn game with Axie creatures',
      status: 'Live',
      launched: '2018',
      averageEarnings: 150
    },
    {
      id: 'the-sandbox',
      name: 'The Sandbox',
      symbol: 'SAND',
      category: 'Metaverse',
      players: 350000,
      tokenPrice: 0.52,
      marketCap: 850000000,
      volume24h: 28000000,
      change24h: 3.8,
      chain: 'Ethereum',
      playToEarn: true,
      description: 'Virtual world for creating and monetizing gaming experiences',
      status: 'Live',
      launched: '2020',
      averageEarnings: 75
    },
    {
      id: 'decentraland',
      name: 'Decentraland',
      symbol: 'MANA',
      category: 'Metaverse',
      players: 180000,
      tokenPrice: 0.38,
      marketCap: 720000000,
      volume24h: 15000000,
      change24h: -1.2,
      chain: 'Ethereum',
      playToEarn: false,
      description: 'Virtual reality platform powered by Ethereum',
      status: 'Live',
      launched: '2020',
      averageEarnings: 45
    },
    {
      id: 'gala',
      name: 'Gala Games',
      symbol: 'GALA',
      category: 'Gaming Platform',
      players: 1200000,
      tokenPrice: 0.025,
      marketCap: 890000000,
      volume24h: 22000000,
      change24h: 7.5,
      chain: 'Ethereum',
      playToEarn: true,
      description: 'Blockchain gaming ecosystem with multiple games',
      status: 'Live',
      launched: '2019',
      averageEarnings: 95
    }
  ];

  res.json({
    success: true,
    data: gameFiProjects,
    metadata: {
      totalProjects: gameFiProjects.length,
      totalPlayers: gameFiProjects.reduce((sum, p) => sum + p.players, 0),
      totalMarketCap: gameFiProjects.reduce((sum, p) => sum + p.marketCap, 0),
      averageEarnings: gameFiProjects.reduce((sum, p) => sum + p.averageEarnings, 0) / gameFiProjects.length,
      lastUpdated: new Date().toISOString()
    }
  });
});

// DAO Projects endpoint
app.get('/api/v2/blockchain/dao/projects', (req, res) => {
  console.log('🏛️ DAO projects requested');

  const daoProjects = [
    {
      id: 'makerdao',
      name: 'MakerDAO',
      symbol: 'MKR',
      category: 'DeFi Protocol',
      treasuryValue: 8500000000,
      members: 125000,
      proposals: 450,
      tokenPrice: 2850,
      marketCap: 2650000000,
      change24h: 2.1,
      governance: 'Token-based',
      description: 'Decentralized stablecoin protocol governing DAI',
      status: 'Active',
      founded: '2017',
      votingPower: 950000
    },
    {
      id: 'uniswap-dao',
      name: 'Uniswap DAO',
      symbol: 'UNI',
      category: 'DEX Protocol',
      treasuryValue: 4200000000,
      members: 280000,
      proposals: 320,
      tokenPrice: 8.45,
      marketCap: 5100000000,
      change24h: 4.3,
      governance: 'Token-based',
      description: 'Decentralized exchange governance',
      status: 'Active',
      founded: '2020',
      votingPower: 1000000
    },
    {
      id: 'compound-dao',
      name: 'Compound DAO',
      symbol: 'COMP',
      category: 'Lending Protocol',
      treasuryValue: 1800000000,
      members: 85000,
      proposals: 180,
      tokenPrice: 65.20,
      marketCap: 650000000,
      change24h: -0.8,
      governance: 'Token-based',
      description: 'Decentralized lending governance',
      status: 'Active',
      founded: '2020',
      votingPower: 450000
    },
    {
      id: 'aave-dao',
      name: 'Aave DAO',
      symbol: 'AAVE',
      category: 'Lending Protocol',
      treasuryValue: 2100000000,
      members: 95000,
      proposals: 220,
      tokenPrice: 145.80,
      marketCap: 2200000000,
      change24h: 1.9,
      governance: 'Token-based',
      description: 'Decentralized lending and borrowing protocol',
      status: 'Active',
      founded: '2020',
      votingPower: 650000
    }
  ];

  res.json({
    success: true,
    data: daoProjects,
    metadata: {
      totalProjects: daoProjects.length,
      totalTreasuryValue: daoProjects.reduce((sum, d) => sum + d.treasuryValue, 0),
      totalMembers: daoProjects.reduce((sum, d) => sum + d.members, 0),
      totalProposals: daoProjects.reduce((sum, d) => sum + d.proposals, 0),
      averageVotingPower: daoProjects.reduce((sum, d) => sum + d.votingPower, 0) / daoProjects.length,
      lastUpdated: new Date().toISOString()
    }
  });
});

// Infrastructure Projects endpoint
app.get('/api/v2/blockchain/infrastructure/projects', (req, res) => {
  console.log('🏗️ Infrastructure projects requested');

  const infrastructureProjects = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      category: 'Layer 1',
      marketCap: 420000000000,
      price: 3456.78,
      change24h: -1.23,
      tps: 15,
      gasPrice: 25,
      validators: 850000,
      tvl: 45000000000,
      description: 'Leading smart contract platform',
      consensus: 'Proof of Stake',
      launched: '2015',
      status: 'Active'
    },
    {
      id: 'arbitrum',
      name: 'Arbitrum',
      symbol: 'ARB',
      category: 'Layer 2',
      marketCap: 8500000000,
      price: 1.25,
      change24h: 4.8,
      tps: 4000,
      gasPrice: 0.1,
      validators: 0,
      tvl: 2800000000,
      description: 'Optimistic rollup scaling solution',
      consensus: 'Optimistic Rollup',
      launched: '2021',
      status: 'Active'
    },
    {
      id: 'polygon',
      name: 'Polygon',
      symbol: 'MATIC',
      category: 'Layer 2',
      marketCap: 6200000000,
      price: 0.68,
      change24h: 2.1,
      tps: 7000,
      gasPrice: 0.01,
      validators: 100,
      tvl: 1200000000,
      description: 'Ethereum scaling and infrastructure development',
      consensus: 'Proof of Stake',
      launched: '2020',
      status: 'Active'
    },
    {
      id: 'chainlink',
      name: 'Chainlink',
      symbol: 'LINK',
      category: 'Oracle',
      marketCap: 8400000000,
      price: 14.25,
      change24h: 2.8,
      tps: 0,
      gasPrice: 0,
      validators: 1250,
      tvl: 0,
      description: 'Decentralized oracle network providing real-world data',
      consensus: 'Oracle Network',
      launched: '2017',
      status: 'Active'
    }
  ];

  res.json({
    success: true,
    data: infrastructureProjects,
    metadata: {
      totalProjects: infrastructureProjects.length,
      totalMarketCap: infrastructureProjects.reduce((sum, p) => sum + p.marketCap, 0),
      totalTVL: infrastructureProjects.reduce((sum, p) => sum + p.tvl, 0),
      averageTPS: infrastructureProjects.filter(p => p.tps > 0).reduce((sum, p) => sum + p.tps, 0) / infrastructureProjects.filter(p => p.tps > 0).length,
      totalValidators: infrastructureProjects.reduce((sum, p) => sum + p.validators, 0),
      lastUpdated: new Date().toISOString()
    }
  });
});

// Web3 Tools endpoint
app.get('/api/v2/blockchain/tools/list', (req, res) => {
  console.log('🔧 Web3 tools requested');

  const web3Tools = [
    {
      id: 'metamask',
      name: 'MetaMask',
      category: 'Wallet',
      type: 'Browser Extension',
      users: 30000000,
      rating: 4.5,
      price: 'Free',
      description: 'Most popular Ethereum wallet and gateway to blockchain apps',
      features: ['Wallet', 'DApp Browser', 'Token Swaps', 'NFT Support'],
      platforms: ['Chrome', 'Firefox', 'Mobile'],
      status: 'Active',
      launched: '2016'
    },
    {
      id: 'hardhat',
      name: 'Hardhat',
      category: 'Development',
      type: 'Framework',
      users: 500000,
      rating: 4.8,
      price: 'Free',
      description: 'Ethereum development environment for professionals',
      features: ['Smart Contract Testing', 'Deployment', 'Debugging', 'Network Forking'],
      platforms: ['Node.js', 'CLI'],
      status: 'Active',
      launched: '2019'
    },
    {
      id: 'remix',
      name: 'Remix IDE',
      category: 'Development',
      type: 'IDE',
      users: 1000000,
      rating: 4.3,
      price: 'Free',
      description: 'Web-based IDE for Ethereum smart contract development',
      features: ['Code Editor', 'Compiler', 'Debugger', 'Testing'],
      platforms: ['Web Browser'],
      status: 'Active',
      launched: '2016'
    },
    {
      id: 'opensea',
      name: 'OpenSea',
      category: 'Marketplace',
      type: 'NFT Platform',
      users: 2000000,
      rating: 4.2,
      price: '2.5% fee',
      description: 'Largest NFT marketplace for buying, selling, and discovering',
      features: ['NFT Trading', 'Collections', 'Auctions', 'Analytics'],
      platforms: ['Web', 'Mobile'],
      status: 'Active',
      launched: '2017'
    },
    {
      id: 'etherscan',
      name: 'Etherscan',
      category: 'Explorer',
      type: 'Blockchain Explorer',
      users: 5000000,
      rating: 4.7,
      price: 'Free',
      description: 'Ethereum blockchain explorer and analytics platform',
      features: ['Transaction Tracking', 'Contract Verification', 'Analytics', 'API'],
      platforms: ['Web', 'API'],
      status: 'Active',
      launched: '2015'
    }
  ];

  res.json({
    success: true,
    data: web3Tools,
    metadata: {
      totalTools: web3Tools.length,
      totalUsers: web3Tools.reduce((sum, t) => sum + t.users, 0),
      averageRating: web3Tools.reduce((sum, t) => sum + t.rating, 0) / web3Tools.length,
      categories: [...new Set(web3Tools.map(t => t.category))],
      freeTools: web3Tools.filter(t => t.price === 'Free').length,
      lastUpdated: new Date().toISOString()
    }
  });
});

// Leverage Trading Positions endpoint
app.get('/api/v2/blockchain/leverage/positions', (req, res) => {
  console.log('⚡ Leverage positions requested');

  const leveragePositions = [
    {
      id: 'pos-001',
      protocol: 'dYdX',
      asset: 'ETH-USD',
      type: 'perpetual',
      side: 'long',
      size: 10.5,
      entryPrice: 3420.50,
      currentPrice: 3456.78,
      leverage: 5,
      margin: 7200,
      unrealizedPnl: 381.94,
      unrealizedPnlPercent: 5.3,
      liquidationPrice: 2736.40,
      fundingRate: 0.0125,
      nextFunding: '2025-07-22T22:00:00Z',
      status: 'open',
      openTime: '2025-07-22T18:30:00Z'
    },
    {
      id: 'pos-002',
      protocol: 'GMX',
      asset: 'BTC-USD',
      type: 'perpetual',
      side: 'short',
      size: 0.25,
      entryPrice: 67800.00,
      currentPrice: 67234.56,
      leverage: 10,
      margin: 1695,
      unrealizedPnl: 141.36,
      unrealizedPnlPercent: 8.3,
      liquidationPrice: 74580.00,
      fundingRate: -0.0089,
      nextFunding: '2025-07-22T22:00:00Z',
      status: 'open',
      openTime: '2025-07-22T16:45:00Z'
    },
    {
      id: 'pos-003',
      protocol: 'Perpetual Protocol',
      asset: 'AVAX-USD',
      type: 'perpetual',
      side: 'long',
      size: 100,
      entryPrice: 28.50,
      currentPrice: 29.75,
      leverage: 3,
      margin: 950,
      unrealizedPnl: 125.00,
      unrealizedPnlPercent: 13.2,
      liquidationPrice: 19.00,
      fundingRate: 0.0156,
      nextFunding: '2025-07-22T22:00:00Z',
      status: 'open',
      openTime: '2025-07-22T20:15:00Z'
    }
  ];

  res.json({
    success: true,
    data: leveragePositions,
    metadata: {
      totalPositions: leveragePositions.length,
      totalUnrealizedPnl: leveragePositions.reduce((sum, p) => sum + p.unrealizedPnl, 0),
      totalMargin: leveragePositions.reduce((sum, p) => sum + p.margin, 0),
      openPositions: leveragePositions.filter(p => p.status === 'open').length,
      protocols: [...new Set(leveragePositions.map(p => p.protocol))],
      lastUpdated: new Date().toISOString()
    }
  });
});

// Yield Farming Opportunities endpoint
app.get('/api/v2/blockchain/yield/opportunities', (req, res) => {
  console.log('🌾 Yield farming opportunities requested');

  const yieldOpportunities = [
    {
      id: 'yield-001',
      protocol: 'Curve Finance',
      pool: '3pool',
      assets: ['USDC', 'USDT', 'DAI'],
      apy: 15.8,
      tvl: 1200000000,
      riskLevel: 'low',
      lockPeriod: 0,
      minDeposit: 100,
      rewards: ['CRV', 'CVX'],
      impermanentLoss: 'minimal',
      fees: { deposit: 0, withdrawal: 0.1, performance: 0 },
      description: 'Stable coin pool with minimal impermanent loss',
      auditStatus: 'audited',
      isActive: true
    },
    {
      id: 'yield-002',
      protocol: 'Uniswap V3',
      pool: 'ETH/USDC 0.3%',
      assets: ['ETH', 'USDC'],
      apy: 28.5,
      tvl: 850000000,
      riskLevel: 'medium',
      lockPeriod: 0,
      minDeposit: 1000,
      rewards: ['UNI'],
      impermanentLoss: 'moderate',
      fees: { deposit: 0, withdrawal: 0, performance: 0 },
      description: 'High-yield ETH/USDC liquidity provision',
      auditStatus: 'audited',
      isActive: true
    },
    {
      id: 'yield-003',
      protocol: 'Yearn Finance',
      pool: 'yvUSDC',
      assets: ['USDC'],
      apy: 12.4,
      tvl: 450000000,
      riskLevel: 'medium',
      lockPeriod: 0,
      minDeposit: 1,
      rewards: ['YFI'],
      impermanentLoss: 'none',
      fees: { deposit: 0, withdrawal: 0.5, performance: 20 },
      description: 'Automated yield farming strategy',
      auditStatus: 'audited',
      isActive: true
    },
    {
      id: 'yield-004',
      protocol: 'Convex Finance',
      pool: 'cvxCRV',
      assets: ['CRV'],
      apy: 45.2,
      tvl: 320000000,
      riskLevel: 'high',
      lockPeriod: 16,
      minDeposit: 10,
      rewards: ['CVX', 'CRV'],
      impermanentLoss: 'none',
      fees: { deposit: 0, withdrawal: 1, performance: 17 },
      description: 'Boosted Curve rewards through Convex',
      auditStatus: 'audited',
      isActive: true
    }
  ];

  res.json({
    success: true,
    data: yieldOpportunities,
    metadata: {
      totalOpportunities: yieldOpportunities.length,
      averageApy: yieldOpportunities.reduce((sum, o) => sum + o.apy, 0) / yieldOpportunities.length,
      totalTvl: yieldOpportunities.reduce((sum, o) => sum + o.tvl, 0),
      riskLevels: [...new Set(yieldOpportunities.map(o => o.riskLevel))],
      protocols: [...new Set(yieldOpportunities.map(o => o.protocol))],
      highestApy: Math.max(...yieldOpportunities.map(o => o.apy)),
      lastUpdated: new Date().toISOString()
    }
  });
});

// Liquidity Pools Analytics endpoint
app.get('/api/v2/blockchain/liquidity/pools', (req, res) => {
  console.log('💧 Liquidity pools requested');

  const liquidityPools = [
    {
      id: 'pool-001',
      protocol: 'Uniswap V3',
      pair: 'ETH/USDC',
      fee: 0.3,
      tvl: 850000000,
      volume24h: 125000000,
      fees24h: 375000,
      apy: 28.5,
      token0: { symbol: 'ETH', reserve: 245000, price: 3456.78 },
      token1: { symbol: 'USDC', reserve: 425000000, price: 1.00 },
      priceRange: { min: 3200, max: 3700, current: 3456.78 },
      utilization: 78.5,
      impermanentLoss: 2.3,
      status: 'active'
    },
    {
      id: 'pool-002',
      protocol: 'Curve Finance',
      pair: 'USDC/USDT/DAI',
      fee: 0.04,
      tvl: 1200000000,
      volume24h: 85000000,
      fees24h: 34000,
      apy: 15.8,
      token0: { symbol: 'USDC', reserve: 400000000, price: 1.00 },
      token1: { symbol: 'USDT', reserve: 400000000, price: 1.00 },
      token2: { symbol: 'DAI', reserve: 400000000, price: 1.00 },
      priceRange: { min: 0.998, max: 1.002, current: 1.000 },
      utilization: 92.1,
      impermanentLoss: 0.1,
      status: 'active'
    },
    {
      id: 'pool-003',
      protocol: 'Balancer',
      pair: 'BAL/WETH',
      fee: 0.5,
      tvl: 45000000,
      volume24h: 8500000,
      fees24h: 42500,
      apy: 34.6,
      token0: { symbol: 'BAL', reserve: 2500000, price: 8.45 },
      token1: { symbol: 'WETH', reserve: 6500, price: 3456.78 },
      priceRange: { min: 6.50, max: 10.50, current: 8.45 },
      utilization: 65.3,
      impermanentLoss: 5.8,
      status: 'active'
    }
  ];

  res.json({
    success: true,
    data: liquidityPools,
    metadata: {
      totalPools: liquidityPools.length,
      totalTvl: liquidityPools.reduce((sum, p) => sum + p.tvl, 0),
      totalVolume24h: liquidityPools.reduce((sum, p) => sum + p.volume24h, 0),
      totalFees24h: liquidityPools.reduce((sum, p) => sum + p.fees24h, 0),
      averageApy: liquidityPools.reduce((sum, p) => sum + p.apy, 0) / liquidityPools.length,
      protocols: [...new Set(liquidityPools.map(p => p.protocol))],
      lastUpdated: new Date().toISOString()
    }
  });
});

// Arbitrage Opportunities endpoint
app.get('/api/v2/blockchain/arbitrage/opportunities', (req, res) => {
  console.log('🔄 Arbitrage opportunities requested');

  const arbitrageOpportunities = [
    {
      id: 'arb-001',
      asset: 'ETH',
      buyExchange: 'Uniswap',
      sellExchange: 'SushiSwap',
      buyPrice: 3445.20,
      sellPrice: 3467.80,
      spread: 22.60,
      spreadPercent: 0.66,
      volume: 150000,
      estimatedProfit: 3390,
      gasEstimate: 0.025,
      netProfit: 3303.75,
      confidence: 'high',
      timeWindow: 45,
      complexity: 'simple',
      requiredCapital: 517800
    },
    {
      id: 'arb-002',
      asset: 'USDC',
      buyExchange: 'Curve',
      sellExchange: 'Balancer',
      buyPrice: 0.9995,
      sellPrice: 1.0018,
      spread: 0.0023,
      spreadPercent: 0.23,
      volume: 500000,
      estimatedProfit: 1150,
      gasEstimate: 0.015,
      netProfit: 1098.25,
      confidence: 'medium',
      timeWindow: 120,
      complexity: 'moderate',
      requiredCapital: 499750
    },
    {
      id: 'arb-003',
      asset: 'BTC',
      buyExchange: 'dYdX',
      sellExchange: 'Perpetual Protocol',
      buyPrice: 67180.50,
      sellPrice: 67298.20,
      spread: 117.70,
      spreadPercent: 0.18,
      volume: 5.5,
      estimatedProfit: 647.35,
      gasEstimate: 0.035,
      netProfit: 526.40,
      confidence: 'medium',
      timeWindow: 30,
      complexity: 'complex',
      requiredCapital: 369492.75
    }
  ];

  res.json({
    success: true,
    data: arbitrageOpportunities,
    metadata: {
      totalOpportunities: arbitrageOpportunities.length,
      totalEstimatedProfit: arbitrageOpportunities.reduce((sum, o) => sum + o.estimatedProfit, 0),
      totalNetProfit: arbitrageOpportunities.reduce((sum, o) => sum + o.netProfit, 0),
      averageSpread: arbitrageOpportunities.reduce((sum, o) => sum + o.spreadPercent, 0) / arbitrageOpportunities.length,
      highConfidenceCount: arbitrageOpportunities.filter(o => o.confidence === 'high').length,
      exchanges: [...new Set(arbitrageOpportunities.flatMap(o => [o.buyExchange, o.sellExchange]))],
      lastUpdated: new Date().toISOString()
    }
  });
});

// Lending & Borrowing Rates endpoint
app.get('/api/v2/blockchain/lending/rates', (req, res) => {
  console.log('🏦 Lending & borrowing rates requested');

  const lendingRates = [
    {
      protocol: 'Aave V3',
      asset: 'USDC',
      supplyApy: 4.25,
      borrowApy: 6.80,
      utilization: 78.5,
      totalSupply: 2800000000,
      totalBorrow: 2198000000,
      liquidationThreshold: 85,
      ltv: 80,
      collateralFactor: 0.8,
      reserveFactor: 10,
      isActive: true,
      isFrozen: false
    },
    {
      protocol: 'Compound V3',
      asset: 'ETH',
      supplyApy: 3.15,
      borrowApy: 5.45,
      utilization: 65.2,
      totalSupply: 1200000,
      totalBorrow: 782400,
      liquidationThreshold: 82.5,
      ltv: 75,
      collateralFactor: 0.75,
      reserveFactor: 15,
      isActive: true,
      isFrozen: false
    },
    {
      protocol: 'Morpho',
      asset: 'WBTC',
      supplyApy: 2.85,
      borrowApy: 4.95,
      utilization: 58.7,
      totalSupply: 15000,
      totalBorrow: 8805,
      liquidationThreshold: 80,
      ltv: 70,
      collateralFactor: 0.7,
      reserveFactor: 20,
      isActive: true,
      isFrozen: false
    },
    {
      protocol: 'Euler',
      asset: 'DAI',
      supplyApy: 5.65,
      borrowApy: 8.20,
      utilization: 82.3,
      totalSupply: 450000000,
      totalBorrow: 370350000,
      liquidationThreshold: 88,
      ltv: 85,
      collateralFactor: 0.85,
      reserveFactor: 8,
      isActive: true,
      isFrozen: false
    }
  ];

  res.json({
    success: true,
    data: lendingRates,
    metadata: {
      totalProtocols: lendingRates.length,
      averageSupplyApy: lendingRates.reduce((sum, r) => sum + r.supplyApy, 0) / lendingRates.length,
      averageBorrowApy: lendingRates.reduce((sum, r) => sum + r.borrowApy, 0) / lendingRates.length,
      averageUtilization: lendingRates.reduce((sum, r) => sum + r.utilization, 0) / lendingRates.length,
      highestSupplyApy: Math.max(...lendingRates.map(r => r.supplyApy)),
      lowestBorrowApy: Math.min(...lendingRates.map(r => r.borrowApy)),
      protocols: [...new Set(lendingRates.map(r => r.protocol))],
      assets: [...new Set(lendingRates.map(r => r.asset))],
      lastUpdated: new Date().toISOString()
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Start server with error handling
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 WORKING API Server running on http://127.0.0.1:${PORT}`);
  console.log(`✅ Health check: http://127.0.0.1:${PORT}/health`);
  console.log(`📊 Blockchain overview: http://127.0.0.1:${PORT}/api/v2/blockchain/overview`);
  console.log(`💰 Live prices: http://127.0.0.1:${PORT}/api/v2/blockchain/prices/live`);
  console.log(`🏦 DeFi protocols: http://127.0.0.1:${PORT}/api/v2/blockchain/defi/protocols`);
  console.log(`🎨 NFT collections: http://127.0.0.1:${PORT}/api/v2/blockchain/nft/collections`);
  console.log(`🎯 Server ready for connections!`);
});

server.on('error', (err) => {
  console.error('❌ Server startup error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;
