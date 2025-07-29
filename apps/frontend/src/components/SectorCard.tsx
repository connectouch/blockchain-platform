import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity,
  ArrowRight,
  BarChart3
} from 'lucide-react'
import { useAppActions } from '@stores/useAppStore'
import type { SectorCardProps } from '../types'

const SectorCard: React.FC<SectorCardProps> = ({ sector, onClick, className = '' }) => {
  const navigate = useNavigate()
  const { setSector } = useAppActions()

  const handleCardClick = () => {
    setSector(sector.id)
    
    if (onClick) {
      onClick(sector)
    } else {
      // Navigate to sector page
      const routes: Record<string, string> = {
        defi: '/defi',
        nft: '/nft',
        gamefi: '/gamefi',
        dao: '/dao',
        infrastructure: '/infrastructure',
        'web3-tools': '/web3-tools',
      }
      
      const route = routes[sector.id]
      if (route) {
        navigate(route)
      }
    }
  }

  const isPositiveGrowth = sector.growth24h.startsWith('+')

  // Format market cap for display
  const formatMarketCap = (cap: string) => {
    const value = parseFloat(cap.replace(/[$B]/g, ''))
    if (value >= 1) {
      return `$${value.toFixed(1)}B`
    } else {
      return `$${(value * 1000).toFixed(0)}M`
    }
  }

  // Get top items for display
  const getTopItems = () => {
    if (sector.topProtocols) return sector.topProtocols.slice(0, 3)
    if (sector.topCollections) return sector.topCollections.slice(0, 3)
    if (sector.topGames) return sector.topGames.slice(0, 3)
    if (sector.topDAOs) return sector.topDAOs.slice(0, 3)
    if (sector.topChains) return sector.topChains.slice(0, 3)
    if (sector.topTools) return sector.topTools.slice(0, 3)
    return []
  }

  const topItems = getTopItems()

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02, 
        y: -5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className={`
        relative overflow-hidden cursor-pointer group
        bg-gradient-to-br from-white/5 to-white/10 
        backdrop-blur-lg border border-white/10 
        rounded-2xl p-6 h-full
        hover:border-white/20 hover:shadow-2xl
        transition-all duration-300
        ${className}
      `}
    >
      {/* Background Gradient */}
      <div 
        className={`
          absolute inset-0 opacity-0 group-hover:opacity-10 
          transition-opacity duration-300 bg-gradient-to-br ${sector.color}
        `} 
      />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`
            w-12 h-12 rounded-xl bg-gradient-to-br ${sector.color} 
            flex items-center justify-center text-2xl
            shadow-lg group-hover:shadow-xl transition-shadow duration-300
          `}>
            {sector.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors">
              {sector.name}
            </h3>
            <p className="text-white/60 text-sm">
              {sector.description.length > 40 
                ? `${sector.description.substring(0, 40)}...` 
                : sector.description
              }
            </p>
          </div>
        </div>
        
        <motion.div
          whileHover={{ x: 5 }}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <ArrowRight className="w-5 h-5 text-white/70" />
        </motion.div>
      </div>

      {/* Metrics */}
      <div className="relative z-10 space-y-4 mb-6">
        {/* Market Cap & Growth */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-white font-semibold">
              {formatMarketCap(sector.marketCap)}
            </span>
          </div>
          <div className={`
            flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
            ${isPositiveGrowth 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
            }
          `}>
            {isPositiveGrowth ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{sector.growth24h}</span>
          </div>
        </div>

        {/* Additional Metrics */}
        {sector.metrics && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {sector.metrics.tvl && (
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-3 h-3 text-blue-400" />
                <span className="text-white/70">
                  TVL: ${(sector.metrics.tvl / 1e9).toFixed(1)}B
                </span>
              </div>
            )}
            {sector.metrics.users && (
              <div className="flex items-center space-x-2">
                <Users className="w-3 h-3 text-purple-400" />
                <span className="text-white/70">
                  {sector.metrics.users > 1e6 
                    ? `${(sector.metrics.users / 1e6).toFixed(1)}M users`
                    : `${(sector.metrics.users / 1e3).toFixed(0)}K users`
                  }
                </span>
              </div>
            )}
            {sector.metrics.volume24h && (
              <div className="flex items-center space-x-2">
                <Activity className="w-3 h-3 text-orange-400" />
                <span className="text-white/70">
                  Vol: ${(sector.metrics.volume24h / 1e6).toFixed(0)}M
                </span>
              </div>
            )}
            {sector.metrics.avgApy && (
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-white/70">
                  APY: {sector.metrics.avgApy}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Top Items */}
      {topItems.length > 0 && (
        <div className="relative z-10 mb-4">
          <p className="text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">
            Top {sector.topProtocols ? 'Protocols' : 
                 sector.topCollections ? 'Collections' :
                 sector.topGames ? 'Games' :
                 sector.topDAOs ? 'DAOs' :
                 sector.topChains ? 'Chains' : 'Tools'}
          </p>
          <div className="flex flex-wrap gap-1">
            {topItems.map((item, index) => (
              <span
                key={`${sector.id}-item-${index}-${item}`}
                className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-full"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Explore Button */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-xs text-blue-400 font-medium">Real-time data</span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200 flex items-center space-x-1"
        >
          <span>Explore</span>
          <ArrowRight className="w-3 h-3" />
        </motion.button>
      </div>

      {/* Hover Effect Overlay */}
      <div className={`
        absolute inset-0 bg-gradient-to-r ${sector.color} 
        opacity-0 group-hover:opacity-5 
        transition-opacity duration-300 rounded-2xl pointer-events-none
      `} />
    </motion.div>
  )
}

export default SectorCard
