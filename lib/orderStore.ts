/**
 * Server-side order store — Upstash Redis (Vercel) with in-memory fallback (local dev).
 *
 * On Vercel: orders are persisted in Upstash Redis → survive across serverless
 * function invocations, so /hash, /notify and /status all see the same data.
 *
 * Local dev (no Redis env vars): falls back to the in-process globalThis Map
 * exactly as before — works fine since all requests hit the same Node.js process.
 *
 * SETUP (Vercel):
 *   1. Go to vercel.com → your project → Storage → Connect Store → Upstash Redis
 *   2. Vercel auto-populates KV_REST_API_URL and KV_REST_API_TOKEN in your project env.
 *   3. Pull them locally:  `vercel env pull .env.local`  (or add manually)
 *
 * Required env vars (Upstash):
 *   KV_REST_API_URL    — e.g. https://xxx.upstash.io
 *   KV_REST_API_TOKEN  — your Upstash REST token
 */

import type { Order, OrderStatus } from './payhere/types';

/* ── Redis client (lazy-initialised) ─────────────────────── */

import type { Redis as UpstashRedis } from '@upstash/redis';

let _redis: UpstashRedis | null = null;

function getRedis(): UpstashRedis | null {
  if (_redis) return _redis;

  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null; // fall back to in-memory

  const { Redis } = require('@upstash/redis') as typeof import('@upstash/redis');
  _redis = new Redis({ url, token });
  return _redis;
}

/* ── In-memory fallback (local dev only) ─────────────────── */

declare global {
  // eslint-disable-next-line no-var
  var __orderStore: Map<string, Order> | undefined;
}

function getMemStore(): Map<string, Order> {
  if (!globalThis.__orderStore) globalThis.__orderStore = new Map();
  return globalThis.__orderStore;
}

/* ── Order TTL: 7 days in seconds ────────────────────────── */
const ORDER_TTL = 60 * 60 * 24 * 7;

function orderKey(orderId: string) {
  return `order:${orderId}`;
}

/* ── Public API ───────────────────────────────────────────── */

/** Persist a new order (or overwrite an existing one). */
export async function saveOrder(order: Order): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(orderKey(order.orderId), order, { ex: ORDER_TTL });
  } else {
    getMemStore().set(order.orderId, order);
  }
}

/** Retrieve an order by its order ID. Returns undefined if not found. */
export async function getOrder(orderId: string): Promise<Order | undefined> {
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
    orderId: existing.orderId, // never overwrite orderId
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
