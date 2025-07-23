import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain,
  Mic,
  MicOff,
  Send,
  X,
  Minimize2,
  Maximize2,
  Settings,
  Volume2,
  VolumeX,
  MessageSquare,
  Zap,
  TrendingUp,
  DollarSign,
  BarChart3,
  Target,
  Shield,
  Globe,
  Activity,
  Lightbulb,
  Star,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Heart,
  Bookmark,
  Flag,
  Tag,
  Calendar,
  Clock,
  User,
  Users,
  Building,
  Home,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Map,
  Layers,
  Package,
  Truck,
  Plane,
  Car,
  Bike,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Tv,
  Radio,
  Headphones,
  Camera,
  Video,
  Image,
  File,
  Folder,
  Archive,
  Database,
  Server,
  Cloud,
  Wifi,
  Bluetooth,
  Usb,
  HardDrive,
  Cpu,
  // Memory, // Not available in lucide-react
  Battery,
  Power,
  Plug,
  Cable,
  Router,
  Network,
  Link,
  Unlink,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MoreVertical,
  Menu,
  Plus,
  Minus,
  Edit,
  Edit2,
  Edit3,
  Save,
  Trash,
  Trash2,
  Delete,
  Check,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  HelpCircle,
  // QuestionMark // Use HelpCircle instead
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  suggestions?: string[]
  context?: string
  actionable?: boolean
  actions?: any[]
  confidence?: number
  voiceEnabled?: boolean
  attachments?: any[]
  metadata?: any
}

interface VoiceSettings {
  enabled: boolean
  autoSpeak: boolean
  language: string
  voice: string
  rate: number
  pitch: number
  volume: number
}

interface AICapabilities {
  naturalLanguageTrading: boolean
  portfolioAnalysis: boolean
  marketInsights: boolean
  voiceCommands: boolean
  contextAwareness: boolean
  multiLanguage: boolean
  realTimeData: boolean
  predictiveAnalytics: boolean
  riskAssessment: boolean
  educationalContent: boolean
}

interface FloatingAIAssistantProps {
  currentFeature?: string
  contextData?: any
  portfolioData?: any
  userPreferences?: any
  onTradeAction?: (action: any) => void
  onPortfolioAction?: (action: any) => void
  onNavigationAction?: (action: any) => void
  onSettingsChange?: (settings: any) => void
}

const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  currentFeature = 'dashboard',
  contextData,
  portfolioData,
  userPreferences,
  onTradeAction,
  onPortfolioAction,
  onNavigationAction,
  onSettingsChange
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamingResponse, setStreamingResponse] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'actions' | 'history'>('chat')
  
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true,
    autoSpeak: false,
    language: 'en-US',
    voice: 'default',
    rate: 1,
    pitch: 1,
    volume: 0.8
  })

  const [capabilities, setCapabilities] = useState<AICapabilities>({
    naturalLanguageTrading: true,
    portfolioAnalysis: true,
    marketInsights: true,
    voiceCommands: true,
    contextAwareness: true,
    multiLanguage: true,
    realTimeData: true,
    predictiveAnalytics: true,
    riskAssessment: true,
    educationalContent: true
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<any>(null)

  // Initialize AI Assistant
  useEffect(() => {
    initializeAI()
    setupVoiceRecognition()
    setupSpeechSynthesis()
    
    return () => {
      cleanup()
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Update context when feature changes
  useEffect(() => {
    updateContextualWelcome()
  }, [currentFeature, contextData])

  const initializeAI = () => {
    const welcomeMessage: Message = {
      id: '1',
      type: 'ai',
      content: getContextualWelcome(),
      timestamp: new Date(),
      suggestions: getContextualSuggestions(),
      context: currentFeature,
      confidence: 100,
      voiceEnabled: true
    }
    
    setMessages([welcomeMessage])
  }

  const setupVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = voiceSettings.language
      
      recognitionRef.current.onstart = () => {
        setIsListening(true)
      }
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputValue(transcript)
        setIsListening(false)
      }
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }

  const setupSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }
  }

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (synthRef.current) {
      synthRef.current.cancel()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getContextualWelcome = (): string => {
    const welcomeMessages = {
      dashboard: "🚀 Welcome to your AI-powered dashboard! I can help you analyze your portfolio, execute trades, and provide market insights. What would you like to explore?",
      portfolio: "📊 I'm here to help optimize your portfolio! I can analyze your holdings, suggest rebalancing strategies, and identify new opportunities.",
      defi: "🌟 Ready to explore DeFi? I can explain protocols, help you find yield opportunities, and guide you through complex strategies safely.",
      nft: "🎨 Let's dive into the NFT world! I can help you discover collections, analyze floor prices, and understand market trends.",
      dao: "🏛️ Welcome to DAO governance! I can help you understand proposals, analyze voting patterns, and participate in community decisions.",
      infrastructure: "⚡ Exploring blockchain infrastructure? I can compare networks, analyze performance metrics, and explain technical concepts.",
      'multi-chain': "🌐 Multi-chain analysis at your service! I can help you bridge assets, compare networks, and optimize cross-chain strategies.",
      trading: "📈 Ready to trade? I can execute orders through natural language, provide market analysis, and help manage risk.",
      analytics: "📊 Let's analyze the markets! I can provide insights, identify trends, and help you make data-driven decisions."
    }
    
    return welcomeMessages[currentFeature as keyof typeof welcomeMessages] || welcomeMessages.dashboard
  }

  const getContextualSuggestions = (): string[] => {
    const suggestions = {
      dashboard: [
        "Show me my portfolio performance",
        "What's happening in crypto today?",
        "Analyze market trends",
        "Find trading opportunities"
      ],
      portfolio: [
        "Analyze my portfolio risk",
        "Suggest rebalancing strategies",
        "Find yield opportunities",
        "Compare my performance to market"
      ],
      defi: [
        "Explain yield farming",
        "Find best staking rewards",
        "Compare lending protocols",
        "Analyze liquidity pools"
      ],
      nft: [
        "Show trending NFT collections",
        "Analyze floor price trends",
        "Find undervalued NFTs",
        "Explain NFT utility"
      ],
      dao: [
        "Show active proposals",
        "Analyze voting patterns",
        "Explain governance tokens",
        "Find DAO opportunities"
      ],
      infrastructure: [
        "Compare blockchain performance",
        "Explain consensus mechanisms",
        "Analyze network security",
        "Show scaling solutions"
      ],
      'multi-chain': [
        "Compare chain fees",
        "Find bridge opportunities",
        "Analyze cross-chain protocols",
        "Show chain ecosystems"
      ],
      trading: [
        "Buy 1 ETH",
        "Set stop loss at $1800",
        "Show order book for BTC",
        "Analyze trading volume"
      ],
      analytics: [
        "Show market correlation",
        "Analyze price patterns",
        "Find arbitrage opportunities",
        "Predict market movements"
      ]
    }
    
    return suggestions[currentFeature as keyof typeof suggestions] || suggestions.dashboard
  }

  const updateContextualWelcome = () => {
    if (messages.length === 1 && messages[0].type === 'ai') {
      const updatedMessage: Message = {
        ...messages[0],
        content: getContextualWelcome(),
        suggestions: getContextualSuggestions(),
        context: currentFeature
      }
      setMessages([updatedMessage])
    }
  }

  const startVoiceRecognition = () => {
    if (recognitionRef.current && voiceSettings.enabled) {
      recognitionRef.current.start()
    }
  }

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const speakText = (text: string) => {
    if (synthRef.current && voiceSettings.enabled && !isSpeaking) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = voiceSettings.language
      utterance.rate = voiceSettings.rate
      utterance.pitch = voiceSettings.pitch
      utterance.volume = voiceSettings.volume
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      synthRef.current.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const parseNaturalLanguageCommand = (input: string) => {
    const commands = []
    const lowerInput = input.toLowerCase()
    
    // Trading commands
    if (lowerInput.includes('buy') || lowerInput.includes('purchase')) {
      const assetMatch = lowerInput.match(/buy\s+(\d+\.?\d*)\s+(\w+)|buy\s+(\w+)/i)
      if (assetMatch) {
        commands.push({
          type: 'trade',
          action: 'buy',
          amount: assetMatch[1] || '1',
          asset: assetMatch[2] || assetMatch[3] || 'BTC'
        })
      }
    }
    
    if (lowerInput.includes('sell')) {
      const assetMatch = lowerInput.match(/sell\s+(\d+\.?\d*)\s+(\w+)|sell\s+(\w+)/i)
      if (assetMatch) {
        commands.push({
          type: 'trade',
          action: 'sell',
          amount: assetMatch[1] || '1',
          asset: assetMatch[2] || assetMatch[3] || 'BTC'
        })
      }
    }
    
    // Portfolio commands
    if (lowerInput.includes('portfolio') || lowerInput.includes('balance')) {
      commands.push({
        type: 'portfolio',
        action: 'view'
      })
    }
    
    // Analysis commands
    if (lowerInput.includes('analyze') || lowerInput.includes('analysis')) {
      commands.push({
        type: 'analysis',
        action: 'analyze',
        target: lowerInput.includes('portfolio') ? 'portfolio' : 'market'
      })
    }
    
    // Navigation commands
    if (lowerInput.includes('go to') || lowerInput.includes('navigate')) {
      const pageMatch = lowerInput.match(/(?:go to|navigate to)\s+(\w+)/i)
      if (pageMatch) {
        commands.push({
          type: 'navigation',
          action: 'navigate',
          page: pageMatch[1]
        })
      }
    }
    
    return commands
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

    // Parse for commands
    const commands = parseNaturalLanguageCommand(inputValue)

    setMessages(prev => [...prev, userMessage])
    const messageToSend = inputValue
    setInputValue('')
    setIsTyping(true)

    try {
      // Import AIService dynamically to avoid circular dependencies
      const { AIService } = await import('../services/AIService')
      const aiService = AIService.getInstance()

      // Create a placeholder message for streaming
      const streamingMessageId = (Date.now() + 1).toString()
      const streamingMessage: Message = {
        id: streamingMessageId,
        type: 'ai',
        content: '',
        timestamp: new Date(),
        suggestions: [],
        context: currentFeature,
        actionable: false,
        actions: [],
        confidence: 0,
        voiceEnabled: true,
        metadata: { streaming: true }
      }

      setMessages(prev => [...prev, streamingMessage])
      setIsStreaming(true)
      setStreamingResponse('')

      // Enhanced AI response with real-time streaming
      const aiResponse = await aiService.enhancedChat(
        messageToSend,
        messages.slice(-10).map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        {
          feature: currentFeature,
          portfolioData,
          userPreferences,
          contextData
        },
        commands,
        capabilities,
        // Streaming callback
        (chunk: string) => {
          setStreamingResponse(prev => {
            const newContent = prev + chunk
            // Update the streaming message in real-time
            setMessages(prevMessages =>
              prevMessages.map(msg =>
                msg.id === streamingMessageId
                  ? { ...msg, content: newContent }
                  : msg
              )
            )
            return newContent
          })
        }
      )

      // Update final message with complete response
      const finalMessage: Message = {
        id: streamingMessageId,
        type: 'ai',
        content: aiResponse.response,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions || getContextualSuggestions(),
        context: currentFeature,
        actionable: commands.length > 0,
        actions: commands,
        confidence: aiResponse.confidence || 85,
        voiceEnabled: true,
        metadata: aiResponse.metadata
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === streamingMessageId ? finalMessage : msg
        )
      )

      setIsStreaming(false)
      setStreamingResponse('')

      // Execute commands if any
      if (commands.length > 0) {
        executeCommands(commands)
      }

      // Speak the response if auto-speak is enabled
      if (voiceSettings.autoSpeak && voiceSettings.enabled) {
        speakText(aiResponse.response)
      }
    } catch (error) {
      console.error('❌ AI Assistant Error:', error)
      console.error('🔍 Error details:', error instanceof Error ? error.message : error)

      // NO FALLBACK - Show real error to force API usage
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `❌ OpenAI API Error: ${error instanceof Error ? error.message : 'Unknown error'}.

🔧 This error means:
- The real OpenAI API is not working
- All fallback responses have been removed
- You need to fix the API connection

💡 Check the browser console for detailed error information.`,
        timestamp: new Date(),
        suggestions: [
          'Check API key',
          'Test connection',
          'View console logs',
          'Try again'
        ],
        context: currentFeature,
        actionable: false,
        confidence: 0,
        voiceEnabled: false,
        metadata: {
          error: true,
          errorType: 'OpenAI_API_Failure',
          errorDetails: error instanceof Error ? error.message : error
        }
      }

      setMessages(prev => [...prev, errorResponse])
    }
    
    setIsTyping(false)
  }

  const executeCommands = (commands: any[]) => {
    commands.forEach(command => {
      switch (command.type) {
        case 'trade':
          onTradeAction?.(command)
          break
        case 'portfolio':
          onPortfolioAction?.(command)
          break
        case 'navigation':
          onNavigationAction?.(command)
          break
        default:
          console.log('Unknown command type:', command.type)
      }
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    inputRef.current?.focus()
  }

  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopVoiceRecognition()
    } else {
      startVoiceRecognition()
    }
  }

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking()
    } else {
      // Speak the last AI message
      const lastAIMessage = messages.filter(m => m.type === 'ai').pop()
      if (lastAIMessage) {
        speakText(lastAIMessage.content)
      }
    }
  }

  // Floating AI button when closed
  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
        >
          <div className="relative">
            <Brain className="w-7 h-7" />
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
            />
            {isTyping && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-1 -left-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center"
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>
            )}
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black/80 text-white text-sm rounded-lg opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Assistant - Click to chat!
          </div>
        </motion.button>
      </motion.div>
    )
  }

  // Main AI Assistant Interface
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`fixed z-50 transition-all duration-300 ${
        isExpanded 
          ? 'inset-4' 
          : isMinimized 
            ? 'bottom-6 right-6 w-80 h-16'
            : 'bottom-6 right-6 w-96 h-[600px]'
      }`}
    >
      <div className="glass-card h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="w-6 h-6 text-blue-400" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
              />
            </div>
            <div>
              <h3 className="text-white font-bold">AI Assistant</h3>
              <p className="text-white/60 text-xs">
                {isTyping ? 'Thinking...' : `${currentFeature} context`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {voiceSettings.enabled && (
              <button
                onClick={toggleSpeaking}
                className={`p-2 rounded-lg transition-colors ${
                  isSpeaking ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60 hover:text-white'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 bg-white/10 hover:bg-red-500/20 rounded-lg text-white/60 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimized State */}
        {isMinimized && (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">AI Assistant</span>
              {isTyping && (
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              )}
            </div>
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 bg-white/10 hover:bg-white/20 rounded text-white/60 hover:text-white transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content */}
        {!isMinimized && (
          <>
            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-white/10 p-4 bg-white/5"
                >
                  <h4 className="text-white font-medium mb-3">AI Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Voice Commands</span>
                      <button
                        onClick={() => setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          voiceSettings.enabled ? 'bg-blue-500' : 'bg-white/20'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          voiceSettings.enabled ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Auto Speak</span>
                      <button
                        onClick={() => setVoiceSettings(prev => ({ ...prev, autoSpeak: !prev.autoSpeak }))}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          voiceSettings.autoSpeak ? 'bg-blue-500' : 'bg-white/20'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          voiceSettings.autoSpeak ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div>
                      <span className="text-white/80 text-sm">Speech Rate: {voiceSettings.rate}</span>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={voiceSettings.rate}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                        className="w-full mt-1"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab Navigation */}
            <div className="flex border-b border-white/10">
              {[
                { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },
                { id: 'insights', label: 'Insights', icon: <Lightbulb className="w-4 h-4" /> },
                { id: 'actions', label: 'Actions', icon: <Zap className="w-4 h-4" /> },
                { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {activeTab === 'chat' && (
                    <div className="h-full flex flex-col">
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[85%] p-4 rounded-2xl ${
                              message.type === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                : 'bg-gradient-to-r from-white/10 to-white/5 text-white border border-white/10 shadow-lg'
                            }`}>
                              {message.type === 'ai' && (
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold">A</span>
                                  </div>
                                  <span className="text-xs font-medium text-purple-300">Connectouch</span>
                                  {message.metadata?.streaming && (
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                  )}
                                </div>
                              )}

                              <div className="prose prose-sm prose-invert max-w-none">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                              </div>

                              {message.confidence && message.confidence > 0 && (
                                <div className="mt-3 flex items-center gap-2">
                                  <div className="flex-1 bg-white/10 rounded-full h-1">
                                    <div
                                      className="h-1 rounded-full bg-gradient-to-r from-green-400 to-blue-400"
                                      style={{ width: `${message.confidence}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-white/60">{message.confidence}%</span>
                                </div>
                              )}

                              {message.suggestions && message.suggestions.length > 0 && (
                                <div className="mt-4 space-y-2">
                                  <p className="text-xs text-white/70 font-medium">💡 Try asking:</p>
                                  <div className="grid grid-cols-1 gap-2">
                                    {message.suggestions.slice(0, 3).map((suggestion, index) => (
                                      <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="text-left text-xs p-2 bg-white/5 hover:bg-white/15 rounded-lg transition-all duration-200 border border-white/10 hover:border-white/20"
                                      >
                                        <span className="text-blue-300">→</span> {suggestion}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="mt-3 flex items-center justify-between">
                                <div className="text-xs text-white/40">
                                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                {message.type === 'ai' && (
                                  <div className="flex items-center gap-2">
                                    {voiceSettings.enabled && (
                                      <button
                                        onClick={() => speakText(message.content)}
                                        className="p-1 hover:bg-white/10 rounded transition-colors"
                                      >
                                        <Volume2 className="w-3 h-3 text-white/60" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => navigator.clipboard.writeText(message.content)}
                                      className="p-1 hover:bg-white/10 rounded transition-colors"
                                    >
                                      <Copy className="w-3 h-3 text-white/60" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {(isTyping || isStreaming) && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                          >
                            <div className="bg-white/10 text-white p-3 rounded-lg">
                              {isStreaming ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" />
                                    <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                                    <div className="w-1 h-5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                    <div className="w-1 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                                  </div>
                                  <span className="text-xs text-green-400 ml-2">Connectouch is responding...</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                  </div>
                                  <span className="text-xs text-blue-400 ml-2">Connectouch is thinking...</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input */}
                      <div className="p-4 border-t border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">A</span>
                            </div>
                            <span className="text-xs text-white/70">
                              {isStreaming ? 'Connectouch is responding...' :
                               isTyping ? 'Connectouch is thinking...' :
                               'Chat with Connectouch, your crypto companion'}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex-1 relative">
                            <textarea
                              ref={inputRef}
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              onKeyDown={handleKeyPress}
                              placeholder="Hey Connectouch! Ask me anything about crypto, DeFi, trading, or just say hi! 👋"
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 resize-none transition-all duration-200"
                              rows={inputValue.length > 50 ? 2 : 1}
                              style={{ minHeight: '48px', maxHeight: '96px' }}
                            />
                            {voiceSettings.enabled && (
                              <button
                                onClick={toggleVoiceRecognition}
                                className={`absolute right-12 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                                  isListening
                                    ? 'text-red-400 bg-red-400/20 animate-pulse'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                }`}
                                title={isListening ? 'Stop listening' : 'Start voice input'}
                              >
                                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                          <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isTyping || isStreaming}
                            className={`px-4 py-3 rounded-xl text-white transition-all duration-200 ${
                              !inputValue.trim() || isTyping || isStreaming
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                            }`}
                            title="Send message"
                          >
                            {isTyping || isStreaming ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Quick suggestions */}
                        {!isTyping && !isStreaming && inputValue.length === 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {getContextualSuggestions().slice(0, 2).map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-xs px-3 py-1 bg-white/5 hover:bg-white/15 rounded-full text-white/70 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'insights' && (
                    <div className="p-4 space-y-4">
                      <h4 className="text-white font-medium">Market Insights</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-white font-medium">Market Trend</span>
                          </div>
                          <p className="text-white/70 text-sm">Bitcoin is showing strong bullish momentum with increased institutional adoption.</p>
                        </div>

                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span className="text-white font-medium">Risk Assessment</span>
                          </div>
                          <p className="text-white/70 text-sm">Your portfolio shows moderate risk with good diversification across DeFi protocols.</p>
                        </div>

                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-purple-400" />
                            <span className="text-white font-medium">Opportunities</span>
                          </div>
                          <p className="text-white/70 text-sm">Consider staking ETH for 4.5% APY or exploring new DeFi yield farming opportunities.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'actions' && (
                    <div className="p-4 space-y-4">
                      <h4 className="text-white font-medium">Quick Actions</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleSuggestionClick("Buy 0.1 BTC")}
                          className="p-3 bg-green-600/20 hover:bg-green-600/30 rounded-lg text-green-400 transition-colors"
                        >
                          <DollarSign className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-xs">Quick Buy</span>
                        </button>

                        <button
                          onClick={() => handleSuggestionClick("Analyze my portfolio")}
                          className="p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-blue-400 transition-colors"
                        >
                          <BarChart3 className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-xs">Analyze</span>
                        </button>

                        <button
                          onClick={() => handleSuggestionClick("Find yield opportunities")}
                          className="p-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg text-purple-400 transition-colors"
                        >
                          <Target className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-xs">Find Yield</span>
                        </button>

                        <button
                          onClick={() => handleSuggestionClick("Show market trends")}
                          className="p-3 bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg text-yellow-400 transition-colors"
                        >
                          <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-xs">Trends</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-white/80 text-sm font-medium">Voice Commands</h5>
                        <div className="text-white/60 text-xs space-y-1">
                          <p>• "Buy 1 ETH"</p>
                          <p>• "Analyze my portfolio"</p>
                          <p>• "Show me DeFi opportunities"</p>
                          <p>• "What's the price of Bitcoin?"</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="p-4 space-y-4">
                      <h4 className="text-white font-medium">Conversation History</h4>
                      <div className="space-y-2">
                        {messages.filter(m => m.type === 'user').slice(-5).map((message) => (
                          <div key={message.id} className="p-2 bg-white/5 rounded text-white/70 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="truncate">{message.content}</span>
                              <button
                                onClick={() => handleSuggestionClick(message.content)}
                                className="ml-2 p-1 hover:bg-white/10 rounded"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-xs opacity-50 mt-1">
                              {message.timestamp.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default FloatingAIAssistant
