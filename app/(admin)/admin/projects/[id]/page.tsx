import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'
import { updateProject, updateSiteControl } from '../actions'

export const metadata = { title: 'Project Detail — Admin' }

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*, profiles!projects_client_id_fkey(full_name, email)')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const [{ data: siteControl }, { data: revisions }] = await Promise.all([
    supabase
      .from('site_controls')
      .select('*')
      .eq('project_id', id)
      .single(),
    supabase
      .from('revisions')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const updateProjectWithId = updateProject.bind(null, id)
  const updateSiteControlWithId = updateSiteControl.bind(null, id)

  const client = project.profiles as { full_name: string | null; email: string }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/projects" className="text-sm text-gray-400 hover:text-white transition-colors">
          &larr; Back to Projects
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Edit Project</h1>

            <form action={updateProjectWithId} className="space-y-4">
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

              <button
                type="submit"
                className="rounded-lg bg-neon-purple px-4 py-2.5 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors"
              >
                Save Changes
              </button>
            </form>
          </div>

          {/* Revisions */}
          <div className="rounded-xl border border-dark-600/50 bg-dark-800/40">
            <div className="border-b border-dark-600/50 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">Revisions</h2>
            </div>
            {revisions && revisions.length > 0 ? (
              <div className="divide-y divide-dark-600/30">
                {revisions.map((rev) => (
                  <div key={rev.id} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{rev.title}</p>
                      <StatusBadge status={rev.status} />
                    </div>
                    {rev.description && (
                      <p className="mt-1 text-xs text-gray-500">{rev.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-gray-500">No revisions</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Client</h2>
            <p className="text-sm text-white">{client?.full_name || 'Unnamed'}</p>
            <p className="text-sm text-gray-400">{client?.email}</p>
            <Link
              href={`/admin/clients/${project.client_id}`}
              className="mt-2 inline-block text-sm text-neon-purple hover:text-neon-purple/80"
            >
              View client &rarr;
            </Link>
          </div>

          {/* Site Control */}
          {siteControl && (
            <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Site Control</h2>

              <form action={updateSiteControlWithId} className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Site Live</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="hidden"
                      name="is_live"
                      value={siteControl.is_live ? 'true' : 'false'}
                    />
                    <button
                      type="submit"
                      name="is_live"
                      value={siteControl.is_live ? 'false' : 'true'}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        siteControl.is_live ? 'bg-green-500' : 'bg-dark-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                          siteControl.is_live ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>

                {siteControl.paused_reason && (
                  <p className="text-xs text-yellow-400">
                    Paused: {siteControl.paused_reason}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Auto-pause on overdue</label>
                  <button
                    type="submit"
                    name="auto_pause_enabled"
                    value={siteControl.auto_pause_enabled ? 'false' : 'true'}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      siteControl.auto_pause_enabled ? 'bg-green-500' : 'bg-dark-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        siteControl.auto_pause_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <input type="hidden" name="auto_pause_enabled" value={siteControl.auto_pause_enabled ? 'true' : 'false'} />
                <input type="hidden" name="is_live" value={siteControl.is_live ? 'true' : 'false'} />
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
