import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Clock, 
  Zap, 
  Database, 
  Wifi, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Target
} from 'lucide-react'
import { performanceOptimizer } from '../services/performanceOptimizer'
import { useOptimizedRealTimeData } from '../hooks/useOptimizedRealTimeData'
import { useLoadingState } from '../hooks/useLoadingState'

interface PerformanceTest {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  duration?: number
  result?: any
  threshold: number
  unit: string
}

const PerformanceTestDashboard: React.FC = () => {
  const [tests, setTests] = useState<PerformanceTest[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [overallScore, setOverallScore] = useState(0)
  
  const { 
    loadingState, 
    loadingProgress, 
    criticalDataLoaded, 
    allDataLoaded,
    isConnected 
  } = useOptimizedRealTimeData()

  // Initialize performance tests
  useEffect(() => {
    const performanceTests: PerformanceTest[] = [
      {
        id: 'initial-load',
        name: 'Initial Load Time',
        description: 'Time to load critical dashboard data',
        status: 'pending',
        threshold: 3000, // 3 seconds
        unit: 'ms'
      },
      {
        id: 'critical-data',
        name: 'Critical Data Loading',
        description: 'Time to load essential market data',
        status: 'pending',
        threshold: 2000, // 2 seconds
        unit: 'ms'
      },
      {
        id: 'websocket-connection',
        name: 'WebSocket Connection',
        description: 'Real-time connection establishment',
        status: 'pending',
        threshold: 1000, // 1 second
        unit: 'ms'
      },
      {
        id: 'cache-performance',
        name: 'Cache Hit Rate',
        description: 'Data caching efficiency',
        status: 'pending',
        threshold: 80, // 80%
        unit: '%'
      },
      {
        id: 'memory-usage',
        name: 'Memory Usage',
        description: 'JavaScript heap memory consumption',
        status: 'pending',
        threshold: 70, // 70%
        unit: '%'
      },
      {
        id: 'api-response',
        name: 'API Response Time',
        description: 'Average API call response time',
        status: 'pending',
        threshold: 500, // 500ms
        unit: 'ms'
      },
      {
        id: 'render-performance',
        name: 'Component Render Time',
        description: 'Average component rendering performance',
        status: 'pending',
        threshold: 100, // 100ms
        unit: 'ms'
      },
      {
        id: 'progressive-loading',
        name: 'Progressive Loading',
        description: 'Critical vs secondary data loading efficiency',
        status: 'pending',
        threshold: 5000, // 5 seconds for all data
        unit: 'ms'
      }
    ]

    setTests(performanceTests)
  }, [])

  // Run performance tests
  const runPerformanceTests = useCallback(async () => {
    setIsRunning(true)
    const startTime = performance.now()
    const updatedTests = [...tests]

    try {
      // Test 1: Initial Load Time
      const loadTest = updatedTests.find(t => t.id === 'initial-load')
      if (loadTest) {
        loadTest.status = 'running'
        setTests([...updatedTests])
        
        const loadTime = performance.now() - startTime
        loadTest.duration = loadTime
        loadTest.result = loadTime
        loadTest.status = loadTime <= loadTest.threshold ? 'passed' : 'failed'
      }

      // Test 2: Critical Data Loading
      const criticalTest = updatedTests.find(t => t.id === 'critical-data')
      if (criticalTest) {
        criticalTest.status = 'running'
        setTests([...updatedTests])
        
        const criticalStartTime = performance.now()
        // Wait for critical data to load
        while (!criticalDataLoaded && performance.now() - criticalStartTime < 10000) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        const criticalLoadTime = performance.now() - criticalStartTime
        criticalTest.duration = criticalLoadTime
        criticalTest.result = criticalLoadTime
        criticalTest.status = criticalLoadTime <= criticalTest.threshold ? 'passed' : 'failed'
      }

      // Test 3: WebSocket Connection
      const wsTest = updatedTests.find(t => t.id === 'websocket-connection')
      if (wsTest) {
        wsTest.status = 'running'
        setTests([...updatedTests])
        
        const wsStartTime = performance.now()
        // Wait for WebSocket connection
        while (!isConnected && performance.now() - wsStartTime < 5000) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        const wsConnectionTime = performance.now() - wsStartTime
        wsTest.duration = wsConnectionTime
        wsTest.result = wsConnectionTime
        wsTest.status = isConnected && wsConnectionTime <= wsTest.threshold ? 'passed' : 'failed'
      }

      // Test 4: Cache Performance
      const cacheTest = updatedTests.find(t => t.id === 'cache-performance')
      if (cacheTest) {
        cacheTest.status = 'running'
        setTests([...updatedTests])
        
        const metrics = performanceOptimizer.getMetrics()
        const cacheHitRate = metrics.cacheHitRate * 100
        
        cacheTest.duration = 0
        cacheTest.result = cacheHitRate
        cacheTest.status = cacheHitRate >= cacheTest.threshold ? 'passed' : 'failed'
      }

      // Test 5: Memory Usage
      const memoryTest = updatedTests.find(t => t.id === 'memory-usage')
      if (memoryTest) {
        memoryTest.status = 'running'
        setTests([...updatedTests])
        
        const metrics = performanceOptimizer.getMetrics()
        const memoryUsage = metrics.memoryUsage * 100
        
        memoryTest.duration = 0
        memoryTest.result = memoryUsage
        memoryTest.status = memoryUsage <= memoryTest.threshold ? 'passed' : 'failed'
      }

      // Test 6: API Response Time
      const apiTest = updatedTests.find(t => t.id === 'api-response')
      if (apiTest) {
        apiTest.status = 'running'
        setTests([...updatedTests])
        
        const apiStartTime = performance.now()
        try {
          await fetch('http://localhost:3002/api/v2/health')
          const apiResponseTime = performance.now() - apiStartTime
          
          apiTest.duration = apiResponseTime
          apiTest.result = apiResponseTime
          apiTest.status = apiResponseTime <= apiTest.threshold ? 'passed' : 'failed'
        } catch (error) {
          apiTest.duration = 0
          apiTest.result = 'Failed'
          apiTest.status = 'failed'
        }
      }

      // Test 7: Render Performance
      const renderTest = updatedTests.find(t => t.id === 'render-performance')
      if (renderTest) {
        renderTest.status = 'running'
        setTests([...updatedTests])
        
        const metrics = performanceOptimizer.getMetrics()
        const avgRenderTime = metrics.componentMounts > 0 
          ? metrics.renderTime / metrics.componentMounts 
          : 0
        
        renderTest.duration = avgRenderTime
        renderTest.result = avgRenderTime
        renderTest.status = avgRenderTime <= renderTest.threshold ? 'passed' : 'failed'
      }

      // Test 8: Progressive Loading
      const progressiveTest = updatedTests.find(t => t.id === 'progressive-loading')
      if (progressiveTest) {
        progressiveTest.status = 'running'
        setTests([...updatedTests])
        
        const progressiveStartTime = performance.now()
        // Wait for all data to load
        while (!allDataLoaded && performance.now() - progressiveStartTime < 15000) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        const progressiveLoadTime = performance.now() - progressiveStartTime
        progressiveTest.duration = progressiveLoadTime
        progressiveTest.result = progressiveLoadTime
        progressiveTest.status = progressiveLoadTime <= progressiveTest.threshold ? 'passed' : 'failed'
      }

      // Calculate overall score
      const passedTests = updatedTests.filter(t => t.status === 'passed').length
      const totalTests = updatedTests.length
      const score = Math.round((passedTests / totalTests) * 100)
      setOverallScore(score)

      setTests(updatedTests)

    } catch (error) {
      console.error('Performance test error:', error)
    } finally {
      setIsRunning(false)
    }
  }, [tests, criticalDataLoaded, allDataLoaded, isConnected])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'failed': return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'running': return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-400 bg-green-400/20'
      case 'failed': return 'text-red-400 bg-red-400/20'
      case 'running': return 'text-blue-400 bg-blue-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const formatResult = (test: PerformanceTest) => {
    if (test.result === undefined) return 'Pending'
    if (typeof test.result === 'number') {
      return `${test.result.toFixed(1)}${test.unit}`
    }
    return test.result.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Performance Testing</h2>
          <p className="text-white/60">Loading optimization validation and metrics</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Overall Score */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            overallScore >= 80 ? 'bg-green-500/20 text-green-400' :
            overallScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            <Target className="w-4 h-4" />
            <span>Score: {overallScore}%</span>
          </div>

          {/* Run Tests Button */}
          <button
            onClick={runPerformanceTests}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>{isRunning ? 'Running Tests...' : 'Run Tests'}</span>
          </button>
        </div>
      </div>

      {/* Performance Tests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tests.map((test, index) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <h3 className="text-lg font-semibold text-white">{test.name}</h3>
                  <p className="text-white/60 text-sm">{test.description}</p>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                {test.status.toUpperCase()}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Result</span>
                <span className="text-white font-semibold">{formatResult(test)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Threshold</span>
                <span className="text-white/80">{test.threshold}{test.unit}</span>
              </div>

              {test.duration !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Duration</span>
                  <span className="text-white/80">{test.duration.toFixed(1)}ms</span>
                </div>
              )}

              {/* Progress bar for visual feedback */}
              {test.status === 'running' && (
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: '60%' }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Summary */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Performance Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              overallScore >= 80 ? 'text-green-400' :
              overallScore >= 60 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {overallScore}%
            </div>
            <p className="text-white/60 text-sm">Overall Score</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {tests.filter(t => t.status === 'passed').length}
            </div>
            <p className="text-white/60 text-sm">Tests Passed</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {loadingProgress.toFixed(0)}%
            </div>
            <p className="text-white/60 text-sm">Loading Progress</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 font-semibold text-sm mb-2">Optimization Status</p>
          <p className="text-white/80 text-sm">
            {overallScore >= 80 
              ? '🟢 Excellent performance! All optimizations are working effectively.'
              : overallScore >= 60
              ? '🟡 Good performance with room for improvement. Some optimizations may need tuning.'
              : '🔴 Performance issues detected. Review failed tests and optimize accordingly.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

export default PerformanceTestDashboard
