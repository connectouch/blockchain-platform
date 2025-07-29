import React, { createContext, useContext, useState, useEffect } from 'react'

interface AIAssistantContextType {
  currentFeature: string
  contextData: any
  isAIEnabled: boolean
  setCurrentFeature: (feature: string) => void
  setContextData: (data: any) => void
  setAIEnabled: (enabled: boolean) => void
  updateContext: (feature: string, data?: any) => void
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined)

export const useAIAssistant = () => {
  const context = useContext(AIAssistantContext)
  if (!context) {
    console.warn('useAIAssistant: AIAssistantProvider not found, using fallback')
    // Return a fallback context instead of throwing
    return {
      currentFeature: 'dashboard',
      contextData: null,
      isAIEnabled: true,
      setCurrentFeature: () => {},
      setContextData: () => {},
      setAIEnabled: () => {},
      updateContext: () => {}
    }
  }
  return context
}

interface AIAssistantProviderProps {
  children: React.ReactNode
}

export const AIAssistantProvider: React.FC<AIAssistantProviderProps> = ({ children }) => {
  const [currentFeature, setCurrentFeature] = useState('dashboard')
  const [contextData, setContextData] = useState<any>(null)
  const [isAIEnabled, setAIEnabled] = useState(true)

  // Update context when feature changes
  const updateContext = (feature: string, data?: any) => {
    setCurrentFeature(feature)
    if (data) {
      setContextData(data)
    }
    
    // Log context change for debugging
    console.log(`🤖 AI Assistant context updated: ${feature}`, data)
  }

  // Auto-detect feature based on URL
  useEffect(() => {
    const detectFeatureFromURL = () => {
      const path = window.location.pathname
      const hash = window.location.hash
      
      if (path === '/' && !hash) {
        updateContext('dashboard')
      } else if (path.includes('/defi') || hash.includes('defi')) {
        updateContext('defi')
      } else if (path.includes('/nft') || hash.includes('nft')) {
        updateContext('nft')
      } else if (path.includes('/gamefi') || hash.includes('gamefi')) {
        updateContext('gamefi')
      } else if (path.includes('/dao') || hash.includes('dao')) {
        updateContext('dao')
      } else if (path.includes('/infrastructure') || hash.includes('infrastructure')) {
        updateContext('infrastructure')
      } else if (path.includes('/web3-tools') || hash.includes('web3-tools')) {
        updateContext('web3-tools')
      } else if (path.includes('/analysis') || hash.includes('analysis')) {
        updateContext('analysis')
      } else if (path.includes('/chart-test') || hash.includes('chart-test')) {
        updateContext('trading')
      } else {
        // Detect from dashboard tabs
        const activeTab = sessionStorage.getItem('activeTab')
        if (activeTab) {
          updateContext(activeTab)
        }
      }
    }

    // Initial detection
    detectFeatureFromURL()

    // Listen for URL changes
    const handleLocationChange = () => {
      detectFeatureFromURL()
    }

    window.addEventListener('popstate', handleLocationChange)
    
    // Listen for hash changes (for dashboard tabs)
    window.addEventListener('hashchange', handleLocationChange)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

  // Listen for dashboard tab changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'activeTab' && e.newValue) {
        updateContext(e.newValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const value: AIAssistantContextType = {
    currentFeature,
    contextData,
    isAIEnabled,
    setCurrentFeature,
    setContextData,
    setAIEnabled,
    updateContext
  }

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  )
}

// Hook for components to easily update AI context
export const useAIContext = () => {
  try {
    const { updateContext } = useAIAssistant()

    return {
      setAIContext: (feature: string, data?: any) => {
        updateContext(feature, data)
        // Also store in sessionStorage for persistence
        sessionStorage.setItem('activeTab', feature)
      }
    }
  } catch (error) {
    console.warn('useAIContext: AIAssistantProvider not found, using fallback')

    // Fallback implementation when provider is not available
    return {
      setAIContext: (feature: string, data?: any) => {
        // Just store in sessionStorage as fallback
        sessionStorage.setItem('activeTab', feature)
        console.log(`🤖 AI Context fallback: ${feature}`, data)
      }
    }
  }
}
