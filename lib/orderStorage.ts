/**
 * Client-side order history storage — localStorage.
 * Stores a lightweight list of the user's orders for the "my orders" view.
 * The authoritative payment status always comes from the server (/api/payhere/status/[orderId]).
 */

export interface LocalOrder {
  orderId: string;
  total: number;
  currency: string;
  status: string;     // last known status (may be stale — always re-verify from server)
  createdAt: string;
  itemCount: number;
}

const KEY = 'vertex_orders';

export function loadOrders(): LocalOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as LocalOrder[];
  } catch {}
  return [];
}

export function saveOrderLocally(order: LocalOrder): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadOrders();
    // Replace if already exists, otherwise prepend
    const idx = existing.findIndex((o) => o.orderId === order.orderId);
    if (idx >= 0) {
      existing[idx] = order;
    } else {
      existing.unshift(order);
    }
    localStorage.setItem(KEY, JSON.stringify(existing));
  } catch {}
}

export function clearOrders(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
