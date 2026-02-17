'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateRevisionStatus(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const status = formData.get('status') as string
  const admin_notes = formData.get('admin_notes') as string

  await supabase
    .from('revisions')
    .update({ status, admin_notes, updated_at: new Date().toISOString() })
    .eq('id', id)

  // Notify the client about the status change
  const { data: revision } = await supabase
    .from('revisions')
    .select('client_id, title, project_id')
    .eq('id', id)
    .single()

  if (revision) {
    await supabase.from('notifications').insert({
      recipient_id: revision.client_id,
      type: 'status_change',
      title: `Revision "${revision.title}" marked as ${status.replace(/_/g, ' ')}`,
      body: admin_notes || `Status changed to ${status.replace(/_/g, ' ')}`,
      link: `/portal/projects/${revision.project_id}/revisions/${id}`,
      project_id: revision.project_id,
      revision_id: id,
    })
  }

  revalidatePath('/admin/revisions')
  revalidatePath(`/admin/revisions/${id}`)
  revalidatePath('/admin')
  if (revision) {
    revalidatePath(`/portal/projects/${revision.project_id}`)
  }
}
