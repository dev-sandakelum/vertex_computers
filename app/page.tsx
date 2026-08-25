import { AppProvider } from '@/app/components/providers/AppProvider';
// Desktop chrome
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';
import Drawers from '@/app/components/layout/Drawers';
// Mobile chrome
import MobileTopBar from '@/app/components/layout/MobileTopBar';
import BottomNav from '@/app/components/layout/BottomNav';
import SearchSheet from '@/app/components/layout/SearchSheet';
import MobileSheets from '@/app/components/layout/MobileSheets';
import MobileFooter from '@/app/components/layout/MobileFooter';
// Shared
import ViewShell from '@/app/components/views/ViewShell';
import SvgDefs from '@/app/components/ui/SvgDefs';
import Toast from '@/app/components/ui/Toast';

export default function Page() {
  return (
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

      {/* ── Views ── */}
      <ViewShell />

      {/* ── Footers ── */}
      <Footer />       {/* desktop */}
      <MobileFooter /> {/* mobile */}

      <Toast />
    </AppProvider>
  );
}
