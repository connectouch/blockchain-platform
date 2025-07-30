import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Gamepad2, TrendingUp, Users, DollarSign, Activity } from 'lucide-react'
import { directApiService } from '../services/directApiService'
import LoadingSpinner from '@components/LoadingSpinner'
import { useAIContext } from '../contexts/AIAssistantContext'
import { comprehensiveRealTimeService } from '../services/comprehensiveRealTimeService'

// Rich Content Components for GameFi
import GameAnalytics from '../components/GameAnalytics'
import PlayToEarnCalculator from '../components/PlayToEarnCalculator'
import GuildManagement from '../components/GuildManagement'
import GamingLeaderboards from '../components/GamingLeaderboards'
import GameFiEducationalHub from '../components/GameFiEducationalHub'

const GameFiPage: React.FC = () => {
  const { setAIContext } = useAIContext()
  const [realTimeGameFiData, setRealTimeGameFiData] = useState([])
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Set AI context for GameFi page
  useEffect(() => {
    setAIContext('gamefi', { page: 'gamefi', projects: [] })
  }, [])

  // Initialize real-time GameFi data
  useEffect(() => {
    const initializeRealTimeData = async () => {
      try {
        await comprehensiveRealTimeService.initialize()

        // Set up real-time GameFi data listener
        comprehensiveRealTimeService.on('gamefiUpdated', (gamefiProjects) => {
          setRealTimeGameFiData(gamefiProjects)
          setLastUpdate(new Date())
        })

        // Get initial data
        const initialProjects = comprehensiveRealTimeService.getGameFiProjects()
        setRealTimeGameFiData(initialProjects)
      } catch (error) {
        console.warn('Real-time GameFi data initialization failed:', error)
      }
    }

    initializeRealTimeData()

    return () => {
      comprehensiveRealTimeService.removeAllListeners()
    }
  }, [])
  // Fetch GameFi projects data using direct API service
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['gamefi', 'projects'],
    queryFn: directApiService.getGameFiProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  })

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Gamepad2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">GameFi Hub</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Explore blockchain gaming and play-to-earn opportunities
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="glass-card p-8 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-red-400 mb-4">Error Loading GameFi Data</h3>
              <p className="text-white/70">Unable to fetch project data. Please try again later.</p>
            </div>
          </div>
        )}

        {/* Real-Time GameFi Data Section */}
        {realTimeGameFiData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Real-Time GameFi Metrics</h3>
                <span className="text-sm text-green-400">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-white/60 text-sm">Total Market Cap</p>
                  <p className="text-2xl font-bold text-white">
                    ${(realTimeGameFiData.reduce((sum, p) => sum + p.marketCap, 0) / 1e9).toFixed(2)}B
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-white/60 text-sm">Active Players</p>
                  <p className="text-2xl font-bold text-white">
                    {(realTimeGameFiData.reduce((sum, p) => sum + p.players, 0) / 1e6).toFixed(1)}M
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-white/60 text-sm">24h Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    ${(realTimeGameFiData.reduce((sum, p) => sum + p.revenue24h, 0) / 1e6).toFixed(1)}M
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-white/60 text-sm">Top Game</p>
                  <p className="text-lg font-bold text-white">
                    {realTimeGameFiData.sort((a, b) => b.marketCap - a.marketCap)[0]?.name.slice(0, 12)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced GameFi Content */}
        {!isLoading && !error && (
          <>
            {/* Game Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <GameAnalytics
                games={projects.map((p: any) => ({
                  id: p.id || p.name,
                  name: p.name,
                  symbol: p.symbol || p.token,
                  category: p.category?.toLowerCase() || 'casual',
                  marketCap: p.marketCap || 0,
                  price: p.price || 0,
                  change24h: p.change24h || 0,
                  volume24h: p.volume24h || 0,
                  players: {
                    total: p.totalUsers || 0,
                    daily: p.dailyActiveUsers || 0,
                    monthly: (p.dailyActiveUsers || 0) * 20,
                    peak24h: (p.dailyActiveUsers || 0) * 1.5
                  },
                  revenue: {
                    daily: (p.averageEarnings || 0) * (p.dailyActiveUsers || 0),
                    monthly: (p.averageEarnings || 0) * (p.dailyActiveUsers || 0) * 30,
                    total: (p.averageEarnings || 0) * (p.dailyActiveUsers || 0) * 365,
                    playerAverage: p.averageEarnings || 0
                  },
                  tokenomics: {
                    totalSupply: 1000000000,
                    circulatingSupply: 500000000,
                    stakingAPY: 15 + Math.random() * 20,
                    burnRate: Math.random() * 5
                  },
                  gameplay: {
                    averageSessionTime: 30 + Math.random() * 60,
                    retentionRate: 60 + Math.random() * 30,
                    newPlayerGrowth: Math.random() * 20,
                    churnRate: Math.random() * 15
                  },
                  platform: [p.blockchain || 'ethereum'],
                  status: p.status || 'active',
                  launchDate: '2023-01-01',
                  description: `${p.name} is a leading ${p.category} game in the GameFi space.`,
                  website: p.website
                }))}
                isLoading={isLoading}
              />
            </motion.div>

            {/* Play-to-Earn Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-16"
            >
              <PlayToEarnCalculator />
            </motion.div>

            {/* Guild Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-16"
            >
              <GuildManagement
                userGuilds={[]}
                isGuildLeader={false}
              />
            </motion.div>

            {/* Gaming Leaderboards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mb-16"
            >
              <GamingLeaderboards
                selectedGame={projects.length > 0 ? projects[0].name : undefined}
                games={projects.map((p: any) => p.name)}
              />
            </motion.div>

            {/* Educational Hub */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="mb-16"
            >
              <GameFiEducationalHub
                userLevel="intermediate"
                selectedGame={projects.length > 0 ? projects[0].name : undefined}
              />
            </motion.div>

            {/* GameFi Analytics Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="glass-card p-6 text-center">
                  <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Total Market Cap</h3>
                  <p className="text-3xl font-bold text-green-400">
                    ${(projects.reduce((sum: number, p: any) => sum + (typeof p.marketCap === 'number' && !isNaN(p.marketCap) ? p.marketCap : 0), 0) / 1e9).toFixed(1)}B
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-blue-400">
                    {(projects.reduce((sum: number, p: any) => sum + (typeof p.dailyActiveUsers === 'number' && !isNaN(p.dailyActiveUsers) ? p.dailyActiveUsers : 0), 0) / 1000).toFixed(0)}K
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Avg Earnings</h3>
                  <p className="text-3xl font-bold text-yellow-400">
                    ${projects.length > 0 ? (projects.reduce((sum: number, p: any) => sum + (typeof p.averageEarnings === 'number' && !isNaN(p.averageEarnings) ? p.averageEarnings : 0), 0) / projects.length).toFixed(1) : '0.0'}
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <Activity className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Projects</h3>
                  <p className="text-3xl font-bold text-purple-400">{projects.length}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

export default GameFiPage
