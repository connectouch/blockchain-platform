import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calculator,
  DollarSign,
  Clock,
  TrendingUp,
  Target,
  Zap,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Star,
  Crown,
  Play,
  RefreshCw,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface P2EGame {
  id: string
  name: string
  category: string
  initialInvestment: {
    min: number
    recommended: number
    max: number
  }
  earnings: {
    daily: {
      min: number
      average: number
      max: number
    }
    monthly: {
      min: number
      average: number
      max: number
    }
  }
  timeCommitment: {
    daily: number // hours
    weekly: number // hours
  }
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  requirements: string[]
  risks: string[]
  pros: string[]
  cons: string[]
  roi: {
    breakeven: number // days
    monthly: number // percentage
    annual: number // percentage
  }
  tokenPrice: number
  volatility: number // percentage
}

interface CalculatorInputs {
  selectedGame: string
  investmentAmount: number
  hoursPerDay: number
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  riskTolerance: 'low' | 'medium' | 'high'
  timeHorizon: number // months
}

interface CalculationResults {
  dailyEarnings: number
  monthlyEarnings: number
  totalEarnings: number
  totalInvestment: number
  netProfit: number
  roi: number
  breakeven: number
  hourlyRate: number
  riskScore: number
  recommendation: string
}

const PlayToEarnCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    selectedGame: '',
    investmentAmount: 1000,
    hoursPerDay: 3,
    skillLevel: 'intermediate',
    riskTolerance: 'medium',
    timeHorizon: 6
  })

  const [results, setResults] = useState<CalculationResults | null>(null)
  const [games, setGames] = useState<P2EGame[]>([])
  const [isCalculating, setIsCalculating] = useState(false)

  // Mock P2E games data
  useEffect(() => {
    const mockGames: P2EGame[] = [
      {
        id: 'axie-infinity',
        name: 'Axie Infinity',
        category: 'Strategy',
        initialInvestment: {
          min: 150,
          recommended: 300,
          max: 1000
        },
        earnings: {
          daily: { min: 5, average: 15, max: 35 },
          monthly: { min: 150, average: 450, max: 1050 }
        },
        timeCommitment: {
          daily: 2,
          weekly: 14
        },
        difficulty: 'intermediate',
        requirements: ['3 Axies', 'Basic strategy knowledge', 'Stable internet'],
        risks: ['Token price volatility', 'Game balance changes', 'Market saturation'],
        pros: ['Established ecosystem', 'Strong community', 'Multiple earning streams'],
        cons: ['High initial investment', 'Time intensive', 'Competitive'],
        roi: {
          breakeven: 20,
          monthly: 15,
          annual: 180
        },
        tokenPrice: 6.5,
        volatility: 25
      },
      {
        id: 'splinterlands',
        name: 'Splinterlands',
        category: 'Card Game',
        initialInvestment: {
          min: 10,
          recommended: 50,
          max: 200
        },
        earnings: {
          daily: { min: 1, average: 5, max: 15 },
          monthly: { min: 30, average: 150, max: 450 }
        },
        timeCommitment: {
          daily: 1,
          weekly: 7
        },
        difficulty: 'beginner',
        requirements: ['Starter deck', 'Basic card knowledge'],
        risks: ['Card value fluctuation', 'Meta changes'],
        pros: ['Low entry cost', 'Easy to learn', 'Passive earning potential'],
        cons: ['Lower earning potential', 'Card dependency'],
        roi: {
          breakeven: 10,
          monthly: 30,
          annual: 360
        },
        tokenPrice: 0.12,
        volatility: 35
      },
      {
        id: 'the-sandbox',
        name: 'The Sandbox',
        category: 'Metaverse',
        initialInvestment: {
          min: 500,
          recommended: 1500,
          max: 5000
        },
        earnings: {
          daily: { min: 10, average: 30, max: 100 },
          monthly: { min: 300, average: 900, max: 3000 }
        },
        timeCommitment: {
          daily: 4,
          weekly: 28
        },
        difficulty: 'advanced',
        requirements: ['LAND NFT', 'VoxEdit skills', 'Game Maker knowledge'],
        risks: ['High volatility', 'Technical complexity', 'Market dependency'],
        pros: ['High earning potential', 'Creative freedom', 'Growing ecosystem'],
        cons: ['Very high investment', 'Technical skills required', 'Time intensive'],
        roi: {
          breakeven: 50,
          monthly: 20,
          annual: 240
        },
        tokenPrice: 0.45,
        volatility: 40
      }
    ]
    setGames(mockGames)
  }, [])

  // Calculate P2E earnings
  const calculateEarnings = () => {
    if (!inputs.selectedGame) return

    setIsCalculating(true)
    
    // Simulate calculation delay
    setTimeout(() => {
      const selectedGameData = games.find(g => g.id === inputs.selectedGame)
      if (!selectedGameData) return

      // Skill multiplier
      const skillMultiplier = {
        beginner: 0.7,
        intermediate: 1.0,
        advanced: 1.3
      }[inputs.skillLevel]

      // Time efficiency multiplier
      const timeEfficiency = Math.min(inputs.hoursPerDay / selectedGameData.timeCommitment.daily, 1.5)

      // Base daily earnings
      const baseDailyEarnings = selectedGameData.earnings.daily.average
      const adjustedDailyEarnings = baseDailyEarnings * skillMultiplier * timeEfficiency

      // Calculate results
      const dailyEarnings = adjustedDailyEarnings
      const monthlyEarnings = dailyEarnings * 30
      const totalEarnings = monthlyEarnings * inputs.timeHorizon
      const totalInvestment = inputs.investmentAmount
      const netProfit = totalEarnings - totalInvestment
      const roi = (netProfit / totalInvestment) * 100
      const breakeven = totalInvestment / dailyEarnings
      const hourlyRate = dailyEarnings / inputs.hoursPerDay

      // Risk assessment
      const riskFactors = [
        selectedGameData.volatility / 100,
        inputs.investmentAmount > selectedGameData.initialInvestment.recommended ? 0.2 : 0,
        inputs.skillLevel === 'beginner' ? 0.3 : 0,
        inputs.riskTolerance === 'high' ? -0.1 : 0.1
      ]
      const riskScore = Math.max(0, Math.min(100, riskFactors.reduce((sum, factor) => sum + factor, 0.3) * 100))

      // Generate recommendation
      let recommendation = ''
      if (roi > 50 && riskScore < 50) {
        recommendation = 'Excellent opportunity with strong returns and manageable risk'
      } else if (roi > 20 && riskScore < 70) {
        recommendation = 'Good opportunity with decent returns, monitor risks carefully'
      } else if (roi > 0) {
        recommendation = 'Moderate opportunity, consider reducing investment or time commitment'
      } else {
        recommendation = 'High risk scenario, consider alternative strategies'
      }

      setResults({
        dailyEarnings,
        monthlyEarnings,
        totalEarnings,
        totalInvestment,
        netProfit,
        roi,
        breakeven,
        hourlyRate,
        riskScore,
        recommendation
      })

      setIsCalculating(false)
    }, 1000)
  }

  // Format currency
  const formatCurrency = (value: number): string => {
    return `$${value.toFixed(2)}`
  }

  // Get risk color
  const getRiskColor = (score: number): string => {
    if (score < 30) return 'text-green-400'
    if (score < 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Get ROI color
  const getROIColor = (roi: number): string => {
    if (roi > 50) return 'text-green-400'
    if (roi > 20) return 'text-yellow-400'
    if (roi > 0) return 'text-blue-400'
    return 'text-red-400'
  }

  const selectedGameData = games.find(g => g.id === inputs.selectedGame)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Play-to-Earn Calculator</h2>
        <p className="text-white/60">Calculate potential earnings and ROI for blockchain games</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Calculator Inputs
            </h3>

            <div className="space-y-4">
              {/* Game Selection */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Select Game
                </label>
                <select
                  value={inputs.selectedGame}
                  onChange={(e) => setInputs(prev => ({ ...prev, selectedGame: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="" className="bg-gray-800">Choose a game...</option>
                  {games.map(game => (
                    <option key={game.id} value={game.id} className="bg-gray-800">
                      {game.name} - {game.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Investment Amount */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Initial Investment ($)
                </label>
                <input
                  type="number"
                  value={inputs.investmentAmount}
                  onChange={(e) => setInputs(prev => ({ ...prev, investmentAmount: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  min="0"
                  step="10"
                />
                {selectedGameData && (
                  <p className="text-xs text-white/60 mt-1">
                    Recommended: ${selectedGameData.initialInvestment.recommended}
                  </p>
                )}
              </div>

              {/* Hours per Day */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Hours per Day
                </label>
                <input
                  type="number"
                  value={inputs.hoursPerDay}
                  onChange={(e) => setInputs(prev => ({ ...prev, hoursPerDay: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  min="0.5"
                  max="12"
                  step="0.5"
                />
                {selectedGameData && (
                  <p className="text-xs text-white/60 mt-1">
                    Recommended: {selectedGameData.timeCommitment.daily} hours/day
                  </p>
                )}
              </div>

              {/* Skill Level */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Skill Level
                </label>
                <select
                  value={inputs.skillLevel}
                  onChange={(e) => setInputs(prev => ({ ...prev, skillLevel: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="beginner" className="bg-gray-800">Beginner</option>
                  <option value="intermediate" className="bg-gray-800">Intermediate</option>
                  <option value="advanced" className="bg-gray-800">Advanced</option>
                </select>
              </div>

              {/* Risk Tolerance */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Risk Tolerance
                </label>
                <select
                  value={inputs.riskTolerance}
                  onChange={(e) => setInputs(prev => ({ ...prev, riskTolerance: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="low" className="bg-gray-800">Low Risk</option>
                  <option value="medium" className="bg-gray-800">Medium Risk</option>
                  <option value="high" className="bg-gray-800">High Risk</option>
                </select>
              </div>

              {/* Time Horizon */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Time Horizon (months)
                </label>
                <input
                  type="number"
                  value={inputs.timeHorizon}
                  onChange={(e) => setInputs(prev => ({ ...prev, timeHorizon: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  min="1"
                  max="24"
                />
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculateEarnings}
                disabled={!inputs.selectedGame || isCalculating}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    Calculate Earnings
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Game Info */}
          {selectedGameData && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">{selectedGameData.name} Info</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Requirements:</h4>
                  <ul className="space-y-1">
                    {selectedGameData.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Risks:</h4>
                  <ul className="space-y-1">
                    {selectedGameData.risks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                        <AlertTriangle className="w-3 h-3 text-yellow-400 mt-1 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {results ? (
            <>
              {/* Earnings Overview */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Earnings Projection
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{formatCurrency(results.dailyEarnings)}</div>
                    <div className="text-xs text-white/60">Daily Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{formatCurrency(results.monthlyEarnings)}</div>
                    <div className="text-xs text-white/60">Monthly Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{formatCurrency(results.hourlyRate)}</div>
                    <div className="text-xs text-white/60">Hourly Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{Math.ceil(results.breakeven)} days</div>
                    <div className="text-xs text-white/60">Breakeven</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Investment:</span>
                    <span className="text-white">{formatCurrency(results.totalInvestment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Earnings ({inputs.timeHorizon}m):</span>
                    <span className="text-white">{formatCurrency(results.totalEarnings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Net Profit:</span>
                    <span className={getROIColor(results.roi)}>{formatCurrency(results.netProfit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">ROI:</span>
                    <span className={getROIColor(results.roi)}>{results.roi.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Risk Assessment
                </h3>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60">Risk Score</span>
                    <span className={`font-bold ${getRiskColor(results.riskScore)}`}>
                      {results.riskScore.toFixed(0)}/100
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        results.riskScore < 30 ? 'bg-green-400' : 
                        results.riskScore < 60 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${results.riskScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Recommendation:</h4>
                  <p className="text-white/80 text-sm">{results.recommendation}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-6 text-center">
              <Calculator className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Ready to Calculate</h3>
              <p className="text-white/60">Select a game and configure your parameters to see earnings projections</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlayToEarnCalculator
