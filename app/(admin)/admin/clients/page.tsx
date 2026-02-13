import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Clients — Admin' }

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('profiles')
    .select('*, projects(id)')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="mt-1 text-sm text-gray-400">
            All registered client accounts.
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          className="rounded-lg bg-neon-purple px-4 py-2 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors"
        >
          + New Client
        </Link>
      </div>

      {clients && clients.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-dark-600/50 bg-dark-800/40">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600/50">
                {['Name', 'Email', 'Projects', 'Joined'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600/30">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-dark-700/50 transition-colors">
                  <td className="p-0">
                    <Link href={`/admin/clients/${client.id}`} className="block px-4 py-3 text-sm font-medium text-white">
                      {client.full_name || 'Unnamed'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{client.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {(client.projects as { id: string }[])?.length || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 py-12 text-center">
          <p className="text-gray-500">No clients yet.</p>
        </div>
      )}
    </div>
  )
}
