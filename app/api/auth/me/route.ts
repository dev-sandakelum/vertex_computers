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
  } catch (err) {
    // DB unreachable (transient Atlas/network issue). The iron-session cookie
    // is cryptographically sealed, so its contents are trustworthy — answer
    // from it instead of reporting "logged out", which would bounce an admin
    // straight back to /admin/login in a loop.
    console.warn('[auth/me] DB lookup failed, answering from session:', err instanceof Error ? err.message : err);
    return NextResponse.json({
      user: {
        userId:    session.userId,
        email:     session.email,
        firstName: session.firstName,
        lastName:  session.lastName,
        role:      session.role ?? 'user',
      },
      degraded: true,
    });
  }
}
