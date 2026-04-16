// app/api/generate/route.ts
// Vercel AI SDK streamText — streams directly to the client
import { anthropic } from '@ai-sdk/anthropic'
import { streamText, generateObject } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const maxDuration = 60

// Plan limits
const LIMITS: Record<string, Record<string, number>> = {
  free:     { cv: 3, cl: 1, review: 1, interview: 0, flags: 0, keywords: 0, company_research: 0, deep_review: 0 },
  sprint:   { cv: -1, cl: -1, review: -1, interview: -1, flags: -1, keywords: -1, company_research: -1 , deep_review: -1 },
  pro:      { cv: -1, cl: -1, review: -1, interview: -1, flags: -1, keywords: -1, company_research: -1 , deep_review: -1 },
  boost:    { cv: -1, cl: -1, review: -1, interview: -1, flags: -1, keywords: -1, company_research: -1 , deep_review: -1 },
  recruiter:{ cv: -1, cl: -1, review: -1, interview: -1, flags: -1, keywords: -1, company_research: -1 , deep_review: -1 },
}

const FEATURE_KEY: Record<string, string> = {
  cv: 'cv', cl: 'cl', review: 'review', interview: 'interview',
  flags: 'flags', keywords: 'keywords', company_research: 'company_research',
  strengthen_skills: 'cv', strengthen_ach: 'cv', deep_review: 'deep_review',
}

async function checkAuth(request: Request) {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return { error: 'Unauthorised', status: 401 }
  const token = auth.replace('Bearer ', '')
  const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token)
  if (error || !user) return { error: 'Invalid session', status: 401 }
  const { data: userRecord } = await getSupabaseAdmin().from('users').select('*').eq('id', user.id).single()
  return { user, userRecord: userRecord || { plan: 'free', usage: {} } }
}

async function checkAndIncrementUsage(userId: string, feature: string, userRecord: any) {
  const plan = userRecord?.plan || 'free'
  const limit = LIMITS[plan]?.[feature] ?? 0
  if (limit === -1) return { allowed: true }
  if (limit === 0) return { allowed: false, reason: `${feature} requires Pro or higher. Upgrade to unlock.`, upgrade: true }
  const usage = userRecord?.usage || {}
  const count = usage[feature] || 0
  if (count >= limit) return { allowed: false, reason: `${feature} limit reached (${limit}/${plan} plan). Upgrade for unlimited.`, upgrade: true }
  await getSupabaseAdmin().from('users').update({ usage: { ...usage, [feature]: count + 1 }, updated_at: new Date().toISOString() }).eq('id', userId)
  return { allowed: true }
}

export async function POST(request: Request) {
  const { user, userRecord, error, status } = await checkAuth(request) as any
  if (error) return new Response(JSON.stringify({ error }), { status, headers: { 'Content-Type': 'application/json' } })

  const body = await request.json()
  const { type, data, jdContext, companyBrief, tone, sector, seniority } = body

  const featureKey = FEATURE_KEY[type] || type
  const { allowed, reason, upgrade } = await checkAndIncrementUsage(user.id, featureKey, userRecord)
  if (!allowed) return new Response(JSON.stringify({ error: reason, upgrade }), { status: 403, headers: { 'Content-Type': 'application/json' } })

  const prompt = buildPrompt(type, data, jdContext, companyBrief, tone, sector, seniority)

  // JSON-output types — use generateObject for structured data
  const jsonTypes = ['review', 'interview', 'flags', 'keywords', 'company_research', 'strengthen_skills', 'strengthen_ach']

  if (jsonTypes.includes(type)) {
    // Still stream, but as text (JSON) — client parses when done
    const result = await streamText({
      model: anthropic('claude-sonnet-4-5'),
      prompt,
      maxTokens: 1400,
    })
    return result.toDataStreamResponse()
  }

  // CV and cover letter — stream text tokens directly
  const result = await streamText({
    model: anthropic('claude-sonnet-4-5'),
    prompt,
    maxTokens: 2000,
    onFinish: async ({ text }) => {
      try {
        await getSupabaseAdmin().from('usage_events').insert({
          user_id: user.id,
          event: type,
          plan: userRecord?.plan || 'free',
          metadata: { seniority, sector, tone, chars: text.length },
        })
      } catch (e) {
        console.error(e)
      }
    },
  })

  return result.toDataStreamResponse()
}

function buildPrompt(type: string, data: any, jdContext: string, companyBrief: string, tone: string, sector: string, seniority: string): string {
  const SEN: Record<string, string> = {
    junior: 'LEVEL — Junior/Graduate: Emphasise potential, speed of learning, initiative. Verbs: developed, contributed, built. Summary: 2-3 sentences.',
    mid: 'LEVEL — Mid-level: Balance technical depth with ownership. Verbs: led, owned, delivered. Summary: 3 sentences.',
    senior: 'LEVEL — Senior/Lead: Technical authority, mentorship, cross-team influence. Verbs: architected, mentored, drove. Summary: 3-4 sentences.',
    manager: 'LEVEL — Manager: Team outcomes, headcount, budget, delivery. Quantify. Summary: who you lead, what you deliver.',
    director: 'LEVEL — Director/VP: Strategic P&L, org design, C-suite relationships. Summary: 4 sentences.',
    executive: 'LEVEL — C-Suite: Transformation at org scale. Board-level outcomes only. Summary: 4-5 sentence executive biography.',
  }
  const TONE: Record<string, string> = {
    professional: 'TONE: Professional, polished, authoritative.',
    formal: 'TONE: Formal. No contractions. Law/finance/civil service register.',
    conversational: 'TONE: Warm, human, approachable. Contractions fine.',
    direct: 'TONE: Bold, direct, no waffle. Short punchy sentences.',
    academic: 'TONE: Academic. Precise. Research foregrounded.',
  }

  const si = SEN[seniority] || SEN.mid
  const ti = TONE[tone] || TONE.professional
  const senLabel = { junior: 'Junior/Graduate', mid: 'Mid-level', senior: 'Senior/Lead', manager: 'Manager', director: 'Director/VP', executive: 'C-Suite' }[seniority] || 'Mid-level'

  let briefCtx = ''
  if (companyBrief) {
    try {
      const bd = JSON.parse(companyBrief)
      briefCtx = '\n\nCOMPANY RESEARCH (use to make outputs specific):\n'
        + (bd.name ? `Company: ${bd.name}\n` : '')
        + (bd.summary ? `Overview: ${bd.summary}\n` : '')
        + ((bd.insights?.length) ? `Insights:\n${bd.insights.map((i: string) => '- ' + i).join('\n')}\n` : '')
        + ((bd.recentNews?.length) ? `Recent news:\n${bd.recentNews.map((n: string) => '- ' + n).join('\n')}\n` : '')
        + (bd.talkingPoints ? `Talking points: ${bd.talkingPoints}\n` : '')
    } catch {}
  }

  const fullCtx = (jdContext || 'No job description provided.') + briefCtx

  const prompts: Record<string, string> = {
    cv: `You are a world-class CV writer.\n${si}\n${ti}\n\nCANDIDATE DATA:\n${JSON.stringify(data, null, 2)}\n\n${fullCtx}\n\nWrite a complete ATS-optimised CV. Select only 3-5 most relevant achievements per role — not all of them. Reorder: most JD-relevant bullet first.\n\nSTRUCTURE:\n1. CONTACT DETAILS\n2. PROFESSIONAL SUMMARY — unique, from scratch, ${senLabel} calibrated. BANNED: "results-driven","passionate about","team player"\n3. CORE COMPETENCIES — 10-14 keywords, pipe-separated\n4. PROFESSIONAL EXPERIENCE — selected bullets only\n5. EDUCATION\n6. QUALIFICATIONS & PROFESSIONAL MEMBERSHIPS — if provided\n7. SKILLS — Category: tags — Evidence: context (if provided)\n\nPlain text only. ALL CAPS section headers + dashes. Mon YYYY dates. No preamble. No commentary.`,

    cl: `You are an expert cover letter writer.\n${si}\n${ti}\n\nCANDIDATE DATA:\n${JSON.stringify(data, null, 2)}\n\n${fullCtx}\n\n${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}\n\nWrite a tailored cover letter, 300-350 words. ${senLabel} tone.\n\nP1: HOOK — not "I am writing to apply". Bold value statement or direct bridge to their challenge.\nP2: ACHIEVEMENT 1 — specific, quantified, addresses key JD requirement.\nP3: ACHIEVEMENT 2 — different capability dimension.\nP4: CLOSE — value summary, genuine enthusiasm, request conversation.\n\nYours sincerely,\n${data?.profile?.name || '[Name]'}\n\nPlain text only. No placeholder brackets.`,

    review: `You are a brutally honest senior recruiter.\n\nCANDIDATE DATA:\n${JSON.stringify(data, null, 2)}\n\n${fullCtx}\n\nReturn ONLY valid JSON — no preamble, no markdown:\n{"fitScore":<0-100>,"dimensions":[{"name":"Technical skills","score":<0-100>},{"name":"Experience level","score":<0-100>},{"name":"Domain knowledge","score":<0-100>},{"name":"Leadership fit","score":<0-100>},{"name":"Education match","score":<0-100>}],"strengths":["<evidence-backed>","<strength>","<strength>"],"gaps":["<specific missing req>","<gap>","<gap>"],"considerations":["<yellow flag>"],"salaryContext":{"range":"<e.g. £60k–£80k>","note":"<2 sentence negotiation angle>"},"recommendation":"<2-3 direct sentences>"}`,

    interview: `You are a senior interview coach.\n\nCANDIDATE DATA:\n${JSON.stringify(data, null, 2)}\n\n${fullCtx}\n\nReturn ONLY valid JSON:\n{"questions":[{"type":"<Competency|Technical|Situational|Motivational|Culture>","question":"<specific>","hint":"<angle using their real experience>"}]}\n\n10 questions, varied types, specific to this role and candidate. Return ONLY the JSON.`,

    flags: `You are a recruiter reviewing this CV critically.\n\nCANDIDATE DATA:\n${JSON.stringify(data, null, 2)}\n\n${fullCtx}\n\nReturn ONLY valid JSON:\n{"flags":[{"severity":"<high|medium|low>","issue":"<concise title>","advice":"<specific actionable fix>"}],"overall":"<2-3 sentence verdict>"}\n\nReturn ONLY the JSON.`,

    keywords: `You are an ATS expert.\n\nCANDIDATE DATA:\n${JSON.stringify(data, null, 2)}\n\n${fullCtx}\n\nReturn ONLY valid JSON:\n{"have":["<keyword in profile>"],"missing":["<important missing keyword>"],"advice":"<where to add the most critical missing keywords>"}\n\nReturn ONLY the JSON.`,

    company_research: `You are a business intelligence analyst. Research the company from this job posting using your knowledge.\n\n${fullCtx}\n\nReturn ONLY valid JSON:\n{"name":"<company>","industry":"<sector>","size":"<employees>","founded":"<year>","hq":"<city>","revenue":"<stage/revenue>","products":"<what they do>","summary":"<3-4 sentences>","insights":["<role-relevant insight>","<strategic priority>","<competitive position>"],"recentNews":["<news + approx date>","<news>","<news>"],"cultureSignals":"<2-3 sentences>","talkingPoints":"<2-3 specific things to mention>"}\n\nReturn ONLY the JSON.`,

    strengthen_skills: `CV expert. Enrich skill categories with specific evidence from experience.\n\nEXPERIENCE:\n${(data?.jobs || []).filter((j: any) => !j.isGap).map((j: any) => `${j.title} at ${j.company}: ${(j.achievements || []).join(' | ')}`).join('\n')}\n\nSKILL CATEGORIES:\n${JSON.stringify((data?.skills || []).map((s: any) => ({ id: s.id, category: s.category, tags: s.tags })))}\n\nReturn ONLY valid JSON: [{"id":<number>,"context":"<one evidenced sentence, or empty string for pure technical categories>"}]`,

    deep_review: `You are a senior executive recruiter and career coach with 20 years of experience. Produce a brutally honest, forensic assessment.

CANDIDATE DATA:
${JSON.stringify(data, null, 2)}

${fullCtx}

Return ONLY valid JSON with this exact structure:
{
  "overallFit": <0-100 overall fit percentage>,
  "oneLiner": "<One sharp sentence summarising the candidate's position — e.g. 'Strong technical match but a sector and scope gap that a compelling narrative can partially bridge'>",
  "assessment": "<3-4 paragraph honest assessment. What is their genuine position? What does the JD really require vs what they bring? Be specific about transferable strengths and be honest about gaps. Reference actual data from their profile.>",
  "gaps": [
    {
      "type": "<'Sector' | 'Scope' | 'Technical' | 'Experience' | 'Geographic'>",
      "title": "<gap title>",
      "addressable": <true if addressable in cover letter narrative, false if structural>,
      "advice": "<specific advice on how to address it, or why it can't be addressed>"
    }
  ],
  "cvScore": {
    "fit": <0-100>,
    "aiRisk": "<'Low' | 'Medium' | 'High'>",
    "notes": "<2-3 sentences on CV strengths and what to watch for an AI detector>"
  },
  "clScore": {
    "fit": <0-100>,
    "aiRisk": "<'Low' | 'Medium' | 'High'>",
    "notes": "<2-3 sentences on cover letter approach and AI detection risk>"
  },
  "options": [
    {
      "label": "<e.g. 'Submit as-is'>",
      "description": "<2-3 sentences on this approach, what it prioritises, and what it trades off>",
      "recommendation": "<brief recommendation note>",
      "recommended": <true | false — only one should be true>
    },
    {
      "label": "<e.g. 'Get a referral first'>",
      "description": "<2-3 sentences>",
      "recommendation": "<brief note>",
      "recommended": <true | false>
    },
    {
      "label": "<e.g. 'Use as door-opener for a smaller role'>",
      "description": "<2-3 sentences>",
      "recommendation": "<brief note>",
      "recommended": <true | false>
    }
  ],
  "honestRead": "<2-3 paragraphs of honest strategic read. What does the recruiter really think when they see this application? What are the realistic outcomes? What would tip the balance? Be direct — this is what a trusted mentor would tell them, not a CV coach trying to be encouraging.>",
  "interviewPrepNote": "<If they get an interview, what is the one thing they absolutely must prepare? e.g. 'The multi-country scope question will come in the first 10 minutes — prepare a specific answer for why you're ready to step up from UK multi-site to European regional.'>"
}

Return ONLY the JSON.`,

    strengthen_ach: `CV expert. Add metrics to unquantified achievement bullets.\n\n${JSON.stringify(data)}\n\nReturn ONLY valid JSON: [{"jobId":<id>,"idx":<index>,"improved":"<improved bullet with metrics — flag estimates with (est.)>"}]`,
  }

  return prompts[type] || prompts.cv
}
