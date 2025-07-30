/**
 * Platform Health Monitor
 * Continuously monitors the platform health and sends alerts
 */

const HEALTH_CHECK_URL = 'https://connectouch.vercel.app/api/health-check'
const CRYPTO_PRICES_URL = 'https://connectouch.vercel.app/api/crypto-prices'
const NFT_COLLECTIONS_URL = 'https://connectouch.vercel.app/api/nft-collections'

class PlatformHealthMonitor {
  constructor() {
    this.healthHistory = []
    this.alertThreshold = 3 // Number of consecutive failures before alert
    this.checkInterval = 60000 // 1 minute
    this.isRunning = false
  }

  async checkEndpoint(url, name) {
    try {
      const startTime = Date.now()
      const response = await fetch(url, {
        method: 'GET',
        timeout: 10000 // 10 second timeout
      })
      
      const responseTime = Date.now() - startTime
      const isHealthy = response.ok
      
      let data = null
      try {
        data = await response.json()
      } catch (e) {
        // Response might not be JSON
      }

      return {
        name,
        url,
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime,
        httpStatus: response.status,
        timestamp: new Date().toISOString(),
        data: data ? (data.success !== false ? 'valid' : 'error') : 'no-data'
      }
    } catch (error) {
      return {
        name,
        url,
        status: 'down',
        responseTime: 0,
        httpStatus: 0,
        timestamp: new Date().toISOString(),
        error: error.message
      }
    }
  }

  async performHealthCheck() {
    console.log('🔍 Performing platform health check...')
    
    const checks = await Promise.all([
      this.checkEndpoint(HEALTH_CHECK_URL, 'Health Check API'),
      this.checkEndpoint(CRYPTO_PRICES_URL, 'Crypto Prices API'),
      this.checkEndpoint(NFT_COLLECTIONS_URL, 'NFT Collections API')
    ])

    const healthReport = {
      timestamp: new Date().toISOString(),
      checks,
      overallStatus: checks.every(check => check.status === 'healthy') ? 'healthy' : 'degraded',
      averageResponseTime: checks.reduce((sum, check) => sum + check.responseTime, 0) / checks.length
    }

    this.healthHistory.push(healthReport)
    
    // Keep only last 100 checks
    if (this.healthHistory.length > 100) {
      this.healthHistory = this.healthHistory.slice(-100)
    }

    // Check for consecutive failures
    const recentChecks = this.healthHistory.slice(-this.alertThreshold)
    const consecutiveFailures = recentChecks.every(check => check.overallStatus !== 'healthy')
    
    if (consecutiveFailures && recentChecks.length === this.alertThreshold) {
      await this.sendAlert(healthReport)
    }

    this.logHealthReport(healthReport)
    return healthReport
  }

  async sendAlert(healthReport) {
    console.error('🚨 PLATFORM ALERT: Multiple consecutive health check failures!')
    console.error('Health Report:', JSON.stringify(healthReport, null, 2))
    
    // In a production environment, you would send this to:
    // - Email notifications
    // - Slack/Discord webhooks
    // - SMS alerts
    // - Monitoring services (DataDog, New Relic, etc.)
    
    // For now, we'll log it prominently
    console.error('=' .repeat(80))
    console.error('CRITICAL PLATFORM ISSUE DETECTED')
    console.error('Time:', healthReport.timestamp)
    console.error('Overall Status:', healthReport.overallStatus)
    console.error('Failed Checks:')
    healthReport.checks.forEach(check => {
      if (check.status !== 'healthy') {
        console.error(`  - ${check.name}: ${check.status} (${check.error || check.httpStatus})`)
      }
    })
    console.error('=' .repeat(80))
  }

  logHealthReport(report) {
    const status = report.overallStatus === 'healthy' ? '✅' : '⚠️'
    console.log(`${status} Platform Health: ${report.overallStatus.toUpperCase()}`)
    console.log(`   Average Response Time: ${Math.round(report.averageResponseTime)}ms`)
    
    report.checks.forEach(check => {
      const checkStatus = check.status === 'healthy' ? '✅' : '❌'
      console.log(`   ${checkStatus} ${check.name}: ${check.responseTime}ms`)
    })
    console.log('---')
  }

  start() {
    if (this.isRunning) {
      console.log('Health monitor is already running')
      return
    }

    console.log('🚀 Starting Platform Health Monitor...')
    this.isRunning = true
    
    // Perform initial check
    this.performHealthCheck()
    
    // Set up recurring checks
    this.intervalId = setInterval(() => {
      this.performHealthCheck()
    }, this.checkInterval)
    
    console.log(`✅ Health monitor started (checking every ${this.checkInterval / 1000}s)`)
  }

  stop() {
    if (!this.isRunning) {
      console.log('Health monitor is not running')
      return
    }

    console.log('🛑 Stopping Platform Health Monitor...')
    clearInterval(this.intervalId)
    this.isRunning = false
    console.log('✅ Health monitor stopped')
  }

  getHealthHistory() {
    return this.healthHistory
  }

  getHealthSummary() {
    if (this.healthHistory.length === 0) {
      return { message: 'No health data available' }
    }

    const recent = this.healthHistory.slice(-10) // Last 10 checks
    const healthyCount = recent.filter(check => check.overallStatus === 'healthy').length
    const uptime = (healthyCount / recent.length) * 100

    return {
      totalChecks: this.healthHistory.length,
      recentUptime: `${uptime.toFixed(1)}%`,
      lastCheck: this.healthHistory[this.healthHistory.length - 1],
      averageResponseTime: Math.round(
        recent.reduce((sum, check) => sum + check.averageResponseTime, 0) / recent.length
      )
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlatformHealthMonitor
}

// Auto-start if running directly
if (typeof window === 'undefined' && require.main === module) {
  const monitor = new PlatformHealthMonitor()
  monitor.start()
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...')
    monitor.stop()
    process.exit(0)
  })
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...')
    monitor.stop()
    process.exit(0)
  })
}
