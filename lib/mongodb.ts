/**
 * MongoDB connection singleton for Next.js.
 *
 * In development, `next dev` hot-reloads modules on every file change.
 * Without this singleton pattern, each reload opens a new connection and
 * you'll exhaust Atlas's free-tier connection pool quickly.
 *
 * In production (Vercel serverless), each function invocation is a cold
 * start in a new process — globalThis caching is per-worker, but mongoose
 * automatically reuses the connection within a single invocation context.
 *
 * Required env var:
 *   MONGODB_URI  — full Atlas connection string with db name included
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Don't throw at module-load time — callers guard with `if (!MONGODB_URI)` already.
// Throwing here breaks the build when the env var isn't available at build time.

/* ── Cached connection on globalThis (survives hot-reloads) ── */

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = globalThis.__mongooseCache ?? { conn: null, promise: null };
globalThis.__mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      'Please set the MONGODB_URI environment variable in .env.local.\n' +
      'Example: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vertex_computers?retryWrites=true&w=majority',
    );
  }
  // Reuse the live connection. If the socket dropped (laptop sleep, network
  // change, Atlas failover) fall through and reconnect instead of returning a
  // dead handle. readyState: 0 = disconnected, 1 = connected, 2 = connecting.
  if (cache.conn && mongoose.connection.readyState === 1) return cache.conn;
  if (cache.conn && mongoose.connection.readyState === 0) {
    cache.conn = null;
    cache.promise = null;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 30000,
      })
      .then((m) => {
        console.log('[MongoDB] Connected to Atlas');
        return m;
      })
      .catch((err) => {
        // IMPORTANT: drop the rejected promise so the next request retries.
        // Without this, one transient failure (e.g. IP not yet whitelisted,
        // brief network outage) poisons every later request until restart —
        // which showed up as admin login permanently returning "Server error".
        cache.promise = null;
        cache.conn = null;
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
