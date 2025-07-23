import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, Activity, AlertCircle, CheckCircle } from 'lucide-react'

interface WebSocketTesterProps {
  className?: string
}

interface ConnectionStatus {
  connected: boolean
  lastMessage: string
  messageCount: number
  error: string | null
}

interface PriceData {
  symbol: string
  price: number
  change24h: number
  timestamp: number
}

const WebSocketTester: React.FC<WebSocketTesterProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    lastMessage: '',
    messageCount: 0,
    error: null
  })
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    // Test WebSocket connection
    const testWebSocket = () => {
      try {
        // Use dynamic URL for better portability (works in both web and desktop)
        const wsUrl = typeof window !== 'undefined'
          ? `ws://${window.location.hostname}:3002`
          : 'ws://localhost:3002'
        const ws = new WebSocket(wsUrl)
        
        ws.onopen = () => {
          console.log('✅ WebSocket connected successfully')
          setStatus(prev => ({
            ...prev,
            connected: true,
            error: null,
            lastMessage: 'Connected to WebSocket server'
          }))
          
          // Subscribe to price updates
          ws.send(JSON.stringify({
            type: 'subscribe',
            channel: 'prices'
          }))
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('📊 Received WebSocket message:', data)
            
            setStatus(prev => ({
              ...prev,
              lastMessage: `Received: ${data.type || 'unknown'}`,
              messageCount: prev.messageCount + 1
            }))

            // Handle price updates
            if (data.type === 'price_update' && data.data) {
              setPriceData(prev => {
                const existing = prev.find(p => p.symbol === data.data.symbol)
                if (existing) {
                  return prev.map(p => 
                    p.symbol === data.data.symbol 
                      ? { ...data.data, timestamp: Date.now() }
                      : p
                  )
                } else {
                  return [...prev, { ...data.data, timestamp: Date.now() }].slice(-10)
                }
              })
            }
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error)
          }
        }

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error)
          setStatus(prev => ({
            ...prev,
            connected: false,
            error: 'WebSocket connection error'
          }))
        }

        ws.onclose = () => {
          console.log('🔌 WebSocket connection closed')
          setStatus(prev => ({
            ...prev,
            connected: false,
            lastMessage: 'Connection closed'
          }))
        }

        setSocket(ws)
      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error)
        setStatus(prev => ({
          ...prev,
          connected: false,
          error: `Failed to connect: ${error}`
        }))
      }
    }

    testWebSocket()

    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [])

  return (
    <div className={`p-6 bg-black/20 rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        WebSocket Connection Tester
      </h3>

      {/* Connection Status */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {status.connected ? (
            <Wifi className="w-5 h-5 text-green-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-400" />
          )}
          <span className={`font-medium ${status.connected ? 'text-green-400' : 'text-red-400'}`}>
            {status.connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div className="text-sm text-white/60 mb-2">
          Last Message: {status.lastMessage || 'No messages yet'}
        </div>
        
        <div className="text-sm text-white/60 mb-2">
          Messages Received: {status.messageCount}
        </div>

        {status.error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {status.error}
          </div>
        )}
      </div>

      {/* Live Price Data */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-white mb-3">Live Price Updates</h4>
        {priceData.length > 0 ? (
          <div className="space-y-2">
            {priceData.map((price) => (
              <motion.div
                key={`${price.symbol}-${price.timestamp}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-white">{price.symbol}</span>
                  <span className="text-2xl font-bold text-white">
                    ${price.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={`flex items-center gap-1 ${price.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <span>{price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-white/60 text-center py-4">
            {status.connected ? 'Waiting for price data...' : 'Connect to see live prices'}
          </div>
        )}
      </div>

      {/* Connection Test Results */}
      <div className="border-t border-white/10 pt-4">
        <h4 className="text-md font-medium text-white mb-3">Connection Test Results</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            {status.connected ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-white/80">WebSocket Connection</span>
          </div>
          
          <div className="flex items-center gap-2">
            {status.messageCount > 0 ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-400" />
            )}
            <span className="text-white/80">Message Reception</span>
          </div>
          
          <div className="flex items-center gap-2">
            {priceData.length > 0 ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-400" />
            )}
            <span className="text-white/80">Price Data Updates</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WebSocketTester
