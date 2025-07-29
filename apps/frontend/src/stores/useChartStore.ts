import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  ChartState,
  ChartActions,
  // ChartConfig,
  IndicatorConfig,
  // DrawingTool,
  // TimeFrame,
  PriceAlert,
  // ChartAnnotation,
  DEFAULT_CHART_CONFIG,
  // INDICATOR_COLORS
} from '../types/chart'
import { CandlestickData } from '../services/websocketService'
import { TechnicalIndicators } from '../utils/technicalIndicators'

interface ChartStore extends ChartState, ChartActions {}

export const useChartStore = create<ChartStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    config: DEFAULT_CHART_CONFIG,
    data: {
      candlesticks: [],
      volume: [],
      indicators: {}
    },
    dimensions: {
      width: 800,
      height: 600,
      candlestickHeight: 400,
      volumeHeight: 100,
      indicatorHeight: 100
    },
    isLoading: false,
    error: null,
    lastUpdate: new Date(),
    zoom: {
      start: 0,
      end: 100
    },
    crosshair: {
      visible: false,
      time: 0,
      price: 0
    },
    alerts: [],
    annotations: [],

    // Actions
    updateConfig: (newConfig) => {
      set((state) => ({
        config: { ...state.config, ...newConfig },
        lastUpdate: new Date()
      }))
    },

    addIndicator: (indicator) => {
      set((state) => {
        const newIndicators = [...state.config.indicators, indicator]
        return {
          config: { ...state.config, indicators: newIndicators },
          lastUpdate: new Date()
        }
      })
      
      // Recalculate indicators
      // get().recalculateIndicators() // Will be called after method is defined
    },

    removeIndicator: (indicatorId) => {
      set((state) => {
        const newIndicators = state.config.indicators.filter(ind => ind.id !== indicatorId)
        const newIndicatorData = { ...state.data.indicators }
        delete newIndicatorData[indicatorId]
        
        return {
          config: { ...state.config, indicators: newIndicators },
          data: { ...state.data, indicators: newIndicatorData },
          lastUpdate: new Date()
        }
      })
    },

    updateIndicator: (indicatorId, settings) => {
      set((state) => {
        const newIndicators = state.config.indicators.map(ind => 
          ind.id === indicatorId 
            ? { ...ind, settings: { ...ind.settings, ...settings } }
            : ind
        )
        
        return {
          config: { ...state.config, indicators: newIndicators },
          lastUpdate: new Date()
        }
      })
      
      // Recalculate specific indicator
      // get().recalculateIndicator(indicatorId) // Will be called after method is defined
    },

    addDrawingTool: (tool) => {
      set((state) => ({
        config: { 
          ...state.config, 
          drawingTools: [...state.config.drawingTools, tool] 
        },
        lastUpdate: new Date()
      }))
    },

    removeDrawingTool: (toolId) => {
      set((state) => ({
        config: { 
          ...state.config, 
          drawingTools: state.config.drawingTools.filter(tool => tool.id !== toolId) 
        },
        lastUpdate: new Date()
      }))
    },

    setTimeframe: (timeframe) => {
      set((state) => ({
        config: { ...state.config, timeframe },
        isLoading: true,
        lastUpdate: new Date()
      }))
      
      // Trigger data reload for new timeframe
      get().loadChartData()
    },

    setSymbol: (symbol) => {
      set((state) => ({
        config: { ...state.config, symbol },
        isLoading: true,
        lastUpdate: new Date()
      }))
      
      // Trigger data reload for new symbol
      get().loadChartData()
    },

    addAlert: (alert) => {
      const newAlert: PriceAlert = {
        ...alert,
        id: `alert-${Date.now()}`,
        createdAt: new Date()
      }
      
      set((state) => ({
        alerts: [...state.alerts, newAlert],
        lastUpdate: new Date()
      }))
    },

    removeAlert: (alertId) => {
      set((state) => ({
        alerts: state.alerts.filter(alert => alert.id !== alertId),
        lastUpdate: new Date()
      }))
    },

    addAnnotation: (annotation) => {
      set((state) => ({
        annotations: [...state.annotations, annotation],
        lastUpdate: new Date()
      }))
    },

    removeAnnotation: (annotationId) => {
      set((state) => ({
        annotations: state.annotations.filter(ann => ann.id !== annotationId),
        lastUpdate: new Date()
      }))
    },

    zoomToRange: (start, end) => {
      set((_state) => ({
        zoom: { start, end },
        lastUpdate: new Date()
      }))
    },

    resetZoom: () => {
      set((_state) => ({
        zoom: { start: 0, end: 100 },
        lastUpdate: new Date()
      }))
    },

    // Helper methods (not part of the store interface but useful)
    loadChartData: async () => {
      const { config } = get()
      set({ isLoading: true, error: null })
      
      try {
        // Fetch historical data from API (using frontend proxy)
        const response = await fetch(
          `/api/v2/blockchain/chart/${config.symbol}?timeframe=${config.timeframe}&limit=500`
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch chart data')
        }
        
        const data = await response.json()
        
        if (data.success) {
          const candlesticks: CandlestickData[] = data.data.candlesticks || []
          const volume = candlesticks.map(candle => ({
            time: candle.time,
            volume: candle.volume,
            color: candle.close >= candle.open ? 'green' as const : 'red' as const
          }))
          
          set({
            data: { candlesticks, volume, indicators: {} },
            isLoading: false,
            lastUpdate: new Date()
          })
          
          // Calculate indicators
          // get().recalculateIndicators() // Will be called after method is defined
        } else {
          throw new Error(data.message || 'Failed to load chart data')
        }
      } catch (error) {
        console.error('Error loading chart data:', error)
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error',
          isLoading: false 
        })
        
        // Use mock data for development
        // get().loadMockData() // Will be called after method is defined
      }
    },

    loadMockData: () => {
      const mockCandlesticks: CandlestickData[] = []
      const basePrice = 50000
      let currentPrice = basePrice
      
      for (let i = 0; i < 100; i++) {
        const time = Date.now() - (100 - i) * 60000 // 1 minute intervals
        const change = (Math.random() - 0.5) * 1000
        const open = currentPrice
        const close = open + change
        const high = Math.max(open, close) + Math.random() * 500
        const low = Math.min(open, close) - Math.random() * 500
        const volume = Math.random() * 1000000
        
        mockCandlesticks.push({ time, open, high, low, close, volume })
        currentPrice = close
      }
      
      const volume = mockCandlesticks.map(candle => ({
        time: candle.time,
        volume: candle.volume,
        color: candle.close >= candle.open ? 'green' as const : 'red' as const
      }))
      
      set({
        data: { candlesticks: mockCandlesticks, volume, indicators: {} },
        isLoading: false,
        lastUpdate: new Date()
      })
      
      get().recalculateIndicators()
    },

    recalculateIndicators: () => {
      const { data, config } = get()
      const newIndicatorData: any = {}
      
      config.indicators.forEach(indicator => {
        if (indicator.enabled) {
          newIndicatorData[indicator.id] = get().calculateIndicatorData(indicator, data.candlesticks)
        }
      })
      
      set((state) => ({
        data: { ...state.data, indicators: newIndicatorData },
        lastUpdate: new Date()
      }))
    },

    calculateIndicatorData: (indicator: IndicatorConfig, candlesticks: any[]) => {
      // Simple placeholder implementation for technical indicators
      // In a real application, this would use proper technical analysis libraries
      switch (indicator.type) {
        case 'sma':
          return candlesticks.map((candle, index) => ({
            time: candle.time,
            value: candle.close,
            type: 'SMA'
          }))
        case 'ema':
          return candlesticks.map((candle, index) => ({
            time: candle.time,
            value: candle.close,
            type: 'EMA'
          }))
        case 'rsi':
          return candlesticks.map((candle, index) => ({
            time: candle.time,
            value: 50, // Placeholder RSI value
            type: 'RSI'
          }))
        default:
          return []
      }
    },

    recalculateIndicator: (indicatorId: string) => {
      const { data, config } = get()
      const indicator = config.indicators.find(ind => ind.id === indicatorId)

      if (indicator && indicator.enabled) {
        const indicatorData = get().calculateIndicatorData(indicator, data.candlesticks)

        set((state) => ({
          data: {
            ...state.data,
            indicators: {
              ...state.data.indicators,
              [indicatorId]: indicatorData
            }
          },
          lastUpdate: new Date()
        }))
      }
    },

    calculateIndicatorData: (indicator: IndicatorConfig, candlesticks: CandlestickData[]) => {
      switch (indicator.type) {
        case 'SMA':
          return TechnicalIndicators.calculateSMA(candlesticks, indicator.settings.period || 20)
        case 'EMA':
          return TechnicalIndicators.calculateEMA(candlesticks, indicator.settings.period || 20)
        case 'RSI':
          return TechnicalIndicators.calculateRSI(candlesticks, indicator.settings.period || 14)
        case 'MACD':
          return TechnicalIndicators.calculateMACD(
            candlesticks,
            indicator.settings.fastPeriod || 12,
            indicator.settings.slowPeriod || 26,
            indicator.settings.signalPeriod || 9
          )
        case 'BollingerBands':
          return TechnicalIndicators.calculateBollingerBands(
            candlesticks,
            indicator.settings.period || 20,
            indicator.settings.stdDev || 2
          )
        case 'VWAP':
          return TechnicalIndicators.calculateVWAP(candlesticks)
        case 'SupportResistance':
          return TechnicalIndicators.calculateSupportResistance(
            candlesticks,
            indicator.settings.lookback || 20
          )
        default:
          return []
      }
    },

    updateCandlestick: (newCandle: CandlestickData) => {
      set((state) => {
        const candlesticks = [...state.data.candlesticks]
        const lastIndex = candlesticks.length - 1
        
        // Update last candle or add new one
        if (lastIndex >= 0 && candlesticks[lastIndex].time === newCandle.time) {
          candlesticks[lastIndex] = newCandle
        } else {
          candlesticks.push(newCandle)
        }
        
        // Keep only last 500 candles for performance
        if (candlesticks.length > 500) {
          candlesticks.splice(0, candlesticks.length - 500)
        }
        
        const volume = candlesticks.map(candle => ({
          time: candle.time,
          volume: candle.volume,
          color: candle.close >= candle.open ? 'green' as const : 'red' as const
        }))
        
        return {
          data: { ...state.data, candlesticks, volume },
          lastUpdate: new Date()
        }
      })
      
      // Recalculate indicators with new data
      get().recalculateIndicators()
    }
  }))
)
