import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'
import { relativeTime } from '@/lib/utils'

export const metadata = {
  title: 'Client Portal',
  description: 'Manage your projects, view invoices, and request revisions.',
}

/** Derive a billing badge status for a project based on its subscription and price. */
function billingStatus(
  project: { monthly_price: number; id: string },
  subscriptions: { project_id: string; status: string }[]
): string {
  const sub = subscriptions.find((s) => s.project_id === project.id)
  if (project.monthly_price === 0) return 'no_billing'
  if (!sub) return 'pending_billing'
  if (sub.status === 'active') return 'active'
  if (sub.status === 'past_due') return 'past_due'
  return sub.status
}

/** Map event_type to an icon character and color */
function eventIcon(eventType: string): { icon: string; color: string } {
  if (eventType.includes('paid') || eventType.includes('payment'))
    return { icon: '$', color: 'text-green-400 bg-green-500/20' }
  if (eventType.includes('subscription'))
    return { icon: '\u21BB', color: 'text-blue-400 bg-blue-500/20' }
  if (eventType.includes('revision'))
    return { icon: '\u270E', color: 'text-purple-400 bg-purple-500/20' }
  if (eventType.includes('invoice'))
    return { icon: '\u2709', color: 'text-yellow-400 bg-yellow-500/20' }
  return { icon: '\u2022', color: 'text-gray-400 bg-gray-500/20' }
}

export default async function PortalPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [
    { data: profile },
    { data: projects },
    { data: subscriptions },
    { data: outstandingInvoices },
    { data: activityLog },
    { data: revisions },
  ] = await Promise.all([
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
      .from('subscriptions')
      .select('project_id, status')
      .eq('client_id', user!.id),
    supabase
      .from('invoices')
      .select('id')
      .eq('client_id', user!.id)
      .in('status', ['open', 'past_due']),
    supabase
      .from('activity_log')
      .select('id, event_type, description, created_at')
      .eq('client_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('revisions')
      .select('*, projects(name)')
      .eq('client_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const outstandingCount = outstandingInvoices?.length ?? 0

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

      {/* Needs Attention Banner */}
      {outstandingCount > 0 && (
        <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-bold">
              !
            </span>
            <p className="text-sm text-yellow-300">
              You have{' '}
              <span className="font-semibold">
                {outstandingCount} outstanding invoice{outstandingCount !== 1 ? 's' : ''}
              </span>
            </p>
          </div>
          <Link
            href="/portal/billing?status=outstanding"
            className="rounded-lg bg-yellow-500/20 px-4 py-1.5 text-sm font-medium text-yellow-300 hover:bg-yellow-500/30 transition-colors"
          >
            View Billing
          </Link>
        </div>
      )}

      {/* Project Cards */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Your Projects</h2>
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const billing = billingStatus(project, subscriptions ?? [])
              return (
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
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-white">
                      {project.monthly_price > 0 ? `$${project.monthly_price}/mo` : 'Free tier'}
                    </p>
                    <StatusBadge status={billing} />
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 py-12 text-center">
            <p className="text-gray-500">No projects yet.</p>
            <p className="mt-1 text-sm text-gray-600">Your projects will appear here once set up.</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        {activityLog && activityLog.length > 0 ? (
          <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 divide-y divide-dark-600/30">
            {activityLog.map((entry) => {
              const { icon, color } = eventIcon(entry.event_type)
              return (
                <div key={entry.id} className="flex items-center gap-4 px-5 py-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${color}`}
                  >
                    {icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate">{entry.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">
                    {relativeTime(entry.created_at)}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 py-8 text-center">
            <p className="text-sm text-gray-500">No activity yet.</p>
            <p className="mt-1 text-xs text-gray-600">
              Activity from billing, revisions, and subscriptions will show up here.
            </p>
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
