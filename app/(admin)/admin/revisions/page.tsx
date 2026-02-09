import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'
import { FilterSelect } from '@/components/ui/filter-form'
import { updateRevisionStatus } from './actions'

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Revisions</h1>
        <p className="mt-1 text-sm text-gray-400">
          All client revision requests.
        </p>
      </div>

      {/* Status filter */}
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

      {revisions && revisions.length > 0 ? (
        <div className="space-y-3">
          {revisions.map((rev) => {
            const updateWithId = updateRevisionStatus.bind(null, rev.id)
            return (
              <details
                key={rev.id}
                className="group rounded-xl border border-dark-600/50 bg-dark-800/40 overflow-hidden"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-dark-700/50 transition-colors list-none">
                  <div className="flex items-center gap-4 min-w-0">
                    <svg className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-90 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{rev.title}</p>
                      <p className="text-xs text-gray-500">
                        {(rev.profiles as { full_name: string | null })?.full_name || 'Unknown'} &middot;{' '}
                        {(rev.projects as { name: string })?.name || 'Unknown project'} &middot;{' '}
                        {new Date(rev.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={rev.status} />
                </summary>

                <div className="border-t border-dark-600/50 px-5 py-4">
                  {rev.description && (
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Description</p>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{rev.description}</p>
                    </div>
                  )}

                  <form action={updateWithId} className="space-y-3">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-gray-500 mb-1 block">Admin Notes</label>
                      <textarea
                        name="admin_notes"
                        defaultValue={rev.admin_notes || ''}
                        rows={2}
                        className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple resize-y"
                        placeholder="Add notes..."
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        name="status"
                        defaultValue={rev.status}
                        className="rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-white focus:border-neon-purple focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg bg-neon-purple px-4 py-2 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </details>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 py-12 text-center">
          <p className="text-gray-500">No revision requests found.</p>
        </div>
      )}
    </div>
  )
}
