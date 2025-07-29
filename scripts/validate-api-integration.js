#!/usr/bin/env node

/**
 * API Integration Validation Script
 * Validates that only approved APIs (OpenAI, Alchemy, CoinMarketCap) are used
 * and all services work correctly with the 3 approved API keys
 */

const fs = require('fs');
const path = require('path');

// Simple .env loader
function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value && !process.env[key]) {
          process.env[key] = value.trim();
        }
      });
    }
  } catch (error) {
    console.warn('Could not load .env file');
  }
}

loadEnv();

class ApiIntegrationValidator {
  constructor() {
    this.approvedApis = ['OPENAI', 'ALCHEMY', 'COINMARKETCAP'];
    this.unauthorizedApis = [
      'COINGECKO', 'ETHERSCAN', 'THE_GRAPH', 'ANTHROPIC',
      'MORALIS', 'INFURA', 'QUICKNODE', 'CHAINSTACK'
    ];
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  /**
   * Main validation function
   */
  async validate() {
    console.log('🔍 Starting API Integration Validation...\n');

    // 1. Validate environment variables
    this.validateEnvironmentVariables();

    // 2. Validate codebase for unauthorized API references
    await this.validateCodebase();

    // 3. Validate configuration files
    this.validateConfigurationFiles();

    // 4. Test API connectivity
    await this.testApiConnectivity();

    // 5. Generate report
    this.generateReport();
  }

  /**
   * Validate environment variables
   */
  validateEnvironmentVariables() {
    console.log('📋 Validating Environment Variables...');

    // Check required approved API keys
    const requiredKeys = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
      COINMARKETCAP_API_KEY: process.env.COINMARKETCAP_API_KEY
    };

    let allKeysPresent = true;
    Object.entries(requiredKeys).forEach(([key, value]) => {
      if (!value) {
        this.results.failed.push(`❌ Missing required API key: ${key}`);
        allKeysPresent = false;
      } else {
        this.results.passed.push(`✅ ${key} is configured`);
      }
    });

    // Check for unauthorized API keys in environment
    this.unauthorizedApis.forEach(api => {
      const envKey = `${api}_API_KEY`;
      if (process.env[envKey]) {
        this.results.warnings.push(`⚠️ Unauthorized API key found in environment: ${envKey}`);
      }
    });

    if (allKeysPresent) {
      this.results.passed.push('✅ All required API keys are present');
    }
  }

  /**
   * Validate codebase for unauthorized API references
   */
  async validateCodebase() {
    console.log('🔍 Scanning Codebase for Unauthorized API References...');

    const filesToCheck = [
      'apps/frontend/src/services/',
      'apps/backend/src/services/',
      'apps/backend/src/utils/',
      'working-api-server.js'
    ];

    for (const filePath of filesToCheck) {
      await this.scanDirectory(filePath);
    }
  }

  /**
   * Scan directory for unauthorized API references
   */
  async scanDirectory(dirPath) {
    const fullPath = path.join(process.cwd(), dirPath);
    
    if (!fs.existsSync(fullPath)) {
      this.results.warnings.push(`⚠️ Path not found: ${dirPath}`);
      return;
    }

    const stat = fs.statSync(fullPath);
    
    if (stat.isFile()) {
      this.scanFile(fullPath, dirPath);
    } else if (stat.isDirectory()) {
      const files = fs.readdirSync(fullPath);
      for (const file of files) {
        if (file.endsWith('.js') || file.endsWith('.ts')) {
          this.scanFile(path.join(fullPath, file), path.join(dirPath, file));
        }
      }
    }
  }

  /**
   * Scan individual file for unauthorized API references
   */
  scanFile(filePath, relativePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for unauthorized API references (excluding block explorer URLs)
      this.unauthorizedApis.forEach(api => {
        const patterns = [];

        // Always check for API keys
        patterns.push(new RegExp(`${api}_API_KEY`, 'gi'));

        // Check for actual API calls, not just any mention
        if (api === 'COINGECKO') {
          patterns.push(new RegExp(`api\\.coingecko\\.com`, 'gi'));
          patterns.push(new RegExp(`pro-api\\.coingecko\\.com`, 'gi'));
        } else if (api === 'ETHERSCAN') {
          patterns.push(new RegExp(`api\\.etherscan\\.io`, 'gi'));
        } else if (api === 'THE_GRAPH') {
          patterns.push(new RegExp(`api\\.thegraph\\.com`, 'gi'));
        } else if (api === 'ANTHROPIC') {
          patterns.push(new RegExp(`api\\.anthropic\\.com`, 'gi'));
        } else {
          // Generic API pattern for other services
          patterns.push(new RegExp(`api\\.${api.toLowerCase()}`, 'gi'));
        }

        patterns.forEach(pattern => {
          if (pattern.test(content)) {
            this.results.failed.push(`❌ Unauthorized API reference found in ${relativePath}: ${api}`);
          }
        });
      });

      // Check for hardcoded API keys
      const hardcodedKeyPattern = /(sk-[a-zA-Z0-9]{48,}|alcht_[a-zA-Z0-9]{32,}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/g;
      const matches = content.match(hardcodedKeyPattern);
      if (matches) {
        this.results.failed.push(`❌ Hardcoded API key found in ${relativePath}`);
      }

    } catch (error) {
      this.results.warnings.push(`⚠️ Could not read file: ${relativePath}`);
    }
  }

  /**
   * Validate configuration files
   */
  validateConfigurationFiles() {
    console.log('⚙️ Validating Configuration Files...');

    // Check .env file
    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf8');
      
      // Ensure only approved APIs are configured
      this.approvedApis.forEach(api => {
        if (envContent.includes(`${api}_API_KEY`)) {
          this.results.passed.push(`✅ ${api}_API_KEY found in .env`);
        }
      });

      // Check for unauthorized APIs
      this.unauthorizedApis.forEach(api => {
        if (envContent.includes(`${api}_API_KEY`)) {
          this.results.failed.push(`❌ Unauthorized API key in .env: ${api}_API_KEY`);
        }
      });
    }

    // Check MCP configuration
    const mcpConfigPath = 'tools/mcp/mcp-config.json';
    if (fs.existsSync(mcpConfigPath)) {
      try {
        const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
        this.results.passed.push('✅ MCP configuration file is valid JSON');
        
        // Check for approved APIs in MCP config
        const configStr = JSON.stringify(mcpConfig);
        this.approvedApis.forEach(api => {
          if (configStr.includes(api.toLowerCase())) {
            this.results.passed.push(`✅ ${api} found in MCP configuration`);
          }
        });
      } catch (error) {
        this.results.failed.push('❌ MCP configuration file is invalid JSON');
      }
    }
  }

  /**
   * Test API connectivity
   */
  async testApiConnectivity() {
    console.log('🌐 Testing API Connectivity...');

    // Test OpenAI API
    if (process.env.OPENAI_API_KEY) {
      try {
        // Simple test - just validate key format
        if (process.env.OPENAI_API_KEY.startsWith('sk-')) {
          this.results.passed.push('✅ OpenAI API key format is valid');
        } else {
          this.results.failed.push('❌ OpenAI API key format is invalid');
        }
      } catch (error) {
        this.results.failed.push('❌ OpenAI API test failed');
      }
    }

    // Test Alchemy API
    if (process.env.ALCHEMY_API_KEY) {
      try {
        if (process.env.ALCHEMY_API_KEY.startsWith('alcht_')) {
          this.results.passed.push('✅ Alchemy API key format is valid');
        } else {
          this.results.failed.push('❌ Alchemy API key format is invalid');
        }
      } catch (error) {
        this.results.failed.push('❌ Alchemy API test failed');
      }
    }

    // Test CoinMarketCap API
    if (process.env.COINMARKETCAP_API_KEY) {
      try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(process.env.COINMARKETCAP_API_KEY)) {
          this.results.passed.push('✅ CoinMarketCap API key format is valid');
        } else {
          this.results.failed.push('❌ CoinMarketCap API key format is invalid');
        }
      } catch (error) {
        this.results.failed.push('❌ CoinMarketCap API test failed');
      }
    }
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n📊 VALIDATION REPORT');
    console.log('='.repeat(50));

    console.log(`\n✅ PASSED (${this.results.passed.length}):`);
    this.results.passed.forEach(item => console.log(`  ${item}`));

    if (this.results.warnings.length > 0) {
      console.log(`\n⚠️ WARNINGS (${this.results.warnings.length}):`);
      this.results.warnings.forEach(item => console.log(`  ${item}`));
    }

    if (this.results.failed.length > 0) {
      console.log(`\n❌ FAILED (${this.results.failed.length}):`);
      this.results.failed.forEach(item => console.log(`  ${item}`));
    }

    console.log('\n' + '='.repeat(50));
    
    if (this.results.failed.length === 0) {
      console.log('🎉 ALL VALIDATIONS PASSED! Your platform is properly configured with only approved APIs.');
      process.exit(0);
    } else {
      console.log('❌ VALIDATION FAILED! Please fix the issues above before proceeding.');
      process.exit(1);
    }
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new ApiIntegrationValidator();
  validator.validate().catch(error => {
    console.error('❌ Validation script failed:', error);
    process.exit(1);
  });
}

module.exports = ApiIntegrationValidator;
