import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, BarChart, Bar, ReferenceLine, ComposedChart, Area,
} from 'recharts'
import type { HourlyForecast } from '../../types/weather'
import { CHART_COLORS } from '../../data/constants'

interface WeatherChartsProps {
  data: HourlyForecast[]
}

const tickFormatter = (value: string, index: number) => {
  if (index % 6 === 0) return value.split(' ')[1] || value
  return ''
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs min-w-36">
      <div className="font-semibold text-gray-700 mb-2 border-b border-gray-100 pb-1">{label}</div>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-3 py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }}></span>
            <span className="text-gray-600">{entry.name}</span>
          </span>
          <span className="font-medium text-gray-800">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function TemperatureChart({ data }: WeatherChartsProps) {
  const sliced = data.filter((_, i) => i % 2 === 0)
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-sm">温度预报 (℃)</h3>
        <span className="tag-blue">逐小时</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={sliced} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={tickFormatter} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone" dataKey="temperature" name="温度(℃)"
            stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RadiationChart({ data }: WeatherChartsProps) {
  const sliced = data.filter((_, i) => i % 2 === 0)
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-sm">太阳辐射 (MJ/m²)</h3>
        <span className="tag-yellow">逐小时</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={sliced} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={tickFormatter} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone" dataKey="radiation" name="辐射(MJ/m²)"
            stroke="#fadb14" fill="#fef9c3" strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function WindSpeedChart({ data }: WeatherChartsProps) {
  const sliced = data.filter((_, i) => i % 2 === 0)
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-sm">风速预报 (m/s)</h3>
        <span className="tag-blue">逐小时</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={sliced} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={tickFormatter} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone" dataKey="ws10" name="10m风速"
            stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} activeDot={{ r: 4 }}
          />
          <Line
            type="monotone" dataKey="ws100" name="100m风速"
            stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PrecipitationChart({ data }: WeatherChartsProps) {
  const sliced = data.filter((_, i) => i % 2 === 0)
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-sm">降水预报 (mm)</h3>
        <span className="tag-blue">逐小时</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={sliced} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={tickFormatter} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#e5e7eb" />
          <Bar dataKey="precipitation" name="降水(mm)" fill="#13c2c2" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface MultiVarChartProps {
  data: Record<string, number[]>
  timestamps: string[]
  variables: string[]
}

export function MultiVariableChart({ data, timestamps, variables }: MultiVarChartProps) {
  const chartData = timestamps.filter((_, i) => i % 2 === 0).map((time, i) => {
    const entry: Record<string, any> = { time }
    variables.forEach(v => {
      entry[v] = data[v]?.[i * 2] ?? null
    })
    return entry
  })

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-sm">多变量预报曲线</h3>
        <span className="tag-blue">{variables.length} 个变量</span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={tickFormatter} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {variables.map((v, i) => (
            <Line
              key={v}
              type="monotone"
              dataKey={v}
              name={v}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
