import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'ISTANI - Evidence Based Fitness',
  description:
    'Transform your body with proven, science-backed training programs. AI coaching, nutrition tracking, and personalized workout plans.',
  keywords: ['fitness', 'workout', 'nutrition', 'AI coaching', 'evidence-based', 'training'],
  authors: [{ name: 'ISTANI' }],
  openGraph: {
    title: 'ISTANI - Evidence Based Fitness',
    description: 'Transform your body with proven, science-backed training programs.',
    url: 'https://istani.org',
    siteName: 'ISTANI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ISTANI - Evidence Based Fitness',
    description: 'Transform your body with proven, science-backed training programs.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
