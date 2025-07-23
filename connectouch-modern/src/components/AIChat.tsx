import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  Zap,
  TrendingUp,
  DollarSign,
  BarChart3
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface AIChatProps {
  isMinimized?: boolean
  onToggleMinimize?: () => void
}

const AIChat: React.FC<AIChatProps> = ({ 
  isMinimized = false, 
  onToggleMinimize 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your Connectouch AI assistant. I can help you analyze market data, explain trends, and provide insights about DeFi, NFTs, and GameFi. What would you like to know?',
      timestamp: new Date(),
      suggestions: [
        'What\'s the current Bitcoin trend?',
        'Explain DeFi protocols',
        'Show me top NFT collections',
        'GameFi market analysis'
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
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
          sector: 'general'
        }),
      })

      const data = await response.json()

      if (data.success && data.data?.response) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.data.response,
          timestamp: new Date(),
          suggestions: generateSuggestions(messageToSend)
        }
        setMessages(prev => [...prev, aiResponse])
      } else {
        throw new Error('Invalid API response')
      }
    } catch (error) {
      console.error('AI Chat Error:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('bitcoin') || lowerInput.includes('btc')) {
      return 'Bitcoin is currently showing strong momentum with a price of $67,250 (+3.1% in 24h). The recent surge is driven by institutional adoption and positive regulatory developments. Technical indicators suggest continued bullish sentiment.'
    }
    
    if (lowerInput.includes('defi') || lowerInput.includes('decentralized')) {
      return 'DeFi protocols are experiencing significant growth with total value locked (TVL) reaching $90B. Top protocols like Uniswap, Aave, and Compound are leading innovation in decentralized lending, trading, and yield farming.'
    }
    
    if (lowerInput.includes('nft') || lowerInput.includes('non-fungible')) {
      return 'The NFT market is showing renewed activity with a market cap of $15.8B (+5.7% in 24h). Blue-chip collections are maintaining strong floor prices while new utility-focused projects are gaining traction.'
    }
    
    if (lowerInput.includes('gamefi') || lowerInput.includes('gaming')) {
      return 'GameFi sector is evolving with $8.2B market cap (+3.1% in 24h). Play-to-earn models are maturing, and integration with traditional gaming is accelerating adoption. Key projects focus on sustainable tokenomics.'
    }
    
    return 'I can help you analyze various aspects of the crypto market. Would you like me to explain specific trends, compare different assets, or provide insights about market movements?'
  }

  const generateSuggestions = (input: string): string[] => {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('bitcoin')) {
      return ['Bitcoin price prediction', 'BTC vs ETH comparison', 'Bitcoin market dominance']
    }
    
    if (lowerInput.includes('defi')) {
      return ['Top DeFi protocols', 'Yield farming strategies', 'DeFi risks and rewards']
    }
    
    return ['Market overview', 'Portfolio analysis', 'Risk assessment', 'Trading signals']
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <button
          onClick={onToggleMinimize}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 w-96 h-[500px] bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium">Connectouch AI</h3>
            <p className="text-xs text-gray-400">Market Intelligence Assistant</p>
          </div>
        </div>
        <button
          onClick={onToggleMinimize}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-100'
              } rounded-lg p-3`}>
                <div className="flex items-start space-x-2">
                  {message.type === 'ai' && (
                    <Bot className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                {message.suggestions && (
                  <div className="mt-3 space-y-1">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-800 rounded-lg p-3 flex items-center space-x-2">
              <Bot className="w-4 h-4 text-blue-400" />
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about market trends, DeFi, NFTs..."
            className="flex-1 bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
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
    </motion.div>
  )
}

export default AIChat
