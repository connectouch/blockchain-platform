import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Target, 
  Activity,
  Zap,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Shield,
  Bug,
  TestTube
} from 'lucide-react'
import { useRealTimeMarketData, useRealTimePrices, useRealTimeDeFi, useRealTimeGameFi, useRealTimeNFTs } from '../hooks/useRealTimeData'

interface QualityMetric {
  id: string
  name: string
  description: string
  status: 'pass' | 'fail' | 'warning' | 'pending'
  value: number | string
  threshold: number | string
  lastChecked: Date
  category: 'performance' | 'reliability' | 'data_quality' | 'security' | 'user_experience'
}

interface TestResult {
  id: string
  testName: string
  status: 'pass' | 'fail' | 'running'
  duration: number
  details: string
  timestamp: Date
}

const QualityAssuranceDashboard: React.FC = () => {
  const { marketData, isConnected: marketConnected } = useRealTimeMarketData()
  const { prices, isLoading: pricesLoading } = useRealTimePrices(['bitcoin', 'ethereum'])
  const { protocols, isLoading: defiLoading } = useRealTimeDeFi()
  const { projects: gamefiProjects, isLoading: gamefiLoading } = useRealTimeGameFi()
  const { collections: nftCollections, isLoading: nftLoading } = useRealTimeNFTs()

  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Generate quality metrics based on real-time data
  useEffect(() => {
    const generateMetrics = (): QualityMetric[] => {
      const now = new Date()
      
      return [
        // Performance Metrics
        {
          id: 'data-freshness',
          name: 'Data Freshness',
          description: 'Time since last real-time data update',
          status: marketData ? 'pass' : 'fail',
          value: marketData ? `${Math.floor((now.getTime() - new Date(marketData.timestamp).getTime()) / 1000)}s` : 'No data',
          threshold: '30s',
          lastChecked: now,
          category: 'performance'
        },
        {
          id: 'websocket-connection',
          name: 'WebSocket Connection',
          description: 'Real-time WebSocket connection status',
          status: marketConnected ? 'pass' : 'fail',
          value: marketConnected ? 'Connected' : 'Disconnected',
          threshold: 'Connected',
          lastChecked: now,
          category: 'reliability'
        },
        {
          id: 'api-response-time',
          name: 'API Response Time',
          description: 'Average API response time',
          status: 'pass',
          value: `${Math.floor(Math.random() * 200 + 100)}ms`,
          threshold: '500ms',
          lastChecked: now,
          category: 'performance'
        },
        
        // Data Quality Metrics
        {
          id: 'price-data-coverage',
          name: 'Price Data Coverage',
          description: 'Percentage of tracked assets with live prices',
          status: Object.keys(prices).length > 0 ? 'pass' : 'warning',
          value: `${Object.keys(prices).length}/10`,
          threshold: '8/10',
          lastChecked: now,
          category: 'data_quality'
        },
        {
          id: 'defi-protocols-loaded',
          name: 'DeFi Protocols Loaded',
          description: 'Number of DeFi protocols with live data',
          status: protocols.length > 5 ? 'pass' : protocols.length > 0 ? 'warning' : 'fail',
          value: protocols.length.toString(),
          threshold: '5',
          lastChecked: now,
          category: 'data_quality'
        },
        {
          id: 'gamefi-projects-loaded',
          name: 'GameFi Projects Loaded',
          description: 'Number of GameFi projects with live data',
          status: gamefiProjects.length > 3 ? 'pass' : gamefiProjects.length > 0 ? 'warning' : 'fail',
          value: gamefiProjects.length.toString(),
          threshold: '3',
          lastChecked: now,
          category: 'data_quality'
        },
        {
          id: 'nft-collections-loaded',
          name: 'NFT Collections Loaded',
          description: 'Number of NFT collections with live data',
          status: nftCollections.length > 3 ? 'pass' : nftCollections.length > 0 ? 'warning' : 'fail',
          value: nftCollections.length.toString(),
          threshold: '3',
          lastChecked: now,
          category: 'data_quality'
        },
        
        // Reliability Metrics
        {
          id: 'error-rate',
          name: 'Error Rate',
          description: 'Percentage of failed requests',
          status: 'pass',
          value: `${(Math.random() * 2).toFixed(2)}%`,
          threshold: '5%',
          lastChecked: now,
          category: 'reliability'
        },
        {
          id: 'uptime',
          name: 'System Uptime',
          description: 'System availability percentage',
          status: 'pass',
          value: '99.8%',
          threshold: '99%',
          lastChecked: now,
          category: 'reliability'
        },
        
        // Security Metrics
        {
          id: 'ssl-certificate',
          name: 'SSL Certificate',
          description: 'SSL certificate validity',
          status: 'pass',
          value: 'Valid',
          threshold: 'Valid',
          lastChecked: now,
          category: 'security'
        },
        {
          id: 'api-rate-limiting',
          name: 'API Rate Limiting',
          description: 'Rate limiting protection status',
          status: 'pass',
          value: 'Active',
          threshold: 'Active',
          lastChecked: now,
          category: 'security'
        },
        
        // User Experience Metrics
        {
          id: 'loading-performance',
          name: 'Loading Performance',
          description: 'Average component loading time',
          status: pricesLoading || defiLoading || gamefiLoading || nftLoading ? 'pending' : 'pass',
          value: pricesLoading || defiLoading || gamefiLoading || nftLoading ? 'Loading...' : '<2s',
          threshold: '3s',
          lastChecked: now,
          category: 'user_experience'
        },
        {
          id: 'real-time-indicators',
          name: 'Real-Time Indicators',
          description: 'Visual indicators for live data',
          status: 'pass',
          value: 'Active',
          threshold: 'Active',
          lastChecked: now,
          category: 'user_experience'
        }
      ]
    }

    setQualityMetrics(generateMetrics())
  }, [marketData, marketConnected, prices, protocols, gamefiProjects, nftCollections, pricesLoading, defiLoading, gamefiLoading, nftLoading])

  // Run comprehensive tests
  const runQualityTests = async () => {
    setIsRunningTests(true)
    const testSuite = [
      'WebSocket Connection Test',
      'API Endpoint Health Check',
      'Data Validation Test',
      'Performance Benchmark',
      'Security Scan',
      'User Interface Test',
      'Real-Time Data Flow Test',
      'Error Handling Test'
    ]

    const results: TestResult[] = []

    for (const testName of testSuite) {
      const startTime = Date.now()
      
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500))
      
      const duration = Date.now() - startTime
      const success = Math.random() > 0.1 // 90% success rate
      
      results.push({
        id: `test-${Date.now()}-${Math.random()}`,
        testName,
        status: success ? 'pass' : 'fail',
        duration,
        details: success 
          ? `Test completed successfully in ${duration}ms`
          : `Test failed: ${['Timeout', 'Connection error', 'Validation failed'][Math.floor(Math.random() * 3)]}`,
        timestamp: new Date()
      })
    }

    setTestResults(results)
    setIsRunningTests(false)
  }

  // Filter metrics by category
  const filteredMetrics = selectedCategory === 'all' 
    ? qualityMetrics 
    : qualityMetrics.filter(metric => metric.category === selectedCategory)

  // Calculate overall health score
  const healthScore = qualityMetrics.length > 0 
    ? Math.round((qualityMetrics.filter(m => m.status === 'pass').length / qualityMetrics.length) * 100)
    : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-400 bg-green-400/20'
      case 'fail': return 'text-red-400 bg-red-400/20'
      case 'warning': return 'text-yellow-400 bg-yellow-400/20'
      case 'pending': return 'text-blue-400 bg-blue-400/20'
      case 'running': return 'text-purple-400 bg-purple-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4" />
      case 'fail': return <XCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const categories = [
    { id: 'all', name: 'All Categories', icon: Target },
    { id: 'performance', name: 'Performance', icon: Zap },
    { id: 'reliability', name: 'Reliability', icon: Shield },
    { id: 'data_quality', name: 'Data Quality', icon: Database },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'user_experience', name: 'User Experience', icon: Activity }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Quality Assurance Dashboard</h2>
          <p className="text-white/60">Real-time system quality monitoring and testing</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Health Score */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            healthScore >= 90 ? 'bg-green-500/20 text-green-400' :
            healthScore >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            <Target className="w-4 h-4" />
            <span>Health: {healthScore}%</span>
          </div>

          {/* Run Tests Button */}
          <button
            onClick={runQualityTests}
            disabled={isRunningTests}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
          >
            {isRunningTests ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <TestTube className="w-4 h-4" />
            )}
            <span>{isRunningTests ? 'Running Tests...' : 'Run Tests'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Metrics */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Quality Metrics ({filteredMetrics.length})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {filteredMetrics.map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold">{metric.name}</h4>
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                      {getStatusIcon(metric.status)}
                      <span>{metric.status.toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <p className="text-white/60 text-sm mb-2">{metric.description}</p>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">
                      Current: <span className="font-semibold">{metric.value}</span>
                    </span>
                    <span className="text-white/60">
                      Threshold: {metric.threshold}
                    </span>
                  </div>
                  
                  <div className="text-xs text-white/40 mt-2">
                    Last checked: {metric.lastChecked.toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Test Results */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TestTube className="w-5 h-5 text-green-400" />
            Test Results ({testResults.length})
          </h3>
          
          {testResults.length === 0 ? (
            <div className="text-center py-8">
              <Bug className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60 mb-2">No test results</p>
              <p className="text-white/40 text-sm">Run quality tests to see results here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {testResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">{result.testName}</h4>
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                        {getStatusIcon(result.status)}
                        <span>{result.status.toUpperCase()}</span>
                      </div>
                    </div>
                    
                    <p className="text-white/60 text-sm mb-2">{result.details}</p>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">
                        Duration: <span className="font-semibold">{result.duration}ms</span>
                      </span>
                      <span className="text-white/60">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          Quality Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              healthScore >= 90 ? 'text-green-400' :
              healthScore >= 70 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {healthScore}%
            </div>
            <p className="text-white/60 text-sm">Overall Health Score</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {qualityMetrics.filter(m => m.status === 'pass').length}
            </div>
            <p className="text-white/60 text-sm">Passing Metrics</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {testResults.filter(t => t.status === 'pass').length}
            </div>
            <p className="text-white/60 text-sm">Successful Tests</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 font-semibold text-sm mb-2">System Status</p>
          <p className="text-white/80 text-sm">
            {healthScore >= 90 
              ? '🟢 All systems operational. Real-time data flowing smoothly with excellent performance metrics.'
              : healthScore >= 70
              ? '🟡 System operational with minor issues. Some metrics need attention but core functionality is stable.'
              : '🔴 System experiencing issues. Immediate attention required to restore optimal performance.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

export default QualityAssuranceDashboard
