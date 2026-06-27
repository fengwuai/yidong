import { HardDrive, Database, Archive, Zap, CheckCircle2 } from 'lucide-react'
import Header from '../components/Layout/Header'
import { MOCK_DATASETS, DASHBOARD_STATS } from '../data/mockData'
import { DATA_LIFECYCLE_CONFIG } from '../data/constants'

const TIER_STYLE = {
  hot: { label: '热数据', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  warm: { label: '温数据', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  cold: { label: '冷数据', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
}

export default function DataStoragePage() {
  const stats = DASHBOARD_STATS

  return (
    <div>
      <Header title="数据存储管理" subtitle="PB 级数据长期存储、冷热分层与生命周期管理" />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '总存储容量', value: stats.totalStorage, icon: HardDrive },
          { label: '时空记录总数', value: stats.totalRecords, icon: Database },
          { label: '无损压缩比', value: '3.2:1', icon: Archive },
          { label: '数据完整性', value: '99.95%', icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
              <Icon size={20} className="text-blue-400 opacity-60" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {DATA_LIFECYCLE_CONFIG.map(d => {
          const style = TIER_STYLE[d.tier as keyof typeof TIER_STYLE]
          return (
            <div key={d.tier} className={`card border ${style.border} ${style.bg}`}>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={15} className={style.color} />
                <span className={`font-semibold text-sm ${style.color}`}>{d.label}</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1.5">
                <div className="flex justify-between"><span>存储介质</span><span className="font-medium">{d.storage}</span></div>
                <div className="flex justify-between"><span>查询响应</span><span className="font-medium">{d.response}</span></div>
                <div className="flex justify-between"><span>当前容量</span><span className="font-medium">{d.size}</span></div>
                <div className="flex justify-between"><span>占比</span><span className="font-medium">{d.ratio}%</span></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">{d.desc}</p>
            </div>
          )
        })}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-sm text-gray-700">数据集列表</span>
          <span className="text-xs text-gray-400">单数据集 ≥100TB · 支持 PB 级扩容</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">数据集名称</th>
                <th className="table-header">存储层级</th>
                <th className="table-header">格式</th>
                <th className="table-header">容量</th>
                <th className="table-header">记录数</th>
                <th className="table-header">压缩比</th>
                <th className="table-header">完整性</th>
                <th className="table-header">最后访问</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_DATASETS.map(ds => {
                const style = TIER_STYLE[ds.tier as keyof typeof TIER_STYLE]
                return (
                  <tr key={ds.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium text-gray-800">{ds.name}</td>
                    <td className="table-cell"><span className={`tag ${style.bg} ${style.color}`}>{style.label}</span></td>
                    <td className="table-cell font-mono text-xs">{ds.format}</td>
                    <td className="table-cell font-medium">{ds.size}</td>
                    <td className="table-cell text-xs">{ds.records}</td>
                    <td className="table-cell text-xs text-green-600 font-medium">{ds.compression}</td>
                    <td className="table-cell text-xs">{ds.integrity}</td>
                    <td className="table-cell font-mono text-xs text-gray-500">{ds.lastAccess}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="card">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">支持的数据类型</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {['10米风/2米温度/降水量', '大气层位势/比湿/垂直速度', '植被覆盖/土壤类型', '运输路径/港口位置', '粮食产区地理数据', '极端天气预警数据'].map(t => (
              <div key={t} className="p-2 bg-gray-50 rounded-lg text-gray-600">{t}</div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">生命周期策略</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg"><span className="w-2 h-2 rounded-full bg-red-400"></span>近1年高频数据 + 实时预警 → 热存储（毫秒级）</div>
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg"><span className="w-2 h-2 rounded-full bg-orange-400"></span>1-3年数据 + 预警历史 → 温存储（秒级）</div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"><span className="w-2 h-2 rounded-full bg-blue-400"></span>3年以上归档 → 冷存储（按需检索）</div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-gray-400">支持自动迁移、压缩与重编码 · 压缩比 ≥3:1</div>
          </div>
        </div>
      </div>
    </div>
  )
}
