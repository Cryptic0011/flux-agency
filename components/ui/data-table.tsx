import { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => string // returns href
  emptyMessage?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data found.',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-8 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-dark-600/50 bg-dark-800/40">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-600/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-600/30">
          {data.map((row, i) => {
            const content = columns.map((col) => (
              <td key={col.key} className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                {col.render ? col.render(row) : (row[col.key] as ReactNode)}
              </td>
            ))

            if (onRowClick) {
              const href = onRowClick(row)
              return (
                <tr key={i} className="hover:bg-dark-700/50 transition-colors">
                  {content.map((td, j) => (
                    <td key={columns[j].key} className="p-0">
                      <a href={href} className="block px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                        {columns[j].render ? columns[j].render(row) : (row[columns[j].key] as ReactNode)}
                      </a>
                    </td>
                  ))}
                </tr>
              )
            }

            return (
              <tr key={i} className="hover:bg-dark-700/50 transition-colors">
                {content}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
