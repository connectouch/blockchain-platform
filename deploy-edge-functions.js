#!/usr/bin/env node

/**
 * Comprehensive Edge Functions Deployment Script
 * Deploys all Edge Functions to Supabase and configures environment variables
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const SUPABASE_PROJECT_REF = 'aompecyfgnakkmldhidg';
const SUPABASE_URL = 'https://aompecyfgnakkmldhidg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbXBlY3lmZ25ha2ttbGRoaWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzMwODYsImV4cCI6MjA2OTMwOTA4Nn0.SSbGerxCplUZd_ZJDCK3HrfHM_m0it2lExgKBv3bt9A';

// API Keys for Edge Functions - Load from environment variables
const API_KEYS = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY || '',
  COINMARKETCAP_API_KEY: process.env.COINMARKETCAP_API_KEY || ''
};

// Validate required API keys
const requiredKeys = ['OPENAI_API_KEY', 'ALCHEMY_API_KEY', 'COINMARKETCAP_API_KEY'];
const missingKeys = requiredKeys.filter(key => !process.env[key]);

if (missingKeys.length > 0) {
  console.error('❌ Missing required environment variables:', missingKeys.join(', '));
  console.error('Please set these environment variables before deploying edge functions.');
  process.exit(1);
}

// Functions to deploy
const FUNCTIONS = [
  {
    name: 'health-check',
    path: 'supabase/functions/health-check/index.ts'
  },
  {
    name: 'crypto-prices',
    path: 'supabase/functions/crypto-prices/index.ts'
  },
  {
    name: 'nft-collections',
    path: 'supabase/functions/nft-collections/index.ts'
  }
];

async function createFunction(functionName, functionCode) {
  console.log(`🚀 Creating Edge Function: ${functionName}`);
  
  try {
    // Create the function using Supabase Management API
    const response = await axios.post(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/functions`,
      {
        slug: functionName,
        name: functionName,
        source: functionCode,
        verify_jwt: false
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_ACCESS_TOKEN || SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`✅ Function ${functionName} created successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create function ${functionName}:`, error.response?.data || error.message);
    return false;
  }
}

async function deployFunction(functionName, functionCode) {
  console.log(`📦 Deploying Edge Function: ${functionName}`);
  
  try {
    // Deploy the function
    const response = await axios.post(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/functions/${functionName}/deploy`,
      {
        source: functionCode
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_ACCESS_TOKEN || SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`✅ Function ${functionName} deployed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to deploy function ${functionName}:`, error.response?.data || error.message);
    return false;
  }
}

async function testFunction(functionName) {
  console.log(`🧪 Testing Edge Function: ${functionName}`);
  
  try {
    const response = await axios.post(
      `${SUPABASE_URL}/functions/v1/${functionName}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        timeout: 15000
      }
    );
    
    if (response.status === 200) {
      console.log(`✅ Function ${functionName} test successful`);
      return true;
    } else {
      console.log(`⚠️ Function ${functionName} test returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Function ${functionName} test failed:`, error.message);
    return false;
  }
}

async function setEnvironmentVariables() {
  console.log('🔧 Setting environment variables...');
  
  try {
    for (const [key, value] of Object.entries(API_KEYS)) {
      const response = await axios.post(
        `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/secrets`,
        {
          name: key,
          value: value
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_ACCESS_TOKEN || SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ Set environment variable: ${key}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to set environment variables:', error.response?.data || error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting comprehensive Edge Functions deployment...');
  console.log(`📍 Project: ${SUPABASE_PROJECT_REF}`);
  console.log(`🌐 URL: ${SUPABASE_URL}`);
  
  // Set environment variables first
  await setEnvironmentVariables();
  
  let successCount = 0;
  let testSuccessCount = 0;
  
  for (const func of FUNCTIONS) {
    try {
      const functionPath = path.join(__dirname, func.path);
      
      if (!fs.existsSync(functionPath)) {
        console.error(`❌ Function file not found: ${functionPath}`);
        continue;
      }
      
      const functionCode = fs.readFileSync(functionPath, 'utf8');
      
      // Try to create and deploy the function
      const created = await createFunction(func.name, functionCode);
      if (created) {
        successCount++;
        
        // Wait a moment for deployment to complete
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test the function
        const testSuccess = await testFunction(func.name);
        if (testSuccess) {
          testSuccessCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error processing function ${func.name}:`, error.message);
    }
  }
  
  console.log(`\n📊 Deployment Summary:`);
  console.log(`✅ Functions deployed: ${successCount}/${FUNCTIONS.length}`);
  console.log(`🧪 Functions tested: ${testSuccessCount}/${FUNCTIONS.length}`);
  
  if (successCount === FUNCTIONS.length && testSuccessCount === FUNCTIONS.length) {
    console.log('🎉 All functions deployed and tested successfully!');
  } else {
    console.log('⚠️ Some functions failed. Check the logs above.');
  }
  
  console.log('\n🔗 Function URLs:');
  FUNCTIONS.forEach(func => {
    console.log(`  ${func.name}: ${SUPABASE_URL}/functions/v1/${func.name}`);
  });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createFunction, deployFunction, testFunction, setEnvironmentVariables };
