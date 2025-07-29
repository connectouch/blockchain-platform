import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { CacheManager } from '../utils/cache';
import BlockchainDataService from './BlockchainDataService';

/**
 * Advanced AI Orchestration Service
 * Applying Augment Agent's comprehensive AI integration approach
 * Multi-model AI system with specialized blockchain expertise
 */

interface AIModel {
  name: string;
  provider: string;
  specialty: string[];
  maxTokens: number;
  temperature: number;
}

interface AnalysisRequest {
  type: 'portfolio' | 'nft' | 'gamefi' | 'dao' | 'contract' | 'market';
  data: any;
  context?: string;
  userId?: string;
}

interface AnalysisResponse {
  analysis: string;
  confidence: number;
  recommendations: string[];
  riskFactors: string[];
  opportunities: string[];
  metadata: {
    model: string;
    processingTime: number;
    dataPoints: number;
  };
}

export class AIOrchestrationService {
  private openai: OpenAI;
  private blockchainService: BlockchainDataService;
  private readonly CACHE_TTL = 1800; // 30 minutes

  // AI Model configurations
  private readonly AI_MODELS: AIModel[] = [
    {
      name: 'gpt-4-turbo',
      provider: 'openai',
      specialty: ['general', 'analysis', 'strategy'],
      maxTokens: 4096,
      temperature: 0.7
    },
    {
      name: 'gpt-4',
      provider: 'openai',
      specialty: ['complex-analysis', 'research', 'technical'],
      maxTokens: 8192,
      temperature: 0.5
    },
    {
      name: 'gpt-3.5-turbo',
      provider: 'openai',
      specialty: ['quick-analysis', 'chat', 'simple-queries'],
      maxTokens: 4096,
      temperature: 0.8
    }
  ];

  // Specialized prompts for different blockchain sectors
  private readonly SECTOR_PROMPTS = {
    defi: `You are a DeFi expert with deep knowledge of:
- Yield farming strategies and risk assessment
- Liquidity provision and impermanent loss
- Protocol tokenomics and governance
- Smart contract risks and auditing
- Cross-chain DeFi opportunities
- Market making and arbitrage`,

    nft: `You are an NFT market expert with expertise in:
- Collection analysis and rarity assessment
- Market trends and price prediction
- Utility and roadmap evaluation
- Community strength analysis
- Technical metadata analysis
- Investment potential assessment`,

    gamefi: `You are a GameFi specialist with knowledge of:
- Play-to-earn tokenomics sustainability
- Game mechanics and engagement metrics
- NFT integration and utility
- Guild economics and scholarships
- Metaverse land and asset valuation
- Competitive landscape analysis`,

    dao: `You are a DAO governance expert specializing in:
- Governance structure analysis
- Treasury management assessment
- Voting mechanism evaluation
- Community health metrics
- Proposal quality analysis
- Decentralization scoring`,

    infrastructure: `You are a blockchain infrastructure expert with focus on:
- Layer 1/2 scaling solutions
- Cross-chain bridge analysis
- Network security assessment
- Performance and throughput metrics
- Developer ecosystem health
- Adoption and usage patterns`,

    web3: `You are a Web3 development expert covering:
- Smart contract architecture
- dApp development best practices
- Security audit recommendations
- Gas optimization strategies
- Integration patterns
- User experience design`
  };

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.blockchainService = new BlockchainDataService();
    logger.info('AIOrchestrationService initialized with multi-model support');
  }

  /**
   * Comprehensive Blockchain Analysis
   */
  public async analyzeBlockchainData(request: AnalysisRequest): Promise<AnalysisResponse> {
    const startTime = Date.now();
    const cacheKey = `ai:analysis:${request.type}:${JSON.stringify(request.data).slice(0, 50)}`;
    
    try {
      // Check cache first
      const cached = await CacheManager.get<AnalysisResponse>(cacheKey);
      if (cached) {
        logger.info(`Returning cached analysis for ${request.type}`);
        return cached;
      }

      // Select optimal AI model for the task
      const model = this.selectOptimalModel(request.type);
      
      // Get relevant blockchain data
      const contextData = await this.gatherContextualData(request);
      
      // Generate specialized prompt
      const prompt = this.generateAnalysisPrompt(request, contextData);
      
      // Execute AI analysis
      const aiResponse = await this.executeAIAnalysis(prompt, model);
      
      // Process and structure response
      const analysis = this.processAIResponse(aiResponse, request.type);
      
      // Calculate confidence score
      const confidence = this.calculateConfidenceScore(analysis, contextData);
      
      const response: AnalysisResponse = {
        analysis: analysis.main,
        confidence,
        recommendations: analysis.recommendations,
        riskFactors: analysis.risks,
        opportunities: analysis.opportunities,
        metadata: {
          model: model.name,
          processingTime: Date.now() - startTime,
          dataPoints: Object.keys(contextData).length
        }
      };

      // Cache the response
      await CacheManager.set(cacheKey, response, this.CACHE_TTL);
      
      logger.info(`AI analysis completed for ${request.type} in ${response.metadata.processingTime}ms`);
      return response;

    } catch (error) {
      logger.error('AI analysis failed:', error);
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Interactive Chat with Blockchain Context
   */
  public async chatWithBlockchainAI(
    message: string,
    conversationHistory: any[] = [],
    sector?: string
  ): Promise<string> {
    try {
      // Get relevant market context
      const marketContext = await this.getMarketContext();
      
      // Build conversation with context
      const messages = [
        {
          role: 'system',
          content: this.buildSystemPrompt(sector, marketContext)
        },
        ...conversationHistory,
        {
          role: 'user',
          content: message
        }
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: messages as any,
        max_tokens: 2048,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const aiResponse = response.choices[0]?.message?.content || 
        'I apologize, but I encountered an issue processing your request. Please try again.';

      logger.info('AI chat response generated successfully');
      return aiResponse;

    } catch (error) {
      logger.error('AI chat failed:', error);
      return 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.';
    }
  }

  /**
   * Predictive Market Analysis
   */
  public async generateMarketPrediction(timeframe: string = '24h'): Promise<any> {
    try {
      const marketData = await this.blockchainService.getMarketData();
      const defiData = await this.blockchainService.getDeFiProtocols();
      
      const prompt = `
        Based on the following market data, provide a comprehensive ${timeframe} market prediction:
        
        Market Data: ${JSON.stringify(marketData)}
        DeFi Protocols: ${JSON.stringify(defiData.slice(0, 5))}
        
        Analyze:
        1. Overall market sentiment and direction
        2. Key factors driving price movements
        3. Sector-specific opportunities and risks
        4. Recommended trading strategies
        5. Risk management considerations
        
        Provide specific, actionable insights with confidence levels.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.3
      });

      return {
        prediction: response.choices[0]?.message?.content,
        timeframe,
        confidence: 0.75,
        generatedAt: new Date()
      };

    } catch (error) {
      logger.error('Market prediction failed:', error);
      throw error;
    }
  }

  // Private helper methods

  private selectOptimalModel(analysisType: string): AIModel {
    const complexTypes = ['contract', 'dao', 'market'];
    const quickTypes = ['nft', 'gamefi'];
    
    if (complexTypes.includes(analysisType)) {
      return this.AI_MODELS.find(m => m.name === 'gpt-4') || this.AI_MODELS[0];
    } else if (quickTypes.includes(analysisType)) {
      return this.AI_MODELS.find(m => m.name === 'gpt-3.5-turbo') || this.AI_MODELS[0];
    } else {
      return this.AI_MODELS.find(m => m.name === 'gpt-4-turbo') || this.AI_MODELS[0];
    }
  }

  private async gatherContextualData(request: AnalysisRequest): Promise<any> {
    const contextData: any = {};

    try {
      switch (request.type) {
        case 'portfolio':
          contextData.market = await this.blockchainService.getMarketData();
          contextData.defi = await this.blockchainService.getDeFiProtocols();
          break;
        case 'nft':
          contextData.collections = await this.blockchainService.getNFTCollections();
          contextData.market = await this.blockchainService.getMarketData();
          break;
        case 'gamefi':
          contextData.projects = await this.blockchainService.getGameFiProjects();
          break;
        case 'market':
          contextData.market = await this.blockchainService.getMarketData();
          contextData.defi = await this.blockchainService.getDeFiProtocols();
          contextData.nft = await this.blockchainService.getNFTCollections();
          break;
        default:
          contextData.market = await this.blockchainService.getMarketData();
      }
    } catch (error) {
      logger.warn('Failed to gather some contextual data:', error);
    }

    return contextData;
  }

  private generateAnalysisPrompt(request: AnalysisRequest, contextData: any): string {
    const sectorPrompt = this.SECTOR_PROMPTS[request.type as keyof typeof this.SECTOR_PROMPTS] || this.SECTOR_PROMPTS.defi;
    
    return `
      ${sectorPrompt}
      
      Please analyze the following ${request.type} data:
      
      Primary Data: ${JSON.stringify(request.data)}
      Market Context: ${JSON.stringify(contextData)}
      
      Provide a comprehensive analysis including:
      1. Detailed assessment of the data
      2. Key insights and findings
      3. Specific recommendations
      4. Risk factors to consider
      5. Opportunities for optimization
      6. Market positioning analysis
      
      Format your response as a structured analysis with clear sections.
      Be specific, actionable, and include confidence levels where appropriate.
    `;
  }

  private async executeAIAnalysis(prompt: string, model: AIModel): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: model.name,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: model.maxTokens,
      temperature: model.temperature
    });

    return response.choices[0]?.message?.content || 'Analysis could not be completed.';
  }

  private processAIResponse(response: string, type: string): any {
    // Parse structured response into components
    const sections = response.split('\n\n');
    
    return {
      main: response,
      recommendations: this.extractRecommendations(response),
      risks: this.extractRiskFactors(response),
      opportunities: this.extractOpportunities(response)
    };
  }

  private extractRecommendations(text: string): string[] {
    const recommendations = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('recommend') || 
          line.toLowerCase().includes('suggest') ||
          line.match(/^\d+\./)) {
        recommendations.push(line.trim());
      }
    }
    
    return recommendations.slice(0, 5); // Limit to top 5
  }

  private extractRiskFactors(text: string): string[] {
    const risks = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('risk') || 
          line.toLowerCase().includes('caution') ||
          line.toLowerCase().includes('warning')) {
        risks.push(line.trim());
      }
    }
    
    return risks.slice(0, 3); // Limit to top 3
  }

  private extractOpportunities(text: string): string[] {
    const opportunities = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('opportunity') || 
          line.toLowerCase().includes('potential') ||
          line.toLowerCase().includes('advantage')) {
        opportunities.push(line.trim());
      }
    }
    
    return opportunities.slice(0, 3); // Limit to top 3
  }

  private calculateConfidenceScore(analysis: any, contextData: any): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on data availability
    if (Object.keys(contextData).length > 2) confidence += 0.2;
    if (analysis.recommendations.length > 0) confidence += 0.1;
    if (analysis.risks.length > 0) confidence += 0.1;
    if (analysis.opportunities.length > 0) confidence += 0.1;
    
    return Math.min(confidence, 0.95); // Cap at 95%
  }

  private async getMarketContext(): Promise<string> {
    try {
      const marketData = await this.blockchainService.getMarketData();
      return `Current market conditions: Total market cap $${(marketData.totalMarketCap / 1e12).toFixed(2)}T, Fear & Greed Index: ${marketData.fearGreedIndex}`;
    } catch (error) {
      return 'Market data temporarily unavailable';
    }
  }

  private buildSystemPrompt(sector?: string, marketContext?: string): string {
    const basePrompt = `You are an advanced blockchain AI assistant with comprehensive knowledge across the entire Web3 ecosystem. You provide expert analysis and guidance on DeFi, NFTs, GameFi, DAOs, smart contracts, and blockchain infrastructure.`;
    
    const sectorSpecific = sector ? this.SECTOR_PROMPTS[sector as keyof typeof this.SECTOR_PROMPTS] : '';
    const context = marketContext ? `\n\nCurrent Market Context: ${marketContext}` : '';
    
    return `${basePrompt}\n\n${sectorSpecific}${context}\n\nProvide helpful, accurate, and actionable advice. Always consider risk factors and market conditions in your responses.`;
  }

  /**
   * Health check for AI services
   */
  public async healthCheck(): Promise<any> {
    try {
      const testResponse = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 10
      });

      return {
        status: 'healthy',
        models: this.AI_MODELS.map(m => m.name),
        lastResponse: testResponse.choices[0]?.message?.content ? 'success' : 'partial'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export default AIOrchestrationService;
