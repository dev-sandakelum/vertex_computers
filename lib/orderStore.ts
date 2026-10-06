/**
 * Server-side order store — priority chain:
 *
 *   1. MongoDB Atlas  (when MONGODB_URI is set)        ← preferred
 *   2. Upstash Redis  (when KV_REST_API_URL is set)    ← legacy / Vercel fallback
 *   3. In-memory Map  (local dev, no env vars)         ← dev fallback
 *
 * Switching to MongoDB only requires setting MONGODB_URI in .env.local.
 * Existing Redis / in-memory behaviour is preserved as a fallback.
 */

import type { Order, OrderStatus } from './payhere/types';

/* ═══════════════════════════════════════════════════════════
   1 ─ MongoDB backend
   ═══════════════════════════════════════════════════════════ */

async function mongoSave(order: Order): Promise<void> {
  const { connectDB } = await import('./mongodb');
  const { default: OrderModel } = await import('./models/Order');
  await connectDB();
  await OrderModel.findOneAndUpdate(
    { orderId: order.orderId },
    { $set: order },
    { upsert: true, new: true },
  );
}

async function mongoGet(orderId: string): Promise<Order | undefined> {
  const { connectDB } = await import('./mongodb');
  const { default: OrderModel } = await import('./models/Order');
  await connectDB();
  const doc = await OrderModel.findOne({ orderId }).lean();
  if (!doc) return undefined;
  return JSON.parse(JSON.stringify(doc)) as Order;
}

/* ═══════════════════════════════════════════════════════════
   2 ─ Upstash Redis backend (legacy)
   ═══════════════════════════════════════════════════════════ */

import type { Redis as UpstashRedis } from '@upstash/redis';

let _redis: UpstashRedis | null = null;

function getRedis(): UpstashRedis | null {
  if (_redis) return _redis;
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const { Redis } = require('@upstash/redis') as typeof import('@upstash/redis');
  _redis = new Redis({ url, token });
  return _redis;
}

const ORDER_TTL = 60 * 60 * 24 * 7; // 7 days
const orderKey  = (id: string) => `order:${id}`;

/* ═══════════════════════════════════════════════════════════
   3 ─ In-memory fallback (local dev only)
   ═══════════════════════════════════════════════════════════ */

declare global {
  // eslint-disable-next-line no-var
  var __orderStore: Map<string, Order> | undefined;
}

function getMemStore(): Map<string, Order> {
  if (!globalThis.__orderStore) globalThis.__orderStore = new Map();
  return globalThis.__orderStore;
}

/* ═══════════════════════════════════════════════════════════
   Public API — automatically picks the right backend
   ═══════════════════════════════════════════════════════════ */

/** Persist a new order (or overwrite an existing one). */
export async function saveOrder(order: Order): Promise<void> {
  if (process.env.MONGODB_URI) {
    return mongoSave(order);
  }
  const redis = getRedis();
  if (redis) {
    await redis.set(orderKey(order.orderId), order, { ex: ORDER_TTL });
    return;
  }
  getMemStore().set(order.orderId, order);
}

/** Retrieve an order by its order ID. Returns undefined if not found. */
export async function getOrder(orderId: string): Promise<Order | undefined> {
  if (process.env.MONGODB_URI) {
    return mongoGet(orderId);
  }
  const redis = getRedis();
  if (redis) {
    const result = await redis.get<Order>(orderKey(orderId));
    return result ?? undefined;
  }
  return getMemStore().get(orderId);
}

/** Update specific fields on an existing order. Returns the updated order, or null if not found. */
export async function updateOrder(
  orderId: string,
  patch: Partial<Order>,
): Promise<Order | null> {
  const existing = await getOrder(orderId);
  if (!existing) return null;

  const updated: Order = {
    ...existing,
    ...patch,
    orderId:   existing.orderId, // never overwrite orderId
    updatedAt: new Date().toISOString(),
  };

  await saveOrder(updated);
  return updated;
}

/** Update only the status (and optional payment fields) of an order. */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  payherePaymentId?: string,
  paymentMethod?: string,
): Promise<Order | null> {
  return updateOrder(orderId, {
    status,
    ...(payherePaymentId ? { payherePaymentId } : {}),
    ...(paymentMethod    ? { paymentMethod }    : {}),
  });
}

/** Generate a unique order ID: ORDER-YYYYMMDD-XXXX */
export function generateOrderId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORDER-${date}-${rand}`;
}
