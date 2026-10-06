/**
 * PayHere configuration — reads from environment variables.
 * All secrets are server-side only; nothing with NEXT_PUBLIC_ prefix.
 */

/** The PayHere JS SDK URL (Sandbox vs Production) */
export const PAYHERE_JS_URL = 'https://www.payhere.lk/lib/payhere.js';

/** Sandbox checkout endpoint — used by payhere.js under the hood */
export const PAYHERE_SANDBOX_CHECKOUT_URL = 'https://sandbox.payhere.lk/pay/checkout';

/** Returns the merchant ID (server-side, from env) */
export function getMerchantId(): string {
  const id = process.env.PAYHERE_MERCHANT_ID;
  if (!id) throw new Error('PAYHERE_MERCHANT_ID is not set in environment variables.');
  return id;
}

/** Returns the merchant secret (server-side ONLY — never expose to client) */
export function getMerchantSecret(): string {
  const secret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!secret) throw new Error('PAYHERE_MERCHANT_SECRET is not set in environment variables.');
  return secret;
}

/** Returns true if running in sandbox mode */
export function isSandbox(): boolean {
  return process.env.PAYHERE_SANDBOX !== 'false';
}

/** Returns the base app URL (e.g. https://abc.ngrok-free.app or http://localhost:3000) */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}
