/**
 * POST /api/admin/login
 * Authenticates an admin user and creates a session.
 * Body: { email: string; password: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import { getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  let body: { email: string; password: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await UserModel.findOne({ email: email.toLowerCase().trim() }).lean();

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const doc = user as Record<string, unknown>;
    if (doc.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const match = await bcrypt.compare(password, doc.password as string);
    if (!match) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const session = await getSession();
    session.userId    = String((doc as { _id: unknown })._id);
    session.email     = doc.email as string;
    session.firstName = doc.firstName as string;
    session.lastName  = doc.lastName as string;
    session.role      = 'admin';
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      ok:        true,
      firstName: doc.firstName,
      lastName:  doc.lastName,
      email:     doc.email,
      role:      'admin',
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Server error.', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
