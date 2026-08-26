import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'Vertex Computers — PC Parts & Components', template: '%s | Vertex Computers' },
  description: 'Premium PC components for builders, gamers, and businesses. Build with confidence.',
  openGraph: { siteName: 'Vertex Computers', type: 'website' },
};

/**
 * Bare root layout — only provides <html> and <body>.
 * Chrome (header/footer) is added by (main)/layout.tsx.
 * Auth pages use (auth)/layout.tsx which has no chrome.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
