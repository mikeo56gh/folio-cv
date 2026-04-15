import type { Metadata } from 'next'
import { Nunito, Nunito_Sans, DM_Serif_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

// Nunito Sans — clean, modern, rounded. Very readable at all sizes.
const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

// DM Serif Display — beautiful editorial serif for headlines
const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${nunitoSans.variable} ${dmSerif.variable}`}
    >
      <head />
      <body className={nunitoSans.className}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '14px',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            },
          }}
        />
      </body>
    </html>
  )
}
