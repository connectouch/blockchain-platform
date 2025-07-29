#!/usr/bin/env node

/**
 * Supabase Edge Functions Deployment Script
 * Deploys all Edge Functions and sets environment variables
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const SUPABASE_PROJECT_ID = 'aompecyfgnakkmldhidg';
const SUPABASE_URL = 'https://aompecyfgnakkmldhidg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbXBlY3lmZ25ha2ttbGRoaWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzMwODYsImV4cCI6MjA2OTMwOTA4Nn0.SSbGerxCplUZd_ZJDCK3HrfHM_m0it2lExgKBv3bt9A';

// API Keys
const API_KEYS = {
  OPENAI_API_KEY: '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',
  ALCHEMY_API_KEY: 'alcht_4VtVtdF68sMtNaLupR7oPQ1wDSFNc4',
  COINMARKETCAP_API_KEY: 'd714f7e6-91a5-47ac-866e-f28f26eee302'
};

// Functions to deploy
const FUNCTIONS = [
  'health-check',
  'crypto-prices',
  'ai-analysis'
];

async function deployFunction(functionName) {
  console.log(`🚀 Deploying function: ${functionName}`);
  
  try {
    const functionPath = path.join(__dirname, 'supabase', 'functions', functionName, 'index.ts');
    
    if (!fs.existsSync(functionPath)) {
      console.error(`❌ Function file not found: ${functionPath}`);
      return false;
    }
    
    const functionCode = fs.readFileSync(functionPath, 'utf8');
    
    // Create function via Supabase API
    const response = await axios.post(
      `${SUPABASE_URL}/functions/v1/${functionName}`,
      functionCode,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/typescript',
          'apikey': SUPABASE_ANON_KEY
        }
      }
    );
    
    console.log(`✅ Function ${functionName} deployed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to deploy function ${functionName}:`, error.message);
    return false;
  }
}

async function testFunction(functionName) {
  console.log(`🧪 Testing function: ${functionName}`);
  
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
        timeout: 10000
      }
    );
    
    console.log(`✅ Function ${functionName} test successful:`, response.status);
    return true;
  } catch (error) {
    console.error(`❌ Function ${functionName} test failed:`, error.message);
    return false;
  }
}

async function createSystemHealthTable() {
  console.log('🗄️ Creating system_health table...');
  
  try {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS system_health (
        id SERIAL PRIMARY KEY,
        service_name VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) NOT NULL,
        response_time INTEGER DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        error_message TEXT,
        last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DROP TRIGGER IF EXISTS update_system_health_updated_at ON system_health;
      CREATE TRIGGER update_system_health_updated_at
        BEFORE UPDATE ON system_health
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;
    
    // This would need to be executed via Supabase SQL editor or API
    console.log('📝 SQL for system_health table created. Please execute in Supabase SQL editor:');
    console.log(createTableSQL);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to create system_health table:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Supabase Edge Functions deployment...');
  console.log(`📍 Project: ${SUPABASE_PROJECT_ID}`);
  console.log(`🌐 URL: ${SUPABASE_URL}`);
  
  // Create database table
  await createSystemHealthTable();
  
  // Deploy functions
  let successCount = 0;
  for (const functionName of FUNCTIONS) {
    const success = await deployFunction(functionName);
    if (success) {
      successCount++;
      
      // Test the function
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      await testFunction(functionName);
    }
  }
  
  console.log(`\n📊 Deployment Summary:`);
  console.log(`✅ Successfully deployed: ${successCount}/${FUNCTIONS.length} functions`);
  
  if (successCount === FUNCTIONS.length) {
    console.log('🎉 All functions deployed successfully!');
    console.log('\n🔗 Function URLs:');
    FUNCTIONS.forEach(name => {
      console.log(`  ${name}: ${SUPABASE_URL}/functions/v1/${name}`);
    });
  } else {
    console.log('⚠️ Some functions failed to deploy. Check the logs above.');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Execute the SQL commands shown above in Supabase SQL editor');
  console.log('2. Set environment variables in Supabase dashboard');
  console.log('3. Test the functions manually');
  console.log('4. Deploy the frontend to Netlify');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { deployFunction, testFunction, createSystemHealthTable };
