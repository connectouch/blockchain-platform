import { OpenAIService } from '../services/OpenAIService';
import { DeFiProtocolData } from '../types/defi';
import dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config();

describe('OpenAI Service Tests', () => {
  let openAIService: OpenAIService;

  beforeAll(() => {
    // Skip tests if no OpenAI API key is provided
    if (!process.env.OPENAI_API_KEY) {
      console.log('Skipping OpenAI tests - no API key provided');
      return;
    }
    
    openAIService = new OpenAIService();
  });

  describe('Connection and Basic Functionality', () => {
    test('should initialize OpenAI service successfully', () => {
      if (!process.env.OPENAI_API_KEY) {
        expect(true).toBe(true); // Skip test
        return;
      }
      
      expect(openAIService).toBeDefined();
      expect(openAIService).toBeInstanceOf(OpenAIService);
    });

    test('should test OpenAI connection', async () => {
      if (!process.env.OPENAI_API_KEY) {
        expect(true).toBe(true); // Skip test
        return;
      }

      const isConnected = await openAIService.testConnection();
      expect(isConnected).toBe(true);
    }, 30000); // 30 second timeout for API call
  });

  describe('DeFi Analysis', () => {
    const mockProtocolData: DeFiProtocolData[] = [
      {
        id: 'uniswap-v3',
        name: 'Uniswap V3',
        protocol: 'uniswap',
        tvl: 3500000000, // $3.5B
        apy: 12.5,
        riskScore: 4,
        category: 'dex',
        blockchain: 'ethereum',
        lastUpdated: new Date(),
        volume24h: 1200000000,
        fees24h: 2400000,
        users24h: 45000
      },
      {
        id: 'aave-v3',
        name: 'Aave V3',
        protocol: 'aave',
        tvl: 8900000000, // $8.9B
        apy: 8.2,
        riskScore: 3,
        category: 'lending',
        blockchain: 'ethereum',
        lastUpdated: new Date(),
        volume24h: 800000000,
        fees24h: 1600000,
        users24h: 32000
      },
      {
        id: 'compound-v3',
        name: 'Compound V3',
        protocol: 'compound',
        tvl: 2100000000, // $2.1B
        apy: 6.8,
        riskScore: 3,
        category: 'lending',
        blockchain: 'ethereum',
        lastUpdated: new Date(),
        volume24h: 450000000,
        fees24h: 900000,
        users24h: 18000
      }
    ];

    test('should analyze DeFi protocols and generate recommendations', async () => {
      if (!process.env.OPENAI_API_KEY) {
        expect(true).toBe(true); // Skip test
        return;
      }

      const userRiskTolerance = 6; // Medium-high risk tolerance
      const portfolioValue = 50000; // $50k portfolio

      const analysis = await openAIService.analyzeDeFiProtocols(
        mockProtocolData,
        userRiskTolerance,
        portfolioValue
      );

      // Verify analysis structure
      expect(analysis).toBeDefined();
      expect(analysis.summary).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(Array.isArray(analysis.recommendations)).toBe(true);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.riskAssessment).toBeDefined();
      expect(analysis.marketOutlook).toBeDefined();

      // Verify recommendation structure
      const firstRecommendation = analysis.recommendations[0];
      expect(firstRecommendation.protocol).toBeDefined();
      expect(firstRecommendation.strategy).toBeDefined();
      expect(typeof firstRecommendation.expectedAPY).toBe('number');
      expect(typeof firstRecommendation.riskLevel).toBe('number');
      expect(typeof firstRecommendation.allocation).toBe('number');
      expect(firstRecommendation.reasoning).toBeDefined();

      // Verify risk assessment structure
      expect(typeof analysis.riskAssessment.overallRisk).toBe('number');
      expect(Array.isArray(analysis.riskAssessment.factors)).toBe(true);
      expect(analysis.riskAssessment.mitigation).toBeDefined();

      console.log('AI Analysis Result:', JSON.stringify(analysis, null, 2));
    }, 45000); // 45 second timeout for complex analysis

    test('should handle different risk tolerance levels', async () => {
      if (!process.env.OPENAI_API_KEY) {
        expect(true).toBe(true); // Skip test
        return;
      }

      // Test conservative user (risk tolerance 2)
      const conservativeAnalysis = await openAIService.analyzeDeFiProtocols(
        mockProtocolData,
        2, // Low risk tolerance
        25000 // $25k portfolio
      );

      // Test aggressive user (risk tolerance 9)
      const aggressiveAnalysis = await openAIService.analyzeDeFiProtocols(
        mockProtocolData,
        9, // High risk tolerance
        100000 // $100k portfolio
      );

      // Conservative analysis should have lower overall risk
      expect(conservativeAnalysis.riskAssessment.overallRisk)
        .toBeLessThanOrEqual(aggressiveAnalysis.riskAssessment.overallRisk);

      console.log('Conservative Analysis Risk:', conservativeAnalysis.riskAssessment.overallRisk);
      console.log('Aggressive Analysis Risk:', aggressiveAnalysis.riskAssessment.overallRisk);
    }, 60000); // 60 second timeout for multiple analyses
  });

  describe('AI Chat Functionality', () => {
    test('should respond to general DeFi questions', async () => {
      if (!process.env.OPENAI_API_KEY) {
        expect(true).toBe(true); // Skip test
        return;
      }

      const userQuestion = "What is yield farming and how does it work?";
      const response = await openAIService.chatWithAI(userQuestion);

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(50); // Should be a substantial response
      expect(response.toLowerCase()).toContain('yield'); // Should mention yield farming

      console.log('AI Chat Response:', response);
    }, 30000);

    test('should maintain conversation context', async () => {
      if (!process.env.OPENAI_API_KEY) {
        expect(true).toBe(true); // Skip test
        return;
      }

      const conversationHistory = [
        { role: 'user' as const, content: 'What is Uniswap?' },
        { role: 'assistant' as const, content: 'Uniswap is a decentralized exchange protocol...' }
      ];

      const followUpQuestion = "How do I provide liquidity to it?";
      const response = await openAIService.chatWithAI(followUpQuestion, conversationHistory);

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      expect(response.toLowerCase()).toContain('liquidity');

      console.log('Contextual AI Response:', response);
    }, 30000);
  });

  describe('Error Handling', () => {
    test('should handle invalid API key gracefully', () => {
      // Temporarily override the API key
      const originalKey = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'invalid-key';

      expect(() => {
        new OpenAIService();
      }).not.toThrow(); // Should not throw during initialization

      // Restore original key
      process.env.OPENAI_API_KEY = originalKey;
    });

    test('should handle empty protocol data', async () => {
      if (!process.env.OPENAI_API_KEY) {
        expect(true).toBe(true); // Skip test
        return;
      }

      await expect(
        openAIService.analyzeDeFiProtocols([], 5, 10000)
      ).rejects.toThrow();
    }, 15000);

    test('should handle invalid risk tolerance', async () => {
      if (!process.env.OPENAI_API_KEY) {
        expect(true).toBe(true); // Skip test
        return;
      }

      // Risk tolerance should be 1-10, test with invalid values
      await expect(
        openAIService.analyzeDeFiProtocols(mockProtocolData, 15, 10000)
      ).rejects.toThrow();

      await expect(
        openAIService.analyzeDeFiProtocols(mockProtocolData, 0, 10000)
      ).rejects.toThrow();
    }, 15000);
  });

  describe('Performance Tests', () => {
    test('should complete analysis within reasonable time', async () => {
      if (!process.env.OPENAI_API_KEY) {
        expect(true).toBe(true); // Skip test
        return;
      }

      const startTime = Date.now();
      
      await openAIService.analyzeDeFiProtocols(
        mockProtocolData.slice(0, 2), // Use fewer protocols for speed
        5,
        30000
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
      console.log(`Analysis completed in ${duration}ms`);
    }, 35000);
  });
});

// Helper function to run manual tests
export async function runManualOpenAITest() {
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ No OpenAI API key found. Please set OPENAI_API_KEY environment variable.');
    return false;
  }

  try {
    console.log('🚀 Testing OpenAI integration...');
    
    const openAIService = new OpenAIService();
    
    // Test 1: Connection
    console.log('📡 Testing connection...');
    const isConnected = await openAIService.testConnection();
    console.log(`✅ Connection test: ${isConnected ? 'PASSED' : 'FAILED'}`);

    if (!isConnected) {
      return false;
    }

    // Test 2: Simple chat
    console.log('💬 Testing AI chat...');
    const chatResponse = await openAIService.chatWithAI(
      "Explain DeFi in one sentence."
    );
    console.log(`✅ Chat response: ${chatResponse.substring(0, 100)}...`);

    // Test 3: DeFi analysis
    console.log('📊 Testing DeFi analysis...');
    const mockData: DeFiProtocolData[] = [
      {
        id: 'test-protocol',
        name: 'Test Protocol',
        protocol: 'test',
        tvl: 1000000,
        apy: 10,
        riskScore: 5,
        category: 'lending',
        blockchain: 'ethereum',
        lastUpdated: new Date()
      }
    ];

    const analysis = await openAIService.analyzeDeFiProtocols(mockData, 5, 10000);
    console.log(`✅ Analysis generated with ${analysis.recommendations.length} recommendations`);

    console.log('🎉 All OpenAI tests passed!');
    return true;

  } catch (error) {
    console.error('❌ OpenAI test failed:', error);
    return false;
  }
}

// Run manual test if this file is executed directly
if (require.main === module) {
  runManualOpenAITest();
}
