// app/api/profiles/route.ts
import { createClient } from '@supabase/supabase-js'

const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PROFILE_LIMITS: Record<string, number> = {
  free: 1, sprint: -1, pro: 5, boost: -1, recruiter: -1,
}

async function getUser(request: Request) {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const { data: { user } } = await getSupabaseAdmin().auth.getUser(auth.replace('Bearer ', ''))
  return user || null
}

export async function GET(request: Request) {
  const user = await getUser(request)
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id, name, is_default, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  return new Response(JSON.stringify({ profiles: data || [] }), { status: 200 })
}

export async function POST(request: Request) {
  const user = await getUser(request)
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  // Check profile limit
  const { data: userRecord } = await getSupabaseAdmin().from('users').select('plan').eq('id', user.id).single()
  const plan = userRecord?.plan || 'free'
  const limit = PROFILE_LIMITS[plan] ?? 1

  if (limit !== -1) {
    const { count } = await supabaseAdmin
      .from('profiles').select('id', { count: 'exact' }).eq('user_id', user.id)
    if ((count || 0) >= limit) {
      return new Response(JSON.stringify({
        error: `Profile limit reached on ${plan} plan (${limit} allowed). Upgrade for more.`,
        upgrade: true,
      }), { status: 403 })
    }
  }

  const { name } = await request.json()
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({ user_id: user.id, name: name || 'New Profile' })
    .select()
    .single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ profile: data }), { status: 201 })
}
