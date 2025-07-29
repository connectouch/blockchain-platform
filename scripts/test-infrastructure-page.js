#!/usr/bin/env node

/**
 * Test Infrastructure Page Data and Component
 */

const axios = require('axios');

const FRONTEND_URL = 'http://localhost:5175';

async function testInfrastructurePage() {
  console.log('🔍 Testing Infrastructure Page...\n');

  try {
    // Test API endpoint
    console.log('1. Testing API endpoint...');
    const apiResponse = await axios.get(`${FRONTEND_URL}/api/v2/blockchain/infrastructure/projects`);
    
    if (apiResponse.data.success) {
      console.log('✅ API endpoint working');
      console.log(`📊 Data: ${apiResponse.data.data.length} projects`);
      
      // Check data structure
      const projects = apiResponse.data.data;
      if (projects.length > 0) {
        const firstProject = projects[0];
        console.log('🔍 First project structure:');
        console.log(`   - Name: ${firstProject.name}`);
        console.log(`   - Market Cap: ${firstProject.marketCap}`);
        console.log(`   - TPS: ${firstProject.tps}`);
        console.log(`   - TVL: ${firstProject.tvl}`);
        console.log(`   - Gas Price: ${firstProject.gasPrice}`);
        console.log(`   - Validators: ${firstProject.validators}`);
        console.log(`   - Consensus: ${firstProject.consensus}`);
        
        // Check for potential issues
        const issues = [];
        
        if (typeof firstProject.marketCap !== 'number') {
          issues.push('marketCap is not a number');
        }
        if (typeof firstProject.tps !== 'number') {
          issues.push('tps is not a number');
        }
        if (typeof firstProject.tvl !== 'number') {
          issues.push('tvl is not a number');
        }
        if (typeof firstProject.gasPrice !== 'number') {
          issues.push('gasPrice is not a number');
        }
        if (typeof firstProject.validators !== 'number') {
          issues.push('validators is not a number');
        }
        
        if (issues.length > 0) {
          console.log('⚠️ Data type issues found:');
          issues.forEach(issue => console.log(`   - ${issue}`));
        } else {
          console.log('✅ Data types look correct');
        }
      }
    } else {
      console.log('❌ API endpoint failed');
      return;
    }

    // Test page loading
    console.log('\n2. Testing page loading...');
    try {
      const pageResponse = await axios.get(`${FRONTEND_URL}/infrastructure`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const html = pageResponse.data;
      
      if (html.includes('Something went wrong')) {
        console.log('❌ Page shows error boundary');
        console.log('🔍 This indicates a JavaScript runtime error in the React component');
        
        // Check for common issues in HTML
        if (html.includes('ChunkLoadError')) {
          console.log('💡 Possible cause: Code splitting/chunk loading error');
        } else if (html.includes('TypeError')) {
          console.log('💡 Possible cause: Type error in component');
        } else if (html.includes('ReferenceError')) {
          console.log('💡 Possible cause: Reference error in component');
        } else {
          console.log('💡 Check browser console for specific error details');
        }
      } else if (html.includes('Infrastructure')) {
        console.log('✅ Page loads with Infrastructure content');
      } else {
        console.log('⚠️ Page loads but content unclear');
      }
      
    } catch (pageError) {
      console.log('❌ Page loading failed:', pageError.message);
    }

    // Test React Query integration
    console.log('\n3. Testing potential React component issues...');
    
    // Check if the issue might be in the component logic
    const potentialIssues = [
      'Math operations on undefined values',
      'Array methods on undefined arrays',
      'Property access on null/undefined objects',
      'Type coercion issues with API data'
    ];
    
    console.log('🔍 Potential component issues to check:');
    potentialIssues.forEach(issue => console.log(`   - ${issue}`));
    
    console.log('\n💡 Recommendations:');
    console.log('   1. Check browser console for specific JavaScript errors');
    console.log('   2. Verify all data properties exist before using them');
    console.log('   3. Add null/undefined checks in component');
    console.log('   4. Test with development error boundary to see stack trace');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testInfrastructurePage().catch(console.error);
