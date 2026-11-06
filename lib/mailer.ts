/**
 * Transactional email — SERVER SIDE ONLY.
 *
 * Sends via SMTP (nodemailer) when these env vars are set:
 *   SMTP_HOST, SMTP_PORT (default 587), SMTP_USER, SMTP_PASS, MAIL_FROM
 *
 * When SMTP is not configured the message is printed to the server console
 * and `delivered: false` is returned, so local development keeps working
 * without a mail account (the forgot-password route surfaces the reset link
 * in dev mode in that case).
 */

import nodemailer, { type Transporter } from 'nodemailer';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface MailResult {
  delivered: boolean;
  messageId?: string;
  reason?: string;
}

let transporter: Transporter | null = null;

export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter(): Transporter | null {
  if (!isMailConfigured()) return null;
  if (transporter) return transporter;

  const port   = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

export function getMailFrom(): string {
  return process.env.MAIL_FROM || process.env.SMTP_USER || 'Vertex Computers <no-reply@vertex.local>';
}

/** Send an email. Never throws — failures are reported in the result. */
export async function sendMail(msg: MailMessage): Promise<MailResult> {
  const t = getTransporter();

  if (!t) {
    console.log(
      `\n[mailer] SMTP not configured — email NOT sent.\n` +
      `  To:      ${msg.to}\n` +
      `  Subject: ${msg.subject}\n` +
      `  Body:\n${msg.text.split('\n').map((l) => '    ' + l).join('\n')}\n`,
    );
    return { delivered: false, reason: 'SMTP not configured' };
  }

  try {
    const info = await t.sendMail({
      from:    getMailFrom(),
      to:      msg.to,
      subject: msg.subject,
      text:    msg.text,
      html:    msg.html,
    });
    return { delivered: true, messageId: info.messageId };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error('[mailer] Send failed:', reason);
    return { delivered: false, reason };
  }
}
