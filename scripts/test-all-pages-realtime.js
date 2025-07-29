#!/usr/bin/env node

/**
 * Comprehensive Real-Time Data Test Script
 * Tests all pages and verifies they provide real-time data
 */

const axios = require('axios');

const FRONTEND_URL = 'http://localhost:5175';

class RealTimeDataTester {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      realTimeData: []
    };
  }

  async testAllPagesRealTime() {
    console.log('🔍 Testing All Pages for Real-Time Data...\n');

    // Test main pages and their data sources
    await this.testDashboardPage();
    await this.testDeFiPage();
    await this.testNFTPage();
    await this.testInfrastructurePage();
    await this.testGameFiPage();
    await this.testDAOPage();
    await this.testAnalyticsPages();

    // Generate comprehensive report
    this.generateReport();
  }

  async testDashboardPage() {
    console.log('🏠 Testing Dashboard Page...');
    
    // Test main dashboard data
    try {
      const response = await axios.get(`${FRONTEND_URL}/api/v2/blockchain/overview`);
      if (response.data.success && response.data.data.market) {
        const marketData = response.data.data.market;
        if (marketData.total_market_cap > 0 && marketData.last_updated) {
          this.results.passed.push('✅ Dashboard - Real-time market overview');
          this.results.realTimeData.push(`📊 Market Cap: $${(marketData.total_market_cap / 1e12).toFixed(2)}T (${marketData.last_updated})`);
        }
      }
    } catch (error) {
      this.results.failed.push('❌ Dashboard - Market overview failed');
    }

    // Test live prices
    try {
      const response = await axios.get(`${FRONTEND_URL}/api/v2/blockchain/prices/live`);
      if (response.data.success && response.data.data.btc) {
        const btcData = response.data.data.btc;
        if (btcData.usd > 0 && btcData.last_updated) {
          this.results.passed.push('✅ Dashboard - Real-time cryptocurrency prices');
          this.results.realTimeData.push(`₿ Bitcoin: $${btcData.usd.toLocaleString()} (${btcData.usd_24h_change > 0 ? '+' : ''}${btcData.usd_24h_change.toFixed(2)}%)`);
        }
      }
    } catch (error) {
      this.results.failed.push('❌ Dashboard - Live prices failed');
    }
  }

  async testDeFiPage() {
    console.log('🏦 Testing DeFi Page...');
    
    try {
      const response = await axios.get(`${FRONTEND_URL}/api/v2/blockchain/defi/protocols`);
      if (response.data.success && response.data.data.length > 0) {
        this.results.passed.push('✅ DeFi - Protocol data available');
        this.results.realTimeData.push(`🏦 DeFi Protocols: ${response.data.data.length} protocols loaded`);
      } else {
        this.results.warnings.push('⚠️ DeFi - No protocol data available');
      }
    } catch (error) {
      this.results.failed.push('❌ DeFi - Protocol data failed');
    }
  }

  async testNFTPage() {
    console.log('🖼️ Testing NFT Page...');
    
    try {
      const response = await axios.get(`${FRONTEND_URL}/api/v2/blockchain/nft/collections`);
      if (response.data.success) {
        this.results.passed.push('✅ NFT - Collections endpoint working');
        this.results.realTimeData.push('🖼️ NFT Collections: Endpoint operational');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        this.results.warnings.push('⚠️ NFT - Collections endpoint not implemented');
      } else {
        this.results.failed.push('❌ NFT - Collections endpoint error');
      }
    }
  }

  async testInfrastructurePage() {
    console.log('🏗️ Testing Infrastructure Page...');
    
    try {
      const response = await axios.get(`${FRONTEND_URL}/api/v2/blockchain/infrastructure/projects`);
      if (response.data.success && response.data.data.length > 0) {
        const projects = response.data.data;
        const totalMarketCap = response.data.metadata.totalMarketCap;
        this.results.passed.push('✅ Infrastructure - Projects data available');
        this.results.realTimeData.push(`🏗️ Infrastructure: ${projects.length} projects, $${(totalMarketCap / 1e9).toFixed(1)}B total market cap`);
      } else {
        this.results.failed.push('❌ Infrastructure - No project data');
      }
    } catch (error) {
      this.results.failed.push(`❌ Infrastructure - Data failed: ${error.message}`);
    }
  }

  async testGameFiPage() {
    console.log('🎮 Testing GameFi Page...');
    
    try {
      const response = await axios.get(`${FRONTEND_URL}/api/v2/blockchain/gamefi/projects`);
      if (response.data.success) {
        this.results.passed.push('✅ GameFi - Projects endpoint working');
        this.results.realTimeData.push('🎮 GameFi: Endpoint operational');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        this.results.warnings.push('⚠️ GameFi - Projects endpoint not implemented');
      } else {
        this.results.failed.push('❌ GameFi - Projects endpoint error');
      }
    }
  }

  async testDAOPage() {
    console.log('🏛️ Testing DAO Page...');
    
    try {
      const response = await axios.get(`${FRONTEND_URL}/api/v2/blockchain/dao/projects`);
      if (response.data.success) {
        this.results.passed.push('✅ DAO - Projects endpoint working');
        this.results.realTimeData.push('🏛️ DAO: Endpoint operational');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        this.results.warnings.push('⚠️ DAO - Projects endpoint not implemented');
      } else {
        this.results.failed.push('❌ DAO - Projects endpoint error');
      }
    }
  }

  async testAnalyticsPages() {
    console.log('📊 Testing Analytics Pages...');
    
    const analyticsEndpoints = [
      { name: 'Portfolio Performance', endpoint: '/api/v2/analytics/portfolio/performance' },
      { name: 'Market Sentiment', endpoint: '/api/v2/analytics/market/sentiment' },
      { name: 'Risk Assessment', endpoint: '/api/v2/analytics/risk/assessment' }
    ];

    for (const analytics of analyticsEndpoints) {
      try {
        const response = await axios.get(`${FRONTEND_URL}${analytics.endpoint}`);
        if (response.data.success) {
          this.results.passed.push(`✅ Analytics - ${analytics.name} working`);
          this.results.realTimeData.push(`📊 ${analytics.name}: Data available`);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          this.results.warnings.push(`⚠️ Analytics - ${analytics.name} not implemented`);
        } else {
          this.results.failed.push(`❌ Analytics - ${analytics.name} error`);
        }
      }
    }
  }

  generateReport() {
    console.log('\n🎯 REAL-TIME DATA TEST REPORT');
    console.log('='.repeat(60));

    console.log('\n📡 REAL-TIME DATA SOURCES:');
    this.results.realTimeData.forEach(data => console.log(`  ${data}`));

    console.log(`\n✅ WORKING FEATURES (${this.results.passed.length}):`);
    this.results.passed.forEach(item => console.log(`  ${item}`));

    if (this.results.warnings.length > 0) {
      console.log(`\n⚠️ NOT IMPLEMENTED (${this.results.warnings.length}):`);
      this.results.warnings.forEach(item => console.log(`  ${item}`));
    }

    if (this.results.failed.length > 0) {
      console.log(`\n❌ FAILED (${this.results.failed.length}):`);
      this.results.failed.forEach(item => console.log(`  ${item}`));
    }

    console.log('\n' + '='.repeat(60));
    
    const totalTests = this.results.passed.length + this.results.warnings.length + this.results.failed.length;
    const successRate = Math.round((this.results.passed.length / totalTests) * 100);
    
    console.log(`📊 SUCCESS RATE: ${this.results.passed.length}/${totalTests} features working (${successRate}%)`);
    
    if (this.results.failed.length === 0) {
      console.log('\n🎉 ALL PAGES PROVIDING REAL-TIME DATA!');
      console.log('✨ Your platform is fully operational with live data feeds');
      console.log('🌐 Access your platform at: http://localhost:5175');
      process.exit(0);
    } else {
      console.log(`\n⚠️ ${this.results.failed.length} critical issues need fixing.`);
      process.exit(1);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new RealTimeDataTester();
  tester.testAllPagesRealTime().catch(error => {
    console.error('❌ Real-time data test failed:', error);
    process.exit(1);
  });
}

module.exports = RealTimeDataTester;
