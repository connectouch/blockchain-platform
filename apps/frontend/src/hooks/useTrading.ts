/**
 * Trading Hook
 * Provides trading functionality for all components
 */

import { useState, useEffect, useCallback } from 'react'
import { tradingService, SwapQuote, SwapTransaction, StakingPosition } from '../services/tradingService'

export interface UseTradingReturn {
  // Trading state
  isLoading: boolean
  error: string | null
  
  // Swap functionality
  getSwapQuote: (fromToken: string, toToken: string, amount: string) => Promise<SwapQuote>
  executeSwap: (quote: SwapQuote) => Promise<string>
  
  // Staking functionality
  stakeTokens: (protocol: string, token: string, amount: string) => Promise<string>
  unstakeTokens: (protocol: string, token: string, amount: string) => Promise<string>
  claimRewards: (protocol: string) => Promise<string>
  getStakingPositions: () => Promise<StakingPosition[]>
  
  // Liquidity functionality
  provideLiquidity: (protocol: string, tokenA: string, tokenB: string, amountA: string, amountB: string) => Promise<string>
  removeLiquidity: (protocol: string, lpToken: string, amount: string) => Promise<string>
  
  // Transaction history
  transactions: SwapTransaction[]
  stakingPositions: StakingPosition[]
}

export const useTrading = (): UseTradingReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<SwapTransaction[]>([])
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>([])

  useEffect(() => {
    initializeTrading()
    return () => {
      tradingService.removeAllListeners()
    }
  }, [])

  const initializeTrading = async () => {
    try {
      await tradingService.initialize()

      // Set up event listeners
      tradingService.on('swapExecuted', (transaction: SwapTransaction) => {
        setTransactions(prev => [transaction, ...prev])
      })

      tradingService.on('tokensStaked', (data: any) => {
        console.log('Tokens staked:', data)
        // Refresh staking positions
        loadStakingPositions()
      })

      tradingService.on('tokensUnstaked', (data: any) => {
        console.log('Tokens unstaked:', data)
        // Refresh staking positions
        loadStakingPositions()
      })

      tradingService.on('rewardsClaimed', (data: any) => {
        console.log('Rewards claimed:', data)
        // Refresh staking positions
        loadStakingPositions()
      })

      // Load initial data
      loadStakingPositions()
    } catch (error) {
      console.error('Failed to initialize trading:', error)
      setError('Failed to initialize trading service')
    }
  }

  const loadStakingPositions = async () => {
    try {
      const positions = await tradingService.getStakingPositions()
      setStakingPositions(positions)
    } catch (error) {
      console.warn('Failed to load staking positions:', error)
    }
  }

  const getSwapQuote = useCallback(async (fromToken: string, toToken: string, amount: string): Promise<SwapQuote> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const quote = await tradingService.getSwapQuote(fromToken, toToken, amount)
      return quote
    } catch (error: any) {
      console.error('Failed to get swap quote:', error)
      setError(error.message || 'Failed to get swap quote')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const executeSwap = useCallback(async (quote: SwapQuote): Promise<string> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const txHash = await tradingService.executeSwap(quote)
      return txHash
    } catch (error: any) {
      console.error('Failed to execute swap:', error)
      setError(error.message || 'Failed to execute swap')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const stakeTokens = useCallback(async (protocol: string, token: string, amount: string): Promise<string> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const txHash = await tradingService.stakeTokens(protocol, token, amount)
      return txHash
    } catch (error: any) {
      console.error('Failed to stake tokens:', error)
      setError(error.message || 'Failed to stake tokens')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const unstakeTokens = useCallback(async (protocol: string, token: string, amount: string): Promise<string> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const txHash = await tradingService.unstakeTokens(protocol, token, amount)
      return txHash
    } catch (error: any) {
      console.error('Failed to unstake tokens:', error)
      setError(error.message || 'Failed to unstake tokens')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const claimRewards = useCallback(async (protocol: string): Promise<string> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const txHash = await tradingService.claimRewards(protocol)
      return txHash
    } catch (error: any) {
      console.error('Failed to claim rewards:', error)
      setError(error.message || 'Failed to claim rewards')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const provideLiquidity = useCallback(async (
    protocol: string,
    tokenA: string,
    tokenB: string,
    amountA: string,
    amountB: string
  ): Promise<string> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const txHash = await tradingService.provideLiquidity(protocol, tokenA, tokenB, amountA, amountB)
      return txHash
    } catch (error: any) {
      console.error('Failed to provide liquidity:', error)
      setError(error.message || 'Failed to provide liquidity')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeLiquidity = useCallback(async (protocol: string, lpToken: string, amount: string): Promise<string> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const txHash = await tradingService.removeLiquidity(protocol, lpToken, amount)
      return txHash
    } catch (error: any) {
      console.error('Failed to remove liquidity:', error)
      setError(error.message || 'Failed to remove liquidity')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getStakingPositionsCallback = useCallback(async (): Promise<StakingPosition[]> => {
    try {
      setError(null)
      const positions = await tradingService.getStakingPositions()
      setStakingPositions(positions)
      return positions
    } catch (error: any) {
      console.error('Failed to get staking positions:', error)
      setError(error.message || 'Failed to get staking positions')
      throw error
    }
  }, [])

  return {
    // Trading state
    isLoading,
    error,
    
    // Swap functionality
    getSwapQuote,
    executeSwap,
    
    // Staking functionality
    stakeTokens,
    unstakeTokens,
    claimRewards,
    getStakingPositions: getStakingPositionsCallback,
    
    // Liquidity functionality
    provideLiquidity,
    removeLiquidity,
    
    // Transaction history
    transactions,
    stakingPositions
  }
}

export default useTrading
