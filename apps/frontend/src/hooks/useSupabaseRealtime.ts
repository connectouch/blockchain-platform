// Real-time hooks for Supabase subscriptions
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import SupabaseService from '../services/supabaseService'

// Real-time crypto prices hook
export const useRealtimeCryptoPrices = (symbols?: string[]) => {
  const [prices, setPrices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true)
      const data = await SupabaseService.getCryptoPrices(symbols)
      setPrices(data.data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices')
    } finally {
      setLoading(false)
    }
  }, [symbols])

  useEffect(() => {
    // Initial fetch
    fetchPrices()

    // Set up real-time subscription
    const subscription = SupabaseService.subscribeToCryptoPrices((payload) => {
      if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
        setPrices(prev => {
          const updated = [...prev]
          const index = updated.findIndex(p => p.symbol === payload.new.symbol)
          if (index >= 0) {
            updated[index] = payload.new
          } else {
            updated.push(payload.new)
          }
          return updated
        })
      }
    })

    // Refresh every 60 seconds
    const interval = setInterval(fetchPrices, 60000)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [fetchPrices])

  return { prices, loading, error, refetch: fetchPrices }
}

// Real-time system health hook
export const useRealtimeSystemHealth = () => {
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true)
      const data = await SupabaseService.getHealthCheck()
      setHealth(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchHealth()

    // Set up real-time subscription
    const subscription = SupabaseService.subscribeToSystemHealth((payload) => {
      if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
        setHealth((prev: any) => {
          if (!prev) return prev
          
          const updatedServices = [...(prev.services || [])]
          const index = updatedServices.findIndex(s => s.name === payload.new.service_name)
          
          const serviceUpdate = {
            name: payload.new.service_name,
            status: payload.new.status,
            responseTime: payload.new.response_time,
            error: payload.new.error_message
          }

          if (index >= 0) {
            updatedServices[index] = serviceUpdate
          } else {
            updatedServices.push(serviceUpdate)
          }

          return {
            ...prev,
            services: updatedServices,
            timestamp: new Date().toISOString()
          }
        })
      }
    })

    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [fetchHealth])

  return { health, loading, error, refetch: fetchHealth }
}

// Real-time portfolios hook
export const useRealtimePortfolios = () => {
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPortfolios = useCallback(async () => {
    try {
      setLoading(true)
      const data = await SupabaseService.getUserPortfolios()
      setPortfolios(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchPortfolios()

    // Set up real-time subscription
    const subscription = SupabaseService.subscribeToPortfolios((payload) => {
      if (payload.eventType === 'INSERT') {
        setPortfolios(prev => [...prev, payload.new])
      } else if (payload.eventType === 'UPDATE') {
        setPortfolios(prev => 
          prev.map(p => p.id === payload.new.id ? payload.new : p)
        )
      } else if (payload.eventType === 'DELETE') {
        setPortfolios(prev => 
          prev.filter(p => p.id !== payload.old.id)
        )
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchPortfolios])

  return { portfolios, loading, error, refetch: fetchPortfolios }
}

// Real-time DeFi protocols hook
export const useRealtimeDeFiProtocols = (chain?: string, category?: string) => {
  const [protocols, setProtocols] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProtocols = useCallback(async () => {
    try {
      setLoading(true)
      const data = await SupabaseService.getDeFiProtocols(chain, category)
      setProtocols(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch protocols')
    } finally {
      setLoading(false)
    }
  }, [chain, category])

  useEffect(() => {
    fetchProtocols()
  }, [fetchProtocols])

  return { protocols, loading, error, refetch: fetchProtocols }
}

// Real-time price alerts hook
export const useRealtimePriceAlerts = () => {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true)
      const data = await SupabaseService.getPriceAlerts()
      setAlerts(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts')
    } finally {
      setLoading(false)
    }
  }, [])

  const createAlert = useCallback(async (symbol: string, alertType: string, targetPrice?: number, percentageChange?: number) => {
    try {
      const newAlert = await SupabaseService.createPriceAlert(symbol, alertType, targetPrice, percentageChange)
      setAlerts(prev => [newAlert, ...prev])
      return newAlert
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  return { alerts, loading, error, refetch: fetchAlerts, createAlert }
}

// Authentication hook
export const useSupabaseAuth = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    return await SupabaseService.signIn(email, password)
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    return await SupabaseService.signUp(email, password)
  }, [])

  const signOut = useCallback(async () => {
    return await SupabaseService.signOut()
  }, [])

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  }
}

// AI Analysis hook
export const useAIAnalysis = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(async (type: string, data: any, prompt?: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await SupabaseService.getAIAnalysis(type, data, prompt)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getHistory = useCallback(async (type?: string) => {
    try {
      return await SupabaseService.getAIAnalysisHistory(type)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history')
      return []
    }
  }, [])

  return { analyze, getHistory, loading, error }
}
