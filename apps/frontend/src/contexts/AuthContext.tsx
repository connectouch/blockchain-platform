/**
 * Authentication Context using Supabase Auth
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data: any; error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>
  signInWithGoogle: () => Promise<{ data: any; error: AuthError | null }>
  signInWithGitHub: () => Promise<{ data: any; error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ data: any; error: AuthError | null }>
  updateProfile: (updates: any) => Promise<{ data: any; error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    console.warn('useAuth: AuthProvider not found, using fallback')
    // Return a fallback context instead of throwing
    return {
      user: null,
      session: null,
      loading: false,
      authError: null,
      signIn: async () => ({ data: null, error: { message: 'Auth not available' } }),
      signUp: async () => ({ data: null, error: { message: 'Auth not available' } }),
      signOut: async () => ({ error: { message: 'Auth not available' } }),
      signInWithGoogle: async () => ({ data: null, error: { message: 'Auth not available' } }),
      signInWithGitHub: async () => ({ data: null, error: { message: 'Auth not available' } }),
      resetPassword: async () => ({ data: null, error: { message: 'Auth not available' } }),
      updateProfile: async () => ({ data: null, error: { message: 'Auth not available' } })
    }
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session with enhanced error handling
    const getInitialSession = async () => {
      try {
        console.log('🔧 Initializing Supabase auth...')
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('❌ Error getting initial session:', error)
          setAuthError(`Auth initialization failed: ${error.message}`)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          setAuthError(null)
          console.log('✅ Initial session loaded:', session?.user?.email || 'No user')
        }
      } catch (error) {
        console.error('❌ Critical error in getInitialSession:', error)
        setAuthError(`Critical auth error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Don't crash the app - continue without auth
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes with error handling
    let subscription: any = null
    try {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          try {
            console.log('🔄 Auth state change:', event, session?.user?.email || 'No user')

            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
            setAuthError(null)

            // Handle specific auth events
            switch (event) {
              case 'SIGNED_IN':
                console.log('✅ User signed in:', session?.user?.email)
                // Initialize user profile if needed
                await initializeUserProfile(session?.user)
                break
              case 'SIGNED_OUT':
                console.log('👋 User signed out')
                break
              case 'TOKEN_REFRESHED':
                console.log('🔄 Token refreshed for:', session?.user?.email)
                break
              case 'USER_UPDATED':
                console.log('📝 User profile updated:', session?.user?.email)
                break
            }
          } catch (error) {
            console.error('❌ Error in auth state change handler:', error)
            setAuthError(`Auth state change error: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }
      )
      subscription = authSubscription
    } catch (error) {
      console.error('❌ Error setting up auth listener:', error)
      setAuthError(`Auth listener setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return () => {
      try {
        subscription?.unsubscribe()
      } catch (error) {
        console.error('❌ Error unsubscribing from auth:', error)
      }
    }
  }, [])

  // Initialize user profile in database
  const initializeUserProfile = async (user: User | null | undefined) => {
    if (!user) return

    try {
      // Check if user profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            email: user.email,
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            avatar_url: user.user_metadata?.avatar_url || null,
            theme: 'dark',
            currency: 'USD',
            notifications_enabled: true,
            created_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('❌ Error creating user profile:', insertError)
        } else {
          console.log('✅ User profile created for:', user.email)
        }
      } else if (!fetchError) {
        console.log('✅ User profile already exists for:', user.email)
      } else {
        console.error('❌ Error checking user profile:', fetchError)
      }
    } catch (error) {
      console.error('❌ Error in initializeUserProfile:', error)
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      })

      if (error) {
        console.error('❌ Sign up error:', error)
      } else {
        console.log('✅ Sign up successful:', email)
      }

      return { data, error }
    } catch (error) {
      console.error('❌ Sign up exception:', error)
      return { data: null, error: error as AuthError }
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Sign in error:', error)
      } else {
        console.log('✅ Sign in successful:', email)
      }

      return { data, error }
    } catch (error) {
      console.error('❌ Sign in exception:', error)
      return { data: null, error: error as AuthError }
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      return { data, error }
    } catch (error) {
      console.error('❌ Google sign in exception:', error)
      return { data: null, error: error as AuthError }
    }
  }

  // Sign in with GitHub
  const signInWithGitHub = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      return { data, error }
    } catch (error) {
      console.error('❌ GitHub sign in exception:', error)
      return { data: null, error: error as AuthError }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('❌ Sign out error:', error)
      } else {
        console.log('✅ Sign out successful')
      }

      return { error }
    } catch (error) {
      console.error('❌ Sign out exception:', error)
      return { error: error as AuthError }
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      return { data, error }
    } catch (error) {
      console.error('❌ Reset password exception:', error)
      return { data: null, error: error as AuthError }
    }
  }

  // Update user profile
  const updateProfile = async (updates: any) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      })

      if (!error && user) {
        // Also update user_preferences table
        await supabase
          .from('user_preferences')
          .update({
            display_name: updates.display_name,
            avatar_url: updates.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      }

      return { data, error }
    } catch (error) {
      console.error('❌ Update profile exception:', error)
      return { data: null, error: error as AuthError }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    resetPassword,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
