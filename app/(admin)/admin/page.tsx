export const metadata = {
  title: 'Admin Dashboard',
  description: 'FLUX admin dashboard for managing clients, projects, and billing.',
}

export default function AdminPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Manage leads, clients, projects, and billing.
        </p>
      </div>

      {/* Placeholder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['Leads', 'Clients', 'Projects', 'Invoices'].map((title) => (
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
