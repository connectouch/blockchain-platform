import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target,
  Play,
  Pause,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Clock,
  Calendar,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Save,
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Activity,
  Award
} from 'lucide-react'

interface RebalanceStrategy {
  id: string
  name: string
  description: string
  type: 'threshold' | 'time' | 'volatility' | 'momentum'
  isActive: boolean
  targetAllocation: { [asset: string]: number }
  triggers: {
    threshold?: number
    timeInterval?: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    volatilityThreshold?: number
    momentumSignal?: boolean
  }
  constraints: {
    minTradeSize: number
    maxSlippage: number
    tradingFees: number
    taxOptimization: boolean
  }
  performance: {
    totalRebalances: number
    avgCost: number
    totalSavings: number
    lastRebalance: number
  }
  createdAt: number
}

interface CurrentAllocation {
  asset: string
  symbol: string
  currentWeight: number
  targetWeight: number
  deviation: number
  value: number
  suggestedAction: 'buy' | 'sell' | 'hold'
  suggestedAmount: number
}

interface RebalanceSimulation {
  strategy: RebalanceStrategy
  currentAllocations: CurrentAllocation[]
  projectedCosts: {
    tradingFees: number
    slippage: number
    taxImpact: number
    totalCost: number
  }
  expectedBenefit: number
  riskReduction: number
  timeToExecute: number
}

interface AutomatedRebalancingProps {
  portfolioValue: number
  currentHoldings: any[]
  onStrategyCreate?: (strategy: RebalanceStrategy) => void
  onRebalanceExecute?: (simulation: RebalanceSimulation) => void
}

const AutomatedRebalancing: React.FC<AutomatedRebalancingProps> = ({
  portfolioValue,
  currentHoldings = [],
  onStrategyCreate,
  onRebalanceExecute
}) => {
  const [activeTab, setActiveTab] = useState<'strategies' | 'simulation' | 'history' | 'settings'>('strategies')
  const [strategies, setStrategies] = useState<RebalanceStrategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<RebalanceStrategy | null>(null)
  const [currentAllocations, setCurrentAllocations] = useState<CurrentAllocation[]>([])
  const [simulation, setSimulation] = useState<RebalanceSimulation | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    description: '',
    type: 'threshold' as RebalanceStrategy['type'],
    targetAllocation: {} as { [asset: string]: number },
    threshold: 5,
    timeInterval: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly'
  })

  // Initialize strategies and allocations
  useEffect(() => {
    const mockStrategies: RebalanceStrategy[] = [
      {
        id: 'strategy-1',
        name: 'Conservative Balanced',
        description: 'Maintain 60% BTC, 30% ETH, 10% stablecoins with 5% threshold',
        type: 'threshold',
        isActive: true,
        targetAllocation: {
          'BTC': 60,
          'ETH': 30,
          'USDC': 10
        },
        triggers: {
          threshold: 5
        },
        constraints: {
          minTradeSize: 100,
          maxSlippage: 0.5,
          tradingFees: 0.1,
          taxOptimization: true
        },
        performance: {
          totalRebalances: 12,
          avgCost: 45.50,
          totalSavings: 1250,
          lastRebalance: Date.now() - 7 * 24 * 60 * 60 * 1000
        },
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000
      },
      {
        id: 'strategy-2',
        name: 'DeFi Growth',
        description: 'Aggressive allocation with 40% large cap, 40% DeFi, 20% stables',
        type: 'volatility',
        isActive: false,
        targetAllocation: {
          'BTC': 20,
          'ETH': 20,
          'UNI': 15,
          'AAVE': 15,
          'LINK': 10,
          'USDC': 20
        },
        triggers: {
          volatilityThreshold: 15
        },
        constraints: {
          minTradeSize: 50,
          maxSlippage: 1.0,
          tradingFees: 0.15,
          taxOptimization: false
        },
        performance: {
          totalRebalances: 8,
          avgCost: 78.25,
          totalSavings: 890,
          lastRebalance: Date.now() - 14 * 24 * 60 * 60 * 1000
        },
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000
      },
      {
        id: 'strategy-3',
        name: 'Monthly Rebalance',
        description: 'Time-based rebalancing every month regardless of deviation',
        type: 'time',
        isActive: false,
        targetAllocation: {
          'BTC': 50,
          'ETH': 25,
          'SOL': 15,
          'USDC': 10
        },
        triggers: {
          timeInterval: 'monthly'
        },
        constraints: {
          minTradeSize: 75,
          maxSlippage: 0.75,
          tradingFees: 0.12,
          taxOptimization: true
        },
        performance: {
          totalRebalances: 6,
          avgCost: 62.80,
          totalSavings: 420,
          lastRebalance: Date.now() - 21 * 24 * 60 * 60 * 1000
        },
        createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000
      }
    ]

    const mockAllocations: CurrentAllocation[] = [
      {
        asset: 'Bitcoin',
        symbol: 'BTC',
        currentWeight: 65.2,
        targetWeight: 60.0,
        deviation: 5.2,
        value: 32600,
        suggestedAction: 'sell',
        suggestedAmount: 2600
      },
      {
        asset: 'Ethereum',
        symbol: 'ETH',
        currentWeight: 26.8,
        targetWeight: 30.0,
        deviation: -3.2,
        value: 13400,
        suggestedAction: 'buy',
        suggestedAmount: 1600
      },
      {
        asset: 'USD Coin',
        symbol: 'USDC',
        currentWeight: 8.0,
        targetWeight: 10.0,
        deviation: -2.0,
        value: 4000,
        suggestedAction: 'buy',
        suggestedAmount: 1000
      }
    ]

    setStrategies(mockStrategies)
    setSelectedStrategy(mockStrategies[0])
    setCurrentAllocations(mockAllocations)
  }, [])

  // Run rebalance simulation
  const runSimulation = async (strategy: RebalanceStrategy) => {
    setIsSimulating(true)
    
    // Simulate calculation delay
    setTimeout(() => {
      const mockSimulation: RebalanceSimulation = {
        strategy,
        currentAllocations,
        projectedCosts: {
          tradingFees: 125.50,
          slippage: 45.20,
          taxImpact: 280.75,
          totalCost: 451.45
        },
        expectedBenefit: 1250.80,
        riskReduction: 12.5,
        timeToExecute: 15
      }
      
      setSimulation(mockSimulation)
      setIsSimulating(false)
    }, 2000)
  }

  // Create new strategy
  const createStrategy = () => {
    const strategy: RebalanceStrategy = {
      id: `strategy-${Date.now()}`,
      name: newStrategy.name,
      description: newStrategy.description,
      type: newStrategy.type,
      isActive: false,
      targetAllocation: newStrategy.targetAllocation,
      triggers: {
        threshold: newStrategy.threshold,
        timeInterval: newStrategy.timeInterval
      },
      constraints: {
        minTradeSize: 100,
        maxSlippage: 0.5,
        tradingFees: 0.1,
        taxOptimization: true
      },
      performance: {
        totalRebalances: 0,
        avgCost: 0,
        totalSavings: 0,
        lastRebalance: 0
      },
      createdAt: Date.now()
    }

    setStrategies(prev => [...prev, strategy])
    setShowCreateModal(false)
    onStrategyCreate?.(strategy)
  }

  // Toggle strategy active state
  const toggleStrategy = (id: string) => {
    setStrategies(prev => prev.map(strategy => 
      strategy.id === id 
        ? { ...strategy, isActive: !strategy.isActive }
        : { ...strategy, isActive: false } // Only one active strategy
    ))
  }

  // Format currency
  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Format percentage
  const formatPercent = (value: number): string => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  // Get deviation color
  const getDeviationColor = (deviation: number): string => {
    const abs = Math.abs(deviation)
    if (abs <= 2) return 'text-green-400'
    if (abs <= 5) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Get action color
  const getActionColor = (action: string): string => {
    switch (action) {
      case 'buy': return 'text-green-400'
      case 'sell': return 'text-red-400'
      case 'hold': return 'text-white/60'
      default: return 'text-white/60'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Automated Rebalancing</h2>
          <p className="text-white/60">Smart portfolio rebalancing with strategy templates and cost optimization</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Strategy
          </button>
          {selectedStrategy && (
            <button
              onClick={() => runSimulation(selectedStrategy)}
              disabled={isSimulating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isSimulating ? 'animate-pulse' : ''}`} />
              {isSimulating ? 'Simulating...' : 'Simulate'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { id: 'strategies', label: 'Strategies', icon: <Target className="w-4 h-4" /> },
          { id: 'simulation', label: 'Simulation', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
          { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'strategies' && (
            <div className="space-y-6">
              {/* Current Allocation */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Current vs Target Allocation</h3>
                <div className="space-y-4">
                  {currentAllocations.map((allocation, index) => (
                    <motion.div
                      key={allocation.symbol}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-4 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{allocation.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{allocation.asset}</h4>
                            <p className="text-white/60 text-sm">{formatCurrency(allocation.value)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getDeviationColor(allocation.deviation)}`}>
                            {formatPercent(allocation.deviation)}
                          </div>
                          <div className="text-white/60 text-sm">Deviation</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-white/60">Current:</span>
                          <div className="text-white font-medium">{allocation.currentWeight.toFixed(1)}%</div>
                        </div>
                        <div>
                          <span className="text-white/60">Target:</span>
                          <div className="text-white font-medium">{allocation.targetWeight.toFixed(1)}%</div>
                        </div>
                        <div>
                          <span className="text-white/60">Action:</span>
                          <div className={`font-medium capitalize ${getActionColor(allocation.suggestedAction)}`}>
                            {allocation.suggestedAction} {formatCurrency(allocation.suggestedAmount)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Strategy List */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Rebalancing Strategies</h3>
                <div className="space-y-4">
                  {strategies.map((strategy, index) => (
                    <motion.div
                      key={strategy.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        strategy.isActive 
                          ? 'border-green-400/30 bg-green-400/5' 
                          : selectedStrategy?.id === strategy.id
                          ? 'border-purple-400/30 bg-purple-400/5'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedStrategy(strategy)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium">{strategy.name}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                              strategy.type === 'threshold' ? 'bg-blue-500/20 text-blue-400' :
                              strategy.type === 'time' ? 'bg-green-500/20 text-green-400' :
                              strategy.type === 'volatility' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {strategy.type}
                            </span>
                            {strategy.isActive && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-white/60 text-sm">{strategy.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleStrategy(strategy.id)
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              strategy.isActive 
                                ? 'bg-green-600 text-white' 
                                : 'bg-white/10 text-white/60 hover:bg-white/20'
                            }`}
                          >
                            {strategy.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-white/60">Rebalances:</span>
                          <div className="text-white font-medium">{strategy.performance.totalRebalances}</div>
                        </div>
                        <div>
                          <span className="text-white/60">Avg Cost:</span>
                          <div className="text-white font-medium">{formatCurrency(strategy.performance.avgCost)}</div>
                        </div>
                        <div>
                          <span className="text-white/60">Total Savings:</span>
                          <div className="text-green-400 font-medium">{formatCurrency(strategy.performance.totalSavings)}</div>
                        </div>
                        <div>
                          <span className="text-white/60">Last Run:</span>
                          <div className="text-white/60 text-xs">
                            {strategy.performance.lastRebalance 
                              ? new Date(strategy.performance.lastRebalance).toLocaleDateString()
                              : 'Never'
                            }
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'simulation' && (
            <div className="space-y-6">
              {isSimulating ? (
                <div className="glass-card p-12 text-center">
                  <RefreshCw className="w-16 h-16 text-white/20 mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-bold text-white mb-2">Running Simulation</h3>
                  <p className="text-white/60">Calculating optimal rebalancing strategy...</p>
                </div>
              ) : simulation ? (
                <div className="space-y-6">
                  {/* Simulation Results */}
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Simulation Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{formatCurrency(simulation.expectedBenefit)}</div>
                        <div className="text-white/60 text-sm">Expected Benefit</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">{formatCurrency(simulation.projectedCosts.totalCost)}</div>
                        <div className="text-white/60 text-sm">Total Cost</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{simulation.riskReduction.toFixed(1)}%</div>
                        <div className="text-white/60 text-sm">Risk Reduction</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{simulation.timeToExecute}min</div>
                        <div className="text-white/60 text-sm">Execution Time</div>
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-medium text-white mb-3">Cost Breakdown</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-white/60">Trading Fees:</span>
                            <span className="text-white">{formatCurrency(simulation.projectedCosts.tradingFees)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Slippage:</span>
                            <span className="text-white">{formatCurrency(simulation.projectedCosts.slippage)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Tax Impact:</span>
                            <span className="text-white">{formatCurrency(simulation.projectedCosts.taxImpact)}</span>
                          </div>
                          <div className="border-t border-white/10 pt-2">
                            <div className="flex justify-between font-bold">
                              <span className="text-white">Total Cost:</span>
                              <span className="text-red-400">{formatCurrency(simulation.projectedCosts.totalCost)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-medium text-white mb-3">Net Benefit</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-white/60">Expected Benefit:</span>
                            <span className="text-green-400">{formatCurrency(simulation.expectedBenefit)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Total Costs:</span>
                            <span className="text-red-400">-{formatCurrency(simulation.projectedCosts.totalCost)}</span>
                          </div>
                          <div className="border-t border-white/10 pt-2">
                            <div className="flex justify-between font-bold">
                              <span className="text-white">Net Benefit:</span>
                              <span className="text-green-400">
                                {formatCurrency(simulation.expectedBenefit - simulation.projectedCosts.totalCost)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => onRebalanceExecute?.(simulation)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                      >
                        Execute Rebalance
                      </button>
                      <button
                        onClick={() => setSimulation(null)}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12 text-center">
                  <Target className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Simulation Running</h3>
                  <p className="text-white/60">Select a strategy and click "Simulate" to see rebalancing projections</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Rebalancing History</h3>
              <div className="space-y-4">
                {strategies.filter(s => s.performance.totalRebalances > 0).map((strategy, index) => (
                  <div key={strategy.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{strategy.name}</h4>
                      <span className="text-white/60 text-sm">
                        {new Date(strategy.performance.lastRebalance).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Total Rebalances:</span>
                        <div className="text-white">{strategy.performance.totalRebalances}</div>
                      </div>
                      <div>
                        <span className="text-white/60">Average Cost:</span>
                        <div className="text-white">{formatCurrency(strategy.performance.avgCost)}</div>
                      </div>
                      <div>
                        <span className="text-white/60">Total Savings:</span>
                        <div className="text-green-400">{formatCurrency(strategy.performance.totalSavings)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Rebalancing Settings</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Default Min Trade Size
                    </label>
                    <input
                      type="number"
                      defaultValue={100}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Max Slippage (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue={0.5}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Trading Fees (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={0.1}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-white/80">
                      <input type="checkbox" defaultChecked className="rounded" />
                      Enable Tax Optimization
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Create Strategy Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Create Rebalancing Strategy</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Strategy Name</label>
                  <input
                    type="text"
                    value={newStrategy.name}
                    onChange={(e) => setNewStrategy(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="My Strategy"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newStrategy.description}
                    onChange={(e) => setNewStrategy(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    rows={2}
                    placeholder="Strategy description..."
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Strategy Type</label>
                  <select
                    value={newStrategy.type}
                    onChange={(e) => setNewStrategy(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="threshold" className="bg-gray-800">Threshold-based</option>
                    <option value="time" className="bg-gray-800">Time-based</option>
                    <option value="volatility" className="bg-gray-800">Volatility-based</option>
                    <option value="momentum" className="bg-gray-800">Momentum-based</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createStrategy}
                    disabled={!newStrategy.name}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors disabled:opacity-50"
                  >
                    Create Strategy
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AutomatedRebalancing
