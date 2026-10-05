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
import {
  clearAuthSession,
  loadAuthProfile,
  loadAuthSession,
  saveAuthProfile,
  saveAuthSession,
  toPublicAuthUser,
  type PublicAuthUser,
  type StoredAuthProfile,
} from '@/lib/authStorage';

/* ─── State ─────────────────────────────────────────────────── */
interface AppState {
  cart: CartItem[];
  theme: 'light' | 'dark';
  authUser: PublicAuthUser | null;
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
  | { type: 'SET_AUTH_USER'; user: PublicAuthUser | null }
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
interface AppContextValue extends AppState {
  toggleTheme: () => void;
  signIn: (credentials: AuthCredentials) => AuthResult;
  register: (input: AuthRegistrationInput) => AuthResult;
  updateProfile: (input: AuthUpdateInput) => AuthResult;
  signOut: () => void;
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

interface AuthCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface AuthRegistrationInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  rememberMe: boolean;
  acceptedTerms: boolean;
}

interface AuthUpdateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AuthResult {
  ok: boolean;
  message: string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitial);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Sync theme to <html data-theme> */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  /* Hydrate cart from localStorage after mount (avoids SSR mismatch) */
  useEffect(() => {
    const saved = loadCart();
    if (saved.length > 0) {
      saved.forEach(({ id, q }) => dispatch({ type: 'ADD_TO_CART', id, q }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Persist cart to localStorage on every change */
  useEffect(() => {
    saveCart(state.cart);
  }, [state.cart]);

  /* Hydrate auth from localStorage after mount */
  useEffect(() => {
    const profile = loadAuthProfile();
    const sessionEmail = loadAuthSession();

    if (sessionEmail && profile.email.trim().toLowerCase() === sessionEmail.trim().toLowerCase()) {
      dispatch({ type: 'SET_AUTH_USER', user: toPublicAuthUser(profile) });
    } else {
      clearAuthSession();
      dispatch({ type: 'SET_AUTH_USER', user: null });
    }

    dispatch({ type: 'SET_AUTH_READY', ready: true });
  }, []);

  const toggleTheme = useCallback(() => {
    dispatch({ type: 'SET_THEME', theme: state.theme === 'dark' ? 'light' : 'dark' });
  }, [state.theme]);

  const signIn = useCallback((credentials: AuthCredentials): AuthResult => {
    const profile = loadAuthProfile();
    const email = credentials.email.trim().toLowerCase();
    const storedEmail = profile.email.trim().toLowerCase();

    if (!credentials.email.trim() || !credentials.password.trim()) {
      return { ok: false, message: 'Enter your email and password.' };
    }

    if (email !== storedEmail || credentials.password !== profile.password) {
      return { ok: false, message: 'Invalid email or password.' };
    }

    saveAuthSession(profile.email);
    dispatch({ type: 'SET_AUTH_USER', user: toPublicAuthUser(profile) });
    return { ok: true, message: `Welcome back, ${profile.firstName}.` };
  }, []);

  const register = useCallback((input: AuthRegistrationInput): AuthResult => {
    const profile: StoredAuthProfile = {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      password: input.password,
      rememberMe: input.rememberMe,
      acceptedTerms: input.acceptedTerms,
      createdAt: new Date().toISOString(),
    };

    saveAuthProfile(profile);
    saveAuthSession(profile.email);
    dispatch({ type: 'SET_AUTH_USER', user: toPublicAuthUser(profile) });
    return { ok: true, message: `Account created for ${profile.firstName}.` };
  }, []);

  const updateProfile = useCallback((input: AuthUpdateInput): AuthResult => {
    const profile = loadAuthProfile();
    const currentEmail = state.authUser?.email.trim().toLowerCase();

    if (!currentEmail || profile.email.trim().toLowerCase() !== currentEmail) {
      return { ok: false, message: 'No signed-in account is available.' };
    }

    const nextProfile: StoredAuthProfile = {
      ...profile,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
    };

    saveAuthProfile(nextProfile);
    saveAuthSession(nextProfile.email);
    dispatch({ type: 'SET_AUTH_USER', user: toPublicAuthUser(nextProfile) });
    return { ok: true, message: 'Profile updated.' };
  }, [state.authUser?.email]);

  const signOut = useCallback(() => {
    clearAuthSession();
    dispatch({ type: 'SET_AUTH_USER', user: null });
  }, []);

  const addToCart = useCallback((id: number, q: number) => {
    dispatch({ type: 'ADD_TO_CART', id, q });
    dispatch({ type: 'OPEN_CART_DRAWER' });
  }, []);

  const changeQty = useCallback((index: number, delta: number) => {
    dispatch({ type: 'CHANGE_QTY', index, delta });
  }, []);

  const removeItem = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_ITEM', index });
  }, []);

  const removeItems = useCallback((indices: number[]) => {
    dispatch({ type: 'REMOVE_ITEMS', indices });
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
  const toggleCartDrawer   = useCallback(() => dispatch({ type: 'TOGGLE_CART_DRAWER' }), []);
  const closeCartDrawer    = useCallback(() => dispatch({ type: 'CLOSE_CART_DRAWER' }), []);
  const closeDrawers       = useCallback(() => dispatch({ type: 'CLOSE_DRAWERS' }), []);
  const setSearchOpen      = useCallback((open: boolean) => dispatch({ type: 'SET_SEARCH', open }), []);

  /* Derived cart values */
  const cartCount = state.cart.reduce((s, c) => s + c.q, 0);
  const cartSubtotal = state.cart.reduce((s, c) => {
    const prod = PRODUCTS.find(p => p.id === c.id);
    return s + (prod ? prod.price * c.q : 0);
  }, 0);
  const cartTax   = cartSubtotal * 0.0725;
  const cartTotal = cartSubtotal + cartTax;
  const accountHref  = state.authUser ? '/account' : '/account/login';
  const accountLabel = state.authUser ? `Account for ${state.authUser.fullName}` : 'Sign in to your account';

  return (
    <AppContext.Provider value={{
      ...state,
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
