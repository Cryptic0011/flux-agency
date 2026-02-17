'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ---------------------------------------------------------------------------
// Helper: insert a notification record
// ---------------------------------------------------------------------------
async function createNotification(
  supabase: Awaited<ReturnType<typeof createClient>>,
  {
    recipientId,
    type,
    title,
    body,
    link,
    projectId,
    revisionId,
    noteId,
  }: {
    recipientId: string
    type: string
    title: string
    body: string
    link: string
    projectId: string
    revisionId?: string | null
    noteId: string
  }
) {
  await supabase.from('notifications').insert({
    recipient_id: recipientId,
    type,
    title,
    body,
    link,
    project_id: projectId,
    revision_id: revisionId ?? null,
    note_id: noteId,
    is_read: false,
    email_sent: false,
  })
}

// ---------------------------------------------------------------------------
// createNote
// ---------------------------------------------------------------------------
export async function createNote(formData: FormData) {
  const supabase = await createClient()

  // 1. Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Determine the author's role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')

  // 2. Read form fields
  const content = formData.get('content') as string
  const project_id = formData.get('project_id') as string
  const revision_id = (formData.get('revision_id') as string) || null

  if (!content || !project_id) {
    throw new Error('Content and project_id are required')
  }

  // 3. Validate access
  if (profile.role === 'client') {
    // Clients can only post notes on their own projects
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('client_id', user.id)
      .single()

    if (!project) throw new Error('Project not found or access denied')
  }
  // Admins can access any project — no extra check needed

  // 4. Insert note record
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .insert({
      project_id,
      revision_id,
      author_id: user.id,
      content,
    })
    .select('id')
    .single()

  if (noteError || !note) {
    throw new Error(noteError?.message ?? 'Failed to create note')
  }

  // 5. Handle file attachments
  const files = formData.getAll('files') as File[]

  for (const file of files) {
    // Skip empty file inputs (browsers send an empty File when no file is chosen)
    if (!file || file.size === 0) continue

    const fileId = crypto.randomUUID()
    const storagePath = `${project_id}/${note.id}/${fileId}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('note-attachments')
      .upload(storagePath, file)

    if (uploadError) {
      console.error(`Failed to upload attachment ${file.name}:`, uploadError.message)
      continue
    }

    await supabase.from('note_attachments').insert({
      note_id: note.id,
      file_name: file.name,
      file_path: storagePath,
      file_size: file.size,
      mime_type: file.type || 'application/octet-stream',
    })
  }

  // 6. Create notifications for the other party
  const { data: project } = await supabase
    .from('projects')
    .select('id, client_id, name')
    .eq('id', project_id)
    .single()

  if (project) {
    const notificationBase = {
      type: 'new_note',
      title: 'New note',
      body: content.length > 120 ? content.slice(0, 120) + '...' : content,
      link: `/portal/projects/${project_id}`,
      projectId: project_id,
      revisionId: revision_id,
      noteId: note.id,
    }

    if (profile.role === 'admin') {
      // Notify the project's client
      await createNotification(supabase, {
        ...notificationBase,
        recipientId: project.client_id,
      })
    } else {
      // Client posted — notify all admin users
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')

      if (admins) {
        for (const admin of admins) {
          await createNotification(supabase, {
            ...notificationBase,
            recipientId: admin.id,
            link: `/admin/projects/${project_id}`,
          })
        }
      }
    }
  }

  // 7. Revalidate relevant paths
  revalidatePath(`/portal/projects/${project_id}`)
  revalidatePath(`/admin/projects/${project_id}`)
  revalidatePath('/portal')
  revalidatePath('/admin')
}

// ---------------------------------------------------------------------------
// markNoteRead — creates / upserts a read receipt for the current user
// ---------------------------------------------------------------------------
export async function markNoteRead(noteId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('note_read_receipts').upsert(
    {
      note_id: noteId,
      user_id: user.id,
      read_at: new Date().toISOString(),
    },
    { onConflict: 'note_id,user_id' }
  )
}

// ---------------------------------------------------------------------------
// markNotesRead — bulk version
// ---------------------------------------------------------------------------
export async function markNotesRead(noteIds: string[]) {
  if (!noteIds.length) return

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const rows = noteIds.map((noteId) => ({
    note_id: noteId,
    user_id: user.id,
    read_at: new Date().toISOString(),
  }))

  await supabase
    .from('note_read_receipts')
    .upsert(rows, { onConflict: 'note_id,user_id' })
}
