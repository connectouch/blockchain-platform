const fs = require('fs');
const path = require('path');

// Files to fix
const routeFiles = [
  'apps/backend/src/routes/ai-intelligence.ts',
  'apps/backend/src/routes/auth.ts',
  'apps/backend/src/routes/blockchain-ai.ts',
  'apps/backend/src/routes/blockchain.ts',
  'apps/backend/src/routes/defi.ts'
];

function fixRouteFile(filePath) {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix async route handlers that don't return values
  // Pattern: async (req, res) => {
  content = content.replace(
    /async\s*\(\s*req\s*,\s*res\s*\)\s*=>\s*{/g,
    'async (req, res): Promise<any> => {'
  );
  
  // Fix sync route handlers that don't return values
  // Pattern: (req, res) => {
  content = content.replace(
    /(?<!async\s*)\(\s*req\s*,\s*res\s*\)\s*=>\s*{/g,
    '(req, res): any => {'
  );
  
  // Fix middleware functions
  // Pattern: (req, res, next) => {
  content = content.replace(
    /\(\s*req\s*,\s*res\s*,\s*next\s*\)\s*=>\s*{/g,
    '(req, res, next): any => {'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

// Fix all route files
routeFiles.forEach(fixRouteFile);

console.log('All route files fixed!');
