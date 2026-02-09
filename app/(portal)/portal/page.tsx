import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'

export const metadata = {
  title: 'Client Portal',
  description: 'Manage your projects, view invoices, and request revisions.',
}

export default async function PortalPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profile }, { data: projects }, { data: revisions }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user!.id)
      .single(),
    supabase
      .from('projects')
      .select('*')
      .eq('client_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('revisions')
      .select('*, projects(name)')
      .eq('client_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="mt-2 text-gray-400">
          Here&apos;s an overview of your projects and recent activity.
        </p>
      </div>

      {/* Project Cards */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Your Projects</h2>
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/portal/projects/${project.id}`}
                className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-5 hover:border-dark-500 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">{project.name}</h3>
                  <StatusBadge status={project.status} />
                </div>
                {project.domain && (
                  <p className="text-xs text-gray-500 mb-2">{project.domain}</p>
                )}
                <p className="text-lg font-bold text-white">
                  {project.monthly_price > 0 ? `$${project.monthly_price}/mo` : 'Free tier'}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 py-12 text-center">
            <p className="text-gray-500">No projects yet.</p>
            <p className="mt-1 text-sm text-gray-600">Your projects will appear here once set up.</p>
          </div>
        )}
      </div>

      {/* Recent Revisions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Revisions</h2>
        {revisions && revisions.length > 0 ? (
          <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 divide-y divide-dark-600/30">
            {revisions.map((rev) => (
              <div key={rev.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{rev.title}</p>
                  <p className="text-xs text-gray-500">
                    {(rev.projects as { name: string })?.name || 'Unknown project'}
                  </p>
                </div>
                <StatusBadge status={rev.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 py-8 text-center">
            <p className="text-sm text-gray-500">No revision requests yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
