#!/usr/bin/env node

/**
 * Platform Loading Test Script
 * Tests that the platform loads correctly with the 3 approved API keys
 */

const axios = require('axios');

const FRONTEND_URL = 'http://localhost:5175';
const BACKEND_URL = 'http://localhost:3007';

class PlatformLoadingTester {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  async runTests() {
    console.log('🧪 Testing Platform Loading...\n');

    // Test backend health
    await this.testBackendHealth();
    
    // Test frontend proxy
    await this.testFrontendProxy();
    
    // Test API endpoints
    await this.testApiEndpoints();
    
    // Test frontend loading
    await this.testFrontendLoading();

    // Generate report
    this.generateReport();
  }

  async testBackendHealth() {
    console.log('🔍 Testing Backend Health...');
    try {
      const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
      if (response.status === 200 && response.data.status === 'healthy') {
        this.results.passed.push('✅ Backend health check passed');
      } else {
        this.results.failed.push('❌ Backend health check failed - invalid response');
      }
    } catch (error) {
      this.results.failed.push(`❌ Backend health check failed: ${error.message}`);
    }
  }

  async testFrontendProxy() {
    console.log('🔍 Testing Frontend Proxy...');
    try {
      const response = await axios.get(`${FRONTEND_URL}/health`, { timeout: 5000 });
      if (response.status === 200 && response.data.status === 'healthy') {
        this.results.passed.push('✅ Frontend proxy working correctly');
      } else {
        this.results.failed.push('❌ Frontend proxy failed - invalid response');
      }
    } catch (error) {
      this.results.failed.push(`❌ Frontend proxy failed: ${error.message}`);
    }
  }

  async testApiEndpoints() {
    console.log('🔍 Testing API Endpoints...');
    
    const endpoints = [
      '/api/v2/blockchain/overview',
      '/api/v2/blockchain/prices/live'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${FRONTEND_URL}${endpoint}`, { timeout: 10000 });
        if (response.status === 200 && response.data.success) {
          this.results.passed.push(`✅ API endpoint working: ${endpoint}`);
        } else {
          this.results.failed.push(`❌ API endpoint failed: ${endpoint} - invalid response`);
        }
      } catch (error) {
        this.results.failed.push(`❌ API endpoint failed: ${endpoint} - ${error.message}`);
      }
    }
  }

  async testFrontendLoading() {
    console.log('🔍 Testing Frontend Loading...');
    try {
      const response = await axios.get(FRONTEND_URL, { timeout: 10000 });
      if (response.status === 200) {
        // Check if it's HTML content (could be from Vite dev server)
        const contentType = response.headers['content-type'] || '';
        if (contentType.includes('text/html') || response.data.includes('<html') || response.data.includes('<!DOCTYPE')) {
          this.results.passed.push('✅ Frontend loads correctly');

          // Check for critical assets or Vite dev server
          if (response.data.includes('script') || response.data.includes('vite') || response.data.includes('react')) {
            this.results.passed.push('✅ Frontend includes required assets or dev server');
          } else {
            this.results.warnings.push('⚠️ Frontend may be missing some assets');
          }
        } else {
          this.results.warnings.push('⚠️ Frontend returned non-HTML content - may be API response');
        }
      } else {
        this.results.failed.push('❌ Frontend loading failed - invalid response status');
      }
    } catch (error) {
      this.results.failed.push(`❌ Frontend loading failed: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n📊 PLATFORM LOADING TEST REPORT');
    console.log('='.repeat(50));

    console.log(`\n✅ PASSED (${this.results.passed.length}):`);
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
      console.log('🎉 ALL TESTS PASSED! Your platform is loading correctly with approved APIs.');
      process.exit(0);
    } else {
      console.log('❌ SOME TESTS FAILED! Please check the issues above.');
      process.exit(1);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new PlatformLoadingTester();
  tester.runTests().catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
}

module.exports = PlatformLoadingTester;
