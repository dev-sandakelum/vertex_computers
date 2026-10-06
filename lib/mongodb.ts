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
  if (cache.conn) return cache.conn;

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
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
