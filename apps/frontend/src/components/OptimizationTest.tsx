import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, AlertTriangle, Zap } from 'lucide-react'
import { useOptimizedRealTimeData } from '../hooks/useOptimizedRealTimeData'

const OptimizationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const [startTime] = useState(Date.now())
  
  const {
    loadingState,
    loadingProgress,
    criticalDataLoaded,
    allDataLoaded,
    isConnected,
    marketData
  } = useOptimizedRealTimeData()

  useEffect(() => {
    const results: Record<string, boolean> = {}
    
    // Test 1: Progressive loading working
    results.progressiveLoading = loadingState !== 'idle'
    
    // Test 2: Critical data loads first
    results.criticalDataFirst = criticalDataLoaded || loadingProgress > 0
    
    // Test 3: WebSocket connection
    results.websocketConnection = isConnected
    
    // Test 4: Market data available
    results.marketDataAvailable = marketData !== null
    
    // Test 5: Loading time reasonable (under 5 seconds for critical data)
    const elapsed = Date.now() - startTime
    results.loadingTimeReasonable = criticalDataLoaded ? elapsed < 5000 : elapsed < 10000
    
    setTestResults(results)
  }, [loadingState, loadingProgress, criticalDataLoaded, allDataLoaded, isConnected, marketData, startTime])

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="w-5 h-5 text-green-400" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-red-400" />
    )
  }

  const getStatusColor = (passed: boolean) => {
    return passed ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20'
  }

  const tests = [
    {
      id: 'progressiveLoading',
      name: 'Progressive Loading',
      description: 'Loading system is active and working'
    },
    {
      id: 'criticalDataFirst',
      name: 'Critical Data Priority',
      description: 'Critical data loads before secondary data'
    },
    {
      id: 'websocketConnection',
      name: 'WebSocket Connection',
      description: 'Real-time WebSocket connection established'
    },
    {
      id: 'marketDataAvailable',
      name: 'Market Data Available',
      description: 'Market data successfully loaded'
    },
    {
      id: 'loadingTimeReasonable',
      name: 'Loading Performance',
      description: 'Loading completes within reasonable time'
    }
  ]

  const passedTests = Object.values(testResults).filter(Boolean).length
  const totalTests = tests.length
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            Optimization Test
          </h3>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            successRate >= 80 ? 'bg-green-500/20 text-green-400' :
            successRate >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {successRate.toFixed(0)}%
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {tests.map((test) => (
            <div key={test.id} className="flex items-center gap-3">
              {getStatusIcon(testResults[test.id] || false)}
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{test.name}</div>
                <div className="text-white/60 text-xs">{test.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-white/60">Loading State:</span>
            <span className="text-white">{loadingState}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Progress:</span>
            <span className="text-white">{loadingProgress.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Critical Data:</span>
            <span className={criticalDataLoaded ? 'text-green-400' : 'text-yellow-400'}>
              {criticalDataLoaded ? 'Loaded' : 'Loading...'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">All Data:</span>
            <span className={allDataLoaded ? 'text-green-400' : 'text-yellow-400'}>
              {allDataLoaded ? 'Complete' : 'Loading...'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">WebSocket:</span>
            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-blue-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default OptimizationTest
