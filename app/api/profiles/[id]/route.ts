// app/api/profiles/[id]/route.ts
import { createClient } from '@supabase/supabase-js'

const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getUser(request: Request) {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const { data: { user } } = await getSupabaseAdmin().auth.getUser(auth.replace('Bearer ', ''))
  return user || null
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await getUser(request)
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const { data } = await supabaseAdmin
    .from('profiles').select('*').eq('id', params.id).eq('user_id', user.id).single()
  if (!data) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

  return new Response(JSON.stringify({ profile: data }), { status: 200 })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getUser(request)
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  // Verify ownership
  const { data: existing } = await supabaseAdmin
    .from('profiles').select('user_id').eq('id', params.id).single()
  if (!existing || existing.user_id !== user.id) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  }

  const { name, profile_data } = await request.json()
  const updates: any = { updated_at: new Date().toISOString() }
  if (name !== undefined) updates.name = name
  if (profile_data !== undefined) updates.profile_data = profile_data

  const { data, error } = await supabaseAdmin
    .from('profiles').update(updates).eq('id', params.id).select().single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ profile: data }), { status: 200 })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getUser(request)
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const { data: existing } = await supabaseAdmin
    .from('profiles').select('user_id, is_default').eq('id', params.id).single()
  if (!existing || existing.user_id !== user.id) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  }
  if (existing.is_default) {
    return new Response(JSON.stringify({ error: 'Cannot delete default profile' }), { status: 400 })
  }

  await getSupabaseAdmin().from('profiles').delete().eq('id', params.id)
  return new Response(JSON.stringify({ success: true }), { status: 200 })
}
