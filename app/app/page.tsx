import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import AppShell from './AppShell'

export const metadata = {
  title: 'Folio — Your CV Builder',
}

async function getSession() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export default async function AppPage() {
  const session = await getSession()
  if (!session) redirect('/auth')

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-parchment-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-forest-300 border-t-forest-600 rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading Folio…</span>
        </div>
      </div>
    }>
      <AppShell session={session} />
    </Suspense>
  )
}
