import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  X,
  Zap,
  TrendingUp,
  DollarSign,
  BarChart3,
  Brain,
  Sparkles,
  HelpCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  suggestions?: string[]
  context?: string
}

interface UniversalAIAssistantProps {
  currentFeature?: string
  contextData?: any
}

const UniversalAIAssistant: React.FC<UniversalAIAssistantProps> = ({ 
  currentFeature = 'dashboard',
  contextData 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize with contextual welcome message
  useEffect(() => {
    const welcomeMessage = getContextualWelcome(currentFeature)
    setMessages([{
      id: '1',
      type: 'ai',
      content: welcomeMessage.content,
      timestamp: new Date(),
      suggestions: welcomeMessage.suggestions,
      context: currentFeature
    }])
  }, [currentFeature])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Get contextual welcome message based on current feature
  const getContextualWelcome = (feature: string) => {
    const welcomeMessages = {
      dashboard: {
        content: "🏠 Welcome to your Dashboard! I can help you understand market trends, analyze your portfolio performance, and explain any data you see here. What would you like to explore?",
        suggestions: [
          "Explain current market trends",
          "What's my portfolio performance?",
          "Show me top gainers today",
          "Risk analysis of my holdings"
        ]
      },
      trading: {
        content: "📊 I'm here to help with your Trading Charts! I can explain price movements, technical indicators, and help you make informed trading decisions. What do you need help with?",
        suggestions: [
          "Analyze current BTC trend",
          "Explain this price pattern",
          "Best entry points for ETH",
          "Risk management tips"
        ]
      },
      defi: {
        content: "🔥 DeFi Analytics Assistant ready! I can help you understand protocols, yield opportunities, and risk assessments. How can I assist with your DeFi journey?",
        suggestions: [
          "Best yield farming opportunities",
          "Explain this protocol's risks",
          "Compare lending platforms",
          "Gas optimization tips"
        ]
      },
      portfolio: {
        content: "💼 Portfolio Tracker Assistant here! I can help analyze your holdings, suggest rebalancing strategies, and track performance. What would you like to know?",
        suggestions: [
          "Analyze my portfolio balance",
          "Suggest rebalancing strategy",
          "Track performance vs market",
          "Identify underperforming assets"
        ]
      },
      nft: {
        content: "🎨 NFT Market Assistant ready! I can help you analyze collections, track trends, and identify opportunities in the NFT space. How can I help?",
        suggestions: [
          "Analyze this NFT collection",
          "Current market trends",
          "Rarity analysis",
          "Investment opportunities"
        ]
      },
      gamefi: {
        content: "🎮 GameFi Assistant here! I can help you understand play-to-earn opportunities, token economics, and gaming trends. What interests you?",
        suggestions: [
          "Best P2E opportunities",
          "Analyze game tokenomics",
          "Gaming trends analysis",
          "ROI calculations"
        ]
      },
      news: {
        content: "📰 News & Sentiment Assistant ready! I can help you understand market news impact, sentiment analysis, and trending topics. What would you like to explore?",
        suggestions: [
          "Explain news impact on prices",
          "Current market sentiment",
          "Trending crypto topics",
          "Regulatory updates analysis"
        ]
      },
      default: {
        content: "🤖 Hello! I'm your Universal Connectouch AI Assistant. I'm here to help you with any questions about cryptocurrency, DeFi, trading, or market analysis. How can I assist you today?",
        suggestions: [
          "What's happening in crypto today?",
          "Explain DeFi to me",
          "Help me analyze this chart",
          "Show me market opportunities"
        ]
      }
    }

    return welcomeMessages[feature as keyof typeof welcomeMessages] || welcomeMessages.default
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      context: currentFeature
    }

    setMessages(prev => [...prev, userMessage])
    const messageToSend = inputValue
    setInputValue('')
    setIsTyping(true)

    try {
      // Call real OpenAI API through backend
      const response = await fetch('/api/v2/blockchain/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          sector: currentFeature === 'defi' ? 'defi' :
                 currentFeature === 'nft' ? 'nft' :
                 currentFeature === 'gamefi' ? 'gamefi' :
                 currentFeature === 'dao' ? 'dao' : 'general'
        }),
      })

      const data = await response.json()

      if (data.success && data.data?.response) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.data.response,
          timestamp: new Date(),
          suggestions: generateContextualSuggestions(messageToSend, currentFeature),
          context: currentFeature
        }
        setMessages(prev => [...prev, aiResponse])
      } else {
        throw new Error('Invalid API response')
      }
    } catch (error) {
      console.error('Universal AI Assistant Error:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
        timestamp: new Date(),
        context: currentFeature
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const generateContextualAIResponse = (input: string, feature: string, context: any): string => {
    const lowerInput = input.toLowerCase()
    
    // Feature-specific responses
    if (feature === 'trading' && (lowerInput.includes('chart') || lowerInput.includes('price'))) {
      return `📊 Based on the current ${feature} data, I can see interesting price movements. The chart shows ${context?.symbol || 'BTC'} is trading at strong levels with good volume. Technical indicators suggest continued momentum. Would you like me to analyze specific patterns or timeframes?`
    }
    
    if (feature === 'defi' && lowerInput.includes('yield')) {
      return `🔥 In the current DeFi landscape, I'm seeing excellent yield opportunities across multiple protocols. Based on your risk profile, I'd recommend looking at established platforms like Aave (4-8% APY) and Compound (3-6% APY) for safer yields, or explore newer protocols for higher returns with increased risk.`
    }
    
    if (feature === 'portfolio' && lowerInput.includes('performance')) {
      return `💼 Your portfolio performance looks solid! Based on current market conditions, your diversification strategy is working well. I notice strong performance in your DeFi holdings (+12.5%) and moderate gains in your blue-chip positions (+5.2%). Consider rebalancing if any position exceeds 25% of total portfolio.`
    }

    // General crypto responses
    if (lowerInput.includes('bitcoin') || lowerInput.includes('btc')) {
      return `₿ Bitcoin is currently showing strong momentum at $119,081 (+0.66% in 24h). The recent stability above $115K suggests institutional confidence. Key support levels are at $115K and $110K, with resistance at $125K. The overall trend remains bullish with increasing adoption.`
    }
    
    if (lowerInput.includes('ethereum') || lowerInput.includes('eth')) {
      return `⟠ Ethereum is performing well at $3,619 (+5.44% in 24h). The recent upgrade improvements and growing DeFi ecosystem continue to drive value. Layer 2 solutions are reducing gas costs, making ETH more accessible for everyday transactions.`
    }
    
    if (lowerInput.includes('defi') || lowerInput.includes('decentralized')) {
      return `🔥 DeFi is experiencing a renaissance with TVL reaching new highs. Top protocols like Uniswap, Aave, and Compound are leading innovation. New opportunities in liquid staking, real-world assets, and cross-chain protocols are emerging. Current yields range from 3-15% depending on risk tolerance.`
    }
    
    if (lowerInput.includes('nft') || lowerInput.includes('non-fungible')) {
      return `🎨 The NFT market is evolving beyond art into utility-focused projects. Gaming NFTs, membership tokens, and real-world asset tokenization are gaining traction. Blue-chip collections maintain strong floors while new utility projects show promise.`
    }

    // Default contextual response
    return `🤖 Great question! In the context of ${feature}, I can help you understand the data better. ${feature === 'trading' ? 'For trading analysis, I can explain chart patterns, support/resistance levels, and market sentiment.' : feature === 'defi' ? 'For DeFi, I can analyze protocols, yield opportunities, and risk factors.' : 'I can provide insights specific to this feature.'} What specific aspect would you like me to focus on?`
  }

  const generateContextualSuggestions = (input: string, feature: string): string[] => {
    const suggestions = {
      trading: [
        "Analyze current trend direction",
        "Identify support/resistance levels",
        "Explain volume patterns",
        "Risk management strategies"
      ],
      defi: [
        "Compare protocol yields",
        "Assess smart contract risks",
        "Explain impermanent loss",
        "Gas optimization tips"
      ],
      portfolio: [
        "Portfolio rebalancing advice",
        "Risk assessment",
        "Performance benchmarking",
        "Diversification suggestions"
      ],
      dashboard: [
        "Market overview analysis",
        "Top movers explanation",
        "Sector performance review",
        "Investment opportunities"
      ]
    }

    return suggestions[feature as keyof typeof suggestions] || [
      "Explain this in simple terms",
      "What should I do next?",
      "Show me related opportunities",
      "Risk analysis please"
    ]
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  // Floating AI button
  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="relative">
            <Brain className="w-6 h-6" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
            />
          </div>
        </motion.button>
        
        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
        >
          AI Assistant for {currentFeature}
          <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-2 bg-black/80 rotate-45" />
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 100 }}
      className={`fixed bottom-6 right-6 z-50 bg-black/90 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      } transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-black" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
            <p className="text-white/60 text-xs capitalize">{currentFeature} Helper</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/60 hover:text-white p-1 rounded transition-colors"
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/60 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[480px]">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 text-white'
                } rounded-lg p-3`}>
                  <div className="flex items-start gap-2">
                    {message.type === 'ai' && <Bot className="w-4 h-4 mt-0.5 text-blue-400" />}
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.suggestions && (
                        <div className="mt-3 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left text-xs bg-white/10 hover:bg-white/20 rounded px-2 py-1 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Ask about ${currentFeature}...`}
                className="flex-1 bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}

export default UniversalAIAssistant
