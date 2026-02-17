import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_REDIRECTS = ['/portal', '/admin']

function getSafeRedirect(value: string | null): string {
  const path = value ?? '/portal'
  if (ALLOWED_REDIRECTS.some((prefix) => path === prefix || path.startsWith(prefix + '/'))) {
    return path
  }
  return '/portal'
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = getSafeRedirect(searchParams.get('next'))

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Could not verify email. Please try again.')}`)
}
