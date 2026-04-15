// app/api/versions/route.ts
import { createClient } from '@supabase/supabase-js'

const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VERSION_LIMITS: Record<string, number> = {
  free: 3, sprint: -1, pro: -1, boost: -1, recruiter: -1,
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
    .from('cv_versions')
    .select('id, name, company_name, role_title, fit_score, cv_text, cover_letter, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return new Response(JSON.stringify({ versions: data || [] }), { status: 200 })
}

export async function POST(request: Request) {
  const user = await getUser(request)
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  // Check version limit
  const { data: userRecord } = await getSupabaseAdmin().from('users').select('plan').eq('id', user.id).single()
  const plan = userRecord?.plan || 'free'
  const limit = VERSION_LIMITS[plan] ?? 3

  if (limit !== -1) {
    const { count } = await supabaseAdmin
      .from('cv_versions').select('id', { count: 'exact' }).eq('user_id', user.id)
    if ((count || 0) >= limit) {
      return new Response(JSON.stringify({
        error: `Version limit reached on ${plan} plan (${limit} allowed). Upgrade for unlimited history.`,
        upgrade: true,
      }), { status: 403 })
    }
  }

  const { name, cv_text, cover_letter, jd_snippet, company_name, role_title, fit_score, profile_id } = await request.json()

  const { data, error } = await supabaseAdmin
    .from('cv_versions')
    .insert({
      user_id: user.id,
      profile_id: profile_id || null,
      name,
      cv_text,
      cover_letter,
      jd_snippet: jd_snippet?.substring(0, 500),
      company_name,
      role_title,
      fit_score,
    })
    .select()
    .single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ version: data }), { status: 201 })
}
