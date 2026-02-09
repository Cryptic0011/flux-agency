import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Client Portal',
  description: 'Manage your projects, view invoices, and request revisions.',
}

export default async function PortalPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="mt-2 text-gray-400">
          Your project dashboard is being set up. Check back soon for updates.
        </p>
      </div>

      {/* Placeholder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Projects', 'Invoices', 'Revisions'].map((title) => (
          <div
            key={title}
            className="p-6 rounded-2xl bg-dark-800/40 border border-dark-600/50"
          >
            <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
            <p className="text-sm text-gray-500">Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  )
}
