import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ImageIcon, Wifi, WifiOff, Zap } from 'lucide-react'
import { ImageManager } from '../../services/imageManager'
import { EnhancedImage } from './EnhancedImage'

export interface RealTimeImageProps {
  type: 'crypto' | 'nft' | 'defi' | 'gamefi'
  identifier: string
  alt: string
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showQualityIndicator?: boolean
  showSourceBadge?: boolean
  fallbackName?: string
  tokenSymbol?: string
  contractAddress?: string
  preferRealImages?: boolean
  onImageLoad?: (result: any) => void
}

export const RealTimeImage: React.FC<RealTimeImageProps> = ({
  type,
  identifier,
  alt,
  className = '',
  size = 'md',
  showQualityIndicator = false,
  showSourceBadge = false,
  fallbackName,
  tokenSymbol,
  contractAddress,
  preferRealImages = true,
  onImageLoad
}) => {
  const [imageResult, setImageResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  useEffect(() => {
    let isMounted = true

    const fetchImage = async () => {
      try {
        setIsLoading(true)
        setError(null)

        let result
        switch (type) {
          case 'crypto':
            result = await ImageManager.getCryptoImage(identifier, { preferRealImages })
            break

          case 'nft':
            result = await ImageManager.getNFTCollectionImage(
              contractAddress || identifier,
              fallbackName || identifier,
              { preferRealImages }
            )
            break

          case 'defi':
            result = await ImageManager.getDeFiProtocolImage(
              identifier,
              tokenSymbol,
              { preferRealImages }
            )
            break

          case 'gamefi':
            result = await ImageManager.getGameFiProjectImage(
              identifier,
              tokenSymbol,
              { preferRealImages }
            )
            break

          default:
            throw new Error(`Unsupported image type: ${type}`)
        }

        if (isMounted) {
          setImageResult(result)
          onImageLoad?.(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load image')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchImage()

    return () => {
      isMounted = false
    }
  }, [type, identifier, contractAddress, fallbackName, tokenSymbol, preferRealImages])

  const getQualityColor = (quality: number): string => {
    if (quality >= 0.8) return 'text-green-400'
    if (quality >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getSourceIcon = (source: string, isReal: boolean) => {
    if (!isReal) return <ImageIcon className="w-3 h-3" />
    if (source === 'api') return <Wifi className="w-3 h-3" />
    return <Zap className="w-3 h-3" />
  }

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center ${className}`}>
        <ImageIcon className={`${size === 'xs' ? 'w-2 h-2' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400`} />
      </div>
    )
  }

  if (error || !imageResult) {
    return (
      <div className={`${sizeClasses[size]} bg-red-100 dark:bg-red-900/20 rounded flex items-center justify-center ${className}`}>
        <WifiOff className={`${size === 'xs' ? 'w-2 h-2' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} text-red-400`} />
      </div>
    )
  }

  const quality = ImageManager.getImageQuality(imageResult)

  return (
    <div className={`relative ${className}`}>
      <EnhancedImage
        src={imageResult.url}
        alt={alt}
        className={`${sizeClasses[size]} rounded object-cover`}
        lazy={true}
        retryCount={2}
      />

      {/* Quality Indicator */}
      {showQualityIndicator && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm"
        >
          <div className={`w-2 h-2 rounded-full ${quality >= 0.8 ? 'bg-green-400' : quality >= 0.6 ? 'bg-yellow-400' : 'bg-red-400'}`} />
        </motion.div>
      )}

      {/* Source Badge */}
      {showSourceBadge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-1 -right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1"
        >
          {getSourceIcon(imageResult.source, imageResult.isReal)}
          <span className="text-xs">
            {imageResult.isReal ? 'LIVE' : 'GEN'}
          </span>
        </motion.div>
      )}
    </div>
  )
}

// Specialized components for different types
export const CryptoRealTimeImage: React.FC<Omit<RealTimeImageProps, 'type'>> = (props) => (
  <RealTimeImage {...props} type="crypto" />
)

export const NFTRealTimeImage: React.FC<Omit<RealTimeImageProps, 'type'>> = (props) => (
  <RealTimeImage {...props} type="nft" />
)

export const DeFiRealTimeImage: React.FC<Omit<RealTimeImageProps, 'type'>> = (props) => (
  <RealTimeImage {...props} type="defi" />
)

export const GameFiRealTimeImage: React.FC<Omit<RealTimeImageProps, 'type'>> = (props) => (
  <RealTimeImage {...props} type="gamefi" />
)

// Hook for using real-time images in custom components
export const useRealTimeImage = (
  type: RealTimeImageProps['type'],
  identifier: string,
  options: {
    contractAddress?: string
    fallbackName?: string
    tokenSymbol?: string
    preferRealImages?: boolean
  } = {}
) => {
  const [imageResult, setImageResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchImage = async () => {
      try {
        setIsLoading(true)
        setError(null)

        let result
        switch (type) {
          case 'crypto':
            result = await ImageManager.getCryptoImage(identifier, options)
            break

          case 'nft':
            result = await ImageManager.getNFTCollectionImage(
              options.contractAddress || identifier,
              options.fallbackName || identifier,
              options
            )
            break

          case 'defi':
            result = await ImageManager.getDeFiProtocolImage(
              identifier,
              options.tokenSymbol,
              options
            )
            break

          case 'gamefi':
            result = await ImageManager.getGameFiProjectImage(
              identifier,
              options.tokenSymbol,
              options
            )
            break

          default:
            throw new Error(`Unsupported image type: ${type}`)
        }

        if (isMounted) {
          setImageResult(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load image')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchImage()

    return () => {
      isMounted = false
    }
  }, [type, identifier, options.contractAddress, options.fallbackName, options.tokenSymbol, options.preferRealImages])

  return {
    imageResult,
    isLoading,
    error,
    isReal: imageResult?.isReal || false,
    quality: imageResult ? ImageManager.getImageQuality(imageResult) : 0
  }
}
