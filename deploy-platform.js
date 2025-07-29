#!/usr/bin/env node

/**
 * Comprehensive Platform Deployment Script
 * Deploys Supabase Edge Functions and Netlify Frontend
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SUPABASE_PROJECT_ID = 'aompecyfgnakkmldhidg';
const SUPABASE_URL = 'https://aompecyfgnakkmldhidg.supabase.co';

console.log('🚀 Starting Comprehensive Platform Deployment...');
console.log(`📍 Supabase Project: ${SUPABASE_PROJECT_ID}`);
console.log(`🌐 Supabase URL: ${SUPABASE_URL}`);

// Step 1: Build the frontend
console.log('\n📦 Building frontend...');
try {
  process.chdir(path.join(__dirname, 'apps', 'frontend'));
  
  // Install dependencies
  console.log('📥 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Build the project
  console.log('🔨 Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Frontend build completed successfully');
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  process.exit(1);
}

// Step 2: Create Netlify configuration
console.log('\n⚙️ Creating Netlify configuration...');
const netlifyConfig = {
  build: {
    publish: "dist",
    command: "npm run build"
  },
  redirects: [
    {
      from: "/api/*",
      to: "https://aompecyfgnakkmldhidg.supabase.co/functions/v1/:splat",
      status: 200,
      force: true
    },
    {
      from: "/*",
      to: "/index.html",
      status: 200
    }
  ],
  headers: [
    {
      for: "/*",
      values: {
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      }
    }
  ]
};

fs.writeFileSync('netlify.toml', `
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/api/*"
  to = "https://aompecyfgnakkmldhidg.supabase.co/functions/v1/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
`);

console.log('✅ Netlify configuration created');

// Step 3: Create environment file for production
console.log('\n🔧 Creating production environment file...');
const envContent = `# Production Environment Configuration for Netlify + Supabase Deployment

# Supabase Configuration
VITE_SUPABASE_URL=https://aompecyfgnakkmldhidg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbXBlY3lmZ25ha2ttbGRoaWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzMwODYsImV4cCI6MjA2OTMwOTA4Nn0.SSbGerxCplUZd_ZJDCK3HrfHM_m0it2lExgKBv3bt9A

# API Configuration
VITE_API_BASE_URL=https://aompecyfgnakkmldhidg.supabase.co/functions/v1
VITE_AI_BASE_URL=https://aompecyfgnakkmldhidg.supabase.co/functions/v1
VITE_BACKEND_URL=https://aompecyfgnakkmldhidg.supabase.co
VITE_WS_URL=wss://aompecyfgnakkmldhidg.supabase.co/realtime/v1/websocket

# Production Configuration
VITE_NODE_ENV=production
VITE_DEBUG=false

# Blockchain Configuration
VITE_DEFAULT_CHAIN=ethereum
VITE_SUPPORTED_CHAINS=ethereum,polygon,arbitrum,optimism

# Feature Flags
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_PORTFOLIO_TRACKING=true
VITE_ENABLE_REAL_TIME_UPDATES=true
VITE_ENABLE_WALLET_CONNECT=true

# Analytics
VITE_ENABLE_ANALYTICS=true

# App Information
VITE_APP_NAME="Connectouch Blockchain AI Platform"
VITE_APP_VERSION="2.0.0"
VITE_APP_DESCRIPTION="Comprehensive Blockchain AI Platform"

# Security
VITE_ENABLE_HTTPS=true
VITE_SECURE_COOKIES=true

# Performance
VITE_ENABLE_COMPRESSION=true
VITE_ENABLE_CACHING=true
`;

fs.writeFileSync('.env.production', envContent);
console.log('✅ Production environment file created');

// Step 4: Create deployment summary
console.log('\n📋 Deployment Summary:');
console.log('✅ Frontend built successfully');
console.log('✅ Netlify configuration created');
console.log('✅ Production environment configured');
console.log('✅ API redirects configured to Supabase Edge Functions');

console.log('\n🔗 Important URLs:');
console.log(`📊 Supabase Dashboard: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`);
console.log(`🔧 Supabase Functions: ${SUPABASE_URL}/functions/v1/`);
console.log(`📈 Health Check: ${SUPABASE_URL}/functions/v1/health-check`);
console.log(`💰 Crypto Prices: ${SUPABASE_URL}/functions/v1/crypto-prices`);
console.log(`🎨 NFT Collections: ${SUPABASE_URL}/functions/v1/nft-collections`);

console.log('\n📋 Next Steps:');
console.log('1. Deploy to Netlify using the built files in the dist/ directory');
console.log('2. Set environment variables in Netlify dashboard');
console.log('3. Configure Supabase Edge Functions environment variables');
console.log('4. Test all endpoints and functionality');

console.log('\n🎉 Platform deployment preparation completed!');

// Return to root directory
process.chdir(path.join(__dirname));

console.log('\n💡 To deploy to Netlify:');
console.log('   1. Run: netlify deploy --prod --dir=apps/frontend/dist');
console.log('   2. Or drag the apps/frontend/dist folder to Netlify dashboard');
console.log('   3. Configure environment variables in Netlify settings');

console.log('\n🔧 To configure Supabase secrets:');
console.log('   1. Go to Supabase Dashboard > Project Settings > Edge Functions');
console.log('   2. Add the following secrets:');
console.log('      - OPENAI_API_KEY');
console.log('      - ALCHEMY_API_KEY');
console.log('      - COINMARKETCAP_API_KEY');
console.log('   3. Deploy the Edge Functions from the supabase/functions directory');
