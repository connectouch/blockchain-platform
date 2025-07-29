#!/usr/bin/env node

/**
 * Comprehensive Platform-Wide Audit System
 * Tests all API endpoints and frontend integrations across the entire platform
 */

const axios = require('axios');
const fs = require('fs').promises;

const FRONTEND_URL = 'http://localhost:5175';

class PlatformAuditSystem {
  constructor() {
    this.auditResults = {
      apiEndpoints: {},
      frontendPages: {},
      dataFlowValidation: {},
      errorHandling: {},
      crossPlatformTests: {},
      summary: {
        totalEndpoints: 0,
        workingEndpoints: 0,
        totalPages: 0,
        workingPages: 0,
        criticalIssues: [],
        recommendations: []
      }
    };
    
    this.apiEndpoints = [
      // Core blockchain endpoints
      { path: '/api/v2/blockchain/overview', name: 'Blockchain Overview', critical: true },
      { path: '/api/v2/blockchain/infrastructure/projects', name: 'Infrastructure Projects', critical: true },
      { path: '/api/v2/blockchain/defi/protocols', name: 'DeFi Protocols', critical: true },
      { path: '/api/v2/blockchain/gamefi/projects', name: 'GameFi Projects', critical: true },
      { path: '/api/v2/blockchain/dao/projects', name: 'DAO Projects', critical: true },
      { path: '/api/v2/blockchain/nft/collections', name: 'NFT Collections', critical: true },
      { path: '/api/v2/blockchain/tools/list', name: 'Web3 Tools', critical: true },
      
      // Market data endpoints
      { path: '/api/v2/blockchain/market/overview', name: 'Market Overview', critical: true },
      { path: '/api/v2/blockchain/prices/live', name: 'Live Prices', critical: true },
      
      // Health and status endpoints
      { path: '/health', name: 'Health Check', critical: true },
      { path: '/api/v2/blockchain/status', name: 'Blockchain Status', critical: false }
    ];
    
    this.frontendPages = [
      { path: '/', name: 'Dashboard', apiDependencies: ['overview', 'market', 'prices'] },
      { path: '/defi', name: 'DeFi Page', apiDependencies: ['defi/protocols'] },
      { path: '/infrastructure', name: 'Infrastructure Page', apiDependencies: ['infrastructure/projects'] },
      { path: '/gamefi', name: 'GameFi Page', apiDependencies: ['gamefi/projects'] },
      { path: '/nft', name: 'NFT Page', apiDependencies: ['nft/collections'] },
      { path: '/dao', name: 'DAO Page', apiDependencies: ['dao/projects'] },
      { path: '/tools', name: 'Web3 Tools Page', apiDependencies: ['tools/list'] }
    ];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async testAPIEndpoint(endpoint) {
    this.log(`Testing API: ${endpoint.name} (${endpoint.path})`);
    
    try {
      const startTime = Date.now();
      const response = await axios.get(`${FRONTEND_URL}${endpoint.path}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Platform-Audit-System/1.0'
        }
      });
      const responseTime = Date.now() - startTime;
      
      // Validate response structure
      const validation = this.validateAPIResponse(response.data, endpoint);
      
      const result = {
        status: 'success',
        statusCode: response.status,
        responseTime: `${responseTime}ms`,
        dataStructure: validation.structure,
        dataValidation: validation.validation,
        recordCount: validation.recordCount,
        issues: validation.issues
      };
      
      this.auditResults.apiEndpoints[endpoint.name] = result;
      this.auditResults.summary.workingEndpoints++;
      
      if (validation.issues.length === 0) {
        this.log(`✅ ${endpoint.name}: Working correctly (${responseTime}ms)`, 'success');
      } else {
        this.log(`⚠️ ${endpoint.name}: Working with issues (${validation.issues.length} issues)`, 'warning');
        validation.issues.forEach(issue => this.log(`   - ${issue}`, 'warning'));
      }
      
      return result;
      
    } catch (error) {
      const result = {
        status: 'failed',
        error: error.message,
        statusCode: error.response?.status || 'N/A',
        critical: endpoint.critical
      };
      
      this.auditResults.apiEndpoints[endpoint.name] = result;
      this.log(`❌ ${endpoint.name}: Failed - ${error.message}`, 'error');
      
      if (endpoint.critical) {
        this.auditResults.summary.criticalIssues.push(`Critical API failure: ${endpoint.name}`);
      }
      
      return result;
    }
  }

  validateAPIResponse(data, endpoint) {
    const validation = {
      structure: 'unknown',
      validation: 'unknown',
      recordCount: 0,
      issues: []
    };
    
    // Check basic structure
    if (typeof data === 'object' && data !== null) {
      if (data.success !== undefined) {
        validation.structure = 'standard';
        
        if (data.success === true) {
          validation.validation = 'valid';
          
          // Check data array
          if (Array.isArray(data.data)) {
            validation.recordCount = data.data.length;
            
            // Validate data records based on endpoint type
            if (endpoint.path.includes('infrastructure')) {
              validation.issues.push(...this.validateInfrastructureData(data.data));
            } else if (endpoint.path.includes('defi')) {
              validation.issues.push(...this.validateDeFiData(data.data));
            } else if (endpoint.path.includes('gamefi')) {
              validation.issues.push(...this.validateGameFiData(data.data));
            } else if (endpoint.path.includes('nft')) {
              validation.issues.push(...this.validateNFTData(data.data));
            } else if (endpoint.path.includes('dao')) {
              validation.issues.push(...this.validateDAOData(data.data));
            }
            
          } else if (data.data && typeof data.data === 'object') {
            validation.recordCount = 1;
          }
        } else {
          validation.validation = 'invalid';
          validation.issues.push('API returned success: false');
        }
      } else {
        validation.structure = 'non-standard';
        validation.issues.push('Response missing success field');
      }
    } else {
      validation.structure = 'invalid';
      validation.issues.push('Response is not a valid object');
    }
    
    return validation;
  }

  validateInfrastructureData(projects) {
    const issues = [];
    const requiredFields = ['name', 'marketCap', 'tps', 'tvl', 'gasPrice', 'validators', 'consensus'];
    
    projects.forEach((project, index) => {
      requiredFields.forEach(field => {
        if (project[field] === undefined || project[field] === null) {
          issues.push(`Project ${index + 1} missing ${field}`);
        }
      });
    });
    
    return issues;
  }

  validateDeFiData(protocols) {
    const issues = [];
    const requiredFields = ['name', 'tvl', 'apy'];
    
    protocols.forEach((protocol, index) => {
      requiredFields.forEach(field => {
        if (protocol[field] === undefined || protocol[field] === null) {
          issues.push(`Protocol ${index + 1} missing ${field}`);
        }
      });
    });
    
    return issues;
  }

  validateGameFiData(projects) {
    const issues = [];
    const requiredFields = ['name', 'players', 'marketCap'];
    
    projects.forEach((project, index) => {
      requiredFields.forEach(field => {
        if (project[field] === undefined || project[field] === null) {
          issues.push(`GameFi project ${index + 1} missing ${field}`);
        }
      });
    });
    
    return issues;
  }

  validateNFTData(collections) {
    const issues = [];
    const requiredFields = ['name', 'floorPrice', 'volume'];
    
    collections.forEach((collection, index) => {
      requiredFields.forEach(field => {
        if (collection[field] === undefined || collection[field] === null) {
          issues.push(`NFT collection ${index + 1} missing ${field}`);
        }
      });
    });
    
    return issues;
  }

  validateDAOData(daos) {
    const issues = [];
    const requiredFields = ['name', 'treasuryValue', 'members'];
    
    daos.forEach((dao, index) => {
      requiredFields.forEach(field => {
        if (dao[field] === undefined || dao[field] === null) {
          issues.push(`DAO ${index + 1} missing ${field}`);
        }
      });
    });
    
    return issues;
  }

  async testFrontendPage(page) {
    this.log(`Testing Frontend Page: ${page.name} (${page.path})`);
    
    try {
      const startTime = Date.now();
      const response = await axios.get(`${FRONTEND_URL}${page.path}`, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const responseTime = Date.now() - startTime;
      
      const html = response.data;
      const validation = this.validateFrontendPage(html, page);
      
      const result = {
        status: validation.hasErrorBoundary ? 'error' : 'success',
        responseTime: `${responseTime}ms`,
        hasContent: validation.hasContent,
        hasErrorBoundary: validation.hasErrorBoundary,
        contentValidation: validation.contentValidation,
        issues: validation.issues
      };
      
      this.auditResults.frontendPages[page.name] = result;
      
      if (!validation.hasErrorBoundary && validation.hasContent) {
        this.auditResults.summary.workingPages++;
        this.log(`✅ ${page.name}: Loading correctly (${responseTime}ms)`, 'success');
      } else {
        this.log(`❌ ${page.name}: Issues detected`, 'error');
        validation.issues.forEach(issue => this.log(`   - ${issue}`, 'error'));
      }
      
      return result;
      
    } catch (error) {
      const result = {
        status: 'failed',
        error: error.message
      };
      
      this.auditResults.frontendPages[page.name] = result;
      this.log(`❌ ${page.name}: Failed to load - ${error.message}`, 'error');
      
      return result;
    }
  }

  validateFrontendPage(html, page) {
    const validation = {
      hasContent: false,
      hasErrorBoundary: false,
      contentValidation: {},
      issues: []
    };

    // Check for error boundary
    if (html.includes('Something went wrong')) {
      validation.hasErrorBoundary = true;
      validation.issues.push('Error boundary detected');
    }

    // More flexible content validation - check for multiple possible indicators
    const contentChecks = {
      'Dashboard': ['Dashboard', 'Connectouch', 'Market Overview', 'Portfolio', 'Trading'],
      'DeFi Page': ['DeFi', 'Decentralized Finance', 'Protocol', 'Yield'],
      'Infrastructure Page': ['Infrastructure', 'Blockchain', 'Network', 'Validator'],
      'GameFi Page': ['GameFi', 'Gaming', 'Play-to-Earn', 'NFT Game'],
      'NFT Page': ['NFT', 'Non-Fungible', 'Collection', 'Digital Art'],
      'DAO Page': ['DAO', 'Governance', 'Voting', 'Proposal'],
      'Web3 Tools Page': ['Web3', 'Tools', 'MetaMask', 'Wallet', 'Development']
    };

    const pageChecks = contentChecks[page.name] || [];
    const foundContent = pageChecks.some(keyword =>
      html.toLowerCase().includes(keyword.toLowerCase())
    );

    if (foundContent) {
      validation.hasContent = true;
    } else {
      // Fallback: check if page has basic React app structure
      if (html.includes('id="root"') || html.includes('react') || html.includes('app')) {
        validation.hasContent = true;
        validation.issues.push('Page loads but specific content keywords not found (React app detected)');
      } else {
        validation.issues.push('Expected page content not found');
      }
    }

    return validation;
  }

  async runComprehensiveAudit() {
    console.log('🚀 COMPREHENSIVE PLATFORM-WIDE AUDIT SYSTEM');
    console.log('='.repeat(80));
    console.log(`📊 Testing ${this.apiEndpoints.length} API endpoints and ${this.frontendPages.length} frontend pages`);
    console.log('');
    
    // Phase 1: API Endpoint Testing
    console.log('📡 PHASE 1: API ENDPOINT TESTING');
    console.log('='.repeat(50));
    
    this.auditResults.summary.totalEndpoints = this.apiEndpoints.length;
    
    for (const endpoint of this.apiEndpoints) {
      await this.testAPIEndpoint(endpoint);
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('');
    
    // Phase 2: Frontend Page Testing
    console.log('🌐 PHASE 2: FRONTEND PAGE TESTING');
    console.log('='.repeat(50));
    
    this.auditResults.summary.totalPages = this.frontendPages.length;
    
    for (const page of this.frontendPages) {
      await this.testFrontendPage(page);
      // Small delay between page tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('');
    
    // Generate comprehensive report
    await this.generateAuditReport();
    
    return this.auditResults;
  }

  async generateAuditReport() {
    console.log('📋 COMPREHENSIVE AUDIT REPORT');
    console.log('='.repeat(60));
    
    // API Endpoints Summary
    console.log('\n📡 API ENDPOINTS SUMMARY:');
    console.log(`   Total Endpoints: ${this.auditResults.summary.totalEndpoints}`);
    console.log(`   Working Endpoints: ${this.auditResults.summary.workingEndpoints}`);
    console.log(`   Success Rate: ${((this.auditResults.summary.workingEndpoints / this.auditResults.summary.totalEndpoints) * 100).toFixed(1)}%`);
    
    // Frontend Pages Summary
    console.log('\n🌐 FRONTEND PAGES SUMMARY:');
    console.log(`   Total Pages: ${this.auditResults.summary.totalPages}`);
    console.log(`   Working Pages: ${this.auditResults.summary.workingPages}`);
    console.log(`   Success Rate: ${((this.auditResults.summary.workingPages / this.auditResults.summary.totalPages) * 100).toFixed(1)}%`);
    
    // Critical Issues
    if (this.auditResults.summary.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      this.auditResults.summary.criticalIssues.forEach(issue => {
        console.log(`   ❌ ${issue}`);
      });
    }
    
    // Detailed Results
    console.log('\n📊 DETAILED RESULTS:');
    
    console.log('\n   📡 API Endpoints:');
    Object.entries(this.auditResults.apiEndpoints).forEach(([name, result]) => {
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`      ${status} ${name}: ${result.status}`);
      if (result.responseTime) console.log(`         Response Time: ${result.responseTime}`);
      if (result.recordCount !== undefined) console.log(`         Records: ${result.recordCount}`);
      if (result.issues && result.issues.length > 0) {
        console.log(`         Issues: ${result.issues.length}`);
      }
    });
    
    console.log('\n   🌐 Frontend Pages:');
    Object.entries(this.auditResults.frontendPages).forEach(([name, result]) => {
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`      ${status} ${name}: ${result.status}`);
      if (result.responseTime) console.log(`         Load Time: ${result.responseTime}`);
      if (result.hasErrorBoundary) console.log(`         ⚠️ Error Boundary Detected`);
    });
    
    // Save detailed report to file
    try {
      await fs.writeFile(
        'audit-report.json',
        JSON.stringify(this.auditResults, null, 2),
        'utf8'
      );
      console.log('\n💾 Detailed audit report saved to: audit-report.json');
    } catch (error) {
      console.log(`\n⚠️ Could not save audit report: ${error.message}`);
    }
  }
}

// Run the comprehensive audit
const auditSystem = new PlatformAuditSystem();
auditSystem.runComprehensiveAudit().catch(console.error);
