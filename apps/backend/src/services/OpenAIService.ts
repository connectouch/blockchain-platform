import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { DeFiProtocolData, AIAnalysisResult, RiskAssessment, YieldStrategy } from '../types/defi';

/**
 * OpenAI Service for DeFi Analysis and Strategy Generation
 * Integrates GPT-4 for intelligent DeFi portfolio management
 */
export class OpenAIService {
  private openai: OpenAI;
  private model: string;
  private maxTokens: number;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.model = process.env.OPENAI_MODEL || 'gpt-4';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '2000');

    logger.info('OpenAI Service initialized successfully');
  }

  /**
   * Analyze DeFi protocols and generate investment recommendations
   */
  async analyzeDeFiProtocols(
    protocolData: DeFiProtocolData[],
    userRiskTolerance: number,
    portfolioValue: number
  ): Promise<AIAnalysisResult> {
    try {
      const prompt = this.buildDeFiAnalysisPrompt(protocolData, userRiskTolerance, portfolioValue);
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.3, // Lower temperature for more consistent financial analysis
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const analysisResult = JSON.parse(response) as AIAnalysisResult;
      
      logger.info('DeFi analysis completed successfully', {
        protocolsAnalyzed: protocolData.length,
        recommendationsGenerated: analysisResult.recommendations.length
      });

      return analysisResult;

    } catch (error) {
      logger.error('Error in DeFi analysis:', error);
      throw new Error(`DeFi analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate risk assessment for a specific strategy
   */
  async assessRisk(
    strategy: YieldStrategy,
    marketConditions: any
  ): Promise<RiskAssessment> {
    try {
      const prompt = this.buildRiskAssessmentPrompt(strategy, marketConditions);
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a DeFi risk assessment expert. Analyze the provided strategy and market conditions to generate a comprehensive risk assessment. Return your analysis as a JSON object.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const riskAssessment = JSON.parse(response) as RiskAssessment;
      
      logger.info('Risk assessment completed', {
        strategyId: strategy.id,
        riskScore: riskAssessment.riskScore
      });

      return riskAssessment;

    } catch (error) {
      logger.error('Error in risk assessment:', error);
      throw new Error(`Risk assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate natural language explanation for strategy recommendations
   */
  async explainStrategy(
    strategy: YieldStrategy,
    userQuery: string
  ): Promise<string> {
    try {
      const prompt = `
        User Question: "${userQuery}"
        
        Strategy Details:
        - Name: ${strategy.name}
        - Protocol: ${strategy.protocol}
        - Expected APY: ${strategy.expectedAPY}%
        - Risk Level: ${strategy.riskLevel}/10
        - Description: ${strategy.description}
        
        Please provide a clear, conversational explanation of this strategy in response to the user's question. 
        Focus on helping them understand the benefits, risks, and how it works in simple terms.
      `;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful DeFi advisor. Explain strategies in clear, simple language that anyone can understand. Be honest about both opportunities and risks.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      });

      const explanation = completion.choices[0]?.message?.content;
      if (!explanation) {
        throw new Error('No explanation generated');
      }

      return explanation;

    } catch (error) {
      logger.error('Error generating strategy explanation:', error);
      throw new Error(`Strategy explanation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Chat interface for general DeFi questions
   */
  async chatWithAI(
    userMessage: string,
    conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = []
  ): Promise<string> {
    try {
      const messages = [
        {
          role: 'system' as const,
          content: 'You are an expert DeFi advisor for the Connectouch platform. Help users understand DeFi concepts, analyze opportunities, and make informed decisions. Always prioritize user safety and risk awareness.'
        },
        ...conversationHistory,
        {
          role: 'user' as const,
          content: userMessage
        }
      ];

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      return response;

    } catch (error) {
      logger.error('Error in AI chat:', error);
      throw new Error(`AI chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build system prompt for DeFi analysis
   */
  private getSystemPrompt(): string {
    return `
      You are an expert DeFi analyst and portfolio manager for the Connectouch AI platform. 
      Your role is to analyze DeFi protocols and generate optimal yield strategies based on:
      
      1. Current market conditions and protocol performance
      2. User risk tolerance (1-10 scale)
      3. Portfolio diversification principles
      4. Gas costs and transaction efficiency
      5. Smart contract security considerations
      
      Always return your analysis as a valid JSON object with the following structure:
      {
        "summary": "Brief analysis summary",
        "recommendations": [
          {
            "protocol": "Protocol name",
            "strategy": "Strategy description",
            "expectedAPY": number,
            "riskLevel": number (1-10),
            "allocation": number (percentage),
            "reasoning": "Why this recommendation"
          }
        ],
        "riskAssessment": {
          "overallRisk": number (1-10),
          "factors": ["risk factor 1", "risk factor 2"],
          "mitigation": "Risk mitigation strategies"
        },
        "marketOutlook": "Current market analysis",
        "gasOptimization": "Gas cost considerations"
      }
    `;
  }

  /**
   * Build prompt for DeFi protocol analysis
   */
  private buildDeFiAnalysisPrompt(
    protocolData: DeFiProtocolData[],
    userRiskTolerance: number,
    portfolioValue: number
  ): string {
    const protocolSummary = protocolData.map(protocol => 
      `${protocol.name}: TVL $${protocol.tvl}, APY ${protocol.apy}%, Risk Score ${protocol.riskScore}/10`
    ).join('\n');

    return `
      Analyze the following DeFi protocols and generate optimal yield strategies:
      
      Available Protocols:
      ${protocolSummary}
      
      User Profile:
      - Risk Tolerance: ${userRiskTolerance}/10
      - Portfolio Value: $${portfolioValue}
      
      Please provide a comprehensive analysis with specific recommendations for portfolio allocation.
      Consider current market conditions, gas costs, and risk-adjusted returns.
    `;
  }

  /**
   * Build prompt for risk assessment
   */
  private buildRiskAssessmentPrompt(strategy: YieldStrategy, marketConditions: any): string {
    return `
      Assess the risk of this DeFi strategy:
      
      Strategy: ${strategy.name}
      Protocol: ${strategy.protocol}
      Expected APY: ${strategy.expectedAPY}%
      Description: ${strategy.description}
      
      Market Conditions:
      ${JSON.stringify(marketConditions, null, 2)}
      
      Provide a detailed risk assessment including:
      - Overall risk score (1-10)
      - Specific risk factors
      - Probability of loss scenarios
      - Risk mitigation recommendations
      
      Return as JSON with structure:
      {
        "riskScore": number,
        "riskFactors": ["factor1", "factor2"],
        "lossScenarios": [{"scenario": "description", "probability": "percentage", "impact": "description"}],
        "mitigation": ["strategy1", "strategy2"],
        "recommendation": "overall recommendation"
      }
    `;
  }

  /**
   * Test OpenAI connection and basic functionality
   */
  async testConnection(): Promise<boolean> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: 'Hello, please respond with "OpenAI connection successful" if you can read this message.'
          }
        ],
        max_tokens: 50
      });

      const response = completion.choices[0]?.message?.content;
      logger.info('OpenAI connection test result:', { response });
      
      return response?.includes('successful') || false;

    } catch (error) {
      logger.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}
