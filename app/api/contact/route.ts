import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const VALID_BUSINESS_TYPES = new Set([
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
])

// In-memory rate limiting by IP (resets on server restart, which is fine for this scale)
const submissions = new Map<string, number[]>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = submissions.get(ip) || []
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS)
  submissions.set(ip, recent)
  if (recent.length >= RATE_LIMIT) return true
  recent.push(now)
  return false
}

// Strip HTML tags to prevent XSS in email notifications
function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}

// US phone: at least 10 digits after stripping formatting
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))
}

const MIN_SUBMIT_TIME_MS = 3000 // Form must be open at least 3 seconds

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { full_name, email, business_type, phone, message, _company, _t } = body

    // Honeypot: bots fill hidden fields
    if (_company) {
      // Silently accept to not tip off the bot
      return NextResponse.json({ success: true })
    }

    // Time-based check: reject if form was submitted too fast
    if (_t && Date.now() - Number(_t) < MIN_SUBMIT_TIME_MS) {
      return NextResponse.json({ success: true }) // Silent reject
    }

    // Required fields
    if (!full_name || !email || !business_type || !phone) {
      return NextResponse.json(
        { error: 'All required fields must be filled in.' },
        { status: 400 }
      )
    }

    // Length limits
    if (full_name.length > 100 || email.length > 254 || phone.length > 20) {
      return NextResponse.json(
        { error: 'Input exceeds maximum length.' },
        { status: 400 }
      )
    }

    if (message && message.length > 2000) {
      return NextResponse.json(
        { error: 'Message must be under 2000 characters.' },
        { status: 400 }
      )
    }

    // Email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    // Phone validation
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Please provide a valid phone number.' },
        { status: 400 }
      )
    }

    // Business type must be from our known list
    if (!VALID_BUSINESS_TYPES.has(business_type)) {
      return NextResponse.json(
        { error: 'Invalid business type.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        full_name: sanitize(full_name).slice(0, 100),
        email: sanitize(email).toLowerCase().slice(0, 254),
        phone: sanitize(phone).slice(0, 20),
        business_type,
        message: message ? sanitize(message).slice(0, 2000) : null,
        metadata: {
          source: 'website_cta',
          submitted_at: new Date().toISOString(),
          ip,
        },
      })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to submit. Please try again.' },
        { status: 500 }
      )
    }

    // Dual-write to leads table (non-blocking — don't fail the request)
    supabase
      .from('leads')
      .insert({
        name: sanitize(full_name).slice(0, 100),
        email: sanitize(email).toLowerCase().slice(0, 254),
        phone: sanitize(phone).slice(0, 20),
        business_type,
        message: message ? sanitize(message).slice(0, 2000) : null,
        status: 'new',
      })
      .then(({ error: leadsError }) => {
        if (leadsError) {
          console.error('Leads insert error:', leadsError)
        }
      })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    )
  }
}
