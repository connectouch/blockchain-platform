import React from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  Cell
} from 'recharts'
import { VolumeData } from '../../types/chart'

interface VolumeChartProps {
  data: VolumeData[]
  height: number
}

// Custom Tooltip for Volume
const VolumeTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload[0]) return null

  const data = payload[0].payload
  const time = new Date(data.time).toLocaleString()
  const volume = data.volume

  return (
    <div className="bg-black/90 border border-white/20 rounded-lg p-3 text-sm">
      <p className="text-white/60 mb-2">{time}</p>
      <div className="flex justify-between gap-4">
        <span className="text-white/60">Volume:</span>
        <span className="text-white">{volume.toLocaleString()}</span>
      </div>
    </div>
  )
}

const VolumeChart: React.FC<VolumeChartProps> = ({ data, height }) => {
  // Prepare chart data
  const chartData = data.map(item => ({
    ...item,
    timestamp: new Date(item.time).toLocaleTimeString()
  }))

  // Calculate volume range for Y-axis
  const volumes = data.map(d => d.volume)
  const maxVolume = Math.max(...volumes) * 1.1

  // Format Y-axis labels
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  // Format X-axis labels
  const formatXAxis = (tickItem: any) => {
    return new Date(tickItem).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-black/5 to-black/10">
      <div className="p-2">
        <h4 className="text-white/60 text-sm font-medium">Volume</h4>
      </div>
      
      <ResponsiveContainer width="100%" height={height - 30}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
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
            domain={[0, maxVolume]}
            tickFormatter={formatYAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            orientation="right"
            width={60}
          />

          {/* Tooltip */}
          <Tooltip content={<VolumeTooltip />} />

          {/* Volume Bars */}
          <Bar 
            dataKey="volume" 
            radius={[1, 1, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color === 'green' ? '#10B981' : '#EF4444'}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default VolumeChart
