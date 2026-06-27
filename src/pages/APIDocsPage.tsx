import { useState } from 'react'
import { Copy, Check, Terminal, Key, Globe, BookOpen, ChevronDown, ChevronRight } from 'lucide-react'
import Header from '../components/Layout/Header'
import { useWeatherStore } from '../store/weatherStore'

function CodeBlock({ code, lang = 'python' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-gray-400 text-xs font-mono ml-1">{lang}</span>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs transition-colors">
          {copied ? <><Check size={12} className="text-green-400" /><span className="text-green-400">已复制</span></> : <><Copy size={12} />复制</>}
        </button>
      </div>
      <pre className="bg-gray-950 text-gray-100 p-4 overflow-x-auto text-xs font-mono leading-relaxed custom-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card overflow-hidden p-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left">
        <span className="font-semibold text-gray-800">{title}</span>
        {open ? <ChevronDown size={15} className="text-gray-400" /> : <ChevronRight size={15} className="text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  )
}

function ParamTable({ params }: { params: Array<{ name: string; type: string; desc: string; required?: boolean }> }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-2.5 text-left font-semibold text-gray-600">参数名</th>
            <th className="px-4 py-2.5 text-left font-semibold text-gray-600">类型</th>
            <th className="px-4 py-2.5 text-left font-semibold text-gray-600">说明</th>
            <th className="px-4 py-2.5 text-left font-semibold text-gray-600">必填</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {params.map(p => (
            <tr key={p.name} className="hover:bg-gray-50">
              <td className="px-4 py-2.5 font-mono text-blue-700 font-medium">{p.name}</td>
              <td className="px-4 py-2.5 font-mono text-purple-600">{p.type}</td>
              <td className="px-4 py-2.5 text-gray-600">{p.desc}</td>
              <td className="px-4 py-2.5">
                {p.required !== false ? <span className="tag-red">必填</span> : <span className="tag-gray">可选</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const POINT_QUERY_CODE = `import requests

url = 'https://api.weather-data.com/data_server/point'

headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
}

data = {
    'lon': 118.7834,
    'lat': 32.0256,
    'vars': ["u10", "v10"],
    'time': '2026-04-02 06:00:00',
    'model': 'ghr_9km'
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`

const HISTORY_QUERY_CODE = `import requests

url = 'https://api.weather-data.com/data_server/export_history_task/list'

headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
}

params = {
    "is_push_gen": "false",
    "page": 1
}

response = requests.get(url, params=params, headers=headers)

print("状态码:", response.status_code)
print("返回结果:", response.json())

# download_url 字段可直接在浏览器打开下载数据`

const RESPONSE_EXAMPLE = `{
  "code": 200,
  "message": "success",
  "data": {
    "location": {
      "lon": 118.7834,
      "lat": 32.0256
    },
    "model": "ghr_9km",
    "forecast_time": "2026-04-02 06:00:00",
    "variables": ["u10", "v10"],
    "timestamps": [
      "2026-04-02 06:00:00",
      "2026-04-02 07:00:00",
      ...
    ],
    "data": {
      "u10": [-1.234, -0.987, ...],
      "v10": [2.456, 2.789, ...]
    }
  }
}`

const WARNING_QUERY_CODE = `import requests

url = 'https://api.weather-data.com/data_server/warning/query'

headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
}

params = {
    'type': 'rainstorm',
    'level': 'orange',
    'status': 'active',
    'region': '江苏省',
    'start_time': '2026-06-01 00:00:00',
    'end_time': '2026-06-13 23:59:59',
    'page': 1,
    'page_size': 10
}

response = requests.get(url, headers=headers, params=params)
print(response.json())`

const WARNING_PUSH_CODE = `import requests
import hmac, hashlib, time

url = 'https://api.weather-data.com/data_server/warning/push'

timestamp = str(int(time.time()))
signature = hmac.new(
    b'YOUR_API_SECRET',
    timestamp.encode(),
    hashlib.sha256
).hexdigest()

headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'X-Timestamp': timestamp,
    'X-Signature': signature
}

data = {
    'warning_id': 'warn_001',
    'channels': ['platform', 'sms', 'api_callback'],
    'recipients': ['logistics_group', 'emergency_team'],
    'force_push': True
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`

const WARNING_RESPONSE = `{
  "code": 200,
  "data": {
    "total": 4,
    "list": [
      {
        "warning_id": "warn_001",
        "type": "rainstorm",
        "level": "orange",
        "title": "江苏省南部暴雨橙色预警",
        "publisher": "江苏省气象台",
        "publish_time": "2026-06-13 14:30:00",
        "valid_until": "2026-06-14 14:30:00",
        "status": "active",
        "regions": ["南京市", "苏州市"],
        "bounds": { "min_lon": 118.5, "max_lon": 121.2, "min_lat": 30.8, "max_lat": 32.5 },
        "related_elements": ["tp6h", "ws10"]
      }
    ]
  }
}`

const HISTORY_RESPONSE = `{
  "code": 200,
  "data": {
    "total": 24,
    "page": 1,
    "page_size": 20,
    "list": [
      {
        "task_id": "task_001",
        "template_name": "江苏区域风速监测",
        "status": "completed",
        "created_at": "2026-06-13 06:02:31",
        "completed_at": "2026-06-13 06:08:14",
        "data_size": "45.2 MB",
        "download_url": "https://cdn.weather-data.com/exports/task_001.nc"
      }
    ]
  }
}`

const ALL_VARIABLES_TABLE = [
  { key: 'u10', unit: 'm/s', desc: '10米高度U风速（东西分量）' },
  { key: 'v10', unit: 'm/s', desc: '10米高度V风速（南北分量）' },
  { key: 'u100', unit: 'm/s', desc: '100米高度U风速' },
  { key: 'v100', unit: 'm/s', desc: '100米高度V风速' },
  { key: 'ws10', unit: 'm/s', desc: '10m风速（基于u/v计算）' },
  { key: 'ws100', unit: 'm/s', desc: '100m风速（基于u/v计算）' },
  { key: 'wd10', unit: '°', desc: '10m风向（0°为北风，顺时针）' },
  { key: 'wd100', unit: '°', desc: '100m风向（0°为北风，顺时针）' },
  { key: 't2m', unit: 'K', desc: '2米高度气温' },
  { key: 'tcc', unit: '%', desc: '总云量（0无云，1完全覆盖）' },
  { key: 'tp6h', unit: 'mm', desc: '6小时累计降水量' },
  { key: 'ssr6h', unit: 'J/m²', desc: '6小时地表太阳短波辐射' },
  { key: 'ssr1h', unit: 'J/m²', desc: '1小时地表太阳短波辐射' },
  { key: 'sp', unit: 'Pa', desc: '地面气压' },
  { key: 'msl', unit: 'Pa', desc: '海平面气压' },
  { key: 'q[xxx]hpa', unit: 'kg/kg', desc: '比湿（如 q850hpa）' },
  { key: 'u[xxx]hpa', unit: 'm/s', desc: 'U风速气压层（如 u500hpa）' },
  { key: 'v[xxx]hpa', unit: 'm/s', desc: 'V风速气压层（如 v300hpa）' },
  { key: 't[xxx]hpa', unit: 'K', desc: '气温气压层（如 t850hpa）' },
  { key: 'z[xxx]hpa', unit: 'm²/s²', desc: '位势高度（如 z500hpa）' },
  { key: 'w[xxx]hpa', unit: 'Pa/s', desc: '垂直速度（如 w700hpa）' },
  { key: 'ws[xxx]hpa', unit: 'm/s', desc: '气压层风速（如 ws500hpa）' },
  { key: 'wd[xxx]hpa', unit: '°', desc: '气压层风向（如 wd500hpa）' },
]

export default function APIDocsPage() {
  const { userToken } = useWeatherStore()

  const displayToken = userToken.length > 20 ? userToken.slice(0, 20) + '...' : userToken

  return (
    <div>
      <Header
        title="API 文档"
        subtitle="OpenAPI 3.0 规范 · 气象数据与极端天气预警接口"
      />

      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Globe, title: 'API 域名', value: 'api.weather-data.com', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Key, title: '当前 Token', value: displayToken, color: 'text-green-600', bg: 'bg-green-50' },
            { icon: Terminal, title: '模型', value: 'ghr_9km', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ icon: Icon, title, value, color, bg }) => (
            <div key={title} className={`card py-4 ${bg}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                  <Icon size={16} className={color} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">{title}</div>
                  <div className={`text-sm font-semibold font-mono ${color} mt-0.5`}>{value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Section title="认证说明">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">所有 API 请求需在 HTTP Header 中携带 Bearer Token 进行身份验证。Token 可在用户详情页查看。</p>
            <CodeBlock lang="http" code={`Authorization: Bearer ${userToken}`} />
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-amber-700">
              <Key size={13} className="flex-shrink-0 mt-0.5" />
              请勿将 Token 提交至版本控制系统，建议通过环境变量注入。
            </div>
          </div>
        </Section>

        <Section title="接口一：单点气象查询">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg font-mono">POST</span>
              <code className="text-sm font-mono text-gray-700">https://api.weather-data.com/data_server/point</code>
            </div>
            <p className="text-sm text-gray-600">查询给定经纬度坐标、指定时间的单点气象数据，支持多变量同时查询。</p>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">请求参数</h4>
              <ParamTable params={[
                { name: 'lon', type: 'float', desc: '经度（72°-137°E）' },
                { name: 'lat', type: 'float', desc: '纬度（17°-55°N）' },
                { name: 'vars', type: 'JsonArray', desc: '气象变量列表，如 ["u10", "v10"]' },
                { name: 'time', type: 'String', desc: 'UTC 起报时间，格式：yyyy-MM-dd HH:mm:ss，每天 00/06/12/18 时' },
                { name: 'model', type: 'String', desc: '气象模型，默认 ghr_9km', required: false },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Python 示例</h4>
              <CodeBlock code={POINT_QUERY_CODE} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">返回示例</h4>
              <CodeBlock lang="json" code={RESPONSE_EXAMPLE} />
            </div>
          </div>
        </Section>

        <Section title="接口二：历史任务查询">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg font-mono">GET</span>
              <code className="text-sm font-mono text-gray-700">https://api.weather-data.com/data_server/export_history_task/list</code>
            </div>
            <p className="text-sm text-gray-600">查询所有数据推送任务的历史记录，返回任务状态及下载链接。</p>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">请求参数（Query String）</h4>
              <ParamTable params={[
                { name: 'is_push_gen', type: 'Boolean', desc: '是否仅查询定时推送任务（false 查询全部）', required: false },
                { name: 'page', type: 'Integer', desc: '分页页码，从 1 开始', required: false },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Python 示例</h4>
              <CodeBlock code={HISTORY_QUERY_CODE} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">返回示例</h4>
              <CodeBlock lang="json" code={HISTORY_RESPONSE} />
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700">
              <BookOpen size={12} className="inline mr-1" />
              返回结果中的 <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">download_url</code> 字段可直接在浏览器中打开或通过 requests.get() 下载数据文件。
            </div>
          </div>
        </Section>

        <Section title="接口三：极端天气预警查询">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg font-mono">GET</span>
              <code className="text-sm font-mono text-gray-700">https://api.weather-data.com/data_server/warning/query</code>
            </div>
            <p className="text-sm text-gray-600">支持实时预警查询、历史预警溯源，按预警类型、等级、区域、时间范围等多条件组合检索。单次查询 ≤10 条响应时间 ≤500ms。</p>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">请求参数</h4>
              <ParamTable params={[
                { name: 'type', type: 'String', desc: '预警类型：typhoon/rainstorm/gale/heatwave 等', required: false },
                { name: 'level', type: 'String', desc: '预警等级：red/orange/yellow/blue', required: false },
                { name: 'status', type: 'String', desc: '状态：active/released/expired', required: false },
                { name: 'region', type: 'String', desc: '影响区域（省/市名称）', required: false },
                { name: 'start_time', type: 'String', desc: '起始时间', required: false },
                { name: 'end_time', type: 'String', desc: '结束时间', required: false },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Python 示例</h4>
              <CodeBlock code={WARNING_QUERY_CODE} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">返回示例</h4>
              <CodeBlock lang="json" code={WARNING_RESPONSE} />
            </div>
          </div>
        </Section>

        <Section title="接口四：预警推送">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg font-mono">POST</span>
              <code className="text-sm font-mono text-gray-700">https://api.weather-data.com/data_server/warning/push</code>
            </div>
            <p className="text-sm text-gray-600">触发预警多渠道推送，支持平台内消息、短信、邮件、企业微信/钉钉、API 回调。推送 API 支持额外签名校验，限流阈值可单独配置（最低 100 次/秒）。</p>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">请求参数</h4>
              <ParamTable params={[
                { name: 'warning_id', type: 'String', desc: '预警 ID' },
                { name: 'channels', type: 'JsonArray', desc: '推送渠道：platform/sms/email/wechat/dingtalk/api_callback' },
                { name: 'recipients', type: 'JsonArray', desc: '接收方标识列表' },
                { name: 'force_push', type: 'Boolean', desc: '紧急预警强制推送（忽略时间段限制）', required: false },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Python 示例（含签名校验）</h4>
              <CodeBlock code={WARNING_PUSH_CODE} />
            </div>
          </div>
        </Section>

        <Section title="接口规范说明" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: '接口规范', value: 'OpenAPI 3.0 / RESTful' },
              { label: '鉴权方式', value: 'API 密钥 / OAuth 2.0 / IP 白名单' },
              { label: '默认限流', value: '100 次/秒（按用户/接口）' },
              { label: '预警推送限流', value: '≥100 次/秒（可单独配置）' },
              { label: '日志留存', value: '≥1 年，支持请求 ID 链路追踪' },
              { label: '数据传输', value: 'HTTPS 加密（TLS 1.2+）' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="技术参数说明" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: '模型', value: 'ghr_9km' },
              { label: '空间分辨率', value: '全球 9km' },
              { label: '经度覆盖', value: '72°-137°E（中国全境及周边）' },
              { label: '纬度覆盖', value: '17°-55°N' },
              { label: '时间分辨率', value: '逐小时预报' },
              { label: '预报时长', value: '11天（264小时）' },
              { label: '起报频次', value: '每天4次（UTC 00/06/12/18时）' },
              { label: '数据格式', value: 'NetCDF / CSV / JSON' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="气象变量一览" defaultOpen={false}>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2.5 text-left font-semibold text-gray-600">变量名</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-gray-600">单位</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-gray-600">说明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ALL_VARIABLES_TABLE.map(v => (
                  <tr key={v.key} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono text-blue-700 font-medium">{v.key}</td>
                    <td className="px-4 py-2.5 font-mono text-purple-600">{v.unit}</td>
                    <td className="px-4 py-2.5 text-gray-600">{v.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            带 [xxx] 的变量支持气压层：1000 / 925 / 850 / 700 / 600 / 500 / 400 / 300 / 250 / 200 / 150 / 100 / 50 hPa
          </p>
        </Section>
      </div>
    </div>
  )
}
