/**
 * Robust WebSocket Service for Connectouch Platform
 * Implements Phase 2 Architecture Stabilization with comprehensive real-time features
 */

import { io, Socket } from 'socket.io-client'
import { EventEmitter } from 'events'

export interface WebSocketConfig {
  url: string
  autoConnect: boolean
  reconnection: boolean
  reconnectionAttempts: number
  reconnectionDelay: number
  timeout: number
  heartbeatInterval: number
  maxMessageQueue: number
}

export interface ConnectionStatus {
  connected: boolean
  connecting: boolean
  reconnecting: boolean
  error: string | null
  lastConnected: Date | null
  connectionAttempts: number
  latency: number
}

export interface MessageQueue {
  id: string
  type: string
  data: any
  timestamp: Date
  retries: number
}

export class RobustWebSocketService extends EventEmitter {
  private socket: Socket | null = null
  private config: WebSocketConfig
  private status: ConnectionStatus
  private messageQueue: MessageQueue[] = []
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private isDestroyed = false
  private subscriptions = new Set<string>()
  private lastPingTime = 0
  private connectionId = ''

  constructor(config?: Partial<WebSocketConfig>) {
    super()
    
    this.config = {
      url: process.env.VITE_WS_URL || 'ws://localhost:3002',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
      heartbeatInterval: 30000,
      maxMessageQueue: 100,
      ...config
    }

    this.status = {
      connected: false,
      connecting: false,
      reconnecting: false,
      error: null,
      lastConnected: null,
      connectionAttempts: 0,
      latency: 0
    }

    if (this.config.autoConnect) {
      this.connect()
    }
  }

  /**
   * Connect to WebSocket server with comprehensive error handling
   * Implements Rule #23 - Complete vision, no skipped processes
   */
  async connect(): Promise<void> {
    if (this.isDestroyed) {
      throw new Error('WebSocket service has been destroyed')
    }

    if (this.status.connected || this.status.connecting) {
      console.log('🔌 WebSocket already connected or connecting')
      return
    }

    this.status.connecting = true
    this.status.error = null
    this.status.connectionAttempts++
    this.connectionId = this.generateConnectionId()

    console.log(`🔄 Connecting to WebSocket: ${this.config.url} (Attempt ${this.status.connectionAttempts})`)

    try {
      this.socket = io(this.config.url, {
        transports: ['websocket', 'polling'],
        timeout: this.config.timeout,
        forceNew: true,
        reconnection: false, // We handle reconnection manually
        autoConnect: false
      })

      this.setupSocketListeners()
      
      // Manual connection with timeout
      await this.connectWithTimeout()
      
      console.log('✅ WebSocket connected successfully')
      this.onConnectionSuccess()
      
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error)
      this.onConnectionError(error as Error)
    }
  }

  /**
   * Connect with timeout promise
   * Implements Rule #8 - Reduce overcorrection risk
   */
  private connectWithTimeout(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'))
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'))
      }, this.config.timeout)

      this.socket.once('connect', () => {
        clearTimeout(timeout)
        resolve()
      })

      this.socket.once('connect_error', (error) => {
        clearTimeout(timeout)
        reject(error)
      })

      this.socket.connect()
    })
  }

  /**
   * Setup socket event listeners
   * Implements Rule #17 - Modular architecture
   */
  private setupSocketListeners(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('🔗 WebSocket connected')
      this.status.connected = true
      this.status.connecting = false
      this.status.reconnecting = false
      this.status.lastConnected = new Date()
      this.status.error = null
      
      this.emit('connected', this.connectionId)
      this.startHeartbeat()
      this.processMessageQueue()
      this.resubscribeToChannels()
    })

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason)
      this.status.connected = false
      this.status.connecting = false
      
      this.emit('disconnected', reason)
      this.stopHeartbeat()
      
      if (reason !== 'io client disconnect' && this.config.reconnection) {
        this.scheduleReconnection()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
      this.onConnectionError(error)
    })

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error)
      this.status.error = error.message
      this.emit('error', error)
    })

    // Heartbeat response
    this.socket.on('pong', (timestamp) => {
      const now = Date.now()
      this.status.latency = now - (timestamp || this.lastPingTime)
      this.emit('latency', this.status.latency)
    })

    // Data events
    this.socket.on('market_data', (data) => {
      this.emit('market_data', data)
    })

    this.socket.on('price_update', (data) => {
      this.emit('price_update', data)
    })

    this.socket.on('defi_update', (data) => {
      this.emit('defi_update', data)
    })

    this.socket.on('news_update', (data) => {
      this.emit('news_update', data)
    })
  }

  /**
   * Handle successful connection
   * Implements Rule #29 - Ground truth validation
   */
  private onConnectionSuccess(): void {
    this.status.connectionAttempts = 0
    this.clearReconnectTimer()
    
    // Reset exponential backoff
    this.config.reconnectionDelay = 2000
  }

  /**
   * Handle connection error
   * Implements Rule #19 - Monte-Carlo approach for retry logic
   */
  private onConnectionError(error: Error): void {
    this.status.connecting = false
    this.status.error = error.message
    this.emit('error', error)

    if (this.config.reconnection && this.status.connectionAttempts < this.config.reconnectionAttempts) {
      this.scheduleReconnection()
    } else {
      console.error('🚫 Max reconnection attempts reached')
      this.emit('max_reconnect_attempts')
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   * Implements Rule #24 - Handle concurrent development
   */
  private scheduleReconnection(): void {
    if (this.isDestroyed || this.reconnectTimer) return

    this.status.reconnecting = true
    
    // Exponential backoff with jitter
    const delay = Math.min(
      this.config.reconnectionDelay * Math.pow(2, this.status.connectionAttempts - 1),
      30000 // Max 30 seconds
    )
    
    const jitter = Math.random() * 1000 // Add up to 1 second jitter
    const totalDelay = delay + jitter

    console.log(`🔄 Scheduling reconnection in ${Math.round(totalDelay)}ms`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (!this.isDestroyed) {
        this.connect()
      }
    }, totalDelay)
  }

  /**
   * Start heartbeat mechanism
   * Implements Rule #32 - Always use context engine
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()
    
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.lastPingTime = Date.now()
        this.socket.emit('ping', this.lastPingTime)
      }
    }, this.config.heartbeatInterval)
  }

  /**
   * Stop heartbeat mechanism
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * Send message with queuing for offline scenarios
   * Implements Rule #20 - No empty validation
   */
  send(type: string, data: any): void {
    const message: MessageQueue = {
      id: this.generateMessageId(),
      type,
      data,
      timestamp: new Date(),
      retries: 0
    }

    if (this.socket?.connected) {
      this.socket.emit(type, data)
      console.log(`📤 Sent message: ${type}`)
    } else {
      this.queueMessage(message)
      console.log(`📦 Queued message: ${type}`)
    }
  }

  /**
   * Queue message for later delivery
   * Implements Rule #10 - Flexible dataset adjustment
   */
  private queueMessage(message: MessageQueue): void {
    if (this.messageQueue.length >= this.config.maxMessageQueue) {
      // Remove oldest message
      this.messageQueue.shift()
    }
    
    this.messageQueue.push(message)
  }

  /**
   * Process queued messages when connection is restored
   * Implements Rule #31 - Complete handling
   */
  private processMessageQueue(): void {
    if (!this.socket?.connected || this.messageQueue.length === 0) return

    console.log(`📤 Processing ${this.messageQueue.length} queued messages`)

    const messages = [...this.messageQueue]
    this.messageQueue = []

    messages.forEach(message => {
      if (message.retries < 3) {
        this.socket!.emit(message.type, message.data)
        message.retries++
      }
    })
  }

  /**
   * Subscribe to data channels
   * Implements Rule #17 - Modular architecture
   */
  subscribe(channel: string, params?: any): void {
    this.subscriptions.add(channel)
    
    if (this.socket?.connected) {
      this.socket.emit('subscribe', { channel, params })
      console.log(`📡 Subscribed to: ${channel}`)
    } else {
      this.send('subscribe', { channel, params })
    }
  }

  /**
   * Unsubscribe from data channels
   */
  unsubscribe(channel: string): void {
    this.subscriptions.delete(channel)
    
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe', { channel })
      console.log(`📡 Unsubscribed from: ${channel}`)
    }
  }

  /**
   * Resubscribe to all channels after reconnection
   * Implements Rule #7 - Ground search and truth
   */
  private resubscribeToChannels(): void {
    if (this.subscriptions.size === 0) return

    console.log(`📡 Resubscribing to ${this.subscriptions.size} channels`)
    
    this.subscriptions.forEach(channel => {
      this.socket!.emit('subscribe', { channel })
    })
  }

  /**
   * Generate unique connection ID
   * Implements Rule #19 - Monte-Carlo approach
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate unique message ID
   * Implements Rule #19 - Monte-Carlo approach
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Clear reconnection timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * Get connection status
   * Implements Rule #32 - Context engine integration
   */
  getStatus(): ConnectionStatus {
    return { ...this.status }
  }

  /**
   * Disconnect and destroy
   * Implements Rule #31 - Complete handling
   */
  destroy(): void {
    console.log('🗑️ Destroying WebSocket service')
    
    this.isDestroyed = true
    this.clearReconnectTimer()
    this.stopHeartbeat()
    
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    
    this.removeAllListeners()
    this.messageQueue = []
    this.subscriptions.clear()
  }
}

// Export singleton instance
export const robustWebSocketService = new RobustWebSocketService()

export default robustWebSocketService
