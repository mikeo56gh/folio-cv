import Stripe from 'stripe'
import { queryOne, execute } from '../../../lib/db'
import { getAuthUser, getOrCreateUser } from '../../../lib/auth'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const PLAN_PRICES: Record<string, string> = {
  sprint: process.env.STRIPE_PRICE_SPRINT || '',
  pro: process.env.STRIPE_PRICE_PRO || '',
  boost: process.env.STRIPE_PRICE_BOOST || '',
  recruiter: process.env.STRIPE_PRICE_RECRUITER || '',
}

export async function POST(request: Request) {
  const authUser = await getAuthUser(request)
  if (!authUser) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const { userId, email } = authUser
  const userRecord = await getOrCreateUser(userId, email)
  const { plan } = await request.json()
  const priceId = PLAN_PRICES[plan]
  if (!priceId) return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400 })

  let customerId = userRecord?.stripe_customer_id
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email,
      metadata: { user_id: userId },
    })
    customerId = customer.id
    await execute('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, userId])
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const isSprint = plan === 'sprint'
  const cancelAt = isSprint ? Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) : undefined

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${appUrl}/app?upgrade=success&plan=${plan}`,
    cancel_url: `${appUrl}/pricing?cancelled=true`,
    subscription_data: { ...(cancelAt ? { cancel_at: cancelAt } : {}), metadata: { user_id: userId, plan } },
    allow_promotion_codes: true,
  })

  return new Response(JSON.stringify({ url: session.url }), { status: 200 })
}
