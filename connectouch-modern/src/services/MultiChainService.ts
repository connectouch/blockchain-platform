// Multi-Chain Service for handling multiple blockchain networks
export interface ChainConfig {
  id: string
  name: string
  displayName: string
  nativeToken: {
    symbol: string
    name: string
    decimals: number
    coingeckoId: string
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
  chainId: number
  networkId: number
  isTestnet: boolean
  color: string
  icon: string
  features: {
    defi: boolean
    nft: boolean
    staking: boolean
    bridges: boolean
  }
  popularTokens: TokenConfig[]
  defiProtocols: DeFiProtocol[]
  bridges: BridgeConfig[]
}

export interface TokenConfig {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
  coingeckoId?: string
  isNative?: boolean
}

export interface DeFiProtocol {
  id: string
  name: string
  category: 'dex' | 'lending' | 'yield' | 'staking' | 'insurance'
  tvl: number
  apy?: number
  url: string
  logoURI: string
  description: string
}

export interface BridgeConfig {
  id: string
  name: string
  supportedChains: string[]
  fees: {
    fixed: number
    percentage: number
  }
  timeEstimate: string
  maxAmount: number
  minAmount: number
  url: string
}

export interface ChainMetrics {
  chainId: string
  blockHeight: number
  gasPrice: number
  tps: number
  tvl: number
  activeAddresses: number
  transactions24h: number
  marketCap: number
  price: number
  priceChange24h: number
}

export interface CrossChainPortfolio {
  totalValue: number
  totalValueChange24h: number
  chainBreakdown: {
    [chainId: string]: {
      value: number
      percentage: number
      tokens: any[]
    }
  }
  topTokens: any[]
  diversificationScore: number
}

// Supported blockchain configurations
export const SUPPORTED_CHAINS: { [key: string]: ChainConfig } = {
  ethereum: {
    id: 'ethereum',
    name: 'ethereum',
    displayName: 'Ethereum',
    nativeToken: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      coingeckoId: 'ethereum'
    },
    rpcUrls: ['https://mainnet.infura.io/v3/', 'https://eth-mainnet.alchemyapi.io/v2/'],
    blockExplorerUrls: ['https://etherscan.io'],
    chainId: 1,
    networkId: 1,
    isTestnet: false,
    color: '#627EEA',
    icon: '⟠',
    features: {
      defi: true,
      nft: true,
      staking: true,
      bridges: true
    },
    popularTokens: [
      {
        address: '0xA0b86a33E6441b8C4505E2E2E5b3e3B3E3B3E3B3',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
        coingeckoId: 'usd-coin'
      },
      {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png',
        coingeckoId: 'tether'
      }
    ],
    defiProtocols: [
      {
        id: 'uniswap-v3',
        name: 'Uniswap V3',
        category: 'dex',
        tvl: 3500000000,
        url: 'https://app.uniswap.org',
        logoURI: 'https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png',
        description: 'Leading decentralized exchange on Ethereum'
      },
      {
        id: 'aave-v3',
        name: 'Aave V3',
        category: 'lending',
        tvl: 6200000000,
        apy: 4.2,
        url: 'https://app.aave.com',
        logoURI: 'https://assets.coingecko.com/coins/images/12645/thumb/AAVE.png',
        description: 'Decentralized lending and borrowing protocol'
      }
    ],
    bridges: [
      {
        id: 'polygon-bridge',
        name: 'Polygon Bridge',
        supportedChains: ['ethereum', 'polygon'],
        fees: { fixed: 0, percentage: 0 },
        timeEstimate: '7-8 minutes',
        maxAmount: 1000000,
        minAmount: 0.01,
        url: 'https://wallet.polygon.technology/bridge'
      }
    ]
  },
  polygon: {
    id: 'polygon',
    name: 'polygon',
    displayName: 'Polygon',
    nativeToken: {
      symbol: 'MATIC',
      name: 'Polygon',
      decimals: 18,
      coingeckoId: 'matic-network'
    },
    rpcUrls: ['https://polygon-rpc.com/', 'https://rpc-mainnet.matic.network'],
    blockExplorerUrls: ['https://polygonscan.com'],
    chainId: 137,
    networkId: 137,
    isTestnet: false,
    color: '#8247E5',
    icon: '⬟',
    features: {
      defi: true,
      nft: true,
      staking: true,
      bridges: true
    },
    popularTokens: [
      {
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        symbol: 'USDC',
        name: 'USD Coin (PoS)',
        decimals: 6,
        logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
        coingeckoId: 'usd-coin'
      }
    ],
    defiProtocols: [
      {
        id: 'quickswap',
        name: 'QuickSwap',
        category: 'dex',
        tvl: 180000000,
        url: 'https://quickswap.exchange',
        logoURI: 'https://assets.coingecko.com/coins/images/13970/thumb/1_pOYNZOI.png',
        description: 'Leading DEX on Polygon network'
      }
    ],
    bridges: [
      {
        id: 'polygon-bridge',
        name: 'Polygon Bridge',
        supportedChains: ['ethereum', 'polygon'],
        fees: { fixed: 0, percentage: 0 },
        timeEstimate: '7-8 minutes',
        maxAmount: 1000000,
        minAmount: 0.01,
        url: 'https://wallet.polygon.technology/bridge'
      }
    ]
  },
  bsc: {
    id: 'bsc',
    name: 'binance-smart-chain',
    displayName: 'BNB Smart Chain',
    nativeToken: {
      symbol: 'BNB',
      name: 'BNB',
      decimals: 18,
      coingeckoId: 'binancecoin'
    },
    rpcUrls: ['https://bsc-dataseed.binance.org/', 'https://bsc-dataseed1.defibit.io/'],
    blockExplorerUrls: ['https://bscscan.com'],
    chainId: 56,
    networkId: 56,
    isTestnet: false,
    color: '#F3BA2F',
    icon: '🔶',
    features: {
      defi: true,
      nft: true,
      staking: true,
      bridges: true
    },
    popularTokens: [
      {
        address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 18,
        logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
        coingeckoId: 'usd-coin'
      }
    ],
    defiProtocols: [
      {
        id: 'pancakeswap',
        name: 'PancakeSwap',
        category: 'dex',
        tvl: 2100000000,
        url: 'https://pancakeswap.finance',
        logoURI: 'https://assets.coingecko.com/coins/images/12632/thumb/pancakeswap-cake-logo_.png',
        description: 'Leading DEX on BNB Smart Chain'
      }
    ],
    bridges: [
      {
        id: 'binance-bridge',
        name: 'Binance Bridge',
        supportedChains: ['ethereum', 'bsc'],
        fees: { fixed: 0.001, percentage: 0 },
        timeEstimate: '3-5 minutes',
        maxAmount: 500000,
        minAmount: 0.01,
        url: 'https://www.binance.org/bridge'
      }
    ]
  },
  avalanche: {
    id: 'avalanche',
    name: 'avalanche',
    displayName: 'Avalanche',
    nativeToken: {
      symbol: 'AVAX',
      name: 'Avalanche',
      decimals: 18,
      coingeckoId: 'avalanche-2'
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://snowtrace.io'],
    chainId: 43114,
    networkId: 43114,
    isTestnet: false,
    color: '#E84142',
    icon: '🔺',
    features: {
      defi: true,
      nft: true,
      staking: true,
      bridges: true
    },
    popularTokens: [
      {
        address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
        symbol: 'USDC.e',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
        coingeckoId: 'usd-coin'
      }
    ],
    defiProtocols: [
      {
        id: 'trader-joe',
        name: 'Trader Joe',
        category: 'dex',
        tvl: 320000000,
        url: 'https://traderjoexyz.com',
        logoURI: 'https://assets.coingecko.com/coins/images/17117/thumb/joe.png',
        description: 'Leading DEX on Avalanche'
      }
    ],
    bridges: [
      {
        id: 'avalanche-bridge',
        name: 'Avalanche Bridge',
        supportedChains: ['ethereum', 'avalanche'],
        fees: { fixed: 0, percentage: 0.1 },
        timeEstimate: '5-10 minutes',
        maxAmount: 750000,
        minAmount: 0.01,
        url: 'https://bridge.avax.network'
      }
    ]
  },
  solana: {
    id: 'solana',
    name: 'solana',
    displayName: 'Solana',
    nativeToken: {
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      coingeckoId: 'solana'
    },
    rpcUrls: ['https://api.mainnet-beta.solana.com'],
    blockExplorerUrls: ['https://explorer.solana.com'],
    chainId: 101,
    networkId: 101,
    isTestnet: false,
    color: '#9945FF',
    icon: '◎',
    features: {
      defi: true,
      nft: true,
      staking: true,
      bridges: true
    },
    popularTokens: [
      {
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
        coingeckoId: 'usd-coin'
      }
    ],
    defiProtocols: [
      {
        id: 'raydium',
        name: 'Raydium',
        category: 'dex',
        tvl: 280000000,
        url: 'https://raydium.io',
        logoURI: 'https://assets.coingecko.com/coins/images/13928/thumb/PSigc4ie_400x400.jpg',
        description: 'Leading AMM on Solana'
      }
    ],
    bridges: [
      {
        id: 'wormhole',
        name: 'Wormhole',
        supportedChains: ['ethereum', 'solana', 'bsc', 'polygon'],
        fees: { fixed: 0, percentage: 0.1 },
        timeEstimate: '15-20 minutes',
        maxAmount: 1000000,
        minAmount: 0.01,
        url: 'https://wormholebridge.com'
      }
    ]
  }
}

export class MultiChainService {
  private static instance: MultiChainService
  private chainMetrics: { [chainId: string]: ChainMetrics } = {}

  static getInstance(): MultiChainService {
    if (!MultiChainService.instance) {
      MultiChainService.instance = new MultiChainService()
    }
    return MultiChainService.instance
  }

  // Get all supported chains
  getSupportedChains(): ChainConfig[] {
    return Object.values(SUPPORTED_CHAINS)
  }

  // Get chain configuration by ID
  getChainConfig(chainId: string): ChainConfig | undefined {
    return SUPPORTED_CHAINS[chainId]
  }

  // Get chain metrics
  async getChainMetrics(chainId: string): Promise<ChainMetrics> {
    // In a real implementation, this would fetch from various APIs
    const mockMetrics: ChainMetrics = {
      chainId,
      blockHeight: Math.floor(Math.random() * 1000000) + 18000000,
      gasPrice: Math.random() * 100 + 10,
      tps: Math.random() * 5000 + 100,
      tvl: Math.random() * 50000000000 + 1000000000,
      activeAddresses: Math.floor(Math.random() * 1000000) + 100000,
      transactions24h: Math.floor(Math.random() * 2000000) + 500000,
      marketCap: Math.random() * 500000000000 + 50000000000,
      price: Math.random() * 3000 + 100,
      priceChange24h: (Math.random() - 0.5) * 20
    }

    this.chainMetrics[chainId] = mockMetrics
    return mockMetrics
  }

  // Get cross-chain portfolio
  async getCrossChainPortfolio(walletAddresses: { [chainId: string]: string }): Promise<CrossChainPortfolio> {
    // Mock implementation - in reality would aggregate from multiple chains
    const mockPortfolio: CrossChainPortfolio = {
      totalValue: 125000,
      totalValueChange24h: 3.2,
      chainBreakdown: {
        ethereum: {
          value: 65000,
          percentage: 52,
          tokens: [
            { symbol: 'ETH', value: 45000, amount: 15.2 },
            { symbol: 'USDC', value: 20000, amount: 20000 }
          ]
        },
        polygon: {
          value: 25000,
          percentage: 20,
          tokens: [
            { symbol: 'MATIC', value: 15000, amount: 18750 },
            { symbol: 'USDC', value: 10000, amount: 10000 }
          ]
        },
        bsc: {
          value: 20000,
          percentage: 16,
          tokens: [
            { symbol: 'BNB', value: 15000, amount: 50 },
            { symbol: 'CAKE', value: 5000, amount: 1250 }
          ]
        },
        avalanche: {
          value: 10000,
          percentage: 8,
          tokens: [
            { symbol: 'AVAX', value: 8000, amount: 200 },
            { symbol: 'USDC.e', value: 2000, amount: 2000 }
          ]
        },
        solana: {
          value: 5000,
          percentage: 4,
          tokens: [
            { symbol: 'SOL', value: 4000, amount: 38 },
            { symbol: 'USDC', value: 1000, amount: 1000 }
          ]
        }
      },
      topTokens: [
        { symbol: 'ETH', value: 45000, chains: ['ethereum'] },
        { symbol: 'USDC', value: 33000, chains: ['ethereum', 'polygon', 'avalanche', 'solana'] },
        { symbol: 'MATIC', value: 15000, chains: ['polygon'] },
        { symbol: 'BNB', value: 15000, chains: ['bsc'] },
        { symbol: 'AVAX', value: 8000, chains: ['avalanche'] }
      ],
      diversificationScore: 78
    }

    return mockPortfolio
  }

  // Get DeFi protocols across chains
  async getCrossChainDeFiProtocols(): Promise<{ [chainId: string]: DeFiProtocol[] }> {
    const protocols: { [chainId: string]: DeFiProtocol[] } = {}
    
    for (const [chainId, config] of Object.entries(SUPPORTED_CHAINS)) {
      protocols[chainId] = config.defiProtocols
    }
    
    return protocols
  }

  // Get available bridges
  async getAvailableBridges(fromChain: string, toChain: string): Promise<BridgeConfig[]> {
    const bridges: BridgeConfig[] = []
    
    for (const config of Object.values(SUPPORTED_CHAINS)) {
      for (const bridge of config.bridges) {
        if (bridge.supportedChains.includes(fromChain) && bridge.supportedChains.includes(toChain)) {
          bridges.push(bridge)
        }
      }
    }
    
    return bridges
  }

  // Estimate bridge transfer
  async estimateBridgeTransfer(
    fromChain: string,
    toChain: string,
    token: string,
    amount: number
  ): Promise<{
    estimatedTime: string
    fees: number
    slippage: number
    route: string[]
  }> {
    const bridges = await this.getAvailableBridges(fromChain, toChain)
    
    if (bridges.length === 0) {
      throw new Error(`No bridge available from ${fromChain} to ${toChain}`)
    }
    
    const bridge = bridges[0] // Use first available bridge
    
    return {
      estimatedTime: bridge.timeEstimate,
      fees: bridge.fees.fixed + (amount * bridge.fees.percentage / 100),
      slippage: 0.1, // Mock slippage
      route: [fromChain, toChain]
    }
  }

  // Get gas prices across chains
  async getGasPrices(): Promise<{ [chainId: string]: { slow: number, standard: number, fast: number } }> {
    const gasPrices: { [chainId: string]: { slow: number, standard: number, fast: number } } = {}
    
    for (const chainId of Object.keys(SUPPORTED_CHAINS)) {
      gasPrices[chainId] = {
        slow: Math.random() * 20 + 5,
        standard: Math.random() * 30 + 15,
        fast: Math.random() * 50 + 25
      }
    }
    
    return gasPrices
  }
}

export default MultiChainService
