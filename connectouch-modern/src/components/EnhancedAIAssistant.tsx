import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
  TrendingUp,
  DollarSign,
  BarChart3,
  Brain,
  Sparkles,
  Settings,
  Target,
  Shield,
  Activity,
  Lightbulb,
  Star,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  suggestions?: string[]
  context?: string
  actionable?: boolean
  actions?: MessageAction[]
  confidence?: number
  voiceEnabled?: boolean
}

interface MessageAction {
  id: string
  label: string
  type: 'trade' | 'portfolio' | 'analysis' | 'navigation'
  command: string
  parameters?: any
  confirmationRequired?: boolean
}

interface VoiceSettings {
  enabled: boolean
  autoSpeak: boolean
  language: string
  voice: string
  rate: number
  pitch: number
}

interface PersonalizedInsight {
  id: string
  type: 'recommendation' | 'warning' | 'opportunity' | 'education'
  title: string
  description: string
  confidence: number
  priority: 'low' | 'medium' | 'high'
  category: string
  actionable: boolean
  userRelevance: number
}

interface EnhancedAIAssistantProps {
  currentFeature?: string
  contextData?: any
  portfolioData?: any
  userPreferences?: any
  onTradeAction?: (action: MessageAction) => void
  onPortfolioAction?: (action: MessageAction) => void
  onNavigationAction?: (action: MessageAction) => void
}

const EnhancedAIAssistant: React.FC<EnhancedAIAssistantProps> = ({ 
  currentFeature = 'dashboard',
  contextData,
  portfolioData,
  userPreferences,
  onTradeAction,
  onPortfolioAction,
  onNavigationAction
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true,
    autoSpeak: true,
    language: 'en-US',
    voice: 'default',
    rate: 1,
    pitch: 1
  })
  const [personalizedInsights, setPersonalizedInsights] = useState<PersonalizedInsight[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = voiceSettings.language

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputValue(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [voiceSettings.language])

  // Initialize with contextual welcome and personalized insights
  useEffect(() => {
    const welcomeMessage = getContextualWelcome(currentFeature)
    setMessages([{
      id: 'welcome',
      type: 'ai',
      content: welcomeMessage.content,
      timestamp: new Date(),
      suggestions: welcomeMessage.suggestions,
      context: currentFeature,
      voiceEnabled: true
    }])

    generatePersonalizedInsights()
  }, [currentFeature, portfolioData])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Generate personalized insights based on user data
  const generatePersonalizedInsights = useCallback(async () => {
    setIsGeneratingInsights(true)
    
    // Simulate AI analysis of user behavior and portfolio
    setTimeout(() => {
      const insights: PersonalizedInsight[] = [
        {
          id: 'insight-1',
          type: 'recommendation',
          title: 'Portfolio Rebalancing Opportunity',
          description: 'Your BTC allocation is 15% above your target. Consider rebalancing to reduce risk.',
          confidence: 87,
          priority: 'high',
          category: 'portfolio',
          actionable: true,
          userRelevance: 92
        },
        {
          id: 'insight-2',
          type: 'opportunity',
          title: 'DeFi Yield Opportunity',
          description: 'Based on your risk profile, Aave USDC lending offers attractive 4.2% APY.',
          confidence: 78,
          priority: 'medium',
          category: 'defi',
          actionable: true,
          userRelevance: 85
        },
        {
          id: 'insight-3',
          type: 'education',
          title: 'Market Trend Analysis',
          description: 'Learn about the current market cycle and how it affects your investment strategy.',
          confidence: 95,
          priority: 'low',
          category: 'education',
          actionable: false,
          userRelevance: 70
        }
      ]
      
      setPersonalizedInsights(insights)
      setIsGeneratingInsights(false)
    }, 2000)
  }, [portfolioData, userPreferences])

  // Get contextual welcome message
  const getContextualWelcome = (feature: string) => {
    const welcomeMessages = {
      dashboard: {
        content: "🚀 Enhanced AI Assistant ready! I can now understand voice commands, execute trades through natural language, and provide personalized portfolio insights. Try saying 'Show me my portfolio performance' or 'Buy 0.1 BTC'!",
        suggestions: [
          "Analyze my portfolio performance",
          "What are the best opportunities today?",
          "Execute a trade for me",
          "Show personalized insights"
        ]
      },
      portfolio: {
        content: "💼 Portfolio AI Assistant enhanced! I can now provide advanced portfolio optimization, execute rebalancing commands, and offer personalized investment advice. How can I help optimize your portfolio?",
        suggestions: [
          "Rebalance my portfolio",
          "Find yield opportunities",
          "Analyze my risk exposure",
          "Suggest portfolio improvements"
        ]
      },
      defi: {
        content: "🔥 DeFi AI Assistant upgraded! I can now help you execute DeFi strategies, find yield opportunities, and manage protocol interactions through natural language. What DeFi action would you like to take?",
        suggestions: [
          "Find best yield farming opportunities",
          "Stake my ETH tokens",
          "Compare lending protocols",
          "Execute DeFi strategy"
        ]
      },
      default: {
        content: "🤖 Enhanced Universal AI Assistant ready! I now support voice commands, natural language trading, and personalized insights. Try speaking to me or ask me to execute trades!",
        suggestions: [
          "What's happening in crypto today?",
          "Buy some Bitcoin for me",
          "Show my personalized insights",
          "Analyze market opportunities"
        ]
      }
    }

    return welcomeMessages[feature as keyof typeof welcomeMessages] || welcomeMessages.default
  }

  // Start voice recognition
  const startListening = () => {
    if (recognitionRef.current && voiceSettings.enabled) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  // Stop voice recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  // Speak text using speech synthesis
  const speakText = (text: string) => {
    if (synthRef.current && voiceSettings.enabled && voiceSettings.autoSpeak) {
      synthRef.current.cancel() // Cancel any ongoing speech
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = voiceSettings.rate
      utterance.pitch = voiceSettings.pitch
      utterance.lang = voiceSettings.language
      
      synthRef.current.speak(utterance)
    }
  }

  // Parse natural language for trading commands
  const parseNaturalLanguageCommand = (message: string): MessageAction[] => {
    const actions: MessageAction[] = []
    const lowerMessage = message.toLowerCase()

    // Trading patterns
    const buyPattern = /(?:buy|purchase|get)\s+(\d*\.?\d+)?\s*(btc|eth|sol|ada|dot|link|uni|aave|usdc|usdt)/i
    const sellPattern = /(?:sell|dispose)\s+(\d*\.?\d+)?\s*(btc|eth|sol|ada|dot|link|uni|aave|usdc|usdt)/i
    const portfolioPattern = /(?:show|display|analyze)\s+(?:my\s+)?portfolio/i
    const rebalancePattern = /(?:rebalance|optimize)\s+(?:my\s+)?portfolio/i

    if (buyPattern.test(message)) {
      const match = message.match(buyPattern)
      actions.push({
        id: 'buy-action',
        label: `Buy ${match?.[1] || '1'} ${match?.[2]?.toUpperCase()}`,
        type: 'trade',
        command: 'buy',
        parameters: {
          amount: parseFloat(match?.[1] || '1'),
          asset: match?.[2]?.toUpperCase()
        },
        confirmationRequired: true
      })
    }

    if (sellPattern.test(message)) {
      const match = message.match(sellPattern)
      actions.push({
        id: 'sell-action',
        label: `Sell ${match?.[1] || '1'} ${match?.[2]?.toUpperCase()}`,
        type: 'trade',
        command: 'sell',
        parameters: {
          amount: parseFloat(match?.[1] || '1'),
          asset: match?.[2]?.toUpperCase()
        },
        confirmationRequired: true
      })
    }

    if (portfolioPattern.test(message)) {
      actions.push({
        id: 'portfolio-action',
        label: 'Show Portfolio Analysis',
        type: 'portfolio',
        command: 'analyze',
        parameters: {},
        confirmationRequired: false
      })
    }

    if (rebalancePattern.test(message)) {
      actions.push({
        id: 'rebalance-action',
        label: 'Rebalance Portfolio',
        type: 'portfolio',
        command: 'rebalance',
        parameters: {},
        confirmationRequired: true
      })
    }

    return actions
  }

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      context: currentFeature
    }

    // Parse for natural language commands
    const actions = parseNaturalLanguageCommand(inputValue)

    setMessages(prev => [...prev, userMessage])
    const messageToSend = inputValue
    setInputValue('')
    setIsTyping(true)

    try {
      // Enhanced AI response with action recognition
      const response = await fetch('/api/v2/blockchain/ai/enhanced-chat', {
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
          context: {
            feature: currentFeature,
            portfolioData,
            userPreferences,
            personalizedInsights
          },
          actions: actions
        }),
      })

      const data = await response.json()

      if (data.success && data.data?.response) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.data.response,
          timestamp: new Date(),
          suggestions: data.data.suggestions || generateContextualSuggestions(messageToSend, currentFeature),
          context: currentFeature,
          actionable: actions.length > 0,
          actions: actions,
          confidence: data.data.confidence || 85,
          voiceEnabled: true
        }
        
        setMessages(prev => [...prev, aiResponse])
        
        // Speak the response if voice is enabled
        if (voiceSettings.autoSpeak) {
          speakText(data.data.response)
        }
      } else {
        throw new Error('Invalid API response')
      }
    } catch (error) {
      console.error('Enhanced AI Assistant Error:', error)
      
      // Fallback response with enhanced capabilities
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: actions.length > 0 
          ? `I understand you want to ${actions[0].command} ${actions[0].parameters?.asset || 'assets'}. I can help you with that! However, I'm currently in demo mode. In the full version, I would execute this action for you.`
          : "I'm here to help! I can understand voice commands, execute trades through natural language, and provide personalized insights. Try asking me to 'buy Bitcoin' or 'analyze my portfolio'.",
        timestamp: new Date(),
        suggestions: generateContextualSuggestions(messageToSend, currentFeature),
        context: currentFeature,
        actionable: actions.length > 0,
        actions: actions,
        confidence: 75,
        voiceEnabled: true
      }
      
      setMessages(prev => [...prev, fallbackResponse])
      
      if (voiceSettings.autoSpeak) {
        speakText(fallbackResponse.content)
      }
    }

    setIsTyping(false)
  }

  // Generate contextual suggestions
  const generateContextualSuggestions = (message: string, feature: string): string[] => {
    const suggestions = {
      portfolio: [
        "Rebalance my portfolio",
        "Show risk analysis",
        "Find yield opportunities",
        "Analyze performance"
      ],
      defi: [
        "Find best APY rates",
        "Compare protocols",
        "Execute DeFi strategy",
        "Check my positions"
      ],
      trading: [
        "Buy 0.1 BTC",
        "Sell half my ETH",
        "Set stop loss",
        "Check order status"
      ],
      default: [
        "What's trending today?",
        "Analyze market sentiment",
        "Show opportunities",
        "Help me trade"
      ]
    }

    return suggestions[feature as keyof typeof suggestions] || suggestions.default
  }

  // Handle action execution
  const handleActionExecution = (action: MessageAction) => {
    switch (action.type) {
      case 'trade':
        onTradeAction?.(action)
        break
      case 'portfolio':
        onPortfolioAction?.(action)
        break
      case 'navigation':
        onNavigationAction?.(action)
        break
    }

    // Add system message about action execution
    const systemMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content: `✅ Action executed: ${action.label}`,
      timestamp: new Date(),
      context: currentFeature
    }
    
    setMessages(prev => [...prev, systemMessage])
  }

  // Format time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* AI Assistant Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center ${
          isOpen ? 'hidden' : 'block'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(147, 51, 234, 0.7)',
            '0 0 0 10px rgba(147, 51, 234, 0)',
            '0 0 0 0 rgba(147, 51, 234, 0)'
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'loop'
        }}
      >
        <Brain className="w-6 h-6 text-white" />
      </motion.button>

      {/* Enhanced AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
            } transition-all duration-300`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Enhanced AI Assistant</h3>
                  <p className="text-white/60 text-xs">Voice • Trading • Insights</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4 text-white/60" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4 text-white/60" /> : <Minimize2 className="w-4 h-4 text-white/60" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Personalized Insights */}
                {personalizedInsights.length > 0 && (
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white/80 text-sm font-medium">Personalized Insights</h4>
                      <button
                        onClick={generatePersonalizedInsights}
                        disabled={isGeneratingInsights}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <RefreshCw className={`w-3 h-3 text-white/60 ${isGeneratingInsights ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-20 overflow-y-auto">
                      {personalizedInsights.slice(0, 2).map(insight => (
                        <div key={insight.id} className="p-2 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${
                              insight.priority === 'high' ? 'bg-red-400' :
                              insight.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                            }`} />
                            <span className="text-white text-xs font-medium">{insight.title}</span>
                          </div>
                          <p className="text-white/70 text-xs">{insight.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-blue-600' 
                          : message.type === 'system'
                          ? 'bg-green-600'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : message.type === 'system' ? (
                          <Zap className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                        <div className={`inline-block p-3 rounded-2xl max-w-xs ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.type === 'system'
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-white/10 text-white'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          {message.confidence && (
                            <div className="mt-2 text-xs opacity-70">
                              Confidence: {message.confidence}%
                            </div>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        {message.actions && message.actions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.actions.map(action => (
                              <button
                                key={action.id}
                                onClick={() => handleActionExecution(action)}
                                className="block w-full text-left p-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg text-purple-400 text-xs transition-colors"
                              >
                                {action.confirmationRequired ? '⚠️ ' : '✨ '}{action.label}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* Suggestions */}
                        {message.suggestions && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.suggestions.slice(0, 2).map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => setInputValue(suggestion)}
                                className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 text-xs transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-1 text-xs text-white/40">
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white/10 rounded-2xl p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask me anything or try voice commands..."
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 pr-10"
                      />
                      {voiceSettings.enabled && (
                        <button
                          onClick={isListening ? stopListening : startListening}
                          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                            isListening ? 'bg-red-600 text-white' : 'hover:bg-white/10 text-white/60'
                          }`}
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-white/10 disabled:text-white/30 rounded-xl text-white transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {voiceSettings.enabled && (
                    <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                      <span>🎤 Voice commands enabled</span>
                      <button
                        onClick={() => setVoiceSettings(prev => ({ ...prev, autoSpeak: !prev.autoSpeak }))}
                        className="flex items-center gap-1 hover:text-white/80 transition-colors"
                      >
                        {voiceSettings.autoSpeak ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                        Auto-speak
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default EnhancedAIAssistant
