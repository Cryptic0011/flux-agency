'use client'

import { useState } from 'react'

interface WebsitePreviewProps {
  domain: string | null
  size?: 'sm' | 'md' | 'lg'
}

export function WebsitePreview({ domain, size = 'md' }: WebsitePreviewProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  if (!domain) {
    return <PreviewPlaceholder size={size} />
  }

  const screenshotUrl = `/api/screenshots?domain=${encodeURIComponent(domain)}`

  return (
    <div className="overflow-hidden rounded-lg border border-dark-600/50">
      {/* Browser chrome bar */}
      <div className="flex items-center gap-2 bg-dark-700 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        </div>
        <div className="ml-2 flex-1">
          <div className="truncate rounded bg-dark-600/80 px-3 py-1 text-[11px] text-gray-400">
            {domain}
          </div>
        </div>
      </div>

      {/* Screenshot area */}
      <div
        className={`relative bg-dark-800 ${
          size === 'sm' ? 'h-16 w-28' : 'aspect-video'
        }`}
      >
        {/* Loading skeleton */}
        {!loaded && !errored && (
          <div className="absolute inset-0 animate-pulse bg-dark-700" />
        )}

        {/* Error fallback */}
        {errored && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-dark-700 to-dark-800">
            <div className="px-4 text-center">
              <GlobeIcon className="mx-auto h-8 w-8 text-dark-400" />
              <p className="mt-1 max-w-[200px] truncate text-xs text-gray-500">{domain}</p>
            </div>
          </div>
        )}

        {/* Actual screenshot */}
        {!errored && (
          <img
            src={screenshotUrl}
            alt={`Preview of ${domain}`}
            className={`h-full w-full object-cover object-top transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        )}
      </div>
    </div>
  )
}

function PreviewPlaceholder({ size }: { size: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-dark-600/50">
      <div className="flex items-center gap-2 bg-dark-700 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-dark-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-dark-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-dark-500" />
        </div>
      </div>
      <div
        className={`flex items-center justify-center bg-dark-800 ${
          size === 'sm' ? 'h-16 w-28' : 'aspect-video'
        }`}
      >
        <div className="text-center">
          <GlobeIcon className="mx-auto h-8 w-8 text-dark-500" />
          <p className="mt-1 text-xs text-dark-500">No preview</p>
        </div>
      </div>
    </div>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
      />
    </svg>
  )
}
