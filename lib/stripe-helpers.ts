import Stripe from 'stripe'
import { stripe } from './stripe'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

/**
 * Creates a Stripe Product for a project.
 */
export async function createStripeProduct(
  projectName: string,
  projectId: string
): Promise<Stripe.Product> {
  return stripe.products.create({
    name: projectName,
    metadata: { project_id: projectId },
  })
}

/**
 * Creates a recurring monthly Stripe Price on a product.
 * @param unitAmount — price in dollars (converted to cents internally)
 */
export async function createStripePrice(
  productId: string,
  unitAmount: number
): Promise<Stripe.Price> {
  return stripe.prices.create({
    product: productId,
    unit_amount: Math.round(unitAmount * 100),
    currency: 'usd',
    recurring: { interval: 'month' },
  })
}

/**
 * Creates a Stripe Customer linked to a profile.
 */
export async function createStripeCustomer(
  name: string,
  email: string,
  profileId: string
): Promise<Stripe.Customer> {
  return stripe.customers.create({
    name,
    email,
    metadata: { profile_id: profileId },
  })
}

/**
 * Creates a Checkout Session for a subscription.
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  projectId: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/portal?checkout=success`,
    cancel_url: `${baseUrl}/portal?checkout=canceled`,
    metadata: { project_id: projectId },
    subscription_data: {
      metadata: { project_id: projectId },
    },
  })
}

/**
 * Creates a one-time invoice with line items, then finalizes and sends it.
 * @param items — each item has a description and amount in dollars
 */
export async function createInvoice(
  customerId: string,
  items: { description: string; amount: number }[],
  projectId?: string
): Promise<Stripe.Invoice> {
  const invoice = await stripe.invoices.create({
    customer: customerId,
    auto_advance: true,
    collection_method: 'send_invoice',
    days_until_due: 30,
    metadata: projectId ? { project_id: projectId } : undefined,
  })

  // Add line items to the invoice
  for (const item of items) {
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      description: item.description,
      amount: Math.round(item.amount * 100),
      currency: 'usd',
    })
  }

  // Finalize and send the invoice
  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)

  await stripe.invoices.sendInvoice(finalizedInvoice.id)

  return finalizedInvoice
}

/**
 * Updates a subscription to a new price, replacing the existing item.
 */
export async function updateSubscriptionPrice(
  subscriptionId: string,
  oldPriceId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Find the existing subscription item with the old price
  const existingItem = subscription.items.data.find(
    (item) => item.price.id === oldPriceId
  )

  if (!existingItem) {
    throw new Error(`Subscription item with price ${oldPriceId} not found`)
  }

  return stripe.subscriptions.update(subscriptionId, {
    items: [
      { id: existingItem.id, price: newPriceId },
    ],
    proration_behavior: 'create_prorations',
  })
}

/**
 * Creates a Stripe Billing Portal session for payment method management.
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

/**
 * Cancels a subscription at the end of the current billing period.
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}
