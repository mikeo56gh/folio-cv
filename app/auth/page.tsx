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
      <div className="hidden lg:flex lg:w-1/2 bg-forest-500 relative overfl
