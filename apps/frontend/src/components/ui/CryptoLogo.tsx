import React from 'react'
import { Coins } from 'lucide-react'
import { EnhancedImage } from './EnhancedImage'

export interface CryptoLogoProps {
  symbol: string
  name?: string
  src?: string
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  style?: 'circle' | 'square' | 'rounded'
}

// Generate high-quality SVG fallback for crypto logos
const generateCryptoFallback = (
  symbol: string,
  name: string = '',
  size: number = 48,
  style: 'circle' | 'square' | 'rounded' = 'circle'
): string => {
  const colors: Record<string, string> = {
    'BTC': '#f7931a',
    'ETH': '#627eea',
    'BNB': '#f3ba2f',
    'ADA': '#0033ad',
    'SOL': '#9945ff',
    'DOT': '#e6007a',
    'AVAX': '#e84142',
    'MATIC': '#8247e5',
    'LINK': '#375bd2',
    'UNI': '#ff007a',
    'AAVE': '#b6509e',
    'COMP': '#00d395',
    'MKR': '#1aab9b',
    'SNX': '#5fcdf7',
    'YFI': '#006ae3',
    'SUSHI': '#fa52a0',
    'CRV': '#40649f',
    'BAL': '#1e1e1e',
    'USDC': '#2775ca',
    'USDT': '#26a17b',
    'DAI': '#f5ac37'
  }

  const color = colors[symbol.toUpperCase()] || '#6366f1'
  const radius = style === 'circle' ? size / 2 : style === 'rounded' ? size * 0.15 : 0
  const symbolText = symbol.toUpperCase().slice(0, 4)
  const fontSize = size * (symbolText.length <= 2 ? 0.35 : symbolText.length === 3 ? 0.28 : 0.22)

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cryptoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color}cc;stop-opacity:1" />
        </linearGradient>
        <filter id="cryptoShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.2)"/>
        </filter>
      </defs>
      
      <!-- Background shape -->
      <rect width="${size}" height="${size}" fill="url(#cryptoGrad)" rx="${radius}" 
            filter="url(#cryptoShadow)"/>
      
      <!-- Inner border -->
      <rect x="2" y="2" width="${size - 4}" height="${size - 4}" fill="none" 
            stroke="white" stroke-width="1" rx="${radius - 2}" opacity="0.3"/>
      
      <!-- Symbol text -->
      <text x="${size/2}" y="${size/2 + fontSize/3}" text-anchor="middle" fill="white" 
            font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" 
            opacity="0.95">
        ${symbolText}
      </text>
      
      <!-- Decorative dot -->
      <circle cx="${size - 8}" cy="8" r="2" fill="white" opacity="0.6"/>
    </svg>
  `)}`
}

// Common crypto logo URLs (using reliable CDN sources)
const getCryptoLogoUrl = (symbol: string): string | undefined => {
  const logoUrls: Record<string, string> = {
    'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    'BNB': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
    'ADA': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
    'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.png',
    'DOT': 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
    'AVAX': 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
    'MATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    'LINK': 'https://cryptologos.cc/logos/chainlink-link-logo.png',
    'UNI': 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    'USDC': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    'USDT': 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    'DAI': 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png'
  }

  return logoUrls[symbol.toUpperCase()]
}

export const CryptoLogo: React.FC<CryptoLogoProps> = ({
  symbol,
  name = '',
  src,
  className = '',
  size = 'md',
  style = 'circle'
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const sizePixels = {
    xs: 16,
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64
  }

  const styleClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg'
  }

  const logoSrc = src || getCryptoLogoUrl(symbol)
  const fallbackSrc = generateCryptoFallback(symbol, name, sizePixels[size], style)

  const placeholder = (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500/20 to-purple-500/20 ${styleClasses[style]} flex items-center justify-center ${className}`}>
      <Coins className={`${size === 'xs' ? 'w-2 h-2' : size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-6 h-6'} text-blue-400`} />
    </div>
  )

  const errorPlaceholder = (
    <img
      src={fallbackSrc}
      alt={`${symbol} logo`}
      className={`${sizeClasses[size]} ${styleClasses[style]} ${className}`}
    />
  )

  if (!logoSrc) {
    return errorPlaceholder
  }

  return (
    <EnhancedImage
      src={logoSrc}
      alt={`${symbol} logo`}
      fallbackSrc={fallbackSrc}
      className={`${sizeClasses[size]} ${styleClasses[style]} ${className}`}
      placeholder={placeholder}
      errorPlaceholder={errorPlaceholder}
      width={sizePixels[size]}
      height={sizePixels[size]}
      lazy={true}
      retryCount={2}
      retryDelay={500}
    />
  )
}
