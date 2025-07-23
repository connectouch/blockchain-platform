import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { useChartStore } from '../../stores/useChartStore'
// import type { PriceAlert } from '../../types/chart'

const PriceAlerts: React.FC = () => {
  const [showAlerts, setShowAlerts] = useState(false)
  const [newAlert, setNewAlert] = useState({
    price: '',
    type: 'above' as 'above' | 'below',
    message: ''
  })

  const { 
    config, 
    data, 
    alerts, 
    addAlert, 
    removeAlert 
  } = useChartStore()

  // Check for triggered alerts
  useEffect(() => {
    if (data.candlesticks.length === 0) return

    const currentPrice = data.candlesticks[data.candlesticks.length - 1]?.close
    if (!currentPrice) return

    alerts.forEach(alert => {
      if (alert.enabled && !alert.triggered) {
        const shouldTrigger = 
          (alert.type === 'above' && currentPrice >= alert.price) ||
          (alert.type === 'below' && currentPrice <= alert.price)

        if (shouldTrigger) {
          // Show notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Price Alert: ${alert.symbol}`, {
              body: `${alert.symbol} has reached $${alert.price.toLocaleString()}`,
              icon: '/favicon.ico'
            })
          }

          // Mark alert as triggered (you would update this in the store)
          console.log(`Alert triggered: ${alert.symbol} ${alert.type} $${alert.price}`)
        }
      }
    })
  }, [data.candlesticks, alerts])

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault()
    
    const price = parseFloat(newAlert.price)
    if (isNaN(price) || price <= 0) return

    addAlert({
      symbol: config.symbol,
      price,
      type: newAlert.type,
      enabled: true,
      triggered: false,
      message: newAlert.message || `${config.symbol} ${newAlert.type} $${price.toLocaleString()}`
    })

    setNewAlert({ price: '', type: 'above', message: '' })
  }

  const activeAlerts = alerts.filter(alert => alert.enabled && !alert.triggered)
  const triggeredAlerts = alerts.filter(alert => alert.triggered)

  return (
    <>
      {/* Alert Button */}
      <button
        onClick={() => setShowAlerts(true)}
        className="fixed bottom-6 right-6 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors z-40"
      >
        <Bell className="w-5 h-5" />
        {activeAlerts.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {activeAlerts.length}
          </span>
        )}
      </button>

      {/* Alerts Panel */}
      <AnimatePresence>
        {showAlerts && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowAlerts(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-96 bg-black/90 backdrop-blur-sm border-l border-white/10 z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-semibold">Price Alerts</h3>
                </div>
                <button
                  onClick={() => setShowAlerts(false)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Add New Alert */}
              <div className="p-4 border-b border-white/10">
                <h4 className="text-white/80 font-medium mb-3">Add New Alert</h4>
                <form onSubmit={handleAddAlert} className="space-y-3">
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Price</label>
                    <input
                      type="number"
                      value={newAlert.price}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="Enter price..."
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 text-sm mb-1">Condition</label>
                    <select
                      value={newAlert.type}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as 'above' | 'below' }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="above">Price goes above</option>
                      <option value="below">Price goes below</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/60 text-sm mb-1">Message (optional)</label>
                    <input
                      type="text"
                      value={newAlert.message}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Custom alert message..."
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Add Alert
                  </button>
                </form>
              </div>

              {/* Active Alerts */}
              <div className="p-4">
                <h4 className="text-white/80 font-medium mb-3">Active Alerts</h4>
                {activeAlerts.length === 0 ? (
                  <p className="text-white/40 text-sm">No active alerts</p>
                ) : (
                  <div className="space-y-3">
                    {activeAlerts.map(alert => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {alert.type === 'above' ? (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            <div>
                              <p className="text-white text-sm font-medium">
                                {alert.symbol} {alert.type} ${alert.price.toLocaleString()}
                              </p>
                              {alert.message && (
                                <p className="text-white/60 text-xs mt-1">{alert.message}</p>
                              )}
                              <p className="text-white/40 text-xs mt-1">
                                Created {alert.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeAlert(alert.id)}
                            className="p-1 text-white/40 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Triggered Alerts */}
              {triggeredAlerts.length > 0 && (
                <div className="p-4 border-t border-white/10">
                  <h4 className="text-white/80 font-medium mb-3">Recent Triggers</h4>
                  <div className="space-y-3">
                    {triggeredAlerts.slice(0, 5).map(alert => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                          <div>
                            <p className="text-white text-sm font-medium">
                              {alert.symbol} reached ${alert.price.toLocaleString()}
                            </p>
                            <p className="text-white/60 text-xs mt-1">
                              Triggered {alert.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default PriceAlerts
