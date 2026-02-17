'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { markNotificationRead, markAllNotificationsRead } from '@/lib/actions/notifications'
import { relativeTime } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  link: string
  is_read: boolean
  created_at: string
}

export function NotificationBell({
  notifications,
  unreadCount,
  viewAllHref,
}: {
  notifications: Notification[]
  unreadCount: number
  viewAllHref: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const baseTitle = document.title.replace(/^\(\d+\)\s*/, '')
    document.title = unreadCount > 0 ? `(${unreadCount}) ${baseTitle}` : baseTitle
    return () => { document.title = baseTitle }
  }, [unreadCount])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) await markNotificationRead(notif.id)
    setOpen(false)
    router.push(notif.link)
    router.refresh()
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    router.refresh()
  }

  const notificationIcon = (type: string) => {
    if (type === 'new_note') return '\u{1F4AC}'
    if (type === 'new_revision') return '\u{270F}\u{FE0F}'
    if (type === 'status_change') return '\u{1F504}'
    if (type.includes('payment') || type.includes('invoice')) return '\u{1F4B0}'
    return '\u{1F514}'
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative rounded-lg p-2 text-gray-400 hover:text-white hover:bg-dark-700/50 transition-colors">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-dark-600/50 bg-dark-800 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-dark-600/50 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-neon-purple hover:text-neon-purple/80 transition-colors">Mark all read</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <button key={notif.id} onClick={() => handleNotificationClick(notif)} className={`w-full text-left px-4 py-3 border-b border-dark-600/30 hover:bg-dark-700/50 transition-colors ${!notif.is_read ? 'bg-neon-purple/5' : ''}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-sm mt-0.5">{notificationIcon(notif.type)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${notif.is_read ? 'text-gray-400' : 'text-white font-medium'}`}>{notif.title}</p>
                        {!notif.is_read && <span className="h-2 w-2 rounded-full bg-neon-purple shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{notif.body}</p>
                      <p className="text-xs text-gray-600 mt-1">{relativeTime(notif.created_at)}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center"><p className="text-sm text-gray-500">No notifications</p></div>
            )}
          </div>
          <div className="border-t border-dark-600/50 px-4 py-2.5">
            <Link href={viewAllHref} onClick={() => setOpen(false)} className="block text-center text-xs text-neon-purple hover:text-neon-purple/80 transition-colors">View all notifications</Link>
          </div>
        </div>
      )}
    </div>
  )
}
