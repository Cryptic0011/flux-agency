'use client'

import Link from 'next/link'

export default function CTA() {
  return (
    <section id="contact" className="section-container">
      <div className="section-inner">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-dark-800 to-neon-blue/20" />
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />

          {/* Content */}
          <div className="relative px-8 py-16 sm:px-16 sm:py-24 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to build something{' '}
              <span className="gradient-text">exceptional?</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Let&apos;s discuss your project and see how FLUX can help accelerate your
              business with high-performance web solutions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="mailto:hello@fluxstudio.dev" className="btn-primary text-base px-8 py-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Get in Touch</span>
              </Link>
              <Link
                href="https://cal.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-base px-8 py-4"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Schedule a Call</span>
              </Link>
            </div>

            {/* Trust Note */}
            <p className="mt-8 text-sm text-gray-500">
              No commitment required. Free consultation for qualifying projects.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
