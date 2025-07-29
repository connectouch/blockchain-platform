import React, { useState, useEffect } from 'react'
import { Activity, AlertTriangle, CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react'

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  services: {
    backend: boolean
    database: boolean
    apis: boolean
    websocket: boolean
  }
  metrics: {
    responseTime: number
    uptime: number
    errorRate: number
    activeUsers: number
  }
  lastCheck: string
}

interface ProductionMonitorProps {
  isProduction?: boolean
  showDetails?: boolean
}

export const ProductionMonitor: React.FC<ProductionMonitorProps> = ({
  isProduction = false,
  showDetails = false
}) => {
  const [health, setHealth] = useState<SystemHealth>({
    status: 'healthy',
    services: {
      backend: true,
      database: true,
      apis: true,
      websocket: true
    },
    metrics: {
      responseTime: 0,
      uptime: 0,
      errorRate: 0,
      activeUsers: 0
    },
    lastCheck: new Date().toISOString()
  })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const startTime = Date.now()
        const response = await fetch('/health')
        const responseTime = Date.now() - startTime
        
        if (response.ok) {
          const data = await response.json()
          setHealth(prev => ({
            ...prev,
            status: 'healthy',
            metrics: {
              ...prev.metrics,
              responseTime
            },
            lastCheck: new Date().toISOString()
          }))
        } else {
          setHealth(prev => ({
            ...prev,
            status: 'degraded',
            lastCheck: new Date().toISOString()
          }))
        }
      } catch (error) {
        setHealth(prev => ({
          ...prev,
          status: 'down',
          lastCheck: new Date().toISOString()
        }))
      }
    }

    // Check health immediately and then every 30 seconds
    checkHealth()
    const interval = setInterval(checkHealth, 30000)

    // Monitor online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'degraded': return 'text-yellow-400'
      case 'down': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'degraded': return <AlertTriangle className="w-4 h-4" />
      case 'down': return <XCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  if (!isProduction && !showDetails) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
        {/* Compact Status Indicator */}
        <div 
          className="flex items-center gap-2 p-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className={`flex items-center gap-2 ${getStatusColor(health.status)}`}>
            {getStatusIcon(health.status)}
            <span className="text-sm font-medium">
              {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-400">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="border-t border-gray-700 p-3 space-y-3">
            {/* Services Status */}
            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-2">Services</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(health.services).map(([service, status]) => (
                  <div key={service} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-gray-300 capitalize">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-2">Metrics</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Response Time</span>
                  <span className="text-white">{health.metrics.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Error Rate</span>
                  <span className="text-white">{health.metrics.errorRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Network</span>
                  <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Last Check */}
            <div className="text-xs text-gray-500">
              Last check: {new Date(health.lastCheck).toLocaleTimeString()}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={() => setExpanded(false)}
                className="text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductionMonitor
