import { queryOne } from '../../../lib/db'
import { getAuthUser, getOrCreateUser } from '../../../lib/auth'

const PLAN_LIMITS: Record<string, Record<string, number>> = {
  free:      { cv: 3, cl: 1, review: 1, interview: 0, flags: 0, keywords: 0, company_research: 0, deep_review: 0 },
  sprint:    { cv: -1, cl: -1, review: -1, interview: -1, flags: -1, keywords: -1, company_research: -1, deep_review: -1 },
  pro:       { cv: -1, cl: -1, review: -1, interview: -1, flags: -1, keywords: -1, company_research: -1, deep_review: -1 },
  boost:     { cv: -1, cl: -1, review: -1, interview: -1, flags: -1, keywords: -1, company_research: -1, deep_review: -1 },
  recruiter: { cv: -1, cl: -1, review: -1, interview: -1, flags: -1, keywords: -1, company_research: -1, deep_review: -1 },
}

const PLAN_NAMES: Record<string, string> = {
  free: 'Free', sprint: 'Job Seeker Sprint', pro: 'Pro', boost: 'Career Boost', recruiter: 'Recruiter',
}

export async function GET(request: Request) {
  const authUser = await getAuthUser(request)
  if (!authUser) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const { userId, email } = authUser
  const userRecord = await getOrCreateUser(userId, email)
  if (!userRecord) return new Response(JSON.stringify({ error: 'User not found' }), { status: 401 })

  const plan = userRecord.plan || 'free'
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free
  const usage = userRecord.usage || {}

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
    id: userId,
    email: userRecord.email,
    fullName: userRecord.full_name,
    plan,
    planName: PLAN_NAMES[plan] || 'Free',
    subscriptionStatus: userRecord.subscription_status || 'inactive',
    token: request.headers.get('authorization')?.replace('Bearer ', '') || '',
    usageSummary,
    usageResetAt: userRecord.usage_reset_at,
  }), { status: 200 })
}
