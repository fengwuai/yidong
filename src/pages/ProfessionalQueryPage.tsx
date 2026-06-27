import { useState } from 'react'
import { BarChart2, Download, RefreshCw, ChevronDown, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import Header from '../components/Layout/Header'
import VariableSelector from '../components/Common/VariableSelector'
import { MultiVariableChart } from '../components/Charts/WeatherCharts'
import { useWeatherStore } from '../store/weatherStore'
import { generateMockProfessionalResult } from '../data/mockData'

const FORECAST_TIMES = [
  { value: '00z', label: '00Z (UTC 00:00)' },
  { value: '06z', label: '06Z (UTC 06:00)' },
  { value: '12z', label: '12Z (UTC 12:00)' },
  { value: '18z', label: '18Z (UTC 18:00)' },
]

export default function ProfessionalQueryPage() {
  const { professionalQueryResult, professionalQueryLoading, setProfessionalQueryResult, setProfessionalQueryLoading } = useWeatherStore()

  const [lon, setLon] = useState('118.78')
  const [lat, setLat] = useState('32.06')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [forecastTime, setForecastTime] = useState('06z')
  const [selectedVars, setSelectedVars] = useState<string[]>(['u10', 'v10'])
  const [lonError, setLonError] = useState('')
  const [latError, setLatError] = useState('')

  const validateCoords = () => {
    let valid = true
    const lonVal = parseFloat(lon)
    const latVal = parseFloat(lat)
    if (isNaN(lonVal) || lonVal < 72 || lonVal > 137) {
      setLonError('经度范围 72°-137°E')
      valid = false
    } else setLonError('')
    if (isNaN(latVal) || latVal < 17 || latVal > 55) {
      setLatError('纬度范围 17°-55°N')
      valid = false
    } else setLatError('')
    return valid
  }

  const handleQuery = async () => {
    if (!validateCoords() || selectedVars.length === 0) return
    setProfessionalQueryLoading(true)
    await new Promise(r => setTimeout(r, 1600))
    const timeMap = { '00z': '00:00:00', '06z': '06:00:00', '12z': '12:00:00', '18z': '18:00:00' }
    const dateTime = new Date(`${selectedDate}T${timeMap[forecastTime as keyof typeof timeMap]}Z`)
    const result = generateMockProfessionalResult(parseFloat(lon), parseFloat(lat), dateTime, selectedVars)
    setProfessionalQueryResult(result)
    setProfessionalQueryLoading(false)
  }

  const handleDownload = () => {
    if (!professionalQueryResult) return
    const blob = new Blob([JSON.stringify(professionalQueryResult, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `weather_pro_${selectedDate}_${forecastTime}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <Header
        title="专业气象查询"
        subtitle="单坐标多气象变量精细化查询，支持高空气压层数据"
        actions={
          professionalQueryResult ? (
            <button onClick={handleDownload} className="btn-secondary"><Download size={14} />下载数据</button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-5">
          <div className="card">
            <h3 className="font-semibold text-sm text-gray-700 mb-4">查询配置</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">经度 (°E)</label>
                  <input
                    type="number" value={lon} onChange={e => setLon(e.target.value)}
                    min={72} max={137} step={0.0001} className={`form-input ${lonError ? 'border-red-400' : ''}`}
                    placeholder="72~137"
                  />
                  {lonError && <p className="text-xs text-red-500 mt-1">{lonError}</p>}
                </div>
                <div>
                  <label className="form-label">纬度 (°N)</label>
                  <input
                    type="number" value={lat} onChange={e => setLat(e.target.value)}
                    min={17} max={55} step={0.0001} className={`form-input ${latError ? 'border-red-400' : ''}`}
                    placeholder="17~55"
                  />
                  {latError && <p className="text-xs text-red-500 mt-1">{latError}</p>}
                </div>
              </div>

              <div>
                <label className="form-label">目标日期</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="form-input" />
              </div>

              <div>
                <label className="form-label">预报时次 (UTC)</label>
                <div className="relative">
                  <select value={forecastTime} onChange={e => setForecastTime(e.target.value)} className="form-select pr-8 appearance-none">
                    {FORECAST_TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">气象模型</div>
            <div className="flex items-center gap-2 p-2.5 border border-blue-200 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-blue-800">ghr_9km</span>
              <span className="ml-auto tag-blue">9km分辨率</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-700">气象变量</h3>
              <span className="text-xs text-gray-400">最多选择4个</span>
            </div>
            <VariableSelector
              selected={selectedVars}
              maxCount={4}
              onChange={setSelectedVars}
              showPressure={true}
            />
            {selectedVars.length === 0 && (
              <div className="flex items-center gap-1.5 mt-3 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                <AlertCircle size={12} />至少选择一个气象变量
              </div>
            )}
          </div>

          <button
            onClick={handleQuery}
            disabled={professionalQueryLoading || selectedVars.length === 0}
            className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-60"
          >
            {professionalQueryLoading ? (
              <><RefreshCw size={15} className="animate-spin" />查询中...</>
            ) : (
              <><BarChart2 size={15} />执行查询</>
            )}
          </button>
          <p className="text-xs text-center text-gray-400">专业查询按点数计费</p>
        </div>

        <div className="col-span-8 space-y-5">
          {professionalQueryLoading && (
            <div className="card flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw size={28} className="animate-spin text-blue-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">正在计算气象数据...</p>
                <p className="text-xs text-gray-400 mt-1">模型推理中，请稍候</p>
              </div>
            </div>
          )}

          {professionalQueryResult && !professionalQueryLoading && (
            <>
              <div className="card py-3">
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">坐标</span>
                    <div className="font-semibold text-gray-800 mt-0.5">
                      {professionalQueryResult.location.lon.toFixed(4)}°E, {professionalQueryResult.location.lat.toFixed(4)}°N
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">起报时次</span>
                    <div className="font-semibold text-gray-800 mt-0.5">{professionalQueryResult.forecastTime}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">查询变量</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {professionalQueryResult.variables.map(v => (
                        <span key={v} className="tag-blue">{v}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <MultiVariableChart
                data={professionalQueryResult.data}
                timestamps={professionalQueryResult.timestamps}
                variables={professionalQueryResult.variables}
              />

              <div className="card overflow-hidden p-0">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-700">原始数据预览</span>
                  <span className="text-xs text-gray-400">前24小时</span>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="table-header">时间</th>
                        {professionalQueryResult.variables.map(v => (
                          <th key={v} className="table-header">{v}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {professionalQueryResult.timestamps.slice(0, 24).map((ts, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="table-cell font-mono text-gray-500">{ts}</td>
                          {professionalQueryResult.variables.map(v => (
                            <td key={v} className="table-cell font-mono">
                              {professionalQueryResult.data[v]?.[i]?.toFixed(4) ?? '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {!professionalQueryResult && !professionalQueryLoading && (
            <div className="card flex items-center justify-center h-64 border-dashed">
              <div className="text-center text-gray-400">
                <BarChart2 size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">配置查询条件并执行查询</p>
                <p className="text-xs mt-1">支持最多4个变量同时查询</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
