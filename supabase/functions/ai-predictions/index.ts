/**
 * Supabase Edge Function: AI Predictions
 * Advanced AI-powered market analysis and predictions using GPT-4
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface PredictionRequest {
  symbol: string
  timeframe: '1h' | '4h' | '1d' | '1w' | '1m'
  indicators?: string[]
  includeNews?: boolean
  riskLevel?: 'conservative' | 'moderate' | 'aggressive'
}

interface MarketData {
  symbol: string
  price: number
  volume24h: number
  marketCap: number
  priceChange24h: number
  priceChangePercent24h: number
  high24h: number
  low24h: number
  timestamp: string
}

interface NewsItem {
  title: string
  summary: string
  sentiment: 'positive' | 'negative' | 'neutral'
  source: string
  publishedAt: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { 
      symbol, 
      timeframe = '1d', 
      indicators = [], 
      includeNews = false,
      riskLevel = 'moderate' 
    }: PredictionRequest = await req.json()

    if (!symbol) {
      return new Response(JSON.stringify({ 
        error: 'Symbol is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`🔮 Generating AI prediction for ${symbol} (${timeframe})`)

    // 1. Fetch historical price data
    const { data: priceHistory, error: priceError } = await supabase
      .from('price_history')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .order('timestamp', { ascending: false })
      .limit(100)

    if (priceError) {
      console.error('Price history fetch error:', priceError)
    }

    // 2. Fetch current market data
    const currentMarketData = await fetchCurrentMarketData(symbol)

    // 3. Fetch news sentiment if requested
    let newsData: NewsItem[] = []
    if (includeNews) {
      newsData = await fetchNewsData(symbol)
    }

    // 4. Calculate technical indicators
    const technicalIndicators = calculateTechnicalIndicators(priceHistory || [], indicators)

    // 5. Generate AI analysis using OpenAI GPT-4
    const aiAnalysis = await generateAIAnalysis({
      symbol,
      timeframe,
      currentData: currentMarketData,
      priceHistory: priceHistory?.slice(0, 20) || [],
      technicalIndicators,
      newsData,
      riskLevel
    })

    // 6. Calculate confidence score
    const confidenceScore = calculateConfidenceScore({
      dataQuality: priceHistory?.length || 0,
      newsCount: newsData.length,
      volatility: currentMarketData?.priceChangePercent24h || 0,
      marketCap: currentMarketData?.marketCap || 0
    })

    // 7. Store prediction in database
    const predictionRecord = {
      symbol: symbol.toUpperCase(),
      timeframe,
      prediction_text: aiAnalysis.prediction,
      price_target: aiAnalysis.priceTarget,
      confidence_score: confidenceScore,
      risk_level: riskLevel,
      technical_indicators: technicalIndicators,
      news_sentiment: newsData.length > 0 ? calculateOverallSentiment(newsData) : null,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + getTimeframeMs(timeframe)).toISOString()
    }

    const { data: savedPrediction, error: saveError } = await supabase
      .from('ai_predictions')
      .insert(predictionRecord)
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save prediction:', saveError)
    }

    // 8. Return comprehensive prediction
    return new Response(JSON.stringify({
      success: true,
      data: {
        id: savedPrediction?.id,
        symbol: symbol.toUpperCase(),
        timeframe,
        prediction: {
          analysis: aiAnalysis.prediction,
          priceTarget: aiAnalysis.priceTarget,
          direction: aiAnalysis.direction,
          confidence: confidenceScore,
          riskLevel
        },
        currentData: currentMarketData,
        technicalIndicators,
        newsAnalysis: newsData.length > 0 ? {
          totalArticles: newsData.length,
          overallSentiment: calculateOverallSentiment(newsData),
          keyHeadlines: newsData.slice(0, 3).map(n => n.title)
        } : null,
        metadata: {
          generatedAt: new Date().toISOString(),
          expiresAt: predictionRecord.expires_at,
          dataPoints: priceHistory?.length || 0,
          model: 'GPT-4',
          version: '1.0'
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ AI Predictions error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate AI prediction',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Helper function to fetch current market data
async function fetchCurrentMarketData(symbol: string): Promise<MarketData | null> {
  try {
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': Deno.env.get('COINMARKETCAP_API_KEY') ?? ''
        }
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const coinData = data.data[symbol.toUpperCase()]

    if (!coinData) return null

    return {
      symbol: symbol.toUpperCase(),
      price: coinData.quote.USD.price,
      volume24h: coinData.quote.USD.volume_24h,
      marketCap: coinData.quote.USD.market_cap,
      priceChange24h: coinData.quote.USD.price_change_24h,
      priceChangePercent24h: coinData.quote.USD.percent_change_24h,
      high24h: coinData.quote.USD.price * (1 + Math.abs(coinData.quote.USD.percent_change_24h) / 100),
      low24h: coinData.quote.USD.price * (1 - Math.abs(coinData.quote.USD.percent_change_24h) / 100),
      timestamp: coinData.quote.USD.last_updated
    }
  } catch (error) {
    console.error('Failed to fetch market data:', error)
    return null
  }
}

// Helper function to fetch news data
async function fetchNewsData(symbol: string): Promise<NewsItem[]> {
  try {
    // This would integrate with news APIs like NewsAPI, CryptoPanic, etc.
    // For now, return mock data
    return [
      {
        title: `${symbol} shows strong technical indicators`,
        summary: 'Recent analysis suggests positive momentum',
        sentiment: 'positive',
        source: 'CryptoNews',
        publishedAt: new Date().toISOString()
      }
    ]
  } catch (error) {
    console.error('Failed to fetch news data:', error)
    return []
  }
}

// Helper function to calculate technical indicators
function calculateTechnicalIndicators(priceHistory: any[], indicators: string[]) {
  const prices = priceHistory.map(p => p.price).filter(p => p > 0)
  
  if (prices.length < 20) {
    return { error: 'Insufficient data for technical analysis' }
  }

  const result: any = {}

  // Simple Moving Average (SMA)
  if (indicators.includes('SMA') || indicators.length === 0) {
    result.sma20 = prices.slice(0, 20).reduce((a, b) => a + b, 0) / 20
    result.sma50 = prices.slice(0, Math.min(50, prices.length)).reduce((a, b) => a + b, 0) / Math.min(50, prices.length)
  }

  // RSI (simplified)
  if (indicators.includes('RSI') || indicators.length === 0) {
    result.rsi = calculateRSI(prices.slice(0, 14))
  }

  // Volatility
  result.volatility = calculateVolatility(prices.slice(0, 30))

  return result
}

// Helper function to calculate RSI
function calculateRSI(prices: number[]): number {
  if (prices.length < 2) return 50

  let gains = 0
  let losses = 0

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    if (change > 0) gains += change
    else losses += Math.abs(change)
  }

  const avgGain = gains / (prices.length - 1)
  const avgLoss = losses / (prices.length - 1)

  if (avgLoss === 0) return 100
  
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

// Helper function to calculate volatility
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0

  const returns = []
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length
  
  return Math.sqrt(variance) * 100
}

// Helper function to generate AI analysis
async function generateAIAnalysis(data: any) {
  try {
    const prompt = `
    Analyze ${data.symbol} cryptocurrency for ${data.timeframe} timeframe:
    
    Current Price: $${data.currentData?.price || 'N/A'}
    24h Change: ${data.currentData?.priceChangePercent24h || 0}%
    Market Cap: $${data.currentData?.marketCap || 'N/A'}
    
    Technical Indicators:
    ${JSON.stringify(data.technicalIndicators, null, 2)}
    
    Recent Price History (last 20 points):
    ${data.priceHistory.map((p: any) => `${p.timestamp}: $${p.price}`).join('\n')}
    
    Risk Level: ${data.riskLevel}
    
    Provide a concise analysis with:
    1. Price prediction for the timeframe
    2. Key factors influencing the prediction
    3. Risk assessment
    4. Confidence level reasoning
    
    Format as JSON with: prediction (string), priceTarget (number), direction (up/down/sideways)
    `

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'You are an expert cryptocurrency analyst. Provide objective, data-driven analysis.'
        }, {
          role: 'user',
          content: prompt
        }],
        max_tokens: 800,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error('OpenAI API request failed')
    }

    const aiResponse = await response.json()
    const content = aiResponse.choices[0].message.content

    // Try to parse as JSON, fallback to text analysis
    try {
      return JSON.parse(content)
    } catch {
      return {
        prediction: content,
        priceTarget: data.currentData?.price || 0,
        direction: 'sideways'
      }
    }

  } catch (error) {
    console.error('AI analysis failed:', error)
    return {
      prediction: `Technical analysis suggests ${data.symbol} may continue current trend based on market conditions.`,
      priceTarget: data.currentData?.price || 0,
      direction: 'sideways'
    }
  }
}

// Helper functions
function calculateConfidenceScore(factors: any): number {
  let score = 50 // Base confidence

  // Data quality factor
  if (factors.dataQuality > 50) score += 20
  else if (factors.dataQuality > 20) score += 10

  // News factor
  if (factors.newsCount > 5) score += 15
  else if (factors.newsCount > 0) score += 5

  // Volatility factor (lower volatility = higher confidence)
  if (Math.abs(factors.volatility) < 5) score += 10
  else if (Math.abs(factors.volatility) > 20) score -= 10

  // Market cap factor (higher = more reliable)
  if (factors.marketCap > 1e10) score += 10 // > $10B
  else if (factors.marketCap > 1e9) score += 5 // > $1B

  return Math.max(10, Math.min(95, score))
}

function calculateOverallSentiment(news: NewsItem[]): string {
  const sentiments = news.map(n => n.sentiment)
  const positive = sentiments.filter(s => s === 'positive').length
  const negative = sentiments.filter(s => s === 'negative').length
  
  if (positive > negative) return 'positive'
  if (negative > positive) return 'negative'
  return 'neutral'
}

function getTimeframeMs(timeframe: string): number {
  const timeframes: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
    '1m': 30 * 24 * 60 * 60 * 1000
  }
  return timeframes[timeframe] || timeframes['1d']
}
