import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface AIContextData {
  currentFeature: string
  contextData: any
  portfolioData: any
  userPreferences: any
  isAIEnabled: boolean
  aiCapabilities: AICapabilities
}

interface AICapabilities {
  naturalLanguageTrading: boolean
  portfolioAnalysis: boolean
  marketInsights: boolean
  voiceCommands: boolean
  contextAwareness: boolean
  multiLanguage: boolean
  realTimeData: boolean
  predictiveAnalytics: boolean
  riskAssessment: boolean
  educationalContent: boolean
}

interface FloatingAIContextType {
  aiContext: AIContextData
  updateContext: (feature: string, data?: any) => void
  updatePortfolio: (data: any) => void
  updatePreferences: (preferences: any) => void
  toggleAI: () => void
  updateCapabilities: (capabilities: Partial<AICapabilities>) => void
}

const FloatingAIContext = createContext<FloatingAIContextType | undefined>(undefined)

interface FloatingAIProviderProps {
  children: ReactNode
}

export const FloatingAIProvider: React.FC<FloatingAIProviderProps> = ({ children }) => {
  const location = useLocation()
  
  const [aiContext, setAIContext] = useState<AIContextData>({
    currentFeature: 'dashboard',
    contextData: null,
    portfolioData: null,
    userPreferences: {
      theme: 'dark',
      currency: 'USD',
      language: 'en',
      notifications: true,
      autoTrading: false,
      riskTolerance: 'moderate'
    },
    isAIEnabled: true,
    aiCapabilities: {
      naturalLanguageTrading: true,
      portfolioAnalysis: true,
      marketInsights: true,
      voiceCommands: true,
      contextAwareness: true,
      multiLanguage: true,
      realTimeData: true,
      predictiveAnalytics: true,
      riskAssessment: true,
      educationalContent: true
    }
  })

  // Update context based on current route
  useEffect(() => {
    const path = location.pathname
    let feature = 'dashboard'
    
    if (path.includes('/portfolio')) feature = 'portfolio'
    else if (path.includes('/defi')) feature = 'defi'
    else if (path.includes('/nft')) feature = 'nft'
    else if (path.includes('/dao')) feature = 'dao'
    else if (path.includes('/infrastructure')) feature = 'infrastructure'
    else if (path.includes('/multi-chain')) feature = 'multi-chain'
    else if (path.includes('/gamefi')) feature = 'gamefi'
    else if (path.includes('/web3-tools')) feature = 'web3-tools'
    else if (path.includes('/analysis')) feature = 'analysis'
    else if (path.includes('/settings')) feature = 'settings'
    
    updateContext(feature)
  }, [location.pathname])

  // Load user preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('connectouch-ai-preferences')
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences)
        setAIContext(prev => ({
          ...prev,
          userPreferences: { ...prev.userPreferences, ...preferences }
        }))
      } catch (error) {
        console.error('Error loading AI preferences:', error)
      }
    }
  }, [])

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('connectouch-ai-preferences', JSON.stringify(aiContext.userPreferences))
  }, [aiContext.userPreferences])

  const updateContext = (feature: string, data?: any) => {
    setAIContext(prev => ({
      ...prev,
      currentFeature: feature,
      contextData: data || getFeatureContextData(feature)
    }))
  }

  const updatePortfolio = (data: any) => {
    setAIContext(prev => ({
      ...prev,
      portfolioData: data
    }))
  }

  const updatePreferences = (preferences: any) => {
    setAIContext(prev => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, ...preferences }
    }))
  }

  const toggleAI = () => {
    setAIContext(prev => ({
      ...prev,
      isAIEnabled: !prev.isAIEnabled
    }))
  }

  const updateCapabilities = (capabilities: Partial<AICapabilities>) => {
    setAIContext(prev => ({
      ...prev,
      aiCapabilities: { ...prev.aiCapabilities, ...capabilities }
    }))
  }

  // Get context-specific data based on current feature
  const getFeatureContextData = (feature: string) => {
    switch (feature) {
      case 'portfolio':
        return {
          totalValue: '$125,000',
          change24h: '+2.5%',
          topHoldings: ['BTC', 'ETH', 'MATIC'],
          riskScore: 'Moderate'
        }
      case 'defi':
        return {
          totalStaked: '$45,000',
          avgAPY: '8.5%',
          protocols: ['Aave', 'Compound', 'Uniswap'],
          impermanentLoss: '-0.2%'
        }
      case 'nft':
        return {
          collections: 5,
          totalValue: '$12,000',
          floorPrices: { 'BAYC': '25 ETH', 'CryptoPunks': '45 ETH' },
          trending: ['Azuki', 'Doodles']
        }
      case 'dao':
        return {
          activeDAOs: 3,
          votingPower: '2.5M tokens',
          proposalsVoted: 47,
          participationRate: '78%'
        }
      case 'infrastructure':
        return {
          networksTracked: 6,
          avgTPS: '15,000',
          totalValidators: '900K',
          avgUptime: '99.5%'
        }
      case 'multi-chain':
        return {
          chainsConnected: 5,
          bridgeVolume: '$8.5B',
          crossChainTxs: '2.5M',
          avgBridgeTime: '6.5 min'
        }
      default:
        return {
          totalMarketCap: '$1.2T',
          btcDominance: '42%',
          fearGreedIndex: 65,
          activeUsers: '125M'
        }
    }
  }

  const value: FloatingAIContextType = {
    aiContext,
    updateContext,
    updatePortfolio,
    updatePreferences,
    toggleAI,
    updateCapabilities
  }

  return (
    <FloatingAIContext.Provider value={value}>
      {children}
    </FloatingAIContext.Provider>
  )
}

export const useFloatingAI = (): FloatingAIContextType => {
  const context = useContext(FloatingAIContext)
  if (!context) {
    throw new Error('useFloatingAI must be used within a FloatingAIProvider')
  }
  return context
}

export default FloatingAIContext
