import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'
import { updateLead, convertLeadToClient } from '../actions'

export const metadata = { title: 'Lead Detail — Admin' }

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (!lead) notFound()

  const updateLeadWithId = updateLead.bind(null, id)
  const convertWithId = convertLeadToClient.bind(null, id)

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/leads" className="text-sm text-gray-400 hover:text-white transition-colors">
          &larr; Back to Leads
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Info */}
        <div className="lg:col-span-2 rounded-xl border border-dark-600/50 bg-dark-800/40 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
            <StatusBadge status={lead.status} />
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-xs uppercase tracking-wider text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-white">
                <a href={`mailto:${lead.email}`} className="text-neon-purple hover:underline">
                  {lead.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-white">{lead.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-gray-500">Business Type</dt>
              <dd className="mt-1 text-sm text-white">{lead.business_type || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-gray-500">Submitted</dt>
              <dd className="mt-1 text-sm text-white">
                {new Date(lead.created_at).toLocaleString()}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wider text-gray-500">Message</dt>
              <dd className="mt-1 text-sm text-gray-300 whitespace-pre-wrap">
                {lead.message || '—'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Actions */}
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>

          <form action={updateLeadWithId} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
              <select
                name="status"
                defaultValue={lead.status}
                className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2.5 text-sm text-white focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
              >
                {['new', 'contacted', 'qualified', 'converted', 'lost'].map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Notes</label>
              <textarea
                name="notes"
                defaultValue={lead.notes || ''}
                rows={4}
                className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple resize-y"
                placeholder="Add internal notes..."
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-neon-purple px-4 py-2.5 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors"
            >
              Save Changes
            </button>
          </form>

          {lead.status === 'qualified' && (
            <form action={convertWithId} className="mt-4">
              <button
                type="submit"
                className="w-full rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-2.5 text-sm font-medium text-green-400 hover:bg-green-500/20 transition-colors"
              >
                Convert to Client
              </button>
              <p className="mt-2 text-xs text-gray-500">
                This sends an email invite to the lead and creates a client account.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
