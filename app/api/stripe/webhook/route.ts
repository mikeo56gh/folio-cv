import Stripe from 'stripe'
import { execute } from '../../../../lib/db'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const PRICE_PLAN_MAP: Record<string, string> = {
  [process.env.STRIPE_PRICE_SPRINT || '']:    'sprint',
  [process.env.STRIPE_PRICE_PRO || '']:       'pro',
  [process.env.STRIPE_PRICE_BOOST || '']:     'boost',
  [process.env.STRIPE_PRICE_RECRUITER || '']: 'recruiter',
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
        const plan = PRICE_PLAN_MAP[priceId] || 'free'
        await execute(
          'UPDATE users SET plan = $1, stripe_subscription_id = $2, subscription_status = $3, updated_at = NOW() WHERE stripe_customer_id = $4',
          [sub.status === 'active' ? plan : 'free', sub.id, sub.status, sub.customer]
        )
        break
      }
      case 'customer.subscription.deleted': {
        const sub = data.object as Stripe.Subscription
        await execute(
          'UPDATE users SET plan = $1, stripe_subscription_id = NULL, subscription_status = $2, updated_at = NOW() WHERE stripe_customer_id = $3',
          ['free', 'cancelled', sub.customer]
        )
        break
      }
      case 'invoice.payment_failed': {
        const invoice = data.object as Stripe.Invoice
        await execute('UPDATE users SET subscription_status = $1 WHERE stripe_customer_id = $2', ['past_due', invoice.customer])
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = data.object as Stripe.Invoice
        if (invoice.billing_reason === 'subscription_cycle') {
          await execute("UPDATE users SET usage = '{}', usage_reset_at = NOW(), subscription_status = 'active' WHERE stripe_customer_id = $1", [invoice.customer])
        }
        break
      }
    }
    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Handler failed' }), { status: 500 })
  }
}
