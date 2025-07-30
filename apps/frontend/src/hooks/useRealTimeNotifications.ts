/**
 * Real-time Notifications Hook
 * Handles live notifications for portfolio changes, price alerts, and system updates
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export interface Notification {
  id: string
  type: 'price_alert' | 'portfolio_change' | 'system_update' | 'achievement'
  title: string
  message: string
  data?: any
  read: boolean
  timestamp: string
}

export function useRealTimeNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Add new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]) // Keep last 50
    setUnreadCount(prev => prev + 1)

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id
      })
    }

    return newNotification.id
  }

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    setUnreadCount(0)
  }

  // Clear all notifications
  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // Set up real-time listeners for portfolio changes
  useEffect(() => {
    if (!user) return

    // Listen for portfolio changes
    const portfolioSubscription = supabase
      .channel('portfolio_notifications')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio_holdings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          switch (eventType) {
            case 'INSERT':
              addNotification({
                type: 'portfolio_change',
                title: 'New Holding Added',
                message: `Added ${newRecord.amount} ${newRecord.symbol.toUpperCase()} to your portfolio`,
                data: { holding: newRecord }
              })
              break

            case 'UPDATE':
              if (oldRecord.amount !== newRecord.amount) {
                const change = newRecord.amount - oldRecord.amount
                addNotification({
                  type: 'portfolio_change',
                  title: 'Holding Updated',
                  message: `${change > 0 ? 'Increased' : 'Decreased'} ${newRecord.symbol.toUpperCase()} by ${Math.abs(change)}`,
                  data: { holding: newRecord, change }
                })
              }
              break

            case 'DELETE':
              addNotification({
                type: 'portfolio_change',
                title: 'Holding Removed',
                message: `Removed ${oldRecord.symbol.toUpperCase()} from your portfolio`,
                data: { holding: oldRecord }
              })
              break
          }
        }
      )
      .subscribe()

    return () => {
      portfolioSubscription.unsubscribe()
    }
  }, [user])

  // Listen for significant price changes
  useEffect(() => {
    const priceSubscription = supabase
      .channel('price_notifications')
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crypto_prices'
        },
        (payload) => {
          const { new: newPrice, old: oldPrice } = payload

          // Only notify for significant changes (>5%)
          if (oldPrice && newPrice) {
            const changePercent = Math.abs(((newPrice.price - oldPrice.price) / oldPrice.price) * 100)
            
            if (changePercent >= 5) {
              const isIncrease = newPrice.price > oldPrice.price
              addNotification({
                type: 'price_alert',
                title: `${newPrice.symbol.toUpperCase()} ${isIncrease ? 'Surge' : 'Drop'}`,
                message: `${newPrice.name} ${isIncrease ? 'increased' : 'decreased'} by ${changePercent.toFixed(1)}%`,
                data: { 
                  symbol: newPrice.symbol,
                  oldPrice: oldPrice.price,
                  newPrice: newPrice.price,
                  changePercent: isIncrease ? changePercent : -changePercent
                }
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      priceSubscription.unsubscribe()
    }
  }, [])

  // Calculate unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestNotificationPermission
  }
}
