import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  Zap, 
  Wifi, 
  WifiOff, 
  Clock, 
  Database, 
  Server, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Monitor,
  Cpu,
  HardDrive
} from 'lucide-react'

interface PerformanceMetrics {
  websocketLatency: number
  apiResponseTime: number
  dataFreshness: number
  memoryUsage: number
  cpuUsage: number
  networkSpeed: number
  errorRate: number
  uptime: number
  activeConnections: number
  cacheHitRate: number
  lastUpdated: Date
}

interface ConnectionHealth {
  websocket: 'healthy' | 'degraded' | 'offline'
  api: 'healthy' | 'degraded' | 'offline'
  database: 'healthy' | 'degraded' | 'offline'
  overall: 'healthy' | 'degraded' | 'offline'
}

const RealTimePerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    websocketLatency: 0,
    apiResponseTime: 0,
    dataFreshness: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkSpeed: 0,
    errorRate: 0,
    uptime: 0,
    activeConnections: 0,
    cacheHitRate: 0,
    lastUpdated: new Date()
  })
  
  const [connectionHealth, setConnectionHealth] = useState<ConnectionHealth>({
    websocket: 'healthy',
    api: 'healthy',
    database: 'healthy',
    overall: 'healthy'
  })
  
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [historicalData, setHistoricalData] = useState<PerformanceMetrics[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date>(new Date())

  // Simulate performance monitoring (in production, this would connect to real monitoring APIs)
  const collectMetrics = async (): Promise<PerformanceMetrics> => {
    const startTime = performance.now()
    
    try {
      // Test WebSocket latency
      const wsLatencyStart = performance.now()
      // Simulate WebSocket ping
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10))
      const websocketLatency = performance.now() - wsLatencyStart

      // Test API response time
      const apiStart = performance.now()
      try {
        await fetch('http://localhost:3002/api/v2/health', { 
          method: 'GET',
          timeout: 5000 
        } as any)
      } catch (error) {
        console.warn('Health check failed:', error)
      }
      const apiResponseTime = performance.now() - apiStart

      // Calculate data freshness (time since last real-time update)
      const dataFreshness = Math.random() * 30 // 0-30 seconds

      // Simulate system metrics
      const memoryUsage = 45 + Math.random() * 30 // 45-75%
      const cpuUsage = 20 + Math.random() * 40 // 20-60%
      const networkSpeed = 50 + Math.random() * 100 // 50-150 Mbps
      const errorRate = Math.random() * 2 // 0-2%
      const activeConnections = Math.floor(Math.random() * 100) + 50 // 50-150
      const cacheHitRate = 85 + Math.random() * 10 // 85-95%
      
      // Calculate uptime
      const uptime = (Date.now() - startTimeRef.current.getTime()) / 1000

      return {
        websocketLatency,
        apiResponseTime,
        dataFreshness,
        memoryUsage,
        cpuUsage,
        networkSpeed,
        errorRate,
        uptime,
        activeConnections,
        cacheHitRate,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Error collecting metrics:', error)
      return metrics // Return previous metrics on error
    }
  }

  // Determine connection health based on metrics
  const assessConnectionHealth = (metrics: PerformanceMetrics): ConnectionHealth => {
    const websocket = metrics.websocketLatency > 1000 ? 'offline' : 
                     metrics.websocketLatency > 500 ? 'degraded' : 'healthy'
    
    const api = metrics.apiResponseTime > 5000 ? 'offline' : 
                metrics.apiResponseTime > 2000 ? 'degraded' : 'healthy'
    
    const database = metrics.errorRate > 5 ? 'offline' : 
                     metrics.errorRate > 1 ? 'degraded' : 'healthy'
    
    const overall = [websocket, api, database].includes('offline') ? 'offline' :
                   [websocket, api, database].includes('degraded') ? 'degraded' : 'healthy'

    return { websocket, api, database, overall }
  }

  // Start monitoring
  useEffect(() => {
    if (isMonitoring) {
      const monitor = async () => {
        const newMetrics = await collectMetrics()
        setMetrics(newMetrics)
        setConnectionHealth(assessConnectionHealth(newMetrics))
        
        // Keep last 60 data points (5 minutes at 5-second intervals)
        setHistoricalData(prev => {
          const updated = [...prev, newMetrics]
          return updated.slice(-60)
        })
      }

      // Initial collection
      monitor()
      
      // Set up interval
      intervalRef.current = setInterval(monitor, 5000) // Every 5 seconds
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [isMonitoring])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-400 bg-green-400/20'
      case 'degraded': return 'text-yellow-400 bg-yellow-400/20'
      case 'offline': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'degraded': return <AlertTriangle className="w-4 h-4" />
      case 'offline': return <WifiOff className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Performance Monitor</h2>
          <p className="text-white/60">Real-time system performance and health metrics</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Overall Health Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${getHealthColor(connectionHealth.overall)}`}>
            {getHealthIcon(connectionHealth.overall)}
            <span>{connectionHealth.overall.toUpperCase()}</span>
          </div>

          {/* Monitoring Toggle */}
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isMonitoring 
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
            }`}
          >
            {isMonitoring ? <Activity className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            <span>{isMonitoring ? 'Monitoring' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Connection Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Wifi className="w-8 h-8 text-blue-400" />
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(connectionHealth.websocket)}`}>
              {connectionHealth.websocket}
            </div>
          </div>
          <p className="text-lg font-bold text-white">WebSocket</p>
          <p className="text-white/60 text-sm">{metrics.websocketLatency.toFixed(0)}ms latency</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Server className="w-8 h-8 text-green-400" />
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(connectionHealth.api)}`}>
              {connectionHealth.api}
            </div>
          </div>
          <p className="text-lg font-bold text-white">API Server</p>
          <p className="text-white/60 text-sm">{metrics.apiResponseTime.toFixed(0)}ms response</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Database className="w-8 h-8 text-purple-400" />
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(connectionHealth.database)}`}>
              {connectionHealth.database}
            </div>
          </div>
          <p className="text-lg font-bold text-white">Database</p>
          <p className="text-white/60 text-sm">{metrics.errorRate.toFixed(1)}% error rate</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <p className="text-lg font-bold text-white">Uptime</p>
          <p className="text-white/60 text-sm">{formatDuration(metrics.uptime)}</p>
        </motion.div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Performance Metrics
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Data Freshness</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  metrics.dataFreshness < 10 ? 'text-green-400' : 
                  metrics.dataFreshness < 20 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {metrics.dataFreshness.toFixed(1)}s
                </span>
                {metrics.dataFreshness < 30 && (
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/60">Memory Usage</span>
              <span className={`font-semibold ${
                metrics.memoryUsage < 60 ? 'text-green-400' : 
                metrics.memoryUsage < 80 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {metrics.memoryUsage.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/60">CPU Usage</span>
              <span className={`font-semibold ${
                metrics.cpuUsage < 50 ? 'text-green-400' : 
                metrics.cpuUsage < 70 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {metrics.cpuUsage.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/60">Network Speed</span>
              <span className="text-white font-semibold">
                {metrics.networkSpeed.toFixed(0)} Mbps
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/60">Active Connections</span>
              <span className="text-white font-semibold">
                {metrics.activeConnections}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/60">Cache Hit Rate</span>
              <span className={`font-semibold ${
                metrics.cacheHitRate > 90 ? 'text-green-400' : 
                metrics.cacheHitRate > 80 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {metrics.cacheHitRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-400" />
            System Health
          </h3>
          
          <div className="space-y-4">
            {/* WebSocket Health */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-blue-400" />
                <span className="text-white">WebSocket Connection</span>
              </div>
              <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(connectionHealth.websocket)}`}>
                {getHealthIcon(connectionHealth.websocket)}
                <span>{connectionHealth.websocket}</span>
              </div>
            </div>

            {/* API Health */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-green-400" />
                <span className="text-white">API Server</span>
              </div>
              <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(connectionHealth.api)}`}>
                {getHealthIcon(connectionHealth.api)}
                <span>{connectionHealth.api}</span>
              </div>
            </div>

            {/* Database Health */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-purple-400" />
                <span className="text-white">Database</span>
              </div>
              <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(connectionHealth.database)}`}>
                {getHealthIcon(connectionHealth.database)}
                <span>{connectionHealth.database}</span>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-semibold text-sm">Performance Summary</span>
              </div>
              <p className="text-white/80 text-sm">
                System is operating at {connectionHealth.overall === 'healthy' ? 'optimal' : connectionHealth.overall} performance. 
                Data freshness: {metrics.dataFreshness < 30 ? 'Excellent' : 'Needs attention'}.
                {metrics.errorRate < 1 && ' Low error rate maintained.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-white/40 text-sm">
        Last updated: {metrics.lastUpdated.toLocaleTimeString()} • 
        Monitoring {isMonitoring ? 'active' : 'paused'} • 
        {historicalData.length} data points collected
      </div>
    </div>
  )
}

export default RealTimePerformanceMonitor
