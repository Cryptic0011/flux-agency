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
  metadataBase: new URL('https://builtbyflux.com'),
  title: {
    default: 'FLUX | Web Design & SEO for Georgia Businesses | Canton, GA',
    template: '%s | FLUX',
  },
  description:
    'FLUX is a Georgia-based web design studio serving businesses across the state. Fast websites, SEO optimization, content management, and business automation. Based in Canton, serving Atlanta and all of GA.',
  keywords: [
    'web design Georgia',
    'web designer Canton GA',
    'website design Atlanta',
    'SEO optimization Georgia',
    'small business website GA',
    'business automation Georgia',
    'web development Canton',
    'local SEO Georgia',
    'website for contractors Georgia',
    'web design near me',
    'business website Atlanta',
    'content management Georgia',
  ],
  authors: [{ name: 'Flux Studio, LLC' }],
  creator: 'Flux Studio, LLC',
  publisher: 'Flux Studio, LLC',
  alternates: {
    canonical: '/',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://builtbyflux.com',
    siteName: 'Flux Studio, LLC',
    title: 'FLUX | Web Design & SEO for Georgia Businesses | Canton, GA',
    description:
      'Georgia-based web design studio. Fast websites, SEO, content management, and business automation for businesses across GA. Based in Canton, serving Atlanta and beyond.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FLUX - Web Design & SEO Studio in Canton, Georgia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FLUX | Web Design & SEO for Georgia Businesses | Canton, GA',
    description:
      'Georgia-based web design studio. Fast websites, SEO, content management, and business automation for businesses across GA.',
    images: ['/images/og-image.png'],
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

const jsonLdLocalBusiness = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Flux Studio, LLC',
  url: 'https://builtbyflux.com',
  logo: 'https://builtbyflux.com/images/logo.png',
  image: 'https://builtbyflux.com/images/og-image.png',
  description:
    'Georgia-based web design studio specializing in fast websites, SEO optimization, content management, and business automation for local businesses.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Canton',
    addressRegion: 'GA',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 34.2368,
    longitude: -84.4908,
  },
  areaServed: [
    {
      '@type': 'State',
      name: 'Georgia',
      sameAs: 'https://en.wikipedia.org/wiki/Georgia_(U.S._state)',
    },
    {
      '@type': 'City',
      name: 'Atlanta',
      sameAs: 'https://en.wikipedia.org/wiki/Atlanta',
    },
    {
      '@type': 'City',
      name: 'Canton',
      sameAs: 'https://en.wikipedia.org/wiki/Canton,_Georgia',
    },
  ],
  priceRange: '$$',
  sameAs: [],
}

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Flux Studio, LLC',
  url: 'https://builtbyflux.com',
}

const jsonLdServices = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Web Design and Development',
  provider: {
    '@type': 'Organization',
    name: 'Flux Studio, LLC',
    url: 'https://builtbyflux.com',
  },
  areaServed: {
    '@type': 'State',
    name: 'Georgia',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Web Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'High-Performance Websites',
          description: 'Fast, mobile-optimized websites built for local businesses that convert visitors into customers.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'SEO Optimization',
          description: 'Technical SEO, local SEO, structured data, and search engine optimization to help businesses rank higher.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Business Automation',
          description: 'Custom automation systems for invoicing, CRM integration, and workflow optimization.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Content Management',
          description: 'Easy-to-use CMS setup for managing galleries, blog posts, and business content.',
        },
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdServices) }}
        />
      </head>
      <body className="font-sans antialiased">
        <ScrollToTop />
        {children}
      </body>
    </html>
  )
}
