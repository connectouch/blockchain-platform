#!/usr/bin/env node

/**
 * Comprehensive Infrastructure Page Debug Script
 * Uses multiple approaches to identify the exact cause of the error boundary
 */

const axios = require('axios');
const { spawn } = require('child_process');

const FRONTEND_URL = 'http://localhost:5175';

class InfrastructureDebugger {
  constructor() {
    this.findings = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    if (type === 'error') {
      this.errors.push(message);
    } else {
      this.findings.push(message);
    }
  }

  async testAPIEndpoint() {
    this.log('Testing API endpoint directly...');
    
    try {
      const response = await axios.get(`${FRONTEND_URL}/api/v2/blockchain/infrastructure/projects`);
      
      if (response.data.success) {
        this.log(`✅ API returns ${response.data.data.length} projects`);
        
        // Validate data structure
        const projects = response.data.data;
        for (let i = 0; i < projects.length; i++) {
          const project = projects[i];
          const requiredFields = ['name', 'marketCap', 'tps', 'tvl', 'gasPrice', 'validators'];
          
          for (const field of requiredFields) {
            if (project[field] === undefined || project[field] === null) {
              this.log(`Missing field ${field} in project ${project.name}`, 'error');
            }
          }
        }
        
        return { success: true, data: projects };
      } else {
        this.log('API request failed', 'error');
        return { success: false };
      }
    } catch (error) {
      this.log(`API request error: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async testPageLoad() {
    this.log('Testing page load...');
    
    try {
      const response = await axios.get(`${FRONTEND_URL}/infrastructure`, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const html = response.data;
      
      if (html.includes('Something went wrong')) {
        this.log('Page shows error boundary', 'error');
        
        // Look for specific error indicators
        if (html.includes('ChunkLoadError')) {
          this.log('Detected: Code splitting/chunk loading error', 'error');
        }
        if (html.includes('TypeError')) {
          this.log('Detected: Type error in component', 'error');
        }
        if (html.includes('ReferenceError')) {
          this.log('Detected: Reference error in component', 'error');
        }
        if (html.includes('SyntaxError')) {
          this.log('Detected: Syntax error in component', 'error');
        }
        
        return { success: false, hasErrorBoundary: true };
      } else if (html.includes('Infrastructure')) {
        this.log('✅ Page loads with Infrastructure content');
        return { success: true, hasErrorBoundary: false };
      } else {
        this.log('Page loads but content unclear', 'warning');
        return { success: false, hasErrorBoundary: false };
      }
      
    } catch (error) {
      this.log(`Page loading error: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async testNetworkRequests() {
    this.log('Testing network requests to infrastructure endpoint...');
    
    try {
      // Test with different user agents and headers
      const testConfigs = [
        { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } },
        { headers: { 'Accept': 'application/json' } },
        { headers: { 'Content-Type': 'application/json' } }
      ];
      
      for (const config of testConfigs) {
        try {
          const response = await axios.get(`${FRONTEND_URL}/api/v2/blockchain/infrastructure/projects`, config);
          this.log(`✅ Network request successful with ${JSON.stringify(config.headers)}`);
        } catch (error) {
          this.log(`Network request failed with ${JSON.stringify(config.headers)}: ${error.message}`, 'error');
        }
      }
      
    } catch (error) {
      this.log(`Network test error: ${error.message}`, 'error');
    }
  }

  async testComponentIsolation() {
    this.log('Testing component isolation...');
    
    // Create a minimal test component to check if the issue is in the component itself
    const testComponentCode = `
import React from 'react';
import { useQuery } from '@tanstack/react-query';

const TestInfrastructure = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['test-infrastructure'],
    queryFn: async () => {
      const response = await fetch('/api/v2/blockchain/infrastructure/projects');
      const result = await response.json();
      return result;
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Test Infrastructure</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default TestInfrastructure;
    `;
    
    this.log('Generated minimal test component for isolation testing');
    return testComponentCode;
  }

  async checkBrowserConsole() {
    this.log('Checking for browser console errors...');
    
    // This would require browser automation, but we can suggest manual steps
    this.log('Manual step required: Open browser console at http://localhost:5175/infrastructure');
    this.log('Look for JavaScript errors in the console');
    this.log('Check Network tab for failed requests');
    this.log('Check React DevTools for component state');
  }

  async runComprehensiveDebug() {
    console.log('🚀 COMPREHENSIVE INFRASTRUCTURE PAGE DEBUG');
    console.log('='.repeat(60));
    
    // Step 1: Test API
    const apiResult = await this.testAPIEndpoint();
    
    // Step 2: Test page load
    const pageResult = await this.testPageLoad();
    
    // Step 3: Test network requests
    await this.testNetworkRequests();
    
    // Step 4: Component isolation
    const testComponent = await this.testComponentIsolation();
    
    // Step 5: Browser console check
    await this.checkBrowserConsole();
    
    // Analysis
    console.log('\n📊 ANALYSIS RESULTS');
    console.log('='.repeat(40));
    
    if (apiResult.success && pageResult.hasErrorBoundary) {
      this.log('DIAGNOSIS: API works but React component has runtime error', 'error');
      this.log('LIKELY CAUSES:', 'warning');
      this.log('1. JavaScript runtime error in component rendering');
      this.log('2. React Query state management issue');
      this.log('3. Import/dependency problem');
      this.log('4. Data processing error in component');
      
      console.log('\n🔧 RECOMMENDED FIXES:');
      console.log('1. Check browser console for specific error');
      console.log('2. Add error boundary with detailed logging');
      console.log('3. Test with minimal component');
      console.log('4. Check React Query devtools');
      console.log('5. Verify all imports are working');
      
    } else if (!apiResult.success) {
      this.log('DIAGNOSIS: API endpoint issue', 'error');
    } else if (pageResult.success) {
      this.log('DIAGNOSIS: Everything appears to be working', 'warning');
    }
    
    // Summary
    console.log('\n📋 SUMMARY');
    console.log(`Total findings: ${this.findings.length}`);
    console.log(`Total errors: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS FOUND:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    return {
      apiWorking: apiResult.success,
      pageHasError: pageResult.hasErrorBoundary,
      errors: this.errors,
      findings: this.findings
    };
  }
}

// Run the comprehensive debug
const infraDebugger = new InfrastructureDebugger();
infraDebugger.runComprehensiveDebug().catch(console.error);
