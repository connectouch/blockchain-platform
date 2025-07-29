import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Monitor, Bell, Zap, Download, Shield, Palette } from 'lucide-react'
import { useElectron } from '../hooks/useElectron'

const DesktopSettings: React.FC = () => {
  const { 
    isElectron, 
    appVersion, 
    platform, 
    getStoredValue, 
    setStoredValue,
    setAutoLaunch,
    showDesktopNotification 
  } = useElectron()

  const [settings, setSettings] = useState({
    autoLaunch: false,
    minimizeToTray: true,
    notifications: true,
    priceAlerts: true,
    autoUpdate: true,
    theme: 'dark',
    refreshInterval: 30
  })

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (isElectron) {
        const savedSettings = await getStoredValue('desktop-settings')
        if (savedSettings) {
          setSettings({ ...settings, ...savedSettings })
        }
      }
    }
    loadSettings()
  }, [isElectron])

  // Save settings when changed
  const updateSetting = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    
    if (isElectron) {
      await setStoredValue('desktop-settings', newSettings)
      
      // Handle specific settings
      if (key === 'autoLaunch') {
        await setAutoLaunch(value)
      }
      
      await showDesktopNotification(
        'Settings Updated',
        `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} has been updated`
      )
    }
  }

  const testNotification = async () => {
    await showDesktopNotification(
      'Test Notification',
      'Desktop notifications are working perfectly! 🎉'
    )
  }

  if (!isElectron) {
    return (
      <div className="glass-card p-6">
        <div className="text-center">
          <Monitor className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Desktop Settings</h3>
          <p className="text-white/70">
            These settings are only available in the desktop application.
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Desktop Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-white/60">Version</p>
            <p className="text-white font-semibold">{appVersion}</p>
          </div>
          <div>
            <p className="text-white/60">Platform</p>
            <p className="text-white font-semibold capitalize">{platform}</p>
          </div>
          <div>
            <p className="text-white/60">Mode</p>
            <p className="text-green-400 font-semibold">Desktop App</p>
          </div>
        </div>
      </div>

      {/* Startup Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Startup & Performance</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Launch at startup</p>
              <p className="text-white/60 text-sm">Automatically start Connectouch when you log in</p>
            </div>
            <button
              onClick={() => updateSetting('autoLaunch', !settings.autoLaunch)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoLaunch ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoLaunch ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Minimize to system tray</p>
              <p className="text-white/60 text-sm">Keep running in background when window is closed</p>
            </div>
            <button
              onClick={() => updateSetting('minimizeToTray', !settings.minimizeToTray)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.minimizeToTray ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.minimizeToTray ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Data refresh interval</p>
              <p className="text-white/60 text-sm">How often to update market data (seconds)</p>
            </div>
            <select
              value={settings.refreshInterval}
              onChange={(e) => updateSetting('refreshInterval', parseInt(e.target.value))}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
            >
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-green-400" />
          <h3 className="text-xl font-bold text-white">Notifications</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Desktop notifications</p>
              <p className="text-white/60 text-sm">Show system notifications for important updates</p>
            </div>
            <button
              onClick={() => updateSetting('notifications', !settings.notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Price alerts</p>
              <p className="text-white/60 text-sm">Get notified when prices reach your targets</p>
            </div>
            <button
              onClick={() => updateSetting('priceAlerts', !settings.priceAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.priceAlerts ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.priceAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={testNotification}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Test Notification
            </button>
          </div>
        </div>
      </div>

      {/* Updates */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Updates</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Automatic updates</p>
              <p className="text-white/60 text-sm">Download and install updates automatically</p>
            </div>
            <button
              onClick={() => updateSetting('autoUpdate', !settings.autoUpdate)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoUpdate ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoUpdate ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-pink-400" />
          <h3 className="text-xl font-bold text-white">Appearance</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Theme</p>
              <p className="text-white/60 text-sm">Choose your preferred color scheme</p>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-orange-400" />
          <h3 className="text-xl font-bold text-white">Keyboard Shortcuts</h3>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/70">Show/Hide App</span>
            <span className="text-white font-mono">Ctrl+Shift+C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Toggle Price Ticker</span>
            <span className="text-white font-mono">Ctrl+Shift+P</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">New Analysis</span>
            <span className="text-white font-mono">Ctrl+N</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Settings</span>
            <span className="text-white font-mono">Ctrl+,</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default DesktopSettings
