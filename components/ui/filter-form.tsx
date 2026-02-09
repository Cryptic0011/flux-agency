'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function FilterSelect({
  name,
  options,
  defaultValue,
}: {
  name: string
  options: { value: string; label: string }[]
  defaultValue?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams(searchParams.toString())
      if (e.target.value === 'all') {
        params.delete(name)
      } else {
        params.set(name, e.target.value)
      }
      router.push(`?${params.toString()}`)
    },
    [router, searchParams, name]
  )

  return (
    <select
      name={name}
      defaultValue={defaultValue || 'all'}
      onChange={handleChange}
      className="rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-white focus:border-neon-purple focus:outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
