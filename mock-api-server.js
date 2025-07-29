#!/usr/bin/env node

/**
 * Mock API Server for Platform Testing
 * Provides fallback endpoints while Supabase Edge Functions are being set up
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockHealthData = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  services: [
    { name: 'Database', status: 'healthy', responseTime: 5 },
    { name: 'CoinMarketCap API', status: 'healthy', responseTime: 200 },
    { name: 'Alchemy Blockchain', status: 'healthy', responseTime: 150 },
    { name: 'OpenAI GPT-4', status: 'healthy', responseTime: 300 },
    { name: 'Backend Server', status: 'healthy', responseTime: 10 },
    { name: 'Price Data API', status: 'healthy', responseTime: 50 },
    { name: 'Market Overview', status: 'healthy', responseTime: 30 },
    { name: 'DeFi Protocols', status: 'healthy', responseTime: 40 }
  ],
  overall: {
    responseTime: 98,
    uptime: 99.9,
    errorRate: 0
  }
};

const mockCryptoPrices = [
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
    ath: 69000,
    ath_change_percentage: -37.32,
    ath_date: "2021-11-10T14:24:11.849Z",
    atl: 67.81,
    atl_change_percentage: 63650.45,
    atl_date: "2013-07-06T00:00:00.000Z"
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
    ath: 4878.26,
    ath_change_percentage: -45.65,
    ath_date: "2021-11-10T14:24:19.604Z",
    atl: 0.432979,
    atl_change_percentage: 612150.23,
    atl_date: "2015-10-20T00:00:00.000Z"
  }
];

const mockNFTCollections = [
  {
    id: 'bored-ape-yacht-club',
    name: 'Bored Ape Yacht Club',
    symbol: 'BAYC',
    contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    floorPrice: 12.5,
    volume24h: 892.5,
    change24h: 5.2,
    owners: 5432,
    totalSupply: 10000,
    marketCap: 125000,
    averagePrice: 15.7,
    sales24h: 89,
    chain: 'ethereum',
    verified: true,
    image: '/api/placeholder/300/300',
    description: 'A collection of 10,000 unique Bored Ape NFTs',
    rarityEnabled: true,
    traits: []
  },
  {
    id: 'cryptopunks',
    name: 'CryptoPunks',
    symbol: 'PUNK',
    contractAddress: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb',
    floorPrice: 45.2,
    volume24h: 1250.8,
    change24h: -2.1,
    owners: 3456,
    totalSupply: 10000,
    marketCap: 452000,
    averagePrice: 52.3,
    sales24h: 34,
    chain: 'ethereum',
    verified: true,
    image: '/api/placeholder/300/300',
    description: 'The original NFT collection on Ethereum',
    rarityEnabled: true,
    traits: []
  }
];

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Mock API Server for Connectouch Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      healthCheck: '/health-check',
      cryptoPrices: '/crypto-prices',
      nftCollections: '/nft-collections'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: mockHealthData
  });
});

app.post('/health-check', (req, res) => {
  res.json(mockHealthData);
});

// Crypto prices endpoint
app.get('/crypto-prices', (req, res) => {
  res.json({
    success: true,
    data: mockCryptoPrices,
    cached: false,
    timestamp: new Date().toISOString()
  });
});

app.post('/crypto-prices', (req, res) => {
  res.json({
    success: true,
    data: mockCryptoPrices,
    cached: false,
    timestamp: new Date().toISOString()
  });
});

// NFT collections endpoint
app.get('/nft-collections', (req, res) => {
  res.json({
    success: true,
    data: mockNFTCollections,
    cached: false,
    timestamp: new Date().toISOString(),
    metadata: {
      count: mockNFTCollections.length,
      totalVolume: mockNFTCollections.reduce((sum, c) => sum + c.volume24h, 0),
      averageFloorPrice: mockNFTCollections.reduce((sum, c) => sum + c.floorPrice, 0) / mockNFTCollections.length
    }
  });
});

app.post('/nft-collections', (req, res) => {
  res.json({
    success: true,
    data: mockNFTCollections,
    cached: false,
    timestamp: new Date().toISOString(),
    metadata: {
      count: mockNFTCollections.length,
      totalVolume: mockNFTCollections.reduce((sum, c) => sum + c.volume24h, 0),
      averageFloorPrice: mockNFTCollections.reduce((sum, c) => sum + c.floorPrice, 0) / mockNFTCollections.length
    }
  });
});

// Blockchain overview endpoint
app.get('/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      totalMarketCap: 2500000000000,
      totalVolume: 85000000000,
      btcDominance: 42.5,
      ethDominance: 18.2,
      marketCapChange24h: 2.3,
      volumeChange24h: -1.2,
      activeCryptocurrencies: 10000,
      markets: 850,
      defiTvl: 45000000000,
      fearGreedIndex: 65
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `${req.method} ${req.path} is not available`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on port ${PORT}`);
  console.log(`📍 Health Check: http://localhost:${PORT}/health`);
  console.log(`💰 Crypto Prices: http://localhost:${PORT}/crypto-prices`);
  console.log(`🎨 NFT Collections: http://localhost:${PORT}/nft-collections`);
  console.log(`📊 Overview: http://localhost:${PORT}/overview`);
});

module.exports = app;
