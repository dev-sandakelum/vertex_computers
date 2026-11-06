/**
 * PayHere configuration — reads from environment variables.
 * All secrets are server-side only; nothing with NEXT_PUBLIC_ prefix
 * except the public app URL.
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

/**
 * Base URL of the PayHere Merchant API (OAuth + Payment Retrieval).
 * Sandbox and live use different hosts.
 */
export function getMerchantApiBase(): string {
  // Optional override (e.g. point at a mock server in tests).
  const override = process.env.PAYHERE_MERCHANT_API_BASE?.trim();
  if (override) return override.replace(/\/+$/, '');
  return isSandbox()
    ? 'https://sandbox.payhere.lk/merchant/v1'
    : 'https://www.payhere.lk/merchant/v1';
}

/**
 * Business-app credentials for the PayHere Merchant API (Payment Retrieval).
 * Optional — when absent, the server relies solely on the IPN (notify_url).
 * Create them in the PayHere dashboard: Settings → Business Apps → Create App,
 * tick "Payment Retrieval API", and allow your domain/IP.
 */
export function getRetrievalCredentials(): { appId: string; appSecret: string } | null {
  const appId     = process.env.PAYHERE_APP_ID?.trim();
  const appSecret = process.env.PAYHERE_APP_SECRET?.trim();
  if (!appId || !appSecret) return null;
  return { appId, appSecret };
}

/**
 * Normalise NEXT_PUBLIC_APP_URL to a bare origin (scheme + host + port).
 * Tolerates stray quotes, whitespace, trailing slashes or paths that end up
 * in .env files (e.g. `"https://site.com/"'` → `https://site.com`).
 * Returns null when the value is unset, a template placeholder, or unparsable.
 */
function normaliseAppUrl(value: string | undefined): string | null {
  if (!value) return null;
  const v = value.trim().replace(/^['"]+|['"]+$/g, '').trim();
  if (!v) return null;
  if (/YOUR_|example\.com|<.*>/i.test(v)) return null;
  try {
    const u = new URL(v);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.origin;
  } catch {
    return null;
  }
}

/**
 * Returns the public base URL of this app, with no trailing slash.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_APP_URL (when set to a real URL — placeholders are ignored)
 *   2. The origin of the incoming request (Host / X-Forwarded-* headers) —
 *      this is what makes the PayHere return/notify URLs correct on Vercel,
 *      ngrok, or any other host without extra configuration.
 *   3. http://localhost:3000
 *
 * NOTE: PayHere's servers cannot reach localhost, so in local dev without a
 * tunnel the IPN never arrives. The status endpoint compensates by querying
 * the PayHere Retrieval API when PAYHERE_APP_ID / PAYHERE_APP_SECRET are set.
 */
export function getAppUrl(req?: Request): string {
  const envUrl = normaliseAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  if (envUrl) return envUrl;

  if (req) {
    const h = req.headers;
    const host  = h.get('x-forwarded-host') ?? h.get('host');
    if (host) {
      const proto =
        h.get('x-forwarded-proto')?.split(',')[0].trim() ||
        (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host) ? 'http' : 'https');
      return `${proto}://${host}`;
    }
  }

  return 'http://localhost:3000';
}
