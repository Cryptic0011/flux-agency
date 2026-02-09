import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'

export const metadata = { title: 'Client Detail — Admin' }

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: client } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'client')
    .single()

  if (!client) notFound()

  const [{ data: projects }, { data: revisions }] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('revisions')
      .select('*, projects(name)')
      .eq('client_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/clients" className="text-sm text-gray-400 hover:text-white transition-colors">
          &larr; Back to Clients
        </Link>
      </div>

      {/* Client Info */}
      <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">{client.full_name || 'Unnamed'}</h1>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-white">{client.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500">Role</dt>
            <dd className="mt-1 text-sm text-white capitalize">{client.role}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500">Joined</dt>
            <dd className="mt-1 text-sm text-white">{new Date(client.created_at).toLocaleDateString()}</dd>
          </div>
        </dl>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects */}
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40">
          <div className="flex items-center justify-between border-b border-dark-600/50 px-5 py-4">
            <h2 className="text-lg font-semibold text-white">Projects</h2>
            <Link
              href={`/admin/projects/new?client=${id}`}
              className="text-sm text-neon-purple hover:text-neon-purple/80"
            >
              + New Project
            </Link>
          </div>
          {projects && projects.length > 0 ? (
            <div className="divide-y divide-dark-600/30">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-dark-700/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.domain || 'No domain'}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-500">No projects yet</p>
            </div>
          )}
        </div>

        {/* Revisions */}
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40">
          <div className="flex items-center justify-between border-b border-dark-600/50 px-5 py-4">
            <h2 className="text-lg font-semibold text-white">Revision Requests</h2>
          </div>
          {revisions && revisions.length > 0 ? (
            <div className="divide-y divide-dark-600/30">
              {revisions.map((rev) => (
                <div
                  key={rev.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{rev.title}</p>
                    <p className="text-xs text-gray-500">
                      {(rev.projects as { name: string })?.name || 'Unknown project'}
                    </p>
                  </div>
                  <StatusBadge status={rev.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-500">No revision requests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
