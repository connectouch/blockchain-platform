import express from 'express';
import rateLimit from 'express-rate-limit';
import { MultiAgentCollaborationService } from '../services/MultiAgentCollaborationService';
import { ScientificMethodFramework } from '../services/ScientificMethodFramework';
import { logger } from '../utils/logger';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = express.Router();

// Rate limiting for AI intelligence endpoints
const aiIntelligenceLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many AI intelligence requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 60
    });
  }
});

const multiAgentService = new MultiAgentCollaborationService();
const scientificFramework = new ScientificMethodFramework();

/**
 * AI Intelligence Health Check
 */
router.get('/health', (req, res) => {
  try {
    res.json({
      success: true,
      status: 'healthy',
      service: 'AI Intelligence Framework',
      features: [
        'Multi-Agent Collaboration',
        'Scientific Method Framework',
        'Hypothesis Testing',
        'Collaborative Reasoning'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'AI Intelligence service unavailable',
      status: 'unhealthy',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/ai-intelligence/collaborative/strategy-analysis
 * Multi-agent collaborative strategy analysis
 */
router.post('/collaborative/strategy-analysis',
  aiIntelligenceLimit,
  [
    body('portfolioData').isObject().withMessage('Portfolio data must be an object'),
    body('objectives').isArray().withMessage('Objectives must be an array'),
    body('constraints').isObject().withMessage('Constraints must be an object'),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { portfolioData, objectives, constraints } = req.body;
      
      logger.info('Starting multi-agent collaborative strategy analysis');
      
      const analysis = await multiAgentService.collaborativeStrategyAnalysis(
        portfolioData,
        objectives,
        constraints
      );
      
      res.json({
        success: true,
        data: analysis,
        metadata: {
          analysisType: 'multi-agent-collaboration',
          agentsInvolved: 4,
          expertiseAreas: [
            'defi-strategy',
            'risk-management',
            'market-intelligence',
            'technical-architecture'
          ],
          collaborationPhases: [
            'individual-analysis',
            'cross-agent-debate',
            'consensus-building',
            'recommendation-synthesis'
          ]
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in collaborative strategy analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Collaborative analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/ai-intelligence/collaborative/risk-assessment
 * Multi-agent risk assessment
 */
router.post('/collaborative/risk-assessment',
  aiIntelligenceLimit,
  [
    body('strategy').isObject().withMessage('Strategy must be an object'),
    body('marketConditions').isObject().withMessage('Market conditions must be an object'),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { strategy, marketConditions } = req.body;
      
      logger.info('Conducting multi-agent risk assessment');
      
      const riskAssessment = await multiAgentService.multiAgentRiskAssessment(
        strategy,
        marketConditions
      );
      
      res.json({
        success: true,
        data: riskAssessment,
        metadata: {
          assessmentType: 'multi-perspective-risk-analysis',
          riskDimensions: [
            'financial-risk',
            'technical-risk',
            'market-risk',
            'operational-risk'
          ],
          agentPerspectives: [
            'conservative-risk-analyst',
            'market-researcher',
            'technical-expert',
            'strategy-specialist'
          ]
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in multi-agent risk assessment:', error);
      res.status(500).json({
        success: false,
        error: 'Risk assessment failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/ai-intelligence/collaborative/opportunity-detection
 * Collaborative market opportunity detection
 */
router.post('/collaborative/opportunity-detection',
  aiIntelligenceLimit,
  [
    body('marketData').isObject().withMessage('Market data must be an object'),
    body('userPreferences').isObject().withMessage('User preferences must be an object'),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { marketData, userPreferences } = req.body;
      
      logger.info('Detecting market opportunities through agent collaboration');
      
      const opportunityAnalysis = await multiAgentService.collaborativeOpportunityDetection(
        marketData,
        userPreferences
      );
      
      res.json({
        success: true,
        data: opportunityAnalysis,
        metadata: {
          detectionMethod: 'collaborative-intelligence',
          opportunityTypes: [
            'yield-farming',
            'arbitrage',
            'liquidity-provision',
            'protocol-governance'
          ],
          validationStages: [
            'individual-identification',
            'cross-validation',
            'collaborative-ranking',
            'execution-strategy'
          ]
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in collaborative opportunity detection:', error);
      res.status(500).json({
        success: false,
        error: 'Opportunity detection failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/ai-intelligence/scientific/hypothesis-testing
 * Scientific hypothesis generation and testing
 */
router.post('/scientific/hypothesis-testing',
  aiIntelligenceLimit,
  [
    body('observationData').isObject().withMessage('Observation data must be an object'),
    body('researchQuestion').isString().notEmpty().withMessage('Research question is required'),
    body('confidenceThreshold').optional().isFloat({ min: 0, max: 1 }).withMessage('Confidence threshold must be between 0-1'),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { observationData, researchQuestion, confidenceThreshold = 0.8 } = req.body;
      
      logger.info(`Starting scientific hypothesis testing for: ${researchQuestion}`);
      
      const scientificAnalysis = await scientificFramework.generateAndTestHypotheses(
        observationData,
        researchQuestion,
        confidenceThreshold
      );
      
      res.json({
        success: true,
        data: scientificAnalysis,
        metadata: {
          analysisType: 'scientific-method',
          researchQuestion,
          confidenceThreshold,
          scientificSteps: [
            'observation-structuring',
            'hypothesis-generation',
            'experimental-design',
            'data-collection',
            'statistical-analysis',
            'conclusion-drawing',
            'peer-review-simulation'
          ]
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in scientific hypothesis testing:', error);
      res.status(500).json({
        success: false,
        error: 'Scientific analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/ai-intelligence/scientific/strategy-experiment
 * Controlled DeFi strategy experiments
 */
router.post('/scientific/strategy-experiment',
  aiIntelligenceLimit,
  [
    body('strategy').isObject().withMessage('Strategy must be an object'),
    body('controlConditions').isObject().withMessage('Control conditions must be an object'),
    body('testConditions').isObject().withMessage('Test conditions must be an object'),
    body('duration').optional().isInt({ min: 1, max: 30 }).withMessage('Duration must be between 1-30 days'),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { strategy, controlConditions, testConditions, duration = 7 } = req.body;
      
      logger.info('Conducting controlled DeFi strategy experiment');
      
      const experiment = await scientificFramework.conductStrategyExperiment(
        strategy,
        controlConditions,
        testConditions,
        duration
      );
      
      res.json({
        success: true,
        data: experiment,
        metadata: {
          experimentType: 'controlled-strategy-validation',
          duration: `${duration} days`,
          experimentalDesign: 'randomized-controlled',
          analysisComponents: [
            'baseline-measurement',
            'treatment-application',
            'data-collection',
            'statistical-analysis',
            'effect-size-calculation',
            'significance-testing'
          ]
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in strategy experiment:', error);
      res.status(500).json({
        success: false,
        error: 'Strategy experiment failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/ai-intelligence/scientific/meta-analysis
 * Meta-analysis of multiple experiments
 */
router.post('/scientific/meta-analysis',
  aiIntelligenceLimit,
  [
    body('experimentIds').isArray().withMessage('Experiment IDs must be an array'),
    body('experimentIds.*').isString().withMessage('Each experiment ID must be a string'),
    body('analysisType').optional().isIn(['fixed-effects', 'random-effects']).withMessage('Invalid analysis type'),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response): Promise<any> => {
    try {
      const { experimentIds, analysisType = 'random-effects' } = req.body;
      
      if (experimentIds.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Meta-analysis requires at least 2 experiments'
        });
      }
      
      logger.info(`Conducting meta-analysis of ${experimentIds.length} experiments`);
      
      const metaAnalysis = await scientificFramework.conductMetaAnalysis(
        experimentIds,
        analysisType
      );
      
      res.json({
        success: true,
        data: metaAnalysis,
        metadata: {
          analysisType: `meta-analysis-${analysisType}`,
          experimentsIncluded: experimentIds.length,
          analysisComponents: [
            'effect-size-standardization',
            'pooled-effect-calculation',
            'heterogeneity-assessment',
            'publication-bias-analysis',
            'sensitivity-analysis',
            'forest-plot-generation'
          ]
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in meta-analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Meta-analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/ai-intelligence/scientific/systematic-review
 * Systematic literature review simulation
 */
router.post('/scientific/systematic-review',
  aiIntelligenceLimit,
  [
    body('researchQuestion').isString().notEmpty().withMessage('Research question is required'),
    body('inclusionCriteria').isArray().withMessage('Inclusion criteria must be an array'),
    body('exclusionCriteria').isArray().withMessage('Exclusion criteria must be an array'),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { researchQuestion, inclusionCriteria, exclusionCriteria } = req.body;
      
      logger.info(`Conducting systematic review for: ${researchQuestion}`);
      
      const systematicReview = await scientificFramework.conductSystematicReview(
        researchQuestion,
        inclusionCriteria,
        exclusionCriteria
      );
      
      res.json({
        success: true,
        data: systematicReview,
        metadata: {
          reviewType: 'systematic-literature-review',
          researchQuestion,
          reviewStages: [
            'literature-search',
            'study-selection',
            'quality-assessment',
            'data-extraction',
            'synthesis',
            'grade-assessment',
            'recommendation-generation'
          ]
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in systematic review:', error);
      res.status(500).json({
        success: false,
        error: 'Systematic review failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/ai-intelligence/capabilities
 * Get AI intelligence capabilities
 */
router.get('/capabilities', async (req: express.Request, res: express.Response) => {
  try {
    const capabilities = {
      multiAgentCollaboration: {
        agents: {
          defiStrategist: {
            expertise: ['yield-farming', 'liquidity-provision', 'protocol-analysis'],
            personality: 'analytical, risk-aware, profit-focused'
          },
          riskAnalyst: {
            expertise: ['risk-assessment', 'portfolio-optimization', 'volatility-analysis'],
            personality: 'conservative, thorough, safety-first'
          },
          marketResearcher: {
            expertise: ['market-trends', 'sentiment-analysis', 'macro-economics'],
            personality: 'data-driven, forward-thinking, trend-focused'
          },
          technicalArchitect: {
            expertise: ['smart-contracts', 'gas-optimization', 'security-analysis'],
            personality: 'technical, security-focused, efficiency-oriented'
          }
        },
        collaborationMethods: [
          'individual-analysis',
          'cross-agent-debate',
          'consensus-building',
          'recommendation-synthesis'
        ]
      },
      scientificMethod: {
        methodologies: [
          'hypothesis-generation-testing',
          'controlled-experiments',
          'meta-analysis',
          'systematic-reviews'
        ],
        statisticalMethods: [
          'significance-testing',
          'effect-size-calculation',
          'confidence-intervals',
          'heterogeneity-assessment'
        ],
        qualityAssurance: [
          'peer-review-simulation',
          'experimental-validity-assessment',
          'grade-evidence-evaluation',
          'publication-bias-detection'
        ]
      },
      analysisTypes: [
        'collaborative-strategy-analysis',
        'multi-agent-risk-assessment',
        'opportunity-detection',
        'hypothesis-testing',
        'controlled-experiments',
        'meta-analysis',
        'systematic-reviews'
      ],
      outputFormats: [
        'structured-recommendations',
        'statistical-analysis',
        'evidence-synthesis',
        'risk-assessments',
        'opportunity-rankings'
      ]
    };

    res.json({
      success: true,
      data: capabilities,
      version: '1.0.0-ai-intelligence',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching AI intelligence capabilities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch capabilities',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ai-intelligence/health
 * Health check for AI intelligence services
 */
router.get('/health', (req: express.Request, res: express.Response) => {
  // Ultra-fast health check - no async operations
  const healthCheck = {
    service: 'AI Intelligence Framework',
    status: 'operational',
    timestamp: new Date().toISOString(),
    components: {
      multiAgentCollaboration: 'active',
      scientificMethodFramework: 'active',
      hypothesisTesting: 'active',
      metaAnalysis: 'active'
    }
  };

  res.json({
    success: true,
    data: healthCheck,
    timestamp: new Date().toISOString()
  });
});

export default router;
