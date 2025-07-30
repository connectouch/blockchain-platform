import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAIContext } from '../contexts/AIAssistantContext'
import {
  BarChart3,
  TrendingUp,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'
import SimpleTradingChartFixed from '../components/SimpleTradingChartFixed'

const ChartTestPage: React.FC = () => {
  const { setAIContext } = useAIContext()
  const [selectedSymbol, setSelectedSymbol] = useState('BTC')
  const [viewportSize, setViewportSize] = useState('desktop')

  // Set AI context for trading charts
  useEffect(() => {
    setAIContext('trading', { page: 'chart-test', symbol: selectedSymbol, viewportSize })
  }, [selectedSymbol, viewportSize])

  const testSymbols = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL']



  const ViewportButton = ({ size, icon, label }: { size: string; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => setViewportSize(size)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        viewportSize === size 
          ? 'bg-blue-500 text-white' 
          : 'bg-white/10 text-white/60 hover:bg-white/20'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          <span className="gradient-text">Advanced Trading Charts</span> Test Suite
        </h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          Comprehensive testing of real-time WebSocket streaming, technical indicators, and interactive features
        </p>
      </motion.div>

      {/* Test Status Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">System Status</h2>
          <div className="flex items-center gap-2 ml-auto">
            <Wifi className={`w-4 h-4 ${connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`} />
            <span className={`text-sm ${connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
              {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TestIndicator label="WebSocket Connection" status={testResults.websocket} />
          <TestIndicator label="Chart API" status={testResults.chartApi} />
          <TestIndicator label="Real-time Data" status={testResults.realTimeData} />
          <TestIndicator label="Backend Health" status={testResults.backendHealth} />
        </div>
      </motion.div>

      {/* Controls Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Symbol Selector */}
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-white/80 font-medium">Test Symbol:</span>
            <div className="flex gap-2">
              {testSymbols.map(symbol => (
                <button
                  key={symbol}
                  onClick={() => setSelectedSymbol(symbol)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    selectedSymbol === symbol 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Viewport Size Selector */}
          <div className="flex items-center gap-3">
            <span className="text-white/80 font-medium">Viewport:</span>
            <div className="flex gap-2">
              <ViewportButton 
                size="mobile" 
                icon={<Smartphone className="w-4 h-4" />} 
                label="Mobile" 
              />
              <ViewportButton 
                size="tablet" 
                icon={<Tablet className="w-4 h-4" />} 
                label="Tablet" 
              />
              <ViewportButton 
                size="desktop" 
                icon={<Monitor className="w-4 h-4" />} 
                label="Desktop" 
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`${
          viewportSize === 'mobile' ? 'max-w-sm mx-auto' :
          viewportSize === 'tablet' ? 'max-w-4xl mx-auto' :
          'max-w-7xl mx-auto'
        }`}
      >
        <SimpleTradingChartFixed
          symbol={selectedSymbol}
          height={viewportSize === 'mobile' ? 400 : viewportSize === 'tablet' ? 500 : 700}
          className="mb-8"
        />
      </motion.div>

      {/* Clean Chart Testing Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-7xl mx-auto text-center"
      >
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-white mb-4">
            Clean Trading Charts
          </h3>
          <p className="text-white/60 mb-6">
            Real-time cryptocurrency trading charts with clean interface and live data integration.
            No status indicators, no connection monitoring - just pure trading data visualization.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Real-time Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Clean Interface</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>No Indicators</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-12 text-white/60"
      >
        <p>🎯 Clean Trading Charts - Zero Indicators</p>
        <p className="text-sm mt-2">Real-time data • Clean interface • Professional visualization</p>
      </motion.div>
    </div>
  )
}

export default ChartTestPage
