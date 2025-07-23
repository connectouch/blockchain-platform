import { AIService } from '../services/AIService'

// Test function to verify OpenAI integration
export async function testAIIntegration() {
  console.log('🤖 Testing AI Integration with OpenAI...')
  
  try {
    const aiService = AIService.getInstance()
    
    // Test 1: Basic chat functionality
    console.log('📝 Test 1: Basic Chat')
    const chatResponse = await aiService.enhancedChat(
      "Hello! Can you help me understand Bitcoin?",
      [],
      {
        feature: 'dashboard',
        contextData: { totalMarketCap: '$1.2T', btcDominance: '42%' },
        portfolioData: null,
        userPreferences: { riskTolerance: 'moderate' }
      },
      [],
      {
        naturalLanguageTrading: true,
        portfolioAnalysis: true,
        marketInsights: true,
        voiceCommands: true,
        contextAwareness: true,
        multiLanguage: true,
        realTimeData: true,
        predictiveAnalytics: true,
        riskAssessment: true,
        educationalContent: true
      }
    )
    
    console.log('✅ Chat Response:', {
      response: chatResponse.response.substring(0, 100) + '...',
      confidence: chatResponse.confidence,
      suggestions: chatResponse.suggestions
    })
    
    // Test 2: Portfolio Analysis
    console.log('\n📊 Test 2: Portfolio Analysis')
    const portfolioResponse = await aiService.analyzePortfolio(
      {
        totalValue: 125000,
        holdings: [
          { symbol: 'BTC', value: 50000, percentage: 40 },
          { symbol: 'ETH', value: 37500, percentage: 30 },
          { symbol: 'MATIC', value: 25000, percentage: 20 },
          { symbol: 'LINK', value: 12500, percentage: 10 }
        ]
      },
      {
        riskTolerance: 'moderate',
        investmentGoal: 'long-term growth',
        experience: 'intermediate'
      }
    )
    
    console.log('✅ Portfolio Analysis:', {
      response: portfolioResponse.response.substring(0, 100) + '...',
      confidence: portfolioResponse.confidence
    })
    
    // Test 3: Market Insights
    console.log('\n📈 Test 3: Market Insights')
    const marketResponse = await aiService.getMarketInsights({
      feature: 'dashboard',
      contextData: {
        btcPrice: 43500,
        ethPrice: 2650,
        marketCap: 1200000000000,
        fearGreedIndex: 65
      }
    })
    
    console.log('✅ Market Insights:', {
      response: marketResponse.response.substring(0, 100) + '...',
      confidence: marketResponse.confidence
    })
    
    // Test 4: Trading Command
    console.log('\n💰 Test 4: Trading Command')
    const tradeResponse = await aiService.processTradeCommand(
      "Buy 0.5 BTC with market order",
      {
        feature: 'trading',
        portfolioData: { availableBalance: 25000 },
        userPreferences: { riskTolerance: 'moderate' }
      }
    )
    
    console.log('✅ Trade Command:', {
      response: tradeResponse.response.substring(0, 100) + '...',
      confidence: tradeResponse.confidence
    })
    
    // Test 5: Educational Content
    console.log('\n📚 Test 5: Educational Content')
    const educationResponse = await aiService.getEducationalContent(
      'DeFi yield farming',
      'beginner'
    )
    
    console.log('✅ Educational Content:', {
      response: educationResponse.response.substring(0, 100) + '...',
      confidence: educationResponse.confidence
    })
    
    // Test 6: Risk Assessment
    console.log('\n⚠️ Test 6: Risk Assessment')
    const riskResponse = await aiService.assessRisk(
      {
        holdings: [
          { symbol: 'BTC', value: 50000, volatility: 0.8 },
          { symbol: 'ETH', value: 37500, volatility: 0.9 },
          { symbol: 'DOGE', value: 12500, volatility: 1.5 }
        ]
      },
      {
        marketVolatility: 'high',
        correlations: { 'BTC-ETH': 0.7, 'BTC-DOGE': 0.6 }
      }
    )
    
    console.log('✅ Risk Assessment:', {
      response: riskResponse.response.substring(0, 100) + '...',
      confidence: riskResponse.confidence
    })
    
    console.log('\n🎉 All AI tests completed successfully!')
    return true
    
  } catch (error) {
    console.error('❌ AI Integration Test Failed:', error)
    return false
  }
}

// Test specific OpenAI features
export async function testOpenAIFeatures() {
  console.log('🔬 Testing OpenAI Specific Features...')
  
  try {
    const aiService = AIService.getInstance()
    
    // Test complex reasoning
    const complexResponse = await aiService.enhancedChat(
      "I have $10,000 to invest. I'm 25 years old, moderate risk tolerance, and want to build wealth for retirement. I'm interested in both traditional crypto and DeFi. What's your recommendation for portfolio allocation?",
      [],
      {
        feature: 'portfolio',
        contextData: { 
          userAge: 25, 
          investmentAmount: 10000,
          timeHorizon: 'long-term',
          currentMarket: 'bullish'
        },
        userPreferences: { 
          riskTolerance: 'moderate',
          defiInterest: true,
          retirementFocus: true
        }
      },
      [],
      {
        naturalLanguageTrading: true,
        portfolioAnalysis: true,
        marketInsights: true,
        voiceCommands: true,
        contextAwareness: true,
        multiLanguage: true,
        realTimeData: true,
        predictiveAnalytics: true,
        riskAssessment: true,
        educationalContent: true
      }
    )
    
    console.log('✅ Complex Reasoning Test:', {
      responseLength: complexResponse.response.length,
      confidence: complexResponse.confidence,
      suggestionsCount: complexResponse.suggestions?.length || 0,
      hasMetadata: !!complexResponse.metadata
    })
    
    // Test command parsing
    const commandResponse = await aiService.enhancedChat(
      "Sell 25% of my Ethereum holdings and use the proceeds to buy Polygon. Also set a stop loss at 10% below current price for my Bitcoin position.",
      [],
      {
        feature: 'trading',
        portfolioData: {
          ETH: { amount: 10, price: 2650 },
          BTC: { amount: 0.5, price: 43500 }
        }
      },
      [],
      {
        naturalLanguageTrading: true,
        portfolioAnalysis: true,
        marketInsights: true,
        voiceCommands: true,
        contextAwareness: true,
        multiLanguage: true,
        realTimeData: true,
        predictiveAnalytics: true,
        riskAssessment: true,
        educationalContent: true
      }
    )
    
    console.log('✅ Command Parsing Test:', {
      responseLength: commandResponse.response.length,
      confidence: commandResponse.confidence,
      actionsDetected: commandResponse.actions?.length || 0
    })
    
    console.log('\n🎯 OpenAI Features Test Completed!')
    return true
    
  } catch (error) {
    console.error('❌ OpenAI Features Test Failed:', error)
    return false
  }
}

// Run all tests
export async function runAllAITests() {
  console.log('🚀 Starting Comprehensive AI Tests...\n')
  
  const basicTest = await testAIIntegration()
  const featuresTest = await testOpenAIFeatures()
  
  if (basicTest && featuresTest) {
    console.log('\n🎉 All AI tests passed! OpenAI integration is working correctly.')
  } else {
    console.log('\n❌ Some tests failed. Please check the configuration.')
  }
  
  return basicTest && featuresTest
}

// Export for use in development
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.testAI = {
    testAIIntegration,
    testOpenAIFeatures,
    runAllAITests
  }
}
