'use client';

import { useApp } from '@/app/components/providers/AppProvider';
import HomeView from './HomeView';
import CategoryView from './CategoryView';
import ProductView from './ProductView';
import CartView from './CartView';
import {
  CheckoutShippingView,
  CheckoutReviewView,
  CheckoutConfirmView,
} from './CheckoutViews';
import { LoginView, RegisterView } from './AuthViews';
import AccountView from './AccountView';

export default function ViewShell() {
  const { view } = useApp();

  const views: Record<string, React.ReactNode> = {
    home: <HomeView />,
    category: <CategoryView />,
    product: <ProductView />,
    cart: <CartView />,
    'checkout-shipping': <CheckoutShippingView />,
    'checkout-review': <CheckoutReviewView />,
    'checkout-confirm': <CheckoutConfirmView />,
    login: <LoginView />,
    register: <RegisterView />,
    account: <AccountView />,
  };

  return (
    <main>
      <div key={view} className="view-enter">
        {views[view] ?? <HomeView />}
      </div>
    </main>
  );
}
