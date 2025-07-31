/**
 * Test OpenAI API Key
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Use the VALID OpenAI API key you confirmed
  const API_KEY = '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'

  try {
    console.log('🧪 Testing OpenAI API key...')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Say "Hello from Connectouch!" in exactly those words.'
          }
        ],
        max_tokens: 50
      })
    })

    const responseText = await response.text()
    console.log('OpenAI Response Status:', response.status)
    console.log('OpenAI Response:', responseText)

    if (!response.ok) {
      return res.status(200).json({
        success: false,
        error: `OpenAI API Error: ${response.status}`,
        details: responseText,
        keyStatus: 'Invalid or expired'
      })
    }

    const data = JSON.parse(responseText)
    
    res.status(200).json({
      success: true,
      message: data.choices[0].message.content,
      keyStatus: 'Valid',
      model: data.model,
      usage: data.usage
    })

  } catch (error) {
    console.error('❌ OpenAI test error:', error)
    
    res.status(200).json({
      success: false,
      error: error.message,
      keyStatus: 'Error testing key'
    })
  }
}
