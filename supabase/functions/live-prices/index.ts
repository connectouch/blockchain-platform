/**
 * Supabase Edge Function: Live Prices
 * Provides real-time cryptocurrency prices for portfolio tracking
 * Replacement for Netlify live-prices function
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    const url = new URL(req.url)
    const symbols = url.searchParams.get('symbols') || 'BTC,ETH,BNB,ADA,SOL,DOT,LINK,UNI,AVAX,MATIC'
    
    console.log('🔍 Fetching live prices for symbols:', symbols)

    // First, try to get recent data from database (less than 2 minutes old)
    const { data: cachedPrices, error: cacheError } = await supabase
      .from('crypto_prices')
      .select('*')
      .in('symbol', symbols.toLowerCase().split(','))
      .gte('updated_at', new Date(Date.now() - 2 * 60 * 1000).toISOString())

    if (!cacheError && cachedPrices && cachedPrices.length > 0) {
      console.log('✅ Using cached prices from database:', cachedPrices.length, 'symbols')
      
      // Format cached data for frontend compatibility
      const formattedData = cachedPrices.reduce((acc, coin) => {
        acc[coin.symbol] = {
          usd: coin.price,
          usd_24h_change: coin.price_change_percentage_24h,
          usd_market_cap: coin.market_cap,
          usd_24h_vol: coin.volume_24h
        }
        return acc
      }, {} as Record<string, any>)

      return new Response(JSON.stringify({
        success: true,
        data: formattedData,
        cached: true,
        timestamp: new Date().toISOString(),
        source: 'database'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // If no cached data, fetch from CoinMarketCap
    console.log('🌐 Fetching fresh data from CoinMarketCap API...')
    
    const cmcResponse = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}&convert=USD`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': Deno.env.get('COINMARKETCAP_API_KEY') ?? '',
          'Accept': 'application/json'
        }
      }
    )

    if (!cmcResponse.ok) {
      throw new Error(`CoinMarketCap API error: ${cmcResponse.status}`)
    }

    const cmcData = await cmcResponse.json()
    console.log('✅ Fresh data fetched from CoinMarketCap')

    // Transform and store in database
    const cryptoPrices = Object.values(cmcData.data).map((coin: any) => ({
      symbol: coin.symbol.toLowerCase(),
      name: coin.name,
      price: coin.quote.USD.price,
      price_change_24h: coin.quote.USD.change_24h,
      price_change_percentage_24h: coin.quote.USD.percent_change_24h,
      market_cap: coin.quote.USD.market_cap,
      market_cap_rank: coin.cmc_rank,
      volume_24h: coin.quote.USD.volume_24h,
      circulating_supply: coin.circulating_supply,
      total_supply: coin.total_supply,
      max_supply: coin.max_supply,
      updated_at: new Date().toISOString()
    }))

    // Store in database
    const { error: insertError } = await supabase
      .from('crypto_prices')
      .upsert(cryptoPrices, { 
        onConflict: 'symbol',
        ignoreDuplicates: false 
      })

    if (insertError) {
      console.warn('⚠️ Database insert warning:', insertError)
    }

    // Format data for frontend compatibility
    const formattedData = cryptoPrices.reduce((acc, coin) => {
      acc[coin.symbol] = {
        usd: coin.price,
        usd_24h_change: coin.price_change_percentage_24h,
        usd_market_cap: coin.market_cap,
        usd_24h_vol: coin.volume_24h
      }
      return acc
    }, {} as Record<string, any>)

    return new Response(JSON.stringify({
      success: true,
      data: formattedData,
      cached: false,
      timestamp: new Date().toISOString(),
      source: 'coinmarketcap'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Live prices function error:', error)

    // Return fallback data in the expected format
    const fallbackData = {
      bitcoin: {
        usd: 43250.50,
        usd_24h_change: 2.98,
        usd_market_cap: 847500000000,
        usd_24h_vol: 28500000000
      },
      ethereum: {
        usd: 2650.75,
        usd_24h_change: 3.32,
        usd_market_cap: 318750000000,
        usd_24h_vol: 15200000000
      },
      binancecoin: {
        usd: 315.20,
        usd_24h_change: 1.85,
        usd_market_cap: 47280000000,
        usd_24h_vol: 1200000000
      },
      cardano: {
        usd: 0.52,
        usd_24h_change: 4.12,
        usd_market_cap: 18200000000,
        usd_24h_vol: 850000000
      },
      solana: {
        usd: 98.45,
        usd_24h_change: 5.67,
        usd_market_cap: 43500000000,
        usd_24h_vol: 2100000000
      },
      polkadot: {
        usd: 7.85,
        usd_24h_change: 2.34,
        usd_market_cap: 9800000000,
        usd_24h_vol: 420000000
      },
      chainlink: {
        usd: 15.67,
        usd_24h_change: 3.45,
        usd_market_cap: 9200000000,
        usd_24h_vol: 680000000
      },
      uniswap: {
        usd: 8.92,
        usd_24h_change: 1.23,
        usd_market_cap: 5400000000,
        usd_24h_vol: 320000000
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: fallbackData,
      cached: true,
      timestamp: new Date().toISOString(),
      note: 'Using fallback data due to API error',
      error: error.message
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
