import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'

export const metadata = { title: 'Project — Client Portal' }

export default async function PortalProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('client_id', user!.id)
    .single()

  if (!project) notFound()

  const { data: revisions } = await supabase
    .from('revisions')
    .select('*')
    .eq('project_id', id)
    .eq('client_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-6">
        <Link href="/portal" className="text-sm text-gray-400 hover:text-white transition-colors">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Project Info */}
      <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          <StatusBadge status={project.status} />
        </div>

        {project.description && (
          <p className="text-sm text-gray-300 mb-4">{project.description}</p>
        )}

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500">Domain</dt>
            <dd className="mt-1 text-sm text-white">
              {project.domain ? (
                <a
                  href={`https://${project.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neon-purple hover:underline"
                >
                  {project.domain}
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500">Monthly Price</dt>
            <dd className="mt-1 text-sm text-white">
              {project.monthly_price > 0 ? `$${project.monthly_price}/mo` : 'Free tier'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-white">
              {new Date(project.created_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>

      {/* Revisions */}
      <div className="rounded-xl border border-dark-600/50 bg-dark-800/40">
        <div className="flex items-center justify-between border-b border-dark-600/50 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Revision Requests</h2>
          <Link
            href={`/portal/projects/${id}/revisions/new`}
            className="rounded-lg bg-neon-purple px-4 py-2 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors"
          >
            Request Revision
          </Link>
        </div>

        {revisions && revisions.length > 0 ? (
          <div className="divide-y divide-dark-600/30">
            {revisions.map((rev) => (
              <div key={rev.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white">{rev.title}</h3>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={rev.status} />
                    <span className="text-xs text-gray-500">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {rev.description && (
                  <p className="text-sm text-gray-400 mb-2">{rev.description}</p>
                )}
                {rev.admin_notes && (
                  <div className="mt-2 rounded-lg bg-dark-700/50 p-3">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Response</p>
                    <p className="text-sm text-gray-300">{rev.admin_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-500">No revision requests yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
