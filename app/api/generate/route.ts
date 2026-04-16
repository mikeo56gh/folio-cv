import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { queryOne, execute } from '../../../lib/db'
import { getAuthUser, getOrCreateUser } from '../../../lib/auth'

export const maxDuration = 60

const LIMITS: Record<string, Record<string, number>> = {
  free:      { cv: 3, cl: 1, review: 1, interview: 0, flags: 0, keywords: 0, company_research: 0, deep_review: 0 },
  sprint:    { cv: -1, cl: -1, review: -1, interview: -1, flags: -1, keywords: -1, company_research: -1, deep_review: -1 },
  pro:       { cv: -1, cl: -1, review: -1, interview: -1, flags: -1, keywords: -1, company_research: -1, deep_review: -1 },
  boost:     { cv: -1, cl: -1, review: -1, interview: -1, flags: -1, keywords: -1, company_research: -1, deep_review: -1 },
  recruiter: { cv: -1, cl: -1, review: -1, interview: -1, flags: -1, keywords: -1, company_research: -1, deep_review: -1 },
}

const FEATURE_KEY: Record<string, string> = {
  cv: 'cv', cl: 'cl', review: 'review', interview: 'interview',
  flags: 'flags', keywords: 'keywords', company_research: 'company_research',
  strengthen_skills: 'cv', strengthen_ach: 'cv', deep_review: 'deep_review',
}

async function checkAndIncrementUsage(userId: string, feature: string, userRecord: any) {
  const plan = userRecord?.plan || 'free'
  const limit = LIMITS[plan]?.[feature] ?? 0
  if (limit === -1) return { allowed: true }
  if (limit === 0) return { allowed: false, reason: `${feature} requires Pro or higher. Upgrade to unlock.`, upgrade: true }
  const usage = userRecord?.usage || {}
  const count = usage[feature] || 0
  if (count >= limit) return { allowed: false, reason: `${feature} limit reached (${limit}/${plan} plan). Upgrade for unlimited.`, upgrade: true }
  await execute(
    'UPDATE users SET usage = usage || $1::jsonb, updated_at = NOW() WHERE id = $2',
    [JSON.stringify({ [feature]: count + 1 }), userId]
  )
  return { allowed: true }
}

export async function POST(request: Request) {
  const authUser = await getAuthUser(request)
  if (!authUser) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })

  const { userId, email } = authUser
  const userRecord = await getOrCreateUser(userId, email)

  const body = await request.json()
  const { type, data, jdContext, companyBrief, tone, sector, seniority } = body

  const featureKey = FEATURE_KEY[type] || type
  const { allowed, reason, upgrade } = await checkAndIncrementUsage(userId, featureKey, userRecord)
  if (!allowed) return new Response(JSON.stringify({ error: reason, upgrade }), { status: 403, headers: { 'Content-Type': 'application/json' } })

  const prompt = buildPrompt(type, data, jdContext, companyBrief, tone, sector, seniority)

  const result = await streamText({
    model: anthropic('claude-sonnet-4-5'),
    prompt,
    maxTokens: type === 'deep_review' ? 2500 : type === 'cv' ? 2000 : 1400,
    onFinish: async ({ text }) => {
      try {
        await execute(
          'INSERT INTO usage_events (user_id, event, plan, metadata) VALUES ($1, $2, $3, $4)',
          [userId, type, userRecord?.plan || 'free', JSON.stringify({ seniority, sector, tone, chars: text.length })]
        )
      } catch (e) { console.error(e) }
    },
  })

  return result.toDataStreamResponse()
}

function buildPrompt(type: string, data: any, jdContext: string, companyBrief: string, tone: string, sector: string, seniority: string): string {
  const SEN: Record<string, string> = {
    junior: 'LEVEL — Junior/Graduate: Emphasise potential, speed of learning, initiative.',
    mid: 'LEVEL — Mid-level: Balance technical depth with ownership.',
    senior: 'LEVEL — Senior/Lead: Technical authority, mentorship, cross-team influence.',
    manager: 'LEVEL — Manager: Team outcomes, headcount, budget, delivery.',
    director: 'LEVEL — Director/VP: Strategic P&L, org design, C-suite relationships.',
    executive: 'LEVEL — C-Suite: Transformation at org scale. Board-level outcomes only.',
  }
  const TONE: Record<string, string> = {
    professional: 'TONE: Professional, polished, authoritative.',
    formal: 'TONE: Formal. No contractions.',
    conversational: 'TONE: Warm, human, approachable.',
    direct: 'TONE: Bold, direct, no waffle.',
    academic: 'TONE: Academic. Precise.',
  }

  const si = SEN[seniority] || SEN.mid
  const ti = TONE[tone] || TONE.professional

  let briefCtx = ''
  if (companyBrief) {
    try {
      const bd = JSON.parse(companyBrief)
      briefCtx = '\n\nCOMPANY RESEARCH:\n'
        + (bd.name ? `Company: ${bd.name}\n` : '')
        + (bd.summary ? `Overview: ${bd.summary}\n` : '')
        + ((bd.insights?.length) ? `Insights:\n${bd.insights.map((i: string) => '- ' + i).join('\n')}\n` : '')
        + (bd.talkingPoints ? `Talking points: ${bd.talkingPoints}\n` : '')
    } catch {}
  }

  const fullCtx = (jdContext || 'No job description provided.') + briefCtx

  const prompts: Record<string, string> = {
    cv: `You are a world-class CV writer.\n${si}\n${ti}\n\nCANDIDATE DATA:\n${JSON.stringify(data, null, 2)}\n\n${fullCtx}\n\nWrite a complete ATS-optimised CV. Select only 3-5 most relevant achievements per role.\n\nSTRUCTURE:\n1. CONTACT DETAILS\n2. PROFESSIONAL SUMMARY — unique, from scratch. BANNED: "results-driven","passionate about","team player"\n3. CORE COMPETENCIES — 10-14 keywords, pipe-separated\n4. PROFESSIONAL EXPERIENCE\n5. EDUCATION\n6. QUALIFICATIONS & PROFESSIONAL MEMBERSHIPS\n7. SKILLS\n\nPlain text only. ALL CAPS section headers + dashes. Mon YYYY dates. No preamble.`,

    cl: `You are an expert cover letter writer.\n${si}\n${ti}\n\nCANDIDATE DATA:\n${JSON.stringify(data, null, 2)}\n\n${fullCtx}\n\nWrite a tailored cover letter, 300-350 words.\n\nP1: HOOK — not "I am writing to apply".\nP2: ACHIEVEMENT 1 — specific, quantified.\nP3: ACHIEVEMENT 2 — different capability.\nP4: CLOSE — value summary, genuine enthusiasm.\n\nPlain text only.`,

    review: `You are a brutally honest senior recruiter.\n\nCANDIDATE DATA:\n${JSON.stringify(data, null, 2)}\n\n${fullCtx}\n\nReturn ONLY valid JSON:\n{"fitScore":<0-100>,"dimensions":[{"name":"Technical skills","score":<0-100>},{"name":"Experience level","score":<0-100>},{"name":"Domain knowledge","score":<0-100>},{"name":"Leadership fit","score":<0-100>},{"name":"Education match","score":<0-100>}],"strengths":["<strength>"],"gaps":["<gap>"],"considerations":["<flag>"],"salaryContext":{"range":"<e.g. £60k–£80k>","note":"<2 sentences>"},"recommendation":"<2-3 sentences>"}`,

    deep_review: `You are a senior executive recruiter and career coach with 20 years of experience. Produce a forensic, brutally honest assessment.\n\nCANDIDATE DATA:\n${JSON.stringify(data, null, 2)}\n\n${fullCtx}\n\nReturn ONLY valid JSON:\n{"overallFit":<0-100>,"oneLiner":"<one sharp sentence>","assessment":"<3-4 paragraphs>","gaps":[{"type":"<Sector|Scope|Technical|Experience>","title":"<gap title>","addressable":<true|false>,"advice":"<specific advice>"}],"cvScore":{"fit":<0-100>,"aiRisk":"<Low|Medium|High>","notes":"<2-3 sentences>"},"clScore":{"fit":<0-100>,"aiRisk":"<Low|Medium|High>","notes":"<2-3 sentences>"},"options":[{"label":"<option>","description":"<2-3 sentences>","recommendation":"<note>","recommended":<true|false>}],"honestRead":"<2-3 paragraphs>","interviewPrepNote":"<key thing to prepare>"}`,

    interview: `You are a senior interview coach.\n\nCANDIDATE DATA:\n${JSON.stringify(data, null, 2)}\n\n${fullCtx}\n\nReturn ONLY valid JSON:\n{"questions":[{"type":"<Competency|Technical|Situational|Motivational|Culture>","question":"<specific>","hint":"<angle>"}]}\n\n10 questions, varied types. Return ONLY the JSON.`,

    flags: `You are a recruiter reviewing critically.\n\nCANDIDATE DATA:\n${JSON.stringify(data, null, 2)}\n\n${fullCtx}\n\nReturn ONLY valid JSON:\n{"flags":[{"severity":"<high|medium|low>","issue":"<title>","advice":"<fix>"}],"overall":"<verdict>"}`,

    keywords: `You are an ATS expert.\n\nCANDIDATE DATA:\n${JSON.stringify(data, null, 2)}\n\n${fullCtx}\n\nReturn ONLY valid JSON:\n{"have":["<keyword>"],"missing":["<keyword>"],"advice":"<where to add>"}`,

    company_research: `You are a business intelligence analyst.\n\n${fullCtx}\n\nReturn ONLY valid JSON:\n{"name":"<company>","industry":"<sector>","size":"<employees>","founded":"<year>","hq":"<city>","revenue":"<stage>","products":"<what they do>","summary":"<3-4 sentences>","insights":["<insight>","<insight>","<insight>"],"recentNews":["<news>","<news>","<news>"],"cultureSignals":"<2-3 sentences>","talkingPoints":"<2-3 specific things>"}`,

    strengthen_skills: `CV expert. Enrich skill categories with evidence.\n\nEXPERIENCE:\n${(data?.jobs || []).filter((j: any) => !j.isGap).map((j: any) => `${j.title} at ${j.company}: ${(j.achievements || []).join(' | ')}`).join('\n')}\n\nSKILLS:\n${JSON.stringify((data?.skills || []).map((s: any) => ({ id: s.id, category: s.category, tags: s.tags })))}\n\nReturn ONLY valid JSON: [{"id":<number>,"context":"<one evidenced sentence>"}]`,

    strengthen_ach: `CV expert. Add metrics to unquantified achievements.\n\n${JSON.stringify(data)}\n\nReturn ONLY valid JSON: [{"jobId":<id>,"idx":<index>,"improved":"<improved bullet with metrics — flag estimates with (est.)>"}]`,
  }

  return prompts[type] || prompts.cv
}
