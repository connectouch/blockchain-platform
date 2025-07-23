import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
  Server
} from 'lucide-react'

interface SystemDiagnosticsProps {
  className?: string
}

interface DiagnosticResult {
  name: string
  status: 'success' | 'warning' | 'error' | 'loading'
  message: string
  details?: string
}

const SystemDiagnostics: React.FC<SystemDiagnosticsProps> = ({ className = '' }) => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    setDiagnostics([])

    const tests = [
      {
        name: 'Frontend Application',
        test: async () => {
          try {
            const response = await fetch('http://localhost:5173')
            if (response.ok) {
              return { status: 'success' as const, message: 'Frontend accessible', details: `Status: ${response.status}` }
            } else {
              return { status: 'error' as const, message: 'Frontend not responding', details: `Status: ${response.status}` }
            }
          } catch (error) {
            return { status: 'error' as const, message: 'Frontend connection failed', details: String(error) }
          }
        }
      },
      {
        name: 'Backend API Health',
        test: async () => {
          try {
            const response = await fetch('http://localhost:3002/health')
            if (response.ok) {
              const data = await response.json()
              return { status: 'success' as const, message: 'Backend API healthy', details: `Server: ${data.server}, Uptime: ${data.uptime}` }
            } else {
              return { status: 'error' as const, message: 'Backend API unhealthy', details: `Status: ${response.status}` }
            }
          } catch (error) {
            return { status: 'error' as const, message: 'Backend API connection failed', details: String(error) }
          }
        }
      },
      {
        name: 'Chart Data API',
        test: async () => {
          try {
            const response = await fetch('http://localhost:3002/api/v2/blockchain/chart/BTC?limit=3')
            if (response.ok) {
              const data = await response.json()
              const candleCount = data.data?.candlesticks?.length || 0
              return { status: 'success' as const, message: 'Chart data available', details: `${candleCount} candlesticks loaded` }
            } else {
              return { status: 'error' as const, message: 'Chart data API failed', details: `Status: ${response.status}` }
            }
          } catch (error) {
            return { status: 'error' as const, message: 'Chart data API connection failed', details: String(error) }
          }
        }
      },
      {
        name: 'WebSocket Service',
        test: async () => {
          try {
            const response = await fetch('http://localhost:3002/api/v2/websocket/stats')
            if (response.ok) {
              const data = await response.json()
              const clients = data.data?.totalClients || 0
              const subscriptions = data.data?.activeSubscriptions || 0
              return { status: 'success' as const, message: 'WebSocket service operational', details: `${clients} clients, ${subscriptions} subscriptions` }
            } else {
              return { status: 'error' as const, message: 'WebSocket service failed', details: `Status: ${response.status}` }
            }
          } catch (error) {
            return { status: 'error' as const, message: 'WebSocket service connection failed', details: String(error) }
          }
        }
      },
      {
        name: 'Real-time WebSocket Connection',
        test: async () => {
          return new Promise<DiagnosticResult>((resolve) => {
            try {
              const ws = new WebSocket('ws://localhost:3002')
              let messageReceived = false
              
              const timeout = setTimeout(() => {
                if (!messageReceived) {
                  ws.close()
                  resolve({ name: 'Real-time WebSocket Connection', status: 'warning', message: 'WebSocket connects but no data received', details: 'Connection timeout after 5 seconds' })
                }
              }, 5000)

              ws.onopen = () => {
                console.log('WebSocket diagnostic connection opened')
                ws.send(JSON.stringify({ type: 'subscribe', channel: 'prices' }))
              }

              ws.onmessage = (event) => {
                messageReceived = true
                clearTimeout(timeout)
                ws.close()
                try {
                  const data = JSON.parse(event.data)
                  resolve({ name: 'Real-time WebSocket Connection', status: 'success', message: 'Real-time WebSocket working', details: `Received: ${data.type || 'data'}` })
                } catch {
                  resolve({ name: 'Real-time WebSocket Connection', status: 'success', message: 'Real-time WebSocket working', details: 'Data received successfully' })
                }
              }

              ws.onerror = (error) => {
                clearTimeout(timeout)
                resolve({ name: 'Real-time WebSocket Connection', status: 'error', message: 'WebSocket connection error', details: String(error) })
              }

              ws.onclose = () => {
                if (!messageReceived) {
                  clearTimeout(timeout)
                  resolve({ name: 'Real-time WebSocket Connection', status: 'warning', message: 'WebSocket connection closed', details: 'Connection closed without receiving data' })
                }
              }
            } catch (error) {
              resolve({ name: 'Real-time WebSocket Connection', status: 'error', message: 'WebSocket creation failed', details: String(error) })
            }
          })
        }
      }
    ]

    for (const test of tests) {
      // Add loading state
      setDiagnostics(prev => [...prev, { name: test.name, status: 'loading', message: 'Testing...' }])
      
      try {
        const result = await test.test()
        setDiagnostics(prev => prev.map(d => 
          d.name === test.name ? { name: test.name, ...result } : d
        ))
      } catch (error) {
        setDiagnostics(prev => prev.map(d => 
          d.name === test.name ? { 
            name: test.name, 
            status: 'error', 
            message: 'Test failed', 
            details: String(error) 
          } : d
        ))
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'loading':
        return <Activity className="w-5 h-5 text-blue-400 animate-spin" />
    }
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'error':
        return 'text-red-400'
      case 'loading':
        return 'text-blue-400'
    }
  }

  const successCount = diagnostics.filter(d => d.status === 'success').length
  const totalCount = diagnostics.length
  const healthPercentage = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0

  return (
    <div className={`p-6 bg-black/20 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Server className="w-5 h-5" />
          System Diagnostics
        </h3>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
        >
          {isRunning ? 'Running...' : 'Run Tests'}
        </button>
      </div>

      {/* Health Score */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80">System Health Score</span>
          <span className={`text-xl font-bold ${
            healthPercentage >= 90 ? 'text-green-400' :
            healthPercentage >= 70 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {healthPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${
              healthPercentage >= 90 ? 'bg-green-400' :
              healthPercentage >= 70 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${healthPercentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>

      {/* Diagnostic Results */}
      <div className="space-y-3">
        {diagnostics.map((diagnostic, index) => (
          <motion.div
            key={diagnostic.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
          >
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(diagnostic.status)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">{diagnostic.name}</h4>
                <span className={`text-sm ${getStatusColor(diagnostic.status)}`}>
                  {diagnostic.status.toUpperCase()}
                </span>
              </div>
              <p className="text-white/70 text-sm mt-1">{diagnostic.message}</p>
              {diagnostic.details && (
                <p className="text-white/50 text-xs mt-1">{diagnostic.details}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      {!isRunning && diagnostics.length > 0 && (
        <div className="mt-6 p-4 bg-white/5 rounded-lg">
          <h4 className="font-medium text-white mb-2">Summary</h4>
          <div className="text-sm text-white/70">
            {successCount === totalCount ? (
              <span className="text-green-400">✅ All systems operational! Trading charts and WebSocket features are fully functional.</span>
            ) : (
              <span className="text-yellow-400">⚠️ Some issues detected. Check the failed tests above for details.</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SystemDiagnostics
