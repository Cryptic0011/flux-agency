'use client'

import { useTransition, useState, useOptimistic } from 'react'

export function SiteControl({
  siteControl,
  action,
  hasVercelProject,
}: {
  siteControl: {
    is_live: boolean
    auto_pause_enabled: boolean
    paused_reason: string | null
  }
  action: (formData: FormData) => Promise<void>
  hasVercelProject: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [optimistic, setOptimistic] = useOptimistic(siteControl)

  function handleToggle(field: 'is_live' | 'auto_pause_enabled') {
    const newValue = !optimistic[field]

    const formData = new FormData()
    formData.set('is_live', field === 'is_live' ? String(newValue) : String(optimistic.is_live))
    formData.set('auto_pause_enabled', field === 'auto_pause_enabled' ? String(newValue) : String(optimistic.auto_pause_enabled))

    setError(null)

    startTransition(async () => {
      setOptimistic((prev) => ({
        ...prev,
        [field]: newValue,
        paused_reason: field === 'is_live' ? (newValue ? null : 'manual') : prev.paused_reason,
      }))

      try {
        await action(formData)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update site control')
      }
    })
  }

  function formatPausedReason(reason: string): string {
    if (reason === 'invoice_overdue') return 'Invoice overdue (auto-paused)'
    return reason.charAt(0).toUpperCase() + reason.slice(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300">Site Live</label>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleToggle('is_live')}
          style={{ minWidth: '44px', minHeight: '24px' }}
          className={`relative inline-flex shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            optimistic.is_live ? 'bg-green-500' : 'bg-dark-600'
          }`}
        >
          <span
            style={{ width: '16px', height: '16px' }}
            className={`pointer-events-none inline-block rounded-full bg-white shadow-sm transition-transform ${
              optimistic.is_live ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {optimistic.paused_reason && (
        <p className="text-xs text-yellow-400">
          Paused: {formatPausedReason(optimistic.paused_reason)}
        </p>
      )}

      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300">Auto-pause on overdue</label>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleToggle('auto_pause_enabled')}
          style={{ minWidth: '44px', minHeight: '24px' }}
          className={`relative inline-flex shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            optimistic.auto_pause_enabled ? 'bg-green-500' : 'bg-dark-600'
          }`}
        >
          <span
            style={{ width: '16px', height: '16px' }}
            className={`pointer-events-none inline-block rounded-full bg-white shadow-sm transition-transform ${
              optimistic.auto_pause_enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {!hasVercelProject && (
        <p className="text-xs text-gray-500">
          No Vercel project linked — toggles update database only.
        </p>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {saved && (
        <p className="text-xs text-green-400">Saved</p>
      )}
    </div>
  )
}
