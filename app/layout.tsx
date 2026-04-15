import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Folio — AI-Powered CV Builder',
  description: 'ATS-optimised CVs, tailored cover letters, live company research, and honest fit reviews. Land your next role with Folio.',
  openGraph: {
    title: 'Folio — AI-Powered CV Builder',
    description: 'Land your next role with AI-tailored applications.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '12px',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  )
}
