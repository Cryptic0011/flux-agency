import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'
import { updateProject, updateSiteControl } from '../actions'
import { ProjectForm } from './project-form'
import { SiteControl } from './site-control'

export const metadata = { title: 'Project Detail — Admin' }

function getBillingBadge(subscription: { status: string } | null, monthlyPrice: number) {
  if (monthlyPrice === 0) return { label: 'Free', status: 'completed' }
  if (!subscription) return { label: 'No Subscription', status: 'draft' }
  if (subscription.status === 'active') return { label: 'Paid', status: 'active' }
  if (subscription.status === 'past_due') return { label: 'Past Due', status: 'lost' }
  if (subscription.status === 'canceled') return { label: 'Canceled', status: 'lost' }
  if (subscription.status === 'incomplete') return { label: 'Incomplete', status: 'paused' }
  return { label: subscription.status, status: 'paused' }
}

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

  const [{ data: siteControl }, { data: revisions }, { data: subscription }] = await Promise.all([
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
    supabase
      .from('subscriptions')
      .select('status')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  const updateProjectWithId = updateProject.bind(null, id)
  const updateSiteControlWithId = updateSiteControl.bind(null, id)

  const client = project.profiles as { full_name: string | null; email: string }
  const billing = getBillingBadge(subscription, project.monthly_price)

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

            <ProjectForm key={project.updated_at} project={project} action={updateProjectWithId} />
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
          {/* Billing Status */}
          <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Billing</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Status</span>
                <StatusBadge status={billing.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Price</span>
                <span className="text-sm text-white">
                  {project.monthly_price > 0 ? `$${project.monthly_price}/mo` : 'Free'}
                </span>
              </div>
              {project.stripe_product_id && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Stripe</span>
                  <span className="text-xs text-gray-500 font-mono truncate ml-2">{project.stripe_product_id}</span>
                </div>
              )}
            </div>
          </div>

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

              <SiteControl siteControl={siteControl} action={updateSiteControlWithId} hasVercelProject={!!project.vercel_project_id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
