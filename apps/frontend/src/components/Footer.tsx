import React from 'react'
import { motion } from 'framer-motion'
import { Github, Mail } from 'lucide-react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Mail, href: '#', label: 'Contact' },
  ]

  return (
    <footer className="relative bg-black/20 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h3 className="text-xl font-bold gradient-text">Connectouch</h3>
                <p className="text-xs text-white/60">Blockchain AI Platform</p>
              </div>
            </div>
            <p className="text-white/70 mb-6 max-w-md">
              Blockchain AI Platform for data analysis and insights.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200"
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5 text-white/70 hover:text-white" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              {[
                { name: 'Dashboard', href: '/' },
                { name: 'DeFi Analysis', href: '/defi' },
                { name: 'NFT Explorer', href: '/nft' },
                { name: 'GameFi Hub', href: '/gamefi' },
                { name: 'DAO Governance', href: '/dao' },
                { name: 'AI Analysis', href: '/analysis' },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {[
                { name: 'API Reference', href: '/api' },
                { name: 'Health Check', href: '/health' },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-white/60 text-sm">
            © {currentYear} Connectouch Platform
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
