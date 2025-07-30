const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Create directories for storing images
const ASSETS_DIR = path.join(__dirname, '../apps/frontend/public/assets');
const CRYPTO_DIR = path.join(ASSETS_DIR, 'crypto');
const NFT_DIR = path.join(ASSETS_DIR, 'nft');
const DEFI_DIR = path.join(ASSETS_DIR, 'defi');
const GAMEFI_DIR = path.join(ASSETS_DIR, 'gamefi');

// Ensure directories exist
[ASSETS_DIR, CRYPTO_DIR, NFT_DIR, DEFI_DIR, GAMEFI_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Comprehensive cryptocurrency list with their official logos
const CRYPTO_SOURCES = {
  // Major cryptocurrencies with CryptoLogos.cc URLs
  'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  'BNB': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  'ADA': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
  'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.png',
  'DOT': 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
  'AVAX': 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
  'MATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  'LINK': 'https://cryptologos.cc/logos/chainlink-link-logo.png',
  'UNI': 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
  'AAVE': 'https://cryptologos.cc/logos/aave-aave-logo.png',
  'COMP': 'https://cryptologos.cc/logos/compound-comp-logo.png',
  'MKR': 'https://cryptologos.cc/logos/maker-mkr-logo.png',
  'SNX': 'https://cryptologos.cc/logos/synthetix-snx-logo.png',
  'YFI': 'https://cryptologos.cc/logos/yearn-finance-yfi-logo.png',
  'SUSHI': 'https://cryptologos.cc/logos/sushiswap-sushi-logo.png',
  'CRV': 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.png',
  'BAL': 'https://cryptologos.cc/logos/balancer-bal-logo.png',
  'USDC': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  'USDT': 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  'DAI': 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
  'WBTC': 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png',
  'SHIB': 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
  'DOGE': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
  'LTC': 'https://cryptologos.cc/logos/litecoin-ltc-logo.png',
  'BCH': 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png',
  'XRP': 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
  'TRX': 'https://cryptologos.cc/logos/tron-trx-logo.png',
  'ETC': 'https://cryptologos.cc/logos/ethereum-classic-etc-logo.png',
  'XLM': 'https://cryptologos.cc/logos/stellar-xlm-logo.png',
  'ALGO': 'https://cryptologos.cc/logos/algorand-algo-logo.png',
  'VET': 'https://cryptologos.cc/logos/vechain-vet-logo.png',
  'ICP': 'https://cryptologos.cc/logos/internet-computer-icp-logo.png',
  'FIL': 'https://cryptologos.cc/logos/filecoin-fil-logo.png',
  'THETA': 'https://cryptologos.cc/logos/theta-token-theta-logo.png',
  'XMR': 'https://cryptologos.cc/logos/monero-xmr-logo.png',
  'EOS': 'https://cryptologos.cc/logos/eos-eos-logo.png',
  'ATOM': 'https://cryptologos.cc/logos/cosmos-atom-logo.png',
  'XTZ': 'https://cryptologos.cc/logos/tezos-xtz-logo.png',
  'NEO': 'https://cryptologos.cc/logos/neo-neo-logo.png',
  'IOTA': 'https://cryptologos.cc/logos/iota-miota-logo.png',
  'DASH': 'https://cryptologos.cc/logos/dash-dash-logo.png',
  'ZEC': 'https://cryptologos.cc/logos/zcash-zec-logo.png',
  'WAVES': 'https://cryptologos.cc/logos/waves-waves-logo.png',
  'ONT': 'https://cryptologos.cc/logos/ontology-ont-logo.png',
  'ZIL': 'https://cryptologos.cc/logos/zilliqa-zil-logo.png',
  'BAT': 'https://cryptologos.cc/logos/basic-attention-token-bat-logo.png',
  'ENJ': 'https://cryptologos.cc/logos/enjin-coin-enj-logo.png',
  'MANA': 'https://cryptologos.cc/logos/decentraland-mana-logo.png',
  'SAND': 'https://cryptologos.cc/logos/the-sandbox-sand-logo.png',
  'AXS': 'https://cryptologos.cc/logos/axie-infinity-axs-logo.png',
  'GALA': 'https://cryptologos.cc/logos/gala-gala-logo.png'
};

// Popular NFT collections
const NFT_COLLECTIONS = {
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
  }
};

// DeFi protocol logos
const DEFI_PROTOCOLS = {
  'uniswap': 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
  'aave': 'https://cryptologos.cc/logos/aave-aave-logo.png',
  'compound': 'https://cryptologos.cc/logos/compound-comp-logo.png',
  'makerdao': 'https://cryptologos.cc/logos/maker-mkr-logo.png',
  'synthetix': 'https://cryptologos.cc/logos/synthetix-snx-logo.png',
  'yearn': 'https://cryptologos.cc/logos/yearn-finance-yfi-logo.png',
  'sushiswap': 'https://cryptologos.cc/logos/sushiswap-sushi-logo.png',
  'curve': 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.png',
  'balancer': 'https://cryptologos.cc/logos/balancer-bal-logo.png',
  'pancakeswap': 'https://cryptologos.cc/logos/pancakeswap-cake-logo.png',
  'chainlink': 'https://cryptologos.cc/logos/chainlink-link-logo.png'
};

// GameFi projects
const GAMEFI_PROJECTS = {
  'axie-infinity': 'https://cryptologos.cc/logos/axie-infinity-axs-logo.png',
  'the-sandbox': 'https://cryptologos.cc/logos/the-sandbox-sand-logo.png',
  'decentraland': 'https://cryptologos.cc/logos/decentraland-mana-logo.png',
  'enjin': 'https://cryptologos.cc/logos/enjin-coin-enj-logo.png',
  'gala': 'https://cryptologos.cc/logos/gala-gala-logo.png',
  'illuvium': 'https://assets.coingecko.com/coins/images/14468/large/ILV.JPG',
  'star-atlas': 'https://assets.coingecko.com/coins/images/17659/large/Icon_Reverse.png',
  'alien-worlds': 'https://cryptologos.cc/logos/alien-worlds-tlm-logo.png'
};

// Download function
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    protocol.get(url, (response) => {
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
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

// Main scraping function
async function scrapeAllImages() {
  console.log('🚀 Starting comprehensive image collection...\n');

  // Download cryptocurrency logos
  console.log('📈 Downloading cryptocurrency logos...');
  for (const [symbol, url] of Object.entries(CRYPTO_SOURCES)) {
    try {
      const filename = `${symbol.toLowerCase()}.png`;
      const filepath = path.join(CRYPTO_DIR, filename);
      await downloadImage(url, filepath);
      await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
    } catch (error) {
      console.error(`❌ Failed to download ${symbol}:`, error.message);
    }
  }

  // Download NFT collection images
  console.log('\n🖼️ Downloading NFT collection images...');
  for (const [slug, data] of Object.entries(NFT_COLLECTIONS)) {
    try {
      const filename = `${slug}.png`;
      const filepath = path.join(NFT_DIR, filename);
      await downloadImage(data.image, filepath);
      await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
    } catch (error) {
      console.error(`❌ Failed to download ${slug}:`, error.message);
    }
  }

  // Download DeFi protocol logos
  console.log('\n🏦 Downloading DeFi protocol logos...');
  for (const [protocol, url] of Object.entries(DEFI_PROTOCOLS)) {
    try {
      const filename = `${protocol}.png`;
      const filepath = path.join(DEFI_DIR, filename);
      await downloadImage(url, filepath);
      await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
    } catch (error) {
      console.error(`❌ Failed to download ${protocol}:`, error.message);
    }
  }

  // Download GameFi project logos
  console.log('\n🎮 Downloading GameFi project logos...');
  for (const [project, url] of Object.entries(GAMEFI_PROJECTS)) {
    try {
      const filename = `${project}.png`;
      const filepath = path.join(GAMEFI_DIR, filename);
      await downloadImage(url, filepath);
      await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
    } catch (error) {
      console.error(`❌ Failed to download ${project}:`, error.message);
    }
  }

  console.log('\n✅ Image collection completed!');
  console.log(`📊 Summary:`);
  console.log(`   Crypto logos: ${Object.keys(CRYPTO_SOURCES).length}`);
  console.log(`   NFT collections: ${Object.keys(NFT_COLLECTIONS).length}`);
  console.log(`   DeFi protocols: ${Object.keys(DEFI_PROTOCOLS).length}`);
  console.log(`   GameFi projects: ${Object.keys(GAMEFI_PROJECTS).length}`);
}

// Run the scraper
if (require.main === module) {
  scrapeAllImages().catch(console.error);
}

module.exports = {
  scrapeAllImages,
  CRYPTO_SOURCES,
  NFT_COLLECTIONS,
  DEFI_PROTOCOLS,
  GAMEFI_PROJECTS
};
