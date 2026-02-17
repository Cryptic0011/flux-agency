'use client'

import { useEffect, useRef } from 'react'
import { markNotesRead } from '@/lib/actions/notes'

export function ReadReceiptTracker({
  noteIds,
}: {
  noteIds: string[]
}) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current || noteIds.length === 0) return
    tracked.current = true

    const timer = setTimeout(() => {
      markNotesRead(noteIds)
    }, 1500)

    return () => clearTimeout(timer)
  }, [noteIds])

  return null
}
