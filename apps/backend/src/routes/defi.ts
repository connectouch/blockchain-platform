import express from 'express';
import { AIAnalysisEngine } from '../services/AIAnalysisEngine';
import { DeFiDataService } from '../services/DeFiDataService';
import { OpenAIService } from '../services/OpenAIService';
import { logger } from '../utils/logger';
import { UserPreferences } from '../types/defi';

const router = express.Router();

// Initialize services
const aiEngine = new AIAnalysisEngine();
const defiDataService = new DeFiDataService();
const openAIService = new OpenAIService();

/**
 * GET /api/defi/protocols
 * Get all available DeFi protocols with real-time data
 */
router.get('/protocols', async (req, res) => {
  try {
    logger.info('Fetching DeFi protocols data');
    
    const protocols = await defiDataService.getAllProtocolData();
    
    res.json({
      success: true,
      data: protocols,
      timestamp: new Date(),
      count: protocols.length
    });

  } catch (error) {
    logger.error('Error fetching protocols:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch protocol data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/defi/market-conditions
 * Get current market conditions and sentiment
 */
router.get('/market-conditions', async (req, res) => {
  try {
    logger.info('Fetching market conditions');
    
    const marketConditions = await defiDataService.getMarketConditions();
    
    res.json({
      success: true,
      data: marketConditions,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Error fetching market conditions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market conditions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/defi/analyze
 * Generate AI-powered portfolio analysis
 */
router.post('/analyze', async (req, res) => {
  try {
    const { portfolioValue, userPreferences } = req.body;

    // Validate input
    if (!portfolioValue || portfolioValue <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid portfolio value'
      });
    }

    if (!userPreferences || !userPreferences.riskTolerance) {
      return res.status(400).json({
        success: false,
        error: 'User preferences with risk tolerance required'
      });
    }

    logger.info('Generating portfolio analysis', {
      portfolioValue,
      riskTolerance: userPreferences.riskTolerance
    });

    // Set default preferences if not provided
    const preferences: UserPreferences = {
      riskTolerance: userPreferences.riskTolerance,
      investmentHorizon: userPreferences.investmentHorizon || 'medium',
      preferredProtocols: userPreferences.preferredProtocols || [],
      excludedProtocols: userPreferences.excludedProtocols || [],
      maxGasPrice: userPreferences.maxGasPrice || 50,
      autoRebalance: userPreferences.autoRebalance || false,
      stopLossPercentage: userPreferences.stopLossPercentage || 15,
      takeProfitPercentage: userPreferences.takeProfitPercentage || 25,
      notificationPreferences: userPreferences.notificationPreferences || {
        email: true,
        sms: false,
        push: true,
        discord: false
      }
    };

    const analysis = await aiEngine.generatePortfolioAnalysis(preferences, portfolioValue);
    
    res.json({
      success: true,
      data: analysis,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Error in portfolio analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Portfolio analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/defi/chat
 * Chat with AI about DeFi strategies and questions
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    logger.info('Processing AI chat request', {
      messageLength: message.length,
      hasHistory: !!conversationHistory
    });

    const response = await openAIService.chatWithAI(message, conversationHistory || []);
    
    res.json({
      success: true,
      data: {
        response,
        timestamp: new Date()
      }
    });

  } catch (error) {
    logger.error('Error in AI chat:', error);
    res.status(500).json({
      success: false,
      error: 'AI chat failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/defi/risk-assessment
 * Assess portfolio risk with current market conditions
 */
router.post('/risk-assessment', async (req, res) => {
  try {
    const { positions, userPreferences } = req.body;

    if (!positions || !Array.isArray(positions)) {
      return res.status(400).json({
        success: false,
        error: 'Positions array is required'
      });
    }

    if (!userPreferences || !userPreferences.riskTolerance) {
      return res.status(400).json({
        success: false,
        error: 'User preferences with risk tolerance required'
      });
    }

    logger.info('Generating risk assessment', {
      positionsCount: positions.length,
      riskTolerance: userPreferences.riskTolerance
    });

    const riskAssessment = await aiEngine.assessPortfolioRisk(positions, userPreferences);
    
    res.json({
      success: true,
      data: riskAssessment,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Error in risk assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Risk assessment failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/defi/strategy-updates
 * Get real-time strategy updates based on market conditions
 */
router.get('/strategy-updates', async (req, res) => {
  try {
    logger.info('Fetching strategy updates');
    
    const marketConditions = await defiDataService.getMarketConditions();
    const updates = await aiEngine.generateStrategyUpdates([], marketConditions);
    
    res.json({
      success: true,
      data: {
        updates,
        marketConditions,
        timestamp: new Date()
      }
    });

  } catch (error) {
    logger.error('Error fetching strategy updates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch strategy updates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/defi/test
 * Test all DeFi services connectivity
 */
router.get('/test', async (req, res) => {
  try {
    logger.info('Testing DeFi services');
    
    const [aiEngineTest, defiDataTest, openAITest] = await Promise.allSettled([
      aiEngine.testEngine(),
      defiDataService.testConnections(),
      openAIService.testConnection()
    ]);

    const results = {
      aiEngine: aiEngineTest.status === 'fulfilled' ? aiEngineTest.value : false,
      defiData: defiDataTest.status === 'fulfilled' ? defiDataTest.value : false,
      openAI: openAITest.status === 'fulfilled' ? openAITest.value : false
    };

    const allPassed = Object.values(results).every(result => result === true);

    res.json({
      success: allPassed,
      data: {
        services: results,
        overall: allPassed ? 'All services operational' : 'Some services have issues',
        timestamp: new Date()
      }
    });

  } catch (error) {
    logger.error('Error testing services:', error);
    res.status(500).json({
      success: false,
      error: 'Service test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/defi/explain-strategy
 * Get natural language explanation of a strategy
 */
router.post('/explain-strategy', async (req, res) => {
  try {
    const { strategy, userQuery } = req.body;

    if (!strategy || !userQuery) {
      return res.status(400).json({
        success: false,
        error: 'Strategy and user query are required'
      });
    }

    logger.info('Generating strategy explanation', {
      strategyName: strategy.name,
      queryLength: userQuery.length
    });

    const explanation = await openAIService.explainStrategy(strategy, userQuery);
    
    res.json({
      success: true,
      data: {
        explanation,
        strategy: strategy.name,
        timestamp: new Date()
      }
    });

  } catch (error) {
    logger.error('Error explaining strategy:', error);
    res.status(500).json({
      success: false,
      error: 'Strategy explanation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
