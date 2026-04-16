import { query, queryOne, execute } from '../../../lib/db'
import { getAuthUser, getOrCreateUser } from '../../../lib/auth'

const VERSION_LIMITS: Record<string, number> = {
  free: 3, sprint: -1, pro: -1, boost: -1, recruiter: -1,
}

export async function GET(request: Request) {
  const authUser = await getAuthUser(request)
  if (!authUser) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const versions = await query(
    'SELECT id, name, company_name, role_title, fit_score, cv_text, cover_letter, created_at FROM cv_versions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
    [authUser.userId]
  )
  return new Response(JSON.stringify({ versions }), { status: 200 })
}

export async function POST(request: Request) {
  const authUser = await getAuthUser(request)
  if (!authUser) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const { userId, email } = authUser
  const userRecord = await getOrCreateUser(userId, email)
  const plan = userRecord?.plan || 'free'
  const limit = VERSION_LIMITS[plan] ?? 3

  if (limit !== -1) {
    const countResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM cv_versions WHERE user_id = $1',
      [userId]
    )
    if (parseInt(countResult?.count || '0') >= limit) {
      return new Response(JSON.stringify({
        error: `Version limit reached on ${plan} plan. Upgrade for unlimited history.`,
        upgrade: true,
      }), { status: 403 })
    }
  }

  const { name, cv_text, cover_letter, jd_snippet, company_name, role_title, fit_score, profile_id } = await request.json()
  const version = await queryOne(
    `INSERT INTO cv_versions (user_id, profile_id, name, cv_text, cover_letter, jd_snippet, company_name, role_title, fit_score)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [userId, profile_id || null, name, cv_text, cover_letter, jd_snippet?.substring(0, 500), company_name, role_title, fit_score]
  )
  return new Response(JSON.stringify({ version }), { status: 201 })
}
