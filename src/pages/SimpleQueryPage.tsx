import { useState } from 'react'
import { Search, Download, MapPin, Calendar, RefreshCw, Info } from 'lucide-react'
import { format } from 'date-fns'
import Header from '../components/Layout/Header'
import { SimpleWeatherMap } from '../components/Map/WeatherMap'
import { TemperatureChart, RadiationChart, WindSpeedChart, PrecipitationChart } from '../components/Charts/WeatherCharts'
import { useWeatherStore } from '../store/weatherStore'
import { generateMockWeatherResult } from '../data/mockData'
import { PRESET_CITIES } from '../data/constants'

export default function SimpleQueryPage() {
  const { simpleQueryResult, simpleQueryLoading, setSimpleQueryResult, setSimpleQueryLoading } = useWeatherStore()

  const [locationMode, setLocationMode] = useState<'city' | 'custom'>('city')
  const [selectedCity, setSelectedCity] = useState('shanghai')
  const [customLon, setCustomLon] = useState('121.47')
  const [customLat, setCustomLat] = useState('31.23')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [mapCenter, setMapCenter] = useState<[number, number]>([31.23, 121.47])
  const [markerPos, setMarkerPos] = useState<[number, number] | null>([31.23, 121.47])

  const today = format(new Date(), 'yyyy-MM-dd')
  const minDate = format(new Date(Date.now() - 30 * 86400000), 'yyyy-MM-dd')
  const maxDate = format(new Date(Date.now() + 10 * 86400000), 'yyyy-MM-dd')

  const resolvedLon = () => {
    if (locationMode === 'city') {
      const c = PRESET_CITIES.find(c => c.value === selectedCity)
      return c?.lon ?? 121.47
    }
    return parseFloat(customLon) || 121.47
  }

  const resolvedLat = () => {
    if (locationMode === 'city') {
      const c = PRESET_CITIES.find(c => c.value === selectedCity)
      return c?.lat ?? 31.23
    }
    return parseFloat(customLat) || 31.23
  }

  const handleCityChange = (val: string) => {
    setSelectedCity(val)
    const c = PRESET_CITIES.find(c => c.value === val)
    if (c) {
      setMapCenter([c.lat, c.lon])
      setMarkerPos([c.lat, c.lon])
    }
  }

  const handleMapClick = (lat: number, lon: number) => {
    setLocationMode('custom')
    setCustomLat(lat.toFixed(4))
    setCustomLon(lon.toFixed(4))
    setMarkerPos([lat, lon])
    setMapCenter([lat, lon])
  }

  const handleQuery = async () => {
    setSimpleQueryLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    const result = generateMockWeatherResult(resolvedLon(), resolvedLat(), new Date(selectedDate))
    setSimpleQueryResult(result)
    setSimpleQueryLoading(false)
  }

  const handleDownload = () => {
    const blob = new Blob(
      [JSON.stringify(simpleQueryResult, null, 2)],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `weather_${selectedDate}_${resolvedLon()}_${resolvedLat()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <Header
        title="简易气象查询"
        subtitle="单坐标、单时刻快速查询，生成逐小时11天预报曲线"
        actions={
          simpleQueryResult ? (
            <button onClick={handleDownload} className="btn-secondary">
              <Download size={14} />下载数据
            </button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-5">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={15} className="text-blue-500" />
              <span className="font-semibold text-sm text-gray-700">选择日期</span>
            </div>
            <input
              type="date"
              value={selectedDate}
              min={minDate}
              max={maxDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="form-input"
            />
            <p className="text-xs text-gray-400 mt-2">支持历史及未来10天预报日期</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={15} className="text-blue-500" />
              <span className="font-semibold text-sm text-gray-700">选择位置</span>
            </div>
            <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setLocationMode('city')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${locationMode === 'city' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
              >
                预设城市
              </button>
              <button
                onClick={() => setLocationMode('custom')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${locationMode === 'custom' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
              >
                自定义坐标
              </button>
            </div>

            {locationMode === 'city' ? (
              <select value={selectedCity} onChange={e => handleCityChange(e.target.value)} className="form-select">
                {PRESET_CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="form-label">经度 (°E)</label>
                  <input
                    type="number" value={customLon} onChange={e => setCustomLon(e.target.value)}
                    min={72} max={137} step={0.0001} className="form-input" placeholder="72~137"
                  />
                </div>
                <div>
                  <label className="form-label">纬度 (°N)</label>
                  <input
                    type="number" value={customLat} onChange={e => setCustomLat(e.target.value)}
                    min={17} max={55} step={0.0001} className="form-input" placeholder="17~55"
                  />
                </div>
              </div>
            )}

            <div className="mt-3 p-2 bg-gray-50 rounded-lg flex items-center gap-2 text-xs text-gray-500">
              <Info size={11} />
              覆盖范围：经度 72°-137°E，纬度 17°-55°N
            </div>
          </div>

          <div className="card">
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">气象模型</div>
            <div className="flex items-center gap-2 p-2.5 border border-blue-200 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-blue-800">ghr_9km</span>
              <span className="ml-auto tag-blue">默认</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">全球 9km 分辨率，AI 驱动高精度预报</p>
          </div>

          <button
            onClick={handleQuery}
            disabled={simpleQueryLoading}
            className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-60"
          >
            {simpleQueryLoading ? (
              <><RefreshCw size={15} className="animate-spin" />查询中...</>
            ) : (
              <><Search size={15} />查询（免费）</>
            )}
          </button>
        </div>

        <div className="col-span-8 space-y-5">
          <div className="card p-0 overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-700">位置预览</span>
              <span className="text-xs text-gray-400">可点击地图选择坐标</span>
            </div>
            <div className="p-4">
              <SimpleWeatherMap
                center={mapCenter}
                zoom={6}
                onLocationSelect={handleMapClick}
                markerPosition={markerPos}
              />
            </div>
          </div>

          {simpleQueryLoading && (
            <div className="card flex items-center justify-center h-48">
              <div className="text-center">
                <RefreshCw size={28} className="animate-spin text-blue-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">正在获取气象数据...</p>
                <p className="text-xs text-gray-400 mt-1">ghr_9km 模型计算中</p>
              </div>
            </div>
          )}

          {simpleQueryResult && !simpleQueryLoading && (
            <>
              <div className="card py-3">
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">坐标</span>
                    <div className="font-semibold text-gray-800 mt-0.5">
                      {simpleQueryResult.location.lon.toFixed(4)}°E, {simpleQueryResult.location.lat.toFixed(4)}°N
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">起报时间</span>
                    <div className="font-semibold text-gray-800 mt-0.5">{simpleQueryResult.forecastTime}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">预报时长</span>
                    <div className="font-semibold text-gray-800 mt-0.5">11天（264小时）</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">时间分辨率</span>
                    <div className="font-semibold text-gray-800 mt-0.5">逐小时</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">气象模型</span>
                    <div className="font-semibold text-gray-800 mt-0.5">{simpleQueryResult.model}</div>
                  </div>
                </div>
              </div>
              <TemperatureChart data={simpleQueryResult.data} />
              <RadiationChart data={simpleQueryResult.data} />
              <WindSpeedChart data={simpleQueryResult.data} />
              <PrecipitationChart data={simpleQueryResult.data} />
            </>
          )}

          {!simpleQueryResult && !simpleQueryLoading && (
            <div className="card flex items-center justify-center h-64 border-dashed">
              <div className="text-center text-gray-400">
                <Search size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">配置查询条件后点击查询</p>
                <p className="text-xs mt-1">系统将自动生成11天逐小时预报曲线</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
