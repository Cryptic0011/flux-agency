'use client'

import { useTransition } from 'react'
import { dismissAlert } from './clients/actions'

export function DismissAlertButton({ alertId }: { alertId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => dismissAlert(alertId))}
      disabled={isPending}
      className="text-xs text-gray-500 hover:text-white transition-colors disabled:opacity-50"
    >
      {isPending ? '...' : 'Dismiss'}
    </button>
  )
}
