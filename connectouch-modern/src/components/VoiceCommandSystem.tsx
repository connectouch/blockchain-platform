import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Zap,
  Brain,
  Activity,
  Target,
  DollarSign
} from 'lucide-react'

interface VoiceCommand {
  id: string
  phrase: string
  action: string
  category: 'trading' | 'portfolio' | 'navigation' | 'analysis' | 'general'
  parameters?: any
  confidence?: number
  executed?: boolean
  timestamp?: Date
}

interface VoiceSettings {
  enabled: boolean
  language: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  sensitivity: number
  autoExecute: boolean
  confirmationRequired: boolean
  voiceFeedback: boolean
  wakeWord: string
}

interface SpeechSynthesisSettings {
  voice: string
  rate: number
  pitch: number
  volume: number
  enabled: boolean
}

interface VoiceCommandSystemProps {
  onCommandExecuted?: (command: VoiceCommand) => void
  onTradeCommand?: (command: VoiceCommand) => void
  onPortfolioCommand?: (command: VoiceCommand) => void
  onNavigationCommand?: (command: VoiceCommand) => void
  isActive?: boolean
}

const VoiceCommandSystem: React.FC<VoiceCommandSystemProps> = ({
  onCommandExecuted,
  onTradeCommand,
  onPortfolioCommand,
  onNavigationCommand,
  isActive = false
}) => {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null)
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([])
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true,
    language: 'en-US',
    continuous: false,
    interimResults: true,
    maxAlternatives: 3,
    sensitivity: 0.7,
    autoExecute: false,
    confirmationRequired: true,
    voiceFeedback: true,
    wakeWord: 'hey connectouch'
  })
  const [speechSettings, setSpeechSettings] = useState<SpeechSynthesisSettings>({
    voice: 'default',
    rate: 1,
    pitch: 1,
    volume: 0.8,
    enabled: true
  })
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Speech Recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        
        recognitionRef.current.continuous = voiceSettings.continuous
        recognitionRef.current.interimResults = voiceSettings.interimResults
        recognitionRef.current.lang = voiceSettings.language
        recognitionRef.current.maxAlternatives = voiceSettings.maxAlternatives

        recognitionRef.current.onstart = () => {
          setIsListening(true)
          setInterimTranscript('')
          setFinalTranscript('')
        }

        recognitionRef.current.onresult = (event: any) => {
          let interim = ''
          let final = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              final += transcript
            } else {
              interim += transcript
            }
          }

          setInterimTranscript(interim)
          if (final) {
            setFinalTranscript(final)
            processVoiceCommand(final, event.results[event.results.length - 1][0].confidence)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          setIsProcessing(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
          setIsProcessing(false)
        }
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis
        
        const updateVoices = () => {
          const voices = synthRef.current?.getVoices() || []
          setAvailableVoices(voices)
        }

        updateVoices()
        synthRef.current.onvoiceschanged = updateVoices
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [voiceSettings])

  // Process voice command
  const processVoiceCommand = useCallback((transcript: string, confidence: number) => {
    setIsProcessing(true)
    
    const command = parseVoiceCommand(transcript, confidence)
    if (command) {
      setLastCommand(command)
      setCommandHistory(prev => [command, ...prev.slice(0, 9)]) // Keep last 10 commands
      
      if (voiceSettings.voiceFeedback) {
        speak(`I heard: ${command.phrase}. ${command.action}`)
      }

      // Execute command based on category
      switch (command.category) {
        case 'trading':
          onTradeCommand?.(command)
          break
        case 'portfolio':
          onPortfolioCommand?.(command)
          break
        case 'navigation':
          onNavigationCommand?.(command)
          break
        default:
          onCommandExecuted?.(command)
      }

      if (voiceSettings.autoExecute && !voiceSettings.confirmationRequired) {
        executeCommand(command)
      }
    }
    
    setIsProcessing(false)
  }, [voiceSettings, onCommandExecuted, onTradeCommand, onPortfolioCommand, onNavigationCommand])

  // Parse voice command into structured command
  const parseVoiceCommand = (transcript: string, confidence: number): VoiceCommand | null => {
    const lowerTranscript = transcript.toLowerCase().trim()
    
    // Trading commands
    const tradingPatterns = [
      {
        pattern: /(?:buy|purchase)\s+(\d*\.?\d+)?\s*(bitcoin|btc|ethereum|eth|solana|sol)/i,
        action: 'buy',
        category: 'trading' as const
      },
      {
        pattern: /(?:sell|dispose)\s+(\d*\.?\d+)?\s*(bitcoin|btc|ethereum|eth|solana|sol)/i,
        action: 'sell',
        category: 'trading' as const
      },
      {
        pattern: /(?:set|place)\s+(?:a\s+)?stop\s+loss\s+(?:at\s+)?(\d+)/i,
        action: 'set_stop_loss',
        category: 'trading' as const
      }
    ]

    // Portfolio commands
    const portfolioPatterns = [
      {
        pattern: /(?:show|display|analyze)\s+(?:my\s+)?portfolio/i,
        action: 'show_portfolio',
        category: 'portfolio' as const
      },
      {
        pattern: /(?:rebalance|optimize)\s+(?:my\s+)?portfolio/i,
        action: 'rebalance_portfolio',
        category: 'portfolio' as const
      },
      {
        pattern: /(?:check|show)\s+(?:my\s+)?performance/i,
        action: 'show_performance',
        category: 'portfolio' as const
      }
    ]

    // Navigation commands
    const navigationPatterns = [
      {
        pattern: /(?:go\s+to|open|navigate\s+to)\s+(dashboard|portfolio|defi|nft|analysis)/i,
        action: 'navigate',
        category: 'navigation' as const
      },
      {
        pattern: /(?:show|display)\s+(charts|trading\s+view)/i,
        action: 'show_charts',
        category: 'navigation' as const
      }
    ]

    // Analysis commands
    const analysisPatterns = [
      {
        pattern: /(?:analyze|check)\s+(market|trends|sentiment)/i,
        action: 'analyze_market',
        category: 'analysis' as const
      },
      {
        pattern: /(?:what|show)\s+(?:are\s+)?(?:the\s+)?(?:best\s+)?opportunities/i,
        action: 'show_opportunities',
        category: 'analysis' as const
      }
    ]

    const allPatterns = [...tradingPatterns, ...portfolioPatterns, ...navigationPatterns, ...analysisPatterns]

    for (const { pattern, action, category } of allPatterns) {
      const match = transcript.match(pattern)
      if (match && confidence > voiceSettings.sensitivity) {
        return {
          id: Date.now().toString(),
          phrase: transcript,
          action: action,
          category: category,
          parameters: extractParameters(match, action),
          confidence: confidence,
          executed: false,
          timestamp: new Date()
        }
      }
    }

    return null
  }

  // Extract parameters from regex match
  const extractParameters = (match: RegExpMatchArray, action: string): any => {
    switch (action) {
      case 'buy':
      case 'sell':
        return {
          amount: match[1] ? parseFloat(match[1]) : 1,
          asset: match[2]?.toUpperCase()
        }
      case 'set_stop_loss':
        return {
          price: parseFloat(match[1])
        }
      case 'navigate':
        return {
          destination: match[1]?.toLowerCase()
        }
      default:
        return {}
    }
  }

  // Execute command
  const executeCommand = (command: VoiceCommand) => {
    const updatedCommand = { ...command, executed: true }
    setLastCommand(updatedCommand)
    setCommandHistory(prev => prev.map(cmd => cmd.id === command.id ? updatedCommand : cmd))
    
    if (voiceSettings.voiceFeedback) {
      speak(`Executing ${command.action}`)
    }
  }

  // Text-to-speech
  const speak = (text: string) => {
    if (synthRef.current && speechSettings.enabled) {
      synthRef.current.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = speechSettings.rate
      utterance.pitch = speechSettings.pitch
      utterance.volume = speechSettings.volume
      
      if (speechSettings.voice !== 'default') {
        const voice = availableVoices.find(v => v.name === speechSettings.voice)
        if (voice) utterance.voice = voice
      }
      
      synthRef.current.speak(utterance)
    }
  }

  // Start listening
  const startListening = () => {
    if (recognitionRef.current && voiceSettings.enabled) {
      recognitionRef.current.start()
    }
  }

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className="space-y-4">
      {/* Voice Control Panel */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isListening ? 'bg-red-500 animate-pulse' : 'bg-purple-600'
            }`}>
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold">Voice Command System</h3>
              <p className="text-white/60 text-sm">
                {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready for commands'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={toggleListening}
              disabled={!voiceSettings.enabled}
              className={`p-3 rounded-lg font-medium transition-colors ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600 disabled:text-gray-400'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Live Transcript */}
        {(isListening || interimTranscript || finalTranscript) && (
          <div className="p-4 bg-white/5 rounded-lg mb-4">
            <h4 className="text-white/80 text-sm font-medium mb-2">Live Transcript</h4>
            <div className="space-y-1">
              {finalTranscript && (
                <p className="text-green-400 text-sm">✓ {finalTranscript}</p>
              )}
              {interimTranscript && (
                <p className="text-white/60 text-sm italic">{interimTranscript}</p>
              )}
            </div>
          </div>
        )}

        {/* Last Command */}
        {lastCommand && (
          <div className="p-4 bg-white/5 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white/80 text-sm font-medium">Last Command</h4>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  lastCommand.executed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {lastCommand.executed ? 'Executed' : 'Pending'}
                </span>
                <span className="text-white/60 text-xs">
                  {lastCommand.confidence && `${Math.round(lastCommand.confidence * 100)}%`}
                </span>
              </div>
            </div>
            <p className="text-white text-sm mb-1">"{lastCommand.phrase}"</p>
            <p className="text-purple-400 text-sm">Action: {lastCommand.action}</p>
            {lastCommand.parameters && Object.keys(lastCommand.parameters).length > 0 && (
              <div className="mt-2 text-xs text-white/60">
                Parameters: {JSON.stringify(lastCommand.parameters)}
              </div>
            )}
            {!lastCommand.executed && voiceSettings.confirmationRequired && (
              <button
                onClick={() => executeCommand(lastCommand)}
                className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs transition-colors"
              >
                Execute Command
              </button>
            )}
          </div>
        )}

        {/* Quick Commands */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => speak("Voice commands are ready. Try saying 'show my portfolio' or 'buy Bitcoin'")}
            className="flex items-center gap-2 p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-blue-400 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span className="text-sm">Test Voice</span>
          </button>
          <button
            onClick={() => setCommandHistory([])}
            className="flex items-center gap-2 p-3 bg-gray-600/20 hover:bg-gray-600/30 rounded-lg text-gray-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Clear History</span>
          </button>
        </div>
      </div>

      {/* Command Examples */}
      <div className="glass-card p-6">
        <h4 className="text-white font-bold mb-4">Voice Command Examples</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Trading Commands
            </h5>
            <ul className="space-y-1 text-sm text-white/70">
              <li>"Buy 0.1 Bitcoin"</li>
              <li>"Sell half my Ethereum"</li>
              <li>"Set stop loss at 40000"</li>
              <li>"Check my orders"</li>
            </ul>
          </div>
          <div>
            <h5 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Portfolio Commands
            </h5>
            <ul className="space-y-1 text-sm text-white/70">
              <li>"Show my portfolio"</li>
              <li>"Rebalance portfolio"</li>
              <li>"Check performance"</li>
              <li>"Analyze my holdings"</li>
            </ul>
          </div>
          <div>
            <h5 className="text-green-400 font-medium mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Navigation Commands
            </h5>
            <ul className="space-y-1 text-sm text-white/70">
              <li>"Go to dashboard"</li>
              <li>"Open DeFi page"</li>
              <li>"Show trading charts"</li>
              <li>"Navigate to analysis"</li>
            </ul>
          </div>
          <div>
            <h5 className="text-yellow-400 font-medium mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Analysis Commands
            </h5>
            <ul className="space-y-1 text-sm text-white/70">
              <li>"Analyze market trends"</li>
              <li>"Show opportunities"</li>
              <li>"Check market sentiment"</li>
              <li>"What's trending today"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Command History */}
      {commandHistory.length > 0 && (
        <div className="glass-card p-6">
          <h4 className="text-white font-bold mb-4">Command History</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {commandHistory.map((command) => (
              <div key={command.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <p className="text-white text-sm">"{command.phrase}"</p>
                  <p className="text-white/60 text-xs">{command.action} • {command.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  {command.executed ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className="text-white/60 text-xs">
                    {command.timestamp?.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6"
          >
            <h4 className="text-white font-bold mb-4">Voice Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="text-white/80 font-medium">Recognition Settings</h5>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Language</label>
                  <select
                    value={voiceSettings.language}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="en-US" className="bg-gray-800">English (US)</option>
                    <option value="en-GB" className="bg-gray-800">English (UK)</option>
                    <option value="es-ES" className="bg-gray-800">Spanish</option>
                    <option value="fr-FR" className="bg-gray-800">French</option>
                    <option value="de-DE" className="bg-gray-800">German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Sensitivity: {Math.round(voiceSettings.sensitivity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.sensitivity}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, sensitivity: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={voiceSettings.continuous}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, continuous: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-white/70 text-sm">Continuous listening</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={voiceSettings.confirmationRequired}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, confirmationRequired: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-white/70 text-sm">Require confirmation</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={voiceSettings.voiceFeedback}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, voiceFeedback: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-white/70 text-sm">Voice feedback</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-white/80 font-medium">Speech Settings</h5>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Voice</label>
                  <select
                    value={speechSettings.voice}
                    onChange={(e) => setSpeechSettings(prev => ({ ...prev, voice: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="default" className="bg-gray-800">Default</option>
                    {availableVoices.map((voice) => (
                      <option key={voice.name} value={voice.name} className="bg-gray-800">
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Speech Rate: {speechSettings.rate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechSettings.rate}
                    onChange={(e) => setSpeechSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Pitch: {speechSettings.pitch.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={speechSettings.pitch}
                    onChange={(e) => setSpeechSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Volume: {Math.round(speechSettings.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={speechSettings.volume}
                    onChange={(e) => setSpeechSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VoiceCommandSystem
