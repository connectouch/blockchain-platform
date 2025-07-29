import { useState, useEffect, useCallback } from 'react'

interface TickerPreferences {
  isEnabled: boolean
  position: 'top' | 'bottom'
  autoHide: boolean
  refreshInterval: number
  symbols: string[]
  isMinimized: boolean
}

interface UseFloatingTickerReturn {
  preferences: TickerPreferences
  updatePreferences: (updates: Partial<TickerPreferences>) => void
  toggleTicker: () => void
  resetPreferences: () => void
  isVisible: boolean
  setIsVisible: (visible: boolean) => void
}

const DEFAULT_PREFERENCES: TickerPreferences = {
  isEnabled: true,
  position: 'bottom',
  autoHide: false,
  refreshInterval: 30000, // 30 seconds
  symbols: ['BTC', 'ETH', 'BNB'],
  isMinimized: false
}

const STORAGE_KEY = 'connectouch-floating-ticker-preferences'

export const useFloatingTicker = (): UseFloatingTickerReturn => {
  const [preferences, setPreferences] = useState<TickerPreferences>(DEFAULT_PREFERENCES)
  const [isVisible, setIsVisible] = useState(true)

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedPreferences = JSON.parse(stored)
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsedPreferences })
        setIsVisible(parsedPreferences.isEnabled !== false)
      }
    } catch (error) {
      console.warn('Failed to load floating ticker preferences:', error)
    }
  }, [])

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    } catch (error) {
      console.warn('Failed to save floating ticker preferences:', error)
    }
  }, [preferences])

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<TickerPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }, [])

  // Toggle ticker visibility
  const toggleTicker = useCallback(() => {
    const newEnabled = !preferences.isEnabled
    updatePreferences({ isEnabled: newEnabled })
    setIsVisible(newEnabled)
  }, [preferences.isEnabled, updatePreferences])

  // Reset to default preferences
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES)
    setIsVisible(DEFAULT_PREFERENCES.isEnabled)
  }, [])

  // Update visibility when enabled state changes
  useEffect(() => {
    setIsVisible(preferences.isEnabled)
  }, [preferences.isEnabled])

  return {
    preferences,
    updatePreferences,
    toggleTicker,
    resetPreferences,
    isVisible,
    setIsVisible
  }
}
