# Stripe Integration — Implementation Plan

**Date:** 2026-02-09
**Design Doc:** ./2026-02-09-stripe-integration-design.md

## Tracks (parallelizable)

### Track A: Database Migrations
**No dependencies — can run first**

1. **Migration: Alter `projects` table**
   - Add `stripe_product_id` (text, nullable)
   - Add `stripe_price_id` (text, nullable)

2. **Migration: Alter `subscriptions` table**
   - Add `stripe_price_id` (text, nullable)
   - Add `current_period_start` (timestamptz, nullable)
   - Add `cancel_at` (timestamptz, nullable)
   - Update status check constraint to include: `active`, `past_due`, `canceled`, `unpaid`, `incomplete`, `trialing`, `paused`

3. **Migration: Alter `invoices` table**
   - Add `number` (text, nullable) — Stripe invoice number
   - Add `currency` (text, default 'usd')
   - Add `hosted_invoice_url` (text, nullable)
   - Add `invoice_pdf` (text, nullable)
   - Add `description` (text, nullable)
   - Make `project_id` nullable (one-time invoices may span projects)

4. **Migration: Create `activity_log` table**
   - Schema per design doc
   - RLS: admin sees all, client sees own (by client_id)

5. **Migration: Create `admin_alerts` table**
   - Schema per design doc
   - RLS: admin only

---

### Track B: Stripe Library & Webhook Handler
**No dependencies — can run parallel with Track A**

1. **Install Stripe SDK**
   - `npm install stripe`
   - Create `lib/stripe.ts` — Stripe client singleton

2. **Create `/api/webhooks/stripe/route.ts`**
   - Verify Stripe signature
   - Handle events: checkout.session.completed, invoice.created, invoice.paid, invoice.payment_failed, invoice.overdue, customer.subscription.updated, customer.subscription.deleted
   - Each handler: update local DB + write to activity_log + create admin_alert if needed
   - Idempotent: check stripe IDs before inserting

3. **Create `lib/stripe-helpers.ts`**
   - `createStripeProduct(projectName)` → returns product ID
   - `createStripePrice(productId, amount)` → returns price ID
   - `createStripeCustomer(name, email)` → returns customer ID
   - `createCheckoutSession(customerId, priceId, projectId)` → returns session URL
   - `createStripeInvoice(customerId, lineItems[])` → returns invoice
   - `updateSubscriptionPrice(subscriptionId, newPriceId)` → returns updated sub
   - `createBillingPortalSession(customerId)` → returns portal URL

---

### Track C: Vercel API Integration
**No dependencies — can run parallel**

1. **Create `lib/vercel.ts`**
   - `listVercelProjects()` → fetch from Vercel API, return list for dropdown
   - Uses VERCEL_API_TOKEN env var

2. **Create `/api/vercel/projects/route.ts`**
   - GET endpoint that returns Vercel projects list (called by admin dropdown)

---

### Track D: Admin Dashboard Enhancements
**Depends on: Track A (migrations), Track B (stripe helpers), Track C (vercel)**

1. **Enhance project creation/edit form**
   - Add Vercel project dropdown (fetches from `/api/vercel/projects`)
   - On save with price > 0: call createStripeProduct + createStripePrice
   - On price change: create new Stripe Price, update subscription
   - Show billing status badge

2. **Enhance client detail page**
   - Billing overview section (MRR, payment method status)
   - "Generate Checkout Link" button → createCheckoutSession → copy to clipboard
   - Invoice list across all projects
   - "Create Invoice" button → line-item builder modal

3. **Create line-item invoice builder modal**
   - Project selector dropdown
   - Dynamic line items (description + amount, add/remove)
   - Total preview
   - Submit → createStripeInvoice

4. **Add "+ New Client" to clients list page**
   - Form: Name, Email, Phone
   - Creates: auth account, profile, Stripe Customer
   - Sends invite email

5. **Enhance admin dashboard home**
   - Monthly Revenue stat card
   - Outstanding Invoices stat card
   - "Needs Attention" section (unread admin_alerts)

6. **Enhance projects list**
   - Add billing status badge column

7. **Enhance convert-to-client action**
   - Also create Stripe Customer
   - Store stripe_customer_id on profile

---

### Track E: Client Portal Enhancements
**Depends on: Track A (migrations), Track B (stripe helpers)**

1. **Enhance portal dashboard**
   - Add billing badge + price to project cards
   - Needs Attention banner (overdue invoices)
   - Recent Activity feed (from activity_log)

2. **Build Billing page (`/portal/billing`)**
   - Replace invoices placeholder
   - Active Subscriptions section (cards per project)
   - Invoice History table with status badges + View links
   - Payment Method section with "Update" → Stripe billing portal

3. **Enhance project detail**
   - Activity Timeline component (from activity_log)
   - Billing summary card in sidebar

---

## Execution Order

```
Phase 1 (parallel):  Track A + Track B + Track C
Phase 2 (parallel):  Track D + Track E  (after Phase 1 completes)
```

## Environment Variables to Add

```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
VERCEL_API_TOKEN=...
```
