# Stripe Integration & Portal Enhancement — Design Document

**Date:** 2026-02-09
**Status:** Approved

## Overview

Integrate Stripe billing into the FLUX agency admin dashboard and client portal. Admin manages everything from the dashboard (create subscriptions, send invoices, generate checkout links). Clients see billing status, invoice history, and activity in their portal. Stripe hosted portal handles payment method updates.

## Core Principles

- **Admin autonomy** — Do everything from the FLUX dashboard, rarely open Stripe
- **Hands-off for clients** — Clients see their billing, pay invoices, update cards. No self-service plan changes.
- **1:1 mapping** — Each project = one Stripe Product. Each recurring price = one Stripe Price.
- **$0 projects are valid** — No Stripe subscription created. Client still has full portal access.
- **Multiple projects per client** — Fully supported

---

## 1. Data Architecture

### Database Changes

**`profiles` — add columns:**
- `stripe_customer_id` (text, nullable) — Stripe Customer ID
- `phone` (text, nullable) — for client contact info

**`projects` — add columns:**
- `stripe_product_id` (text, nullable) — Stripe Product ID
- `stripe_price_id` (text, nullable) — Stripe Price ID (current active price)
- `vercel_project_id` (text, nullable) — Vercel project ID for kill switch

**`subscriptions` table (populate existing or recreate):**
- `id` (UUID, PK)
- `project_id` (UUID, FK → projects)
- `client_id` (UUID, FK → profiles)
- `stripe_subscription_id` (text, unique)
- `stripe_price_id` (text)
- `status` (enum: active, past_due, canceled, incomplete, trialing, paused)
- `current_period_start` (timestamptz)
- `current_period_end` (timestamptz)
- `cancel_at` (timestamptz, nullable)
- `created_at` / `updated_at`

**`invoices` table (populate existing or recreate):**
- `id` (UUID, PK)
- `project_id` (UUID, FK → projects, nullable — one-time invoices may not be project-specific)
- `client_id` (UUID, FK → profiles)
- `stripe_invoice_id` (text, unique)
- `number` (text) — Stripe invoice number
- `amount` (integer) — in cents
- `currency` (text, default 'usd')
- `status` (enum: draft, open, paid, void, uncollectible)
- `due_date` (timestamptz, nullable)
- `paid_at` (timestamptz, nullable)
- `hosted_invoice_url` (text) — Stripe hosted invoice page
- `invoice_pdf` (text) — PDF download URL
- `description` (text, nullable)
- `created_at` / `updated_at`

**`activity_log` table (new):**
- `id` (UUID, PK)
- `project_id` (UUID, FK → projects, nullable)
- `client_id` (UUID, FK → profiles, nullable)
- `event_type` (text) — e.g., 'invoice.paid', 'revision.created', 'subscription.started'
- `description` (text) — human-readable, e.g., "Invoice #1042 paid — $150"
- `metadata` (jsonb, nullable)
- `created_at`

**`admin_alerts` table (new):**
- `id` (UUID, PK)
- `type` (text) — 'payment_failed', 'invoice_overdue', 'new_revision'
- `message` (text)
- `project_id` (UUID, FK → projects, nullable)
- `client_id` (UUID, FK → profiles, nullable)
- `is_read` (boolean, default false)
- `created_at`

### Stripe ↔ Local Data Flow

- Project created with price > 0 → Stripe Product + Price created → IDs stored on project
- Client assigned + checkout completed → Stripe Subscription created → local subscription record
- Monthly billing → Stripe creates invoice → webhook → local invoice record
- Admin creates one-time invoice → Stripe Invoice with line items → webhook → local record
- Price change in admin → new Stripe Price created → subscription updated → webhook syncs

---

## 2. Admin Dashboard Changes

### Project Creation/Edit Form (enhanced)
- **Vercel Project dropdown** — populated from Vercel API (`GET /v9/projects`)
- **Monthly Price** — triggers Stripe Product/Price creation/update on save
- **Billing Status indicator** — read-only badge synced from Stripe

### Client Detail Page (enhanced)
- **Billing Overview** — MRR from this client, payment method on file (y/n)
- **"Generate Checkout Link" button** — creates Stripe Checkout Session, copies to clipboard
- **Invoice section** — all invoices across all projects
- **"Create Invoice" button** — opens line-item builder modal

### Line-Item Invoice Builder (admin modal)
- Select project (dropdown of client's projects)
- Add multiple line items: description + amount
- Preview total
- "Send Invoice" → creates Stripe Invoice, sends via Stripe email

### Admin Dashboard Home (enhanced)
- **Monthly Revenue stat card** — sum of active subscriptions
- **Outstanding Invoices stat card** — count + total of unpaid
- **Needs Attention section** — unread admin alerts (failed payments, overdue invoices)

### Clients List (enhanced)
- **"+ New Client" button** — direct client creation (skip lead pipeline)
- Form: Name, Email, Phone (optional)
- Creates: auth account, profile, Stripe Customer, sends invite email

### Projects List (enhanced)
- **Billing status badge** — green (paid), yellow (pending), red (overdue), gray (no billing)

---

## 3. Client Portal Changes

### Portal Dashboard (enhanced)
- **Project cards** — add billing badge + monthly price
- **Needs Attention banner** — overdue invoices, expiring payment method
- **Recent Activity feed** — last 5 events across all projects

### Billing Page (`/portal/billing`) — replaces Invoices placeholder
- **Active Subscriptions section** — card per project: name, amount, next billing date, status
- **Invoice History** — table: Date, Description/Project, Amount, Status, View link (Stripe hosted)
- **Payment Method** — last 4 + expiry, "Update Payment Method" → Stripe hosted portal

### Project Detail (enhanced)
- **Activity Timeline** — chronological feed of all events for this project
- **Billing summary card** — sidebar: monthly price, status, next billing date

---

## 4. Client Onboarding Flow

### Two paths, same destination:

**From lead pipeline:**
1. Lead → Qualify → "Convert to Client"
2. Creates: auth account, profile (role: client), Stripe Customer
3. Sends branded invite email via Resend
4. Admin creates project(s), sets price, links Vercel
5. Admin generates checkout link, shares with client
6. Client pays → subscription active → portal ready

**Direct creation (in-person/referrals):**
1. Admin → Clients → "+ New Client" → Name, Email
2. Same creation steps as above
3. Continue from step 4

### Checkout flow:
- Admin generates Stripe Checkout Session from client or project page
- Link can be shared async (email/Slack) or during a call
- Client enters payment → webhook fires → subscription activated

---

## 5. Webhook Architecture

### Endpoint: `/api/webhooks/stripe` (POST)

| Stripe Event | Action |
|---|---|
| `checkout.session.completed` | Create local subscription, mark billing active, log activity |
| `invoice.created` | Create local invoice record (draft) |
| `invoice.paid` | Mark paid, log activity |
| `invoice.payment_failed` | Flag invoice, create admin alert, log activity |
| `invoice.overdue` | Flag invoice, create admin alert, log activity (future: kill switch) |
| `customer.subscription.updated` | Sync status/price changes |
| `customer.subscription.deleted` | Mark cancelled, log activity |

### Webhook security:
- Verify Stripe signature using webhook secret
- Idempotent processing (check if event already handled via stripe ID)

---

## 6. Activity Timeline & Admin Alerts

### Activity Log
- Single `activity_log` table powers all timeline views
- Written to by: webhook handler, revision actions, subscription actions
- Queryable by project_id, client_id, or globally
- Client portal shows client-visible events only
- Admin sees everything

### Admin Alerts
- Written by webhook handler for payment issues
- Written by revision actions for new requests
- "Needs Attention" section on admin dashboard shows unread
- Dismissible (marks as read)

---

## 7. Environment Variables Needed

```
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
VERCEL_API_TOKEN=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

---

## 8. Future Considerations (not in this phase)

- **Vercel kill switch** — `invoice.overdue` (7 days) → Vercel API pause deployment
- **Embedded Stripe Elements** — upgrade from hosted portal to in-app payment management
- **Email notifications** — invoice reminders, revision updates via Resend
- **Client self-service checkout** — clients purchase add-on services from portal
