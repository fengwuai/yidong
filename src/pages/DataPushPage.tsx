import { useState } from 'react'
import { Plus, Edit2, Download, Trash2, ToggleLeft, ToggleRight, Clock, ChevronRight, X, Check, MapPin, Layers, AlertCircle } from 'lucide-react'
import Header from '../components/Layout/Header'
import { PushStatusBadge } from '../components/Common/StatusBadge'
import { TemplateMap } from '../components/Map/WeatherMap'
import VariableSelector from '../components/Common/VariableSelector'
import { useWeatherStore } from '../store/weatherStore'
import { PROVINCES } from '../data/constants'
import type { DataTemplate, RegionMode, PushSchedule, ForecastTime, TimeInterval, DataFormat, SpatialProcessing } from '../types/weather'
import { format } from 'date-fns'

type DrawerMode = 'create' | 'edit' | 'schedule' | null

interface FormState {
  name: string
  regionMode: RegionMode
  rectangle: { minLon: string; maxLon: string; minLat: string; maxLat: string }
  coordinates: string
  selectedRegions: string[]
  boundaryExpand: string
  coastlineExpand: string
  variables: string[]
  forecastTimes: ForecastTime[]
  interval: TimeInterval
  dataFormat: DataFormat
  spatialProcessing: SpatialProcessing
}

const defaultForm: FormState = {
  name: '',
  regionMode: 'rectangle',
  rectangle: { minLon: '115', maxLon: '122', minLat: '28', maxLat: '35' },
  coordinates: '',
  selectedRegions: [],
  boundaryExpand: '0',
  coastlineExpand: '0',
  variables: [],
  forecastTimes: ['00z', '06z', '12z', '18z'],
  interval: '1h',
  dataFormat: 'NetCDF',
  spatialProcessing: 'none',
}

function estimatePoints(form: FormState): number {
  if (form.regionMode === 'rectangle') {
    const lonSpan = parseFloat(form.rectangle.maxLon) - parseFloat(form.rectangle.minLon)
    const latSpan = parseFloat(form.rectangle.maxLat) - parseFloat(form.rectangle.minLat)
    return Math.max(1, Math.round((lonSpan / 0.09) * (latSpan / 0.09)))
  }
  if (form.regionMode === 'coordinates') {
    return form.coordinates.split('\n').filter(l => l.trim()).length
  }
  return form.selectedRegions.length * 350
}

function estimateSize(points: number, varsCount: number): string {
  const mb = (points * varsCount * 264 * 4) / (1024 * 1024)
  if (mb > 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb.toFixed(1)} MB`
}

function TemplateRow({ template, onEdit, onDelete, onToggle, onSchedule, onDownload }: {
  template: DataTemplate
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  onSchedule: () => void
  onDownload: () => void
}) {
  const canEdit = !template.hasBeenPushed

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="table-cell">
        <div className="font-medium text-gray-900">{template.name}</div>
        <div className="text-xs text-gray-400 mt-0.5">{template.createdAt.slice(0, 10)}</div>
      </td>
      <td className="table-cell">
        <span className="tag-blue">{template.model}</span>
      </td>
      <td className="table-cell">
        <div className="flex flex-wrap gap-1 max-w-48">
          {template.variables.slice(0, 4).map(v => (
            <span key={v} className="tag tag-gray">{v}</span>
          ))}
          {template.variables.length > 4 && (
            <span className="tag tag-gray">+{template.variables.length - 4}</span>
          )}
        </div>
      </td>
      <td className="table-cell text-xs text-gray-600">
        {template.region.mode === 'rectangle' && template.region.rectangle
          ? `${template.region.rectangle.minLon}°-${template.region.rectangle.maxLon}°E`
          : template.region.mode === 'coordinates'
          ? `${template.region.coordinates?.length ?? 0} 个坐标点`
          : template.region.regions?.join(', ')}
      </td>
      <td className="table-cell">
        <div className="text-sm font-medium text-gray-700">{template.estimatedPoints.toLocaleString()}</div>
        <div className="text-xs text-gray-400">{template.estimatedFileSize}</div>
      </td>
      <td className="table-cell">
        <PushStatusBadge status={template.pushStatus} />
      </td>
      <td className="table-cell">
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            disabled={!canEdit}
            className={`p-1.5 rounded-lg transition-colors ${canEdit ? 'text-gray-500 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'}`}
            title={canEdit ? '编辑模板' : '已推送过的模板不可编辑'}
          >
            <Edit2 size={13} />
          </button>
          <button onClick={onSchedule} className="p-1.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors" title="推送配置">
            <Clock size={13} />
          </button>
          <button onClick={onDownload} className="p-1.5 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors" title="立即下载">
            <Download size={13} />
          </button>
          <button onClick={onToggle} className="p-1.5 rounded-lg transition-colors text-gray-500 hover:text-blue-600 hover:bg-blue-50" title="开关推送">
            {template.pushStatus === 'enabled' ? <ToggleRight size={16} className="text-blue-500" /> : <ToggleLeft size={16} />}
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors" title="删除模板">
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function DataPushPage() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useWeatherStore()
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [step, setStep] = useState(1)

  const openCreate = () => {
    setForm(defaultForm)
    setEditingId(null)
    setStep(1)
    setDrawerMode('create')
  }

  const openEdit = (id: string) => {
    const tpl = templates.find(t => t.id === id)
    if (!tpl || tpl.hasBeenPushed) return
    setEditingId(id)
    setForm({
      name: tpl.name,
      regionMode: tpl.region.mode,
      rectangle: tpl.region.rectangle
        ? { minLon: String(tpl.region.rectangle.minLon), maxLon: String(tpl.region.rectangle.maxLon), minLat: String(tpl.region.rectangle.minLat), maxLat: String(tpl.region.rectangle.maxLat) }
        : defaultForm.rectangle,
      coordinates: tpl.region.coordinates?.map(c => `${c.lon},${c.lat}`).join('\n') ?? '',
      selectedRegions: tpl.region.regions ?? [],
      boundaryExpand: String(tpl.region.boundaryExpand ?? 0),
      coastlineExpand: String(tpl.region.coastlineExpand ?? 0),
      variables: tpl.variables,
      forecastTimes: tpl.pushSchedule?.forecastTimes ?? ['00z', '06z', '12z', '18z'],
      interval: tpl.pushSchedule?.interval ?? '1h',
      dataFormat: tpl.pushSchedule?.dataFormat ?? 'NetCDF',
      spatialProcessing: tpl.pushSchedule?.spatialProcessing ?? 'none',
    })
    setStep(1)
    setDrawerMode('edit')
  }

  const openSchedule = (id: string) => {
    const tpl = templates.find(t => t.id === id)
    if (!tpl) return
    setEditingId(id)
    setForm(prev => ({
      ...prev,
      forecastTimes: tpl.pushSchedule?.forecastTimes ?? ['00z', '06z', '12z', '18z'],
      interval: tpl.pushSchedule?.interval ?? '1h',
      dataFormat: tpl.pushSchedule?.dataFormat ?? 'NetCDF',
      spatialProcessing: tpl.pushSchedule?.spatialProcessing ?? 'none',
    }))
    setDrawerMode('schedule')
  }

  const handleSubmit = () => {
    if (!form.name.trim() || form.variables.length === 0) return
    const pts = estimatePoints(form)
    const parsedCoords = form.coordinates.split('\n').filter(l => l.trim()).map(l => {
      const [lon, lat] = l.split(',').map(Number)
      return { lon, lat }
    })

    const region = {
      mode: form.regionMode,
      rectangle: form.regionMode === 'rectangle' ? {
        minLon: parseFloat(form.rectangle.minLon),
        maxLon: parseFloat(form.rectangle.maxLon),
        minLat: parseFloat(form.rectangle.minLat),
        maxLat: parseFloat(form.rectangle.maxLat),
      } : undefined,
      coordinates: form.regionMode === 'coordinates' ? parsedCoords : undefined,
      regions: form.regionMode === 'region' ? form.selectedRegions : undefined,
      boundaryExpand: parseFloat(form.boundaryExpand),
      coastlineExpand: parseFloat(form.coastlineExpand),
    }

    const pushSchedule: PushSchedule = {
      forecastTimes: form.forecastTimes,
      interval: form.interval,
      dataFormat: form.dataFormat,
      spatialProcessing: form.spatialProcessing,
    }

    if (drawerMode === 'edit' && editingId) {
      updateTemplate(editingId, {
        name: form.name,
        variables: form.variables,
        region,
        estimatedPoints: pts,
        estimatedFileSize: estimateSize(pts, form.variables.length),
        pushSchedule,
        updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      })
    } else {
      const newTpl: DataTemplate = {
        id: `tpl_${Date.now()}`,
        name: form.name,
        model: 'ghr_9km',
        variables: form.variables,
        region,
        estimatedPoints: pts,
        estimatedFileSize: estimateSize(pts, form.variables.length),
        pushStatus: 'disabled',
        hasBeenPushed: false,
        createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        pushSchedule,
      }
      addTemplate(newTpl)
    }
    setDrawerMode(null)
  }

  const handleScheduleSave = () => {
    if (!editingId) return
    updateTemplate(editingId, {
      pushSchedule: {
        forecastTimes: form.forecastTimes,
        interval: form.interval,
        dataFormat: form.dataFormat,
        spatialProcessing: form.spatialProcessing,
      },
    })
    setDrawerMode(null)
  }

  const toggleForecastTime = (t: ForecastTime) => {
    setForm(prev => ({
      ...prev,
      forecastTimes: prev.forecastTimes.includes(t)
        ? prev.forecastTimes.filter(x => x !== t)
        : [...prev.forecastTimes, t],
    }))
  }

  const toggleRegion = (val: string) => {
    setForm(prev => {
      if (prev.selectedRegions.includes(val)) {
        return { ...prev, selectedRegions: prev.selectedRegions.filter(r => r !== val) }
      }
      const province = PROVINCES.find(p => p.value === val)
      const city = PROVINCES.flatMap(p => p.cities).find(c => c.value === val)
      if (province) {
        const childVals = province.cities.map(c => c.value)
        const filtered = prev.selectedRegions.filter(r => !childVals.includes(r))
        return { ...prev, selectedRegions: [...filtered, val] }
      }
      if (city) {
        const parentProvince = PROVINCES.find(p => p.cities.some(c => c.value === val))
        if (parentProvince && prev.selectedRegions.includes(parentProvince.value)) return prev
      }
      return { ...prev, selectedRegions: [...prev.selectedRegions, val] }
    })
  }

  const pts = estimatePoints(form)
  const isCoastal = form.selectedRegions.some(r => {
    const prov = PROVINCES.find(p => p.value === r)
    const city = PROVINCES.flatMap(p => p.cities).find(c => c.value === r)
    return prov?.hasCoastline || city?.hasCoastline
  })

  const rectangleForMap = form.regionMode === 'rectangle' ? {
    minLon: parseFloat(form.rectangle.minLon) || 72,
    maxLon: parseFloat(form.rectangle.maxLon) || 137,
    minLat: parseFloat(form.rectangle.minLat) || 17,
    maxLat: parseFloat(form.rectangle.maxLat) || 55,
  } : undefined

  const coordsForMap = form.regionMode === 'coordinates'
    ? form.coordinates.split('\n').filter(l => l.trim()).map(l => {
        const [lon, lat] = l.split(',').map(Number)
        return { lon: lon || 0, lat: lat || 0 }
      }).filter(c => c.lon && c.lat)
    : undefined

  return (
    <div>
      <Header
        title="数据推送与导出"
        subtitle="模板化任务管理，支持批量坐标、区域及定时自动推送"
        actions={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={14} />新建模板
          </button>
        }
      />

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-sm text-gray-700">数据模板列表</span>
          <span className="text-xs text-gray-400">{templates.length} 个模板</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">模板名称</th>
                <th className="table-header">气象模型</th>
                <th className="table-header">气象要素</th>
                <th className="table-header">地理位置</th>
                <th className="table-header">预估消耗</th>
                <th className="table-header">推送状态</th>
                <th className="table-header">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {templates.map(tpl => (
                <TemplateRow
                  key={tpl.id}
                  template={tpl}
                  onEdit={() => openEdit(tpl.id)}
                  onDelete={() => deleteTemplate(tpl.id)}
                  onToggle={() => updateTemplate(tpl.id, { pushStatus: tpl.pushStatus === 'enabled' ? 'disabled' : 'enabled', hasBeenPushed: true })}
                  onSchedule={() => openSchedule(tpl.id)}
                  onDownload={() => {}}
                />
              ))}
            </tbody>
          </table>
          {templates.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <Layers size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">暂无数据模板，点击「新建模板」开始创建</p>
            </div>
          )}
        </div>
      </div>

      {drawerMode === 'schedule' && editingId && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="w-[480px] h-full bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">定时推送配置</h2>
              <button onClick={() => setDrawerMode(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
              <div>
                <label className="form-label">执行时次（可多选）</label>
                <div className="flex gap-2 mt-1">
                  {(['00z', '06z', '12z', '18z'] as ForecastTime[]).map(t => (
                    <button key={t} onClick={() => toggleForecastTime(t)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${form.forecastTimes.includes(t) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'}`}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">时间间隔</label>
                <div className="flex gap-2">
                  {(['1h', '15min'] as TimeInterval[]).map(v => (
                    <button key={v} onClick={() => setForm(prev => ({ ...prev, interval: v }))}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${form.interval === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">数据格式</label>
                <div className="flex gap-2">
                  {(['NetCDF', 'CSV'] as DataFormat[]).map(v => (
                    <button key={v} onClick={() => setForm(prev => ({ ...prev, dataFormat: v }))}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${form.dataFormat === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">数据处理</label>
                <div className="flex gap-2">
                  <button onClick={() => setForm(prev => ({ ...prev, spatialProcessing: 'none' }))}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${form.spatialProcessing === 'none' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'}`}>
                    原始数据
                  </button>
                  <button onClick={() => setForm(prev => ({ ...prev, spatialProcessing: 'spatial_mean' }))}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${form.spatialProcessing === 'spatial_mean' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'}`}>
                    空间均值
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-3">
              <button onClick={() => setDrawerMode(null)} className="btn-secondary flex-1 justify-center">取消</button>
              <button onClick={handleScheduleSave} className="btn-primary flex-1 justify-center"><Check size={14} />保存配置</button>
            </div>
          </div>
        </div>
      )}

      {(drawerMode === 'create' || drawerMode === 'edit') && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="w-[640px] h-full bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="font-semibold text-gray-800">{drawerMode === 'create' ? '新建数据模板' : '编辑数据模板'}</h2>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3].map(s => (
                    <div key={s} className="flex items-center gap-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{s}</div>
                      {s < 3 && <ChevronRight size={10} className="text-gray-300" />}
                    </div>
                  ))}
                  <span className="text-xs text-gray-400 ml-2">
                    {step === 1 ? '基础信息与地理范围' : step === 2 ? '气象要素选择' : '推送配置'}
                  </span>
                </div>
              </div>
              <button onClick={() => setDrawerMode(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="form-label">模板名称 <span className="text-red-500">*</span></label>
                    <input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="form-input" placeholder="请输入模板名称，如：江苏区域风速监测" />
                  </div>

                  <div>
                    <label className="form-label">地理范围配置</label>
                    <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1">
                      {([
                        { val: 'rectangle', icon: <MapPin size={11} />, label: '矩形框选' },
                        { val: 'coordinates', icon: <MapPin size={11} />, label: '坐标列表' },
                        { val: 'region', icon: <Layers size={11} />, label: '区域选择' },
                      ] as const).map(m => (
                        <button key={m.val} onClick={() => setForm(prev => ({ ...prev, regionMode: m.val }))}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-md transition-colors ${form.regionMode === m.val ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
                          {m.icon}{m.label}
                        </button>
                      ))}
                    </div>

                    {form.regionMode === 'rectangle' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="form-label">最小经度 (°E)</label>
                            <input type="number" value={form.rectangle.minLon} onChange={e => setForm(prev => ({ ...prev, rectangle: { ...prev.rectangle, minLon: e.target.value } }))} className="form-input" />
                          </div>
                          <div>
                            <label className="form-label">最大经度 (°E)</label>
                            <input type="number" value={form.rectangle.maxLon} onChange={e => setForm(prev => ({ ...prev, rectangle: { ...prev.rectangle, maxLon: e.target.value } }))} className="form-input" />
                          </div>
                          <div>
                            <label className="form-label">最小纬度 (°N)</label>
                            <input type="number" value={form.rectangle.minLat} onChange={e => setForm(prev => ({ ...prev, rectangle: { ...prev.rectangle, minLat: e.target.value } }))} className="form-input" />
                          </div>
                          <div>
                            <label className="form-label">最大纬度 (°N)</label>
                            <input type="number" value={form.rectangle.maxLat} onChange={e => setForm(prev => ({ ...prev, rectangle: { ...prev.rectangle, maxLat: e.target.value } }))} className="form-input" />
                          </div>
                        </div>
                        <TemplateMap mode="rectangle" rectangle={rectangleForMap} onRectangleChange={rect => setForm(prev => ({ ...prev, rectangle: { minLon: String(rect.minLon.toFixed(4)), maxLon: String(rect.maxLon.toFixed(4)), minLat: String(rect.minLat.toFixed(4)), maxLat: String(rect.maxLat.toFixed(4)) } }))} />
                      </div>
                    )}

                    {form.regionMode === 'coordinates' && (
                      <div className="space-y-3">
                        <div>
                          <label className="form-label">经纬度坐标列表</label>
                          <textarea value={form.coordinates} onChange={e => setForm(prev => ({ ...prev, coordinates: e.target.value }))} className="form-input h-28 resize-none font-mono text-xs" placeholder={"经度,纬度（每行一个）\n例如：\n118.78,32.06\n121.47,31.23"} />
                          <p className="text-xs text-gray-400 mt-1">每行输入一个坐标，格式：经度,纬度</p>
                        </div>
                        <TemplateMap mode="coordinates" coordinates={coordsForMap} />
                      </div>
                    )}

                    {form.regionMode === 'region' && (
                      <div className="space-y-3">
                        <div>
                          <label className="form-label">选择区域（省份/城市）</label>
                          <div className="border border-gray-200 rounded-lg overflow-hidden max-h-52 overflow-y-auto custom-scrollbar">
                            {PROVINCES.map(prov => (
                              <div key={prov.value}>
                                <button
                                  onClick={() => toggleRegion(prov.value)}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors border-b border-gray-100 ${form.selectedRegions.includes(prov.value) ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                                >
                                  <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${form.selectedRegions.includes(prov.value) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                    {form.selectedRegions.includes(prov.value) && <Check size={9} className="text-white" />}
                                  </span>
                                  {prov.label}
                                  {prov.hasCoastline && <span className="tag-blue ml-auto">沿海</span>}
                                </button>
                                {!form.selectedRegions.includes(prov.value) && prov.cities.map(city => (
                                  <button key={city.value} onClick={() => toggleRegion(city.value)}
                                    className={`w-full flex items-center gap-2 pl-7 pr-3 py-1.5 text-xs hover:bg-gray-50 transition-colors border-b border-gray-50 ${form.selectedRegions.includes(city.value) ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}>
                                    <span className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 ${form.selectedRegions.includes(city.value) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                                      {form.selectedRegions.includes(city.value) && <Check size={8} className="text-white" />}
                                    </span>
                                    {city.label}
                                    {city.hasCoastline && <span className="tag-blue ml-auto">沿海</span>}
                                  </button>
                                ))}
                              </div>
                            ))}
                          </div>
                          {form.selectedRegions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {form.selectedRegions.map(r => {
                                const label = PROVINCES.find(p => p.value === r)?.label || PROVINCES.flatMap(p => p.cities).find(c => c.value === r)?.label || r
                                return (
                                  <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs">
                                    {label}
                                    <button onClick={() => setForm(prev => ({ ...prev, selectedRegions: prev.selectedRegions.filter(x => x !== r) }))}><X size={9} /></button>
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="form-label">边界外扩 (°)</label>
                            <input type="number" value={form.boundaryExpand} onChange={e => setForm(prev => ({ ...prev, boundaryExpand: e.target.value }))} className="form-input" min={0} max={5} step={0.05} />
                          </div>
                          {isCoastal && (
                            <div>
                              <label className="form-label">海岸线外扩 (°)</label>
                              <input type="number" value={form.coastlineExpand} onChange={e => setForm(prev => ({ ...prev, coastlineExpand: e.target.value }))} className="form-input" min={0} max={5} step={0.05} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="card bg-gray-50 border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">气象模型</div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium text-gray-800">ghr_9km</span>
                      <span className="tag-blue">默认</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="form-label mb-0">气象要素 <span className="text-red-500">*</span></label>
                      <button onClick={() => setForm(prev => ({ ...prev, variables: [] }))} className="text-xs text-gray-400 hover:text-red-500">清空</button>
                    </div>
                    <VariableSelector selected={form.variables} onChange={v => setForm(prev => ({ ...prev, variables: v }))} showPressure={true} />
                    {form.variables.length === 0 && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                        <AlertCircle size={12} />请至少选择一个气象变量
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="text-xs font-semibold text-blue-700 mb-2">消耗预估</div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-800">{pts.toLocaleString()}</div>
                        <div className="text-xs text-blue-600 mt-0.5">预估点数</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-800">{form.variables.length}</div>
                        <div className="text-xs text-blue-600 mt-0.5">气象变量</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-800">{estimateSize(pts, form.variables.length)}</div>
                        <div className="text-xs text-blue-600 mt-0.5">预估文件大小</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <label className="form-label">执行时次（可多选）</label>
                    <div className="flex gap-2 mt-1">
                      {(['00z', '06z', '12z', '18z'] as ForecastTime[]).map(t => (
                        <button key={t} onClick={() => toggleForecastTime(t)}
                          className={`flex-1 py-2.5 text-xs font-medium rounded-lg border transition-colors ${form.forecastTimes.includes(t) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'}`}>
                          {t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">时间间隔</label>
                    <div className="flex gap-2">
                      {(['1h', '15min'] as TimeInterval[]).map(v => (
                        <button key={v} onClick={() => setForm(prev => ({ ...prev, interval: v }))}
                          className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors ${form.interval === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">数据格式</label>
                    <div className="flex gap-2">
                      {(['NetCDF', 'CSV'] as DataFormat[]).map(v => (
                        <button key={v} onClick={() => setForm(prev => ({ ...prev, dataFormat: v }))}
                          className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors ${form.dataFormat === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">数据处理</label>
                    <div className="flex gap-2">
                      <button onClick={() => setForm(prev => ({ ...prev, spatialProcessing: 'none' }))}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors ${form.spatialProcessing === 'none' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'}`}>
                        原始数据
                      </button>
                      <button onClick={() => setForm(prev => ({ ...prev, spatialProcessing: 'spatial_mean' }))}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors ${form.spatialProcessing === 'spatial_mean' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'}`}>
                        空间均值
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t flex gap-3">
              {step > 1 && <button onClick={() => setStep(s => s - 1)} className="btn-secondary">上一步</button>}
              <button onClick={() => setDrawerMode(null)} className="btn-secondary ml-auto">取消</button>
              {step < 3 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={step === 1 && !form.name.trim()}
                  className="btn-primary disabled:opacity-50"
                >
                  下一步 <ChevronRight size={14} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={form.variables.length === 0} className="btn-primary disabled:opacity-50">
                  <Check size={14} />确定创建
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
