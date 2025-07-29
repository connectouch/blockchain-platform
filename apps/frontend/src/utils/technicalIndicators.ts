import { CandlestickData } from '../services/websocketService'

export interface IndicatorData {
  time: number
  value: number
}

export interface MAData extends IndicatorData {
  type: 'SMA' | 'EMA'
  period: number
}

export interface RSIData extends IndicatorData {
  period: number
}

export interface MACDData {
  time: number
  macd: number
  signal: number
  histogram: number
}

export interface BollingerBandsData {
  time: number
  upper: number
  middle: number
  lower: number
}

export class TechnicalIndicators {
  // Simple Moving Average
  static calculateSMA(data: CandlestickData[], period: number): MAData[] {
    const result: MAData[] = []
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1)
      const sum = slice.reduce((acc, candle) => acc + (candle?.close || 0), 0)
      const average = sum / period

      const currentCandle = data[i]
      if (currentCandle) {
        result.push({
          time: currentCandle.time,
          value: average,
          type: 'SMA',
          period
        })
      }
    }
    
    return result
  }

  // Exponential Moving Average
  static calculateEMA(data: CandlestickData[], period: number): MAData[] {
    const result: MAData[] = []
    const multiplier = 2 / (period + 1)
    
    if (data.length === 0) return result
    
    // First EMA is SMA
    let ema = data.slice(0, period).reduce((acc, candle) => acc + (candle?.close || 0), 0) / period
    const firstCandle = data[period - 1]
    if (firstCandle) {
      result.push({
        time: firstCandle.time,
        value: ema,
        type: 'EMA',
        period
      })
    }

    // Calculate subsequent EMAs
    for (let i = period; i < data.length; i++) {
      const currentCandle = data[i]
      if (currentCandle) {
        ema = (currentCandle.close - ema) * multiplier + ema
        result.push({
          time: currentCandle.time,
          value: ema,
          type: 'EMA',
          period
        })
      }
    }
    
    return result
  }

  // Relative Strength Index
  static calculateRSI(data: CandlestickData[], period: number = 14): RSIData[] {
    const result: RSIData[] = []
    
    if (data.length < period + 1) return result
    
    const gains: number[] = []
    const losses: number[] = []
    
    // Calculate price changes
    for (let i = 1; i < data.length; i++) {
      const current = data[i]
      const previous = data[i - 1]
      if (current && previous) {
        const change = current.close - previous.close
        gains.push(change > 0 ? change : 0)
        losses.push(change < 0 ? Math.abs(change) : 0)
      }
    }
    
    // Calculate initial average gain and loss
    let avgGain = gains.slice(0, period).reduce((acc, gain) => acc + gain, 0) / period
    let avgLoss = losses.slice(0, period).reduce((acc, loss) => acc + loss, 0) / period
    
    // Calculate RSI for each subsequent period
    for (let i = period; i < gains.length; i++) {
      const currentGain = gains[i]
      const currentLoss = losses[i]
      if (currentGain !== undefined && currentLoss !== undefined) {
        avgGain = (avgGain * (period - 1) + currentGain) / period
        avgLoss = (avgLoss * (period - 1) + currentLoss) / period

        const rs = avgGain / avgLoss
        const rsi = 100 - (100 / (1 + rs))

        const timeCandle = data[i + 1]
        if (timeCandle) {
          result.push({
            time: timeCandle.time,
            value: rsi,
            period
          })
        }
      }
    }
    
    return result
  }

  // MACD (Moving Average Convergence Divergence)
  static calculateMACD(data: CandlestickData[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): MACDData[] {
    const fastEMA = this.calculateEMA(data, fastPeriod)
    const slowEMA = this.calculateEMA(data, slowPeriod)
    
    if (fastEMA.length === 0 || slowEMA.length === 0) return []
    
    // Calculate MACD line
    const macdLine: IndicatorData[] = []
    const minLength = Math.min(fastEMA.length, slowEMA.length)
    
    for (let i = 0; i < minLength; i++) {
      macdLine.push({
        time: fastEMA[i].time,
        value: fastEMA[i].value - slowEMA[i].value
      })
    }
    
    // Calculate signal line (EMA of MACD)
    const signalLine = this.calculateEMAFromValues(macdLine, signalPeriod)
    
    // Calculate histogram
    const result: MACDData[] = []
    const signalMinLength = Math.min(macdLine.length, signalLine.length)
    
    for (let i = 0; i < signalMinLength; i++) {
      result.push({
        time: macdLine[i].time,
        macd: macdLine[i].value,
        signal: signalLine[i].value,
        histogram: macdLine[i].value - signalLine[i].value
      })
    }
    
    return result
  }

  // Bollinger Bands
  static calculateBollingerBands(data: CandlestickData[], period: number = 20, stdDev: number = 2): BollingerBandsData[] {
    const result: BollingerBandsData[] = []
    const sma = this.calculateSMA(data, period)
    
    for (let i = 0; i < sma.length; i++) {
      const dataIndex = i + period - 1
      const subset = data.slice(dataIndex - period + 1, dataIndex + 1)
      
      // Calculate standard deviation
      const mean = sma[i].value
      const variance = subset.reduce((acc, candle) => acc + Math.pow(candle.close - mean, 2), 0) / period
      const standardDeviation = Math.sqrt(variance)
      
      result.push({
        time: sma[i].time,
        upper: mean + (standardDeviation * stdDev),
        middle: mean,
        lower: mean - (standardDeviation * stdDev)
      })
    }
    
    return result
  }

  // Support and Resistance Levels
  static calculateSupportResistance(data: CandlestickData[], lookback: number = 20): { support: number[], resistance: number[] } {
    const support: number[] = []
    const resistance: number[] = []
    
    for (let i = lookback; i < data.length - lookback; i++) {
      const current = data[i]
      const before = data.slice(i - lookback, i)
      const after = data.slice(i + 1, i + lookback + 1)
      
      // Check for local minima (support)
      const isSupport = before.every(candle => current.low <= candle.low) && 
                       after.every(candle => current.low <= candle.low)
      
      // Check for local maxima (resistance)
      const isResistance = before.every(candle => current.high >= candle.high) && 
                          after.every(candle => current.high >= candle.high)
      
      if (isSupport) {
        support.push(current.low)
      }
      
      if (isResistance) {
        resistance.push(current.high)
      }
    }
    
    return { support, resistance }
  }

  // Helper function to calculate EMA from indicator values
  private static calculateEMAFromValues(data: IndicatorData[], period: number): IndicatorData[] {
    const result: IndicatorData[] = []
    const multiplier = 2 / (period + 1)
    
    if (data.length === 0) return result
    
    // First EMA is SMA
    let ema = data.slice(0, period).reduce((acc, item) => acc + item.value, 0) / period
    result.push({
      time: data[period - 1].time,
      value: ema
    })
    
    // Calculate subsequent EMAs
    for (let i = period; i < data.length; i++) {
      ema = (data[i].value - ema) * multiplier + ema
      result.push({
        time: data[i].time,
        value: ema
      })
    }
    
    return result
  }

  // Volume Weighted Average Price (VWAP)
  static calculateVWAP(data: CandlestickData[]): IndicatorData[] {
    const result: IndicatorData[] = []
    let cumulativeVolume = 0
    let cumulativeVolumePrice = 0
    
    for (const candle of data) {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3
      cumulativeVolumePrice += typicalPrice * candle.volume
      cumulativeVolume += candle.volume
      
      const vwap = cumulativeVolumePrice / cumulativeVolume
      
      result.push({
        time: candle.time,
        value: vwap
      })
    }
    
    return result
  }
}
