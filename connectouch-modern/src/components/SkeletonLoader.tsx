import React from 'react'
import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'chart'
  width?: string | number
  height?: string | number
  animate?: boolean
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  animate = true
}) => {
  const baseClasses = 'bg-white/10 rounded'
  
  const variantClasses = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
    chart: 'rounded-lg h-64'
  }

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '100%')
  }

  const skeletonElement = (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )

  if (!animate) {
    return skeletonElement
  }

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      animate={{
        opacity: [0.4, 0.8, 0.4],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

// Dashboard-specific skeleton components
export const DashboardHeroSkeleton: React.FC = () => (
  <section className="relative py-20 px-6">
    <div className="max-w-7xl mx-auto text-center">
      <div className="space-y-6">
        <Skeleton variant="text" height="4rem" width="60%" className="mx-auto" />
        <Skeleton variant="text" height="2rem" width="80%" className="mx-auto" />
        <Skeleton variant="rectangular" height="3rem" width="200px" className="mx-auto" />
      </div>
    </div>
  </section>
)

export const MarketMetricsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
    {[...Array(4)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <Skeleton variant="circular" width="32px" height="32px" />
          <Skeleton variant="circular" width="8px" height="8px" />
        </div>
        <Skeleton variant="text" height="2rem" width="70%" className="mb-2" />
        <Skeleton variant="text" height="1rem" width="50%" />
      </motion.div>
    ))}
  </div>
)

export const LivePricesSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
    {[...Array(2)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Skeleton variant="circular" width="32px" height="32px" />
          <Skeleton variant="text" width="100px" height="1.5rem" />
        </div>
        <Skeleton variant="text" height="2rem" width="60%" className="mx-auto mb-1" />
        <Skeleton variant="text" height="1rem" width="40%" className="mx-auto mb-2" />
        <Skeleton variant="text" height="0.75rem" width="50%" className="mx-auto" />
      </motion.div>
    ))}
  </div>
)

export const SectorCardsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="glass-card p-8 hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-4 mb-6">
          <Skeleton variant="circular" width="48px" height="48px" />
          <div className="flex-1">
            <Skeleton variant="text" height="1.5rem" width="70%" className="mb-2" />
            <Skeleton variant="text" height="1rem" width="50%" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[...Array(4)].map((_, j) => (
            <div key={j}>
              <Skeleton variant="text" height="0.875rem" width="60%" className="mb-1" />
              <Skeleton variant="text" height="1.25rem" width="80%" />
            </div>
          ))}
        </div>
        
        <Skeleton variant="rectangular" height="2.5rem" width="100%" />
      </motion.div>
    ))}
  </div>
)

export const TradingChartSkeleton: React.FC = () => (
  <div className="glass-card p-6">
    <div className="flex items-center justify-between mb-6">
      <Skeleton variant="text" height="1.5rem" width="200px" />
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="2rem" width="60px" />
        ))}
      </div>
    </div>
    <Skeleton variant="chart" height="400px" />
  </div>
)

export const ChatInterfaceSkeleton: React.FC = () => (
  <div className="glass-card p-6">
    <div className="flex items-center space-x-3 mb-6">
      <Skeleton variant="circular" width="40px" height="40px" />
      <div className="flex-1">
        <Skeleton variant="text" height="1.25rem" width="150px" className="mb-1" />
        <Skeleton variant="text" height="0.875rem" width="200px" />
      </div>
    </div>
    
    <div className="space-y-4 mb-6 max-h-96">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton variant="circular" width="32px" height="32px" />
          <div className="flex-1">
            <Skeleton variant="text" height="1rem" width="80%" className="mb-2" />
            <Skeleton variant="text" height="1rem" width="60%" />
          </div>
        </div>
      ))}
    </div>
    
    <div className="flex gap-3">
      <Skeleton variant="rectangular" height="3rem" className="flex-1" />
      <Skeleton variant="rectangular" height="3rem" width="3rem" />
    </div>
  </div>
)

export const ComponentGridSkeleton: React.FC<{ columns?: number; items?: number }> = ({ 
  columns = 3, 
  items = 6 
}) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
    {[...Array(items)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <Skeleton variant="text" height="1.25rem" width="60%" />
          <Skeleton variant="circular" width="8px" height="8px" />
        </div>
        <Skeleton variant="text" height="2rem" width="40%" className="mb-2" />
        <Skeleton variant="text" height="0.875rem" width="70%" className="mb-4" />
        <div className="space-y-2">
          <Skeleton variant="text" height="0.75rem" width="100%" />
          <Skeleton variant="text" height="0.75rem" width="80%" />
          <Skeleton variant="text" height="0.75rem" width="90%" />
        </div>
      </motion.div>
    ))}
  </div>
)

// Progressive loading skeleton that reveals content as it loads
export const ProgressiveLoadingSkeleton: React.FC<{
  isLoading: boolean
  children: React.ReactNode
  skeleton: React.ReactNode
  delay?: number
}> = ({ isLoading, children, skeleton, delay = 0 }) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
      >
        {skeleton}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}

export default Skeleton
