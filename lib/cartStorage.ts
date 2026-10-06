/**
 * Simple localStorage helpers for cart persistence.
 * Cart survives page navigation and refresh.
 */

import type { CartItem } from './store';

const KEY = 'vertex_cart';

export function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultCart();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as CartItem[];
  } catch {}
  return defaultCart();
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(cart));
  } catch {}
}

export function clearCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

/** Start with an empty cart */
function defaultCart(): CartItem[] {
  return [];
}
