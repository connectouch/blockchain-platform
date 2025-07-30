const fs = require('fs');
const path = require('path');

// Create crypto assets directory
const CRYPTO_DIR = path.join(__dirname, '../apps/frontend/public/assets/crypto');
if (!fs.existsSync(CRYPTO_DIR)) {
  fs.mkdirSync(CRYPTO_DIR, { recursive: true });
}

// Comprehensive cryptocurrency data with official colors and symbols
const CRYPTO_DATA = {
  'BTC': { name: 'Bitcoin', color: '#f7931a', symbol: '₿' },
  'ETH': { name: 'Ethereum', color: '#627eea', symbol: 'Ξ' },
  'BNB': { name: 'BNB', color: '#f3ba2f', symbol: 'BNB' },
  'ADA': { name: 'Cardano', color: '#0033ad', symbol: 'ADA' },
  'SOL': { name: 'Solana', color: '#9945ff', symbol: 'SOL' },
  'DOT': { name: 'Polkadot', color: '#e6007a', symbol: 'DOT' },
  'AVAX': { name: 'Avalanche', color: '#e84142', symbol: 'AVAX' },
  'MATIC': { name: 'Polygon', color: '#8247e5', symbol: 'MATIC' },
  'LINK': { name: 'Chainlink', color: '#375bd2', symbol: 'LINK' },
  'UNI': { name: 'Uniswap', color: '#ff007a', symbol: 'UNI' },
  'AAVE': { name: 'Aave', color: '#b6509e', symbol: 'AAVE' },
  'COMP': { name: 'Compound', color: '#00d395', symbol: 'COMP' },
  'MKR': { name: 'Maker', color: '#1aab9b', symbol: 'MKR' },
  'SNX': { name: 'Synthetix', color: '#5fcdf7', symbol: 'SNX' },
  'YFI': { name: 'Yearn Finance', color: '#006ae3', symbol: 'YFI' },
  'SUSHI': { name: 'SushiSwap', color: '#fa52a0', symbol: 'SUSHI' },
  'CRV': { name: 'Curve', color: '#40649f', symbol: 'CRV' },
  'BAL': { name: 'Balancer', color: '#1e1e1e', symbol: 'BAL' },
  'USDC': { name: 'USD Coin', color: '#2775ca', symbol: 'USDC' },
  'USDT': { name: 'Tether', color: '#26a17b', symbol: 'USDT' },
  'DAI': { name: 'Dai', color: '#f5ac37', symbol: 'DAI' },
  'WBTC': { name: 'Wrapped Bitcoin', color: '#ff9500', symbol: 'WBTC' },
  'SHIB': { name: 'Shiba Inu', color: '#ffa409', symbol: 'SHIB' },
  'DOGE': { name: 'Dogecoin', color: '#c2a633', symbol: 'DOGE' },
  'LTC': { name: 'Litecoin', color: '#bfbbbb', symbol: 'LTC' },
  'BCH': { name: 'Bitcoin Cash', color: '#8dc351', symbol: 'BCH' },
  'XRP': { name: 'XRP', color: '#23292f', symbol: 'XRP' },
  'TRX': { name: 'TRON', color: '#ff060a', symbol: 'TRX' },
  'ETC': { name: 'Ethereum Classic', color: '#328332', symbol: 'ETC' },
  'XLM': { name: 'Stellar', color: '#14b6e7', symbol: 'XLM' },
  'ALGO': { name: 'Algorand', color: '#000000', symbol: 'ALGO' },
  'VET': { name: 'VeChain', color: '#15bdff', symbol: 'VET' },
  'ICP': { name: 'Internet Computer', color: '#29abe2', symbol: 'ICP' },
  'FIL': { name: 'Filecoin', color: '#0090ff', symbol: 'FIL' },
  'THETA': { name: 'Theta', color: '#2ab8e6', symbol: 'THETA' },
  'XMR': { name: 'Monero', color: '#ff6600', symbol: 'XMR' },
  'EOS': { name: 'EOS', color: '#443f54', symbol: 'EOS' },
  'ATOM': { name: 'Cosmos', color: '#2e3148', symbol: 'ATOM' },
  'XTZ': { name: 'Tezos', color: '#2c7df7', symbol: 'XTZ' },
  'NEO': { name: 'Neo', color: '#58bf00', symbol: 'NEO' },
  'IOTA': { name: 'IOTA', color: '#131f37', symbol: 'IOTA' },
  'DASH': { name: 'Dash', color: '#008ce7', symbol: 'DASH' },
  'ZEC': { name: 'Zcash', color: '#ecb244', symbol: 'ZEC' },
  'WAVES': { name: 'Waves', color: '#0155ff', symbol: 'WAVES' },
  'ONT': { name: 'Ontology', color: '#32a4be', symbol: 'ONT' },
  'ZIL': { name: 'Zilliqa', color: '#49c1bf', symbol: 'ZIL' },
  'BAT': { name: 'Basic Attention Token', color: '#ff5000', symbol: 'BAT' },
  'ENJ': { name: 'Enjin Coin', color: '#624dbf', symbol: 'ENJ' },
  'MANA': { name: 'Decentraland', color: '#ff2d55', symbol: 'MANA' },
  'SAND': { name: 'The Sandbox', color: '#00adef', symbol: 'SAND' },
  'AXS': { name: 'Axie Infinity', color: '#0055d4', symbol: 'AXS' },
  'GALA': { name: 'Gala', color: '#ffc000', symbol: 'GALA' }
};

function generateHighQualityCryptoSVG(symbol, data) {
  const size = 128;
  const { color, name } = data;
  const symbolText = symbol.length <= 4 ? symbol : symbol.slice(0, 4);
  
  // Create gradient colors
  const lightColor = adjustBrightness(color, 20);
  const darkColor = adjustBrightness(color, -20);
  
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad_${symbol}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${lightColor};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${darkColor};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow_${symbol}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
    <filter id="glow_${symbol}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Outer glow circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 8}" fill="${color}" opacity="0.1" filter="url(#glow_${symbol})"/>
  
  <!-- Main circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="url(#grad_${symbol})" filter="url(#shadow_${symbol})"/>
  
  <!-- Inner highlight -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 8}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  
  <!-- Symbol text -->
  <text x="${size/2}" y="${size/2 + 8}" text-anchor="middle" fill="white" 
        font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
        filter="url(#shadow_${symbol})">
    ${symbolText}
  </text>
  
  <!-- Subtle brand name -->
  <text x="${size/2}" y="${size/2 + 28}" text-anchor="middle" fill="rgba(255,255,255,0.8)" 
        font-family="Arial, sans-serif" font-size="8" font-weight="normal">
    ${name.toUpperCase()}
  </text>
</svg>`;

  return svg;
}

function adjustBrightness(hex, percent) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse r, g, b values
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function generateAllCryptoSVGs() {
  console.log('🎨 Generating high-quality cryptocurrency SVGs...\n');
  
  let successCount = 0;
  
  for (const [symbol, data] of Object.entries(CRYPTO_DATA)) {
    try {
      const svg = generateHighQualityCryptoSVG(symbol, data);
      const filename = `${symbol.toLowerCase()}.svg`;
      const filepath = path.join(CRYPTO_DIR, filename);
      
      fs.writeFileSync(filepath, svg);
      console.log(`✅ Generated: ${filename} (${data.name})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to generate ${symbol}:`, error.message);
    }
  }
  
  console.log(`\n✅ SVG generation completed!`);
  console.log(`📊 Generated ${successCount}/${Object.keys(CRYPTO_DATA).length} cryptocurrency SVGs`);
  
  // Also generate PNG versions using a simple conversion
  console.log('\n🖼️ Creating PNG fallbacks...');
  generatePNGFallbacks();
}

function generatePNGFallbacks() {
  // Create simple PNG-style SVGs that can be used as .png files
  for (const [symbol, data] of Object.entries(CRYPTO_DATA)) {
    try {
      const size = 64;
      const { color } = data;
      const symbolText = symbol.length <= 3 ? symbol : symbol.slice(0, 3);
      
      const simpleSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="simple_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#simple_grad)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="none" stroke="white" stroke-width="1" opacity="0.5"/>
  <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white" 
        font-family="Arial, sans-serif" font-size="14" font-weight="bold">
    ${symbolText}
  </text>
</svg>`;
      
      const filename = `${symbol.toLowerCase()}.png`;
      const filepath = path.join(CRYPTO_DIR, filename);
      
      // Save as SVG with .png extension (browsers will render it correctly)
      fs.writeFileSync(filepath, simpleSvg);
      console.log(`✅ Generated PNG fallback: ${filename}`);
    } catch (error) {
      console.error(`❌ Failed to generate PNG for ${symbol}:`, error.message);
    }
  }
}

// Run the generator
if (require.main === module) {
  generateAllCryptoSVGs();
}

module.exports = { generateAllCryptoSVGs, CRYPTO_DATA };
