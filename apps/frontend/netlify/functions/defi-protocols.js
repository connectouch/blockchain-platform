/**
 * Netlify Function: DeFi Protocols Proxy
 * Fetches DeFi protocols data from DeFiLlama API to avoid CORS issues
 */

exports.handler = async (event, context) => {
  // Set CORS headers
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

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    console.log('🔍 Fetching DeFi protocols from DeFiLlama API...')

    // Fetch data from DeFiLlama
    const response = await fetch('https://api.llama.fi/protocols', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Connectouch-Blockchain-Platform/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`DeFiLlama API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ DeFi protocols fetched successfully:', data.length, 'protocols')

    // Transform and filter data
    const protocols = data
      .filter(protocol => protocol.name && protocol.tvl > 0) // Filter valid protocols
      .slice(0, 20) // Limit to top 20
      .map(protocol => ({
        id: protocol.slug || protocol.name.toLowerCase().replace(/\s+/g, '-'),
        name: protocol.name,
        symbol: protocol.symbol || protocol.name.substring(0, 4).toUpperCase(),
        tvl: protocol.tvl || 0,
        change_1d: protocol.change_1d || 0,
        change_7d: protocol.change_7d || 0,
        category: protocol.category || 'DeFi',
        chains: Array.isArray(protocol.chains) ? protocol.chains : ['ethereum'],
        logo: protocol.logo || null,
        url: protocol.url || null,
        description: protocol.description || null
      }))

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: protocols,
        count: protocols.length,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('❌ Error fetching DeFi protocols:', error)

    // Return mock data as fallback
    const mockProtocols = [
      {
        id: 'uniswap',
        name: 'Uniswap',
        symbol: 'UNI',
        tvl: 8500000000,
        change_1d: 2.3,
        change_7d: -1.2,
        category: 'Dexes',
        chains: ['ethereum', 'polygon', 'arbitrum'],
        logo: null,
        url: 'https://uniswap.org',
        description: 'Decentralized trading protocol'
      },
      {
        id: 'aave',
        name: 'Aave',
        symbol: 'AAVE',
        tvl: 12000000000,
        change_1d: 1.8,
        change_7d: 3.5,
        category: 'Lending',
        chains: ['ethereum', 'polygon', 'avalanche'],
        logo: null,
        url: 'https://aave.com',
        description: 'Decentralized lending protocol'
      },
      {
        id: 'compound',
        name: 'Compound',
        symbol: 'COMP',
        tvl: 3200000000,
        change_1d: -0.5,
        change_7d: 2.1,
        category: 'Lending',
        chains: ['ethereum'],
        logo: null,
        url: 'https://compound.finance',
        description: 'Algorithmic money markets'
      },
      {
        id: 'makerdao',
        name: 'MakerDAO',
        symbol: 'MKR',
        tvl: 9800000000,
        change_1d: 0.8,
        change_7d: -2.3,
        category: 'CDP',
        chains: ['ethereum'],
        logo: null,
        url: 'https://makerdao.com',
        description: 'Decentralized stablecoin platform'
      },
      {
        id: 'curve',
        name: 'Curve',
        symbol: 'CRV',
        tvl: 4500000000,
        change_1d: 1.2,
        change_7d: 4.7,
        category: 'Dexes',
        chains: ['ethereum', 'polygon', 'arbitrum'],
        logo: null,
        url: 'https://curve.fi',
        description: 'Decentralized exchange for stablecoins'
      },
      {
        id: 'lido',
        name: 'Lido',
        symbol: 'LDO',
        tvl: 15200000000,
        change_1d: 2.7,
        change_7d: 8.9,
        category: 'Liquid Staking',
        chains: ['ethereum'],
        logo: null,
        url: 'https://lido.fi',
        description: 'Liquid staking solution'
      }
    ]

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: mockProtocols,
        count: mockProtocols.length,
        timestamp: new Date().toISOString(),
        fallback: true,
        error: error.message
      })
    }
  }
}
