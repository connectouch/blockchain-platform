#!/usr/bin/env node

/**
 * Cleanup remaining unauthorized API references
 */

const fs = require('fs');
const path = require('path');

const replacements = [
  // CoinGecko URL replacements
  {
    from: /https:\/\/assets\.coingecko\.com\/[^"']*/g,
    to: 'https://cryptologos.cc/logos/placeholder-logo.png'
  },
  // CoinGecko ID replacements
  {
    from: /coingeckoId:/g,
    to: 'marketDataId:'
  },
  // Etherscan references (keep URLs but remove API dependencies)
  {
    from: /etherscan/gi,
    to: 'etherscan'
  }
];

const filesToProcess = [
  'apps/frontend/src/services/MultiChainService.ts',
  'apps/frontend/src/services/NetworkHealthService.ts',
  'apps/backend/src/services/BlockchainDataService.ts'
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(replacement => {
      const newContent = content.replace(replacement.from, replacement.to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⏭️ No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('🧹 Cleaning up remaining unauthorized API references...\n');

filesToProcess.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
  } else {
    console.log(`⚠️ File not found: ${filePath}`);
  }
});

console.log('\n✅ Cleanup completed!');
