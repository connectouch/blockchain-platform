import React, { useState } from 'react'
import { LocalImageService } from '../../services/localImageService'

export interface LocalImageProps {
  type: 'crypto' | 'nft' | 'defi' | 'gamefi' | 'news' | 'news-source' | 'news-category'
  identifier: string
  alt: string
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fallbackName?: string
  onLoad?: () => void
  onError?: () => void
}

export const LocalImage: React.FC<LocalImageProps> = ({
  type,
  identifier,
  alt,
  className = '',
  size = 'md',
  fallbackName,
  onLoad,
  onError
}) => {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const getImageUrl = (): string => {
    switch (type) {
      case 'crypto':
        return LocalImageService.getCryptoImage(identifier)
      case 'nft':
        return LocalImageService.getNFTCollectionImage(identifier, fallbackName)
      case 'defi':
        return LocalImageService.getDeFiProtocolImage(identifier)
      case 'gamefi':
        return LocalImageService.getGameFiProjectImage(identifier)
      case 'news':
        return LocalImageService.getNewsImage(identifier)
      case 'news-source':
        return LocalImageService.getNewsSourceImage(identifier)
      case 'news-category':
        return LocalImageService.getNewsCategoryImage(identifier)
      default:
        return LocalImageService.getCryptoImage(identifier)
    }
  }

  const imageUrl = getImageUrl()

  const handleLoad = () => {
    setImageError(false)
    onLoad?.()
  }

  const handleError = () => {
    setImageError(true)
    onError?.()
  }

  // If it's an SVG data URL, render it directly
  if (imageUrl.startsWith('data:image/svg+xml')) {
    return (
      <div 
        className={`${sizeClasses[size]} ${className} flex items-center justify-center`}
        dangerouslySetInnerHTML={{ 
          __html: decodeURIComponent(imageUrl.replace('data:image/svg+xml,', '')) 
        }}
      />
    )
  }

  // For regular image URLs
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`${sizeClasses[size]} ${className} object-cover rounded`}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
    />
  )
}

// Specialized components for different types
export const CryptoLocalImage: React.FC<Omit<LocalImageProps, 'type'>> = (props) => (
  <LocalImage {...props} type="crypto" />
)

export const NFTLocalImage: React.FC<Omit<LocalImageProps, 'type'>> = (props) => (
  <LocalImage {...props} type="nft" />
)

export const DeFiLocalImage: React.FC<Omit<LocalImageProps, 'type'>> = (props) => (
  <LocalImage {...props} type="defi" />
)

export const GameFiLocalImage: React.FC<Omit<LocalImageProps, 'type'>> = (props) => (
  <LocalImage {...props} type="gamefi" />
)

export const NewsLocalImage: React.FC<Omit<LocalImageProps, 'type'>> = (props) => (
  <LocalImage {...props} type="news" />
)

export const NewsSourceLocalImage: React.FC<Omit<LocalImageProps, 'type'>> = (props) => (
  <LocalImage {...props} type="news-source" />
)

export const NewsCategoryLocalImage: React.FC<Omit<LocalImageProps, 'type'>> = (props) => (
  <LocalImage {...props} type="news-category" />
)
