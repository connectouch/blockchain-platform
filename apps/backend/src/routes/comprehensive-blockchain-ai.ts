import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, query, validationResult } from 'express-validator';
import AIOrchestrationService from '@/services/AIOrchestrationService';
import BlockchainDataService from '@/services/BlockchainDataService';
import { logger } from '@/utils/logger';
import { CacheManager } from '@/config/database';

// Initialize AI service
const aiService = new AIOrchestrationService();
const blockchainService = new BlockchainDataService();

/**
 * Comprehensive Blockchain AI API Routes
 * Applying Augment Agent's enterprise-grade API design
 * Full Web3 ecosystem coverage with advanced AI integration
 */

const router = express.Router();

// Rate limiting for different endpoint types
const standardLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const aiAnalysisLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit AI analysis requests
  message: 'AI analysis rate limit exceeded, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const chatLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit chat requests
  message: 'Chat rate limit exceeded, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * GET /api/v2/blockchain/overview
 * Comprehensive blockchain ecosystem overview
 */
router.get('/overview', standardLimit, async (req: express.Request, res: express.Response) => {
  try {
    logger.info('Fetching comprehensive blockchain ecosystem overview');
    
    const [marketData, defiProtocols, nftCollections, gamefiProjects] = await Promise.allSettled([
      blockchainService.getMarketData(),
      blockchainService.getDeFiProtocols(),
      blockchainService.getNFTCollections(),
      blockchainService.getGameFiProjects()
    ]);

    const overview = {
      market: marketData.status === 'fulfilled' ? marketData.value : null,
      sectors: {
        defi: {
          name: 'DeFi',
          description: 'Decentralized Finance protocols and yield farming',
          protocols: defiProtocols.status === 'fulfilled' ? defiProtocols.value.slice(0, 5) : [],
          totalTvl: defiProtocols.status === 'fulfilled' ? 
            defiProtocols.value.reduce((sum, p) => sum + p.tvl, 0) : 0,
          icon: '💰'
        },
        nft: {
          name: 'NFTs',
          description: 'Non-Fungible Tokens and digital collectibles',
          collections: nftCollections.status === 'fulfilled' ? nftCollections.value.slice(0, 5) : [],
          totalVolume: nftCollections.status === 'fulfilled' ? 
            nftCollections.value.reduce((sum, c) => sum + c.volume24h, 0) : 0,
          icon: '🎨'
        },
        gamefi: {
          name: 'GameFi',
          description: 'Blockchain gaming and play-to-earn',
          projects: gamefiProjects.status === 'fulfilled' ? gamefiProjects.value.slice(0, 5) : [],
          totalMarketCap: gamefiProjects.status === 'fulfilled' ? 
            gamefiProjects.value.reduce((sum, p) => sum + p.marketCap, 0) : 0,
          icon: '🎮'
        }
      },
      timestamp: new Date(),
      dataQuality: {
        market: marketData.status === 'fulfilled',
        defi: defiProtocols.status === 'fulfilled',
        nft: nftCollections.status === 'fulfilled',
        gamefi: gamefiProjects.status === 'fulfilled'
      }
    };
    
    res.json({
      success: true,
      data: overview
    });

  } catch (error) {
    logger.error('Error fetching blockchain overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blockchain overview'
    });
  }
});

/**
 * GET /api/v2/blockchain/prices/live
 * Real-time cryptocurrency prices
 */
router.get('/prices/live', standardLimit, async (req: express.Request, res: express.Response) => {
  try {
    logger.info('Fetching real-time cryptocurrency prices');

    const pricesData = await blockchainService.getCryptoPrices();

    res.json(pricesData);

  } catch (error) {
    logger.error('Error fetching crypto prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cryptocurrency prices'
    });
  }
});

/**
 * POST /api/v2/blockchain/ai/analyze
 * Advanced AI analysis for any blockchain data
 */
router.post('/ai/analyze', 
  aiAnalysisLimit,
  [
    body('type').isIn(['portfolio', 'nft', 'gamefi', 'dao', 'contract', 'market']),
    body('data').notEmpty().withMessage('Analysis data is required'),
    body('context').optional().isString()
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { type, data, context, userId } = req.body;
      
      logger.info(`AI analysis requested: ${type}`, { userId });

      const analysisRequest = {
        type,
        data,
        context,
        userId
      };

      const analysis = await aiService.analyzeBlockchainData(analysisRequest);
      
      res.json({
        success: true,
        data: analysis
      });

    } catch (error) {
      logger.error('AI analysis failed:', error);
      res.status(500).json({
        success: false,
        error: 'AI analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
);

/**
 * POST /api/v2/blockchain/ai/chat
 * Interactive AI chat with blockchain expertise
 */
router.post('/ai/chat',
  chatLimit,
  [
    body('message').notEmpty().withMessage('Message is required'),
    body('conversationHistory').optional().isArray(),
    body('sector').optional().isIn(['defi', 'nft', 'gamefi', 'dao', 'infrastructure', 'web3'])
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { message, conversationHistory = [], sector } = req.body;
      
      logger.info('AI chat request received', { sector, messageLength: message.length });

      const response = await aiService.chatWithBlockchainAI(message, conversationHistory, sector);
      
      res.json({
        success: true,
        data: {
          response,
          sector,
          timestamp: new Date()
        }
      });

    } catch (error) {
      logger.error('AI chat failed:', error);
      res.status(500).json({
        success: false,
        error: 'AI chat failed',
        message: 'I apologize, but I\'m experiencing technical difficulties. Please try again.'
      });
    }
  }
);

/**
 * GET /api/v2/blockchain/ai/prediction
 * AI-powered market prediction
 */
router.get('/ai/prediction',
  standardLimit,
  [
    query('timeframe').optional().isIn(['1h', '4h', '24h', '7d', '30d'])
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const timeframe = req.query.timeframe as string || '24h';
      
      logger.info(`Market prediction requested: ${timeframe}`);
      
      // const prediction = await aiService.generateMarketPrediction(timeframe);
      const prediction = { trend: 'neutral', confidence: 0.5, message: 'AI prediction service temporarily disabled' };
      
      res.json({
        success: true,
        data: prediction
      });

    } catch (error) {
      logger.error('Market prediction failed:', error);
      res.status(500).json({
        success: false,
        error: 'Market prediction failed'
      });
    }
  }
);

/**
 * GET /api/v2/blockchain/defi/protocols
 * Advanced DeFi protocol data
 */
router.get('/defi/protocols', standardLimit, async (req: express.Request, res: express.Response) => {
  try {
    const protocols = await blockchainService.getDeFiProtocols();
    
    res.json({
      success: true,
      data: protocols,
      metadata: {
        count: protocols.length,
        totalTvl: protocols.reduce((sum, p) => sum + p.tvl, 0),
        averageApy: protocols.reduce((sum, p) => sum + p.apy, 0) / protocols.length
      }
    });

  } catch (error) {
    logger.error('Error fetching DeFi protocols:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DeFi protocols'
    });
  }
});

/**
 * GET /api/v2/blockchain/nft/collections
 * NFT collection data with market analysis
 */
router.get('/nft/collections', standardLimit, async (req: express.Request, res: express.Response) => {
  try {
    const collections = await blockchainService.getNFTCollections();
    
    res.json({
      success: true,
      data: collections,
      metadata: {
        count: collections.length,
        totalVolume: collections.reduce((sum, c) => sum + c.volume24h, 0),
        averageFloorPrice: collections.reduce((sum, c) => sum + c.floorPrice, 0) / collections.length
      }
    });

  } catch (error) {
    logger.error('Error fetching NFT collections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NFT collections'
    });
  }
});

/**
 * GET /api/v2/blockchain/gamefi/projects
 * GameFi project data and analysis
 */
router.get('/gamefi/projects', standardLimit, async (req: express.Request, res: express.Response) => {
  try {
    const projects = await blockchainService.getGameFiProjects();
    
    res.json({
      success: true,
      data: projects,
      metadata: {
        count: projects.length,
        totalMarketCap: projects.reduce((sum, p) => sum + p.marketCap, 0),
        averageEarnings: projects.reduce((sum, p) => sum + p.averageEarnings, 0) / projects.length
      }
    });

  } catch (error) {
    logger.error('Error fetching GameFi projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch GameFi projects'
    });
  }
});

/**
 * GET /api/v2/blockchain/portfolio/:address
 * Cross-chain portfolio analysis
 */
router.get('/portfolio/:address',
  standardLimit,
  [
    param('address').isEthereumAddress().withMessage('Invalid Ethereum address')
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { address } = req.params;
      
      logger.info(`Portfolio analysis requested for: ${address}`);
      
      const portfolioData = await blockchainService.getCrossChainData(address);
      
      res.json({
        success: true,
        data: portfolioData
      });

    } catch (error) {
      logger.error('Portfolio analysis failed:', error);
      res.status(500).json({
        success: false,
        error: 'Portfolio analysis failed'
      });
    }
  }
);

/**
 * POST /api/v2/blockchain/contract/analyze
 * Smart contract security analysis
 */
router.post('/contract/analyze',
  aiAnalysisLimit,
  [
    body('address').isEthereumAddress().withMessage('Invalid contract address'),
    body('chainId').optional().isInt({ min: 1 })
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { address, chainId = 1 } = req.body;
      
      logger.info(`Contract analysis requested: ${address} on chain ${chainId}`);
      
      const analysis = await blockchainService.analyzeContract(address, chainId);
      
      res.json({
        success: true,
        data: analysis
      });

    } catch (error) {
      logger.error('Contract analysis failed:', error);
      res.status(500).json({
        success: false,
        error: 'Contract analysis failed'
      });
    }
  }
);

/**
 * GET /api/v2/blockchain/health
 * Comprehensive system health check
 */
router.get('/health', async (req: express.Request, res: express.Response) => {
  try {
    const [blockchainHealth, aiHealth] = await Promise.allSettled([
      blockchainService.healthCheck(),
      aiService.healthCheck()
    ]);

    const health = {
      status: 'healthy',
      timestamp: new Date(),
      services: {
        blockchain: blockchainHealth.status === 'fulfilled' ? blockchainHealth.value : { status: 'error' },
        ai: aiHealth.status === 'fulfilled' ? aiHealth.value : { status: 'error' }
      }
    };

    // Determine overall status
    const allHealthy = health.services.blockchain.overall && health.services.ai.status === 'healthy';
    health.status = allHealthy ? 'healthy' : 'degraded';

    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

export default router;
