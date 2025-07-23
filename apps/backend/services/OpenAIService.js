/**
 * Enhanced OpenAI Service
 * Real OpenAI API integration with market context and intelligent cryptocurrency advisory
 * Provides professional DeFi and crypto guidance with real-time data
 */

const OpenAI = require('openai');
const NodeCache = require('node-cache');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: this.apiKey
    });
    
    // Cache for conversation history and responses
    this.cache = new NodeCache({
      stdTTL: 1800, // 30 minutes for conversation history
      checkperiod: 300, // Check every 5 minutes
      useClones: false
    });
    
    // Conversation management
    this.maxHistoryLength = 10; // Keep last 10 exchanges
    this.maxTokens = 800; // Response length limit
    this.temperature = 0.7; // Balanced creativity/accuracy
    
    // Usage tracking
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      averageResponseTime: 0,
      lastRequestTime: null
    };
    
    console.log('🤖 Enhanced OpenAI Service initialized');
  }

  /**
   * Get chat response with market context
   */
  async getChatResponse(message, marketContext = {}, conversationHistory = [], userId = 'default') {
    const startTime = Date.now();
    
    try {
      console.log('🤖 Generating AI response with market context...');
      
      // Build system prompt with real-time market data
      const systemPrompt = this.buildSystemPrompt(marketContext);
      
      // Manage conversation history
      const managedHistory = this.manageConversationHistory(conversationHistory, userId);
      
      // Prepare messages for OpenAI
      const messages = [
        { role: 'system', content: systemPrompt },
        ...managedHistory,
        { role: 'user', content: message }
      ];
      
      // Make OpenAI API call
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });
      
      const aiResponse = response.choices[0].message.content;
      const responseTime = Date.now() - startTime;
      
      // Update usage statistics
      this.updateUsageStats(response.usage, responseTime);
      
      // Update conversation history
      this.updateConversationHistory(userId, message, aiResponse);
      
      console.log(`✅ AI response generated in ${responseTime}ms`);
      
      return {
        response: aiResponse,
        conversationId: userId,
        timestamp: new Date().toISOString(),
        responseTime: responseTime,
        tokensUsed: response.usage.total_tokens,
        marketContext: this.summarizeMarketContext(marketContext),
        isRealTime: true
      };
      
    } catch (error) {
      console.error('❌ OpenAI API error:', error.message);
      return this.getFallbackResponse(message, marketContext);
    }
  }

  /**
   * Build sophisticated system prompt with market context
   */
  buildSystemPrompt(marketContext) {
    const currentTime = new Date().toISOString();
    
    return `You are ConnecTouch AI, a professional cryptocurrency and DeFi advisor for the Connectouch platform.

CURRENT MARKET DATA (${currentTime}):
${this.formatMarketData(marketContext)}

EXPERTISE AREAS:
• DeFi Protocols: Uniswap, Aave, Compound, MakerDAO, Curve
• Yield Farming & Liquidity Mining strategies
• Gas optimization and transaction timing
• Portfolio diversification and risk management
• Market analysis and trend identification
• Regulatory considerations and compliance

RESPONSE GUIDELINES:
1. **Structure**: Use clear sections with headings
2. **Data-Driven**: Reference current market data in your analysis
3. **Actionable**: Provide specific, implementable recommendations
4. **Risk-Aware**: Always include risk considerations and disclaimers
5. **Educational**: Explain concepts for learning
6. **Professional**: Maintain expert-level analysis

IMPORTANT DISCLAIMERS:
- This is educational content, not financial advice
- Always emphasize DYOR (Do Your Own Research)
- Highlight risks and potential losses
- Recommend consulting financial advisors for major decisions

FORMAT YOUR RESPONSES WITH:
📊 **Market Analysis** - Current conditions and trends
💡 **Recommendations** - Specific actionable advice
⚠️ **Risk Considerations** - Potential downsides and precautions
🎯 **Next Steps** - Clear action items

Use emojis sparingly for visual appeal and maintain a professional, helpful tone.`;
  }

  /**
   * Format market data for system prompt
   */
  formatMarketData(marketContext) {
    if (!marketContext || Object.keys(marketContext).length === 0) {
      return '• Market data temporarily unavailable - using general analysis';
    }

    let formatted = '';
    
    if (marketContext.prices) {
      formatted += '• CRYPTOCURRENCY PRICES:\n';
      marketContext.prices.forEach(coin => {
        formatted += `  - ${coin.symbol}: $${coin.price?.toLocaleString() || 'N/A'} (${coin.change24h >= 0 ? '+' : ''}${coin.change24h?.toFixed(2) || 'N/A'}%)\n`;
      });
    }
    
    if (marketContext.globalMetrics) {
      const metrics = marketContext.globalMetrics;
      formatted += '• GLOBAL METRICS:\n';
      formatted += `  - Total Market Cap: $${(metrics.totalMarketCap / 1e12)?.toFixed(2) || 'N/A'}T\n`;
      formatted += `  - 24h Volume: $${(metrics.totalVolume / 1e9)?.toFixed(2) || 'N/A'}B\n`;
      formatted += `  - BTC Dominance: ${metrics.btcDominance?.toFixed(1) || 'N/A'}%\n`;
    }
    
    if (marketContext.networkStats) {
      const network = marketContext.networkStats;
      formatted += '• ETHEREUM NETWORK:\n';
      formatted += `  - Gas Price: ${network.gasPrice || 'N/A'} Gwei\n`;
      formatted += `  - Network Congestion: ${network.congestionLevel || 'Unknown'}\n`;
      formatted += `  - Latest Block: ${network.blockNumber?.toLocaleString() || 'N/A'}\n`;
    }
    
    return formatted || '• Market data processing...';
  }

  /**
   * Manage conversation history with sliding window
   */
  manageConversationHistory(history, userId) {
    const cacheKey = `conversation_${userId}`;
    let managedHistory = history || [];
    
    // Get cached history if available
    const cachedHistory = this.cache.get(cacheKey);
    if (cachedHistory && Array.isArray(cachedHistory)) {
      managedHistory = cachedHistory;
    }
    
    // Implement sliding window - keep only recent exchanges
    if (managedHistory.length > this.maxHistoryLength) {
      managedHistory = managedHistory.slice(-this.maxHistoryLength);
    }
    
    return managedHistory;
  }

  /**
   * Update conversation history
   */
  updateConversationHistory(userId, userMessage, aiResponse) {
    const cacheKey = `conversation_${userId}`;
    let history = this.cache.get(cacheKey) || [];
    
    // Add new exchange
    history.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: aiResponse }
    );
    
    // Implement sliding window
    if (history.length > this.maxHistoryLength * 2) {
      history = history.slice(-this.maxHistoryLength * 2);
    }
    
    // Cache updated history
    this.cache.set(cacheKey, history);
  }

  /**
   * Update usage statistics
   */
  updateUsageStats(usage, responseTime) {
    this.usageStats.totalRequests++;
    this.usageStats.totalTokens += usage.total_tokens;
    this.usageStats.lastRequestTime = Date.now();
    
    // Calculate rolling average response time
    const currentAvg = this.usageStats.averageResponseTime;
    const newAvg = (currentAvg * (this.usageStats.totalRequests - 1) + responseTime) / this.usageStats.totalRequests;
    this.usageStats.averageResponseTime = Math.round(newAvg);
  }

  /**
   * Summarize market context for response metadata
   */
  summarizeMarketContext(marketContext) {
    return {
      hasPriceData: !!(marketContext.prices && marketContext.prices.length > 0),
      hasGlobalMetrics: !!marketContext.globalMetrics,
      hasNetworkStats: !!marketContext.networkStats,
      dataTimestamp: new Date().toISOString()
    };
  }

  /**
   * Fallback response when OpenAI API is unavailable
   */
  getFallbackResponse(message, marketContext) {
    console.log('📋 Using fallback AI response');
    
    const fallbackResponses = {
      bitcoin: "📊 **Bitcoin Analysis**: Bitcoin remains the dominant cryptocurrency with strong institutional adoption. Current market conditions suggest continued volatility. ⚠️ **Risk**: High volatility and regulatory uncertainty. 🎯 **Next Steps**: Monitor market trends and consider dollar-cost averaging.",
      
      ethereum: "📊 **Ethereum Analysis**: Ethereum's transition to Proof of Stake has improved energy efficiency and staking opportunities. DeFi ecosystem continues to grow. ⚠️ **Risk**: Gas fees and network congestion during high activity. 🎯 **Next Steps**: Consider staking options and monitor gas prices for optimal transaction timing.",
      
      defi: "📊 **DeFi Overview**: Decentralized Finance offers innovative financial services but requires careful risk assessment. Popular protocols include Uniswap, Aave, and Compound. ⚠️ **Risk**: Smart contract vulnerabilities and impermanent loss. 🎯 **Next Steps**: Start with established protocols and small amounts.",
      
      default: "📊 **Market Analysis**: The cryptocurrency market is dynamic and requires continuous monitoring. 💡 **Recommendation**: Focus on established projects with strong fundamentals. ⚠️ **Risk**: High volatility and regulatory changes. 🎯 **Next Steps**: Research thoroughly and never invest more than you can afford to lose."
    };
    
    const lowerMessage = message.toLowerCase();
    let response = fallbackResponses.default;
    
    if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
      response = fallbackResponses.bitcoin;
    } else if (lowerMessage.includes('ethereum') || lowerMessage.includes('eth')) {
      response = fallbackResponses.ethereum;
    } else if (lowerMessage.includes('defi')) {
      response = fallbackResponses.defi;
    }
    
    return {
      response: response + "\n\n*Note: This is a fallback response. AI service is temporarily unavailable.*",
      conversationId: 'fallback',
      timestamp: new Date().toISOString(),
      responseTime: 0,
      tokensUsed: 0,
      marketContext: this.summarizeMarketContext(marketContext),
      isRealTime: false
    };
  }

  /**
   * Get service statistics
   */
  getServiceStats() {
    return {
      usageStats: this.usageStats,
      cacheStats: {
        keys: this.cache.keys().length,
        stats: this.cache.getStats()
      },
      configuration: {
        maxHistoryLength: this.maxHistoryLength,
        maxTokens: this.maxTokens,
        temperature: this.temperature
      }
    };
  }

  /**
   * Clear conversation history for a user
   */
  clearConversationHistory(userId) {
    const cacheKey = `conversation_${userId}`;
    this.cache.del(cacheKey);
    console.log(`🗑️ Cleared conversation history for user: ${userId}`);
  }
}

module.exports = OpenAIService;
