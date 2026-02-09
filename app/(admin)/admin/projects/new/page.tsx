import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createProject } from '../actions'

export const metadata = { title: 'New Project — Admin' }

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>
}) {
  const { client: preselectedClient } = await searchParams
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'client')
    .order('full_name')

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/projects" className="text-sm text-gray-400 hover:text-white transition-colors">
          &larr; Back to Projects
        </Link>
      </div>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-6">Create New Project</h1>

        <form action={createProject} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Project Name</label>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
              placeholder="e.g. Acme Corp Website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple resize-y"
              placeholder="Brief project description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Client</label>
            <select
              name="client_id"
              required
              defaultValue={preselectedClient || ''}
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
            >
              <option value="" disabled>Select a client</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name || c.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Domain</label>
            <input
              name="domain"
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
              placeholder="e.g. acmecorp.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Monthly Price ($)</label>
            <input
              name="monthly_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
            <select
              name="status"
              defaultValue="active"
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-neon-purple px-4 py-2.5 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors"
          >
            Create Project
          </button>
        </form>
      </div>
    </div>
  )
}
