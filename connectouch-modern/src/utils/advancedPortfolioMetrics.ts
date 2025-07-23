/**
 * Advanced Portfolio Metrics Utility
 * Implements sophisticated financial calculations for Phase 4 Portfolio Management
 * Following Augment Agent methodology with latest 2025 financial algorithms
 */

export interface AdvancedMetrics {
  sharpeRatio: number
  sortinoRatio: number
  calmarRatio: number
  maxDrawdown: number
  var95: number
  var99: number
  conditionalVaR: number
  beta: number
  alpha: number
  informationRatio: number
  treynorRatio: number
  trackingError: number
  correlationMatrix: number[][]
  diversificationRatio: number
  concentrationIndex: number
  volatility: number
  skewness: number
  kurtosis: number
  downside_deviation: number
  upside_capture: number
  downside_capture: number
}

export interface PortfolioHolding {
  symbol: string
  amount: number
  value: number
  weight: number
  returns: number[]
  prices: number[]
  purchasePrice: number
  currentPrice: number
}

export interface MarketData {
  riskFreeRate: number
  marketReturns: number[]
  benchmarkReturns: number[]
}

/**
 * Calculate Sharpe Ratio
 * Risk-adjusted return metric
 */
export function calculateSharpeRatio(
  portfolioReturns: number[],
  riskFreeRate: number
): number {
  if (portfolioReturns.length === 0) return 0
  
  const excessReturns = portfolioReturns.map(r => r - riskFreeRate)
  const meanExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length
  const volatility = calculateVolatility(excessReturns)
  
  return volatility === 0 ? 0 : meanExcessReturn / volatility
}

/**
 * Calculate Sortino Ratio
 * Downside risk-adjusted return metric
 */
export function calculateSortinoRatio(
  portfolioReturns: number[],
  riskFreeRate: number,
  targetReturn: number = 0
): number {
  if (portfolioReturns.length === 0) return 0
  
  const excessReturns = portfolioReturns.map(r => r - riskFreeRate)
  const meanExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length
  const downsideDeviation = calculateDownsideDeviation(portfolioReturns, targetReturn)
  
  return downsideDeviation === 0 ? 0 : meanExcessReturn / downsideDeviation
}

/**
 * Calculate Maximum Drawdown
 * Largest peak-to-trough decline
 */
export function calculateMaxDrawdown(prices: number[]): number {
  if (prices.length < 2) return 0
  
  let maxDrawdown = 0
  let peak = prices[0]
  
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > peak) {
      peak = prices[i]
    } else {
      const drawdown = (peak - prices[i]) / peak
      maxDrawdown = Math.max(maxDrawdown, drawdown)
    }
  }
  
  return maxDrawdown
}

/**
 * Calculate Value at Risk (VaR)
 * Potential loss at given confidence level
 */
export function calculateVaR(
  portfolioReturns: number[],
  confidenceLevel: number = 0.95
): number {
  if (portfolioReturns.length === 0) return 0
  
  const sortedReturns = [...portfolioReturns].sort((a, b) => a - b)
  const index = Math.floor((1 - confidenceLevel) * sortedReturns.length)
  
  return Math.abs(sortedReturns[index] || 0)
}

/**
 * Calculate Conditional Value at Risk (CVaR)
 * Expected loss beyond VaR threshold
 */
export function calculateConditionalVaR(
  portfolioReturns: number[],
  confidenceLevel: number = 0.95
): number {
  if (portfolioReturns.length === 0) return 0
  
  const valueAtRisk = calculateVaR(portfolioReturns, confidenceLevel)
  const tailLosses = portfolioReturns.filter(r => r <= -valueAtRisk)

  if (tailLosses.length === 0) return valueAtRisk
  
  return Math.abs(tailLosses.reduce((sum, loss) => sum + loss, 0) / tailLosses.length)
}

/**
 * Calculate Portfolio Beta
 * Systematic risk relative to market
 */
export function calculateBeta(
  portfolioReturns: number[],
  marketReturns: number[]
): number {
  if (portfolioReturns.length !== marketReturns.length || portfolioReturns.length === 0) return 1
  
  const covariance = calculateCovariance(portfolioReturns, marketReturns)
  const marketVariance = calculateVariance(marketReturns)
  
  return marketVariance === 0 ? 1 : covariance / marketVariance
}

/**
 * Calculate Portfolio Alpha
 * Excess return over expected return based on beta
 */
export function calculateAlpha(
  portfolioReturns: number[],
  marketReturns: number[],
  riskFreeRate: number
): number {
  if (portfolioReturns.length === 0) return 0
  
  const portfolioReturn = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length
  const marketReturn = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length
  const beta = calculateBeta(portfolioReturns, marketReturns)
  
  return portfolioReturn - (riskFreeRate + beta * (marketReturn - riskFreeRate))
}

/**
 * Calculate Correlation Matrix
 * Correlation between all portfolio holdings
 */
export function calculateCorrelationMatrix(holdings: PortfolioHolding[]): number[][] {
  const n = holdings.length
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0))
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1
      } else {
        matrix[i][j] = calculateCorrelation(holdings[i].returns, holdings[j].returns)
      }
    }
  }
  
  return matrix
}

/**
 * Calculate Diversification Ratio
 * Weighted average volatility / portfolio volatility
 */
export function calculateDiversificationRatio(holdings: PortfolioHolding[]): number {
  if (holdings.length === 0) return 1
  
  const weightedVolatility = holdings.reduce((sum, holding) => {
    const volatility = calculateVolatility(holding.returns)
    return sum + (holding.weight * volatility)
  }, 0)
  
  const portfolioReturns = calculatePortfolioReturns(holdings)
  const portfolioVolatility = calculateVolatility(portfolioReturns)
  
  return portfolioVolatility === 0 ? 1 : weightedVolatility / portfolioVolatility
}

/**
 * Helper Functions
 */

function calculateVolatility(returns: number[]): number {
  if (returns.length === 0) return 0
  return Math.sqrt(calculateVariance(returns))
}

function calculateVariance(returns: number[]): number {
  if (returns.length === 0) return 0
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const squaredDiffs = returns.map(r => Math.pow(r - mean, 2))
  
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / returns.length
}

function calculateCovariance(returns1: number[], returns2: number[]): number {
  if (returns1.length !== returns2.length || returns1.length === 0) return 0
  
  const mean1 = returns1.reduce((sum, r) => sum + r, 0) / returns1.length
  const mean2 = returns2.reduce((sum, r) => sum + r, 0) / returns2.length
  
  const covariance = returns1.reduce((sum, r1, i) => {
    return sum + (r1 - mean1) * (returns2[i] - mean2)
  }, 0) / returns1.length
  
  return covariance
}

function calculateCorrelation(returns1: number[], returns2: number[]): number {
  const covariance = calculateCovariance(returns1, returns2)
  const vol1 = calculateVolatility(returns1)
  const vol2 = calculateVolatility(returns2)
  
  return (vol1 === 0 || vol2 === 0) ? 0 : covariance / (vol1 * vol2)
}

function calculateDownsideDeviation(returns: number[], targetReturn: number): number {
  const downsideReturns = returns.filter(r => r < targetReturn)
  if (downsideReturns.length === 0) return 0
  
  const squaredDownsideDeviations = downsideReturns.map(r => Math.pow(r - targetReturn, 2))
  const meanSquaredDeviation = squaredDownsideDeviations.reduce((sum, dev) => sum + dev, 0) / downsideReturns.length
  
  return Math.sqrt(meanSquaredDeviation)
}

function calculatePortfolioReturns(holdings: PortfolioHolding[]): number[] {
  if (holdings.length === 0) return []
  
  const maxLength = Math.max(...holdings.map(h => h.returns.length))
  const portfolioReturns: number[] = []
  
  for (let i = 0; i < maxLength; i++) {
    let weightedReturn = 0
    let totalWeight = 0
    
    holdings.forEach(holding => {
      if (i < holding.returns.length) {
        weightedReturn += holding.returns[i] * holding.weight
        totalWeight += holding.weight
      }
    })
    
    portfolioReturns.push(totalWeight > 0 ? weightedReturn / totalWeight : 0)
  }
  
  return portfolioReturns
}

/**
 * Calculate all advanced metrics for a portfolio
 */
export function calculateAdvancedMetrics(
  holdings: PortfolioHolding[],
  marketData: MarketData
): AdvancedMetrics {
  const portfolioReturns = calculatePortfolioReturns(holdings)
  
  return {
    sharpeRatio: calculateSharpeRatio(portfolioReturns, marketData.riskFreeRate),
    sortinoRatio: calculateSortinoRatio(portfolioReturns, marketData.riskFreeRate),
    calmarRatio: calculateCalmarRatio(portfolioReturns),
    maxDrawdown: calculateMaxDrawdown(portfolioReturns),
    var95: calculateVaR(portfolioReturns, 0.95),
    var99: calculateVaR(portfolioReturns, 0.99),
    conditionalVaR: calculateConditionalVaR(portfolioReturns, 0.95),
    beta: calculateBeta(portfolioReturns, marketData.marketReturns),
    alpha: calculateAlpha(portfolioReturns, marketData.marketReturns, marketData.riskFreeRate),
    informationRatio: calculateInformationRatio(portfolioReturns, marketData.benchmarkReturns),
    treynorRatio: calculateTreynorRatio(portfolioReturns, marketData.marketReturns, marketData.riskFreeRate),
    trackingError: calculateTrackingError(portfolioReturns, marketData.benchmarkReturns),
    correlationMatrix: calculateCorrelationMatrix(holdings),
    diversificationRatio: calculateDiversificationRatio(holdings),
    concentrationIndex: calculateConcentrationIndex(holdings),
    volatility: calculateVolatility(portfolioReturns),
    skewness: calculateSkewness(portfolioReturns),
    kurtosis: calculateKurtosis(portfolioReturns),
    downside_deviation: calculateDownsideDeviation(portfolioReturns, 0),
    upside_capture: calculateUpsideCapture(portfolioReturns, marketData.marketReturns),
    downside_capture: calculateDownsideCapture(portfolioReturns, marketData.marketReturns)
  }
}

// Additional helper functions for complete metrics
function calculateCalmarRatio(returns: number[]): number {
  if (returns.length === 0) return 0
  const annualizedReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length * 252
  const maxDD = calculateMaxDrawdown(returns)
  return maxDD === 0 ? 0 : annualizedReturn / maxDD
}

function calculateInformationRatio(portfolioReturns: number[], benchmarkReturns: number[]): number {
  if (portfolioReturns.length !== benchmarkReturns.length) return 0
  const excessReturns = portfolioReturns.map((r, i) => r - (benchmarkReturns[i] || 0))
  const meanExcess = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length
  const trackingError = calculateVolatility(excessReturns)
  return trackingError === 0 ? 0 : meanExcess / trackingError
}

function calculateTreynorRatio(portfolioReturns: number[], marketReturns: number[], riskFreeRate: number): number {
  const beta = calculateBeta(portfolioReturns, marketReturns)
  const portfolioReturn = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length
  return beta === 0 ? 0 : (portfolioReturn - riskFreeRate) / beta
}

function calculateTrackingError(portfolioReturns: number[], benchmarkReturns: number[]): number {
  if (portfolioReturns.length !== benchmarkReturns.length) return 0
  const excessReturns = portfolioReturns.map((r, i) => r - (benchmarkReturns[i] || 0))
  return calculateVolatility(excessReturns)
}

function calculateConcentrationIndex(holdings: PortfolioHolding[]): number {
  return holdings.reduce((sum, holding) => sum + Math.pow(holding.weight, 2), 0)
}

function calculateSkewness(returns: number[]): number {
  if (returns.length === 0) return 0
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = calculateVariance(returns)
  const skewness = returns.reduce((sum, r) => sum + Math.pow(r - mean, 3), 0) / returns.length
  return variance === 0 ? 0 : skewness / Math.pow(variance, 1.5)
}

function calculateKurtosis(returns: number[]): number {
  if (returns.length === 0) return 0
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = calculateVariance(returns)
  const kurtosis = returns.reduce((sum, r) => sum + Math.pow(r - mean, 4), 0) / returns.length
  return variance === 0 ? 0 : (kurtosis / Math.pow(variance, 2)) - 3
}

function calculateUpsideCapture(portfolioReturns: number[], marketReturns: number[]): number {
  if (portfolioReturns.length !== marketReturns.length) return 0
  const upMarketPeriods = marketReturns.map((r, i) => r > 0 ? { portfolio: portfolioReturns[i], market: r } : null).filter(Boolean)
  if (upMarketPeriods.length === 0) return 0
  const avgPortfolioUp = upMarketPeriods.reduce((sum, p) => sum + p!.portfolio, 0) / upMarketPeriods.length
  const avgMarketUp = upMarketPeriods.reduce((sum, p) => sum + p!.market, 0) / upMarketPeriods.length
  return avgMarketUp === 0 ? 0 : avgPortfolioUp / avgMarketUp
}

function calculateDownsideCapture(portfolioReturns: number[], marketReturns: number[]): number {
  if (portfolioReturns.length !== marketReturns.length) return 0
  const downMarketPeriods = marketReturns.map((r, i) => r < 0 ? { portfolio: portfolioReturns[i], market: r } : null).filter(Boolean)
  if (downMarketPeriods.length === 0) return 0
  const avgPortfolioDown = downMarketPeriods.reduce((sum, p) => sum + p!.portfolio, 0) / downMarketPeriods.length
  const avgMarketDown = downMarketPeriods.reduce((sum, p) => sum + p!.market, 0) / downMarketPeriods.length
  return avgMarketDown === 0 ? 0 : avgPortfolioDown / avgMarketDown
}
