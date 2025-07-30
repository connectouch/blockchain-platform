import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ImageIcon, AlertCircle } from 'lucide-react'

export interface EnhancedImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  width?: number
  height?: number
  lazy?: boolean
  onLoad?: () => void
  onError?: (error: Event) => void
  placeholder?: React.ReactNode
  errorPlaceholder?: React.ReactNode
  retryCount?: number
  retryDelay?: number
}

export const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  width,
  height,
  lazy = true,
  onLoad,
  onError,
  placeholder,
  errorPlaceholder,
  retryCount = 2,
  retryDelay = 1000
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [retryAttempts, setRetryAttempts] = useState(0)
  const [isInView, setIsInView] = useState(!lazy)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observerRef.current?.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current)
    }

    return () => observerRef.current?.disconnect()
  }, [lazy, isInView])

  // Handle image loading
  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  // Handle image error with retry logic
  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn(`Image failed to load: ${currentSrc}`)
    
    if (retryAttempts < retryCount) {
      // Retry loading the same image
      setTimeout(() => {
        setRetryAttempts(prev => prev + 1)
        setCurrentSrc(`${src}?retry=${retryAttempts + 1}`)
      }, retryDelay)
      return
    }

    // Try fallback source
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setRetryAttempts(0)
      return
    }

    // All attempts failed
    setIsLoading(false)
    setHasError(true)
    onError?.(event.nativeEvent)
  }

  // Update src when prop changes
  useEffect(() => {
    setCurrentSrc(src)
    setIsLoading(true)
    setHasError(false)
    setRetryAttempts(0)
  }, [src])

  // Default placeholder
  const defaultPlaceholder = (
    <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${className}`}>
      <ImageIcon className="w-8 h-8 text-gray-400" />
    </div>
  )

  // Default error placeholder
  const defaultErrorPlaceholder = (
    <div className={`flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 ${className}`}>
      <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
      <span className="text-xs text-red-600 dark:text-red-400 text-center px-2">
        Failed to load image
      </span>
    </div>
  )

  // Show placeholder while loading or not in view
  if (!isInView || (isLoading && !hasError)) {
    return (
      <div ref={imgRef} className={className} style={{ width, height }}>
        {placeholder || defaultPlaceholder}
      </div>
    )
  }

  // Show error state
  if (hasError) {
    return errorPlaceholder || defaultErrorPlaceholder
  }

  // Show actual image
  return (
    <motion.img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onLoad={handleLoad}
      onError={handleError}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      loading={lazy ? 'lazy' : 'eager'}
    />
  )
}
