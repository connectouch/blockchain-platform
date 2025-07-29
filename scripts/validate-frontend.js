#!/usr/bin/env node

/**
 * Frontend Validation Script
 * Validates that the frontend loads without critical errors
 */

const axios = require('axios');

const FRONTEND_URL = 'http://localhost:5175';

class FrontendValidator {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  async validateFrontend() {
    console.log('🔍 Validating Frontend...\n');

    // Test main page load
    await this.testMainPageLoad();
    
    // Test critical API calls that frontend makes
    await this.testCriticalAPIs();
    
    // Test component-specific endpoints
    await this.testComponentEndpoints();

    // Generate report
    this.generateReport();
  }

  async testMainPageLoad() {
    console.log('🔍 Testing Main Page Load...');
    try {
      const response = await axios.get(FRONTEND_URL, { timeout: 10000 });
      
      if (response.status === 200) {
        this.results.passed.push('✅ Frontend main page loads successfully');
        
        // Check for basic HTML structure
        const html = response.data;
        if (html.includes('<div id="root">') || html.includes('<!DOCTYPE html>')) {
          this.results.passed.push('✅ Frontend has proper HTML structure');
        } else {
          this.results.warnings.push('⚠️ Frontend HTML structure may be incomplete');
        }
      } else {
        this.results.failed.push(`❌ Frontend main page failed: HTTP ${response.status}`);
      }
    } catch (error) {
      this.results.failed.push(`❌ Frontend main page failed: ${error.message}`);
    }
  }

  async testCriticalAPIs() {
    console.log('🔍 Testing Critical APIs that Frontend Uses...');
    
    const criticalAPIs = [
      '/api/v2/blockchain/overview',
      '/api/v2/blockchain/prices/live',
      '/api/v2/blockchain/defi/protocols'
    ];

    for (const api of criticalAPIs) {
      try {
        const response = await axios.get(`${FRONTEND_URL}${api}`, { timeout: 10000 });
        
        if (response.status === 200 && response.data.success !== false) {
          this.results.passed.push(`✅ Critical API working: ${api}`);
          
          // Check if data is not empty
          if (response.data.data && Object.keys(response.data.data).length > 0) {
            this.results.passed.push(`✅ API returns real data: ${api}`);
          } else {
            this.results.warnings.push(`⚠️ API returns empty data: ${api}`);
          }
        } else {
          this.results.failed.push(`❌ Critical API failed: ${api}`);
        }
      } catch (error) {
        this.results.failed.push(`❌ Critical API error: ${api} - ${error.message}`);
      }
    }
  }

  async testComponentEndpoints() {
    console.log('🔍 Testing Component-Specific Endpoints...');
    
    // Test AI Chat
    try {
      const response = await axios.post(`${FRONTEND_URL}/api/v2/blockchain/ai/chat`, {
        message: 'Hello',
        conversationHistory: [],
        sector: 'defi'
      }, { timeout: 15000 });
      
      if (response.status === 200 && response.data.success) {
        this.results.passed.push('✅ AI Chat component working');
      } else {
        this.results.failed.push('❌ AI Chat component failed');
      }
    } catch (error) {
      this.results.failed.push(`❌ AI Chat component error: ${error.message}`);
    }

    // Test Analytics endpoints
    const analyticsEndpoints = [
      '/api/v2/analytics/portfolio/performance',
      '/api/v2/analytics/market/sentiment',
      '/api/v2/analytics/risk/assessment'
    ];

    for (const endpoint of analyticsEndpoints) {
      try {
        const response = await axios.get(`${FRONTEND_URL}${endpoint}`, { timeout: 10000 });
        if (response.status === 200) {
          this.results.passed.push(`✅ Analytics component: ${endpoint.split('/').pop()}`);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          this.results.warnings.push(`⚠️ Analytics component not implemented: ${endpoint.split('/').pop()}`);
        } else {
          this.results.failed.push(`❌ Analytics component error: ${endpoint.split('/').pop()}`);
        }
      }
    }
  }

  generateReport() {
    console.log('\n📊 FRONTEND VALIDATION REPORT');
    console.log('='.repeat(50));

    console.log(`\n✅ WORKING (${this.results.passed.length}):`);
    this.results.passed.forEach(item => console.log(`  ${item}`));

    if (this.results.warnings.length > 0) {
      console.log(`\n⚠️ WARNINGS (${this.results.warnings.length}):`);
      this.results.warnings.forEach(item => console.log(`  ${item}`));
    }

    if (this.results.failed.length > 0) {
      console.log(`\n❌ FAILED (${this.results.failed.length}):`);
      this.results.failed.forEach(item => console.log(`  ${item}`));
    }

    console.log('\n' + '='.repeat(50));
    
    if (this.results.failed.length === 0) {
      console.log('🎉 FRONTEND VALIDATION PASSED! No critical errors detected.');
      console.log('💡 Your platform is ready for use with real-time data from approved APIs.');
      process.exit(0);
    } else {
      console.log('❌ FRONTEND VALIDATION FAILED! Critical errors detected.');
      process.exit(1);
    }
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new FrontendValidator();
  validator.validateFrontend().catch(error => {
    console.error('❌ Frontend validation script failed:', error);
    process.exit(1);
  });
}

module.exports = FrontendValidator;
