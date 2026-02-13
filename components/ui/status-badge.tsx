const colorMap: Record<string, string> = {
  // Lead statuses
  new: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  contacted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  qualified: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  converted: 'bg-green-500/20 text-green-400 border-green-500/30',
  lost: 'bg-red-500/20 text-red-400 border-red-500/30',

  // Project statuses
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',

  // Revision statuses
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',

  // Invoice statuses
  draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  paid: 'bg-green-500/20 text-green-400 border-green-500/30',
  void: 'bg-red-500/20 text-red-400 border-red-500/30',
  uncollectible: 'bg-red-500/20 text-red-400 border-red-500/30',

  // Site statuses
  online: 'bg-green-500/20 text-green-400 border-green-500/30',
  offline: 'bg-red-500/20 text-red-400 border-red-500/30',
  not_configured: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  auto_paused: 'bg-orange-500/20 text-orange-400 border-orange-500/30',

  // Subscription / billing statuses
  past_due: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  canceled: 'bg-red-500/20 text-red-400 border-red-500/30',
  trialing: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  no_billing: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  pending_billing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
  incomplete: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}

export function StatusBadge({ status }: { status: string }) {
  const colors = colorMap[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  const label = status.replace(/_/g, ' ')

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${colors}`}
    >
      {label}
    </span>
  )
}
