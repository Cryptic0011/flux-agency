'use client'

import { useState, useTransition } from 'react'
import { generateCheckoutLink } from '../actions'

export function CheckoutLinkButton({
  projectId,
  clientId,
  projectName,
}: {
  projectId: string
  clientId: string
  projectName: string
}) {
  const [isPending, startTransition] = useTransition()
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function handleGenerate() {
    setError(null)
    setUrl(null)

    const formData = new FormData()
    formData.set('project_id', projectId)
    formData.set('client_id', clientId)

    startTransition(async () => {
      try {
        const checkoutUrl = await generateCheckoutLink(formData)
        setUrl(checkoutUrl)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate link')
      }
    })
  }

  async function handleCopy() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select the text
    }
  }

  if (url) {
    return (
      <div className="mt-2 space-y-2">
        <p className="text-xs text-gray-400">Checkout link for {projectName}:</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={url}
            className="flex-1 rounded-lg border border-dark-600 bg-dark-700 px-3 py-1.5 text-xs text-gray-300 font-mono focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-lg border border-dark-600 bg-dark-700 px-3 py-1.5 text-xs text-white hover:bg-dark-600 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={isPending}
        className="text-xs text-neon-purple hover:text-neon-purple/80 disabled:opacity-50"
      >
        {isPending ? 'Generating...' : 'Generate Checkout Link'}
      </button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
