// app/api/jobs/search/route.ts
import { createClient } from '@supabase/supabase-js'

const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const COUNTRY_MAP: Record<string, string> = {
  'london': 'gb', 'manchester': 'gb', 'birmingham': 'gb', 'leeds': 'gb',
  'bristol': 'gb', 'edinburgh': 'gb', 'glasgow': 'gb',
  'uk': 'gb', 'united kingdom': 'gb', 'england': 'gb', 'scotland': 'gb',
  'new york': 'us', 'san francisco': 'us', 'los angeles': 'us', 'chicago': 'us',
  'us': 'us', 'usa': 'us', 'united states': 'us',
  'sydney': 'au', 'melbourne': 'au', 'australia': 'au',
  'toronto': 'ca', 'vancouver': 'ca', 'canada': 'ca',
}

function getCountry(location = '') {
  const loc = location.toLowerCase()
  for (const [key, code] of Object.entries(COUNTRY_MAP)) {
    if (loc.includes(key)) return code
  }
  return 'gb'
}

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const { data: { user } } = await getSupabaseAdmin().auth.getUser(auth.replace('Bearer ', ''))
  if (!user) return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 })

  // Usage gate — free plan gets 5 searches total
  const { data: userRecord } = await getSupabaseAdmin().from('users').select('*').eq('id', user.id).single()
  const plan = userRecord?.plan || 'free'
  if (plan === 'free') {
    const usage = userRecord?.usage || {}
    const count = usage.job_search || 0
    if (count >= 5) {
      return new Response(JSON.stringify({
        error: 'Job search limit reached on free plan (5 searches). Upgrade to Pro for unlimited.',
        upgrade: true,
      }), { status: 403 })
    }
    await getSupabaseAdmin().from('users').update({
      usage: { ...usage, job_search: count + 1 },
    }).eq('id', user.id)
  }

  const { what, location, salaryMin } = await request.json()
  const country = getCountry(location)

  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_API_KEY!,
    results_per_page: '15',
    what: what || '',
    where: location?.split(',')[0] || '',
    sort_by: 'relevance',
    ...(salaryMin ? { salary_min: String(salaryMin) } : {}),
  })

  try {
    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
      { headers: { 'Content-Type': 'application/json' } }
    )
    if (!res.ok) throw new Error('Adzuna API error: ' + res.status)

    const data = await res.json()
    const jobs = (data.results || []).map((j: any) => ({
      id: j.id,
      title: j.title,
      company: j.company?.display_name || 'Unknown',
      location: j.location?.display_name || location,
      description: (j.description || '').substring(0, 400) + '…',
      salary: j.salary_min && j.salary_max
        ? `£${Math.round(j.salary_min / 1000)}k – £${Math.round(j.salary_max / 1000)}k`
        : j.salary_min ? `From £${Math.round(j.salary_min / 1000)}k` : null,
      url: j.redirect_url,
      posted: j.created,
    }))

    return new Response(JSON.stringify({ jobs, total: data.count || jobs.length }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
