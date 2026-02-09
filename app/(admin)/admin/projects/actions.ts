'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')
  return supabase
}

export async function createProject(formData: FormData) {
  const supabase = await requireAdmin()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const client_id = formData.get('client_id') as string
  const domain = formData.get('domain') as string
  const monthly_price = parseFloat(formData.get('monthly_price') as string) || 0
  const status = formData.get('status') as string

  const { data: project, error } = await supabase
    .from('projects')
    .insert({ name, description, client_id, domain, monthly_price, status })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  // Create site_controls row
  await supabase
    .from('site_controls')
    .insert({ project_id: project.id })

  revalidatePath('/admin/projects')
  revalidatePath('/admin')
  redirect(`/admin/projects/${project.id}`)
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await requireAdmin()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const domain = formData.get('domain') as string
  const monthly_price = parseFloat(formData.get('monthly_price') as string) || 0
  const status = formData.get('status') as string

  await supabase
    .from('projects')
    .update({ name, description, domain, monthly_price, status, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath(`/admin/projects/${id}`)
  revalidatePath('/admin/projects')
  revalidatePath('/admin')
}

export async function updateSiteControl(projectId: string, formData: FormData) {
  const supabase = await requireAdmin()

  const is_live = formData.get('is_live') === 'true'
  const auto_pause_enabled = formData.get('auto_pause_enabled') === 'true'

  await supabase
    .from('site_controls')
    .update({
      is_live,
      auto_pause_enabled,
      paused_reason: is_live ? null : 'manual',
      updated_at: new Date().toISOString(),
    })
    .eq('project_id', projectId)

  revalidatePath(`/admin/projects/${projectId}`)
}
