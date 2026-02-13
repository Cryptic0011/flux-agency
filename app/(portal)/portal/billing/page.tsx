import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatCurrency } from '@/lib/utils'
import { redirectToBillingPortal } from './actions'

export const metadata = { title: 'Billing — Client Portal' }

export default async function BillingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profile }, { data: subscriptions }, { data: invoices }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user!.id)
        .single(),
      supabase
        .from('subscriptions')
        .select('*, projects(name)')
        .eq('client_id', user!.id)
        .eq('status', 'active'),
      supabase
        .from('invoices')
        .select('*, projects(name)')
        .eq('client_id', user!.id)
        .order('created_at', { ascending: false }),
    ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your subscriptions, view invoices, and update payment methods.
        </p>
      </div>

      {/* Active Subscriptions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Active Subscriptions</h2>
        {subscriptions && subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">
                    {(sub.projects as { name: string })?.name || 'Subscription'}
                  </h3>
                  <StatusBadge status={sub.status} />
                </div>
                <div className="space-y-2">
                  {sub.stripe_price_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Plan</span>
                      <span className="text-sm font-medium text-white">
                        Monthly subscription
                      </span>
                    </div>
                  )}
                  {sub.current_period_end && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Next billing date</span>
                      <span className="text-sm text-white">
                        {new Date(sub.current_period_end).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 py-8 text-center">
            <p className="text-sm text-gray-500">No active subscriptions</p>
          </div>
        )}
      </div>

      {/* Invoice History */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Invoice History</h2>
        {invoices && invoices.length > 0 ? (
          <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-600/50">
                    <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-gray-500">
                      Description
                    </th>
                    <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-gray-500">
                      Amount
                    </th>
                    <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right text-xs uppercase tracking-wider text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-600/30">
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="px-5 py-3 text-sm text-white whitespace-nowrap">
                        {new Date(inv.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-300">
                        {inv.description ||
                          (inv.projects as { name: string })?.name ||
                          `Invoice #${inv.number || '—'}`}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-white whitespace-nowrap">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        {inv.hosted_invoice_url ? (
                          <a
                            href={inv.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-neon-purple hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-sm text-gray-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 py-8 text-center">
            <p className="text-sm text-gray-500">No invoices yet.</p>
            <p className="mt-1 text-xs text-gray-600">
              Invoices will appear here once billing is set up.
            </p>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Payment Method</h2>
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-5">
          {profile?.stripe_customer_id ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">
                  Manage your payment methods, view billing history, and update card details.
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  You&apos;ll be redirected to our secure payment portal.
                </p>
              </div>
              <form action={redirectToBillingPortal}>
                <button
                  type="submit"
                  className="rounded-lg bg-neon-purple px-4 py-2 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors"
                >
                  Manage Payment Method
                </button>
              </form>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No payment method on file. Your admin will set up billing for you.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
