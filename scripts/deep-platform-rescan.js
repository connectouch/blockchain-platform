#!/usr/bin/env node

/**
 * Deep Platform Re-scan and Issue Detection System
 * Comprehensive analysis to identify any remaining issues
 */

const axios = require('axios');
const fs = require('fs').promises;

const FRONTEND_URL = 'http://localhost:5175';

class DeepPlatformRescan {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.recommendations = [];
    this.scanResults = {
      apiEndpoints: {},
      frontendPages: {},
      performance: {},
      security: {},
      dataIntegrity: {},
      errorHandling: {},
      userExperience: {}
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addIssue(category, severity, description, recommendation = '') {
    this.issues.push({
      category,
      severity,
      description,
      recommendation,
      timestamp: new Date().toISOString()
    });
  }

  addWarning(category, description, recommendation = '') {
    this.warnings.push({
      category,
      description,
      recommendation,
      timestamp: new Date().toISOString()
    });
  }

  async performDeepScan() {
    console.log('🔍 DEEP PLATFORM RE-SCAN AND ISSUE DETECTION');
    console.log('='.repeat(70));
    
    // Phase 1: API Endpoint Deep Analysis
    await this.deepScanAPIEndpoints();
    
    // Phase 2: Frontend Deep Analysis
    await this.deepScanFrontendPages();
    
    // Phase 3: Performance Analysis
    await this.analyzePerformance();
    
    // Phase 4: Security Scan
    await this.performSecurityScan();
    
    // Phase 5: Data Integrity Check
    await this.checkDataIntegrity();
    
    // Phase 6: Error Handling Validation
    await this.validateErrorHandling();
    
    // Phase 7: User Experience Analysis
    await this.analyzeUserExperience();
    
    // Generate comprehensive report
    await this.generateIssueReport();
  }

  async deepScanAPIEndpoints() {
    this.log('🔍 Phase 1: Deep API Endpoint Analysis...');
    
    const endpoints = [
      { path: '/api/v2/blockchain/overview', name: 'Blockchain Overview', critical: true },
      { path: '/api/v2/blockchain/infrastructure/projects', name: 'Infrastructure Projects', critical: true },
      { path: '/api/v2/blockchain/defi/protocols', name: 'DeFi Protocols', critical: true },
      { path: '/api/v2/blockchain/gamefi/projects', name: 'GameFi Projects', critical: true },
      { path: '/api/v2/blockchain/dao/projects', name: 'DAO Projects', critical: true },
      { path: '/api/v2/blockchain/nft/collections', name: 'NFT Collections', critical: true },
      { path: '/api/v2/blockchain/tools/list', name: 'Web3 Tools', critical: true },
      { path: '/api/v2/blockchain/market/overview', name: 'Market Overview', critical: true },
      { path: '/api/v2/blockchain/prices/live', name: 'Live Prices', critical: true },
      { path: '/api/v2/blockchain/status', name: 'Blockchain Status', critical: false },
      { path: '/health', name: 'Health Check', critical: true }
    ];

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${FRONTEND_URL}${endpoint.path}`, {
          timeout: 15000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Deep-Platform-Scanner/1.0'
          }
        });
        const responseTime = Date.now() - startTime;

        // Deep analysis of response
        const analysis = await this.analyzeAPIResponse(endpoint, response, responseTime);
        this.scanResults.apiEndpoints[endpoint.name] = analysis;

        if (analysis.issues.length > 0) {
          analysis.issues.forEach(issue => {
            this.addIssue('API', issue.severity, `${endpoint.name}: ${issue.description}`, issue.recommendation);
          });
        }

        if (analysis.warnings.length > 0) {
          analysis.warnings.forEach(warning => {
            this.addWarning('API', `${endpoint.name}: ${warning.description}`, warning.recommendation);
          });
        }

      } catch (error) {
        this.addIssue('API', 'Critical', `${endpoint.name} failed: ${error.message}`, 'Check backend service and network connectivity');
        this.scanResults.apiEndpoints[endpoint.name] = {
          status: 'failed',
          error: error.message,
          critical: endpoint.critical
        };
      }
    }
  }

  async analyzeAPIResponse(endpoint, response, responseTime) {
    const analysis = {
      status: 'success',
      responseTime: `${responseTime}ms`,
      statusCode: response.status,
      issues: [],
      warnings: [],
      dataQuality: 'unknown'
    };

    // Check response time
    if (responseTime > 2000) {
      analysis.issues.push({
        severity: 'High',
        description: `Slow response time: ${responseTime}ms`,
        recommendation: 'Optimize database queries and add caching'
      });
    } else if (responseTime > 1000) {
      analysis.warnings.push({
        description: `Moderate response time: ${responseTime}ms`,
        recommendation: 'Consider performance optimization'
      });
    }

    // Check response structure
    const data = response.data;
    if (!data.success) {
      analysis.issues.push({
        severity: 'Medium',
        description: 'Response missing standard success field',
        recommendation: 'Standardize API response format'
      });
    }

    // Check data content
    if (data.data) {
      if (Array.isArray(data.data)) {
        if (data.data.length === 0) {
          analysis.warnings.push({
            description: 'Empty data array returned',
            recommendation: 'Verify data source and population'
          });
        } else {
          // Check data consistency
          const firstItem = data.data[0];
          const requiredFields = this.getRequiredFields(endpoint.path);
          
          for (const field of requiredFields) {
            if (firstItem[field] === undefined || firstItem[field] === null) {
              analysis.issues.push({
                severity: 'Medium',
                description: `Missing required field: ${field}`,
                recommendation: `Add ${field} field to data structure`
              });
            }
          }
        }
        analysis.dataQuality = 'good';
      } else if (typeof data.data === 'object') {
        analysis.dataQuality = 'good';
      }
    } else {
      analysis.warnings.push({
        description: 'No data field in response',
        recommendation: 'Ensure response includes data field'
      });
    }

    return analysis;
  }

  getRequiredFields(path) {
    const fieldMap = {
      '/api/v2/blockchain/infrastructure/projects': ['name', 'marketCap', 'tps', 'tvl', 'gasPrice', 'validators'],
      '/api/v2/blockchain/defi/protocols': ['name', 'tvl', 'apy'],
      '/api/v2/blockchain/gamefi/projects': ['name', 'players', 'marketCap'],
      '/api/v2/blockchain/dao/projects': ['name', 'treasuryValue', 'members'],
      '/api/v2/blockchain/nft/collections': ['name', 'floorPrice', 'volume'],
      '/api/v2/blockchain/tools/list': ['name', 'category', 'users']
    };
    return fieldMap[path] || [];
  }

  async deepScanFrontendPages() {
    this.log('🔍 Phase 2: Deep Frontend Analysis...');
    
    const pages = [
      { path: '/', name: 'Dashboard', critical: true },
      { path: '/defi', name: 'DeFi Page', critical: true },
      { path: '/infrastructure', name: 'Infrastructure Page', critical: true },
      { path: '/gamefi', name: 'GameFi Page', critical: true },
      { path: '/nft', name: 'NFT Page', critical: true },
      { path: '/dao', name: 'DAO Page', critical: true },
      { path: '/tools', name: 'Web3 Tools Page', critical: true }
    ];

    for (const page of pages) {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${FRONTEND_URL}${page.path}`, {
          timeout: 20000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        const loadTime = Date.now() - startTime;

        const analysis = await this.analyzeFrontendPage(page, response, loadTime);
        this.scanResults.frontendPages[page.name] = analysis;

        if (analysis.issues.length > 0) {
          analysis.issues.forEach(issue => {
            this.addIssue('Frontend', issue.severity, `${page.name}: ${issue.description}`, issue.recommendation);
          });
        }

      } catch (error) {
        this.addIssue('Frontend', 'Critical', `${page.name} failed to load: ${error.message}`, 'Check frontend build and server configuration');
      }
    }
  }

  async analyzeFrontendPage(page, response, loadTime) {
    const analysis = {
      status: 'success',
      loadTime: `${loadTime}ms`,
      issues: [],
      warnings: [],
      contentAnalysis: {}
    };

    const html = response.data;

    // Check for error boundaries
    if (html.includes('Something went wrong')) {
      analysis.issues.push({
        severity: 'Critical',
        description: 'Error boundary detected',
        recommendation: 'Fix JavaScript errors causing component crashes'
      });
    }

    // Check load time
    if (loadTime > 5000) {
      analysis.issues.push({
        severity: 'High',
        description: `Very slow page load: ${loadTime}ms`,
        recommendation: 'Optimize bundle size and implement code splitting'
      });
    } else if (loadTime > 2000) {
      analysis.warnings.push({
        description: `Slow page load: ${loadTime}ms`,
        recommendation: 'Consider performance optimization'
      });
    }

    // Check for console errors (basic detection)
    if (html.includes('console.error') || html.includes('Uncaught')) {
      analysis.issues.push({
        severity: 'Medium',
        description: 'Potential JavaScript errors detected',
        recommendation: 'Check browser console for specific errors'
      });
    }

    // Check for accessibility issues
    if (!html.includes('alt=') && html.includes('<img')) {
      analysis.warnings.push({
        description: 'Images without alt attributes detected',
        recommendation: 'Add alt attributes for accessibility'
      });
    }

    return analysis;
  }

  async analyzePerformance() {
    this.log('🔍 Phase 3: Performance Analysis...');
    
    // Test multiple requests to check consistency
    const performanceTests = [];
    const testEndpoint = '/api/v2/blockchain/infrastructure/projects';
    
    for (let i = 0; i < 5; i++) {
      try {
        const startTime = Date.now();
        await axios.get(`${FRONTEND_URL}${testEndpoint}`);
        const responseTime = Date.now() - startTime;
        performanceTests.push(responseTime);
      } catch (error) {
        // Skip failed requests
      }
    }

    if (performanceTests.length > 0) {
      const avgTime = performanceTests.reduce((sum, time) => sum + time, 0) / performanceTests.length;
      const maxTime = Math.max(...performanceTests);
      const minTime = Math.min(...performanceTests);
      const variance = Math.max(...performanceTests) - Math.min(...performanceTests);

      this.scanResults.performance = {
        averageResponseTime: `${avgTime.toFixed(0)}ms`,
        maxResponseTime: `${maxTime}ms`,
        minResponseTime: `${minTime}ms`,
        variance: `${variance}ms`,
        consistency: variance < 500 ? 'Good' : 'Poor'
      };

      if (variance > 1000) {
        this.addIssue('Performance', 'Medium', `High response time variance: ${variance}ms`, 'Investigate server load and optimize database queries');
      }

      if (avgTime > 1000) {
        this.addIssue('Performance', 'High', `Slow average response time: ${avgTime.toFixed(0)}ms`, 'Implement caching and optimize API endpoints');
      }
    }
  }

  async performSecurityScan() {
    this.log('🔍 Phase 4: Security Scan...');
    
    // Check for common security headers
    try {
      const response = await axios.get(`${FRONTEND_URL}/health`);
      const headers = response.headers;

      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'strict-transport-security'
      ];

      securityHeaders.forEach(header => {
        if (!headers[header]) {
          this.addWarning('Security', `Missing security header: ${header}`, 'Add security headers for production deployment');
        }
      });

      // Check for CORS configuration
      if (headers['access-control-allow-origin'] === '*') {
        this.addWarning('Security', 'Permissive CORS policy detected', 'Restrict CORS to specific domains in production');
      }

    } catch (error) {
      this.addIssue('Security', 'Medium', 'Unable to perform security header check', 'Ensure security headers are configured');
    }
  }

  async checkDataIntegrity() {
    this.log('🔍 Phase 5: Data Integrity Check...');
    
    // Test data consistency across multiple calls
    try {
      const response1 = await axios.get(`${FRONTEND_URL}/api/v2/blockchain/infrastructure/projects`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      const response2 = await axios.get(`${FRONTEND_URL}/api/v2/blockchain/infrastructure/projects`);

      if (JSON.stringify(response1.data) !== JSON.stringify(response2.data)) {
        this.addWarning('Data Integrity', 'Data inconsistency detected between requests', 'Implement proper caching or data versioning');
      }

      // Check for data validation
      const data = response1.data.data;
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        
        // Check for reasonable data ranges
        if (item.marketCap && (item.marketCap < 0 || item.marketCap > 1e15)) {
          this.addWarning('Data Integrity', 'Unrealistic market cap values detected', 'Validate data ranges and sources');
        }
        
        if (item.tps && (item.tps < 0 || item.tps > 1000000)) {
          this.addWarning('Data Integrity', 'Unrealistic TPS values detected', 'Validate transaction per second data');
        }
      }

    } catch (error) {
      this.addIssue('Data Integrity', 'Medium', 'Unable to perform data integrity check', 'Ensure API endpoints are accessible');
    }
  }

  async validateErrorHandling() {
    this.log('🔍 Phase 6: Error Handling Validation...');
    
    // Test invalid endpoints
    try {
      await axios.get(`${FRONTEND_URL}/api/v2/blockchain/nonexistent`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Good - proper 404 handling
      } else {
        this.addWarning('Error Handling', 'Unexpected error response for invalid endpoint', 'Implement proper 404 error handling');
      }
    }

    // Test malformed requests
    try {
      await axios.post(`${FRONTEND_URL}/api/v2/blockchain/overview`, { invalid: 'data' });
    } catch (error) {
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        // Good - proper error handling
      } else {
        this.addWarning('Error Handling', 'Unexpected error response for malformed request', 'Implement proper request validation');
      }
    }
  }

  async analyzeUserExperience() {
    this.log('🔍 Phase 7: User Experience Analysis...');
    
    // Check for loading states and user feedback
    const pages = ['/', '/defi', '/infrastructure'];
    
    for (const page of pages) {
      try {
        const response = await axios.get(`${FRONTEND_URL}${page}`);
        const html = response.data;
        
        // Check for loading indicators
        if (!html.includes('loading') && !html.includes('spinner') && !html.includes('skeleton')) {
          this.addWarning('User Experience', `${page}: No loading indicators detected`, 'Add loading states for better user experience');
        }
        
        // Check for error states
        if (!html.includes('error') && !html.includes('retry')) {
          this.addWarning('User Experience', `${page}: No error state handling detected`, 'Add error states and retry mechanisms');
        }
        
      } catch (error) {
        // Skip failed requests
      }
    }
  }

  async generateIssueReport() {
    console.log('\n📋 DEEP SCAN ISSUE REPORT');
    console.log('='.repeat(50));
    
    // Summary
    console.log(`\n📊 SCAN SUMMARY:`);
    console.log(`   Critical Issues: ${this.issues.filter(i => i.severity === 'Critical').length}`);
    console.log(`   High Priority Issues: ${this.issues.filter(i => i.severity === 'High').length}`);
    console.log(`   Medium Priority Issues: ${this.issues.filter(i => i.severity === 'Medium').length}`);
    console.log(`   Warnings: ${this.warnings.length}`);
    
    // Critical Issues
    const criticalIssues = this.issues.filter(i => i.severity === 'Critical');
    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      criticalIssues.forEach(issue => {
        console.log(`   ❌ [${issue.category}] ${issue.description}`);
        if (issue.recommendation) console.log(`      💡 ${issue.recommendation}`);
      });
    }
    
    // High Priority Issues
    const highIssues = this.issues.filter(i => i.severity === 'High');
    if (highIssues.length > 0) {
      console.log('\n🔴 HIGH PRIORITY ISSUES:');
      highIssues.forEach(issue => {
        console.log(`   ⚠️ [${issue.category}] ${issue.description}`);
        if (issue.recommendation) console.log(`      💡 ${issue.recommendation}`);
      });
    }
    
    // Medium Priority Issues
    const mediumIssues = this.issues.filter(i => i.severity === 'Medium');
    if (mediumIssues.length > 0) {
      console.log('\n🟡 MEDIUM PRIORITY ISSUES:');
      mediumIssues.forEach(issue => {
        console.log(`   ⚠️ [${issue.category}] ${issue.description}`);
        if (issue.recommendation) console.log(`      💡 ${issue.recommendation}`);
      });
    }
    
    // Warnings
    if (this.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      this.warnings.forEach(warning => {
        console.log(`   🟠 [${warning.category}] ${warning.description}`);
        if (warning.recommendation) console.log(`      💡 ${warning.recommendation}`);
      });
    }
    
    // Overall Assessment
    console.log('\n🎯 OVERALL ASSESSMENT:');
    if (criticalIssues.length === 0 && highIssues.length === 0) {
      console.log('   ✅ Platform is in excellent condition');
      console.log('   ✅ No critical or high-priority issues detected');
      if (mediumIssues.length === 0 && this.warnings.length === 0) {
        console.log('   🏆 Platform is operating at optimal level');
      }
    } else {
      console.log('   ⚠️ Platform has issues that need attention');
      console.log('   🔧 Recommended to address critical and high-priority issues first');
    }
    
    // Save detailed report
    try {
      const report = {
        summary: {
          criticalIssues: criticalIssues.length,
          highIssues: highIssues.length,
          mediumIssues: mediumIssues.length,
          warnings: this.warnings.length,
          scanTimestamp: new Date().toISOString()
        },
        issues: this.issues,
        warnings: this.warnings,
        scanResults: this.scanResults
      };
      
      await fs.writeFile(
        'deep-platform-rescan-report.json',
        JSON.stringify(report, null, 2),
        'utf8'
      );
      console.log('\n💾 Detailed scan report saved to: deep-platform-rescan-report.json');
    } catch (error) {
      console.log(`\n⚠️ Could not save scan report: ${error.message}`);
    }
  }
}

// Run deep platform re-scan
const scanner = new DeepPlatformRescan();
scanner.performDeepScan().catch(console.error);
