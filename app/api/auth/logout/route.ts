/**
 * POST /api/auth/logout
 * Destroys the iron-session cookie.
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { log } from '@/lib/logger';

export async function POST() {
  const session = await getSession();
  const email = session.email;
  session.destroy();
  if (email) await log({ level: 'info', category: 'auth', message: `User logged out: ${email}` });
  return NextResponse.json({ ok: true });
}
