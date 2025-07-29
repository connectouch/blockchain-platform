import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppActions } from '@stores/useAppStore'
import type { WalletConnection } from '../types'

interface WalletProvider {
  name: string
  icon: string
  id: string
  installed: boolean
}

const WalletConnector: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [availableWallets, setAvailableWallets] = useState<WalletProvider[]>([])
  const { connectWallet } = useAppActions()

  // Check for available wallets
  useEffect(() => {
    const checkWallets = () => {
      const wallets: WalletProvider[] = [
        {
          name: 'MetaMask',
          icon: '🦊',
          id: 'metamask',
          installed: typeof window !== 'undefined' && !!window.ethereum?.isMetaMask,
        },
        {
          name: 'WalletConnect',
          icon: '🔗',
          id: 'walletconnect',
          installed: true, // Always available
        },
        {
          name: 'Coinbase Wallet',
          icon: '🔵',
          id: 'coinbase',
          installed: typeof window !== 'undefined' && !!window.ethereum?.isCoinbaseWallet,
        },
        {
          name: 'Trust Wallet',
          icon: '🛡️',
          id: 'trust',
          installed: typeof window !== 'undefined' && !!window.ethereum?.isTrust,
        },
      ]
      setAvailableWallets(wallets)
    }

    checkWallets()
    
    // Listen for wallet installation
    const handleEthereumChange = () => checkWallets()
    if (typeof window !== 'undefined') {
      window.addEventListener('ethereum#initialized', handleEthereumChange)
      return () => window.removeEventListener('ethereum#initialized', handleEthereumChange)
    }
  }, [])

  const connectToWallet = async (walletId: string) => {
    setIsConnecting(true)
    
    try {
      if (walletId === 'metamask') {
        await connectMetaMask()
      } else if (walletId === 'walletconnect') {
        await connectWalletConnect()
      } else {
        toast.error('Wallet connection not implemented yet')
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
      toast.error('Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const connectMetaMask = async () => {
    if (!window.ethereum?.isMetaMask) {
      toast.error('MetaMask not detected')
      return
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Get chain ID
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      })

      // Get balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      })

      const connection: WalletConnection = {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        isConnected: true,
        balance: balance,
        provider: window.ethereum,
      }

      connectWallet(connection)
      setIsModalOpen(false)
      toast.success(`Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)

      // Listen for account changes
      window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
        if (newAccounts.length === 0) {
          // User disconnected
          connectWallet({ ...connection, isConnected: false })
          toast.success('Wallet disconnected')
        } else {
          // Account changed
          connectWallet({ ...connection, address: newAccounts[0] || '' })
          toast.success('Account changed')
        }
      })

      // Listen for chain changes
      window.ethereum.on('chainChanged', (newChainId: string) => {
        connectWallet({ ...connection, chainId: parseInt(newChainId, 16) })
        toast.success('Network changed')
      })

    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('Connection rejected by user')
      } else {
        toast.error('Failed to connect to MetaMask')
      }
      throw error
    }
  }

  const connectWalletConnect = async () => {
    // WalletConnect implementation would go here
    toast.success('WalletConnect integration coming soon!')
  }

  const installWallet = (walletId: string) => {
    const urls: Record<string, string> = {
      metamask: 'https://metamask.io/download/',
      coinbase: 'https://www.coinbase.com/wallet',
      trust: 'https://trustwallet.com/',
    }
    
    if (urls[walletId]) {
      window.open(urls[walletId], '_blank')
    }
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsModalOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
      >
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-black/90 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
                <p className="text-white/60">Choose your preferred wallet to connect</p>
              </div>

              <div className="space-y-3">
                {availableWallets.map((wallet) => (
                  <motion.button
                    key={wallet.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => wallet.installed ? connectToWallet(wallet.id) : installWallet(wallet.id)}
                    disabled={isConnecting}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{wallet.icon}</span>
                      <div className="text-left">
                        <p className="text-white font-medium">{wallet.name}</p>
                        <p className="text-white/60 text-sm">
                          {wallet.installed ? 'Detected' : 'Not installed'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isConnecting && wallet.id === 'metamask' ? (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      ) : wallet.installed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-400 font-medium text-sm">Security Notice</p>
                    <p className="text-blue-300/80 text-xs mt-1">
                      Only connect wallets you trust. Never share your private keys or seed phrases.
                    </p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(false)}
                className="w-full mt-4 px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 border border-white/10 rounded-lg transition-all duration-200"
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}

export default WalletConnector
