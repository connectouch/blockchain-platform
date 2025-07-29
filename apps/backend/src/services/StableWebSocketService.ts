/**
 * Stable WebSocket Service
 * Addresses connection loops, memory leaks, and stability issues
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

export interface ClientSubscription {
  socketId: string;
  subscriptions: Set<string>;
  lastActivity: Date;
  metadata: {
    userAgent?: string;
    ip?: string;
    clientType?: 'web' | 'desktop' | 'mobile';
  };
}

export interface ConnectionMetrics {
  totalConnections: number;
  activeSubscriptions: number;
  messagesPerSecond: number;
  errorRate: number;
  averageLatency: number;
}

export interface WebSocketConfig {
  maxConnections: number;
  heartbeatInterval: number;
  subscriptionTimeout: number;
  messageRateLimit: number;
  cleanupInterval: number;
  enableMetrics: boolean;
}

export class StableWebSocketService extends EventEmitter {
  private io: SocketIOServer;
  private clients: Map<string, ClientSubscription> = new Map();
  private subscriptionGroups: Map<string, Set<string>> = new Map();
  private messageQueue: Map<string, any[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;
  private config: WebSocketConfig;
  private metrics: ConnectionMetrics;
  private rateLimiters: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(io: SocketIOServer, config: Partial<WebSocketConfig> = {}) {
    super();
    
    this.io = io;
    this.config = {
      maxConnections: 1000,
      heartbeatInterval: 30000, // 30 seconds
      subscriptionTimeout: 300000, // 5 minutes
      messageRateLimit: 100, // messages per minute
      cleanupInterval: 60000, // 1 minute
      enableMetrics: true,
      ...config
    };

    this.metrics = {
      totalConnections: 0,
      activeSubscriptions: 0,
      messagesPerSecond: 0,
      errorRate: 0,
      averageLatency: 0
    };

    this.initialize();
  }

  private initialize(): void {
    this.setupSocketHandlers();
    this.startHeartbeat();
    this.startCleanup();
    
    if (this.config.enableMetrics) {
      this.startMetricsCollection();
    }

    logger.info('StableWebSocketService initialized', {
      config: this.config,
      maxConnections: this.config.maxConnections
    });
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });

    // Handle server-level events
    this.io.engine.on('connection_error', (error) => {
      logger.error('WebSocket engine error:', error);
      this.metrics.errorRate++;
    });
  }

  private handleConnection(socket: Socket): void {
    const clientId = socket.id;
    const clientInfo = this.extractClientInfo(socket);

    // Check connection limits
    if (this.clients.size >= this.config.maxConnections) {
      logger.warn('Connection limit reached, rejecting new connection', {
        clientId,
        currentConnections: this.clients.size,
        maxConnections: this.config.maxConnections
      });
      
      socket.emit('connection_rejected', {
        reason: 'Server at capacity',
        maxConnections: this.config.maxConnections
      });
      
      socket.disconnect(true);
      return;
    }

    // Create client subscription record
    const clientSubscription: ClientSubscription = {
      socketId: clientId,
      subscriptions: new Set(),
      lastActivity: new Date(),
      metadata: clientInfo
    };

    this.clients.set(clientId, clientSubscription);
    this.metrics.totalConnections++;

    logger.info('WebSocket client connected', {
      clientId,
      clientType: clientInfo.clientType,
      totalConnections: this.clients.size
    });

    // Setup client-specific handlers
    this.setupClientHandlers(socket, clientSubscription);

    // Send welcome message
    socket.emit('welcome', {
      clientId,
      serverTime: new Date().toISOString(),
      config: {
        heartbeatInterval: this.config.heartbeatInterval,
        messageRateLimit: this.config.messageRateLimit
      }
    });
  }

  private setupClientHandlers(socket: Socket, client: ClientSubscription): void {
    // Handle subscription requests
    socket.on('subscribe', (data) => {
      this.handleSubscription(socket, client, data);
    });

    socket.on('unsubscribe', (data) => {
      this.handleUnsubscription(socket, client, data);
    });

    // Handle heartbeat/ping
    socket.on('ping', () => {
      client.lastActivity = new Date();
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Handle client identification
    socket.on('client_type', (data) => {
      if (data?.client) {
        client.metadata.clientType = data.client;
        logger.debug('Client type identified', {
          clientId: socket.id,
          clientType: data.client
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket.id, reason);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error', {
        clientId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      this.metrics.errorRate++;
    });

    // Rate limiting for all events
    socket.use((packet, next) => {
      if (this.checkRateLimit(socket.id)) {
        next();
      } else {
        logger.warn('Rate limit exceeded', { clientId: socket.id });
        socket.emit('rate_limit_exceeded', {
          limit: this.config.messageRateLimit,
          resetTime: 60000
        });
      }
    });
  }

  private handleSubscription(socket: Socket, client: ClientSubscription, data: any): void {
    try {
      const { type, symbols, options } = data;
      
      if (!type || typeof type !== 'string') {
        socket.emit('subscription_error', { error: 'Invalid subscription type' });
        return;
      }

      const subscriptionKey = `${type}:${symbols?.join(',') || 'all'}`;
      
      // Add to client subscriptions
      client.subscriptions.add(subscriptionKey);
      client.lastActivity = new Date();

      // Add to subscription groups
      if (!this.subscriptionGroups.has(subscriptionKey)) {
        this.subscriptionGroups.set(subscriptionKey, new Set());
      }
      this.subscriptionGroups.get(subscriptionKey)!.add(socket.id);

      // Join socket room for efficient broadcasting
      socket.join(subscriptionKey);

      logger.debug('Client subscribed', {
        clientId: socket.id,
        subscriptionKey,
        totalSubscriptions: client.subscriptions.size
      });

      socket.emit('subscription_confirmed', {
        type,
        subscriptionKey,
        timestamp: new Date().toISOString()
      });

      this.updateMetrics();

    } catch (error) {
      logger.error('Subscription error', {
        clientId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        data
      });
      
      socket.emit('subscription_error', {
        error: 'Failed to process subscription'
      });
    }
  }

  private handleUnsubscription(socket: Socket, client: ClientSubscription, data: any): void {
    try {
      const { type, symbols } = data;
      const subscriptionKey = `${type}:${symbols?.join(',') || 'all'}`;

      // Remove from client subscriptions
      client.subscriptions.delete(subscriptionKey);
      client.lastActivity = new Date();

      // Remove from subscription groups
      const group = this.subscriptionGroups.get(subscriptionKey);
      if (group) {
        group.delete(socket.id);
        if (group.size === 0) {
          this.subscriptionGroups.delete(subscriptionKey);
        }
      }

      // Leave socket room
      socket.leave(subscriptionKey);

      logger.debug('Client unsubscribed', {
        clientId: socket.id,
        subscriptionKey,
        remainingSubscriptions: client.subscriptions.size
      });

      socket.emit('unsubscription_confirmed', {
        type,
        subscriptionKey,
        timestamp: new Date().toISOString()
      });

      this.updateMetrics();

    } catch (error) {
      logger.error('Unsubscription error', {
        clientId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        data
      });
    }
  }

  private handleDisconnection(clientId: string, reason: string): void {
    const client = this.clients.get(clientId);
    
    if (client) {
      // Clean up subscriptions
      for (const subscriptionKey of client.subscriptions) {
        const group = this.subscriptionGroups.get(subscriptionKey);
        if (group) {
          group.delete(clientId);
          if (group.size === 0) {
            this.subscriptionGroups.delete(subscriptionKey);
          }
        }
      }

      // Remove client
      this.clients.delete(clientId);

      logger.info('WebSocket client disconnected', {
        clientId,
        reason,
        subscriptions: client.subscriptions.size,
        remainingConnections: this.clients.size
      });
    }

    // Clean up rate limiter
    this.rateLimiters.delete(clientId);

    this.updateMetrics();
  }

  private extractClientInfo(socket: Socket): ClientSubscription['metadata'] {
    const request = socket.request;
    
    return {
      userAgent: request.headers['user-agent'] as string,
      ip: socket.handshake.address,
      clientType: 'web' // Default, can be updated later
    };
  }

  private checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    const limiter = this.rateLimiters.get(clientId);

    if (!limiter || now > limiter.resetTime) {
      this.rateLimiters.set(clientId, {
        count: 1,
        resetTime: now + 60000 // 1 minute
      });
      return true;
    }

    if (limiter.count >= this.config.messageRateLimit) {
      return false;
    }

    limiter.count++;
    return true;
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.performHeartbeat();
    }, this.config.heartbeatInterval);
  }

  private performHeartbeat(): void {
    const now = new Date();
    const staleClients: string[] = [];

    // Check for stale connections
    for (const [clientId, client] of this.clients) {
      const timeSinceActivity = now.getTime() - client.lastActivity.getTime();
      
      if (timeSinceActivity > this.config.subscriptionTimeout) {
        staleClients.push(clientId);
      }
    }

    // Disconnect stale clients
    for (const clientId of staleClients) {
      const socket = this.io.sockets.sockets.get(clientId);
      if (socket) {
        logger.info('Disconnecting stale client', { clientId });
        socket.disconnect(true);
      }
    }

    // Send heartbeat to active clients
    this.io.emit('heartbeat', {
      timestamp: now.toISOString(),
      activeConnections: this.clients.size
    });
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupInterval);
  }

  private performCleanup(): void {
    // Clean up empty subscription groups
    for (const [key, group] of this.subscriptionGroups) {
      if (group.size === 0) {
        this.subscriptionGroups.delete(key);
      }
    }

    // Clean up expired rate limiters
    const now = Date.now();
    for (const [clientId, limiter] of this.rateLimiters) {
      if (now > limiter.resetTime) {
        this.rateLimiters.delete(clientId);
      }
    }

    logger.debug('Cleanup completed', {
      activeConnections: this.clients.size,
      subscriptionGroups: this.subscriptionGroups.size,
      rateLimiters: this.rateLimiters.size
    });
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.updateMetrics();
      this.emit('metrics', this.metrics);
    }, 30000); // Every 30 seconds
  }

  private updateMetrics(): void {
    this.metrics.totalConnections = this.clients.size;
    this.metrics.activeSubscriptions = Array.from(this.clients.values())
      .reduce((total, client) => total + client.subscriptions.size, 0);
  }

  // Public methods for broadcasting
  public broadcast(subscriptionKey: string, data: any): void {
    try {
      this.io.to(subscriptionKey).emit('data', {
        subscription: subscriptionKey,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Broadcast error', {
        subscriptionKey,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  public getSubscriptionStats(): any {
    return {
      totalClients: this.clients.size,
      subscriptionGroups: this.subscriptionGroups.size,
      totalSubscriptions: this.metrics.activeSubscriptions,
      rateLimiters: this.rateLimiters.size
    };
  }

  public shutdown(): void {
    logger.info('Shutting down WebSocket service');

    // Clear intervals
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    if (this.metricsInterval) clearInterval(this.metricsInterval);

    // Disconnect all clients
    this.io.disconnectSockets(true);

    // Clear data structures
    this.clients.clear();
    this.subscriptionGroups.clear();
    this.rateLimiters.clear();

    logger.info('WebSocket service shutdown complete');
  }
}

export default StableWebSocketService;
