'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createRevision(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const project_id = formData.get('project_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = (formData.get('priority') as string) || 'normal'

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('client_id', user.id)
    .single()

  if (!project) throw new Error('Project not found or access denied')

  const { data: revision } = await supabase
    .from('revisions')
    .insert({ project_id, client_id: user.id, title, description, priority })
    .select('id')
    .single()

  if (!revision) throw new Error('Failed to create revision')

  // Create the initial note from the description if provided
  if (description?.trim()) {
    await supabase.from('notes').insert({
      project_id,
      revision_id: revision.id,
      author_id: user.id,
      content: description,
    })
  }

  // Notify all admins
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')

  if (admins) {
    for (const admin of admins) {
      await supabase.from('notifications').insert({
        recipient_id: admin.id,
        type: 'new_revision',
        title: `New revision request: ${title}`,
        body: description?.slice(0, 100) || title,
        link: `/admin/revisions/${revision.id}`,
        project_id,
        revision_id: revision.id,
      })
    }
  }

  revalidatePath(`/portal/projects/${project_id}`)
  revalidatePath('/portal')
  revalidatePath('/admin/revisions')
  revalidatePath('/admin')
  redirect(`/portal/projects/${project_id}/revisions/${revision.id}`)
}
