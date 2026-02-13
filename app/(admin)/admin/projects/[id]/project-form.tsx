'use client'

import { useTransition, useState } from 'react'
import { VercelProjectSelect } from '@/components/ui/vercel-project-select'

export function ProjectForm({
  project,
  action,
}: {
  project: {
    name: string
    description: string | null
    domain: string | null
    monthly_price: number
    vercel_project_id: string | null
    status: string
  }
  action: (formData: FormData) => Promise<void>
}) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await action(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
        <input
          name="name"
          defaultValue={project.name}
          required
          className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
        <textarea
          name="description"
          defaultValue={project.description || ''}
          rows={3}
          className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple resize-y"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Domain</label>
          <input
            name="domain"
            defaultValue={project.domain || ''}
            className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Monthly Price ($)</label>
          <input
            name="monthly_price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={project.monthly_price}
            className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Vercel Project</label>
        <VercelProjectSelect defaultValue={project.vercel_project_id || undefined} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
        <select
          name="status"
          defaultValue={project.status}
          className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-neon-purple px-4 py-2.5 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && (
          <span className="text-sm text-green-400">Saved successfully</span>
        )}
      </div>
    </form>
  )
}
