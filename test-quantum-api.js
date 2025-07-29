// Test script for Quantum DeFi API
const axios = require('axios');

async function testQuantumAPI() {
  try {
    console.log('🧪 Testing Quantum DeFi Analysis API...\n');

    // Test 1: Portfolio Analysis
    console.log('1. Testing Quantum Portfolio Analysis...');
    const portfolioResponse = await axios.post('http://localhost:3002/api/quantum-defi/portfolio/analyze', {
      accountAddress: '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef123456',
      riskTolerance: 'moderate'
    });
    
    console.log('✅ Portfolio Analysis Response:');
    console.log(JSON.stringify(portfolioResponse.data, null, 2));
    console.log('\n');

    // Test 2: AI Intelligence Collaborative Analysis
    console.log('2. Testing AI Intelligence Collaborative Analysis...');
    const aiResponse = await axios.post('http://localhost:3002/api/ai-intelligence/collaborative/strategy-analysis', {
      portfolioData: {
        totalValue: 100000,
        assets: ['ETH', 'STRK', 'USDC']
      },
      objectives: ['maximize-yield', 'minimize-risk'],
      constraints: {
        maxRisk: 0.3,
        minLiquidity: 0.2
      }
    });
    
    console.log('✅ AI Intelligence Response:');
    console.log(JSON.stringify(aiResponse.data, null, 2));
    console.log('\n');

    // Test 3: Starknet Balance Check
    console.log('3. Testing Starknet Balance Check...');
    const balanceResponse = await axios.get('http://localhost:3002/api/starknet/balance/0x1234567890abcdef1234567890abcdef12345678901234567890abcdef123456');
    
    console.log('✅ Starknet Balance Response:');
    console.log(JSON.stringify(balanceResponse.data, null, 2));
    console.log('\n');

    console.log('🎉 All API tests completed successfully!');
    console.log('🚀 Connectouch Enhanced DeFi AI Platform is fully operational!');

  } catch (error) {
    console.error('❌ API Test Error:', error.response?.data || error.message);
  }
}

testQuantumAPI();
