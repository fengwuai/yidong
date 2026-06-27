import { useState } from 'react'
import { Key, User, Bell, Shield, Copy, Check, Eye, EyeOff, ScrollText } from 'lucide-react'
import Header from '../components/Layout/Header'
import { useWeatherStore } from '../store/weatherStore'
import { MOCK_AUDIT_LOGS } from '../data/mockData'
import { USER_ROLE_LABELS } from '../data/constants'

export default function SettingsPage() {
  const { userToken, setUserToken } = useWeatherStore()
  const [copied, setCopied] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [editToken, setEditToken] = useState(userToken)
  const [saved, setSaved] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(userToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    setUserToken(editToken)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const maskedToken = userToken.slice(0, 8) + '•'.repeat(Math.max(0, userToken.length - 12)) + userToken.slice(-4)

  return (
    <div>
      <Header title="账户与安全" subtitle="用户权限管理、API 访问配置与安全审计（等保三级）" />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-5">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <User size={15} className="text-blue-500" />
              <span className="font-semibold text-sm text-gray-700">账户信息</span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">用户名</label>
                  <input className="form-input bg-gray-50" value="enterprise_user_001" readOnly />
                </div>
                <div>
                  <label className="form-label">账户类型</label>
                  <input className="form-input bg-gray-50" value="企业版 · 等保三级" readOnly />
                </div>
                <div>
                  <label className="form-label">用户角色</label>
                  <input className="form-input bg-gray-50" value="超级管理员" readOnly />
                </div>
                <div>
                  <label className="form-label">注册邮箱</label>
                  <input className="form-input bg-gray-50" value="admin@example.com" readOnly />
                </div>
                <div>
                  <label className="form-label">账户状态</label>
                  <div className="flex items-center gap-2 h-9">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    <span className="text-sm text-green-700 font-medium">正常</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Key size={15} className="text-blue-500" />
              <span className="font-semibold text-sm text-gray-700">API Token</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="form-label">当前 Token</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={showToken ? userToken : maskedToken}
                      readOnly
                      className="form-input font-mono text-xs bg-gray-50 pr-8"
                    />
                    <button
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <button onClick={handleCopy} className="btn-secondary flex-shrink-0">
                    {copied ? <><Check size={14} className="text-green-500" />已复制</> : <><Copy size={14} />复制</>}
                  </button>
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-700">
                <Shield size={12} className="inline mr-1" />
                请妥善保管您的 Token，不要在公开场合分享。如 Token 泄露，请立即重置。
              </div>
              <div>
                <label className="form-label">更新 Token</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editToken}
                    onChange={e => setEditToken(e.target.value)}
                    className="form-input font-mono text-xs flex-1"
                    placeholder="输入新的 API Token"
                  />
                  <button onClick={handleSave} className="btn-primary flex-shrink-0">
                    {saved ? <><Check size={14} />已保存</> : '保存'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={15} className="text-blue-500" />
              <span className="font-semibold text-sm text-gray-700">通知设置</span>
            </div>
            <div className="space-y-3">
              {[
                { label: '推送任务完成通知', desc: '当定时推送任务完成时发送邮件通知', default: true },
                { label: '任务失败告警', desc: '任务执行失败时立即发送告警邮件', default: true },
                { label: '余额不足提醒', desc: '点数余额低于 1000 时发送提醒', default: true },
                { label: '系统维护公告', desc: '系统维护或版本更新通知', default: false },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-700">{item.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={15} className="text-blue-500" />
              <span className="font-semibold text-sm text-gray-700">权限角色体系</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(USER_ROLE_LABELS).map(([key, label]) => (
                <div key={key} className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-sm font-medium text-gray-800">{label}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {key === 'super_admin' && '全部权限，含用户管理与系统配置'}
                    {key === 'operator' && '数据管理、预警配置、运维操作'}
                    {key === 'user' && '数据查询、导出、预警查看'}
                    {key === 'readonly' && '只读访问，不可导出与配置'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <ScrollText size={15} className="text-blue-500" />
              <span className="font-semibold text-sm text-gray-700">操作审计日志</span>
              <span className="text-xs text-gray-400 ml-auto">留存 ≥1 年 · 不可篡改</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="table-header">操作人</th>
                    <th className="table-header">角色</th>
                    <th className="table-header">操作</th>
                    <th className="table-header">模块</th>
                    <th className="table-header">IP</th>
                    <th className="table-header">时间</th>
                    <th className="table-header">结果</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MOCK_AUDIT_LOGS.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium text-gray-800">{log.operator}</td>
                      <td className="table-cell text-xs">{log.role}</td>
                      <td className="table-cell text-xs">{log.action}</td>
                      <td className="table-cell"><span className="tag-gray">{log.module}</span></td>
                      <td className="table-cell font-mono text-xs text-gray-500">{log.ip}</td>
                      <td className="table-cell font-mono text-xs text-gray-500">{log.time}</td>
                      <td className="table-cell">
                        <span className={`text-xs font-medium ${log.result === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {log.result === 'success' ? '成功' : '失败'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-span-4 space-y-5">
          <div className="card">
            <div className="text-sm font-semibold text-gray-700 mb-4">点数使用情况</div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>已使用</span><span>51,680 / 100,000</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '51.68%' }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <div className="text-lg font-bold text-blue-700">48,320</div>
                  <div className="text-xs text-blue-600 mt-0.5">剩余点数</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-lg font-bold text-gray-700">51,680</div>
                  <div className="text-xs text-gray-500 mt-0.5">已消耗</div>
                </div>
              </div>
              <button className="btn-primary w-full justify-center">购买点数</button>
            </div>
          </div>

          <div className="card">
            <div className="text-sm font-semibold text-gray-700 mb-3">权限说明</div>
            <div className="space-y-2 text-xs">
              {[
                { label: '简易气象查询', status: '免费', color: 'text-green-600' },
                { label: '专业气象查询', status: '按点数', color: 'text-blue-600' },
                { label: 'API 数据接口', status: '按点数', color: 'text-blue-600' },
                { label: '极端天气预警', status: '已授权', color: 'text-green-600' },
                { label: '预警推送 API', status: '已授权', color: 'text-green-600' },
                { label: '数据推送', status: '按点数', color: 'text-blue-600' },
              ].map(({ label, status, color }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600">{label}</span>
                  <span className={`font-medium ${color}`}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
