# Folio v2 — Phase 1 complete

## What's in this package

```
folio-v2/
├── app/
│   ├── page.tsx                    ← Landing page (Sprint plan highlighted)
│   ├── auth/page.tsx               ← Sign up / sign in / Google OAuth
│   ├── layout.tsx + globals.css
│   └── app/
│       ├── page.tsx                ← Auth guard → AppShell
│       ├── AppShell.tsx            ← App shell: tabs, header, upgrade modal
│       ├── context.tsx             ← All state + auto-save
│       └── tabs/
│           ├── ProfileTab.tsx
│           ├── ExperienceTab.tsx   ← Also: Education, Quals, Skills
│           ├── GenerateTab.tsx     ← Streaming outputs — all 6 AI tools
│           ├── JobsTab.tsx         ← Also: TrackerTab, HistoryTab
│           └── ToolsTab.tsx        ← LinkedIn optimiser + job alerts
│
├── app/api/
│   ├── generate/route.ts           ← streamText — all AI generation
│   ├── company-research/route.ts   ← Anthropic web search
│   ├── linkedin/route.ts           ← LinkedIn optimiser (Boost/Sprint+)
│   ├── alerts/
│   │   ├── route.ts                ← Job alerts CRUD
│   │   └── send/route.ts           ← Weekly cron — sends email digests
│   ├── profiles/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── versions/route.ts
│   ├── jobs/search/route.ts
│   ├── user/me/route.ts
│   └── stripe/
│       ├── checkout/route.ts       ← Sprint auto-cancels at 90 days
│       ├── webhook/route.ts
│       └── portal/route.ts
│
├── supabase/migrations/
│   ├── 001_schema.sql              ← Run first
│   └── 002_sprint.sql              ← Run second
│
├── chrome-extension/
│   ├── manifest.json
│   ├── popup.html / popup.js       ← UPDATE Supabase keys + domain here
│   ├── content.js                  ← UPDATE domain here
│   ├── background.js
│   └── README.md
│
├── components/ui/index.tsx         ← Full design system
├── vercel.json                     ← Cron: Monday 8am weekly alerts
└── .env.local.example
```

---

## Phase 1 — what was added

**Job Seeker Sprint — £39 / 3 months**
Highlighted as Best Value on the pricing page. Pay once, no monthly commitment. Stripe creates a recurring subscription and the checkout route sets `cancel_at` to 90 days automatically. Gets everything in Boost — unlimited generation, LinkedIn optimiser, job alerts.

**LinkedIn Profile Optimiser**
Lives in the new Tools tab. Rewrites the user's LinkedIn About section, headline, and generates 10 Skills keywords using Claude. Streams in real-time. Gated to Boost/Sprint/Recruiter with a lock icon and upgrade prompt for lower plans.

**Weekly Job Alerts**
Also in the Tools tab. Users create named alerts with keywords, location, and optional salary floor. Vercel cron fires every Monday 8am, hits Adzuna for fresh jobs, sends a formatted HTML email per user via Resend. Each email has Apply with Folio deep-links pre-filled with the job description.

**Chrome Extension**
Detects job descriptions on LinkedIn, Indeed, Reed, Glassdoor, Totaljobs, CVLibrary. Injects an Apply with Folio button next to native apply buttons. Toolbar popup lets users sign in and open Folio pre-filled with one click. AppShell reads the `?jd=&url=&from=extension` params and jumps straight to the Generate tab.

---

## New environment variables

| Variable | Where to get it | Required for |
|---|---|---|
| `STRIPE_PRICE_SPRINT` | Stripe dashboard | Sprint checkout |
| `RESEND_API_KEY` | resend.com — free tier | Job alert emails |
| `CRON_SECRET` | Any random string | Securing the cron endpoint |

Generate a cron secret: go to https://generate-secret.vercel.app/32

---

## Setup steps (additions to the original guide)

**Resend (job alert emails)**
1. Go to resend.com → sign up free
2. Add a sending domain (e.g. `alerts@yourdomain.com`) — follow their DNS verification steps
3. Create an API key → copy it → add as `RESEND_API_KEY` in Vercel

**Sprint plan in Stripe**
1. Stripe dashboard → Products → Add product: "Job Seeker Sprint" → £39/month recurring
2. Copy the price ID → add as `STRIPE_PRICE_SPRINT` in Vercel
3. The subscription auto-cancels after 90 days via the `cancel_at` field set in checkout — no extra Stripe config needed

**Vercel cron (weekly alerts)**
Crons require Vercel Pro ($20/month). If on free Hobby plan, use cron-job.org instead:
1. Sign up at cron-job.org — free
2. Create a cron job: URL = `https://yourdomain.com/api/alerts/send`, schedule = every Monday 8am
3. Add header: `Authorization: Bearer YOUR_CRON_SECRET`

**Chrome extension**
1. Open `chrome-extension/popup.js` — update lines 2-4 with your domain + Supabase URL + anon key
2. Open `chrome-extension/content.js` — update line 3 with your domain
3. Add icons (16px, 48px, 128px) to `chrome-extension/icons/` — Canva free or any image editor
4. Chrome → `chrome://extensions` → Developer mode ON → Load unpacked → select the folder
5. To publish: chrome.google.com/webstore/devconsole → $5 one-time → upload zip of the folder

---

## Full deploy checklist

- [ ] Upload files to GitHub repo (browser drag and drop)
- [ ] Supabase: run 001_schema.sql, then 002_sprint.sql
- [ ] Stripe: create Sprint product + 3 other products, copy all price IDs
- [ ] Resend: verify domain, create API key
- [ ] Vercel: import repo, add ALL env vars, deploy
- [ ] Update Stripe webhook URL to your live Vercel domain
- [ ] Set up weekly cron (Vercel Pro or cron-job.org)
- [ ] Update chrome-extension/popup.js and content.js with your domain
- [ ] Load extension in Chrome for testing
- [ ] End-to-end test: sign up → fill profile → generate CV → upgrade (Stripe test mode) → create alert → check extension
