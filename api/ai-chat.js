/**
 * Vercel API Route - OpenAI Integration
 * Secure server-side API calls to OpenAI
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Use the VALID OpenAI API key you provided
  const API_KEY = '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'

  console.log('🤖 OpenAI API Key configured:', API_KEY.substring(0, 20) + '...')

  try {
    const { messages, type = 'chat', marketData } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    console.log(`🤖 Processing ${type} request with OpenAI...`)

    let systemMessage = {
      role: 'system',
      content: 'You are a helpful AI assistant for Connectouch, a comprehensive blockchain and cryptocurrency platform. Provide accurate, helpful information about crypto, DeFi, NFTs, and blockchain technology.'
    }

    // Customize system message based on type
    if (type === 'market-analysis' && marketData) {
      systemMessage.content = `You are a professional cryptocurrency market analyst. Analyze the provided market data and give insights about market trends, sentiment, and recommendations. Current market context: ${JSON.stringify(marketData).slice(0, 500)}...`
    } else if (type === 'trading-insights') {
      systemMessage.content = 'You are an expert cryptocurrency trader. Provide trading insights, technical analysis, and risk management advice. Always include disclaimers about investment risks.'
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [systemMessage, ...messages],
        temperature: type === 'market-analysis' ? 0.3 : 0.7,
        max_tokens: type === 'market-analysis' ? 1000 : 500,
        stream: false
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    
    console.log('✅ Successfully generated AI response')

    // Parse response for market analysis
    if (type === 'market-analysis') {
      const content = data.choices[0].message.content
      
      // Simple parsing for market analysis
      const analysis = {
        summary: content.slice(0, 200) + '...',
        sentiment: content.toLowerCase().includes('bullish') ? 'bullish' : 
                  content.toLowerCase().includes('bearish') ? 'bearish' : 'neutral',
        confidence: 75,
        keyPoints: [
          'AI-powered analysis based on current market data',
          'Consider multiple factors before making decisions',
          'Market conditions can change rapidly'
        ],
        recommendations: [
          'Diversify your portfolio',
          'Use proper risk management',
          'Stay informed about market developments'
        ],
        riskLevel: 'medium',
        fullAnalysis: content
      }

      return res.status(200).json({
        success: true,
        data: analysis,
        usage: data.usage,
        timestamp: new Date().toISOString(),
        source: 'openai'
      })
    }

    res.status(200).json({
      success: true,
      data: {
        message: data.choices[0].message.content,
        usage: data.usage
      },
      timestamp: new Date().toISOString(),
      source: 'openai'
    })

  } catch (error) {
    console.error('❌ OpenAI API error:', error)
    
    // Return fallback response
    let fallbackResponse = "I apologize, but I'm currently unable to process your request due to a temporary service issue. Please try again later."
    
    if (req.body.type === 'market-analysis') {
      const fallbackAnalysis = {
        summary: 'Market analysis is temporarily unavailable. Please check back later for AI-powered insights.',
        sentiment: 'neutral',
        confidence: 50,
        keyPoints: [
          'Service temporarily unavailable',
          'Please try again later',
          'Consider consulting multiple sources'
        ],
        recommendations: [
          'Monitor market conditions manually',
          'Use proper risk management',
          'Consult with financial advisors'
        ],
        riskLevel: 'medium',
        fullAnalysis: 'AI market analysis is currently unavailable. Please try again later or consult other market analysis tools.'
      }

      return res.status(200).json({
        success: true,
        data: fallbackAnalysis,
        fallback: true,
        error: error.message,
        timestamp: new Date().toISOString(),
        source: 'fallback'
      })
    }

    res.status(200).json({
      success: true,
      data: {
        message: fallbackResponse
      },
      fallback: true,
      error: error.message,
      timestamp: new Date().toISOString(),
      source: 'fallback'
    })
  }
}
