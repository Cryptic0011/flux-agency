'use client'

import { useEffect, useState } from 'react'

interface VercelProject {
  id: string
  name: string
}

export function VercelProjectSelect({
  defaultValue,
}: {
  defaultValue?: string
}) {
  const [projects, setProjects] = useState<VercelProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState(defaultValue || '')

  useEffect(() => {
    fetch('/api/vercel/projects')
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load')
        }
        return res.json()
      })
      .then((data) => {
        setProjects(data.projects || [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Vercel not configured')
        setLoading(false)
      })
  }, [])

  if (error) {
    return (
      <div>
        <input type="hidden" name="vercel_project_id" value="" />
        <select
          disabled
          className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-gray-500 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
        >
          <option value="">Vercel not configured</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">Vercel integration is optional. You can set this later.</p>
      </div>
    )
  }

  return (
    <>
      <input type="hidden" name="vercel_project_id" value={selected} />
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={loading}
        className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple disabled:text-gray-500"
      >
        <option value="">{loading ? 'Loading Vercel projects...' : 'None'}</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </>
  )
}
