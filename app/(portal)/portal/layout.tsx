import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

export default async function PortalLayout({
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

  // Check role — if admin, redirect to admin dashboard
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Portal Navigation */}
      <nav className="border-b border-dark-600/50 bg-dark-800/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/portal" className="flex items-center gap-3">
              <Image
                src="/images/logonobg.png"
                alt="FLUX"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-white font-semibold">Client Portal</span>
            </Link>

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
        </div>
      </nav>

      {/* Portal Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
