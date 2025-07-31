/**
 * Vercel API Route - Test Endpoint
 * Simple test to verify API routes are working
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

  console.log('🧪 Test API endpoint called')

  res.status(200).json({
    success: true,
    message: 'Connectouch API is working!',
    timestamp: new Date().toISOString(),
    apis: {
      coinmarketcap: 'Available at /api/crypto-data',
      alchemy: 'Available at /api/blockchain-data', 
      openai: 'Available at /api/ai-chat'
    }
  })
}
