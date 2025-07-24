import { Server as SocketIOServer } from 'socket.io';
import { logger } from '@/utils/logger';
import { marketDataService } from './MarketDataService';
import { alchemyService } from './AlchemyService';

/**
 * Real-Time WebSocket Service
 * Provides live data streaming for cryptocurrency prices and blockchain events
 * Applying Augment Agent's comprehensive real-time data approach
 */

export interface WebSocketData {
  type: 'price_update' | 'market_update' | 'blockchain_event' | 'transaction_update';
  data: any;
  timestamp: string;
  source: string;
}

export class RealTimeWebSocketService {
  private io: SocketIOServer;
  private priceUpdateInterval: NodeJS.Timeout | null = null;
  private marketUpdateInterval: NodeJS.Timeout | null = null;
  private connectedClients: Set<string> = new Set();
  private readonly PRICE_UPDATE_INTERVAL = 30000; // 30 seconds
  private readonly MARKET_UPDATE_INTERVAL = 60000; // 1 minute

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupWebSocketHandlers();
    this.startRealTimeUpdates();
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupWebSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      const clientId = socket.id;
      this.connectedClients.add(clientId);
      
      logger.info(`WebSocket client connected: ${clientId}`);
      logger.info(`Total connected clients: ${this.connectedClients.size}`);

      // Send initial data to new client
      this.sendInitialData(socket);

      // Handle client subscriptions
      socket.on('subscribe_prices', (symbols: string[]) => {
        this.handlePriceSubscription(socket, symbols);
      });

      socket.on('subscribe_market', () => {
        this.handleMarketSubscription(socket);
      });

      socket.on('subscribe_blockchain', (networks: string[]) => {
        this.handleBlockchainSubscription(socket, networks);
      });

      socket.on('subscribe_address', (data: { address: string; network: string }) => {
        this.handleAddressSubscription(socket, data);
      });

      // Handle client requests
      socket.on('request_price_update', async (symbols: string[]) => {
        await this.sendPriceUpdate(socket, symbols);
      });

      socket.on('request_market_update', async () => {
        await this.sendMarketUpdate(socket);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.connectedClients.delete(clientId);
        logger.info(`WebSocket client disconnected: ${clientId}`);
        logger.info(`Total connected clients: ${this.connectedClients.size}`);
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`WebSocket error for client ${clientId}:`, error);
      });
    });
  }

  /**
   * Send initial data to newly connected client
   */
  private async sendInitialData(socket: any): Promise<void> {
    try {
      // Send current market overview
      const marketData = await marketDataService.getMarketOverview();
      socket.emit('initial_market_data', {
        type: 'market_update',
        data: marketData,
        timestamp: new Date().toISOString(),
        source: 'MarketDataService'
      });

      // Send current crypto prices
      const majorSymbols = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'DOGE', 'AVAX'];
      const prices = await marketDataService.getCryptocurrencyQuotes(majorSymbols);
      socket.emit('initial_price_data', {
        type: 'price_update',
        data: prices,
        timestamp: new Date().toISOString(),
        source: 'MarketDataService'
      });

      logger.info(`Initial data sent to client: ${socket.id}`);
    } catch (error) {
      logger.error('Error sending initial data:', error);
      socket.emit('error', { message: 'Failed to load initial data' });
    }
  }

  /**
   * Handle price subscription
   */
  private handlePriceSubscription(socket: any, symbols: string[]): void {
    socket.join('price_updates');
    logger.info(`Client ${socket.id} subscribed to price updates for: ${symbols.join(', ')}`);
    
    // Store subscribed symbols for this client
    socket.subscribedSymbols = symbols;
  }

  /**
   * Handle market subscription
   */
  private handleMarketSubscription(socket: any): void {
    socket.join('market_updates');
    logger.info(`Client ${socket.id} subscribed to market updates`);
  }

  /**
   * Handle blockchain subscription
   */
  private handleBlockchainSubscription(socket: any, networks: string[]): void {
    networks.forEach(network => {
      socket.join(`blockchain_${network}`);
    });
    logger.info(`Client ${socket.id} subscribed to blockchain updates for: ${networks.join(', ')}`);
  }

  /**
   * Handle address subscription for transaction monitoring
   */
  private async handleAddressSubscription(
    socket: any, 
    data: { address: string; network: string }
  ): Promise<void> {
    try {
      const { address, network } = data;
      socket.join(`address_${address}_${network}`);
      
      // Set up real-time monitoring using Alchemy
      await alchemyService.subscribeToAddressActivity(
        address,
        network,
        (activity) => {
          socket.emit('address_activity', {
            type: 'transaction_update',
            data: activity,
            timestamp: new Date().toISOString(),
            source: 'AlchemyService'
          });
        }
      );

      logger.info(`Client ${socket.id} subscribed to address ${address} on ${network}`);
    } catch (error) {
      logger.error('Error setting up address subscription:', error);
      socket.emit('error', { message: 'Failed to subscribe to address activity' });
    }
  }

  /**
   * Send price update to specific client or room
   */
  private async sendPriceUpdate(socket: any, symbols?: string[]): Promise<void> {
    try {
      const targetSymbols = symbols || ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'DOGE', 'AVAX'];
      const prices = await marketDataService.getCryptocurrencyQuotes(targetSymbols);
      
      const updateData: WebSocketData = {
        type: 'price_update',
        data: prices,
        timestamp: new Date().toISOString(),
        source: 'MarketDataService'
      };

      if (socket) {
        socket.emit('price_update', updateData);
      } else {
        this.io.to('price_updates').emit('price_update', updateData);
      }
    } catch (error) {
      logger.error('Error sending price update:', error);
    }
  }

  /**
   * Send market update to specific client or room
   */
  private async sendMarketUpdate(socket?: any): Promise<void> {
    try {
      const marketData = await marketDataService.getMarketOverview();
      
      const updateData: WebSocketData = {
        type: 'market_update',
        data: marketData,
        timestamp: new Date().toISOString(),
        source: 'MarketDataService'
      };

      if (socket) {
        socket.emit('market_update', updateData);
      } else {
        this.io.to('market_updates').emit('market_update', updateData);
      }
    } catch (error) {
      logger.error('Error sending market update:', error);
    }
  }

  /**
   * Start real-time update intervals
   */
  private startRealTimeUpdates(): void {
    // Price updates every 30 seconds
    this.priceUpdateInterval = setInterval(async () => {
      if (this.connectedClients.size > 0) {
        await this.sendPriceUpdate(null);
      }
    }, this.PRICE_UPDATE_INTERVAL);

    // Market updates every minute
    this.marketUpdateInterval = setInterval(async () => {
      if (this.connectedClients.size > 0) {
        await this.sendMarketUpdate();
      }
    }, this.MARKET_UPDATE_INTERVAL);

    logger.info('Real-time update intervals started');
  }

  /**
   * Stop real-time updates
   */
  public stopRealTimeUpdates(): void {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
    }

    if (this.marketUpdateInterval) {
      clearInterval(this.marketUpdateInterval);
      this.marketUpdateInterval = null;
    }

    logger.info('Real-time update intervals stopped');
  }

  /**
   * Broadcast message to all connected clients
   */
  public broadcast(event: string, data: any): void {
    this.io.emit(event, data);
    logger.info(`Broadcasted ${event} to ${this.connectedClients.size} clients`);
  }

  /**
   * Send message to specific room
   */
  public sendToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
    logger.info(`Sent ${event} to room: ${room}`);
  }

  /**
   * Get connection statistics
   */
  public getStats(): { connectedClients: number; rooms: string[] } {
    const rooms = Array.from(this.io.sockets.adapter.rooms.keys());
    return {
      connectedClients: this.connectedClients.size,
      rooms: rooms.filter(room => !this.connectedClients.has(room)) // Filter out client IDs
    };
  }

  /**
   * Health check for WebSocket service
   */
  public healthCheck(): { status: string; stats: any } {
    const stats = this.getStats();
    return {
      status: 'operational',
      stats
    };
  }
}

export let realTimeWebSocketService: RealTimeWebSocketService | null = null;

export function initializeRealTimeWebSocket(io: SocketIOServer): RealTimeWebSocketService {
  realTimeWebSocketService = new RealTimeWebSocketService(io);
  return realTimeWebSocketService;
}
