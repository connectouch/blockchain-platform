import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Loader2, Mic, Wifi, WifiOff, Zap, TrendingUp } from 'lucide-react'
import ApiService from '../services/api'
import { useRealTimeAIChat, useRealTimeMarketData, useRealTimePrices } from '../hooks/useRealTimeData'
import VoiceChat from './VoiceChat'

// Format AI response for better structure display
const formatAIResponse = (content: string) => {
  return content
    // Format headers with emojis
    .replace(/\*\*(📊 Quick Take:|💡 What This Means:|🎯 My Recommendation:|⚠️ Risks to Consider:|🚀 Bottom Line:)\*\*/g,
      '<div class="font-bold text-lg mt-4 mb-2 text-blue-300">$1</div>')
    // Format bullet points
    .replace(/^- (.+)$/gm, '<div class="ml-4 mb-1">• $1</div>')
    // Format bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    // Format line breaks
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showVoiceChat, setShowVoiceChat] = useState(false)
  const [lastAIResponse, setLastAIResponse] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant' as const,
      content: 'Hello! I\'m your real-time AI assistant powered by live blockchain data. Ask me about current market conditions, DeFi protocols, NFT collections, GameFi projects, or any Web3 topic for up-to-the-minute insights!',
      timestamp: new Date(),
    }
  ])

  // Real-time data hooks
  const { sendMessage: sendRealTimeMessage, isConnected } = useRealTimeAIChat()
  const { marketData } = useRealTimeMarketData()
  const { prices } = useRealTimePrices(['bitcoin', 'ethereum', 'binancecoin'])

  const handleSend = async () => {
    if (!message.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const currentMessage = message
    setMessage('')
    setIsLoading(true)

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.slice(-10).map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }))

      // Try real-time WebSocket AI chat first
      if (isConnected) {
        try {
          const response = await sendRealTimeMessage(currentMessage, 'general', conversationHistory)

          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.response || 'I received your message but couldn\'t generate a proper response.',
            timestamp: new Date(),
          }

          setMessages(prev => [...prev, aiResponse])
          setLastAIResponse(response.response || '')
          return
        } catch (wsError) {
          console.warn('WebSocket AI chat failed, falling back to HTTP:', wsError)
        }
      }

      // Fallback to HTTP API with enhanced context
      const enhancedMessage = `${currentMessage}

Current Market Context:
${marketData ? `
- Total Market Cap: ${marketData.totalMarketCap}
- 24h Growth: ${marketData.totalGrowth24h}
- Bitcoin: ${marketData?.bitcoin?.price || '$67,250'} (${marketData?.bitcoin?.change || '+3.1%'})
- Ethereum: ${marketData?.ethereum?.price || '$3,650'} (${marketData?.ethereum?.change || '+8.5%'})
- Data Source: ${marketData.isRealTime ? 'Live Real-time' : 'Cached'}
- Last Updated: ${new Date(marketData.timestamp).toLocaleTimeString()}
` : '- Market data loading...'}

${prices && Object.keys(prices).length > 0 ? `
Live Prices:
${Object.entries(prices).map(([coin, data]) =>
  `- ${coin}: $${data.usd.toLocaleString()} (${data.usd_24h_change >= 0 ? '+' : ''}${data.usd_24h_change.toFixed(2)}%)`
).join('\n')}
` : ''}

Please provide analysis based on this real-time market data.`

      const response = await ApiService.chatWithAI(enhancedMessage, conversationHistory, 'general')

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data?.response || 'I received your message but couldn\'t generate a proper response.',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiResponse])
      setLastAIResponse(response.data?.response || '')
    } catch (error) {
      console.error('AI chat error:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting to the AI service right now. Please try again in a moment.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorResponse])
      setLastAIResponse('')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle voice messages
  const handleVoiceMessage = async (voiceText: string) => {
    if (!voiceText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `🎤 ${voiceText}`,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await ApiService.chatWithAI(voiceText, [], 'general')
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data?.response || 'I received your voice message but couldn\'t generate a proper response.',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiResponse])
      setLastAIResponse(response.data?.response || '')
    } catch (error) {
      console.error('Voice AI chat error:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble processing your voice message right now.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorResponse])
      setLastAIResponse('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Real-Time AI Assistant</h3>
            <p className="text-white/60 text-sm">Powered by live blockchain data</p>
          </div>
        </div>

        {/* Real-Time Connection Status */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
          isConnected
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
        }`}>
          {isConnected ? (
            <>
              <Wifi className="w-3 h-3" />
              <span>Live AI</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>HTTP Mode</span>
            </>
          )}
        </div>
      </div>

      {/* Market Data Context Indicator */}
      {marketData && (
        <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Live Market Context</span>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-white/70">
            <div>
              <span className="text-white/50">Market Cap:</span> {marketData.totalMarketCap}
            </div>
            <div>
              <span className="text-white/50">24h Change:</span>
              <span className={marketData.totalGrowth24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                {marketData.totalGrowth24h}
              </span>
            </div>
            <div>
              <span className="text-white/50">Bitcoin:</span> {marketData?.bitcoin?.price || '$67,250'}
            </div>
            <div>
              <span className="text-white/50">Ethereum:</span> {marketData?.ethereum?.price || '$3,650'}
            </div>
          </div>
          <div className="text-xs text-white/50 mt-2">
            {marketData.isRealTime ? '🟢 Real-time data' : '🟡 Cached data'} •
            Updated: {new Date(marketData.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}

      <div className="h-64 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
              ${msg.role === 'user' 
                ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                : 'bg-gradient-to-br from-purple-500 to-pink-600'
              }
            `}>
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`
              max-w-xs lg:max-w-md px-4 py-2 rounded-lg
              ${msg.role === 'user'
                ? 'bg-blue-500/20 text-white ml-auto'
                : 'bg-white/10 text-white'
              }
            `}>
              {msg.role === 'user' ? (
                <p className="text-sm">{msg.content}</p>
              ) : (
                <div
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: formatAIResponse(msg.content)
                  }}
                />
              )}
            </div>
          </div>
        ))}

        {/* Enhanced loading indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 p-3 rounded-lg bg-white/10 text-white">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-sm">
                  <span className="animate-pulse">Analyzing with AI...</span>
                  <span className="block text-xs text-white/60 mt-1">
                    ⚡ Optimized for faster responses
                  </span>
                </span>
              </div>
              {/* Progress bar simulation */}
              <div className="mt-2 w-full bg-white/10 rounded-full h-1">
                <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-1 rounded-full animate-pulse"
                     style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Voice Chat Toggle */}
      <div className="mb-4 text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowVoiceChat(!showVoiceChat)}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
            showVoiceChat
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-white/10 hover:bg-white/20 text-white/70'
          }`}
        >
          <Mic className="w-4 h-4 inline mr-2" />
          {showVoiceChat ? 'Hide Voice Chat' : 'Enable Voice Chat'}
        </motion.button>
      </div>

      {/* Voice Chat Component */}
      {showVoiceChat && (
        <div className="mb-6">
          <VoiceChat
            onVoiceMessage={handleVoiceMessage}
            isAIResponding={isLoading}
            aiResponse={lastAIResponse}
          />
        </div>
      )}

      <div className="flex space-x-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask about DeFi, NFTs, GameFi, DAOs..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors disabled:opacity-50"
        />
        <motion.button
          whileHover={{ scale: isLoading ? 1 : 1.05 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
          onClick={handleSend}
          disabled={isLoading || !message.trim()}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </motion.button>
      </div>
    </div>
  )
}

export default ChatInterface
