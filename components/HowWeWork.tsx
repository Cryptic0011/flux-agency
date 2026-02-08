'use client'

import TerminalDemo from './TerminalDemo'
import { useScrollReveal } from '@/lib/useScrollReveal'

const steps = [
  {
    number: '01',
    title: 'Discovery',
    description: 'We dive deep into your business goals, audience, and technical requirements.',
  },
  {
    number: '02',
    title: 'Design & Architecture',
    description: 'We design systems that scale—clean code, optimal performance, SEO-ready.',
  },
  {
    number: '03',
    title: 'Build & Iterate',
    description: 'Rapid development with continuous feedback. You see progress every step.',
  },
  {
    number: '04',
    title: 'Launch & Optimize',
    description: 'Deploy to production and continuously optimize based on real data.',
  },
]

export default function HowWeWork() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px',
  })

  return (
    <section id="work" className="section-container bg-dark-800/30 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-neon-cyan/[0.07] rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-neon-purple/[0.05] rounded-full blur-3xl" />
      <div className="section-inner relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Process Steps */}
          <div>
            <span className="inline-block px-4 py-1 mb-4 text-xs font-medium text-neon-cyan bg-neon-cyan/10 rounded-full border border-neon-cyan/20">
              Our Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
              How we bring your vision to life
            </h2>

            <div
              ref={ref}
              className={`space-y-6 ${isVisible ? '[&>.scroll-reveal]:is-visible' : ''}`}
            >
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`flex gap-4 scroll-reveal stagger-${index + 1}`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-dark-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-neon-purple">{step.number}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Terminal Demo */}
          <div>
            <TerminalDemo />
          </div>
        </div>
      </div>
    </section>
  )
}
