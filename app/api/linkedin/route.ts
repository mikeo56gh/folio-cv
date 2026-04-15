// app/api/linkedin/route.ts
// Optimises LinkedIn About section and headline for the algorithm
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

  // Plan check — LinkedIn optimiser is Boost/Sprint+ only
  const { data: userRecord } = await getSupabaseAdmin().from('users').select('plan').eq('id', user.id).single()
  const plan = userRecord?.plan || 'free'
  if (!['boost', 'sprint', 'recruiter'].includes(plan)) {
    return new Response(JSON.stringify({ error: 'LinkedIn optimiser requires Career Boost or Sprint. Upgrade to unlock.', upgrade: true }), { status: 403 })
  }

  const { profileData, targetRole, sector, currentAbout } = await request.json()
  const { profile, jobs, skills, qualifications } = profileData

  const senLabel: Record<string, string> = {
    junior: 'Junior/Graduate', mid: 'Mid-level', senior: 'Senior/Lead',
    manager: 'Manager', director: 'Director/VP', executive: 'C-Suite',
  }

  const prompt = `You are a LinkedIn profile expert who understands how LinkedIn's algorithm works and what makes recruiters stop scrolling.

CANDIDATE DATA:
Name: ${profile.name}
Seniority: ${senLabel[profile.seniority] || 'Mid-level'}
Current role: ${jobs[0]?.title || ''} at ${jobs[0]?.company || ''}
Target role: ${targetRole || 'Similar to current'}
Sector: ${sector || 'General'}
Key skills: ${skills.flatMap((s: any) => s.tags).slice(0, 12).join(', ')}
${qualifications?.filter((q: any) => q.title).map((q: any) => q.title).length ? `Qualifications: ${qualifications.filter((q: any) => q.title).map((q: any) => q.title).join(', ')}` : ''}

CURRENT ABOUT SECTION (to optimise):
${currentAbout || 'Not provided — write from scratch based on candidate data above.'}

RECENT ACHIEVEMENTS (for evidence):
${jobs.slice(0, 2).flatMap((j: any) => j.achievements?.filter((a: string) => a.trim()).slice(0, 3) || []).join('\n')}

Generate THREE things, clearly separated:

---HEADLINE---
Write a LinkedIn headline (max 220 characters). Formula: [Role/Identity] | [Value proposition] | [Key differentiator]. Should be keyword-rich for recruiter searches. Don't just repeat the job title.

---ABOUT---
Write an optimised LinkedIn About section (max 2,600 characters):
- Hook first line — must work without "see more" click. Bold statement or intriguing question.
- Second paragraph: what you do and who you do it for
- Third paragraph: 2-3 specific achievements with numbers
- Fourth paragraph: what you're looking for / open to
- End with: current role, location, how to contact
- First-person, warm and human (not corporate)
- Keyword-rich but natural — think how recruiters search
- No buzzwords: "passionate", "results-driven", "leverage", "synergy"
- Line breaks between paragraphs for readability

---FEATURED_KEYWORDS---
List 10 keywords a recruiter would search to find this person. One per line. These should go in their Skills section.

Return all three sections with the exact markers (---HEADLINE---, ---ABOUT---, ---FEATURED_KEYWORDS---) so they can be parsed.`

  const result = await streamText({
    model: anthropic('claude-sonnet-4-5'),
    prompt,
    maxTokens: 1200,
  })

  return result.toDataStreamResponse()
}
