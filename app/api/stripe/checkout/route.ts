// app/api/stripe/checkout/route.ts
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLAN_PRICES: Record<string, string> = {
  sprint:    process.env.STRIPE_PRICE_SPRINT || '',
  pro:       process.env.STRIPE_PRICE_PRO || '',
  boost:     process.env.STRIPE_PRICE_BOOST || '',
  recruiter: process.env.STRIPE_PRICE_RECRUITER || '',
}

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(auth.replace('Bearer ', ''))
  if (error || !user) return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 })

  const { plan } = await request.json()
  const priceId = PLAN_PRICES[plan]
  if (!priceId) return new Response(JSON.stringify({ error: 'Invalid plan or price not configured: ' + plan }), { status: 400 })

  const { data: userRecord } = await getSupabaseAdmin().from('users').select('*').eq('id', user.id).single()
  let customerId = userRecord?.stripe_customer_id

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      name: userRecord?.full_name || '',
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await getSupabaseAdmin().from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  // Sprint is a 3-month subscription that auto-cancels
  // Set cancel_at to 90 days from now in subscription_data
  const isSprint = plan === 'sprint'
  const cancelAt = isSprint ? Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) : undefined

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${appUrl}/app?upgrade=success&plan=${plan}`,
    cancel_url: `${appUrl}/pricing?cancelled=true`,
    subscription_data: {
      ...(cancelAt ? { cancel_at: cancelAt } : {}),
      metadata: { supabase_user_id: user.id, plan },
    },
    allow_promotion_codes: true,
  })

  return new Response(JSON.stringify({ url: session.url }), { status: 200 })
}
