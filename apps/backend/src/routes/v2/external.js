const express = require('express')
const router = express.Router()

// Middleware to track request start time
router.use((req, res, next) => {
  req.startTime = Date.now()
  next()
})

// External API health checks and proxy endpoints
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'External API routes are healthy',
    timestamp: new Date().toISOString()
  })
})

// CoinMarketCap API Health Check
router.get('/coinmarketcap/health', (req, res) => {
  const apiKey = process.env.COINMARKETCAP_API_KEY

  // Fast health check - just verify configuration
  const health = {
    success: true,
    service: 'CoinMarketCap API',
    status: apiKey ? 'configured' : 'not-configured',
    timestamp: new Date().toISOString(),
    responseTime: Date.now() - req.startTime
  }

  if (!apiKey) {
    health.success = false
    health.status = 'unavailable'
    health.error = 'API key not configured'
    return res.status(503).json(health)
  }

  res.json(health)
})

// Alchemy API Health Check
router.get('/alchemy/health', (req, res) => {
  const apiKey = process.env.ALCHEMY_API_KEY

  // Fast health check - just verify configuration
  const health = {
    success: true,
    service: 'Alchemy Blockchain API',
    status: apiKey ? 'configured' : 'not-configured',
    timestamp: new Date().toISOString(),
    responseTime: Date.now() - req.startTime
  }

  if (!apiKey) {
    health.success = false
    health.status = 'unavailable'
    health.error = 'API key not configured'
    return res.status(503).json(health)
  }

  res.json(health)
})

// OpenAI API Health Check
router.get('/openai/health', (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY

  // Fast health check - just verify configuration
  const health = {
    success: true,
    service: 'OpenAI GPT-4',
    status: apiKey ? 'configured' : 'not-configured',
    timestamp: new Date().toISOString(),
    responseTime: Date.now() - req.startTime
  }

  if (!apiKey) {
    health.success = false
    health.status = 'unavailable'
    health.error = 'API key not configured'
    return res.status(503).json(health)
  }

  res.json(health)
})

module.exports = router
