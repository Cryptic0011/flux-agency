'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createStripeCustomer } from '@/lib/stripe-helpers'

export async function updateLead(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const status = formData.get('status') as string
  const notes = formData.get('notes') as string

  await supabase
    .from('leads')
    .update({ status, notes, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath(`/admin/leads/${id}`)
  revalidatePath('/admin/leads')
  revalidatePath('/admin')
}

export async function convertLeadToClient(leadId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (!lead) throw new Error('Lead not found')

  // Invite the user via email using service role
  const adminClient = createAdminClient()
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    lead.email,
    { data: { full_name: lead.name } }
  )

  if (inviteError) throw new Error(`Failed to invite: ${inviteError.message}`)

  const newUserId = inviteData.user.id

  // Create Stripe Customer and store on profile
  try {
    const stripeCustomer = await createStripeCustomer(lead.name, lead.email, newUserId)
    await adminClient
      .from('profiles')
      .update({ stripe_customer_id: stripeCustomer.id })
      .eq('id', newUserId)
  } catch (err) {
    console.error('Failed to create Stripe customer during lead conversion:', err)
    // Continue — Stripe customer can be created later
  }

  // Update lead status to converted
  await supabase
    .from('leads')
    .update({ status: 'converted', updated_at: new Date().toISOString() })
    .eq('id', leadId)

  revalidatePath('/admin/leads')
  revalidatePath('/admin')
  redirect('/admin/clients')
}
