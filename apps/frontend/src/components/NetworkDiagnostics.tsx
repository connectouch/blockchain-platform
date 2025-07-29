import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Server,
  Database,
  Globe,
  Zap
} from 'lucide-react'

interface EndpointTest {
  name: string
  url: string
  status: 'testing' | 'success' | 'error' | 'timeout'
  responseTime: number
  error?: string
  data?: any
}

interface NetworkDiagnosticsProps {
  onClose?: () => void
}

const NetworkDiagnostics: React.FC<NetworkDiagnosticsProps> = ({ onClose }) => {
  const [tests, setTests] = useState<EndpointTest[]>([
    { name: 'Backend Health', url: '/health', status: 'testing', responseTime: 0 },
    { name: 'Market Overview', url: '/api/v2/blockchain/overview', status: 'testing', responseTime: 0 },
    { name: 'Live Prices', url: '/api/v2/blockchain/prices/live', status: 'testing', responseTime: 0 },
    { name: 'DeFi Protocols', url: '/api/v2/blockchain/defi/protocols', status: 'testing', responseTime: 0 },
    { name: 'NFT Collections', url: '/api/v2/blockchain/nft/collections', status: 'testing', responseTime: 0 },
    { name: 'GameFi Projects', url: '/api/v2/blockchain/gamefi/projects', status: 'testing', responseTime: 0 }
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [overallStatus, setOverallStatus] = useState<'testing' | 'success' | 'partial' | 'failed'>('testing')

  const testEndpoint = async (test: EndpointTest): Promise<EndpointTest> => {
    const startTime = Date.now()
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(test.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      if (response.ok) {
        const data = await response.json()
        return {
          ...test,
          status: 'success',
          responseTime,
          data
        }
      } else {
        return {
          ...test,
          status: 'error',
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime
      
      if (error.name === 'AbortError') {
        return {
          ...test,
          status: 'timeout',
          responseTime,
          error: 'Request timeout (10s)'
        }
      }
      
      return {
        ...test,
        status: 'error',
        responseTime,
        error: error.message || 'Network error'
      }
    }
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setOverallStatus('testing')
    
    // Reset all tests to testing state
    setTests(prev => prev.map(test => ({ ...test, status: 'testing' as const, responseTime: 0, error: undefined, data: undefined })))

    // Test each endpoint
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]
      const result = await testEndpoint(test)
      
      setTests(prev => prev.map((t, index) => index === i ? result : t))
      
      // Small delay between tests to avoid overwhelming the server
      if (i < tests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    setIsRunning(false)
  }

  // Calculate overall status when tests complete
  useEffect(() => {
    if (!isRunning) {
      const successCount = tests.filter(t => t.status === 'success').length
      const totalCount = tests.length
      
      if (successCount === totalCount) {
        setOverallStatus('success')
      } else if (successCount > 0) {
        setOverallStatus('partial')
      } else {
        setOverallStatus('failed')
      }
    }
  }, [tests, isRunning])

  // Auto-run diagnostics on mount
  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: EndpointTest['status']) => {
    switch (status) {
      case 'testing':
        return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'timeout':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: EndpointTest['status']) => {
    switch (status) {
      case 'testing':
        return 'text-blue-400'
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      case 'timeout':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getOverallStatusIcon = () => {
    switch (overallStatus) {
      case 'testing':
        return <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />
      case 'partial':
        return <AlertCircle className="w-6 h-6 text-yellow-400" />
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-400" />
    }
  }

  const getOverallStatusText = () => {
    const successCount = tests.filter(t => t.status === 'success').length
    const totalCount = tests.length
    
    switch (overallStatus) {
      case 'testing':
        return 'Running diagnostics...'
      case 'success':
        return `All systems operational (${successCount}/${totalCount})`
      case 'partial':
        return `Partial connectivity (${successCount}/${totalCount})`
      case 'failed':
        return `Connection failed (${successCount}/${totalCount})`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getOverallStatusIcon()}
            <div>
              <h2 className="text-xl font-bold text-white">Network Diagnostics</h2>
              <p className="text-sm text-gray-400">{getOverallStatusText()}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              {isRunning ? 'Testing...' : 'Retest'}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-3">
          {tests.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <span className="text-white font-medium">{test.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {test.responseTime > 0 && (
                    <span className="text-gray-400">{test.responseTime}ms</span>
                  )}
                  <span className={getStatusColor(test.status)}>
                    {test.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 mb-2">
                {test.url}
              </div>
              
              {test.error && (
                <div className="text-xs text-red-400 bg-red-900/20 rounded p-2">
                  {test.error}
                </div>
              )}
              
              {test.data && test.status === 'success' && (
                <div className="text-xs text-green-400">
                  ✓ Data received successfully
                  {test.data.success && (
                    <span className="ml-2">({typeof test.data.data === 'object' ? 'JSON' : 'Data'} response)</span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Network Information */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-white mb-3">Network Configuration</h3>
          <div className="grid grid-cols-2 gap-4 text-xs mb-4">
            <div className="bg-gray-800 rounded p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Server className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">Backend</span>
              </div>
              <div className="text-white">localhost:3006</div>
            </div>
            <div className="bg-gray-800 rounded p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Globe className="w-4 h-4 text-green-400" />
                <span className="text-gray-400">Frontend</span>
              </div>
              <div className="text-white">localhost:5173</div>
            </div>
          </div>

          {/* Recovery Instructions */}
          <div className="bg-blue-900/20 border border-blue-700/30 rounded p-3">
            <h4 className="text-sm font-medium text-blue-400 mb-2">🔧 Network Issues?</h4>
            <div className="text-xs text-gray-300 space-y-1">
              <p>1. Run the network recovery script: <code className="bg-gray-800 px-1 rounded">fix-network.bat</code></p>
              <p>2. Or manually restart services:</p>
              <p className="ml-4">• Backend: <code className="bg-gray-800 px-1 rounded">cd Connectouch/backend && node ai-server.js</code></p>
              <p className="ml-4">• Frontend: <code className="bg-gray-800 px-1 rounded">cd Connectouch/connectouch-modern && npm run dev</code></p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default NetworkDiagnostics
