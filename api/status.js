/**
 * API Status Endpoint - Check all API integrations
 * Tests all your provided API keys and shows their status
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

  console.log('🔍 Checking API status for all services...')

  const results = {
    timestamp: new Date().toISOString(),
    apis: {}
  }

  // Test CoinMarketCap API
  try {
    console.log('📊 Testing CoinMarketCap API...')
    const cmcResponse = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=5&convert=USD', {
      headers: {
        'X-CMC_PRO_API_KEY': 'd714f7e6-91a5-47ac-866e-f28f26eee302',
        'Accept': 'application/json'
      }
    })

    if (cmcResponse.ok) {
      const cmcData = await cmcResponse.json()
      results.apis.coinmarketcap = {
        status: 'working',
        message: `Successfully fetched ${cmcData.data.length} cryptocurrencies`,
        key: 'd714f7e6-91a5-47ac-866e-f28f26eee302',
        keyStatus: 'valid',
        lastTest: new Date().toISOString()
      }
      console.log('✅ CoinMarketCap API: WORKING')
    } else {
      const errorText = await cmcResponse.text()
      results.apis.coinmarketcap = {
        status: 'error',
        message: `HTTP ${cmcResponse.status}: ${errorText}`,
        key: 'd714f7e6-91a5-47ac-866e-f28f26eee302',
        keyStatus: 'invalid or rate limited',
        lastTest: new Date().toISOString()
      }
      console.log('❌ CoinMarketCap API: ERROR')
    }
  } catch (error) {
    results.apis.coinmarketcap = {
      status: 'error',
      message: error.message,
      key: 'd714f7e6-91a5-47ac-866e-f28f26eee302',
      keyStatus: 'error',
      lastTest: new Date().toISOString()
    }
    console.log('❌ CoinMarketCap API: EXCEPTION')
  }

  // Test Alchemy API
  try {
    console.log('⛓️ Testing Alchemy API...')
    const alchemyResponse = await fetch('https://eth-mainnet.g.alchemy.com/v2/alcht_4VtVtdF68sMtNaLupR7oPQ1wDSFNc4', {
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

    if (alchemyResponse.ok) {
      const alchemyData = await alchemyResponse.json()
      if (alchemyData.result) {
        const gasPriceGwei = (parseInt(alchemyData.result, 16) / 1e9).toFixed(1)
        results.apis.alchemy = {
          status: 'working',
          message: `Successfully fetched gas price: ${gasPriceGwei} gwei`,
          key: 'alcht_4VtVtdF68sMtNaLupR7oPQ1wDSFNc4',
          keyStatus: 'valid',
          lastTest: new Date().toISOString()
        }
        console.log('✅ Alchemy API: WORKING')
      } else {
        results.apis.alchemy = {
          status: 'error',
          message: 'No result in response',
          key: 'alcht_4VtVtdF68sMtNaLupR7oPQ1wDSFNc4',
          keyStatus: 'invalid response',
          lastTest: new Date().toISOString()
        }
        console.log('❌ Alchemy API: NO RESULT')
      }
    } else {
      const errorText = await alchemyResponse.text()
      results.apis.alchemy = {
        status: 'error',
        message: `HTTP ${alchemyResponse.status}: ${errorText}`,
        key: 'alcht_4VtVtdF68sMtNaLupR7oPQ1wDSFNc4',
        keyStatus: 'invalid or rate limited',
        lastTest: new Date().toISOString()
      }
      console.log('❌ Alchemy API: ERROR')
    }
  } catch (error) {
    results.apis.alchemy = {
      status: 'error',
      message: error.message,
      key: 'alcht_4VtVtdF68sMtNaLupR7oPQ1wDSFNc4',
      keyStatus: 'error',
      lastTest: new Date().toISOString()
    }
    console.log('❌ Alchemy API: EXCEPTION')
  }

  // Test OpenAI API
  try {
    console.log('🤖 Testing OpenAI API...')
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Say "API test successful" in exactly those words.'
          }
        ],
        max_tokens: 10
      })
    })

    if (openaiResponse.ok) {
      const openaiData = await openaiResponse.json()
      results.apis.openai = {
        status: 'working',
        message: `Successfully generated response: "${openaiData.choices[0].message.content}"`,
        key: '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',
        keyStatus: 'valid',
        model: openaiData.model,
        usage: openaiData.usage,
        lastTest: new Date().toISOString()
      }
      console.log('✅ OpenAI API: WORKING')
    } else {
      const errorText = await openaiResponse.text()
      results.apis.openai = {
        status: 'error',
        message: `HTTP ${openaiResponse.status}: ${errorText}`,
        key: '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',
        keyStatus: 'invalid or expired',
        lastTest: new Date().toISOString()
      }
      console.log('❌ OpenAI API: ERROR')
    }
  } catch (error) {
    results.apis.openai = {
      status: 'error',
      message: error.message,
      key: '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',
      keyStatus: 'error',
      lastTest: new Date().toISOString()
    }
    console.log('❌ OpenAI API: EXCEPTION')
  }

  // Calculate overall status
  const workingApis = Object.values(results.apis).filter(api => api.status === 'working').length
  const totalApis = Object.keys(results.apis).length
  
  results.summary = {
    workingApis,
    totalApis,
    overallStatus: workingApis === totalApis ? 'all_working' : workingApis > 0 ? 'partial' : 'all_failed',
    message: `${workingApis}/${totalApis} APIs are working`
  }

  console.log(`📊 API Status Summary: ${workingApis}/${totalApis} APIs working`)

  res.status(200).json({
    success: true,
    data: results
  })
}
