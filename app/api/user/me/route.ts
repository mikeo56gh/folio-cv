// app/api/user/me/route.ts
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const PLAN_LIMITS: Record<string, Record<string, number>> = {
  free:      { cv: 3, cl: 1, review: 1, interview: 0, flags: 0, keywords: 0, company_research: 0 },
  sprint:    { cv: -1, cl: -1, review: -1, interview: -1, flags: -1, keywords: -1, company_research: -1 },
  pro:       { cv: -1, cl: -1, review: -1, interview: -1, flags: -1, keywords: -1, company_research: -1 },
  boost:     { cv: -1, cl: -1, review: -1, interview: -1, flags: -1, keywords: -1, company_research: -1 },
  recruiter: { cv: -1, cl: -1, review: -1, interview: -1, flags: -1, keywords: -1, company_research: -1 },
}

const PLAN_NAMES: Record<string, string> = {
  free: 'Free', sprint: 'Job Seeker Sprint', pro: 'Pro', boost: 'Career Boost', recruiter: 'Recruiter',
}

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(auth.replace('Bearer ', ''))
  if (error || !user) return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 })

  const { data: userRecord } = await supabaseAdmin.from('users').select('*').eq('id', user.id).single()

  const plan = userRecord?.plan || 'free'
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free
  const usage = userRecord?.usage || {}

  const usageSummary: Record<string, any> = {}
  for (const [feature, limit] of Object.entries(limits)) {
    usageSummary[feature] = {
      used: usage[feature] || 0,
      limit,
      remaining: limit === -1 ? -1 : Math.max(0, limit - (usage[feature] || 0)),
      unlimited: limit === -1,
    }
  }

  return new Response(JSON.stringify({
    id: user.id,
    email: user.email,
    fullName: userRecord?.full_name,
    plan,
    planName: PLAN_NAMES[plan] || 'Free',
    subscriptionStatus: userRecord?.subscription_status || 'inactive',
    usageSummary,
    usageResetAt: userRecord?.usage_reset_at,
  }), { status: 200 })
}
