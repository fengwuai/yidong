import { useState } from 'react'
import {
  Database, Activity, AlertTriangle, Server, HardDrive,
  TrendingUp, Clock, CheckCircle2, Layers,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Header from '../components/Layout/Header'
import { DASHBOARD_STATS, MOCK_DATA_SOURCES } from '../data/mockData'
import { DATA_LIFECYCLE_CONFIG } from '../data/constants'

const QUERY_TREND = [
  { date: '06-07', queries: 98200, exports: 980 },
  { date: '06-08', queries: 105300, exports: 1120 },
  { date: '06-09', queries: 118600, exports: 1050 },
  { date: '06-10', queries: 112400, exports: 1340 },
  { date: '06-11', queries: 121800, exports: 1180 },
  { date: '06-12', queries: 125600, exports: 1260 },
  { date: '06-13', queries: 128450, exports: 1286 },
]

const LIFECYCLE_PIE = DATA_LIFECYCLE_CONFIG.map(d => ({
  name: d.label,
  value: d.ratio,
  color: d.tier === 'hot' ? '#ff4d4f' : d.tier === 'warm' ? '#fa8c16' : '#1677ff',
}))

const WARNING_TREND = [
  { type: '暴雨', count: 28 },
  { type: '大风', count: 19 },
  { type: '高温', count: 12 },
  { type: '台风', count: 8 },
  { type: '大雾', count: 15 },
  { type: '寒潮', count: 6 },
]

export default function DashboardPage() {
  const stats = DASHBOARD_STATS

  return (
    <div>
      <Header
        title="数据中心概览"
        subtitle="AI气象预测数据中心运行状态与资源监控"
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '总存储容量', value: stats.totalStorage, sub: `热 ${stats.hotStorage} / 温 ${stats.warmStorage} / 冷 ${stats.coldStorage}`, icon: HardDrive, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
          { label: '时空记录总数', value: stats.totalRecords, sub: `预警数据 ${stats.warningRecords}`, icon: Database, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
          { label: '今日查询/导出', value: stats.dailyQueries, sub: `导出 ${stats.dailyExports} 次`, icon: Activity, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
          { label: '生效预警', value: stats.activeWarnings, sub: `系统可用性 ${stats.systemAvailability}`, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
        ].map(({ label, value, sub, icon: Icon, color, bg, border }) => (
          <div key={label} className={`card py-4 border ${border} ${bg}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-600 mt-0.5 font-medium">{label}</div>
                <div className="text-xs text-gray-400 mt-1">{sub}</div>
              </div>
              <Icon size={20} className={`${color} opacity-60`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-8 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-gray-800">查询与导出趋势（近7天）</h3>
            <TrendingUp size={15} className="text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={QUERY_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip />
              <Bar dataKey="queries" name="查询次数" fill="#1677ff" radius={[3, 3, 0, 0]} />
              <Bar dataKey="exports" name="导出次数" fill="#52c41a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-4 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-gray-800">数据冷热分层</h3>
            <Layers size={15} className="text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={LIFECYCLE_PIE} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {LIFECYCLE_PIE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {DATA_LIFECYCLE_CONFIG.map(d => (
              <div key={d.tier} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{d.label}（{d.storage}）</span>
                <span className="font-medium text-gray-800">{d.size}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-5 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-gray-800">预警类型统计（近30天）</h3>
            <AlertTriangle size={15} className="text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WARNING_TREND} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis type="category" dataKey="type" tick={{ fontSize: 11, fill: '#6b7280' }} width={40} />
              <Tooltip />
              <Bar dataKey="count" name="预警次数" fill="#fa8c16" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-7 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-gray-800">系统运行指标</h3>
            <Server size={15} className="text-gray-400" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '系统可用性', value: stats.systemAvailability, target: '≥99%', ok: true },
              { label: '平均查询延迟', value: stats.avgQueryLatency, target: '≤600ms', ok: true },
              { label: '今日 API 调用', value: stats.apiCallsToday, target: '限流 100/s', ok: true },
              { label: '预警推送成功率', value: '99.92%', target: '≥99.9%', ok: true },
              { label: '数据完整性', value: '99.95%', target: '≥99.9%', ok: true },
              { label: '压缩比', value: '3.2:1', target: '≥3:1', ok: true },
            ].map(({ label, value, target, ok }) => (
              <div key={label} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 size={12} className={ok ? 'text-green-500' : 'text-red-500'} />
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
                <div className="text-lg font-bold text-gray-800">{value}</div>
                <div className="text-xs text-gray-400 mt-0.5">目标 {target}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-sm text-gray-700">多源数据接入状态</span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={11} />实时同步
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">数据源名称</th>
                <th className="table-header">类型</th>
                <th className="table-header">格式</th>
                <th className="table-header">状态</th>
                <th className="table-header">最后同步</th>
                <th className="table-header">记录数</th>
                <th className="table-header">存储量</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_DATA_SOURCES.map(ds => (
                <tr key={ds.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium text-gray-800">{ds.name}</td>
                  <td className="table-cell"><span className="tag-blue">{ds.type}</span></td>
                  <td className="table-cell font-mono text-xs">{ds.format}</td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${ds.status === 'online' ? 'text-green-600' : ds.status === 'syncing' ? 'text-blue-600' : 'text-gray-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${ds.status === 'online' ? 'bg-green-400' : ds.status === 'syncing' ? 'bg-blue-400 animate-pulse' : 'bg-gray-300'}`}></span>
                      {ds.status === 'online' ? '在线' : ds.status === 'syncing' ? '同步中' : '离线'}
                    </span>
                  </td>
                  <td className="table-cell font-mono text-xs text-gray-500">{ds.lastSync}</td>
                  <td className="table-cell text-xs">{ds.recordCount}</td>
                  <td className="table-cell text-xs font-medium">{ds.storageSize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">系统对接状态</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: '供应链管理系统', status: '已对接', delay: '数据互通 8min', type: '内部' },
            { name: '物流调度系统', status: '已对接', delay: '预警推送 28s', type: '内部' },
            { name: '应急响应系统', status: '已对接', delay: '联动触发 15s', type: '内部' },
            { name: '电力交易系统', status: '已对接', delay: 'API 回调 30s', type: '内部' },
            { name: 'ECMWF 数据服务', status: '已对接', delay: '同步延迟 2.8min', type: '外部' },
            { name: '官方气象预警平台', status: '已对接', delay: '抓取延迟 45s', type: '外部' },
          ].map(sys => (
            <div key={sys.name} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-800">{sys.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{sys.delay}</div>
              </div>
              <div className="text-right">
                <span className="tag-green">{sys.status}</span>
                <div className="text-xs text-gray-400 mt-1">{sys.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
