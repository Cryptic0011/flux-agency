import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'
import { InvoiceBuilder } from './invoice-builder'
import { CheckoutLinkButton } from './checkout-link'

export const metadata = { title: 'Client Detail — Admin' }

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: client } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'client')
    .single()

  if (!client) notFound()

  const [{ data: projects }, { data: revisions }, { data: invoices }, { data: subscriptions }] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('revisions')
      .select('*, projects(name)')
      .eq('client_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('invoices')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('project_id, status')
      .eq('client_id', id),
  ])

  // Build a map of project_id -> subscription status
  const subStatusMap: Record<string, string> = {}
  subscriptions?.forEach((sub) => {
    if (sub.project_id) subStatusMap[sub.project_id] = sub.status
  })

  // Calculate MRR: sum of monthly_price for projects with active subscriptions
  const mrr = (projects || []).reduce((sum, p) => {
    if (subStatusMap[p.id] === 'active' && p.monthly_price > 0) {
      return sum + p.monthly_price
    }
    return sum
  }, 0)

  // Projects eligible for checkout link: has stripe_price_id but no active subscription
  const checkoutEligible = (projects || []).filter(
    (p) => p.stripe_price_id && subStatusMap[p.id] !== 'active'
  )

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/clients" className="text-sm text-gray-400 hover:text-white transition-colors">
          &larr; Back to Clients
        </Link>
      </div>

      {/* Client Info */}
      <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">{client.full_name || 'Unnamed'}</h1>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-white">{client.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500">Role</dt>
            <dd className="mt-1 text-sm text-white capitalize">{client.role}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500">Joined</dt>
            <dd className="mt-1 text-sm text-white">{new Date(client.created_at).toLocaleDateString()}</dd>
          </div>
        </dl>
      </div>

      {/* Billing Overview */}
      <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Billing Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500">Monthly Revenue</dt>
            <dd className="mt-1 text-2xl font-bold text-white">${mrr.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500">Payment Method</dt>
            <dd className="mt-1 text-sm text-white">
              {client.stripe_customer_id ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  On file
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-500" />
                  Not configured
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500">Stripe Customer</dt>
            <dd className="mt-1 text-xs text-gray-400 font-mono">
              {client.stripe_customer_id || 'None'}
            </dd>
          </div>
        </div>

        {/* Checkout links for eligible projects */}
        {checkoutEligible.length > 0 && (
          <div className="border-t border-dark-600/50 pt-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Generate Checkout Links</h3>
            <div className="space-y-3">
              {checkoutEligible.map((project) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{project.name}</p>
                    <p className="text-xs text-gray-500">${project.monthly_price}/mo</p>
                  </div>
                  <CheckoutLinkButton
                    projectId={project.id}
                    clientId={id}
                    projectName={project.name}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Projects */}
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40">
          <div className="flex items-center justify-between border-b border-dark-600/50 px-5 py-4">
            <h2 className="text-lg font-semibold text-white">Projects</h2>
            <Link
              href={`/admin/projects/new?client=${id}`}
              className="text-sm text-neon-purple hover:text-neon-purple/80"
            >
              + New Project
            </Link>
          </div>
          {projects && projects.length > 0 ? (
            <div className="divide-y divide-dark-600/30">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-dark-700/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.domain || 'No domain'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.monthly_price > 0 && (
                      <span className="text-xs text-gray-400">${project.monthly_price}/mo</span>
                    )}
                    <StatusBadge status={project.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-500">No projects yet</p>
            </div>
          )}
        </div>

        {/* Revisions */}
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40">
          <div className="flex items-center justify-between border-b border-dark-600/50 px-5 py-4">
            <h2 className="text-lg font-semibold text-white">Revision Requests</h2>
          </div>
          {revisions && revisions.length > 0 ? (
            <div className="divide-y divide-dark-600/30">
              {revisions.map((rev) => (
                <div
                  key={rev.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{rev.title}</p>
                    <p className="text-xs text-gray-500">
                      {(rev.projects as { name: string })?.name || 'Unknown project'}
                    </p>
                  </div>
                  <StatusBadge status={rev.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-500">No revision requests</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoices Section */}
      <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 mb-6">
        <div className="flex items-center justify-between border-b border-dark-600/50 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Invoices</h2>
          <InvoiceBuilder
            clientId={id}
            projects={(projects || []).map((p) => ({ id: p.id, name: p.name }))}
          />
        </div>
        {invoices && invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600/50">
                  {['Date', 'Number', 'Description', 'Amount', 'Status', 'View'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600/30">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {inv.number || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {inv.description || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-medium">
                      ${(inv.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3">
                      {inv.hosted_invoice_url ? (
                        <a
                          href={inv.hosted_invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-neon-purple hover:text-neon-purple/80"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-500">No invoices yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
