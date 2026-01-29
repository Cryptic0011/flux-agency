'use client'

import { useScrollReveal } from '@/lib/useScrollReveal'

const techCategories = [
  {
    title: 'Frontend',
    items: [
      { name: 'Next.js', description: 'React framework for production' },
      { name: 'React', description: 'Component-based UI library' },
      { name: 'TypeScript', description: 'Type-safe JavaScript' },
      { name: 'Tailwind CSS', description: 'Utility-first styling' },
    ],
  },
  {
    title: 'Backend & Data',
    items: [
      { name: 'Node.js', description: 'JavaScript runtime' },
      { name: 'PostgreSQL', description: 'Relational database' },
      { name: 'Prisma', description: 'Type-safe ORM' },
      { name: 'Redis', description: 'In-memory caching' },
    ],
  },
  {
    title: 'Infrastructure',
    items: [
      { name: 'Vercel', description: 'Edge deployment platform' },
      { name: 'AWS', description: 'Cloud infrastructure' },
      { name: 'Cloudflare', description: 'CDN & security' },
      { name: 'GitHub Actions', description: 'CI/CD pipelines' },
    ],
  },
]

const metrics = [
  { value: '100', label: 'Lighthouse Score', suffix: '/100' },
  { value: '<100', label: 'First Paint', suffix: 'ms' },
  { value: '99.9', label: 'Uptime SLA', suffix: '%' },
  { value: '12', label: 'Edge Regions', suffix: '+' },
]

export default function TechStack() {
  const { ref: metricsRef, isVisible: metricsVisible } = useScrollReveal<HTMLDivElement>({
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px',
  })

  const { ref: techRef, isVisible: techVisible } = useScrollReveal<HTMLDivElement>({
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px',
  })

  return (
    <section id="tech" className="section-container">
      <div className="section-inner">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 mb-4 text-xs font-medium text-neon-blue bg-neon-blue/10 rounded-full border border-neon-blue/20">
            Technology
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Built on modern standards
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We use the same technology stack trusted by companies like Vercel, Stripe, and Linear.
          </p>
        </div>

        {/* Metrics */}
        <div
          ref={metricsRef}
          className={`grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 ${metricsVisible ? '[&>.scroll-reveal]:is-visible' : ''}`}
        >
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`text-center p-6 rounded-xl bg-dark-800/50 border border-dark-600 scroll-reveal stagger-${index + 1}`}
            >
              <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">
                {metric.value}
                <span className="text-lg text-gray-500">{metric.suffix}</span>
              </div>
              <div className="text-sm text-gray-400">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Tech Grid */}
        <div
          ref={techRef}
          className={`grid md:grid-cols-3 gap-8 ${techVisible ? '[&>.scroll-reveal]:is-visible' : ''}`}
        >
          {techCategories.map((category, index) => (
            <div key={category.title} className={`scroll-reveal stagger-${index + 1}`}>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                {category.title}
              </h3>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50 border border-dark-600 hover:border-dark-500 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-neon-purple" />
                    <div>
                      <div className="text-sm font-medium text-white">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
