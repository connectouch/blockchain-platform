import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import BlockchainDataService from './BlockchainDataService';

interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TickerData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
}

interface ClientSubscription {
  socketId: string;
  symbols: string[];
  timeframes: { [symbol: string]: string };
}

class WebSocketService {
  private io: SocketIOServer;
  private subscriptions: Map<string, ClientSubscription> = new Map();
  private priceUpdateInterval: NodeJS.Timeout | null = null;
  private candlestickUpdateInterval: NodeJS.Timeout | null = null;
  private blockchainService: BlockchainDataService;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.blockchainService = new BlockchainDataService();
    this.setupSocketHandlers();
    this.startPriceUpdates();
    this.startCandlestickUpdates();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`📊 WebSocket client connected: ${socket.id}`);

      // Initialize client subscription
      this.subscriptions.set(socket.id, {
        socketId: socket.id,
        symbols: [],
        timeframes: {}
      });

      // Handle price subscriptions
      socket.on('subscribe_prices', (data: { symbols: string[] }) => {
        this.handlePriceSubscription(socket, data.symbols);
      });

      socket.on('unsubscribe_prices', (data: { symbols: string[] }) => {
        this.handlePriceUnsubscription(socket, data.symbols);
      });

      // Handle candlestick subscriptions
      socket.on('subscribe_candlesticks', (data: { symbol: string; timeframe: string }) => {
        this.handleCandlestickSubscription(socket, data.symbol, data.timeframe);
      });

      socket.on('unsubscribe_candlesticks', (data: { symbol: string; timeframe: string }) => {
        this.handleCandlestickUnsubscription(socket, data.symbol, data.timeframe);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`📊 WebSocket client disconnected: ${socket.id}`);
        this.subscriptions.delete(socket.id);
      });

      // Send initial connection confirmation
      socket.emit('connected', {
        message: 'Connected to Connectouch WebSocket',
        timestamp: Date.now()
      });
    });
  }

  private handlePriceSubscription(socket: Socket, symbols: string[]) {
    const subscription = this.subscriptions.get(socket.id);
    if (subscription) {
      subscription.symbols = [...new Set([...subscription.symbols, ...symbols])];
      this.subscriptions.set(socket.id, subscription);
      
      logger.info(`📊 Client ${socket.id} subscribed to prices: ${symbols.join(', ')}`);
      
      // Send immediate price update
      this.sendPriceUpdates([socket.id]);
    }
  }

  private handlePriceUnsubscription(socket: Socket, symbols: string[]) {
    const subscription = this.subscriptions.get(socket.id);
    if (subscription) {
      subscription.symbols = subscription.symbols.filter(s => !symbols.includes(s));
      this.subscriptions.set(socket.id, subscription);
      
      logger.info(`📊 Client ${socket.id} unsubscribed from prices: ${symbols.join(', ')}`);
    }
  }

  private handleCandlestickSubscription(socket: Socket, symbol: string, timeframe: string) {
    const subscription = this.subscriptions.get(socket.id);
    if (subscription) {
      if (!subscription.symbols.includes(symbol)) {
        subscription.symbols.push(symbol);
      }
      subscription.timeframes[symbol] = timeframe;
      this.subscriptions.set(socket.id, subscription);
      
      logger.info(`📊 Client ${socket.id} subscribed to candlesticks: ${symbol} (${timeframe})`);
      
      // Send initial candlestick data
      this.sendCandlestickUpdate(socket.id, symbol, timeframe);
    }
  }

  private handleCandlestickUnsubscription(socket: Socket, symbol: string, timeframe: string) {
    const subscription = this.subscriptions.get(socket.id);
    if (subscription) {
      delete subscription.timeframes[symbol];
      // Remove symbol if no timeframes left
      if (!Object.keys(subscription.timeframes).some(s => s === symbol)) {
        subscription.symbols = subscription.symbols.filter(s => s !== symbol);
      }
      this.subscriptions.set(socket.id, subscription);
      
      logger.info(`📊 Client ${socket.id} unsubscribed from candlesticks: ${symbol} (${timeframe})`);
    }
  }

  private startPriceUpdates() {
    // Update prices every 2 seconds
    this.priceUpdateInterval = setInterval(() => {
      this.sendPriceUpdates();
    }, 2000);
  }

  private startCandlestickUpdates() {
    // Update candlesticks every 5 seconds
    this.candlestickUpdateInterval = setInterval(() => {
      this.sendCandlestickUpdates();
    }, 5000);
  }

  private async sendPriceUpdates(targetSocketIds?: string[]) {
    try {
      const socketIds = targetSocketIds || Array.from(this.subscriptions.keys());
      
      for (const socketId of socketIds) {
        const subscription = this.subscriptions.get(socketId);
        if (!subscription || subscription.symbols.length === 0) continue;

        for (const symbol of subscription.symbols) {
          const tickerData = await this.generateTickerData(symbol);
          
          this.io.to(socketId).emit('price_update', tickerData);
        }
      }
    } catch (error) {
      logger.error('Error sending price updates:', error);
    }
  }

  private async sendCandlestickUpdates() {
    try {
      for (const [socketId, subscription] of this.subscriptions) {
        for (const [symbol, timeframe] of Object.entries(subscription.timeframes)) {
          await this.sendCandlestickUpdate(socketId, symbol, timeframe);
        }
      }
    } catch (error) {
      logger.error('Error sending candlestick updates:', error);
    }
  }

  private async sendCandlestickUpdate(socketId: string, symbol: string, timeframe: string) {
    try {
      const candlestickData = await this.generateCandlestickData(symbol, timeframe);
      
      this.io.to(socketId).emit('candlestick_update', {
        symbol,
        timeframe,
        candlestick: candlestickData
      });
    } catch (error) {
      logger.error(`Error sending candlestick update for ${symbol}:`, error);
    }
  }

  private async generateTickerData(symbol: string): Promise<TickerData> {
    try {
      // Try to get real data from blockchain service
      const realData = await this.blockchainService.getMarketData();

      if (realData && realData[symbol.toLowerCase()]) {
        const data = realData[symbol.toLowerCase()];
        return {
          symbol,
          price: data.price || data.usd,
          change24h: data.change24h || data.usd_24h_change || 0,
          volume24h: data.volume24h || data.usd_24h_vol || 0,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      logger.warn(`Failed to get real data for ${symbol}, using mock data`);
    }

    // Fallback to mock data
    return this.generateMockTickerData(symbol);
  }

  private generateMockTickerData(symbol: string): TickerData {
    const basePrice = this.getBasePriceForSymbol(symbol);
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    const price = basePrice * (1 + variation);
    
    return {
      symbol,
      price,
      change24h: (Math.random() - 0.5) * 10, // ±5% change
      volume24h: Math.random() * 1000000000, // Random volume
      timestamp: Date.now()
    };
  }

  private async generateCandlestickData(symbol: string, timeframe: string): Promise<CandlestickData> {
    try {
      // Try to get real candlestick data
      // This would typically come from a real data provider
      // For now, we'll generate realistic mock data
    } catch (error) {
      logger.warn(`Failed to get real candlestick data for ${symbol}, using mock data`);
    }

    return this.generateMockCandlestickData(symbol);
  }

  private generateMockCandlestickData(symbol: string): CandlestickData {
    const basePrice = this.getBasePriceForSymbol(symbol);
    const variation = 0.02; // 2% max variation
    
    const open = basePrice * (1 + (Math.random() - 0.5) * variation);
    const close = open * (1 + (Math.random() - 0.5) * variation);
    const high = Math.max(open, close) * (1 + Math.random() * variation / 2);
    const low = Math.min(open, close) * (1 - Math.random() * variation / 2);
    const volume = Math.random() * 1000000;

    return {
      time: Date.now(),
      open,
      high,
      low,
      close,
      volume
    };
  }

  private getBasePriceForSymbol(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'BTC': 50000,
      'ETH': 3000,
      'BNB': 300,
      'ADA': 0.5,
      'SOL': 100,
      'DOT': 20,
      'AVAX': 30,
      'MATIC': 1
    };

    return basePrices[symbol.toUpperCase()] || 100;
  }

  public getConnectedClients(): number {
    return this.subscriptions.size;
  }

  public getSubscriptionStats(): any {
    const stats = {
      totalClients: this.subscriptions.size,
      totalSymbols: new Set(),
      subscriptionsBySymbol: {} as { [symbol: string]: number }
    };

    for (const subscription of this.subscriptions.values()) {
      for (const symbol of subscription.symbols) {
        stats.totalSymbols.add(symbol);
        stats.subscriptionsBySymbol[symbol] = (stats.subscriptionsBySymbol[symbol] || 0) + 1;
      }
    }

    return {
      ...stats,
      totalSymbols: stats.totalSymbols.size
    };
  }

  public destroy() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
    if (this.candlestickUpdateInterval) {
      clearInterval(this.candlestickUpdateInterval);
    }
    this.subscriptions.clear();
  }
}

export default WebSocketService;
