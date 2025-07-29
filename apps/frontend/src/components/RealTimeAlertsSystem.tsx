import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  BellRing, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Plus,
  Settings,
  Wifi,
  WifiOff,
  Zap,
  Target,
  Activity,
  Clock
} from 'lucide-react'
import { useRealTimePrices, useRealTimeMarketData } from '../hooks/useRealTimeData'

interface PriceAlert {
  id: string
  symbol: string
  name: string
  type: 'above' | 'below' | 'change_percent'
  targetValue: number
  currentValue: number
  isActive: boolean
  isTriggered: boolean
  createdAt: Date
  triggeredAt?: Date
  message: string
}

interface AlertNotification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
}

const RealTimeAlertsSystem: React.FC = () => {
  const { prices, isLoading } = useRealTimePrices([
    'bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 'polkadot', 'chainlink', 'uniswap'
  ])
  const { marketData, isConnected } = useRealTimeMarketData()
  
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [notifications, setNotifications] = useState<AlertNotification[]>([])
  const [showCreateAlert, setShowCreateAlert] = useState(false)
  const [newAlert, setNewAlert] = useState({
    symbol: 'bitcoin',
    type: 'above' as 'above' | 'below' | 'change_percent',
    targetValue: 0
  })

  // Initialize with some sample alerts
  useEffect(() => {
    const sampleAlerts: PriceAlert[] = [
      {
        id: '1',
        symbol: 'bitcoin',
        name: 'Bitcoin',
        type: 'above',
        targetValue: 45000,
        currentValue: prices.bitcoin?.usd || 43000,
        isActive: true,
        isTriggered: false,
        createdAt: new Date(Date.now() - 86400000),
        message: 'Bitcoin price alert: Above $45,000'
      },
      {
        id: '2',
        symbol: 'ethereum',
        name: 'Ethereum',
        type: 'below',
        targetValue: 2500,
        currentValue: prices.ethereum?.usd || 2600,
        isActive: true,
        isTriggered: false,
        createdAt: new Date(Date.now() - 3600000),
        message: 'Ethereum price alert: Below $2,500'
      },
      {
        id: '3',
        symbol: 'solana',
        name: 'Solana',
        type: 'change_percent',
        targetValue: 10,
        currentValue: prices.solana?.usd_24h_change || 0,
        isActive: true,
        isTriggered: false,
        createdAt: new Date(Date.now() - 7200000),
        message: 'Solana change alert: 24h change > 10%'
      }
    ]
    setAlerts(sampleAlerts)
  }, [])

  // Check alerts against current prices
  useEffect(() => {
    if (Object.keys(prices).length === 0) return

    setAlerts(prevAlerts => 
      prevAlerts.map(alert => {
        let currentValue: number
        let shouldTrigger = false

        if (alert.type === 'change_percent') {
          currentValue = prices[alert.symbol]?.usd_24h_change || 0
          shouldTrigger = Math.abs(currentValue) >= alert.targetValue
        } else {
          currentValue = prices[alert.symbol]?.usd || 0
          shouldTrigger = alert.type === 'above' 
            ? currentValue >= alert.targetValue 
            : currentValue <= alert.targetValue
        }

        // Trigger alert if conditions are met and not already triggered
        if (shouldTrigger && alert.isActive && !alert.isTriggered) {
          const notification: AlertNotification = {
            id: `notif-${alert.id}-${Date.now()}`,
            type: alert.type === 'above' || (alert.type === 'change_percent' && currentValue > 0) ? 'success' : 'warning',
            title: `${alert.name} Alert Triggered!`,
            message: alert.message,
            timestamp: new Date(),
            isRead: false
          }

          setNotifications(prev => [notification, ...prev])

          return {
            ...alert,
            currentValue,
            isTriggered: true,
            triggeredAt: new Date()
          }
        }

        return {
          ...alert,
          currentValue
        }
      })
    )
  }, [prices])

  const createAlert = () => {
    if (!newAlert.targetValue) return

    const coinData = Object.entries(prices).find(([key]) => key === newAlert.symbol)
    if (!coinData) return

    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol,
      name: newAlert.symbol.charAt(0).toUpperCase() + newAlert.symbol.slice(1),
      type: newAlert.type,
      targetValue: newAlert.targetValue,
      currentValue: newAlert.type === 'change_percent' 
        ? coinData[1].usd_24h_change 
        : coinData[1].usd,
      isActive: true,
      isTriggered: false,
      createdAt: new Date(),
      message: `${newAlert.symbol} ${newAlert.type} ${newAlert.targetValue}${newAlert.type === 'change_percent' ? '%' : ''}`
    }

    setAlerts(prev => [...prev, alert])
    setNewAlert({ symbol: 'bitcoin', type: 'above', targetValue: 0 })
    setShowCreateAlert(false)
  }

  const toggleAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id 
          ? { ...alert, isActive: !alert.isActive, isTriggered: false }
          : alert
      )
    )
  }

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    )
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toFixed(0)}`
    if (price >= 1) return `$${price.toFixed(2)}`
    return `$${price.toFixed(6)}`
  }

  const getAlertIcon = (alert: PriceAlert) => {
    if (alert.isTriggered) return <CheckCircle className="w-5 h-5 text-green-400" />
    if (!alert.isActive) return <XCircle className="w-5 h-5 text-gray-400" />
    
    switch (alert.type) {
      case 'above': return <TrendingUp className="w-5 h-5 text-blue-400" />
      case 'below': return <TrendingDown className="w-5 h-5 text-red-400" />
      case 'change_percent': return <Activity className="w-5 h-5 text-yellow-400" />
      default: return <Bell className="w-5 h-5 text-gray-400" />
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />
      default: return <Bell className="w-5 h-5 text-blue-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Real-Time Alerts</h2>
          <p className="text-white/60">Price alerts and notifications system</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Live Monitoring</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Notifications Badge */}
          <div className="relative">
            <Bell className="w-6 h-6 text-white/60" />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                {unreadCount}
              </div>
            )}
          </div>

          {/* Create Alert Button */}
          <button
            onClick={() => setShowCreateAlert(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Alert</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Active Alerts ({alerts.filter(a => a.isActive).length})
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border transition-colors ${
                    alert.isTriggered 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : alert.isActive 
                        ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                        : 'bg-gray-500/10 border-gray-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert)}
                      <div>
                        <h4 className="text-white font-semibold">{alert.name}</h4>
                        <p className="text-white/60 text-sm">
                          {alert.type === 'change_percent' 
                            ? `24h change ${alert.type === 'change_percent' ? '>' : alert.type} ${alert.targetValue}%`
                            : `Price ${alert.type} ${formatPrice(alert.targetValue)}`
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAlert(alert.id)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          alert.isActive 
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                        }`}
                      >
                        {alert.isActive ? 'Active' : 'Paused'}
                      </button>
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-white/60">
                      Current: {alert.type === 'change_percent' 
                        ? `${alert.currentValue.toFixed(2)}%` 
                        : formatPrice(alert.currentValue)
                      }
                    </span>
                    <span className="text-white/40">
                      {alert.isTriggered 
                        ? `Triggered ${alert.triggeredAt?.toLocaleTimeString()}`
                        : `Created ${alert.createdAt.toLocaleDateString()}`
                      }
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {alerts.length === 0 && (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60 mb-2">No alerts created</p>
              <p className="text-white/40 text-sm">Create your first price alert to get started</p>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-yellow-400" />
            Recent Notifications ({notifications.length})
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => markNotificationAsRead(notification.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    notification.isRead 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{notification.title}</h4>
                      <p className="text-white/60 text-sm mt-1">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                        <Clock className="w-3 h-3" />
                        <span>{notification.timestamp.toLocaleTimeString()}</span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {notifications.length === 0 && (
            <div className="text-center py-8">
              <BellRing className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60 mb-2">No notifications</p>
              <p className="text-white/40 text-sm">Alert notifications will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Alert Modal */}
      <AnimatePresence>
        {showCreateAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCreateAlert(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">Create New Alert</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">Cryptocurrency</label>
                  <select
                    value={newAlert.symbol}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
                    className="w-full bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20 focus:border-blue-400 focus:outline-none"
                  >
                    {Object.keys(prices).map(symbol => (
                      <option key={symbol} value={symbol} className="bg-gray-800">
                        {symbol.charAt(0).toUpperCase() + symbol.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2">Alert Type</label>
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20 focus:border-blue-400 focus:outline-none"
                  >
                    <option value="above" className="bg-gray-800">Price Above</option>
                    <option value="below" className="bg-gray-800">Price Below</option>
                    <option value="change_percent" className="bg-gray-800">24h Change %</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2">
                    Target Value {newAlert.type === 'change_percent' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    value={newAlert.targetValue}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
                    placeholder={newAlert.type === 'change_percent' ? '10' : '45000'}
                    className="w-full bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20 focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateAlert(false)}
                  className="flex-1 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createAlert}
                  disabled={!newAlert.targetValue}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Alert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RealTimeAlertsSystem
