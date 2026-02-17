import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { StatusBadge } from '@/components/ui/status-badge'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { FilterSelect } from '@/components/ui/filter-form'

export const metadata = { title: 'Revisions — Admin' }

export default async function RevisionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: filterStatus } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('revisions')
    .select('*, profiles!revisions_client_id_fkey(full_name), projects(name)')
    .order('created_at', { ascending: false })

  if (filterStatus && filterStatus !== 'all') {
    query = query.eq('status', filterStatus)
  }

  const { data: revisions } = await query

  // Sort urgent revisions to top
  const sorted = (revisions || []).sort((a, b) => {
    if (a.priority === 'urgent' && b.priority !== 'urgent') return -1
    if (b.priority === 'urgent' && a.priority !== 'urgent') return 1
    return 0
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Revisions</h1>
        <p className="mt-1 text-sm text-gray-400">All client revision requests.</p>
      </div>

      <div className="mb-6">
        <FilterSelect
          name="status"
          defaultValue={filterStatus}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'rejected', label: 'Rejected' },
          ]}
        />
      </div>

      {sorted.length > 0 ? (
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 divide-y divide-dark-600/30">
          {sorted.map((rev) => (
            <Link
              key={rev.id}
              href={`/admin/revisions/${rev.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-dark-700/50 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{rev.title}</p>
                <p className="text-xs text-gray-500">
                  {(rev.profiles as { full_name: string | null })?.full_name || 'Unknown'} &middot;{' '}
                  {(rev.projects as { name: string })?.name || 'Unknown project'} &middot;{' '}
                  {new Date(rev.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <PriorityBadge priority={rev.priority} />
                <StatusBadge status={rev.status} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 py-12 text-center">
          <p className="text-gray-500">No revision requests found.</p>
        </div>
      )}
    </div>
  )
}
