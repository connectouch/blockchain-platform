import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain,
  Mic,
  MessageSquare,
  Target,
  Zap,
  Settings,
  Activity,
  BarChart3,
  TrendingUp,
  Shield,
  Lightbulb,
  Star,
  RefreshCw
} from 'lucide-react'

// Import AI Assistant components
import EnhancedAIAssistant from '../components/EnhancedAIAssistant'
import VoiceCommandSystem from '../components/VoiceCommandSystem'
import NaturalLanguageTrading from '../components/NaturalLanguageTrading'
import AdvancedPortfolioAdvisor from '../components/AdvancedPortfolioAdvisor'

const AIAssistantPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assistant' | 'voice' | 'trading' | 'advisor'>('assistant')
  const [aiStats, setAiStats] = useState({
    totalInteractions: 1247,
    successfulTrades: 89,
    portfolioOptimizations: 23,
    voiceCommands: 156,
    avgResponseTime: 0.8,
    userSatisfaction: 94.2
  })
  
  // Mock data for components
  const [portfolioData] = useState({
    totalValue: 50000,
    holdings: [
      { symbol: 'BTC', value: 22600, allocation: 45.2 },
      { symbol: 'ETH', value: 23600, allocation: 47.2 },
      { symbol: 'SOL', value: 4200, allocation: 8.4 }
    ]
  })

  const [tradingContext] = useState({
    portfolioValue: 50000,
    availableBalance: 5000,
    positions: [
      { symbol: 'BTC', quantity: 0.5, value: 22600 },
      { symbol: 'ETH', quantity: 8, value: 23600 },
      { symbol: 'SOL', quantity: 40, value: 4200 }
    ],
    riskProfile: 'moderate' as const,
    tradingLimits: {
      maxTradeSize: 10000,
      dailyLimit: 25000,
      riskPerTrade: 5
    }
  })

  // Handle AI actions
  const handleTradeAction = (action: any) => {
    console.log('Trade action executed:', action)
    // Implement trade execution logic
  }

  const handlePortfolioAction = (action: any) => {
    console.log('Portfolio action executed:', action)
    // Implement portfolio action logic
  }

  const handleNavigationAction = (action: any) => {
    console.log('Navigation action executed:', action)
    // Implement navigation logic
  }

  const handleVoiceCommand = (command: any) => {
    console.log('Voice command executed:', command)
    // Route voice commands to appropriate handlers
    switch (command.category) {
      case 'trading':
        handleTradeAction(command)
        break
      case 'portfolio':
        handlePortfolioAction(command)
        break
      case 'navigation':
        handleNavigationAction(command)
        break
    }
  }

  const handleTradeConfirmation = async (trade: any): Promise<boolean> => {
    // Implement trade confirmation logic
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1000)
    })
  }

  const handleAdviceAction = (advice: any, action: any) => {
    console.log('Advice action executed:', advice, action)
    // Implement advice action logic
  }

  const handleAdviceFeedback = (adviceId: string, feedback: 'helpful' | 'not_helpful') => {
    console.log('Advice feedback:', adviceId, feedback)
    // Implement feedback logic
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
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">AI Assistant Hub</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Advanced AI-powered trading, portfolio management, and voice commands
          </p>
        </motion.div>

        {/* AI Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8"
        >
          <div className="glass-card p-6 text-center">
            <Activity className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{aiStats.totalInteractions.toLocaleString()}</div>
            <div className="text-white/60 text-sm">Total Interactions</div>
          </div>
          <div className="glass-card p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{aiStats.successfulTrades}</div>
            <div className="text-white/60 text-sm">Successful Trades</div>
          </div>
          <div className="glass-card p-6 text-center">
            <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{aiStats.portfolioOptimizations}</div>
            <div className="text-white/60 text-sm">Optimizations</div>
          </div>
          <div className="glass-card p-6 text-center">
            <Mic className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{aiStats.voiceCommands}</div>
            <div className="text-white/60 text-sm">Voice Commands</div>
          </div>
          <div className="glass-card p-6 text-center">
            <Zap className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{aiStats.avgResponseTime}s</div>
            <div className="text-white/60 text-sm">Avg Response</div>
          </div>
          <div className="glass-card p-6 text-center">
            <Star className="w-8 h-8 text-pink-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{aiStats.userSatisfaction}%</div>
            <div className="text-white/60 text-sm">Satisfaction</div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 bg-white/5 p-2 rounded-lg">
            {[
              { id: 'assistant', label: 'Enhanced Assistant', icon: <Brain className="w-4 h-4" /> },
              { id: 'voice', label: 'Voice Commands', icon: <Mic className="w-4 h-4" /> },
              { id: 'trading', label: 'Natural Language Trading', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'advisor', label: 'Portfolio Advisor', icon: <Target className="w-4 h-4" /> }
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
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {activeTab === 'assistant' && (
            <div className="space-y-8">
              {/* Enhanced AI Assistant Overview */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Enhanced AI Assistant Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Natural Language Processing</h4>
                    <p className="text-white/60 text-sm">Advanced NLP for understanding complex trading and portfolio commands</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mic className="w-6 h-6 text-green-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Voice Integration</h4>
                    <p className="text-white/60 text-sm">Speech recognition and text-to-speech for hands-free interaction</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Lightbulb className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Personalized Insights</h4>
                    <p className="text-white/60 text-sm">AI-powered recommendations based on your behavior and preferences</p>
                  </div>
                </div>
              </div>

              {/* Enhanced AI Assistant Component */}
              <EnhancedAIAssistant
                currentFeature="ai-assistant"
                portfolioData={portfolioData}
                onTradeAction={handleTradeAction}
                onPortfolioAction={handlePortfolioAction}
                onNavigationAction={handleNavigationAction}
              />
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-8">
              {/* Voice Commands Overview */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Voice Command System</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-green-400 font-medium mb-3">Supported Commands</h4>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li>• Trading: "Buy 0.1 Bitcoin", "Sell half my ETH"</li>
                      <li>• Portfolio: "Show my portfolio", "Rebalance holdings"</li>
                      <li>• Navigation: "Go to dashboard", "Open DeFi page"</li>
                      <li>• Analysis: "Analyze market trends", "Show opportunities"</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-blue-400 font-medium mb-3">Voice Features</h4>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li>• Multi-language support (English, Spanish, French, German)</li>
                      <li>• Continuous listening mode</li>
                      <li>• Voice feedback and confirmation</li>
                      <li>• Customizable sensitivity and wake words</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Voice Command System Component */}
              <VoiceCommandSystem
                onCommandExecuted={handleVoiceCommand}
                onTradeCommand={handleTradeAction}
                onPortfolioCommand={handlePortfolioAction}
                onNavigationCommand={handleNavigationAction}
                isActive={true}
              />
            </div>
          )}

          {activeTab === 'trading' && (
            <div className="space-y-8">
              {/* Natural Language Trading Overview */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Natural Language Trading</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-purple-400 font-medium mb-3">Trading Commands</h4>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li>• "Buy 0.5 Bitcoin at market price"</li>
                      <li>• "Sell 25% of my Ethereum holdings"</li>
                      <li>• "Set stop loss at $40,000 for BTC"</li>
                      <li>• "Place limit order: buy SOL at $95"</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-yellow-400 font-medium mb-3">Safety Features</h4>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li>• Confirmation required for large trades</li>
                      <li>• Risk assessment for all orders</li>
                      <li>• Market impact analysis</li>
                      <li>• Trading limit enforcement</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Natural Language Trading Component */}
              <NaturalLanguageTrading
                tradingContext={tradingContext}
                onTradeExecuted={handleTradeAction}
                onTradeConfirmation={handleTradeConfirmation}
                isActive={true}
              />
            </div>
          )}

          {activeTab === 'advisor' && (
            <div className="space-y-8">
              {/* Portfolio Advisor Overview */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Advanced Portfolio Advisor</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="w-6 h-6 text-green-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Portfolio Analysis</h4>
                    <p className="text-white/60 text-sm">Comprehensive analysis of portfolio health and performance</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">AI Recommendations</h4>
                    <p className="text-white/60 text-sm">Personalized advice for optimization and risk management</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Risk Assessment</h4>
                    <p className="text-white/60 text-sm">Advanced risk analysis and mitigation strategies</p>
                  </div>
                </div>
              </div>

              {/* Advanced Portfolio Advisor Component */}
              <AdvancedPortfolioAdvisor
                portfolioData={portfolioData}
                onAdviceAction={handleAdviceAction}
                onFeedback={handleAdviceFeedback}
              />
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12"
        >
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick AI Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('trading')}
                className="flex items-center gap-3 p-4 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors"
              >
                <MessageSquare className="w-6 h-6 text-green-400" />
                <div className="text-left">
                  <div className="text-white font-medium">Execute Trade</div>
                  <div className="text-white/60 text-sm">Use natural language</div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('voice')}
                className="flex items-center gap-3 p-4 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
              >
                <Mic className="w-6 h-6 text-blue-400" />
                <div className="text-left">
                  <div className="text-white font-medium">Voice Command</div>
                  <div className="text-white/60 text-sm">Speak your request</div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('advisor')}
                className="flex items-center gap-3 p-4 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors"
              >
                <Target className="w-6 h-6 text-purple-400" />
                <div className="text-left">
                  <div className="text-white font-medium">Get Advice</div>
                  <div className="text-white/60 text-sm">AI recommendations</div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('assistant')}
                className="flex items-center gap-3 p-4 bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg transition-colors"
              >
                <Brain className="w-6 h-6 text-yellow-400" />
                <div className="text-left">
                  <div className="text-white font-medium">Chat with AI</div>
                  <div className="text-white/60 text-sm">Ask anything</div>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AIAssistantPage
