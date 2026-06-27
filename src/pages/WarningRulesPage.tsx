import { useState } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, Play, GitBranch, AlertCircle, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import Header from '../components/Layout/Header'
import { useWeatherStore } from '../store/weatherStore'
import { WARNING_LEVEL_CONFIG, WARNING_TYPE_LABELS } from '../data/constants'
import type { WarningRule, WarningLevel, WarningType } from '../types/weather'

export default function WarningRulesPage() {
  const { warningRules, updateWarningRule, addWarningRule, deleteWarningRule } = useWeatherStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ id: string; pass: boolean; msg: string } | null>(null)

  const [form, setForm] = useState<{
    name: string
    warningType: WarningType
    warningLevel: WarningLevel
    element: string
    operator: '>' | '>=' | '<' | '<=' | '=='
    threshold: number
    unit: string
    logic: 'and' | 'or'
    spatialScope: string
    effectiveMode: 'immediate' | 'scheduled'
  }>({
    name: '',
    warningType: 'rainstorm' as WarningType,
    warningLevel: 'yellow' as WarningLevel,
    element: 'tp6h',
    operator: '>=' as const,
    threshold: 50,
    unit: 'mm',
    logic: 'and' as const,
    spatialScope: 'global' as const,
    effectiveMode: 'immediate' as const,
  })

  const handleToggle = (id: string, enabled: boolean) => {
    updateWarningRule(id, { enabled: !enabled })
  }

  const handleTest = async (id: string) => {
    setTesting(id)
    setTestResult(null)
    await new Promise(r => setTimeout(r, 1500))
    setTestResult({ id, pass: true, msg: '模拟触发测试通过，规则条件有效，预计影响 3 个区域' })
    setTesting(null)
  }

  const handleCreate = () => {
    if (!form.name.trim()) return
    const rule: WarningRule = {
      id: `rule_${Date.now()}`,
      name: form.name,
      enabled: true,
      priority: warningRules.length + 1,
      warningType: form.warningType,
      warningLevel: form.warningLevel,
      conditions: [{ element: form.element, operator: form.operator, threshold: form.threshold, unit: form.unit }],
      logic: form.logic,
      spatialScope: form.spatialScope as 'global' | 'region' | 'custom',
      effectiveMode: form.effectiveMode as 'immediate' | 'scheduled',
      version: 'v1.0',
      updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      triggerCount: 0,
    }
    addWarningRule(rule)
    setDrawerOpen(false)
    setForm({ name: '', warningType: 'rainstorm', warningLevel: 'yellow', element: 'tp6h', operator: '>=', threshold: 50, unit: 'mm', logic: 'and', spatialScope: 'global', effectiveMode: 'immediate' })
  }

  return (
    <div>
      <Header
        title="预警规则配置"
        subtitle="可视化规则引擎，支持阈值配置、逻辑组合与模拟触发测试"
        actions={
          <button onClick={() => setDrawerOpen(true)} className="btn-primary">
            <Plus size={14} />新建规则
          </button>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '规则总数', value: warningRules.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '已启用', value: warningRules.filter(r => r.enabled).length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: '累计触发', value: warningRules.reduce((s, r) => s + r.triggerCount, 0), color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: '规则版本', value: 'v2.1', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`card py-3 ${bg}`}>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="font-semibold text-sm text-gray-700">规则列表</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">规则名称</th>
                <th className="table-header">预警类型</th>
                <th className="table-header">预警等级</th>
                <th className="table-header">触发条件</th>
                <th className="table-header">逻辑</th>
                <th className="table-header">空间范围</th>
                <th className="table-header">版本</th>
                <th className="table-header">触发次数</th>
                <th className="table-header">状态</th>
                <th className="table-header">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {warningRules.map(rule => {
                const lvlCfg = WARNING_LEVEL_CONFIG[rule.warningLevel]
                return (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">{rule.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">优先级 {rule.priority} · 更新 {rule.updatedAt.slice(0, 10)}</div>
                    </td>
                    <td className="table-cell"><span className="tag-gray">{WARNING_TYPE_LABELS[rule.warningType]}</span></td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${lvlCfg.text}`}>
                        <span className="w-2 h-2 rounded-full" style={{ background: lvlCfg.color }}></span>
                        {lvlCfg.label}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="text-xs font-mono text-gray-700">
                        {rule.conditions.map((c, i) => (
                          <span key={i}>{i > 0 ? ` ${rule.logic.toUpperCase()} ` : ''}{c.element} {c.operator} {c.threshold}{c.unit}</span>
                        ))}
                      </div>
                    </td>
                    <td className="table-cell"><span className="tag-blue">{rule.logic.toUpperCase()}</span></td>
                    <td className="table-cell text-xs text-gray-600">
                      {rule.spatialScope === 'global' ? '全球' : rule.spatialScope === 'region' ? rule.regions?.join('、') : '自定义'}
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <GitBranch size={10} />{rule.version}
                      </span>
                    </td>
                    <td className="table-cell font-medium">{rule.triggerCount}</td>
                    <td className="table-cell">
                      <span className={`text-xs font-medium ${rule.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                        {rule.enabled ? '已启用' : '已停用'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleTest(rule.id)} disabled={testing === rule.id}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50" title="模拟触发测试">
                          <Play size={13} />
                        </button>
                        <button onClick={() => handleToggle(rule.id, rule.enabled)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 transition-colors" title="开关规则">
                          {rule.enabled ? <ToggleRight size={16} className="text-blue-500" /> : <ToggleLeft size={16} />}
                        </button>
                        <button onClick={() => deleteWarningRule(rule.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors" title="删除">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      {testResult?.id === rule.id && (
                        <div className={`mt-1 text-xs flex items-center gap-1 ${testResult.pass ? 'text-green-600' : 'text-red-600'}`}>
                          {testResult.pass ? <Check size={10} /> : <AlertCircle size={10} />}
                          {testResult.msg}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="w-[480px] h-full bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">新建预警规则</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">
              <div>
                <label className="form-label">规则名称</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="form-input" placeholder="如：暴雨6h降水阈值" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">预警类型</label>
                  <select value={form.warningType} onChange={e => setForm(p => ({ ...p, warningType: e.target.value as WarningType }))} className="form-select">
                    {Object.entries(WARNING_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">预警等级</label>
                  <select value={form.warningLevel} onChange={e => setForm(p => ({ ...p, warningLevel: e.target.value as WarningLevel }))} className="form-select">
                    {Object.entries(WARNING_LEVEL_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">触发条件</label>
                <div className="flex gap-2">
                  <select value={form.element} onChange={e => setForm(p => ({ ...p, element: e.target.value }))} className="form-select flex-1">
                    {['ws10', 'ws100', 'tp6h', 't2m', 'tcc', 'msl'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <select value={form.operator} onChange={e => setForm(p => ({ ...p, operator: e.target.value as any }))} className="form-select w-20">
                    {['>=', '>', '<=', '<', '=='].map(op => <option key={op} value={op}>{op}</option>)}
                  </select>
                  <input type="number" value={form.threshold} onChange={e => setForm(p => ({ ...p, threshold: Number(e.target.value) }))} className="form-input w-24" />
                  <input value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} className="form-input w-16" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">逻辑组合</label>
                  <div className="flex gap-2">
                    {(['and', 'or'] as const).map(l => (
                      <button key={l} onClick={() => setForm(p => ({ ...p, logic: l }))}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg border ${form.logic === l ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                        {l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label">生效方式</label>
                  <div className="flex gap-2">
                    {([['immediate', '即时生效'], ['scheduled', '定时生效']] as const).map(([v, l]) => (
                      <button key={v} onClick={() => setForm(p => ({ ...p, effectiveMode: v }))}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg border ${form.effectiveMode === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700">
                规则配置后即时生效，无需重启系统。建议先执行模拟触发测试验证规则有效性。
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-3">
              <button onClick={() => setDrawerOpen(false)} className="btn-secondary flex-1 justify-center">取消</button>
              <button onClick={handleCreate} disabled={!form.name.trim()} className="btn-primary flex-1 justify-center disabled:opacity-50">
                <Check size={14} />创建规则
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
