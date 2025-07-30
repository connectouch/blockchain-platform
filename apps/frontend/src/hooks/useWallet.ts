/**
 * Wallet Connection Hook
 * Provides wallet functionality for all components
 */

import { useState, useEffect, useCallback } from 'react'
import { walletService, WalletInfo, TokenBalance } from '../services/walletService'

export interface UseWalletReturn {
  // Wallet state
  wallet: WalletInfo | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  
  // Wallet actions
  connectWallet: (walletType?: 'metamask' | 'walletconnect' | 'coinbase') => Promise<void>
  disconnectWallet: () => Promise<void>
  switchNetwork: (chainId: number) => Promise<void>
  
  // Transaction actions
  sendTransaction: (to: string, value: string, data?: string) => Promise<string>
  signMessage: (message: string) => Promise<string>
  getTokenBalances: (tokenAddresses: string[]) => Promise<TokenBalance[]>
  
  // Utility functions
  formatAddress: (address: string) => string
  getNetworkName: (chainId: number) => string
}

export const useWallet = (): UseWalletReturn => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeWallet()
    return () => {
      walletService.removeAllListeners()
    }
  }, [])

  const initializeWallet = async () => {
    try {
      await walletService.initialize()

      // Set up event listeners
      walletService.on('walletConnected', (walletInfo: WalletInfo) => {
        setWallet(walletInfo)
        setIsConnecting(false)
        setError(null)
      })

      walletService.on('walletDisconnected', () => {
        setWallet(null)
        setIsConnecting(false)
        setError(null)
      })

      walletService.on('accountChanged', (address: string) => {
        if (wallet) {
          setWallet({ ...wallet, address })
        }
      })

      walletService.on('networkChanged', (chainId: number) => {
        if (wallet) {
          setWallet({ ...wallet, chainId })
        }
      })

      // Get current wallet state
      const currentWallet = walletService.getWalletInfo()
      if (currentWallet) {
        setWallet(currentWallet)
      }
    } catch (error) {
      console.error('Failed to initialize wallet:', error)
      setError('Failed to initialize wallet service')
    }
  }

  const connectWallet = useCallback(async (walletType: 'metamask' | 'walletconnect' | 'coinbase' = 'metamask') => {
    try {
      setIsConnecting(true)
      setError(null)
      
      await walletService.connectWallet(walletType)
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      setError(error.message || 'Failed to connect wallet')
      setIsConnecting(false)
    }
  }, [])

  const disconnectWallet = useCallback(async () => {
    try {
      setError(null)
      await walletService.disconnectWallet()
    } catch (error: any) {
      console.error('Failed to disconnect wallet:', error)
      setError(error.message || 'Failed to disconnect wallet')
    }
  }, [])

  const switchNetwork = useCallback(async (chainId: number) => {
    try {
      setError(null)
      await walletService.switchNetwork(chainId)
    } catch (error: any) {
      console.error('Failed to switch network:', error)
      setError(error.message || 'Failed to switch network')
    }
  }, [])

  const sendTransaction = useCallback(async (to: string, value: string, data?: string): Promise<string> => {
    try {
      setError(null)
      return await walletService.sendTransaction(to, value, data)
    } catch (error: any) {
      console.error('Failed to send transaction:', error)
      setError(error.message || 'Failed to send transaction')
      throw error
    }
  }, [])

  const signMessage = useCallback(async (message: string): Promise<string> => {
    try {
      setError(null)
      return await walletService.signMessage(message)
    } catch (error: any) {
      console.error('Failed to sign message:', error)
      setError(error.message || 'Failed to sign message')
      throw error
    }
  }, [])

  const getTokenBalances = useCallback(async (tokenAddresses: string[]): Promise<TokenBalance[]> => {
    try {
      setError(null)
      return await walletService.getTokenBalances(tokenAddresses)
    } catch (error: any) {
      console.error('Failed to get token balances:', error)
      setError(error.message || 'Failed to get token balances')
      throw error
    }
  }, [])

  const formatAddress = useCallback((address: string): string => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [])

  const getNetworkName = useCallback((chainId: number): string => {
    const networks: Record<number, string> = {
      1: 'Ethereum',
      56: 'BSC',
      137: 'Polygon',
      250: 'Fantom',
      43114: 'Avalanche',
      42161: 'Arbitrum',
      10: 'Optimism',
      5: 'Goerli',
      80001: 'Mumbai'
    }
    return networks[chainId] || `Chain ${chainId}`
  }, [])

  return {
    // Wallet state
    wallet,
    isConnected: walletService.isConnected(),
    isConnecting,
    error,
    
    // Wallet actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    
    // Transaction actions
    sendTransaction,
    signMessage,
    getTokenBalances,
    
    // Utility functions
    formatAddress,
    getNetworkName
  }
}

export default useWallet
