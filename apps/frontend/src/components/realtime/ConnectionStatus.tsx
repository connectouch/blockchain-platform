/**
 * Real-time Connection Status Component
 * Shows the current status of real-time connections and data freshness
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, Activity, Clock, Database, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useRealTimePrices, useRealTimeMarketData } from '../../hooks/useRealTimeData'

interface ConnectionStatusProps {
  className?: string
  showDetails?: boolean
}

interface ConnectionState {
  supabase: 'connected' | 'connecting' | 'disconnected'
  prices: 'fresh' | 'stale' | 'error'
  lastUpdate: Date | null
  subscriptions: number
}

export function ConnectionStatus({ className = '', showDetails = false }: ConnectionStatusProps) {
  const { isLoading: pricesLoading, error: pricesError } = useRealTimePrices()
  const { isConnected: marketConnected } = useRealTimeMarketData()
  
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    supabase: 'connecting',
    prices: 'stale',
    lastUpdate: null,
    subscriptions: 0
  })
  
  const [isExpanded, setIsExpanded] = useState(false)

  // Monitor Supabase connection status
  useEffect(() => {
    let subscriptionCount = 0

    // Check initial connection
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('system_health').select('*').limit(1)
        
        setConnectionState(prev => ({
          ...prev,
          supabase: error ? 'disconnected' : 'connected',
          lastUpdate: new Date()
        }))
      } catch (err) {
        setConnectionState(prev => ({
          ...prev,
          supabase: 'disconnected'
        }))
      }
    }

    checkConnection()

    // Monitor real-time subscriptions
    const channel = supabase.channel('connection_monitor')
    
    channel.on('system', { event: 'SUBSCRIBED' }, () => {
      subscriptionCount++
      setConnectionState(prev => ({
        ...prev,
        subscriptions: subscriptionCount,
        supabase: 'connected'
      }))
    })

    channel.on('system', { event: 'CLOSED' }, () => {
      setConnectionState(prev => ({
        ...prev,
        supabase: 'disconnected'
      }))
    })

    channel.subscribe()

    // Periodic connection check
    const interval = setInterval(checkConnection, 30000)

    return () => {
      channel.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  // Update prices status based on loading and error states
  useEffect(() => {
    if (pricesError) {
      setConnectionState(prev => ({ ...prev, prices: 'error' }))
    } else if (!pricesLoading) {
      setConnectionState(prev => ({ 
        ...prev, 
        prices: 'fresh',
        lastUpdate: new Date()
      }))
    }
  }, [pricesLoading, pricesError])

  const getStatusColor = () => {
    if (connectionState.supabase === 'disconnected' || connectionState.prices === 'error') {
      return 'text-red-400'
    }
    if (connectionState.supabase === 'connecting' || connectionState.prices === 'stale') {
      return 'text-yellow-400'
    }
    return 'text-green-400'
  }

  const getStatusIcon = () => {
    if (connectionState.supabase === 'disconnected' || connectionState.prices === 'error') {
      return <WifiOff className="w-4 h-4" />
    }
    if (connectionState.supabase === 'connecting') {
      return <Activity className="w-4 h-4 animate-pulse" />
    }
    return <Wifi className="w-4 h-4" />
  }

  const getStatusText = () => {
    if (connectionState.supabase === 'disconnected') return 'Offline'
    if (connectionState.supabase === 'connecting') return 'Connecting'
    if (connectionState.prices === 'error') return 'Data Error'
    if (connectionState.prices === 'stale') return 'Updating'
    return 'Live'
  }

  const formatLastUpdate = () => {
    if (!connectionState.lastUpdate) return 'Never'
    
    const now = new Date()
    const diff = now.getTime() - connectionState.lastUpdate.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    
    if (seconds < 60) return `${seconds}s ago`
    if (minutes < 60) return `${minutes}m ago`
    return connectionState.lastUpdate.toLocaleTimeString()
  }

  return (
    <div className={`${className}`}>
      <motion.button
        onClick={() => showDetails && setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
          showDetails ? 'hover:bg-gray-700/50 cursor-pointer' : 'cursor-default'
        }`}
        whileHover={showDetails ? { scale: 1.02 } : {}}
        whileTap={showDetails ? { scale: 0.98 } : {}}
      >
        <motion.div
          animate={{ rotate: connectionState.supabase === 'connecting' ? 360 : 0 }}
          transition={{ duration: 2, repeat: connectionState.supabase === 'connecting' ? Infinity : 0 }}
          className={getStatusColor()}
        >
          {getStatusIcon()}
        </motion.div>
        
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        
        {connectionState.prices === 'fresh' && (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-green-400 rounded-full"
          />
        )}
      </motion.button>

      {/* Detailed Status Panel */}
      {showDetails && isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 p-4"
        >
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Connection Status
          </h3>
          
          <div className="space-y-3">
            {/* Supabase Connection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionState.supabase === 'connected' ? 'bg-green-400' :
                  connectionState.supabase === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <span className="text-gray-300 text-sm">Database</span>
              </div>
              <span className={`text-sm font-medium ${
                connectionState.supabase === 'connected' ? 'text-green-400' :
                connectionState.supabase === 'connecting' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {connectionState.supabase === 'connected' ? 'Connected' :
                 connectionState.supabase === 'connecting' ? 'Connecting' : 'Disconnected'}
              </span>
            </div>

            {/* Price Data Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionState.prices === 'fresh' ? 'bg-green-400' :
                  connectionState.prices === 'stale' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <span className="text-gray-300 text-sm">Price Data</span>
              </div>
              <span className={`text-sm font-medium ${
                connectionState.prices === 'fresh' ? 'text-green-400' :
                connectionState.prices === 'stale' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {connectionState.prices === 'fresh' ? 'Fresh' :
                 connectionState.prices === 'stale' ? 'Updating' : 'Error'}
              </span>
            </div>

            {/* Market Data Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  marketConnected ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-gray-300 text-sm">Market Data</span>
              </div>
              <span className={`text-sm font-medium ${
                marketConnected ? 'text-green-400' : 'text-red-400'
              }`}>
                {marketConnected ? 'Live' : 'Offline'}
              </span>
            </div>

            {/* Subscriptions Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-blue-400" />
                <span className="text-gray-300 text-sm">Subscriptions</span>
              </div>
              <span className="text-blue-400 text-sm font-medium">
                {connectionState.subscriptions}
              </span>
            </div>

            {/* Last Update */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-gray-300 text-sm">Last Update</span>
              </div>
              <span className="text-gray-400 text-sm">
                {formatLastUpdate()}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
