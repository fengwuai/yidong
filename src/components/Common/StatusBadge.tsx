import type { TaskStatus, PushStatus } from '../../types/weather'

const taskStatusConfig = {
  queued: { label: '排队中', className: 'tag-yellow', dot: 'bg-yellow-400' },
  running: { label: '运行中', className: 'tag-blue', dot: 'bg-blue-400 animate-pulse' },
  completed: { label: '已完成', className: 'tag-green', dot: 'bg-green-400' },
  failed: { label: '失败', className: 'tag-red', dot: 'bg-red-400' },
}

const pushStatusConfig = {
  enabled: { label: '推送中', className: 'tag-green', dot: 'bg-green-400 animate-pulse' },
  disabled: { label: '未推送', className: 'tag-gray', dot: 'bg-gray-400' },
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const config = taskStatusConfig[status]
  return (
    <span className={`${config.className} tag flex items-center gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  )
}

export function PushStatusBadge({ status }: { status: PushStatus }) {
  const config = pushStatusConfig[status]
  return (
    <span className={`${config.className} tag flex items-center gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  )
}
