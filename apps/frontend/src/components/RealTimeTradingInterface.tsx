import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Target, 
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  ArrowUpDown,
  DollarSign,
  Clock,
  BarChart3
} from 'lucide-react'
import { useRealTimePrices, useRealTimeMarketData } from '../hooks/useRealTimeData'

interface TradingPair {
  symbol: string
  baseAsset: string
  quoteAsset: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  marketCap: number
  isRealTime: boolean
  lastUpdated: string
}

interface OrderBookEntry {
  price: number
  amount: number
  total: number
}

const RealTimeTradingInterface: React.FC = () => {
  const { prices, isLoading, error } = useRealTimePrices([
    'bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 
    'polkadot', 'avalanche-2', 'chainlink', 'polygon', 'uniswap'
  ])
  const { marketData, isConnected } = useRealTimeMarketData()
  
  const [selectedPair, setSelectedPair] = useState<string>('BTC/USDT')
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [showOrderBook, setShowOrderBook] = useState(true)

  // Convert real-time prices to trading pairs
  const tradingPairs: TradingPair[] = Object.entries(prices).map(([coinId, data]) => {
    const symbolMap: { [key: string]: string } = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'binancecoin': 'BNB',
      'cardano': 'ADA',
      'solana': 'SOL',
      'polkadot': 'DOT',
      'avalanche-2': 'AVAX',
      'chainlink': 'LINK',
      'polygon': 'MATIC',
      'uniswap': 'UNI'
    }

    const symbol = symbolMap[coinId] || coinId.toUpperCase()
    
    return {
      symbol: `${symbol}/USDT`,
      baseAsset: symbol,
      quoteAsset: 'USDT',
      price: data.usd,
      change24h: data.usd_24h_change,
      volume24h: data.usd_24h_vol,
      high24h: data.usd * 1.05, // Estimated
      low24h: data.usd * 0.95, // Estimated
      marketCap: data.usd_market_cap,
      isRealTime: true,
      lastUpdated: new Date().toISOString()
    }
  })

  const currentPair = tradingPairs.find(pair => pair.symbol === selectedPair) || tradingPairs[0]

  // Generate mock order book data based on current price
  const generateOrderBook = (currentPrice: number) => {
    const bids: OrderBookEntry[] = []
    const asks: OrderBookEntry[] = []
    
    // Generate bids (buy orders) below current price
    for (let i = 0; i < 10; i++) {
      const price = currentPrice * (1 - (i + 1) * 0.001)
      const amount = Math.random() * 10 + 1
      bids.push({
        price,
        amount,
        total: price * amount
      })
    }
    
    // Generate asks (sell orders) above current price
    for (let i = 0; i < 10; i++) {
      const price = currentPrice * (1 + (i + 1) * 0.001)
      const amount = Math.random() * 10 + 1
      asks.push({
        price,
        amount,
        total: price * amount
      })
    }
    
    return { bids, asks }
  }

  const orderBook = currentPair ? generateOrderBook(currentPair.price) : { bids: [], asks: [] }

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toFixed(decimals)
  }

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(0)
    if (price >= 1) return price.toFixed(2)
    return price.toFixed(6)
  }

  const handlePlaceOrder = () => {
    // Mock order placement
    console.log('Placing order:', {
      pair: selectedPair,
      type: orderType,
      side,
      amount,
      price: orderType === 'limit' ? price : currentPair?.price
    })
    
    // Reset form
    setAmount('')
    setPrice('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Real-Time Trading</h2>
          <p className="text-white/60">Live market data and order execution</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Live Prices</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Pairs List */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Trading Pairs</h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tradingPairs.map((pair) => (
                <motion.div
                  key={pair.symbol}
                  onClick={() => setSelectedPair(pair.symbol)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPair === pair.symbol 
                      ? 'bg-blue-500/20 border border-blue-500/30' 
                      : 'hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {pair.baseAsset.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{pair.symbol}</p>
                        <p className="text-white/60 text-sm">${formatPrice(pair.price)}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        pair.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                      </div>
                      {pair.isRealTime && (
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto mt-1"></div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Trading Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Pair Info */}
          {currentPair && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-bold text-white">{currentPair.symbol}</h3>
                  {currentPair.isRealTime && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">${formatPrice(currentPair.price)}</p>
                  <p className={`text-sm font-semibold ${
                    currentPair.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {currentPair.change24h >= 0 ? '+' : ''}{currentPair.change24h.toFixed(2)}% (24h)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-white/60 text-sm">24h High</p>
                  <p className="text-white font-semibold">${formatPrice(currentPair.high24h)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">24h Low</p>
                  <p className="text-white font-semibold">${formatPrice(currentPair.low24h)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">24h Volume</p>
                  <p className="text-white font-semibold">{formatNumber(currentPair.volume24h)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Market Cap</p>
                  <p className="text-white font-semibold">{formatNumber(currentPair.marketCap)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Form */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Place Order</h3>
              
              {/* Order Type Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setOrderType('market')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    orderType === 'market'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  Market
                </button>
                <button
                  onClick={() => setOrderType('limit')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    orderType === 'limit'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  Limit
                </button>
              </div>

              {/* Buy/Sell Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSide('buy')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    side === 'buy'
                      ? 'bg-green-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setSide('sell')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    side === 'sell'
                      ? 'bg-red-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* Price Input (for limit orders) */}
              {orderType === 'limit' && (
                <div className="mb-4">
                  <label className="block text-white/60 text-sm mb-2">Price (USDT)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={currentPair ? formatPrice(currentPair.price) : '0.00'}
                    className="w-full bg-white/10 text-white rounded-lg px-4 py-3 border border-white/20 focus:border-blue-400 focus:outline-none"
                  />
                </div>
              )}

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-white/60 text-sm mb-2">
                  Amount ({currentPair?.baseAsset || 'BTC'})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/10 text-white rounded-lg px-4 py-3 border border-white/20 focus:border-blue-400 focus:outline-none"
                />
              </div>

              {/* Order Summary */}
              {amount && currentPair && (
                <div className="mb-4 p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Total:</span>
                    <span className="text-white font-semibold">
                      ${(parseFloat(amount) * (orderType === 'limit' && price ? parseFloat(price) : currentPair.price)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={!amount || (orderType === 'limit' && !price)}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  side === 'buy'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {side === 'buy' ? 'Buy' : 'Sell'} {currentPair?.baseAsset || 'BTC'}
              </button>
            </div>

            {/* Order Book */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Order Book</h3>
                <button
                  onClick={() => setShowOrderBook(!showOrderBook)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>

              {showOrderBook && (
                <div className="space-y-4">
                  {/* Asks (Sell Orders) */}
                  <div>
                    <h4 className="text-red-400 text-sm font-semibold mb-2">Asks</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {orderBook.asks.slice(0, 5).reverse().map((ask, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-red-400">{formatPrice(ask.price)}</span>
                          <span className="text-white/60">{ask.amount.toFixed(4)}</span>
                          <span className="text-white/40">{formatNumber(ask.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Price */}
                  <div className="text-center py-2 border-t border-b border-white/10">
                    <span className="text-white font-bold">
                      ${currentPair ? formatPrice(currentPair.price) : '0.00'}
                    </span>
                  </div>

                  {/* Bids (Buy Orders) */}
                  <div>
                    <h4 className="text-green-400 text-sm font-semibold mb-2">Bids</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {orderBook.bids.slice(0, 5).map((bid, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-green-400">{formatPrice(bid.price)}</span>
                          <span className="text-white/60">{bid.amount.toFixed(4)}</span>
                          <span className="text-white/40">{formatNumber(bid.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-card p-4 border border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>Error loading trading data: {error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="glass-card p-8 text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading real-time trading data...</p>
        </div>
      )}
    </div>
  )
}

export default RealTimeTradingInterface
