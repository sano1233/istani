import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Istani Autonomous AI Platform',
  description: 'Production-ready AI security and API orchestration platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
