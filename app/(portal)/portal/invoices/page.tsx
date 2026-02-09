export const metadata = { title: 'Invoices — Client Portal' }

export default function InvoicesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Invoices</h1>
        <p className="mt-1 text-sm text-gray-400">
          View and manage your invoices.
        </p>
      </div>

      <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 py-12 text-center">
        <p className="text-gray-500">Invoice management coming soon.</p>
        <p className="mt-1 text-sm text-gray-600">
          You&apos;ll be able to view and pay invoices here once billing is set up.
        </p>
      </div>
    </div>
  )
}
