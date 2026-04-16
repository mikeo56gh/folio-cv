import { queryOne, execute } from '../../../../lib/db'
import { getAuthUser } from '../../../../lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await getAuthUser(request)
  if (!authUser) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })
  const { id } = await params
  const profile = await queryOne('SELECT * FROM profiles WHERE id = $1 AND user_id = $2', [id, authUser.userId])
  if (!profile) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  return new Response(JSON.stringify({ profile }), { status: 200 })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await getAuthUser(request)
  if (!authUser) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })
  const { id } = await params
  const existing = await queryOne('SELECT user_id FROM profiles WHERE id = $1', [id])
  if (!existing || existing.user_id !== authUser.userId) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

  const { name, profile_data } = await request.json()
  const profile = await queryOne(
    'UPDATE profiles SET name = COALESCE($1, name), profile_data = COALESCE($2, profile_data), updated_at = NOW() WHERE id = $3 RETURNING *',
    [name ?? null, profile_data ? JSON.stringify(profile_data) : null, id]
  )
  return new Response(JSON.stringify({ profile }), { status: 200 })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await getAuthUser(request)
  if (!authUser) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })
  const { id } = await params
  const existing = await queryOne('SELECT user_id, is_default FROM profiles WHERE id = $1', [id])
  if (!existing || existing.user_id !== authUser.userId) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  if (existing.is_default) return new Response(JSON.stringify({ error: 'Cannot delete default profile' }), { status: 400 })
  await execute('DELETE FROM profiles WHERE id = $1', [id])
  return new Response(JSON.stringify({ success: true }), { status: 200 })
}
