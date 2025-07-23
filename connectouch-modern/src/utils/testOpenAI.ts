// Test OpenAI API connection
export async function testOpenAIConnection() {
  const apiKey = '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'
  
  console.log('🔍 Testing OpenAI API connection...')
  console.log('API Key available:', !!apiKey)
  console.log('API Key length:', apiKey.length)
  console.log('API Key starts with:', apiKey.substring(0, 20) + '...')
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'user', content: 'Hello! Just testing the connection. Please respond with "Connection successful!"' }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API Error:', response.status, errorText)
      return { success: false, error: `HTTP ${response.status}: ${errorText}` }
    }

    const data = await response.json()
    console.log('OpenAI Response:', data)
    
    if (data.choices && data.choices[0]?.message?.content) {
      console.log('✅ OpenAI API connection successful!')
      console.log('Response:', data.choices[0].message.content)
      return { success: true, response: data.choices[0].message.content }
    } else {
      console.error('❌ Invalid response format:', data)
      return { success: false, error: 'Invalid response format' }
    }
  } catch (error) {
    console.error('❌ OpenAI API connection failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testOpenAI = testOpenAIConnection
}
