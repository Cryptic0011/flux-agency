'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// Business types that will cycle through
const BUSINESS_TYPES = [
  'contractors',
  'restaurants',
  'barber shops',
  'clothing brands',
  'dental offices',
  'law firms',
  'gyms',
]

// Main phrases
const PHRASES = [
  { text: 'websites that convert', type: 'standard' },
  { text: 'business automation', type: 'standard' },
  { text: 'websites for', type: 'business-cycle' },
  { text: 'SEO-optimized sites', type: 'standard' },
]

export default function Hero() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [businessIndex, setBusinessIndex] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'cycling' | 'deleting'>('typing')
  const cycleCountRef = useRef(0)

  const currentPhrase = PHRASES[phraseIndex]

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (phase === 'typing') {
      const targetText = currentPhrase.type === 'business-cycle'
        ? currentPhrase.text + ' ' + BUSINESS_TYPES[0]
        : currentPhrase.text

      if (displayText.length < targetText.length) {
        timer = setTimeout(() => {
          setDisplayText(targetText.substring(0, displayText.length + 1))
        }, 50)
      } else {
        // Finished typing
        if (currentPhrase.type === 'business-cycle') {
          // Start cycling immediately, no delay
          setPhase('cycling')
          cycleCountRef.current = 0
        } else {
          timer = setTimeout(() => {
            setPhase('deleting')
          }, 1500)
        }
      }
    } else if (phase === 'cycling') {
      if (cycleCountRef.current < BUSINESS_TYPES.length - 1) {
        timer = setTimeout(() => {
          cycleCountRef.current += 1
          setBusinessIndex(cycleCountRef.current)
        }, 350) // Smooth, slower cycling
      } else {
        // Done cycling, wait then delete
        timer = setTimeout(() => {
          setPhase('deleting')
        }, 1200)
      }
    } else if (phase === 'deleting') {
      const targetText = currentPhrase.type === 'business-cycle'
        ? currentPhrase.text + ' ' + BUSINESS_TYPES[businessIndex]
        : currentPhrase.text

      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(targetText.substring(0, displayText.length - 1))
        }, 20)
      } else {
        // Finished deleting, move to next phrase
        const nextIndex = (phraseIndex + 1) % PHRASES.length
        setPhraseIndex(nextIndex)
        setBusinessIndex(0)
        cycleCountRef.current = 0
        setPhase('typing')
      }
    }

    return () => clearTimeout(timer)
  }, [phase, displayText, phraseIndex, currentPhrase, businessIndex])

  // Render the typing text
  const renderText = () => {
    if (currentPhrase.type === 'business-cycle') {
      const baseText = currentPhrase.text // "websites for"
      const prefixWithSpace = baseText + ' '

      if (phase === 'cycling') {
        return (
          <>
            <span className="gradient-text">{baseText}</span>
            <span className="text-white">{'\u00A0' + BUSINESS_TYPES[businessIndex]}</span>
          </>
        )
      }

      // During typing or deleting of business-cycle phrase
      const typed = displayText

      // Still typing the base text (before the space)
      if (typed.length <= baseText.length) {
        return <span className="gradient-text">{typed}</span>
      }

      // Typing the space or business type
      const businessPart = typed.substring(prefixWithSpace.length)
      return (
        <>
          <span className="gradient-text">{baseText}</span>
          <span className="text-white">{'\u00A0' + businessPart}</span>
        </>
      )
    }
    return <span className="gradient-text">{displayText}</span>
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />

      {/* Gradient Orbs - using radial-gradient instead of blur filter to avoid Safari compositing artifacts */}
      <div className="absolute top-1/4 -left-32 w-[20rem] sm:w-[28rem] h-[20rem] sm:h-[28rem] rounded-full animate-float" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 -right-32 w-[20rem] sm:w-[28rem] h-[20rem] sm:h-[28rem] rounded-full animate-float-delayed" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] sm:w-[40rem] h-[28rem] sm:h-[40rem] rounded-full animate-pulse-slow" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)' }} />

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
          <span className="block h-[1.2em] flex items-center justify-center">
            {renderText()}
            <span className="animate-blink text-neon-purple">|</span>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 animate-fade-in-up animation-delay-200 px-4">
          A Georgia-based web studio building lightning-fast websites,
          SEO-optimized pages, and custom business automation. Based in Canton, serving all of GA.
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
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Trusted by local businesses</p>
          <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap opacity-70 px-4">
            {['Fast Load Times', 'SEO Optimized', 'Mobile First', 'You Own Everything'].map((item) => (
              <span
                key={item}
                className="flex items-center gap-1.5 text-xs text-gray-400"
              >
                <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
