/**
 * POST /api/auth/login
 * Verifies credentials against MongoDB, issues iron-session cookie.
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import { getSession } from '@/lib/session';
import { log } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    await connectDB();

    const user = await UserModel.findOne({ email: email.trim().toLowerCase() }).lean();

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password as string);
    if (!passwordMatch) {
      await log({ level: 'warn', category: 'auth', message: `Failed login attempt: ${email}` });
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // — Start session —
    const session = await getSession();
    session.userId     = String(user._id);
    session.email      = user.email as string;
    session.firstName  = user.firstName as string;
    session.lastName   = user.lastName as string;
    session.role       = (user.role as 'user' | 'admin') ?? 'user';
    session.isLoggedIn = true;
    await session.save();

    await log({ level: 'info', category: 'auth', message: `User logged in: ${user.email}` });

    return NextResponse.json({
      ok: true,
      user: {
        userId:    String(user._id),
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        phone:     user.phone,
        role:      user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[auth/login]', err);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
