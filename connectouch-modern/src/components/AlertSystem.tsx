import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell,
  BellOff,
  Plus,
  Trash2,
  Edit,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  Volume2,
  VolumeX,
  Mail,
  MessageSquare,
  Smartphone,
  Eye,
  EyeOff,
  Filter,
  Search
} from 'lucide-react'

interface Alert {
  id: string
  name: string
  symbol: string
  type: 'price' | 'indicator' | 'volume' | 'pattern' | 'news'
  condition: 'above' | 'below' | 'crosses_above' | 'crosses_below' | 'equals'
  value: number
  currentValue: number
  isActive: boolean
  isTriggered: boolean
  triggeredAt?: number
  createdAt: number
  expiresAt?: number
  notifications: {
    push: boolean
    email: boolean
    sms: boolean
    sound: boolean
  }
  frequency: 'once' | 'repeated' | 'daily'
  description: string
  priority: 'low' | 'medium' | 'high'
}

interface AlertHistory {
  id: string
  alertId: string
  alertName: string
  symbol: string
  message: string
  triggeredAt: number
  value: number
  isRead: boolean
}

interface AlertSystemProps {
  symbols: string[]
  onAlertTriggered?: (alert: Alert) => void
}

const AlertSystem: React.FC<AlertSystemProps> = ({
  symbols = [],
  onAlertTriggered
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [globalNotifications, setGlobalNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // New alert form state
  const [newAlert, setNewAlert] = useState({
    name: '',
    symbol: symbols[0] || 'BTC',
    type: 'price' as Alert['type'],
    condition: 'above' as Alert['condition'],
    value: 0,
    notifications: {
      push: true,
      email: false,
      sms: false,
      sound: true
    },
    frequency: 'once' as Alert['frequency'],
    description: '',
    priority: 'medium' as Alert['priority']
  })

  // Initialize mock alerts
  useEffect(() => {
    const mockAlerts: Alert[] = [
      {
        id: 'alert-1',
        name: 'BTC Price Alert',
        symbol: 'BTC',
        type: 'price',
        condition: 'above',
        value: 50000,
        currentValue: 45200,
        isActive: true,
        isTriggered: false,
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        notifications: {
          push: true,
          email: true,
          sms: false,
          sound: true
        },
        frequency: 'once',
        description: 'Alert when Bitcoin breaks above $50,000',
        priority: 'high'
      },
      {
        id: 'alert-2',
        name: 'ETH RSI Oversold',
        symbol: 'ETH',
        type: 'indicator',
        condition: 'below',
        value: 30,
        currentValue: 45,
        isActive: true,
        isTriggered: false,
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        notifications: {
          push: true,
          email: false,
          sms: false,
          sound: true
        },
        frequency: 'repeated',
        description: 'Alert when ETH RSI drops below 30 (oversold)',
        priority: 'medium'
      },
      {
        id: 'alert-3',
        name: 'SOL Volume Spike',
        symbol: 'SOL',
        type: 'volume',
        condition: 'above',
        value: 1000000,
        currentValue: 750000,
        isActive: true,
        isTriggered: true,
        triggeredAt: Date.now() - 2 * 60 * 60 * 1000,
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        notifications: {
          push: true,
          email: true,
          sms: true,
          sound: true
        },
        frequency: 'daily',
        description: 'Alert when SOL volume exceeds 1M',
        priority: 'low'
      }
    ]

    const mockHistory: AlertHistory[] = [
      {
        id: 'history-1',
        alertId: 'alert-3',
        alertName: 'SOL Volume Spike',
        symbol: 'SOL',
        message: 'SOL volume exceeded 1,000,000 - Current: 1,250,000',
        triggeredAt: Date.now() - 2 * 60 * 60 * 1000,
        value: 1250000,
        isRead: false
      },
      {
        id: 'history-2',
        alertId: 'alert-1',
        alertName: 'BTC Price Alert',
        symbol: 'BTC',
        message: 'BTC price reached $48,500',
        triggeredAt: Date.now() - 6 * 60 * 60 * 1000,
        value: 48500,
        isRead: true
      }
    ]

    setAlerts(mockAlerts)
    setAlertHistory(mockHistory)
  }, [])

  // Create new alert
  const createAlert = () => {
    const alert: Alert = {
      id: `alert-${Date.now()}`,
      ...newAlert,
      currentValue: 0,
      isActive: true,
      isTriggered: false,
      createdAt: Date.now()
    }

    setAlerts(prev => [...prev, alert])
    setShowCreateModal(false)
    setNewAlert({
      name: '',
      symbol: symbols[0] || 'BTC',
      type: 'price',
      condition: 'above',
      value: 0,
      notifications: {
        push: true,
        email: false,
        sms: false,
        sound: true
      },
      frequency: 'once',
      description: '',
      priority: 'medium'
    })
  }

  // Toggle alert active state
  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ))
  }

  // Delete alert
  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'active' && alert.isActive) ||
                         (selectedFilter === 'triggered' && alert.isTriggered) ||
                         (selectedFilter === alert.type)
    const matchesSearch = alert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Get alert type icon
  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'price': return <TrendingUp className="w-4 h-4" />
      case 'indicator': return <Activity className="w-4 h-4" />
      case 'volume': return <Target className="w-4 h-4" />
      case 'pattern': return <Eye className="w-4 h-4" />
      case 'news': return <Info className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-white/60'
    }
  }

  // Format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) return `${Math.floor(hours / 24)}d ago`
    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  // Format value
  const formatValue = (value: number, type: string): string => {
    switch (type) {
      case 'price': return `$${value.toLocaleString()}`
      case 'volume': return value.toLocaleString()
      case 'indicator': return value.toFixed(2)
      default: return value.toString()
    }
  }

  const unreadCount = alertHistory.filter(h => !h.isRead).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Alert System</h2>
          <p className="text-white/60">Custom price and indicator-based alerts with notifications</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
            title={soundEnabled ? 'Disable Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setGlobalNotifications(!globalNotifications)}
            className={`p-2 rounded-lg transition-colors ${
              globalNotifications ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
            title={globalNotifications ? 'Disable Notifications' : 'Enable Notifications'}
          >
            {globalNotifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Alert
          </button>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 text-center">
          <Bell className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Total Alerts</h3>
          <p className="text-3xl font-bold text-white">{alerts.length}</p>
        </div>
        <div className="glass-card p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Active</h3>
          <p className="text-3xl font-bold text-green-400">{alerts.filter(a => a.isActive).length}</p>
        </div>
        <div className="glass-card p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Triggered</h3>
          <p className="text-3xl font-bold text-yellow-400">{alerts.filter(a => a.isTriggered).length}</p>
        </div>
        <div className="glass-card p-6 text-center">
          <Clock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Unread</h3>
          <p className="text-3xl font-bold text-purple-400">{unreadCount}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
          />
        </div>
        
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
        >
          <option value="all" className="bg-gray-800">All Alerts</option>
          <option value="active" className="bg-gray-800">Active</option>
          <option value="triggered" className="bg-gray-800">Triggered</option>
          <option value="price" className="bg-gray-800">Price Alerts</option>
          <option value="indicator" className="bg-gray-800">Indicator Alerts</option>
          <option value="volume" className="bg-gray-800">Volume Alerts</option>
        </select>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Your Alerts ({filteredAlerts.length})</h3>
        
        {filteredAlerts.length > 0 ? (
          <div className="space-y-3">
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`glass-card p-6 ${alert.isTriggered ? 'border border-yellow-400/30' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${
                      alert.isTriggered ? 'bg-yellow-400/20' : 
                      alert.isActive ? 'bg-green-400/20' : 'bg-gray-400/20'
                    }`}>
                      {getAlertTypeIcon(alert.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold text-white">{alert.name}</h4>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                          {alert.symbol}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPriorityColor(alert.priority)} bg-current/20`}>
                          {alert.priority}
                        </span>
                      </div>
                      
                      <p className="text-white/80 mb-2">{alert.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-white/60">
                          {alert.condition.replace('_', ' ')} {formatValue(alert.value, alert.type)}
                        </span>
                        <span className="text-white/60">
                          Current: {formatValue(alert.currentValue, alert.type)}
                        </span>
                        <span className="text-white/60">
                          Created: {formatTimeAgo(alert.createdAt)}
                        </span>
                        {alert.triggeredAt && (
                          <span className="text-yellow-400">
                            Triggered: {formatTimeAgo(alert.triggeredAt)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {alert.notifications.push && <Smartphone className="w-4 h-4 text-blue-400" />}
                        {alert.notifications.email && <Mail className="w-4 h-4 text-green-400" />}
                        {alert.notifications.sms && <MessageSquare className="w-4 h-4 text-purple-400" />}
                        {alert.notifications.sound && <Volume2 className="w-4 h-4 text-yellow-400" />}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        alert.isActive 
                          ? 'bg-green-600 text-white' 
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                      title={alert.isActive ? 'Disable Alert' : 'Enable Alert'}
                    >
                      {alert.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setEditingAlert(alert)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                      title="Edit Alert"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-red-400 transition-colors"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Bell className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Alerts Found</h3>
            <p className="text-white/60">Create your first alert to get notified about market movements</p>
          </div>
        )}
      </div>

      {/* Recent Alert History */}
      {alertHistory.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {alertHistory.slice(0, 5).map(history => (
              <div key={history.id} className={`flex items-center justify-between p-3 rounded-lg ${
                history.isRead ? 'bg-white/5' : 'bg-yellow-500/10 border border-yellow-500/30'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${history.isRead ? 'bg-gray-400' : 'bg-yellow-400'}`} />
                  <div>
                    <h4 className="text-white font-medium">{history.alertName}</h4>
                    <p className="text-white/60 text-sm">{history.message}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/60 text-sm">{formatTimeAgo(history.triggeredAt)}</div>
                  <div className="text-blue-400 text-sm">{history.symbol}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Alert Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Create New Alert</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Alert Name</label>
                  <input
                    type="text"
                    value={newAlert.name}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="My Price Alert"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Symbol</label>
                    <select
                      value={newAlert.symbol}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      {symbols.map(symbol => (
                        <option key={symbol} value={symbol} className="bg-gray-800">{symbol}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Type</label>
                    <select
                      value={newAlert.type}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as Alert['type'] }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value="price" className="bg-gray-800">Price</option>
                      <option value="indicator" className="bg-gray-800">Indicator</option>
                      <option value="volume" className="bg-gray-800">Volume</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Condition</label>
                    <select
                      value={newAlert.condition}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value as Alert['condition'] }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value="above" className="bg-gray-800">Above</option>
                      <option value="below" className="bg-gray-800">Below</option>
                      <option value="crosses_above" className="bg-gray-800">Crosses Above</option>
                      <option value="crosses_below" className="bg-gray-800">Crosses Below</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Value</label>
                    <input
                      type="number"
                      value={newAlert.value}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, value: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newAlert.description}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    rows={2}
                    placeholder="Alert description..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createAlert}
                    disabled={!newAlert.name || !newAlert.value}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors disabled:opacity-50"
                  >
                    Create Alert
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AlertSystem
