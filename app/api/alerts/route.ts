import { query, queryOne, execute } from '../../../lib/db'
import { getAuthUser } from '../../../lib/auth'

export async function GET(request: Request) {
  const authUser = await getAuthUser(request)
  if (!authUser) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })
  const alerts = await query('SELECT * FROM job_alerts WHERE user_id = $1 ORDER BY created_at DESC', [authUser.userId])
  return new Response(JSON.stringify({ alerts }), { status: 200 })
}

export async function POST(request: Request) {
  const authUser = await getAuthUser(request)
  if (!authUser) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })
  const { title, keywords, location, salary_min, sector, seniority } = await request.json()
  const alert = await queryOne(
    'INSERT INTO job_alerts (user_id, title, keywords, location, salary_min, sector, seniority) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [authUser.userId, title, keywords || [], location, salary_min, sector, seniority]
  )
  return new Response(JSON.stringify({ alert }), { status: 201 })
}

export async function DELETE(request: Request) {
  const authUser = await getAuthUser(request)
  if (!authUser) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })
  const { id } = await request.json()
  await execute('DELETE FROM job_alerts WHERE id = $1 AND user_id = $2', [id, authUser.userId])
  return new Response(JSON.stringify({ success: true }), { status: 200 })
}
