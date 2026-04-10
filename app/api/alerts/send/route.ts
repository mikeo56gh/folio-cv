// app/api/alerts/send/route.ts
// Called by Vercel cron every Monday at 8am
// Sends personalised job digest emails to users with active alerts
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 300 // 5 minutes — enough to process many users

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ADZUNA_BASE = 'https://api.adzuna.com/v1/api/jobs'

const COUNTRY_MAP: Record<string, string> = {
  'london': 'gb', 'manchester': 'gb', 'birmingham': 'gb', 'leeds': 'gb',
  'uk': 'gb', 'united kingdom': 'gb', 'new york': 'us', 'san francisco': 'us',
  'us': 'us', 'usa': 'us', 'sydney': 'au', 'australia': 'au',
}

function getCountry(location: string = '') {
  const loc = location.toLowerCase()
  for (const [key, code] of Object.entries(COUNTRY_MAP)) {
    if (loc.includes(key)) return code
  }
  return 'gb'
}

async function fetchJobs(keywords: string[], location: string, salaryMin?: number) {
  const country = getCountry(location)
  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_API_KEY!,
    results_per_page: '8',
    what: keywords.slice(0, 3).join(' '),
    where: location.split(',')[0] || '',
    sort_by: 'date',
    ...(salaryMin ? { salary_min: String(salaryMin) } : {}),
  })

  const res = await fetch(`${ADZUNA_BASE}/${country}/search/1?${params}`)
  if (!res.ok) return []
  const data = await res.json()
  return (data.results || []).map((j: any) => ({
    title: j.title,
    company: j.company?.display_name || 'Company',
    location: j.location?.display_name || location,
    salary: j.salary_min && j.salary_max ? `£${Math.round(j.salary_min/1000)}k–£${Math.round(j.salary_max/1000)}k` : null,
    description: j.description?.substring(0, 160) + '…',
    url: j.redirect_url,
    posted: j.created ? new Date(j.created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '',
  }))
}

async function sendEmail(to: string, subject: string, html: string) {
  // Uses Resend — free tier: 100 emails/day, 3000/month
  // Sign up at resend.com, get API key, add RESEND_API_KEY to env
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Folio Jobs <alerts@' + (process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '') || 'folio.cv') + '>',
      to,
      subject,
      html,
    }),
  })
  return res.ok
}

function buildEmailHTML(userName: string, alertName: string, jobs: any[], appUrl: string) {
  const jobCards = jobs.map(j => `
    <div style="background:#f7f6f2;border-radius:10px;padding:16px;margin-bottom:12px;border:1px solid #e8e7e0">
      <div style="font-weight:600;font-size:15px;color:#1a1916;margin-bottom:3px">${j.title}</div>
      <div style="font-size:13px;color:#6b6960;margin-bottom:6px">${j.company} · ${j.location}${j.salary ? ` · <strong style="color:#2d5a3d">${j.salary}</strong>` : ''}</div>
      <div style="font-size:12px;color:#9c9b94;line-height:1.5;margin-bottom:10px">${j.description}</div>
      <div style="display:flex;gap:8px">
        <a href="${appUrl}/app?jd=${encodeURIComponent(j.url)}&tab=generate" style="background:#2d5a3d;color:#fff;text-decoration:none;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:600">◈ Apply with Folio</a>
        <a href="${j.url}" style="background:#fff;color:#6b6960;text-decoration:none;padding:7px 14px;border-radius:7px;font-size:12px;border:1px solid #e8e7e0">View posting</a>
      </div>
    </div>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:'DM Sans',Arial,sans-serif;background:#fff;margin:0;padding:0">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:24px">
      <span style="font-family:Georgia,serif;font-size:22px;color:#1a1916">Folio</span>
      <span style="font-size:9px;font-weight:700;letter-spacing:2px;color:#2d5a3d;text-transform:uppercase">Jobs digest</span>
    </div>
    
    <p style="font-size:16px;color:#1a1916;margin:0 0 6px">Hi ${userName || 'there'},</p>
    <p style="font-size:14px;color:#6b6960;margin:0 0 20px;line-height:1.6">
      Here are this week's best matches for <strong style="color:#2d5a3d">${alertName}</strong>. 
      Click "Apply with Folio" on any role to instantly generate a tailored CV.
    </p>
    
    ${jobCards}
    
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e8e7e0;font-size:12px;color:#9c9b94;line-height:1.7">
      <a href="${appUrl}/app" style="color:#2d5a3d;font-weight:600">Open Folio</a> · 
      <a href="${appUrl}/app?tab=alerts" style="color:#9c9b94">Manage alerts</a> · 
      <a href="${appUrl}/unsubscribe?email=EMAIL_PLACEHOLDER" style="color:#9c9b94">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`
}

export async function GET(request: Request) {
  // Verify this is called by Vercel cron (or manually with the secret)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorised', { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://folio.cv'
  let sent = 0
  let failed = 0

  try {
    // Get all active alerts with their users
    const { data: alerts } = await supabaseAdmin
      .from('job_alerts')
      .select(`
        id, title, keywords, location, salary_min, user_id,
        users!inner(email, full_name, plan, subscription_status)
      `)
      .eq('is_active', true)
      .in('users.plan', ['pro', 'boost', 'sprint', 'recruiter'])
      .eq('users.subscription_status', 'active')

    if (!alerts?.length) {
      return new Response(JSON.stringify({ message: 'No active alerts', sent: 0 }), { status: 200 })
    }

    // Group by user to send one email per user (combining multiple alerts)
    const byUser = alerts.reduce((acc: any, alert: any) => {
      if (!acc[alert.user_id]) acc[alert.user_id] = { user: alert.users, alerts: [] }
      acc[alert.user_id].alerts.push(alert)
      return acc
    }, {})

    for (const [userId, { user, alerts: userAlerts }] of Object.entries(byUser) as any) {
      try {
        // Fetch jobs for each alert and combine
        const allJobs: any[] = []
        for (const alert of userAlerts.slice(0, 2)) {
          const jobs = await fetchJobs(alert.keywords || [], alert.location || '', alert.salary_min)
          allJobs.push(...jobs.slice(0, 4))
        }

        if (!allJobs.length) continue

        const alertName = userAlerts.map((a: any) => a.title).join(' & ')
        const html = buildEmailHTML(user.full_name, alertName, allJobs.slice(0, 6), appUrl)
        const ok = await sendEmail(user.email, `Your weekly jobs digest — ${alertName}`, html)

        if (ok) {
          sent++
          // Update last_sent_at for all user's alerts
          await supabaseAdmin
            .from('job_alerts')
            .update({ last_sent_at: new Date().toISOString() })
            .in('id', userAlerts.map((a: any) => a.id))
        } else {
          failed++
        }
      } catch (e) {
        console.error(`Alert send failed for user ${userId}:`, e)
        failed++
      }
    }

    return new Response(JSON.stringify({ message: 'Done', sent, failed, total: Object.keys(byUser).length }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
}
