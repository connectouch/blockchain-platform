import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Activity, DollarSign, Users } from 'lucide-react'

const MarketOverview: React.FC = () => {
  const marketStats = [
    {
      label: 'Total Market Cap',
      value: '$165.5B',
      change: '+1.8%',
      icon: DollarSign,
      color: 'text-green-400',
    },
    {
      label: 'Active Users',
      value: '15.2M',
      change: '+5.2%',
      icon: Users,
      color: 'text-blue-400',
    },
    {
      label: 'Daily Volume',
      value: '$2.8B',
      change: '+3.1%',
      icon: Activity,
      color: 'text-purple-400',
    },
    {
      label: 'Growth Rate',
      value: '12.5%',
      change: '+0.8%',
      icon: TrendingUp,
      color: 'text-orange-400',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="glass-card p-8"
    >
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white mb-2">Market Overview</h3>
        <p className="text-white/70">Real-time blockchain ecosystem metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {marketStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-200"
          >
            <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-1">{stat.value}</h4>
            <p className="text-white/60 text-sm mb-2">{stat.label}</p>
            <span className="text-green-400 text-xs font-medium">{stat.change}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-white/60">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Live data updated every 30 seconds</span>
        </div>
      </div>
    </motion.div>
  )
}

export default MarketOverview
