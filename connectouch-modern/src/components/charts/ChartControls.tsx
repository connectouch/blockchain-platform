import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Plus, 
  Trash2, 
  Settings, 
  Eye, 
  EyeOff,
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react'
import { useChartStore } from '../../stores/useChartStore'
import { 
  IndicatorType, 
  DEFAULT_INDICATOR_SETTINGS, 
  INDICATOR_COLORS,
  IndicatorConfig 
} from '../../types/chart'

interface ChartControlsProps {
  onClose: () => void
}

const AVAILABLE_INDICATORS: { type: IndicatorType; name: string; icon: React.ReactNode }[] = [
  { type: 'SMA', name: 'Simple Moving Average', icon: <TrendingUp className="w-4 h-4" /> },
  { type: 'EMA', name: 'Exponential Moving Average', icon: <TrendingUp className="w-4 h-4" /> },
  { type: 'RSI', name: 'Relative Strength Index', icon: <Activity className="w-4 h-4" /> },
  { type: 'MACD', name: 'MACD', icon: <BarChart3 className="w-4 h-4" /> },
  { type: 'BollingerBands', name: 'Bollinger Bands', icon: <TrendingUp className="w-4 h-4" /> },
  { type: 'VWAP', name: 'Volume Weighted Average Price', icon: <BarChart3 className="w-4 h-4" /> },
  { type: 'SupportResistance', name: 'Support & Resistance', icon: <Activity className="w-4 h-4" /> }
]

const ChartControls: React.FC<ChartControlsProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'indicators' | 'drawing' | 'alerts'>('indicators')
  const [showAddIndicator, setShowAddIndicator] = useState(false)
  const [selectedIndicatorType, setSelectedIndicatorType] = useState<IndicatorType>('SMA')

  const {
    config,
    addIndicator,
    removeIndicator,
    updateIndicator,
    updateConfig
  } = useChartStore()

  const handleAddIndicator = () => {
    const usedColors = config.indicators.map(ind => ind.color)
    const availableColor = INDICATOR_COLORS.find(color => !usedColors.includes(color)) || INDICATOR_COLORS[0] || '#3B82F6'

    const newIndicator: IndicatorConfig = {
      id: `${selectedIndicatorType.toLowerCase()}-${Date.now()}`,
      type: selectedIndicatorType,
      enabled: true,
      settings: { ...DEFAULT_INDICATOR_SETTINGS[selectedIndicatorType] },
      color: availableColor,
      lineWidth: 2
    }

    addIndicator(newIndicator)
    setShowAddIndicator(false)
  }

  const handleToggleIndicator = (indicatorId: string) => {
    const indicator = config.indicators.find(ind => ind.id === indicatorId)
    if (indicator) {
      updateIndicator(indicatorId, { enabled: !indicator.enabled } as any)
    }
  }

  const handleUpdateIndicatorSetting = (indicatorId: string, key: string, value: number) => {
    updateIndicator(indicatorId, { [key]: value })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="text-white font-semibold">Chart Settings</h3>
        <button
          onClick={onClose}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {[
          { id: 'indicators', label: 'Indicators', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'drawing', label: 'Drawing', icon: <Settings className="w-4 h-4" /> },
          { id: 'alerts', label: 'Alerts', icon: <Activity className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Indicators Tab */}
        {activeTab === 'indicators' && (
          <div className="p-4 space-y-4">
            {/* Chart Options */}
            <div className="space-y-3">
              <h4 className="text-white/80 font-medium">Chart Options</h4>
              
              <label className="flex items-center justify-between">
                <span className="text-white/60">Show Volume</span>
                <input
                  type="checkbox"
                  checked={config.showVolume}
                  onChange={(e) => updateConfig({ showVolume: e.target.checked })}
                  className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-white/60">Show Grid</span>
                <input
                  type="checkbox"
                  checked={config.showGrid}
                  onChange={(e) => updateConfig({ showGrid: e.target.checked })}
                  className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
              </label>
            </div>

            {/* Active Indicators */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-white/80 font-medium">Active Indicators</h4>
                <button
                  onClick={() => setShowAddIndicator(true)}
                  className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {config.indicators.length === 0 ? (
                <p className="text-white/40 text-sm">No indicators added</p>
              ) : (
                <div className="space-y-3">
                  {config.indicators.map(indicator => (
                    <div key={indicator.id} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: indicator.color }}
                          />
                          <span className="text-white text-sm font-medium">
                            {AVAILABLE_INDICATORS.find(ind => ind.type === indicator.type)?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleIndicator(indicator.id)}
                            className="p-1 text-white/60 hover:text-white transition-colors"
                          >
                            {indicator.enabled ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => removeIndicator(indicator.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Indicator Settings */}
                      {indicator.enabled && (
                        <div className="space-y-2">
                          {indicator.settings.period !== undefined && (
                            <label className="block">
                              <span className="text-white/60 text-xs">Period</span>
                              <input
                                type="number"
                                value={indicator.settings.period}
                                onChange={(e) => handleUpdateIndicatorSetting(
                                  indicator.id, 
                                  'period', 
                                  parseInt(e.target.value)
                                )}
                                className="w-full mt-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                min="1"
                                max="200"
                              />
                            </label>
                          )}
                          
                          {indicator.settings.fastPeriod !== undefined && (
                            <label className="block">
                              <span className="text-white/60 text-xs">Fast Period</span>
                              <input
                                type="number"
                                value={indicator.settings.fastPeriod}
                                onChange={(e) => handleUpdateIndicatorSetting(
                                  indicator.id, 
                                  'fastPeriod', 
                                  parseInt(e.target.value)
                                )}
                                className="w-full mt-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                min="1"
                                max="50"
                              />
                            </label>
                          )}
                          
                          {indicator.settings.slowPeriod !== undefined && (
                            <label className="block">
                              <span className="text-white/60 text-xs">Slow Period</span>
                              <input
                                type="number"
                                value={indicator.settings.slowPeriod}
                                onChange={(e) => handleUpdateIndicatorSetting(
                                  indicator.id, 
                                  'slowPeriod', 
                                  parseInt(e.target.value)
                                )}
                                className="w-full mt-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                min="1"
                                max="100"
                              />
                            </label>
                          )}
                          
                          {indicator.settings.stdDev !== undefined && (
                            <label className="block">
                              <span className="text-white/60 text-xs">Standard Deviation</span>
                              <input
                                type="number"
                                value={indicator.settings.stdDev}
                                step="0.1"
                                onChange={(e) => handleUpdateIndicatorSetting(
                                  indicator.id, 
                                  'stdDev', 
                                  parseFloat(e.target.value)
                                )}
                                className="w-full mt-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                min="0.1"
                                max="5"
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Indicator Modal */}
            {showAddIndicator && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/90 border border-white/20 rounded-lg p-6 w-96"
                >
                  <h3 className="text-white font-semibold mb-4">Add Indicator</h3>
                  
                  <div className="space-y-3 mb-6">
                    {AVAILABLE_INDICATORS.map(indicator => (
                      <button
                        key={indicator.type}
                        onClick={() => setSelectedIndicatorType(indicator.type)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          selectedIndicatorType === indicator.type
                            ? 'bg-blue-500/20 border border-blue-500'
                            : 'bg-white/5 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {indicator.icon}
                        <span className="text-white">{indicator.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAddIndicator(false)}
                      className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddIndicator}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {/* Drawing Tab */}
        {activeTab === 'drawing' && (
          <div className="p-4">
            <p className="text-white/60 text-sm">Drawing tools coming soon...</p>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="p-4">
            <p className="text-white/60 text-sm">Price alerts coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChartControls
