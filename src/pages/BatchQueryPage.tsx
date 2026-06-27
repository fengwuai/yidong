import { useState } from 'react'
import { Search, Download, RefreshCw, MapPin, Clock, Layers, Grid3x3 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Header from '../components/Layout/Header'
import VariableSelector from '../components/Common/VariableSelector'
import { MOCK_BATCH_POINTS, MOCK_HISTORICAL_YEARS } from '../data/mockData'
import { PROVINCES } from '../data/constants'

type QueryMode = 'multi_point' | 'region' | 'historical'

export default function BatchQueryPage() {
  const [mode, setMode] = useState<QueryMode>('multi_point')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [coordinates, setCoordinates] = useState(MOCK_BATCH_POINTS)
  const [selectedProvince, setSelectedProvince] = useState('jiangsu')
  const [startYear, setStartYear] = useState(String(new Date().getFullYear() - 10))
  const [endYear, setEndYear] = useState(String(new Date().getFullYear()))
  const [selectedVars, setSelectedVars] = useState<string[]>(['t2m', 'tp6h'])
  const [exportFormat, setExportFormat] = useState<'NetCDF' | 'CSV'>('NetCDF')

  const pointCount = coordinates.split('\n').filter(l => l.trim()).length

  const handleQuery = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, mode === 'historical' ? 2500 : 1800))
    if (mode === 'multi_point') {
      const points = coordinates.split('\n').filter(l => l.trim()).map((l, i) => {
        const [lon, lat] = l.split(',').map(Number)
        return { id: i + 1, lon, lat, t2m: +(288 + Math.random() * 15).toFixed(2), ws10: +(3 + Math.random() * 8).toFixed(2), tp6h: +(Math.random() * 5).toFixed(2) }
      })
      setResult({ type: 'multi_point', points, latency: `${(420 + pointCount * 85).toFixed(0)}ms`, count: points.length })
    } else if (mode === 'region') {
      const prov = PROVINCES.find(p => p.value === selectedProvince)
      setResult({ type: 'region', province: prov?.label, dataSize: '856 MB', latency: '8.4min', gridPoints: 3840, variables: selectedVars })
    } else {
      setResult({ type: 'historical', years: MOCK_HISTORICAL_YEARS, latency: '42min', dataSize: '3.2 GB' })
    }
    setLoading(false)
  }

  return (
    <div>
      <Header
        title="批量与区域查询"
        subtitle="多点批量查询、行政区域查询、10年历史回溯查询"
        actions={result ? (
          <button className="btn-secondary"><Download size={14} />导出 {exportFormat}</button>
        ) : undefined}
      />

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 max-w-xl">
        {([
          { val: 'multi_point' as const, icon: Grid3x3, label: '多点查询', desc: '单次≤100点' },
          { val: 'region' as const, icon: Layers, label: '区域查询', desc: '行政/矩形' },
          { val: 'historical' as const, icon: Clock, label: '历史回溯', desc: '10年数据' },
        ]).map(m => (
          <button key={m.val} onClick={() => { setMode(m.val); setResult(null) }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${mode === m.val ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <m.icon size={13} />{m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-4">
          <div className="card">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">查询配置</h3>

            {mode === 'multi_point' && (
              <div className="space-y-3">
                <div>
                  <label className="form-label">经纬度坐标列表（{pointCount}/100）</label>
                  <textarea value={coordinates} onChange={e => setCoordinates(e.target.value)} className="form-input h-36 font-mono text-xs resize-none" placeholder="经度,纬度（每行一个）" />
                </div>
                <div className="p-2 bg-gray-50 rounded-lg text-xs text-gray-500">响应时间目标：≤10s（100点以内），性能随点数线性增长</div>
              </div>
            )}

            {mode === 'region' && (
              <div className="space-y-3">
                <div>
                  <label className="form-label">选择行政区域</label>
                  <select value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)} className="form-select">
                    {PROVINCES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg text-xs text-gray-500">支持矩形框选、行政区域、自定义运输路径查询 · 响应 ≤10min（≤1GB）</div>
              </div>
            )}

            {mode === 'historical' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="form-label">起始年份</label>
                    <select value={startYear} onChange={e => setStartYear(e.target.value)} className="form-select">
                      {Array.from({ length: 15 }, (_, i) => 2010 + i).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">结束年份</label>
                    <select value={endYear} onChange={e => setEndYear(e.target.value)} className="form-select">
                      {Array.from({ length: 15 }, (_, i) => 2010 + i).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg text-xs text-gray-500">10年历史数据组合查询 · 响应 ≤60min（≤5GB）</div>
              </div>
            )}

            <div className="mt-3">
              <label className="form-label">气象变量</label>
              <VariableSelector selected={selectedVars} maxCount={6} onChange={setSelectedVars} showPressure={false} />
            </div>

            <div className="mt-3">
              <label className="form-label">导出格式</label>
              <div className="flex gap-2">
                {(['NetCDF', 'CSV'] as const).map(f => (
                  <button key={f} onClick={() => setExportFormat(f)} className={`flex-1 py-2 text-xs font-medium rounded-lg border ${exportFormat === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>{f}</button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleQuery} disabled={loading || selectedVars.length === 0} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
            {loading ? <><RefreshCw size={15} className="animate-spin" />查询中...</> : <><Search size={15} />执行查询</>}
          </button>
        </div>

        <div className="col-span-8">
          {loading && (
            <div className="card flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw size={28} className="animate-spin text-blue-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">{mode === 'historical' ? '历史数据回溯中，预计耗时较长...' : '批量查询执行中...'}</p>
              </div>
            </div>
          )}

          {result && !loading && result.type === 'multi_point' && (
            <div className="space-y-4">
              <div className="card py-3 flex gap-6 text-sm">
                <div><span className="text-gray-500 text-xs">查询点数</span><div className="font-bold">{result.count}</div></div>
                <div><span className="text-gray-500 text-xs">响应时间</span><div className="font-bold text-green-600">{result.latency}</div></div>
                <div><span className="text-gray-500 text-xs">变量</span><div className="font-bold">{selectedVars.join(', ')}</div></div>
              </div>
              <div className="card p-0 overflow-hidden">
                <table className="w-full text-xs">
                  <thead><tr>{['#', '经度', '纬度', 't2m(K)', 'ws10(m/s)', 'tp6h(mm)'].map(h => <th key={h} className="table-header">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {result.points.map((p: any) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="table-cell">{p.id}</td>
                        <td className="table-cell font-mono">{p.lon.toFixed(4)}</td>
                        <td className="table-cell font-mono">{p.lat.toFixed(4)}</td>
                        <td className="table-cell font-mono">{p.t2m}</td>
                        <td className="table-cell font-mono">{p.ws10}</td>
                        <td className="table-cell font-mono">{p.tp6h}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result && !loading && result.type === 'region' && (
            <div className="card">
              <div className="flex gap-6 text-sm mb-4">
                <div><span className="text-gray-500 text-xs">查询区域</span><div className="font-bold">{result.province}</div></div>
                <div><span className="text-gray-500 text-xs">格点数</span><div className="font-bold">{result.gridPoints.toLocaleString()}</div></div>
                <div><span className="text-gray-500 text-xs">数据量</span><div className="font-bold">{result.dataSize}</div></div>
                <div><span className="text-gray-500 text-xs">响应时间</span><div className="font-bold text-green-600">{result.latency}</div></div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-sm text-green-700">
                <MapPin size={14} className="inline mr-1" />
                区域查询完成，{result.province}范围内共 {result.gridPoints} 个格点数据已就绪，可通过 {exportFormat} 格式导出。
              </div>
            </div>
          )}

          {result && !loading && result.type === 'historical' && (
            <div className="space-y-4">
              <div className="card py-3 flex gap-6 text-sm">
                <div><span className="text-gray-500 text-xs">时间跨度</span><div className="font-bold">{startYear} - {endYear}</div></div>
                <div><span className="text-gray-500 text-xs">数据量</span><div className="font-bold">{result.dataSize}</div></div>
                <div><span className="text-gray-500 text-xs">查询耗时</span><div className="font-bold text-green-600">{result.latency}</div></div>
              </div>
              <div className="card">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">历史趋势分析（{selectedVars[0]}）</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={result.years}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgTemp" name="年均温(℃)" stroke="#fa8c16" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="warningCount" name="预警次数" stroke="#ff4d4f" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="card p-0 overflow-hidden">
                <table className="w-full text-xs">
                  <thead><tr>{['年份', '年均温(℃)', '年降水(mm)', '最大风速(m/s)', '预警次数'].map(h => <th key={h} className="table-header">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {result.years.map((y: any) => (
                      <tr key={y.year} className="hover:bg-gray-50">
                        <td className="table-cell font-medium">{y.year}</td>
                        <td className="table-cell font-mono">{y.avgTemp}</td>
                        <td className="table-cell font-mono">{y.totalPrecip}</td>
                        <td className="table-cell font-mono">{y.maxWind}</td>
                        <td className="table-cell font-mono">{y.warningCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="card flex items-center justify-center h-64 border-dashed">
              <div className="text-center text-gray-400">
                <Search size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">配置查询条件后执行查询</p>
                <p className="text-xs mt-1">支持多点（≤100）、区域、10年历史回溯</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
