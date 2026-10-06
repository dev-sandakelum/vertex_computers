/**
 * Next.js Edge Middleware
 *
 * Guards:
 *   /checkout/*  — must be logged in (valid iron-session cookie)
 *   /account     — redirects logged-in users away from /account/login and /account/register
 *
 * iron-session v8: we call unsealData() to decode the cookie in the Edge runtime
 * (no Node.js crypto needed — iron-session uses Web Crypto API internally).
 */

import { NextRequest, NextResponse } from 'next/server';
import { unsealData } from 'iron-session';
import type { SessionData } from '@/lib/session';

const SESSION_COOKIE = 'vertex_session';
const SESSION_SECRET =
  process.env.SESSION_SECRET ??
  'vertex-computers-session-secret-key-2026-change-in-prod!!';

async function getSessionFromRequest(req: NextRequest): Promise<SessionData | null> {
  const cookieValue = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookieValue) return null;
  try {
    const data = await unsealData<SessionData>(cookieValue, { password: SESSION_SECRET });
    return data ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* ── Protect /checkout/* ─────────────────────────────────────── */
  if (pathname.startsWith('/checkout')) {
    const session = await getSessionFromRequest(req);

    if (!session?.isLoggedIn) {
      const loginUrl = new URL('/account/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  /* ── Redirect already-logged-in users away from login/register ─ */
  if (pathname === '/account/login' || pathname === '/account/register') {
    const session = await getSessionFromRequest(req);
    if (session?.isLoggedIn) {
      // Only redirect if no 'next' param — let the form handle that case
      const next = req.nextUrl.searchParams.get('next');
      const destination = next && next.startsWith('/') ? next : '/account';
      return NextResponse.redirect(new URL(destination, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/checkout/:path*',
    '/account/login',
    '/account/register',
  ],
};
