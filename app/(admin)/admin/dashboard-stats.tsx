'use client'

import { useState } from 'react'
import Link from 'next/link'
import { StatusBadge } from '@/components/ui/status-badge'

type Invoice = {
  id: string
  client_id: string
  project_id: string | null
  amount: number
  status: string
  due_date: string | null
  description: string | null
  number: string | null
  created_at: string
  profiles: { full_name: string | null } | null
  projects: { name: string } | null
}

type Revision = {
  id: string
  title: string
  status: string
  created_at: string
  profiles: { full_name: string | null } | null
  projects: { name: string } | null
}

type StatCard = {
  label: string
  value: string | number
  badge?: string
  href: string
  color: string
  expandable?: 'invoices' | 'revisions'
}

export function DashboardStats({
  stats,
  invoices,
  revisions,
}: {
  stats: StatCard[]
  invoices: Invoice[]
  revisions: Revision[]
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  function toggle(label: string) {
    setExpanded((prev) => (prev === label ? null : label))
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
        {stats.map((stat) => {
          const isExpandable = !!stat.expandable
          const isExpanded = expanded === stat.label

          if (isExpandable) {
            return (
              <button
                key={stat.label}
                onClick={() => toggle(stat.label)}
                type="button"
                className={`relative overflow-hidden rounded-xl border text-left ${
                  isExpanded ? 'border-dark-500' : 'border-dark-600/50'
                } bg-gradient-to-br ${stat.color} p-6 hover:border-dark-500 transition-colors`}
              >
                <p className="text-sm text-gray-400">
                  {stat.label}
                  <span className="ml-2 text-xs text-gray-600">
                    {isExpanded ? '\u25B2' : '\u25BC'}
                  </span>
                </p>
                <p className="mt-1 text-3xl font-bold text-white">{stat.value}</p>
                {stat.badge && (
                  <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400 border border-purple-500/30">
                    {stat.badge}
                  </span>
                )}
              </button>
            )
          }

          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={`relative overflow-hidden rounded-xl border border-dark-600/50 bg-gradient-to-br ${stat.color} p-6 hover:border-dark-500 transition-colors`}
            >
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold text-white">{stat.value}</p>
              {stat.badge && (
                <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400 border border-purple-500/30">
                  {stat.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Expanded: Outstanding Invoices */}
      {expanded === 'Outstanding Invoices' && invoices.length === 0 && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-dark-800/40 px-5 py-6 text-center">
          <p className="text-sm text-gray-500">No outstanding invoices.</p>
        </div>
      )}
      {expanded === 'Outstanding Invoices' && invoices.length > 0 && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-dark-800/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600/50">
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-gray-500">Client</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-gray-500">Project</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-gray-500">Amount</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-gray-500">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600/30">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/clients/${inv.client_id}`}
                        className="text-sm text-neon-purple hover:underline"
                      >
                        {inv.profiles?.full_name || 'Unknown'}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-300">
                      {inv.projects?.name || '\u2014'}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-white whitespace-nowrap">
                      ${(inv.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400 whitespace-nowrap">
                      {inv.due_date
                        ? new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '\u2014'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expanded: Pending Revisions */}
      {expanded === 'Pending Revisions' && revisions.length === 0 && (
        <div className="mb-6 rounded-xl border border-yellow-500/20 bg-dark-800/40 px-5 py-6 text-center">
          <p className="text-sm text-gray-500">No pending revisions.</p>
        </div>
      )}
      {expanded === 'Pending Revisions' && revisions.length > 0 && (
        <div className="mb-6 rounded-xl border border-yellow-500/20 bg-dark-800/40 overflow-hidden">
          <div className="divide-y divide-dark-600/30">
            {revisions.map((rev) => (
              <Link
                key={rev.id}
                href="/admin/revisions"
                className="flex items-center justify-between px-5 py-3 hover:bg-dark-700/50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{rev.title}</p>
                  <p className="text-xs text-gray-500">
                    {rev.profiles?.full_name || 'Unknown'} &middot;{' '}
                    {rev.projects?.name || 'Unknown project'}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <StatusBadge status={rev.status} />
                  <span className="text-xs text-gray-500">
                    {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
