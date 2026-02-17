import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'
import { DismissAlertButton } from './dismiss-alert-button'
import { DashboardStats } from './dashboard-stats'

export const metadata = {
  title: 'Admin Dashboard',
  description: 'FLUX admin dashboard for managing clients, projects, and billing.',
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: leadsTotal },
    { count: leadsNew },
    { count: activeProjects },
    { count: activeClients },
    { count: pendingRevisions },
    { data: recentLeads },
    { data: recentRevisions },
    { data: revenueProjects },
    { data: outstandingInvoices },
    { data: adminAlerts },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('revisions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
    supabase
      .from('revisions')
      .select('*, profiles!revisions_client_id_fkey(full_name), projects(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    // Get projects with active subscriptions for MRR calculation
    supabase
      .from('subscriptions')
      .select('project_id, projects(monthly_price)')
      .eq('status', 'active'),
    // Get outstanding invoices (open or draft)
    supabase
      .from('invoices')
      .select('id, client_id, project_id, amount, status, due_date, description, number, created_at, profiles!invoices_client_id_fkey(full_name), projects(name)')
      .in('status', ['open', 'draft']),
    // Get unread admin alerts
    supabase
      .from('admin_alerts')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // Calculate Monthly Revenue from active subscriptions
  const monthlyRevenue = (revenueProjects || []).reduce((sum, sub) => {
    const project = sub.projects as unknown as { monthly_price: number } | null
    return sum + (project?.monthly_price || 0)
  }, 0)

  // Calculate outstanding invoices total and count
  const outstandingCount = outstandingInvoices?.length || 0
  const outstandingTotal = (outstandingInvoices || []).reduce(
    (sum, inv) => sum + (inv.amount || 0),
    0
  )

  const stats = [
    {
      label: 'Total Leads',
      value: leadsTotal ?? 0,
      badge: leadsNew ? `${leadsNew} new` : undefined,
      href: '/admin/leads',
      color: 'from-purple-500/20 to-purple-600/5',
    },
    {
      label: 'Active Projects',
      value: activeProjects ?? 0,
      href: '/admin/projects',
      color: 'from-blue-500/20 to-blue-600/5',
    },
    {
      label: 'Active Clients',
      value: activeClients ?? 0,
      href: '/admin/clients',
      color: 'from-cyan-500/20 to-cyan-600/5',
    },
    {
      label: 'Pending Revisions',
      value: pendingRevisions ?? 0,
      href: '/admin/revisions',
      color: 'from-yellow-500/20 to-yellow-600/5',
      expandable: 'revisions' as const,
    },
    {
      label: 'Monthly Revenue',
      value: `$${monthlyRevenue.toFixed(0)}`,
      href: '/admin/projects',
      color: 'from-green-500/20 to-green-600/5',
    },
    {
      label: 'Outstanding Invoices',
      value: outstandingCount,
      badge: outstandingTotal > 0 ? `$${(outstandingTotal / 100).toFixed(0)}` : undefined,
      href: '/admin/clients',
      color: 'from-red-500/20 to-red-600/5',
      expandable: 'invoices' as const,
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Overview of your agency at a glance.
        </p>
      </div>

      {/* Stat Cards */}
      <DashboardStats
        stats={stats}
        invoices={(outstandingInvoices || []) as any}
        revisions={(recentRevisions || []) as any}
      />

      {/* Needs Attention */}
      {adminAlerts && adminAlerts.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 mb-8">
          <div className="border-b border-red-500/20 px-5 py-4">
            <h2 className="text-lg font-semibold text-white">Needs Attention</h2>
          </div>
          <div className="divide-y divide-red-500/10">
            {adminAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{alert.message}</p>
                    <p className="text-xs text-gray-500">{timeAgo(alert.created_at)}</p>
                  </div>
                </div>
                <DismissAlertButton alertId={alert.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40">
          <div className="flex items-center justify-between border-b border-dark-600/50 px-5 py-4">
            <h2 className="text-lg font-semibold text-white">Recent Leads</h2>
            <Link href="/admin/leads" className="text-sm text-neon-purple hover:text-neon-purple/80">
              View all
            </Link>
          </div>
          {recentLeads && recentLeads.length > 0 ? (
            <div className="divide-y divide-dark-600/30">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/admin/leads/${lead.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-dark-700/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.business_type || 'No type'}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <StatusBadge status={lead.status} />
                    <span className="text-xs text-gray-500">{timeAgo(lead.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-500">No leads yet</p>
            </div>
          )}
        </div>

        {/* Pending Revisions */}
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40">
          <div className="flex items-center justify-between border-b border-dark-600/50 px-5 py-4">
            <h2 className="text-lg font-semibold text-white">Pending Revisions</h2>
            <Link href="/admin/revisions" className="text-sm text-neon-purple hover:text-neon-purple/80">
              View all
            </Link>
          </div>
          {recentRevisions && recentRevisions.length > 0 ? (
            <div className="divide-y divide-dark-600/30">
              {recentRevisions.map((rev) => (
                <div
                  key={rev.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{rev.title}</p>
                    <p className="text-xs text-gray-500">
                      {(rev.profiles as { full_name: string | null })?.full_name || 'Unknown'} &middot;{' '}
                      {(rev.projects as { name: string })?.name || 'Unknown project'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 ml-4 shrink-0">
                    {timeAgo(rev.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-500">No pending revisions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
