import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminNav } from './admin-nav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/portal')
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <AdminNav />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-dark-600/50 bg-dark-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-end h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {profile?.full_name || user.email}
              </span>
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
