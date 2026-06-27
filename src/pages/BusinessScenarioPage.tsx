import { useState } from 'react'
import { Truck, Wheat, AlertTriangle, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { MapContainer, TileLayer, Polyline, Rectangle, Popup } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import Header from '../components/Layout/Header'
import { MOCK_TRANSPORT_ROUTES, MOCK_GRAIN_AREAS, MOCK_WARNINGS } from '../data/mockData'
import { WARNING_LEVEL_CONFIG } from '../data/constants'

const RISK_STYLE = {
  high: { label: '高风险', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', line: '#ff4d4f' },
  medium: { label: '中风险', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', line: '#fa8c16' },
  low: { label: '低风险', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', line: '#52c41a' },
}

export default function BusinessScenarioPage() {
  const [activeTab, setActiveTab] = useState<'logistics' | 'grain'>('logistics')
  const [selectedRoute, setSelectedRoute] = useState<string | null>('route_001')
  const [selectedGrain, setSelectedGrain] = useState<string | null>('grain_001')
  const [showWarnings, setShowWarnings] = useState(true)

  const activeWarnings = MOCK_WARNINGS.filter(w => w.status === 'active')

  return (
    <div>
      <Header title="业务场景可视化" subtitle="运输线路气象风险、粮食产区气候监测与预警影响评估" />

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 max-w-md">
        <button onClick={() => setActiveTab('logistics')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'logistics' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
          <Truck size={13} />物流运输线路
        </button>
        <button onClick={() => setActiveTab('grain')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'grain' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
          <Wheat size={13} />粮食产区监测
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-4">
          {activeTab === 'logistics' && MOCK_TRANSPORT_ROUTES.map(route => {
            const style = RISK_STYLE[route.risk as keyof typeof RISK_STYLE]
            return (
              <button key={route.id} onClick={() => setSelectedRoute(route.id)}
                className={`w-full text-left card py-3 border-2 transition-all ${selectedRoute === route.id ? style.border : 'border-transparent hover:border-gray-200'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-gray-800">{route.name}</span>
                  <span className={`tag ${style.bg} ${style.color}`}>{style.label}</span>
                </div>
                <div className="text-xs text-gray-500 space-y-0.5">
                  <div>里程：{route.length} · 货物：{route.cargo}</div>
                  <div className="flex items-start gap-1 mt-1 text-orange-600">
                    <AlertTriangle size={10} className="flex-shrink-0 mt-0.5" />
                    {route.weatherRisk}
                  </div>
                </div>
              </button>
            )
          })}

          {activeTab === 'grain' && MOCK_GRAIN_AREAS.map(area => {
            const style = RISK_STYLE[area.risk as keyof typeof RISK_STYLE]
            return (
              <button key={area.id} onClick={() => setSelectedGrain(area.id)}
                className={`w-full text-left card py-3 border-2 transition-all ${selectedGrain === area.id ? style.border : 'border-transparent hover:border-gray-200'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-gray-800">{area.name}</span>
                  <span className={`tag ${style.bg} ${style.color}`}>{style.label}</span>
                </div>
                <div className="text-xs text-gray-500 space-y-0.5">
                  <div>{area.province} · {area.area}</div>
                  <div>年产量：{area.yield}</div>
                  <div className="mt-1 text-gray-600">{area.impact}</div>
                </div>
              </button>
            )
          })}

          <div className="card">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showWarnings} onChange={e => setShowWarnings(e.target.checked)} className="rounded" />
              <span className="text-sm text-gray-700">叠加极端天气预警图层</span>
            </label>
          </div>
        </div>

        <div className="col-span-8 space-y-4">
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-700">
                {activeTab === 'logistics' ? '运输线路气象风险分布' : '粮食产区气候监测'}
              </span>
              <div className="flex gap-2 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500"></span>低风险</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-500"></span>中风险</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500"></span>高风险</span>
              </div>
            </div>
            <div className="h-96">
              <MapContainer center={[35, 115] as LatLngExpression} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OpenStreetMap" />
                {activeTab === 'logistics' && MOCK_TRANSPORT_ROUTES.map(route => {
                  const style = RISK_STYLE[route.risk as keyof typeof RISK_STYLE]
                  const isSelected = selectedRoute === route.id
                  return (
                    <Polyline key={route.id} positions={route.points as LatLngExpression[]} pathOptions={{ color: style.line, weight: isSelected ? 5 : 3, opacity: isSelected ? 1 : 0.6 }}>
                      <Popup>
                        <div className="text-xs">
                          <div className="font-semibold">{route.name}</div>
                          <div>{route.length} · {route.cargo}</div>
                          <div className="text-orange-600 mt-1">{route.weatherRisk}</div>
                        </div>
                      </Popup>
                    </Polyline>
                  )
                })}
                {activeTab === 'grain' && MOCK_GRAIN_AREAS.map(area => {
                  const style = RISK_STYLE[area.risk as keyof typeof RISK_STYLE]
                  const isSelected = selectedGrain === area.id
                  return (
                    <Rectangle key={area.id}
                      bounds={[[area.bounds.minLat, area.bounds.minLon], [area.bounds.maxLat, area.bounds.maxLon]]}
                      pathOptions={{ color: style.line, fillColor: style.line, fillOpacity: isSelected ? 0.3 : 0.15, weight: isSelected ? 3 : 2 }}>
                      <Popup>
                        <div className="text-xs">
                          <div className="font-semibold">{area.name}</div>
                          <div>{area.yield}</div>
                          <div className="mt-1">{area.impact}</div>
                        </div>
                      </Popup>
                    </Rectangle>
                  )
                })}
                {showWarnings && activeWarnings.map(w => {
                  const cfg = WARNING_LEVEL_CONFIG[w.level]
                  return (
                    <Rectangle key={w.id}
                      bounds={[[w.bounds.minLat, w.bounds.minLon], [w.bounds.maxLat, w.bounds.maxLon]]}
                      pathOptions={{ color: cfg.color, fillColor: cfg.color, fillOpacity: 0.1, weight: 1, dashArray: '6 4' }} />
                  )
                })}
              </MapContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">预警影响评估</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '受影响运输线路', value: '2条', trend: 'up', desc: '广深沿海线、京沪干线' },
                { label: '受影响粮食产区', value: '2个', trend: 'up', desc: '黄淮海平原、长江中下游' },
                { label: '产能预测偏差', value: '+5.2%', trend: 'down', desc: '高温+暴雨综合影响' },
              ].map(({ label, value, trend, desc }) => (
                <div key={label} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{label}</span>
                    {trend === 'up' ? <TrendingUp size={12} className="text-red-500" /> : trend === 'down' ? <TrendingDown size={12} className="text-orange-500" /> : <Minus size={12} className="text-gray-400" />}
                  </div>
                  <div className="text-xl font-bold text-gray-800 mt-1">{value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800">
              <AlertTriangle size={12} className="inline mr-1" />
              当前 {activeWarnings.length} 条生效预警与业务区域叠加，建议物流调度绕行低洼路段，粮食仓储加强温控管理，电力交易关注负荷高峰。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
