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

  // Verify user owns this project
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('client_id', user.id)
    .single()

  if (!project) throw new Error('Project not found or access denied')

  await supabase
    .from('revisions')
    .insert({
      project_id,
      client_id: user.id,
      title,
      description,
    })

  revalidatePath(`/portal/projects/${project_id}`)
  revalidatePath('/portal')
  redirect(`/portal/projects/${project_id}`)
}
