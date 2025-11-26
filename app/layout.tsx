import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://istani.org'),
  title: 'ISTANI - Evidence-Based Fitness Training & Premium Supplements',
  description:
    'Transform your fitness with science-backed training programs, premium supplements, and advanced progress tracking. Join thousands achieving real results with evidence-based nutrition and workout plans.',
  keywords: [
    'fitness',
    'training',
    'supplements',
    'nutrition',
    'workout plans',
    'evidence-based',
    'muscle building',
    'strength training',
    'hypertrophy',
    'sports nutrition',
  ],
  authors: [{ name: 'ISTANI' }],
  openGraph: {
    title: 'ISTANI - Evidence-Based Fitness Training',
    description:
      'Science-backed training programs and premium supplements for real fitness results',
    url: 'https://istani.org',
    siteName: 'ISTANI',
    images: [
      {
        url: '/logo.svg',
        width: 200,
        height: 200,
        alt: 'ISTANI Fitness',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ISTANI - Evidence-Based Fitness',
    description: 'Science-backed training and premium supplements',
    images: ['/logo.svg'],
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
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://istani.org" />
        <meta name="google-adsense-account" content="ca-pub-2695159317297870" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2695159317297870"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
