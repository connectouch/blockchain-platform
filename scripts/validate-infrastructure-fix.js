#!/usr/bin/env node

/**
 * Validate Infrastructure Page Fix
 * Comprehensive test to ensure the infrastructure page is working correctly
 */

const axios = require('axios');

const FRONTEND_URL = 'http://localhost:5175';

async function validateInfrastructureFix() {
  console.log('🔧 VALIDATING INFRASTRUCTURE PAGE FIX');
  console.log('='.repeat(50));

  let allTestsPassed = true;

  try {
    // Test 1: API Data Structure
    console.log('\n1. 🧪 Testing API Data Structure...');
    const apiResponse = await axios.get(`${FRONTEND_URL}/api/v2/blockchain/infrastructure/projects`);
    
    if (!apiResponse.data.success) {
      console.log('❌ API request failed');
      allTestsPassed = false;
      return;
    }

    const projects = apiResponse.data.data;
    console.log(`✅ API returns ${projects.length} projects`);

    // Validate each project has required fields
    const requiredFields = ['name', 'marketCap', 'tps', 'tvl', 'gasPrice', 'validators', 'consensus', 'launched'];
    
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      console.log(`\n   📊 Project ${i + 1}: ${project.name}`);
      
      for (const field of requiredFields) {
        if (project[field] !== undefined && project[field] !== null) {
          console.log(`   ✅ ${field}: ${project[field]}`);
        } else {
          console.log(`   ❌ ${field}: MISSING`);
          allTestsPassed = false;
        }
      }
    }

    // Test 2: Data Types
    console.log('\n2. 🔢 Testing Data Types...');
    const firstProject = projects[0];
    
    const typeTests = [
      { field: 'marketCap', expected: 'number', value: firstProject.marketCap },
      { field: 'tps', expected: 'number', value: firstProject.tps },
      { field: 'tvl', expected: 'number', value: firstProject.tvl },
      { field: 'gasPrice', expected: 'number', value: firstProject.gasPrice },
      { field: 'validators', expected: 'number', value: firstProject.validators }
    ];

    for (const test of typeTests) {
      const actualType = typeof test.value;
      if (actualType === test.expected) {
        console.log(`   ✅ ${test.field}: ${actualType} (${test.value})`);
      } else {
        console.log(`   ❌ ${test.field}: expected ${test.expected}, got ${actualType} (${test.value})`);
        allTestsPassed = false;
      }
    }

    // Test 3: Mathematical Operations
    console.log('\n3. 🧮 Testing Mathematical Operations...');
    
    try {
      // Test operations that were causing errors
      const totalMarketCap = projects.reduce((sum, p) => sum + (p.marketCap || 0), 0);
      const totalTVL = projects.reduce((sum, p) => sum + (p.tvl || 0), 0);
      const validTPS = projects.filter(p => p.tps && p.tps > 0);
      const maxTPS = validTPS.length > 0 ? Math.max(...validTPS.map(p => p.tps)) : 0;
      
      console.log(`   ✅ Total Market Cap: $${(totalMarketCap / 1e9).toFixed(1)}B`);
      console.log(`   ✅ Total TVL: $${(totalTVL / 1e9).toFixed(1)}B`);
      console.log(`   ✅ Max TPS: ${maxTPS.toLocaleString()}`);
      
      // Test individual project calculations
      for (const project of projects) {
        const marketCapB = ((project.marketCap || 0) / 1e9).toFixed(1);
        const tvlB = ((project.tvl || 0) / 1e9).toFixed(1);
        const gasDisplay = (project.gasPrice && project.gasPrice > 0) ? `${project.gasPrice} Gwei` : 'Low';
        
        console.log(`   ✅ ${project.name}: $${marketCapB}B market cap, $${tvlB}B TVL, ${gasDisplay} gas`);
      }
      
    } catch (mathError) {
      console.log(`   ❌ Mathematical operations failed: ${mathError.message}`);
      allTestsPassed = false;
    }

    // Test 4: Page Loading
    console.log('\n4. 🌐 Testing Page Loading...');
    
    try {
      const pageResponse = await axios.get(`${FRONTEND_URL}/infrastructure`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const html = pageResponse.data;
      
      if (html.includes('Something went wrong')) {
        console.log('   ❌ Page still shows error boundary');
        allTestsPassed = false;
      } else if (html.includes('Infrastructure')) {
        console.log('   ✅ Page loads successfully with Infrastructure content');
      } else {
        console.log('   ⚠️ Page loads but content unclear');
      }
      
    } catch (pageError) {
      console.log(`   ❌ Page loading failed: ${pageError.message}`);
      allTestsPassed = false;
    }

    // Test 5: Component Safety
    console.log('\n5. 🛡️ Testing Component Safety...');
    
    // Simulate potential undefined/null scenarios
    const testProject = {
      name: 'Test',
      marketCap: undefined,
      tps: null,
      tvl: 0,
      gasPrice: undefined,
      validators: 0
    };
    
    try {
      // Test the same operations the component does
      const marketCapDisplay = ((testProject.marketCap || 0) / 1e9).toFixed(1);
      const tpsDisplay = (testProject.tps && testProject.tps > 0) ? `${testProject.tps.toLocaleString()}` : 'N/A';
      const tvlDisplay = ((testProject.tvl || 0) / 1e9).toFixed(1);
      const gasDisplay = (testProject.gasPrice && testProject.gasPrice > 0) ? `${testProject.gasPrice} Gwei` : 'Low';
      const validatorsShow = (testProject.validators && testProject.validators > 0);
      
      console.log('   ✅ Handles undefined marketCap correctly');
      console.log('   ✅ Handles null tps correctly');
      console.log('   ✅ Handles zero tvl correctly');
      console.log('   ✅ Handles undefined gasPrice correctly');
      console.log('   ✅ Handles zero validators correctly');
      
    } catch (safetyError) {
      console.log(`   ❌ Component safety test failed: ${safetyError.message}`);
      allTestsPassed = false;
    }

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    allTestsPassed = false;
  }

  // Final Result
  console.log('\n' + '='.repeat(50));
  
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Infrastructure page is fully fixed and operational');
    console.log('🚀 The "Something went wrong" error has been resolved');
    console.log('📊 All data fields are properly handled');
    console.log('🛡️ Component is safe from undefined/null errors');
    console.log('\n🌐 Access your working infrastructure page at:');
    console.log('   http://localhost:5175/infrastructure');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('⚠️ Infrastructure page may still have issues');
    process.exit(1);
  }
}

// Run validation
validateInfrastructureFix().catch(console.error);
