import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Building,
  Gavel,
  Zap,
  RefreshCw,
  ChevronRight
} from 'lucide-react'

interface EconomicEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  impact: 'high' | 'medium' | 'low'
  category: 'monetary' | 'regulatory' | 'earnings' | 'technical' | 'market'
  status: 'upcoming' | 'live' | 'completed'
  relevantAssets: string[]
  expectedOutcome?: string
  actualOutcome?: string
}

interface EconomicCalendarProps {
  maxEvents?: number
  showPastEvents?: boolean
  timeframe?: 'today' | 'week' | 'month'
  className?: string
}

const EconomicCalendar: React.FC<EconomicCalendarProps> = ({
  maxEvents = 5,
  showPastEvents = false,
  timeframe = 'week',
  className = ''
}) => {
  const [events, setEvents] = useState<EconomicEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe)

  // Fetch economic events
  const fetchEconomicEvents = async () => {
    try {
      setError(null)
      
      // Mock economic events data - in production, this would fetch from economic calendar APIs
      const mockEvents: EconomicEvent[] = [
        {
          id: '1',
          title: 'Federal Reserve Interest Rate Decision',
          description: 'FOMC announces federal funds rate decision and monetary policy statement.',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          time: '14:00 EST',
          impact: 'high',
          category: 'monetary',
          status: 'upcoming',
          relevantAssets: ['BTC', 'ETH', 'DXY', 'SPY'],
          expectedOutcome: 'Rate hold at 5.25-5.50%'
        },
        {
          id: '2',
          title: 'Bitcoin ETF Approval Deadline',
          description: 'SEC deadline for decision on pending Bitcoin ETF applications.',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
          time: '17:00 EST',
          impact: 'high',
          category: 'regulatory',
          status: 'upcoming',
          relevantAssets: ['BTC', 'GBTC', 'COIN'],
          expectedOutcome: 'Approval expected'
        },
        {
          id: '3',
          title: 'Ethereum Shanghai Upgrade Anniversary',
          description: 'One year since the Shanghai upgrade enabled ETH staking withdrawals.',
          date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
          time: '12:00 UTC',
          impact: 'medium',
          category: 'technical',
          status: 'upcoming',
          relevantAssets: ['ETH', 'LDO', 'RPL'],
          expectedOutcome: 'Staking metrics review'
        },
        {
          id: '4',
          title: 'Coinbase Q4 Earnings Report',
          description: 'Quarterly earnings and trading volume metrics from major crypto exchange.',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          time: '16:30 EST',
          impact: 'medium',
          category: 'earnings',
          status: 'upcoming',
          relevantAssets: ['COIN', 'BTC', 'ETH'],
          expectedOutcome: 'Revenue beat expected'
        },
        {
          id: '5',
          title: 'CPI Inflation Data Release',
          description: 'Consumer Price Index data that could influence Fed policy and crypto markets.',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          time: '08:30 EST',
          impact: 'high',
          category: 'market',
          status: 'upcoming',
          relevantAssets: ['BTC', 'ETH', 'GOLD', 'DXY'],
          expectedOutcome: '3.2% YoY expected'
        },
        {
          id: '6',
          title: 'Solana Breakpoint Conference',
          description: 'Annual Solana developer conference with major announcements expected.',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          time: '09:00 PST',
          impact: 'medium',
          category: 'technical',
          status: 'completed',
          relevantAssets: ['SOL', 'RAY', 'SRM'],
          actualOutcome: 'New DeFi partnerships announced'
        }
      ]

      // Filter events based on timeframe and past events setting
      let filteredEvents = mockEvents
      
      if (!showPastEvents) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.date) >= new Date()
        )
      }

      // Sort by date
      filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setEvents(filteredEvents.slice(0, maxEvents))
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch economic events')
      setIsLoading(false)
    }
  }

  // Initialize and auto-refresh
  useEffect(() => {
    fetchEconomicEvents()
    
    // Refresh every 15 minutes
    const interval = setInterval(fetchEconomicEvents, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [maxEvents, showPastEvents, selectedTimeframe])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Tomorrow'
    if (diffInDays === -1) return 'Yesterday'
    if (diffInDays > 0 && diffInDays <= 7) return `In ${diffInDays} days`
    if (diffInDays < 0 && diffInDays >= -7) return `${Math.abs(diffInDays)} days ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  // Get impact configuration
  const getImpactConfig = (impact: string) => {
    const configs = {
      high: {
        color: 'text-red-400',
        bg: 'bg-red-400/20',
        border: 'border-red-400/30',
        dot: 'bg-red-400'
      },
      medium: {
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/20',
        border: 'border-yellow-400/30',
        dot: 'bg-yellow-400'
      },
      low: {
        color: 'text-green-400',
        bg: 'bg-green-400/20',
        border: 'border-green-400/30',
        dot: 'bg-green-400'
      }
    }
    return configs[impact as keyof typeof configs] || configs.medium
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons = {
      monetary: Building,
      regulatory: Gavel,
      earnings: TrendingUp,
      technical: Zap,
      market: Calendar
    }
    return icons[category as keyof typeof icons] || Calendar
  }

  // Get status color
  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: 'text-blue-400',
      live: 'text-green-400',
      completed: 'text-gray-400'
    }
    return colors[status as keyof typeof colors] || 'text-gray-400'
  }

  if (isLoading) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Economic Calendar</h3>
          </div>
          <RefreshCw className="w-4 h-4 text-white/60 animate-spin" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse p-3 bg-white/5 rounded-lg">
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-3 bg-white/5 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Economic Calendar</h3>
          </div>
          <button onClick={fetchEconomicEvents} className="p-1 hover:bg-white/10 rounded">
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        </div>
        <div className="text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Economic Calendar</h3>
        </div>
        <button 
          onClick={fetchEconomicEvents} 
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-white/60" />
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {events.map((event, index) => {
            const impactConfig = getImpactConfig(event.impact)
            const CategoryIcon = getCategoryIcon(event.category)

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 bg-white/5 rounded-lg border ${impactConfig.border} hover:bg-white/10 transition-all duration-300 cursor-pointer group`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className={`p-2 rounded-lg ${impactConfig.bg}`}>
                      <CategoryIcon className={`w-4 h-4 ${impactConfig.color}`} />
                    </div>
                    <div className={`w-2 h-2 rounded-full ${impactConfig.dot}`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-white font-medium text-sm leading-tight group-hover:text-blue-400 transition-colors">
                        {event.title}
                      </h4>
                      <ChevronRight className="w-3 h-3 text-white/40 group-hover:text-white/60 flex-shrink-0 mt-0.5" />
                    </div>
                    
                    <p className="text-white/60 text-xs mb-2 leading-relaxed">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-white/40" />
                        <span className="text-white/60">{formatDate(event.date)}</span>
                        <span className="text-white/40">•</span>
                        <span className="text-white/60">{event.time}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full ${impactConfig.bg} ${impactConfig.color} text-xs font-medium`}>
                        {event.impact} impact
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-white/50">Assets:</span>
                        <div className="flex items-center gap-1">
                          {event.relevantAssets.slice(0, 3).map((asset, idx) => (
                            <span key={asset} className="text-xs text-blue-400 bg-blue-400/20 px-1.5 py-0.5 rounded">
                              {asset}
                            </span>
                          ))}
                          {event.relevantAssets.length > 3 && (
                            <span className="text-xs text-white/40">+{event.relevantAssets.length - 3}</span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${getStatusColor(event.status)} capitalize`}>
                        {event.status}
                      </span>
                    </div>

                    {(event.expectedOutcome || event.actualOutcome) && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <div className="text-xs">
                          {event.actualOutcome ? (
                            <span className="text-green-400">
                              <strong>Actual:</strong> {event.actualOutcome}
                            </span>
                          ) : (
                            <span className="text-white/60">
                              <strong>Expected:</strong> {event.expectedOutcome}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <button className="w-full text-center text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
          View Full Calendar →
        </button>
      </div>
    </div>
  )
}

export default EconomicCalendar
