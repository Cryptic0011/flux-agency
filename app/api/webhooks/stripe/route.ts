import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { pauseVercelProject, unpauseVercelProject } from '@/lib/vercel'

export const runtime = 'nodejs'

async function getProfileByStripeCustomer(
  supabase: ReturnType<typeof createAdminClient>,
  customerId: string
) {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()
  return data
}

async function getSubscriptionByStripeId(
  supabase: ReturnType<typeof createAdminClient>,
  stripeSubscriptionId: string
) {
  const { data } = await supabase
    .from('subscriptions')
    .select('id, project_id, client_id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single()
  return data
}

function formatCurrency(amountInCents: number): string {
  return `$${(amountInCents / 100).toFixed(2)}`
}

function toTimestamp(unixSeconds: number | null): string | null {
  if (!unixSeconds) return null
  return new Date(unixSeconds * 1000).toISOString()
}

/**
 * Extracts the Stripe subscription ID from an invoice's parent field (v20 API).
 * In the 2026-01-28.clover API, invoices use `parent.subscription_details.subscription`
 * instead of a top-level `subscription` field.
 */
function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  if (
    invoice.parent?.type === 'subscription_details' &&
    invoice.parent.subscription_details
  ) {
    const sub = invoice.parent.subscription_details.subscription
    return typeof sub === 'string' ? sub : sub?.id ?? null
  }
  return null
}

/**
 * Looks up the project_id for an invoice by checking invoice metadata first,
 * then the parent subscription's metadata, then the local subscriptions table.
 */
async function resolveProjectId(
  supabase: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice
): Promise<string | null> {
  // 1. Check invoice-level metadata
  if (invoice.metadata?.project_id) {
    return invoice.metadata.project_id
  }

  // 2. Check the parent subscription's metadata snapshot on the invoice
  if (
    invoice.parent?.type === 'subscription_details' &&
    invoice.parent.subscription_details?.metadata?.project_id
  ) {
    return invoice.parent.subscription_details.metadata.project_id
  }

  // 3. Fall back to local DB lookup via stripe subscription ID
  const stripeSubId = getSubscriptionIdFromInvoice(invoice)
  if (stripeSubId) {
    const localSub = await getSubscriptionByStripeId(supabase, stripeSubId)
    return localSub?.project_id ?? null
  }

  return null
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleCheckoutSessionCompleted(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session
) {
  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id

  const projectId = session.metadata?.project_id

  if (!customerId || !subscriptionId) {
    console.error('checkout.session.completed: missing customer or subscription')
    return
  }

  // Look up the profile from the Stripe customer
  const profile = await getProfileByStripeCustomer(supabase, customerId)
  if (!profile) {
    console.error(`checkout.session.completed: no profile for customer ${customerId}`)
    return
  }

  // Retrieve the full subscription to get price and billing info
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0]?.price?.id ?? null

  // In Stripe v20 API, current_period_start/end are removed from the Subscription
  // object. We derive the current period from the latest invoice's period fields,
  // or use billing_cycle_anchor as the period start and compute end as +1 month.
  const latestInvoice = subscription.latest_invoice
  let periodStart: string | null = null
  let periodEnd: string | null = null

  if (latestInvoice && typeof latestInvoice !== 'string') {
    periodStart = toTimestamp(latestInvoice.period_start)
    periodEnd = toTimestamp(latestInvoice.period_end)
  } else {
    periodStart = toTimestamp(subscription.billing_cycle_anchor)
  }

  await supabase.from('subscriptions').upsert(
    {
      client_id: profile.id,
      project_id: projectId ?? null,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      status: subscription.status,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_subscription_id' }
  )

  await supabase.from('activity_log').insert({
    project_id: projectId ?? null,
    client_id: profile.id,
    event_type: 'subscription_created',
    description: 'New subscription activated via Checkout',
    metadata: {
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
    },
  })
}

async function handleInvoiceCreated(
  supabase: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice
) {
  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id ?? null

  if (!customerId) return

  const profile = await getProfileByStripeCustomer(supabase, customerId)
  if (!profile) {
    console.error(`invoice.created: no profile for customer ${customerId}`)
    return
  }

  const projectId = await resolveProjectId(supabase, invoice)

  const status = invoice.status === 'draft' ? 'draft' : 'open'
  const stripeSubId = getSubscriptionIdFromInvoice(invoice)
  const invoiceType = stripeSubId ? 'subscription' : 'one_time'

  await supabase.from('invoices').upsert(
    {
      client_id: profile.id,
      project_id: projectId,
      stripe_invoice_id: invoice.id,
      number: invoice.number,
      amount: (invoice.amount_due ?? 0) / 100,
      currency: invoice.currency ?? 'usd',
      type: invoiceType,
      status,
      due_date: toTimestamp(invoice.due_date),
      hosted_invoice_url: invoice.hosted_invoice_url ?? null,
      invoice_pdf: invoice.invoice_pdf ?? null,
      description: invoice.description ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_invoice_id' }
  )
}

async function handleInvoicePaid(
  supabase: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice
) {
  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id ?? null

  if (!customerId) return

  const profile = await getProfileByStripeCustomer(supabase, customerId)
  const projectId = await resolveProjectId(supabase, invoice)

  const stripeSubId = getSubscriptionIdFromInvoice(invoice)
  const invoiceType = stripeSubId ? 'subscription' : 'one_time'

  // Upsert so it works even if invoice.created wasn't processed
  await supabase.from('invoices').upsert(
    {
      client_id: profile?.id ?? null,
      project_id: projectId,
      stripe_invoice_id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_paid ?? 0,
      currency: invoice.currency ?? 'usd',
      type: invoiceType,
      status: 'paid',
      paid_at: new Date().toISOString(),
      due_date: toTimestamp(invoice.due_date),
      hosted_invoice_url: invoice.hosted_invoice_url ?? null,
      invoice_pdf: invoice.invoice_pdf ?? null,
      description: invoice.description ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_invoice_id' }
  )

  if (profile) {
    const amount = formatCurrency(invoice.amount_paid ?? 0)
    await supabase.from('activity_log').insert({
      project_id: projectId,
      client_id: profile.id,
      event_type: 'invoice_paid',
      description: `Invoice #${invoice.number} paid — ${amount}`,
      metadata: {
        stripe_invoice_id: invoice.id,
        amount_paid: invoice.amount_paid,
      },
    })
  }

  // Auto-unpause: only if site was paused due to overdue invoice (not manual)
  if (projectId) {
    const { data: siteControl } = await supabase
      .from('site_controls')
      .select('is_live, paused_reason')
      .eq('project_id', projectId)
      .single()

    if (siteControl && !siteControl.is_live && siteControl.paused_reason === 'invoice_overdue') {
      const { data: proj } = await supabase
        .from('projects')
        .select('vercel_project_id')
        .eq('id', projectId)
        .single()

      if (proj?.vercel_project_id) {
        try {
          await unpauseVercelProject(proj.vercel_project_id)
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error'
          await supabase.from('admin_alerts').insert({
            type: 'vercel_unpause_failed',
            message: `Failed to auto-unpause Vercel project: ${msg}`,
            project_id: projectId,
            client_id: profile?.id ?? null,
          })
        }
      }

      await supabase
        .from('site_controls')
        .update({
          is_live: true,
          paused_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq('project_id', projectId)

      if (profile) {
        await supabase.from('activity_log').insert({
          project_id: projectId,
          client_id: profile.id,
          event_type: 'site_auto_unpaused',
          description: `Site auto-unpaused after invoice #${invoice.number} was paid`,
          metadata: { stripe_invoice_id: invoice.id },
        })
      }
    }
  }
}

async function handleInvoicePaymentFailed(
  supabase: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice
) {
  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id ?? null

  if (!customerId) return

  const profile = await getProfileByStripeCustomer(supabase, customerId)
  const projectId = await resolveProjectId(supabase, invoice)

  const stripeSubId = getSubscriptionIdFromInvoice(invoice)
  const invoiceType = stripeSubId ? 'subscription' : 'one_time'

  await supabase.from('invoices').upsert(
    {
      client_id: profile?.id ?? null,
      project_id: projectId,
      stripe_invoice_id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_due ?? 0,
      currency: invoice.currency ?? 'usd',
      type: invoiceType,
      status: 'open',
      due_date: toTimestamp(invoice.due_date),
      hosted_invoice_url: invoice.hosted_invoice_url ?? null,
      invoice_pdf: invoice.invoice_pdf ?? null,
      description: invoice.description ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_invoice_id' }
  )

  const amount = formatCurrency(invoice.amount_due ?? 0)

  await supabase.from('admin_alerts').insert({
    type: 'payment_failed',
    message: `Payment failed for invoice #${invoice.number} (${amount})`,
    project_id: projectId,
    client_id: profile?.id ?? null,
  })

  if (profile) {
    await supabase.from('activity_log').insert({
      project_id: projectId,
      client_id: profile.id,
      event_type: 'payment_failed',
      description: `Payment failed for invoice #${invoice.number} — ${amount}`,
      metadata: { stripe_invoice_id: invoice.id },
    })
  }
}

async function handleInvoiceOverdue(
  supabase: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice
) {
  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id ?? null

  if (!customerId) return

  const profile = await getProfileByStripeCustomer(supabase, customerId)
  const projectId = await resolveProjectId(supabase, invoice)

  const stripeSubId = getSubscriptionIdFromInvoice(invoice)
  const invoiceType = stripeSubId ? 'subscription' : 'one_time'

  await supabase.from('invoices').upsert(
    {
      client_id: profile?.id ?? null,
      project_id: projectId,
      stripe_invoice_id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_due ?? 0,
      currency: invoice.currency ?? 'usd',
      type: invoiceType,
      status: 'open',
      due_date: toTimestamp(invoice.due_date),
      hosted_invoice_url: invoice.hosted_invoice_url ?? null,
      invoice_pdf: invoice.invoice_pdf ?? null,
      description: invoice.description ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_invoice_id' }
  )

  const amount = formatCurrency(invoice.amount_due ?? 0)

  await supabase.from('admin_alerts').insert({
    type: 'invoice_overdue',
    message: `Invoice #${invoice.number} is overdue (${amount})`,
    project_id: projectId,
    client_id: profile?.id ?? null,
  })

  if (profile) {
    await supabase.from('activity_log').insert({
      project_id: projectId,
      client_id: profile.id,
      event_type: 'invoice_overdue',
      description: `Invoice #${invoice.number} is overdue — ${amount}`,
      metadata: { stripe_invoice_id: invoice.id },
    })
  }

  // Auto-pause: if project has auto_pause_enabled, is_live, and a Vercel link
  if (projectId) {
    const { data: siteControl } = await supabase
      .from('site_controls')
      .select('is_live, auto_pause_enabled')
      .eq('project_id', projectId)
      .single()

    if (siteControl?.auto_pause_enabled && siteControl.is_live) {
      const { data: proj } = await supabase
        .from('projects')
        .select('vercel_project_id')
        .eq('id', projectId)
        .single()

      if (proj?.vercel_project_id) {
        try {
          await pauseVercelProject(proj.vercel_project_id)
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error'
          await supabase.from('admin_alerts').insert({
            type: 'vercel_pause_failed',
            message: `Failed to auto-pause Vercel project: ${msg}`,
            project_id: projectId,
            client_id: profile?.id ?? null,
          })
        }
      }

      await supabase
        .from('site_controls')
        .update({
          is_live: false,
          paused_reason: 'invoice_overdue',
          updated_at: new Date().toISOString(),
        })
        .eq('project_id', projectId)

      if (profile) {
        await supabase.from('activity_log').insert({
          project_id: projectId,
          client_id: profile.id,
          event_type: 'site_auto_paused',
          description: `Site auto-paused due to overdue invoice #${invoice.number}`,
          metadata: { stripe_invoice_id: invoice.id },
        })
      }
    }
  }
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0]?.price?.id ?? null

  // Derive period from latest invoice if expanded, otherwise leave as-is
  const latestInvoice = subscription.latest_invoice
  let periodStart: string | null = null
  let periodEnd: string | null = null

  if (latestInvoice && typeof latestInvoice !== 'string') {
    periodStart = toTimestamp(latestInvoice.period_start)
    periodEnd = toTimestamp(latestInvoice.period_end)
  }

  const updateData: Record<string, unknown> = {
    status: subscription.status,
    stripe_price_id: priceId,
    cancel_at: toTimestamp(subscription.cancel_at),
    updated_at: new Date().toISOString(),
  }

  // Only update period fields if we have values from the invoice
  if (periodStart) updateData.current_period_start = periodStart
  if (periodEnd) updateData.current_period_end = periodEnd

  await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('stripe_subscription_id', subscription.id)
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription
) {
  const localSub = await getSubscriptionByStripeId(supabase, subscription.id)

  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (localSub) {
    await supabase.from('activity_log').insert({
      project_id: localSub.project_id,
      client_id: localSub.client_id,
      event_type: 'subscription_canceled',
      description: 'Subscription canceled',
      metadata: { stripe_subscription_id: subscription.id },
    })
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Webhook signature verification failed: ${message}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          supabase,
          event.data.object as Stripe.Checkout.Session
        )
        break

      case 'invoice.created':
        await handleInvoiceCreated(supabase, event.data.object as Stripe.Invoice)
        break

      case 'invoice.paid':
        await handleInvoicePaid(supabase, event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabase, event.data.object as Stripe.Invoice)
        break

      case 'invoice.overdue':
        await handleInvoiceOverdue(supabase, event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          supabase,
          event.data.object as Stripe.Subscription
        )
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          supabase,
          event.data.object as Stripe.Subscription
        )
        break

      default:
        // Unhandled event type — acknowledge receipt
        break
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Webhook handler error for ${event.type}: ${message}`)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
