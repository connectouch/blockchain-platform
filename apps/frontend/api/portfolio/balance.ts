/**
 * Vercel Serverless Function: Portfolio Balance
 * Fetches user portfolio data from Supabase and external sources
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface PortfolioAsset {
  id: string
  symbol: string
  name: string
  amount: number
  currentPrice: number
  purchasePrice: number
  value: number
  change24h: number
  changePercent: number
  allocation: number
  type: 'crypto' | 'defi' | 'nft' | 'gamefi'
  chainId: number
  contractAddress?: string
  lastUpdated: string
}

interface PortfolioSummary {
  totalValue: number
  totalChange24h: number
  totalChangePercent: number
  totalPnL: number
  totalPnLPercent: number
  assetCount: number
  lastUpdated: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    return handleGetPortfolio(req, res)
  } else if (req.method === 'POST') {
    return handleUpdatePortfolio(req, res)
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function handleGetPortfolio(req: VercelRequest, res: VercelResponse) {
  const userId = req.query.userId as string
  const walletAddress = req.query.walletAddress as string
  const includeHistory = req.query.history === 'true'

  if (!userId && !walletAddress) {
    return res.status(400).json({
      success: false,
      error: 'User ID or wallet address required'
    })
  }

  try {
    console.log('🔍 Fetching portfolio balance for:', userId || walletAddress)

    // Fetch portfolio data from Supabase
    let portfolioQuery = supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_assets (
          id,
          symbol,
          name,
          amount,
          purchase_price,
          asset_type,
          chain_id,
          contract_address,
          created_at,
          updated_at
        )
      `)

    if (userId) {
      portfolioQuery = portfolioQuery.eq('user_id', userId)
    } else if (walletAddress) {
      portfolioQuery = portfolioQuery.eq('wallet_address', walletAddress)
    }

    const { data: portfolioData, error: portfolioError } = await portfolioQuery

    if (portfolioError) {
      throw new Error(`Portfolio fetch error: ${portfolioError.message}`)
    }

    if (!portfolioData || portfolioData.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          assets: [],
          summary: {
            totalValue: 0,
            totalChange24h: 0,
            totalChangePercent: 0,
            totalPnL: 0,
            totalPnLPercent: 0,
            assetCount: 0,
            lastUpdated: new Date().toISOString()
          }
        },
        message: 'No portfolio found'
      })
    }

    const portfolio = portfolioData[0]
    const assets = portfolio.portfolio_assets || []

    // Get current prices for all assets
    const symbols = assets.map((asset: any) => asset.symbol).join(',')
    let currentPrices: Record<string, any> = {}

    if (symbols) {
      try {
        // Fetch current prices from CoinMarketCap
        const priceResponse = await fetch(
          `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}`,
          {
            headers: {
              'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY || ''
            }
          }
        )

        if (priceResponse.ok) {
          const priceData = await priceResponse.json()
          currentPrices = priceData.data || {}
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch current prices, using cached data')
      }
    }

    // Calculate portfolio metrics
    const portfolioAssets: PortfolioAsset[] = assets.map((asset: any) => {
      const currentPriceData = currentPrices[asset.symbol]
      const currentPrice = currentPriceData?.quote?.USD?.price || asset.purchase_price || 0
      const change24h = currentPriceData?.quote?.USD?.percent_change_24h || 0
      
      const value = asset.amount * currentPrice
      const purchaseValue = asset.amount * (asset.purchase_price || 0)
      const pnl = value - purchaseValue
      const pnlPercent = purchaseValue > 0 ? (pnl / purchaseValue) * 100 : 0

      return {
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        amount: asset.amount,
        currentPrice,
        purchasePrice: asset.purchase_price || 0,
        value,
        change24h,
        changePercent: change24h,
        allocation: 0, // Will be calculated after total value
        type: asset.asset_type || 'crypto',
        chainId: asset.chain_id || 1,
        contractAddress: asset.contract_address,
        lastUpdated: currentPriceData?.last_updated || asset.updated_at
      }
    })

    // Calculate total portfolio value and allocations
    const totalValue = portfolioAssets.reduce((sum, asset) => sum + asset.value, 0)
    const totalPurchaseValue = portfolioAssets.reduce((sum, asset) => sum + (asset.amount * asset.purchasePrice), 0)
    const totalPnL = totalValue - totalPurchaseValue
    const totalPnLPercent = totalPurchaseValue > 0 ? (totalPnL / totalPurchaseValue) * 100 : 0

    // Calculate weighted 24h change
    const totalChange24h = portfolioAssets.reduce((sum, asset) => {
      const weight = totalValue > 0 ? asset.value / totalValue : 0
      return sum + (asset.changePercent * weight)
    }, 0)

    // Update allocations
    portfolioAssets.forEach(asset => {
      asset.allocation = totalValue > 0 ? (asset.value / totalValue) * 100 : 0
    })

    const summary: PortfolioSummary = {
      totalValue,
      totalChange24h: (totalValue * totalChange24h) / 100,
      totalChangePercent: totalChange24h,
      totalPnL,
      totalPnLPercent,
      assetCount: portfolioAssets.length,
      lastUpdated: new Date().toISOString()
    }

    // Include transaction history if requested
    let history = null
    if (includeHistory) {
      const { data: historyData } = await supabase
        .from('portfolio_transactions')
        .select('*')
        .eq('portfolio_id', portfolio.id)
        .order('created_at', { ascending: false })
        .limit(50)

      history = historyData || []
    }

    // Update portfolio last_updated timestamp
    await supabase
      .from('portfolios')
      .update({ 
        last_updated: new Date().toISOString(),
        total_value: totalValue 
      })
      .eq('id', portfolio.id)

    console.log('✅ Portfolio balance fetched successfully')

    return NextResponse.json({
      success: true,
      data: {
        portfolioId: portfolio.id,
        userId: portfolio.user_id,
        walletAddress: portfolio.wallet_address,
        assets: portfolioAssets,
        summary,
        history,
        metadata: {
          lastSynced: portfolio.last_updated,
          autoSync: portfolio.auto_sync || false,
          syncFrequency: portfolio.sync_frequency || '1h'
        }
      },
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300', // 1min cache
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })

  } catch (error) {
    console.error('❌ Portfolio balance API error:', error)

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch portfolio balance',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }
}

// Handle POST request to update portfolio
export async function POST(request: NextRequest) {
  try {
    const { userId, walletAddress, assets } = await request.json()

    if (!userId || !assets || !Array.isArray(assets)) {
      return NextResponse.json({
        success: false,
        error: 'User ID and assets array required'
      }, { status: 400 })
    }

    // Update or create portfolio
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .upsert({
        user_id: userId,
        wallet_address: walletAddress,
        last_updated: new Date().toISOString()
      })
      .select()
      .single()

    if (portfolioError) {
      throw new Error(`Portfolio upsert error: ${portfolioError.message}`)
    }

    // Update assets
    const assetPromises = assets.map((asset: any) => 
      supabase
        .from('portfolio_assets')
        .upsert({
          portfolio_id: portfolio.id,
          symbol: asset.symbol,
          name: asset.name,
          amount: asset.amount,
          purchase_price: asset.purchasePrice,
          asset_type: asset.type || 'crypto',
          chain_id: asset.chainId || 1,
          contract_address: asset.contractAddress,
          updated_at: new Date().toISOString()
        })
    )

    await Promise.all(assetPromises)

    return NextResponse.json({
      success: true,
      message: 'Portfolio updated successfully',
      portfolioId: portfolio.id,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Portfolio update API error:', error)

    return NextResponse.json({
      success: false,
      error: 'Failed to update portfolio',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
