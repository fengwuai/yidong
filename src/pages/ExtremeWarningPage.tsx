import { useState } from 'react'
import { AlertTriangle, MapPin, Clock, Search, Download, X } from 'lucide-react'
import { MapContainer, TileLayer, Rectangle, Popup } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import Header from '../components/Layout/Header'
import { MOCK_WARNINGS } from '../data/mockData'
import { WARNING_LEVEL_CONFIG } from '../data/constants'
import type { ExtremeWeatherWarning, WarningLevel, WarningStatus } from '../types/weather'

const STATUS_LABELS: Record<WarningStatus, string> = {
  active: '生效中',
  released: '已解除',
  expired: '已过期',
}

function WarningLevelBadge({ level }: { level: WarningLevel }) {
  const cfg = WARNING_LEVEL_CONFIG[level]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }}></span>
      {cfg.label}
    </span>
  )
}

export default function ExtremeWarningPage() {
  const [selected, setSelected] = useState<ExtremeWeatherWarning | null>(null)
  const [levelFilter, setLevelFilter] = useState<WarningLevel | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<WarningStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [showPopup, setShowPopup] = useState(true)

  const filtered = MOCK_WARNINGS.filter(w => {
    const matchLevel = levelFilter === 'all' || w.level === levelFilter
    const matchStatus = statusFilter === 'all' || w.status === statusFilter
    const matchSearch = w.title.includes(search) || w.regions.some(r => r.includes(search))
    return matchLevel && matchStatus && matchSearch
  })

  const activeWarnings = MOCK_WARNINGS.filter(w => w.status === 'active')

  return (
    <div>
      <Header
        title="极端天气预警"
        subtitle="实时预警监控、影响范围可视化与预警溯源查询"
        actions={
          <button className="btn-secondary"><Download size={14} />导出预警数据</button>
        }
      />

      {showPopup && activeWarnings.some(w => w.level === 'red') && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-red-800 text-sm">紧急预警通知</div>
            <div className="text-xs text-red-700 mt-1">
              {activeWarnings.filter(w => w.level === 'red').map(w => w.title).join('；')}
            </div>
          </div>
          <button onClick={() => setShowPopup(false)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        {(['red', 'orange', 'yellow', 'blue'] as WarningLevel[]).map(level => {
          const cfg = WARNING_LEVEL_CONFIG[level]
          const count = MOCK_WARNINGS.filter(w => w.level === level && w.status === 'active').length
          return (
            <div key={level} className={`card py-3 border ${cfg.border} ${cfg.bg} cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => setLevelFilter(levelFilter === level ? 'all' : level)}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold" style={{ color: cfg.color }}>{count}</div>
                  <div className={`text-xs mt-0.5 ${cfg.text}`}>{cfg.label}</div>
                </div>
                <AlertTriangle size={18} style={{ color: cfg.color, opacity: 0.6 }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 space-y-4">
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-700">预警影响范围地图</span>
              <span className="text-xs text-gray-400">按等级颜色标注 · 点击区域查看详情</span>
            </div>
            <div className="h-80">
              <MapContainer center={[32, 118] as LatLngExpression} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OpenStreetMap" />
                {filtered.map(w => {
                  const cfg = WARNING_LEVEL_CONFIG[w.level]
                  return (
                    <Rectangle
                      key={w.id}
                      bounds={[[w.bounds.minLat, w.bounds.minLon], [w.bounds.maxLat, w.bounds.maxLon]]}
                      pathOptions={{ color: cfg.color, fillColor: cfg.color, fillOpacity: 0.25, weight: 2 }}
                      eventHandlers={{ click: () => setSelected(w) }}
                    >
                      <Popup>
                        <div className="text-xs min-w-40">
                          <div className="font-semibold mb-1">{w.title}</div>
                          <div>{w.levelLabel}</div>
                          <div className="text-gray-500 mt-1">{w.publishTime}</div>
                        </div>
                      </Popup>
                    </Rectangle>
                  )
                })}
              </MapContainer>
            </div>
          </div>

          {selected && (
            <div className="card border-2" style={{ borderColor: WARNING_LEVEL_CONFIG[selected.level].color }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <WarningLevelBadge level={selected.level} />
                    <span className="tag-gray">{selected.typeLabel}</span>
                    <span className={`text-xs font-medium ${selected.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                      {STATUS_LABELS[selected.status]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{selected.title}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div><span className="text-gray-500">发布单位：</span><span className="font-medium">{selected.publisher}</span></div>
                <div><span className="text-gray-500">数据来源：</span><span className="font-medium">{selected.source}</span></div>
                <div><span className="text-gray-500">发布时间：</span><span className="font-mono">{selected.publishTime}</span></div>
                <div><span className="text-gray-500">有效期至：</span><span className="font-mono">{selected.validUntil}</span></div>
                <div className="col-span-2"><span className="text-gray-500">影响区域：</span>{selected.regions.join('、')}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-700 mb-2">{selected.description}</div>
              <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-800 border border-amber-100">
                <strong>应对建议：</strong>{selected.suggestion}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-5">
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-700">预警列表</span>
                <span className="text-xs text-gray-400">{filtered.length} 条</span>
              </div>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-7 py-1.5 text-xs" placeholder="搜索预警..." />
              </div>
              <div className="flex gap-1 flex-wrap">
                <button onClick={() => setStatusFilter('all')} className={`px-2 py-1 rounded text-xs ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>全部</button>
                {(['active', 'released', 'expired'] as WarningStatus[]).map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`px-2 py-1 rounded text-xs ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            <div className="max-h-[520px] overflow-y-auto custom-scrollbar divide-y divide-gray-50">
              {filtered.map(w => {
                const cfg = WARNING_LEVEL_CONFIG[w.level]
                return (
                  <button key={w.id} onClick={() => setSelected(w)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selected?.id === w.id ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }}></span>
                      <span className="text-xs font-medium text-gray-800 truncate flex-1">{w.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 pl-4">
                      <MapPin size={10} />
                      <span>{w.regions[0]}{w.regions.length > 1 ? ` 等${w.regions.length}个区域` : ''}</span>
                      <Clock size={10} />
                      <span>{w.publishTime.slice(5, 16)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
