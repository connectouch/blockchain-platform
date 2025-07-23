// Desktop API Types for Connectouch Blockchain AI Platform

// Electron API Types
export interface ElectronAPI {
  // App info
  getAppVersion: () => Promise<string>

  // Enhanced notifications with urgency levels
  showNotification: (title: string, body: string, urgency?: 'low' | 'normal' | 'critical') => Promise<void>

  // Storage
  getStoreValue: (key: string) => Promise<any>
  setStoreValue: (key: string, value: any) => Promise<boolean>

  // Real-time WebSocket
  getWebSocketStatus: () => Promise<WebSocketStatus>
  sendWebSocketMessage: (message: any) => Promise<boolean>
  onRealtimeData: (callback: (event: any, data: RealtimeData) => void) => void
  removeRealtimeDataListener: () => void

  // Navigation
  onNavigateTo: (callback: (event: any, route: string) => void) => void
  removeNavigateToListener: () => void

  // App actions
  onNewAnalysis: (callback: (event: any, data: any) => void) => void
  removeNewAnalysisListener: () => void

  onShowAbout: (callback: (event: any) => void) => void
  removeShowAboutListener: () => void

  // Window management
  setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<boolean>
  minimizeToTray: () => Promise<boolean>

  // Price window controls
  togglePriceWindow: () => Promise<boolean>
  getPriceWindowStatus: () => Promise<PriceWindowStatus>
  onPriceUpdate: (callback: (event: any, data: PriceUpdate) => void) => void
  removePriceUpdateListener: () => void

  // Platform detection
  platform: string
  isElectron: boolean
}

// Desktop API Types
export interface DesktopAPI {
  // Real-time desktop alerts management
  createDesktopAlert: (alertData: DesktopAlertData) => Promise<string>
  getDesktopAlerts: () => Promise<DesktopAlert[]>
  updateDesktopAlert: (alertId: string, updates: Partial<DesktopAlert>) => Promise<boolean>
  deleteDesktopAlert: (alertId: string) => Promise<boolean>

  // Portfolio synchronization
  syncPortfolioData: (portfolioData: PortfolioData) => Promise<boolean>
  getPortfolioData: () => Promise<PortfolioData | null>

  // System integration
  setAutoLaunch: (enabled: boolean) => Promise<boolean>

  // Enhanced window management
  minimizeToTray: () => Promise<boolean>
  setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<boolean>

  // File operations with real-time data
  saveAnalysisReport: (data: AnalysisReportData) => Promise<string>
  exportPortfolio: (data: PortfolioExportData) => Promise<string>
  exportRealTimeData: (data: RealTimeExportData) => Promise<string>

  // Desktop-specific real-time features
  enableDesktopNotifications: (enabled: boolean) => Promise<boolean>
  setNotificationPreferences: (preferences: NotificationPreferences) => Promise<boolean>

  // Performance monitoring
  getSystemStats: () => Promise<SystemStats>
  getAppPerformance: () => Promise<AppPerformance>

  // Backup and restore
  backupUserData: () => Promise<string>
  restoreUserData: (backupPath: string) => Promise<boolean>
}

// Supporting Types
export interface WebSocketStatus {
  connected: boolean
  lastUpdate: string
  reconnectAttempts?: number
  latency?: number
}

export interface RealtimeData {
  type: 'price' | 'market' | 'portfolio' | 'alert' | 'news'
  data: any
  timestamp: string
  source: string
}

export interface PriceWindowStatus {
  visible: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  alwaysOnTop: boolean
}

export interface PriceUpdate {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: string
}

export interface DesktopAlertData {
  type: 'price' | 'portfolio' | 'market' | 'news'
  title: string
  message: string
  threshold?: number
  symbol?: string
  urgency: 'low' | 'normal' | 'high' | 'critical'
  conditions: AlertCondition[]
  enabled: boolean
}

export interface DesktopAlert extends DesktopAlertData {
  id: string
  created: string
  lastTriggered?: string
  triggerCount: number
  active: boolean
}

export interface AlertCondition {
  field: string
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'change_gt' | 'change_lt'
  value: number
  timeframe?: string
}

export interface PortfolioData {
  totalValue: number
  positions: PortfolioPosition[]
  performance: PortfolioPerformance
  lastUpdated: string
  riskMetrics: RiskMetrics
}

export interface PortfolioPosition {
  symbol: string
  amount: number
  value: number
  costBasis: number
  unrealizedPnL: number
  allocation: number
  protocol?: string
  blockchain?: string
}

export interface PortfolioPerformance {
  totalReturn: number
  totalReturnPercent: number
  dayChange: number
  dayChangePercent: number
  weekChange: number
  weekChangePercent: number
  monthChange: number
  monthChangePercent: number
}

export interface RiskMetrics {
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  beta: number
  diversificationScore: number
}

export interface AnalysisReportData {
  title: string
  content: string
  charts: ChartData[]
  metadata: ReportMetadata
  timestamp: string
}

export interface PortfolioExportData {
  format: 'csv' | 'json' | 'pdf'
  includeCharts: boolean
  dateRange: { start: string; end: string }
  data: PortfolioData
}

export interface RealTimeExportData {
  format: 'csv' | 'json'
  dataTypes: string[]
  timeRange: { start: string; end: string }
  symbols: string[]
}

export interface NotificationPreferences {
  priceAlerts: boolean
  portfolioUpdates: boolean
  marketNews: boolean
  urgencyLevel: 'low' | 'normal' | 'high' | 'critical'
  soundEnabled: boolean
  desktopBadge: boolean
  emailNotifications: boolean
}

export interface SystemStats {
  platform: string
  arch: string
  nodeVersion: string
  electronVersion: string
  chromeVersion: string
  memory: NodeJS.MemoryUsage
  uptime: number
  cpuUsage: NodeJS.CpuUsage
}

export interface AppPerformance {
  private: number
  shared: number
  residentSet: number
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'candlestick'
  data: any[]
  options: any
}

export interface ReportMetadata {
  author: string
  version: string
  generatedAt: string
  dataSource: string
  analysisType: string
}

// Global type declarations for window object
declare global {
  interface Window {
    electronAPI: ElectronAPI
    desktopAPI: DesktopAPI
  }
}

export {}
