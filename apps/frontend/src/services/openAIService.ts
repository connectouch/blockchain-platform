/**
 * OpenAI API Service for AI-Powered Features
 * Provides comprehensive AI capabilities for the platform
 */

import axios, { AxiosInstance } from 'axios'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp?: number
}

export interface ChatCompletion {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: ChatMessage
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface MarketAnalysis {
  summary: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  keyPoints: string[]
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

export interface TradingInsight {
  symbol: string
  action: 'buy' | 'sell' | 'hold'
  confidence: number
  reasoning: string
  targetPrice?: number
  stopLoss?: number
  timeframe: string
}

class OpenAIService {
  private api: AxiosInstance
  private apiKey: string
  private cache = new Map<string, { data: any; expires: number }>()
  private readonly CACHE_TTL = 300000 // 5 minutes for AI responses

  constructor() {
    // Use our secure Vercel API endpoint instead of direct API calls
    this.api = axios.create({
      baseURL: '/api',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    })

    console.log('🚀 OpenAI Service initialized with secure API endpoint')
  }

  /**
   * Chat completion with context awareness
   */
  async chatCompletion(
    messages: ChatMessage[],
    model: string = 'gpt-4',
    options?: {
      temperature?: number
      maxTokens?: number
      stream?: boolean
    }
  ): Promise<ChatCompletion> {
    try {
      // Try OpenAI API FIRST (your valid API key)
      console.log('🚀 Trying OpenAI API with your valid key...')
      const response = await this.api.post('/ai-chat', {
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        type: 'chat'
      })

      if (response.data.success) {
        const completion = {
          id: 'openai-' + Date.now(),
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'gpt-4',
          choices: [{
            index: 0,
            message: {
              role: 'assistant' as const,
              content: response.data.data.message
            },
            finish_reason: 'stop'
          }],
          usage: response.data.data.usage || {
            prompt_tokens: 50,
            completion_tokens: 100,
            total_tokens: 150
          }
        }

        console.log(`✅ OpenAI chat completion from REAL GPT-4 API`)
        return completion
      } else {
        throw new Error('OpenAI API returned unsuccessful response')
      }
    } catch (error) {
      console.error('❌ OpenAI API error, trying simple AI fallback:', error)

      // Try simple AI fallback
      try {
        console.log('🔄 Falling back to Simple AI...')
        const fallbackResponse = await this.api.post('/ai-simple', {
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          type: 'chat'
        })

        if (fallbackResponse.data.success) {
          const completion = {
            id: 'simple-' + Date.now(),
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: 'simple-ai-fallback',
            choices: [{
              index: 0,
              message: {
                role: 'assistant' as const,
                content: fallbackResponse.data.data.message
              },
              finish_reason: 'stop'
            }],
            usage: {
              prompt_tokens: 50,
              completion_tokens: 100,
              total_tokens: 150
            }
          }

          console.log(`✅ Simple AI chat completion as fallback`)
          return completion
        }
      } catch (fallbackError) {
        console.error('❌ Simple AI also failed:', fallbackError)
      }

      console.log('⚠️ Using hardcoded fallback response')
      return this.getFallbackChatCompletion(messages)
    }
  }

  /**
   * Analyze cryptocurrency market data
   */
  async analyzeMarket(marketData: any): Promise<MarketAnalysis> {
    const cacheKey = `market_analysis_${JSON.stringify(marketData).slice(0, 50)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: `Analyze the current cryptocurrency market and provide insights based on the top cryptocurrencies and global metrics. Focus on market sentiment, trends, and recommendations.`
        }
      ]

      // Try OpenAI API FIRST (your valid API key)
      console.log('🚀 Trying OpenAI market analysis with your valid key...')
      const response = await this.api.post('/ai-chat', {
        messages,
        type: 'market-analysis',
        marketData
      })

      if (response.data.success) {
        const analysis = response.data.data
        this.setCache(cacheKey, analysis)

        console.log('✅ Generated market analysis from REAL OpenAI GPT-4')
        return analysis
      } else {
        throw new Error('OpenAI API returned unsuccessful response')
      }
    } catch (error) {
      console.error('❌ OpenAI market analysis error, trying simple AI fallback:', error)

      // Try simple AI fallback
      try {
        console.log('🔄 Falling back to Simple AI for market analysis...')
        const fallbackResponse = await this.api.post('/ai-simple', {
          messages,
          type: 'market-analysis',
          marketData
        })

        if (fallbackResponse.data.success) {
          const analysis = fallbackResponse.data.data
          this.setCache(cacheKey, analysis)

          console.log('✅ Generated market analysis from Simple AI fallback')
          return analysis
        }
      } catch (fallbackError) {
        console.error('❌ Simple AI market analysis also failed:', fallbackError)
      }

      console.log('⚠️ Using hardcoded fallback market analysis')
      return this.getFallbackMarketAnalysis()
    }
  }

  /**
   * Generate trading insights for specific cryptocurrencies
   */
  async generateTradingInsights(symbol: string, priceData: any): Promise<TradingInsight> {
    const cacheKey = `trading_insight_${symbol}_${Date.now().toString().slice(-6)}`
    
    try {
      const prompt = `
        Analyze the trading data for ${symbol} and provide trading insights:
        
        Price Data: ${JSON.stringify(priceData, null, 2)}
        
        Please provide:
        1. Recommended action (buy/sell/hold)
        2. Confidence level (0-100)
        3. Detailed reasoning
        4. Target price (if applicable)
        5. Stop loss level (if applicable)
        6. Recommended timeframe
        
        Base your analysis on technical indicators, market trends, and risk management principles.
      `

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are an expert cryptocurrency trader with deep knowledge of technical analysis, market psychology, and risk management. Provide practical trading advice.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]

      const completion = await this.chatCompletion(messages, 'gpt-4', {
        temperature: 0.2,
        maxTokens: 600
      })

      const insight = this.parseTradingInsight(symbol, completion.choices[0].message.content)
      
      console.log(`✅ Generated trading insight for ${symbol}`)
      return insight
    } catch (error) {
      console.error('❌ OpenAI trading insight error:', error)
      return this.getFallbackTradingInsight(symbol)
    }
  }

  /**
   * Explain DeFi protocols and concepts
   */
  async explainDeFiConcept(concept: string): Promise<string> {
    const cacheKey = `defi_explanation_${concept}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const prompt = `
        Explain the DeFi concept "${concept}" in a clear, comprehensive way.
        
        Please include:
        1. What it is and how it works
        2. Key benefits and use cases
        3. Potential risks and considerations
        4. Popular protocols or examples
        5. How users can get started
        
        Make it accessible for both beginners and experienced users.
      `

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are a DeFi education expert who explains complex blockchain and DeFi concepts in clear, practical terms. Focus on accuracy and actionable information.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]

      const completion = await this.chatCompletion(messages, 'gpt-4', {
        temperature: 0.4,
        maxTokens: 1000
      })

      const explanation = completion.choices[0].message.content
      this.setCache(cacheKey, explanation)
      
      console.log(`✅ Generated DeFi explanation for: ${concept}`)
      return explanation
    } catch (error) {
      console.error('❌ OpenAI DeFi explanation error:', error)
      return this.getFallbackDeFiExplanation(concept)
    }
  }

  /**
   * Generate portfolio optimization suggestions
   */
  async optimizePortfolio(portfolioData: any): Promise<string> {
    try {
      const prompt = `
        Analyze this cryptocurrency portfolio and provide optimization suggestions:
        
        ${JSON.stringify(portfolioData, null, 2)}
        
        Please provide:
        1. Portfolio balance assessment
        2. Risk analysis
        3. Diversification recommendations
        4. Rebalancing suggestions
        5. Risk management strategies
        
        Focus on practical, actionable advice.
      `

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are a professional portfolio manager specializing in cryptocurrency investments. Provide balanced, risk-aware advice focused on long-term success.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]

      const completion = await this.chatCompletion(messages, 'gpt-4', {
        temperature: 0.3,
        maxTokens: 1200
      })

      console.log('✅ Generated portfolio optimization suggestions')
      return completion.choices[0].message.content
    } catch (error) {
      console.error('❌ OpenAI portfolio optimization error:', error)
      return this.getFallbackPortfolioAdvice()
    }
  }

  /**
   * Cache management
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.CACHE_TTL
    })
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key)
    if (cached && cached.expires > Date.now()) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  /**
   * Parsing helpers
   */
  private parseMarketAnalysis(content: string): MarketAnalysis {
    // Simple parsing - in production, you'd want more sophisticated parsing
    return {
      summary: content.slice(0, 200) + '...',
      sentiment: content.toLowerCase().includes('bullish') ? 'bullish' : 
                content.toLowerCase().includes('bearish') ? 'bearish' : 'neutral',
      confidence: 75,
      keyPoints: ['Market volatility present', 'Strong fundamentals', 'Technical indicators mixed'],
      recommendations: ['Consider dollar-cost averaging', 'Monitor key support levels', 'Maintain risk management'],
      riskLevel: 'medium'
    }
  }

  private parseTradingInsight(symbol: string, content: string): TradingInsight {
    return {
      symbol,
      action: content.toLowerCase().includes('buy') ? 'buy' : 
              content.toLowerCase().includes('sell') ? 'sell' : 'hold',
      confidence: 70,
      reasoning: content.slice(0, 150) + '...',
      timeframe: '1-7 days'
    }
  }

  /**
   * Fallback methods
   */
  private getFallbackChatCompletion(messages: ChatMessage[]): ChatCompletion {
    return {
      id: 'fallback-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'gpt-4',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: 'I apologize, but I\'m currently unable to process your request. Please try again later or contact support if the issue persists.'
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 25,
        total_tokens: 75
      }
    }
  }

  private getFallbackMarketAnalysis(): MarketAnalysis {
    return {
      summary: 'Market analysis temporarily unavailable. Please check back later for updated insights.',
      sentiment: 'neutral',
      confidence: 50,
      keyPoints: ['Service temporarily unavailable'],
      recommendations: ['Monitor market conditions', 'Practice risk management'],
      riskLevel: 'medium'
    }
  }

  private getFallbackTradingInsight(symbol: string): TradingInsight {
    return {
      symbol,
      action: 'hold',
      confidence: 50,
      reasoning: 'Trading insights temporarily unavailable. Please exercise caution and do your own research.',
      timeframe: 'N/A'
    }
  }

  private getFallbackDeFiExplanation(concept: string): string {
    return `Information about ${concept} is temporarily unavailable. Please check our documentation or try again later.`
  }

  private getFallbackPortfolioAdvice(): string {
    return 'Portfolio optimization suggestions are temporarily unavailable. Please consult with a financial advisor and do your own research before making investment decisions.'
  }
}

export const openAIService = new OpenAIService()
export default openAIService
