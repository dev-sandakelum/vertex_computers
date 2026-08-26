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

/** Full-chrome layout for all main app pages */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <SvgDefs />
      <Header />
      <Drawers />
      <MobileTopBar />
      <SearchSheet />
      <MobileSheets />
      <BottomNav />
      {children}
      <Footer />
      <MobileFooter />
      <Toast />
    </AppProvider>
  );
}
