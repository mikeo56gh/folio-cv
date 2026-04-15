// app/api/salary-coach/route.ts
// Generates a full salary negotiation strategy:
// assessment, counter-offer, talking points, call script, follow-up email
import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { createClient } from '@supabase/supabase-js'

const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const maxDuration = 60

export async function POST(request: Request) {
  // Auth
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 })
  }
  const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(auth.replace('Bearer ', ''))
  if (error || !user) return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 })

  // Plan check — salary coach is Boost/Sprint/Recruiter only
  const { data: userRecord } = await supabaseAdmin
    .from('users').select('plan').eq('id', user.id).single()
  const plan = userRecord?.plan || 'free'
  if (!['boost', 'sprint', 'recruiter'].includes(plan)) {
    return new Response(JSON.stringify({
      error: 'Salary negotiation coach requires Career Boost or Sprint. Upgrade to unlock.',
      upgrade: true,
    }), { status: 403 })
  }

  const {
    offerSalary,
    currentSalary,
    marketRange,
    roleTitle,
    companyName,
    notes,
    seniority,
    recentAchievements,
  } = await request.json()

  const senLabel: Record<string, string> = {
    junior: 'Junior/Graduate', mid: 'Mid-level', senior: 'Senior/Lead',
    manager: 'Manager', director: 'Director/VP', executive: 'C-Suite',
  }

  const uplift = currentSalary ? Math.round(((offerSalary - currentSalary) / currentSalary) * 100) : null
  const formattedOffer = `£${offerSalary.toLocaleString()}`
  const formattedCurrent = currentSalary ? `£${currentSalary.toLocaleString()}` : 'not provided'

  const prompt = `You are an expert salary negotiation coach who has helped thousands of professionals negotiate better offers. You are direct, strategic, and you always anchor to evidence.

SITUATION:
- Role: ${roleTitle}${companyName ? ` at ${companyName}` : ''}
- Seniority level: ${senLabel[seniority] || 'Mid-level'}
- Offer received: ${formattedOffer}
- Current salary: ${formattedCurrent}${uplift ? ` (offer is ${uplift}% increase)` : ''}
- Market range: ${marketRange || 'not provided'}
- Additional context: ${notes || 'none'}

CANDIDATE'S RECENT ACHIEVEMENTS (use to build specific talking points):
${recentAchievements?.length ? recentAchievements.map((a: string) => `- ${a}`).join('\n') : 'Not provided'}

Generate a complete salary negotiation package. Return ONLY valid JSON with this exact structure:

{
  "assessment": "<3-4 sentence honest assessment of their position: is the offer good, fair, or below market? What leverage do they have? What's the overall strategy recommendation?>",
  
  "counterOffer": "<specific recommended counter-offer figure, e.g. '£82,000' — be specific, not a range. Calculate this as 8-15% above the offer, anchored to market data if provided, adjusted for seniority and leverage>",
  
  "walkAwayPoint": "<the minimum they should accept — typically the offer itself if it's fair, or 5% above if below market. One sentence.>",
  
  "talkingPoints": [
    "<specific talking point 1 — grounded in their actual achievements above, quantified where possible>",
    "<specific talking point 2 — market positioning or unique value>",
    "<specific talking point 3 — forward-looking value they'll bring>",
    "<specific talking point 4 — if competing offer or strong leverage exists, how to use it>",
    "<specific talking point 5 — a strong closing point>"
  ],
  
  "otherBenefits": [
    "<benefit to negotiate if salary is fixed, e.g. '5 extra days annual leave'>",
    "<benefit, e.g. 'Remote work flexibility (3 days WFH)'>",
    "<benefit, e.g. 'Accelerated 6-month performance review'>",
    "<benefit, e.g. 'Professional development budget £2,000/year'>",
    "<benefit, e.g. 'Sign-on bonus of £5,000'>"
  ],
  
  "script": "<A complete word-for-word phone/video script, 200-300 words. Format with clear stages: Opening → Express enthusiasm → Deliver counter → Provide rationale → Handle silence → Close. Use natural, human language. Include actual figures. Do NOT use placeholder brackets — write it as if the candidate is Mike saying these exact words.>",
  
  "email": "<A complete follow-up email, 150-200 words. Subject line first on its own line. Then blank line. Then the email body. Professional but warm. Reiterates enthusiasm for the role, states the counter-offer clearly, provides one strong rationale sentence, and closes with a collaborative tone. Signed off with 'Best regards,' and a blank name line.>"
}

Rules:
- The counter-offer must be a specific number, not a range
- Talking points must reference their actual achievements — not generic statements
- The script must be word-for-word ready to use, not a template with [brackets]
- The email subject line should be compelling, not generic like "Re: Offer"
- Be honest in the assessment — if the offer is already strong, say so and adjust the strategy accordingly
- Return ONLY the JSON object, no preamble or commentary`

  const result = await streamText({
    model: anthropic('claude-sonnet-4-5'),
    prompt,
    maxTokens: 1800,
  })

  return result.toDataStreamResponse()
}
