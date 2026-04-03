import type { Metadata, Viewport } from 'next'
import { Outfit, Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import ScrollToTop from '@/components/ScrollToTop'
import { ThemeProvider } from '@/components/ThemeProvider'
import { createClient } from '@/lib/supabase/server'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
})

export const metadata: Metadata = {
  title: 'MW Content Studio | Direct Creator Orders',
  description: 'Hand-picked brand orders delivered directly to creators.',
  metadataBase: new URL('https://mwcontentstudio.com'),
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MW Content Studio',
  },
  openGraph: {
    title: 'MW Content Studio | Direct Creator Orders',
    description: 'Hand-picked brand orders delivered directly to creators.',
    url: 'https://mwcontentstudio.com',
    siteName: 'MW Content Studio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MW Content Studio Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MW Content Studio | Direct Creator Orders',
    description: 'Hand-picked brand orders delivered directly to creators.',
    images: ['/og-image.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#030712',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en" className={`${outfit.variable} ${bricolage.variable}`} suppressHydrationWarning>
      {/* Inline script runs before paint to prevent flash of wrong theme */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased bg-gray-950 text-gray-100 font-body">
        <ThemeProvider>
          {children}
          <ScrollToTop isGuest={!user} />
        </ThemeProvider>
      </body>
    </html>
  )
}
