/**
 * POST /api/auth/reset-password
 * Body: { token: string; password: string }
 *
 * Completes the password-reset flow started by /api/auth/forgot-password.
 * The raw token from the email link is hashed and matched against the stored
 * hash; it must also be unexpired. On success the password is replaced and
 * the token is cleared so the link cannot be reused.
 *
 * GET /api/auth/reset-password?token=...
 * Lightweight validity check used by the reset page before showing the form.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import { log } from '@/lib/logger';

const INVALID_MESSAGE = 'This reset link is invalid or has expired. Please request a new one.';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function findUserByToken(token: string) {
  if (!/^[a-f0-9]{64}$/i.test(token)) return null;
  const user = await UserModel.findOne({ resetPasswordTokenHash: hashToken(token) })
    .select('_id email resetPasswordExpires')
    .lean();
  if (!user) return null;
  const expires = user.resetPasswordExpires as string | undefined;
  if (!expires || new Date(expires).getTime() < Date.now()) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')?.trim() ?? '';
  try {
    await connectDB();
    const user = await findUserByToken(token);
    return NextResponse.json({ valid: Boolean(user) });
  } catch (err) {
    console.error('[auth/reset-password:GET]', err);
    return NextResponse.json({ valid: false, error: 'Could not verify the link right now.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let token = '';
  let password = '';
  try {
    const body = await req.json();
    token    = String(body?.token ?? '').trim();
    password = String(body?.password ?? '');
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: INVALID_MESSAGE }, { status: 400 });
  }
  if (!password.trim() || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await findUserByToken(token);
    if (!user) {
      return NextResponse.json({ error: INVALID_MESSAGE }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 12);
    await UserModel.updateOne(
      { _id: user._id, resetPasswordTokenHash: hashToken(token) }, // guard against a concurrent reuse
      {
        $set:   { password: hash },
        $unset: { resetPasswordTokenHash: '', resetPasswordExpires: '' },
      },
    );

    await log({
      level: 'success',
      category: 'auth',
      message: `Password reset completed: ${user.email}`,
      meta: { userId: String(user._id) },
    });

    return NextResponse.json({ ok: true, message: 'Your password has been reset. You can now log in.' });
  } catch (err) {
    console.error('[auth/reset-password]', err);
    return NextResponse.json({ error: 'Could not reset the password. Please try again.' }, { status: 500 });
  }
}
