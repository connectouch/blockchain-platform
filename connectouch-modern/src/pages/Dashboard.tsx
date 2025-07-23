import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAIContext } from '../contexts/AIAssistantContext'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Activity,
  Users,
  Wifi,
  WifiOff,
  Settings,
  Maximize2,
  RefreshCw,
  PieChart,
  Brain,
  Newspaper,
  Target,
  Zap,
  Home,
  Briefcase,
  LineChart
} from 'lucide-react'

// Rich Dashboard Components
import RealTimeDashboard from '../components/RealTimeDashboard'
import RealTimePortfolioTracker from '../components/RealTimePortfolioTracker'
import SimpleTradingCharts from '../components/SimpleTradingCharts'
import RealTimeDeFiDashboard from '../components/RealTimeDeFiDashboard'
import AIInsightsPanel from '../components/AIInsightsPanel'
import NewsFeed from '../components/NewsFeed'
import AIChat from '../components/AIChat'
import NetworkDiagnostics from '../components/NetworkDiagnostics'

// New Rich Content Components
import LiveNewsFeed from '../components/LiveNewsFeed'
import TrendingTopics from '../components/TrendingTopics'
import MarketMovers from '../components/MarketMovers'
import DailyAIInsights from '../components/DailyAIInsights'
import EconomicCalendar from '../components/EconomicCalendar'
import EducationalTips from '../components/EducationalTips'

// Types for Dashboard
interface DashboardMetrics {
  totalMarketCap: string
  totalGrowth24h: string
  activeSectors: number
  connectedSources: number
  isRealTime: boolean
}

interface DashboardState {
  isLoading: boolean
  isConnected: boolean
  lastUpdate: Date
  metrics: DashboardMetrics
  error: string | null
}

// Tab Configuration
interface TabConfig {
  id: string
  name: string
  icon: React.ComponentType<any>
  component: React.ComponentType<any>
  description: string
}

// Dashboard Component - Rich Features Integrated
const Dashboard: React.FC = () => {
  const { setAIContext } = useAIContext()

  // Core Dashboard State
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    isLoading: true,
    isConnected: false,
    lastUpdate: new Date(),
    metrics: {
      totalMarketCap: '$0.0T',
      totalGrowth24h: '+0.0%',
      activeSectors: 0,
      connectedSources: 0,
      isRealTime: false
    },
    error: null
  })

  // UI State
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAIChat, setShowAIChat] = useState(false)

  // Update AI context when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setAIContext(tabId, { activeTab: tabId, dashboardMetrics: dashboardState.metrics })
  }

  // Tab Configuration
  const tabs: TabConfig[] = [
    {
      id: 'overview',
      name: 'Market Overview',
      icon: Home,
      component: RealTimeDashboard,
      description: 'Live market data and trending analysis'
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      icon: Briefcase,
      component: RealTimePortfolioTracker,
      description: 'Real-time portfolio tracking and management'
    },
    {
      id: 'trading',
      name: 'Trading Charts',
      icon: LineChart,
      component: SimpleTradingCharts,
      description: 'Simple and interactive price charts'
    },
    {
      id: 'defi',
      name: 'DeFi Analytics',
      icon: Zap,
      component: RealTimeDeFiDashboard,
      description: 'DeFi protocols and yield farming analysis'
    },
    {
      id: 'insights',
      name: 'AI Insights',
      icon: Brain,
      component: AIInsightsPanel,
      description: 'AI-powered market analysis and predictions'
    },
    {
      id: 'news',
      name: 'News & Sentiment',
      icon: Newspaper,
      component: NewsFeed,
      description: 'Market news and sentiment analysis'
    }
  ]

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      setDashboardState(prev => ({ ...prev, isLoading: true, error: null }))

      // Fetch market overview from real-time backend (via proxy)
      const response = await fetch('/api/v2/blockchain/overview')
      const data = await response.json()

      if (data.success) {
        setDashboardState(prev => ({
          ...prev,
          isLoading: false,
          isConnected: true,
          lastUpdate: new Date(),
          metrics: {
            totalMarketCap: data.data.totalMarketCap || '$0.0T',
            totalGrowth24h: data.data.totalGrowth24h || '+0.0%',
            activeSectors: data.data.activeSectors || 0,
            connectedSources: 4, // API sources count
            isRealTime: data.data.isRealTime || false
          },
          error: null
        }))
      } else {
        throw new Error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Dashboard data fetch failed:', error)
      setDashboardState(prev => ({
        ...prev,
        isLoading: false,
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    } finally {
      setRefreshing(false)
    }
  }

  // Initialize Dashboard
  useEffect(() => {
    fetchDashboardData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Connection Status
  const connectionStatus = useMemo(() => {
    if (dashboardState.isLoading) return { status: 'connecting', color: 'text-yellow-400', icon: Activity }
    if (dashboardState.isConnected) return { status: 'connected', color: 'text-green-400', icon: Wifi }
    return { status: 'disconnected', color: 'text-red-400', icon: WifiOff }
  }, [dashboardState.isLoading, dashboardState.isConnected])

  // Manual Refresh
  const handleRefresh = () => {
    if (!refreshing) {
      fetchDashboardData()
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="container mx-auto px-6 py-8">
        
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Connectouch
              </span> Dashboard
            </h1>
            <p className="text-lg text-white/70">
              Professional blockchain analytics and trading platform
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <connectionStatus.icon className={`w-4 h-4 ${connectionStatus.color}`} />
              <span className={`text-sm font-medium ${connectionStatus.color}`}>
                {connectionStatus.status}
              </span>
            </div>

            {/* AI Chat Toggle */}
            <button
              onClick={() => setShowAIChat(!showAIChat)}
              className={`p-2 rounded-lg transition-all duration-300 ${
                showAIChat
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Brain className="w-5 h-5" />
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 border border-white/20"
            >
              <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
            >
              <Maximize2 className="w-5 h-5 text-white" />
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 p-2 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
            {tabs.map((tab, index) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium hidden sm:block">{tab.name}</span>

                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Tab Description */}
          <motion.p
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/60 text-sm mt-3 ml-2"
          >
            {tabs.find(tab => tab.id === activeTab)?.description}
          </motion.p>
        </motion.div>

        {/* Error State */}
        <AnimatePresence>
          {dashboardState.error && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm"
            >
              <p className="text-red-400">
                <strong>Connection Error:</strong> {dashboardState.error}
              </p>
              <button
                onClick={handleRefresh}
                className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Retry Connection
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-white/60 text-xs">Market Cap</p>
                <p className="text-white font-semibold">{dashboardState.metrics.totalMarketCap}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-white/60 text-xs">24h Change</p>
                <p className="text-green-400 font-semibold">{dashboardState.metrics.totalGrowth24h}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-white/60 text-xs">Data Sources</p>
                <p className="text-white font-semibold">{dashboardState.metrics.connectedSources}/4</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-orange-400" />
              <div>
                <p className="text-white/60 text-xs">Status</p>
                <p className={`font-semibold ${dashboardState.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {dashboardState.isConnected ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rich Dashboard Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${isFullscreen ? 'fixed inset-0 z-40 bg-gray-900 p-6' : ''}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[600px]"
            >
              {/* Market Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Main Real-Time Dashboard */}
                  <RealTimeDashboard />

                  {/* Rich Content Grid - Phase 1 Enhancements */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Live News Feed */}
                    <div className="lg:col-span-1">
                      <LiveNewsFeed
                        maxItems={4}
                        showSentiment={true}
                        autoRefresh={true}
                      />
                    </div>

                    {/* Trending Topics */}
                    <div className="lg:col-span-1">
                      <TrendingTopics
                        maxItems={6}
                        showMetrics={true}
                      />
                    </div>

                    {/* Market Movers */}
                    <div className="lg:col-span-1 xl:col-span-1">
                      <MarketMovers
                        showGainers={true}
                        showLosers={true}
                        showVolume={true}
                        maxItems={3}
                      />
                    </div>
                  </div>

                  {/* Second Row - AI Insights and Calendar */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily AI Insights */}
                    <div className="lg:col-span-1">
                      <DailyAIInsights
                        maxInsights={3}
                        showConfidence={true}
                      />
                    </div>

                    {/* Economic Calendar */}
                    <div className="lg:col-span-1">
                      <EconomicCalendar
                        maxEvents={4}
                        showPastEvents={false}
                        timeframe="week"
                      />
                    </div>
                  </div>

                  {/* Educational Tips - Full Width */}
                  <div className="w-full">
                    <EducationalTips
                      autoRotate={true}
                    />
                  </div>
                </div>
              )}

              {/* Portfolio Tab */}
              {activeTab === 'portfolio' && (
                <div className="space-y-6">
                  <RealTimePortfolioTracker />
                </div>
              )}

              {/* Trading Charts Tab */}
              {activeTab === 'trading' && (
                <div className="space-y-6">
                  <SimpleTradingCharts
                    symbol="BTC"
                    height={isFullscreen ? window.innerHeight - 200 : 600}
                    showControls={true}
                    className="w-full"
                  />
                </div>
              )}

              {/* DeFi Analytics Tab */}
              {activeTab === 'defi' && (
                <div className="space-y-6">
                  <RealTimeDeFiDashboard />
                </div>
              )}

              {/* AI Insights Tab */}
              {activeTab === 'insights' && (
                <div className="space-y-6">
                  <AIInsightsPanel
                    marketData={dashboardState.metrics}
                    protocols={[]}
                  />
                </div>
              )}

              {/* News & Sentiment Tab */}
              {activeTab === 'news' && (
                <div className="space-y-6">
                  <NewsFeed />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* AI Chat Overlay */}
        <AnimatePresence>
          {showAIChat && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowAIChat(false)}
            >
              <motion.div
                className="bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                exit={{ y: 50 }}
              >
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Brain className="w-6 h-6 text-purple-400" />
                      <h3 className="text-xl font-bold text-white">AI Assistant</h3>
                    </div>
                    <button
                      onClick={() => setShowAIChat(false)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <span className="text-white/60 text-xl">×</span>
                    </button>
                  </div>
                </div>
                <div className="h-[500px]">
                  <AIChat />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                className="bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-white/20 max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                exit={{ y: 50 }}
              >
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Settings className="w-6 h-6 text-blue-400" />
                      <h3 className="text-xl font-bold text-white">Dashboard Settings</h3>
                    </div>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <span className="text-white/60 text-xl">×</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">System Status</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Connection Status</span>
                          <span className={`font-medium ${dashboardState.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                            {dashboardState.isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Data Sources</span>
                          <span className="text-white">{dashboardState.metrics.connectedSources}/4</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Real-time Updates</span>
                          <span className={dashboardState.metrics.isRealTime ? 'text-green-400' : 'text-yellow-400'}>
                            {dashboardState.metrics.isRealTime ? 'Active' : 'Cached'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Configuration</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Auto-refresh</span>
                          <span className="text-green-400">Enabled</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Refresh Interval</span>
                          <span className="text-white">30 seconds</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Last Updated</span>
                          <span className="text-white/60 text-sm">
                            {dashboardState.lastUpdate.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <NetworkDiagnostics />
                  </div>
                </div>

                <div className="p-6 border-t border-white/10">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-300"
                  >
                    Close Settings
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Dashboard
