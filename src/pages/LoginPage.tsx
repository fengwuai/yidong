import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Wind, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const login = useAuthStore((s) => s.login)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      const success = login(username, password)
      setLoading(false)
      if (success) {
        navigate(from, { replace: true })
      } else {
        setError('请输入账号和密码')
      }
    }, 400)
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white" style={{ background: '#001529' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Wind size={20} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-lg">AI气象预测</div>
            <div className="text-white/50 text-sm">数据中心与可视化平台</div>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold leading-snug mb-4">
            AI气象预测数据中心<br />与可视化平台
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-md">
            集成气象数据存储、查询、预警推送与可视化分析，为企业提供等保三级合规的气象数据服务。
          </p>
        </div>

        <div className="flex items-center gap-2 text-white/40 text-xs">
          <Shield size={14} />
          <span>等保三级 · 数据加密传输 · 操作审计</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Wind size={18} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">AI气象预测</div>
              <div className="text-gray-400 text-xs">数据中心与可视化平台</div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">登录账户</h2>
            <p className="text-sm text-gray-500 mb-6">请输入您的账号和密码以访问平台</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label" htmlFor="username">账号</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  placeholder="请输入账号"
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div>
                <label className="form-label" htmlFor="password">密码</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pr-10"
                    placeholder="请输入密码"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5 disabled:opacity-60"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </form>

            <div className="mt-5 p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700">
              <Shield size={12} className="inline mr-1" />
              演示账号：<span className="font-mono font-medium">admin</span> / <span className="font-mono font-medium">admin123</span>
              <span className="text-blue-500 ml-1">（任意非空账号密码均可登录）</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
