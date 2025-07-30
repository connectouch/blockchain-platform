/**
 * Comprehensive Wallet Service
 * Handles wallet connection, transactions, and multi-chain operations
 */

import { EventEmitter } from 'events'

// Wallet types
export interface WalletInfo {
  address: string
  chainId: number
  balance: string
  provider: any
  isConnected: boolean
}

export interface TokenBalance {
  symbol: string
  balance: string
  decimals: number
  address: string
  value: number
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
}

class WalletService extends EventEmitter {
  private wallet: WalletInfo | null = null
  private provider: any = null
  private isInitialized = false

  constructor() {
    super()
  }

  /**
   * Initialize wallet service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Check if MetaMask is available
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        this.provider = (window as any).ethereum
        
        // Set up event listeners
        this.setupEventListeners()
        
        // Check if already connected
        const accounts = await this.provider.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          await this.connectWallet('metamask')
        }
      }

      this.isInitialized = true
      console.log('✅ Wallet Service initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Wallet Service:', error)
      throw error
    }
  }

  /**
   * Connect to wallet
   */
  async connectWallet(walletType: 'metamask' | 'walletconnect' | 'coinbase'): Promise<WalletInfo> {
    try {
      if (!this.provider) {
        throw new Error('No wallet provider found. Please install MetaMask.')
      }

      // Request account access
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Get chain ID
      const chainId = await this.provider.request({
        method: 'eth_chainId'
      })

      // Get balance
      const balance = await this.provider.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      })

      this.wallet = {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        balance: this.formatBalance(balance),
        provider: this.provider,
        isConnected: true
      }

      this.emit('walletConnected', this.wallet)
      console.log('✅ Wallet connected:', this.wallet.address)
      
      return this.wallet
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error)
      throw error
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(): Promise<void> {
    try {
      this.wallet = null
      this.emit('walletDisconnected')
      console.log('✅ Wallet disconnected')
    } catch (error) {
      console.error('❌ Failed to disconnect wallet:', error)
      throw error
    }
  }

  /**
   * Switch network
   */
  async switchNetwork(chainId: number): Promise<void> {
    try {
      if (!this.provider) {
        throw new Error('No wallet provider found')
      }

      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      })

      if (this.wallet) {
        this.wallet.chainId = chainId
        this.emit('networkChanged', chainId)
      }

      console.log('✅ Network switched to:', chainId)
    } catch (error) {
      console.error('❌ Failed to switch network:', error)
      throw error
    }
  }

  /**
   * Get token balances
   */
  async getTokenBalances(tokenAddresses: string[]): Promise<TokenBalance[]> {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not connected')
      }

      const balances: TokenBalance[] = []

      for (const tokenAddress of tokenAddresses) {
        try {
          // This is a simplified version - in production, you'd use proper ERC20 contract calls
          const balance = await this.provider.request({
            method: 'eth_call',
            params: [{
              to: tokenAddress,
              data: `0x70a08231000000000000000000000000${this.wallet.address.slice(2)}`
            }, 'latest']
          })

          balances.push({
            symbol: 'TOKEN', // Would get from contract
            balance: this.formatBalance(balance),
            decimals: 18, // Would get from contract
            address: tokenAddress,
            value: 0 // Would calculate USD value
          })
        } catch (error) {
          console.warn(`Failed to get balance for token ${tokenAddress}:`, error)
        }
      }

      return balances
    } catch (error) {
      console.error('❌ Failed to get token balances:', error)
      throw error
    }
  }

  /**
   * Send transaction
   */
  async sendTransaction(to: string, value: string, data?: string): Promise<string> {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not connected')
      }

      const txParams = {
        from: this.wallet.address,
        to,
        value: `0x${parseInt(value).toString(16)}`,
        data: data || '0x'
      }

      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [txParams]
      })

      this.emit('transactionSent', { hash: txHash, ...txParams })
      console.log('✅ Transaction sent:', txHash)
      
      return txHash
    } catch (error) {
      console.error('❌ Failed to send transaction:', error)
      throw error
    }
  }

  /**
   * Sign message
   */
  async signMessage(message: string): Promise<string> {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not connected')
      }

      const signature = await this.provider.request({
        method: 'personal_sign',
        params: [message, this.wallet.address]
      })

      console.log('✅ Message signed')
      return signature
    } catch (error) {
      console.error('❌ Failed to sign message:', error)
      throw error
    }
  }

  /**
   * Get current wallet info
   */
  getWalletInfo(): WalletInfo | null {
    return this.wallet
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.wallet?.isConnected || false
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.provider) return

    // Account changed
    this.provider.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnectWallet()
      } else if (this.wallet) {
        this.wallet.address = accounts[0]
        this.emit('accountChanged', accounts[0])
      }
    })

    // Chain changed
    this.provider.on('chainChanged', (chainId: string) => {
      if (this.wallet) {
        this.wallet.chainId = parseInt(chainId, 16)
        this.emit('networkChanged', this.wallet.chainId)
      }
    })

    // Disconnect
    this.provider.on('disconnect', () => {
      this.disconnectWallet()
    })
  }

  /**
   * Format balance from wei to ether
   */
  private formatBalance(balance: string): string {
    const balanceInWei = parseInt(balance, 16)
    const balanceInEther = balanceInWei / Math.pow(10, 18)
    return balanceInEther.toFixed(6)
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.removeAllListeners()
    this.wallet = null
    this.provider = null
    this.isInitialized = false
    console.log('🧹 Wallet Service destroyed')
  }
}

// Singleton instance
export const walletService = new WalletService()
export default walletService
