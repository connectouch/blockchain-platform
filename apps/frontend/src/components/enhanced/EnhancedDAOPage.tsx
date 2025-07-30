import React from 'react'
import { motion } from 'framer-motion'
import { Vote, Users, DollarSign } from 'lucide-react'

const EnhancedDAOPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <Vote className="w-16 h-16 text-orange-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-4">Enhanced DAO Page</h1>
        <p className="text-white/60 mb-8">Governance proposals and voting coming soon!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <Vote className="w-8 h-8 text-orange-400 mb-4" />
            <h3 className="text-white font-bold mb-2">Proposals</h3>
            <p className="text-white/60">Active governance proposals</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <Users className="w-8 h-8 text-red-400 mb-4" />
            <h3 className="text-white font-bold mb-2">Members</h3>
            <p className="text-white/60">DAO membership tracking</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <DollarSign className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-white font-bold mb-2">Treasury</h3>
            <p className="text-white/60">Treasury analytics</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default EnhancedDAOPage
