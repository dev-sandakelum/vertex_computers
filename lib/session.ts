/**
 * iron-session v8 configuration for Next.js App Router.
 *
 * Usage in Route Handlers and Server Components:
 *   const session = await getSession();
 *   session.userId  → read
 *   session.email = '...'; await session.save();  → write
 *   session.destroy();  → clear
 */

import { getIronSession, type IronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId?:    string;
  email?:     string;
  firstName?: string;
  lastName?:  string;
  role?:      'user' | 'admin';
  isLoggedIn?: boolean;
}

const SESSION_SECRET =
  process.env.SESSION_SECRET ??
  'vertex-computers-session-secret-key-2026-change-in-prod!!';

export const sessionOptions: SessionOptions = {
  cookieName: 'vertex_session',
  password:   SESSION_SECRET,
  cookieOptions: {
    secure:   process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 7, // 7 days
  },
};

/**
 * Get the iron-session from Next.js App Router.
 * Works in Route Handlers, Server Actions, and Server Components.
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  // cookies() returns ReadonlyRequestCookies which satisfies iron-session's CookieStore
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore as never, sessionOptions);
}
