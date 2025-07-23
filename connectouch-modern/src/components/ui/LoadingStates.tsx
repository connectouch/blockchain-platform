/**
 * Loading States Component Library for Connectouch Platform
 * Implements Phase 3 UX/UI Enhancement - Comprehensive Loading Experience
 */

import React from 'react'
import './LoadingStates.css'

export interface LoadingProps {
  variant?: 'spinner' | 'skeleton' | 'pulse' | 'dots' | 'progress'
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'secondary' | 'accent'
  text?: string
  progress?: number
  className?: string
}

export interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'card'
  width?: string | number
  height?: string | number
  lines?: number
  className?: string
}

/**
 * Spinner Loading Component
 * Implements Rule #15 - Human-Centric Authoring
 */
export const Spinner: React.FC<LoadingProps> = ({
  size = 'medium',
  color = 'primary',
  text,
  className = ''
}) => {
  return (
    <div className={`loading-spinner loading-spinner--${size} loading-spinner--${color} ${className}`}>
      <div className="loading-spinner__circle">
        <div className="loading-spinner__path"></div>
      </div>
      {text && (
        <p className="loading-spinner__text" aria-live="polite">
          {text}
        </p>
      )}
    </div>
  )
}

/**
 * Skeleton Loading Component
 * Implements Rule #17 - Modular architecture
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width = '100%',
  height,
  lines = 1,
  className = ''
}) => {
  const getHeight = () => {
    if (height) return height
    switch (variant) {
      case 'text': return '1em'
      case 'rectangular': return '200px'
      case 'circular': return '40px'
      case 'card': return '300px'
      default: return '1em'
    }
  }

  const getWidth = () => {
    if (variant === 'circular') return getHeight()
    return width
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`skeleton-container ${className}`}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`skeleton skeleton--${variant}`}
            style={{
              width: index === lines - 1 ? '75%' : '100%',
              height: getHeight(),
              marginBottom: index < lines - 1 ? '0.5em' : 0
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`skeleton skeleton--${variant} ${className}`}
      style={{
        width: getWidth(),
        height: getHeight()
      }}
      aria-hidden="true"
    />
  )
}

/**
 * Pulse Loading Component
 * Implements Rule #26 - Latest technology standards
 */
export const Pulse: React.FC<LoadingProps> = ({
  size = 'medium',
  color = 'primary',
  className = ''
}) => {
  return (
    <div className={`loading-pulse loading-pulse--${size} loading-pulse--${color} ${className}`}>
      <div className="loading-pulse__dot loading-pulse__dot--1"></div>
      <div className="loading-pulse__dot loading-pulse__dot--2"></div>
      <div className="loading-pulse__dot loading-pulse__dot--3"></div>
    </div>
  )
}

/**
 * Dots Loading Component
 * Implements Rule #32 - Context engine integration
 */
export const Dots: React.FC<LoadingProps> = ({
  size = 'medium',
  color = 'primary',
  text,
  className = ''
}) => {
  return (
    <div className={`loading-dots loading-dots--${size} loading-dots--${color} ${className}`}>
      <div className="loading-dots__container">
        <span className="loading-dots__dot"></span>
        <span className="loading-dots__dot"></span>
        <span className="loading-dots__dot"></span>
      </div>
      {text && (
        <p className="loading-dots__text" aria-live="polite">
          {text}
        </p>
      )}
    </div>
  )
}

/**
 * Progress Bar Loading Component
 * Implements Rule #20 - No empty validation
 */
export const ProgressBar: React.FC<LoadingProps> = ({
  progress = 0,
  color = 'primary',
  text,
  className = ''
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress))
  
  return (
    <div className={`loading-progress loading-progress--${color} ${className}`}>
      {text && (
        <div className="loading-progress__header">
          <span className="loading-progress__text">{text}</span>
          <span className="loading-progress__percentage">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className="loading-progress__track">
        <div 
          className="loading-progress__fill"
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={text || 'Loading progress'}
        />
      </div>
    </div>
  )
}

/**
 * Card Skeleton Component for Dashboard
 * Implements Rule #13 - Agentic benchmark checklist
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`card-skeleton ${className}`}>
      <div className="card-skeleton__header">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="card-skeleton__title">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <div className="card-skeleton__content">
        <Skeleton variant="rectangular" height={120} />
        <div className="card-skeleton__footer">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="25%" />
        </div>
      </div>
    </div>
  )
}

/**
 * Chart Skeleton Component
 * Implements Rule #24 - Handle concurrent development
 */
export const ChartSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`chart-skeleton ${className}`}>
      <div className="chart-skeleton__header">
        <Skeleton variant="text" width="40%" height="1.5em" />
        <Skeleton variant="text" width="20%" />
      </div>
      <div className="chart-skeleton__chart">
        <div className="chart-skeleton__bars">
          {Array.from({ length: 7 }, (_, index) => (
            <div
              key={index}
              className="chart-skeleton__bar"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            />
          ))}
        </div>
      </div>
      <div className="chart-skeleton__legend">
        <Skeleton variant="text" width="15%" />
        <Skeleton variant="text" width="15%" />
        <Skeleton variant="text" width="15%" />
      </div>
    </div>
  )
}

/**
 * Table Skeleton Component
 * Implements Rule #31 - Complete handling
 */
export const TableSkeleton: React.FC<{ 
  rows?: number
  columns?: number
  className?: string 
}> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => {
  return (
    <div className={`table-skeleton ${className}`}>
      <div className="table-skeleton__header">
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={index} variant="text" width="80%" />
        ))}
      </div>
      <div className="table-skeleton__body">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="table-skeleton__row">
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                variant="text" 
                width={colIndex === 0 ? "60%" : "90%"} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Loading Overlay Component
 * Implements Rule #29 - Ground truth capability
 */
export const LoadingOverlay: React.FC<{
  isVisible: boolean
  variant?: LoadingProps['variant']
  text?: string
  backdrop?: boolean
  className?: string
}> = ({
  isVisible,
  variant = 'spinner',
  text = 'Loading...',
  backdrop = true,
  className = ''
}) => {
  if (!isVisible) return null

  const LoadingComponent = {
    spinner: Spinner,
    pulse: Pulse,
    dots: Dots
  }[variant] || Spinner

  return (
    <div className={`loading-overlay ${backdrop ? 'loading-overlay--backdrop' : ''} ${className}`}>
      <div className="loading-overlay__content">
        <LoadingComponent text={text} size="large" />
      </div>
    </div>
  )
}

/**
 * Lazy Loading Wrapper Component
 * Implements Rule #10 - Flexible dataset adjustment
 */
export const LazyLoader: React.FC<{
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}> = ({
  children,
  fallback = <Spinner text="Loading component..." />,
  className = ''
}) => {
  return (
    <React.Suspense fallback={
      <div className={`lazy-loader ${className}`}>
        {fallback}
      </div>
    }>
      {children}
    </React.Suspense>
  )
}

export default {
  Spinner,
  Skeleton,
  Pulse,
  Dots,
  ProgressBar,
  CardSkeleton,
  ChartSkeleton,
  TableSkeleton,
  LoadingOverlay,
  LazyLoader
}
