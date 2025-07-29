#!/usr/bin/env node

/**
 * Platform Fixes Verification Script
 * Tests all endpoints and functionality to ensure errors are resolved
 */

const axios = require('axios');

// Configuration
const NETLIFY_URL = 'https://connectouch-blockchain-ai.netlify.app';
const SUPABASE_URL = 'https://aompecyfgnakkmldhidg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbXBlY3lmZ25ha2ttbGRoaWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzMwODYsImV4cCI6MjA2OTMwOTA4Nn0.SSbGerxCplUZd_ZJDCK3HrfHM_m0it2lExgKBv3bt9A';

// Test results
const testResults = {
  frontend: { status: 'unknown', details: [] },
  healthCheck: { status: 'unknown', details: [] },
  cryptoPrices: { status: 'unknown', details: [] },
  nftCollections: { status: 'unknown', details: [] },
  apiRedirects: { status: 'unknown', details: [] }
};

async function testFrontendDeployment() {
  console.log('🌐 Testing frontend deployment...');
  
  try {
    const response = await axios.get(NETLIFY_URL, { timeout: 10000 });
    
    if (response.status === 200) {
      testResults.frontend.status = 'success';
      testResults.frontend.details.push('Frontend loads successfully');
      testResults.frontend.details.push(`Response time: ${response.headers['x-response-time'] || 'N/A'}`);
      console.log('✅ Frontend deployment: SUCCESS');
    } else {
      testResults.frontend.status = 'warning';
      testResults.frontend.details.push(`Unexpected status code: ${response.status}`);
      console.log('⚠️ Frontend deployment: WARNING');
    }
  } catch (error) {
    testResults.frontend.status = 'error';
    testResults.frontend.details.push(`Error: ${error.message}`);
    console.log('❌ Frontend deployment: ERROR');
  }
}

async function testHealthCheckEndpoint() {
  console.log('🏥 Testing health check endpoint...');

  try {
    const response = await axios.get(
      `${NETLIFY_URL}/api/health-check`,
      { timeout: 15000 }
    );

    if (response.status === 200 && response.data) {
      testResults.healthCheck.status = 'success';
      testResults.healthCheck.details.push('Health check endpoint responds');
      testResults.healthCheck.details.push(`Services checked: ${response.data.services?.length || 0}`);
      testResults.healthCheck.details.push(`Overall status: ${response.data.status || 'unknown'}`);

      // Check for real API integration
      const services = response.data.services || [];
      const realApiServices = services.filter(s =>
        s.name.includes('CoinMarketCap') ||
        s.name.includes('Alchemy') ||
        s.name.includes('OpenAI')
      );

      if (realApiServices.length > 0) {
        testResults.healthCheck.details.push(`Real API services: ${realApiServices.length}`);
        realApiServices.forEach(service => {
          testResults.healthCheck.details.push(`  ${service.name}: ${service.status}`);
        });
      }

      console.log('✅ Health check endpoint: SUCCESS');
    } else {
      testResults.healthCheck.status = 'warning';
      testResults.healthCheck.details.push(`Status: ${response.status}`);
      console.log('⚠️ Health check endpoint: WARNING');
    }
  } catch (error) {
    testResults.healthCheck.status = 'error';
    testResults.healthCheck.details.push(`Error: ${error.message}`);
    console.log('❌ Health check endpoint: ERROR');
  }
}

async function testCryptoPricesEndpoint() {
  console.log('💰 Testing crypto prices endpoint...');

  try {
    const response = await axios.get(
      `${NETLIFY_URL}/api/crypto-prices?symbols=BTC,ETH`,
      { timeout: 15000 }
    );

    if (response.status === 200 && response.data) {
      testResults.cryptoPrices.status = 'success';
      testResults.cryptoPrices.details.push('Crypto prices endpoint responds');
      testResults.cryptoPrices.details.push(`Data available: ${!!response.data.data}`);

      if (response.data.data && Array.isArray(response.data.data)) {
        testResults.cryptoPrices.details.push(`Coins returned: ${response.data.data.length}`);

        // Check for real price data
        const btcData = response.data.data.find(coin => coin.symbol === 'BTC');
        const ethData = response.data.data.find(coin => coin.symbol === 'ETH');

        if (btcData) {
          testResults.cryptoPrices.details.push(`BTC Price: $${btcData.price?.toFixed(2) || 'N/A'}`);
          testResults.cryptoPrices.details.push(`BTC 24h Change: ${btcData.price_change_percentage_24h?.toFixed(2) || 'N/A'}%`);
        }
        if (ethData) {
          testResults.cryptoPrices.details.push(`ETH Price: $${ethData.price?.toFixed(2) || 'N/A'}`);
          testResults.cryptoPrices.details.push(`ETH 24h Change: ${ethData.price_change_percentage_24h?.toFixed(2) || 'N/A'}%`);
        }

        // Check if data is from real API or fallback
        if (response.data.cached) {
          testResults.cryptoPrices.details.push('Note: Using fallback data');
        } else {
          testResults.cryptoPrices.details.push('✅ Real-time data from CoinMarketCap');
        }
      }

      console.log('✅ Crypto prices endpoint: SUCCESS');
    } else {
      testResults.cryptoPrices.status = 'warning';
      testResults.cryptoPrices.details.push(`Status: ${response.status}`);
      console.log('⚠️ Crypto prices endpoint: WARNING');
    }
  } catch (error) {
    testResults.cryptoPrices.status = 'error';
    testResults.cryptoPrices.details.push(`Error: ${error.message}`);
    console.log('❌ Crypto prices endpoint: ERROR');
  }
}

async function testNFTCollectionsEndpoint() {
  console.log('🎨 Testing NFT collections endpoint...');

  try {
    const response = await axios.get(
      `${NETLIFY_URL}/api/nft-collections`,
      { timeout: 15000 }
    );

    if (response.status === 200 && response.data) {
      testResults.nftCollections.status = 'success';
      testResults.nftCollections.details.push('NFT collections endpoint responds');
      testResults.nftCollections.details.push(`Collections count: ${response.data.data?.length || 0}`);

      if (response.data.data && Array.isArray(response.data.data)) {
        const collections = response.data.data;
        testResults.nftCollections.details.push(`Sample collections: ${collections.slice(0, 3).map(c => c.name).join(', ')}`);

        // Check metadata
        if (response.data.metadata) {
          testResults.nftCollections.details.push(`Total volume: ${response.data.metadata.totalVolume?.toFixed(2) || 'N/A'} ETH`);
          testResults.nftCollections.details.push(`Avg floor price: ${response.data.metadata.averageFloorPrice?.toFixed(2) || 'N/A'} ETH`);
        }

        // Check for comprehensive data
        const sampleCollection = collections[0];
        if (sampleCollection) {
          testResults.nftCollections.details.push(`Sample: ${sampleCollection.name} - Floor: ${sampleCollection.floorPrice} ETH`);
        }
      }

      console.log('✅ NFT collections endpoint: SUCCESS');
    } else {
      testResults.nftCollections.status = 'warning';
      testResults.nftCollections.details.push(`Status: ${response.status}`);
      console.log('⚠️ NFT collections endpoint: WARNING');
    }
  } catch (error) {
    testResults.nftCollections.status = 'error';
    testResults.nftCollections.details.push(`Error: ${error.message}`);
    console.log('❌ NFT collections endpoint: ERROR');
  }
}

async function testAPIRedirects() {
  console.log('🔀 Testing Netlify Functions...');

  try {
    const response = await axios.get(
      `${NETLIFY_URL}/api/health-check`,
      { timeout: 15000 }
    );

    if (response.status === 200 && response.data) {
      testResults.apiRedirects.status = 'success';
      testResults.apiRedirects.details.push('Netlify Functions working');
      testResults.apiRedirects.details.push(`Services monitored: ${response.data.services?.length || 0}`);
      testResults.apiRedirects.details.push(`Overall status: ${response.data.status || 'unknown'}`);

      // Check if real API data is present
      const services = response.data.services || [];
      const cmcService = services.find(s => s.name === 'CoinMarketCap API');
      const alchemyService = services.find(s => s.name === 'Alchemy Blockchain');
      const openaiService = services.find(s => s.name === 'OpenAI GPT-4');

      if (cmcService) {
        testResults.apiRedirects.details.push(`CoinMarketCap: ${cmcService.status} (${cmcService.credits_left || 'N/A'} credits left)`);
      }
      if (alchemyService) {
        testResults.apiRedirects.details.push(`Alchemy: ${alchemyService.status} (Block: ${alchemyService.latest_block || 'N/A'})`);
      }
      if (openaiService) {
        testResults.apiRedirects.details.push(`OpenAI: ${openaiService.status} (${openaiService.models_available || 'N/A'} models)`);
      }

      console.log('✅ Netlify Functions: SUCCESS');
    } else {
      testResults.apiRedirects.status = 'warning';
      testResults.apiRedirects.details.push(`Status: ${response.status}`);
      console.log('⚠️ Netlify Functions: WARNING');
    }
  } catch (error) {
    testResults.apiRedirects.status = 'error';
    testResults.apiRedirects.details.push(`Error: ${error.message}`);
    console.log('❌ Netlify Functions: ERROR');
  }
}

function generateReport() {
  console.log('\n📊 PLATFORM FIXES VERIFICATION REPORT');
  console.log('=====================================');
  
  const totalTests = Object.keys(testResults).length;
  const successfulTests = Object.values(testResults).filter(r => r.status === 'success').length;
  const warningTests = Object.values(testResults).filter(r => r.status === 'warning').length;
  const errorTests = Object.values(testResults).filter(r => r.status === 'error').length;
  
  console.log(`\n📈 Overall Status: ${successfulTests}/${totalTests} tests passed`);
  console.log(`✅ Successful: ${successfulTests}`);
  console.log(`⚠️ Warnings: ${warningTests}`);
  console.log(`❌ Errors: ${errorTests}`);
  
  console.log('\n📋 Detailed Results:');
  
  Object.entries(testResults).forEach(([testName, result]) => {
    const statusIcon = result.status === 'success' ? '✅' : 
                      result.status === 'warning' ? '⚠️' : '❌';
    
    console.log(`\n${statusIcon} ${testName.toUpperCase()}: ${result.status.toUpperCase()}`);
    result.details.forEach(detail => {
      console.log(`   • ${detail}`);
    });
  });
  
  console.log('\n🔗 Important URLs:');
  console.log(`🌐 Frontend: ${NETLIFY_URL}`);
  console.log(`🏥 Health Check: ${SUPABASE_URL}/functions/v1/health-check`);
  console.log(`💰 Crypto Prices: ${SUPABASE_URL}/functions/v1/crypto-prices`);
  console.log(`🎨 NFT Collections: ${SUPABASE_URL}/functions/v1/nft-collections`);
  
  if (successfulTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Platform is fully operational.');
  } else if (errorTests === 0) {
    console.log('\n✅ Platform is mostly operational with minor warnings.');
  } else {
    console.log('\n⚠️ Platform has some issues that need attention.');
  }
}

async function main() {
  console.log('🚀 Starting Platform Fixes Verification...');
  console.log(`🌐 Frontend URL: ${NETLIFY_URL}`);
  console.log(`🔧 Supabase URL: ${SUPABASE_URL}`);
  
  await testFrontendDeployment();
  await testHealthCheckEndpoint();
  await testCryptoPricesEndpoint();
  await testNFTCollectionsEndpoint();
  await testAPIRedirects();
  
  generateReport();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testResults, main };
