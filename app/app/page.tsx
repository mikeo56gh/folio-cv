import { Suspense } from 'react'
import AppShell from './AppShell'

export const metadata = {
  title: 'Folio — Your CV Builder',
}

export default function AppPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-parchment-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-forest-300 border-t-forest-600 rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading Folio…</span>
        </div>
      </div>
    }>
      <AppShell />
    </Suspense>
  )
}
