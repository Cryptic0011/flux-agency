import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'
import { NotesFeed } from '@/components/ui/notes-feed'
import { NoteComposer } from '@/components/ui/note-composer'
import { ReadReceiptTracker } from '@/components/ui/read-receipt-tracker'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { WebsitePreview } from '@/components/ui/website-preview'
import { createNote } from '@/lib/actions/notes'
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

  const { data: { user } } = await supabase.auth.getUser()

  const { data: project } = await supabase
    .from('projects')
    .select('*, profiles!projects_client_id_fkey(full_name, email)')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const [{ data: siteControl }, { data: revisions }, { data: subscription }, { data: projectNotes }] = await Promise.all([
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
    supabase
      .from('notes')
      .select('*, profiles(full_name, role), note_attachments(*), note_read_receipts(user_id, read_at, profiles(full_name))')
      .eq('project_id', id)
      .is('revision_id', null)
      .order('created_at', { ascending: true }),
  ])

  const unreadNoteIds = (projectNotes || [])
    .filter(n =>
      n.author_id !== user!.id &&
      !n.note_read_receipts?.some((r: { user_id: string }) => r.user_id === user!.id)
    )
    .map(n => n.id)

  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

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
          {/* Website Preview */}
          {project.domain && (
            <WebsitePreview domain={project.domain} size="lg" />
          )}

          <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Edit Project</h1>

            <ProjectForm key={project.updated_at} project={project} action={updateProjectWithId} />
          </div>

          {/* Project Notes */}
          <div className="rounded-xl border border-dark-600/50 bg-dark-800/40">
            <div className="border-b border-dark-600/50 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">Notes</h2>
            </div>
            <div className="p-5">
              <NotesFeed notes={projectNotes || []} currentUserId={user!.id} storageUrl={storageUrl} />
              {unreadNoteIds.length > 0 && <ReadReceiptTracker noteIds={unreadNoteIds} />}
              <div className="mt-4">
                <NoteComposer action={createNote} projectId={id} placeholder="Add a note about this project..." />
              </div>
            </div>
          </div>

          {/* Revisions */}
          <div className="rounded-xl border border-dark-600/50 bg-dark-800/40">
            <div className="border-b border-dark-600/50 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">Revisions</h2>
            </div>
            {revisions && revisions.length > 0 ? (
              <div className="divide-y divide-dark-600/30">
                {revisions.map((rev) => (
                  <Link
                    key={rev.id}
                    href={`/admin/revisions/${rev.id}`}
                    className="block px-5 py-3 hover:bg-dark-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white truncate">{rev.title}</p>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <PriorityBadge priority={rev.priority} />
                        <StatusBadge status={rev.status} />
                      </div>
                    </div>
                  </Link>
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
