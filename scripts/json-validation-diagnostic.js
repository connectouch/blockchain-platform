#!/usr/bin/env node

/**
 * JSON Validation and Diagnostic Tool
 * Identifies and fixes JSON parsing errors across the platform
 */

const axios = require('axios');
const fs = require('fs').promises;

const FRONTEND_URL = 'http://localhost:5175';

class JSONValidationDiagnostic {
  constructor() {
    this.issues = [];
    this.validEndpoints = [];
    this.invalidEndpoints = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async performJSONValidation() {
    console.log('🔍 JSON VALIDATION AND DIAGNOSTIC TOOL');
    console.log('='.repeat(70));
    
    // Test all API endpoints for JSON validity
    await this.validateAPIEndpoints();
    
    // Test frontend pages for JSON parsing errors
    await this.validateFrontendPages();
    
    // Generate diagnostic report
    await this.generateDiagnosticReport();
  }

  async validateAPIEndpoints() {
    this.log('🔍 Phase 1: API Endpoint JSON Validation...');
    
    const endpoints = [
      '/api/v2/blockchain/overview',
      '/api/v2/blockchain/infrastructure/projects',
      '/api/v2/blockchain/defi/protocols',
      '/api/v2/blockchain/gamefi/projects',
      '/api/v2/blockchain/dao/projects',
      '/api/v2/blockchain/nft/collections',
      '/api/v2/blockchain/tools/list',
      '/api/v2/blockchain/market/overview',
      '/api/v2/blockchain/prices/live',
      '/api/v2/blockchain/status',
      '/health'
    ];

    for (const endpoint of endpoints) {
      try {
        this.log(`Testing ${endpoint}...`);
        
        const response = await axios.get(`${FRONTEND_URL}${endpoint}`, {
          timeout: 10000,
          validateStatus: () => true, // Accept all status codes
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'JSON-Validator/1.0'
          }
        });

        const analysis = await this.analyzeResponse(endpoint, response);
        
        if (analysis.isValidJSON) {
          this.validEndpoints.push({
            endpoint,
            status: response.status,
            contentType: response.headers['content-type'],
            analysis
          });
          this.log(`✅ ${endpoint}: Valid JSON`, 'success');
        } else {
          this.invalidEndpoints.push({
            endpoint,
            status: response.status,
            contentType: response.headers['content-type'],
            analysis,
            rawResponse: response.data?.toString().substring(0, 500) + '...'
          });
          this.log(`❌ ${endpoint}: Invalid JSON - ${analysis.error}`, 'error');
        }

      } catch (error) {
        this.invalidEndpoints.push({
          endpoint,
          error: error.message,
          analysis: { isValidJSON: false, error: `Network error: ${error.message}` }
        });
        this.log(`❌ ${endpoint}: Network error - ${error.message}`, 'error');
      }
    }
  }

  async analyzeResponse(endpoint, response) {
    const analysis = {
      isValidJSON: false,
      hasCorrectContentType: false,
      hasSuccessField: false,
      statusCode: response.status,
      contentType: response.headers['content-type'],
      error: null,
      warnings: []
    };

    // Check Content-Type header
    const contentType = response.headers['content-type'] || '';
    analysis.hasCorrectContentType = contentType.includes('application/json');
    
    if (!analysis.hasCorrectContentType) {
      analysis.warnings.push(`Incorrect Content-Type: ${contentType}`);
    }

    // Try to parse JSON
    try {
      let jsonData;
      
      if (typeof response.data === 'string') {
        // Check for HTML content
        if (response.data.trim().startsWith('<')) {
          analysis.error = 'Response is HTML, not JSON';
          return analysis;
        }
        
        // Check for empty response
        if (!response.data.trim()) {
          analysis.error = 'Empty response';
          return analysis;
        }
        
        jsonData = JSON.parse(response.data);
      } else {
        jsonData = response.data;
      }

      analysis.isValidJSON = true;
      
      // Check for standard API response format
      if (jsonData.success !== undefined) {
        analysis.hasSuccessField = true;
      } else {
        analysis.warnings.push('Missing standard "success" field');
      }

      // Additional validation for specific endpoints
      if (endpoint.includes('/overview') && !jsonData.data) {
        analysis.warnings.push('Missing "data" field in overview response');
      }

      if (Array.isArray(jsonData.data) && jsonData.data.length === 0) {
        analysis.warnings.push('Empty data array');
      }

    } catch (parseError) {
      analysis.error = `JSON Parse Error: ${parseError.message}`;
      
      // Try to identify the specific issue
      const responseText = response.data?.toString() || '';
      if (responseText.includes('<!DOCTYPE html>')) {
        analysis.error = 'Response is HTML error page, not JSON';
      } else if (responseText.includes('Cannot GET')) {
        analysis.error = 'Express 404 error page returned instead of JSON';
      } else if (responseText.includes('Error:')) {
        analysis.error = 'Server error returned as text instead of JSON';
      }
    }

    return analysis;
  }

  async validateFrontendPages() {
    this.log('🔍 Phase 2: Frontend Page JSON Error Detection...');
    
    const pages = [
      { path: '/', name: 'Dashboard' },
      { path: '/defi', name: 'DeFi Page' },
      { path: '/infrastructure', name: 'Infrastructure Page' },
      { path: '/gamefi', name: 'GameFi Page' },
      { path: '/nft', name: 'NFT Page' },
      { path: '/dao', name: 'DAO Page' },
      { path: '/tools', name: 'Web3 Tools Page' }
    ];

    for (const page of pages) {
      try {
        this.log(`Testing ${page.name}...`);
        
        const response = await axios.get(`${FRONTEND_URL}${page.path}`, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const html = response.data;
        
        // Check for JavaScript errors in the HTML
        const hasJSErrors = this.checkForJavaScriptErrors(html);
        
        if (hasJSErrors.length > 0) {
          this.log(`⚠️ ${page.name}: Potential JS errors detected`, 'warning');
          hasJSErrors.forEach(error => {
            this.log(`   - ${error}`, 'warning');
          });
        } else {
          this.log(`✅ ${page.name}: No obvious JS errors`, 'success');
        }

      } catch (error) {
        this.log(`❌ ${page.name}: Failed to load - ${error.message}`, 'error');
      }
    }
  }

  checkForJavaScriptErrors(html) {
    const errors = [];
    
    // Check for common error patterns
    if (html.includes('SyntaxError')) {
      errors.push('SyntaxError detected in page');
    }
    
    if (html.includes('Unexpected token')) {
      errors.push('Unexpected token error detected');
    }
    
    if (html.includes('JSON.parse')) {
      errors.push('JSON parsing code detected - potential parsing issues');
    }
    
    if (html.includes('console.error')) {
      errors.push('Console errors detected');
    }
    
    return errors;
  }

  async generateDiagnosticReport() {
    console.log('\n📋 JSON VALIDATION DIAGNOSTIC REPORT');
    console.log('='.repeat(50));
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Valid JSON Endpoints: ${this.validEndpoints.length}`);
    console.log(`   Invalid JSON Endpoints: ${this.invalidEndpoints.length}`);
    console.log(`   Total Endpoints Tested: ${this.validEndpoints.length + this.invalidEndpoints.length}`);
    
    if (this.invalidEndpoints.length > 0) {
      console.log('\n❌ INVALID JSON ENDPOINTS:');
      this.invalidEndpoints.forEach(endpoint => {
        console.log(`\n   🔴 ${endpoint.endpoint}`);
        console.log(`      Status: ${endpoint.status || 'N/A'}`);
        console.log(`      Content-Type: ${endpoint.contentType || 'N/A'}`);
        console.log(`      Error: ${endpoint.analysis.error}`);
        
        if (endpoint.analysis.warnings?.length > 0) {
          console.log(`      Warnings:`);
          endpoint.analysis.warnings.forEach(warning => {
            console.log(`        - ${warning}`);
          });
        }
        
        if (endpoint.rawResponse) {
          console.log(`      Response Preview: ${endpoint.rawResponse}`);
        }
      });
    }
    
    if (this.validEndpoints.length > 0) {
      console.log('\n✅ VALID JSON ENDPOINTS:');
      this.validEndpoints.forEach(endpoint => {
        console.log(`   ✅ ${endpoint.endpoint} (${endpoint.status})`);
        if (endpoint.analysis.warnings?.length > 0) {
          endpoint.analysis.warnings.forEach(warning => {
            console.log(`      ⚠️ ${warning}`);
          });
        }
      });
    }
    
    // Generate recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (this.invalidEndpoints.length > 0) {
      console.log('   🔧 Fix invalid JSON endpoints:');
      this.invalidEndpoints.forEach(endpoint => {
        if (endpoint.analysis.error?.includes('HTML')) {
          console.log(`      - ${endpoint.endpoint}: Ensure error responses return JSON, not HTML`);
        } else if (endpoint.analysis.error?.includes('Parse Error')) {
          console.log(`      - ${endpoint.endpoint}: Fix JSON syntax errors`);
        } else if (endpoint.analysis.error?.includes('Empty')) {
          console.log(`      - ${endpoint.endpoint}: Ensure endpoint returns valid JSON response`);
        }
      });
    }
    
    const endpointsWithWarnings = this.validEndpoints.filter(e => e.analysis.warnings?.length > 0);
    if (endpointsWithWarnings.length > 0) {
      console.log('   ⚠️ Address warnings:');
      endpointsWithWarnings.forEach(endpoint => {
        endpoint.analysis.warnings.forEach(warning => {
          console.log(`      - ${endpoint.endpoint}: ${warning}`);
        });
      });
    }
    
    // Save detailed report
    try {
      const report = {
        summary: {
          validEndpoints: this.validEndpoints.length,
          invalidEndpoints: this.invalidEndpoints.length,
          timestamp: new Date().toISOString()
        },
        validEndpoints: this.validEndpoints,
        invalidEndpoints: this.invalidEndpoints
      };
      
      await fs.writeFile(
        'json-validation-report.json',
        JSON.stringify(report, null, 2),
        'utf8'
      );
      console.log('\n💾 Detailed report saved to: json-validation-report.json');
    } catch (error) {
      console.log(`\n⚠️ Could not save report: ${error.message}`);
    }
  }
}

// Run JSON validation diagnostic
const diagnostic = new JSONValidationDiagnostic();
diagnostic.performJSONValidation().catch(console.error);
