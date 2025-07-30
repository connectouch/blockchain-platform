const ALCHEMY_API_KEY = 'lcht_4VtVtdF68sMtNaLupR7oPQ1wDSFNc4'

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  try {
    // Extract contract address from path
    const contractAddress = event.path.split('/').pop()
    
    if (!contractAddress) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Contract address parameter is required' })
      }
    }

    console.log(`Fetching NFT collection image for: ${contractAddress}`)

    // Try Alchemy API first
    try {
      const alchemyResponse = await fetch(
        `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}/getContractMetadata?contractAddress=${contractAddress}`,
        {
          headers: { 
            'Accept': 'application/json',
            'User-Agent': 'Connectouch-Platform/1.0'
          }
        }
      )

      if (alchemyResponse.ok) {
        const alchemyData = await alchemyResponse.json()
        if (alchemyData.contractMetadata?.openSea?.imageUrl) {
          console.log(`Found Alchemy NFT image for ${contractAddress}`)
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              image: alchemyData.contractMetadata.openSea.imageUrl,
              source: 'alchemy'
            })
          }
        }
      }
    } catch (error) {
      console.warn(`Alchemy API failed for ${contractAddress}:`, error.message)
    }

    // Try OpenSea API as fallback
    const openSeaEndpoints = [
      `https://api.opensea.io/api/v2/collections/${contractAddress}`,
      `https://api.opensea.io/api/v1/asset_contract/${contractAddress}`,
      `https://api.opensea.io/api/v1/collection/${contractAddress}`
    ]

    for (const endpoint of openSeaEndpoints) {
      try {
        const openSeaResponse = await fetch(endpoint, {
          headers: { 
            'Accept': 'application/json',
            'User-Agent': 'Connectouch-Platform/1.0'
          }
        })

        if (openSeaResponse.ok) {
          const openSeaData = await openSeaResponse.json()
          const imageUrl = openSeaData.image_url || 
                         openSeaData.collection?.image_url || 
                         openSeaData.collection?.featured_image_url ||
                         openSeaData.featured_image_url ||
                         openSeaData.image

          if (imageUrl) {
            console.log(`Found OpenSea NFT image for ${contractAddress}`)
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ 
                image: imageUrl,
                source: 'opensea'
              })
            }
          }
        }
      } catch (error) {
        console.warn(`OpenSea endpoint ${endpoint} failed:`, error.message)
        continue
      }
    }

    // Generate SVG fallback for NFT collection
    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
    const color = colors[contractAddress.length % colors.length]
    const initials = contractAddress.slice(2, 4).toUpperCase()
    const size = 300

    const svgFallback = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}dd;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#nftGrad)" rx="24"/>
        <rect x="20" y="20" width="${size-40}" height="${size-40}" fill="none" stroke="white" stroke-width="4" rx="16" opacity="0.8"/>
        <g transform="translate(${size/2 - 20}, ${size/2 - 50})" fill="white" opacity="0.9">
          <path d="M8 2L12 8L16 2L20 8L24 2L22 18H10L8 2Z" stroke="white" stroke-width="2"/>
        </g>
        <text x="${size/2}" y="${size/2 + 10}" text-anchor="middle" fill="white" 
              font-family="Arial, sans-serif" font-size="32" font-weight="bold">
          ${initials}
        </text>
        <text x="${size/2}" y="${size/2 + 40}" text-anchor="middle" fill="white" 
              font-family="Arial, sans-serif" font-size="16" opacity="0.8">
          Collection
        </text>
      </svg>
    `)}`

    console.log(`Generated SVG fallback for NFT collection ${contractAddress}`)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        image: svgFallback,
        source: 'generated'
      })
    }

  } catch (error) {
    console.error('NFT collection function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    }
  }
}
