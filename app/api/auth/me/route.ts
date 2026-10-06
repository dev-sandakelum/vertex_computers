/**
 * GET /api/auth/me
 * Returns current session user — used to hydrate client on mount.
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import UserModel from '@/lib/models/User';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ user: null });
  }

  try {
    await connectDB();
    const user = await UserModel.findById(session.userId).lean();
    if (!user) {
      session.destroy();
      return NextResponse.json({ user: null });
    }

    // Strip sensitive fields
    const { password: _pw, __v: _v, _id, ...rest } = user as Record<string, unknown>;
    void _pw; void _v;

    return NextResponse.json({
      user: {
        userId:    String(_id),
        ...rest,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
