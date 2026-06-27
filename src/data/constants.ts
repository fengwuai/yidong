import type { WeatherVariable, PressureLevel, CityOption, ProvinceOption } from '../types/weather'

export const PRESSURE_LEVELS: PressureLevel[] = [1000, 925, 850, 700, 600, 500, 400, 300, 250, 200, 150, 100, 50]

export const WEATHER_VARIABLES: WeatherVariable[] = [
  { key: 'u10', label: '10m U风速', unit: 'm/s', category: 'wind' },
  { key: 'v10', label: '10m V风速', unit: 'm/s', category: 'wind' },
  { key: 'u100', label: '100m U风速', unit: 'm/s', category: 'wind' },
  { key: 'v100', label: '100m V风速', unit: 'm/s', category: 'wind' },
  { key: 'ws10', label: '10m风速', unit: 'm/s', category: 'derived' },
  { key: 'ws100', label: '100m风速', unit: 'm/s', category: 'derived' },
  { key: 'wd10', label: '10m风向', unit: '°', category: 'derived' },
  { key: 'wd100', label: '100m风向', unit: '°', category: 'derived' },
  { key: 't2m', label: '2m气温', unit: 'K', category: 'temperature' },
  { key: 'tcc', label: '总云量', unit: '%', category: 'surface' },
  { key: 'tp6h', label: '6h累计降水', unit: 'mm', category: 'surface' },
  { key: 'ssr6h', label: '6h太阳短波辐射', unit: 'J/m²', category: 'surface' },
  { key: 'ssr1h', label: '1h太阳短波辐射', unit: 'J/m²', category: 'surface' },
  { key: 'sp', label: '地面气压', unit: 'Pa', category: 'surface' },
  { key: 'msl', label: '海平面气压', unit: 'Pa', category: 'surface' },
]

export const PRESSURE_VARIABLES = ['u', 'v', 'w', 'ws', 'wd', 't', 'q', 'z']

export const PRESSURE_VARIABLE_LABELS: Record<string, string> = {
  u: 'U风速',
  v: 'V风速',
  w: '垂直速度',
  ws: '风速',
  wd: '风向',
  t: '气温',
  q: '比湿',
  z: '位势高度',
}

export const PRESSURE_VARIABLE_UNITS: Record<string, string> = {
  u: 'm/s',
  v: 'm/s',
  w: 'Pa/s',
  ws: 'm/s',
  wd: '°',
  t: 'K',
  q: 'kg/kg',
  z: 'm²/s²',
}

export const VARIABLE_CATEGORIES = [
  { key: 'surface', label: '地表参数' },
  { key: 'wind', label: '风场' },
  { key: 'temperature', label: '温度' },
  { key: 'humidity', label: '比湿' },
  { key: 'geopotential', label: '位势' },
  { key: 'derived', label: '衍生变量' },
]

export const PRESET_CITIES: CityOption[] = [
  { label: '北京', value: 'beijing', lon: 116.4074, lat: 39.9042, province: '北京市' },
  { label: '上海', value: 'shanghai', lon: 121.4737, lat: 31.2304, province: '上海市', hasCoastline: true },
  { label: '广州', value: 'guangzhou', lon: 113.2644, lat: 23.1291, province: '广东省', hasCoastline: true },
  { label: '深圳', value: 'shenzhen', lon: 114.0579, lat: 22.5431, province: '广东省', hasCoastline: true },
  { label: '成都', value: 'chengdu', lon: 104.0665, lat: 30.5728, province: '四川省' },
  { label: '武汉', value: 'wuhan', lon: 114.3054, lat: 30.5928, province: '湖北省' },
  { label: '西安', value: 'xian', lon: 108.9398, lat: 34.3416, province: '陕西省' },
  { label: '南京', value: 'nanjing', lon: 118.7969, lat: 32.0603, province: '江苏省', hasCoastline: false },
  { label: '杭州', value: 'hangzhou', lon: 120.1551, lat: 30.2741, province: '浙江省', hasCoastline: true },
  { label: '郑州', value: 'zhengzhou', lon: 113.6254, lat: 34.7466, province: '河南省' },
  { label: '长沙', value: 'changsha', lon: 112.9388, lat: 28.2278, province: '湖南省' },
  { label: '重庆', value: 'chongqing', lon: 106.5516, lat: 29.5630, province: '重庆市' },
  { label: '天津', value: 'tianjin', lon: 117.3616, lat: 39.3434, province: '天津市', hasCoastline: true },
  { label: '沈阳', value: 'shenyang', lon: 123.4291, lat: 41.7968, province: '辽宁省', hasCoastline: true },
  { label: '哈尔滨', value: 'harbin', lon: 126.6423, lat: 45.7569, province: '黑龙江省' },
  { label: '乌鲁木齐', value: 'urumqi', lon: 87.6168, lat: 43.8256, province: '新疆维吾尔自治区' },
]

export const PROVINCES: ProvinceOption[] = [
  {
    label: '江苏省', value: 'jiangsu', hasCoastline: true,
    bounds: [116.18, 30.75, 121.95, 35.13],
    cities: [
      { label: '南京市', value: 'nanjing', lon: 118.7969, lat: 32.0603 },
      { label: '苏州市', value: 'suzhou', lon: 120.5853, lat: 31.2990, hasCoastline: true },
      { label: '无锡市', value: 'wuxi', lon: 120.3119, lat: 31.4912, hasCoastline: true },
      { label: '常州市', value: 'changzhou', lon: 119.9741, lat: 31.8112 },
      { label: '南通市', value: 'nantong', lon: 120.8942, lat: 31.9813, hasCoastline: true },
      { label: '扬州市', value: 'yangzhou', lon: 119.4127, lat: 32.3947 },
      { label: '徐州市', value: 'xuzhou', lon: 117.1854, lat: 34.2614 },
      { label: '盐城市', value: 'yancheng', lon: 120.1636, lat: 33.3479, hasCoastline: true },
      { label: '连云港市', value: 'lianyungang', lon: 119.1589, lat: 34.5975, hasCoastline: true },
    ]
  },
  {
    label: '浙江省', value: 'zhejiang', hasCoastline: true,
    bounds: [118.01, 27.12, 122.95, 31.18],
    cities: [
      { label: '杭州市', value: 'hangzhou', lon: 120.1551, lat: 30.2741, hasCoastline: true },
      { label: '宁波市', value: 'ningbo', lon: 121.5440, lat: 29.8683, hasCoastline: true },
      { label: '温州市', value: 'wenzhou', lon: 120.6720, lat: 28.0000, hasCoastline: true },
      { label: '嘉兴市', value: 'jiaxing', lon: 120.7550, lat: 30.7522, hasCoastline: true },
      { label: '绍兴市', value: 'shaoxing', lon: 120.5800, lat: 30.0280 },
    ]
  },
  {
    label: '广东省', value: 'guangdong', hasCoastline: true,
    bounds: [109.67, 20.22, 117.31, 25.52],
    cities: [
      { label: '广州市', value: 'guangzhou', lon: 113.2644, lat: 23.1291, hasCoastline: true },
      { label: '深圳市', value: 'shenzhen', lon: 114.0579, lat: 22.5431, hasCoastline: true },
      { label: '珠海市', value: 'zhuhai', lon: 113.5767, lat: 22.2710, hasCoastline: true },
      { label: '佛山市', value: 'foshan', lon: 113.1220, lat: 23.0219 },
      { label: '东莞市', value: 'dongguan', lon: 113.7518, lat: 23.0207, hasCoastline: true },
    ]
  },
  {
    label: '山东省', value: 'shandong', hasCoastline: true,
    bounds: [114.81, 34.38, 122.71, 38.40],
    cities: [
      { label: '济南市', value: 'jinan', lon: 116.9998, lat: 36.6510 },
      { label: '青岛市', value: 'qingdao', lon: 120.3826, lat: 36.0671, hasCoastline: true },
      { label: '烟台市', value: 'yantai', lon: 121.4479, lat: 37.4638, hasCoastline: true },
      { label: '威海市', value: 'weihai', lon: 122.1194, lat: 37.5130, hasCoastline: true },
    ]
  },
  {
    label: '四川省', value: 'sichuan',
    bounds: [97.35, 26.05, 108.55, 34.31],
    cities: [
      { label: '成都市', value: 'chengdu', lon: 104.0665, lat: 30.5728 },
      { label: '绵阳市', value: 'mianyang', lon: 104.6796, lat: 31.4677 },
      { label: '德阳市', value: 'deyang', lon: 104.3983, lat: 31.1272 },
    ]
  },
  {
    label: '河南省', value: 'henan',
    bounds: [110.36, 31.38, 116.65, 36.37],
    cities: [
      { label: '郑州市', value: 'zhengzhou', lon: 113.6254, lat: 34.7466 },
      { label: '洛阳市', value: 'luoyang', lon: 112.4539, lat: 34.6199 },
      { label: '开封市', value: 'kaifeng', lon: 114.3413, lat: 34.7979 },
    ]
  },
]

export const CHART_COLORS = [
  '#1677ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2',
]

export const CHART_VARIABLE_CONFIG: Record<string, { color: string; label: string; unit: string }> = {
  temperature: { color: '#fa8c16', label: '温度', unit: '℃' },
  radiation: { color: '#fadb14', label: '辐射', unit: 'MJ/m²' },
  ws10: { color: '#1677ff', label: '10m风速', unit: 'm/s' },
  ws100: { color: '#52c41a', label: '100m风速', unit: 'm/s' },
  precipitation: { color: '#13c2c2', label: '降水', unit: 'mm' },
  windDirection: { color: '#722ed1', label: '风向', unit: '°' },
}

export const WARNING_LEVEL_CONFIG = {
  red: { label: '一级（红色）', color: '#ff4d4f', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  orange: { label: '二级（橙色）', color: '#fa8c16', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  yellow: { label: '三级（黄色）', color: '#fadb14', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  blue: { label: '四级（蓝色）', color: '#1677ff', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
}

export const WARNING_TYPE_LABELS: Record<string, string> = {
  typhoon: '台风',
  rainstorm: '暴雨',
  gale: '大风',
  heatwave: '高温',
  coldwave: '寒潮',
  fog: '大雾',
  hail: '冰雹',
  lightning: '雷电',
}

export const PUSH_CHANNEL_LABELS: Record<string, string> = {
  platform: '平台内消息',
  sms: '短信',
  email: '邮件',
  wechat: '企业微信',
  dingtalk: '钉钉机器人',
  api_callback: 'API 回调',
}

export const USER_ROLE_LABELS: Record<string, string> = {
  super_admin: '超级管理员',
  operator: '运维员',
  user: '普通用户',
  readonly: '只读访客',
}

export const DATA_LIFECYCLE_CONFIG = [
  { tier: 'hot', label: '热数据', desc: '近1年高频访问 + 实时预警', storage: '高性能存储', response: '毫秒级', size: '128 TB', ratio: 12 },
  { tier: 'warm', label: '温数据', desc: '1-3年中频访问 + 近3年预警历史', storage: '均衡存储', response: '秒级', size: '456 TB', ratio: 43 },
  { tier: 'cold', label: '冷数据', desc: '3年以上归档数据', storage: '低成本存储', response: '按需检索', size: '482 TB', ratio: 45 },
]
