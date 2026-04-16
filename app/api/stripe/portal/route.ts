import Stripe from 'stripe'
import { queryOne } from '../../../../lib/db'
import { getAuthUser } from '../../../../lib/auth'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(request: Request) {
  const authUser = await getAuthUser(request)
  if (!authUser) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const userRecord = await queryOne('SELECT stripe_customer_id FROM users WHERE id = $1', [authUser.userId])
  if (!userRecord?.stripe_customer_id) return new Response(JSON.stringify({ error: 'No billing account found' }), { status: 400 })

  const session = await getStripe().billingPortal.sessions.create({
    customer: userRecord.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app`,
  })

  return new Response(JSON.stringify({ url: session.url }), { status: 200 })
}
