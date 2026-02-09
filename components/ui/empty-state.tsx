interface EmptyStateProps {
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dark-600/50 bg-dark-800/40 py-16 px-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dark-700">
        <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {action && (
        <a
          href={action.href}
          className="mt-4 inline-flex items-center rounded-lg bg-neon-purple px-4 py-2 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors"
        >
          {action.label}
        </a>
      )}
    </div>
  )
}
