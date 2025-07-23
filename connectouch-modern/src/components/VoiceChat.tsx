import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, Loader2, Zap } from 'lucide-react'

interface VoiceChatProps {
  onVoiceMessage: (message: string) => void
  isAIResponding: boolean
  aiResponse?: string
}

const VoiceChat: React.FC<VoiceChatProps> = ({ onVoiceMessage, isAIResponding, aiResponse }) => {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [volume, setVolume] = useState(0)
  
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const speechSynthesis = window.speechSynthesis
    
    if (SpeechRecognition && speechSynthesis) {
      setIsSupported(true)
      synthRef.current = speechSynthesis
      
      // Initialize speech recognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onstart = () => {
        setIsListening(true)
        startVolumeVisualization()
      }
      
      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex
        const transcript = event.results[current][0].transcript
        setTranscript(transcript)
        
        if (event.results[current].isFinal) {
          onVoiceMessage(transcript)
          setTranscript('')
        }
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
        stopVolumeVisualization()
      }
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        stopVolumeVisualization()
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [onVoiceMessage])

  // Speak AI response
  useEffect(() => {
    if (aiResponse && synthRef.current) {
      speakText(aiResponse)
    }
  }, [aiResponse])

  const startVolumeVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      
      analyserRef.current.fftSize = 256
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      const updateVolume = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setVolume(average / 255)
          animationRef.current = requestAnimationFrame(updateVolume)
        }
      }
      updateVolume()
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopVolumeVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setVolume(0)
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const speakText = (text: string) => {
    if (synthRef.current) {
      // Stop any current speech
      synthRef.current.cancel()
      
      // Clean text for better speech
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
        .replace(/📊|💡|🎯|⚠️|🚀|👋/g, '') // Remove emojis
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .trim()
      
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 0.9
      utterance.pitch = 1.1
      utterance.volume = 0.8
      
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

  if (!isSupported) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="text-red-400 mb-2">
          <MicOff className="w-8 h-8 mx-auto mb-2" />
        </div>
        <p className="text-white/70 text-sm">
          Voice chat is not supported in your browser. Please use Chrome or Edge for the best experience.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          Voice Chat with Connectouch AI
        </h3>
        
        {/* Voice Visualization */}
        <div className="relative mb-6">
          <motion.div
            className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden"
            animate={{
              scale: isListening ? 1 + volume * 0.3 : 1,
              boxShadow: isListening 
                ? `0 0 ${20 + volume * 30}px rgba(59, 130, 246, 0.5)`
                : '0 0 20px rgba(59, 130, 246, 0.3)'
            }}
            transition={{ duration: 0.1 }}
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
              animate={{
                opacity: isListening ? volume : 0.3,
                rotate: isListening ? 360 : 0
              }}
              transition={{ 
                opacity: { duration: 0.1 },
                rotate: { duration: 2, repeat: Infinity, ease: "linear" }
              }}
            />
            
            {/* Icon */}
            <div className="relative z-10">
              {isAIResponding ? (
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              ) : isListening ? (
                <Mic className="w-12 h-12 text-white" />
              ) : isSpeaking ? (
                <Volume2 className="w-12 h-12 text-white" />
              ) : (
                <MicOff className="w-12 h-12 text-white/70" />
              )}
            </div>
          </motion.div>
          
          {/* Volume bars */}
          {isListening && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-blue-400 rounded-full"
                  animate={{
                    height: volume > i * 0.2 ? 20 + volume * 20 : 4
                  }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Transcript */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-white/10 rounded-lg"
            >
              <p className="text-white/80 text-sm italic">"{transcript}"</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isListening ? stopListening : startListening}
            disabled={isAIResponding}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 inline mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 inline mr-2" />
                Start Voice Chat
              </>
            )}
          </motion.button>

          {isSpeaking && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopSpeaking}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all duration-300"
            >
              <VolumeX className="w-4 h-4 inline mr-2" />
              Stop Speaking
            </motion.button>
          )}
        </div>

        {/* Status */}
        <div className="mt-4 text-sm text-white/60">
          {isAIResponding ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Connectouch AI is thinking...
            </span>
          ) : isListening ? (
            <span className="text-blue-400">🎤 Listening... Speak now!</span>
          ) : isSpeaking ? (
            <span className="text-orange-400">🔊 Connectouch AI is speaking...</span>
          ) : (
            <span>Click "Start Voice Chat" to talk with Connectouch AI</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default VoiceChat
