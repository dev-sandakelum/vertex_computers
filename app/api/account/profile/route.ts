/**
 * GET  /api/account/profile  — fetch current user's full profile
 * PUT  /api/account/profile  — update name/phone
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import { log } from '@/lib/logger';

function requireSession(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const session = await getSession();
  const guard = requireSession(session);
  if (guard) return guard;

  await connectDB();
  const user = await UserModel.findById(session.userId).lean();
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

  const { password: _pw, __v: _v, _id, ...rest } = user as Record<string, unknown>;
  void _pw; void _v;
  return NextResponse.json({ user: { userId: String(_id), ...rest } });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  const guard = requireSession(session);
  if (guard) return guard;

  const { firstName, lastName, phone } = await req.json();

  if (!firstName?.trim() || !lastName?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: 'First name, last name, and phone are required.' }, { status: 400 });
  }

  await connectDB();
  const user = await UserModel.findByIdAndUpdate(
    session.userId,
    { $set: { firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() } },
    { new: true, lean: true },
  ) as Record<string, unknown> | null;

  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

  // Update session with new name
  session.firstName = firstName.trim();
  session.lastName  = lastName.trim();
  await session.save();

  await log({
    level: 'info',
    category: 'account',
    message: `Profile updated: ${session.email}`,
    meta: { userId: session.userId },
  });

  const { password: _pw, __v: _v, _id, ...rest } = user;
  void _pw; void _v;
  return NextResponse.json({ ok: true, user: { userId: String(_id), ...rest } });
}
