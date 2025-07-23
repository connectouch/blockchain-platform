import { useEffect, useState } from 'react'

// Import types from desktop.ts instead of declaring them here
import type { ElectronAPI, DesktopAPI } from '../types/desktop'

export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false)
  const [appVersion, setAppVersion] = useState<string>('')
  const [platform, setPlatform] = useState<string>('')

  useEffect(() => {
    // Check if running in Electron
    if (window.electronAPI) {
      setIsElectron(true)
      setPlatform(window.electronAPI.platform)
      
      // Get app version
      window.electronAPI.getAppVersion().then(setAppVersion)
    }
  }, [])

  // Navigation handler
  useEffect(() => {
    if (window.electronAPI) {
      const handleNavigate = (event: any, path: string) => {
        window.location.hash = path
      }

      window.electronAPI.onNavigateTo(handleNavigate)
      
      return () => {
        window.electronAPI.removeNavigateToListener()
      }
    }
  }, [])

  // Desktop notification
  const showDesktopNotification = async (title: string, body: string) => {
    if (window.electronAPI) {
      await window.electronAPI.showNotification(title, body)
    } else {
      // Fallback to web notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body })
      }
    }
  }

  // Storage operations
  const getStoredValue = async (key: string) => {
    if (window.electronAPI) {
      return await window.electronAPI.getStoreValue(key)
    }
    return localStorage.getItem(key)
  }

  const setStoredValue = async (key: string, value: any) => {
    if (window.electronAPI) {
      await window.electronAPI.setStoreValue(key, value)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }

  // Desktop alert
  const createDesktopAlert = async (alertData: any) => {
    if (window.desktopAPI) {
      await window.desktopAPI.createDesktopAlert(alertData)
    }
  }

  // Auto launch
  const setAutoLaunch = async (enabled: boolean) => {
    if (window.desktopAPI) {
      await window.desktopAPI.setAutoLaunch(enabled)
    }
  }

  // Export functions
  const saveAnalysisReport = async (data: any) => {
    if (window.desktopAPI) {
      await window.desktopAPI.saveAnalysisReport(data)
    }
  }

  const exportPortfolio = async (data: any) => {
    if (window.desktopAPI) {
      await window.desktopAPI.exportPortfolio(data)
    }
  }

  return {
    isElectron,
    appVersion,
    platform,
    showDesktopNotification,
    getStoredValue,
    setStoredValue,
    createDesktopAlert,
    setAutoLaunch,
    saveAnalysisReport,
    exportPortfolio
  }
}

// Desktop-specific price alert hook
export const usePriceAlerts = () => {
  const { isElectron, createDesktopAlert, showDesktopNotification } = useElectron()
  const [alerts, setAlerts] = useState<any[]>([])

  const addPriceAlert = async (symbol: string, targetPrice: number, type: 'above' | 'below') => {
    if (isElectron) {
      const alertData = {
        type: 'price' as const,
        title: `Price Alert for ${symbol}`,
        message: `Alert when ${symbol} goes ${type} $${targetPrice}`,
        symbol,
        threshold: targetPrice,
        urgency: 'normal' as const,
        conditions: [{
          field: 'price',
          operator: type === 'above' ? 'gte' as const : 'lte' as const,
          value: targetPrice
        }],
        enabled: true
      }
      await createDesktopAlert(alertData)
    }
    
    const newAlert = {
      id: Date.now().toString(),
      symbol,
      targetPrice,
      type,
      created: new Date(),
      active: true
    }
    
    setAlerts(prev => [...prev, newAlert])
    
    await showDesktopNotification(
      'Price Alert Created',
      `Alert set for ${symbol} ${type} $${targetPrice.toLocaleString()}`
    )
  }

  const checkPriceAlerts = async (prices: Record<string, number>) => {
    for (const alert of alerts) {
      if (!alert.active) continue
      
      const currentPrice = prices[alert.symbol.toLowerCase()]
      if (!currentPrice) continue
      
      const shouldTrigger = 
        (alert.type === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.type === 'below' && currentPrice <= alert.targetPrice)
      
      if (shouldTrigger) {
        await showDesktopNotification(
          `Price Alert: ${alert.symbol}`,
          `${alert.symbol} is now $${currentPrice.toLocaleString()} (${alert.type} $${alert.targetPrice.toLocaleString()})`
        )
        
        // Deactivate alert
        setAlerts(prev => 
          prev.map(a => 
            a.id === alert.id ? { ...a, active: false } : a
          )
        )
      }
    }
  }

  return {
    alerts,
    addPriceAlert,
    checkPriceAlerts
  }
}
