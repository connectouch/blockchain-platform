import express from 'express';
import { BlockchainAIService } from '../services/BlockchainAIService';
import { logger } from '../utils/logger';

const router = express.Router();
const blockchainAIService = new BlockchainAIService();

/**
 * GET /api/blockchain-ai/overview
 * Get comprehensive blockchain ecosystem overview
 */
router.get('/overview', async (req, res): Promise<any> => {
  try {
    logger.info('Fetching blockchain ecosystem overview');
    
    const overview = {
      sectors: [
        {
          name: 'DeFi',
          description: 'Decentralized Finance protocols and yield farming',
          marketCap: '$45.2B',
          growth24h: '+2.3%',
          topProtocols: ['Uniswap', 'Aave', 'Compound'],
          icon: '💰'
        },
        {
          name: 'NFTs',
          description: 'Non-Fungible Tokens and digital collectibles',
          marketCap: '$12.8B',
          growth24h: '-1.2%',
          topCollections: ['Bored Apes', 'CryptoPunks', 'Azuki'],
          icon: '🎨'
        },
        {
          name: 'GameFi',
          description: 'Blockchain gaming and play-to-earn',
          marketCap: '$8.9B',
          growth24h: '+5.7%',
          topGames: ['Axie Infinity', 'The Sandbox', 'Decentraland'],
          icon: '🎮'
        },
        {
          name: 'DAOs',
          description: 'Decentralized Autonomous Organizations',
          marketCap: '$6.1B',
          growth24h: '+1.8%',
          topDAOs: ['MakerDAO', 'Uniswap DAO', 'Compound DAO'],
          icon: '🏛️'
        },
        {
          name: 'Infrastructure',
          description: 'Layer 1/2 blockchains and scaling solutions',
          marketCap: '$89.3B',
          growth24h: '+0.9%',
          topChains: ['Ethereum', 'Polygon', 'Arbitrum'],
          icon: '⚡'
        },
        {
          name: 'Web3 Tools',
          description: 'Development tools and dApp infrastructure',
          marketCap: '$3.2B',
          growth24h: '+3.4%',
          topTools: ['IPFS', 'The Graph', 'Chainlink'],
          icon: '🔧'
        }
      ],
      totalMarketCap: '$165.5B',
      totalGrowth24h: '+1.8%',
      timestamp: new Date()
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
 * POST /api/blockchain-ai/analyze-nft
 * Analyze NFT collection with AI
 */
router.post('/analyze-nft', async (req, res): Promise<any> => {
  try {
    const { collectionData } = req.body;
    
    if (!collectionData || !collectionData.name) {
      return res.status(400).json({
        success: false,
        error: 'Collection data with name is required'
      });
    }

    logger.info('Analyzing NFT collection:', collectionData.name);
    
    const analysis = await blockchainAIService.analyzeNFTCollection(collectionData);
    
    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    logger.error('Error analyzing NFT collection:', error);
    res.status(500).json({
      success: false,
      error: 'NFT analysis failed'
    });
  }
});

/**
 * POST /api/blockchain-ai/analyze-gamefi
 * Analyze GameFi project with AI
 */
router.post('/analyze-gamefi', async (req, res): Promise<any> => {
  try {
    const { gameData } = req.body;
    
    if (!gameData || !gameData.name) {
      return res.status(400).json({
        success: false,
        error: 'Game data with name is required'
      });
    }

    logger.info('Analyzing GameFi project:', gameData.name);
    
    const analysis = await blockchainAIService.analyzeGameFiProject(gameData);
    
    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    logger.error('Error analyzing GameFi project:', error);
    res.status(500).json({
      success: false,
      error: 'GameFi analysis failed'
    });
  }
});

/**
 * POST /api/blockchain-ai/analyze-dao
 * Analyze DAO with AI
 */
router.post('/analyze-dao', async (req, res): Promise<any> => {
  try {
    const { daoData } = req.body;
    
    if (!daoData || !daoData.name) {
      return res.status(400).json({
        success: false,
        error: 'DAO data with name is required'
      });
    }

    logger.info('Analyzing DAO:', daoData.name);
    
    const analysis = await blockchainAIService.analyzeDAO(daoData);
    
    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    logger.error('Error analyzing DAO:', error);
    res.status(500).json({
      success: false,
      error: 'DAO analysis failed'
    });
  }
});

/**
 * POST /api/blockchain-ai/analyze-contract
 * Analyze smart contract security with AI
 */
router.post('/analyze-contract', async (req, res): Promise<any> => {
  try {
    const { contractCode, contractAddress } = req.body;
    
    if (!contractCode) {
      return res.status(400).json({
        success: false,
        error: 'Contract code is required'
      });
    }

    logger.info('Analyzing smart contract security');
    
    const analysis = await blockchainAIService.analyzeSmartContract(contractCode, contractAddress);
    
    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    logger.error('Error analyzing smart contract:', error);
    res.status(500).json({
      success: false,
      error: 'Contract analysis failed'
    });
  }
});

/**
 * POST /api/blockchain-ai/analyze-portfolio
 * Analyze cross-chain portfolio with AI
 */
router.post('/analyze-portfolio', async (req, res): Promise<any> => {
  try {
    const { portfolioData } = req.body;
    
    if (!portfolioData || !portfolioData.chains) {
      return res.status(400).json({
        success: false,
        error: 'Portfolio data with chains is required'
      });
    }

    logger.info('Analyzing cross-chain portfolio');
    
    const analysis = await blockchainAIService.analyzeCrossChainPortfolio(portfolioData);
    
    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    logger.error('Error analyzing portfolio:', error);
    res.status(500).json({
      success: false,
      error: 'Portfolio analysis failed'
    });
  }
});

/**
 * POST /api/blockchain-ai/web3-guidance
 * Get Web3 development guidance with AI
 */
router.post('/web3-guidance', async (req, res): Promise<any> => {
  try {
    const { projectData } = req.body;
    
    if (!projectData || !projectData.type) {
      return res.status(400).json({
        success: false,
        error: 'Project data with type is required'
      });
    }

    logger.info('Providing Web3 development guidance for:', projectData.type);
    
    const guidance = await blockchainAIService.assistWeb3Development(projectData);
    
    res.json({
      success: true,
      data: guidance
    });

  } catch (error) {
    logger.error('Error providing Web3 guidance:', error);
    res.status(500).json({
      success: false,
      error: 'Web3 guidance failed'
    });
  }
});

/**
 * GET /api/blockchain-ai/market-analysis
 * Get comprehensive blockchain market analysis
 */
router.get('/market-analysis', async (req, res): Promise<any> => {
  try {
    logger.info('Generating comprehensive market analysis');
    
    const analysis = await blockchainAIService.analyzeBlockchainMarket();
    
    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    logger.error('Error generating market analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Market analysis failed'
    });
  }
});

/**
 * GET /api/blockchain-ai/trending
 * Get trending blockchain projects and opportunities
 */
router.get('/trending', async (req, res): Promise<any> => {
  try {
    logger.info('Fetching trending blockchain projects');
    
    const trending = {
      nfts: [
        { name: 'Pudgy Penguins', floorPrice: '2.1 ETH', change24h: '+15.3%' },
        { name: 'Azuki', floorPrice: '4.8 ETH', change24h: '+8.7%' },
        { name: 'Doodles', floorPrice: '1.9 ETH', change24h: '+12.1%' }
      ],
      gamefi: [
        { name: 'Illuvium', token: 'ILV', price: '$45.20', change24h: '+22.4%' },
        { name: 'Gala Games', token: 'GALA', price: '$0.032', change24h: '+18.9%' },
        { name: 'Enjin', token: 'ENJ', price: '$0.28', change24h: '+14.2%' }
      ],
      defi: [
        { name: 'Lido', token: 'LDO', tvl: '$14.2B', apy: '4.8%' },
        { name: 'Rocket Pool', token: 'RPL', tvl: '$2.1B', apy: '5.2%' },
        { name: 'Frax', token: 'FXS', tvl: '$1.8B', apy: '6.1%' }
      ],
      infrastructure: [
        { name: 'Polygon', token: 'MATIC', price: '$0.89', change24h: '+5.3%' },
        { name: 'Arbitrum', token: 'ARB', price: '$1.12', change24h: '+7.8%' },
        { name: 'Optimism', token: 'OP', price: '$1.45', change24h: '+9.2%' }
      ]
    };
    
    res.json({
      success: true,
      data: trending,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Error fetching trending projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending projects'
    });
  }
});

export default router;
