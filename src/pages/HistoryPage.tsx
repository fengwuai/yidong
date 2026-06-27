import { useState } from 'react'
import { Download, RefreshCw, Search, Filter, AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import Header from '../components/Layout/Header'
import { TaskStatusBadge } from '../components/Common/StatusBadge'
import { useWeatherStore } from '../store/weatherStore'
import type { TaskStatus } from '../types/weather'

const STATUS_OPTIONS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'queued', label: '排队中' },
  { value: 'running', label: '运行中' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' },
]

export default function HistoryPage() {
  const { historyTasks, updateHistoryTask } = useWeatherStore()
  const [tab, setTab] = useState<'data' | 'warning'>('data')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [reExporting, setReExporting] = useState<string | null>(null)

  const warningExports = [
    { id: 'wexp_001', name: '2026年6月暴雨预警批量导出', format: 'Excel', count: 28, size: '2.4 MB', status: 'completed' as const, time: '2026-06-13 14:00:00' },
    { id: 'wexp_002', name: '台风预警历史溯源(2025)', format: 'CSV', count: 12, size: '856 KB', status: 'completed' as const, time: '2026-06-12 10:30:00' },
    { id: 'wexp_003', name: '华东区域预警数据', format: 'JSON', count: 45, size: '1.8 MB', status: 'running' as const, time: '2026-06-13 15:00:00' },
  ]

  const filtered = (tab === 'data' ? historyTasks : []).filter(t => {
    const matchSearch = t.templateName.toLowerCase().includes(search.toLowerCase()) ||
      t.forecastTime.includes(search)
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: historyTasks.length,
    completed: historyTasks.filter(t => t.status === 'completed').length,
    running: historyTasks.filter(t => t.status === 'running').length,
    failed: historyTasks.filter(t => t.status === 'failed').length,
    queued: historyTasks.filter(t => t.status === 'queued').length,
  }

  const handleReExport = async (id: string) => {
    setReExporting(id)
    await new Promise(r => setTimeout(r, 1800))
    updateHistoryTask(id, {
      status: 'completed',
      completedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    })
    setReExporting(null)
  }

  return (
    <div>
      <Header
        title="历史任务导出"
        subtitle="数据推送任务与预警数据导出记录，支持异步任务与断点续传"
      />

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 max-w-sm">
        <button onClick={() => setTab('data')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${tab === 'data' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>气象数据任务</button>
        <button onClick={() => setTab('warning')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${tab === 'warning' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>预警数据导出</button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '总任务数', value: stats.total, icon: Filter, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
          { label: '已完成', value: stats.completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
          { label: '运行中', value: stats.running, icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
          { label: '失败', value: stats.failed, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`card py-4 border ${border} ${bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
              <Icon size={20} className={`${color} opacity-60`} />
            </div>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        {tab === 'data' ? (
          <>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-8 py-1.5 text-xs" placeholder="搜索模板名称或起报时间..." />
              </div>
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setStatusFilter(opt.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="table-header">模板名称</th>
                    <th className="table-header">起报时间</th>
                    <th className="table-header">查询变量</th>
                    <th className="table-header">创建时间</th>
                    <th className="table-header">完成时间</th>
                    <th className="table-header">文件大小</th>
                    <th className="table-header">状态</th>
                    <th className="table-header">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(task => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell">
                    <div className="font-medium text-gray-900">{task.templateName}</div>
                    <div className="text-xs text-gray-400 mt-0.5 font-mono">{task.id}</div>
                  </td>
                  <td className="table-cell">
                    <span className="font-mono text-xs text-gray-700">{task.forecastTime}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1 max-w-44">
                      {task.variables.slice(0, 3).map(v => <span key={v} className="tag tag-gray">{v}</span>)}
                      {task.variables.length > 3 && <span className="tag tag-gray">+{task.variables.length - 3}</span>}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-xs text-gray-600 font-mono">{task.createdAt}</span>
                  </td>
                  <td className="table-cell">
                    {task.completedAt
                      ? <span className="text-xs text-gray-600 font-mono">{task.completedAt}</span>
                      : <span className="text-xs text-gray-400">—</span>
                    }
                  </td>
                  <td className="table-cell">
                    {task.dataSize
                      ? <span className="text-xs font-medium text-gray-700">{task.dataSize}</span>
                      : <span className="text-xs text-gray-400">—</span>
                    }
                  </td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <TaskStatusBadge status={task.status} />
                      {task.status === 'failed' && task.failureReason && (
                        <div className="flex items-start gap-1 text-xs text-red-500 max-w-44">
                          <AlertCircle size={10} className="flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{task.failureReason}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      {task.status === 'completed' && task.downloadUrl && (
                        <a
                          href={task.downloadUrl}
                          download
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Download size={12} />下载
                        </a>
                      )}
                      {(task.status === 'completed' || task.status === 'failed') && (
                        <button
                          onClick={() => handleReExport(task.id)}
                          disabled={reExporting === task.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
                        >
                          {reExporting === task.id
                            ? <><RefreshCw size={11} className="animate-spin" />导出中</>
                            : <><RefreshCw size={11} />重新导出</>
                          }
                        </button>
                      )}
                      {task.status === 'queued' && (
                        <div className="flex items-center gap-1 text-xs text-yellow-600">
                          <Clock size={11} />等待执行
                        </div>
                      )}
                      {task.status === 'running' && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Loader2 size={11} className="animate-spin" />推送中
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">没有找到匹配的任务记录</p>
            </div>
          )}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">共 {filtered.length} 条记录 · 支持异步导出与断点续传（重试≤3次）</span>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>实时更新中
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="px-5 py-4 border-b border-gray-100">
              <span className="font-semibold text-sm text-gray-700">预警数据导出记录</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="table-header">导出任务</th>
                    <th className="table-header">格式</th>
                    <th className="table-header">预警条数</th>
                    <th className="table-header">文件大小</th>
                    <th className="table-header">导出时间</th>
                    <th className="table-header">状态</th>
                    <th className="table-header">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {warningExports.map(w => (
                    <tr key={w.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium text-gray-800">{w.name}</td>
                      <td className="table-cell"><span className="tag-blue">{w.format}</span></td>
                      <td className="table-cell">{w.count} 条</td>
                      <td className="table-cell">{w.size}</td>
                      <td className="table-cell font-mono text-xs text-gray-500">{w.time}</td>
                      <td className="table-cell">
                        <TaskStatusBadge status={w.status === 'completed' ? 'completed' : 'running'} />
                      </td>
                      <td className="table-cell">
                        {w.status === 'completed' && (
                          <button className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium">
                            <Download size={12} />下载
                          </button>
                        )}
                        {w.status === 'running' && (
                          <span className="flex items-center gap-1 text-xs text-blue-600"><Loader2 size={11} className="animate-spin" />导出中</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
