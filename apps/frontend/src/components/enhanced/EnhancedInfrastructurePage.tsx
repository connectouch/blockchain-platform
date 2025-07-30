import React from 'react'
import { motion } from 'framer-motion'
import { Server, Activity, Zap } from 'lucide-react'

const EnhancedInfrastructurePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <Server className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-4">Enhanced Infrastructure Page</h1>
        <p className="text-white/60 mb-8">Network infrastructure monitoring coming soon!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <Server className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="text-white font-bold mb-2">Node Status</h3>
            <p className="text-white/60">Network node monitoring</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <Activity className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-white font-bold mb-2">Performance</h3>
            <p className="text-white/60">Network performance metrics</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <Zap className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-white font-bold mb-2">Validators</h3>
            <p className="text-white/60">Validator rankings</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default EnhancedInfrastructurePage
