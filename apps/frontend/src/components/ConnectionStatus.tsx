import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Database, 
  Zap, 
  AlertCircle, 
  CheckCircle,
  Clock,
  TrendingUp,
  Globe
} from 'lucide-react'

interface ConnectionStatusProps {
  isConnected: boolean
  dataSource: string
  lastUpdate: Date | null
  activeSources: number
  totalSources: number
  isRealTime: boolean
}

interface DataSourceStatus {
  name: string
  status: 'connected' | 'disconnected' | 'error' | 'loading'
  lastUpdate: Date | null
  responseTime: number
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  dataSource,
  lastUpdate,
  activeSources,
  totalSources,
  isRealTime
}) => {
  const [expanded, setExpanded] = useState(false)
  const [dataSources, setDataSources] = useState<DataSourceStatus[]>([
    { name: 'CoinMarketCap API', status: 'loading', lastUpdate: null, responseTime: 0 },
    { name: 'Alchemy API', status: 'loading', lastUpdate: null, responseTime: 0 },
    { name: 'DeFi Protocols', status: 'loading', lastUpdate: null, responseTime: 0 },
    { name: 'Real-time Data', status: 'loading', lastUpdate: null, responseTime: 0 }
  ])

  // Simulate real-time data source monitoring
  useEffect(() => {
    const checkDataSources = async () => {
      const updatedSources = await Promise.all(
        dataSources.map(async (source) => {
          const startTime = Date.now()
          try {
            let endpoint = ''
            switch (source.name) {
              case 'CoinMarketCap API':
                endpoint = '/api/v2/blockchain/prices/live'
                break
              case 'Alchemy API':
                endpoint = '/api/v2/blockchain/overview'
                break
              case 'DeFi Protocols':
                endpoint = '/api/v2/blockchain/defi/protocols'
                break
              case 'Real-time Data':
                // Check real-time connection status
                return {
                  ...source,
                  status: isConnected ? 'connected' : 'disconnected',
                  lastUpdate: isConnected ? new Date() : null,
                  responseTime: isConnected ? Math.random() * 100 + 50 : 0
                }
            }

            const response = await fetch(endpoint)
            const responseTime = Date.now() - startTime
            
            if (response.ok) {
              return {
                ...source,
                status: 'connected' as const,
                lastUpdate: new Date(),
                responseTime
              }
            } else {
              return {
                ...source,
                status: 'error' as const,
                lastUpdate: null,
                responseTime: 0
              }
            }
          } catch (error) {
            return {
              ...source,
              status: 'disconnected' as const,
              lastUpdate: null,
              responseTime: 0
            }
          }
        })
      )
      setDataSources(updatedSources as DataSourceStatus[])
    }

    checkDataSources()
    const interval = setInterval(checkDataSources, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [isConnected])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-400" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'loading':
        return <Clock className="w-4 h-4 text-blue-400 animate-spin" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    if (isConnected && isRealTime) return 'text-green-400'
    if (isConnected && !isRealTime) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusText = () => {
    if (isConnected && isRealTime) return 'Live'
    if (isConnected && !isRealTime) return 'Cached'
    return 'Offline'
  }

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <motion.div
        className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Activity className="w-5 h-5 text-green-400" />
              </motion.div>
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Database className="w-4 h-4" />
            <span>{activeSources}/{totalSources}</span>
          </div>

          {isRealTime && (
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-400">Real-time</span>
            </div>
          )}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-700"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Data Source:</span>
                  <span className="text-white">{dataSource}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Last Update:</span>
                  <span className="text-white">{formatTime(lastUpdate)}</span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-gray-400 font-medium">Data Sources:</div>
                  {dataSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(source.status)}
                        <span className="text-gray-300">{source.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        {source.responseTime > 0 && (
                          <span>{source.responseTime}ms</span>
                        )}
                        <span>{formatTime(source.lastUpdate)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Connection Quality:</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className={`w-1 h-3 rounded-full ${
                            bar <= (isConnected ? (isRealTime ? 4 : 2) : 0)
                              ? 'bg-green-400'
                              : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default ConnectionStatus
