import express from 'express';
import { BlockchainService } from '../services/BlockchainService';
import { logger } from '../utils/logger';

const router = express.Router();

// Initialize blockchain service
const blockchainService = new BlockchainService();

/**
 * GET /api/blockchain/status
 * Get blockchain network status and contract information
 */
router.get('/status', async (req, res) => {
  try {
    logger.info('Fetching blockchain status');
    
    const [networkInfo, contractStats, gasInfo] = await Promise.allSettled([
      blockchainService.getNetworkInfo(),
      blockchainService.getContractStats(),
      blockchainService.getCurrentGasPrices()
    ]);

    const response: any = {
      success: true,
      timestamp: new Date()
    };

    if (networkInfo.status === 'fulfilled') {
      response.network = networkInfo.value;
    } else {
      response.networkError = networkInfo.reason?.message;
    }

    if (contractStats.status === 'fulfilled') {
      response.contract = contractStats.value;
    } else {
      response.contractError = contractStats.reason?.message;
    }

    if (gasInfo.status === 'fulfilled') {
      response.gas = gasInfo.value;
    } else {
      response.gasError = gasInfo.reason?.message;
    }

    res.json(response);

  } catch (error) {
    logger.error('Error fetching blockchain status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blockchain status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/blockchain/register-user
 * Register a new user on the blockchain
 */
router.post('/register-user', async (req, res) => {
  try {
    const { username, riskTolerance, investmentAmount, userAddress } = req.body;

    // Validate input
    if (!username || typeof username !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Username is required'
      });
    }

    if (!riskTolerance || riskTolerance < 1 || riskTolerance > 10) {
      return res.status(400).json({
        success: false,
        error: 'Risk tolerance must be between 1 and 10'
      });
    }

    if (!investmentAmount || investmentAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Investment amount must be greater than 0'
      });
    }

    logger.info('Registering user on blockchain', {
      username,
      riskTolerance,
      investmentAmount
    });

    const result = await blockchainService.registerUser(
      username,
      riskTolerance,
      investmentAmount,
      userAddress
    );

    res.json({
      success: true,
      data: result,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      error: 'User registration failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/blockchain/create-strategy
 * Create a new strategy on the blockchain
 */
router.post('/create-strategy', async (req, res) => {
  try {
    const { name, description, riskLevel, protocols } = req.body;

    // Validate input
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Strategy name is required'
      });
    }

    if (!description || typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Strategy description is required'
      });
    }

    if (!riskLevel || riskLevel < 1 || riskLevel > 10) {
      return res.status(400).json({
        success: false,
        error: 'Risk level must be between 1 and 10'
      });
    }

    if (!protocols || !Array.isArray(protocols) || protocols.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one protocol is required'
      });
    }

    logger.info('Creating strategy on blockchain', {
      name,
      riskLevel,
      protocolCount: protocols.length
    });

    const result = await blockchainService.createStrategy(
      name,
      description,
      riskLevel,
      protocols
    );

    res.json({
      success: true,
      data: result,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Error creating strategy:', error);
    res.status(500).json({
      success: false,
      error: 'Strategy creation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/blockchain/user/:address
 * Get user profile from blockchain
 */
router.get('/user/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: 'Valid Ethereum address is required'
      });
    }

    logger.info('Fetching user profile from blockchain', { address });

    const profile = await blockchainService.getUserProfile(address);

    res.json({
      success: true,
      data: profile,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/blockchain/strategy/:id
 * Get strategy details from blockchain
 */
router.get('/strategy/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const strategyId = parseInt(id);

    if (isNaN(strategyId) || strategyId < 1) {
      return res.status(400).json({
        success: false,
        error: 'Valid strategy ID is required'
      });
    }

    logger.info('Fetching strategy from blockchain', { strategyId });

    const strategy = await blockchainService.getStrategy(strategyId);

    res.json({
      success: true,
      data: strategy,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Error fetching strategy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch strategy',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/blockchain/estimate-gas
 * Estimate gas costs for user registration
 */
router.post('/estimate-gas', async (req, res) => {
  try {
    const { username, riskTolerance, investmentAmount } = req.body;

    // Validate input
    if (!username || !riskTolerance || !investmentAmount) {
      return res.status(400).json({
        success: false,
        error: 'Username, risk tolerance, and investment amount are required'
      });
    }

    logger.info('Estimating gas for user registration');

    const gasEstimate = await blockchainService.estimateRegistrationGas(
      username,
      riskTolerance,
      investmentAmount
    );

    res.json({
      success: true,
      data: gasEstimate,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Error estimating gas:', error);
    res.status(500).json({
      success: false,
      error: 'Gas estimation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/blockchain/gas-prices
 * Get current gas prices
 */
router.get('/gas-prices', async (req, res) => {
  try {
    logger.info('Fetching current gas prices');

    const gasPrices = await blockchainService.getCurrentGasPrices();

    res.json({
      success: true,
      data: gasPrices,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Error fetching gas prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gas prices',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/blockchain/test
 * Test blockchain connectivity
 */
router.get('/test', async (req, res) => {
  try {
    logger.info('Testing blockchain connectivity');

    const isConnected = await blockchainService.testConnection();

    res.json({
      success: isConnected,
      data: {
        connected: isConnected,
        message: isConnected ? 'Blockchain connection successful' : 'Blockchain connection failed',
        timestamp: new Date()
      }
    });

  } catch (error) {
    logger.error('Blockchain test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Blockchain test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
