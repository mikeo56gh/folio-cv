'use client'
import { ArrowRight, CheckCircle, Zap, Shield, BarChart2, Search, FileText, Mail, Star, ChevronDown, Sparkles, TrendingUp, Linkedin } from 'lucide-react'
import Link from 'next/link'

const FEATURES = [
  { icon: FileText,   label: 'ATS-optimised CV',      desc: 'Selects and reframes only your most relevant achievements per role — not a template dump.' },
  { icon: Mail,       label: 'Cover letter',           desc: 'Unique narrative built around the company. Reads human. Never sounds generated.' },
  { icon: BarChart2,  label: 'Fit review & score',     desc: 'Honest 0–100 match score with dimension breakdown before you waste time applying.' },
  { icon: Search,     label: 'Company research',       desc: 'Live intel on culture, recent news, and talking points to reference in your application.' },
  { icon: Zap,        label: 'Interview prep',         desc: '10 targeted questions with suggested angles drawn from your actual experience.' },
  { icon: Shield,     label: 'Red flag check',         desc: 'Catches what a recruiter would silently reject — before they do.' },
  { icon: Linkedin,   label: 'LinkedIn optimiser',     desc: 'Rewrites your About section and headline for LinkedIn\'s search algorithm.' },
  { icon: TrendingUp, label: 'Salary coach',           desc: 'Counter-offer strategy, talking points, phone script, and follow-up email.' },
]

const PLANS = [
  {
    name: 'Free',
    price: '£0', period: '',
    desc: 'Try it. No card needed.',
    features: ['3 CV generations', '1 cover letter', '1 fit review', '5 job searches'],
    cta: 'Start free', href: '/auth', highlight: false, badge: null,
  },
  {
    name: 'Sprint',
    price: '£39', period: '/3 months',
    desc: 'Most people land a role in 3 months. Pay once, stop when you do.',
    features: ['Everything unlimited', 'LinkedIn optimiser', 'Salary coach', 'Weekly job alerts', 'No monthly commitment'],
    cta: 'Start Sprint', href: '/auth?plan=sprint', highlight: true, badge: 'Best value',
  },
  {
    name: 'Pro',
    price: '£9', period: '/mo',
    desc: 'Unlimited tools. Cancel any time.',
    features: ['Unlimited CVs & letters', 'Company research', 'Interview prep', 'Red flag check', 'Version history'],
    cta: 'Start Pro', href: '/auth?plan=pro', highlight: false, badge: null,
  },
  {
    name: 'Boost',
    price: '£19', period: '/mo',
    desc: 'Every tool, every advantage.',
    features: ['Everything in Pro', 'LinkedIn optimiser', 'Salary coach', 'Weekly job alerts'],
    cta: 'Start Boost', href: '/auth?plan=boost', highlight: false, badge: null,
  },
]

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'PM → Director', quote: 'The fit review told me I was a weak match before I wasted 2 hours. Found a better role through Folio a week later.' },
  { name: 'James K.', role: 'Grad → SWE', quote: 'I was missing 8 key ATS terms. Fixed them. Got 3× more callbacks the next week.' },
  { name: 'Rachel T.', role: 'Manager → Director', quote: 'I walked into the interview knowing their Q3 strategy. The hiring team was visibly surprised.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-1)', fontFamily: 'var(--font-sans)' }}>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(247,249,247,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--ink-100)',
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>Folio</span>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', color: 'var(--forest-500)', textTransform: 'uppercase' }}>CV Builder</span>
          </div>
          <div style={{ display: 'flex', gap: 32, fontSize: 13, fontWeight: 500, color: 'var(--ink-400)' }} className="hidden md:flex">
            {['#features', '#pricing', '#reviews'].map((h, i) => (
              <a key={h} href={h} style={{ color: 'var(--ink-400)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink-900)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-400)')}>
                {['Features', 'Pricing', 'Reviews'][i]}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href="/auth" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-500)', padding: '8px 14px', textDecoration: 'none', borderRadius: 10, transition: 'color 0.15s' }}>Sign in</Link>
            <Link href="/auth?mode=signup" style={{ fontSize: 13, fontWeight: 700, background: 'var(--forest-500)', color: '#fff', padding: '9px 18px', borderRadius: 12, textDecoration: 'none', letterSpacing: '-0.01em', boxShadow: '0 1px 2px rgba(0,0,0,0.1), 0 4px 12px rgba(30,110,69,0.25)', transition: 'all 0.15s' }}>
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{ paddingTop: 130, paddingBottom: 80, paddingLeft: 24, paddingRight: 24, overflow: 'hidden', position: 'relative' }}>
        {/* Soft background orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 60, left: '15%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(30,110,69,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: 100, right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(212,137,10,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
        </div>

        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          {/* Pill badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--forest-50)', border: '1.5px solid var(--forest-200)', borderRadius: 99, padding: '6px 16px', marginBottom: 32, fontSize: 12, fontWeight: 700, color: 'var(--forest-600)', letterSpacing: '0.02em' }}>
            <Sparkles size={12} />
            Powered by Claude — Anthropic's most capable AI
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(42px, 7vw, 76px)', fontWeight: 700, lineHeight: 1.06, letterSpacing: '-0.03em', color: 'var(--ink-900)', marginBottom: 24, textWrap: 'balance' }}>
            Land your next role<br />
            <em style={{ color: 'var(--forest-500)', fontStyle: 'italic' }}>with total confidence</em>
          </h1>

          <p style={{ fontSize: 18, fontWeight: 400, color: 'var(--ink-400)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 36px', textWrap: 'balance' }}>
            ATS-optimised CVs, tailored cover letters, live company research, and brutally honest fit reviews — built around the exact role you want.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            <Link href="/auth" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--forest-500)', color: '#fff', padding: '14px 28px', borderRadius: 14, fontWeight: 700, fontSize: 15, textDecoration: 'none', letterSpacing: '-0.01em', boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 8px 24px rgba(30,110,69,0.3)', transition: 'all 0.2s' }}>
              Start building for free <ArrowRight size={16} />
            </Link>
            <a href="#features" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--surface-0)', color: 'var(--ink-600)', padding: '14px 24px', borderRadius: 14, fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1.5px solid var(--ink-100)', transition: 'all 0.2s' }}>
              See all features <ChevronDown size={16} />
            </a>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--ink-400)', fontSize: 13 }}>
            <div style={{ display: 'flex' }}>
              {['#1e6e45','#2d8a57','#4a9e6e','#72b893','#a8d4ba'].map((bg, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: bg, border: '2px solid white', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 700 }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span>Trusted by <strong style={{ color: 'var(--ink-700)' }}>2,400+</strong> professionals</span>
          </div>
        </div>

        {/* App preview mockup */}
        <div style={{ maxWidth: 860, margin: '56px auto 0', position: 'relative' }}>
          <div style={{ background: 'var(--surface-0)', borderRadius: 20, border: '1px solid var(--ink-100)', boxShadow: '0 4px 8px rgba(0,0,0,0.06), 0 24px 64px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {/* Window chrome */}
            <div style={{ background: 'var(--surface-2)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--ink-100)' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ff5f57','#ffbd2e','#28c840'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.7)', borderRadius: 7, padding: '5px 12px', fontSize: 11, color: 'var(--ink-400)', margin: '0 8px', fontFamily: 'var(--font-mono)' }}>folio.cv/app</div>
            </div>
            {/* Content */}
            <div style={{ padding: '28px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--forest-500)', marginBottom: 6 }}>AI-generated · ATS optimised</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em', marginBottom: 4 }}>Senior Product Manager — Stripe</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-400)' }}>Fit score: <span style={{ color: 'var(--forest-500)', fontWeight: 700 }}>87/100</span> · 3 keyword gaps identified</div>
                </div>
                {/* Score ring */}
                <div style={{ flexShrink: 0 }}>
                  <svg viewBox="0 0 72 72" width="72" height="72">
                    <circle cx="36" cy="36" r="28" fill="none" stroke="var(--ink-100)" strokeWidth="5" />
                    <circle cx="36" cy="36" r="28" fill="none" stroke="var(--forest-500)" strokeWidth="5"
                      strokeLinecap="round" strokeDasharray="175.9" strokeDashoffset="23"
                      transform="rotate(-90 36 36)" />
                    <text x="36" y="33" textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--forest-600)" fontFamily="var(--font-serif)">87</text>
                    <text x="36" y="46" textAnchor="middle" fontSize="9" fill="var(--ink-400)" fontFamily="var(--font-sans)">/100</text>
                  </svg>
                </div>
              </div>
              {/* CV skeleton */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
                {[1, 0.85, 0.7, 1, 0.9, 0.75].map((w, i) => (
                  <div key={i} style={{ height: i % 3 === 0 ? 11 : 9, background: i < 3 ? 'var(--forest-100)' : 'var(--surface-2)', borderRadius: 6, width: `${w * 100}%` }} />
                ))}
              </div>
              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { t: '✓ ATS keywords matched', green: true },
                  { t: '✓ Company research applied', green: true },
                  { t: '✓ Top 3 achievements selected', green: true },
                  { t: '⚠ 3 flags to review', green: false },
                ].map(({ t, green }) => (
                  <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: '4px 11px', borderRadius: 99, background: green ? 'var(--forest-50)' : 'var(--amber-light)', color: green ? 'var(--forest-600)' : 'var(--amber)', border: `1.5px solid ${green ? 'var(--forest-200)' : 'rgba(212,137,10,0.25)'}` }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Floating insight card — right */}
          <div style={{ position: 'absolute', right: -24, top: 32, background: 'var(--surface-0)', borderRadius: 14, border: '1px solid var(--ink-100)', padding: '14px 16px', width: 200, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }} className="hidden lg:block">
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-300)', marginBottom: 5 }}>Company insight</div>
            <div style={{ fontSize: 12, color: 'var(--ink-700)', lineHeight: 1.5, fontWeight: 500 }}>Stripe raised $600M Series I. Expanding into APAC payments infrastructure.</div>
          </div>

          {/* Floating keyword card — left */}
          <div style={{ position: 'absolute', left: -24, bottom: 40, background: 'var(--surface-0)', borderRadius: 14, border: '1px solid var(--ink-100)', padding: '14px 16px', width: 190, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }} className="hidden lg:block">
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-300)', marginBottom: 5 }}>Keyword gap</div>
            <div style={{ fontSize: 12, color: '#c0392b', lineHeight: 1.5, fontWeight: 500 }}>Missing: "API-first", "payment infrastructure", "merchant acquiring"</div>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────── */}
      <section style={{ background: 'var(--forest-700)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }} className="grid grid-cols-2 md:grid-cols-4">
          {[['3×', 'more callbacks'], ['47%', 'faster job search'], ['£8k', 'avg salary uplift'], ['94%', 'ATS pass rate']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center', padding: '20px 12px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 6, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section id="features" style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', color: 'var(--forest-500)', textTransform: 'uppercase', marginBottom: 14 }}>Eight tools. One platform.</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink-900)', marginBottom: 14, lineHeight: 1.1 }}>
              Every tool shares your profile.<br />
              <span style={{ color: 'var(--forest-500)', fontStyle: 'italic' }}>No copy-pasting. Ever.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ink-400)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>Paste a job description once. Every output — CV, letter, score, prep — is generated from the same data.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} style={{ background: 'var(--surface-0)', border: '1.5px solid var(--ink-100)', borderRadius: 16, padding: '22px 22px', transition: 'all 0.2s', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--forest-300)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(30,110,69,0.1)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-100)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--forest-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={18} color="var(--forest-500)" />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-900)', marginBottom: 6, letterSpacing: '-0.01em' }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-400)', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section style={{ background: 'var(--forest-500)', padding: '96px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 12 }}>From job posting to application<br />in 3 minutes</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>Most users send tailored applications in under 4 minutes.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }} className="grid grid-cols-1 md:grid-cols-3">
            {[
              { n: '01', title: 'Build your profile', desc: 'Add your experience once. Every achievement becomes your permanent pool.' },
              { n: '02', title: 'Paste any job', desc: 'URL or description. Folio researches the company and builds context live.' },
              { n: '03', title: 'Generate & submit', desc: 'Tailored CV, cover letter, and fit score. Know your odds before you apply.' },
            ].map(s => (
              <div key={s.n} style={{ textAlign: 'center', padding: '32px 28px' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 56, fontWeight: 700, color: 'rgba(255,255,255,0.2)', lineHeight: 1, marginBottom: 16 }}>{s.n}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-0.01em' }}>{s.title}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────── */}
      <section id="reviews" style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink-900)', lineHeight: 1.1 }}>Real results</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: 'var(--surface-0)', border: '1.5px solid var(--ink-100)', borderRadius: 18, padding: '28px 26px' }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--forest-500)" color="var(--forest-500)" />)}
                </div>
                <p style={{ fontSize: 15, color: 'var(--ink-600)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-900)' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--forest-500)', marginTop: 2, fontWeight: 600 }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────── */}
      <section id="pricing" style={{ background: 'var(--surface-2)', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink-900)', marginBottom: 10, lineHeight: 1.1 }}>Simple, honest pricing</h2>
            <p style={{ fontSize: 15, color: 'var(--ink-400)' }}>One successful salary negotiation covers a year of Boost.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14, alignItems: 'start' }}>
            {PLANS.map(plan => (
              <div key={plan.name} style={{ position: 'relative', background: plan.highlight ? 'var(--forest-500)' : 'var(--surface-0)', border: plan.highlight ? 'none' : '1.5px solid var(--ink-100)', borderRadius: 20, padding: '28px 24px', display: 'flex', flexDirection: 'column', boxShadow: plan.highlight ? '0 8px 32px rgba(30,110,69,0.35)' : 'none', marginTop: plan.highlight ? 0 : 0 }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#d4890a', color: '#fff', borderRadius: 99, padding: '4px 14px', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{plan.badge}</div>
                )}
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: plan.highlight ? 'rgba(255,255,255,0.6)' : 'var(--ink-400)', marginBottom: 10 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', color: plan.highlight ? '#fff' : 'var(--ink-900)', lineHeight: 1 }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.55)' : 'var(--ink-400)', fontWeight: 500 }}>{plan.period}</span>}
                </div>
                <p style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.7)' : 'var(--ink-400)', marginBottom: 22, lineHeight: 1.55 }}>{plan.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13 }}>
                      <CheckCircle size={14} color={plan.highlight ? 'rgba(255,255,255,0.7)' : 'var(--forest-500)'} />
                      <span style={{ color: plan.highlight ? 'rgba(255,255,255,0.9)' : 'var(--ink-600)' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none', letterSpacing: '-0.01em', background: plan.highlight ? '#fff' : 'var(--forest-500)', color: plan.highlight ? 'var(--forest-600)' : '#fff', transition: 'all 0.15s' }}>
                  {plan.cta} →
                </Link>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-400)', marginTop: 24, fontWeight: 500 }}>Cancel anytime · No contracts · VAT included</p>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────── */}
      <section style={{ padding: '96px 24px', background: 'var(--surface-0)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink-900)', lineHeight: 1.08, marginBottom: 18, textWrap: 'balance' }}>
            Stop applying blindly.<br />
            <em style={{ color: 'var(--forest-500)' }}>Start applying strategically.</em>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--ink-400)', marginBottom: 32, lineHeight: 1.7 }}>Build your profile once. Tailor every application in under 3 minutes.</p>
          <Link href="/auth" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--forest-500)', color: '#fff', padding: '15px 32px', borderRadius: 14, fontWeight: 700, fontSize: 16, textDecoration: 'none', letterSpacing: '-0.01em', boxShadow: '0 4px 8px rgba(0,0,0,0.1), 0 16px 40px rgba(30,110,69,0.3)', transition: 'all 0.2s' }}>
            Get started — it&apos;s free <ArrowRight size={18} />
          </Link>
          <p style={{ fontSize: 13, color: 'var(--ink-300)', marginTop: 14, fontWeight: 500 }}>No card required · Free forever</p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--ink-100)', padding: '32px 24px', background: 'var(--surface-1)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>Folio</span>
            <span style={{ fontSize: 11, color: 'var(--ink-400)', fontWeight: 500 }}>AI-Powered CV Builder</span>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--ink-400)', fontWeight: 500 }}>
            <Link href="/privacy" style={{ color: 'var(--ink-400)', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ color: 'var(--ink-400)', textDecoration: 'none' }}>Terms</Link>
            <a href="mailto:hello@folio.cv" style={{ color: 'var(--ink-400)', textDecoration: 'none' }}>Contact</a>
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-300)', fontWeight: 500 }}>© {new Date().getFullYear()} Folio</p>
        </div>
      </footer>

    </div>
  )
}
