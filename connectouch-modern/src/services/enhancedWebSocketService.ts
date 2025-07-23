import { io, Socket } from 'socket.io-client'
import { EventEmitter } from 'events'

export interface ConnectionConfig {
  url: string
  timeout: number
  reconnectionAttempts: number
  reconnectionDelay: number
  fallbackToPolling: boolean
  pollingInterval: number
}

export interface ConnectionStatus {
  connected: boolean
  connecting: boolean
  error: string | null
  lastConnected: Date | null
  reconnectAttempts: number
  usingFallback: boolean
}

export interface RealTimeData {
  type: string
  data: any
  timestamp: Date
  source: 'websocket' | 'polling'
}

/**
 * Enhanced WebSocket Service with robust fallback mechanisms
 * Automatically falls back to HTTP polling when WebSocket fails
 */
export class EnhancedWebSocketService extends EventEmitter {
  private socket: Socket | null = null
  private config: ConnectionConfig
  private status: ConnectionStatus
  private pollingInterval: NodeJS.Timeout | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private subscriptions = new Set<string>()
  private lastDataReceived = new Map<string, Date>()

  constructor(config: Partial<ConnectionConfig> = {}) {
    super()
    
    this.config = {
      url: 'http://localhost:3006',
      timeout: 10000,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      fallbackToPolling: true,
      pollingInterval: 10000,
      ...config
    }

    this.status = {
      connected: false,
      connecting: false,
      error: null,
      lastConnected: null,
      reconnectAttempts: 0,
      usingFallback: false
    }

    this.connect()
  }

  async connect(): Promise<void> {
    if (this.status.connecting || this.status.connected) {
      return
    }

    this.status.connecting = true
    this.status.error = null
    this.emit('connecting')

    try {
      console.log('🔄 Attempting WebSocket connection...')
      
      this.socket = io(this.config.url, {
        transports: ['websocket', 'polling'],
        timeout: this.config.timeout,
        forceNew: true,
        reconnection: false, // We handle reconnection manually
      })

      this.setupSocketListeners()
      
      // Wait for connection with timeout
      await this.waitForConnection()
      
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error)
      this.handleConnectionError(error as Error)
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected')
      this.status.connected = true
      this.status.connecting = false
      this.status.lastConnected = new Date()
      this.status.reconnectAttempts = 0
      this.status.usingFallback = false
      this.status.error = null

      // Stop polling if it was running
      this.stopPolling()

      // Resubscribe to all subscriptions
      this.resubscribeAll()

      this.emit('connected')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason)
      this.status.connected = false
      this.emit('disconnected', reason)

      // Attempt reconnection or fallback
      this.handleDisconnection(reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
      this.handleConnectionError(error)
    })

    // Listen for real-time data
    this.socket.on('market-overview', (data) => {
      this.handleRealTimeData('market-overview', data, 'websocket')
    })

    this.socket.on('price-update', (data) => {
      this.handleRealTimeData('price-update', data, 'websocket')
    })

    this.socket.on('defi-update', (data) => {
      this.handleRealTimeData('defi-update', data, 'websocket')
    })

    this.socket.on('nft-update', (data) => {
      this.handleRealTimeData('nft-update', data, 'websocket')
    })

    this.socket.on('gamefi-update', (data) => {
      this.handleRealTimeData('gamefi-update', data, 'websocket')
    })

    this.socket.on('ai-response', (data) => {
      this.handleRealTimeData('ai-response', data, 'websocket')
    })
  }

  private async waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'))
      }, this.config.timeout)

      if (this.socket) {
        this.socket.once('connect', () => {
          clearTimeout(timeout)
          resolve()
        })

        this.socket.once('connect_error', (error) => {
          clearTimeout(timeout)
          reject(error)
        })
      }
    })
  }

  private handleConnectionError(error: Error): void {
    this.status.connecting = false
    this.status.connected = false
    this.status.error = error.message
    this.status.reconnectAttempts++

    this.emit('error', error)

    // Clear any existing reconnection timeout to prevent loops
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.status.reconnectAttempts < this.config.reconnectionAttempts) {
      // Exponential backoff to prevent connection storms
      const delay = Math.min(
        this.config.reconnectionDelay * Math.pow(2, this.status.reconnectAttempts - 1),
        30000 // Max 30 seconds
      )

      console.log(`🔄 Retrying connection in ${delay}ms (attempt ${this.status.reconnectAttempts}/${this.config.reconnectionAttempts})`)

      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null
        this.connect()
      }, delay)
    } else if (this.config.fallbackToPolling) {
      console.log('🔄 Max reconnection attempts reached, falling back to HTTP polling')
      this.fallbackToPolling()
    } else {
      console.log('❌ Max reconnection attempts reached, giving up')
      this.emit('connectionFailed')
    }
  }

  private handleDisconnection(reason: string): void {
    if (reason === 'io server disconnect') {
      // Server initiated disconnect, don't reconnect
      console.log('🔌 Server initiated disconnect, not reconnecting')
      return
    }

    // Clear any existing reconnection timeout to prevent loops
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    // Don't attempt reconnection if we're already trying to connect
    if (this.status.connecting) {
      console.log('🔄 Already attempting to connect, skipping reconnection')
      return
    }

    // Attempt reconnection with exponential backoff
    if (this.status.reconnectAttempts < this.config.reconnectionAttempts) {
      const delay = Math.min(
        this.config.reconnectionDelay * Math.pow(2, this.status.reconnectAttempts),
        30000 // Max 30 seconds
      )

      console.log(`🔄 Reconnecting in ${delay}ms due to: ${reason}`)

      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null
        this.connect()
      }, delay)
    } else if (this.config.fallbackToPolling) {
      this.fallbackToPolling()
    }
  }

  private fallbackToPolling(): void {
    console.log('📡 Falling back to HTTP polling')
    this.status.usingFallback = true
    this.startPolling()
    this.emit('fallbackActivated')
  }

  private startPolling(): void {
    if (this.pollingInterval) {
      return
    }

    console.log('🔄 Starting HTTP polling...')
    
    this.pollingInterval = setInterval(async () => {
      await this.pollData()
    }, this.config.pollingInterval)

    // Initial poll
    this.pollData()
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
      console.log('🛑 HTTP polling stopped')
    }
  }

  private async pollData(): Promise<void> {
    try {
      // Poll market overview
      if (this.subscriptions.has('market-overview')) {
        const response = await fetch(`${this.config.url}/api/v2/blockchain/market/overview`)
        if (response.ok) {
          const data = await response.json()
          this.handleRealTimeData('market-overview', data.data, 'polling')
        }
      }

      // Poll price data
      if (this.subscriptions.has('price-update')) {
        const response = await fetch(`${this.config.url}/api/v2/blockchain/prices`)
        if (response.ok) {
          const data = await response.json()
          this.handleRealTimeData('price-update', data.data, 'polling')
        }
      }

      // Poll DeFi data
      if (this.subscriptions.has('defi-update')) {
        const response = await fetch(`${this.config.url}/api/v2/blockchain/defi/protocols`)
        if (response.ok) {
          const data = await response.json()
          this.handleRealTimeData('defi-update', data.data, 'polling')
        }
      }

    } catch (error) {
      console.error('❌ Polling error:', error)
      this.emit('pollingError', error)
    }
  }

  private handleRealTimeData(type: string, data: any, source: 'websocket' | 'polling'): void {
    const realTimeData: RealTimeData = {
      type,
      data,
      timestamp: new Date(),
      source
    }

    this.lastDataReceived.set(type, realTimeData.timestamp)
    this.emit('data', realTimeData)
    this.emit(type, data)
  }

  private resubscribeAll(): void {
    if (!this.socket || !this.status.connected) return

    for (const subscription of this.subscriptions) {
      this.socket.emit('subscribe', {
        type: subscription,
        symbols: [],
        options: {}
      })
    }
  }

  // Public methods
  subscribe(type: string, symbols: string[] = []): void {
    this.subscriptions.add(type)

    if (this.socket && this.status.connected) {
      this.socket.emit('subscribe', { type, symbols, options: {} })
    }
    
    console.log(`📡 Subscribed to ${type}`)
  }

  unsubscribe(type: string): void {
    this.subscriptions.delete(type)

    if (this.socket && this.status.connected) {
      this.socket.emit('unsubscribe', { type })
    }

    console.log(`📡 Unsubscribed from ${type}`)
  }

  sendMessage(type: string, data: any): void {
    if (this.socket && this.status.connected) {
      this.socket.emit(type, data)
    } else {
      console.warn('⚠️ Cannot send message: not connected')
    }
  }

  getStatus(): ConnectionStatus {
    return { ...this.status }
  }

  isConnected(): boolean {
    return this.status.connected || this.status.usingFallback
  }

  disconnect(): void {
    this.subscriptions.clear()
    this.stopPolling()

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    this.status.connected = false
    this.status.connecting = false
    this.status.usingFallback = false
  }
}

// Create singleton instance
export const enhancedWebSocketService = new EnhancedWebSocketService()
export default enhancedWebSocketService
