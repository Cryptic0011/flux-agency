'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createStripeProduct, createStripePrice, updateSubscriptionPrice } from '@/lib/stripe-helpers'
import { pauseVercelProject, unpauseVercelProject } from '@/lib/vercel'

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

export async function createProject(formData: FormData) {
  const supabase = await requireAdmin()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const client_id = formData.get('client_id') as string
  const domain = formData.get('domain') as string
  const monthly_price = parseFloat(formData.get('monthly_price') as string) || 0
  const status = formData.get('status') as string
  const vercel_project_id = (formData.get('vercel_project_id') as string) || null

  // Build the insert data
  const insertData: Record<string, unknown> = {
    name,
    description,
    client_id,
    domain,
    monthly_price,
    status,
    vercel_project_id,
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert(insertData)
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  // If monthly_price > 0, create Stripe Product and Price
  if (monthly_price > 0) {
    try {
      const stripeProduct = await createStripeProduct(name, project.id)
      const stripePrice = await createStripePrice(stripeProduct.id, monthly_price)

      await supabase
        .from('projects')
        .update({
          stripe_product_id: stripeProduct.id,
          stripe_price_id: stripePrice.id,
        })
        .eq('id', project.id)
    } catch (err) {
      console.error('Failed to create Stripe product/price:', err)
      // Project is still created, Stripe can be set up later
    }
  }

  // Create site_controls row
  await supabase
    .from('site_controls')
    .insert({ project_id: project.id })

  revalidatePath('/admin/projects')
  revalidatePath('/admin')
  redirect(`/admin/projects/${project.id}`)
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await requireAdmin()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const domain = formData.get('domain') as string
  const monthly_price = parseFloat(formData.get('monthly_price') as string) || 0
  const status = formData.get('status') as string
  const vercel_project_id = (formData.get('vercel_project_id') as string) || null

  // Get existing project to check for price changes
  const { data: existingProject } = await supabase
    .from('projects')
    .select('monthly_price, stripe_product_id, stripe_price_id')
    .eq('id', id)
    .single()

  const updateData: Record<string, unknown> = {
    name,
    description,
    domain,
    monthly_price,
    status,
    vercel_project_id,
    updated_at: new Date().toISOString(),
  }

  // Handle Stripe price changes
  if (existingProject && monthly_price > 0) {
    const priceChanged = existingProject.monthly_price !== monthly_price

    if (!existingProject.stripe_product_id) {
      // No Stripe product yet — create one
      try {
        const stripeProduct = await createStripeProduct(name, id)
        const stripePrice = await createStripePrice(stripeProduct.id, monthly_price)
        updateData.stripe_product_id = stripeProduct.id
        updateData.stripe_price_id = stripePrice.id
      } catch (err) {
        console.error('Failed to create Stripe product/price:', err)
      }
    } else if (priceChanged && existingProject.stripe_product_id) {
      // Price changed — create a new Stripe Price
      try {
        const newStripePrice = await createStripePrice(existingProject.stripe_product_id, monthly_price)
        updateData.stripe_price_id = newStripePrice.id

        // If there's an active subscription, update it
        if (existingProject.stripe_price_id) {
          const { data: activeSub } = await supabase
            .from('subscriptions')
            .select('stripe_subscription_id')
            .eq('project_id', id)
            .eq('status', 'active')
            .single()

          if (activeSub?.stripe_subscription_id) {
            try {
              await updateSubscriptionPrice(
                activeSub.stripe_subscription_id,
                existingProject.stripe_price_id,
                newStripePrice.id
              )
            } catch (err) {
              console.error('Failed to update subscription price:', err)
            }
          }
        }
      } catch (err) {
        console.error('Failed to create new Stripe price:', err)
      }
    }
  }

  await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)

  revalidatePath(`/admin/projects/${id}`)
  revalidatePath('/admin/projects')
  revalidatePath('/admin')
}

export async function updateSiteControl(projectId: string, formData: FormData) {
  const supabase = await requireAdmin()

  const is_live = formData.get('is_live') === 'true'
  const auto_pause_enabled = formData.get('auto_pause_enabled') === 'true'

  // Fetch current state + vercel_project_id to detect is_live change
  const [{ data: currentControl }, { data: project }] = await Promise.all([
    supabase.from('site_controls').select('is_live').eq('project_id', projectId).single(),
    supabase.from('projects').select('vercel_project_id').eq('id', projectId).single(),
  ])

  const isLiveChanged = currentControl && currentControl.is_live !== is_live
  const vercelProjectId = project?.vercel_project_id

  // If is_live changed and project is linked to Vercel, call Vercel API first
  // so if it fails the DB stays unchanged
  if (isLiveChanged && vercelProjectId) {
    if (is_live) {
      await unpauseVercelProject(vercelProjectId)
    } else {
      await pauseVercelProject(vercelProjectId)
    }
  }

  await supabase
    .from('site_controls')
    .update({
      is_live,
      auto_pause_enabled,
      paused_reason: is_live ? null : 'manual',
      updated_at: new Date().toISOString(),
    })
    .eq('project_id', projectId)

  revalidatePath(`/admin/projects/${projectId}`)
}
