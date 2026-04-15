'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function AuthForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [mode, setMode] = useState<'signin'|'signup'|'reset'>(
    (params.get('mode') as any) || 'signup'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/app')
    })
  }, [router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const supabase = getSupabase()
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
        if (error) throw error
        setSuccess('Check your email to confirm your account, then sign in.')
        setMode('signin')
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        const plan = params.get('plan')
        if (plan) router.push(`/app?checkout=${plan}`)
        else router.push('/app')
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset`
        })
        if (error) throw error
        setSuccess('Reset link sent. Check your inbox.')
      }
    } catch (err: any) { setError(err.message) }
    setLoading(false)
  }

  async function googleAuth() {
    const plan = params.get('plan')
    await getSupabase().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app${plan ? `?checkout=${plan}` : ''}` }
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--surface-1)', border: '1.5px solid var(--ink-100)',
    borderRadius: 12, padding: '11px 16px', fontFamily: 'var(--font-sans)', fontSize: 14,
    color: 'var(--ink-900)', outline: 'none', transition: 'all 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-sans)' }}>
      {/* LEFT PANEL */}
      <div style={{ display: 'none', width: '48%', background: 'var(--forest-700)', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 52px', position: 'relative', overflow: 'hidden' }} className="lg:flex flex-col">
        {/* Background texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(30,110,69,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(30,110,69,0.3) 0%, transparent 50%)', pointerEvents: 'none' }} />

        <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: 8, textDecoration: 'none', position: 'relative', zIndex: 1 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Folio</span>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>CV Builder</span>
        </Link>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 20 }}>
            Land your next role<br /><em>with total confidence</em>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
            {[
              { icon: '◈', title: 'Fit score 87/100', sub: 'Strong match — apply with confidence' },
              { icon: '🔍', title: 'Company research', sub: 'Stripe raised $600M — expanding into APAC payments' },
              { icon: '🔑', title: 'Keyword gap found', sub: '"API-first" and "payment infrastructure" missing' },
            ].map(c => (
              <div key={c.title} style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{c.icon}</span>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{c.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 1.5 }}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', position: 'relative', zIndex: 1, fontWeight: 500 }}>
          Trusted by 2,400+ professionals · 47% faster job search
        </p>
      </div>

      {/* RIGHT PANEL — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: 'var(--surface-1)' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Mobile logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: 8, textDecoration: 'none', marginBottom: 32 }} className="lg:hidden">
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>Folio</span>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', color: 'var(--forest-500)', textTransform: 'uppercase' }}>CV Builder</span>
          </Link>

          <div style={{ background: 'var(--surface-0)', border: '1.5px solid var(--ink-100)', borderRadius: 22, padding: '32px', boxShadow: '0 4px 8px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.06)' }}>

            {/* Tabs */}
            {mode !== 'reset' && (
              <div style={{ display: 'flex', borderBottom: '1.5px solid var(--ink-100)', marginBottom: 28, gap: 0, marginLeft: -32, marginRight: -32, paddingLeft: 32, paddingRight: 32 }}>
                {[['signup', 'Create account'], ['signin', 'Sign in']].map(([key, label]) => (
                  <button key={key} onClick={() => { setMode(key as any); setError(''); setSuccess('') }}
                    style={{ flex: 1, paddingBottom: 14, background: 'none', border: 'none', borderBottom: `2.5px solid ${mode === key ? 'var(--forest-500)' : 'transparent'}`, color: mode === key ? 'var(--forest-600)' : 'var(--ink-400)', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1.5 }}>
                    {label}
                  </button>
                ))}
              </div>
            )}

            {mode === 'reset' && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em', marginBottom: 6 }}>Reset password</div>
                <div style={{ fontSize: 13, color: 'var(--ink-400)' }}>We&apos;ll send a reset link to your email.</div>
              </div>
            )}

            {(success || error) && (
              <div style={{ marginBottom: 20, borderRadius: 12, padding: '12px 16px', fontSize: 13, fontWeight: 500, background: success ? 'var(--forest-50)' : '#fef0ee', border: `1.5px solid ${success ? 'var(--forest-200)' : 'rgba(192,57,43,0.2)'}`, color: success ? 'var(--forest-600)' : '#c0392b', lineHeight: 1.5 }}>
                {success || error}
              </div>
            )}

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {mode === 'signup' && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-400)', display: 'block', marginBottom: 7 }}>Full name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Jane Smith" style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'var(--forest-400)'; e.target.style.boxShadow = '0 0 0 3px rgba(30,110,69,0.12)'; e.target.style.background = 'white' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--ink-100)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'var(--surface-1)' }} />
                </div>
              )}
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-400)', display: 'block', marginBottom: 7 }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@email.com" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--forest-400)'; e.target.style.boxShadow = '0 0 0 3px rgba(30,110,69,0.12)'; e.target.style.background = 'white' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--ink-100)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'var(--surface-1)' }} />
              </div>
              {mode !== 'reset' && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-400)', display: 'block', marginBottom: 7 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="8+ characters" minLength={8}
                      style={{ ...inputStyle, paddingRight: 44 }}
                      onFocus={e => { e.target.style.borderColor = 'var(--forest-400)'; e.target.style.boxShadow = '0 0 0 3px rgba(30,110,69,0.12)'; e.target.style.background = 'white' }}
                      onBlur={e => { e.target.style.borderColor = 'var(--ink-100)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'var(--surface-1)' }} />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-400)', display: 'flex', alignItems: 'center' }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
              <button type="submit" disabled={loading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--forest-500)', color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, letterSpacing: '-0.01em', boxShadow: '0 1px 2px rgba(0,0,0,0.1), 0 4px 16px rgba(30,110,69,0.3)', transition: 'all 0.15s', marginTop: 4 }}>
                {loading
                  ? <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  : <>{mode === 'signup' ? 'Create free account' : mode === 'signin' ? 'Sign in' : 'Send reset link'} <ArrowRight size={16} /></>
                }
              </button>
            </form>

            {mode !== 'reset' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--ink-100)' }} />
                  <span style={{ fontSize: 12, color: 'var(--ink-300)', fontWeight: 600 }}>or</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--ink-100)' }} />
                </div>
                <button onClick={googleAuth}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'var(--surface-0)', border: '1.5px solid var(--ink-100)', borderRadius: 12, padding: '11px', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'var(--ink-700)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget).style.borderColor = 'var(--ink-300)'; (e.currentTarget).style.background = 'var(--surface-1)' }}
                  onMouseLeave={e => { (e.currentTarget).style.borderColor = 'var(--ink-100)'; (e.currentTarget).style.background = 'var(--surface-0)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </>
            )}

            {mode === 'signin' && (
              <button onClick={() => { setMode('reset'); setError(''); setSuccess('') }}
                style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 16, background: 'none', border: 'none', fontSize: 13, color: 'var(--ink-400)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink-700)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-400)')}>
                Forgot your password?
              </button>
            )}
            {mode === 'reset' && (
              <button onClick={() => { setMode('signin'); setError(''); setSuccess('') }}
                style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 16, background: 'none', border: 'none', fontSize: 13, color: 'var(--ink-400)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                ← Back to sign in
              </button>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-300)', marginTop: 20, fontWeight: 500 }}>
            By continuing, you agree to our{' '}
            <Link href="/terms" style={{ color: 'var(--ink-400)', textDecoration: 'underline' }}>Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" style={{ color: 'var(--ink-400)', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default function AuthPage() {
  return <Suspense><AuthForm /></Suspense>
}
