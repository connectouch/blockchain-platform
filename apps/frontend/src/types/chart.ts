import { CandlestickData } from '../services/websocketService'

export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w'

export interface ChartConfig {
  symbol: string
  timeframe: TimeFrame
  showVolume: boolean
  showGrid: boolean
  theme: 'dark' | 'light'
  indicators: IndicatorConfig[]
  drawingTools: DrawingTool[]
}

export interface IndicatorConfig {
  id: string
  type: IndicatorType
  enabled: boolean
  settings: IndicatorSettings
  color: string
  lineWidth: number
}

export type IndicatorType = 
  | 'SMA' 
  | 'EMA' 
  | 'RSI' 
  | 'MACD' 
  | 'BollingerBands' 
  | 'VWAP'
  | 'SupportResistance'

export interface IndicatorSettings {
  period?: number
  fastPeriod?: number
  slowPeriod?: number
  signalPeriod?: number
  stdDev?: number
  lookback?: number
}

export interface DrawingTool {
  id: string
  type: DrawingToolType
  points: Point[]
  color: string
  lineWidth: number
  style: 'solid' | 'dashed' | 'dotted'
  enabled: boolean
}

export type DrawingToolType = 
  | 'trendline' 
  | 'horizontal' 
  | 'vertical' 
  | 'rectangle' 
  | 'fibonacci'
  | 'text'

export interface Point {
  x: number
  y: number
  time?: number
  price?: number
}

export interface ChartData {
  candlesticks: CandlestickData[]
  volume: VolumeData[]
  indicators: IndicatorDataMap
}

export interface VolumeData {
  time: number
  volume: number
  color: 'green' | 'red'
}

export interface IndicatorDataMap {
  [indicatorId: string]: any[]
}

export interface ChartDimensions {
  width: number
  height: number
  candlestickHeight: number
  volumeHeight: number
  indicatorHeight: number
}

export interface PriceAlert {
  id: string
  symbol: string
  price: number
  type: 'above' | 'below'
  enabled: boolean
  triggered: boolean
  createdAt: Date
  message?: string
}

export interface ChartAnnotation {
  id: string
  type: 'text' | 'arrow' | 'shape'
  position: Point
  content: string
  style: {
    color: string
    fontSize: number
    backgroundColor?: string
    borderColor?: string
  }
}

export interface ChartState {
  config: ChartConfig
  data: ChartData
  dimensions: ChartDimensions
  isLoading: boolean
  error: string | null
  lastUpdate: Date
  zoom: {
    start: number
    end: number
  }
  crosshair: {
    visible: boolean
    time: number
    price: number
  }
  alerts: PriceAlert[]
  annotations: ChartAnnotation[]
}

export interface ChartActions {
  updateConfig: (config: Partial<ChartConfig>) => void
  addIndicator: (indicator: IndicatorConfig) => void
  removeIndicator: (indicatorId: string) => void
  updateIndicator: (indicatorId: string, settings: Partial<IndicatorSettings>) => void
  addDrawingTool: (tool: DrawingTool) => void
  removeDrawingTool: (toolId: string) => void
  setTimeframe: (timeframe: TimeFrame) => void
  setSymbol: (symbol: string) => void
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => void
  removeAlert: (alertId: string) => void
  addAnnotation: (annotation: ChartAnnotation) => void
  removeAnnotation: (annotationId: string) => void
  zoomToRange: (start: number, end: number) => void
  resetZoom: () => void
  loadChartData: () => Promise<void>
  updateCandlestick: (newCandle: any) => void
}

// Default configurations
export const DEFAULT_CHART_CONFIG: ChartConfig = {
  symbol: 'BTC',
  timeframe: '1h',
  showVolume: true,
  showGrid: true,
  theme: 'dark',
  indicators: [
    {
      id: 'sma-20',
      type: 'SMA',
      enabled: true,
      settings: { period: 20 },
      color: '#3B82F6',
      lineWidth: 2
    },
    {
      id: 'ema-50',
      type: 'EMA',
      enabled: true,
      settings: { period: 50 },
      color: '#EF4444',
      lineWidth: 2
    }
  ],
  drawingTools: []
}

export const DEFAULT_INDICATOR_SETTINGS: Record<IndicatorType, IndicatorSettings> = {
  SMA: { period: 20 },
  EMA: { period: 20 },
  RSI: { period: 14 },
  MACD: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
  BollingerBands: { period: 20, stdDev: 2 },
  VWAP: {},
  SupportResistance: { lookback: 20 }
}

export const TIMEFRAME_LABELS: Record<TimeFrame, string> = {
  '1m': '1 Minute',
  '5m': '5 Minutes',
  '15m': '15 Minutes',
  '1h': '1 Hour',
  '4h': '4 Hours',
  '1d': '1 Day',
  '1w': '1 Week'
}

export const INDICATOR_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#EC4899', // Pink
]
