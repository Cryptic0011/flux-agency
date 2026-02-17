const priorityConfig: Record<string, { label: string; classes: string; dot?: string }> = {
  urgent: {
    label: 'Urgent',
    classes: 'bg-red-500/20 text-red-400 border-red-500/30',
    dot: 'bg-red-500 animate-pulse',
  },
  normal: {
    label: 'Normal',
    classes: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  },
  low: {
    label: 'Low',
    classes: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  },
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority] || priorityConfig.normal
  if (priority === 'normal') return null

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}>
      {config.dot && <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />}
      {config.label}
    </span>
  )
}
