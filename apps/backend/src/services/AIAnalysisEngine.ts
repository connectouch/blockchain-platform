import { OpenAIService } from './OpenAIService';
import { DeFiDataService } from './DeFiDataService';
import { logger } from '../utils/logger';
import { 
  DeFiProtocolData, 
  AIAnalysisResult, 
  MarketConditions, 
  UserPreferences,
  StrategyRecommendation,
  RiskAssessment
} from '../types/defi';

/**
 * AI Analysis Engine - Combines real-time DeFi data with OpenAI intelligence
 * Provides comprehensive portfolio analysis and strategy recommendations
 */
export class AIAnalysisEngine {
  private openAIService: OpenAIService;
  private defiDataService: DeFiDataService;

  constructor() {
    this.openAIService = new OpenAIService();
    this.defiDataService = new DeFiDataService();
    logger.info('AI Analysis Engine initialized');
  }

  /**
   * Generate comprehensive portfolio analysis with real-time data
   */
  async generatePortfolioAnalysis(
    userPreferences: UserPreferences,
    portfolioValue: number
  ): Promise<AIAnalysisResult> {
    try {
      logger.info('Starting comprehensive portfolio analysis', {
        portfolioValue,
        riskTolerance: userPreferences.riskTolerance
      });

      // Step 1: Fetch real-time DeFi data
      const [protocolData, marketConditions] = await Promise.all([
        this.defiDataService.getAllProtocolData(),
        this.defiDataService.getMarketConditions()
      ]);

      // Step 2: Filter protocols based on user preferences
      const filteredProtocols = this.filterProtocolsByPreferences(protocolData, userPreferences);

      // Step 3: Generate AI analysis with real-time data
      const analysis = await this.openAIService.analyzeDeFiProtocols(
        filteredProtocols,
        userPreferences.riskTolerance,
        portfolioValue
      );

      // Step 4: Enhance analysis with market conditions
      const enhancedAnalysis = await this.enhanceAnalysisWithMarketData(
        analysis,
        marketConditions,
        userPreferences
      );

      // Step 5: Add gas optimization recommendations
      enhancedAnalysis.gasOptimization = await this.generateGasOptimization(
        enhancedAnalysis.recommendations,
        marketConditions.gasPrice
      );

      logger.info('Portfolio analysis completed successfully', {
        recommendationsCount: enhancedAnalysis.recommendations.length,
        overallRisk: enhancedAnalysis.riskAssessment.overallRisk
      });

      return enhancedAnalysis;

    } catch (error) {
      logger.error('Error in portfolio analysis:', error);
      throw new Error(`Portfolio analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate real-time strategy recommendations
   */
  async generateRealTimeRecommendations(
    currentPositions: any[],
    userPreferences: UserPreferences
  ): Promise<StrategyRecommendation[]> {
    try {
      const [protocolData, marketConditions] = await Promise.all([
        this.defiDataService.getAllProtocolData(),
        this.defiDataService.getMarketConditions()
      ]);

      const prompt = this.buildRealTimeAnalysisPrompt(
        protocolData,
        marketConditions,
        currentPositions,
        userPreferences
      );

      const analysis = await this.openAIService.analyzeDeFiProtocols(
        protocolData,
        userPreferences.riskTolerance,
        this.calculatePortfolioValue(currentPositions)
      );

      return analysis.recommendations;

    } catch (error) {
      logger.error('Error generating real-time recommendations:', error);
      throw error;
    }
  }

  /**
   * Assess portfolio risk with current market conditions
   */
  async assessPortfolioRisk(
    positions: any[],
    userPreferences: UserPreferences
  ): Promise<RiskAssessment> {
    try {
      const marketConditions = await this.defiDataService.getMarketConditions();
      
      const riskFactors = [
        `Market volatility: ${(marketConditions.volatilityIndex * 100).toFixed(1)}%`,
        `Gas prices: ${marketConditions.gasPrice} gwei`,
        `Market sentiment: ${marketConditions.marketSentiment}`,
        `Fear & Greed Index: ${marketConditions.fearGreedIndex}/100`
      ];

      const overallRisk = this.calculateOverallRisk(positions, marketConditions, userPreferences);

      return {
        riskScore: overallRisk,
        riskFactors,
        lossScenarios: await this.generateLossScenarios(positions, marketConditions),
        mitigation: await this.generateRiskMitigation(overallRisk, userPreferences),
        recommendation: this.getRiskRecommendation(overallRisk, userPreferences.riskTolerance),
        confidence: 0.85,
        lastAssessed: new Date()
      };

    } catch (error) {
      logger.error('Error in risk assessment:', error);
      throw error;
    }
  }

  /**
   * Generate market-aware strategy updates
   */
  async generateStrategyUpdates(
    existingStrategies: any[],
    marketConditions: MarketConditions
  ): Promise<string[]> {
    try {
      const updates: string[] = [];

      // High gas price alert
      if (marketConditions.gasPrice > 50) {
        updates.push(`⚠️ High gas prices (${marketConditions.gasPrice} gwei) - Consider delaying non-urgent transactions`);
      }

      // Market sentiment updates
      if (marketConditions.marketSentiment === 'bearish') {
        updates.push('📉 Bearish market detected - Consider reducing risk exposure');
      } else if (marketConditions.marketSentiment === 'bullish') {
        updates.push('📈 Bullish market detected - Potential opportunities for higher yields');
      }

      // Volatility alerts
      if (marketConditions.volatilityIndex > 0.4) {
        updates.push(`⚡ High volatility (${(marketConditions.volatilityIndex * 100).toFixed(1)}%) - Monitor positions closely`);
      }

      // Fear & Greed insights
      if (marketConditions.fearGreedIndex < 25) {
        updates.push('😨 Extreme fear in market - Potential buying opportunity for risk-tolerant investors');
      } else if (marketConditions.fearGreedIndex > 75) {
        updates.push('🤑 Extreme greed in market - Consider taking profits and reducing exposure');
      }

      return updates;

    } catch (error) {
      logger.error('Error generating strategy updates:', error);
      return ['Unable to generate strategy updates at this time'];
    }
  }

  /**
   * Private helper methods
   */
  private filterProtocolsByPreferences(
    protocols: DeFiProtocolData[],
    preferences: UserPreferences
  ): DeFiProtocolData[] {
    return protocols.filter(protocol => {
      // Filter by excluded protocols
      if (preferences.excludedProtocols.includes(protocol.protocol)) {
        return false;
      }

      // Filter by preferred protocols (if any specified)
      if (preferences.preferredProtocols.length > 0) {
        return preferences.preferredProtocols.includes(protocol.protocol);
      }

      // Filter by risk tolerance
      const riskScoreMap = { 'low': 1, 'medium': 5, 'high': 9 };
      const protocolRiskScore = riskScoreMap[protocol.riskScore as keyof typeof riskScoreMap] || 5;
      const maxRiskScore = Math.min(preferences.riskTolerance + 2, 10);
      return protocolRiskScore <= maxRiskScore;
    });
  }

  private async enhanceAnalysisWithMarketData(
    analysis: AIAnalysisResult,
    marketConditions: MarketConditions,
    userPreferences: UserPreferences
  ): Promise<AIAnalysisResult> {
    // Adjust recommendations based on market conditions
    const adjustedRecommendations = analysis.recommendations.map(rec => {
      let adjustedAllocation = rec.allocation;

      // Reduce allocation in high volatility
      if (marketConditions.volatilityIndex > 0.4) {
        adjustedAllocation *= 0.8;
      }

      // Adjust for market sentiment
      if (marketConditions.marketSentiment === 'bearish' && rec.riskLevel > 6) {
        adjustedAllocation *= 0.7;
      } else if (marketConditions.marketSentiment === 'bullish' && rec.riskLevel < 5) {
        adjustedAllocation *= 1.1;
      }

      return {
        ...rec,
        allocation: Math.min(adjustedAllocation, 100), // Cap at 100%
        reasoning: `${rec.reasoning} (Adjusted for current market conditions: ${marketConditions.marketSentiment} sentiment, ${(marketConditions.volatilityIndex * 100).toFixed(1)}% volatility)`
      };
    });

    return {
      ...analysis,
      recommendations: adjustedRecommendations,
      marketOutlook: `Current market: ${marketConditions.marketSentiment} sentiment, ETH $${marketConditions.ethPrice.toLocaleString()}, Gas ${marketConditions.gasPrice} gwei. ${analysis.marketOutlook}`,
      confidence: analysis.confidence * (marketConditions.volatilityIndex < 0.3 ? 1.0 : 0.9),
      timestamp: new Date()
    };
  }

  private async generateGasOptimization(
    recommendations: StrategyRecommendation[],
    currentGasPrice: number
  ): Promise<string> {
    if (currentGasPrice > 50) {
      return `High gas prices (${currentGasPrice} gwei) detected. Consider: 1) Batching transactions, 2) Using Layer 2 solutions, 3) Waiting for lower gas periods (typically weekends), 4) Setting lower gas limits for non-urgent transactions.`;
    } else if (currentGasPrice < 20) {
      return `Low gas prices (${currentGasPrice} gwei) - Good time for portfolio rebalancing and strategy execution.`;
    } else {
      return `Moderate gas prices (${currentGasPrice} gwei) - Normal transaction costs expected.`;
    }
  }

  private buildRealTimeAnalysisPrompt(
    protocols: DeFiProtocolData[],
    market: MarketConditions,
    positions: any[],
    preferences: UserPreferences
  ): string {
    return `
      Real-time DeFi Analysis Request:
      
      Current Market Conditions:
      - ETH Price: $${market.ethPrice}
      - BTC Price: $${market.btcPrice}
      - Gas Price: ${market.gasPrice} gwei
      - Market Sentiment: ${market.marketSentiment}
      - Volatility: ${(market.volatilityIndex * 100).toFixed(1)}%
      - Fear & Greed Index: ${market.fearGreedIndex}/100
      
      Available Protocols:
      ${protocols.map(p => `- ${p.name}: TVL $${(p.tvl / 1e9).toFixed(1)}B, APY ${p.apy}%, Risk ${p.riskScore}/10`).join('\n')}
      
      User Preferences:
      - Risk Tolerance: ${preferences.riskTolerance}/10
      - Investment Horizon: ${preferences.investmentHorizon}
      - Max Gas Price: ${preferences.maxGasPrice} gwei
      
      Current Positions: ${positions.length} active positions
      
      Please provide updated strategy recommendations considering current market conditions.
    `;
  }

  private calculatePortfolioValue(positions: any[]): number {
    return positions.reduce((total, pos) => total + (pos.valueUSD || 0), 0);
  }

  private calculateOverallRisk(
    positions: any[],
    market: MarketConditions,
    preferences: UserPreferences
  ): number {
    let baseRisk = positions.reduce((avg, pos) => avg + (pos.riskLevel || 5), 0) / positions.length || 5;
    
    // Adjust for market conditions
    if (market.volatilityIndex > 0.4) baseRisk += 1;
    if (market.marketSentiment === 'bearish') baseRisk += 0.5;
    if (market.gasPrice > 50) baseRisk += 0.3;
    
    return Math.min(Math.max(baseRisk, 1), 10);
  }

  private async generateLossScenarios(positions: any[], market: MarketConditions) {
    return [
      {
        scenario: 'Market downturn (20% drop)',
        probability: market.volatilityIndex > 0.3 ? 'medium' : 'low',
        impact: 'Potential 15-25% portfolio loss',
        potentialLoss: 20
      },
      {
        scenario: 'Smart contract exploit',
        probability: 'low',
        impact: 'Potential total loss of affected protocol',
        potentialLoss: 100
      },
      {
        scenario: 'High gas price period',
        probability: market.gasPrice > 30 ? 'high' : 'medium',
        impact: 'Increased transaction costs, reduced profitability',
        potentialLoss: 5
      }
    ];
  }

  private async generateRiskMitigation(risk: number, preferences: UserPreferences): Promise<string[]> {
    const mitigations = [];
    
    if (risk > 7) {
      mitigations.push('Consider reducing position sizes');
      mitigations.push('Diversify across more protocols');
      mitigations.push('Set stop-loss orders');
    }
    
    if (preferences.autoRebalance) {
      mitigations.push('Enable automatic rebalancing');
    }
    
    mitigations.push('Monitor positions daily');
    mitigations.push('Keep emergency fund for gas fees');
    
    return mitigations;
  }

  private getRiskRecommendation(overallRisk: number, userTolerance: number): string {
    if (overallRisk > userTolerance + 2) {
      return 'Portfolio risk exceeds your tolerance - consider reducing exposure';
    } else if (overallRisk < userTolerance - 2) {
      return 'Portfolio is conservative relative to your risk tolerance - consider higher yield opportunities';
    } else {
      return 'Portfolio risk aligns well with your preferences';
    }
  }

  /**
   * Test the AI Analysis Engine
   */
  async testEngine(): Promise<boolean> {
    try {
      logger.info('Testing AI Analysis Engine...');
      
      // Test OpenAI connection
      const openAITest = await this.openAIService.testConnection();
      
      // Test DeFi data service
      const defiDataTest = await this.defiDataService.testConnections();
      
      logger.info(`AI Analysis Engine test: OpenAI ${openAITest ? 'OK' : 'FAILED'}, DeFi Data ${defiDataTest ? 'OK' : 'FAILED'}`);
      
      return openAITest && defiDataTest;

    } catch (error) {
      logger.error('AI Analysis Engine test failed:', error);
      return false;
    }
  }
}
