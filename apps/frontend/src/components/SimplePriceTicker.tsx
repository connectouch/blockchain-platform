/**
 * Simple Price Ticker - Non-overlapping horizontal scrolling cryptocurrency prices
 * Positioned in document flow, not fixed positioning
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { directApiService } from '../services/directApiService'

interface CryptoPrice {
  symbol: string
  name: string
  price: number
  change24h: number
}

interface SimplePriceTickerProps {
  height?: number
  speed?: number
  updateInterval?: number
  className?: string
}

const SimplePriceTicker: React.FC<SimplePriceTickerProps> = ({
  height = 40,
  speed = 60,
  updateInterval = 60000,
  className = ''
}) => {
  const [prices, setPrices] = useState<CryptoPrice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const symbols = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'LINK', 'UNI', 'AVAX', 'MATIC']

  // Fetch prices
  const fetchPrices = async () => {
    try {
      console.log('🔄 SimplePriceTicker: Fetching prices...')
      
      const symbolIds = symbols.map(symbol => {
        const symbolMap: { [key: string]: string } = {
          'BTC': 'bitcoin',
          'ETH': 'ethereum', 
          'BNB': 'binancecoin',
          'ADA': 'cardano',
          'SOL': 'solana',
          'DOT': 'polkadot',
          'LINK': 'chainlink',
          'UNI': 'uniswap',
          'AVAX': 'avalanche-2',
          'MATIC': 'polygon'
        }
        return symbolMap[symbol] || symbol.toLowerCase()
      })
      
      const data = await directApiService.getCryptoPrices(symbolIds)
      
      if (data && data.length > 0) {
        const transformedPrices: CryptoPrice[] = data.map((coin: any) => ({
          symbol: coin.symbol?.toUpperCase() || 'N/A',
          name: coin.name || 'Unknown',
          price: coin.current_price || 0,
          change24h: coin.price_change_percentage_24h || 0
        }))
        
        setPrices(transformedPrices)
        console.log('✅ SimplePriceTicker: Prices updated:', transformedPrices.length, 'coins')
      } else {
        // Fallback data
        setPrices([
          { symbol: 'BTC', name: 'Bitcoin', price: 45000, change24h: 2.5 },
          { symbol: 'ETH', name: 'Ethereum', price: 3200, change24h: 1.8 },
          { symbol: 'BNB', name: 'BNB', price: 320, change24h: -0.5 },
          { symbol: 'ADA', name: 'Cardano', price: 0.85, change24h: 3.2 },
          { symbol: 'SOL', name: 'Solana', price: 125, change24h: 4.1 }
        ])
      }
      setIsLoading(false)
    } catch (error) {
      console.error('❌ SimplePriceTicker: Error fetching prices:', error)
      // Use fallback data on error
      setPrices([
        { symbol: 'BTC', name: 'Bitcoin', price: 45000, change24h: 2.5 },
        { symbol: 'ETH', name: 'Ethereum', price: 3200, change24h: 1.8 },
        { symbol: 'BNB', name: 'BNB', price: 320, change24h: -0.5 },
        { symbol: 'ADA', name: 'Cardano', price: 0.85, change24h: 3.2 },
        { symbol: 'SOL', name: 'Solana', price: 125, change24h: 4.1 }
      ])
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, updateInterval)
    return () => clearInterval(interval)
  }, [updateInterval])

  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`
    } else {
      return `$${price.toFixed(4)}`
    }
  }

  const formatChange = (change: number): string => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
  }

  if (isLoading) {
    return (
      <div 
        className={`bg-gray-900/80 backdrop-blur-sm border-b border-white/10 overflow-hidden ${className}`}
        style={{ height: `${height}px` }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-white/50 text-sm">Loading prices...</div>
        </div>
      </div>
    )
  }

  // Duplicate prices for seamless scrolling
  const duplicatedPrices = [...prices, ...prices, ...prices]

  return (
    <div 
      className={`bg-gray-900/80 backdrop-blur-sm border-b border-white/10 overflow-hidden relative ${className}`}
      style={{ height: `${height}px` }}
    >
      <motion.div
        className="flex items-center h-full whitespace-nowrap"
        animate={{
          x: [0, -100 * prices.length * 12] // Approximate width per item
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {duplicatedPrices.map((crypto, index) => (
          <div
            key={`${crypto.symbol}-${index}`}
            className="flex items-center gap-3 px-8 py-2"
          >
            {/* Symbol */}
            <span className="text-white font-semibold text-sm">
              {crypto.symbol}
            </span>

            {/* Price */}
            <span className="text-white/90 text-sm font-mono">
              {formatPrice(crypto.price)}
            </span>

            {/* Change */}
            <div className="flex items-center gap-1">
              {crypto.change24h >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span 
                className={`text-xs font-medium ${
                  crypto.change24h >= 0 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}
              >
                {formatChange(crypto.change24h)}
              </span>
            </div>

            {/* Separator */}
            <span className="text-white/30 text-lg">•</span>
          </div>
        ))}
      </motion.div>

      {/* Gradient overlays for smooth edges */}
      <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-gray-900/80 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-gray-900/80 to-transparent pointer-events-none" />
      
      {/* Live indicator */}
      <div className="absolute top-1 right-2 flex items-center gap-1">
        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-white/60">LIVE</span>
      </div>
    </div>
  )
}

export default SimplePriceTicker
