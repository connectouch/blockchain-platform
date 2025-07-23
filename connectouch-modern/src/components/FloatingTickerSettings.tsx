import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  X, 
  Monitor, 
  Clock, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown,
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react'
import { useFloatingTicker } from '../hooks/useFloatingTicker'

interface FloatingTickerSettingsProps {
  isOpen: boolean
  onClose: () => void
}

const AVAILABLE_SYMBOLS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'BNB', name: 'BNB' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'MATIC', name: 'Polygon' },
  { symbol: 'UNI', name: 'Uniswap' },
  { symbol: 'AAVE', name: 'Aave' },
  { symbol: 'COMP', name: 'Compound' }
]

const REFRESH_INTERVALS = [
  { value: 10000, label: '10 seconds' },
  { value: 30000, label: '30 seconds' },
  { value: 60000, label: '1 minute' },
  { value: 300000, label: '5 minutes' }
]

const FloatingTickerSettings: React.FC<FloatingTickerSettingsProps> = ({
  isOpen,
  onClose
}) => {
  const { preferences, updatePreferences, toggleTicker, resetPreferences } = useFloatingTicker()
  const [tempSymbols, setTempSymbols] = useState(preferences.symbols)

  const handleSymbolToggle = (symbol: string) => {
    const newSymbols = tempSymbols.includes(symbol)
      ? tempSymbols.filter(s => s !== symbol)
      : [...tempSymbols, symbol]
    
    setTempSymbols(newSymbols)
    updatePreferences({ symbols: newSymbols })
  }

  const handlePositionChange = (position: 'top' | 'bottom') => {
    updatePreferences({ position })
  }

  const handleAutoHideToggle = () => {
    updatePreferences({ autoHide: !preferences.autoHide })
  }

  const handleRefreshIntervalChange = (interval: number) => {
    updatePreferences({ refreshInterval: interval })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="glass-card backdrop-blur-xl bg-black/40 border border-white/20 rounded-2xl shadow-2xl m-4">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Floating Ticker Settings
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              {/* Settings Content */}
              <div className="p-6 space-y-6">
                {/* Enable/Disable Ticker */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">Enable Ticker</span>
                  </div>
                  <button
                    onClick={toggleTicker}
                    className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${preferences.isEnabled ? 'bg-blue-500' : 'bg-gray-600'}
                    `}
                  >
                    <div
                      className={`
                        absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                        ${preferences.isEnabled ? 'translate-x-7' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                {/* Position */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <ArrowUp className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">Position</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handlePositionChange('top')}
                      className={`
                        p-3 rounded-lg border transition-colors flex items-center justify-center gap-2
                        ${preferences.position === 'top' 
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }
                      `}
                    >
                      <ArrowUp className="w-4 h-4" />
                      Top
                    </button>
                    <button
                      onClick={() => handlePositionChange('bottom')}
                      className={`
                        p-3 rounded-lg border transition-colors flex items-center justify-center gap-2
                        ${preferences.position === 'bottom' 
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }
                      `}
                    >
                      <ArrowDown className="w-4 h-4" />
                      Bottom
                    </button>
                  </div>
                </div>

                {/* Auto Hide */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {preferences.autoHide ? (
                      <EyeOff className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-blue-400" />
                    )}
                    <div>
                      <span className="text-white font-medium">Auto Hide</span>
                      <p className="text-xs text-white/60">Hide when inactive</p>
                    </div>
                  </div>
                  <button
                    onClick={handleAutoHideToggle}
                    className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${preferences.autoHide ? 'bg-blue-500' : 'bg-gray-600'}
                    `}
                  >
                    <div
                      className={`
                        absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                        ${preferences.autoHide ? 'translate-x-7' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                {/* Refresh Interval */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <RefreshCw className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">Refresh Interval</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {REFRESH_INTERVALS.map((interval) => (
                      <button
                        key={interval.value}
                        onClick={() => handleRefreshIntervalChange(interval.value)}
                        className={`
                          p-2 rounded-lg border transition-colors text-sm
                          ${preferences.refreshInterval === interval.value 
                            ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                          }
                        `}
                      >
                        {interval.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cryptocurrency Selection */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">
                      Cryptocurrencies ({tempSymbols.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {AVAILABLE_SYMBOLS.map((crypto) => (
                      <button
                        key={crypto.symbol}
                        onClick={() => handleSymbolToggle(crypto.symbol)}
                        className={`
                          p-2 rounded-lg border transition-colors text-xs
                          ${tempSymbols.includes(crypto.symbol)
                            ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                          }
                        `}
                      >
                        <div className="font-medium">{crypto.symbol}</div>
                        <div className="text-xs opacity-70">{crypto.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset Button */}
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={resetPreferences}
                    className="w-full p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 transition-colors"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default FloatingTickerSettings
