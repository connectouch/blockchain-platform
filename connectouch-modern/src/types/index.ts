// Core Platform Types
export interface BlockchainSector {
  id: string
  name: string
  description: string
  icon: string
  color: string
  marketCap: string
  growth24h: string
  dominance?: string
  topProtocols?: string[]
  topCollections?: string[]
  topGames?: string[]
  topDAOs?: string[]
  topChains?: string[]
  topTools?: string[]
  metrics?: SectorMetrics
}

export interface SectorMetrics {
  tvl?: number
  volume24h?: number
  users?: number
  transactions?: number
  avgApy?: number
  riskScore?: number
  marketCap?: number
  floorPrice?: number
  players?: number
}

// AI Analysis Types
export interface AIAnalysisRequest {
  type: 'portfolio' | 'nft' | 'gamefi' | 'dao' | 'contract' | 'market'
  data: Record<string, any>
  context?: string
  userId?: string
}

export interface AIAnalysisResponse {
  analysis: string
  confidence: number
  recommendations: string[]
  riskFactors: string[]
  opportunities: string[]
  metadata: {
    model: string
    processingTime: number
    dataPoints: number
    analysisType: string
  }
}

export interface AIChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sector?: string
  metadata?: Record<string, any>
}

// DeFi Types
export interface DeFiProtocol {
  id: string
  name: string
  protocol: string
  tvl: number
  apy: number
  riskScore: number
  category: 'dex' | 'lending' | 'yield' | 'derivatives' | 'insurance'
  blockchain: string
  description?: string
  website?: string
  audit?: boolean
}

export interface PortfolioPosition {
  protocol: string
  amount: number
  value: number
  apy: number
  risk: number
  allocation: number
}

// NFT Types
export interface NFTCollection {
  id: string
  name: string
  description: string
  floorPrice: number
  volume24h: number
  owners: number
  totalSupply: number
  blockchain: string
  verified: boolean
  imageUrl?: string
  website?: string
}

export interface NFTMetrics {
  rarityScore?: number
  traitCount?: number
  lastSale?: number
  estimatedValue?: number
}

// GameFi Types
export interface GameFiProject {
  id: string
  name: string
  description: string
  genre: string
  blockchain: string
  tokenSymbol: string
  marketCap: number
  players: number
  earningPotential: 'low' | 'medium' | 'high'
  gameplayRating: number
  tokenomicsScore: number
  website?: string
  imageUrl?: string
}

// DAO Types
export interface DAOProject {
  id: string
  name: string
  description: string
  treasuryValue: number
  members: number
  proposals: number
  governanceToken: string
  votingPower: number
  category: 'protocol' | 'investment' | 'social' | 'service'
  website?: string
}

// Web3 Infrastructure Types
export interface BlockchainNetwork {
  id: string
  name: string
  type: 'layer1' | 'layer2' | 'sidechain'
  consensus: string
  tps: number
  fees: 'low' | 'medium' | 'high'
  tvl: number
  ecosystem: string[]
  website?: string
}

// Wallet Types
export interface WalletConnection {
  address: string
  chainId: number
  isConnected: boolean
  balance?: string
  provider?: any
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
}

// Market Data Types
export interface MarketData {
  totalMarketCap: string
  totalGrowth24h: string
  sectors: BlockchainSector[]
  timestamp: Date
}

// User Preferences Types
export interface UserPreferences {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  investmentGoals: string[]
  preferredSectors: string[]
  notifications: boolean
  theme: 'dark' | 'light'
}

// Real-time Data Types
export interface RealtimeUpdate {
  type: 'price' | 'tvl' | 'volume' | 'news'
  data: any
  timestamp: Date
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

// Component Props Types
export interface SectorCardProps {
  sector: BlockchainSector
  onClick?: (sector: BlockchainSector) => void
  className?: string
}

export interface ChatInterfaceProps {
  onSendMessage: (message: string) => void
  messages: AIChatMessage[]
  isLoading?: boolean
  className?: string
}

export interface AnalysisToolProps {
  onAnalyze: (request: AIAnalysisRequest) => void
  isLoading?: boolean
  result?: AIAnalysisResponse
  className?: string
}

// Store Types (Zustand)
export interface AppStore {
  // UI State
  currentSector: string | null
  isLoading: boolean
  error: AppError | null
  
  // Data State
  sectors: BlockchainSector[]
  marketData: MarketData | null
  chatMessages: AIChatMessage[]
  analysisResults: AIAnalysisResponse[]
  
  // Wallet State
  wallet: WalletConnection | null
  
  // User State
  preferences: UserPreferences
  
  // Actions
  setSector: (sector: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: AppError | null) => void
  updateSectors: (sectors: BlockchainSector[]) => void
  addChatMessage: (message: AIChatMessage) => void
  connectWallet: (connection: WalletConnection) => void
  disconnectWallet: () => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
}
