// app/api/jobs/search/route.ts
import { createClient } from '@supabase/supabase-js'

const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Map country names/regions to Adzuna country codes
const COUNTRY_CODES: Record<string, string> = {
  'uk': 'gb', 'united kingdom': 'gb', 'england': 'gb', 'scotland': 'gb',
  'wales': 'gb', 'northern ireland': 'gb', 'britain': 'gb', 'great britain': 'gb',
  'us': 'us', 'usa': 'us', 'united states': 'us', 'america': 'us',
  'au': 'au', 'australia': 'au', 'ca': 'ca', 'canada': 'ca',
  'de': 'de', 'germany': 'de', 'fr': 'fr', 'france': 'fr',
  'nl': 'nl', 'netherlands': 'nl', 'sg': 'sg', 'singapore': 'sg',
}

// UK cities for smarter location parsing
const UK_CITIES = [
  'london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'liverpool',
  'edinburgh', 'bristol', 'sheffield', 'cambridge', 'oxford', 'nottingham',
  'leicester', 'coventry', 'hull', 'reading', 'brighton', 'southampton',
  'portsmouth', 'cardiff', 'belfast', 'newcastle', 'exeter', 'norwich',
  'york', 'dundee', 'aberdeen', 'derby', 'wolverhampton', 'stoke',
]

function parseLocation(raw: string): { city: string; country: string } {
  const lower = raw.toLowerCase().trim()

  // Check if it's just a country name with no city
  for (const [name, code] of Object.entries(COUNTRY_CODES)) {
    if (lower === name || lower === code) {
      // Default to capital/major city for that country
      const defaults: Record<string, string> = {
        gb: 'London', us: 'New York', au: 'Sydney', ca: 'Toronto',
        de: 'Berlin', fr: 'Paris', nl: 'Amsterdam', sg: 'Singapore',
      }
      return { city: defaults[code] || 'London', country: code }
    }
  }

  // Extract country from "City, Country" format
  const parts = raw.split(',').map(p => p.trim())
  const city = parts[0]
  const countryPart = parts[parts.length - 1]?.toLowerCase()

  // Determine country code
  let countryCode = 'gb' // default to UK
  for (const [name, code] of Object.entries(COUNTRY_CODES)) {
    if (countryPart?.includes(name)) {
      countryCode = code
      break
    }
  }

  // If city looks like a UK city, use gb
  if (UK_CITIES.some(c => lower.includes(c))) {
    countryCode = 'gb'
  }

  return { city, country: countryCode }
}

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })
  }

  const { data: { user } } = await getSupabaseAdmin().auth.getUser(auth.replace('Bearer ', ''))
  if (!user) return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 })

  // Usage gate for free plan
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

  const { what, location, salaryMin, distance_km, contract_type } = await request.json()

  // If location looks like it came from autocomplete (contains comma),
  // use it directly. Otherwise parse it.
  let city: string
  let country: string
  if (location && location.includes(',')) {
    // Autocomplete format: "Hull, East Riding Of Yorkshire" — use first part as city
    city = location.split(',')[0].trim()
    country = 'gb' // autocomplete is UK-only for now
  } else {
    const parsed = parseLocation(location || 'London')
    city = parsed.city
    country = parsed.country
  }

  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_API_KEY!,
    results_per_page: '15',
    what: what || '',
    where: city,
    sort_by: 'relevance',
    ...(salaryMin ? { salary_min: String(salaryMin) } : {}),
    ...(distance_km ? { distance: String(distance_km) } : {}),
    ...(contract_type && contract_type !== 'permanent' ? { contract_type } : {}),
  })

  try {
    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (!res.ok) {
      const text = await res.text()
      console.error('Adzuna error:', res.status, text)
      return new Response(JSON.stringify({ error: 'Job search API error — try a different location' }), { status: 502 })
    }

    const data = await res.json()
    const jobs = (data.results || []).map((j: any) => ({
      id: j.id,
      title: j.title,
      company: j.company?.display_name || 'Unknown',
      location: j.location?.display_name || city,
      description: (j.description || '').substring(0, 400) + '…',
      salary: j.salary_min && j.salary_max
        ? `£${Math.round(j.salary_min / 1000)}k – £${Math.round(j.salary_max / 1000)}k`
        : j.salary_min ? `From £${Math.round(j.salary_min / 1000)}k` : null,
      url: j.redirect_url,
      posted: j.created,
    }))

    return new Response(JSON.stringify({ jobs, total: data.count || jobs.length, searchedCity: city }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
