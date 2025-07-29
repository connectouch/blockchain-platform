import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Wallet, 
  Activity, 
  Settings,
  ChevronDown,
  ExternalLink
} from 'lucide-react'
import { useWallet, useFormattedWalletAddress, useAppActions } from '@stores/useAppStore'
import WalletConnector from './WalletConnector'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Activity },
  { name: 'Portfolio', href: '/portfolio', icon: '💼' },
  { name: 'Multi-Chain', href: '/multi-chain', icon: '🌐' },
  { name: 'DeFi', href: '/defi', icon: '💰' },
  { name: 'NFTs', href: '/nft', icon: '🎨' },
  { name: 'GameFi', href: '/gamefi', icon: '🎮' },
  { name: 'DAOs', href: '/dao', icon: '🏛️' },
  { name: 'Infrastructure', href: '/infrastructure', icon: '⚡' },
  { name: 'Web3 Tools', href: '/web3-tools', icon: '🔧' },
  { name: 'Analysis', href: '/analysis', icon: '🧠' },
]

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false)
  const location = useLocation()
  const wallet = useWallet()
  const formattedAddress = useFormattedWalletAddress()
  const { disconnectWallet } = useAppActions()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const handleDisconnectWallet = () => {
    disconnectWallet()
    setIsWalletMenuOpen(false)
  }

  return (
    <nav className="relative z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-bold text-xl">C</span>
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold gradient-text">Connectouch</h1>
              <p className="text-xs text-white/60">Blockchain AI Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-white bg-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {typeof item.icon === 'string' ? (
                      <span className="text-lg">{item.icon}</span>
                    ) : (
                      <item.icon className="w-4 h-4" />
                    )}
                    <span>{item.name}</span>
                  </div>
                  {active && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg border border-blue-500/30"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Wallet & Settings */}
          <div className="flex items-center space-x-4">
            {/* System Status */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-medium">Online</span>
            </div>

            {/* Wallet Connection */}
            {wallet?.isConnected ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg text-white hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-200"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-medium">{formattedAddress}</span>
                  <ChevronDown className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                  {isWalletMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl"
                    >
                      <div className="p-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Connected</p>
                            <p className="text-white/60 text-sm">{formattedAddress}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <button className="w-full flex items-center space-x-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                            <ExternalLink className="w-4 h-4" />
                            <span className="text-sm">View on Explorer</span>
                          </button>
                          <button
                            onClick={handleDisconnectWallet}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span className="text-sm">Disconnect</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <WalletConnector />
            )}

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black/40 backdrop-blur-lg border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'text-white bg-white/10'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {typeof item.icon === 'string' ? (
                      <span className="text-lg">{item.icon}</span>
                    ) : (
                      <item.icon className="w-5 h-5" />
                    )}
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
