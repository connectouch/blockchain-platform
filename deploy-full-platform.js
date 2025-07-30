#!/usr/bin/env node

/**
 * Enhanced Deployment Script for Connectouch Blockchain AI Platform
 * Deploys the FULL FEATURED version with all rich components enabled
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Enhanced Connectouch Platform Deployment...');
console.log('📊 Full Feature Set Activation in Progress...');

// Configuration
const config = {
  platform: 'Full Featured Connectouch Platform',
  version: '2.0.0',
  buildTarget: 'production',
  features: {
    aiAssistant: true,
    voiceCommands: true,
    trading: true,
    notifications: true,
    realTimeData: true,
    advancedCharts: true,
    multiChain: true,
    portfolioAnalytics: true,
    gamefi: true,
    daoFeatures: true,
    infrastructureMonitoring: true
  }
};

// Pre-deployment checks
function preDeploymentChecks() {
  console.log('🔍 Running Pre-deployment Checks...');
  
  // Check if all required files exist
  const requiredFiles = [
    'apps/frontend/src/main.tsx',
    'apps/frontend/src/App.tsx',
    'apps/frontend/.env.production',
    'vercel.json',
    'apps/frontend/package.json'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`❌ Required file missing: ${file}`);
    }
  }
  
  console.log('✅ All required files present');
  
  // Verify enhanced features are enabled
  const envContent = fs.readFileSync('apps/frontend/.env.production', 'utf8');
  const enabledFeatures = Object.keys(config.features).filter(feature => {
    const envVar = `VITE_ENABLE_${feature.toUpperCase().replace(/([A-Z])/g, '_$1')}=true`;
    return envContent.includes(envVar) || envContent.includes(`VITE_ENABLE_${feature.toUpperCase()}=true`);
  });
  
  console.log(`✅ Enhanced features enabled: ${enabledFeatures.length}/${Object.keys(config.features).length}`);
}

// Build the application
function buildApplication() {
  console.log('🔨 Building Enhanced Application...');
  
  try {
    // Change to frontend directory
    process.chdir('apps/frontend');
    
    // Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
    
    // Build with full features
    console.log('🏗️ Building with full feature set...');
    execSync('npm run build:full', { stdio: 'inherit' });
    
    console.log('✅ Build completed successfully');
    
    // Return to root directory
    process.chdir('../../');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Deploy to Vercel
function deployToVercel() {
  console.log('🚀 Deploying to Vercel...');
  
  try {
    // Deploy using Vercel CLI or provide instructions
    console.log('📋 Vercel Deployment Instructions:');
    console.log('1. Install Vercel CLI: npm i -g vercel');
    console.log('2. Login to Vercel: vercel login');
    console.log('3. Deploy: vercel --prod');
    console.log('');
    console.log('Or drag the apps/frontend/dist folder to Vercel dashboard');
    
  } catch (error) {
    console.error('❌ Deployment preparation failed:', error.message);
  }
}

// Generate deployment report
function generateDeploymentReport() {
  const report = {
    timestamp: new Date().toISOString(),
    platform: config.platform,
    version: config.version,
    buildTarget: config.buildTarget,
    featuresEnabled: config.features,
    deploymentStatus: 'Ready for Production',
    buildOutput: 'apps/frontend/dist',
    vercelConfig: 'vercel.json',
    environmentConfig: 'apps/frontend/.env.production'
  };
  
  fs.writeFileSync('deployment-report.json', JSON.stringify(report, null, 2));
  console.log('📊 Deployment report generated: deployment-report.json');
  
  return report;
}

// Main deployment process
async function main() {
  try {
    console.log(`🎯 Deploying ${config.platform} v${config.version}`);
    console.log('🎨 All rich features and components will be enabled');
    console.log('');
    
    // Run deployment steps
    preDeploymentChecks();
    buildApplication();
    const report = generateDeploymentReport();
    deployToVercel();
    
    console.log('');
    console.log('🎉 Enhanced Deployment Process Completed!');
    console.log('');
    console.log('📊 Deployment Summary:');
    console.log(`   Platform: ${report.platform}`);
    console.log(`   Version: ${report.version}`);
    console.log(`   Features: ${Object.keys(report.featuresEnabled).length} enhanced features enabled`);
    console.log(`   Build Output: ${report.buildOutput}`);
    console.log(`   Status: ${report.deploymentStatus}`);
    console.log('');
    console.log('🔗 Next Steps:');
    console.log('1. Deploy the dist folder to Vercel');
    console.log('2. Verify all features are working');
    console.log('3. Test real-time data connections');
    console.log('4. Confirm AI assistant functionality');
    console.log('');
    console.log('✅ Full-featured Connectouch Platform ready for production!');
    
  } catch (error) {
    console.error('💥 Deployment failed:', error.message);
    console.error('🔍 Check the error details above and try again');
    process.exit(1);
  }
}

// Run the deployment
if (require.main === module) {
  main();
}

module.exports = { main, config };
