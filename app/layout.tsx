import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Istani Fitness - Evidence-Based Training & Nutrition | Science-Backed Programs',
  description: 'Transform your fitness with science-backed training programs, nutrition plans, and recovery protocols. Expert guidance backed by peer-reviewed research for optimal results.',
  keywords: 'fitness training, strength training, nutrition science, workout programs, muscle building, fat loss, evidence-based fitness, sports science',
  authors: [{ name: 'Istani Fitness Enterprises' }],
  openGraph: {
    title: 'Istani Fitness - Evidence-Based Training Programs',
    description: 'Science-backed fitness training and nutrition for optimal results',
    url: 'https://istani.org',
    siteName: 'Istani Fitness',
    images: [{
      url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=630&fit=crop',
      width: 1200,
      height: 630,
      alt: 'Istani Fitness Training'
    }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Istani Fitness - Evidence-Based Training',
    description: 'Science-backed fitness programs for real results',
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=630&fit=crop'],
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
  verification: {
    google: 'google09fb6384e727b88f',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://istani.org" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className={inter.className}>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2695159317297870"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'HealthAndBeautyBusiness',
              'name': 'Istani Fitness Enterprises',
              'description': 'Evidence-based fitness training and nutrition programs',
              'url': 'https://istani.org',
              'sameAs': ['https://github.com/sano1233/istani']
            })
          }}
        />
        {children}
      </body>
    </html>
  )
}
