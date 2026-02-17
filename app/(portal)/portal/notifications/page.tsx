import { createClient } from '@/lib/supabase/server'
import { relativeTime } from '@/lib/utils'
import Link from 'next/link'
import { markAllNotificationsRead } from '@/lib/actions/notifications'

export const metadata = { title: 'Notifications — Client Portal' }

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="mt-1 text-sm text-gray-400">All your recent notifications.</p>
        </div>
        <form action={markAllNotificationsRead}>
          <button
            type="submit"
            className="rounded-lg border border-dark-600 bg-dark-700 px-4 py-2 text-sm text-gray-300 hover:text-white hover:border-dark-500 transition-colors"
          >
            Mark all as read
          </button>
        </form>
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 divide-y divide-dark-600/30">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              href={notif.link}
              className={`flex items-start gap-4 px-5 py-4 hover:bg-dark-700/50 transition-colors ${
                !notif.is_read ? 'bg-neon-purple/5' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-sm ${notif.is_read ? 'text-gray-400' : 'text-white font-medium'}`}>
                    {notif.title}
                  </p>
                  {!notif.is_read && (
                    <span className="h-2 w-2 rounded-full bg-neon-purple shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{notif.body}</p>
              </div>
              <span className="text-xs text-gray-500 shrink-0 mt-0.5">
                {relativeTime(notif.created_at)}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 py-12 text-center">
          <p className="text-gray-500">No notifications yet.</p>
        </div>
      )}
    </div>
  )
}
