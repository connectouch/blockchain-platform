// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aompecyfgnakkmldhidg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbXBlY3lmZ25ha2ttbGRoaWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzMwODYsImV4cCI6MjA2OTMwOTA4Nn0.SSbGerxCplUZd_ZJDCK3HrfHM_m0it2lExgKBv3bt9A'

console.log('🔧 Supabase Configuration:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  env: import.meta.env.MODE
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types (auto-generated from Supabase)
export interface Database {
  public: {
    Tables: {
      crypto_prices: {
        Row: {
          id: number
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
          last_updated: string
          created_at: string
        }
        Insert: {
          symbol: string
          name: string
          price: number
          price_change_24h?: number
          price_change_percentage_24h?: number
          market_cap?: number
          market_cap_rank?: number
          volume_24h?: number
          circulating_supply?: number
          total_supply?: number
          max_supply?: number
          ath?: number
          ath_change_percentage?: number
          ath_date?: string
          atl?: number
          atl_change_percentage?: number
          atl_date?: string
        }
        Update: {
          symbol?: string
          name?: string
          price?: number
          price_change_24h?: number
          price_change_percentage_24h?: number
          market_cap?: number
          market_cap_rank?: number
          volume_24h?: number
          circulating_supply?: number
          total_supply?: number
          max_supply?: number
          ath?: number
          ath_change_percentage?: number
          ath_date?: string
          atl?: number
          atl_change_percentage?: number
          atl_date?: string
        }
      }
      defi_protocols: {
        Row: {
          id: number
          name: string
          symbol: string
          tvl: number
          tvl_change_24h: number
          apy: number
          category: string
          chain: string
          token_address: string
          website_url: string
          description: string
          logo_url: string
          is_active: boolean
          last_updated: string
          created_at: string
        }
        Insert: {
          name: string
          symbol?: string
          tvl?: number
          tvl_change_24h?: number
          apy?: number
          category?: string
          chain?: string
          token_address?: string
          website_url?: string
          description?: string
          logo_url?: string
          is_active?: boolean
        }
        Update: {
          name?: string
          symbol?: string
          tvl?: number
          tvl_change_24h?: number
          apy?: number
          category?: string
          chain?: string
          token_address?: string
          website_url?: string
          description?: string
          logo_url?: string
          is_active?: boolean
        }
      }
      user_portfolios: {
        Row: {
          id: number
          user_id: string
          name: string
          description: string
          total_value: number
          total_value_change_24h: number
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          name: string
          description?: string
          total_value?: number
          total_value_change_24h?: number
          is_public?: boolean
        }
        Update: {
          name?: string
          description?: string
          total_value?: number
          total_value_change_24h?: number
          is_public?: boolean
        }
      }
      portfolio_holdings: {
        Row: {
          id: number
          portfolio_id: number
          symbol: string
          amount: number
          average_price: number
          current_price: number
          total_value: number
          profit_loss: number
          profit_loss_percentage: number
          wallet_address: string
          chain: string
          created_at: string
          updated_at: string
        }
        Insert: {
          portfolio_id: number
          symbol: string
          amount: number
          average_price?: number
          current_price?: number
          total_value?: number
          profit_loss?: number
          profit_loss_percentage?: number
          wallet_address?: string
          chain?: string
        }
        Update: {
          symbol?: string
          amount?: number
          average_price?: number
          current_price?: number
          total_value?: number
          profit_loss?: number
          profit_loss_percentage?: number
          wallet_address?: string
          chain?: string
        }
      }
      ai_analysis: {
        Row: {
          id: number
          user_id: string
          analysis_type: string
          input_data: any
          result: any
          confidence_score: number
          model_used: string
          processing_time_ms: number
          created_at: string
        }
        Insert: {
          user_id: string
          analysis_type: string
          input_data?: any
          result?: any
          confidence_score?: number
          model_used?: string
          processing_time_ms?: number
        }
        Update: {
          analysis_type?: string
          input_data?: any
          result?: any
          confidence_score?: number
          model_used?: string
          processing_time_ms?: number
        }
      }
      system_health: {
        Row: {
          id: number
          service_name: string
          status: 'healthy' | 'degraded' | 'down'
          response_time: number
          error_count: number
          error_message: string
          metadata: any
          last_check: string
          created_at: string
        }
        Insert: {
          service_name: string
          status: 'healthy' | 'degraded' | 'down'
          response_time?: number
          error_count?: number
          error_message?: string
          metadata?: any
        }
        Update: {
          service_name?: string
          status?: 'healthy' | 'degraded' | 'down'
          response_time?: number
          error_count?: number
          error_message?: string
          metadata?: any
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper functions for common operations
export const supabaseHelpers = {
  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  },

  // Sign up with email and password
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password })
  },

  // Sign out
  signOut: async () => {
    return await supabase.auth.signOut()
  },

  // Call Edge Function
  callFunction: async (functionName: string, data?: any) => {
    return await supabase.functions.invoke(functionName, {
      body: data
    })
  },

  // Subscribe to real-time changes
  subscribeToTable: (table: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe()
  }
}

// Real-time subscription helpers
export const subscribeToCryptoPrices = (callback: (prices: any) => void) => {
  return supabase
    .channel('crypto_prices_channel')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'crypto_prices' },
      (payload) => {
        console.log('🔄 Real-time crypto price update:', payload)
        callback(payload.new as any)
      }
    )
    .subscribe()
}

export const subscribeToDeFiProtocols = (callback: (protocols: any) => void) => {
  return supabase
    .channel('defi_protocols_channel')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'defi_protocols' },
      (payload) => {
        console.log('🔄 Real-time DeFi protocol update:', payload)
        callback(payload.new as any)
      }
    )
    .subscribe()
}

// Database query helpers
export const getCryptoPrices = async (limit: number = 50) => {
  const { data, error } = await supabase
    .from('crypto_prices')
    .select('*')
    .order('market_cap_rank', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('❌ Error fetching crypto prices:', error)
    throw error
  }

  return data || []
}

export const getDeFiProtocols = async (limit: number = 20) => {
  const { data, error } = await supabase
    .from('defi_protocols')
    .select('*')
    .order('tvl', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('❌ Error fetching DeFi protocols:', error)
    throw error
  }

  return data || []
}

export default supabase
