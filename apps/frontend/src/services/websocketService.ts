// Simple HTTP polling service for desktop platform (NO WebSocket complexity!)

export interface CandlestickData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TickerData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  timestamp: number
}

export interface WebSocketCallbacks {
  onCandlestickUpdate?: (symbol: string, data: CandlestickData) => void
  onTickerUpdate?: (data: TickerData) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: any) => void
}

class WebSocketService {
  private callbacks: WebSocketCallbacks = {}
  private isConnected = false
  private pollingIntervals = new Map<string, NodeJS.Timeout>()
  private baseUrl = '/api/v2/blockchain' // Use proxy instead of hardcoded URL
  private pollingRate = 10000 // 10 seconds

  constructor() {
    // Don't connect immediately - wait for callbacks to be set
    console.log('🔄 WebSocket service initialized (waiting for callbacks)')
  }

  connect() {
    if (this.isConnected) {
      return
    }

    console.log('🔄 Starting HTTP polling for price data...')
    this.testConnection()
  }

  private async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      if (response.ok) {
        this.isConnected = true
        console.log('✅ Price data service connected via HTTP polling')
        this.callbacks.onConnect?.()
        this.startPolling()
      } else {
        throw new Error('Backend not available')
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      this.callbacks.onError?.(error)
      setTimeout(() => this.testConnection(), 5000)
    }
  }

  private startPolling() {
    // Poll price data
    this.pollPriceData()
    this.pollingIntervals.set('prices', setInterval(() => {
      this.pollPriceData()
    }, this.pollingRate))
  }

  private async pollPriceData() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/blockchain/prices`)
      if (response.ok) {
        const data = await response.json()
        console.log('💰 Polled price data')

        // Convert to TickerData format and trigger callbacks
        Object.entries(data).forEach(([symbol, priceInfo]: [string, any]) => {
          const tickerData: TickerData = {
            symbol,
            price: priceInfo.usd || 0,
            change24h: priceInfo.usd_24h_change || 0,
            volume24h: priceInfo.usd_24h_vol || 0,
            timestamp: Date.now()
          }
          this.callbacks.onTickerUpdate?.(tickerData)

          // Also trigger candlestick update for charts
          const candlestick: CandlestickData = {
            time: tickerData.timestamp,
            open: tickerData.price,
            high: tickerData.price,
            low: tickerData.price,
            close: tickerData.price,
            volume: tickerData.volume24h
          }
          this.callbacks.onCandlestickUpdate?.(symbol, candlestick)
        })
      }
    } catch (error) {
      console.error('Failed to poll price data:', error)
    }
  }

  setCallbacks(callbacks: WebSocketCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
    // If we're already connected but callbacks weren't set before, trigger onConnect
    if (this.isConnected && this.callbacks.onConnect) {
      this.callbacks.onConnect()
    }
    // If not connected, try to connect now that we have callbacks
    if (!this.isConnected) {
      this.connect()
    }
  }

  subscribeToPriceUpdates(symbols: string[]) {
    console.log('📊 HTTP polling active for price updates:', symbols)
    // HTTP polling is already running, no need to do anything
  }

  subscribeToCandlesticks(symbol: string, timeframe: string) {
    console.log(`📈 HTTP polling active for candlesticks: ${symbol} (${timeframe})`)
    // HTTP polling is already running, no need to do anything
  }

  unsubscribeFromPriceUpdates(symbols: string[]) {
    console.log('📊 Unsubscribed from price updates for:', symbols)
    // For HTTP polling, we could stop specific intervals if needed
  }

  unsubscribeFromCandlesticks(symbol: string, timeframe: string) {
    console.log(`📈 Unsubscribed from candlesticks for ${symbol} (${timeframe})`)
    // For HTTP polling, we could stop specific intervals if needed
  }

  getIsConnected(): boolean {
    return this.isConnected
  }

  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    return this.isConnected ? 'connected' : 'disconnected'
  }

  disconnect() {
    console.log('🔌 Stopping HTTP polling...')
    this.isConnected = false

    // Clear all polling intervals
    this.pollingIntervals.forEach((interval) => {
      clearInterval(interval)
    })
    this.pollingIntervals.clear()

    this.callbacks.onDisconnect?.()
  }

  // Simulate real-time data for development/testing
  simulateRealTimeData(symbol: string, timeframe: string) {
    const generateCandlestick = (): CandlestickData => {
      const basePrice = 50000 + Math.random() * 10000
      const open = basePrice + (Math.random() - 0.5) * 1000
      const close = open + (Math.random() - 0.5) * 500
      const high = Math.max(open, close) + Math.random() * 200
      const low = Math.min(open, close) - Math.random() * 200
      const volume = Math.random() * 1000000

      return {
        time: Date.now(),
        open,
        high,
        low,
        close,
        volume
      }
    }

    const generateTicker = (): TickerData => ({
      symbol,
      price: 50000 + Math.random() * 10000,
      change24h: (Math.random() - 0.5) * 10,
      volume24h: Math.random() * 1000000000,
      timestamp: Date.now()
    })

    // Simulate candlestick updates every 5 seconds
    setInterval(() => {
      this.callbacks.onCandlestickUpdate?.(symbol, generateCandlestick())
    }, 5000)

    // Simulate ticker updates every 2 seconds
    setInterval(() => {
      this.callbacks.onTickerUpdate?.(generateTicker())
    }, 2000)
  }
}

// Singleton instance
export const websocketService = new WebSocketService()
export default websocketService
