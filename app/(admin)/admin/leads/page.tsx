import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'
import { FilterSelect } from '@/components/ui/filter-form'

export const metadata = { title: 'Leads — Admin' }

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status: filterStatus, q: search } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (filterStatus && filterStatus !== 'all') {
    query = query.eq('status', filterStatus)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data: leads } = await query

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Leads</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage incoming leads from the contact form.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <FilterSelect
          name="status"
          defaultValue={filterStatus}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'new', label: 'New' },
            { value: 'contacted', label: 'Contacted' },
            { value: 'qualified', label: 'Qualified' },
            { value: 'converted', label: 'Converted' },
            { value: 'lost', label: 'Lost' },
          ]}
        />
        <form className="flex flex-1 gap-3">
          <input
            name="q"
            type="text"
            placeholder="Search by name or email..."
            defaultValue={search || ''}
            className="flex-1 rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-neon-purple px-4 py-2 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      {leads && leads.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-dark-600/50 bg-dark-800/40">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600/50">
                {['Name', 'Email', 'Phone', 'Type', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600/30">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-dark-700/50 transition-colors">
                  <td className="p-0">
                    <Link href={`/admin/leads/${lead.id}`} className="block px-4 py-3 text-sm font-medium text-white">
                      {lead.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{lead.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{lead.phone || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{lead.business_type || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 py-12 text-center">
          <p className="text-gray-500">No leads found.</p>
        </div>
      )}
    </div>
  )
}
