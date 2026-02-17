import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'
import { FilterSelect } from '@/components/ui/filter-form'
import { WebsitePreview } from '@/components/ui/website-preview'

export const metadata = { title: 'Projects — Admin' }

function getSiteStatus(
  vercelProjectId: string | null,
  siteControl: { is_live: boolean; paused_reason: string | null } | undefined
): string {
  if (!vercelProjectId) return 'not_configured'
  if (!siteControl) return 'not_configured'
  if (siteControl.is_live) return 'online'
  if (siteControl.paused_reason === 'invoice_overdue') return 'auto_paused'
  return 'offline'
}

function getBillingBadgeStatus(
  subStatus: string | undefined,
  monthlyPrice: number
): string {
  if (monthlyPrice === 0) return 'no_billing'
  if (!subStatus) return 'no_billing'
  if (subStatus === 'active') return 'paid'
  if (subStatus === 'past_due') return 'overdue'
  if (subStatus === 'incomplete' || subStatus === 'trialing') return 'pending_billing'
  return 'no_billing'
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: filterStatus } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('projects')
    .select('*, profiles!projects_client_id_fkey(full_name)')
    .order('created_at', { ascending: false })

  if (filterStatus && filterStatus !== 'all') {
    query = query.eq('status', filterStatus)
  }

  const [{ data: projects }, { data: subscriptions }, { data: siteControls }] = await Promise.all([
    query,
    supabase.from('subscriptions').select('project_id, status'),
    supabase.from('site_controls').select('project_id, is_live, paused_reason'),
  ])

  // Build a map of project_id -> subscription status
  const subStatusMap: Record<string, string> = {}
  subscriptions?.forEach((sub) => {
    if (sub.project_id) {
      // If multiple subs exist, prioritize active over others
      if (!subStatusMap[sub.project_id] || sub.status === 'active') {
        subStatusMap[sub.project_id] = sub.status
      }
    }
  })

  // Build a map of project_id -> site control
  const siteControlMap: Record<string, { is_live: boolean; paused_reason: string | null }> = {}
  siteControls?.forEach((sc) => {
    if (sc.project_id) {
      siteControlMap[sc.project_id] = { is_live: sc.is_live, paused_reason: sc.paused_reason }
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="mt-1 text-sm text-gray-400">All client projects.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center justify-center rounded-lg bg-neon-purple px-4 py-2 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors"
        >
          + New Project
        </Link>
      </div>

      {/* Status filter */}
      <div className="mb-6">
        <FilterSelect
          name="status"
          defaultValue={filterStatus}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'active', label: 'Active' },
            { value: 'paused', label: 'Paused' },
            { value: 'completed', label: 'Completed' },
          ]}
        />
      </div>

      {projects && projects.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-dark-600/50 bg-dark-800/40">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600/50">
                {['Project', 'Client', 'Status', 'Site', 'Domain', 'Monthly Price', 'Billing', 'Created'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600/30">
              {projects.map((project) => {
                const billingStatus = getBillingBadgeStatus(
                  subStatusMap[project.id],
                  project.monthly_price
                )
                const siteStatus = getSiteStatus(
                  project.vercel_project_id,
                  siteControlMap[project.id]
                )
                return (
                  <tr key={project.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="p-0">
                      <Link href={`/admin/projects/${project.id}`} className="flex items-center gap-3 px-4 py-3">
                        <div className="hidden shrink-0 sm:block">
                          <WebsitePreview domain={project.domain} size="sm" />
                        </div>
                        <span className="text-sm font-medium text-white">{project.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {(project.profiles as { full_name: string | null })?.full_name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={project.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={siteStatus} /></td>
                    <td className="px-4 py-3 text-sm text-gray-300">{project.domain || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {project.monthly_price > 0 ? `$${project.monthly_price}/mo` : 'Free'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={billingStatus} /></td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(project.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 py-12 text-center">
          <p className="text-gray-500">No projects yet.</p>
        </div>
      )}
    </div>
  )
}
