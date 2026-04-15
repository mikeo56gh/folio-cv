// app/api/stripe/portal/route.ts
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const { data: { user } } = await getSupabaseAdmin().auth.getUser(auth.replace('Bearer ', ''))
  if (!user) return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 })

  const { data: userRecord } = await getSupabaseAdmin().from('users').select('stripe_customer_id').eq('id', user.id).single()
  if (!userRecord?.stripe_customer_id) return new Response(JSON.stringify({ error: 'No billing account found' }), { status: 400 })

  const session = await getStripe().billingPortal.sessions.create({
    customer: userRecord.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app`,
  })

  return new Response(JSON.stringify({ url: session.url }), { status: 200 })
}
