'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { CartItem } from '@/lib/store';
import { PRODUCTS } from '@/lib/data';
import { loadCart, saveCart } from '@/lib/cartStorage';

/* ─── State ─────────────────────────────────────────────────── */
interface AppState {
  cart: CartItem[];
  theme: 'light' | 'dark';
  toast: string;
  toastVisible: boolean;
  mobileDrawerOpen: boolean;
  filterDrawerOpen: boolean;
  searchOpen: boolean;
}

function makeInitial(): AppState {
  return {
    cart: loadCart(),
    theme: 'light',
    toast: '',
    toastVisible: false,
    mobileDrawerOpen: false,
    filterDrawerOpen: false,
    searchOpen: false,
  };
}

/* ─── Actions ───────────────────────────────────────────────── */
type Action =
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }
  | { type: 'ADD_TO_CART'; id: number; q: number }
  | { type: 'CHANGE_QTY'; index: number; delta: number }
  | { type: 'REMOVE_ITEM'; index: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SHOW_TOAST'; msg: string }
  | { type: 'HIDE_TOAST' }
  | { type: 'TOGGLE_MOBILE_DRAWER' }
  | { type: 'TOGGLE_FILTER_DRAWER' }
  | { type: 'CLOSE_DRAWERS' }
  | { type: 'SET_SEARCH'; open: boolean };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    case 'ADD_TO_CART': {
      const existing = state.cart.find((c) => c.id === action.id);
      const cart = existing
        ? state.cart.map((c) => c.id === action.id ? { ...c, q: c.q + action.q } : c)
        : [...state.cart, { id: action.id, q: action.q }];
      return { ...state, cart };
    }
    case 'CHANGE_QTY':
      return {
        ...state,
        cart: state.cart.map((c, i) =>
          i === action.index ? { ...c, q: Math.max(1, c.q + action.delta) } : c
        ),
      };
    case 'REMOVE_ITEM':
      return { ...state, cart: state.cart.filter((_, i) => i !== action.index) };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'SHOW_TOAST':
      return { ...state, toast: action.msg, toastVisible: true };
    case 'HIDE_TOAST':
      return { ...state, toastVisible: false };
    case 'TOGGLE_MOBILE_DRAWER':
      return { ...state, mobileDrawerOpen: !state.mobileDrawerOpen, filterDrawerOpen: false, searchOpen: false };
    case 'TOGGLE_FILTER_DRAWER':
      return { ...state, filterDrawerOpen: !state.filterDrawerOpen, mobileDrawerOpen: false, searchOpen: false };
    case 'CLOSE_DRAWERS':
      return { ...state, mobileDrawerOpen: false, filterDrawerOpen: false };
    case 'SET_SEARCH':
      return { ...state, searchOpen: action.open, mobileDrawerOpen: false, filterDrawerOpen: false };
    default:
      return state;
  }
}

/* ─── Context value ─────────────────────────────────────────── */
interface AppContextValue extends AppState {
  toggleTheme: () => void;
  addToCart: (id: number, q: number) => void;
  changeQty: (index: number, delta: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  showToast: (msg: string) => void;
  toggleMobileDrawer: () => void;
  toggleFilterDrawer: () => void;
  closeDrawers: () => void;
  setSearchOpen: (open: boolean) => void;
  cartCount: number;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitial);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Sync theme to <html data-theme> */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  /* Persist cart to localStorage on every change */
  useEffect(() => {
    saveCart(state.cart);
  }, [state.cart]);

  const toggleTheme = useCallback(() => {
    dispatch({ type: 'SET_THEME', theme: state.theme === 'dark' ? 'light' : 'dark' });
  }, [state.theme]);

  const addToCart = useCallback((id: number, q: number) => {
    dispatch({ type: 'ADD_TO_CART', id, q });
  }, []);

  const changeQty = useCallback((index: number, delta: number) => {
    dispatch({ type: 'CHANGE_QTY', index, delta });
  }, []);

  const removeItem = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_ITEM', index });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const showToast = useCallback((msg: string) => {
    dispatch({ type: 'SHOW_TOAST', msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2400);
  }, []);

  const toggleMobileDrawer = useCallback(() => dispatch({ type: 'TOGGLE_MOBILE_DRAWER' }), []);
  const toggleFilterDrawer = useCallback(() => dispatch({ type: 'TOGGLE_FILTER_DRAWER' }), []);
  const closeDrawers = useCallback(() => dispatch({ type: 'CLOSE_DRAWERS' }), []);
  const setSearchOpen = useCallback((open: boolean) => dispatch({ type: 'SET_SEARCH', open }), []);

  /* Derived cart values */
  const cartCount = state.cart.reduce((s, c) => s + c.q, 0);
  const cartSubtotal = state.cart.reduce((s, c) => {
    const prod = PRODUCTS.find(p => p.id === c.id);
    return s + (prod ? prod.price * c.q : 0);
  }, 0);
  const cartTax = cartSubtotal * 0.0725;
  const cartTotal = cartSubtotal + cartTax;

  return (
    <AppContext.Provider value={{
      ...state,
      toggleTheme,
      addToCart,
      changeQty,
      removeItem,
      clearCart,
      showToast,
      toggleMobileDrawer,
      toggleFilterDrawer,
      closeDrawers,
      setSearchOpen,
      cartCount,
      cartSubtotal,
      cartTax,
      cartTotal,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
