import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown,
  Check,
  Search,
  Globe,
  Zap,
  Activity,
  DollarSign,
  Clock,
  Shield,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'
import MultiChainService, { ChainConfig, ChainMetrics } from '../services/MultiChainService'

interface ChainSelectorProps {
  selectedChain?: string
  onChainSelect?: (chainId: string) => void
  showMetrics?: boolean
  showMultiSelect?: boolean
  selectedChains?: string[]
  onMultiSelect?: (chainIds: string[]) => void
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'detailed'
}

const ChainSelector: React.FC<ChainSelectorProps> = ({
  selectedChain,
  onChainSelect,
  showMetrics = false,
  showMultiSelect = false,
  selectedChains = [],
  onMultiSelect,
  placeholder = 'Select blockchain',
  disabled = false,
  size = 'md',
  variant = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [supportedChains, setSupportedChains] = useState<ChainConfig[]>([])
  const [chainMetrics, setChainMetrics] = useState<{ [chainId: string]: ChainMetrics }>({})
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const multiChainService = MultiChainService.getInstance()

  // Initialize chains and metrics
  useEffect(() => {
    loadChains()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load chains and metrics
  const loadChains = async () => {
    setIsLoading(true)
    
    try {
      const chains = multiChainService.getSupportedChains()
      setSupportedChains(chains)

      if (showMetrics) {
        const metrics: { [chainId: string]: ChainMetrics } = {}
        for (const chain of chains) {
          metrics[chain.id] = await multiChainService.getChainMetrics(chain.id)
        }
        setChainMetrics(metrics)
      }
    } catch (error) {
      console.error('Error loading chains:', error)
    }
    
    setIsLoading(false)
  }

  // Filter chains based on search term
  const filteredChains = supportedChains.filter(chain =>
    chain.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chain.nativeToken.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle chain selection
  const handleChainSelect = (chainId: string) => {
    if (showMultiSelect) {
      const newSelection = selectedChains.includes(chainId)
        ? selectedChains.filter(id => id !== chainId)
        : [...selectedChains, chainId]
      onMultiSelect?.(newSelection)
    } else {
      onChainSelect(chainId)
      setIsOpen(false)
    }
  }

  // Get selected chain
  const getSelectedChain = (): ChainConfig | undefined => {
    return supportedChains.find(chain => chain.id === selectedChain)
  }

  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  // Format percentage
  const formatPercent = (value: number): string => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  // Get performance color
  const getPerformanceColor = (value: number): string => {
    if (value > 0) return 'text-green-400'
    if (value < 0) return 'text-red-400'
    return 'text-white/60'
  }

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'px-3 py-2 text-sm'
      case 'lg': return 'px-6 py-4 text-lg'
      default: return 'px-4 py-3'
    }
  }

  // Render chain item
  const renderChainItem = (chain: ChainConfig, isSelected: boolean) => {
    const metrics = chainMetrics[chain.id]

    if (variant === 'compact') {
      return (
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: chain.color }}
          >
            {chain.icon}
          </div>
          <span className="text-white font-medium">{chain.displayName}</span>
          {isSelected && <Check className="w-4 h-4 text-green-400 ml-auto" />}
        </div>
      )
    }

    if (variant === 'detailed' && metrics) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: chain.color }}
              >
                {chain.icon}
              </div>
              <div>
                <h4 className="text-white font-medium">{chain.displayName}</h4>
                <p className="text-white/60 text-sm">{chain.nativeToken.symbol}</p>
              </div>
            </div>
            {isSelected && <Check className="w-5 h-5 text-green-400" />}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/60">Price:</span>
              <div className="flex items-center gap-1">
                <span className="text-white">{formatCurrency(metrics.price)}</span>
                <span className={getPerformanceColor(metrics.priceChange24h)}>
                  {formatPercent(metrics.priceChange24h)}
                </span>
              </div>
            </div>
            <div>
              <span className="text-white/60">TVL:</span>
              <div className="text-white">{formatCurrency(metrics.tvl)}</div>
            </div>
            <div>
              <span className="text-white/60">TPS:</span>
              <div className="text-white">{metrics.tps.toFixed(0)}</div>
            </div>
            <div>
              <span className="text-white/60">Gas:</span>
              <div className="text-white">{metrics.gasPrice.toFixed(1)} gwei</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-400" />
              <span className="text-white/60">{metrics.transactions24h.toLocaleString()} txns</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-400" />
              <span className="text-white/60">Block #{metrics.blockHeight.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )
    }

    // Default variant
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: chain.color }}
          >
            {chain.icon}
          </div>
          <div>
            <h4 className="text-white font-medium">{chain.displayName}</h4>
            <p className="text-white/60 text-sm">{chain.nativeToken.symbol}</p>
          </div>
        </div>
        {isSelected && <Check className="w-5 h-5 text-green-400" />}
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between bg-white/10 border border-white/20 rounded-lg text-white transition-colors focus:outline-none focus:border-purple-400 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed ${getSizeClasses()}`}
      >
        <div className="flex items-center gap-3">
          {showMultiSelect ? (
            selectedChains.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-white">{selectedChains.length} chains selected</span>
                {selectedChains.length <= 3 && (
                  <div className="flex -space-x-1">
                    {selectedChains.map(chainId => {
                      const chain = supportedChains.find(c => c.id === chainId)
                      return chain ? (
                        <div
                          key={chainId}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white/20"
                          style={{ backgroundColor: chain.color }}
                        >
                          {chain.icon}
                        </div>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-white/60">{placeholder}</span>
            )
          ) : (
            selectedChain ? (
              (() => {
                const chain = getSelectedChain()
                return chain ? (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: chain.color }}
                    >
                      {chain.icon}
                    </div>
                    <span className="text-white">{chain.displayName}</span>
                  </div>
                ) : (
                  <span className="text-white/60">{placeholder}</span>
                )
              })()
            ) : (
              <span className="text-white/60">{placeholder}</span>
            )
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden"
          >
            {/* Search */}
            {filteredChains.length > 5 && (
              <div className="p-3 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search chains..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            )}

            {/* Multi-select controls */}
            {showMultiSelect && (
              <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-white/60 text-sm">
                  {selectedChains.length} of {filteredChains.length} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onMultiSelect?.(filteredChains.map(c => c.id))}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => onMultiSelect?.([])}
                    className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white text-xs transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Chain List */}
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-center">
                  <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-white/60 text-sm">Loading chains...</p>
                </div>
              ) : filteredChains.length === 0 ? (
                <div className="p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">No chains found</p>
                </div>
              ) : (
                filteredChains.map((chain) => {
                  const isSelected = showMultiSelect 
                    ? selectedChains.includes(chain.id)
                    : selectedChain === chain.id

                  return (
                    <motion.button
                      key={chain.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => handleChainSelect(chain.id)}
                      className={`w-full p-4 text-left hover:bg-white/10 transition-colors ${
                        isSelected ? 'bg-purple-600/20' : ''
                      } ${variant === 'detailed' ? 'border-b border-white/5' : ''}`}
                    >
                      {renderChainItem(chain, isSelected)}
                    </motion.button>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {showMultiSelect && selectedChains.length > 0 && (
              <div className="p-3 border-t border-white/10 bg-white/5">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                >
                  Apply Selection ({selectedChains.length})
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChainSelector
