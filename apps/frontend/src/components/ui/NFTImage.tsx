import React from 'react'
import { Crown, Image as ImageIcon } from 'lucide-react'
import { EnhancedImage } from './EnhancedImage'

export interface NFTImageProps {
  src?: string
  alt: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  collectionName?: string
  tokenId?: string
  contractAddress?: string
  showFallback?: boolean
}

// Generate high-quality SVG fallback for NFT images
const generateNFTFallback = (
  collectionName: string = 'NFT',
  tokenId: string = '1',
  contractAddress: string = '',
  size: number = 300
): string => {
  const colors = [
    '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', 
    '#ef4444', '#ec4899', '#3b82f6', '#10b981'
  ]
  
  const colorIndex = tokenId ? parseInt(tokenId) % colors.length : 0
  const color = colors[colorIndex]
  const shortAddress = contractAddress ? contractAddress.slice(-4) : '0000'
  const initials = collectionName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()
  
  const padding = size * 0.1
  const innerSize = size - (padding * 2)
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color}dd;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="${size}" height="${size}" fill="url(#grad1)" rx="${size * 0.08}"/>
      
      <!-- Inner frame -->
      <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" 
            fill="none" stroke="white" stroke-width="3" rx="${innerSize * 0.06}" opacity="0.8"/>
      
      <!-- Crown icon -->
      <g transform="translate(${size/2 - 20}, ${size/2 - 30})" fill="white" opacity="0.9">
        <path d="M8 2L12 8L16 2L20 8L24 2L22 18H10L8 2Z" stroke="white" stroke-width="1.5" fill="white"/>
      </g>
      
      <!-- Collection initials -->
      <text x="${size/2}" y="${size/2 + 15}" text-anchor="middle" fill="white" 
            font-family="Arial, sans-serif" font-size="${size * 0.08}" font-weight="bold" opacity="0.95">
        ${initials}
      </text>
      
      <!-- Token ID -->
      <text x="${size/2}" y="${size/2 + 35}" text-anchor="middle" fill="white" 
            font-family="Arial, sans-serif" font-size="${size * 0.05}" opacity="0.8">
        #${tokenId}
      </text>
      
      <!-- Contract address -->
      <text x="${size/2}" y="${size - padding/2}" text-anchor="middle" fill="white" 
            font-family="monospace" font-size="${size * 0.035}" opacity="0.6">
        ${shortAddress}
      </text>
      
      <!-- Decorative elements -->
      <circle cx="${padding + 10}" cy="${padding + 10}" r="3" fill="white" opacity="0.6"/>
      <circle cx="${size - padding - 10}" cy="${padding + 10}" r="3" fill="white" opacity="0.6"/>
      <circle cx="${padding + 10}" cy="${size - padding - 10}" r="3" fill="white" opacity="0.6"/>
      <circle cx="${size - padding - 10}" cy="${size - padding - 10}" r="3" fill="white" opacity="0.6"/>
    </svg>
  `)}`
}

export const NFTImage: React.FC<NFTImageProps> = ({
  src,
  alt,
  className = '',
  size = 'md',
  collectionName = 'NFT Collection',
  tokenId = '1',
  contractAddress = '',
  showFallback = true
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  }

  const sizePixels = {
    sm: 64,
    md: 96,
    lg: 192,
    xl: 256
  }

  const fallbackSrc = showFallback 
    ? generateNFTFallback(collectionName, tokenId, contractAddress, sizePixels[size])
    : undefined

  const placeholder = (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center ${className}`}>
      <Crown className={`${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'} text-purple-400`} />
    </div>
  )

  const errorPlaceholder = (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-lg flex flex-col items-center justify-center border border-gray-400/30 ${className}`}>
      <ImageIcon className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'} text-gray-400 mb-1`} />
      {size !== 'sm' && (
        <span className="text-xs text-gray-400 text-center px-1">
          No Image
        </span>
      )}
    </div>
  )

  if (!src && showFallback) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={`${sizeClasses[size]} rounded-lg object-cover ${className}`}
      />
    )
  }

  if (!src) {
    return errorPlaceholder
  }

  return (
    <EnhancedImage
      src={src}
      alt={alt}
      fallbackSrc={fallbackSrc}
      className={`${sizeClasses[size]} rounded-lg object-cover ${className}`}
      placeholder={placeholder}
      errorPlaceholder={errorPlaceholder}
      width={sizePixels[size]}
      height={sizePixels[size]}
      lazy={true}
      retryCount={3}
      retryDelay={1000}
    />
  )
}
