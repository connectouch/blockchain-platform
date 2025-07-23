// Enhanced Performance optimization service for Connectouch platform
import React from 'react'
import { networkConfig } from '../config/network'

// Native debounce implementation
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }) as T
}

// Native throttle implementation
function throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let lastCall = 0
  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      return func(...args)
    }
  }) as T
}

// Cache interface
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
}

// Performance metrics interface
interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  apiCalls: number
  cacheHits: number
  cacheMisses: number
  memoryUsage: number
  componentMounts: number
  networkLatency: number
  dataTransferred: number
  requestsPerSecond: number
}

// Network optimization configuration
interface NetworkOptimizationConfig {
  enableRequestBatching: boolean
  enableCompression: boolean
  enablePrefetching: boolean
  batchDelay: number
  compressionThreshold: number
  maxConcurrentRequests: number
}

class PerformanceOptimizer {
  private cache = new Map<string, CacheEntry<any>>()
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    memoryUsage: 0,
    componentMounts: 0,
    networkLatency: 0,
    dataTransferred: 0,
    requestsPerSecond: 0
  }

  private networkConfig: NetworkOptimizationConfig = {
    enableRequestBatching: true,
    enableCompression: true,
    enablePrefetching: true,
    batchDelay: 100,
    compressionThreshold: 1024,
    maxConcurrentRequests: 6
  }

  private requestQueue: Array<{
    url: string
    options: RequestInit
    resolve: (value: any) => void
    reject: (reason: any) => void
  }> = []

  private activeRequests = 0
  private observers = new Map<string, PerformanceObserver>()
  private startTime = performance.now()

  constructor() {
    this.initializePerformanceMonitoring()
    this.setupMemoryMonitoring()
    this.setupCacheCleanup()
  }

  // Initialize performance monitoring
  private initializePerformanceMonitoring() {
    // Monitor navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.metrics.loadTime = navEntry.loadEventEnd - navEntry.fetchStart
          }
        })
      })
      
      try {
        navigationObserver.observe({ entryTypes: ['navigation'] })
        this.observers.set('navigation', navigationObserver)
      } catch (error) {
        console.warn('Performance navigation monitoring not supported')
      }
    }

    // Monitor resource loading
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            // Track slow resources
            if (entry.duration > 1000) {
              console.warn(`Slow resource detected: ${entry.name} took ${entry.duration}ms`)
            }
          }
        })
      })

      try {
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.set('resource', resourceObserver)
      } catch (error) {
        console.warn('Performance resource monitoring not supported')
      }
    }
  }

  // Setup memory monitoring
  private setupMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        if (memory) {
          this.metrics.memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize
          
          // Warn if memory usage is high
          if (this.metrics.memoryUsage > 0.8) {
            console.warn(`High memory usage detected: ${(this.metrics.memoryUsage * 100).toFixed(1)}%`)
            this.cleanupCache(true) // Aggressive cleanup
          }
        }
      }, 30000) // Check every 30 seconds
    }
  }

  // Setup automatic cache cleanup
  private setupCacheCleanup() {
    setInterval(() => {
      this.cleanupCache()
    }, 60000) // Cleanup every minute
  }

  // Cache management
  set<T>(key: string, data: T, ttl: number = 300000): void { // Default 5 minutes TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      this.metrics.cacheMisses++
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.metrics.cacheMisses++
      return null
    }

    // Update hit count
    entry.hits++
    this.metrics.cacheHits++
    return entry.data
  }

  // Clean up expired cache entries
  private cleanupCache(aggressive = false) {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      const isExpired = now - entry.timestamp > entry.ttl
      const shouldCleanAggressive = aggressive && entry.hits < 2 // Remove rarely used items
      
      if (isExpired || shouldCleanAggressive) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`Cache cleanup: removed ${cleaned} entries`)
    }
  }

  // Debounced API call wrapper
  createDebouncedApiCall<T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 300
  ): T {
    return debounce((...args: Parameters<T>) => {
      this.metrics.apiCalls++
      return fn(...args)
    }, delay) as T
  }

  // Throttled function wrapper
  createThrottledFunction<T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 100
  ): T {
    return throttle((...args: Parameters<T>) => {
      return fn(...args)
    }, delay) as T
  }

  // Component mount tracking
  trackComponentMount(componentName: string) {
    this.metrics.componentMounts++
    const startTime = performance.now()
    
    return () => {
      const renderTime = performance.now() - startTime
      this.metrics.renderTime += renderTime
      
      if (renderTime > 100) {
        console.warn(`Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`)
      }
    }
  }

  // Preload critical resources
  preloadResource(url: string, type: 'script' | 'style' | 'image' | 'fetch' = 'fetch') {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.doPreload(url, type)
      })
    } else {
      setTimeout(() => this.doPreload(url, type), 0)
    }
  }

  private doPreload(url: string, type: string) {
    switch (type) {
      case 'script':
        const script = document.createElement('link')
        script.rel = 'preload'
        script.as = 'script'
        script.href = url
        document.head.appendChild(script)
        break
      
      case 'style':
        const style = document.createElement('link')
        style.rel = 'preload'
        style.as = 'style'
        style.href = url
        document.head.appendChild(style)
        break
      
      case 'image':
        const img = new Image()
        img.src = url
        break
      
      case 'fetch':
        fetch(url, { method: 'HEAD' }).catch(() => {
          // Ignore errors for preloading
        })
        break
    }
  }

  // Optimize images with lazy loading
  createLazyImageObserver(callback?: (entry: IntersectionObserverEntry) => void) {
    if (!('IntersectionObserver' in window)) {
      return null
    }

    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute('data-src')
          }
          callback?.(entry)
        }
      })
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    })
  }

  // Bundle splitting helper
  loadComponentAsync<T>(
    importFn: () => Promise<{ default: T }>,
    componentName: string
  ): Promise<T> {
    const cacheKey = `component_${componentName}`
    const cached = this.get<T>(cacheKey)
    
    if (cached) {
      return Promise.resolve(cached)
    }

    return importFn().then((module) => {
      this.set(cacheKey, module.default, 600000) // Cache for 10 minutes
      return module.default
    })
  }

  // Get performance metrics
  getMetrics(): PerformanceMetrics & {
    cacheSize: number
    cacheHitRate: number
    uptime: number
  } {
    const totalCacheRequests = this.metrics.cacheHits + this.metrics.cacheMisses
    const cacheHitRate = totalCacheRequests > 0 ? this.metrics.cacheHits / totalCacheRequests : 0
    
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      cacheHitRate,
      uptime: performance.now() - this.startTime
    }
  }

  // Network optimization methods
  async optimizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const startTime = performance.now()

    // Check if request batching is enabled and queue if needed
    if (this.networkConfig.enableRequestBatching && this.activeRequests >= this.networkConfig.maxConcurrentRequests) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push({ url, options, resolve, reject })
      })
    }

    this.activeRequests++
    this.metrics.apiCalls++

    try {
      // Add compression headers if enabled
      if (this.networkConfig.enableCompression) {
        options.headers = {
          ...options.headers,
          'Accept-Encoding': 'gzip, deflate, br'
        }
      }

      const response = await fetch(url, options)
      const endTime = performance.now()

      // Update metrics
      this.metrics.networkLatency = endTime - startTime
      this.metrics.requestsPerSecond = this.metrics.apiCalls / ((performance.now() - this.startTime) / 1000)

      // Estimate data transferred
      const contentLength = response.headers.get('content-length')
      if (contentLength) {
        this.metrics.dataTransferred += parseInt(contentLength)
      }

      return response
    } finally {
      this.activeRequests--
      this.processRequestQueue()
    }
  }

  private processRequestQueue(): void {
    if (this.requestQueue.length > 0 && this.activeRequests < this.networkConfig.maxConcurrentRequests) {
      const request = this.requestQueue.shift()
      if (request) {
        this.optimizedFetch(request.url, request.options)
          .then(request.resolve)
          .catch(request.reject)
      }
    }
  }

  // Prefetch resources
  prefetchResource(url: string): void {
    if (!this.networkConfig.enablePrefetching) return

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    document.head.appendChild(link)
  }

  // Update network configuration
  updateNetworkConfig(config: Partial<NetworkOptimizationConfig>): void {
    this.networkConfig = { ...this.networkConfig, ...config }
  }

  // Get network metrics
  getNetworkMetrics(): {
    latency: number
    dataTransferred: number
    requestsPerSecond: number
    activeRequests: number
    queuedRequests: number
  } {
    return {
      latency: this.metrics.networkLatency,
      dataTransferred: this.metrics.dataTransferred,
      requestsPerSecond: this.metrics.requestsPerSecond,
      activeRequests: this.activeRequests,
      queuedRequests: this.requestQueue.length
    }
  }

  // Clear all caches
  clearCache() {
    this.cache.clear()
    console.log('Performance cache cleared')
  }

  // Cleanup observers
  destroy() {
    this.observers.forEach((observer) => {
      observer.disconnect()
    })
    this.observers.clear()
    this.cache.clear()
    this.requestQueue.length = 0
  }
}

// Create singleton instance
export const performanceOptimizer = new PerformanceOptimizer()

// React hook for performance tracking
export function usePerformanceTracking(componentName: string) {
  const [renderTime, setRenderTime] = React.useState<number>(0)
  
  React.useEffect(() => {
    const cleanup = performanceOptimizer.trackComponentMount(componentName)
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      setRenderTime(endTime - startTime)
      cleanup()
    }
  }, [componentName])
  
  return { renderTime }
}

// Utility functions
export const debouncedApiCall = performanceOptimizer.createDebouncedApiCall.bind(performanceOptimizer)
export const throttledFunction = performanceOptimizer.createThrottledFunction.bind(performanceOptimizer)
export const cacheGet = performanceOptimizer.get.bind(performanceOptimizer)
export const cacheSet = performanceOptimizer.set.bind(performanceOptimizer)

export default performanceOptimizer
