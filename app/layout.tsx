import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Istani Fitness - Transform Your Body',
  description: 'Science-backed fitness programs and premium supplements',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body className="font-display">{children}</body>
    </html>
  )
}
