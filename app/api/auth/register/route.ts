/**
 * POST /api/auth/register
 * Creates a new user in MongoDB, starts an iron-session.
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import { getSession } from '@/lib/session';
import { log } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, phone, password, acceptedTerms } = await req.json();

    // — Validate —
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }
    if (!acceptedTerms) {
      return NextResponse.json({ error: 'You must accept the Terms & Privacy Policy.' }, { status: 400 });
    }

    await connectDB();

    // — Check duplicate email —
    const existing = await UserModel.findOne({ email: email.trim().toLowerCase() }).lean();
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    // — Hash password & create user —
    const hash = await bcrypt.hash(password, 12);
    const now  = new Date().toISOString();

    const user = await UserModel.create({
      firstName:     firstName.trim(),
      lastName:      lastName.trim(),
      email:         email.trim().toLowerCase(),
      phone:         phone.trim(),
      password:      hash,
      rememberMe:    true,
      acceptedTerms: true,
      createdAt:     now,
      role:          'user',
      addresses:     [],
      wishlist:      [],
    });

    // — Start session —
    const session = await getSession();
    session.userId    = String(user._id);
    session.email     = user.email;
    session.firstName = user.firstName;
    session.lastName  = user.lastName;
    session.role      = 'user';
    session.isLoggedIn = true;
    await session.save();

    await log({ level: 'success', category: 'auth', message: `User registered: ${user.email}`, meta: { userId: String(user._id) } });

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
    console.error('[auth/register]', err);
    await log({ level: 'error', category: 'auth', message: 'Registration failed', meta: { error: String(err) } });
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
