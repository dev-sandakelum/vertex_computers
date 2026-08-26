import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { AppProvider } from '@/app/components/providers/AppProvider';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';
import Drawers from '@/app/components/layout/Drawers';
import MobileTopBar from '@/app/components/layout/MobileTopBar';
import BottomNav from '@/app/components/layout/BottomNav';
import SearchSheet from '@/app/components/layout/SearchSheet';
import MobileSheets from '@/app/components/layout/MobileSheets';
import MobileFooter from '@/app/components/layout/MobileFooter';
import SvgDefs from '@/app/components/ui/SvgDefs';
import Toast from '@/app/components/ui/Toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: { default: 'Vertex Computers — PC Parts & Components', template: '%s | Vertex Computers' },
  description: 'Premium PC components for builders, gamers, and businesses. Build with confidence.',
  openGraph: {
    siteName: 'Vertex Computers',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProvider>
          <SvgDefs />

          {/* ── Desktop chrome (hidden ≤640px via CSS) ── */}
          <Header />
          <Drawers />

          {/* ── Mobile chrome (hidden >640px via CSS) ── */}
          <MobileTopBar />
          <SearchSheet />
          <MobileSheets />
          <BottomNav />

          {/* ── Page content ── */}
          {children}

          {/* ── Footers ── */}
          <Footer />
          <MobileFooter />

          <Toast />
        </AppProvider>
      </body>
    </html>
  );
}
