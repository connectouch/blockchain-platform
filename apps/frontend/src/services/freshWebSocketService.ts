/**
 * Fresh WebSocket Service - Clean Implementation
 * Handles real-time communication with AI server
 */

import { io, Socket } from 'socket.io-client'

export interface WebSocketConfig {
  url: string
  autoConnect: boolean
  reconnection: boolean
  reconnectionAttempts: number
  reconnectionDelay: number
}

export interface AiChatMessage {
  message: string
  context?: string
  timestamp?: string
}

export interface AiResponse {
  success: boolean
  response?: string
  error?: string
  message?: string
  timestamp: string
}

class FreshWebSocketService {
  private static instance: FreshWebSocketService
  private socket: Socket | null = null
  private config: WebSocketConfig
  private isConnected = false
  private listeners: Map<string, Function[]> = new Map()

  private constructor() {
    this.config = {
      url: import.meta.env.VITE_AI_BASE_URL || 'http://localhost:3002',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    }
  }

  public static getInstance(): FreshWebSocketService {
    if (!FreshWebSocketService.instance) {
      FreshWebSocketService.instance = new FreshWebSocketService()
    }
    return FreshWebSocketService.instance
  }

  // Connect to WebSocket server
  public connect(): void {
    if (this.socket?.connected) {
      console.log('🔌 WebSocket already connected')
      return
    }

    console.log(`🔌 Connecting to WebSocket: ${this.config.url}`)

    this.socket = io(this.config.url, {
      autoConnect: this.config.autoConnect,
      reconnection: this.config.reconnection,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
      transports: ['websocket', 'polling']
    })

    this.setupEventHandlers()
  }

  // Disconnect from WebSocket server
  public disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket')
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Setup event handlers
  private setupEventHandlers(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected')
      this.isConnected = true
      this.emit('connected', { timestamp: new Date().toISOString() })
    })

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason)
      this.isConnected = false
      this.emit('disconnected', { reason, timestamp: new Date().toISOString() })
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
      this.emit('error', { error: error.message, timestamp: new Date().toISOString() })
    })

    this.socket.on('ai-response', (data: AiResponse) => {
      console.log('🤖 AI Response received:', data)
      this.emit('ai-response', data)
    })

    this.socket.on('price-update', (data) => {
      console.log('💰 Price update received:', data)
      this.emit('price-update', data)
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`)
      this.emit('reconnected', { attempts: attemptNumber, timestamp: new Date().toISOString() })
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ WebSocket reconnection error:', error)
      this.emit('reconnect-error', { error: error.message, timestamp: new Date().toISOString() })
    })
  }

  // Send AI chat message
  public sendAiMessage(message: string, context?: string): void {
    if (!this.isConnected || !this.socket) {
      console.error('❌ WebSocket not connected')
      this.emit('error', { 
        error: 'WebSocket not connected', 
        timestamp: new Date().toISOString() 
      })
      return
    }

    const chatMessage: AiChatMessage = {
      message,
      context,
      timestamp: new Date().toISOString()
    }

    console.log('🤖 Sending AI message:', chatMessage)
    this.socket.emit('ai-chat', chatMessage)
  }

  // Subscribe to real-time updates
  public subscribeToUpdates(type: string): void {
    if (!this.isConnected || !this.socket) {
      console.error('❌ WebSocket not connected')
      return
    }

    console.log(`📡 Subscribing to updates: ${type}`)
    this.socket.emit('subscribe-updates', { type })
  }

  // Add event listener
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  // Remove event listener
  public off(event: string, callback?: Function): void {
    if (!this.listeners.has(event)) return

    if (callback) {
      const listeners = this.listeners.get(event)!
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    } else {
      this.listeners.set(event, [])
    }
  }

  // Emit event to listeners
  private emit(event: string, data: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`❌ Error in ${event} listener:`, error)
        }
      })
    }
  }

  // Get connection status
  public getConnectionStatus(): {
    connected: boolean
    url: string
    transport?: string
  } {
    return {
      connected: this.isConnected,
      url: this.config.url,
      transport: this.socket?.io.engine.transport.name
    }
  }

  // Update configuration
  public updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Get current configuration
  public getConfig(): WebSocketConfig {
    return { ...this.config }
  }

  // Auto-connect if enabled
  public initialize(): void {
    if (this.config.autoConnect) {
      this.connect()
    }
  }

  // Cleanup
  public destroy(): void {
    this.disconnect()
    this.listeners.clear()
  }
}

// Export singleton instance
export const freshWebSocketService = FreshWebSocketService.getInstance()

// Auto-initialize
freshWebSocketService.initialize()

// Export for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).freshWebSocket = freshWebSocketService
}

export default FreshWebSocketService
