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

  revalidatePath('/admin/revisions')
  revalidatePath('/admin')
}
