/**
 * Supabase Edge Function: DeFi Protocols
 * Fetches DeFi protocol data from DeFiLlama and stores in database
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface DeFiProtocolData {
  name: string
  symbol?: string
  tvl: number
  tvl_change_24h?: number
  apy?: number
  category: string
  chain: string
  token_address?: string
  website_url?: string
  description?: string
  logo_url?: string
  is_active: boolean
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Fetching DeFi protocols from DeFiLlama API...')

    // Fetch data from DeFiLlama
    const response = await fetch('https://api.llama.fi/protocols', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Connectouch-Blockchain-Platform/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`DeFiLlama API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ DeFi protocols fetched successfully:', data.length, 'protocols')

    // Transform and filter data for database storage
    const protocols: DeFiProtocolData[] = data
      .filter((protocol: any) => protocol.name && protocol.tvl > 0)
      .slice(0, 50) // Limit to top 50 protocols
      .map((protocol: any) => ({
        name: protocol.name,
        symbol: protocol.symbol || protocol.name.substring(0, 4).toUpperCase(),
        tvl: protocol.tvl || 0,
        tvl_change_24h: protocol.change_1d || 0,
        apy: Math.random() * 15 + 2, // Mock APY for now
        category: protocol.category || 'DeFi',
        chain: Array.isArray(protocol.chains) ? protocol.chains[0] || 'ethereum' : 'ethereum',
        token_address: protocol.address || null,
        website_url: protocol.url || null,
        description: protocol.description || null,
        logo_url: protocol.logo || null,
        is_active: true
      }))

    // Store in Supabase database with upsert
    const { data: insertedData, error: insertError } = await supabase
      .from('defi_protocols')
      .upsert(protocols, { 
        onConflict: 'name',
        ignoreDuplicates: false 
      })
      .select()

    if (insertError) {
      console.error('❌ Database insert error:', insertError)
      throw insertError
    }

    console.log('✅ DeFi protocols stored in database:', insertedData?.length, 'records')

    // Return formatted response for frontend compatibility
    const formattedResponse = {
      success: true,
      data: protocols.map(protocol => ({
        id: protocol.name.toLowerCase().replace(/\s+/g, '-'),
        name: protocol.name,
        symbol: protocol.symbol,
        tvl: protocol.tvl,
        change_1d: protocol.tvl_change_24h,
        change_7d: protocol.tvl_change_24h * 1.2, // Estimate 7d change
        category: protocol.category,
        chains: [protocol.chain],
        logo: protocol.logo_url,
        url: protocol.website_url,
        description: protocol.description,
        apy: protocol.apy,
        volume24h: protocol.tvl * 0.1, // Estimate volume as 10% of TVL
        users: Math.floor(Math.random() * 50000) + 10000, // Mock user count
        riskScore: protocol.tvl > 5000000000 ? 'low' : protocol.tvl > 1000000000 ? 'medium' : 'high'
      })),
      count: protocols.length,
      timestamp: new Date().toISOString(),
      source: 'defillama'
    }

    return new Response(JSON.stringify(formattedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ DeFi protocols function error:', error)

    // Return fallback data
    const fallbackProtocols = [
      {
        id: 'uniswap',
        name: 'Uniswap',
        symbol: 'UNI',
        tvl: 8500000000,
        change_1d: 2.3,
        change_7d: -1.2,
        category: 'Dexes',
        chains: ['ethereum', 'polygon', 'arbitrum'],
        logo: null,
        url: 'https://uniswap.org',
        description: 'Decentralized trading protocol',
        apy: 12.5,
        volume24h: 850000000,
        users: 45000,
        riskScore: 'low'
      },
      {
        id: 'aave',
        name: 'Aave',
        symbol: 'AAVE',
        tvl: 12000000000,
        change_1d: 1.8,
        change_7d: 3.5,
        category: 'Lending',
        chains: ['ethereum', 'polygon', 'avalanche'],
        logo: null,
        url: 'https://aave.com',
        description: 'Decentralized lending protocol',
        apy: 8.7,
        volume24h: 1200000000,
        users: 38000,
        riskScore: 'low'
      },
      {
        id: 'compound',
        name: 'Compound',
        symbol: 'COMP',
        tvl: 3200000000,
        change_1d: -0.5,
        change_7d: 2.1,
        category: 'Lending',
        chains: ['ethereum'],
        logo: null,
        url: 'https://compound.finance',
        description: 'Algorithmic money markets',
        apy: 6.2,
        volume24h: 320000000,
        users: 25000,
        riskScore: 'medium'
      },
      {
        id: 'makerdao',
        name: 'MakerDAO',
        symbol: 'MKR',
        tvl: 9800000000,
        change_1d: 0.8,
        change_7d: -2.3,
        category: 'CDP',
        chains: ['ethereum'],
        logo: null,
        url: 'https://makerdao.com',
        description: 'Decentralized stablecoin platform',
        apy: 4.5,
        volume24h: 980000000,
        users: 32000,
        riskScore: 'low'
      },
      {
        id: 'curve',
        name: 'Curve',
        symbol: 'CRV',
        tvl: 4500000000,
        change_1d: 1.2,
        change_7d: 4.7,
        category: 'Dexes',
        chains: ['ethereum', 'polygon', 'arbitrum'],
        logo: null,
        url: 'https://curve.fi',
        description: 'Decentralized exchange for stablecoins',
        apy: 15.3,
        volume24h: 450000000,
        users: 28000,
        riskScore: 'medium'
      },
      {
        id: 'lido',
        name: 'Lido',
        symbol: 'LDO',
        tvl: 15200000000,
        change_1d: 2.7,
        change_7d: 8.9,
        category: 'Liquid Staking',
        chains: ['ethereum'],
        logo: null,
        url: 'https://lido.fi',
        description: 'Liquid staking solution',
        apy: 3.8,
        volume24h: 1520000000,
        users: 55000,
        riskScore: 'low'
      }
    ]

    const fallbackResponse = {
      success: true,
      data: fallbackProtocols,
      count: fallbackProtocols.length,
      timestamp: new Date().toISOString(),
      fallback: true,
      error: error.message
    }

    return new Response(JSON.stringify(fallbackResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
