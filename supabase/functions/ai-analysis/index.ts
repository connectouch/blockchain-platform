// Supabase Edge Function: AI Analysis
// Provides AI-powered analysis using OpenAI GPT-4

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIAnalysisRequest {
  type: 'market' | 'portfolio' | 'defi' | 'nft' | 'general'
  data: any
  prompt?: string
  userId?: string
}

interface AIAnalysisResponse {
  success: boolean
  analysis: string
  confidence: number
  recommendations?: string[]
  timestamp: string
  processingTime: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const startTime = Date.now()

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    let userId: string | null = null
    
    if (authHeader) {
      const { data: { user } } = await supabaseClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      userId = user?.id || null
    }

    // Parse request body
    const requestData: AIAnalysisRequest = await req.json()

    // Validate OpenAI API key
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Build AI prompt based on analysis type
    let systemPrompt = ''
    let userPrompt = ''

    switch (requestData.type) {
      case 'market':
        systemPrompt = `You are a professional cryptocurrency market analyst. Provide detailed market analysis based on the provided data. Focus on trends, patterns, and actionable insights. Be concise but comprehensive.`
        userPrompt = `Analyze this market data: ${JSON.stringify(requestData.data)}`
        break

      case 'portfolio':
        systemPrompt = `You are a professional portfolio advisor specializing in cryptocurrency investments. Analyze the portfolio and provide optimization recommendations, risk assessment, and diversification advice.`
        userPrompt = `Analyze this portfolio: ${JSON.stringify(requestData.data)}`
        break

      case 'defi':
        systemPrompt = `You are a DeFi protocol expert. Analyze DeFi protocols, yield opportunities, and risks. Provide insights on TVL, APY, and protocol security.`
        userPrompt = `Analyze these DeFi protocols: ${JSON.stringify(requestData.data)}`
        break

      case 'nft':
        systemPrompt = `You are an NFT market analyst. Analyze NFT collections, floor prices, volume trends, and market sentiment. Provide insights on collection performance and market opportunities.`
        userPrompt = `Analyze these NFT collections: ${JSON.stringify(requestData.data)}`
        break

      case 'general':
        systemPrompt = `You are a blockchain and cryptocurrency expert. Provide helpful, accurate, and actionable insights based on the user's question.`
        userPrompt = requestData.prompt || `Analyze: ${JSON.stringify(requestData.data)}`
        break

      default:
        throw new Error('Invalid analysis type')
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const analysis = openaiData.choices[0]?.message?.content || 'No analysis generated'

    // Extract recommendations (simple pattern matching)
    const recommendationPatterns = [
      /recommend[s]?\s+([^.]+)/gi,
      /suggest[s]?\s+([^.]+)/gi,
      /consider\s+([^.]+)/gi,
      /should\s+([^.]+)/gi
    ]

    const recommendations: string[] = []
    for (const pattern of recommendationPatterns) {
      const matches = analysis.match(pattern)
      if (matches) {
        recommendations.push(...matches.slice(0, 3)) // Limit to 3 recommendations
      }
    }

    // Calculate confidence score (simplified)
    const confidence = Math.min(0.95, 0.7 + (analysis.length / 1000) * 0.2)

    const processingTime = Date.now() - startTime

    // Store analysis in database if user is authenticated
    if (userId) {
      try {
        await supabaseClient
          .from('ai_analysis')
          .insert({
            user_id: userId,
            analysis_type: requestData.type,
            input_data: requestData.data,
            result: {
              analysis,
              recommendations,
              confidence
            },
            confidence_score: confidence,
            model_used: 'gpt-4',
            processing_time_ms: processingTime
          })
      } catch (dbError) {
        console.error('Failed to store analysis:', dbError)
        // Continue without failing the request
      }
    }

    const response: AIAnalysisResponse = {
      success: true,
      analysis,
      confidence,
      recommendations: recommendations.slice(0, 5), // Limit to 5 recommendations
      timestamp: new Date().toISOString(),
      processingTime
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('AI analysis function error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
