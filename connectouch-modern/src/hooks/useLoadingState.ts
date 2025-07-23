import { useState, useEffect, useCallback, useRef } from 'react'
import { performanceOptimizer } from '../services/performanceOptimizer'

export type LoadingPhase = 'initial' | 'critical' | 'secondary' | 'complete' | 'error'

export interface LoadingState {
  phase: LoadingPhase
  progress: number
  message: string
  isLoading: boolean
  hasError: boolean
  error?: string
  startTime: number
  estimatedTimeRemaining?: number
}

export interface LoadingStep {
  id: string
  name: string
  weight: number
  isComplete: boolean
  isCritical: boolean
  error?: string
}

// Hook for managing complex loading states with progress tracking
export function useLoadingState(steps: LoadingStep[]) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    phase: 'initial',
    progress: 0,
    message: 'Initializing...',
    isLoading: true,
    hasError: false,
    startTime: Date.now()
  })

  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [failedSteps, setFailedSteps] = useState<Set<string>>(new Set())
  const progressHistory = useRef<Array<{ time: number; progress: number }>>([])

  // Calculate progress based on completed steps
  const calculateProgress = useCallback(() => {
    const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0)
    const completedWeight = steps
      .filter(step => completedSteps.has(step.id))
      .reduce((sum, step) => sum + step.weight, 0)
    
    return totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0
  }, [steps, completedSteps])

  // Estimate time remaining based on progress history
  const estimateTimeRemaining = useCallback((currentProgress: number) => {
    const now = Date.now()
    const elapsed = now - loadingState.startTime
    
    // Add current progress to history
    progressHistory.current.push({ time: now, progress: currentProgress })
    
    // Keep only recent history (last 10 data points)
    if (progressHistory.current.length > 10) {
      progressHistory.current = progressHistory.current.slice(-10)
    }
    
    // Calculate average progress rate
    if (progressHistory.current.length >= 2) {
      const firstPoint = progressHistory.current[0]
      const lastPoint = progressHistory.current[progressHistory.current.length - 1]
      
      const progressDelta = lastPoint.progress - firstPoint.progress
      const timeDelta = lastPoint.time - firstPoint.time
      
      if (progressDelta > 0 && timeDelta > 0) {
        const progressRate = progressDelta / timeDelta // progress per ms
        const remainingProgress = 100 - currentProgress
        return Math.round(remainingProgress / progressRate)
      }
    }
    
    // Fallback estimation based on elapsed time
    if (currentProgress > 0) {
      const estimatedTotal = (elapsed / currentProgress) * 100
      return Math.round(estimatedTotal - elapsed)
    }
    
    return undefined
  }, [loadingState.startTime])

  // Update loading state when steps change
  useEffect(() => {
    const progress = calculateProgress()
    const criticalSteps = steps.filter(step => step.isCritical)
    const criticalCompleted = criticalSteps.every(step => completedSteps.has(step.id))
    const allCompleted = steps.every(step => completedSteps.has(step.id))
    const hasFailures = failedSteps.size > 0
    
    let phase: LoadingPhase
    let message: string
    let isLoading: boolean
    let hasError: boolean
    
    if (hasFailures) {
      phase = 'error'
      message = `Failed to load: ${Array.from(failedSteps).join(', ')}`
      isLoading = false
      hasError = true
    } else if (allCompleted) {
      phase = 'complete'
      message = 'Loading complete'
      isLoading = false
      hasError = false
    } else if (criticalCompleted) {
      phase = 'secondary'
      message = 'Loading additional features...'
      isLoading = true
      hasError = false
    } else if (progress > 0) {
      phase = 'critical'
      message = 'Loading essential data...'
      isLoading = true
      hasError = false
    } else {
      phase = 'initial'
      message = 'Initializing...'
      isLoading = true
      hasError = false
    }
    
    const estimatedTimeRemaining = estimateTimeRemaining(progress)
    
    setLoadingState(prev => ({
      ...prev,
      phase,
      progress,
      message,
      isLoading,
      hasError,
      estimatedTimeRemaining
    }))
  }, [steps, completedSteps, failedSteps, calculateProgress, estimateTimeRemaining])

  // Mark step as complete
  const completeStep = useCallback((stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]))
    setFailedSteps(prev => {
      const newSet = new Set(prev)
      newSet.delete(stepId) // Remove from failed if it was there
      return newSet
    })
    
    // Track performance
    performanceOptimizer.trackComponentMount(`loading_step_${stepId}`)
  }, [])

  // Mark step as failed
  const failStep = useCallback((stepId: string, error?: string) => {
    setFailedSteps(prev => new Set([...prev, stepId]))
    setLoadingState(prev => ({
      ...prev,
      error: error || `Step ${stepId} failed`
    }))
  }, [])

  // Reset loading state
  const reset = useCallback(() => {
    setCompletedSteps(new Set())
    setFailedSteps(new Set())
    progressHistory.current = []
    setLoadingState({
      phase: 'initial',
      progress: 0,
      message: 'Initializing...',
      isLoading: true,
      hasError: false,
      startTime: Date.now()
    })
  }, [])

  // Get step status
  const getStepStatus = useCallback((stepId: string) => {
    if (completedSteps.has(stepId)) return 'complete'
    if (failedSteps.has(stepId)) return 'failed'
    return 'pending'
  }, [completedSteps, failedSteps])

  return {
    loadingState,
    completeStep,
    failStep,
    reset,
    getStepStatus,
    completedSteps: Array.from(completedSteps),
    failedSteps: Array.from(failedSteps)
  }
}

// Hook for simple loading states with timeout
export function useSimpleLoading(
  initialLoading = true,
  timeout = 30000 // 30 seconds default timeout
) {
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [hasTimedOut, setHasTimedOut] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isLoading && timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        setHasTimedOut(true)
        setIsLoading(false)
      }, timeout)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isLoading, timeout])

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading)
    if (!loading) {
      setHasTimedOut(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    isLoading,
    hasTimedOut,
    setLoading
  }
}

// Hook for progressive data loading
export function useProgressiveLoading<T>(
  dataLoaders: Array<{
    key: string
    loader: () => Promise<T>
    isCritical?: boolean
    weight?: number
  }>
) {
  const [data, setData] = useState<Record<string, T>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const steps: LoadingStep[] = dataLoaders.map(loader => ({
    id: loader.key,
    name: loader.key,
    weight: loader.weight || 1,
    isComplete: false,
    isCritical: loader.isCritical || false
  }))

  const { loadingState, completeStep, failStep, getStepStatus } = useLoadingState(steps)

  // Load data progressively
  useEffect(() => {
    const loadData = async () => {
      // Load critical data first
      const criticalLoaders = dataLoaders.filter(loader => loader.isCritical)
      const nonCriticalLoaders = dataLoaders.filter(loader => !loader.isCritical)

      // Load critical data in parallel
      const criticalPromises = criticalLoaders.map(async (loader) => {
        try {
          const result = await loader.loader()
          setData(prev => ({ ...prev, [loader.key]: result }))
          completeStep(loader.key)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          setErrors(prev => ({ ...prev, [loader.key]: errorMessage }))
          failStep(loader.key, errorMessage)
        }
      })

      await Promise.allSettled(criticalPromises)

      // Load non-critical data in background
      const nonCriticalPromises = nonCriticalLoaders.map(async (loader) => {
        try {
          const result = await loader.loader()
          setData(prev => ({ ...prev, [loader.key]: result }))
          completeStep(loader.key)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          setErrors(prev => ({ ...prev, [loader.key]: errorMessage }))
          failStep(loader.key, errorMessage)
        }
      })

      await Promise.allSettled(nonCriticalPromises)
    }

    loadData()
  }, [dataLoaders, completeStep, failStep])

  return {
    data,
    errors,
    loadingState,
    getStepStatus,
    isDataLoaded: (key: string) => key in data,
    hasError: (key: string) => key in errors
  }
}

// Hook for network-aware loading
export function useNetworkAwareLoading() {
  const [connectionType, setConnectionType] = useState<string>('unknown')
  const [isSlowConnection, setIsSlowConnection] = useState(false)

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      const updateConnection = () => {
        setConnectionType(connection.effectiveType || 'unknown')
        setIsSlowConnection(['slow-2g', '2g'].includes(connection.effectiveType))
      }

      updateConnection()
      connection.addEventListener('change', updateConnection)

      return () => {
        connection.removeEventListener('change', updateConnection)
      }
    }
  }, [])

  // Adjust loading strategy based on connection
  const getLoadingStrategy = useCallback(() => {
    if (isSlowConnection) {
      return {
        enableLazyLoading: true,
        reduceAnimations: true,
        prioritizeCriticalData: true,
        timeout: 60000 // Longer timeout for slow connections
      }
    }

    return {
      enableLazyLoading: false,
      reduceAnimations: false,
      prioritizeCriticalData: false,
      timeout: 15000 // Standard timeout
    }
  }, [isSlowConnection])

  return {
    connectionType,
    isSlowConnection,
    loadingStrategy: getLoadingStrategy()
  }
}
