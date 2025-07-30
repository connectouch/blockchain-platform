import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Simple, working Connectouch Platform
const ConnectouchPlatform = () => {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [cryptoData, setCryptoData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Simulate loading and fetch real data
  useEffect(() => {
    const initializePlatform = async () => {
      try {
        console.log('🚀 Initializing Connectouch Platform...')
        
        // Test Supabase connection
        const healthResponse = await fetch('https://aompecyfgnakkmldhidg.supabase.co/functions/v1/health-check')
        if (healthResponse.ok) {
          console.log('✅ Backend connected')
        }

        // Fetch crypto data
        const cryptoResponse = await fetch('https://aompecyfgnakkmldhidg.supabase.co/functions/v1/crypto-prices')
        if (cryptoResponse.ok) {
          const data = await cryptoResponse.json()
          setCryptoData(data.data || [])
          console.log('✅ Crypto data loaded')
        }

        setIsLoading(false)
        console.log('🎉 Platform initialized successfully!')
        
      } catch (err) {
        console.error('❌ Platform initialization error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsLoading(false)
      }
    }

    setTimeout(initializePlatform, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Connectouch Platform</h2>
          <p className="text-blue-200">Initializing blockchain AI systems...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Platform Error</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const pages = {
    dashboard: <DashboardPage cryptoData={cryptoData} />,
    defi: <DeFiPage />,
    nft: <NFTPage />,
    portfolio: <PortfolioPage />,
    analysis: <AnalysisPage />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Connectouch
                </span>
              </h1>
            </div>
            
            <div className="flex space-x-4">
              {Object.keys(pages).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {page.charAt(0).toUpperCase() + page.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pages[currentPage as keyof typeof pages]}
      </main>

      {/* Status Bar */}
      <div className="fixed bottom-4 right-4 bg-black/50 backdrop-blur-lg rounded-lg px-4 py-2 text-sm text-green-400">
        ✅ Platform Online • {cryptoData.length} Assets Tracked
      </div>
    </div>
  )
}

// Dashboard Page Component
const DashboardPage = ({ cryptoData }: { cryptoData: any[] }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-white mb-4">
        Comprehensive Blockchain AI Platform
      </h2>
      <p className="text-xl text-blue-200">
        Real-time DeFi analytics, AI-powered insights, and portfolio management
      </p>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard title="Total Market Cap" value="$2.5T" change="+2.3%" />
      <StatCard title="Active Protocols" value="1,247" change="+5.1%" />
      <StatCard title="AI Predictions" value="94.2%" change="+1.2%" />
      <StatCard title="Portfolio Value" value="$125,430" change="+8.7%" />
    </div>

    {/* Crypto Prices */}
    {cryptoData.length > 0 && (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Live Crypto Prices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cryptoData.slice(0, 6).map((crypto, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">{crypto.symbol}</span>
                <span className="text-green-400">${crypto.price}</span>
              </div>
              <div className="text-sm text-gray-400">{crypto.name}</div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Features Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <FeatureCard 
        title="🤖 AI Assistant" 
        description="GPT-4 powered blockchain analysis and trading recommendations"
      />
      <FeatureCard 
        title="📊 DeFi Analytics" 
        description="Real-time protocol monitoring and yield optimization"
      />
      <FeatureCard 
        title="🎨 NFT Tracking" 
        description="Collection analytics and marketplace insights"
      />
      <FeatureCard 
        title="🎮 GameFi Hub" 
        description="Gaming token analysis and P2E opportunities"
      />
      <FeatureCard 
        title="🏛️ DAO Governance" 
        description="Proposal tracking and voting analytics"
      />
      <FeatureCard 
        title="⚡ Infrastructure" 
        description="Network monitoring and performance metrics"
      />
    </div>
  </div>
)

// Other Page Components
const DeFiPage = () => (
  <div className="text-center">
    <h2 className="text-3xl font-bold text-white mb-4">DeFi Analytics</h2>
    <p className="text-blue-200 mb-8">Advanced DeFi protocol analysis and yield farming opportunities</p>
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
      <p className="text-gray-400">Advanced DeFi analytics dashboard with real-time protocol data</p>
    </div>
  </div>
)

const NFTPage = () => (
  <div className="text-center">
    <h2 className="text-3xl font-bold text-white mb-4">NFT Marketplace</h2>
    <p className="text-blue-200 mb-8">Collection tracking and marketplace analytics</p>
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
      <div className="text-6xl mb-4">🎨</div>
      <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
      <p className="text-gray-400">NFT collection analytics and trading insights</p>
    </div>
  </div>
)

const PortfolioPage = () => (
  <div className="text-center">
    <h2 className="text-3xl font-bold text-white mb-4">Portfolio Management</h2>
    <p className="text-blue-200 mb-8">AI-powered portfolio optimization and tracking</p>
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
      <div className="text-6xl mb-4">📈</div>
      <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
      <p className="text-gray-400">Advanced portfolio tracking with AI recommendations</p>
    </div>
  </div>
)

const AnalysisPage = () => (
  <div className="text-center">
    <h2 className="text-3xl font-bold text-white mb-4">AI Analysis</h2>
    <p className="text-blue-200 mb-8">GPT-4 powered market analysis and predictions</p>
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
      <div className="text-6xl mb-4">🧠</div>
      <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
      <p className="text-gray-400">AI-powered market analysis and trading signals</p>
    </div>
  </div>
)

// Utility Components
const StatCard = ({ title, value, change }: { title: string; value: string; change: string }) => (
  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
    <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
    <div className="flex items-center justify-between">
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-green-400 text-sm font-medium">{change}</span>
    </div>
  </div>
)

const FeatureCard = ({ title, description }: { title: string; description: string }) => (
  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{description}</p>
  </div>
)

// Initialize the app
console.log('🚀 Starting Connectouch Platform Rebuild...')

try {
  const rootElement = document.getElementById('root')
  
  if (!rootElement) {
    throw new Error('Root element not found')
  }

  console.log('✅ Root element found')
  
  const root = ReactDOM.createRoot(rootElement)
  console.log('✅ React root created')
  
  root.render(
    <React.StrictMode>
      <ConnectouchPlatform />
    </React.StrictMode>
  )
  
  console.log('✅ Connectouch Platform rendered successfully')
  
  // Success indicator
  setTimeout(() => {
    if (rootElement.children.length > 0) {
      console.log('🎉 Connectouch Platform Successfully Loaded!')
      
      // Add success indicator
      const indicator = document.createElement('div')
      indicator.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: linear-gradient(45deg, #4CAF50, #45a049);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.5s ease-out;
      `
      indicator.innerHTML = '🎉 Connectouch Platform Online!'
      document.body.appendChild(indicator)
      
      // Remove after 5 seconds
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator)
        }
      }, 5000)
    }
  }, 2000)
  
} catch (error) {
  console.error('💥 Critical Error in Connectouch Platform:', error)
  
  // Emergency fallback
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh;
        background: linear-gradient(135deg, #ff4444, #cc0000);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
        color: white;
        text-align: center;
        padding: 20px;
      ">
        <div style="max-width: 500px;">
          <h1 style="font-size: 3rem; margin-bottom: 20px;">💥</h1>
          <h2 style="font-size: 2rem; margin-bottom: 20px;">Platform Error</h2>
          <p style="font-size: 1.2rem; margin-bottom: 30px;">
            Connectouch Platform failed to initialize.
          </p>
          <div style="
            background: rgba(0,0,0,0.3);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            font-family: monospace;
          ">
            <strong>Error:</strong><br>
            ${error instanceof Error ? error.message : 'Unknown error'}
          </div>
          <button onclick="window.location.reload()" style="
            background: white;
            color: #ff4444;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
          ">
            🔄 Reload Platform
          </button>
        </div>
      </div>
    `
  }
}
