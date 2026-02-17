import { MarkdownRenderer } from './markdown-renderer'
import { relativeTime } from '@/lib/utils'

interface NoteAttachment {
  id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
}

interface ReadReceipt {
  user_id: string
  read_at: string
  profiles: { full_name: string | null }
}

interface Note {
  id: string
  content: string
  created_at: string
  author_id: string
  profiles: { full_name: string | null; role: string }
  note_attachments: NoteAttachment[]
  note_read_receipts: ReadReceipt[]
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

export function NotesFeed({
  notes,
  currentUserId,
  storageUrl,
}: {
  notes: Note[]
  currentUserId: string
  storageUrl: string
}) {
  if (notes.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-gray-500">No notes yet — start the conversation.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => {
        const isAdmin = note.profiles?.role === 'admin'
        const otherReadReceipts = note.note_read_receipts?.filter(
          (r) => r.user_id !== note.author_id
        ) || []

        return (
          <div key={note.id} className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                isAdmin ? 'bg-gradient-to-br from-neon-purple to-neon-blue text-white' : 'bg-dark-600 text-gray-300'
              }`}>
                {(note.profiles?.full_name || '?')[0].toUpperCase()}
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-white truncate">
                  {note.profiles?.full_name || 'Unknown'}
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-neon-purple/20 text-neon-purple border border-neon-purple/30">Admin</span>
                )}
              </div>
              <span className="ml-auto text-xs text-gray-500 shrink-0" title={new Date(note.created_at).toLocaleString()}>
                {relativeTime(note.created_at)}
              </span>
            </div>

            {/* Content */}
            <div className="ml-9">
              <MarkdownRenderer content={note.content} />

              {/* Attachments */}
              {note.note_attachments?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {note.note_attachments.filter(a => isImage(a.mime_type)).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.note_attachments.filter(a => isImage(a.mime_type)).map((att) => (
                        <a key={att.id} href={`${storageUrl}/storage/v1/object/authenticated/note-attachments/${att.file_path}`} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-dark-600 hover:border-neon-purple transition-colors">
                          <img src={`${storageUrl}/storage/v1/object/authenticated/note-attachments/${att.file_path}`} alt={att.file_name} className="max-h-48 max-w-xs object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                  {note.note_attachments.filter(a => !isImage(a.mime_type)).map((att) => (
                    <a key={att.id} href={`${storageUrl}/storage/v1/object/authenticated/note-attachments/${att.file_path}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-dark-600 bg-dark-700 px-3 py-1.5 hover:border-neon-purple transition-colors">
                      <svg className="h-4 w-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                      <span className="text-xs text-gray-300 truncate max-w-[160px]">{att.file_name}</span>
                      <span className="text-xs text-gray-500">{formatFileSize(att.file_size)}</span>
                    </a>
                  ))}
                </div>
              )}

              {/* Read receipts */}
              {otherReadReceipts.length > 0 && (
                <p className="mt-2 text-[11px] text-gray-600">
                  Seen by {otherReadReceipts.map(r => r.profiles?.full_name || 'Unknown').join(', ')}
                  {' · '}
                  {relativeTime(otherReadReceipts[otherReadReceipts.length - 1].read_at)}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
