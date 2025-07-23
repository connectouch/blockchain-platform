import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { Brain, TrendingUp, DollarSign, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react'
import ApiService from '../services/api'
import LoadingSpinner from '@components/LoadingSpinner'

// Advanced Analysis Components
import AdvancedTradingChart from '../components/AdvancedTradingChart'
import TechnicalIndicators from '../components/TechnicalIndicators'
import BacktestingEngine from '../components/BacktestingEngine'
import AITradingSignals from '../components/AITradingSignals'
import PatternRecognition from '../components/PatternRecognition'
import PortfolioAnalytics from '../components/PortfolioAnalytics'
import AlertSystem from '../components/AlertSystem'

const AnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'charts' | 'indicators' | 'backtest' | 'signals' | 'patterns' | 'portfolio' | 'alerts'>('charts')
  const [selectedSymbol, setSelectedSymbol] = useState('BTC')
  const [walletAddress, setWalletAddress] = useState('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  // Portfolio analysis mutation (keeping for legacy support)
  const analysisMutation = useMutation({
    mutationFn: () => ApiService.getPortfolioAnalysis(walletAddress || undefined),
    onSuccess: (data) => {
      setAnalysisResult(data.data)
    },
    onError: (error) => {
      console.error('Analysis failed:', error)
    }
  })

  const handleAnalyze = () => {
    analysisMutation.mutate()
  }

  // Mock data for demonstrations
  const mockPriceData = Array.from({ length: 100 }, (_, i) => 45000 + Math.sin(i * 0.1) * 5000 + Math.random() * 2000)
  const mockVolumeData = Array.from({ length: 100 }, () => 500000 + Math.random() * 1000000)
  const mockHistoricalData = Array.from({ length: 365 }, (_, i) => ({
    timestamp: Date.now() - (365 - i) * 24 * 60 * 60 * 1000,
    open: 40000 + Math.random() * 20000,
    high: 42000 + Math.random() * 20000,
    low: 38000 + Math.random() * 20000,
    close: 41000 + Math.random() * 20000,
    volume: 500000 + Math.random() * 1000000
  }))

  const mockHoldings = [
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

  const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'UNI', 'AAVE']

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Advanced Analysis</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Professional trading tools with advanced technical analysis, backtesting, and AI-powered insights
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 bg-white/5 p-2 rounded-lg">
            {[
              { id: 'charts', label: 'Trading Charts', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'indicators', label: 'Technical Indicators', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'backtest', label: 'Backtesting', icon: <Brain className="w-4 h-4" /> },
              { id: 'signals', label: 'AI Signals', icon: <AlertTriangle className="w-4 h-4" /> },
              { id: 'patterns', label: 'Pattern Recognition', icon: <CheckCircle className="w-4 h-4" /> },
              { id: 'portfolio', label: 'Portfolio Analytics', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'alerts', label: 'Alert System', icon: <Brain className="w-4 h-4" /> }
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

        {/* Symbol Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <label className="text-white font-medium">Symbol:</label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
            >
              {symbols.map(symbol => (
                <option key={symbol} value={symbol} className="bg-gray-800">{symbol}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Enhanced Analysis Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {activeTab === 'charts' && (
            <AdvancedTradingChart
              symbol={selectedSymbol}
              data={mockHistoricalData}
              onTimeframeChange={(timeframe) => console.log('Timeframe changed:', timeframe)}
              onSymbolChange={(symbol) => setSelectedSymbol(symbol)}
            />
          )}

          {activeTab === 'indicators' && (
            <TechnicalIndicators
              symbol={selectedSymbol}
              priceData={mockPriceData}
              volumeData={mockVolumeData}
              onIndicatorChange={(indicators) => console.log('Indicators changed:', indicators)}
            />
          )}

          {activeTab === 'backtest' && (
            <BacktestingEngine
              symbol={selectedSymbol}
              historicalData={mockHistoricalData}
              onStrategyChange={(strategy) => console.log('Strategy changed:', strategy)}
            />
          )}

          {activeTab === 'signals' && (
            <AITradingSignals
              symbols={symbols}
              onSignalAction={(signal, action) => console.log('Signal action:', signal, action)}
            />
          )}

          {activeTab === 'patterns' && (
            <PatternRecognition
              symbol={selectedSymbol}
              priceData={mockPriceData}
              volumeData={mockVolumeData}
              onPatternDetected={(pattern) => console.log('Pattern detected:', pattern)}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioAnalytics
              walletAddress={walletAddress}
              holdings={mockHoldings}
              isLoading={analysisMutation.isPending}
              onRebalance={() => console.log('Rebalance requested')}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertSystem
              symbols={symbols}
              onAlertTriggered={(alert) => console.log('Alert triggered:', alert)}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AnalysisPage
