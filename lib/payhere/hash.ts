/**
 * PayHere hash / signature utilities — SERVER SIDE ONLY.
 *
 * Checkout hash formula (from official PayHere docs):
 *   HASH = strtoupper( MD5( merchant_id + order_id + amount + currency + strtoupper(MD5(merchant_secret)) ) )
 *
 * Notification verification formula:
 *   LOCAL_MD5SIG = strtoupper( MD5( merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(MD5(merchant_secret)) ) )
 */

import crypto from 'crypto';

/** Compute MD5 and return an uppercase hex string */
function md5Upper(input: string): string {
  return crypto.createHash('md5').update(input).digest('hex').toUpperCase();
}

/**
 * Generate the checkout hash that must be embedded in the payment object.
 * Call this only from a server-side API route — never from a client component.
 */
export function generateCheckoutHash(
  merchantId: string,
  orderId: string,
  amount: string,   // must be formatted as "1000.00" (2 decimal places)
  currency: string,
  merchantSecret: string,
): string {
  const secretHash = md5Upper(merchantSecret);
  return md5Upper(`${merchantId}${orderId}${amount}${currency}${secretHash}`);
}

/**
 * Verify the md5sig included in a PayHere IPN notification.
 * Returns true only when the signature is valid.
 */
export function verifyNotificationHash(params: {
  merchantId: string;
  orderId: string;
  payhereAmount: string;
  payhereCurrency: string;
  statusCode: string;
  md5sig: string;
  merchantSecret: string;
}): boolean {
  const secretHash = md5Upper(params.merchantSecret);
  const expected = md5Upper(
    `${params.merchantId}${params.orderId}${params.payhereAmount}${params.payhereCurrency}${params.statusCode}${secretHash}`,
  );
  // Constant-time comparison to resist timing attacks
  return safeEqual(expected, params.md5sig.toUpperCase());
}

/** Timing-safe string equality using a constant-time buffer comparison */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Format a number as PayHere expects: fixed 2 decimal places, no thousand separator.
 * e.g. 1234.5 → "1234.50", 1000 → "1000.00"
 */
export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}
