import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Search, BarChart2, Database, History, Code2, Settings,
  AlertTriangle, Shield, Bell, GitBranch, Wind, ChevronRight,
  HardDrive, RefreshCw, Grid3x3, Truck,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const navGroups = [
  {
    label: '数据中心',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: '运行概览' },
      { to: '/data-storage', icon: HardDrive, label: '数据存储管理' },
      { to: '/data-processing', icon: RefreshCw, label: '数据接入与处理' },
    ],
  },
  {
    label: '数据查询',
    items: [
      { to: '/simple-query', icon: Search, label: '简易气象查询' },
      { to: '/professional-query', icon: BarChart2, label: '专业气象查询' },
      { to: '/batch-query', icon: Grid3x3, label: '批量与区域查询' },
      { to: '/business-scenario', icon: Truck, label: '业务场景可视化' },
    ],
  },
  {
    label: '极端天气预警',
    items: [
      { to: '/extreme-warning', icon: AlertTriangle, label: '预警监控' },
      { to: '/warning-rules', icon: GitBranch, label: '预警规则配置' },
      { to: '/warning-push', icon: Bell, label: '预警推送管理' },
    ],
  },
  {
    label: '数据服务',
    items: [
      { to: '/data-push', icon: Database, label: '数据推送与导出' },
      { to: '/history', icon: History, label: '历史任务导出' },
      { to: '/api-docs', icon: Code2, label: 'API 文档' },
    ],
  },
  {
    label: '系统管理',
    items: [
      { to: '/settings', icon: Settings, label: '账户与安全' },
    ],
  },
]

export default function Sidebar() {
  const username = useAuthStore((s) => s.username)

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col" style={{ background: '#001529' }}>
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Wind size={18} className="text-white" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm leading-tight">AI气象预测</div>
          <div className="text-white/40 text-xs mt-0.5">数据中心与可视化平台</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        {navGroups.map(group => (
          <div key={group.label} className="mb-4">
            <div className="mb-1.5 px-3 text-white/30 text-xs font-medium uppercase tracking-wider">{group.label}</div>
            <nav className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to}>
                  {({ isActive }) => (
                    <div className={isActive ? 'sidebar-item-active' : 'sidebar-item'}>
                      <Icon size={15} className="flex-shrink-0" />
                      <span className="flex-1 text-sm">{label}</span>
                      {isActive && <ChevronRight size={12} className="opacity-60" />}
                    </div>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5">
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Shield size={12} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white/80 text-xs font-medium truncate">{username || '企业版账户'}</div>
            <div className="text-white/40 text-xs truncate">等保三级 · 已授权</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
