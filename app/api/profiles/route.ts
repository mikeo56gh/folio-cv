import { query, queryOne, execute } from '../../../lib/db'
import { getAuthUser, getOrCreateUser } from '../../../lib/auth'

const PROFILE_LIMITS: Record<string, number> = {
  free: 1, sprint: -1, pro: 5, boost: -1, recruiter: -1,
}

export async function GET(request: Request) {
  const authUser = await getAuthUser(request)
  if (!authUser) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const profiles = await query(
    'SELECT id, name, is_default, updated_at FROM profiles WHERE user_id = $1 ORDER BY created_at ASC',
    [authUser.userId]
  )
  return new Response(JSON.stringify({ profiles }), { status: 200 })
}

export async function POST(request: Request) {
  const authUser = await getAuthUser(request)
  if (!authUser) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const { userId, email } = authUser
  const userRecord = await getOrCreateUser(userId, email)
  const plan = userRecord?.plan || 'free'
  const limit = PROFILE_LIMITS[plan] ?? 1

  if (limit !== -1) {
    const countResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM profiles WHERE user_id = $1',
      [userId]
    )
    if (parseInt(countResult?.count || '0') >= limit) {
      return new Response(JSON.stringify({
        error: `Profile limit reached on ${plan} plan (${limit} allowed). Upgrade for more.`,
        upgrade: true,
      }), { status: 403 })
    }
  }

  const { name } = await request.json()
  const profile = await queryOne(
    'INSERT INTO profiles (user_id, name) VALUES ($1, $2) RETURNING *',
    [userId, name || 'New Profile']
  )
  return new Response(JSON.stringify({ profile }), { status: 201 })
}
