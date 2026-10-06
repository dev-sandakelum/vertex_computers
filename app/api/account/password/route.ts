/**
 * PUT /api/account/password
 * Changes the logged-in user's password after verifying the current one.
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import { log } from '@/lib/logger';

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword?.trim() || !newPassword?.trim()) {
    return NextResponse.json({ error: 'Both current and new passwords are required.' }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
  }

  await connectDB();
  const user = await UserModel.findById(session.userId);
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

  const match = await bcrypt.compare(currentPassword, user.password as string);
  if (!match) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await UserModel.findByIdAndUpdate(session.userId, { $set: { password: hash } });

  await log({ level: 'info', category: 'account', message: `Password changed: ${session.email}` });

  return NextResponse.json({ ok: true });
}
