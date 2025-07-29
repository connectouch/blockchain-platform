exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Enhanced NFT collections data
    const nftCollections = [
      {
        id: 'bored-ape-yacht-club',
        name: 'Bored Ape Yacht Club',
        symbol: 'BAYC',
        contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
        floorPrice: 12.5,
        volume24h: 892.5,
        change24h: 5.2,
        owners: 5432,
        totalSupply: 10000,
        marketCap: 125000,
        averagePrice: 15.7,
        sales24h: 89,
        chain: 'ethereum',
        verified: true,
        image: '/api/placeholder/300/300',
        description: 'A collection of 10,000 unique Bored Ape NFTs',
        rarityEnabled: true,
        traits: []
      },
      {
        id: 'cryptopunks',
        name: 'CryptoPunks',
        symbol: 'PUNK',
        contractAddress: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb',
        floorPrice: 45.2,
        volume24h: 1250.8,
        change24h: -2.1,
        owners: 3456,
        totalSupply: 10000,
        marketCap: 452000,
        averagePrice: 52.3,
        sales24h: 34,
        chain: 'ethereum',
        verified: true,
        image: '/api/placeholder/300/300',
        description: 'The original NFT collection on Ethereum',
        rarityEnabled: true,
        traits: []
      },
      {
        id: 'azuki',
        name: 'Azuki',
        symbol: 'AZUKI',
        contractAddress: '0xed5af388653567af2f388e6224dc7c4b3241c544',
        floorPrice: 8.9,
        volume24h: 567.3,
        change24h: 12.8,
        owners: 4321,
        totalSupply: 10000,
        marketCap: 89000,
        averagePrice: 11.2,
        sales24h: 156,
        chain: 'ethereum',
        verified: true,
        image: '/api/placeholder/300/300',
        description: 'A brand for the metaverse built by Chiru Labs',
        rarityEnabled: true,
        traits: []
      },
      {
        id: 'doodles',
        name: 'Doodles',
        symbol: 'DOODLE',
        contractAddress: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e',
        floorPrice: 6.7,
        volume24h: 234.5,
        change24h: 8.4,
        owners: 3789,
        totalSupply: 10000,
        marketCap: 67000,
        averagePrice: 8.1,
        sales24h: 67,
        chain: 'ethereum',
        verified: true,
        image: '/api/placeholder/300/300',
        description: 'A community-driven collectibles project',
        rarityEnabled: true,
        traits: []
      },
      {
        id: 'moonbirds',
        name: 'Moonbirds',
        symbol: 'MOONBIRD',
        contractAddress: '0x23581767a106ae21c074b2276d25e5c3e136a68b',
        floorPrice: 4.2,
        volume24h: 189.7,
        change24h: -5.6,
        owners: 2987,
        totalSupply: 10000,
        marketCap: 42000,
        averagePrice: 5.8,
        sales24h: 45,
        chain: 'ethereum',
        verified: true,
        image: '/api/placeholder/300/300',
        description: 'A collection of 10,000 utility-enabled PFPs',
        rarityEnabled: true,
        traits: []
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: nftCollections,
        cached: false,
        timestamp: new Date().toISOString(),
        metadata: {
          count: nftCollections.length,
          totalVolume: nftCollections.reduce((sum, c) => sum + c.volume24h, 0),
          averageFloorPrice: nftCollections.reduce((sum, c) => sum + c.floorPrice, 0) / nftCollections.length
        }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch NFT collections',
        message: error.message
      })
    };
  }
};
