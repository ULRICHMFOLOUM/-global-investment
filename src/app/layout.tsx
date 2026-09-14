import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from 'react-hot-toast'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import ServiceWorkerRegistrar from '@/components/ui/ServiceWorkerRegistrar'
import PWAInstallButton from '@/components/ui/PWAInstallButton'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#D4A217',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Global Investment Africa | Investissez et Gagnez',
  description: 'Plateforme d\'investissement N°1 en Afrique. Investissez avec Orange Money, MTN Mobile Money et gagnez des revenus quotidiens.',
  keywords: 'investissement, afrique, mobile money, orange money, mtn, revenus passifs, fapshi',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GlobalInvest',
    startupImage: '/apple-touch-icon.png',
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icon-192.png',
  },
  openGraph: {
    title: 'Global Investment Africa',
    description: 'Investissez et gagnez des revenus quotidiens en Afrique via Mobile Money.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Global Investment Africa',
    images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'Global Investment Africa' }],
  },
  twitter: {
    card: 'summary',
    title: 'Global Investment Africa',
    description: 'Plateforme d\'investissement N°1 en Afrique.',
    images: ['/icon-512.png'],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#D4A217',
    'msapplication-TileImage': '/icon-192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <WhatsAppButton />
            {/* PWA Banner (bottom of screen) */}
            <PWAInstallButton variant="banner" />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(15, 23, 42, 0.95)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: '600',
                },
                success: {
                  iconTheme: { primary: '#10b981', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
        {/* PWA Service Worker */}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
