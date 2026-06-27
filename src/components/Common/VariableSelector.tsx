import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { WEATHER_VARIABLES, PRESSURE_LEVELS, PRESSURE_VARIABLES, PRESSURE_VARIABLE_LABELS, PRESSURE_VARIABLE_UNITS } from '../../data/constants'

interface VariableSelectorProps {
  selected: string[]
  maxCount?: number
  onChange: (vars: string[]) => void
  showPressure?: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  surface: '地表参数',
  wind: '风场',
  temperature: '温度',
  derived: '衍生变量',
}

export default function VariableSelector({ selected, maxCount = 4, onChange, showPressure = true }: VariableSelectorProps) {
  const [activeTab, setActiveTab] = useState<'surface' | 'pressure'>('surface')
  const [pressureVar, setPressureVar] = useState('u')
  const [pressureLevel, setPressureLevel] = useState<number>(500)

  const toggleVar = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter(v => v !== key))
    } else {
      if (maxCount && selected.length >= maxCount) return
      onChange([...selected, key])
    }
  }

  const addPressureVar = () => {
    const key = `${pressureVar}${pressureLevel}hpa`
    if (!selected.includes(key) && !(maxCount && selected.length >= maxCount)) {
      onChange([...selected, key])
    }
  }

  const categorized = WEATHER_VARIABLES.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = []
    acc[v.category].push(v)
    return acc
  }, {} as Record<string, typeof WEATHER_VARIABLES>)

  return (
    <div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          {selected.map(v => (
            <span key={v} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md text-xs font-medium">
              {v}
              <button onClick={() => toggleVar(v)} className="hover:bg-blue-500 rounded p-0.5"><X size={10} /></button>
            </span>
          ))}
          {maxCount && <span className="text-xs text-blue-500 self-center ml-1">{selected.length}/{maxCount}</span>}
        </div>
      )}

      {showPressure && (
        <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setActiveTab('surface')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'surface' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
            地表/标准变量
          </button>
          <button onClick={() => setActiveTab('pressure')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'pressure' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
            高空气压层变量
          </button>
        </div>
      )}

      {activeTab === 'surface' && (
        <div className="space-y-3">
          {Object.entries(categorized).map(([cat, vars]) => (
            <div key={cat}>
              <div className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{CATEGORY_LABELS[cat] || cat}</div>
              <div className="flex flex-wrap gap-1.5">
                {vars.map(v => {
                  const isSelected = selected.includes(v.key)
                  const isDisabled = !isSelected && maxCount !== undefined && selected.length >= maxCount
                  return (
                    <button key={v.key} onClick={() => !isDisabled && toggleVar(v.key)} disabled={isDisabled}
                      className={isSelected ? 'variable-chip-selected' : isDisabled ? 'inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-400 border border-gray-200 rounded-md text-xs cursor-not-allowed' : 'variable-chip'}
                      title={`${v.label} (${v.unit})`}>
                      {v.key} <span className="opacity-60">{v.unit}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'pressure' && (
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="form-label">变量类型</label>
              <select value={pressureVar} onChange={e => setPressureVar(e.target.value)} className="form-select">
                {PRESSURE_VARIABLES.map(v => <option key={v} value={v}>{PRESSURE_VARIABLE_LABELS[v]} ({v}) - {PRESSURE_VARIABLE_UNITS[v]}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="form-label">气压层 (hPa)</label>
              <select value={pressureLevel} onChange={e => setPressureLevel(Number(e.target.value))} className="form-select">
                {PRESSURE_LEVELS.map(l => <option key={l} value={l}>{l} hPa</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={addPressureVar} disabled={maxCount !== undefined && selected.length >= maxCount} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus size={14} />添加
              </button>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            当前预览：<strong className="text-gray-700">{pressureVar}{pressureLevel}hpa</strong> — {PRESSURE_VARIABLE_LABELS[pressureVar]}
          </div>
        </div>
      )}
    </div>
  )
}
