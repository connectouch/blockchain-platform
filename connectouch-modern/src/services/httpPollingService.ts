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

export interface PollingCallbacks {
  onCandlestickUpdate?: (symbol: string, data: CandlestickData) => void
  onTickerUpdate?: (data: TickerData) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: any) => void
}

class HttpPollingService {
  private callbacks: PollingCallbacks = {}
  private isConnected = false
  private pollingIntervals = new Map<string, NodeJS.Timeout>()
  private baseUrl = 'http://localhost:3006'
  private pollingRate = 10000 // 10 seconds - reliable polling

  constructor() {
    // Don't connect immediately - wait for callbacks to be set
    console.log('🔄 HTTP polling service initialized (waiting for callbacks)')
  }

  setCallbacks(callbacks: PollingCallbacks) {
    this.callbacks = callbacks
    // If we're already connected but callbacks weren't set before, trigger onConnect
    if (this.isConnected && this.callbacks.onConnect) {
      this.callbacks.onConnect()
    }
    // If not connected, try to connect now that we have callbacks
    if (!this.isConnected) {
      this.connect()
    }
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
        
        // Convert to TickerData format
        Object.entries(data).forEach(([symbol, priceInfo]: [string, any]) => {
          const tickerData: TickerData = {
            symbol,
            price: priceInfo.usd || 0,
            change24h: priceInfo.usd_24h_change || 0,
            volume24h: priceInfo.usd_24h_vol || 0,
            timestamp: Date.now()
          }
          this.callbacks.onTickerUpdate?.(tickerData)
        })
      }
    } catch (error) {
      console.error('Failed to poll price data:', error)
    }
  }

  subscribeToPrices(symbols: string[]) {
    console.log('📡 HTTP polling active for prices:', symbols)
    // HTTP polling is already running, no need to do anything
  }

  subscribeToCandlesticks(symbol: string, timeframe: string) {
    console.log(`📡 HTTP polling active for candlesticks: ${symbol} ${timeframe}`)
    // For now, just log. Could implement specific candlestick polling if needed
  }

  unsubscribe(type: string) {
    console.log(`📡 Unsubscribed from ${type}`)
    // For HTTP polling, we could stop specific intervals if needed
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

  isConnectedStatus(): boolean {
    return this.isConnected
  }

  // Simulate real-time data for development/testing
  simulateRealTimeData(symbol: string, timeframe: string) {
    const generateCandlestick = (): CandlestickData => {
      const basePrice = 50000 + Math.random() * 10000
      const open = basePrice + (Math.random() - 0.5) * 1000
      const high = open + Math.random() * 500
      const low = open - Math.random() * 500
      const close = low + Math.random() * (high - low)
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

    // Generate initial data
    const candlestick = generateCandlestick()
    this.callbacks.onCandlestickUpdate?.(symbol, candlestick)

    // Continue generating data every few seconds
    const interval = setInterval(() => {
      if (this.isConnected) {
        const newCandlestick = generateCandlestick()
        this.callbacks.onCandlestickUpdate?.(symbol, newCandlestick)
      } else {
        clearInterval(interval)
      }
    }, 3000)
  }
}

// Create singleton instance
export const httpPollingService = new HttpPollingService()

// Export as default for backward compatibility
export default httpPollingService
