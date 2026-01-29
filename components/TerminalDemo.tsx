'use client'

import { useEffect, useState, useRef } from 'react'

interface CodeLine {
  content: string
  type: 'command' | 'output' | 'success' | 'info'
}

const DEMO_SEQUENCES: CodeLine[][] = [
  [
    { content: '$ npx create-next-app@latest your-brand', type: 'command' },
    { content: 'Creating a new Next.js app...', type: 'output' },
    { content: 'Installing dependencies...', type: 'output' },
    { content: '✓ Dependencies installed', type: 'success' },
    { content: '✓ TypeScript configured', type: 'success' },
    { content: '✓ Tailwind CSS initialized', type: 'success' },
    { content: '✓ ESLint configured', type: 'success' },
    { content: '', type: 'output' },
    { content: '$ npm run dev', type: 'command' },
    { content: '▲ Next.js 15.0', type: 'info' },
    { content: '- Local: http://localhost:3000', type: 'info' },
    { content: '✓ Ready in 1.2s', type: 'success' },
  ],
  [
    { content: '$ flux deploy --production', type: 'command' },
    { content: 'Building optimized production bundle...', type: 'output' },
    { content: '✓ Compiled successfully', type: 'success' },
    { content: '✓ Linting passed', type: 'success' },
    { content: '✓ Type checking complete', type: 'success' },
    { content: '', type: 'output' },
    { content: 'Deploying to Vercel Edge Network...', type: 'output' },
    { content: '✓ Deployed to 12 edge regions', type: 'success' },
    { content: '✓ SSL certificate provisioned', type: 'success' },
    { content: '', type: 'output' },
    { content: 'Production: https://your-brand.com', type: 'info' },
    { content: '✓ Lighthouse Score: 100/100', type: 'success' },
  ],
  [
    { content: '$ flux seo audit', type: 'command' },
    { content: 'Analyzing SEO performance...', type: 'output' },
    { content: '', type: 'output' },
    { content: '✓ Meta tags optimized', type: 'success' },
    { content: '✓ Open Graph configured', type: 'success' },
    { content: '✓ Structured data (JSON-LD) valid', type: 'success' },
    { content: '✓ Sitemap generated', type: 'success' },
    { content: '✓ robots.txt configured', type: 'success' },
    { content: '✓ Core Web Vitals: PASSED', type: 'success' },
    { content: '', type: 'output' },
    { content: 'SEO Score: 98/100', type: 'info' },
    { content: '✓ Ready for search indexing', type: 'success' },
  ],
]

export default function TerminalDemo() {
  const [activeTab, setActiveTab] = useState(0)
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    setVisibleLines(0)
    const sequence = DEMO_SEQUENCES[activeTab]
    let lineIndex = 0

    const interval = setInterval(() => {
      if (lineIndex < sequence.length) {
        setVisibleLines(lineIndex + 1)
        lineIndex++
      } else {
        clearInterval(interval)
      }
    }, 150)

    return () => clearInterval(interval)
  }, [activeTab, isVisible])

  useEffect(() => {
    if (!isVisible) return

    const tabInterval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % DEMO_SEQUENCES.length)
    }, 6000)

    return () => clearInterval(tabInterval)
  }, [isVisible])

  const getLineColor = (type: CodeLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-neon-cyan'
      case 'success':
        return 'text-green-400'
      case 'info':
        return 'text-neon-blue'
      default:
        return 'text-gray-400'
    }
  }

  const tabs = ['Setup', 'Deploy', 'SEO Audit']

  return (
    <div ref={ref} className="w-full max-w-3xl mx-auto">
      {/* Terminal Window */}
      <div className="rounded-xl overflow-hidden bg-dark-800 border border-dark-600 shadow-2xl shadow-neon-purple/10">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-dark-700 border-b border-dark-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex items-center gap-1">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(index)}
                className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                  activeTab === index
                    ? 'bg-dark-600 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="w-16" />
        </div>

        {/* Terminal Content */}
        <div className="p-4 sm:p-6 font-mono text-sm h-[320px] overflow-hidden">
          {DEMO_SEQUENCES[activeTab].slice(0, visibleLines).map((line, index) => (
            <div
              key={`${activeTab}-${index}`}
              className={`${getLineColor(line.type)} ${
                index === visibleLines - 1 ? 'animate-fade-in-up' : ''
              }`}
              style={{ animationDuration: '0.2s' }}
            >
              {line.content || '\u00A0'}
            </div>
          ))}
          {visibleLines < DEMO_SEQUENCES[activeTab].length && (
            <span className="inline-block w-2 h-4 bg-neon-purple animate-blink" />
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 justify-center pb-4">
          {tabs.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                activeTab === index
                  ? 'bg-neon-purple w-6'
                  : 'bg-dark-500 hover:bg-dark-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
