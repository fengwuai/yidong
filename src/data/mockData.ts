import { addHours, format, subDays } from 'date-fns'
import type { HourlyForecast, DataTemplate, HistoryTask, WeatherQueryResult, ProfessionalQueryResult } from '../types/weather'

function generateHourlyForecasts(startDate: Date, hours: number = 264): HourlyForecast[] {
  const forecasts: HourlyForecast[] = []
  for (let i = 0; i < hours; i++) {
    const time = addHours(startDate, i)
    const hour = time.getHours()
    const dayProgress = (hour / 24) * Math.PI * 2
    const baseTemp = 20 + 8 * Math.sin(dayProgress - Math.PI / 2)
    const solarFactor = Math.max(0, Math.sin((hour - 6) * Math.PI / 12))
    forecasts.push({
      time: format(time, 'MM-dd HH:mm'),
      temperature: +(baseTemp + (Math.random() - 0.5) * 3).toFixed(1),
      radiation: +(solarFactor * 25 + (Math.random() * 2)).toFixed(2),
      ws10: +(3 + Math.random() * 5 + Math.sin(i / 12) * 2).toFixed(2),
      ws100: +(6 + Math.random() * 8 + Math.sin(i / 12) * 3).toFixed(2),
      precipitation: Math.random() > 0.85 ? +(Math.random() * 3).toFixed(2) : 0,
      windDirection: Math.floor(Math.random() * 360),
    })
  }
  return forecasts
}

function generatePressureData(hours: number = 264): Record<string, number[]> {
  const data: Record<string, number[]> = {
    u10: [], v10: [], t2m: [], sp: [], msl: [], tcc: [], tp6h: [],
    u500hpa: [], v500hpa: [], t850hpa: [], z500hpa: [],
  }
  for (let i = 0; i < hours; i++) {
    data.u10.push(+(Math.random() * 10 - 5).toFixed(3))
    data.v10.push(+(Math.random() * 10 - 5).toFixed(3))
    data.t2m.push(+(288 + Math.random() * 20 - 10).toFixed(2))
    data.sp.push(+(101325 + (Math.random() - 0.5) * 2000).toFixed(0))
    data.msl.push(+(101325 + (Math.random() - 0.5) * 1500).toFixed(0))
    data.tcc.push(+(Math.random()).toFixed(3))
    data.tp6h.push(Math.random() > 0.8 ? +(Math.random() * 5).toFixed(2) : 0)
    data.u500hpa.push(+(Math.random() * 30 - 15).toFixed(3))
    data.v500hpa.push(+(Math.random() * 20 - 10).toFixed(3))
    data.t850hpa.push(+(275 + Math.random() * 15).toFixed(2))
    data.z500hpa.push(+(55000 + Math.random() * 2000).toFixed(0))
  }
  return data
}

export function generateMockWeatherResult(lon: number, lat: number, date: Date): WeatherQueryResult {
  return {
    location: { lon, lat },
    model: 'ghr_9km',
    forecastTime: format(date, 'yyyy-MM-dd HH:mm:ss'),
    data: generateHourlyForecasts(date),
  }
}

export function generateMockProfessionalResult(
  lon: number, lat: number, date: Date, variables: string[]
): ProfessionalQueryResult {
  const hours = 264
  const allData = generatePressureData(hours)
  const filteredData: Record<string, number[]> = {}
  variables.forEach(v => {
    if (allData[v]) filteredData[v] = allData[v]
    else filteredData[v] = Array.from({ length: hours }, () => +(Math.random() * 20 - 10).toFixed(3))
  })
  const timestamps = Array.from({ length: hours }, (_, i) =>
    format(addHours(date, i), 'MM-dd HH:mm')
  )
  return {
    location: { lon, lat },
    model: 'ghr_9km',
    forecastTime: format(date, 'yyyy-MM-dd HH:mm:ss'),
    variables,
    data: filteredData,
    timestamps,
  }
}

export const MOCK_TEMPLATES: DataTemplate[] = [
  {
    id: 'tpl_001',
    name: '江苏区域风速监测',
    model: 'ghr_9km',
    variables: ['u10', 'v10', 'ws10', 'ws100'],
    region: {
      mode: 'region',
      regions: ['江苏省'],
      boundaryExpand: 0.1,
      coastlineExpand: 0.05,
    },
    estimatedPoints: 1248,
    estimatedFileSize: '45.2 MB',
    pushStatus: 'enabled',
    hasBeenPushed: true,
    createdAt: '2026-05-10 09:00:00',
    updatedAt: '2026-06-12 06:00:00',
    pushSchedule: {
      forecastTimes: ['00z', '06z', '12z', '18z'],
      interval: '1h',
      dataFormat: 'NetCDF',
      spatialProcessing: 'none',
    },
  },
  {
    id: 'tpl_002',
    name: '华东区域温度辐射分析',
    model: 'ghr_9km',
    variables: ['t2m', 'ssr6h', 'tcc'],
    region: {
      mode: 'rectangle',
      rectangle: { minLon: 115.0, maxLon: 122.5, minLat: 28.5, maxLat: 35.5 },
    },
    estimatedPoints: 3840,
    estimatedFileSize: '128.6 MB',
    pushStatus: 'disabled',
    hasBeenPushed: true,
    createdAt: '2026-05-20 14:30:00',
    updatedAt: '2026-06-01 00:00:00',
    pushSchedule: {
      forecastTimes: ['00z', '12z'],
      interval: '1h',
      dataFormat: 'CSV',
      spatialProcessing: 'spatial_mean',
    },
  },
  {
    id: 'tpl_003',
    name: '风电场精细化预报',
    model: 'ghr_9km',
    variables: ['u10', 'v10', 'u100', 'v100', 'ws10', 'ws100', 'wd10', 'wd100'],
    region: {
      mode: 'coordinates',
      coordinates: [
        { lon: 121.48, lat: 31.23 },
        { lon: 120.16, lat: 30.27 },
        { lon: 119.41, lat: 32.39 },
        { lon: 118.80, lat: 32.06 },
      ],
    },
    estimatedPoints: 32,
    estimatedFileSize: '2.1 MB',
    pushStatus: 'enabled',
    hasBeenPushed: false,
    createdAt: '2026-06-08 10:15:00',
    updatedAt: '2026-06-08 10:15:00',
    pushSchedule: {
      forecastTimes: ['00z', '06z', '12z', '18z'],
      interval: '15min',
      dataFormat: 'CSV',
      spatialProcessing: 'none',
    },
  },
  {
    id: 'tpl_004',
    name: '全国高空风场分析',
    model: 'ghr_9km',
    variables: ['u500hpa', 'v500hpa', 'z500hpa', 't850hpa'],
    region: {
      mode: 'rectangle',
      rectangle: { minLon: 72.0, maxLon: 137.0, minLat: 17.0, maxLat: 55.0 },
    },
    estimatedPoints: 98560,
    estimatedFileSize: '2.4 GB',
    pushStatus: 'disabled',
    hasBeenPushed: true,
    createdAt: '2026-04-15 08:00:00',
    updatedAt: '2026-04-20 00:00:00',
  },
]

export const MOCK_HISTORY_TASKS: HistoryTask[] = [
  {
    id: 'task_001',
    templateId: 'tpl_001',
    templateName: '江苏区域风速监测',
    status: 'completed',
    createdAt: '2026-06-13 06:02:31',
    completedAt: '2026-06-13 06:08:14',
    downloadUrl: 'https://cdn.weather-data.com/exports/task_001.nc',
    dataSize: '45.2 MB',
    forecastTime: '2026-06-13 06:00:00',
    variables: ['u10', 'v10', 'ws10', 'ws100'],
  },
  {
    id: 'task_002',
    templateId: 'tpl_001',
    templateName: '江苏区域风速监测',
    status: 'completed',
    createdAt: '2026-06-13 00:02:18',
    completedAt: '2026-06-13 00:07:55',
    downloadUrl: 'https://cdn.weather-data.com/exports/task_002.nc',
    dataSize: '45.1 MB',
    forecastTime: '2026-06-13 00:00:00',
    variables: ['u10', 'v10', 'ws10', 'ws100'],
  },
  {
    id: 'task_003',
    templateId: 'tpl_002',
    templateName: '华东区域温度辐射分析',
    status: 'completed',
    createdAt: '2026-06-12 12:03:45',
    completedAt: '2026-06-12 12:21:33',
    downloadUrl: 'https://cdn.weather-data.com/exports/task_003.csv',
    dataSize: '126.8 MB',
    forecastTime: '2026-06-12 12:00:00',
    variables: ['t2m', 'ssr6h', 'tcc'],
  },
  {
    id: 'task_004',
    templateId: 'tpl_003',
    templateName: '风电场精细化预报',
    status: 'running',
    createdAt: '2026-06-13 06:02:55',
    forecastTime: '2026-06-13 06:00:00',
    variables: ['u10', 'v10', 'u100', 'v100', 'ws10', 'ws100', 'wd10', 'wd100'],
  },
  {
    id: 'task_005',
    templateId: 'tpl_002',
    templateName: '华东区域温度辐射分析',
    status: 'queued',
    createdAt: '2026-06-13 06:04:10',
    forecastTime: '2026-06-13 06:00:00',
    variables: ['t2m', 'ssr6h', 'tcc'],
  },
  {
    id: 'task_006',
    templateId: 'tpl_004',
    templateName: '全国高空风场分析',
    status: 'failed',
    createdAt: '2026-06-11 00:02:00',
    completedAt: '2026-06-11 00:03:12',
    failureReason: '数据存储空间不足，请联系管理员或减少查询范围',
    forecastTime: '2026-06-11 00:00:00',
    variables: ['u500hpa', 'v500hpa', 'z500hpa', 't850hpa'],
  },
  {
    id: 'task_007',
    templateId: 'tpl_001',
    templateName: '江苏区域风速监测',
    status: 'completed',
    createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd') + ' 18:02:44',
    completedAt: format(subDays(new Date(), 1), 'yyyy-MM-dd') + ' 18:09:21',
    downloadUrl: 'https://cdn.weather-data.com/exports/task_007.nc',
    dataSize: '45.3 MB',
    forecastTime: format(subDays(new Date(), 1), 'yyyy-MM-dd') + ' 18:00:00',
    variables: ['u10', 'v10', 'ws10', 'ws100'],
  },
  {
    id: 'task_008',
    templateId: 'tpl_001',
    templateName: '江苏区域风速监测',
    status: 'completed',
    createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd') + ' 12:02:19',
    completedAt: format(subDays(new Date(), 1), 'yyyy-MM-dd') + ' 12:08:03',
    downloadUrl: 'https://cdn.weather-data.com/exports/task_008.nc',
    dataSize: '44.9 MB',
    forecastTime: format(subDays(new Date(), 1), 'yyyy-MM-dd') + ' 12:00:00',
    variables: ['u10', 'v10', 'ws10', 'ws100'],
  },
]

export const MOCK_WARNINGS = [
  {
    id: 'warn_001',
    type: 'rainstorm' as const,
    typeLabel: '暴雨',
    level: 'orange' as const,
    levelLabel: '二级（橙色）',
    title: '江苏省南部暴雨橙色预警',
    publisher: '江苏省气象台',
    publishTime: '2026-06-13 14:30:00',
    validUntil: '2026-06-14 14:30:00',
    status: 'active' as const,
    regions: ['南京市', '苏州市', '无锡市'],
    bounds: { minLon: 118.5, maxLon: 121.2, minLat: 30.8, maxLat: 32.5 },
    relatedElements: ['tp6h', 'ws10'],
    description: '预计未来24小时内，南京、苏州、无锡等地将出现50mm以上强降雨，局部可达100mm以上，伴有短时强雷电和7-9级阵风。',
    suggestion: '暂停户外作业，加强排水设施巡查，物流运输线路建议绕行低洼路段。',
    source: '官方气象预警',
  },
  {
    id: 'warn_002',
    type: 'gale' as const,
    typeLabel: '大风',
    level: 'yellow' as const,
    levelLabel: '三级（黄色）',
    title: '山东半岛大风黄色预警',
    publisher: '山东省气象台',
    publishTime: '2026-06-13 10:15:00',
    validUntil: '2026-06-13 22:00:00',
    status: 'active' as const,
    regions: ['青岛市', '烟台市', '威海市'],
    bounds: { minLon: 119.5, maxLon: 122.8, minLat: 36.0, maxLat: 38.5 },
    relatedElements: ['ws10', 'ws100'],
    description: '预计今天白天到夜间，山东半岛沿海地区将出现8-10级阵风，海上风力可达11级。',
    suggestion: '港口作业暂停，海运船舶回港避风，沿海风电场加强设备巡检。',
    source: '官方气象预警',
  },
  {
    id: 'warn_003',
    type: 'heatwave' as const,
    typeLabel: '高温',
    level: 'red' as const,
    levelLabel: '一级（红色）',
    title: '河南中部高温红色预警',
    publisher: '河南省气象台',
    publishTime: '2026-06-13 08:00:00',
    validUntil: '2026-06-15 20:00:00',
    status: 'active' as const,
    regions: ['郑州市', '洛阳市', '开封市'],
    bounds: { minLon: 112.0, maxLon: 115.5, minLat: 33.5, maxLat: 35.5 },
    relatedElements: ['t2m', 'tcc'],
    description: '预计未来3天，郑州、洛阳、开封等地最高气温将达40℃以上，局部可达42℃。',
    suggestion: '电力负荷高峰预警，建议调整生产排班避开高温时段，加强粮食仓储温控管理。',
    source: '规则引擎触发',
  },
  {
    id: 'warn_004',
    type: 'typhoon' as const,
    typeLabel: '台风',
    level: 'blue' as const,
    levelLabel: '四级（蓝色）',
    title: '浙江沿海台风蓝色预警',
    publisher: '浙江省气象台',
    publishTime: '2026-06-12 18:00:00',
    validUntil: '2026-06-14 18:00:00',
    status: 'active' as const,
    regions: ['宁波市', '温州市', '嘉兴市'],
    bounds: { minLon: 119.5, maxLon: 122.5, minLat: 27.5, maxLat: 30.5 },
    relatedElements: ['ws10', 'tp6h', 'msl'],
    description: '今年第3号台风"格美"将于14日登陆浙江沿海，预计登陆时中心最大风力10-12级。',
    suggestion: '启动台风应急预案，沿海运输线路暂停，新能源场站做好防台准备。',
    source: '官方气象预警',
  },
  {
    id: 'warn_005',
    type: 'fog' as const,
    typeLabel: '大雾',
    level: 'yellow' as const,
    levelLabel: '三级（黄色）',
    title: '长三角地区大雾黄色预警',
    publisher: '中央气象台',
    publishTime: '2026-06-11 06:00:00',
    validUntil: '2026-06-11 12:00:00',
    status: 'released' as const,
    regions: ['上海市', '杭州市', '南京市'],
    bounds: { minLon: 118.0, maxLon: 122.0, minLat: 30.0, maxLat: 32.5 },
    relatedElements: ['tcc', 'sp'],
    description: '预计今天早晨到上午，长三角地区将出现能见度小于500米的大雾，局部小于200米。',
    suggestion: '高速公路限速通行，航空航班可能延误，物流调度建议延后发车。',
    source: '官方气象预警',
  },
]

export const MOCK_WARNING_RULES = [
  {
    id: 'rule_001',
    name: '台风风速触发规则',
    enabled: true,
    priority: 1,
    warningType: 'typhoon' as const,
    warningLevel: 'blue' as const,
    conditions: [{ element: 'ws10', operator: '>=' as const, threshold: 32.7, unit: 'm/s' }],
    logic: 'and' as const,
    spatialScope: 'region' as const,
    regions: ['浙江省', '广东省', '福建省'],
    effectiveMode: 'immediate' as const,
    version: 'v2.1',
    updatedAt: '2026-06-10 15:30:00',
    triggerCount: 12,
  },
  {
    id: 'rule_002',
    name: '暴雨6h降水阈值',
    enabled: true,
    priority: 2,
    warningType: 'rainstorm' as const,
    warningLevel: 'orange' as const,
    conditions: [{ element: 'tp6h', operator: '>=' as const, threshold: 50, unit: 'mm' }],
    logic: 'and' as const,
    spatialScope: 'global' as const,
    effectiveMode: 'immediate' as const,
    version: 'v1.8',
    updatedAt: '2026-06-08 09:00:00',
    triggerCount: 28,
  },
  {
    id: 'rule_003',
    name: '高温40℃预警',
    enabled: true,
    priority: 3,
    warningType: 'heatwave' as const,
    warningLevel: 'red' as const,
    conditions: [{ element: 't2m', operator: '>=' as const, threshold: 313.15, unit: 'K' }],
    logic: 'and' as const,
    spatialScope: 'region' as const,
    regions: ['河南省', '山东省'],
    effectiveMode: 'immediate' as const,
    version: 'v1.3',
    updatedAt: '2026-06-05 11:20:00',
    triggerCount: 5,
  },
  {
    id: 'rule_004',
    name: '大风复合条件',
    enabled: false,
    priority: 4,
    warningType: 'gale' as const,
    warningLevel: 'yellow' as const,
    conditions: [
      { element: 'ws10', operator: '>=' as const, threshold: 17.2, unit: 'm/s' },
      { element: 'ws100', operator: '>=' as const, threshold: 24.5, unit: 'm/s' },
    ],
    logic: 'or' as const,
    spatialScope: 'custom' as const,
    effectiveMode: 'scheduled' as const,
    effectiveTime: '2026-07-01 00:00:00',
    version: 'v1.0',
    updatedAt: '2026-05-20 16:45:00',
    triggerCount: 0,
  },
]

export const MOCK_PUSH_RECORDS = [
  { id: 'push_001', warningId: 'warn_001', warningTitle: '江苏省南部暴雨橙色预警', channel: 'platform' as const, channelLabel: '平台内消息', recipient: '全部订阅用户', pushTime: '2026-06-13 14:30:15', status: 'delivered' as const, retryCount: 0 },
  { id: 'push_002', warningId: 'warn_001', warningTitle: '江苏省南部暴雨橙色预警', channel: 'sms' as const, channelLabel: '短信', recipient: '物流调度组(32人)', pushTime: '2026-06-13 14:30:45', status: 'delivered' as const, retryCount: 0 },
  { id: 'push_003', warningId: 'warn_001', warningTitle: '江苏省南部暴雨橙色预警', channel: 'wechat' as const, channelLabel: '企业微信', recipient: '应急响应群', pushTime: '2026-06-13 14:31:02', status: 'read' as const, retryCount: 0 },
  { id: 'push_004', warningId: 'warn_003', warningTitle: '河南中部高温红色预警', channel: 'api_callback' as const, channelLabel: 'API 回调', recipient: '供应链管理系统', pushTime: '2026-06-13 08:00:30', status: 'delivered' as const, retryCount: 0 },
  { id: 'push_005', warningId: 'warn_003', warningTitle: '河南中部高温红色预警', channel: 'email' as const, channelLabel: '邮件', recipient: '电力交易组(18人)', pushTime: '2026-06-13 08:01:12', status: 'delivered' as const, retryCount: 0 },
  { id: 'push_006', warningId: 'warn_002', warningTitle: '山东半岛大风黄色预警', channel: 'dingtalk' as const, channelLabel: '钉钉机器人', recipient: '港口运营群', pushTime: '2026-06-13 10:15:30', status: 'failed' as const, retryCount: 3, failureReason: '钉钉 Webhook 超时，已重试3次' },
  { id: 'push_007', warningId: 'warn_004', warningTitle: '浙江沿海台风蓝色预警', channel: 'platform' as const, channelLabel: '平台内消息', recipient: '浙江区域用户', pushTime: '2026-06-12 18:00:20', status: 'delivered' as const, retryCount: 0 },
  { id: 'push_008', warningId: 'warn_004', warningTitle: '浙江沿海台风蓝色预警', channel: 'sms' as const, channelLabel: '短信', recipient: '新能源运维组(15人)', pushTime: '2026-06-12 18:01:05', status: 'pending' as const, retryCount: 1 },
]

export const MOCK_DATA_SOURCES = [
  { id: 'ds_001', name: 'ERA5 全球再分析数据集', type: '第三方权威', format: 'NetCDF', status: 'online' as const, lastSync: '2026-06-13 06:00:00', recordCount: '128亿条', storageSize: '286 TB' },
  { id: 'ds_002', name: 'ECMWF HRES 高分辨率预报', type: '第三方权威', format: 'GRIB2', status: 'online' as const, lastSync: '2026-06-13 06:06:00', recordCount: '45亿条', storageSize: '152 TB' },
  { id: 'ds_003', name: 'ghr_9km AI 预报模型', type: '内部模型', format: 'NetCDF', status: 'online' as const, lastSync: '2026-06-13 06:00:00', recordCount: '86亿条', storageSize: '324 TB' },
  { id: 'ds_004', name: '官方气象预警数据', type: '第三方预警', format: 'JSON/XML', status: 'online' as const, lastSync: '2026-06-13 14:35:00', recordCount: '1.2亿条', storageSize: '18 TB' },
  { id: 'ds_005', name: '物流运输路径数据', type: '内部业务', format: 'CSV', status: 'syncing' as const, lastSync: '2026-06-13 14:00:00', recordCount: '3200万条', storageSize: '2.4 TB' },
  { id: 'ds_006', name: '粮食产区地理数据', type: '内部业务', format: 'GeoJSON', status: 'online' as const, lastSync: '2026-06-12 00:00:00', recordCount: '860万条', storageSize: '0.8 TB' },
]

export const MOCK_AUDIT_LOGS = [
  { id: 'log_001', operator: 'admin', role: '超级管理员', action: '修改预警规则', module: '预警规则引擎', ip: '10.0.1.100', time: '2026-06-13 14:20:00', result: 'success' as const },
  { id: 'log_002', operator: 'ops_zhang', role: '运维员', action: '导出气象数据', module: '数据推送', ip: '10.0.1.105', time: '2026-06-13 13:45:00', result: 'success' as const },
  { id: 'log_003', operator: 'user_li', role: '普通用户', action: '查询预警信息', module: '极端天气预警', ip: '192.168.2.55', time: '2026-06-13 12:30:00', result: 'success' as const },
  { id: 'log_004', operator: 'unknown', role: '—', action: 'API 鉴权失败', module: 'API 网关', ip: '203.0.113.42', time: '2026-06-13 11:15:00', result: 'failed' as const },
  { id: 'log_005', operator: 'admin', role: '超级管理员', action: '更新用户权限', module: '权限管理', ip: '10.0.1.100', time: '2026-06-13 10:00:00', result: 'success' as const },
]

export const DASHBOARD_STATS = {
  totalStorage: '1.06 PB',
  hotStorage: '128 TB',
  warmStorage: '456 TB',
  coldStorage: '482 TB',
  totalRecords: '258亿条',
  warningRecords: '1.2亿条',
  dailyQueries: '128,450',
  dailyExports: '1,286',
  activeWarnings: 4,
  apiCallsToday: '45,820',
  systemAvailability: '99.97%',
  avgQueryLatency: '420ms',
}

export const MOCK_DATASETS = [
  { id: 'ds_set_001', name: 'ERA5 全球再分析 0.25°', tier: 'warm', format: 'NetCDF', size: '286 TB', records: '128亿', compression: '3.4:1', integrity: '99.96%', lastAccess: '2026-06-13 14:20' },
  { id: 'ds_set_002', name: 'ECMWF HRES 0.1° 预报', tier: 'hot', format: 'GRIB2', size: '152 TB', records: '45亿', compression: '3.1:1', integrity: '99.94%', lastAccess: '2026-06-13 14:35' },
  { id: 'ds_set_003', name: 'ghr_9km AI 逐小时预报', tier: 'hot', format: 'NetCDF', size: '324 TB', records: '86亿', compression: '3.6:1', integrity: '99.98%', lastAccess: '2026-06-13 14:30' },
  { id: 'ds_set_004', name: '极端天气预警历史库', tier: 'warm', format: 'JSON', size: '18 TB', records: '1.2亿', compression: '2.3:1', integrity: '99.97%', lastAccess: '2026-06-13 14:35' },
  { id: 'ds_set_005', name: '2016-2019 历史归档', tier: 'cold', format: 'NetCDF', size: '482 TB', records: '96亿', compression: '3.8:1', integrity: '99.92%', lastAccess: '2026-06-10 09:00' },
]

export const MOCK_INGESTION_PIPELINES = [
  { id: 'pipe_001', name: 'ERA5 定时同步', source: 'FTP', format: 'NetCDF', mode: '定时同步', interval: '每6小时', latency: '4.2min', status: 'running', todayCount: 2840, successRate: '99.8%' },
  { id: 'pipe_002', name: 'ECMWF HRES 实时推送', source: 'HTTP/HTTPS', format: 'GRIB2', mode: '实时推送', interval: '每1小时', latency: '2.8min', status: 'running', todayCount: 1560, successRate: '99.9%' },
  { id: 'pipe_003', name: '官方预警数据接入', source: 'REST API', format: 'JSON/XML', mode: '实时推送', interval: '每5分钟', latency: '45s', status: 'running', todayCount: 892, successRate: '99.95%' },
  { id: 'pipe_004', name: '物流路径数据导入', source: '消息队列', format: 'CSV', mode: '实时推送', interval: '实时', latency: '1.2min', status: 'running', todayCount: 12400, successRate: '99.5%' },
  { id: 'pipe_005', name: '粮食产区地理数据', source: '文件上传', format: 'GeoJSON', mode: '定时同步', interval: '每日', latency: '—', status: 'idle', todayCount: 1, successRate: '100%' },
]

export const MOCK_CLEANING_STATS = {
  missingHandled: 128450,
  anomalyFixed: 3842,
  duplicateRemoved: 156,
  accuracy: '99.6%',
  warningAccuracy: '99.85%',
  warningDedup: '100%',
}

export const MOCK_TRANSPORT_ROUTES = [
  { id: 'route_001', name: '京沪干线', risk: 'medium', points: [[31.23, 121.47], [34.26, 117.18], [36.65, 117.12], [39.90, 116.40]] as [number, number][], length: '1218km', cargo: '电子产品/消费品', weatherRisk: '沿途有暴雨橙色预警影响' },
  { id: 'route_002', name: '广深沿海线', risk: 'high', points: [[23.13, 113.26], [22.54, 114.06], [22.32, 114.12]] as [number, number][], length: '140km', cargo: '生鲜/冷链', weatherRisk: '台风蓝色预警，建议延迟发运' },
  { id: 'route_003', name: '陇海铁路西段', risk: 'low', points: [[34.75, 113.65], [34.26, 108.94], [36.06, 103.83]] as [number, number][], length: '860km', cargo: '粮食/煤炭', weatherRisk: '暂无极端天气影响' },
  { id: 'route_004', name: '东北粮食外运线', risk: 'low', points: [[45.75, 126.65], [43.88, 125.32], [41.80, 123.43], [39.90, 116.40]] as [number, number][], length: '1680km', cargo: '玉米/大豆', weatherRisk: '气象条件良好' },
]

export const MOCK_GRAIN_AREAS = [
  { id: 'grain_001', name: '黄淮海平原小麦产区', province: '河南/山东/河北', area: '28.6万km²', yield: '约1.2亿吨/年', bounds: { minLon: 113.5, maxLon: 119.5, minLat: 33.5, maxLat: 38.5 }, risk: 'high', impact: '高温红色预警，预计影响产量评估偏差+8%' },
  { id: 'grain_002', name: '东北玉米大豆产区', province: '黑龙江/吉林/辽宁', area: '35.2万km²', yield: '约1.5亿吨/年', bounds: { minLon: 121.0, maxLon: 131.0, minLat: 40.0, maxLat: 49.0 }, risk: 'low', impact: '气象条件正常，产能预测稳定' },
  { id: 'grain_003', name: '长江中下游水稻产区', province: '江苏/安徽/湖北', area: '18.4万km²', yield: '约0.9亿吨/年', bounds: { minLon: 114.0, maxLon: 121.0, minLat: 28.0, maxLat: 33.0 }, risk: 'medium', impact: '暴雨橙色预警，需关注洪涝对早稻影响' },
  { id: 'grain_004', name: '四川盆地油菜产区', province: '四川/重庆', area: '8.2万km²', yield: '约0.3亿吨/年', bounds: { minLon: 103.0, maxLon: 108.0, minLat: 28.5, maxLat: 32.5 }, risk: 'low', impact: '暂无显著气象风险' },
]

export const MOCK_BATCH_POINTS = `118.78,32.06
121.47,31.23
113.26,23.13
116.40,39.90
104.07,30.57
108.94,34.26`

export const MOCK_HISTORICAL_YEARS = Array.from({ length: 10 }, (_, i) => ({
  year: 2016 + i,
  avgTemp: +(14 + Math.random() * 2).toFixed(1),
  totalPrecip: +(800 + Math.random() * 400).toFixed(0),
  maxWind: +(18 + Math.random() * 12).toFixed(1),
  warningCount: Math.floor(20 + Math.random() * 80),
}))
