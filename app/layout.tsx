import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Vertex Computers — PC Parts & Components', template: '%s | Vertex Computers' },
  description: 'Premium PC components for builders, gamers, and businesses. Build with confidence.',
  openGraph: { siteName: 'Vertex Computers', type: 'website' },
};

/**
 * Bare root layout — only provides <html> and <body>.
 * Chrome (header/footer) is added by (main)/layout.tsx.
 * Auth pages use (auth)/layout.tsx — no nav chrome.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
