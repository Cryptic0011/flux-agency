import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { NotesFeed } from '@/components/ui/notes-feed'
import { NoteComposer } from '@/components/ui/note-composer'
import { ReadReceiptTracker } from '@/components/ui/read-receipt-tracker'
import { createNote } from '@/lib/actions/notes'
import { updateRevisionStatus } from '../actions'
import { relativeTime } from '@/lib/utils'

export const metadata = { title: 'Revision Detail — Admin' }

export default async function AdminRevisionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: revision } = await supabase
    .from('revisions')
    .select('*, profiles!revisions_client_id_fkey(full_name), projects(id, name)')
    .eq('id', id)
    .single()

  if (!revision) notFound()

  const { data: notes } = await supabase
    .from('notes')
    .select('*, profiles(full_name, role), note_attachments(*), note_read_receipts(user_id, read_at, profiles(full_name))')
    .eq('revision_id', id)
    .order('created_at', { ascending: true })

  const unreadNoteIds = (notes || [])
    .filter(n =>
      n.author_id !== user!.id &&
      !n.note_read_receipts?.some((r: { user_id: string }) => r.user_id === user!.id)
    )
    .map(n => n.id)

  const projectId = (revision.projects as { id: string; name: string })?.id
  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const updateWithId = updateRevisionStatus.bind(null, revision.id)

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/revisions"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back to Revisions
        </Link>
      </div>

      <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">{revision.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              by {(revision.profiles as { full_name: string | null })?.full_name || 'Unknown'}
              {' \u00b7 '}
              {(revision.projects as { id: string; name: string })?.name}
              {' \u00b7 '}
              {relativeTime(revision.created_at)}
            </p>
            {revision.description && (
              <p className="mt-3 text-sm text-gray-400">{revision.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <PriorityBadge priority={revision.priority} />
          </div>
        </div>

        <form action={updateWithId} className="mt-4 pt-4 border-t border-dark-600/50 flex items-center gap-3">
          <input type="hidden" name="admin_notes" value="" />
          <select
            name="status"
            defaultValue={revision.status}
            className="rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-white focus:border-neon-purple focus:outline-none"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-neon-purple px-4 py-2 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors"
          >
            Update Status
          </button>
        </form>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Discussion</h2>
        <NotesFeed
          notes={notes || []}
          currentUserId={user!.id}
          storageUrl={storageUrl}
        />
      </div>

      {unreadNoteIds.length > 0 && (
        <ReadReceiptTracker noteIds={unreadNoteIds} />
      )}

      <NoteComposer
        action={createNote}
        projectId={projectId}
        revisionId={id}
        placeholder="Add a note to this revision..."
      />
    </div>
  )
}
