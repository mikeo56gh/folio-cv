import type { Metadata } from 'next'
import { DM_Sans, Instrument_Serif, DM_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

// Load fonts via next/font — bundled at build time, always available
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-dm-mono',
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
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${instrumentSerif.variable} ${dmMono.variable}`}>
      <head />
      <body className={dmSans.className}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '12px',
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  )
}
