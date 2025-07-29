import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calculator,
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  AlertTriangle,
  Info,
  BarChart3,
  PieChart,
  Zap,
  RefreshCw
} from 'lucide-react'

interface YieldCalculation {
  principal: number
  apy: number
  timeframe: number // in days
  compoundFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  fees: {
    deposit: number
    withdrawal: number
    performance: number
  }
  results: {
    finalAmount: number
    totalEarnings: number
    netEarnings: number
    totalFees: number
    effectiveAPY: number
    dailyEarnings: number
    monthlyEarnings: number
  }
}

interface YieldStrategy {
  id: string
  name: string
  protocol: string
  apy: number
  riskLevel: 'low' | 'medium' | 'high'
  minDeposit: number
  lockPeriod: number // in days
  fees: {
    deposit: number
    withdrawal: number
    performance: number
  }
  description: string
  pros: string[]
  cons: string[]
}

interface YieldFarmingCalculatorProps {
  protocols?: any[]
  className?: string
}

const YieldFarmingCalculator: React.FC<YieldFarmingCalculatorProps> = ({
  protocols = [],
  className = ''
}) => {
  const [principal, setPrincipal] = useState<number>(10000)
  const [selectedStrategy, setSelectedStrategy] = useState<string>('')
  const [timeframe, setTimeframe] = useState<number>(365)
  const [compoundFrequency, setCompoundFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')
  const [calculation, setCalculation] = useState<YieldCalculation | null>(null)
  const [strategies, setStrategies] = useState<YieldStrategy[]>([])
  const [isCalculating, setIsCalculating] = useState(false)

  // Generate yield strategies from protocols
  useEffect(() => {
    const generateStrategies = () => {
      const baseStrategies: YieldStrategy[] = [
        {
          id: 'stable-farming',
          name: 'Stable Coin Farming',
          protocol: 'Compound',
          apy: 4.5,
          riskLevel: 'low',
          minDeposit: 100,
          lockPeriod: 0,
          fees: { deposit: 0, withdrawal: 0, performance: 0 },
          description: 'Low-risk farming with stablecoins like USDC/USDT',
          pros: ['Low risk', 'No impermanent loss', 'Stable returns'],
          cons: ['Lower yields', 'Inflation risk']
        },
        {
          id: 'eth-staking',
          name: 'ETH Liquid Staking',
          protocol: 'Lido',
          apy: 5.2,
          riskLevel: 'medium',
          minDeposit: 0.1,
          lockPeriod: 0,
          fees: { deposit: 0, withdrawal: 0, performance: 10 },
          description: 'Stake ETH while maintaining liquidity through stETH',
          pros: ['Liquid staking', 'ETH exposure', 'Decent yields'],
          cons: ['Smart contract risk', 'Slashing risk']
        },
        {
          id: 'defi-blue-chip',
          name: 'Blue Chip DeFi',
          protocol: 'Aave',
          apy: 8.7,
          riskLevel: 'medium',
          minDeposit: 1000,
          lockPeriod: 0,
          fees: { deposit: 0.1, withdrawal: 0.1, performance: 0 },
          description: 'Lending on established protocols like Aave, Compound',
          pros: ['Established protocols', 'Good liquidity', 'Proven track record'],
          cons: ['Moderate risk', 'Variable rates']
        },
        {
          id: 'high-yield-farming',
          name: 'High Yield Farming',
          protocol: 'PancakeSwap',
          apy: 45.8,
          riskLevel: 'high',
          minDeposit: 500,
          lockPeriod: 30,
          fees: { deposit: 0.25, withdrawal: 0.25, performance: 2 },
          description: 'High-risk, high-reward farming on newer protocols',
          pros: ['Very high yields', 'Early adopter advantage'],
          cons: ['High risk', 'Impermanent loss', 'Rug pull risk']
        }
      ]

      // Add strategies from actual protocols if available
      const protocolStrategies = protocols.slice(0, 3).map((protocol, index) => {
        const apy = typeof protocol.apy === 'number' && !isNaN(protocol.apy) ? protocol.apy : 0
        return {
          id: `protocol-${index}`,
          name: `${protocol.name} Farming`,
          protocol: protocol.name,
          apy: apy,
          riskLevel: (apy > 20 ? 'high' : apy > 10 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
          minDeposit: 100,
          lockPeriod: Math.floor(Math.random() * 90),
          fees: {
            deposit: Math.random() * 0.5,
            withdrawal: Math.random() * 0.5,
            performance: Math.random() * 3
          },
          description: `Yield farming on ${protocol.name} protocol`,
          pros: ['Protocol specific benefits', 'Competitive yields'],
          cons: ['Protocol risk', 'Market volatility']
        }
      })

      setStrategies([...baseStrategies, ...protocolStrategies])
    }

    generateStrategies()
  }, [protocols])

  // Calculate yield farming returns
  const calculateYield = () => {
    if (!selectedStrategy || principal <= 0) return

    setIsCalculating(true)
    
    setTimeout(() => {
      const strategy = strategies.find(s => s.id === selectedStrategy)
      if (!strategy) return

      const strategyApy = typeof strategy.apy === 'number' && !isNaN(strategy.apy) ? strategy.apy : 0
      const apy = strategyApy / 100
      const days = timeframe
      const compoundingPerYear = {
        daily: 365,
        weekly: 52,
        monthly: 12,
        yearly: 1
      }[compoundFrequency]

      // Calculate compound interest
      const finalAmount = principal * Math.pow(1 + apy / compoundingPerYear, compoundingPerYear * (days / 365))
      const totalEarnings = finalAmount - principal

      // Calculate fees with safety checks
      const depositFeeRate = typeof strategy.fees.deposit === 'number' ? strategy.fees.deposit : 0
      const withdrawalFeeRate = typeof strategy.fees.withdrawal === 'number' ? strategy.fees.withdrawal : 0
      const performanceFeeRate = typeof strategy.fees.performance === 'number' ? strategy.fees.performance : 0

      const depositFee = principal * (depositFeeRate / 100)
      const withdrawalFee = finalAmount * (withdrawalFeeRate / 100)
      const performanceFee = totalEarnings * (performanceFeeRate / 100)
      const totalFees = depositFee + withdrawalFee + performanceFee
      
      const netEarnings = totalEarnings - totalFees
      const effectiveAPY = (netEarnings / principal) * (365 / days) * 100
      const dailyEarnings = netEarnings / days
      const monthlyEarnings = dailyEarnings * 30

      const result: YieldCalculation = {
        principal,
        apy: strategyApy,
        timeframe: days,
        compoundFrequency,
        fees: strategy.fees,
        results: {
          finalAmount: finalAmount - totalFees,
          totalEarnings,
          netEarnings,
          totalFees,
          effectiveAPY,
          dailyEarnings,
          monthlyEarnings
        }
      }

      setCalculation(result)
      setIsCalculating(false)
    }, 500)
  }

  // Auto-calculate when inputs change
  useEffect(() => {
    if (selectedStrategy && principal > 0) {
      calculateYield()
    }
  }, [selectedStrategy, principal, timeframe, compoundFrequency])

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Get risk color
  const getRiskColor = (risk: string) => {
    const colors = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-red-400'
    }
    return colors[risk as keyof typeof colors] || 'text-gray-400'
  }

  // Get risk background
  const getRiskBg = (risk: string) => {
    const backgrounds = {
      low: 'bg-green-400/20',
      medium: 'bg-yellow-400/20',
      high: 'bg-red-400/20'
    }
    return backgrounds[risk as keyof typeof backgrounds] || 'bg-gray-400/20'
  }

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Yield Farming Calculator</h3>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Investment Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                placeholder="10000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Yield Strategy
            </label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
            >
              <option value="" className="bg-gray-800">Select a strategy...</option>
              {strategies.map(strategy => (
                <option key={strategy.id} value={strategy.id} className="bg-gray-800">
                  {strategy.name} - {(typeof strategy.apy === 'number' && !isNaN(strategy.apy) ? strategy.apy : 0).toFixed(1)}% APY
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Time Period (days)
              </label>
              <input
                type="number"
                value={timeframe}
                onChange={(e) => setTimeframe(Number(e.target.value))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                min="1"
                max="3650"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Compounding
              </label>
              <select
                value={compoundFrequency}
                onChange={(e) => setCompoundFrequency(e.target.value as any)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
              >
                <option value="daily" className="bg-gray-800">Daily</option>
                <option value="weekly" className="bg-gray-800">Weekly</option>
                <option value="monthly" className="bg-gray-800">Monthly</option>
                <option value="yearly" className="bg-gray-800">Yearly</option>
              </select>
            </div>
          </div>

          {/* Strategy Details */}
          {selectedStrategy && (
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              {(() => {
                const strategy = strategies.find(s => s.id === selectedStrategy)
                if (!strategy) return null

                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{strategy.name}</h4>
                      <div className={`px-2 py-1 rounded-full ${getRiskBg(strategy.riskLevel)}`}>
                        <span className={`text-xs font-medium ${getRiskColor(strategy.riskLevel)} capitalize`}>
                          {strategy.riskLevel} Risk
                        </span>
                      </div>
                    </div>
                    <p className="text-white/60 text-sm mb-3">{strategy.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-white/50">Protocol: </span>
                        <span className="text-white">{strategy.protocol}</span>
                      </div>
                      <div>
                        <span className="text-white/50">Min Deposit: </span>
                        <span className="text-white">{formatCurrency(strategy.minDeposit)}</span>
                      </div>
                      <div>
                        <span className="text-white/50">Lock Period: </span>
                        <span className="text-white">{strategy.lockPeriod} days</span>
                      </div>
                      <div>
                        <span className="text-white/50">Performance Fee: </span>
                        <span className="text-white">{strategy.fees.performance}%</span>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {isCalculating ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 text-green-400 animate-spin" />
              <span className="ml-2 text-white/60">Calculating...</span>
            </div>
          ) : calculation ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Key Results */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-400/10 border border-green-400/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(calculation.results.finalAmount)}
                  </div>
                  <div className="text-xs text-white/60">Final Amount</div>
                </div>
                <div className="p-4 bg-blue-400/10 border border-blue-400/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {formatCurrency(calculation.results.netEarnings)}
                  </div>
                  <div className="text-xs text-white/60">Net Earnings</div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-3">Earnings Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Gross Earnings:</span>
                    <span className="text-white">{formatCurrency(calculation.results.totalEarnings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Fees:</span>
                    <span className="text-red-400">-{formatCurrency(calculation.results.totalFees)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-white/60">Net Earnings:</span>
                    <span className="text-green-400 font-medium">{formatCurrency(calculation.results.netEarnings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Effective APY:</span>
                    <span className="text-blue-400 font-medium">{(typeof calculation.results.effectiveAPY === 'number' && !isNaN(calculation.results.effectiveAPY) ? calculation.results.effectiveAPY : 0).toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {/* Periodic Earnings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-lg text-center">
                  <div className="text-lg font-bold text-white">
                    {formatCurrency(calculation.results.dailyEarnings)}
                  </div>
                  <div className="text-xs text-white/60">Daily Earnings</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg text-center">
                  <div className="text-lg font-bold text-white">
                    {formatCurrency(calculation.results.monthlyEarnings)}
                  </div>
                  <div className="text-xs text-white/60">Monthly Earnings</div>
                </div>
              </div>

              {/* Risk Warning */}
              <div className="p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-white/70">
                    <strong className="text-yellow-400">Risk Warning:</strong> Past performance doesn't guarantee future results. 
                    DeFi protocols carry smart contract, liquidity, and market risks. Only invest what you can afford to lose.
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center py-12 text-white/60">
              <Info className="w-5 h-5 mr-2" />
              Select a strategy to see calculations
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <button className="w-full text-center text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
          Explore Advanced Strategies →
        </button>
      </div>
    </div>
  )
}

export default YieldFarmingCalculator
