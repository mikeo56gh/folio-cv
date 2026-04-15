// app/api/alerts/route.ts
// CRUD for job alerts
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getUser(request: Request) {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const { data: { user } } = await supabaseAdmin.auth.getUser(auth.replace('Bearer ', ''))
  return user
}

export async function GET(request: Request) {
  const user = await getUser(request)
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const { data } = await supabaseAdmin
    .from('job_alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return new Response(JSON.stringify({ alerts: data || [] }), { status: 200 })
}

export async function POST(request: Request) {
  const user = await getUser(request)
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  // Plan check
  const { data: userRecord } = await supabaseAdmin.from('users').select('plan, subscription_status').eq('id', user.id).single()
  const plan = userRecord?.plan || 'free'
  if (!['pro', 'boost', 'sprint', 'recruiter'].includes(plan) || userRecord?.subscription_status !== 'active') {
    return new Response(JSON.stringify({ error: 'Job alerts require an active Pro, Sprint, or Boost subscription.', upgrade: true }), { status: 403 })
  }

  const { title, keywords, location, salary_min } = await request.json()
  if (!title || !keywords?.length) {
    return new Response(JSON.stringify({ error: 'Title and at least one keyword are required.' }), { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('job_alerts')
    .insert({ user_id: user.id, title, keywords, location, salary_min: salary_min || null, is_active: true })
    .select()
    .single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ alert: data }), { status: 201 })
}

export async function DELETE(request: Request) {
  const user = await getUser(request)
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const { id } = await request.json()
  const { data: alert } = await supabaseAdmin.from('job_alerts').select('user_id').eq('id', id).single()
  if (!alert || alert.user_id !== user.id) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

  await supabaseAdmin.from('job_alerts').delete().eq('id', id)
  return new Response(JSON.stringify({ success: true }), { status: 200 })
}
