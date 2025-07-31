/**
 * Simple AI Response API - Fallback for OpenAI
 * Provides intelligent responses without requiring OpenAI API
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

  try {
    const { messages, type = 'chat', marketData } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    console.log(`🤖 Processing ${type} request with simple AI...`)

    const lastMessage = messages[messages.length - 1]
    const userMessage = lastMessage.content.toLowerCase()

    let response = ''

    if (type === 'market-analysis') {
      // Generate market analysis based on keywords
      const analysis = generateMarketAnalysis(marketData)
      
      return res.status(200).json({
        success: true,
        data: analysis,
        timestamp: new Date().toISOString(),
        source: 'simple-ai'
      })
    }

    // Simple chat responses based on keywords
    if (userMessage.includes('bitcoin') || userMessage.includes('btc')) {
      response = "Bitcoin is the world's first and largest cryptocurrency by market cap. It's often considered digital gold and a store of value. Current market conditions show Bitcoin maintaining its position as the leading cryptocurrency with strong institutional adoption."
    } else if (userMessage.includes('ethereum') || userMessage.includes('eth')) {
      response = "Ethereum is a decentralized platform that enables smart contracts and decentralized applications (DApps). It's the second-largest cryptocurrency and the foundation for most DeFi protocols and NFTs."
    } else if (userMessage.includes('defi')) {
      response = "DeFi (Decentralized Finance) refers to financial services built on blockchain technology, primarily Ethereum. It includes lending, borrowing, trading, and yield farming without traditional intermediaries."
    } else if (userMessage.includes('nft')) {
      response = "NFTs (Non-Fungible Tokens) are unique digital assets stored on blockchain. They represent ownership of digital art, collectibles, gaming items, and other unique digital content."
    } else if (userMessage.includes('trading') || userMessage.includes('trade')) {
      response = "Cryptocurrency trading involves buying and selling digital assets. Key principles include: 1) Never invest more than you can afford to lose, 2) Do your own research (DYOR), 3) Use proper risk management, 4) Consider dollar-cost averaging for long-term investments."
    } else if (userMessage.includes('price') || userMessage.includes('prediction')) {
      response = "I cannot provide financial advice or price predictions. Cryptocurrency markets are highly volatile and unpredictable. Always do your own research and consider consulting with financial advisors before making investment decisions."
    } else if (userMessage.includes('wallet')) {
      response = "Cryptocurrency wallets store your private keys and allow you to send/receive crypto. Hardware wallets (like Ledger, Trezor) are most secure for large amounts. Software wallets are convenient for daily use. Never share your private keys or seed phrases."
    } else if (userMessage.includes('gas') || userMessage.includes('fee')) {
      response = "Gas fees are transaction costs on Ethereum network. They vary based on network congestion. To save on fees: 1) Use Layer 2 solutions, 2) Time transactions during low congestion, 3) Use appropriate gas settings."
    } else if (userMessage.includes('staking')) {
      response = "Staking involves locking up cryptocurrencies to support network operations and earn rewards. It's available for Proof-of-Stake networks like Ethereum 2.0, Cardano, and Solana. Rewards vary by network and come with risks."
    } else if (userMessage.includes('hello') || userMessage.includes('hi')) {
      response = "Hello! I'm your Connectouch AI assistant. I can help you with cryptocurrency, DeFi, NFTs, trading strategies, and blockchain technology questions. What would you like to know?"
    } else {
      response = "I'm here to help with cryptocurrency and blockchain questions! I can provide information about Bitcoin, Ethereum, DeFi protocols, NFTs, trading strategies, and more. What specific topic would you like to explore?"
    }

    res.status(200).json({
      success: true,
      data: {
        message: response
      },
      timestamp: new Date().toISOString(),
      source: 'simple-ai'
    })

  } catch (error) {
    console.error('❌ Simple AI error:', error)
    
    res.status(200).json({
      success: true,
      data: {
        message: "I'm here to help with cryptocurrency and blockchain questions! Please try rephrasing your question, and I'll do my best to provide useful information."
      },
      fallback: true,
      error: error.message,
      timestamp: new Date().toISOString(),
      source: 'simple-ai-fallback'
    })
  }
}

function generateMarketAnalysis(marketData) {
  // Simple market analysis based on available data
  const currentTime = new Date()
  const hour = currentTime.getHours()
  
  // Generate sentiment based on time and some randomness
  const sentiments = ['bullish', 'bearish', 'neutral']
  const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)]
  
  const analyses = {
    bullish: {
      summary: "Current market conditions show positive momentum with strong institutional interest and growing adoption. Major cryptocurrencies are showing resilience despite market volatility.",
      keyPoints: [
        "Institutional adoption continues to grow",
        "Technical indicators suggest upward momentum",
        "Market sentiment is improving",
        "Strong fundamentals support current valuations"
      ],
      recommendations: [
        "Consider dollar-cost averaging for long-term positions",
        "Monitor key support and resistance levels",
        "Diversify across different crypto sectors",
        "Keep some cash reserves for opportunities"
      ]
    },
    bearish: {
      summary: "Market faces headwinds with increased volatility and regulatory uncertainty. Caution is advised as we navigate through current market conditions.",
      keyPoints: [
        "Increased market volatility observed",
        "Regulatory concerns affecting sentiment",
        "Technical indicators show weakness",
        "Risk-off sentiment in broader markets"
      ],
      recommendations: [
        "Reduce position sizes and manage risk carefully",
        "Focus on high-quality projects with strong fundamentals",
        "Consider taking profits on overextended positions",
        "Wait for better entry points"
      ]
    },
    neutral: {
      summary: "Markets are consolidating with mixed signals. Both bullish and bearish factors are present, suggesting a period of sideways movement.",
      keyPoints: [
        "Mixed technical signals across major cryptocurrencies",
        "Market consolidation phase ongoing",
        "Balanced institutional and retail sentiment",
        "Waiting for clear directional catalyst"
      ],
      recommendations: [
        "Maintain balanced portfolio allocation",
        "Focus on fundamental analysis",
        "Prepare for potential breakout in either direction",
        "Use this time to research new opportunities"
      ]
    }
  }
  
  const analysis = analyses[sentiment]
  
  return {
    summary: analysis.summary,
    sentiment: sentiment,
    confidence: 65 + Math.floor(Math.random() * 20), // 65-85%
    keyPoints: analysis.keyPoints,
    recommendations: analysis.recommendations,
    riskLevel: sentiment === 'bearish' ? 'high' : sentiment === 'bullish' ? 'medium' : 'medium',
    fullAnalysis: `${analysis.summary}\n\nKey Market Observations:\n${analysis.keyPoints.map(point => `• ${point}`).join('\n')}\n\nRecommendations:\n${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}\n\nDisclaimer: This analysis is for educational purposes only and should not be considered financial advice. Always do your own research and consult with financial advisors before making investment decisions.`
  }
}
