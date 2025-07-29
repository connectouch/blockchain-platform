import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare,
  Send,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Activity,
  BarChart3,
  RefreshCw,
  Settings,
  Play,
  Pause,
  X
} from 'lucide-react'

interface TradeCommand {
  id: string
  originalText: string
  parsedCommand: {
    action: 'buy' | 'sell' | 'limit' | 'stop' | 'cancel' | 'status'
    asset: string
    amount?: number
    price?: number
    percentage?: number
    timeframe?: string
    conditions?: string[]
  }
  confidence: number
  estimatedCost: number
  marketImpact: number
  riskLevel: 'low' | 'medium' | 'high'
  status: 'pending' | 'confirmed' | 'executed' | 'failed' | 'cancelled'
  timestamp: Date
  executionTime?: Date
  confirmationRequired: boolean
}

interface MarketData {
  symbol: string
  price: number
  change24h: number
  volume: number
  marketCap: number
  liquidity: number
}

interface TradingContext {
  portfolioValue: number
  availableBalance: number
  positions: any[]
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
  tradingLimits: {
    maxTradeSize: number
    dailyLimit: number
    riskPerTrade: number
  }
}

interface NaturalLanguageTradingProps {
  tradingContext: TradingContext
  onTradeExecuted?: (trade: TradeCommand) => void
  onTradeConfirmation?: (trade: TradeCommand) => Promise<boolean>
  isActive?: boolean
}

const NaturalLanguageTrading: React.FC<NaturalLanguageTradingProps> = ({
  tradingContext,
  onTradeExecuted,
  onTradeConfirmation,
  isActive = true
}) => {
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [tradeHistory, setTradeHistory] = useState<TradeCommand[]>([])
  const [pendingTrade, setPendingTrade] = useState<TradeCommand | null>(null)
  const [marketData, setMarketData] = useState<{ [key: string]: MarketData }>({})
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Initialize market data
  useEffect(() => {
    const mockMarketData = {
      'BTC': {
        symbol: 'BTC',
        price: 45200,
        change24h: 2.5,
        volume: 15000000000,
        marketCap: 850000000000,
        liquidity: 95
      },
      'ETH': {
        symbol: 'ETH',
        price: 2950,
        change24h: 1.8,
        volume: 8000000000,
        marketCap: 280000000000,
        liquidity: 90
      },
      'SOL': {
        symbol: 'SOL',
        price: 105,
        change24h: -0.5,
        volume: 800000000,
        marketCap: 45000000000,
        liquidity: 75
      }
    }
    setMarketData(mockMarketData)
  }, [])

  // Generate contextual suggestions
  useEffect(() => {
    const contextualSuggestions = [
      "Buy 0.1 BTC at market price",
      "Sell 50% of my ETH holdings",
      "Set a stop loss at $40,000 for Bitcoin",
      "Place a limit order to buy SOL at $100",
      "Show my current trading positions",
      "Cancel all pending orders",
      "Buy $1000 worth of Ethereum",
      "Sell all my Solana if it drops below $95"
    ]
    setSuggestions(contextualSuggestions)
  }, [])

  // Parse natural language trading command
  const parseTradeCommand = (text: string): TradeCommand | null => {
    const lowerText = text.toLowerCase().trim()
    
    // Enhanced parsing patterns
    const patterns = {
      // Buy patterns
      buy: [
        /(?:buy|purchase|get)\s+(\d*\.?\d+)?\s*(btc|bitcoin|eth|ethereum|sol|solana|ada|cardano)/i,
        /(?:buy|purchase)\s+\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:worth\s+of\s+)?(btc|bitcoin|eth|ethereum|sol|solana)/i,
        /(?:buy|purchase)\s+(\d+)%\s+(?:of\s+)?(?:my\s+)?(?:portfolio|balance)\s+(?:in\s+)?(btc|bitcoin|eth|ethereum|sol|solana)/i
      ],
      
      // Sell patterns
      sell: [
        /(?:sell|dispose\s+of)\s+(\d*\.?\d+)?\s*(btc|bitcoin|eth|ethereum|sol|solana)/i,
        /(?:sell)\s+(\d+)%\s+(?:of\s+)?(?:my\s+)?(btc|bitcoin|eth|ethereum|sol|solana)\s+(?:holdings|position)?/i,
        /(?:sell\s+all|liquidate)\s+(?:my\s+)?(btc|bitcoin|eth|ethereum|sol|solana)/i
      ],
      
      // Limit order patterns
      limit: [
        /(?:place\s+a\s+)?limit\s+(?:order\s+to\s+)?(?:buy|sell)\s+(\d*\.?\d+)?\s*(btc|bitcoin|eth|ethereum|sol|solana)\s+at\s+\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
        /(?:buy|sell)\s+(\d*\.?\d+)?\s*(btc|bitcoin|eth|ethereum|sol|solana)\s+(?:when\s+price\s+(?:reaches|hits))\s+\$?(\d+)/i
      ],
      
      // Stop loss patterns
      stop: [
        /(?:set\s+a\s+)?stop\s+loss\s+(?:at\s+)?\$?(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:for\s+)?(btc|bitcoin|eth|ethereum|sol|solana)?/i,
        /(?:sell)\s+(?:my\s+)?(btc|bitcoin|eth|ethereum|sol|solana)\s+if\s+(?:price\s+)?(?:drops\s+below|falls\s+to)\s+\$?(\d+)/i
      ],
      
      // Status patterns
      status: [
        /(?:show|display|check)\s+(?:my\s+)?(?:current\s+)?(?:trading\s+)?(?:positions|orders|trades)/i,
        /(?:what\s+are\s+my\s+)?(?:open\s+)?(?:orders|positions|trades)/i
      ],
      
      // Cancel patterns
      cancel: [
        /(?:cancel|close)\s+(?:all\s+)?(?:my\s+)?(?:pending\s+)?orders/i,
        /(?:cancel|close)\s+(?:order|trade)\s+(\w+)/i
      ]
    }

    // Try to match patterns
    for (const [action, actionPatterns] of Object.entries(patterns)) {
      for (const pattern of actionPatterns) {
        const match = text.match(pattern)
        if (match) {
          return createTradeCommand(text, action as any, match)
        }
      }
    }

    return null
  }

  // Create trade command from parsed data
  const createTradeCommand = (originalText: string, action: string, match: RegExpMatchArray): TradeCommand => {
    const asset = normalizeAsset(match[2] || match[1])
    const amount = parseFloat(match[1]) || undefined
    const price = parseFloat(match[3]) || undefined
    const percentage = originalText.includes('%') ? parseFloat(match[1]) : undefined
    
    const marketPrice = marketData[asset]?.price || 0
    const estimatedCost = calculateEstimatedCost(action, asset, amount, price, percentage, marketPrice)
    const marketImpact = calculateMarketImpact(action, asset, amount || 0, marketPrice)
    const riskLevel = assessRiskLevel(action, asset, amount, percentage, estimatedCost)

    return {
      id: Date.now().toString(),
      originalText,
      parsedCommand: {
        action: action as any,
        asset,
        amount,
        price,
        percentage,
        conditions: extractConditions(originalText)
      },
      confidence: calculateConfidence(match, action),
      estimatedCost,
      marketImpact,
      riskLevel,
      status: 'pending',
      timestamp: new Date(),
      confirmationRequired: shouldRequireConfirmation(action, estimatedCost, riskLevel)
    }
  }

  // Normalize asset symbols
  const normalizeAsset = (asset: string): string => {
    const assetMap: { [key: string]: string } = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'solana': 'SOL',
      'cardano': 'ADA'
    }
    return assetMap[asset.toLowerCase()] || asset.toUpperCase()
  }

  // Calculate estimated cost
  const calculateEstimatedCost = (
    action: string, 
    asset: string, 
    amount?: number, 
    price?: number, 
    percentage?: number, 
    marketPrice?: number
  ): number => {
    if (!marketPrice) return 0
    
    if (action === 'buy') {
      if (percentage) {
        return (tradingContext.availableBalance * percentage) / 100
      }
      if (amount) {
        return amount * (price || marketPrice)
      }
    }
    
    if (action === 'sell') {
      if (percentage) {
        const position = tradingContext.positions.find(p => p.symbol === asset)
        return position ? (position.value * percentage) / 100 : 0
      }
      if (amount) {
        return amount * (price || marketPrice)
      }
    }
    
    return 0
  }

  // Calculate market impact
  const calculateMarketImpact = (action: string, asset: string, amount: number, marketPrice: number): number => {
    const tradeValue = amount * marketPrice
    const marketData_ = marketData[asset]
    if (!marketData_) return 0
    
    const impactPercentage = (tradeValue / marketData_.volume) * 100
    return Math.min(impactPercentage, 5) // Cap at 5%
  }

  // Assess risk level
  const assessRiskLevel = (
    action: string, 
    asset: string, 
    amount?: number, 
    percentage?: number, 
    estimatedCost?: number
  ): 'low' | 'medium' | 'high' => {
    const riskFactors = []
    
    if (estimatedCost && estimatedCost > tradingContext.tradingLimits.maxTradeSize) {
      riskFactors.push('large_trade')
    }
    
    if (percentage && percentage > 50) {
      riskFactors.push('high_percentage')
    }
    
    if (action === 'sell' && percentage === 100) {
      riskFactors.push('full_liquidation')
    }
    
    if (riskFactors.length >= 2) return 'high'
    if (riskFactors.length === 1) return 'medium'
    return 'low'
  }

  // Calculate confidence score
  const calculateConfidence = (match: RegExpMatchArray, action: string): number => {
    let confidence = 70 // Base confidence
    
    if (match[1] && !isNaN(parseFloat(match[1]))) confidence += 10 // Has amount
    if (match[2]) confidence += 10 // Has asset
    if (match[3] && !isNaN(parseFloat(match[3]))) confidence += 10 // Has price
    
    return Math.min(confidence, 95)
  }

  // Extract conditions from text
  const extractConditions = (text: string): string[] => {
    const conditions = []
    if (text.includes('if')) conditions.push('conditional')
    if (text.includes('when')) conditions.push('trigger')
    if (text.includes('stop loss')) conditions.push('stop_loss')
    if (text.includes('limit')) conditions.push('limit_order')
    return conditions
  }

  // Determine if confirmation is required
  const shouldRequireConfirmation = (action: string, estimatedCost: number, riskLevel: string): boolean => {
    return estimatedCost > 1000 || riskLevel === 'high' || action === 'sell'
  }

  // Process natural language input
  const processInput = async () => {
    if (!inputText.trim() || !isActive) return
    
    setIsProcessing(true)
    
    try {
      const tradeCommand = parseTradeCommand(inputText)
      
      if (tradeCommand) {
        setPendingTrade(tradeCommand)
        setTradeHistory(prev => [tradeCommand, ...prev.slice(0, 9)])
        
        if (tradeCommand.confirmationRequired) {
          // Wait for user confirmation
        } else {
          await executeTradeCommand(tradeCommand)
        }
      } else {
        // Handle non-trading queries
        console.log('Non-trading query:', inputText)
      }
    } catch (error) {
      console.error('Error processing trade command:', error)
    }
    
    setInputText('')
    setIsProcessing(false)
  }

  // Execute trade command
  const executeTradeCommand = async (command: TradeCommand) => {
    try {
      const confirmed = await onTradeConfirmation?.(command) ?? true
      
      if (confirmed) {
        const executedCommand = {
          ...command,
          status: 'executed' as const,
          executionTime: new Date()
        }
        
        setTradeHistory(prev => prev.map(cmd => 
          cmd.id === command.id ? executedCommand : cmd
        ))
        
        onTradeExecuted?.(executedCommand)
        setPendingTrade(null)
      } else {
        const cancelledCommand = {
          ...command,
          status: 'cancelled' as const
        }
        
        setTradeHistory(prev => prev.map(cmd => 
          cmd.id === command.id ? cancelledCommand : cmd
        ))
        
        setPendingTrade(null)
      }
    } catch (error) {
      console.error('Error executing trade:', error)
      
      const failedCommand = {
        ...command,
        status: 'failed' as const
      }
      
      setTradeHistory(prev => prev.map(cmd => 
        cmd.id === command.id ? failedCommand : cmd
      ))
    }
  }

  // Confirm pending trade
  const confirmTrade = () => {
    if (pendingTrade) {
      executeTradeCommand(pendingTrade)
    }
  }

  // Cancel pending trade
  const cancelTrade = () => {
    if (pendingTrade) {
      const cancelledCommand = {
        ...pendingTrade,
        status: 'cancelled' as const
      }
      
      setTradeHistory(prev => prev.map(cmd => 
        cmd.id === pendingTrade.id ? cancelledCommand : cmd
      ))
      
      setPendingTrade(null)
    }
  }

  // Format currency
  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'executed': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      case 'cancelled': return 'text-gray-400'
      default: return 'text-white/60'
    }
  }

  // Get risk color
  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  return (
    <div className="space-y-6">
      {/* Natural Language Trading Interface */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold">Natural Language Trading</h3>
              <p className="text-white/60 text-sm">Execute trades using plain English commands</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>

        {/* Input Interface */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && processInput()}
                placeholder="Try: 'Buy 0.1 BTC' or 'Sell 50% of my ETH'"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                disabled={!isActive}
              />
              {isProcessing && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <RefreshCw className="w-4 h-4 text-white/60 animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={processInput}
              disabled={!inputText.trim() || isProcessing || !isActive}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 rounded-xl text-white font-medium transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 4).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputText(suggestion)}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 text-sm transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Trade Confirmation */}
      <AnimatePresence>
        {pendingTrade && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6 border border-yellow-400/30"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <div>
                  <h4 className="text-white font-bold">Trade Confirmation Required</h4>
                  <p className="text-white/60 text-sm">"{pendingTrade.originalText}"</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{formatCurrency(pendingTrade.estimatedCost)}</div>
                <div className={`text-sm ${getRiskColor(pendingTrade.riskLevel)}`}>
                  {pendingTrade.riskLevel.toUpperCase()} RISK
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <span className="text-white/60 text-sm">Action:</span>
                <div className="text-white font-medium capitalize">{pendingTrade.parsedCommand.action}</div>
              </div>
              <div>
                <span className="text-white/60 text-sm">Asset:</span>
                <div className="text-white font-medium">{pendingTrade.parsedCommand.asset}</div>
              </div>
              <div>
                <span className="text-white/60 text-sm">Amount:</span>
                <div className="text-white font-medium">
                  {pendingTrade.parsedCommand.amount || pendingTrade.parsedCommand.percentage + '%' || 'Market'}
                </div>
              </div>
              <div>
                <span className="text-white/60 text-sm">Confidence:</span>
                <div className="text-blue-400 font-medium">{pendingTrade.confidence}%</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmTrade}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Confirm Trade
              </button>
              <button
                onClick={cancelTrade}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trade History */}
      {tradeHistory.length > 0 && (
        <div className="glass-card p-6">
          <h4 className="text-white font-bold mb-4">Recent Trading Commands</h4>
          <div className="space-y-3">
            {tradeHistory.map((trade) => (
              <div key={trade.id} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-white text-sm mb-1">"{trade.originalText}"</p>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span>Action: {trade.parsedCommand.action}</span>
                      <span>Asset: {trade.parsedCommand.asset}</span>
                      <span>Confidence: {trade.confidence}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getStatusColor(trade.status)}`}>
                      {trade.status.toUpperCase()}
                    </div>
                    <div className="text-white/60 text-xs">
                      {trade.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white/60">
                      Cost: <span className="text-white">{formatCurrency(trade.estimatedCost)}</span>
                    </span>
                    <span className="text-white/60">
                      Risk: <span className={getRiskColor(trade.riskLevel)}>{trade.riskLevel}</span>
                    </span>
                  </div>
                  
                  {trade.status === 'executed' && trade.executionTime && (
                    <div className="text-green-400 text-xs">
                      Executed at {trade.executionTime.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Command Examples */}
      <div className="glass-card p-6">
        <h4 className="text-white font-bold mb-4">Natural Language Examples</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-blue-400 font-medium mb-3">Basic Trading</h5>
            <ul className="space-y-2 text-sm text-white/70">
              <li>"Buy 0.5 Bitcoin"</li>
              <li>"Sell all my Ethereum"</li>
              <li>"Purchase $1000 worth of SOL"</li>
              <li>"Sell 25% of my BTC holdings"</li>
            </ul>
          </div>
          <div>
            <h5 className="text-green-400 font-medium mb-3">Advanced Orders</h5>
            <ul className="space-y-2 text-sm text-white/70">
              <li>"Buy ETH when price hits $2800"</li>
              <li>"Set stop loss at $40000 for Bitcoin"</li>
              <li>"Limit order: buy 1 SOL at $95"</li>
              <li>"Sell my ETH if it drops below $2500"</li>
            </ul>
          </div>
          <div>
            <h5 className="text-purple-400 font-medium mb-3">Portfolio Management</h5>
            <ul className="space-y-2 text-sm text-white/70">
              <li>"Show my current positions"</li>
              <li>"Cancel all pending orders"</li>
              <li>"Rebalance to 50% BTC, 30% ETH, 20% SOL"</li>
              <li>"What are my open trades?"</li>
            </ul>
          </div>
          <div>
            <h5 className="text-yellow-400 font-medium mb-3">Conditional Trading</h5>
            <ul className="space-y-2 text-sm text-white/70">
              <li>"Buy BTC if it breaks above $50000"</li>
              <li>"Sell half my portfolio if total loss exceeds 10%"</li>
              <li>"Take profit on SOL at 20% gain"</li>
              <li>"Dollar cost average $500 weekly into ETH"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NaturalLanguageTrading
