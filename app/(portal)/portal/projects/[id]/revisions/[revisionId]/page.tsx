import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { NotesFeed } from '@/components/ui/notes-feed'
import { NoteComposer } from '@/components/ui/note-composer'
import { ReadReceiptTracker } from '@/components/ui/read-receipt-tracker'
import { createNote } from '@/lib/actions/notes'
import { relativeTime } from '@/lib/utils'

export const metadata = { title: 'Revision Detail — Client Portal' }

export default async function ClientRevisionDetailPage({
  params,
}: {
  params: Promise<{ id: string; revisionId: string }>
}) {
  const { id, revisionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: revision } = await supabase
    .from('revisions')
    .select('*, projects(name)')
    .eq('id', revisionId)
    .eq('project_id', id)
    .eq('client_id', user!.id)
    .single()

  if (!revision) notFound()

  const { data: notes } = await supabase
    .from('notes')
    .select('*, profiles(full_name, role), note_attachments(*), note_read_receipts(user_id, read_at, profiles(full_name))')
    .eq('revision_id', revisionId)
    .order('created_at', { ascending: true })

  const unreadNoteIds = (notes || [])
    .filter(n =>
      n.author_id !== user!.id &&
      !n.note_read_receipts?.some((r: { user_id: string }) => r.user_id === user!.id)
    )
    .map(n => n.id)

  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/portal/projects/${id}`}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back to {(revision.projects as { name: string })?.name}
        </Link>
      </div>

      <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">{revision.title}</h1>
            {revision.description && (
              <p className="mt-2 text-sm text-gray-400">{revision.description}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Submitted {relativeTime(revision.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <PriorityBadge priority={revision.priority} />
            <StatusBadge status={revision.status} />
          </div>
        </div>
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
        projectId={id}
        revisionId={revisionId}
        placeholder="Add a note to this revision..."
      />
    </div>
  )
}
