'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createBillingPortalSession } from '@/lib/stripe-helpers'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function redirectToBillingPortal() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    redirect('/portal/billing')
  }

  const session = await createBillingPortalSession(
    profile.stripe_customer_id,
    `${baseUrl}/portal/billing`
  )

  redirect(session.url)
}
