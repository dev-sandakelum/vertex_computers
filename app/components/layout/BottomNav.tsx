'use client';

import { useApp } from '@/app/components/providers/AppProvider';

type TabKey = 'home' | 'category' | 'cart' | 'account';

const TAB_MAP: Record<string, TabKey> = {
  home: 'home',
  category: 'category',
  product: 'category',
  cart: 'cart',
  'checkout-shipping': 'cart',
  'checkout-review': 'cart',
  'checkout-confirm': 'cart',
  login: 'account',
  register: 'account',
  account: 'account',
};

export default function BottomNav() {
  const { view, cartCount, setView } = useApp();
  const activeTab = TAB_MAP[view] ?? 'home';

  return (
    <nav className="bottomnav" aria-label="Main navigation">
      {/* Home */}
      <button
        className={activeTab === 'home' ? 'on' : ''}
        onClick={() => setView('home')}
        aria-label="Home"
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/>
        </svg>
        Home
      </button>

      {/* Shop */}
      <button
        className={activeTab === 'category' ? 'on' : ''}
        onClick={() => setView('category')}
        aria-label="Shop"
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
        Shop
      </button>

      {/* Cart */}
      <button
        className={activeTab === 'cart' ? 'on' : ''}
        onClick={() => setView('cart')}
        aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
        style={{ position: 'relative' }}
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="20" r="1.6"/>
          <circle cx="17" cy="20" r="1.6"/>
          <path d="M2 3h3l2.6 12.5a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/>
        </svg>
        Cart
        {cartCount > 0 && <span className="nc">{cartCount}</span>}
      </button>

      {/* Account */}
      <button
        className={activeTab === 'account' ? 'on' : ''}
        onClick={() => setView('login')}
        aria-label="Account"
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 21c1.5-4 5-5.5 8-5.5S18.5 17 20 21"/>
        </svg>
        Account
      </button>
    </nav>
  );
}
