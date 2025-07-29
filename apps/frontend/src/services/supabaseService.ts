// Supabase Service - Replaces direct API calls with Supabase Edge Functions
import { supabase, supabaseHelpers } from '../lib/supabase'

export class SupabaseService {
  // Crypto Prices
  static async getCryptoPrices(symbols?: string[], forceRefresh = false) {
    try {
      const { data, error } = await supabase.functions.invoke('crypto-prices', {
        body: {
          symbols: symbols?.join(',') || 'BTC,ETH,BNB,ADA,SOL,DOT,LINK,UNI,AVAX,MATIC',
          refresh: forceRefresh
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching crypto prices:', error)
      throw error
    }
  }

  // Health Check
  static async getHealthCheck() {
    try {
      const { data, error } = await supabase.functions.invoke('health-check')
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching health check:', error)
      throw error
    }
  }

  // AI Analysis
  static async getAIAnalysis(type: string, data: any, prompt?: string) {
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          type,
          data,
          prompt
        }
      })

      if (error) throw error
      return result
    } catch (error) {
      console.error('Error getting AI analysis:', error)
      throw error
    }
  }

  // Portfolio Management
  static async getUserPortfolios() {
    try {
      const { data, error } = await supabase
        .from('user_portfolios')
        .select(`
          *,
          portfolio_holdings (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching portfolios:', error)
      throw error
    }
  }

  static async createPortfolio(name: string, description?: string) {
    try {
      const user = await supabaseHelpers.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_portfolios')
        .insert({
          user_id: user.id,
          name,
          description
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating portfolio:', error)
      throw error
    }
  }

  static async addHolding(portfolioId: number, symbol: string, amount: number, averagePrice?: number) {
    try {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .insert({
          portfolio_id: portfolioId,
          symbol,
          amount,
          average_price: averagePrice
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding holding:', error)
      throw error
    }
  }

  // Real-time subscriptions
  static subscribeToCryptoPrices(callback: (data: any) => void) {
    return supabase
      .channel('crypto_prices_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'crypto_prices'
      }, callback)
      .subscribe()
  }

  static subscribeToSystemHealth(callback: (data: any) => void) {
    return supabase
      .channel('system_health_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'system_health'
      }, callback)
      .subscribe()
  }

  static subscribeToPortfolios(callback: (data: any) => void) {
    return supabase
      .channel('portfolio_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_portfolios'
      }, callback)
      .subscribe()
  }

  // DeFi Protocols (from database)
  static async getDeFiProtocols(chain?: string, category?: string) {
    try {
      let query = supabase
        .from('defi_protocols')
        .select('*')
        .eq('is_active', true)

      if (chain) {
        query = query.eq('chain', chain)
      }

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query.order('tvl', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching DeFi protocols:', error)
      throw error
    }
  }

  // NFT Collections (from database)
  static async getNFTCollections(chain?: string) {
    try {
      let query = supabase
        .from('nft_collections')
        .select('*')

      if (chain) {
        query = query.eq('chain', chain)
      }

      const { data, error } = await query.order('volume_24h', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching NFT collections:', error)
      throw error
    }
  }

  // User Preferences
  static async getUserPreferences() {
    try {
      const user = await supabaseHelpers.getCurrentUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
      return data
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      throw error
    }
  }

  static async updateUserPreferences(preferences: any) {
    try {
      const user = await supabaseHelpers.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw error
    }
  }

  // Price Alerts
  static async getPriceAlerts() {
    try {
      const user = await supabaseHelpers.getCurrentUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching price alerts:', error)
      throw error
    }
  }

  static async createPriceAlert(symbol: string, alertType: string, targetPrice?: number, percentageChange?: number) {
    try {
      const user = await supabaseHelpers.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('price_alerts')
        .insert({
          user_id: user.id,
          symbol,
          alert_type: alertType,
          target_price: targetPrice,
          percentage_change: percentageChange
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating price alert:', error)
      throw error
    }
  }

  // AI Analysis History
  static async getAIAnalysisHistory(type?: string) {
    try {
      const user = await supabaseHelpers.getCurrentUser()
      if (!user) return []

      let query = supabase
        .from('ai_analysis')
        .select('*')
        .eq('user_id', user.id)

      if (type) {
        query = query.eq('analysis_type', type)
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(50)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching AI analysis history:', error)
      throw error
    }
  }

  // Authentication helpers
  static async signIn(email: string, password: string) {
    return await supabaseHelpers.signIn(email, password)
  }

  static async signUp(email: string, password: string) {
    return await supabaseHelpers.signUp(email, password)
  }

  static async signOut() {
    return await supabaseHelpers.signOut()
  }

  static async getCurrentUser() {
    return await supabaseHelpers.getCurrentUser()
  }
}

export default SupabaseService
