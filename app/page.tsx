'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(20px)'
    el.style.transition = `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)' } },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])
  return <div ref={ref} className={className}>{children}</div>
}

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <nav style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 100, width: 'calc(100% - 48px)', maxWidth: 1100,
      background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(20px)', borderRadius: 999,
      border: '1px solid rgba(0,0,0,0.07)',
      boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.08)' : 'none',
      transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
      padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#18181b', letterSpacing: '-0.03em' }}>Folio</span>
        <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.2em', color: '#1e6e45', textTransform: 'uppercase' }}>CV</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Link href="/auth?mode=signin" style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: '#52525b', textDecoration: 'none' }}>Sign in</Link>
        <Link href="/auth" style={{ padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: '#18181b', color: '#fff', textDecoration: 'none', transition: 'background 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1e6e45'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#18181b'}
        >Get started free</Link>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', paddingTop: 100, paddingBottom: 80, background: '#fafaf9' }}>
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <FadeIn delay={0}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 999, padding: '5px 14px', marginBottom: 28 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#15803d' }}>AI-Powered CV Builder</span>
              </div>
            </FadeIn>
            <FadeIn delay={80}>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.8rem, 4.5vw, 4.2rem)', fontWeight: 700, color: '#18181b', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24 }}>
                Your CV, built to{' '}
                <span style={{ display: 'inline-block', width: 56, height: 36, borderRadius: 10, overflow: 'hidden', verticalAlign: 'middle', margin: '0 4px' }}>
                  <img src="https://picsum.photos/seed/hiring/112/72" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </span>
                {' '}get the
                <br /><em style={{ fontStyle: 'italic', color: '#1e6e45' }}>interview</em>
              </h1>
            </FadeIn>
            <FadeIn delay={160}>
              <p style={{ fontSize: 17, color: '#71717a', lineHeight: 1.7, marginBottom: 36, maxWidth: '52ch' }}>
                Paste a job description. Folio analyses your fit, rewrites your CV to match, identifies keyword gaps, and researches the company — all in under 60 seconds.
              </p>
            </FadeIn>
            <FadeIn delay={240}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/auth" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#18181b', color: '#fff', textDecoration: 'none', borderRadius: 999, padding: '14px 28px', fontSize: 15, fontWeight: 700, transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 4px 20px rgba(24,24,27,0.25)' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#1e6e45'; el.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#18181b'; el.style.transform = 'translateY(0)' }}
                >
                  Build my CV free
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>→</span>
                </Link>
                <a href="#how" style={{ display: 'inline-flex', alignItems: 'center', color: '#52525b', textDecoration: 'none', borderRadius: 999, padding: '14px 24px', fontSize: 15, fontWeight: 600, border: '1.5px solid #e4e4e7', transition: 'all 0.2s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#18181b'; el.style.color = '#18181b' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e4e4e7'; el.style.color = '#52525b' }}
                >See how it works</a>
              </div>
            </FadeIn>
            <FadeIn delay={320}>
              <div style={{ display: 'flex', gap: 32, marginTop: 48, paddingTop: 32, borderTop: '1px solid #e4e4e7' }}>
                {[['2,400+', 'Active users'], ['87%', 'Avg fit score'], ['60s', 'To tailor a CV']].map(([n, l]) => (
                  <div key={l}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#18181b', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{n}</div>
                    <div style={{ fontSize: 12, color: '#71717a', fontWeight: 500, marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={200}>
            <div style={{ position: 'relative' }}>
              <div style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '2rem', padding: 6 }}>
                <div style={{ background: '#fff', borderRadius: 'calc(2rem - 6px)', overflow: 'hidden', boxShadow: '0 20px 60px -15px rgba(0,0,0,0.12)' }}>
                  <div style={{ background: '#f4f4f5', borderBottom: '1px solid #e4e4e7', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                    <div style={{ flex: 1, background: '#e4e4e7', borderRadius: 6, height: 20, marginLeft: 8 }} />
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px', marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Fit Analysis</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 28, fontWeight: 900, color: '#16a34a', fontVariantNumeric: 'tabular-nums' }}>87</div>
                        <div style={{ fontSize: 12, color: '#15803d' }}>/100 — Strong match<br /><span style={{ color: '#71717a' }}>Apply with confidence</span></div>
                      </div>
                    </div>
                    {[
                      { label: 'Keywords matched', val: '14/17', pct: 82, color: '#16a34a' },
                      { label: 'Experience alignment', val: '4/5 roles', pct: 80, color: '#3b82f6' },
                      { label: 'ATS compatibility', val: 'High', pct: 94, color: '#8b5cf6' },
                    ].map(({ label, val, pct, color }) => (
                      <div key={label} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 12, color: '#52525b', fontWeight: 500 }}>{label}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#18181b' }}>{val}</span>
                        </div>
                        <div style={{ height: 5, background: '#f4f4f5', borderRadius: 99 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ background: '#fafaf9', border: '1px solid #e4e4e7', borderRadius: 10, padding: '10px 14px', marginTop: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: 6 }}>Missing keywords</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {['API-first', 'payment infra', 'cross-functional'].map(k => (
                          <span key={k} style={{ fontSize: 11, fontWeight: 600, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 999, padding: '3px 10px' }}>{k}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: -16, left: -20, background: '#18181b', color: '#fff', borderRadius: 14, padding: '10px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#1e6e45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✓</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>CV tailored in 52s</div>
                  <div style={{ fontSize: 10, color: '#a1a1aa' }}>for Senior PM at Stripe</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

function StatsBar() {
  return (
    <section style={{ background: '#18181b', padding: '28px 24px' }}>
      <div className="stats-bar" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        {[['47%','faster application process'],['3.2×','more interview callbacks'],['60s','average tailoring time'],['2,400+','CVs generated this month']].map(([n,l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' }}>{n}</span>
            <span style={{ fontSize: 13, color: '#71717a', fontWeight: 500 }}>{l}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function Features() {
  const features = [
    { title: 'Fit score & analysis', body: 'Paste any job description. Get an instant score out of 100 with specific reasoning — what matches, what\'s missing, whether to apply.', accent: '#1e6e45', bg: '#f0fdf4', size: 'large', icon: '◈' },
    { title: 'CV generation', body: 'Rewrites your CV to match the role — not just keywords, but tone, seniority level, and emphasis.', accent: '#1d4ed8', bg: '#eff6ff', size: 'small', icon: '⊡' },
    { title: 'Cover letters', body: 'One-click cover letters that sound like you wrote them — specific, direct, no clichés.', accent: '#7c3aed', bg: '#f5f3ff', size: 'small', icon: '◻' },
    { title: 'Company research', body: 'Know funding, headcount growth, product direction, and culture signals before your interview.', accent: '#b45309', bg: '#fffbeb', size: 'large', icon: '⊕' },
    { title: 'ATS keyword gap', body: 'Identifies every missing keyword an applicant tracking system would penalise you for.', accent: '#dc2626', bg: '#fef2f2', size: 'small', icon: '⊗' },
    { title: 'Application tracker', body: 'Track every application, stage, and follow-up in one place.', accent: '#0369a1', bg: '#f0f9ff', size: 'small', icon: '⊞' },
  ]
  return (
    <section id="how" style={{ padding: '96px 24px', background: '#fafaf9' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1e6e45', marginBottom: 14 }}>What Folio does</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, color: '#18181b', lineHeight: 1.15, letterSpacing: '-0.03em', maxWidth: '16ch' }}>Everything your job search needs</h2>
          </div>
        </FadeIn>
        <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, gridAutoFlow: 'dense' }}>
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 60}>
              <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 20, padding: f.size === 'large' ? 32 : 24, gridColumn: f.size === 'large' ? 'span 2' : 'span 1', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', height: '100%' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 20px 40px -15px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none' }}
              >
                <div style={{ width: 40, height: 40, background: f.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: f.accent, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: f.size === 'large' ? 20 : 16, fontWeight: 700, color: '#18181b', marginBottom: 8, letterSpacing: '-0.02em' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#71717a', lineHeight: 1.65, margin: 0 }}>{f.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { n: '01', title: 'Build your profile', body: 'Add your experience, education, and skills once. Folio stores it as your master profile.' },
    { n: '02', title: 'Paste a job description', body: 'Drop in the full JD from any job board. No formatting required.' },
    { n: '03', title: 'Get your fit score', body: 'Folio scores your match, highlights gaps, and researches the employer in seconds.' },
    { n: '04', title: 'Generate and apply', body: 'One click produces a tailored CV and cover letter ready to send.' },
  ]
  return (
    <section style={{ padding: '96px 24px', background: '#18181b' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1e6e45', marginBottom: 14 }}>The process</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.03em', maxWidth: '20ch' }}>From blank page to sent application in minutes</h2>
          </div>
        </FadeIn>
        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
          {steps.map((s, i) => (
            <FadeIn key={s.n} delay={i * 80}>
              <div style={{ padding: '32px 24px', borderLeft: i === 0 ? '1px solid #3f3f46' : 'none', borderRight: '1px solid #3f3f46' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 48, fontWeight: 700, color: '#3f3f46', lineHeight: 1, marginBottom: 20, fontVariantNumeric: 'tabular-nums' }}>{s.n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.65, margin: 0 }}>{s.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const t = [
    { name: 'Mark', role: 'Product Manager, fintech', body: 'I applied to 12 roles in a week. Fit score kept me from wasting time on bad matches. Got 4 first-round interviews.', score: 91 },
    { name: 'Priya', role: 'Graduate, Computer Science', body: 'The keyword gap analysis was the thing I\'d been missing. ATS kept rejecting me and I didn\'t know why until Folio showed me.', score: 84 },
    { name: 'Daniel', role: 'Operations Director', body: 'Cover letters used to take me an hour. Folio writes a better one in 30 seconds. Company research before interviews is the real gem.', score: 88 },
  ]
  return (
    <section style={{ padding: '96px 24px', background: '#fafaf9' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1e6e45', marginBottom: 14 }}>Results</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, color: '#18181b', lineHeight: 1.15, letterSpacing: '-0.03em' }}>People who stopped guessing</h2>
          </div>
        </FadeIn>
        <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {t.map((item, i) => (
            <FadeIn key={item.name} delay={i * 80}>
              <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 20, padding: 28, height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f4f4f5', overflow: 'hidden' }}>
                    <img src={`https://picsum.photos/seed/${item.name}/80/80`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 999, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#16a34a', fontVariantNumeric: 'tabular-nums' }}>{item.score}</span>
                    <span style={{ fontSize: 11, color: '#16a34a' }}>/100</span>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: '#3f3f46', lineHeight: 1.7, margin: 0, flex: 1 }}>"{item.body}"</p>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#18181b' }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: '#71717a' }}>{item.role}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  const plans = [
    { name: 'Free', price: '£0', period: 'forever', features: ['3 CV generations', '1 cover letter', '1 fit review', 'Application tracker', 'Job search'], cta: 'Start free', highlight: false },
    { name: 'Job Seeker Sprint', price: '£39', period: '3 months', tag: 'Most popular', features: ['Unlimited CVs', 'Unlimited cover letters', 'Unlimited fit reviews', 'LinkedIn optimiser', 'Salary coach', 'Company research', 'Deep analysis', 'No monthly commitment'], cta: 'Get Sprint', highlight: true },
    { name: 'Pro', price: '£14', period: '/month', features: ['Unlimited CVs', 'Unlimited cover letters', 'Unlimited fit reviews', 'LinkedIn optimiser', 'Salary coach', 'Company research', 'Job alerts'], cta: 'Get Pro', highlight: false },
  ]
  return (
    <section style={{ padding: '96px 24px', background: '#18181b' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ marginBottom: 56, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1e6e45', marginBottom: 14 }}>Pricing</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.03em' }}>Start free. Upgrade when you're ready.</h2>
          </div>
        </FadeIn>
        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 12, alignItems: 'start' }}>
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 80}>
              <div style={{ background: plan.highlight ? '#fff' : 'rgba(255,255,255,0.04)', border: plan.highlight ? 'none' : '1px solid #3f3f46', borderRadius: 20, padding: plan.highlight ? 32 : 28, position: 'relative', overflow: 'hidden' }}>
                {plan.tag && <div style={{ position: 'absolute', top: 16, right: 16, background: '#1e6e45', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 999, padding: '4px 12px' }}>{plan.tag}</div>}
                <div style={{ fontSize: 13, fontWeight: 700, color: plan.highlight ? '#18181b' : '#71717a', marginBottom: 12 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: plan.highlight ? '#18181b' : '#fff', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: plan.highlight ? '#71717a' : '#52525b' }}>{plan.period}</span>
                </div>
                <div style={{ height: 1, background: plan.highlight ? '#e4e4e7' : '#3f3f46', margin: '20px 0' }} />
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 9, fontSize: 13, color: plan.highlight ? '#3f3f46' : '#71717a', alignItems: 'flex-start' }}>
                      <span style={{ color: '#1e6e45', flexShrink: 0, fontWeight: 700 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: plan.highlight ? '#18181b' : 'transparent', color: plan.highlight ? '#fff' : '#71717a', border: plan.highlight ? 'none' : '1px solid #3f3f46', borderRadius: 999, padding: '12px', fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (plan.highlight) (e.currentTarget as HTMLElement).style.background = '#1e6e45'; else { (e.currentTarget as HTMLElement).style.borderColor = '#fff'; (e.currentTarget as HTMLElement).style.color = '#fff' } }}
                  onMouseLeave={e => { if (plan.highlight) (e.currentTarget as HTMLElement).style.background = '#18181b'; else { (e.currentTarget as HTMLElement).style.borderColor = '#3f3f46'; (e.currentTarget as HTMLElement).style.color = '#71717a' } }}
                >{plan.cta}</Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section style={{ padding: '96px 24px', background: '#fafaf9' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <FadeIn>
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 3.5vw, 3.2rem)', fontWeight: 700, color: '#18181b', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 20 }}>Stop sending CVs that disappear into silence</h2>
              <p style={{ fontSize: 16, color: '#71717a', lineHeight: 1.7, marginBottom: 32, maxWidth: '48ch' }}>The average job gets 250 applications. Folio gives you the edge — a CV that's been scored, tailored, and optimised before it reaches a recruiter.</p>
              <Link href="/auth" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#18181b', color: '#fff', textDecoration: 'none', borderRadius: 999, padding: '14px 28px', fontSize: 15, fontWeight: 700, transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 4px 20px rgba(24,24,27,0.2)' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#1e6e45'; el.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#18181b'; el.style.transform = 'translateY(0)' }}
              >
                Build my CV for free
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>→</span>
              </Link>
            </div>
          </FadeIn>
          <FadeIn delay={120}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { n: '250', label: 'Avg applications per role', sub: 'You need to stand out' },
                { n: '7s', label: 'Time to scan a CV', sub: 'First impression is everything' },
                { n: '75%', label: 'CVs rejected by ATS', sub: 'Before a human sees them' },
                { n: '3×', label: 'More callbacks', sub: 'With a tailored CV' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 16, padding: '20px 18px' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#18181b', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>{s.n}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#18181b', marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: '#a1a1aa' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{ background: '#18181b', borderTop: '1px solid #3f3f46', padding: '40px 24px' }}>
      <div className="footer-inner" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>Folio</span>
          <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.2em', color: '#1e6e45', textTransform: 'uppercase' }}>CV</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          {[['Sign in', '/auth?mode=signin'], ['Get started', '/auth'], ['Privacy', '#'], ['Terms', '#']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: 13, color: '#71717a', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#71717a'}
            >{label}</a>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#52525b' }}>© 2025 Folio. All rights reserved.</div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <main style={{ overflowX: 'hidden', width: '100%', maxWidth: '100%' }}>
      <Nav />
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fafaf9; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .bento-grid { grid-template-columns: 1fr !important; }
          .bento-grid > * { grid-column: span 1 !important; }
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
          .stats-bar { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
          .footer-inner { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>
    </main>
  )
}
