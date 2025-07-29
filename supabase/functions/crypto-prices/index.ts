// Supabase Edge Function: Crypto Prices
// Fetches and caches cryptocurrency prices from CoinMarketCap API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CryptoPriceData {
  symbol: string
  name: string
  price: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap: number
  market_cap_rank: number
  volume_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const symbols = url.searchParams.get('symbols') || 'BTC,ETH,BNB,ADA,SOL,DOT,LINK,UNI,AVAX,MATIC'
    const forceRefresh = url.searchParams.get('refresh') === 'true'

    // Check if we have recent data in cache (less than 1 minute old)
    if (!forceRefresh) {
      const { data: cachedData, error: cacheError } = await supabaseClient
        .from('crypto_prices')
        .select('*')
        .in('symbol', symbols.split(','))
        .gte('last_updated', new Date(Date.now() - 60000).toISOString()) // 1 minute cache

      if (!cacheError && cachedData && cachedData.length > 0) {
        return new Response(
          JSON.stringify({
            success: true,
            data: cachedData,
            cached: true,
            timestamp: new Date().toISOString()
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // Fetch fresh data from CoinMarketCap API
    const coinMarketCapKey = Deno.env.get('COINMARKETCAP_API_KEY')
    if (!coinMarketCapKey) {
      throw new Error('CoinMarketCap API key not configured')
    }

    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}&convert=USD`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': coinMarketCapKey,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`)
    }

    const apiData = await response.json()

    if (apiData.status?.error_code !== 0) {
      throw new Error(`CoinMarketCap API error: ${apiData.status?.error_message}`)
    }

    // Transform and prepare data for database
    const cryptoData: CryptoPriceData[] = []
    const symbolArray = symbols.split(',')

    for (const symbol of symbolArray) {
      const coinData = apiData.data[symbol]
      if (coinData && coinData.quote && coinData.quote.USD) {
        const quote = coinData.quote.USD
        cryptoData.push({
          symbol: coinData.symbol,
          name: coinData.name,
          price: quote.price,
          price_change_24h: quote.price_change_24h || 0,
          price_change_percentage_24h: quote.percent_change_24h || 0,
          market_cap: quote.market_cap || 0,
          market_cap_rank: coinData.cmc_rank || 0,
          volume_24h: quote.volume_24h || 0,
          circulating_supply: coinData.circulating_supply || 0,
          total_supply: coinData.total_supply || 0,
          max_supply: coinData.max_supply || 0,
          ath: quote.ath || 0,
          ath_change_percentage: quote.ath_change_percentage || 0,
          ath_date: quote.ath_date || new Date().toISOString(),
          atl: quote.atl || 0,
          atl_change_percentage: quote.atl_change_percentage || 0,
          atl_date: quote.atl_date || new Date().toISOString()
        })
      }
    }

    // Update database with fresh data
    for (const crypto of cryptoData) {
      await supabaseClient
        .from('crypto_prices')
        .upsert(
          {
            ...crypto,
            last_updated: new Date().toISOString()
          },
          {
            onConflict: 'symbol'
          }
        )
    }

    // Return fresh data
    return new Response(
      JSON.stringify({
        success: true,
        data: cryptoData,
        cached: false,
        timestamp: new Date().toISOString(),
        count: cryptoData.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Crypto prices function error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
