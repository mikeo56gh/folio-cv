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
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } }
        })
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
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  async function googleAuth() {
    const plan = params.get('plan')
    await getSupabase().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app${plan ? `?checkout=${plan}` : ''}` }
    })
  }

  const tabs = [
    { key: 'signup', label: 'Create account' },
    { key: 'signin', label: 'Sign in' },
  ]

  return (
    <div className="min-h-screen bg-parchment-100 flex">
      {/* LEFT — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-forest-500 relative overflow-hidden flex-col justify-between p-14">
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl text-white">Folio</span>
            <span className="text-[9px] font-bold tracking-[2px] text-forest-200 uppercase mt-1">CV Builder</span>
          </Link>
        </div>

        {/* Feature cards — static, no animation */}
        <div className="relative z-10 space-y-4">
          {[
            { title: 'Fit score 87/100', sub: 'Strong match — apply with confidence', icon: '◈' },
            { title: 'Company research', sub: 'Stripe raised $600M — expand into APAC payments', icon: '🔍' },
            { title: 'Keyword gap found', sub: '"API-first" and "payment infrastructure" missing', icon: '🔑' },
          ].map((c) => (
            <div
              key={c.title}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{c.icon}</span>
                <div>
                  <div className="text-white font-semibold text-sm">{c.title}</div>
                  <div className="text-forest-200 text-xs mt-0.5">{c.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-forest-200 text-sm">
          Land your next role 47% faster with AI-powered applications.
        </div>

        {/* Background shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 bg-forest-400 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-20 left-10 w-48 h-48 bg-forest-600 rounded-full blur-3xl opacity-50" />
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo on mobile */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <span className="font-serif text-xl text-gray-900">Folio</span>
            <span className="text-[9px] font-bold tracking-[2px] text-forest-600 uppercase mt-1">CV Builder</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-card border border-parchment-300 p-8">
            {/* Tabs */}
            {mode !== 'reset' && (
              <div className="flex border-b border-parchment-300 mb-7 -mx-8 px-8">
                {tabs.map(t => (
                  <button
                    key={t.key}
                    onClick={() => { setMode(t.key as any); setError(''); setSuccess('') }}
                    className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${mode === t.key
                      ? 'border-forest-500 text-forest-600'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {mode === 'reset' && (
              <div className="mb-6">
                <h2 className="font-serif text-2xl text-gray-900 mb-1">Reset password</h2>
                <p className="text-sm text-gray-400">We&apos;ll send a reset link to your email.</p>
              </div>
            )}

            {(success || error) && (
              <div className={`mb-5 rounded-xl px-4 py-3 text-sm ${success
                ? 'bg-forest-50 border border-forest-200 text-forest-700'
                : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {success || error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Jane Smith"
                    className="w-full bg-parchment-100 border border-parchment-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-forest-400 placeholder-gray-400"
                  />
                </div>
              )}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@email.com"
                  className="w-full bg-parchment-100 border border-parchment-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-forest-400 placeholder-gray-400"
                />
              </div>
              {mode !== 'reset' && (
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="8+ characters"
                      minLength={8}
                      className="w-full bg-parchment-100 border border-parchment-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-forest-400 placeholder-gray-400 pr-10"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-forest-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-forest-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'signup' ? 'Create free account' : mode === 'signin' ? 'Sign in' : 'Send reset link'}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {mode !== 'reset' && (
              <>
                <div className="my-5 flex items-center gap-3">
                  <div className="flex-1 h-px bg-parchment-300" />
                  <span className="text-xs text-gray-400">or</span>
                  <div className="flex-1 h-px bg-parchment-300" />
                </div>
                <button
                  onClick={googleAuth}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-parchment-300 rounded-xl py-2.5 text-sm font-medium hover:border-parchment-400 hover:bg-parchment-50 transition-colors"
                >
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
              <button onClick={() => { setMode('reset'); setError(''); setSuccess('') }} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-4 transition-colors">
                Forgot your password?
              </button>
            )}
            {mode === 'reset' && (
              <button onClick={() => { setMode('signin'); setError(''); setSuccess('') }} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-4 transition-colors">
                ← Back to sign in
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-gray-600">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}
