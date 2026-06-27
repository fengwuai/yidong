export type WeatherVariable = {
  key: string
  label: string
  unit: string
  category: 'surface' | 'wind' | 'temperature' | 'humidity' | 'geopotential' | 'derived'
}

export type PressureLevel = 1000 | 925 | 850 | 700 | 600 | 500 | 400 | 300 | 250 | 200 | 150 | 100 | 50

export type WeatherModel = 'ghr_9km' | 'ghr_25km'

export type ForecastTime = '00z' | '06z' | '12z' | '18z'

export type DataFormat = 'NetCDF' | 'CSV'

export type TimeInterval = '1h' | '15min'

export type SpatialProcessing = 'none' | 'spatial_mean'

export type RegionMode = 'rectangle' | 'coordinates' | 'region'

export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed'

export type PushStatus = 'enabled' | 'disabled'

export type HourlyForecast = {
  time: string
  temperature: number
  radiation: number
  ws10: number
  ws100: number
  precipitation: number
  windDirection: number
}

export type WeatherQueryResult = {
  location: { lon: number; lat: number }
  model: WeatherModel
  forecastTime: string
  data: HourlyForecast[]
}

export type ProfessionalQueryResult = {
  location: { lon: number; lat: number }
  model: WeatherModel
  forecastTime: string
  variables: string[]
  data: Record<string, number[]>
  timestamps: string[]
}

export type SelectedRegion = {
  mode: RegionMode
  rectangle?: { minLon: number; maxLon: number; minLat: number; maxLat: number }
  coordinates?: Array<{ lon: number; lat: number }>
  regions?: string[]
  boundaryExpand?: number
  coastlineExpand?: number
}

export type DataTemplate = {
  id: string
  name: string
  model: WeatherModel
  variables: string[]
  region: SelectedRegion
  estimatedPoints: number
  estimatedFileSize: string
  pushStatus: PushStatus
  hasBeenPushed: boolean
  createdAt: string
  updatedAt: string
  pushSchedule?: PushSchedule
}

export type PushSchedule = {
  forecastTimes: ForecastTime[]
  interval: TimeInterval
  dataFormat: DataFormat
  spatialProcessing: SpatialProcessing
}

export type HistoryTask = {
  id: string
  templateId: string
  templateName: string
  status: TaskStatus
  createdAt: string
  completedAt?: string
  downloadUrl?: string
  failureReason?: string
  dataSize?: string
  forecastTime: string
  variables: string[]
}

export type CityOption = {
  label: string
  value: string
  lon: number
  lat: number
  province?: string
  hasCoastline?: boolean
}

export type ProvinceOption = {
  label: string
  value: string
  cities: CityOption[]
  hasCoastline?: boolean
  bounds?: [number, number, number, number]
}

export type WarningLevel = 'red' | 'orange' | 'yellow' | 'blue'

export type WarningStatus = 'active' | 'released' | 'expired'

export type WarningType =
  | 'typhoon'
  | 'rainstorm'
  | 'gale'
  | 'heatwave'
  | 'coldwave'
  | 'fog'
  | 'hail'
  | 'lightning'

export type ExtremeWeatherWarning = {
  id: string
  type: WarningType
  typeLabel: string
  level: WarningLevel
  levelLabel: string
  title: string
  publisher: string
  publishTime: string
  validUntil: string
  status: WarningStatus
  regions: string[]
  bounds: { minLon: number; maxLon: number; minLat: number; maxLat: number }
  relatedElements: string[]
  description: string
  suggestion: string
  source: string
}

export type WarningRule = {
  id: string
  name: string
  enabled: boolean
  priority: number
  warningType: WarningType
  warningLevel: WarningLevel
  conditions: Array<{
    element: string
    operator: '>' | '>=' | '<' | '<=' | '=='
    threshold: number
    unit: string
  }>
  logic: 'and' | 'or'
  spatialScope: 'global' | 'region' | 'custom'
  regions?: string[]
  effectiveMode: 'immediate' | 'scheduled'
  effectiveTime?: string
  version: string
  updatedAt: string
  triggerCount: number
}

export type PushChannel = 'platform' | 'sms' | 'email' | 'wechat' | 'dingtalk' | 'api_callback'

export type PushDeliveryStatus = 'delivered' | 'pending' | 'failed' | 'read'

export type WarningPushRecord = {
  id: string
  warningId: string
  warningTitle: string
  channel: PushChannel
  channelLabel: string
  recipient: string
  pushTime: string
  status: PushDeliveryStatus
  retryCount: number
  failureReason?: string
}

export type DataLifecycleTier = 'hot' | 'warm' | 'cold'

export type DataSourceStatus = {
  id: string
  name: string
  type: string
  format: string
  status: 'online' | 'syncing' | 'offline'
  lastSync: string
  recordCount: string
  storageSize: string
}

export type AuditLog = {
  id: string
  operator: string
  role: string
  action: string
  module: string
  ip: string
  time: string
  result: 'success' | 'failed'
}

export type UserRole = 'super_admin' | 'operator' | 'user' | 'readonly'
