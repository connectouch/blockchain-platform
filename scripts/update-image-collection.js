const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Import existing generators
const { generateAllCryptoSVGs } = require('./generate-crypto-svgs');

// Configuration
const ASSETS_DIR = path.join(__dirname, '../apps/frontend/public/assets');
const CRYPTO_DIR = path.join(ASSETS_DIR, 'crypto');
const NFT_DIR = path.join(ASSETS_DIR, 'nft');
const DEFI_DIR = path.join(ASSETS_DIR, 'defi');
const GAMEFI_DIR = path.join(ASSETS_DIR, 'gamefi');

// Ensure all directories exist
[ASSETS_DIR, CRYPTO_DIR, NFT_DIR, DEFI_DIR, GAMEFI_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Extended NFT collections with more popular collections
const EXTENDED_NFT_COLLECTIONS = {
  'bored-ape-yacht-club': {
    name: 'Bored Ape Yacht Club',
    contract: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    image: 'https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB?auto=format&dpr=1&w=384'
  },
  'cryptopunks': {
    name: 'CryptoPunks',
    contract: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb',
    image: 'https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&dpr=1&w=384'
  },
  'mutant-ape-yacht-club': {
    name: 'Mutant Ape Yacht Club',
    contract: '0x60e4d786628fea6478f785a6d7e704777c86a7c6',
    image: 'https://i.seadn.io/gae/lHexKRMpw-aoSyB1WdqzLI5-8T8aW-wTapalYzFkgmuEvZSPNzXuC4wErcZhHOdGhvYw7RFu684iq6ob9pmLeqLOyeE_QWEctaj5QA?auto=format&dpr=1&w=384'
  },
  'azuki': {
    name: 'Azuki',
    contract: '0xed5af388653567af2f388e6224dc7c4b3241c544',
    image: 'https://i.seadn.io/gae/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8XyNeBDj6bA_n1mjejzhFQUP3O1NfjFLHr3FOaeHcTOOT?auto=format&dpr=1&w=384'
  },
  'otherdeed-for-otherside': {
    name: 'Otherdeeds for Otherside',
    contract: '0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258',
    image: 'https://i.seadn.io/gae/yIm-M5-BpSDdTEIJRt5D6xphizhIdozXjqSITgK4phWq7MmAU3qE7Nw7POGCiPGyhtJ3ZFP8iJ29TFl-RLcGBWX5qI4-ZcnCPcsY4zI?auto=format&dpr=1&w=384'
  },
  'clonex': {
    name: 'CloneX',
    contract: '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b',
    image: 'https://i.seadn.io/gae/XN0XuD8Uh3jyRWNtPTFeXJg_ht8m5ofDx6aneXZV_SHBeWcO2BQjyJNGkQU_mJE8nLHjValLZKPLZWZuDq3T_tBJc1xECwzY-O7F?auto=format&dpr=1&w=384'
  },
  'pudgy-penguins': {
    name: 'Pudgy Penguins',
    contract: '0xbd3531da5cf5857e7cfaa92426877b022e612cf8',
    image: 'https://i.seadn.io/gae/yNi-XdGxsgQCPpqSio4o31ygAV6wURdIdInWRcFIl46UjUQ1eV7BEndGe8L661OoG-clRi7EgInLX4LPu9Jfw4fq0bnVYHqg7RFi?auto=format&dpr=1&w=384'
  },
  'doodles-official': {
    name: 'Doodles',
    contract: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e',
    image: 'https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ?auto=format&dpr=1&w=384'
  },
  'moonbirds': {
    name: 'Moonbirds',
    contract: '0x23581767a106ae21c074b2276d25e5c3e136a68b',
    image: 'https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4huJIR5OLuyO3Z5PpJFSwdm7rq-TikAh7f5eUw338A2cy6HRH75?auto=format&dpr=1&w=384'
  },
  'veefriends': {
    name: 'VeeFriends',
    contract: '0xa3aee8bce55beea1951ef834b99f3ac60d1abeeb',
    image: 'https://i.seadn.io/gae/5y-UCAXiNOFXH551w5bWdZEYOCdHPwbqmcKb-xa3uVZtWLkKXODqkKdM_X8kKHzV8bPAlBk-B9dSGRVhLgUvWBo_QyJFDn_sOPE?auto=format&dpr=1&w=384'
  }
};

// Additional DeFi protocols with alternative image sources
const EXTENDED_DEFI_PROTOCOLS = {
  'uniswap': 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
  'aave': 'https://assets.coingecko.com/coins/images/12645/large/AAVE.png',
  'compound': 'https://assets.coingecko.com/coins/images/10775/large/COMP.png',
  'makerdao': 'https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png',
  'synthetix': 'https://assets.coingecko.com/coins/images/3406/large/SNX.png',
  'yearn': 'https://assets.coingecko.com/coins/images/11849/large/yfi-192x192.png',
  'sushiswap': 'https://assets.coingecko.com/coins/images/12271/large/512x512_Logo_no_chop.png',
  'curve': 'https://assets.coingecko.com/coins/images/12124/large/Curve.png',
  'balancer': 'https://assets.coingecko.com/coins/images/11683/large/Balancer.png',
  'pancakeswap': 'https://assets.coingecko.com/coins/images/12632/large/pancakeswap-cake-logo_%281%29.png',
  'chainlink': 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
  '1inch': 'https://assets.coingecko.com/coins/images/13469/large/1inch-token.png',
  'convex': 'https://assets.coingecko.com/coins/images/15585/large/convex.png',
  'frax': 'https://assets.coingecko.com/coins/images/13422/large/frax_logo.png',
  'olympus': 'https://assets.coingecko.com/coins/images/14483/large/token_OHM_%281%29.png'
};

// Download function with better error handling
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✅ Downloaded: ${path.basename(filepath)}`);
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    });
    
    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Update NFT collection images
async function updateNFTImages() {
  console.log('🖼️ Updating NFT collection images...\n');
  
  let successCount = 0;
  let totalCount = Object.keys(EXTENDED_NFT_COLLECTIONS).length;
  
  for (const [slug, data] of Object.entries(EXTENDED_NFT_COLLECTIONS)) {
    try {
      const filename = `${slug}.png`;
      const filepath = path.join(NFT_DIR, filename);
      
      // Skip if file already exists and is recent (less than 7 days old)
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceModified < 7) {
          console.log(`⏭️ Skipping ${filename} (recent)`);
          successCount++;
          continue;
        }
      }
      
      await downloadImage(data.image, filepath);
      successCount++;
      await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
    } catch (error) {
      console.error(`❌ Failed to download ${slug}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 NFT Images: ${successCount}/${totalCount} successful\n`);
}

// Update DeFi protocol images
async function updateDeFiImages() {
  console.log('🏦 Updating DeFi protocol images...\n');
  
  let successCount = 0;
  let totalCount = Object.keys(EXTENDED_DEFI_PROTOCOLS).length;
  
  for (const [protocol, url] of Object.entries(EXTENDED_DEFI_PROTOCOLS)) {
    try {
      const filename = `${protocol}.png`;
      const filepath = path.join(DEFI_DIR, filename);
      
      // Skip if file already exists and is recent
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceModified < 7) {
          console.log(`⏭️ Skipping ${filename} (recent)`);
          successCount++;
          continue;
        }
      }
      
      await downloadImage(url, filepath);
      successCount++;
      await new Promise(resolve => setTimeout(resolve, 150)); // Rate limiting
    } catch (error) {
      console.error(`❌ Failed to download ${protocol}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 DeFi Images: ${successCount}/${totalCount} successful\n`);
}

// Generate image inventory report
function generateInventoryReport() {
  console.log('📋 Generating image inventory report...\n');
  
  const inventory = {
    crypto: fs.existsSync(CRYPTO_DIR) ? fs.readdirSync(CRYPTO_DIR).length : 0,
    nft: fs.existsSync(NFT_DIR) ? fs.readdirSync(NFT_DIR).length : 0,
    defi: fs.existsSync(DEFI_DIR) ? fs.readdirSync(DEFI_DIR).length : 0,
    gamefi: fs.existsSync(GAMEFI_DIR) ? fs.readdirSync(GAMEFI_DIR).length : 0
  };
  
  const total = Object.values(inventory).reduce((sum, count) => sum + count, 0);
  
  console.log('📊 Image Inventory Report:');
  console.log(`   Cryptocurrency logos: ${inventory.crypto}`);
  console.log(`   NFT collections: ${inventory.nft}`);
  console.log(`   DeFi protocols: ${inventory.defi}`);
  console.log(`   GameFi projects: ${inventory.gamefi}`);
  console.log(`   Total images: ${total}`);
  
  // Save report to file
  const reportPath = path.join(ASSETS_DIR, 'image-inventory.json');
  const report = {
    timestamp: new Date().toISOString(),
    inventory,
    total
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}`);
}

// Main update function
async function updateImageCollection() {
  console.log('🚀 Starting comprehensive image collection update...\n');
  
  try {
    // 1. Generate/update cryptocurrency SVGs
    console.log('🎨 Updating cryptocurrency SVGs...');
    generateAllCryptoSVGs();
    console.log('');
    
    // 2. Update NFT collection images
    await updateNFTImages();
    
    // 3. Update DeFi protocol images
    await updateDeFiImages();
    
    // 4. Generate inventory report
    generateInventoryReport();
    
    console.log('\n✅ Image collection update completed successfully!');
    console.log('🎯 All images are now ready for instant loading in your platform.');
    
  } catch (error) {
    console.error('\n❌ Error during image collection update:', error);
    process.exit(1);
  }
}

// Run the updater
if (require.main === module) {
  updateImageCollection().catch(console.error);
}

module.exports = {
  updateImageCollection,
  updateNFTImages,
  updateDeFiImages,
  generateInventoryReport
};
