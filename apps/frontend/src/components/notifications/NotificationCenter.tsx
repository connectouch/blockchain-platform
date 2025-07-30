/**
 * Notification Center Component
 * Displays real-time notifications with interactive UI
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, CheckCheck, Trash2, TrendingUp, TrendingDown, Wallet, Info } from 'lucide-react'
import { useRealTimeNotifications, Notification } from '../../hooks/useRealTimeNotifications'
import { formatDistanceToNow } from 'date-fns'

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll
  } = useRealTimeNotifications()
  
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'price_alert':
        return <TrendingUp className="w-5 h-5 text-yellow-400" />
      case 'portfolio_change':
        return <Wallet className="w-5 h-5 text-blue-400" />
      case 'system_update':
        return <Info className="w-5 h-5 text-green-400" />
      case 'achievement':
        return <Check className="w-5 h-5 text-purple-400" />
      default:
        return <Bell className="w-5 h-5 text-gray-400" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'price_alert':
        return 'border-yellow-500/20 bg-yellow-500/5'
      case 'portfolio_change':
        return 'border-blue-500/20 bg-blue-500/5'
      case 'system_update':
        return 'border-green-500/20 bg-green-500/5'
      case 'achievement':
        return 'border-purple-500/20 bg-purple-500/5'
      default:
        return 'border-gray-500/20 bg-gray-500/5'
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 text-sm text-gray-400">
                        ({unreadCount} unread)
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <>
                        <button
                          onClick={markAllAsRead}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={clearAll}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="Clear all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No notifications yet</p>
                    <p className="text-gray-500 text-sm mt-1">
                      You'll see updates about your portfolio here
                    </p>
                  </div>
                ) : (
                  <div className="p-2">
                    <AnimatePresence>
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`p-3 mb-2 rounded-lg border cursor-pointer transition-all hover:bg-gray-700/50 ${
                            getNotificationColor(notification.type)
                          } ${
                            !notification.read ? 'ring-1 ring-blue-500/20' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className={`text-sm font-medium ${
                                  notification.read ? 'text-gray-300' : 'text-white'
                                }`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className={`text-sm mt-1 ${
                                notification.read ? 'text-gray-400' : 'text-gray-300'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                              </p>
                              
                              {/* Additional data for price alerts */}
                              {notification.type === 'price_alert' && notification.data && (
                                <div className="mt-2 p-2 bg-gray-700/50 rounded text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Price Change:</span>
                                    <span className={`font-medium ${
                                      notification.data.changePercent > 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                      {notification.data.changePercent > 0 ? '+' : ''}
                                      {notification.data.changePercent.toFixed(2)}%
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-gray-400">New Price:</span>
                                    <span className="text-white font-medium">
                                      ${notification.data.newPrice.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
