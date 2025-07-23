/**
 * Type definitions for DeFi-related data structures
 */

export interface DeFiProtocolData {
  id: string;
  name: string;
  protocol: string;
  tvl: number; // Total Value Locked in USD
  apy: number; // Annual Percentage Yield
  riskScore: string; // Risk level: 'low', 'medium', 'high'
  category: 'lending' | 'dex' | 'yield-farming' | 'staking' | 'derivatives';
  blockchain: string;
  tokenAddress?: string;
  lastUpdated: Date;
  volume24h?: number;
  fees24h?: number;
  users24h?: number;
}

export interface YieldStrategy {
  id: string;
  name: string;
  description: string;
  protocol: string;
  expectedAPY: number;
  riskLevel: number; // 1-10 scale
  minInvestment: number;
  maxInvestment?: number;
  duration?: string; // e.g., "flexible", "30 days", "1 year"
  tokens: string[];
  gasEstimate: number;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAnalysisResult {
  summary: string;
  recommendations: StrategyRecommendation[];
  riskAssessment: {
    overallRisk: number;
    factors: string[];
    mitigation: string;
  };
  marketOutlook: string;
  gasOptimization: string;
  confidence: number; // AI confidence level 0-1
  timestamp: Date;
}

export interface StrategyRecommendation {
  protocol: string;
  strategy: string;
  expectedAPY: number;
  riskLevel: number;
  allocation: number; // Percentage of portfolio
  reasoning: string;
  estimatedGasCost: number;
  timeHorizon: string;
  exitStrategy: string;
}

export interface RiskAssessment {
  riskScore: number; // 1-10 scale (for AI analysis)
  riskFactors: string[];
  lossScenarios: LossScenario[];
  mitigation: string[];
  recommendation: string;
  confidence: number;
  lastAssessed: Date;
}

export interface LossScenario {
  scenario: string;
  probability: string; // e.g., "5%", "low", "medium", "high"
  impact: string;
  potentialLoss: number; // Percentage
}

export interface PortfolioPosition {
  id: string;
  userId: string;
  strategyId: string;
  protocol: string;
  tokenSymbol: string;
  tokenAddress: string;
  amount: number;
  valueUSD: number;
  entryPrice: number;
  currentPrice: number;
  profitLoss: number;
  profitLossPercentage: number;
  apy: number;
  riskLevel: number;
  isActive: boolean;
  entryDate: Date;
  lastUpdated: Date;
}

export interface MarketConditions {
  volatilityIndex: number;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  gasPrice: number; // in gwei
  ethPrice: number;
  btcPrice: number;
  defiTVL: number;
  fearGreedIndex: number;
  timestamp: Date;
}

export interface UserPreferences {
  riskTolerance: number; // 1-10 scale
  investmentHorizon: 'short' | 'medium' | 'long'; // < 1 month, 1-12 months, > 1 year
  preferredProtocols: string[];
  excludedProtocols: string[];
  maxGasPrice: number; // Maximum gas price willing to pay
  autoRebalance: boolean;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    discord: boolean;
  };
}

export interface AIStrategyExecution {
  id: string;
  strategyId: string;
  userId: string;
  executionType: 'entry' | 'exit' | 'rebalance' | 'stop-loss' | 'take-profit';
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
  transactionHash?: string;
  gasUsed?: number;
  gasPriceGwei?: number;
  executedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  aiReasoning: string;
  expectedOutcome: string;
  actualOutcome?: string;
}

export interface DeFiMetrics {
  totalValueLocked: number;
  totalUsers: number;
  totalStrategies: number;
  averageAPY: number;
  totalProfitGenerated: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageRiskScore: number;
  topPerformingProtocols: string[];
  gasEfficiencyScore: number;
}

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'market-update' | 'strategy-suggestion';
  title: string;
  description: string;
  relevantProtocols: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  suggestedActions: string[];
  confidence: number;
  validUntil: Date;
  createdAt: Date;
}

export interface ProtocolIntegration {
  name: string;
  contractAddress: string;
  abi: any[];
  supportedFunctions: string[];
  riskRating: number;
  auditStatus: 'audited' | 'unaudited' | 'partially-audited';
  tvlThreshold: number; // Minimum TVL required for integration
  isActive: boolean;
  lastHealthCheck: Date;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// WebSocket event types
export interface WebSocketEvent {
  type: 'price-update' | 'strategy-execution' | 'risk-alert' | 'market-update' | 'ai-insight';
  data: any;
  timestamp: Date;
  userId?: string;
}

export interface PriceUpdateEvent extends WebSocketEvent {
  type: 'price-update';
  data: {
    symbol: string;
    price: number;
    change24h: number;
    volume24h: number;
  };
}

export interface StrategyExecutionEvent extends WebSocketEvent {
  type: 'strategy-execution';
  data: AIStrategyExecution;
}

export interface RiskAlertEvent extends WebSocketEvent {
  type: 'risk-alert';
  data: {
    strategyId: string;
    riskLevel: number;
    alertType: 'high-risk' | 'stop-loss-triggered' | 'unusual-activity';
    message: string;
    recommendedAction: string;
  };
}
