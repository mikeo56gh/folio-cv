// app/api/stripe/webhook/route.ts
// Handles the full subscription lifecycle including Sprint (3-month plan)
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: false } }

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PRICE_PLAN_MAP: Record<string, string> = {
  [process.env.STRIPE_PRICE_SPRINT || '']:    'sprint',
  [process.env.STRIPE_PRICE_PRO || '']:       'pro',
  [process.env.STRIPE_PRICE_BOOST || '']:     'boost',
  [process.env.STRIPE_PRICE_RECRUITER || '']: 'recruiter',
}

function getPlanFromPriceId(priceId: string): string {
  return PRICE_PLAN_MAP[priceId] || 'free'
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const { type, data } = event

  try {
    switch (type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = data.object as Stripe.Subscription
        const priceId = sub.items.data[0]?.price?.id || ''
        const plan = getPlanFromPriceId(priceId)

        const { data: users } = await supabaseAdmin
          .from('users').select('id').eq('stripe_customer_id', sub.customer).limit(1)

        if (users?.length) {
          await getSupabaseAdmin().from('users').update({
            plan: sub.status === 'active' ? plan : 'free',
            stripe_subscription_id: sub.id,
            subscription_status: sub.status,
            usage: sub.status === 'active' ? {} : undefined,
            updated_at: new Date().toISOString(),
          }).eq('id', users[0].id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = data.object as Stripe.Subscription
        const { data: users } = await supabaseAdmin
          .from('users').select('id').eq('stripe_customer_id', sub.customer).limit(1)
        if (users?.length) {
          await getSupabaseAdmin().from('users').update({
            plan: 'free',
            stripe_subscription_id: null,
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString(),
          }).eq('id', users[0].id)
        }
        break
      }

      // Sprint: one-time payment treated as 3-month subscription
      // Stripe creates this as a subscription with 3 x monthly billing cycles
      // When the 3rd invoice is paid, the subscription auto-cancels (set in Stripe dashboard)
      // The deleted event above handles downgrade back to free

      case 'invoice.payment_failed': {
        const invoice = data.object as Stripe.Invoice
        await supabaseAdmin
          .from('users')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', invoice.customer as string)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = data.object as Stripe.Invoice
        if (invoice.billing_reason === 'subscription_cycle') {
          await supabaseAdmin
            .from('users')
            .update({ usage: {}, usage_reset_at: new Date().toISOString(), subscription_status: 'active' })
            .eq('stripe_customer_id', invoice.customer as string)
        }
        break
      }

      default:
        break
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err: any) {
    console.error(`Error handling ${type}:`, err)
    return new Response(JSON.stringify({ error: 'Handler failed' }), { status: 500 })
  }
}
