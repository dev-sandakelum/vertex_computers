/**
 * POST /api/auth/forgot-password
 * Body: { email: string }
 *
 * Starts the password-reset flow. Generates a one-time token, stores only its
 * SHA-256 hash (with a 1-hour expiry) on the user, and emails a reset link.
 *
 * The response is identical whether or not the email exists, so this endpoint
 * cannot be used to enumerate accounts. In development, when no SMTP server
 * is configured, the reset link is returned as `devResetUrl` so the flow can
 * be tested locally.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import { sendMail } from '@/lib/mailer';
import { getAppUrl } from '@/lib/payhere/config';
import { log } from '@/lib/logger';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const GENERIC_MESSAGE =
  'If an account exists for that email, a password reset link has been sent. Please check your inbox.';

// Light per-email throttle (per server instance) to deter mail spam.
const lastRequest = new Map<string, number>();
const THROTTLE_MS = 60 * 1000;

export async function POST(req: NextRequest) {
  let email = '';
  try {
    const body = await req.json();
    email = String(body?.email ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const last = lastRequest.get(email) ?? 0;
  if (Date.now() - last < THROTTLE_MS) {
    // Still generic — don't reveal whether the account exists.
    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  }
  lastRequest.set(email, Date.now());

  try {
    await connectDB();
    const user = await UserModel.findOne({ email }).select('_id email firstName').lean();

    if (!user) {
      await log({ level: 'info', category: 'auth', message: `Password reset requested for unknown email: ${email}` });
      return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
    }

    const token     = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expires   = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

    await UserModel.updateOne(
      { _id: user._id },
      { $set: { resetPasswordTokenHash: tokenHash, resetPasswordExpires: expires } },
    );

    const resetUrl = `${getAppUrl(req)}/account/reset-password?token=${token}`;
    const name     = (user.firstName as string | undefined) || 'there';

    const mail = await sendMail({
      to:      user.email as string,
      subject: 'Reset your Vertex Computers password',
      text:
        `Hi ${name},\n\n` +
        `We received a request to reset the password for your Vertex Computers account.\n\n` +
        `Reset your password here (link valid for 1 hour):\n${resetUrl}\n\n` +
        `If you didn't request this, you can safely ignore this email — your password won't change.\n\n` +
        `— Vertex Computers`,
      html:
        `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#111">` +
        `<h2 style="margin:0 0 12px">Reset your password</h2>` +
        `<p>Hi ${escapeHtml(name)},</p>` +
        `<p>We received a request to reset the password for your Vertex Computers account.</p>` +
        `<p style="margin:24px 0"><a href="${resetUrl}" style="background:#1d4ed8;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;display:inline-block;font-weight:600">Reset password</a></p>` +
        `<p style="font-size:13px;color:#555">This link is valid for 1 hour. If the button doesn't work, copy this URL into your browser:<br>` +
        `<a href="${resetUrl}">${resetUrl}</a></p>` +
        `<p style="font-size:13px;color:#555">If you didn't request this, you can safely ignore this email — your password won't change.</p>` +
        `<p>— Vertex Computers</p></div>`,
    });

    await log({
      level: 'info',
      category: 'auth',
      message: `Password reset link ${mail.delivered ? 'emailed' : 'generated (email not delivered)'}: ${email}`,
      meta: { userId: String(user._id), delivered: mail.delivered, reason: mail.reason },
    });

    const isDev = process.env.NODE_ENV !== 'production';
    return NextResponse.json({
      ok: true,
      message: GENERIC_MESSAGE,
      // Dev-only convenience when no mail server is configured: expose the
      // link so the flow can be exercised locally. Never returned in production.
      ...(isDev && !mail.delivered ? { devResetUrl: resetUrl, devNote: mail.reason } : {}),
    });
  } catch (err) {
    console.error('[auth/forgot-password]', err);
    return NextResponse.json({ error: 'Could not process the request. Please try again.' }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}
