/**
 * Server-side in-memory order store.
 *
 * In the sandbox/dev environment this is an in-process Map that persists
 * for the lifetime of the Next.js server process.
 *
 * PRODUCTION NOTE: Replace this with a real database (Prisma/Drizzle + Postgres,
 * Supabase, PlanetScale, etc.) when going live.
 *
 * The Map is attached to `globalThis` so hot-reload (next dev) doesn't clear it.
 */

import type { Order, OrderStatus } from './payhere/types';

declare global {
  // eslint-disable-next-line no-var
  var __orderStore: Map<string, Order> | undefined;
}

function getStore(): Map<string, Order> {
  if (!globalThis.__orderStore) {
    globalThis.__orderStore = new Map<string, Order>();
  }
  return globalThis.__orderStore;
}

/** Persist a new order (or overwrite an existing one). */
export function saveOrder(order: Order): void {
  getStore().set(order.orderId, order);
}

/** Retrieve an order by its order ID. Returns undefined if not found. */
export function getOrder(orderId: string): Order | undefined {
  return getStore().get(orderId);
}

/** Update specific fields on an existing order. Returns the updated order, or null if not found. */
export function updateOrder(
  orderId: string,
  patch: Partial<Order>,
): Order | null {
  const store = getStore();
  const existing = store.get(orderId);
  if (!existing) return null;

  const updated: Order = {
    ...existing,
    ...patch,
    orderId: existing.orderId, // never allow orderId to be overwritten
    updatedAt: new Date().toISOString(),
  };
  store.set(orderId, updated);
  return updated;
}

/** Update only the status of an order. Returns the updated order, or null if not found. */
export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  payherePaymentId?: string,
  paymentMethod?: string,
): Order | null {
  return updateOrder(orderId, {
    status,
    ...(payherePaymentId ? { payherePaymentId } : {}),
    ...(paymentMethod ? { paymentMethod } : {}),
  });
}

/** Generate a unique order ID in the format ORDER-YYYYMMDD-XXXX */
export function generateOrderId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORDER-${date}-${rand}`;
}
