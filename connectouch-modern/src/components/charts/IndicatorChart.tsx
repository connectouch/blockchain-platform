import React from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  ComposedChart,
  Bar
} from 'recharts'
import { ChartConfig, IndicatorDataMap } from '../../types/chart'

interface IndicatorChartProps {
  indicators: IndicatorDataMap
  config: ChartConfig
  height: number
}

// Custom Tooltip for Indicators
const IndicatorTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null

  const time = new Date(label).toLocaleString()

  return (
    <div className="bg-black/90 border border-white/20 rounded-lg p-3 text-sm">
      <p className="text-white/60 mb-2">{time}</p>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="text-white">{entry.value?.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const IndicatorChart: React.FC<IndicatorChartProps> = ({ indicators, config }) => {
  // Get enabled indicators that should be displayed in separate chart
  const separateIndicators = config.indicators.filter(ind => 
    ind.enabled && ['RSI', 'MACD'].includes(ind.type)
  )

  if (separateIndicators.length === 0) {
    return null
  }

  // Prepare data for each indicator type
  const rsiIndicators = separateIndicators.filter(ind => ind.type === 'RSI')
  const macdIndicators = separateIndicators.filter(ind => ind.type === 'MACD')

  // Format X-axis labels
  const formatXAxis = (tickItem: any) => {
    return new Date(tickItem).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-black/5 to-black/10">
      {/* RSI Indicators */}
      {rsiIndicators.length > 0 && (
        <div className="h-1/2 border-b border-white/10">
          <div className="p-2">
            <h4 className="text-white/60 text-sm font-medium">RSI</h4>
          </div>
          
          <ResponsiveContainer width="100%" height="calc(100% - 30px)">
            <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              {/* Grid */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.05)"
                horizontal={true}
                vertical={false}
              />
              
              {/* Axes */}
              <XAxis 
                dataKey="time"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatXAxis}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                height={20}
              />
              <YAxis 
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                orientation="right"
                width={40}
              />

              {/* Tooltip */}
              <Tooltip content={<IndicatorTooltip />} />

              {/* RSI Reference Lines */}
              <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="2 2" strokeOpacity={0.6} />
              <ReferenceLine y={50} stroke="rgba(255,255,255,0.3)" strokeDasharray="1 1" strokeOpacity={0.4} />
              <ReferenceLine y={30} stroke="#10B981" strokeDasharray="2 2" strokeOpacity={0.6} />

              {/* RSI Lines */}
              {rsiIndicators.map(indicator => {
                const indicatorData = indicators[indicator.id] || []
                return (
                  <Line
                    key={indicator.id}
                    type="monotone"
                    dataKey="value"
                    data={indicatorData}
                    stroke={indicator.color}
                    strokeWidth={indicator.lineWidth}
                    dot={false}
                    connectNulls={false}
                    name={`RSI(${indicator.settings.period})`}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* MACD Indicators */}
      {macdIndicators.length > 0 && (
        <div className={rsiIndicators.length > 0 ? "h-1/2" : "h-full"}>
          <div className="p-2">
            <h4 className="text-white/60 text-sm font-medium">MACD</h4>
          </div>
          
          <ResponsiveContainer width="100%" height="calc(100% - 30px)">
            <ComposedChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              {/* Grid */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.05)"
                horizontal={true}
                vertical={false}
              />
              
              {/* Axes */}
              <XAxis 
                dataKey="time"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatXAxis}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                height={20}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                orientation="right"
                width={60}
              />

              {/* Tooltip */}
              <Tooltip content={<IndicatorTooltip />} />

              {/* Zero Line */}
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" strokeDasharray="1 1" strokeOpacity={0.4} />

              {/* MACD Lines and Histogram */}
              {macdIndicators.map(indicator => {
                const indicatorData = indicators[indicator.id] || []
                return (
                  <g key={indicator.id}>
                    {/* MACD Line */}
                    <Line
                      type="monotone"
                      dataKey="macd"
                      data={indicatorData}
                      stroke={indicator.color}
                      strokeWidth={indicator.lineWidth}
                      dot={false}
                      connectNulls={false}
                      name="MACD"
                    />
                    
                    {/* Signal Line */}
                    <Line
                      type="monotone"
                      dataKey="signal"
                      data={indicatorData}
                      stroke="#F59E0B"
                      strokeWidth={1}
                      dot={false}
                      connectNulls={false}
                      name="Signal"
                    />
                    
                    {/* Histogram */}
                    <Bar
                      dataKey="histogram"
                      fill={indicator.color}
                      fillOpacity={0.6}
                      name="Histogram"
                    />
                  </g>
                )
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default IndicatorChart
