'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import TypingHeadline from './TypingHeadline'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />

      {/* Gradient Orbs - reduced on mobile for performance */}
      <div className="absolute top-1/4 -left-32 w-64 sm:w-96 h-64 sm:h-96 bg-neon-purple/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-64 sm:w-96 h-64 sm:h-96 bg-neon-blue/20 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-neon-pink/10 rounded-full blur-3xl animate-pulse-slow" />

      {/* Content */}
      <div className="relative z-10 section-inner text-center pt-20">
        <div className="animate-fade-in-down">
          {/* Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative">
              <Image
                src="/images/logo.png"
                alt="FLUX"
                width={120}
                height={120}
                className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 glow-purple rounded-2xl"
                priority
              />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 mb-4 sm:mb-6 rounded-full bg-dark-800/80 border border-dark-600 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm text-gray-300">
              Now accepting new projects
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-[clamp(1.25rem,6vw,1.875rem)] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6 animate-fade-in-up min-h-[3em] sm:min-h-[2.6em] flex flex-col items-center justify-center px-4">
          <span>We build</span>
          <TypingHeadline />
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 animate-fade-in-up animation-delay-200 px-4">
          FLUX is a web-first studio specializing in lightning-fast websites,
          technical SEO, and custom business automation for modern brands.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up animation-delay-300 px-4">
          <Link href="#contact" className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
            <span>Start Your Project</span>
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
          <Link href="#services" className="btn-secondary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
            View Services
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-10 sm:mt-12 pb-16 sm:pb-20 animate-fade-in-up animation-delay-400">
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Built with industry-leading technology</p>
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap opacity-60 px-4">
            {['Next.js', 'Vercel', 'TypeScript', 'Tailwind'].map((tech) => (
              <span
                key={tech}
                className="text-xs font-mono text-gray-400 px-2 py-1 rounded-md bg-dark-800/50 border border-dark-600/50"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
