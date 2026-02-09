'use client'

import { useScrollReveal } from '@/lib/useScrollReveal'

const capabilities = [
  {
    title: 'Full Transparency',
    description: 'You own your code, your domain, and your data. No vendor lock-in, no hidden fees. We give you full access to everything we build.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: 'Easy Content Management',
    description: 'Update your own text, images, blog posts, and galleries without calling a developer. We set up a CMS that works for you.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    title: 'SEO That Drives Traffic',
    description: 'Every site we build is optimized to rank. Structured data, fast load times, mobile-first design, and local SEO to get you found by customers.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: 'Built to Grow With You',
    description: 'Start with what you need now and add features later. Online booking, e-commerce, client portals—your site scales as your business does.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: 'Fast & Reliable',
    description: 'Your site loads in under a second on any device. We build for speed because slow sites lose customers and rank lower on Google.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Ongoing Support',
    description: 'We don\'t disappear after launch. Get ongoing maintenance, updates, and a real person to call when you need changes made.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
]

const stats = [
  { value: '100%', label: 'Code Ownership' },
  { value: '< 1s', label: 'Page Load Time' },
  { value: '24/7', label: 'Site Uptime' },
  { value: '100%', label: 'Mobile Optimized' },
]

export default function TechStack() {
  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal<HTMLDivElement>({
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px',
  })

  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  })

  return (
    <section id="tech" className="section-container relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-neon-blue/[0.08] rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -left-32 w-[500px] h-[500px] bg-neon-purple/[0.07] rounded-full blur-3xl" />
      <div className="section-inner relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 mb-4 text-xs font-medium text-neon-blue bg-neon-blue/10 rounded-full border border-neon-blue/20">
            Why FLUX
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            What sets us apart
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We build websites that actually work for your business—not just look good.
            Here&apos;s what you get when you work with us.
          </p>
        </div>

        {/* Stats Row */}
        <div
          ref={statsRef}
          className={`grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 ${statsVisible ? '[&>.scroll-reveal]:is-visible' : ''}`}
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`text-center p-6 rounded-xl bg-dark-800/50 border border-dark-600 scroll-reveal stagger-${index + 1}`}
            >
              <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Capabilities Grid */}
        <div
          ref={gridRef}
          className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${gridVisible ? '[&>.scroll-reveal]:is-visible' : ''}`}
        >
          {capabilities.map((capability, index) => (
            <div
              key={capability.title}
              className={`p-6 rounded-xl bg-dark-800/50 border border-dark-600 hover:border-dark-500 transition-colors scroll-reveal stagger-${index + 1}`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/20 flex items-center justify-center text-neon-purple mb-4">
                {capability.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{capability.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{capability.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
