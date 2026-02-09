'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const BUSINESS_TYPES = [
  'Restaurant / Food Service',
  'Retail / E-Commerce',
  'Healthcare / Medical',
  'Real Estate',
  'Professional Services',
  'Construction / Trades',
  'Fitness / Wellness',
  'Automotive',
  'Nonprofit',
  'Other',
] as const

type FormData = {
  full_name: string
  email: string
  phone: string
  business_type: string
  message: string
  _company: string // honeypot
}

const initialFormData: FormData = {
  full_name: '',
  email: '',
  phone: '',
  business_type: '',
  message: '',
  _company: '',
}

// Format phone as (XXX) XXX-XXXX while typing
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10
}

export default function CTA() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const formRef = useRef<HTMLDivElement>(null)
  const formOpenedAt = useRef<number>(0)

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [showForm])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    if (name === 'phone') {
      setFormData((prev) => ({ ...prev, phone: formatPhone(value) }))
      if (phoneError) setPhoneError('')
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    if (error) setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!formData.full_name || !formData.email || !formData.phone || !formData.business_type) {
      setError('Please fill in all required fields.')
      return
    }

    if (!isValidPhone(formData.phone)) {
      setPhoneError('Please enter a valid 10-digit phone number.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          _t: formOpenedAt.current,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Something went wrong. Please try again.')
      }

      setSubmitted(true)
      setFormData(initialFormData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

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
              <button
                onClick={() => {
                  if (!showForm) formOpenedAt.current = Date.now()
                  setShowForm(!showForm)
                  setSubmitted(false)
                  setError('')
                  setPhoneError('')
                }}
                className="btn-primary text-base px-8 py-4"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{showForm ? 'Close' : 'Get in Touch'}</span>
              </button>
              <Link
                href="tel:4704552576"
                className="btn-secondary text-base px-8 py-4"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Call Now</span>
              </Link>
            </div>

            {/* Inline Contact Form */}
            <div
              ref={formRef}
              className={`grid transition-all duration-500 ease-in-out ${
                showForm ? 'grid-rows-[1fr] opacity-100 mt-10' : 'grid-rows-[0fr] opacity-0 mt-0'
              }`}
            >
              <div className="overflow-hidden">
                {submitted ? (
                  <div className="max-w-lg mx-auto py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Message sent!</h3>
                    <p className="text-gray-400">
                      We&apos;ll get back to you within 24 hours. If it&apos;s urgent, give us a call.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="max-w-2xl mx-auto text-left">
                    {/* Honeypot - invisible to users, bots auto-fill it */}
                    <div className="absolute opacity-0 -z-10" aria-hidden="true">
                      <label htmlFor="_company">Company</label>
                      <input
                        type="text"
                        id="_company"
                        name="_company"
                        value={formData._company}
                        onChange={handleChange}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-1.5">
                          Full Name <span className="text-neon-purple">*</span>
                        </label>
                        <input
                          type="text"
                          id="full_name"
                          name="full_name"
                          required
                          value={formData.full_name}
                          onChange={handleChange}
                          placeholder="John Smith"
                          className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-500 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                          Email <span className="text-neon-purple">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@business.com"
                          className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-500 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1.5">
                          Phone <span className="text-neon-purple">*</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="(470) 555-1234"
                          maxLength={14}
                          className={`w-full px-4 py-3 rounded-lg bg-dark-700 border text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${
                            phoneError
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                              : 'border-dark-500 focus:border-neon-purple/50 focus:ring-neon-purple/50'
                          }`}
                        />
                        {phoneError && (
                          <p className="text-red-400 text-xs mt-1">{phoneError}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="business_type" className="block text-sm font-medium text-gray-300 mb-1.5">
                          Business Type <span className="text-neon-purple">*</span>
                        </label>
                        <select
                          id="business_type"
                          name="business_type"
                          required
                          value={formData.business_type}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-500 text-white focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 transition-colors appearance-none"
                        >
                          <option value="" disabled className="text-gray-500">Select your industry</option>
                          {BUSINESS_TYPES.map((type) => (
                            <option key={type} value={type} className="bg-dark-700">
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1.5">
                        Tell us about your project
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="What are you looking to build? Any specific goals or timeline?"
                        className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-500 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 transition-colors resize-none"
                      />
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm mb-4">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary text-base px-8 py-4 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
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
