import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Line,
  ReferenceLine,
  Tooltip,
  Brush
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { CandlestickData } from '../../services/websocketService'
import { ChartConfig, IndicatorDataMap } from '../../types/chart'
import { useChartStore } from '../../stores/useChartStore'

interface CandlestickChartProps {
  data: CandlestickData[]
  indicators: IndicatorDataMap
  config: ChartConfig
  height: number
}

interface MousePosition {
  x: number
  y: number
  price: number
  time: number
  visible: boolean
}

interface CandlestickProps {
  payload?: any
  x?: number
  y?: number
  width?: number
  height?: number
}

// Custom Candlestick component
const Candlestick: React.FC<CandlestickProps> = ({ payload, x = 0, width = 0 }) => {
  if (!payload) return null

  const { open, high, low, close } = payload
  const isGreen = close >= open
  const color = isGreen ? '#10B981' : '#EF4444'
  
  const bodyHeight = Math.abs(close - open)
  const bodyY = Math.min(open, close)
  const wickWidth = 1
  const bodyWidth = Math.max(width * 0.6, 2)
  const bodyX = x + (width - bodyWidth) / 2

  return (
    <g>
      {/* High-Low Wick */}
      <line
        x1={x + width / 2}
        y1={high}
        x2={x + width / 2}
        y2={low}
        stroke={color}
        strokeWidth={wickWidth}
      />
      
      {/* Open-Close Body */}
      <rect
        x={bodyX}
        y={bodyY}
        width={bodyWidth}
        height={Math.max(bodyHeight, 1)}
        fill={isGreen ? color : 'transparent'}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  )
}

// Custom Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload[0]) return null

  const data = payload[0].payload
  const time = new Date(data.time).toLocaleString()

  return (
    <div className="bg-black/90 border border-white/20 rounded-lg p-3 text-sm">
      <p className="text-white/60 mb-2">{time}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-white/60">Open:</span>
          <span className="text-white">${data.open?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/60">High:</span>
          <span className="text-green-400">${data.high?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/60">Low:</span>
          <span className="text-red-400">${data.low?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/60">Close:</span>
          <span className="text-white">${data.close?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/60">Volume:</span>
          <span className="text-white/60">{data.volume?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  indicators,
  config
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    price: 0,
    time: 0,
    visible: false
  })
  const [hoveredCandle, setHoveredCandle] = useState<CandlestickData | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number>(0)

  const { zoom, zoomToRange } = useChartStore()

  // Update current price when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      const lastCandle = data[data.length - 1]
      if (lastCandle) {
        setCurrentPrice(lastCandle.close)
      }
    }
  }, [data])

  // Handle mouse movement for crosshair
  const handleMouseMove = useCallback((event: any) => {
    if (!chartRef.current || !event) return

    const rect = chartRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Calculate price from Y position (approximate)
    const chartHeight = rect.height - 60
    const priceRange = Math.max(...data.map(d => d.high)) - Math.min(...data.map(d => d.low))
    const price = Math.max(...data.map(d => d.high)) - ((y - 30) / chartHeight) * priceRange

    // Calculate time from X position (approximate)
    const chartWidth = rect.width - 100
    const timeIndex = Math.floor((x - 50) / chartWidth * data.length)
    const time = data[timeIndex]?.time || 0

    setMousePosition({
      x,
      y,
      price,
      time,
      visible: true
    })

    if (data && timeIndex >= 0 && timeIndex < data.length) {
      setHoveredCandle(data[timeIndex] || null)
    }
  }, [data])

  const handleMouseLeave = useCallback(() => {
    setMousePosition(prev => ({ ...prev, visible: false }))
    setHoveredCandle(null)
  }, [])

  // Prepare chart data
  const chartData = data.map(candle => ({
    ...candle,
    time: candle.time,
    timestamp: new Date(candle.time).toLocaleTimeString()
  }))

  // Calculate price range for Y-axis
  const prices = data.flatMap(d => [d.high, d.low])
  const minPrice = Math.min(...prices) * 0.995
  const maxPrice = Math.max(...prices) * 1.005

  // Format X-axis labels
  const formatXAxis = (tickItem: any) => {
    return new Date(tickItem).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Format Y-axis labels
  const formatYAxis = (value: number) => {
    return `$${value.toLocaleString()}`
  }

  return (
    <div
      ref={chartRef}
      className="relative w-full h-full bg-gradient-to-b from-black/10 to-black/20"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Interactive Crosshair Overlay */}
      {mousePosition.visible && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Vertical crosshair line */}
          <div
            className="absolute top-0 bottom-0 w-px bg-white/50"
            style={{ left: mousePosition.x }}
          />
          {/* Horizontal crosshair line */}
          <div
            className="absolute left-0 right-0 h-px bg-white/50"
            style={{ top: mousePosition.y }}
          />

          {/* Price label on Y-axis */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
            style={{ top: mousePosition.y - 12 }}
          >
            ${mousePosition.price.toFixed(2)}
          </motion.div>

          {/* Time label on X-axis */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
            style={{ left: mousePosition.x - 30 }}
          >
            {new Date(mousePosition.time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </motion.div>
        </div>
      )}

      {/* Floating Current Price Line */}
      {currentPrice > 0 && (
        <div className="absolute right-0 z-20 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex items-center"
            style={{
              top: '50%', // This would need to be calculated based on price position
              transform: 'translateY(-50%)'
            }}
          >
            <div className="w-full h-px bg-yellow-400" />
            <div className="px-3 py-1 bg-yellow-400 text-black text-sm font-bold rounded-l">
              ${currentPrice.toLocaleString()}
            </div>
          </motion.div>
        </div>
      )}

      {/* Detailed Hover Tooltip */}
      <AnimatePresence>
        {hoveredCandle && mousePosition.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-30 pointer-events-none"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 100,
              maxWidth: '200px'
            }}
          >
            <div className="bg-black/90 border border-white/20 rounded-lg p-3 text-white text-sm">
              <div className="font-semibold mb-2">
                {new Date(hoveredCandle.time).toLocaleString()}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Open: <span className="text-blue-400">${hoveredCandle.open.toFixed(2)}</span></div>
                <div>High: <span className="text-green-400">${hoveredCandle.high.toFixed(2)}</span></div>
                <div>Low: <span className="text-red-400">${hoveredCandle.low.toFixed(2)}</span></div>
                <div>Close: <span className="text-yellow-400">${hoveredCandle.close.toFixed(2)}</span></div>
              </div>
              <div className="mt-2 text-xs text-white/70">
                Volume: {hoveredCandle.volume.toLocaleString()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          {/* Grid */}
          {config.showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.1)"
              horizontal={true}
              vertical={false}
            />
          )}
          
          {/* Axes */}
          <XAxis 
            dataKey="time"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatXAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
          />
          <YAxis 
            domain={[minPrice, maxPrice]}
            tickFormatter={formatYAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            orientation="right"
          />

          {/* Tooltip */}
          <Tooltip content={<CustomTooltip />} />

          {/* Moving Averages */}
          {config.indicators
            .filter(ind => ind.enabled && (ind.type === 'SMA' || ind.type === 'EMA'))
            .map(indicator => {
              const indicatorData = indicators[indicator.id] || []
              return (
                <Line
                  key={indicator.id}
                  type="monotone"
                  dataKey={() => null}
                  data={indicatorData.map(item => ({
                    time: item.time,
                    value: item.value
                  }))}
                  stroke={indicator.color}
                  strokeWidth={indicator.lineWidth}
                  dot={false}
                  connectNulls={false}
                />
              )
            })}

          {/* Bollinger Bands */}
          {config.indicators
            .filter(ind => ind.enabled && ind.type === 'BollingerBands')
            .map(indicator => {
              const indicatorData = indicators[indicator.id] || []
              return (
                <g key={indicator.id}>
                  <Line
                    type="monotone"
                    dataKey={() => null}
                    data={indicatorData.map(item => ({
                      time: item.time,
                      value: item.upper
                    }))}
                    stroke={indicator.color}
                    strokeWidth={1}
                    strokeOpacity={0.6}
                    dot={false}
                    strokeDasharray="2 2"
                  />
                  <Line
                    type="monotone"
                    dataKey={() => null}
                    data={indicatorData.map(item => ({
                      time: item.time,
                      value: item.lower
                    }))}
                    stroke={indicator.color}
                    strokeWidth={1}
                    strokeOpacity={0.6}
                    dot={false}
                    strokeDasharray="2 2"
                  />
                </g>
              )
            })}

          {/* Support/Resistance Lines */}
          {config.indicators
            .filter(ind => ind.enabled && ind.type === 'SupportResistance')
            .map(indicator => {
              const indicatorData = indicators[indicator.id] || { support: [], resistance: [] }
              return (
                <g key={indicator.id}>
                  {Array.isArray(indicatorData) ? null : indicatorData.support?.map((level: number, index: number) => (
                    <ReferenceLine
                      key={`support-${index}`}
                      y={level}
                      stroke="#10B981"
                      strokeWidth={1}
                      strokeOpacity={0.6}
                      strokeDasharray="5 5"
                    />
                  ))}
                  {Array.isArray(indicatorData) ? null : indicatorData.resistance?.map((level: number, index: number) => (
                    <ReferenceLine
                      key={`resistance-${index}`}
                      y={level}
                      stroke="#EF4444"
                      strokeWidth={1}
                      strokeOpacity={0.6}
                      strokeDasharray="5 5"
                    />
                  ))}
                </g>
              )
            })}

          {/* Zoom Brush */}
          <Brush
            dataKey="time"
            height={30}
            stroke="rgba(255,255,255,0.3)"
            fill="rgba(255,255,255,0.1)"
            startIndex={Math.floor(data.length * zoom.start / 100)}
            endIndex={Math.floor(data.length * zoom.end / 100)}
            onChange={(brushData: any) => {
              if (brushData) {
                const start = (brushData.startIndex / data.length) * 100
                const end = (brushData.endIndex / data.length) * 100
                zoomToRange(start, end)
              }
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Custom Candlesticks Overlay */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
      >
        {/* Render candlesticks manually for better control */}
        {chartData.map((candle, index) => {
          const x = (index / chartData.length) * 100 + '%'
          const candleWidth = Math.max(100 / chartData.length - 1, 2)
          
          return (
            <Candlestick
              key={candle.time}
              payload={candle}
              x={parseFloat(x)}
              width={candleWidth}
            />
          )
        })}
      </svg>



      {/* Drawing Tools Overlay */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
      >
        {config.drawingTools
          .filter(tool => tool.enabled)
          .map(tool => {
            switch (tool.type) {
              case 'trendline':
                if (tool.points.length >= 2 && tool.points[0] && tool.points[1]) {
                  return (
                    <line
                      key={tool.id}
                      x1={tool.points[0].x}
                      y1={tool.points[0].y}
                      x2={tool.points[1].x}
                      y2={tool.points[1].y}
                      stroke={tool.color}
                      strokeWidth={tool.lineWidth}
                      strokeDasharray={tool.style === 'dashed' ? '5 5' : undefined}
                    />
                  )
                }
                return null
              case 'horizontal':
                if (tool.points.length >= 1 && tool.points[0]) {
                  return (
                    <line
                      key={tool.id}
                      x1="0"
                      y1={tool.points[0].y}
                      x2="100%"
                      y2={tool.points[0].y}
                      stroke={tool.color}
                      strokeWidth={tool.lineWidth}
                      strokeDasharray={tool.style === 'dashed' ? '5 5' : undefined}
                    />
                  )
                }
                return null
              default:
                return null
            }
          })}
      </svg>
    </div>
  )
}

export default CandlestickChart
