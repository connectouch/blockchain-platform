import express from 'express';
import rateLimit from 'express-rate-limit';
import { StarknetService } from '../services/StarknetService';
import { logger } from '../utils/logger';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = express.Router();

// Rate limiting for Starknet endpoints
const starknetLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many Starknet requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 60
    });
  }
});

const starknetService = new StarknetService('mainnet');

/**
 * GET /api/starknet/network
 * Get Starknet network information
 */
router.get('/network', starknetLimit, async (req: express.Request, res: express.Response) => {
  try {
    logger.info('Fetching Starknet network information');
    const networkInfo = await starknetService.getNetworkInfo();
    
    res.json({
      success: true,
      data: networkInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching Starknet network info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch network information',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/starknet/balance/:address
 * Get account balances for ETH and STRK tokens
 */
router.get('/balance/:address', 
  starknetLimit,
  [
    param('address').isLength({ min: 66, max: 66 }).withMessage('Invalid Starknet address format')
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { address } = req.params;
      logger.info(`Fetching balances for Starknet address: ${address}`);
      
      const balances = await starknetService.getAccountBalances(address);
      
      res.json({
        success: true,
        data: balances,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching account balances:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch account balances',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/starknet/token-balance/:address/:token
 * Get specific token balance
 */
router.get('/token-balance/:address/:token',
  starknetLimit,
  [
    param('address').isLength({ min: 66, max: 66 }).withMessage('Invalid Starknet address format'),
    param('token').isLength({ min: 66, max: 66 }).withMessage('Invalid token contract address')
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { address, token } = req.params;
      logger.info(`Fetching token balance for ${address} - token: ${token}`);
      
      const balance = await starknetService.getTokenBalance(address, token);
      
      res.json({
        success: true,
        data: {
          accountAddress: address,
          tokenAddress: token,
          balance,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error fetching token balance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch token balance',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/starknet/defi/protocols
 * Get DeFi Spring 2.0 participating protocols
 */
router.get('/defi/protocols', starknetLimit, async (req: express.Request, res: express.Response) => {
  try {
    logger.info('Fetching DeFi Spring protocols');
    const protocols = await starknetService.getDeFiSpringProtocols();
    
    res.json({
      success: true,
      data: {
        protocols,
        totalProtocols: protocols.length,
        activeProtocols: protocols.filter(p => p.isActive).length,
        defiSpringEligible: protocols.filter(p => p.defiSpringEligible).length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching DeFi protocols:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DeFi protocols',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/starknet/defi/opportunities/:address
 * Analyze DeFi opportunities for an account
 */
router.get('/defi/opportunities/:address',
  starknetLimit,
  [
    param('address').isLength({ min: 66, max: 66 }).withMessage('Invalid Starknet address format')
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { address } = req.params;
      logger.info(`Analyzing DeFi opportunities for: ${address}`);
      
      const analysis = await starknetService.analyzeDeFiOpportunities(address);
      
      res.json({
        success: true,
        data: analysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error analyzing DeFi opportunities:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze DeFi opportunities',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/starknet/transaction/execute
 * Execute DeFi transaction on Starknet
 */
router.post('/transaction/execute',
  starknetLimit,
  [
    body('privateKey').isLength({ min: 64, max: 66 }).withMessage('Invalid private key format'),
    body('accountAddress').isLength({ min: 66, max: 66 }).withMessage('Invalid account address'),
    body('contractAddress').isLength({ min: 66, max: 66 }).withMessage('Invalid contract address'),
    body('functionName').isString().notEmpty().withMessage('Function name is required'),
    body('calldata').isArray().withMessage('Calldata must be an array'),
    body('maxFee').optional().isString().withMessage('Max fee must be a string')
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { privateKey, accountAddress, contractAddress, functionName, calldata, maxFee } = req.body;
      
      logger.info(`Executing DeFi transaction: ${functionName} on ${contractAddress}`);
      
      // Initialize account for this transaction
      await starknetService.initializeAccount(privateKey, accountAddress);
      
      const result = await starknetService.executeDeFiTransaction(
        contractAddress,
        functionName,
        calldata,
        maxFee
      );
      
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error executing DeFi transaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to execute transaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/starknet/transaction/:hash
 * Get transaction status and receipt
 */
router.get('/transaction/:hash',
  starknetLimit,
  [
    param('hash').isLength({ min: 66, max: 66 }).withMessage('Invalid transaction hash format')
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { hash } = req.params;
      logger.info(`Fetching transaction status for: ${hash}`);
      
      const status = await starknetService.getTransactionStatus(hash);
      
      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching transaction status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch transaction status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/starknet/health
 * Health check endpoint for Starknet service
 */
router.get('/health', async (req: express.Request, res: express.Response) => {
  try {
    const networkInfo = await starknetService.getNetworkInfo();
    
    res.json({
      success: true,
      service: 'Starknet Integration',
      status: 'healthy',
      network: networkInfo.network,
      blockNumber: networkInfo.blockNumber,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Starknet health check failed:', error);
    res.status(503).json({
      success: false,
      service: 'Starknet Integration',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
