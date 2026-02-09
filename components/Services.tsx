'use client'

import { ScrollRevealItem } from '@/lib/useScrollReveal'

interface Service {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
}

const services: Service[] = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'High-Performance Websites',
    description: 'Lightning-fast Next.js sites deployed on Vercel Edge Network for sub-second load times.',
    features: ['Next.js 15 App Router', 'Edge Functions', 'Vercel Deployment', 'Core Web Vitals A+'],
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'SEO Maximization',
    description: 'Technical SEO baked into every build—structured data, metadata, and optimized architecture.',
    features: ['JSON-LD Schema', 'Dynamic Sitemaps', 'Meta Optimization', 'Search Console Setup'],
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Business Automation',
    description: 'Custom systems that eliminate manual work—invoicing, CRM, and workflow automation.',
    features: ['Automated Invoicing', 'CRM Integration', 'Workflow Triggers', 'API Orchestration'],
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: 'Customer Portals',
    description: 'Branded client dashboards for self-service access to orders, documents, and support.',
    features: ['Secure Auth', 'Document Management', 'Order Tracking', 'Support Tickets'],
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    title: 'Content Management',
    description: 'Easy-to-use admin panels for galleries, blog posts, and team management.',
    features: ['Media Galleries', 'Blog Systems', 'Team Management', 'Content Scheduling'],
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    title: 'Internal Tools',
    description: 'Custom internal applications that streamline operations and boost team productivity.',
    features: ['Admin Dashboards', 'Reporting Tools', 'Data Pipelines', 'Custom Integrations'],
  },
]

function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="group relative p-6 rounded-2xl bg-dark-800 border border-dark-600 card-hover h-full">
      {/* Icon */}
      <div className="mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/20 flex items-center justify-center text-neon-purple group-hover:scale-110 transition-transform duration-300">
        {service.icon}
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
      <p className="text-gray-400 text-sm mb-4">{service.description}</p>

      {/* Features */}
      <ul className="space-y-1">
        {service.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-3 h-3 text-neon-purple" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {/* Hover Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-purple/5 to-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  )
}

export default function Services() {
  return (
    <section className="section-container relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-32 w-[400px] h-[400px] bg-neon-blue/[0.07] rounded-full blur-3xl" />
      <div className="section-inner relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 mb-4 text-xs font-medium text-neon-purple bg-neon-purple/10 rounded-full border border-neon-purple/20">
            What We Build
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            End-to-end web solutions
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From high-converting marketing sites to complex internal tools—we build
            web applications that drive real business results.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ScrollRevealItem key={service.title}>
              <ServiceCard service={service} />
            </ScrollRevealItem>
          ))}
        </div>
      </div>
    </section>
  )
}
