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
import type { Product } from '@/lib/data';
import { PRODUCTS } from '@/lib/data';
import { loadCart, saveCart } from '@/lib/cartStorage';

/* ─── Auth user shape (returned from /api/auth/me) ──────────── */
export interface AuthUser {
  userId:    string;
  firstName: string;
  lastName:  string;
  fullName:  string;
  initials:  string;
  email:     string;
  phone:     string;
  role:      string;
  createdAt: string;
}

function toAuthUser(raw: Record<string, unknown>): AuthUser {
  const f = String(raw.firstName ?? '');
  const l = String(raw.lastName ?? '');
  return {
    userId:    String(raw.userId ?? raw._id ?? ''),
    firstName: f,
    lastName:  l,
    fullName:  `${f} ${l}`.trim(),
    initials:  `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || 'U',
    email:     String(raw.email ?? ''),
    phone:     String(raw.phone ?? ''),
    role:      String(raw.role ?? 'user'),
    createdAt: String(raw.createdAt ?? ''),
  };
}

/* ─── State ─────────────────────────────────────────────────── */
interface AppState {
  cart: CartItem[];
  theme: 'light' | 'dark';
  authUser: AuthUser | null;
  authReady: boolean;
  toast: string;
  toastVisible: boolean;
  mobileDrawerOpen: boolean;
  filterDrawerOpen: boolean;
  cartDrawerOpen: boolean;
  searchOpen: boolean;
}

function makeInitial(): AppState {
  return {
    cart: [],
    theme: 'light',
    authUser: null,
    authReady: false,
    toast: '',
    toastVisible: false,
    mobileDrawerOpen: false,
    filterDrawerOpen: false,
    cartDrawerOpen: false,
    searchOpen: false,
  };
}

/* ─── Actions ───────────────────────────────────────────────── */
type Action =
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }
  | { type: 'SET_AUTH_USER'; user: AuthUser | null }
  | { type: 'SET_AUTH_READY'; ready: boolean }
  | { type: 'ADD_TO_CART'; id: number; q: number }
  | { type: 'CHANGE_QTY'; index: number; delta: number }
  | { type: 'REMOVE_ITEM'; index: number }
  | { type: 'REMOVE_ITEMS'; indices: number[] }
  | { type: 'CLEAR_CART' }
  | { type: 'SHOW_TOAST'; msg: string }
  | { type: 'HIDE_TOAST' }
  | { type: 'TOGGLE_MOBILE_DRAWER' }
  | { type: 'TOGGLE_FILTER_DRAWER' }
  | { type: 'TOGGLE_CART_DRAWER' }
  | { type: 'OPEN_CART_DRAWER' }
  | { type: 'CLOSE_CART_DRAWER' }
  | { type: 'CLOSE_DRAWERS' }
  | { type: 'SET_SEARCH'; open: boolean };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    case 'SET_AUTH_USER':
      return { ...state, authUser: action.user };
    case 'SET_AUTH_READY':
      return { ...state, authReady: action.ready };
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
    case 'REMOVE_ITEMS': {
      const set = new Set(action.indices);
      return { ...state, cart: state.cart.filter((_, i) => !set.has(i)) };
    }
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'SHOW_TOAST':
      return { ...state, toast: action.msg, toastVisible: true };
    case 'HIDE_TOAST':
      return { ...state, toastVisible: false };
    case 'TOGGLE_MOBILE_DRAWER':
      return { ...state, mobileDrawerOpen: !state.mobileDrawerOpen, filterDrawerOpen: false, cartDrawerOpen: false, searchOpen: false };
    case 'TOGGLE_FILTER_DRAWER':
      return { ...state, filterDrawerOpen: !state.filterDrawerOpen, mobileDrawerOpen: false, cartDrawerOpen: false, searchOpen: false };
    case 'TOGGLE_CART_DRAWER':
      return { ...state, cartDrawerOpen: !state.cartDrawerOpen, mobileDrawerOpen: false, filterDrawerOpen: false, searchOpen: false };
    case 'OPEN_CART_DRAWER':
      return { ...state, cartDrawerOpen: true, mobileDrawerOpen: false, filterDrawerOpen: false, searchOpen: false };
    case 'CLOSE_CART_DRAWER':
      return { ...state, cartDrawerOpen: false };
    case 'CLOSE_DRAWERS':
      return { ...state, mobileDrawerOpen: false, filterDrawerOpen: false, cartDrawerOpen: false };
    case 'SET_SEARCH':
      return { ...state, searchOpen: action.open, mobileDrawerOpen: false, filterDrawerOpen: false, cartDrawerOpen: false };
    default:
      return state;
  }
}

/* ─── Context value ─────────────────────────────────────────── */
export interface AuthResult {
  ok: boolean;
  message: string;
}

interface AppContextValue extends AppState {
  products: Product[];
  toggleTheme: () => void;
  signIn: (credentials: { email: string; password: string }) => Promise<AuthResult>;
  register: (input: {
    firstName: string; lastName: string; email: string;
    phone: string; password: string; acceptedTerms: boolean;
  }) => Promise<AuthResult>;
  updateProfile: (input: { firstName: string; lastName: string; phone: string }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  addToCart: (id: number, q: number) => void;
  changeQty: (index: number, delta: number) => void;
  removeItem: (index: number) => void;
  removeItems: (indices: number[]) => void;
  clearCart: () => void;
  showToast: (msg: string) => void;
  toggleMobileDrawer: () => void;
  toggleFilterDrawer: () => void;
  toggleCartDrawer: () => void;
  closeCartDrawer: () => void;
  closeDrawers: () => void;
  setSearchOpen: (open: boolean) => void;
  cartCount: number;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  accountHref: string;
  accountLabel: string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children, products: productsProp }: { children: ReactNode; products?: Product[] }) {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitial);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const products = productsProp ?? PRODUCTS;

  /* Sync theme to <html data-theme> */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  /* Hydrate cart from localStorage */
  useEffect(() => {
    const saved = loadCart();
    if (saved.length > 0) {
      saved.forEach(({ id, q }) => dispatch({ type: 'ADD_TO_CART', id, q }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Persist cart */
  useEffect(() => {
    saveCart(state.cart);
  }, [state.cart]);

  /* Hydrate auth from server session on mount */
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          dispatch({ type: 'SET_AUTH_USER', user: toAuthUser(data.user as Record<string, unknown>) });
        }
      })
      .catch(() => {/* no session */})
      .finally(() => dispatch({ type: 'SET_AUTH_READY', ready: true }));
  }, []);

  const toggleTheme = useCallback(() => {
    dispatch({ type: 'SET_THEME', theme: state.theme === 'dark' ? 'light' : 'dark' });
  }, [state.theme]);

  const signIn = useCallback(async (credentials: { email: string; password: string }): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.error ?? 'Login failed.' };
      dispatch({ type: 'SET_AUTH_USER', user: toAuthUser(data.user as Record<string, unknown>) });
      return { ok: true, message: `Welcome back, ${(data.user as Record<string, unknown>).firstName}!` };
    } catch {
      return { ok: false, message: 'Network error. Please try again.' };
    }
  }, []);

  const register = useCallback(async (input: {
    firstName: string; lastName: string; email: string;
    phone: string; password: string; acceptedTerms: boolean;
  }): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.error ?? 'Registration failed.' };
      dispatch({ type: 'SET_AUTH_USER', user: toAuthUser(data.user as Record<string, unknown>) });
      return { ok: true, message: `Account created! Welcome, ${(data.user as Record<string, unknown>).firstName}!` };
    } catch {
      return { ok: false, message: 'Network error. Please try again.' };
    }
  }, []);

  const updateProfile = useCallback(async (input: { firstName: string; lastName: string; phone: string }): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.error ?? 'Update failed.' };
      dispatch({ type: 'SET_AUTH_USER', user: toAuthUser(data.user as Record<string, unknown>) });
      return { ok: true, message: 'Profile updated successfully.' };
    } catch {
      return { ok: false, message: 'Network error. Please try again.' };
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    dispatch({ type: 'SET_AUTH_USER', user: null });
  }, []);

  const addToCart = useCallback((id: number, q: number) => {
    dispatch({ type: 'ADD_TO_CART', id, q });
    dispatch({ type: 'OPEN_CART_DRAWER' });
  }, []);

  const changeQty    = useCallback((index: number, delta: number) => dispatch({ type: 'CHANGE_QTY', index, delta }), []);
  const removeItem   = useCallback((index: number) => dispatch({ type: 'REMOVE_ITEM', index }), []);
  const removeItems  = useCallback((indices: number[]) => dispatch({ type: 'REMOVE_ITEMS', indices }), []);
  const clearCart    = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);

  const showToast = useCallback((msg: string) => {
    dispatch({ type: 'SHOW_TOAST', msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
  }, []);

  const toggleMobileDrawer = useCallback(() => dispatch({ type: 'TOGGLE_MOBILE_DRAWER' }), []);
  const toggleFilterDrawer = useCallback(() => dispatch({ type: 'TOGGLE_FILTER_DRAWER' }), []);
  const toggleCartDrawer   = useCallback(() => dispatch({ type: 'TOGGLE_CART_DRAWER' }), []);
  const closeCartDrawer    = useCallback(() => dispatch({ type: 'CLOSE_CART_DRAWER' }), []);
  const closeDrawers       = useCallback(() => dispatch({ type: 'CLOSE_DRAWERS' }), []);
  const setSearchOpen      = useCallback((open: boolean) => dispatch({ type: 'SET_SEARCH', open }), []);

  const cartCount    = state.cart.reduce((s, c) => s + c.q, 0);
  const cartSubtotal = state.cart.reduce((s, c) => {
    const prod = products.find((p) => p.id === c.id);
    return s + (prod ? prod.price * c.q : 0);
  }, 0);
  const cartTax   = cartSubtotal * 0.0725;
  const cartTotal = cartSubtotal + cartTax;
  const accountHref  = state.authUser ? '/account' : '/account/login';
  const accountLabel = state.authUser ? `Account for ${state.authUser.fullName}` : 'Sign in to your account';

  return (
    <AppContext.Provider value={{
      ...state,
      products,
      signIn,
      register,
      updateProfile,
      signOut,
      toggleTheme,
      addToCart,
      changeQty,
      removeItem,
      removeItems,
      clearCart,
      showToast,
      toggleMobileDrawer,
      toggleFilterDrawer,
      toggleCartDrawer,
      closeCartDrawer,
      closeDrawers,
      setSearchOpen,
      cartCount,
      cartSubtotal,
      cartTax,
      cartTotal,
      accountHref,
      accountLabel,
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
