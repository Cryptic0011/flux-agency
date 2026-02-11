'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createStripeCustomer, createCheckoutSession, createInvoice } from '@/lib/stripe-helpers'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')
  return supabase
}

export async function createClientAction(formData: FormData) {
  await requireAdmin()

  const full_name = formData.get('full_name') as string
  const email = formData.get('email') as string
  const phone = (formData.get('phone') as string) || null

  if (!full_name || !email) throw new Error('Name and email are required')

  // Invite the user via email using service role
  const adminClient = createAdminClient()
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    { data: { full_name } }
  )

  if (inviteError) throw new Error(`Failed to invite: ${inviteError.message}`)

  const userId = inviteData.user.id

  // Update the profile with phone and ensure role is client
  await adminClient
    .from('profiles')
    .update({
      full_name,
      phone,
      role: 'client',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  // Create Stripe Customer
  const stripeCustomer = await createStripeCustomer(full_name, email, userId)
  await adminClient
    .from('profiles')
    .update({ stripe_customer_id: stripeCustomer.id })
    .eq('id', userId)

  revalidatePath('/admin/clients')
  revalidatePath('/admin')
  redirect(`/admin/clients/${userId}`)
}

export async function generateCheckoutLink(formData: FormData) {
  await requireAdmin()

  const projectId = formData.get('project_id') as string
  const clientId = formData.get('client_id') as string

  const supabase = await createClient()

  // Get project with stripe_price_id
  const { data: project } = await supabase
    .from('projects')
    .select('stripe_price_id, name')
    .eq('id', projectId)
    .single()

  if (!project?.stripe_price_id) throw new Error('Project has no Stripe price configured')

  // Get client with stripe_customer_id
  const { data: client } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', clientId)
    .single()

  if (!client?.stripe_customer_id) throw new Error('Client has no Stripe customer ID')

  const session = await createCheckoutSession(
    client.stripe_customer_id,
    project.stripe_price_id,
    projectId
  )

  return session.url
}

export async function sendInvoiceAction(formData: FormData) {
  await requireAdmin()

  const clientId = formData.get('client_id') as string
  const projectId = (formData.get('project_id') as string) || undefined
  const itemsJson = formData.get('items') as string

  let items: { description: string; amount: number }[]
  try {
    items = JSON.parse(itemsJson)
  } catch {
    throw new Error('Invalid line items')
  }

  if (!items || items.length === 0) throw new Error('At least one line item is required')

  const supabase = await createClient()

  // Get client stripe_customer_id
  const { data: client } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', clientId)
    .single()

  if (!client?.stripe_customer_id) throw new Error('Client has no Stripe customer ID')

  await createInvoice(client.stripe_customer_id, items, projectId)

  revalidatePath(`/admin/clients/${clientId}`)
}

export async function dismissAlert(alertId: string) {
  const supabase = await requireAdmin()

  await supabase
    .from('admin_alerts')
    .update({ is_read: true })
    .eq('id', alertId)

  revalidatePath('/admin')
}
