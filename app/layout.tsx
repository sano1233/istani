import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Istani Fitness - Transform Your Body, Transform Your Life',
  description: 'Complete fitness platform with personalized coaching, workout tracking, nutrition guidance, and AI-powered progress analysis. Better than MyFitnessPal.',
  keywords: ['fitness', 'workout', 'nutrition', 'coaching', 'health', 'wellness', 'muscle gain', 'weight loss'],
  authors: [{ name: 'Istani Fitness', email: 'istaniDOTstore@proton.me' }],
  openGraph: {
    title: 'Istani Fitness - Transform Your Body, Transform Your Life',
    description: 'Complete fitness platform with personalized coaching and AI-powered progress tracking',
    url: 'https://istani.org',
    siteName: 'Istani Fitness',
    images: [
      {
        url: 'https://istani.org/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Istani Fitness Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Istani Fitness',
    description: 'Transform Your Body, Transform Your Life',
    images: ['https://istani.org/og-image.jpg'],
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
