import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  AppStore,
  // BlockchainSector,
  // MarketData,
  AIChatMessage,
  // AIAnalysisResponse,
  // WalletConnection,
  UserPreferences,
  AppError
} from '../types'

// Default user preferences
const defaultPreferences: UserPreferences = {
  riskTolerance: 'moderate',
  investmentGoals: [],
  preferredSectors: [],
  notifications: true,
  theme: 'dark',
}

// Create the main app store
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // UI State
        currentSector: null,
        isLoading: false,
        error: null,

        // Data State
        sectors: [],
        marketData: null,
        chatMessages: [],
        analysisResults: [],

        // Wallet State
        wallet: null,

        // User State
        preferences: defaultPreferences,

        // Actions
        setSector: (sector) => {
          set({ currentSector: sector }, false, 'setSector')
        },

        setLoading: (loading) => {
          set({ isLoading: loading }, false, 'setLoading')
        },

        setError: (error) => {
          set({ error }, false, 'setError')
        },

        updateSectors: (sectors) => {
          set({ sectors }, false, 'updateSectors')
        },

        addChatMessage: (message) => {
          const { chatMessages } = get()
          const updatedMessages = [...chatMessages, message]
          
          // Keep only last 100 messages for performance
          if (updatedMessages.length > 100) {
            updatedMessages.splice(0, updatedMessages.length - 100)
          }
          
          set({ chatMessages: updatedMessages }, false, 'addChatMessage')
        },

        connectWallet: (connection) => {
          set({ wallet: connection }, false, 'connectWallet')
        },

        disconnectWallet: () => {
          set({ wallet: null }, false, 'disconnectWallet')
        },

        updatePreferences: (newPreferences) => {
          const { preferences } = get()
          const updatedPreferences = { ...preferences, ...newPreferences }
          set({ preferences: updatedPreferences }, false, 'updatePreferences')
        },
      }),
      {
        name: 'connectouch-app-store',
        partialize: (state) => ({
          // Only persist certain parts of the state
          preferences: state.preferences,
          wallet: state.wallet ? {
            address: state.wallet.address,
            chainId: state.wallet.chainId,
            isConnected: state.wallet.isConnected,
          } : null,
          currentSector: state.currentSector,
        }),
      }
    ),
    {
      name: 'connectouch-app-store',
    }
  )
)

// Selector hooks for better performance
export const useCurrentSector = () => useAppStore((state) => state.currentSector)
export const useIsLoading = () => useAppStore((state) => state.isLoading)
export const useError = () => useAppStore((state) => state.error)
export const useSectors = () => useAppStore((state) => state.sectors)
export const useMarketData = () => useAppStore((state) => state.marketData)
export const useChatMessages = () => useAppStore((state) => state.chatMessages)
export const useAnalysisResults = () => useAppStore((state) => state.analysisResults)
export const useWallet = () => useAppStore((state) => state.wallet)
export const usePreferences = () => useAppStore((state) => state.preferences)

// Action hooks
export const useAppActions = () => useAppStore((state) => ({
  setSector: state.setSector,
  setLoading: state.setLoading,
  setError: state.setError,
  updateSectors: state.updateSectors,
  addChatMessage: state.addChatMessage,
  connectWallet: state.connectWallet,
  disconnectWallet: state.disconnectWallet,
  updatePreferences: state.updatePreferences,
}))

// Computed selectors
export const useIsWalletConnected = () => 
  useAppStore((state) => state.wallet?.isConnected ?? false)

export const useWalletAddress = () => 
  useAppStore((state) => state.wallet?.address)

export const useFormattedWalletAddress = () => 
  useAppStore((state) => {
    const address = state.wallet?.address
    if (!address) return null
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  })

export const useSectorByName = (name: string) =>
  useAppStore((state) => 
    state.sectors.find(sector => 
      sector.name.toLowerCase() === name.toLowerCase()
    )
  )

export const useRecentChatMessages = (limit: number = 10) =>
  useAppStore((state) => 
    state.chatMessages.slice(-limit)
  )

export const useLatestAnalysis = () =>
  useAppStore((state) => 
    state.analysisResults[state.analysisResults.length - 1]
  )

// Utility functions
export const clearChatHistory = () => {
  useAppStore.setState({ chatMessages: [] })
}

export const clearAnalysisResults = () => {
  useAppStore.setState({ analysisResults: [] })
}

export const resetAppState = () => {
  useAppStore.setState({
    currentSector: null,
    isLoading: false,
    error: null,
    sectors: [],
    marketData: null,
    chatMessages: [],
    analysisResults: [],
  })
}

// Error handling utilities
export const setAppError = (message: string, code: string = 'UNKNOWN', details?: any) => {
  const error: AppError = {
    code,
    message,
    details,
    timestamp: new Date(),
  }
  useAppStore.getState().setError(error)
}

export const clearAppError = () => {
  useAppStore.getState().setError(null)
}

// Chat utilities
export const addUserMessage = (content: string, sector?: string) => {
  const message: AIChatMessage = {
    id: `user-${Date.now()}`,
    role: 'user',
    content,
    timestamp: new Date(),
    ...(sector && { sector }),
  }
  useAppStore.getState().addChatMessage(message)
  return message
}

export const addAIMessage = (content: string, sector?: string, metadata?: Record<string, any>) => {
  const message: AIChatMessage = {
    id: `ai-${Date.now()}`,
    role: 'assistant',
    content,
    timestamp: new Date(),
    ...(sector && { sector }),
    ...(metadata && { metadata }),
  }
  useAppStore.getState().addChatMessage(message)
  return message
}

export default useAppStore
