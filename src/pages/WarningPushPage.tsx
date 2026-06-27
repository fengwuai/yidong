import { useState } from 'react'
import { Bell, RefreshCw, CheckCircle2, XCircle, Clock, ToggleLeft, ToggleRight } from 'lucide-react'
import Header from '../components/Layout/Header'
import { MOCK_PUSH_RECORDS } from '../data/mockData'
import { PUSH_CHANNEL_LABELS } from '../data/constants'
import type { PushChannel, PushDeliveryStatus } from '../types/weather'

const STATUS_CONFIG: Record<PushDeliveryStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  delivered: { label: '已送达', color: 'text-green-600', icon: CheckCircle2 },
  read: { label: '已读', color: 'text-blue-600', icon: CheckCircle2 },
  pending: { label: '待送达', color: 'text-yellow-600', icon: Clock },
  failed: { label: '失败', color: 'text-red-600', icon: XCircle },
}

const CHANNEL_CONFIG = Object.entries(PUSH_CHANNEL_LABELS).map(([key, label]) => ({
  key: key as PushChannel,
  label,
  enabled: key !== 'dingtalk',
}))

export default function WarningPushPage() {
  const [channelFilter, setChannelFilter] = useState<PushChannel | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<PushDeliveryStatus | 'all'>('all')
  const [channels, setChannels] = useState(CHANNEL_CONFIG)

  const filtered = MOCK_PUSH_RECORDS.filter(r => {
    const matchChannel = channelFilter === 'all' || r.channel === channelFilter
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchChannel && matchStatus
  })

  const stats = {
    total: MOCK_PUSH_RECORDS.length,
    delivered: MOCK_PUSH_RECORDS.filter(r => r.status === 'delivered' || r.status === 'read').length,
    failed: MOCK_PUSH_RECORDS.filter(r => r.status === 'failed').length,
    pending: MOCK_PUSH_RECORDS.filter(r => r.status === 'pending').length,
    successRate: '99.92%',
  }

  const toggleChannel = (key: PushChannel) => {
    setChannels(prev => prev.map(c => c.key === key ? { ...c, enabled: !c.enabled } : c))
  }

  return (
    <div>
      <Header
        title="预警推送管理"
        subtitle="多渠道预警推送配置、状态追踪与失败重试"
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '推送总数', value: stats.total, color: 'text-gray-700', bg: 'bg-gray-50' },
          { label: '已送达', value: stats.delivered, color: 'text-green-600', bg: 'bg-green-50' },
          { label: '待送达', value: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: '推送成功率', value: stats.successRate, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`card py-3 ${bg}`}>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-4 card">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={15} className="text-blue-500" />
            <span className="font-semibold text-sm text-gray-700">推送渠道配置</span>
          </div>
          <div className="space-y-2">
            {channels.map(ch => (
              <div key={ch.key} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                <div>
                  <div className="text-sm font-medium text-gray-700">{ch.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {ch.key === 'platform' && '延迟 ≤30秒'}
                    {ch.key === 'sms' && '延迟 ≤1分钟'}
                    {ch.key === 'email' && '延迟 ≤1分钟'}
                    {ch.key === 'wechat' && '延迟 ≤1分钟'}
                    {ch.key === 'dingtalk' && '延迟 ≤1分钟'}
                    {ch.key === 'api_callback' && '延迟 ≤30秒 · 签名校验'}
                  </div>
                </div>
                <button onClick={() => toggleChannel(ch.key)} className="text-gray-400 hover:text-blue-600 transition-colors">
                  {ch.enabled ? <ToggleRight size={20} className="text-blue-500" /> : <ToggleLeft size={20} />}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
            红色/橙色预警不受推送时间段限制，强制推送。非工作时间仅推送红色/橙色预警。
          </div>
        </div>

        <div className="col-span-8 card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-sm text-gray-700">推送记录</span>
            <div className="flex gap-1 ml-auto flex-wrap">
              <button onClick={() => setChannelFilter('all')} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${channelFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>全部渠道</button>
              {Object.entries(PUSH_CHANNEL_LABELS).map(([k, v]) => (
                <button key={k} onClick={() => setChannelFilter(k as PushChannel)} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${channelFilter === k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{v}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">预警标题</th>
                  <th className="table-header">推送渠道</th>
                  <th className="table-header">接收方</th>
                  <th className="table-header">推送时间</th>
                  <th className="table-header">重试</th>
                  <th className="table-header">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(record => {
                  const cfg = STATUS_CONFIG[record.status]
                  const Icon = cfg.icon
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="text-sm font-medium text-gray-800 max-w-48 truncate">{record.warningTitle}</div>
                      </td>
                      <td className="table-cell"><span className="tag-blue">{record.channelLabel}</span></td>
                      <td className="table-cell text-xs text-gray-600">{record.recipient}</td>
                      <td className="table-cell font-mono text-xs text-gray-500">{record.pushTime}</td>
                      <td className="table-cell text-xs">
                        {record.retryCount > 0 ? (
                          <span className="flex items-center gap-1 text-orange-600">
                            <RefreshCw size={10} />{record.retryCount}次
                          </span>
                        ) : '—'}
                      </td>
                      <td className="table-cell">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
                            <Icon size={11} />{cfg.label}
                          </span>
                          {record.failureReason && (
                            <div className="text-xs text-red-500 max-w-40">{record.failureReason}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
