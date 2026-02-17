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
import { relativeTime } from '@/lib/utils'

export const metadata = { title: 'Project — Client Portal' }

/** Map event_type to a timeline dot color */
function timelineDotColor(eventType: string): string {
  if (eventType.includes('paid') || eventType.includes('payment'))
    return 'bg-green-400'
  if (eventType.includes('subscription'))
    return 'bg-blue-400'
  if (eventType.includes('revision'))
    return 'bg-purple-400'
  if (eventType.includes('invoice'))
    return 'bg-yellow-400'
  return 'bg-gray-400'
}

export default async function PortalProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: project }, { data: revisions }, { data: subscription }, { data: activityLog }, { data: projectNotes }] =
    await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('client_id', user!.id)
        .single(),
      supabase
        .from('revisions')
        .select('*')
        .eq('project_id', id)
        .eq('client_id', user!.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('project_id', id)
        .eq('client_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('activity_log')
        .select('id, event_type, description, created_at')
        .eq('project_id', id)
        .eq('client_id', user!.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('notes')
        .select('*, profiles(full_name, role), note_attachments(*), note_read_receipts(user_id, read_at, profiles(full_name))')
        .eq('project_id', id)
        .is('revision_id', null)
        .order('created_at', { ascending: true }),
    ])

  if (!project) notFound()

  const unreadNoteIds = (projectNotes || [])
    .filter(n =>
      n.author_id !== user!.id &&
      !n.note_read_receipts?.some((r: { user_id: string }) => r.user_id === user!.id)
    )
    .map(n => n.id)

  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  return (
    <div>
      <div className="mb-6">
        <Link href="/portal" className="text-sm text-gray-400 hover:text-white transition-colors">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Website Preview */}
      {project.domain && (
        <div className="mb-6">
          <WebsitePreview domain={project.domain} size="lg" />
        </div>
      )}

      {/* Project Info + Billing Summary side by side on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Project Info */}
        <div className="lg:col-span-2 rounded-xl border border-dark-600/50 bg-dark-800/40 p-6">
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

        {/* Billing Summary Card */}
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Billing Summary</h2>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-gray-500">Monthly Price</span>
              <p className="text-lg font-bold text-white">
                {project.monthly_price > 0 ? `$${project.monthly_price}/mo` : 'Free'}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Subscription Status</span>
              <div className="mt-1">
                {subscription ? (
                  <StatusBadge status={subscription.status} />
                ) : project.monthly_price > 0 ? (
                  <p className="text-sm text-yellow-400">Billing not yet activated</p>
                ) : (
                  <StatusBadge status="no_billing" />
                )}
              </div>
            </div>
            {subscription?.current_period_end && (
              <div>
                <span className="text-xs text-gray-500">Next Billing Date</span>
                <p className="mt-1 text-sm text-white">
                  {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Notes */}
      <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 mb-6">
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
      <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 mb-6">
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
              <Link
                key={rev.id}
                href={`/portal/projects/${id}/revisions/${rev.id}`}
                className="block px-5 py-4 hover:bg-dark-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white truncate">{rev.title}</h3>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <PriorityBadge priority={rev.priority} />
                    <StatusBadge status={rev.status} />
                    <span className="text-xs text-gray-500">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-500">No revision requests yet.</p>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Activity Timeline</h2>
        {activityLog && activityLog.length > 0 ? (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-dark-600/50" />
            <div className="space-y-4">
              {activityLog.map((entry) => (
                <div key={entry.id} className="relative flex items-start gap-4 pl-6">
                  {/* Dot */}
                  <span
                    className={`absolute left-0 top-1.5 h-[14px] w-[14px] rounded-full border-2 border-dark-800 ${timelineDotColor(entry.event_type)}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">{entry.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {relativeTime(entry.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No activity yet for this project.</p>
        )}
      </div>
    </div>
  )
}
