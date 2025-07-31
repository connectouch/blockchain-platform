/**
 * Vercel API Route - Alchemy Integration
 * Secure server-side API calls to Alchemy
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Use the Alchemy API key you provided
  const API_KEY = 'alcht_4VtVtdF68sMtNaLupR7oPQ1wDSFNc4'

  console.log('⛓️ Alchemy API Key configured:', API_KEY.substring(0, 10) + '...')
  const ALCHEMY_URL = `https://eth-mainnet.g.alchemy.com/v2/${API_KEY}`

  try {
    console.log('⛓️ Fetching blockchain data from Alchemy...')
    
    // Get current gas price
    const gasPriceResponse = await fetch(ALCHEMY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: []
      })
    })

    // Get latest block
    const latestBlockResponse = await fetch(ALCHEMY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 2,
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: ['latest', false]
      })
    })

    // Get fee history for EIP-1559
    const feeHistoryResponse = await fetch(ALCHEMY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 3,
        jsonrpc: '2.0',
        method: 'eth_feeHistory',
        params: [4, 'latest', [25, 50, 75]]
      })
    })

    const [gasPriceData, latestBlockData, feeHistoryData] = await Promise.all([
      gasPriceResponse.json(),
      latestBlockResponse.json(),
      feeHistoryResponse.json()
    ])

    if (gasPriceData.error || latestBlockData.error) {
      throw new Error('Alchemy API returned error')
    }

    const gasPrice = gasPriceData.result
    const latestBlock = latestBlockData.result
    const feeHistory = feeHistoryData.result

    // Calculate EIP-1559 fees
    let maxFeePerGas = gasPrice
    let maxPriorityFeePerGas = '2000000000' // 2 gwei default

    if (feeHistory && feeHistory.baseFeePerGas && feeHistory.baseFeePerGas.length > 0) {
      const latestBaseFee = parseInt(feeHistory.baseFeePerGas[feeHistory.baseFeePerGas.length - 1], 16)
      maxFeePerGas = `0x${(latestBaseFee * 2).toString(16)}` // 2x base fee
    }

    console.log('✅ Successfully fetched blockchain data from Alchemy')

    res.status(200).json({
      success: true,
      data: {
        gasPrice: {
          gasLimit: '21000',
          gasPrice: gasPrice,
          maxFeePerGas: maxFeePerGas,
          maxPriorityFeePerGas: maxPriorityFeePerGas,
          gasPriceGwei: (parseInt(gasPrice, 16) / 1e9).toFixed(1),
          maxFeeGwei: (parseInt(maxFeePerGas, 16) / 1e9).toFixed(1)
        },
        latestBlock: {
          number: latestBlock.number,
          hash: latestBlock.hash,
          timestamp: latestBlock.timestamp,
          gasUsed: latestBlock.gasUsed,
          gasLimit: latestBlock.gasLimit,
          baseFeePerGas: latestBlock.baseFeePerGas
        },
        network: {
          name: 'Ethereum Mainnet',
          chainId: 1,
          isLive: true
        },
        timestamp: new Date().toISOString(),
        source: 'alchemy'
      }
    })

  } catch (error) {
    console.error('❌ Alchemy API error:', error)
    
    // Return fallback data
    const fallbackData = {
      gasPrice: {
        gasLimit: '21000',
        gasPrice: '0x4a817c800', // 20 gwei
        maxFeePerGas: '0x6fc23ac00', // 30 gwei
        maxPriorityFeePerGas: '0x77359400', // 2 gwei
        gasPriceGwei: '20.0',
        maxFeeGwei: '30.0'
      },
      latestBlock: {
        number: '0x1234567',
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        timestamp: '0x' + Math.floor(Date.now() / 1000).toString(16),
        gasUsed: '0x1c9c380',
        gasLimit: '0x1c9c380',
        baseFeePerGas: '0x3b9aca00'
      },
      network: {
        name: 'Ethereum Mainnet',
        chainId: 1,
        isLive: false
      },
      timestamp: new Date().toISOString(),
      source: 'fallback',
      note: 'Using fallback data due to API error'
    }

    res.status(200).json({
      success: true,
      data: fallbackData,
      fallback: true,
      error: error.message
    })
  }
}
