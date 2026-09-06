import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from 'react-hot-toast'
import WhatsAppButton from '@/components/ui/WhatsAppButton'

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

export const metadata: Metadata = {
  title: 'Global Investment Africa | Investissez et Gagnez',
  description: 'Plateforme d\'investissement N°1 en Afrique. Investissez avec Orange Money, MTN Mobile Money et gagnez des revenus quotidiens.',
  keywords: 'investissement, afrique, mobile money, orange money, mtn, revenus passifs, fapshi',
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
      </body>
    </html>
  )
}
