'use client'

import { useEffect, useState } from 'react'
import { ScrollRevealItem } from '@/lib/useScrollReveal'

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    title: 'Google Reviews Integration',
    description: 'Display your 5-star reviews automatically. Build trust with new customers the moment they land on your site.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Online Booking & Scheduling',
    description: 'Let customers book estimates, consultations, or service calls directly. Syncs with your calendar.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Lead Capture Forms',
    description: 'Custom quote request forms that capture exactly the info you need. Leads go straight to your inbox or CRM.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Project Galleries',
    description: 'Showcase your best work with beautiful before/after galleries. Easy to update from any device.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Local SEO Optimization',
    description: 'Rank higher in "near me" searches. We optimize for your service area so local customers find you first.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Mobile-First Design',
    description: '70% of your visitors are on phones. Every site we build looks and works perfectly on mobile.',
  },
]

// Simulated review data for the demo
const demoReviews = [
  { name: 'Mike R.', rating: 5, text: 'Best contractor we\'ve ever worked with. On time and on budget.' },
  { name: 'Sarah T.', rating: 5, text: 'Amazing work on our kitchen remodel. Highly recommend!' },
  { name: 'David L.', rating: 5, text: 'Professional, clean, and the results speak for themselves.' },
]

function WebsitePreviewDemo() {
  const [activeReview, setActiveReview] = useState(0)
  const [formFocused, setFormFocused] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % demoReviews.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      {/* Browser Chrome */}
      <div className="rounded-xl overflow-hidden bg-dark-800 border border-dark-600 shadow-2xl shadow-neon-purple/10">
        {/* Browser Bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-dark-700 border-b border-dark-600">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 mx-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-dark-800 text-xs text-gray-400">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>acmeroofing.com</span>
            </div>
          </div>
        </div>

        {/* Website Content */}
        <div className="p-4 sm:p-6 space-y-4 bg-gradient-to-b from-dark-800 to-dark-900 min-h-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600" />
              <span className="font-bold text-white text-sm">ACME Roofing</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="hidden sm:inline">Services</span>
              <span className="hidden sm:inline">Gallery</span>
              <span className="hidden sm:inline">About</span>
              <button className="px-3 py-1.5 rounded-md bg-orange-500 text-white text-xs font-medium">
                Get Quote
              </button>
            </div>
          </div>

          {/* Hero */}
          <div className="py-4">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
              Trusted Roofing Experts
            </h2>
            <p className="text-xs text-gray-400 mb-3">Serving the greater metro area since 1995</p>

            {/* Google Reviews Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-white font-medium">4.9</span>
              <span className="text-xs text-gray-400">(127 reviews)</span>
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
          </div>

          {/* Live Review Rotation */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-xs font-bold text-white">
                {demoReviews[activeReview].name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-white">{demoReviews[activeReview].name}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 animate-fade-in-up" key={activeReview}>
                  &ldquo;{demoReviews[activeReview].text}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form Preview */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs font-medium text-white mb-2">Get a Free Estimate</p>
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`px-2 py-1.5 rounded text-xs bg-dark-700 border transition-colors ${
                  formFocused === 'name' ? 'border-orange-500' : 'border-dark-600'
                }`}
                onMouseEnter={() => setFormFocused('name')}
                onMouseLeave={() => setFormFocused(null)}
              >
                <span className="text-gray-500">Your name</span>
              </div>
              <div
                className={`px-2 py-1.5 rounded text-xs bg-dark-700 border transition-colors ${
                  formFocused === 'phone' ? 'border-orange-500' : 'border-dark-600'
                }`}
                onMouseEnter={() => setFormFocused('phone')}
                onMouseLeave={() => setFormFocused(null)}
              >
                <span className="text-gray-500">Phone number</span>
              </div>
            </div>
            <div
              className={`mt-2 px-2 py-1.5 rounded text-xs bg-dark-700 border transition-colors ${
                formFocused === 'service' ? 'border-orange-500' : 'border-dark-600'
              }`}
              onMouseEnter={() => setFormFocused('service')}
              onMouseLeave={() => setFormFocused(null)}
            >
              <span className="text-gray-500">What service do you need?</span>
            </div>
            <button className="mt-2 w-full px-3 py-1.5 rounded bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 transition-colors">
              Request Free Quote
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default function BusinessFeatures() {
  return (
    <section id="services" className="section-container bg-dark-800/30">
      <div className="section-inner">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 mb-4 text-xs font-medium text-green-400 bg-green-400/10 rounded-full border border-green-400/20">
            For Businesses
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything your business website needs
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We&apos;ve built websites for contractors, service businesses, and local companies.
            We know what works to turn visitors into customers.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Website Preview Demo */}
          <div className="order-2 lg:order-1">
            <WebsitePreviewDemo />
          </div>

          {/* Right: Features List */}
          <div className="order-1 lg:order-2 space-y-3 sm:space-y-4">
            {features.map((feature) => (
              <ScrollRevealItem key={feature.title}>
                <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-dark-800/50 border border-dark-600 hover:border-dark-500 transition-all card-hover">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/20 flex items-center justify-center text-neon-purple">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </ScrollRevealItem>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">
            Not sure what you need? Let&apos;s talk through your goals.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-neon-purple hover:text-neon-purple/80 font-medium transition-colors"
          >
            Schedule a free consultation
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
