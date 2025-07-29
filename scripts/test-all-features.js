#!/usr/bin/env node

/**
 * Comprehensive Feature Testing Script
 * Tests all major platform features and API endpoints
 */

const axios = require('axios');

const FRONTEND_URL = 'http://localhost:5175';
const BACKEND_URL = 'http://localhost:3007';

class FeatureTester {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  async runAllTests() {
    console.log('🧪 Testing All Platform Features...\n');

    // Core API Tests
    await this.testCoreAPIs();
    
    // Blockchain Data Tests
    await this.testBlockchainFeatures();
    
    // AI Features Tests
    await this.testAIFeatures();
    
    // DeFi Features Tests
    await this.testDeFiFeatures();
    
    // NFT Features Tests
    await this.testNFTFeatures();
    
    // Analytics Features Tests
    await this.testAnalyticsFeatures();

    // Generate comprehensive report
    this.generateReport();
  }

  async testCoreAPIs() {
    console.log('🔍 Testing Core APIs...');
    
    const coreEndpoints = [
      '/api/v2/blockchain/overview',
      '/api/v2/blockchain/prices/live',
      '/health'
    ];

    for (const endpoint of coreEndpoints) {
      await this.testEndpoint(endpoint, 'Core API');
    }
  }

  async testBlockchainFeatures() {
    console.log('🔍 Testing Blockchain Features...');
    
    const blockchainEndpoints = [
      '/api/v2/blockchain/network/ethereum/stats',
      '/api/v2/blockchain/network/bitcoin/stats',
      '/api/v2/blockchain/gas/tracker',
      '/api/v2/blockchain/transactions/recent'
    ];

    for (const endpoint of blockchainEndpoints) {
      await this.testEndpoint(endpoint, 'Blockchain');
    }
  }

  async testAIFeatures() {
    console.log('🔍 Testing AI Features...');
    
    // Test AI chat endpoint
    try {
      const response = await axios.post(`${FRONTEND_URL}/api/v2/blockchain/ai/chat`, {
        message: 'What is Bitcoin?',
        conversationHistory: [],
        sector: 'defi'
      }, { timeout: 15000 });

      if (response.status === 200 && response.data.success) {
        this.results.passed.push('✅ AI Chat feature working');
      } else {
        this.results.failed.push('❌ AI Chat feature failed - invalid response');
      }
    } catch (error) {
      this.results.failed.push(`❌ AI Chat feature failed: ${error.message}`);
    }

    // Test AI analysis endpoint
    await this.testEndpoint('/api/v2/blockchain/ai/analysis', 'AI Analysis');
  }

  async testDeFiFeatures() {
    console.log('🔍 Testing DeFi Features...');
    
    const defiEndpoints = [
      '/api/v2/blockchain/defi/protocols',
      '/api/v2/blockchain/defi/yields',
      '/api/v2/blockchain/defi/tvl'
    ];

    for (const endpoint of defiEndpoints) {
      await this.testEndpoint(endpoint, 'DeFi');
    }
  }

  async testNFTFeatures() {
    console.log('🔍 Testing NFT Features...');
    
    const nftEndpoints = [
      '/api/v2/blockchain/nft/collections/trending',
      '/api/v2/blockchain/nft/marketplace/stats'
    ];

    for (const endpoint of nftEndpoints) {
      await this.testEndpoint(endpoint, 'NFT');
    }
  }

  async testAnalyticsFeatures() {
    console.log('🔍 Testing Analytics Features...');
    
    const analyticsEndpoints = [
      '/api/v2/analytics/portfolio/performance',
      '/api/v2/analytics/market/sentiment',
      '/api/v2/analytics/risk/assessment'
    ];

    for (const endpoint of analyticsEndpoints) {
      await this.testEndpoint(endpoint, 'Analytics');
    }
  }

  async testEndpoint(endpoint, category) {
    try {
      const response = await axios.get(`${FRONTEND_URL}${endpoint}`, { timeout: 10000 });
      
      if (response.status === 200) {
        if (response.data.success !== false) {
          this.results.passed.push(`✅ ${category}: ${endpoint}`);
        } else {
          this.results.failed.push(`❌ ${category}: ${endpoint} - API returned success: false`);
        }
      } else {
        this.results.failed.push(`❌ ${category}: ${endpoint} - HTTP ${response.status}`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        this.results.warnings.push(`⚠️ ${category}: ${endpoint} - Not implemented (404)`);
      } else if (error.response?.status === 500) {
        this.results.failed.push(`❌ ${category}: ${endpoint} - Server error (500)`);
      } else {
        this.results.failed.push(`❌ ${category}: ${endpoint} - ${error.message}`);
      }
    }
  }

  generateReport() {
    console.log('\n📊 COMPREHENSIVE FEATURE TEST REPORT');
    console.log('='.repeat(60));

    console.log(`\n✅ WORKING FEATURES (${this.results.passed.length}):`);
    this.results.passed.forEach(item => console.log(`  ${item}`));

    if (this.results.warnings.length > 0) {
      console.log(`\n⚠️ NOT IMPLEMENTED (${this.results.warnings.length}):`);
      this.results.warnings.forEach(item => console.log(`  ${item}`));
    }

    if (this.results.failed.length > 0) {
      console.log(`\n❌ BROKEN FEATURES (${this.results.failed.length}):`);
      this.results.failed.forEach(item => console.log(`  ${item}`));
    }

    console.log('\n' + '='.repeat(60));
    
    const totalTests = this.results.passed.length + this.results.warnings.length + this.results.failed.length;
    const workingPercentage = Math.round((this.results.passed.length / totalTests) * 100);
    
    console.log(`📈 SUMMARY: ${this.results.passed.length}/${totalTests} features working (${workingPercentage}%)`);
    
    if (this.results.failed.length === 0) {
      console.log('🎉 ALL IMPLEMENTED FEATURES ARE WORKING!');
      process.exit(0);
    } else {
      console.log(`⚠️ ${this.results.failed.length} features need fixing.`);
      process.exit(1);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new FeatureTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Feature test script failed:', error);
    process.exit(1);
  });
}

module.exports = FeatureTester;
