import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Istani Fitness - Enterprise AI Fitness Platform | 100% Free",
  description: "Get personalized workout plans, meal plans, and fitness coaching powered by free multi-agent AI. Track your progress and achieve your fitness goals with Istani Fitness. 4 specialized AI agents working together for optimal results.",
  keywords: "fitness, workout plans, meal plans, AI fitness, free fitness app, TDEE calculator, BMI calculator, fitness tracker, multi-agent AI, autonomous fitness, enterprise fitness platform",
  authors: [{ name: "Istani", url: "https://istani.store" }],
  metadataBase: new URL('https://istani.store'),
  openGraph: {
    title: "Istani Fitness - Enterprise AI Fitness Platform",
    description: "Multi-agent AI system for personalized fitness plans. 100% FREE forever.",
    url: "https://istani.store",
    siteName: "Istani Fitness",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Istani Fitness - AI-Powered Fitness",
    description: "Get FREE personalized workout and meal plans from our multi-agent AI system",
  },
  other: {
    'google-adsense-account': process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT || '',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
