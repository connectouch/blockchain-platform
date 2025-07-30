/**
 * Portfolio Management Hook
 * Handles real user portfolio data with Supabase integration
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useRealTimePrices } from './useRealTimeData'

export interface PortfolioHolding {
  id: string
  user_id: string
  symbol: string
  name: string
  amount: number
  purchase_price: number
  purchase_date: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface PortfolioAsset {
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
  pnl: number
  pnlPercent: number
  type: 'crypto'
  isRealTime: boolean
}

export interface PortfolioSummary {
  totalValue: number
  totalPnl: number
  totalPnlPercent: number
  totalInvested: number
  bestPerformer: PortfolioAsset | null
  worstPerformer: PortfolioAsset | null
  assetCount: number
  lastUpdated: string
}

export function usePortfolio() {
  const { user } = useAuth()
  const { prices } = useRealTimePrices()
  
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([])
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's portfolio holdings from database
  const fetchHoldings = async () => {
    if (!user) {
      setHoldings([])
      setPortfolio([])
      setSummary(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setHoldings(data || [])
      console.log('✅ Portfolio holdings fetched:', data?.length || 0, 'holdings')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio')
      console.error('❌ Error fetching portfolio holdings:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate portfolio assets with real-time prices
  useEffect(() => {
    if (!holdings.length || !Object.keys(prices).length) {
      setPortfolio([])
      setSummary(null)
      return
    }

    const portfolioAssets: PortfolioAsset[] = holdings.map(holding => {
      const currentPrice = prices[holding.symbol.toLowerCase()]?.usd || holding.purchase_price
      const value = holding.amount * currentPrice
      const change24h = prices[holding.symbol.toLowerCase()]?.usd_24h_change || 0
      const pnl = (currentPrice - holding.purchase_price) * holding.amount
      const pnlPercent = holding.purchase_price > 0 ? ((currentPrice - holding.purchase_price) / holding.purchase_price) * 100 : 0

      return {
        id: holding.id,
        symbol: holding.symbol.toUpperCase(),
        name: holding.name,
        amount: holding.amount,
        currentPrice,
        purchasePrice: holding.purchase_price,
        value,
        change24h,
        changePercent: change24h,
        allocation: 0, // Will be calculated after all assets
        pnl,
        pnlPercent,
        type: 'crypto',
        isRealTime: !!prices[holding.symbol.toLowerCase()]
      }
    })

    // Calculate allocations
    const totalValue = portfolioAssets.reduce((sum, asset) => sum + asset.value, 0)
    const portfolioWithAllocations = portfolioAssets.map(asset => ({
      ...asset,
      allocation: totalValue > 0 ? (asset.value / totalValue) * 100 : 0
    }))

    // Calculate summary
    const totalInvested = holdings.reduce((sum, holding) => sum + (holding.amount * holding.purchase_price), 0)
    const totalPnl = portfolioWithAllocations.reduce((sum, asset) => sum + asset.pnl, 0)
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0

    const sortedByPnl = [...portfolioWithAllocations].sort((a, b) => b.pnlPercent - a.pnlPercent)
    const bestPerformer = sortedByPnl[0] || null
    const worstPerformer = sortedByPnl[sortedByPnl.length - 1] || null

    const portfolioSummary: PortfolioSummary = {
      totalValue,
      totalPnl,
      totalPnlPercent,
      totalInvested,
      bestPerformer,
      worstPerformer,
      assetCount: portfolioWithAllocations.length,
      lastUpdated: new Date().toISOString()
    }

    setPortfolio(portfolioWithAllocations)
    setSummary(portfolioSummary)

    console.log('✅ Portfolio calculated:', {
      assets: portfolioWithAllocations.length,
      totalValue: totalValue.toFixed(2),
      totalPnl: totalPnl.toFixed(2),
      totalPnlPercent: totalPnlPercent.toFixed(2)
    })
  }, [holdings, prices])

  // Add new holding
  const addHolding = async (
    symbol: string,
    name: string,
    amount: number,
    purchasePrice: number,
    purchaseDate?: string,
    notes?: string
  ) => {
    if (!user) {
      throw new Error('User must be logged in to add holdings')
    }

    try {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .insert({
          user_id: user.id,
          symbol: symbol.toLowerCase(),
          name,
          amount,
          purchase_price: purchasePrice,
          purchase_date: purchaseDate || new Date().toISOString(),
          notes: notes || null
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Refresh holdings
      await fetchHoldings()
      
      console.log('✅ Holding added:', symbol, amount)
      return data
    } catch (err) {
      console.error('❌ Error adding holding:', err)
      throw err
    }
  }

  // Update existing holding
  const updateHolding = async (
    holdingId: string,
    updates: {
      amount?: number
      purchase_price?: number
      purchase_date?: string
      notes?: string
    }
  ) => {
    if (!user) {
      throw new Error('User must be logged in to update holdings')
    }

    try {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', holdingId)
        .eq('user_id', user.id) // Security: ensure user owns the holding
        .select()
        .single()

      if (error) {
        throw error
      }

      // Refresh holdings
      await fetchHoldings()
      
      console.log('✅ Holding updated:', holdingId)
      return data
    } catch (err) {
      console.error('❌ Error updating holding:', err)
      throw err
    }
  }

  // Delete holding
  const deleteHolding = async (holdingId: string) => {
    if (!user) {
      throw new Error('User must be logged in to delete holdings')
    }

    try {
      const { error } = await supabase
        .from('portfolio_holdings')
        .delete()
        .eq('id', holdingId)
        .eq('user_id', user.id) // Security: ensure user owns the holding

      if (error) {
        throw error
      }

      // Refresh holdings
      await fetchHoldings()
      
      console.log('✅ Holding deleted:', holdingId)
      return true
    } catch (err) {
      console.error('❌ Error deleting holding:', err)
      throw err
    }
  }

  // Set up real-time subscription for portfolio changes
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('portfolio_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio_holdings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Real-time portfolio change:', payload.eventType)
          fetchHoldings() // Refresh holdings when changes occur
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  // Initial fetch when user changes
  useEffect(() => {
    fetchHoldings()
  }, [user])

  return {
    holdings,
    portfolio,
    summary,
    loading,
    error,
    addHolding,
    updateHolding,
    deleteHolding,
    refreshHoldings: fetchHoldings
  }
}
