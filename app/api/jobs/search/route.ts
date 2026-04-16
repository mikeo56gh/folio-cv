import { queryOne, execute } from '../../../lib/db'
import { getAuthUser, getOrCreateUser } from '../../../lib/auth'

const COUNTRY_CODES: Record<string, string> = {
  'uk': 'gb', 'united kingdom': 'gb', 'england': 'gb', 'scotland': 'gb', 'wales': 'gb',
  'us': 'us', 'usa': 'us', 'united states': 'us', 'au': 'au', 'australia': 'au',
  'ca': 'ca', 'canada': 'ca', 'de': 'de', 'germany': 'de', 'fr': 'fr', 'france': 'fr',
}

const UK_CITIES = ['london','manchester','birmingham','leeds','glasgow','liverpool','edinburgh','bristol','sheffield','cambridge','oxford','nottingham','leicester','coventry','hull','reading','brighton','southampton','portsmouth','cardiff','belfast','newcastle','exeter','norwich','york']

function parseLocation(raw: string) {
  const lower = raw.toLowerCase().trim()
  for (const [name, code] of Object.entries(COUNTRY_CODES)) {
    if (lower === name || lower === code) {
      const defaults: Record<string, string> = { gb: 'London', us: 'New York', au: 'Sydney', ca: 'Toronto' }
      return { city: defaults[code] || 'London', country: code }
    }
  }
  const parts = raw.split(',').map(p => p.trim())
  const city = parts[0]
  const countryPart = parts[parts.length - 1]?.toLowerCase()
  let countryCode = 'gb'
  for (const [name, code] of Object.entries(COUNTRY_CODES)) {
    if (countryPart?.includes(name)) { countryCode = code; break }
  }
  if (UK_CITIES.some(c => lower.includes(c))) countryCode = 'gb'
  return { city, country: countryCode }
}

export async function POST(request: Request) {
  const authUser = await getAuthUser(request)
  if (!authUser) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const { userId, email } = authUser
  const userRecord = await getOrCreateUser(userId, email)
  const plan = userRecord?.plan || 'free'

  if (plan === 'free') {
    const usage = userRecord?.usage || {}
    const count = usage.job_search || 0
    if (count >= 5) return new Response(JSON.stringify({ error: 'Job search limit reached on free plan. Upgrade for unlimited.', upgrade: true }), { status: 403 })
    await execute("UPDATE users SET usage = usage || jsonb_build_object('job_search', $1) WHERE id = $2", [count + 1, userId])
  }

  const { what, location, salaryMin, distance_km, contract_type } = await request.json()
  let city: string, country: string
  if (location && location.includes(',')) {
    city = location.split(',')[0].trim(); country = 'gb'
  } else {
    const parsed = parseLocation(location || 'London')
    city = parsed.city; country = parsed.country
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
    const res = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`)
    if (!res.ok) throw new Error('Adzuna API error: ' + res.status)
    const data = await res.json()
    const jobs = (data.results || []).map((j: any) => ({
      id: j.id, title: j.title, company: j.company?.display_name || 'Unknown',
      location: j.location?.display_name || city,
      description: (j.description || '').substring(0, 400) + '…',
      salary: j.salary_min && j.salary_max ? `£${Math.round(j.salary_min/1000)}k – £${Math.round(j.salary_max/1000)}k` : j.salary_min ? `From £${Math.round(j.salary_min/1000)}k` : null,
      url: j.redirect_url, posted: j.created,
    }))
    return new Response(JSON.stringify({ jobs, total: data.count || jobs.length, searchedCity: city }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
