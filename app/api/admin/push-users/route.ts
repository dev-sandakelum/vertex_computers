/**
 * GET  /api/admin/push-users  — count check
 * POST /api/admin/push-users  — seed one user by index
 *
 * Seeds the demo user (and any future users) into MongoDB.
 * Body: { index: number, mode: "upsert" | "reset" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import bcrypt from 'bcryptjs';

const ADMIN_SECRET = process.env.ADMIN_PUSH_SECRET;

function auth(req: NextRequest): boolean {
  return !!ADMIN_SECRET && req.headers.get('x-admin-secret') === ADMIN_SECRET;
}

// Seed users — extend this array to add more
const SEED_USERS = [
  {
    firstName:     'John',
    lastName:      'Doe',
    email:         'name@example.com',
    phone:         '+1 (555) 000-0000',
    password:      'Demo1234!',   // hash this in production
    rememberMe:    true,
    acceptedTerms: true,
    createdAt:     '2026-01-01T00:00:00.000Z',
    role:          'user',
  },
  {
    firstName:     'Admin',
    lastName:      'User',
    email:         'admin@vertex.com',
    phone:         '+1 (555) 000-0001',
    password:      'Admin1234!',  // hash this in production
    rememberMe:    false,
    acceptedTerms: true,
    createdAt:     '2026-01-01T00:00:00.000Z',
    role:          'admin',
  },
];

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    await connectDB();
    const dbCount    = await UserModel.countDocuments();
    const localCount = SEED_USERS.length;
    return NextResponse.json({ dbCount, localCount });
  } catch (err) {
    return NextResponse.json(
      { error: 'DB check failed.', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  let index = 0;
  let mode: 'upsert' | 'reset' = 'upsert';
  try {
    const body = await req.json();
    index = typeof body?.index === 'number' ? body.index : 0;
    if (body?.mode === 'reset') mode = 'reset';
  } catch { /* default */ }

  const total = SEED_USERS.length;
  if (index < 0 || index >= total) {
    return NextResponse.json({ error: `Index ${index} out of range.` }, { status: 400 });
  }

  try {
    await connectDB();

    if (mode === 'reset' && index === 0) {
      await UserModel.deleteMany({});
    }

    const doc = SEED_USERS[index];
    const hashed = await bcrypt.hash(doc.password, 12);
    await UserModel.findOneAndUpdate(
      { email: doc.email },
      { $set: { ...doc, password: hashed } },
      { upsert: true, new: true },
    );

    return NextResponse.json({
      ok:     true,
      index,
      total,
      email:  doc.email,
      name:   `${doc.firstName} ${doc.lastName}`,
      role:   doc.role,
      done:   index === total - 1,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Push failed.', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
