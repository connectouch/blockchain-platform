import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Briefcase,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  Target,
  Shield,
  Zap,
  Brain,
  Settings,
  RefreshCw,
  Download,
  // Plus,
  Eye,
  EyeOff
} from 'lucide-react'

// Import all portfolio management components
import MultiChainPortfolioTracker from '../components/MultiChainPortfolioTracker'
import AdvancedPerformanceAnalytics from '../components/AdvancedPerformanceAnalytics'
import TaxReportingSystem from '../components/TaxReportingSystem'
import AutomatedRebalancing from '../components/AutomatedRebalancing'
import RiskManagementDashboard from '../components/RiskManagementDashboard'
import YieldOptimizationHub from '../components/YieldOptimizationHub'
import AIPortfolioInsights from '../components/AIPortfolioInsights'
import { comprehensiveRealTimeService } from '../services/comprehensiveRealTimeService'

const PortfolioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tracker' | 'performance' | 'tax' | 'rebalancing' | 'risk' | 'yield' | 'ai'>('overview')
  const [realTimePrices, setRealTimePrices] = useState([])
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [portfolioData] = useState({
    totalValue: 50000,
    dayChange: 1250,
    dayChangePercent: 2.56,
    holdings: [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 0.5,
        avgPrice: 42000,
        currentPrice: 45200,
        value: 22600,
        allocation: 45.2,
        pnl: 1600,
        pnlPercent: 7.6,
        dayChange: 800,
        dayChangePercent: 3.7
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        quantity: 8,
        avgPrice: 2800,
        currentPrice: 2950,
        value: 23600,
        allocation: 47.2,
        pnl: 1200,
        pnlPercent: 5.4,
        dayChange: 400,
        dayChangePercent: 1.7
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        quantity: 40,
        avgPrice: 95,
        currentPrice: 105,
        value: 4200,
        allocation: 8.4,
        pnl: 400,
        pnlPercent: 10.5,
        dayChange: 200,
        dayChangePercent: 5.0
      }
    ]
  })
  const [timeframe, setTimeframe] = useState('1M')
  const [showPrivateData, setShowPrivateData] = useState(true)

  // Initialize real-time portfolio data
  useEffect(() => {
    const initializeRealTimeData = async () => {
      try {
        await comprehensiveRealTimeService.initialize()

        // Set up real-time price data listener
        comprehensiveRealTimeService.on('pricesUpdated', (prices) => {
          setRealTimePrices(prices)
          setLastUpdate(new Date())
        })

        // Get initial data
        const initialPrices = comprehensiveRealTimeService.getPrices()
        setRealTimePrices(initialPrices)
      } catch (error) {
        console.warn('Real-time portfolio data initialization failed:', error)
      }
    }

    initializeRealTimeData()

    return () => {
      comprehensiveRealTimeService.removeAllListeners()
    }
  }, [])

  // Format currency
  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Portfolio Management</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Professional-grade portfolio tracking, analytics, and optimization powered by AI
          </p>
        </motion.div>

        {/* Real-Time Portfolio Metrics */}
        {realTimePrices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Real-Time Market Data</h3>
                <span className="text-sm text-green-400">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-white/60 text-sm">Total Market Cap</p>
                  <p className="text-2xl font-bold text-white">
                    ${(realTimePrices.reduce((sum, p) => sum + p.marketCap, 0) / 1e12).toFixed(2)}T
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-white/60 text-sm">24h Volume</p>
                  <p className="text-2xl font-bold text-white">
                    ${(realTimePrices.reduce((sum, p) => sum + p.volume24h, 0) / 1e9).toFixed(1)}B
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-white/60 text-sm">BTC Price</p>
                  <p className="text-2xl font-bold text-white">
                    ${realTimePrices.find(p => p.symbol === 'BITCOIN')?.price.toLocaleString() || 'N/A'}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-white/60 text-sm">ETH Price</p>
                  <p className="text-2xl font-bold text-white">
                    ${realTimePrices.find(p => p.symbol === 'ETHEREUM')?.price.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Portfolio Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="glass-card p-6 text-center">
            <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Total Value</h3>
            <p className="text-3xl font-bold text-white">
              {showPrivateData ? formatCurrency(portfolioData.totalValue) : '••••••'}
            </p>
          </div>
          <div className="glass-card p-6 text-center">
            <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">24h Change</h3>
            <p className={`text-3xl font-bold ${getPerformanceColor(portfolioData.dayChange)}`}>
              {showPrivateData ? formatCurrency(portfolioData.dayChange) : '••••••'}
            </p>
            <p className={`text-sm ${getPerformanceColor(portfolioData.dayChangePercent)}`}>
              {showPrivateData ? formatPercent(portfolioData.dayChangePercent) : '••••'}
            </p>
          </div>
          <div className="glass-card p-6 text-center">
            <PieChart className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Holdings</h3>
            <p className="text-3xl font-bold text-white">{portfolioData.holdings.length}</p>
            <p className="text-sm text-white/60">Assets</p>
          </div>
          <div className="glass-card p-6 text-center">
            <Target className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Performance</h3>
            <p className="text-3xl font-bold text-green-400">+12.4%</p>
            <p className="text-sm text-white/60">30-day return</p>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <select
              value={timeframe}
              onChange={(e) => {
                setTimeframe(e.target.value)
                console.log(`Portfolio timeframe changed to: ${e.target.value}`)
                // Add logic to fetch data for the selected timeframe
                // This would trigger a re-fetch of portfolio performance data
              }}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
            >
              <option value="1D" className="bg-gray-800">1 Day</option>
              <option value="1W" className="bg-gray-800">1 Week</option>
              <option value="1M" className="bg-gray-800">1 Month</option>
              <option value="3M" className="bg-gray-800">3 Months</option>
              <option value="1Y" className="bg-gray-800">1 Year</option>
              <option value="ALL" className="bg-gray-800">All Time</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPrivateData(!showPrivateData)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showPrivateData 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {showPrivateData ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showPrivateData ? 'Hide' : 'Show'} Values
            </button>
            <button
              onClick={() => {
                // Refresh portfolio data
                console.log('Refreshing portfolio data...')
                // Add actual refresh logic here
                window.location.reload()
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Refresh Portfolio Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                // Export portfolio data
                const portfolioReport = {
                  totalValue: portfolioData.totalValue,
                  holdings: portfolioData.holdings,
                  exportDate: new Date().toISOString(),
                  timeframe: timeframe
                }
                const dataStr = JSON.stringify(portfolioReport, null, 2)
                const dataBlob = new Blob([dataStr], {type: 'application/json'})
                const url = URL.createObjectURL(dataBlob)
                const link = document.createElement('a')
                link.href = url
                link.download = `portfolio-report-${new Date().toISOString().split('T')[0]}.json`
                link.click()
                URL.revokeObjectURL(url)
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Export Portfolio Report"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                // Open portfolio settings modal
                alert('Portfolio Settings:\n\n• Currency: USD\n• Update Frequency: Real-time\n• Privacy Mode: ' + (showPrivateData ? 'Off' : 'On') + '\n• Notifications: Enabled\n\nSettings panel coming soon!')
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Portfolio Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 bg-white/5 p-2 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'tracker', label: 'Multi-Chain Tracker', icon: <Target className="w-4 h-4" /> },
              { id: 'performance', label: 'Performance Analytics', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'tax', label: 'Tax Reporting', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'rebalancing', label: 'Auto Rebalancing', icon: <PieChart className="w-4 h-4" /> },
              { id: 'risk', label: 'Risk Management', icon: <Shield className="w-4 h-4" /> },
              { id: 'yield', label: 'Yield Optimization', icon: <Zap className="w-4 h-4" /> },
              { id: 'ai', label: 'AI Insights', icon: <Brain className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Portfolio Summary */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Portfolio Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-white/80 font-medium mb-3">Asset Allocation</h4>
                    <div className="space-y-2">
                      {portfolioData.holdings.map((holding, index) => (
                        <div key={holding.symbol} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: ['#8b5cf6', '#10b981', '#f59e0b'][index] }}
                            />
                            <span className="text-white">{holding.symbol}</span>
                          </div>
                          <span className="text-white/60">{holding.allocation.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white/80 font-medium mb-3">Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/60">Total P&L:</span>
                        <span className="text-green-400">+{formatCurrency(3200)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Best Performer:</span>
                        <span className="text-green-400">SOL (+10.5%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Sharpe Ratio:</span>
                        <span className="text-white">1.42</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white/80 font-medium mb-3">Risk Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/60">Portfolio Risk:</span>
                        <span className="text-yellow-400">Medium</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Max Drawdown:</span>
                        <span className="text-red-400">-15.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Volatility:</span>
                        <span className="text-white">32.4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('rebalancing')}
                    className="flex items-center gap-3 p-4 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors"
                  >
                    <PieChart className="w-6 h-6 text-purple-400" />
                    <div className="text-left">
                      <div className="text-white font-medium">Rebalance</div>
                      <div className="text-white/60 text-sm">Optimize allocation</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('yield')}
                    className="flex items-center gap-3 p-4 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors"
                  >
                    <Zap className="w-6 h-6 text-green-400" />
                    <div className="text-left">
                      <div className="text-white font-medium">Find Yield</div>
                      <div className="text-white/60 text-sm">Earn more rewards</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('risk')}
                    className="flex items-center gap-3 p-4 bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg transition-colors"
                  >
                    <Shield className="w-6 h-6 text-yellow-400" />
                    <div className="text-left">
                      <div className="text-white font-medium">Check Risk</div>
                      <div className="text-white/60 text-sm">Analyze exposure</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('ai')}
                    className="flex items-center gap-3 p-4 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
                  >
                    <Brain className="w-6 h-6 text-blue-400" />
                    <div className="text-left">
                      <div className="text-white font-medium">AI Insights</div>
                      <div className="text-white/60 text-sm">Get recommendations</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tracker' && (
            <MultiChainPortfolioTracker
              onWalletConnect={(wallet) => console.log('Wallet connected:', wallet)}
              onAssetSelect={(asset, chain) => console.log('Asset selected:', asset, chain)}
            />
          )}

          {activeTab === 'performance' && (
            <AdvancedPerformanceAnalytics
              portfolioValue={portfolioData.totalValue}
              timeframe={timeframe as any}
              onTimeframeChange={setTimeframe}
            />
          )}

          {activeTab === 'tax' && (
            <TaxReportingSystem
              taxYear={2024}
              onYearChange={(year) => console.log('Tax year changed:', year)}
              onExport={(format, data) => console.log('Export:', format, data)}
            />
          )}

          {activeTab === 'rebalancing' && (
            <AutomatedRebalancing
              portfolioValue={portfolioData.totalValue}
              currentHoldings={portfolioData.holdings}
              onStrategyCreate={(strategy) => console.log('Strategy created:', strategy)}
              onRebalanceExecute={(simulation) => console.log('Rebalance executed:', simulation)}
            />
          )}

          {activeTab === 'risk' && (
            <RiskManagementDashboard
              portfolioValue={portfolioData.totalValue}
              holdings={portfolioData.holdings}
              timeframe={timeframe}
              onRiskAlert={(alert) => console.log('Risk alert:', alert)}
            />
          )}

          {activeTab === 'yield' && (
            <YieldOptimizationHub
              portfolioValue={portfolioData.totalValue}
              availableAssets={portfolioData.holdings.map(h => h.symbol)}
              onInvest={(opportunity, amount) => console.log('Investment:', opportunity, amount)}
            />
          )}

          {activeTab === 'ai' && (
            <AIPortfolioInsights
              portfolioValue={portfolioData.totalValue}
              holdings={portfolioData.holdings}
              riskProfile="moderate"
              onActionTaken={(insight, action) => console.log('Action taken:', insight, action)}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default PortfolioPage
