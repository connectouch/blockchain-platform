const fs = require('fs');
const path = require('path');

// Create directories
const ASSETS_DIR = path.join(__dirname, '../apps/frontend/public/assets');
const NEWS_DIR = path.join(ASSETS_DIR, 'news');
const NEWSOURCES_DIR = path.join(ASSETS_DIR, 'newsources');

[ASSETS_DIR, NEWS_DIR, NEWSOURCES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// News categories with colors and icons
const NEWS_CATEGORIES = [
  { name: 'bitcoin', color: '#f7931a', icon: '₿' },
  { name: 'ethereum', color: '#627eea', icon: 'Ξ' },
  { name: 'defi', color: '#8b5cf6', icon: 'DeFi' },
  { name: 'nft', color: '#ec4899', icon: 'NFT' },
  { name: 'gamefi', color: '#10b981', icon: 'GameFi' },
  { name: 'dao', color: '#f59e0b', icon: 'DAO' },
  { name: 'regulation', color: '#ef4444', icon: 'REG' },
  { name: 'adoption', color: '#06b6d4', icon: 'ADOPT' },
  { name: 'technology', color: '#6366f1', icon: 'TECH' },
  { name: 'market', color: '#84cc16', icon: 'MKT' },
  { name: 'breaking', color: '#dc2626', icon: '🚨' },
  { name: 'analysis', color: '#7c3aed', icon: '📊' }
];

// News sources
const NEWS_SOURCES = [
  'coindesk', 'cointelegraph', 'decrypt', 'the-block', 'blockworks',
  'bitcoin-magazine', 'coinbase-blog', 'binance-blog', 'ethereum-foundation', 'polygon-blog'
];

// Generate news category images
function generateNewsCategoryImage(category, filepath) {
  const size = 64;
  const { color, icon, name } = category;

  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="categoryGrad_${name}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
      </linearGradient>
      <filter id="glow_${name}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#categoryGrad_${name})" filter="url(#glow_${name})"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 6}" fill="none" stroke="white" stroke-width="1" opacity="0.5"/>
    <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white" 
          font-family="Arial, sans-serif" font-size="10" font-weight="bold">
      ${icon}
    </text>
  </svg>`;
  
  fs.writeFileSync(filepath, svg);
}

// Generate news source fallback
function generateNewsSourceFallback(sourceName, filepath) {
  const color = '#1f2937';
  const initials = sourceName.split('-').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  const size = 64;

  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="newsGrad_${sourceName}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
        <stop offset="100%" style="stop-color:#374151;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#newsGrad_${sourceName})" rx="8"/>
    <rect x="8" y="8" width="48" height="48" fill="none" stroke="white" stroke-width="1" rx="4"/>
    <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white" 
          font-family="Arial, sans-serif" font-size="12" font-weight="bold">
      ${initials}
    </text>
  </svg>`;
  
  fs.writeFileSync(filepath, svg);
}

// Generate all news images
function generateAllNewsImages() {
  console.log('📰 Generating news images...\n');

  // Generate news category images
  console.log('🏷️ Generating news category images...');
  let categoryCount = 0;
  for (const category of NEWS_CATEGORIES) {
    try {
      const filename = `${category.name}.svg`;
      const filepath = path.join(NEWS_DIR, filename);
      
      generateNewsCategoryImage(category, filepath);
      console.log(`✅ Generated category: ${category.name}`);
      categoryCount++;
    } catch (error) {
      console.error(`❌ Failed to generate category ${category.name}:`, error.message);
    }
  }

  // Generate news source images
  console.log('\n📡 Generating news source images...');
  let sourceCount = 0;
  for (const source of NEWS_SOURCES) {
    try {
      const filename = `${source}.png`;
      const filepath = path.join(NEWSOURCES_DIR, filename);
      
      generateNewsSourceFallback(source, filepath);
      console.log(`✅ Generated source: ${source}`);
      sourceCount++;
    } catch (error) {
      console.error(`❌ Failed to generate source ${source}:`, error.message);
    }
  }

  console.log(`\n✅ News image generation completed!`);
  console.log(`📊 Summary:`);
  console.log(`   News categories: ${categoryCount}/${NEWS_CATEGORIES.length}`);
  console.log(`   News sources: ${sourceCount}/${NEWS_SOURCES.length}`);
  console.log(`   Total: ${categoryCount + sourceCount} images`);
}

// Run the generator
if (require.main === module) {
  generateAllNewsImages();
}

module.exports = { generateAllNewsImages };
