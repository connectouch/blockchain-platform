// import ApiService from './api'

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
  metadata?: any
}

export interface AIResponse {
  response: string
  suggestions?: string[]
  confidence?: number
  actions?: any[]
  metadata?: any
  context?: string
}

export interface AICapabilities {
  naturalLanguageTrading: boolean
  portfolioAnalysis: boolean
  marketInsights: boolean
  voiceCommands: boolean
  contextAwareness: boolean
  multiLanguage: boolean
  realTimeData: boolean
  predictiveAnalytics: boolean
  riskAssessment: boolean
  educationalContent: boolean
}

export interface AIContext {
  feature: string
  portfolioData?: any
  userPreferences?: any
  contextData?: any
  marketData?: any
}

export class AIService {
  private static instance: AIService
  private openaiApiKey: string
  private baseUrl: string

  private constructor() {
    // Use environment variable if available, otherwise use backend proxy
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY || ''
    this.baseUrl = '/api/v2/ai' // Use backend proxy for AI requests

    // Log API key status for debugging
    console.log('🔑 AIService initialized with OpenAI API key:', !!this.openaiApiKey)
    console.log('🔑 API key length:', this.openaiApiKey.length)
    console.log('🔑 API key preview:', this.openaiApiKey.substring(0, 20) + '...')
    console.log('🌐 OpenAI Base URL:', this.baseUrl)

    // Test network connectivity
    this.testNetworkConnectivity()
  }

  // Test network connectivity on initialization
  private async testNetworkConnectivity() {
    try {
      console.log('🌐 Testing network connectivity...')

      // Test if we can reach the internet
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })

      if (response.ok) {
        console.log('✅ Internet connectivity: OK')
      } else {
        console.warn('⚠️ Internet connectivity: Limited')
      }
    } catch (error) {
      console.error('❌ Network connectivity test failed:', error)
    }
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  // Simple non-streaming OpenAI request as fallback
  async simpleOpenAIRequest(message: string): Promise<AIResponse> {
    console.log('🔄 Making simple OpenAI request...')

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are Connectouch, a friendly AI assistant for cryptocurrency and Web3. Respond naturally and helpfully.'
          },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false // No streaming
      })
    })

    console.log('📡 Simple request status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Simple request failed:', errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ Simple request response:', data)

    if (data.choices && data.choices[0]?.message?.content) {
      return {
        response: data.choices[0].message.content,
        suggestions: [
          'Ask another question',
          'Explain more',
          'Show examples',
          'Get help'
        ],
        confidence: 90,
        metadata: {
          model: data.model,
          usage: data.usage,
          simple_request: true
        }
      }
    } else {
      throw new Error('Invalid OpenAI response format')
    }
  }

  // Test method for debugging OpenAI connection
  async testOpenAIConnection(): Promise<any> {
    console.log('🧪 Testing OpenAI connection...')
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'user', content: 'Hello! Just testing the connection. Please respond with "Connection successful!"' }
          ],
          max_tokens: 50,
          temperature: 0.7,
          stream: false // No streaming for test
        })
      })

      console.log('Test response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Test failed:', errorText)
        return { success: false, error: errorText }
      }

      const data = await response.json()
      console.log('Test response:', data)
      return { success: true, data }
    } catch (error) {
      console.error('Test error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Enhanced chat with real-time streaming and humanized responses
  async enhancedChat(
    message: string,
    conversationHistory: AIMessage[],
    context: AIContext,
    commands: any[] = [],
    capabilities: AICapabilities,
    onStreamUpdate?: (chunk: string) => void
  ): Promise<AIResponse> {
    console.log('🚀 Enhanced chat called with message:', message)
    console.log('🔑 API Key available:', !!this.openaiApiKey)
    console.log('🔗 Base URL:', this.baseUrl)

    // Force try simple request first if streaming fails
    if (!onStreamUpdate) {
      console.log('🔄 No streaming callback, trying simple request first...')
      try {
        return await this.simpleOpenAIRequest(message)
      } catch (error) {
        console.log('❌ Simple request failed, trying streaming...', error)
      }
    }

    try {
      // Create humanized system prompt
      const systemPrompt = this.createHumanizedSystemPrompt(context, capabilities)

      // Prepare messages for OpenAI
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: message }
      ]

      console.log('🚀 Making OpenAI API call...')
      console.log('🔗 URL:', `${this.baseUrl}/chat/completions`)
      console.log('📝 Messages count:', messages.length)
      console.log('🔑 Using API key:', this.openaiApiKey.substring(0, 20) + '...')

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: messages,
          max_tokens: 1200,
          temperature: 0.8, // Higher temperature for more natural responses
          presence_penalty: 0.2,
          frequency_penalty: 0.1,
          top_p: 0.9,
          stream: true // Enable streaming
        })
      })

      console.log('📡 OpenAI Response status:', response.status)
      console.log('📡 OpenAI Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ OpenAI API Error Response:', errorText)
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''
      let buffer = ''

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') break

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    fullResponse += content
                    // Call streaming callback if provided
                    onStreamUpdate?.(content)
                  }
                } catch (e) {
                  // Skip invalid JSON lines
                }
              }
            }
          }
        } finally {
          reader.releaseLock()
        }
      }

      if (fullResponse) {
        // Parse response for actions and suggestions
        const parsedResponse = this.parseAIResponse(fullResponse, context, commands)

        return {
          response: parsedResponse.content,
          suggestions: parsedResponse.suggestions || this.getContextualSuggestions(context.feature),
          confidence: 90, // High confidence for streaming responses
          actions: parsedResponse.actions || commands,
          metadata: {
            model: 'gpt-4-turbo-preview',
            streaming: true,
            responseLength: fullResponse.length
          },
          context: context.feature
        }
      } else {
        throw new Error('No response content received')
      }
    } catch (error) {
      console.error('❌ Enhanced chat error:', error)
      console.error('🔑 OpenAI API Key available:', !!this.openaiApiKey)
      console.error('📝 Error details:', error instanceof Error ? error.message : error)
      console.error('🌐 Base URL:', this.baseUrl)
      console.error('📊 Context:', context)
      console.error('💬 Message:', message)

      // Try a simple non-streaming request as fallback
      console.log('🔄 Attempting simple non-streaming request...')
      try {
        const simpleResponse = await this.simpleOpenAIRequest(message)
        console.log('✅ Simple request succeeded:', simpleResponse)
        return simpleResponse
      } catch (simpleError) {
        console.error('❌ Simple request also failed:', simpleError)

        // NO FALLBACK - Force error to surface
        throw new Error(`OpenAI API failed: ${error instanceof Error ? error.message : error}. Simple request also failed: ${simpleError instanceof Error ? simpleError.message : simpleError}`)
      }
    }
  }

  // Create humanized system prompt for natural conversations
  private createHumanizedSystemPrompt(context: AIContext, _capabilities: AICapabilities): string {
    const basePrompt = `You are Connectouch, a friendly and knowledgeable AI assistant for the Connectouch Web3 platform. You're like having a crypto-savvy friend who's always excited to help!

🎯 Your Personality:
- Conversational and warm, like chatting with a knowledgeable friend
- Enthusiastic about crypto and Web3 without being overwhelming
- Patient and encouraging, especially with beginners
- Use natural language, contractions, and casual expressions
- Occasionally use relevant emojis to add personality
- Show genuine interest in helping users succeed

💡 Your Expertise:
- Cryptocurrency trading and investment strategies
- DeFi protocols, yield farming, and staking
- NFT markets, trends, and opportunities
- DAO governance and community participation
- Blockchain infrastructure and technology
- Cross-chain operations and bridges
- Risk management and portfolio optimization
- Market analysis and trend identification

🌟 Current Context: ${this.getFeatureDescription(context.feature)}
📊 User's Situation: ${JSON.stringify(context.contextData)}
💼 Portfolio Info: ${JSON.stringify(context.portfolioData)}
⚙️ Preferences: ${JSON.stringify(context.userPreferences)}

🗣️ Communication Style:
- Be conversational: "Hey! I'd love to help you with that" instead of "I can assist you"
- Use natural transitions: "So here's what I'm thinking..." or "Let me break this down for you"
- Show enthusiasm: "That's a great question!" or "I'm excited to help you explore this!"
- Be encouraging: "You're on the right track!" or "Don't worry, we'll figure this out together"
- Use analogies and examples to explain complex concepts
- Ask follow-up questions to better understand their needs

🎯 Guidelines:
- Always prioritize user safety and risk management
- Explain things clearly without being condescending
- Suggest specific, actionable steps
- Admit when you're not certain about something
- Encourage learning and exploration
- Be honest about risks and potential downsides
- Celebrate user successes and progress

Remember: You're not just providing information - you're having a genuine conversation with someone who trusts you to help them navigate the exciting world of Web3! 🚀`

    return basePrompt
  }

  // Create system prompt based on context and capabilities (legacy method)
  /*
  private createSystemPrompt(context: AIContext, capabilities: AICapabilities): string {
    const basePrompt = `You are an advanced AI assistant for a Web3/cryptocurrency platform called Connectouch. You are an expert in:
- Cryptocurrency trading and portfolio management
- DeFi protocols and yield farming
- NFT markets and analysis
- DAO governance and participation
- Blockchain infrastructure and scaling solutions
- Cross-chain operations and bridges
- Risk assessment and management
- Market analysis and predictions

Current context: ${context.feature}
User's current section: ${this.getFeatureDescription(context.feature)}

Available capabilities: ${Object.entries(capabilities).filter(([_, enabled]) => enabled).map(([key, _]) => key).join(', ')}

Guidelines:
1. Provide accurate, helpful, and actionable advice
2. Always consider risk management and user safety
3. Explain complex concepts in simple terms when needed
4. Suggest specific actions when appropriate
5. Be concise but comprehensive
6. Use emojis sparingly and appropriately
7. If asked to execute trades, provide clear confirmation and risk warnings
8. Stay updated with current market conditions and trends
9. Adapt your responses to the user's experience level
10. Always prioritize user education and safety

Context data: ${JSON.stringify(context.contextData)}
Portfolio data: ${JSON.stringify(context.portfolioData)}
User preferences: ${JSON.stringify(context.userPreferences)}

Respond naturally and conversationally while being informative and helpful.`

    return basePrompt
  }
  */

  // Parse AI response for structured data
  private parseAIResponse(response: string, context: AIContext, commands: any[]): any {
    // Look for structured data in the response
    const suggestions = this.extractSuggestions(response, context.feature)
    const actions = this.extractActions(response, commands)

    return {
      content: response,
      suggestions: suggestions,
      actions: actions
    }
  }

  // Calculate confidence based on OpenAI response metadata
  private calculateConfidence(data: any): number {
    // Base confidence on finish reason and token usage
    let confidence = 85

    if (data.choices[0]?.finish_reason === 'stop') {
      confidence += 10
    } else if (data.choices[0]?.finish_reason === 'length') {
      confidence -= 5
    }

    // Adjust based on token usage efficiency
    if (data.usage) {
      const efficiency = data.usage.completion_tokens / data.usage.total_tokens
      if (efficiency > 0.7) confidence += 5
      if (efficiency < 0.3) confidence -= 5
    }

    return Math.min(Math.max(confidence, 60), 95)
  }

  // Extract suggestions from AI response
  private extractSuggestions(response: string, feature: string): string[] {
    // Look for bullet points or numbered lists in the response
    const suggestionPatterns = [
      /(?:•|\*|-|\d+\.)\s*([^\n]+)/g,
      /(?:try|consider|you could|might want to)\s+([^.!?]+)/gi
    ]

    const suggestions: string[] = []

    for (const pattern of suggestionPatterns) {
      const matches = response.matchAll(pattern)
      for (const match of matches) {
        if (match[1] && match[1].length > 10 && match[1].length < 100) {
          suggestions.push(match[1].trim())
        }
      }
    }

    // If no suggestions found, return contextual ones
    return suggestions.length > 0 ? suggestions.slice(0, 4) : this.getContextualSuggestions(feature)
  }

  // Extract actionable commands from AI response
  private extractActions(response: string, originalCommands: any[]): any[] {
    const actions = [...originalCommands]

    // Look for trading commands in the response
    const tradingPatterns = [
      /(?:buy|purchase)\s+(\d+\.?\d*)\s+(\w+)/gi,
      /(?:sell)\s+(\d+\.?\d*)\s+(\w+)/gi,
      /(?:set|place)\s+(?:a\s+)?(?:stop\s+loss|limit\s+order)/gi
    ]

    for (const pattern of tradingPatterns) {
      const matches = response.matchAll(pattern)
      for (const match of matches) {
        if (match[1] && match[2]) {
          actions.push({
            type: 'trade',
            action: match[0].toLowerCase().includes('sell') ? 'sell' : 'buy',
            amount: match[1],
            asset: match[2].toUpperCase()
          })
        }
      }
    }

    return actions
  }

  // Get feature description for context
  private getFeatureDescription(feature: string): string {
    const descriptions: { [key: string]: string } = {
      dashboard: 'Main dashboard with portfolio overview and market summary',
      portfolio: 'Portfolio management and analysis section',
      defi: 'DeFi protocols, yield farming, and staking section',
      nft: 'NFT marketplace and collection analysis',
      dao: 'DAO governance and voting section',
      infrastructure: 'Blockchain infrastructure and network analysis',
      'multi-chain': 'Cross-chain operations and bridge management',
      gamefi: 'GameFi and play-to-earn gaming section',
      'web3-tools': 'Web3 development tools and utilities',
      analysis: 'Advanced market analysis and research tools'
    }

    return descriptions[feature] || 'General platform section'
  }

  // Portfolio analysis with AI insights using OpenAI
  async analyzePortfolio(portfolioData: any, userPreferences: any): Promise<AIResponse> {
    try {
      const prompt = `Analyze this cryptocurrency portfolio and provide insights:

Portfolio Data: ${JSON.stringify(portfolioData, null, 2)}
User Preferences: ${JSON.stringify(userPreferences, null, 2)}

Please provide:
1. Overall portfolio health assessment
2. Risk analysis and diversification score
3. Specific recommendations for improvement
4. Potential yield opportunities
5. Rebalancing suggestions if needed

Focus on actionable insights and consider the user's risk tolerance and preferences.`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert cryptocurrency portfolio analyst. Provide detailed, actionable insights while considering risk management and user safety.'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 800,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        throw new Error(`Portfolio analysis error: ${response.status}`)
      }

      const data = await response.json()

      if (data.choices && data.choices[0]?.message?.content) {
        return {
          response: data.choices[0].message.content,
          suggestions: [
            'Show risk breakdown',
            'Find yield opportunities',
            'Rebalance portfolio',
            'Set price alerts'
          ],
          confidence: this.calculateConfidence(data),
          metadata: {
            model: data.model,
            usage: data.usage
          }
        }
      } else {
        throw new Error('Invalid OpenAI response')
      }
    } catch (error) {
      console.error('Portfolio analysis error:', error)
      throw new Error(`Portfolio analysis failed: ${error instanceof Error ? error.message : error}`)
    }
  }

  // Market insights with predictive analytics using OpenAI
  async getMarketInsights(context: AIContext): Promise<AIResponse> {
    try {
      const prompt = `Provide current cryptocurrency market insights and analysis:

Context: ${context.feature}
Market Data: ${JSON.stringify(context.contextData, null, 2)}

Please provide:
1. Current market sentiment and trends
2. Key price movements and catalysts
3. Risk factors to watch
4. Opportunities in the current market
5. Short-term and medium-term outlook

Focus on actionable insights for cryptocurrency investors and traders.`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert cryptocurrency market analyst. Provide current, accurate market insights while emphasizing risk management.'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 800,
          temperature: 0.4
        })
      })

      if (!response.ok) {
        throw new Error(`Market insights error: ${response.status}`)
      }

      const data = await response.json()

      if (data.choices && data.choices[0]?.message?.content) {
        return {
          response: data.choices[0].message.content,
          suggestions: [
            'Show market trends',
            'Analyze correlations',
            'Find opportunities',
            'Check fear & greed index'
          ],
          confidence: this.calculateConfidence(data),
          metadata: {
            model: data.model,
            usage: data.usage
          }
        }
      } else {
        throw new Error('Invalid OpenAI response')
      }
    } catch (error) {
      console.error('Market insights error:', error)
      throw new Error(`Market insights failed: ${error instanceof Error ? error.message : error}`)
    }
  }

  // Risk assessment using OpenAI
  async assessRisk(portfolioData: any, marketData: any): Promise<AIResponse> {
    try {
      const prompt = `Perform a comprehensive risk assessment for this cryptocurrency portfolio:

Portfolio Data: ${JSON.stringify(portfolioData, null, 2)}
Market Data: ${JSON.stringify(marketData, null, 2)}

Please analyze:
1. Overall portfolio risk level (Low/Medium/High)
2. Concentration risk and diversification analysis
3. Correlation risks between holdings
4. Market risk factors and volatility exposure
5. Specific recommendations to reduce risk
6. Suggested position sizing and stop-loss levels

Provide actionable risk management strategies.`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert risk management analyst specializing in cryptocurrency portfolios. Provide thorough risk assessments with practical mitigation strategies.'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 800,
          temperature: 0.2
        })
      })

      if (!response.ok) {
        throw new Error(`Risk assessment error: ${response.status}`)
      }

      const data = await response.json()

      if (data.choices && data.choices[0]?.message?.content) {
        return {
          response: data.choices[0].message.content,
          suggestions: [
            'Set stop losses',
            'Diversify holdings',
            'Monitor correlations',
            'Adjust position sizes'
          ],
          confidence: this.calculateConfidence(data),
          metadata: {
            model: data.model,
            usage: data.usage
          }
        }
      } else {
        throw new Error('Invalid OpenAI response')
      }
    } catch (error) {
      console.error('Risk assessment error:', error)
      throw new Error(`Risk assessment failed: ${error instanceof Error ? error.message : error}`)
    }
  }

  // Natural language trading using OpenAI
  async processTradeCommand(command: string, context: AIContext): Promise<AIResponse> {
    try {
      const prompt = `Parse and analyze this trading command: "${command}"

Context: ${JSON.stringify(context, null, 2)}

Please:
1. Extract the trading intent (buy/sell/hold)
2. Identify the asset and quantity
3. Assess the command validity and safety
4. Provide risk warnings if applicable
5. Suggest order type and execution strategy
6. Confirm the parsed details

If this is a valid trading command, provide clear confirmation. If not, explain what's needed.`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert trading assistant. Parse trading commands carefully and always prioritize user safety and risk management.'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 600,
          temperature: 0.1
        })
      })

      if (!response.ok) {
        throw new Error(`Trade command error: ${response.status}`)
      }

      const data = await response.json()

      if (data.choices && data.choices[0]?.message?.content) {
        return {
          response: data.choices[0].message.content,
          suggestions: [
            'Explain order types',
            'Show market depth',
            'Calculate fees',
            'Set risk management'
          ],
          confidence: this.calculateConfidence(data),
          metadata: {
            model: data.model,
            usage: data.usage
          }
        }
      } else {
        throw new Error('Invalid OpenAI response')
      }
    } catch (error) {
      console.error('Trade command error:', error)
      throw new Error(`Trade command processing failed: ${error instanceof Error ? error.message : error}`)
    }
  }

  // Educational content using OpenAI
  async getEducationalContent(topic: string, userLevel: string): Promise<AIResponse> {
    try {
      const prompt = `Provide educational content about: ${topic}

User Level: ${userLevel}

Please provide:
1. Clear explanation appropriate for the user's level
2. Key concepts and terminology
3. Practical examples and use cases
4. Common mistakes to avoid
5. Next steps for learning
6. Relevant resources or tools

Make the content engaging, accurate, and actionable. Adjust complexity based on user level (beginner/intermediate/advanced).`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert cryptocurrency and blockchain educator. Provide clear, accurate, and engaging educational content tailored to the user\'s experience level.'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        throw new Error(`Educational content error: ${response.status}`)
      }

      const data = await response.json()

      if (data.choices && data.choices[0]?.message?.content) {
        return {
          response: data.choices[0].message.content,
          suggestions: [
            'Start with basics',
            'Show examples',
            'Explain risks',
            'Find resources'
          ],
          confidence: this.calculateConfidence(data),
          metadata: {
            model: data.model,
            usage: data.usage
          }
        }
      } else {
        throw new Error('Invalid OpenAI response')
      }
    } catch (error) {
      console.error('Educational content error:', error)
      throw new Error(`Educational content generation failed: ${error instanceof Error ? error.message : error}`)
    }
  }

  // NO FALLBACK METHODS - FORCE REAL API USAGE ONLY
  // All methods now throw errors instead of using fallback responses

  private getContextualSuggestions(feature: string): string[] {
    const suggestions: { [key: string]: string[] } = {
      dashboard: [
        "Show me my portfolio performance",
        "What's happening in crypto today?",
        "Analyze market trends",
        "Find trading opportunities"
      ],
      portfolio: [
        "Analyze my portfolio risk",
        "Suggest rebalancing strategies",
        "Find yield opportunities",
        "Compare my performance to market"
      ],
      defi: [
        "Explain yield farming",
        "Find best staking rewards",
        "Compare lending protocols",
        "Analyze liquidity pools"
      ],
      nft: [
        "Show trending NFT collections",
        "Analyze floor price trends",
        "Find undervalued NFTs",
        "Explain NFT utility"
      ],
      dao: [
        "Show active proposals",
        "Analyze voting patterns",
        "Explain governance tokens",
        "Find DAO opportunities"
      ],
      infrastructure: [
        "Compare blockchain performance",
        "Explain consensus mechanisms",
        "Analyze network security",
        "Show scaling solutions"
      ],
      'multi-chain': [
        "Compare chain fees",
        "Find bridge opportunities",
        "Analyze cross-chain protocols",
        "Show chain ecosystems"
      ]
    }
    
    return suggestions[feature] || suggestions.dashboard || []
  }
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testAIService = () => {
    const aiService = AIService.getInstance()
    return aiService.testOpenAIConnection()
  }

  (window as any).testSimpleAI = async (message = "Hello! Test message.") => {
    const aiService = AIService.getInstance()
    return aiService.simpleOpenAIRequest(message)
  }

  (window as any).forceRealAI = async (message = "Hello Connectouch! Please respond naturally.") => {
    console.log('🔥 FORCING REAL AI RESPONSE...')
    const apiKey = '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'

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are Connectouch, a friendly AI assistant for cryptocurrency and Web3. Respond naturally and conversationally.' },
            { role: 'user', content: message }
          ],
          max_tokens: 300,
          temperature: 0.8
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Direct API call failed:', errorText)
        return { error: errorText, status: response.status }
      }

      const data = await response.json()
      console.log('✅ Direct API call succeeded:', data)
      return data.choices[0].message.content
    } catch (error) {
      console.error('❌ Direct API call error:', error)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export default AIService
