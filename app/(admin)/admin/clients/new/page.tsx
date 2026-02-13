import Link from 'next/link'
import { createClientAction } from '../actions'

export const metadata = { title: 'New Client — Admin' }

export default function NewClientPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/clients" className="text-sm text-gray-400 hover:text-white transition-colors">
          &larr; Back to Clients
        </Link>
      </div>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-6">Create New Client</h1>

        <form action={createClientAction} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <input
              name="full_name"
              required
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
              placeholder="e.g. John Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone (optional)</label>
            <input
              name="phone"
              type="tel"
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
              placeholder="(555) 123-4567"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-neon-purple px-4 py-2.5 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors"
          >
            Create Client
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500">
          An invite email will be sent to the client. A Stripe Customer will also be created automatically.
        </p>
      </div>
    </div>
  )
}
