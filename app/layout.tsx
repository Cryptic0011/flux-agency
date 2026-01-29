import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import ScrollToTop from '@/components/ScrollToTop'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://fluxstudio.dev'),
  title: {
    default: 'FLUX | High-Performance Web & Automation Studio',
    template: '%s | FLUX',
  },
  description:
    'Web agency specializing in high-speed Next.js websites, SEO, and custom business automation for modern brands.',
  keywords: [
    'web development',
    'Next.js agency',
    'web automation',
    'SEO optimization',
    'business automation',
    'custom web apps',
    'high-performance websites',
    'Vercel deployment',
    'React development',
    'TypeScript',
  ],
  authors: [{ name: 'FLUX Studio' }],
  creator: 'FLUX Studio',
  publisher: 'FLUX Studio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fluxstudio.dev',
    siteName: 'FLUX Studio',
    title: 'FLUX | High-Performance Web & Automation Studio',
    description:
      'Web agency specializing in high-speed Next.js websites, SEO, and custom business automation for modern brands.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FLUX - High-Performance Web & Automation Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FLUX | High-Performance Web & Automation Studio',
    description:
      'Web agency specializing in high-speed Next.js websites, SEO, and custom business automation for modern brands.',
    images: ['/images/og-image.png'],
    creator: '@fluxstudio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <ScrollToTop />
        {children}
      </body>
    </html>
  )
}
