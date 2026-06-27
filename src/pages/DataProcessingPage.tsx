import { useState } from 'react'
import { RefreshCw, CheckCircle2, AlertCircle, Upload, ArrowRightLeft, Filter } from 'lucide-react'
import Header from '../components/Layout/Header'
import { MOCK_INGESTION_PIPELINES, MOCK_CLEANING_STATS } from '../data/mockData'

export default function DataProcessingPage() {
  const [processing, setProcessing] = useState(false)
  const stats = MOCK_CLEANING_STATS

  const handleRunCleaning = async () => {
    setProcessing(true)
    await new Promise(r => setTimeout(r, 2000))
    setProcessing(false)
  }

  return (
    <div>
      <Header title="数据接入与处理" subtitle="多源数据标准化接入、清洗加工与时空索引构建" />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '缺失值处理', value: stats.missingHandled.toLocaleString(), unit: '条/今日' },
          { label: '异常值修正', value: stats.anomalyFixed.toLocaleString(), unit: '条/今日' },
          { label: '数据准确率', value: stats.accuracy, unit: '清洗后' },
          { label: '预警去重率', value: stats.warningDedup, unit: '重复预警' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="card py-3">
            <div className="text-xl font-bold text-gray-800">{value}</div>
            <div className="text-xs text-gray-600 mt-0.5">{label}</div>
            <div className="text-xs text-gray-400">{unit}</div>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-sm text-gray-700">数据接入管道</span>
          <span className="text-xs text-gray-400">接入延迟 ≤5min（实时）· 预警 ≤1min</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">管道名称</th>
                <th className="table-header">接入方式</th>
                <th className="table-header">数据格式</th>
                <th className="table-header">同步模式</th>
                <th className="table-header">接入延迟</th>
                <th className="table-header">今日处理量</th>
                <th className="table-header">成功率</th>
                <th className="table-header">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_INGESTION_PIPELINES.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium text-gray-800">{p.name}</td>
                  <td className="table-cell"><span className="tag-blue">{p.source}</span></td>
                  <td className="table-cell font-mono text-xs">{p.format}</td>
                  <td className="table-cell text-xs">{p.mode} · {p.interval}</td>
                  <td className="table-cell font-mono text-xs text-green-600">{p.latency}</td>
                  <td className="table-cell">{p.todayCount.toLocaleString()}</td>
                  <td className="table-cell text-green-600 font-medium text-xs">{p.successRate}</td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${p.status === 'running' ? 'text-green-600' : 'text-gray-400'}`}>
                      {p.status === 'running' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                      {p.status === 'running' ? '运行中' : '空闲'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6 card">
          <h3 className="font-semibold text-sm text-gray-700 mb-4">数据清洗能力</h3>
          <div className="space-y-3">
            {[
              { title: '缺失值处理', desc: '插值法、均值替换，处理后准确率 ≥99.5%', status: '自动运行' },
              { title: '异常值识别', desc: '基于统计阈值与物理约束自动识别修正', status: '自动运行' },
              { title: '预警数据清洗', desc: '缺失字段补全、异常等级修正、无效预警过滤，准确率 ≥99.8%', status: '自动运行' },
              { title: '重复预警去重', desc: '100% 去重率，状态更新延迟 ≤30秒', status: '自动运行' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Filter size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                </div>
                <span className="tag-green text-xs">{item.status}</span>
              </div>
            ))}
          </div>
          <button onClick={handleRunCleaning} disabled={processing} className="btn-primary w-full justify-center mt-4 disabled:opacity-60">
            {processing ? <><RefreshCw size={14} className="animate-spin" />清洗任务执行中...</> : '手动触发清洗任务'}
          </button>
        </div>

        <div className="col-span-6 card">
          <h3 className="font-semibold text-sm text-gray-700 mb-4">数据加工能力</h3>
          <div className="space-y-3">
            {[
              { title: '格式转换', desc: 'NetCDF ↔ CSV ↔ GRIB2 ↔ JSON/XML，字段映射与完整性校验', icon: ArrowRightLeft },
              { title: '分辨率调整', desc: '0.25° → 0.1° 全球分辨率，3km 区域高精度，加工延迟 ≤1h', icon: RefreshCw },
              { title: '时空聚合', desc: '分钟级 → 小时级 → 日级，区域裁剪（矩形/行政/路径）', icon: Filter },
              { title: '预警数据加工', desc: '等级标准化、影响范围空间映射、文本标准化，单条 ≤100ms', icon: Upload },
            ].map(({ title, desc, icon: Icon }) => (
              <div key={title} className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl">
                <Icon size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-800">{title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div className="text-xs font-semibold text-blue-700 mb-2">时空索引</div>
            <div className="text-xs text-blue-600 space-y-1">
              <div>· 时间精度：分钟级 · 经纬度精度：≤0.01°</div>
              <div>· 索引更新延迟：≤10min（气象）· ≤30s（预警）</div>
              <div>· 单条预警查询响应：≤300ms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
