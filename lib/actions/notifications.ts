'use server'

import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// getUnreadNotificationCount
// ---------------------------------------------------------------------------
export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 0

  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false)

  return count ?? 0
}

// ---------------------------------------------------------------------------
// markNotificationRead
// ---------------------------------------------------------------------------
export async function markNotificationRead(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('recipient_id', user.id)
}

// ---------------------------------------------------------------------------
// markAllNotificationsRead
// ---------------------------------------------------------------------------
export async function markAllNotificationsRead() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false)
}
